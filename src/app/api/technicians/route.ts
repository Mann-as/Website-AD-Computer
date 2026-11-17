import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createTechnicianSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }
    const technicians = await prisma.technician.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { assignedRequests: true } } },
    });
    return NextResponse.json({ technicians });
  } catch (e) {
    console.error('GET technicians error', e);
    return NextResponse.json({ error: 'Gagal memuat data teknisi' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak. Hanya Admin.' }, { status: 403 });
    }
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }
    const parsed = createTechnicianSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Input tidak valid', details: parsed.error.format() }, { status: 400 });
    }
    const { name, email, phone, specialization, isActive } = parsed.data;
    const exists = await prisma.technician.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: 'Email teknisi sudah terdaftar' }, { status: 400 });
    }
    const technician = await prisma.technician.create({
      data: { name, email, phone: phone || null, specialization: specialization || null, isActive: isActive ?? true },
    });
    return NextResponse.json({ message: 'Teknisi berhasil ditambahkan', technician }, { status: 201 });
  } catch (e) {
    console.error('POST technician error', e);
    return NextResponse.json({ error: 'Gagal menambah teknisi' }, { status: 500 });
  }
}
