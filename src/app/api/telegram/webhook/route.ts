import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTelegramConfig, sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const config = await getTelegramConfig();
  if (!config.token) return NextResponse.json({ ok: false }, { status: 503 });

  const update = (await req.json().catch(() => null)) as {
    message?: { chat?: { id?: number }; text?: string; from?: { first_name?: string } };
  } | null;
  const message = update?.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim() || '';
  const match = text.match(/^\/start(?:\s+([a-f0-9]{64}))?$/i);

  if (!chatId || !match?.[1]) return NextResponse.json({ ok: true });

  const link = await prisma.telegramLinkToken.findUnique({
    where: { token: match[1] },
    include: { user: { select: { id: true, name: true } } },
  });

  if (!link || link.usedAt || link.expiresAt < new Date()) {
    await sendTelegramMessage({ target: String(chatId), text: 'Link aktivasi Telegram tidak valid atau sudah kedaluwarsa. Minta Admin membuat link baru.' });
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: link.userId }, data: { telegramChatId: String(chatId) } }),
    prisma.telegramLinkToken.update({ where: { id: link.id }, data: { usedAt: new Date() } }),
  ]);

  await sendTelegramMessage({
    target: String(chatId),
    text: `Halo ${link.user.name}, notifikasi Telegram Anda berhasil diaktifkan. Anda akan menerima update booking, status tiket, dan pembayaran dari AD Computer.`,
  });

  return NextResponse.json({ ok: true });
}
