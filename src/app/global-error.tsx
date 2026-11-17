'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Global Error:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-gray-50 text-gray-900 flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 text-[#dc2626] flex items-center justify-center mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Terjadi Kesalahan Sistem</h2>
          <p className="text-sm text-gray-500">
            Sistem mendeteksi hambatan yang tidak terduga. Silakan coba memuat ulang halaman.
          </p>
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-semibold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      </body>
    </html>
  );
}
