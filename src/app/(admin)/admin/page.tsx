import { prisma } from '@/lib/prisma';
import { formatRupiah, getStatusBadgeClass, getStatusLabelIndonesian } from '@/lib/utils';
import {
 FileText,
 Clock,
 CheckCircle2,
 DollarSign,
 Users,
 Wrench,
 Bot,
 ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0; // Dynamic route

export default async function AdminDashboardPage() {
 const [totalRequests, pendingRequests, completedRequests, totalRevenueResult, recentRequests] =
 await Promise.all([
 prisma.serviceRequest.count(),
 prisma.serviceRequest.count({ where: { status: 'REQUESTED' } }),
 prisma.serviceRequest.count({ where: { status: { in: ['COMPLETED', 'PAID'] } } }),
 prisma.payment.aggregate({
 _sum: { amount: true },
 where: { status: 'PAID' },
 }),
 prisma.serviceRequest.findMany({
 take: 5,
 orderBy: { createdAt: 'desc' },
 include: {
 customer: { select: { name: true, email: true } },
 },
 }),
 ]);

 const totalRevenue = totalRevenueResult._sum.amount || 0;

 return (
 <div className="space-y-8">
 {/* HEADER TITLE */}
 <div>
 <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Admin Executive Dashboard</h1>
 <p className="text-xs text-gray-500 mt-1">
 Ringkasan operasional bisnis service komputer dan keuangan IT Services
 </p>
 </div>

 {/* METRIC CARDS */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
 <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">Total Service Request</span>
 <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#dc2626]">
 <FileText className="w-5 h-5" />
 </div>
 </div>
 <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
 <span className="text-[11px] text-gray-500">Semua riwayat permintaan</span>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">Menunggu Antrean (Pending)</span>
 <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
 <Clock className="w-5 h-5" />
 </div>
 </div>
 <div className="text-2xl font-bold text-amber-600">{pendingRequests}</div>
 <span className="text-[11px] text-gray-500">Perlu tindak lanjut Admin</span>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">Service Selesai</span>
 <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
 <CheckCircle2 className="w-5 h-5" />
 </div>
 </div>
 <div className="text-2xl font-bold text-emerald-700">{completedRequests}</div>
 <span className="text-[11px] text-gray-500">Perbaikan sukses</span>
 </div>

 <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-gray-500">Pendapatan Terbayar</span>
 <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#dc2626]">
 <DollarSign className="w-5 h-5" />
 </div>
 </div>
 <div className="text-xl font-bold text-[#dc2626]">{formatRupiah(totalRevenue)}</div>
 <span className="text-[11px] text-gray-500">Total transaksi terkonfirmasi</span>
 </div>
 </div>

 {/* QUICK MODULE ACTIONS */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
 <Link
 href="/admin/ai-assistant"
 className="p-5 rounded-2xl bg-red-50 border border-red-200 hover:border-red-200/60 transition-all group flex items-center justify-between"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-[#dc2626] flex items-center justify-center text-white shadow-md shadow-red-500/10">
 <Bot className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#dc2626] transition-colors">
 AI Diagnostic & Reply Assistant
 </h3>
 <p className="text-[11px] text-gray-500">Bantu Admin membuat balasan & diagnosa</p>
 </div>
 </div>
 <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#dc2626] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
 </Link>

 <Link
 href="/admin/services"
 className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-200 transition-all group flex items-center justify-between"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-[#dc2626]">
 <Wrench className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 group-hover:text-[#dc2626] transition-colors">
 Manajemen Katalog Service
 </h3>
 <p className="text-[11px] text-gray-500">Kelola tarif & jenis layanan IT</p>
 </div>
 </div>
 <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-[#dc2626] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
 </Link>

 <Link
 href="/admin/customers"
 className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-gray-200 transition-all group flex items-center justify-between"
 >
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
 <Users className="w-5 h-5" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
 Manajemen Customer
 </h3>
 <p className="text-[11px] text-gray-500">Kelola daftar pengguna</p>
 </div>
 </div>
 <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
 </Link>
 </div>

 {/* RECENT SERVICE REQUESTS TABLE */}
 <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
 <div className="flex items-center justify-between pb-3 border-b border-gray-200">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <FileText className="w-4 h-4 text-[#dc2626]" />
 Service Request Terbaru
 </h2>
 <Link
 href="/admin/requests"
 className="text-xs text-[#dc2626] hover:underline font-semibold"
 >
 Lihat Semua →
 </Link>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-700">
 <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">Kode Request</th>
 <th className="py-3 px-4">Customer</th>
 <th className="py-3 px-4">Perangkat</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4 text-right">Total Biaya</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {recentRequests.map((req) => (
 <tr key={req.id} className="hover:bg-gray-50 transition-colors">
 <td className="py-3 px-4 font-mono font-bold text-[#dc2626]">{req.ticketNumber}</td>
 <td className="py-3 px-4 font-medium text-gray-900">{req.customer.name}</td>
 <td className="py-3 px-4">{req.serviceType}</td>
 <td className="py-3 px-4">
 <span
 className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadgeClass(
 req.status
 )}`}
 >
 {getStatusLabelIndonesian(req.status)}
 </span>
 </td>
 <td className="py-3 px-4 text-right font-bold text-gray-900">
 {req.finalCost > 0 ? formatRupiah(req.finalCost) : '-'}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
}
