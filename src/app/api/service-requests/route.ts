import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { estimatePriceFromDescription } from '@/lib/estimate';
import { notifyAdminNewBooking, notifyCustomerBookingCreated } from '@/lib/notifications';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createRequestSchema = z.object({
  serviceId: z.string().optional(),
  problemDescription: z
    .string()
    .min(5, 'Deskripsi masalah minimal 5 karakter')
    .max(5000, 'Deskripsi masalah terlalu panjang'),
  serviceType: z.enum(['ONSITE', 'DROP_OFF', 'REMOTE']).default('DROP_OFF'),
  preferredDate: z.string().optional(),
  preferredTime: z.string().max(100).optional(),
  attachment: z.string().max(2000).optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 20));
    const q = (url.searchParams.get('q') || '').trim();

    const baseWhere: Prisma.ServiceRequestWhereInput =
      user.role === 'CUSTOMER' ? { customerId: user.id } : {};

    const where: Prisma.ServiceRequestWhereInput = q
      ? {
          AND: [
            baseWhere,
            {
              OR: [
                { ticketNumber: { contains: q } },
                { problemDescription: { contains: q } },
                { customer: { name: { contains: q } } },
                { customer: { email: { contains: q } } },
              ],
            },
          ],
        }
      : baseWhere;

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              role: true,
              customerProfile: true,
            },
          },
          technician: true,
          service: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
          payments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceRequest.count({ where }),
    ]);

    return NextResponse.json({
      requests,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (e) {
    console.error('Fetch service requests error:', e);
    return NextResponse.json({ error: 'Gagal memuat tiket' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Harap login' }, { status: 401 });

    const limit = rateLimit(`create-request:${user.id}`, 20, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan booking. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = createRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { serviceId, problemDescription, serviceType, preferredDate, preferredTime, attachment } =
      parsed.data;

    let parsedPreferredDate: Date | null = null;
    if (preferredDate) {
      parsedPreferredDate = new Date(preferredDate);
      if (Number.isNaN(parsedPreferredDate.getTime())) {
        return NextResponse.json({ error: 'Tanggal preferensi tidak valid' }, { status: 400 });
      }
    }

    let baseCost = 0;
    let estimateNote: string | null = null;

    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service || !service.isActive) {
        return NextResponse.json({ error: 'Layanan tidak ditemukan atau sudah nonaktif' }, { status: 400 });
      }
      baseCost = service.price;
    }

    if (!baseCost) {
      const est = estimatePriceFromDescription(problemDescription);
      baseCost = est.avg;
      estimateNote = `Estimasi otomatis (${est.label}): Rp${est.min.toLocaleString('id-ID')} - Rp${est.max.toLocaleString('id-ID')}. Estimasi awal, harga final akan dikonfirmasi Admin.`;
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let ticketNumber = '';
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const candidate = `TKT-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      const exists = await prisma.serviceRequest.findUnique({
        where: { ticketNumber: candidate },
        select: { id: true },
      });
      if (!exists) {
        ticketNumber = candidate;
        break;
      }
    }
    if (!ticketNumber) {
      return NextResponse.json(
        { error: 'Gagal membuat nomor tiket unik. Silakan coba lagi.' },
        { status: 500 }
      );
    }

    const newRequest = await prisma.serviceRequest.create({
      data: {
        ticketNumber,
        customerId: user.id,
        serviceId: serviceId || null,
        problemDescription,
        serviceType,
        preferredDate: parsedPreferredDate,
        preferredTime: preferredTime || null,
        attachment: attachment || null,
        status: 'REQUESTED',
        estimatedCost: baseCost,
        adminNotes: estimateNote || undefined,
        statusHistory: {
          create: [
            {
              newStatus: 'REQUESTED',
              changedBy: user.id,
              note: 'Service request baru dibuat oleh customer',
            },
          ],
        },
      },
      include: {
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

    await notifyAdminNewBooking(newRequest, newRequest.customer);
    await notifyCustomerBookingCreated(newRequest, newRequest.customer);

    return NextResponse.json(
      { message: 'Service request berhasil dibuat', request: newRequest },
      { status: 201 }
    );
  } catch (e) {
    console.error('Create service request error:', e);
    return NextResponse.json({ error: 'Gagal membuat tiket' }, { status: 500 });
  }
}
