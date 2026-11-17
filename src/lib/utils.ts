import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sanitizeCallbackUrl(
  value: string | null | undefined,
  fallback = '/requests'
): string {
  if (!value) return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return fallback;
  }
  return value;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CONFIRMED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'IN_PROGRESS':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'WAITING_CUSTOMER':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PAID':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-500 border-gray-200';
  }
}

export function getStatusLabelIndonesian(status: string): string {
  switch (status) {
    case 'REQUESTED':
      return 'Menunggu Antrean';
    case 'CONFIRMED':
      return 'Terkonfirmasi';
    case 'IN_PROGRESS':
      return 'Sedang Dikerjakan';
    case 'WAITING_CUSTOMER':
      return 'Menunggu Customer';
    case 'COMPLETED':
      return 'Selesai — Menunggu Pembayaran';
    case 'PAID':
      return 'Selesai & Lunas';
    case 'CANCELLED':
      return 'Dibatalkan';
    default:
      return status;
  }
}
