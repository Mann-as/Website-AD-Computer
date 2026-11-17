import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { notifyAdminPaymentPending, notifyCustomerPaymentSubmitted } from '@/lib/notifications';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const paySchema = z.object({
  serviceRequestId: z.string().min(1),
  paymentMethod: z
    .enum(['QRIS', 'TRANSFER_BANK', 'EWALLET', 'CASH'])
    .default('QRIS'),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });

    const ip = getClientIp(req);
    const limit = rateLimit(`payment-confirm:${user.id}:${ip}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan pembayaran. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = paySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceRequestId, paymentMethod } = parsed.data;

    const ticket = await prisma.serviceRequest.findUnique({
      where: { id: serviceRequestId },
      include: {
        payments: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            telegramChatId: true,
          },
        },
        service: true,
      },
    });
    if (!ticket) return NextResponse.json({ error: 'Tiket tidak ditemukan' }, { status: 404 });
    if (ticket.customerId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    const alreadyPaid =
      ticket.status === 'PAID' || ticket.payments.some((p) => p.status === 'PAID');
    if (alreadyPaid) return NextResponse.json({ error: 'Tiket sudah lunas' }, { status: 400 });

    if (ticket.status !== 'COMPLETED') {
      return NextResponse.json(
        {
          error: `Pembayaran hanya bisa dilakukan saat status Selesai — Menunggu Pembayaran. Status saat ini: ${ticket.status}`,
        },
        { status: 400 }
      );
    }

    const pendingPayment = ticket.payments.find((p) => p.status === 'PENDING');
    if (pendingPayment) {
      return NextResponse.json(
        { error: 'Konfirmasi pembayaran sudah dikirim dan sedang menunggu verifikasi Admin.' },
        { status: 400 }
      );
    }

    const amount = ticket.finalCost > 0 ? ticket.finalCost : ticket.estimatedCost;
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Nominal pembayaran belum ditetapkan Admin' }, { status: 400 });
    }

    const existingUnpaid = ticket.payments.find((p) => p.status === 'UNPAID');

    const payment = existingUnpaid
      ? await prisma.payment.update({
          where: { id: existingUnpaid.id },
          data: {
            amount,
            status: 'PENDING',
            paymentMethod,
            paidAt: null,
          },
        })
      : await prisma.payment.create({
          data: {
            serviceRequestId,
            amount,
            status: 'PENDING',
            paymentMethod,
          },
        });

    await notifyAdminPaymentPending(payment, ticket, ticket.customer);
    await notifyCustomerPaymentSubmitted(payment, ticket, ticket.customer);

    return NextResponse.json({
      message:
        'Konfirmasi pembayaran diterima. Pembayaran akan diverifikasi oleh Admin sebelum status tiket menjadi Lunas.',
      payment,
    });
  } catch (e) {
    console.error('Payment API error:', e);
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}
