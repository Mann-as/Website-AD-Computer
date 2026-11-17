export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

function parseTelegramChatId(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^-?\d{5,20}$/.test(trimmed) ? trimmed : undefined;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat mengubah data pelanggan.' },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    if (!body || typeof body !== 'object' || !('telegramChatId' in body)) {
      return NextResponse.json(
        { error: 'Field telegramChatId wajib diisi' },
        { status: 400 }
      );
    }

    const telegramChatId = parseTelegramChatId(
      (body as { telegramChatId: unknown }).telegramChatId
    );

    if (telegramChatId === undefined) {
      return NextResponse.json(
        { error: 'Telegram Chat ID harus berupa angka (contoh: 123456789).' },
        { status: 400 }
      );
    }

    const customer = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Pelanggan tidak ditemukan' }, { status: 404 });
    }

    if (customer.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Telegram Chat ID hanya dapat diatur untuk akun customer.' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: customer.id },
      data: { telegramChatId },
    });

    let telegram: { ok: boolean; error?: string } | null = null;

    if (telegramChatId) {
      const result = await sendTelegramMessage({
        target: telegramChatId,
        text: [
          'NOTIFIKASI TELEGRAM AKTIF',
          '',
          `Halo ${customer.name},`,
          '',
          'Chat ID Anda berhasil dihubungkan. Anda akan menerima notifikasi booking, perubahan status tiket, dan pembayaran melalui Telegram.',
        ].join('\n'),
      });
      telegram = { ok: result.ok, ...(result.error ? { error: result.error } : {}) };
    }

    return NextResponse.json({
      message: telegramChatId
        ? 'Telegram Chat ID berhasil disimpan'
        : 'Telegram Chat ID berhasil dihapus',
      customer: { id: customer.id, name: customer.name, telegramChatId },
      telegram,
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengubah data pelanggan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat menghapus pelanggan.' },
        { status: 403 }
      );
    }

    const customerId = params.id;

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Pelanggan tidak ditemukan' },
        { status: 404 }
      );
    }

    if (customer.role !== 'CUSTOMER') {
      return NextResponse.json(
        { error: 'Hanya pengguna dengan role CUSTOMER yang dapat dihapus melalui endpoint ini' },
        { status: 400 }
      );
    }

    // Keep financial/audit history intact: customers with tickets cannot be hard-deleted.
    const requestCount = await prisma.serviceRequest.count({ where: { customerId } });
    if (requestCount > 0) {
      return NextResponse.json(
        {
          error: `Pelanggan tidak dapat dihapus karena memiliki ${requestCount} riwayat service. Data transaksi dan riwayat perbaikan harus dipertahankan untuk arsip.`,
        },
        { status: 409 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete status history entries where this user was the actor (changedBy)
      await tx.serviceRequestStatusHistory.deleteMany({
        where: { changedBy: customerId },
      });

      // Delete AI conversations
      await tx.aIConversation.deleteMany({
        where: { userId: customerId },
      });

      // Delete customer profile if exists
      await tx.customerProfile.deleteMany({
        where: { userId: customerId },
      });

      // Finally delete the user
      await tx.user.delete({
        where: { id: customerId },
      });
    });

    return NextResponse.json({ message: 'Pelanggan berhasil dihapus' });
  } catch (error) {
    console.error('Delete customer error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menghapus pelanggan' },
      { status: 500 }
    );
  }
}
