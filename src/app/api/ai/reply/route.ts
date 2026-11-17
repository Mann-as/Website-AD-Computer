import { NextResponse } from 'next/server';
import { generateAdminCustomerReply } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { buildAIWebsiteStats } from '@/lib/ai-context';

export const dynamic = 'force-dynamic';

const replySchema = z.object({
  issueDescription: z
    .string()
    .min(5, 'Keluhan customer minimal 5 karakter')
    .max(4000, 'Keluhan customer terlalu panjang'),
  status: z.string().min(1).max(40),
  techNote: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }

    const ip = getClientIp(req);
    const limit = rateLimit(`ai-reply:${user.id}:${ip}`, 30, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan AI. Silakan coba lagi beberapa saat lagi.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = replySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { issueDescription, status, techNote } = parsed.data;
    
    const websiteStats = await buildAIWebsiteStats(user);
    const adminUser = { ...user, website: websiteStats };
    
    const reply = await generateAdminCustomerReply(issueDescription, status, techNote, adminUser);

    await prisma.aIConversation.create({
      data: {
        userId: user.id,
        prompt: `[ADMIN_REPLY] ${issueDescription} | Status: ${status}`,
        response: reply,
        context: 'ADMIN_REPLY',
      },
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Reply API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat draft balasan AI' },
      { status: 500 }
    );
  }
}
