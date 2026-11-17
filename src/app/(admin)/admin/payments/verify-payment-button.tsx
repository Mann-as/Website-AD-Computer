'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function VerifyPaymentButton({
  paymentId,
  label = 'Verifikasi',
}: {
  paymentId: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    if (!window.confirm('Verifikasi pembayaran ini sebagai LUNAS?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${paymentId}`, { method: 'PATCH' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memverifikasi pembayaran');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memverifikasi pembayaran');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-semibold transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        {loading ? 'Memproses...' : label}
      </button>
      {error && <span className="text-[10px] text-red-600 max-w-[180px] text-right">{error}</span>}
    </div>
  );
}
