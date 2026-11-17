export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const updateServiceSchema = z.object({
  name: z.string().min(3, 'Nama layanan minimal 3 karakter').optional(),
  slug: z.string().min(3, 'Slug minimal 3 karakter').optional(),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter').optional(),
  category: z
    .enum([
      'COMPUTER_REPAIR',
      'SOFTWARE',
      'NETWORKING',
      'MAINTENANCE',
      'IT_SUPPORT',
      'OTHER',
    ])
    .optional(),
  price: z.number().min(0, 'Harga tidak boleh negatif').optional(),
  estimatedDuration: z.string().min(1, 'Estimasi durasi wajib diisi').optional(),
  isActive: z.boolean().optional(),
});

async function handleUpdate(
  req: Request,
  params: { id: string }
) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Akses ditolak. Hanya Admin yang dapat memperbarui layanan.' },
      { status: 403 }
    );
  }

  const service = await prisma.service.findUnique({
    where: { id: params.id },
  });

  if (!service) {
    return NextResponse.json(
      { error: 'Layanan tidak ditemukan' },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
  }
  const parsed = updateServiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Input tidak valid', details: parsed.error.format() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Check slug uniqueness if slug is being changed
  if (data.slug && data.slug !== service.slug) {
    const existingSlug = await prisma.service.findUnique({
      where: { slug: data.slug },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug layanan sudah digunakan. Harap gunakan slug yang unik.' },
        { status: 400 }
      );
    }
  }

  const updated = await prisma.service.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json({ message: 'Layanan berhasil diperbarui', service: updated });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    return await handleUpdate(req, params);
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memperbarui layanan' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    return await handleUpdate(req, params);
  } catch (error) {
    console.error('Patch service error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat memperbarui layanan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat menghapus layanan.' },
        { status: 403 }
      );
    }

    const service = await prisma.service.findUnique({
      where: { id: params.id },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Layanan tidak ditemukan' },
        { status: 404 }
      );
    }

    const referencedCount = await prisma.serviceRequest.count({
      where: { serviceId: params.id },
    });

    if (referencedCount > 0) {
      // Soft delete: deactivate
      const softDeleted = await prisma.service.update({
        where: { id: params.id },
        data: { isActive: false },
      });
      return NextResponse.json({
        message: 'Layanan dinonaktifkan karena masih direferensikan oleh tiket',
        service: softDeleted,
      });
    }

    await prisma.service.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Layanan berhasil dihapus' });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server saat menghapus layanan' },
      { status: 500 }
    );
  }
}
