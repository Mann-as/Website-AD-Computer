import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJWT, AUTH_COOKIE_NAME, sanitizeUser } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { notifyAdminNewRegistration } from '@/lib/notifications';
import { Role } from '@/types';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  address: z.string().optional(),
  city: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const limit = rateLimit(`register:${getClientIp(req)}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan registrasi. Silakan coba lagi nanti.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Format request tidak valid' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Input tidak valid', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone, password, address, city } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'CUSTOMER',
        customerProfile: {
          create: {
            address: address || null,
            city: city || null,
          },
        },
      },
      include: {
        customerProfile: true,
      },
    });

    await notifyAdminNewRegistration({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      city: newUser.customerProfile?.city,
    });

    const token = await signJWT({
      sub: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role as Role,
    });

    const safeUser = sanitizeUser(newUser);

    const response = NextResponse.json({
      message: 'Registrasi akun customer berhasil',
      user: safeUser,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server saat registrasi' },
      { status: 500 }
    );
  }
}
