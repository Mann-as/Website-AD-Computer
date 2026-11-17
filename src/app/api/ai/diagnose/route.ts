import { NextResponse } from 'next/server';
import { diagnoseHardwareIssue, type AIUserContext } from '@/lib/ai';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { buildAIWebsiteStats } from '@/lib/ai-context';

export const dynamic = 'force-dynamic';

const diagnoseSchema = z.object({
  deviceType: z.string().min(2, 'Jenis perangkat wajib diisi').max(120),
  issueDescription: z
    .string()
    .min(5, 'Deskripsi masalah minimal 5 karakter')
    .max(2000, 'Deskripsi masalah terlalu panjang'),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const ip = getClientIp(req);
    const limit = rateLimit(`ai-diagnose:${user?.id ?? ip}`, 20, 60_000);
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

    const parsed = diagnoseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { deviceType, issueDescription } = parsed.data;

    const websiteStats = await buildAIWebsiteStats(user);

    let aiUser: AIUserContext | undefined = user ?? undefined;
    if (user && user.role === 'CUSTOMER') {
      const [total, grouped, recent] = await Promise.all([
        prisma.serviceRequest.count({ where: { customerId: user.id } }),
        prisma.serviceRequest.groupBy({
          by: ['status'],
          where: { customerId: user.id },
          _count: { _all: true },
        }),
        prisma.serviceRequest.findMany({
          where: { customerId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            ticketNumber: true,
            status: true,
            service: { select: { name: true } },
          },
        }),
      ]);

      aiUser = {
        ...user,
        tickets: {
          total,
          byStatus: Object.fromEntries(
            grouped.map((item) => [item.status, item._count._all])
          ),
          recent: recent.map((item) => ({
            ticketNumber: item.ticketNumber,
            status: item.status,
            serviceName: item.service?.name ?? null,
          })),
        },
        website: websiteStats,
      };
    } else if (user) {
      aiUser = {
        ...user,
        website: websiteStats,
      };
    } else {
      aiUser = {
        website: websiteStats,
      };
    }

    const diagnosis = await diagnoseHardwareIssue(issueDescription, deviceType, aiUser);

    if (user) {
      await prisma.aIConversation.create({
        data: {
          userId: user.id,
          prompt: `[${deviceType}] ${issueDescription}`,
          response: diagnosis,
          context: user.role === 'ADMIN' ? 'ADMIN_DIAGNOSIS' : 'CUSTOMER_DIAGNOSIS',
        },
      });
    }

    return NextResponse.json({ diagnosis });
  } catch (error) {
    console.error('AI Diagnosis API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses diagnosa AI' },
      { status: 500 }
    );
  }
}
