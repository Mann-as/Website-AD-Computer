import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, sanitizeUser } from '@/lib/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
  telegramChatId: z
    .string()
    .regex(/^-?\d{5,20}$/, 'Telegram Chat ID harus berupa angka.')
    .optional()
    .or(z.literal('')),
});

export async function GET() {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: { customerProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Fetch profile API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat mengambil profil' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) {
      return NextResponse.json({ error: 'Harap login terlebih dahulu' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, phone, address, city, notes, telegramChatId } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(telegramChatId !== undefined ? { telegramChatId: telegramChatId || null } : {}),
        customerProfile: {
          upsert: {
            create: {
              address: address || null,
              city: city || null,
              notes: notes || null,
            },
            update: {
              ...(address !== undefined ? { address } : {}),
              ...(city !== undefined ? { city } : {}),
              ...(notes !== undefined ? { notes } : {}),
            },
          },
        },
      },
      include: { customerProfile: true },
    });

    return NextResponse.json({
      message: 'Profil berhasil diperbarui',
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error('Update profile API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat memperbarui profil' }, { status: 500 });
  }
}
