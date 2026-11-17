import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center bg-white">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-[#dc2626] flex items-center justify-center mb-6">
        <Search className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-gray-500 text-sm max-w-md mb-8">
        Halaman yang Anda cari mungkin telah dipindahkan atau tidak tersedia. Silakan kembali ke Beranda.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
      >
        <Home className="w-4 h-4" />
        Kembali ke Beranda
      </Link>
    </div>
  );
}
