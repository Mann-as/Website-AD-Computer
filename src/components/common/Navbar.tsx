'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserSession } from '@/types';
import { Wrench, User, LogOut, ShieldCheck, LayoutDashboard, FileText, MessageCircle } from 'lucide-react';

export function Navbar() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) return null; // Admin has its own Sidebar/Header layout

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/AD.png"
            alt="AD Computer"
            className="h-9 w-9 rounded-lg object-contain bg-white border border-gray-100 shadow-sm group-hover:shadow transition-shadow"
          />
          <div className="leading-tight">
            <span className="block text-sm font-bold text-gray-900 tracking-tight group-hover:text-brand-600 transition-colors">AD Computer</span>
            <span className="block text-[10px] text-gray-500 font-medium -mt-0.5 tracking-wide">Computer & IT Services</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-brand-600 transition-colors">
            Beranda
          </Link>
          <Link href="/#services" className="hover:text-brand-600 transition-colors">
            Layanan IT
          </Link>
          <Link href="/booking" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
            <Wrench className="w-4 h-4" />
            Booking
          </Link>
          {user && (
            <Link href="/requests" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              Service Saya
            </Link>
          )}
          {user && (
            <Link href="/profile" className="hover:text-brand-600 transition-colors flex items-center gap-1.5">
              <User className="w-4 h-4" />
              Profil
            </Link>
          )}
          <a
            href="https://wa.me/6285881489207?text=Halo%20AD%20Computer%2C%20saya%20ingin%20konsultasi%20layanan%20service%20komputer"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#25D366] transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            Hubungi Kami
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-3">
                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors flex items-center gap-1.5"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      Dashboard Admin
                    </Link>
                  )}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span className="font-medium text-gray-700">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/booking"
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Booking Service
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
