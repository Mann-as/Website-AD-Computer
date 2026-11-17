import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getTelegramConfig } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const admin = await getCurrentUser();
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Hanya Admin yang dapat membuat link Telegram.' }, { status: 403 });
    }

    const body = await req.json().catch(() => null) as { customerId?: unknown } | null;
    const customerId = body?.customerId;
    if (typeof customerId !== 'string' || !customerId) {
      return NextResponse.json({ error: 'Customer tidak valid.' }, { status: 400 });
    }

    const customer = await prisma.user.findUnique({
      where: { id: customerId },
      select: { id: true, name: true, role: true },
    });
    if (!customer || customer.role !== 'CUSTOMER') {
      return NextResponse.json({ error: 'Customer tidak ditemukan.' }, { status: 404 });
    }

    const config = await getTelegramConfig();
    if (!config.enabled) {
      return NextResponse.json({ error: 'Notifikasi Telegram sedang dinonaktifkan.' }, { status: 400 });
    }
    if (!config.token) {
      return NextResponse.json({ error: 'Bot Telegram belum dikonfigurasi.' }, { status: 400 });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.$transaction([
      prisma.telegramLinkToken.deleteMany({ where: { userId: customer.id, usedAt: null } }),
      prisma.telegramLinkToken.create({ data: { token, userId: customer.id, expiresAt } }),
    ]);

    const usernameResponse = await fetch(`${config.apiBase}/bot${config.token}/getMe`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
    const usernameData = await usernameResponse.json().catch(() => null) as {
      ok?: boolean;
      description?: string;
      result?: { username?: string };
    } | null;
    const username = usernameData?.result?.username;
    if (!usernameResponse.ok || !username) {
      return NextResponse.json({ error: usernameData?.description || 'Bot Telegram tidak valid atau tidak dapat dihubungi.' }, { status: 502 });
    }

    return NextResponse.json({
      message: `Link aktivasi Telegram untuk ${customer.name} berhasil dibuat.`,
      url: `https://t.me/${username}?start=${token}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Create Telegram link error:', error);
    return NextResponse.json({ error: 'Gagal membuat link aktivasi Telegram.' }, { status: 500 });
  }
}
