'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Mail, Phone, Trash2, Loader2, Send, X } from 'lucide-react';

type Customer = {
 id: string;
 name: string;
 email: string;
 phone: string | null;
 telegramChatId: string | null;
 createdAt: string;
 _count?: { customerRequests: number };
};

export default function AdminCustomersPage() {
 const [customers, setCustomers] = useState<Customer[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [telegramCustomer, setTelegramCustomer] = useState<Customer | null>(null);
 const [telegramInput, setTelegramInput] = useState('');
 const [savingTelegram, setSavingTelegram] = useState(false);
 const [generatingTelegramLink, setGeneratingTelegramLink] = useState(false);
 const [telegramLink, setTelegramLink] = useState<string | null>(null);
 const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [total, setTotal] = useState(0);
 const [searchInput, setSearchInput] = useState('');
 const [query, setQuery] = useState('');

 const showToast = useCallback((msg: string, kind: 'success' | 'error' = 'success') => {
 setToast({ msg, kind });
 setTimeout(() => setToast(null), 4000);
 }, []);

 const fetchCustomers = useCallback(async (pageToLoad: number, searchQuery: string) => {
 setLoading(true);
 setError(null);
 try {
 const params = new URLSearchParams({
 page: String(pageToLoad),
 pageSize: '20',
 });
 if (searchQuery) params.set('q', searchQuery);
 const res = await fetch(`/api/customers?${params.toString()}`, { cache: 'no-store' });
 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Gagal memuat data customer');
 }
 setCustomers(data.customers ?? []);
 setTotal(data.pagination?.total ?? 0);
 setTotalPages(data.pagination?.totalPages ?? 1);
 } catch (err: unknown) {
 const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
 setError(message);
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchCustomers(page, query);
 }, [fetchCustomers, page, query]);

 function handleSearch(e: React.FormEvent) {
 e.preventDefault();
 setPage(1);
 setQuery(searchInput.trim());
 }

 const handleDelete = async (id: string, name: string) => {
 const confirmed = window.confirm(
 `Yakin ingin menghapus customer "${name}"? Customer yang sudah memiliki riwayat service tidak akan dihapus demi menjaga arsip transaksi.`
 );
 if (!confirmed) return;

 setDeletingId(id);
 try {
 const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
 const data = await res.json();
 if (!res.ok) {
 throw new Error(data.error || 'Gagal menghapus customer');
 }
 showToast(data.message || `Customer "${name}" berhasil dihapus`);
 await fetchCustomers(page, query);
 } catch (err: unknown) {
 const message = err instanceof Error ? err.message : 'Gagal menghapus';
 showToast(message, 'error');
 } finally {
 setDeletingId(null);
 }
  }; 

  const openTelegramModal = (customer: Customer) => {
  setTelegramCustomer(customer);
  setTelegramInput(customer.telegramChatId || '');
  setTelegramLink(null);
  };

  const generateTelegramLink = async () => {
  if (!telegramCustomer) return;
  setGeneratingTelegramLink(true);
  setTelegramLink(null);
  try {
  const res = await fetch('/api/telegram/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ customerId: telegramCustomer.id }),
  });
  const raw = await res.text();
  let data: { url?: string; error?: string } = {};
  try {
  data = raw ? JSON.parse(raw) : {};
  } catch {
  throw new Error(`Server mengembalikan respons tidak valid (HTTP ${res.status}).`);
  }
  if (!res.ok) throw new Error(data.error || `Gagal membuat link aktivasi (HTTP ${res.status})`);
  if (!data.url) throw new Error('Server tidak mengembalikan link aktivasi.');
  setTelegramLink(data.url);
  showToast('Link aktivasi berhasil dibuat. Kirim link ini ke customer.');
  } catch (err: unknown) {
  showToast(err instanceof Error ? err.message : 'Gagal membuat link aktivasi', 'error');
  } finally {
  setGeneratingTelegramLink(false);
  }
  };

  const handleSaveTelegram = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!telegramCustomer) return;

  setSavingTelegram(true);
  try {
  const res = await fetch(`/api/customers/${telegramCustomer.id}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ telegramChatId: telegramInput }),
  });
  const data = await res.json();
  if (!res.ok) {
  throw new Error(data.error || 'Gagal menyimpan Telegram Chat ID');
  }

  if (data.telegram && data.telegram.ok === false) {
  showToast(
  `Chat ID disimpan, tetapi pesan uji gagal: ${data.telegram.error}. Pastikan customer sudah menekan Start di bot Telegram.`,
  'error'
  );
  } else {
  showToast(data.message || 'Telegram Chat ID berhasil disimpan');
  }

  setTelegramCustomer(null);
  await fetchCustomers(page, query);
  } catch (err: unknown) {
  const message = err instanceof Error ? err.message : 'Gagal menyimpan Telegram Chat ID';
  showToast(message, 'error');
  } finally {
  setSavingTelegram(false);
  }
  };

  return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <Users className="w-5 h-5 text-emerald-700" />
 Manajemen Customer
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">
 Daftar pengguna terdaftar yang dapat melakukan service request
 </p>
 </div>

 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
 <input
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 placeholder="Cari nama, email, atau nomor telepon customer..."
 className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#dc2626]"
 />
 <button type="submit" className="px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-semibold">
 Cari
 </button>
 {query && (
 <button type="button" onClick={() => { setSearchInput(''); setQuery(''); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs font-semibold">
 Reset
 </button>
 )}
 </form>

 <div className="bg-white border border-gray-200 rounded-2xl p-6">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-16 gap-3">
 <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
 <p className="text-sm text-gray-500">Memuat data customer...</p>
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center py-12 gap-3">
 <p className="text-sm text-red-600 text-center">{error}</p>
 <button
 onClick={() => fetchCustomers(page, query)}
 className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-900 hover:bg-gray-200 transition-colors"
 >
 Coba Lagi
 </button>
 </div>
 ) : customers.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 gap-2">
 <Users className="w-10 h-10 text-gray-400" />
 <p className="text-sm font-semibold text-gray-700">Belum ada customer</p>
 <p className="text-xs text-gray-500">Customer baru akan muncul di sini setelah mendaftar.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-700">
 <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">
 <span className="flex items-center gap-1.5">
 <Users className="w-3.5 h-3.5" /> Nama
 </span>
 </th>
 <th className="py-3 px-4">
 <span className="flex items-center gap-1.5">
 <Mail className="w-3.5 h-3.5" /> Email
 </span>
 </th>
 <th className="py-3 px-4">
 <span className="flex items-center gap-1.5">
  <Phone className="w-3.5 h-3.5" /> Telepon / WA
  </span>
  </th>
  <th className="py-3 px-4 text-center">
  <span className="flex items-center justify-center gap-1.5">
  <Send className="w-3.5 h-3.5" /> Telegram
  </span>
  </th>
  <th className="py-3 px-4 text-center">Total Service</th>
 <th className="py-3 px-4 text-right">Tanggal Rilis Akun</th>
 <th className="py-3 px-4 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {customers.map((c) => (
 <tr key={c.id} className="hover:bg-gray-50 transition-colors">
 <td className="py-3 px-4 font-bold text-gray-900">{c.name}</td>
 <td className="py-3 px-4 text-gray-700">{c.email}</td>
  <td className="py-3 px-4 text-gray-500">{c.phone || '-'}</td>
  <td className="py-3 px-4 text-center">
  <button
  onClick={() => openTelegramModal(c)}
  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors ${
  c.telegramChatId
  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
  }`}
  title={c.telegramChatId ? `Chat ID: ${c.telegramChatId}` : 'Atur Telegram Chat ID'}
  >
  <Send className="w-3 h-3" />
  {c.telegramChatId ? 'Terhubung' : 'Atur'}
  </button>
  </td>
  <td className="py-3 px-4 text-center font-bold text-[#dc2626]">
 {c._count?.customerRequests ?? 0}
 </td>
 <td className="py-3 px-4 text-right text-gray-500">
 {new Date(c.createdAt).toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 })}
 </td>
 <td className="py-3 px-4 text-center">
 <button
 onClick={() => handleDelete(c.id, c.name)}
 disabled={deletingId === c.id}
 className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 title={`Hapus ${c.name}`}
 aria-label={`Hapus ${c.name}`}
 >
 {deletingId === c.id ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <Trash2 className="w-4 h-4" />
 )}
 </button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {!loading && customers.length > 0 && (
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-200">
 <span className="text-[11px] text-gray-500">
 Menampilkan {customers.length} dari {total} customer
 </span>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page <= 1}
 className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 text-xs font-medium disabled:opacity-40"
 >
 Sebelumnya
 </button>
 <span className="text-[11px] text-gray-600">Halaman {page} / {totalPages}</span>
 <button
 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
 disabled={page >= totalPages}
 className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 text-xs font-medium disabled:opacity-40"
 >
 Berikutnya
 </button>
 </div>
 </div>
 )}
 </div>

  {telegramCustomer && (
  <div
  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
  onClick={() => { if (!savingTelegram) setTelegramCustomer(null); }}
  >
  <div
  className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-6 space-y-4"
  onClick={(e) => e.stopPropagation()}
  >
  <div className="flex items-start justify-between gap-3">
  <div>
  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
  <Send className="w-4 h-4 text-emerald-700" />
  Atur Telegram Chat ID
  </h2>
  <p className="text-[11px] text-gray-500 mt-0.5">
  Customer: <span className="font-semibold text-gray-700">{telegramCustomer.name}</span>
  </p>
  </div>
  <button
  type="button"
  onClick={() => setTelegramCustomer(null)}
  disabled={savingTelegram}
  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
  aria-label="Tutup"
  >
  <X className="w-4 h-4" />
  </button>
  </div>

  <form onSubmit={handleSaveTelegram} className="space-y-4">
  <div>
  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
  Telegram Chat ID
  </label>
  <input
  value={telegramInput}
  onChange={(e) => setTelegramInput(e.target.value)}
  placeholder="Contoh: 123456789"
  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626]"
  />
  <button
  type="button"
  onClick={generateTelegramLink}
  disabled={generatingTelegramLink || savingTelegram}
  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#dc2626] text-[#dc2626] hover:bg-red-50 text-xs font-semibold disabled:opacity-50"
  >
  {generatingTelegramLink ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
  {generatingTelegramLink ? 'Membuat link...' : 'Buat Link Aktivasi Otomatis'}
  </button>
  {telegramLink && (
  <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3">
  <p className="text-[11px] text-emerald-800 font-semibold mb-1">Kirim link ini ke customer:</p>
  <input readOnly value={telegramLink} className="w-full bg-white border border-emerald-200 rounded-lg px-2.5 py-2 text-[11px] text-gray-700" onFocus={(e) => e.currentTarget.select()} />
  <p className="text-[10px] text-emerald-700 mt-1">Berlaku 30 menit. Customer cukup membuka link dan menekan Start.</p>
  </div>
  )}
  <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
  Customer tidak perlu mencari Chat ID. Buat link aktivasi, kirimkan melalui WhatsApp, lalu customer cukup membuka link dan menekan <b>Start</b>.
  </p>
  </div>

  <div className="flex justify-end gap-2 pt-1">
  <button
  type="button"
  onClick={() => setTelegramCustomer(null)}
  disabled={savingTelegram}
  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold disabled:opacity-50"
  >
  Batal
  </button>
  <button
  type="submit"
  disabled={savingTelegram}
  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-50"
  >
  {savingTelegram ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
  {savingTelegram ? 'Menyimpan...' : 'Simpan & Tes'}
  </button>
  </div>
  </form>
  </div>
  </div>
  )}

  {toast && (
  <div className={`fixed bottom-6 right-6 z-50 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 ${toast.kind === 'error' ? 'bg-red-600 border-red-700 shadow-red-600/20' : 'bg-emerald-600 border-emerald-700 shadow-emerald-600/20'}`}>
 <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
 {toast.msg}
 </div>
 )}
 </div>
 );
}
