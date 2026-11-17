import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    // Authorization check: ONLY ADMIN CAN SEE ALL CUSTOMERS
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat melihat data seluruh customer.' },
        { status: 403 }
      );
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 20));
    const q = (url.searchParams.get('q') || '').trim();

    const where: Prisma.UserWhereInput = {
      role: 'CUSTOMER',
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { email: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    };

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          customerProfile: true,
          _count: {
            select: { customerRequests: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);

    const safeCustomers = customers.map((c) => sanitizeUser(c));

    return NextResponse.json({
      customers: safeCustomers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    console.error('Fetch customers API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat mengambil data customer' },
      { status: 500 }
    );
  }
}
