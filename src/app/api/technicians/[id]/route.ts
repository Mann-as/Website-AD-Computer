import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }
    const existing = await prisma.technician.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Teknisi tidak ditemukan' }, { status: 404 });
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Input tidak valid', details: parsed.error.format() }, { status: 400 });
    if (parsed.data.email && parsed.data.email !== existing.email) {
      const dup = await prisma.technician.findUnique({ where: { email: parsed.data.email } });
      if (dup) return NextResponse.json({ error: 'Email sudah dipakai teknisi lain' }, { status: 400 });
    }
    const updated = await prisma.technician.update({ where: { id: params.id }, data: parsed.data });
    return NextResponse.json({ message: 'Teknisi diperbarui', technician: updated });
  } catch (e) {
    console.error('PATCH technician error', e);
    return NextResponse.json({ error: 'Gagal memperbarui teknisi' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }
    const existing = await prisma.technician.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Teknisi tidak ditemukan' }, { status: 404 });
    // SetNull on ServiceRequest.technicianId via schema, so safe to delete — check active assignments
    const activeCount = await prisma.serviceRequest.count({ where: { technicianId: params.id, status: { in: ['CONFIRMED', 'IN_PROGRESS', 'WAITING_CUSTOMER'] } } });
    if (activeCount > 0) {
      return NextResponse.json({ error: `Tidak dapat menghapus: masih ada ${activeCount} tiket aktif ditugaskan ke teknisi ini. Selesaikan atau pindahkan dulu.` }, { status: 400 });
    }
    await prisma.technician.delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Teknisi berhasil dihapus' });
  } catch (e) {
    console.error('DELETE technician error', e);
    return NextResponse.json({ error: 'Gagal menghapus teknisi' }, { status: 500 });
  }
}
