'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { FileText, Save, Loader2 } from 'lucide-react';
import {
 formatRupiah,
 getStatusBadgeClass,
 getStatusLabelIndonesian,
} from '@/lib/utils';

type TechnicianOpt = { id: string; name: string; email: string; specialization: string | null; isActive: boolean };
type ServiceRequest = {
 id: string;
 ticketNumber: string;
 serviceType: string;
 serviceId: string | null;
 problemDescription: string;
 status: string;
 estimatedCost: number;
 finalCost: number;
 adminNotes: string | null;
 technicianNotes: string | null;
 technicianId: string | null;
 technician: TechnicianOpt | null;
 createdAt: string;
 customer: { name: string; email: string; phone: string | null };
 service: { name: string } | null;
};

type EditForm = {
 status: string;
 finalCost: string;
 adminNotes: string;
 technicianNotes: string;
 technicianId: string;
};

const STATUS_OPTIONS = [
 'REQUESTED',
 'CONFIRMED',
 'IN_PROGRESS',
 'WAITING_CUSTOMER',
 'COMPLETED',
 'PAID',
 'CANCELLED',
] as const;

export default function AdminRequestsPage() {
 const [requests, setRequests] = useState<ServiceRequest[]>([]);
 const [technicians, setTechnicians] = useState<TechnicianOpt[]>([]);
 const [loading, setLoading] = useState(true);
 const [fetchError, setFetchError] = useState<string | null>(null);
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [forms, setForms] = useState<Record<string, EditForm>>({});
 const [savingId, setSavingId] = useState<string | null>(null);
 const [editError, setEditError] = useState<Record<string, string | null>>({});
 const [editSuccess, setEditSuccess] = useState<Record<string, string | null>>({});
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const [total, setTotal] = useState(0);
 const [searchInput, setSearchInput] = useState('');
 const [query, setQuery] = useState('');

 const fetchAll = useCallback(async (pageToLoad: number, searchQuery: string) => {
 setLoading(true);
 setFetchError(null);
 try {
 const params = new URLSearchParams({
 page: String(pageToLoad),
 pageSize: '20',
 });
 if (searchQuery) params.set('q', searchQuery);
 const reqRes = await fetch(`/api/service-requests?${params.toString()}`, { cache: 'no-store' });
 const reqData = await reqRes.json();
 if (!reqRes.ok) throw new Error(reqData.error || 'Gagal memuat data service requests');
 setRequests(reqData.requests ?? []);
 setTotal(reqData.pagination?.total ?? 0);
 setTotalPages(reqData.pagination?.totalPages ?? 1);
 try {
 const techRes = await fetch('/api/technicians', { cache: 'no-store' });
 if (techRes.ok) {
 const techData = await techRes.json();
 setTechnicians((techData.technicians ?? []).filter((t: TechnicianOpt) => t.isActive));
 }
 } catch { /* ignore technician fetch error */ }
 } catch (err) {
 setFetchError(err instanceof Error ? err.message : 'Gagal memuat data');
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => {
 fetchAll(page, query);
 }, [fetchAll, page, query]);

 function handleSearch(e: React.FormEvent) {
 e.preventDefault();
 setPage(1);
 setQuery(searchInput.trim());
 }

 function openEdit(req: ServiceRequest) {
 if (expandedId === req.id) {
 setExpandedId(null);
 return;
 }
 setExpandedId(req.id);
 setEditError((prev) => ({ ...prev, [req.id]: null }));
 setEditSuccess((prev) => ({ ...prev, [req.id]: null }));
 if (!forms[req.id]) {
 setForms((prev) => ({
 ...prev,
 [req.id]: {
 status: req.status,
 finalCost:
 req.finalCost != null && req.finalCost !== 0
 ? String(req.finalCost)
 : req.estimatedCost
 ? String(req.estimatedCost)
 : '',
 adminNotes: req.adminNotes ?? '',
 technicianNotes: req.technicianNotes ?? '',
 technicianId: req.technicianId ?? '',
 },
 }));
 }
 }

 function updateForm(id: string, patch: Partial<EditForm>) {
 setForms((prev) => {
 const cur = prev[id] ?? { status: 'REQUESTED', finalCost: '', adminNotes: '', technicianNotes: '', technicianId: '' };
 return { ...prev, [id]: { ...cur, ...patch } };
 });
 }

 async function handleSave(req: ServiceRequest) {
 const form = forms[req.id];
 if (!form) return;
 setSavingId(req.id);
 setEditError((prev) => ({ ...prev, [req.id]: null }));
 setEditSuccess((prev) => ({ ...prev, [req.id]: null }));
 try {
 const payload: Record<string, unknown> = {
 status: form.status,
 adminNotes: form.adminNotes ? form.adminNotes : null,
 technicianNotes: form.technicianNotes ? form.technicianNotes : null,
 technicianId: form.technicianId ? form.technicianId : null,
 };
 if (form.finalCost !== '') {
 const parsed = Number(form.finalCost);
 if (Number.isNaN(parsed) || parsed < 0) throw new Error('Biaya akhir tidak valid');
 payload.finalCost = parsed;
 }
 const res = await fetch('/api/service-requests/' + req.id, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 const data = await res.json();
 if (!res.ok) {
 const details = data.details ? ' ' + JSON.stringify(data.details) : '';
 throw new Error((data.error || 'Gagal menyimpan') + details);
 }
 const updated = data.ticket ?? data.request ?? data.data ?? null;
 setRequests((prev) =>
 prev.map((r) => {
 if (r.id !== req.id) return r;
 if (updated) return { ...r, ...updated, customer: updated.customer ?? r.customer, service: updated.service ?? r.service };
 return {
 ...r,
 status: form.status,
 finalCost: payload.finalCost !== undefined ? (payload.finalCost as number) : r.finalCost,
 adminNotes: (payload.adminNotes as string | null) ?? null,
 technicianNotes: (payload.technicianNotes as string | null) ?? null,
 technicianId: (payload.technicianId as string | null) ?? null,
 technician: form.technicianId ? (technicians.find((t) => t.id === form.technicianId) ?? null) : null,
 };
 })
 );
 setEditSuccess((prev) => ({ ...prev, [req.id]: data.message || 'Perubahan berhasil disimpan' }));
 await fetchAll(page, query);
 } catch (err) {
 setEditError((prev) => ({ ...prev, [req.id]: err instanceof Error ? err.message : 'Gagal menyimpan' }));
 } finally {
 setSavingId(null);
 }
 }

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <FileText className="w-5 h-5 text-[#dc2626]" />
 Manajemen Service Request
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">Daftar seluruh pesanan perbaikan — dikelola sepenuhnya oleh Admin</p>
 </div>
 <button
 onClick={() => fetchAll(page, query)}
 disabled={loading}
 className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 text-xs font-medium disabled:opacity-50"
 >
 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Loader2 className="w-4 h-4 opacity-50" />}
 Muat ulang
 </button>
 </div>

 <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
 <input
 value={searchInput}
 onChange={(e) => setSearchInput(e.target.value)}
 placeholder="Cari kode tiket, keluhan, nama/email customer..."
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

 {fetchError && (
 <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 flex items-center justify-between gap-3">
 <span>{fetchError}</span>
 <button onClick={() => fetchAll(page, query)} className="px-3 py-1 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 hover:bg-gray-200 text-xs">
 Coba lagi
 </button>
 </div>
 )}

 <div className="bg-white border border-gray-200 rounded-2xl p-6">
 {loading ? (
 <div className="flex items-center justify-center py-16 gap-2 text-gray-500 text-sm">
 <Loader2 className="w-5 h-5 animate-spin text-[#dc2626]" />
 Memuat data...
 </div>
 ) : requests.length === 0 ? (
 <div className="py-12 text-center text-sm text-gray-500">Belum ada service request.</div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-700">
 <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4">Kode</th>
 <th className="py-3 px-4">Customer</th>
 <th className="py-3 px-4">Perangkat & Keluhan</th>
 <th className="py-3 px-4">Status</th>
 <th className="py-3 px-4 text-right">Biaya</th>
 <th className="py-3 px-4 text-right">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {requests.map((req) => {
 const isExpanded = expandedId === req.id;
 const form = forms[req.id];
 const saving = savingId === req.id;
 return (
 <Fragment key={req.id}>
 <tr className={'hover:bg-gray-50 transition-colors ' + (isExpanded ? 'bg-gray-50' : '')}>
 <td className="py-3 px-4 font-mono font-bold text-[#dc2626]">{req.ticketNumber}</td>
 <td className="py-3 px-4">
 <div className="font-semibold text-gray-900">{req.customer?.name ?? '-'}</div>
 <div className="text-[10px] text-gray-500">{req.customer?.phone || req.customer?.email || '-'}</div>
 {req.technician && <div className="text-[10px] text-[#dc2626] mt-0.5">Teknisi: {req.technician.name}</div>}
 </td>
 <td className="py-3 px-4">
 <div className="font-medium text-gray-900">{req.service?.name || req.serviceType || '-'}</div>
 <div className="text-[11px] text-gray-500 line-clamp-1 max-w-[260px]">{req.problemDescription}</div>
 </td>
 <td className="py-3 px-4">
 <span className={'px-2.5 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ' + getStatusBadgeClass(req.status)}>
 {getStatusLabelIndonesian(req.status)}
 </span>
 </td>
 <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
 {(() => {
 const cost = req.finalCost > 0 ? req.finalCost : req.estimatedCost > 0 ? req.estimatedCost : 0;
 return cost > 0 ? formatRupiah(cost) : '-';
 })()}
 </td>
 <td className="py-3 px-4 text-right">
 <button
 onClick={() => openEdit(req)}
 className={
 'px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ' +
 (isExpanded
 ? 'bg-[#dc2626] border-red-200 text-white hover:bg-red-700'
 : 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-100')
 }
 >
 {isExpanded ? 'Tutup' : 'Kelola'}
 </button>
 </td>
 </tr>
 {isExpanded && form && (
 <tr className="bg-white/50">
 <td colSpan={6} className="px-4 py-5">
 <div className="rounded-2xl bg-white border border-gray-200 p-5 space-y-4">
 <div className="flex items-center justify-between gap-3">
 <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <FileText className="w-4 h-4 text-[#dc2626]" />
 Kelola Tiket {req.ticketNumber}
 </h3>
 <span className={'px-2.5 py-0.5 rounded-full border text-[10px] font-bold ' + getStatusBadgeClass(form.status)}>
 {getStatusLabelIndonesian(form.status)}
 </span>
 </div>
 {editError[req.id] && (
 <div className="px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">
 {editError[req.id]}
 </div>
 )}
 {editSuccess[req.id] && (
 <div className="px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
 {editSuccess[req.id]}
 </div>
 )}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-700">Status</label>
 <select
 value={form.status}
 onChange={(e) => updateForm(req.id, { status: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-red-200/50 focus:ring-1 focus:ring-red-500/30"
 >
 {STATUS_OPTIONS.map((s) => (
 <option key={s} value={s}>
 {s} - {getStatusLabelIndonesian(s)}
 </option>
 ))}
 </select>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-700">Tugaskan Teknisi</label>
 <select
 value={form.technicianId}
 onChange={(e) => updateForm(req.id, { technicianId: e.target.value })}
 className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 focus:outline-none focus:border-red-200/50 focus:ring-1 focus:ring-red-500/30"
 >
 <option value="">-- Belum ditugaskan --</option>
 {technicians.map((tech) => (
 <option key={tech.id} value={tech.id}>{tech.name}{tech.specialization ? ` — ${tech.specialization}` : ''}</option>
 ))}
 </select>
 <p className="text-[11px] text-gray-500">Hanya teknisi aktif yang muncul.</p>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-700">Biaya Akhir (finalCost)</label>
 <input
 type="number"
 min={0}
 inputMode="numeric"
 value={form.finalCost}
 onChange={(e) => updateForm(req.id, { finalCost: e.target.value })}
 placeholder="Contoh: 250000"
 className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200/50 focus:ring-1 focus:ring-red-500/30"
 />
 <p className="text-[11px] text-gray-500">
 Kosongkan jika belum ada biaya final. Estimasi awal:{' '}
 {req.estimatedCost > 0 ? formatRupiah(req.estimatedCost) : '-'}
 </p>
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-700">Catatan Admin</label>
 <textarea
 rows={3}
 value={form.adminNotes}
 onChange={(e) => updateForm(req.id, { adminNotes: e.target.value })}
 placeholder="Catatan internal Admin..."
 className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200/50 focus:ring-1 focus:ring-red-500/30 resize-none"
 />
 </div>
 <div className="space-y-1.5">
 <label className="text-xs font-medium text-gray-700">Catatan Pengerjaan</label>
 <textarea
 rows={3}
 value={form.technicianNotes}
 onChange={(e) => updateForm(req.id, { technicianNotes: e.target.value })}
 placeholder="Catatan hasil pengerjaan / diagnosa..."
 className="w-full px-3 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200/50 focus:ring-1 focus:ring-red-500/30 resize-none"
 />
 </div>
 </div>
 <div className="flex items-center gap-3 pt-1 flex-wrap">
 <button
 onClick={() => handleSave(req)}
 disabled={saving}
 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
 </button>
 <button
 onClick={() => setExpandedId(null)}
 disabled={saving}
 className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-100 border border-gray-200 text-gray-900 text-xs font-medium disabled:opacity-50"
 >
 Batal
 </button>
 <span className="text-[11px] text-gray-500">PATCH /api/service-requests/{req.id}</span>
 </div>
 </div>
 </td>
 </tr>
 )}
 </Fragment>
 );
 })}
 </tbody>
 </table>
 </div>
 )}

 {!loading && requests.length > 0 && (
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-200">
 <span className="text-[11px] text-gray-500">
 Menampilkan {requests.length} dari {total} tiket
 </span>
 <div className="flex items-center gap-2">
 <button
 onClick={() => setPage((p) => Math.max(1, p - 1))}
 disabled={page <= 1}
 className="px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-900 text-xs font-medium disabled:opacity-40"
 >
 Sebelumnya
 </button>
 <span className="text-[11px] text-gray-600">
 Halaman {page} / {totalPages}
 </span>
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
 </div>
 );
}
