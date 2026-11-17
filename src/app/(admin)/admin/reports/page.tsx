import { prisma } from '@/lib/prisma';
import { formatRupiah } from '@/lib/utils';
import { BarChart3, TrendingUp, DollarSign, FileText } from 'lucide-react';

export const revalidate = 0;

export default async function AdminReportsPage() {
 const [totalCompleted, totalRevenue] = await Promise.all([
 prisma.serviceRequest.count({ where: { status: { in: ['COMPLETED', 'PAID'] } } }),
 prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
 ]);

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <BarChart3 className="w-5 h-5 text-[#dc2626]" />
 Laporan Bisnis & Performa Service
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">
 Statistik tingkat penyelesaian perbaikan komputer dan akumulasi pendapatan
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-2">
 <div className="flex items-center justify-between text-xs text-gray-500">
 <span>Tingkat Perbaikan Komputer Selesai</span>
 <TrendingUp className="w-4 h-4 text-emerald-700" />
 </div>
 <div className="text-3xl font-extrabold text-gray-900">{totalCompleted} Perangkat</div>
 <p className="text-[11px] text-gray-500">Service sukses tanpa klaim garansi ulang</p>
 </div>

 <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-2">
 <div className="flex items-center justify-between text-xs text-gray-500">
 <span>Total Accumulative Revenue</span>
 <DollarSign className="w-4 h-4 text-[#dc2626]" />
 </div>
 <div className="text-3xl font-extrabold text-[#dc2626]">
 {formatRupiah(totalRevenue._sum.amount || 0)}
 </div>
 <p className="text-[11px] text-gray-500">Pendapatan bersih terkonfirmasi</p>
 </div>
 </div>
 </div>
 );
}
