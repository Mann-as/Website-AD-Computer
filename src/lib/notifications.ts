import { formatRupiah, getStatusLabelIndonesian } from '@/lib/utils';
import { sendTelegramMessage } from '@/lib/telegram';

type CustomerNotification = {
  name: string;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  telegramChatId?: string | null;
};

type TicketNotification = {
  ticketNumber: string;
  problemDescription?: string | null;
  serviceType?: string | null;
  estimatedCost?: number | null;
  finalCost?: number | null;
  preferredDate?: Date | null;
  preferredTime?: string | null;
  service?: { name: string } | null;
};

type PaymentNotification = {
  amount: number;
  paymentMethod?: string | null;
};

function formatDateTime(value: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(value);

  return `${formatted} WIB`;
}

function formatPreferredSchedule(ticket: TicketNotification): string {
  if (!ticket.preferredDate) {
    return ticket.preferredTime
      ? `Tanggal belum ditentukan, jam ${ticket.preferredTime}`
      : 'Belum ditentukan';
  }

  const date = new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(ticket.preferredDate);

  return ticket.preferredTime ? `${date}, ${ticket.preferredTime}` : date;
}

function serviceTypeLabel(value?: string | null): string {
  switch (value) {
    case 'ONSITE':
      return 'Onsite';
    case 'DROP_OFF':
      return 'Drop off';
    case 'REMOTE':
      return 'Remote';
    default:
      return 'Belum ditentukan';
  }
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '-';
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 3)}...`
    : normalized;
}

function adminUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000').replace(
    /\/+$/,
    ''
  );
  return `${base}${path}`;
}

async function sendNotification(text: string): Promise<void> {
  try {
    await sendTelegramMessage({ text });
  } catch (error) {
    console.error('[Telegram] Notification dispatch error:', error);
  }
}

async function sendCustomerNotification(
  customer: CustomerNotification,
  text: string
): Promise<void> {
  const target = customer.telegramChatId?.trim();
  if (!target) return;

  try {
    await sendTelegramMessage({ text, target });
  } catch (error) {
    console.error('[Telegram] Customer notification dispatch error:', error);
  }
}

export async function notifyAdminNewRegistration(user: {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
}): Promise<void> {
  const lines = [
    'PENDAFTARAN CUSTOMER BARU',
    '',
    `Nama: ${user.name}`,
    `Email: ${user.email}`,
    `No. HP: ${user.phone || 'Belum diisi'}`,
    `Kota: ${user.city || 'Belum diisi'}`,
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat: ${adminUrl('/admin/customers')}`,
  ];

  await sendNotification(lines.join('\n'));
}

export async function notifyAdminNewBooking(
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'BOOKING SERVICE BARU',
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Customer: ${customer.name}`,
    `No. HP: ${customer.phone || 'Belum diisi'}`,
    `Layanan: ${ticket.service?.name || 'Konsultasi / belum dipilih'}`,
    `Tipe: ${serviceTypeLabel(ticket.serviceType)}`,
    `Keluhan: ${truncateText(ticket.problemDescription || '-', 200)}`,
    `Estimasi: ${formatRupiah(ticket.estimatedCost ?? 0)}`,
    `Jadwal: ${formatPreferredSchedule(ticket)}`,
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat: ${adminUrl('/admin/requests')}`,
  ];

  await sendNotification(lines.join('\n'));
}

export async function notifyAdminPaymentPending(
  payment: PaymentNotification,
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'KONFIRMASI PEMBAYARAN',
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Customer: ${customer.name}`,
    `No. HP: ${customer.phone || 'Belum diisi'}`,
    `Nominal: ${formatRupiah(payment.amount)}`,
    `Metode: ${payment.paymentMethod || '-'}`,
    'Status: Menunggu verifikasi Admin',
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat: ${adminUrl('/admin/payments')}`,
  ];

  await sendNotification(lines.join('\n'));
}

