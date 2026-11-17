'use client';

import { useEffect, useState } from 'react';
import { formatRupiah } from '@/lib/utils';
import { Wrench, Pencil, Trash2, Loader2, Plus, X, Save, Power } from 'lucide-react';

type Service = {
 id: string;
 name: string;
 slug: string;
 description: string;
 category: string;
 price: number;
 estimatedDuration: string;
 isActive: boolean;
 createdAt: string;
 updatedAt: string;
};

const CATEGORIES = [
 'COMPUTER_REPAIR',
 'SOFTWARE',
 'NETWORKING',
 'MAINTENANCE',
 'IT_SUPPORT',
 'OTHER',
] as const;

type FormState = {
 name: string;
 slug: string;
 description: string;
 category: string;
 price: string;
 estimatedDuration: string;
};

const emptyForm: FormState = {
 name: '',
 slug: '',
 description: '',
 category: 'COMPUTER_REPAIR',
 price: '',
 estimatedDuration: '',
};

function slugify(v: string) {
 return v
 .toLowerCase()
 .trim()
 .replace(/[^a-z0-9]+/g, '-')
 .replace(/^-|-$/g, '');
}

export default function AdminServicesPage() {
 const [services, setServices] = useState<Service[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [toast, setToast] = useState<string | null>(null);

 // create
 const [showCreate, setShowCreate] = useState(false);
 const [createForm, setCreateForm] = useState<FormState>(emptyForm);
 const [creating, setCreating] = useState(false);

 // edit
 const [editingId, setEditingId] = useState<string | null>(null);
 const [editForm, setEditForm] = useState<FormState>(emptyForm);
 const [saving, setSaving] = useState(false);
 const [deletingId, setDeletingId] = useState<string | null>(null);
 const [togglingId, setTogglingId] = useState<string | null>(null);

 async function fetchServices() {
 setLoading(true);
 setError(null);
 try {
 const res = await fetch('/api/services?includeInactive=1', { cache: 'no-store' });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal memuat layanan');
 setServices(data.services ?? []);
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal memuat layanan');
 } finally {
 setLoading(false);
 }
 }

 useEffect(() => {
 fetchServices();
 }, []);

 useEffect(() => {
 if (!toast) return;
 const t = setTimeout(() => setToast(null), 3000);
 return () => clearTimeout(t);
 }, [toast]);

 async function handleCreate(e: React.FormEvent) {
 e.preventDefault();
 setCreating(true);
 setError(null);
 try {
 const payload = {
 name: createForm.name.trim(),
 slug: createForm.slug.trim() || slugify(createForm.name),
 description: createForm.description.trim(),
 category: createForm.category,
 price: Number(createForm.price),
 estimatedDuration: createForm.estimatedDuration.trim(),
 };
 const res = await fetch('/api/services', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal membuat layanan');
 setToast(data.message || 'Layanan berhasil dibuat');
 setCreateForm(emptyForm);
 setShowCreate(false);
 await fetchServices();
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal membuat layanan');
 } finally {
 setCreating(false);
 }
 }

 function startEdit(s: Service) {
 setEditingId(s.id);
 setEditForm({
 name: s.name,
 slug: s.slug,
 description: s.description,
 category: s.category,
 price: String(s.price),
 estimatedDuration: s.estimatedDuration,
 });
 setError(null);
 }

 function cancelEdit() {
 setEditingId(null);
 setEditForm(emptyForm);
 }

 async function handleUpdate(e: React.FormEvent, id: string) {
 e.preventDefault();
 setSaving(true);
 setError(null);
 try {
 const payload = {
 name: editForm.name.trim(),
 slug: editForm.slug.trim(),
 description: editForm.description.trim(),
 category: editForm.category,
 price: Number(editForm.price),
 estimatedDuration: editForm.estimatedDuration.trim(),
 };
 const res = await fetch(`/api/services/${id}`, {
 method: 'PUT',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(payload),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal memperbarui layanan');
 setToast(data.message || 'Layanan diperbarui');
 setEditingId(null);
 await fetchServices();
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal memperbarui layanan');
 } finally {
 setSaving(false);
 }
 }

 async function handleToggleActive(service: Service) {
 setTogglingId(service.id);
 setError(null);
 try {
 const res = await fetch(`/api/services/${service.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ isActive: !service.isActive }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status layanan');
 setToast(data.message || (data.service?.isActive ? 'Layanan diaktifkan' : 'Layanan dinonaktifkan'));
 await fetchServices();
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal memperbarui status layanan');
 } finally {
 setTogglingId(null);
 }
 }

 async function handleDelete(id: string) {
 if (!confirm('Hapus layanan ini? Jika masih direferensikan tiket, layanan akan dinonaktifkan.')) return;
 setDeletingId(id);
 setError(null);
 try {
 const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal menghapus layanan');
 setToast(data.message || 'Layanan dihapus');
 await fetchServices();
 } catch (e: unknown) {
 setError(e instanceof Error ? e.message : 'Gagal menghapus layanan');
 } finally {
 setDeletingId(null);
 }
 }

 const inputCls =
 'w-full rounded-xl bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-[#dc2626]/50';
 const labelCls = 'text-[11px] font-semibold tracking-wider uppercase text-gray-500';

 return (
 <div className="space-y-6">
 {/* Header */}
 <div className="flex items-start justify-between gap-4">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <Wrench className="w-5 h-5 text-[#dc2626]" />
 Manajemen Katalog Layanan
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">Daftar paket perbaikan & tarif dasar service IT</p>
 </div>
 <button
 onClick={() => setShowCreate((v) => !v)}
 className="inline-flex items-center gap-2 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-sm font-semibold px-4 py-2.5 transition-colors shrink-0"
 >
 {showCreate ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
 {showCreate ? 'Tutup' : 'Tambah Layanan'}
 </button>
 </div>

 {toast && (
 <div className="rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3">
 {toast}
 </div>
 )}
 {error && (
 <div className="rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
 {error}
 </div>
 )}

 {/* Create form */}
 {showCreate && (
 <form
 onSubmit={handleCreate}
 className="p-5 rounded-2xl bg-white border border-gray-200 space-y-4"
 >
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <Plus className="w-4 h-4 text-[#dc2626]" /> Layanan Baru
 </h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className={labelCls}>Nama Layanan *</label>
 <input
 required
 minLength={3}
 value={createForm.name}
 onChange={(e) => {
 const v = e.target.value;
 setCreateForm((f) => ({ ...f, name: v, slug: f.slug || slugify(v) }));
 }}
 placeholder="Service Laptop Premium"
 className={inputCls}
 />
 </div>
 <div className="space-y-1.5">
 <label className={labelCls}>Slug *</label>
 <input
 required
 minLength={3}
 value={createForm.slug}
 onChange={(e) => setCreateForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
 placeholder="service-laptop-premium"
 className={inputCls}
 />
 </div>
 <div className="space-y-1.5 md:col-span-2">
 <label className={labelCls}>Deskripsi *</label>
 <textarea
 required
 minLength={5}
 rows={3}
 value={createForm.description}
 onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
 placeholder="Deskripsi paket layanan..."
 className={inputCls + ' resize-none'}
 />
 </div>
 <div className="space-y-1.5">
 <label className={labelCls}>Kategori *</label>
 <select
 value={createForm.category}
 onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
 className={inputCls}
 >
 {CATEGORIES.map((c) => (
 <option key={c} value={c} className="bg-white">
 {c}
 </option>
 ))}
 </select>
 </div>
 <div className="space-y-1.5">
 <label className={labelCls}>Estimasi Durasi *</label>
 <input
 required
 value={createForm.estimatedDuration}
 onChange={(e) => setCreateForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
 placeholder="2-3 hari"
 className={inputCls}
 />
 </div>
 <div className="space-y-1.5">
 <label className={labelCls}>Harga (IDR) *</label>
 <input
 required
 type="number"
 min={0}
 value={createForm.price}
 onChange={(e) => setCreateForm((f) => ({ ...f, price: e.target.value }))}
 placeholder="150000"
 className={inputCls}
 />
 {createForm.price && !isNaN(Number(createForm.price)) && (
 <p className="text-[11px] text-[#dc2626]">{formatRupiah(Number(createForm.price))}</p>
 )}
 </div>
 </div>
 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => {
 setShowCreate(false);
 setCreateForm(emptyForm);
 }}
 className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-900 text-sm font-medium"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={creating}
 className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#dc2626] hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold"
 >
 {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 {creating ? 'Menyimpan...' : 'Simpan Layanan'}
 </button>
 </div>
 </form>
 )}

 {/* Grid */}
 {loading ? (
 <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
 <Loader2 className="w-5 h-5 animate-spin text-[#dc2626]" />
 Memuat layanan...
 </div>
 ) : services.length === 0 ? (
 <div className="rounded-2xl bg-white border border-dashed border-gray-200 p-10 text-center">
 <Wrench className="w-8 h-8 text-gray-400 mx-auto mb-3" />
 <p className="text-sm text-gray-500">Belum ada layanan. Tambahkan layanan pertama.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {services.map((service) =>
 editingId === service.id ? (
 <form
 key={service.id}
 onSubmit={(e) => handleUpdate(e, service.id)}
 className="p-5 rounded-2xl bg-white border border-red-200 space-y-3"
 >
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold text-[#dc2626] flex items-center gap-1">
 <Pencil className="w-3.5 h-3.5" /> Edit Layanan
 </span>
 <button
 type="button"
 onClick={cancelEdit}
 className="p-1 rounded-lg hover:bg-gray-100 text-gray-500"
 aria-label="Batal edit"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 <div className="space-y-3">
 <div className="space-y-1">
 <label className={labelCls}>Nama</label>
 <input
 required
 minLength={3}
 value={editForm.name}
 onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
 className={inputCls}
 />
 </div>
 <div className="space-y-1">
 <label className={labelCls}>Slug</label>
 <input
 required
 minLength={3}
 value={editForm.slug}
 onChange={(e) => setEditForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
 className={inputCls}
 />
 </div>
 <div className="space-y-1">
 <label className={labelCls}>Deskripsi</label>
 <textarea
 required
 rows={3}
 value={editForm.description}
 onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
 className={inputCls + ' resize-none'}
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="space-y-1">
 <label className={labelCls}>Kategori</label>
 <select
 value={editForm.category}
 onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
 className={inputCls}
 >
 {CATEGORIES.map((c) => (
 <option key={c} value={c} className="bg-white">
 {c}
 </option>
 ))}
 </select>
 </div>
 <div className="space-y-1">
 <label className={labelCls}>Durasi</label>
 <input
 required
 value={editForm.estimatedDuration}
 onChange={(e) => setEditForm((f) => ({ ...f, estimatedDuration: e.target.value }))}
 className={inputCls}
 />
 </div>
 </div>
 <div className="space-y-1">
 <label className={labelCls}>Harga (IDR)</label>
 <input
 required
 type="number"
 min={0}
 value={editForm.price}
 onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
 className={inputCls}
 />
 </div>
 </div>
 <div className="flex gap-2 pt-2">
 <button
 type="button"
 onClick={cancelEdit}
 className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-900 text-sm font-medium"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={saving}
 className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#dc2626] hover:bg-red-700 disabled:opacity-60 text-white text-sm font-semibold"
 >
 {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
 Simpan
 </button>
 </div>
 </form>
 ) : (
 <div
 key={service.id}
 className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3 flex flex-col"
 >
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-1.5">
 <span className="px-2.5 py-0.5 rounded bg-red-50 text-[#dc2626] border border-red-200 text-[10px] font-bold uppercase">
 {service.category}
 </span>
 {!service.isActive && (
 <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-bold uppercase">
 Nonaktif
 </span>
 )}
 </div>
 <span className="text-xs text-gray-500">{service.estimatedDuration}</span>
 </div>
 <h3 className="text-base font-bold text-gray-900">{service.name}</h3>
 <p className="text-xs text-gray-500 line-clamp-2 flex-1">{service.description}</p>
 <p className="text-[11px] text-gray-500 font-mono">{service.slug}</p>
 <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
 <span className="text-xs text-gray-500">Biaya Acuan</span>
 <span className="text-base font-bold text-[#dc2626]">{formatRupiah(service.price)}</span>
 </div>
 <div className="flex flex-wrap gap-2 pt-1">
 <button
 onClick={() => startEdit(service)}
 className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-900 text-xs font-semibold transition-colors"
 >
 <Pencil className="w-3.5 h-3.5" /> Edit
 </button>
 <button
 onClick={() => handleToggleActive(service)}
 disabled={togglingId === service.id}
 className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-semibold disabled:opacity-50 transition-colors ${service.isActive ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'}`}
 >
 {togglingId === service.id ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 ) : (
 <Power className="w-3.5 h-3.5" />
 )}
 {service.isActive ? 'Nonaktifkan' : 'Aktifkan'}
 </button>
 <button
 onClick={() => handleDelete(service.id)}
 disabled={deletingId === service.id}
 className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-semibold disabled:opacity-50 transition-colors"
 >
 {deletingId === service.id ? (
 <Loader2 className="w-3.5 h-3.5 animate-spin" />
 ) : (
 <Trash2 className="w-3.5 h-3.5" />
 )}
 Hapus
 </button>
 </div>
 </div>
 )
 )}
 </div>
 )}
 </div>
 );
}
