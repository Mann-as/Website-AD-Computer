import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  GEMINI_API_KEY: z.string().max(500).optional(),
  TELEGRAM_ENABLED: z.boolean().optional(),
  TELEGRAM_ACTIVE_BOT: z.enum(['1', '2']).optional(),
  TELEGRAM_BOT_TOKEN: z.string().max(500).optional(),
  TELEGRAM_BOT_TOKEN_1: z.string().max(500).optional(),
  TELEGRAM_BOT_TOKEN_2: z.string().max(500).optional(),
  TELEGRAM_CHAT_ID: z.string().max(200).optional(),
});

const editableKeys = [
  'GEMINI_API_KEY',
  'TELEGRAM_ENABLED',
  'TELEGRAM_ACTIVE_BOT',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_BOT_TOKEN_1',
  'TELEGRAM_BOT_TOKEN_2',
  'TELEGRAM_CHAT_ID',
] as const;

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.setting.findMany();

    const settingsMap: Record<string, string | boolean | null> = {};
    for (const setting of settings) {
      if (!editableKeys.includes(setting.key as (typeof editableKeys)[number])) continue;
      settingsMap[setting.key] = ['GEMINI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN_1', 'TELEGRAM_BOT_TOKEN_2'].includes(setting.key)
        ? setting.value
          ? '********'
          : null
        : setting.key === 'TELEGRAM_ENABLED'
          ? setting.value !== 'false'
          : setting.value ?? null;
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Fetch settings API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengambil settings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = settingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const values = parsed.data;
    await prisma.$transaction(
      editableKeys
        .filter((key) => {
          const value = values[key];
          const maskedSecret = ['GEMINI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_TOKEN_1', 'TELEGRAM_BOT_TOKEN_2'].includes(key);
          return value !== undefined && !(maskedSecret && value === '********');
        })
        .map((key) => {
          const value = key === 'TELEGRAM_ENABLED'
            ? String(values[key])
            : values[key] ?? null;

          return prisma.setting.upsert({
            where: { key },
            update: { value },
            create: { key, value },
          });
        })
    );

    return NextResponse.json({ message: 'Setting berhasil diperbarui' });
  } catch (error) {
    console.error('Update setting API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui setting' }, { status: 500 });
  }
}