export async function notifyAdminPaymentPaid(
  payment: PaymentNotification,
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'PEMBAYARAN DIVERIFIKASI',
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Customer: ${customer.name}`,
    `No. HP: ${customer.phone || 'Belum diisi'}`,
    `Nominal: ${formatRupiah(payment.amount)}`,
    `Metode: ${payment.paymentMethod || '-'}`,
    'Status: Lunas',
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat: ${adminUrl('/admin/payments')}`,
  ];

  await sendNotification(lines.join('\n'));
}

export async function notifyCustomerBookingCreated(
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'BOOKING SERVICE DITERIMA',
    '',
    `Halo ${customer.name},`,
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Layanan: ${ticket.service?.name || 'Konsultasi / belum dipilih'}`,
    `Tipe: ${serviceTypeLabel(ticket.serviceType)}`,
    `Keluhan: ${truncateText(ticket.problemDescription || '-', 200)}`,
    `Estimasi: ${formatRupiah(ticket.estimatedCost ?? 0)}`,
    `Jadwal: ${formatPreferredSchedule(ticket)}`,
    `Waktu: ${formatDateTime()}`,
    '',
    'Tim kami akan menghubungi Anda untuk konfirmasi.',
    `Lihat tiket: ${adminUrl('/requests')}`,
  ];

  await sendCustomerNotification(customer, lines.join('\n'));
}

export async function notifyCustomerStatusChanged(
  ticket: TicketNotification,
  customer: CustomerNotification,
  oldStatus: string,
  newStatus: string,
  note?: string | null
): Promise<void> {
  const lines = [
    'UPDATE STATUS TIKET',
    '',
    `Halo ${customer.name},`,
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Status: ${getStatusLabelIndonesian(oldStatus)} -> ${getStatusLabelIndonesian(newStatus)}`,
    `Catatan: ${note?.trim() || 'Tidak ada catatan'}`,
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat tiket: ${adminUrl('/requests')}`,
  ];

  await sendCustomerNotification(customer, lines.join('\n'));
}

export async function notifyCustomerPaymentSubmitted(
  payment: PaymentNotification,
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'KONFIRMASI PEMBAYARAN DITERIMA',
    '',
    `Halo ${customer.name},`,
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Nominal: ${formatRupiah(payment.amount)}`,
    `Metode: ${payment.paymentMethod || '-'}`,
    'Status: Menunggu verifikasi Admin',
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat tiket: ${adminUrl('/requests')}`,
  ];

  await sendCustomerNotification(customer, lines.join('\n'));
}

export async function notifyCustomerPaymentVerified(
  payment: PaymentNotification,
  ticket: TicketNotification,
  customer: CustomerNotification
): Promise<void> {
  const lines = [
    'PEMBAYARAN LUNAS',
    '',
    `Halo ${customer.name},`,
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Nominal: ${formatRupiah(payment.amount)}`,
    `Metode: ${payment.paymentMethod || '-'}`,
    'Status: Lunas',
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat tiket: ${adminUrl('/requests')}`,
  ];

  await sendCustomerNotification(customer, lines.join('\n'));
}

export async function notifyAdminStatusChanged(
  ticket: TicketNotification,
  customer: CustomerNotification,
  oldStatus: string,
  newStatus: string,
  note?: string | null
): Promise<void> {
  const lines = [
    'UPDATE STATUS TIKET',
    '',
    `Tiket: ${ticket.ticketNumber}`,
    `Customer: ${customer.name}`,
    `No. HP: ${customer.phone || 'Belum diisi'}`,
    `Status: ${getStatusLabelIndonesian(oldStatus)} -> ${getStatusLabelIndonesian(newStatus)}`,
    `Catatan: ${note?.trim() || 'Tidak ada catatan'}`,
    `Waktu: ${formatDateTime()}`,
    '',
    `Lihat: ${adminUrl('/admin/requests')}`,
  ];

  await sendNotification(lines.join('\n'));
}
