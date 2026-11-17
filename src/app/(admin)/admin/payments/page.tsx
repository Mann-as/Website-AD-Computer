import { prisma } from '@/lib/prisma';
import { formatRupiah } from '@/lib/utils';
import { CreditCard } from 'lucide-react';
import VerifyPaymentButton from './verify-payment-button';

export const revalidate = 0;

function paymentBadge(status: string): string {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PARTIAL':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'UNPAID':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

function paymentLabel(status: string): string {
  switch (status) {
    case 'PAID':
      return 'Lunas';
    case 'PENDING':
      return 'Menunggu Verifikasi';
    case 'PARTIAL':
      return 'Bayar Sebagian';
    case 'UNPAID':
      return 'Belum Dibayar';
    default:
      return status;
  }
}

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      serviceRequest: {
        include: { customer: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#dc2626]" />
          Manajemen Pembayaran & Transaksi
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Verifikasi konfirmasi pembayaran customer sebelum tiket ditandai lunas
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        {payments.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">Belum ada transaksi pembayaran.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Kode Request</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Metode Bayar</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Jumlah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#dc2626]">
                      {p.serviceRequest.ticketNumber}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {p.serviceRequest.customer.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{p.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${paymentBadge(
                          p.status
                        )}`}
                      >
                        {paymentLabel(p.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                      {formatRupiah(p.amount)}
                    </td>
                    <td className="py-3 px-4">
                      {p.status === 'PAID' ? (
                        <div className="text-right text-[11px] text-gray-500">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleDateString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Lunas'}
                        </div>
                      ) : ['COMPLETED', 'PAID'].includes(p.serviceRequest.status) ? (
                        <VerifyPaymentButton paymentId={p.id} />
                      ) : (
                        <div className="text-right text-[11px] text-gray-500">
                          Menunggu tiket selesai
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
