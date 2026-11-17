import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatRupiah, getStatusBadgeClass, getStatusLabelIndonesian } from '@/lib/utils';
import { Wrench, Clock, FileText, Plus, CheckCircle2, CreditCard, QrCode } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

export default async function CustomerRequestsPage() {
 const user = await getCurrentUser();

 if (!user) {
 redirect('/login?callbackUrl=/requests');
 }

 // STRICT ACCESS CONTROL: Customer can ONLY see their OWN service requests
 const requests = await prisma.serviceRequest.findMany({
 where: { customerId: user.id },
 include: {
 service: true,
 payments: true,
 },
 orderBy: { createdAt: 'desc' },
 });

 return (
 <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
 <FileText className="w-6 h-6 text-[#dc2626]" />
 Permintaan & Riwayat Service Anda
 </h1>
 <p className="text-xs text-gray-500 mt-1">
 Pantau status pengerjaan tiket service komputer & IT Anda secara realtime
 </p>
 </div>

 <Link
 href="/booking"
 className="px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-lg shadow-red-500/10 flex items-center gap-2"
 >
 <Plus className="w-4 h-4" />
 Booking Service Baru
 </Link>
 </div>

 {requests.length === 0 ? (
 <div className="p-12 text-center rounded-2xl bg-white border border-gray-200 space-y-4">
 <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mx-auto">
 <Wrench className="w-6 h-6" />
 </div>
 <h3 className="text-base font-bold text-gray-900">Belum Ada Request Service</h3>
 <p className="text-xs text-gray-500 max-w-sm mx-auto">
 Anda belum pernah membuat permintaan service. Konsultasi AI gratis atau buat permintaan perbaikan komputer Anda sekarang.
 </p>
 <div className="pt-2 flex items-center justify-center gap-3">
 <Link
 href="/ai-consultation"
 className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-900 font-semibold text-xs transition-colors"
 >
 Konsultasi AI Diagnosis
 </Link>
 </div>
 </div>
 ) : (
 <div className="space-y-4">
 {requests.map((req) => (
 <div
 key={req.id}
 className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-gray-200 transition-all space-y-4"
 >
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-200">
 <div className="flex items-center gap-3">
 <span className="font-mono text-xs font-bold text-[#dc2626] bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
 {req.ticketNumber}
 </span>
 <span className="text-xs font-bold text-gray-900">
 {req.service ? req.service.name : 'General IT Service'}
 </span>
 <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] text-gray-700 font-semibold">
 {req.serviceType}
 </span>
 </div>
 <span
 className={`px-3 py-1 rounded-full border text-xs font-bold tracking-wide ${getStatusBadgeClass(
 req.status
 )}`}
 >
 {getStatusLabelIndonesian(req.status)}
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
 <div>
 <span className="text-gray-500 block mb-1">Deskripsi Keluhan Masalah:</span>
 <p className="text-gray-700 line-clamp-2">{req.problemDescription}</p>
 </div>
 <div>
 <span className="text-gray-500 block mb-1">Estimasi Biaya & Pembayaran:</span>
 {(() => {
 const displayCost = req.finalCost > 0 ? req.finalCost : req.estimatedCost;
 return (
 <>
 <p className="text-[#dc2626] font-bold text-sm">
 {displayCost > 0 ? formatRupiah(displayCost) : 'Sedang Diestimasi'}
 </p>
 {req.finalCost > 0 && req.estimatedCost > 0 && req.finalCost !== req.estimatedCost && (
 <p className="text-[11px] text-gray-500 mt-1">Estimasi awal {formatRupiah(req.estimatedCost)} → Final {formatRupiah(req.finalCost)}</p>
 )}
 </>
 );
 })()}
 </div>
 </div>

 {req.technicianNotes && (
 <div className="p-3 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-700">
 <span className="font-bold text-[#dc2626] block mb-1">🔧 Catatan Pengerjaan:</span>
 <p className="text-gray-500 italic">{req.technicianNotes}</p>
 </div>
 )}

 {(() => {
 const needsPayment = req.status === 'COMPLETED';
 const isPaid = req.status === 'PAID' || req.payments.some((p) => p.status === 'PAID');
 const pendingPayment = req.payments.some((p) => p.status === 'PENDING');
 const displayCost = req.finalCost > 0 ? req.finalCost : req.estimatedCost;
 if (isPaid) {
 return (
 <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
 Pembayaran lunas — terima kasih!
 </div>
 );
 }
 if (pendingPayment) {
 return (
 <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
 <Clock className="w-4 h-4 mt-0.5 shrink-0" />
 <span>
 Konfirmasi pembayaran sebesar {displayCost > 0 ? formatRupiah(displayCost) : '—'} sedang menunggu verifikasi Admin.
 </span>
 </div>
 );
 }
 if (needsPayment) {
 return (
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-600">
 <CreditCard className="w-5 h-5" />
 </div>
 <div>
 <p className="text-xs font-bold text-amber-800">Menunggu Pembayaran</p>
 <p className="text-[11px] text-gray-600">Total tagihan {displayCost > 0 ? formatRupiah(displayCost) : '—'} — selesaikan pembayaran untuk menutup tiket.</p>
 </div>
 </div>
 <Link
 href={`/payment/${req.id}`}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-500/10 transition-all shrink-0"
 >
 <QrCode className="w-4 h-4" />
 Bayar Sekarang
 </Link>
 </div>
 );
 }
 return null;
 })()}
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
