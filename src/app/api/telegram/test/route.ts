import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getTelegramConfig, sendTelegramMessage } from '@/lib/telegram';

async function configureWebhook(): Promise<string | null> {
  const config = await getTelegramConfig();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, '');
  if (!appUrl || !config.token || appUrl.includes('localhost')) return null;

  const response = await fetch(`${config.apiBase}/bot${config.token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: `${appUrl}/api/telegram/webhook` }),
    cache: 'no-store',
  });
  const data = (await response.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  return data?.ok ? null : data?.description || 'Gagal mengatur webhook Telegram';
}

export const dynamic = 'force-dynamic';

export async function POST() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya Admin yang dapat mengirim pesan uji.' },
      { status: 403 }
    );
  }

  const webhookError = await configureWebhook();
  const result = await sendTelegramMessage({
    text: [
      'TES NOTIFIKASI TELEGRAM',
      '',
      'Notifikasi otomatis AD Computer berhasil terhubung.',
      'Pesan ini dikirim dari endpoint /api/telegram/test.',
    ].join('\n'),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ...result, ...(webhookError ? { webhookError } : {}) },
      { status: result.skipped ? 503 : 502 }
    );
  }

  return NextResponse.json({ ...result, ...(webhookError ? { webhookError } : {}) });
}
