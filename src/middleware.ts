import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be configured in production');
}

const SECRET_KEY = new TextEncoder().encode(
  jwtSecret || 'development-only-jwt-secret-change-me'
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('adcomputer_token')?.value;

  let payload: { sub: string; role: string; name: string } | null = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, SECRET_KEY);
      payload = verified.payload as { sub: string; role: string; name: string };
    } catch {
      // Invalid or expired token
    }
  }

  // Protect Admin pages — ADMIN only
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (payload.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect Customer authenticated routes
  if (
    pathname.startsWith('/requests') ||
    pathname.startsWith('/booking') ||
    pathname.startsWith('/ai-consultation') ||
    pathname.startsWith('/payment') ||
    pathname.startsWith('/profile')
  ) {
    if (!payload) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Catatan: /login dan /register sengaja tidak di-redirect hanya berdasarkan JWT.
  // Token bisa saja masih valid tetapi user sudah dihapus dari database; redirect di sini
  // akan menyebabkan loop dengan halaman yang memvalidasi ulang session ke database.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/requests/:path*',
    '/booking/:path*',
    '/ai-consultation/:path*',
    '/payment/:path*',
    '/api/telegram/webhook',
    '/profile/:path*',
  ],
};
