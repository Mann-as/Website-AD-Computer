import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createServiceSchema = z.object({
  name: z.string().min(3, 'Nama layanan minimal 3 karakter'),
  slug: z.string().min(3, 'Slug minimal 3 karakter'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  category: z.enum([
    'COMPUTER_REPAIR',
    'SOFTWARE',
    'NETWORKING',
    'MAINTENANCE',
    'IT_SUPPORT',
    'OTHER',
  ]),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  estimatedDuration: z.string().min(1, 'Estimasi durasi wajib diisi'),
  isActive: z.boolean().optional().default(true),
});

export async function GET(req: Request) {
  try {
    const includeInactive = new URL(req.url).searchParams.get('includeInactive') === '1';

    if (includeInactive) {
      const user = await getCurrentUser();
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Akses ditolak. Hanya Admin yang dapat melihat layanan nonaktif.' },
          { status: 403 }
        );
      }
    }

    const services = await prisma.service.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ services });
  } catch (error) {
    console.error('Fetch services error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil katalog layanan' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    // Authorization check: ONLY ADMIN CAN CREATE SERVICES
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat menambahkan layanan.' },
        { status: 403 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }
    const parsed = createServiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, slug, description, category, price, estimatedDuration, isActive } =
      parsed.data;

    const existingSlug = await prisma.service.findUnique({
      where: { slug },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug layanan sudah digunakan. Harap gunakan slug yang unik.' },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        category,
        price,
        estimatedDuration,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json({ message: 'Layanan berhasil dibuat', service }, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat membuat layanan' },
      { status: 500 }
    );
  }
}
