'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle2, CreditCard } from 'lucide-react';

export default function PaymentClient({ ticketId, amount }: { ticketId: string; amount: number }) {
 const router = useRouter();
 const [method, setMethod] = useState('QRIS');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState(false);

 async function handleConfirm() {
 setError(null);
 setLoading(true);
 try {
 const res = await fetch('/api/payments', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ serviceRequestId: ticketId, paymentMethod: method }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal konfirmasi pembayaran');
 setSuccess(true);
 setTimeout(() => router.push('/requests'), 1200);
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal memproses pembayaran');
 } finally {
 setLoading(false);
 }
 }

  if (success) {
  return (
  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700 text-xs font-semibold">
  <CheckCircle2 className="w-5 h-5" /> Konfirmasi pembayaran terkirim. Menunggu verifikasi Admin...
  </div>
  );
  }

 return (
 <div className="space-y-3">
 <label className="block text-xs font-semibold text-gray-700">Metode Pembayaran</label>
 <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#dc2626]">
 <option value="QRIS">QRIS (QR Code di atas)</option>
 <option value="TRANSFER_BANK">Transfer Bank</option>
 <option value="EWALLET">E-Wallet</option>
 <option value="CASH">Tunai di Workshop</option>
 </select>

 {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">{error}</div>}

 <button onClick={handleConfirm} disabled={loading} className="w-full py-3.5 rounded-xl bg-[#dc2626] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 transition-all">
 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
 {loading ? 'Memproses...' : `Konfirmasi Pembayaran — ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount)}`}
 </button>
 </div>
 );
}
