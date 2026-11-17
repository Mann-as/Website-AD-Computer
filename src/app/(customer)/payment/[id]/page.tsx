import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { formatRupiah, getStatusBadgeClass, getStatusLabelIndonesian } from '@/lib/utils';
import Link from 'next/link';
import { CreditCard, QrCode, CheckCircle2, ArrowLeft, ShieldCheck, Clock } from 'lucide-react';
import PaymentClient from './payment-client';

export const revalidate = 0;

export default async function PaymentPage({ params }: { params: { id: string } }) {
 const user = await getCurrentUser();
 if (!user) redirect(`/login?callbackUrl=/payment/${params.id}`);

 const ticket = await prisma.serviceRequest.findUnique({
 where: { id: params.id },
 include: { service: true, payments: true, customer: { select: { id: true, name: true, email: true } } },
 });

 if (!ticket) notFound();
 if (ticket.customerId !== user.id && user.role !== 'ADMIN') {
 return (
 <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
 <p className="text-red-600 font-bold">Akses ditolak — tiket ini bukan milik Anda.</p>
 <Link href="/requests" className="inline-flex px-4 py-2 rounded-xl bg-gray-100 text-gray-900 text-xs">Kembali ke Service Saya</Link>
 </div>
 );
 }

 const displayCost = ticket.finalCost > 0 ? ticket.finalCost : ticket.estimatedCost;
 const isPaid = ticket.status === 'PAID' || ticket.payments.some((p) => p.status === 'PAID');
 const pendingPayment = ticket.payments.find((p) => p.status === 'PENDING');
 const canPay = ticket.status === 'COMPLETED' && !isPaid && !pendingPayment;

 return (
 <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
 <Link href="/requests" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900">
 <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Service
 </Link>

 <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 <CreditCard className="w-6 h-6 text-amber-600" />
 Pembayaran Service
 </h1>
 <p className="text-xs text-gray-500 mt-1">Selesaikan pembayaran untuk tiket <span className="font-mono text-[#dc2626]">{ticket.ticketNumber}</span></p>
 </div>
 <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeClass(ticket.status)}`}>
 {getStatusLabelIndonesian(ticket.status)}
 </span>
 </div>

 {isPaid ? (
 <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
 <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 mx-auto">
 <CheckCircle2 className="w-7 h-7" />
 </div>
 <h2 className="text-lg font-bold text-emerald-700">Pembayaran Lunas</h2>
 <p className="text-xs text-emerald-700">Tiket {ticket.ticketNumber} sudah dibayar sebesar {formatRupiah(displayCost)}. Terima kasih!</p>
 <Link href="/requests" className="inline-flex mt-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold">Lihat Riwayat</Link>
 </div>
 ) : pendingPayment ? (
 <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
 <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-amber-600 mx-auto"><Clock className="w-7 h-7" /></div>
 <h2 className="text-lg font-bold text-amber-800">Menunggu Verifikasi Admin</h2>
 <p className="text-xs text-gray-600 max-w-md mx-auto">
 Konfirmasi pembayaran sebesar <b>{formatRupiah(displayCost)}</b> via {pendingPayment.paymentMethod} sudah kami terima.
 Admin akan memverifikasi pembayaran Anda, lalu status tiket berubah menjadi <b>Lunas</b>.
 </p>
 <Link href="/requests" className="inline-flex mt-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold border border-gray-200">Kembali ke Service Saya</Link>
 </div>
 ) : !canPay ? (
 <div className="p-8 rounded-2xl bg-white border border-gray-200 text-center space-y-3">
 <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mx-auto"><Clock className="w-7 h-7" /></div>
 <h2 className="text-sm font-bold text-gray-900">Belum Memerlukan Pembayaran</h2>
 <p className="text-xs text-gray-500 max-w-md mx-auto">
 Tiket ini berstatus <b>{getStatusLabelIndonesian(ticket.status)}</b>. Halaman pembayaran hanya tersedia ketika status <b>Selesai — Menunggu Pembayaran</b>. Silakan tunggu Admin menyelesaikan pengerjaan dan menetapkan biaya final.
 </p>
 <Link href="/requests" className="inline-flex mt-2 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-900 text-xs font-semibold border border-gray-200">Kembali</Link>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
 {/* LEFT: QR + PAY */}
 <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
 <div className="flex items-center gap-2 pb-4 border-b border-gray-200">
 <div className="w-9 h-9 rounded-xl bg-white border border-amber-200 flex items-center justify-center text-amber-600"><QrCode className="w-5 h-5" /></div>
 <div>
 <h2 className="text-sm font-bold text-gray-900">Scan QR untuk Bayar</h2>
 <p className="text-[11px] text-gray-500">QRIS — mendukung GoPay, OVO, DANA, ShopeePay & Mobile Banking</p>
 </div>
 </div>

 <div className="bg-white rounded-2xl p-5 flex flex-col items-center gap-3">
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img src="/qr-payment.png" alt="QR Code Pembayaran" className="w-[260px] h-[260px] object-contain rounded-xl" />
 <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Pembayaran aman & terenkripsi</p>
 </div>

 <div className="rounded-xl bg-white border border-gray-200 p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] text-gray-500">Total Tagihan</p>
 <p className="text-xl font-extrabold text-[#dc2626]">{formatRupiah(displayCost)}</p>
 {ticket.finalCost > 0 && ticket.estimatedCost > 0 && ticket.finalCost !== ticket.estimatedCost && (
 <p className="text-[11px] text-gray-500 mt-1">Estimasi awal {formatRupiah(ticket.estimatedCost)} → disesuaikan menjadi final</p>
 )}
 </div>
 <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">{ticket.ticketNumber}</span>
 </div>

 <PaymentClient ticketId={ticket.id} amount={displayCost} />
 <p className="text-[11px] text-gray-500 text-center">Setelah transfer/scan berhasil, klik Konfirmasi Pembayaran. Admin akan verifikasi dan mengubah status menjadi Lunas.</p>
 </div>

 {/* RIGHT: DETAIL */}
 <div className="lg:col-span-2 space-y-4">
 <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
 <h3 className="text-sm font-bold text-gray-900">Rincian Tiket</h3>
 <div className="space-y-3 text-xs">
 <div className="flex justify-between gap-3"><span className="text-gray-500">Kode Tiket</span><span className="font-mono font-bold text-[#dc2626]">{ticket.ticketNumber}</span></div>
 <div className="flex justify-between gap-3"><span className="text-gray-500">Layanan</span><span className="font-semibold text-gray-900 text-right">{ticket.service ? ticket.service.name : 'General IT Service'}</span></div>
 <div className="flex justify-between gap-3"><span className="text-gray-500">Tipe</span><span className="text-gray-900">{ticket.serviceType}</span></div>
 <div className="flex justify-between gap-3"><span className="text-gray-500">Biaya Final</span><span className="font-bold text-[#dc2626]">{formatRupiah(displayCost)}</span></div>
 <div className="pt-3 border-t border-gray-200">
 <span className="text-gray-500 block mb-1">Keluhan</span>
 <p className="text-gray-700 leading-relaxed">{ticket.problemDescription}</p>
 </div>
 {ticket.technicianNotes && (
 <div className="p-3 rounded-xl bg-white border border-gray-200">
 <span className="text-[11px] font-bold text-[#dc2626] block mb-1">Catatan Teknisi</span>
 <p className="text-[11px] text-gray-500 italic">{ticket.technicianNotes}</p>
 </div>
 )}
 </div>
 </div>

 <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
 <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-amber-600" /> Cara Pembayaran</h4>
 <ol className="text-[11px] text-gray-600 list-decimal list-inside space-y-1">
 <li>Buka aplikasi e-wallet / mobile banking Anda.</li>
 <li>Pilih Scan QR / QRIS dan arahkan ke QR di samping.</li>
 <li>Pastikan nominal {formatRupiah(displayCost)} dan nama merchant AD Computer benar.</li>
 <li>Selesaikan pembayaran, lalu klik Konfirmasi Pembayaran.</li>
 </ol>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}
