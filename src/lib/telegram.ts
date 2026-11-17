import { prisma } from '@/lib/prisma';

type TelegramConfig = {
  enabled: boolean;
  activeBot: '1' | '2';
  token: string;
  chatId: string;
  apiBase: string;
};

export type TelegramSendResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

export async function getTelegramConfig(): Promise<TelegramConfig> {
  const rows = await prisma.setting.findMany({
    where: {
      key: {
        in: [
          'TELEGRAM_ENABLED',
          'TELEGRAM_ACTIVE_BOT',
          'TELEGRAM_BOT_TOKEN',
          'TELEGRAM_BOT_TOKEN_1',
          'TELEGRAM_BOT_TOKEN_2',
          'TELEGRAM_CHAT_ID',
        ],
      },
    },
    select: { key: true, value: true },
  });
  const stored = new Map(rows.map((row) => [row.key, row.value?.trim() || '']));
  const activeBot = stored.get('TELEGRAM_ACTIVE_BOT') === '2' ? '2' : '1';
  const bot1 = stored.get('TELEGRAM_BOT_TOKEN_1') || stored.get('TELEGRAM_BOT_TOKEN') || process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const bot2 = stored.get('TELEGRAM_BOT_TOKEN_2') || '';
  const token = activeBot === '2' ? bot2 : bot1;
  const chatId = stored.get('TELEGRAM_CHAT_ID') || process.env.TELEGRAM_CHAT_ID?.trim() || '';
  const enabledValue = stored.get('TELEGRAM_ENABLED');

  return {
    enabled: enabledValue === undefined || enabledValue === '' ? true : enabledValue === 'true',
    activeBot,
    token,
    chatId,
    apiBase: (process.env.TELEGRAM_API_BASE?.trim() || 'https://api.telegram.org').replace(/\/+$/, ''),
  };
}

export async function sendTelegramMessage({
  text,
  target,
}: {
  text: string;
  target?: string;
}): Promise<TelegramSendResult> {
  const config = await getTelegramConfig();
  const chatId = target?.trim() || config.chatId;

  if (!config.enabled) {
    return { ok: false, skipped: true, error: 'Notifikasi Telegram dinonaktifkan' };
  }

  if (!config.token || !chatId) {
    console.warn('[Telegram] Notification skipped: konfigurasi Telegram belum lengkap.');
    return {
      ok: false,
      skipped: true,
      error: 'Konfigurasi Telegram belum lengkap',
    };
  }

  const message = text.trim();
  if (!message) {
    return { ok: false, error: 'Pesan Telegram kosong' };
  }

  const safeMessage = message.length > 4096 ? `${message.slice(0, 4093)}...` : message;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${config.apiBase}/bot${config.token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: safeMessage,
        disable_web_page_preview: true,
      }),
      cache: 'no-store',
      signal: controller.signal,
    });

    const data = (await response.json().catch(() => null)) as
      | { ok?: boolean; description?: string }
      | null;

    if (!response.ok || data?.ok !== true) {
      const error =
        data?.description || `Telegram API error (${response.status})`;
      console.error('[Telegram] Failed to send notification:', error);
      return { ok: false, error };
    }

    return { ok: true };
  } catch (error) {
    const messageText =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Timeout mengirim notifikasi Telegram'
          : error.message
        : 'Gagal mengirim notifikasi Telegram';

    console.error('[Telegram] Failed to send notification:', messageText);
    return { ok: false, error: messageText };
  } finally {
    clearTimeout(timeout);
  }
}
