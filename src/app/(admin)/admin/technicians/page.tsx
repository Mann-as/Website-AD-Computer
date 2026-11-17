'use client';
import { useState, useEffect, useCallback } from 'react';
import { UserCheck, Mail, Phone, Wrench, Trash2, Plus, Loader2, Power, CheckCircle2 } from 'lucide-react';

type Technician = {
 id: string;
 name: string;
 email: string;
 phone: string | null;
 specialization: string | null;
 isActive: boolean;
 createdAt: string;
 _count?: { assignedRequests: number };
};

export default function AdminTechniciansPage() {
 const [technicians, setTechnicians] = useState<Technician[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [toast, setToast] = useState<string | null>(null);
 const [deletingId, setDeletingId] = useState<string | null>(null);

 // Add form
 const [formName, setFormName] = useState('');
 const [formEmail, setFormEmail] = useState('');
 const [formPhone, setFormPhone] = useState('');
 const [formSpec, setFormSpec] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [formError, setFormError] = useState<string | null>(null);

 const showToast = useCallback((msg: string) => {
 setToast(msg);
 setTimeout(() => setToast(null), 3000);
 }, []);

 const fetchTechnicians = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const res = await fetch('/api/technicians', { cache: 'no-store' });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal memuat data teknisi');
 setTechnicians(data.technicians ?? []);
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
 } finally {
 setLoading(false);
 }
 }, []);

 useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

 const handleAdd = async (e: React.FormEvent) => {
 e.preventDefault();
 setFormError(null);
 if (!formName.trim() || !formEmail.trim()) {
 setFormError('Nama dan email wajib diisi');
 return;
 }
 setSubmitting(true);
 try {
 const res = await fetch('/api/technicians', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ name: formName.trim(), email: formEmail.trim(), phone: formPhone.trim() || null, specialization: formSpec.trim() || null }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal menambah teknisi');
 setTechnicians((prev) => [data.technician, ...prev]);
 setFormName(''); setFormEmail(''); setFormPhone(''); setFormSpec('');
 showToast(data.message || 'Teknisi berhasil ditambahkan');
 } catch (err: unknown) {
 setFormError(err instanceof Error ? err.message : 'Gagal menambah teknisi');
 } finally {
 setSubmitting(false);
 }
 };

 const handleDelete = async (id: string, name: string) => {
 const confirmed = window.confirm(`Yakin ingin menghapus teknisi "${name}"? Tiket yang masih aktif harus dipindahkan dulu.`);
 if (!confirmed) return;
 setDeletingId(id);
 try {
 const res = await fetch(`/api/technicians/${id}`, { method: 'DELETE' });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal menghapus teknisi');
 setTechnicians((prev) => prev.filter((t) => t.id !== id));
 showToast(data.message || `Teknisi "${name}" dihapus`);
 } catch (err: unknown) {
 showToast(err instanceof Error ? err.message : 'Gagal menghapus');
 } finally {
 setDeletingId(null);
 }
 };

 const toggleActive = async (tech: Technician) => {
 try {
 const res = await fetch(`/api/technicians/${tech.id}`, {
 method: 'PATCH',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ isActive: !tech.isActive }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Gagal memperbarui status');
 setTechnicians((prev) => prev.map((t) => (t.id === tech.id ? data.technician : t)));
 showToast(data.technician.isActive ? `${tech.name} diaktifkan` : `${tech.name} dinonaktifkan`);
 } catch (err: unknown) {
 showToast(err instanceof Error ? err.message : 'Gagal memperbarui');
 }
 };

 return (
 <div className="space-y-6">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <UserCheck className="w-5 h-5 text-[#dc2626]" />
 Manajemen Teknisi
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">Kelola daftar teknisi — Admin dapat menambah, menonaktifkan, dan menghapus teknisi. Teknisi tidak memiliki akun login.</p>
 </div>

 {/* Add form */}
 <div className="bg-white border border-gray-200 rounded-2xl p-5">
 <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
 <Plus className="w-4 h-4 text-emerald-700" /> Tambah Teknisi
 </h2>
 <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
 <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Nama lengkap" className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200" />
 <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="Email" type="email" className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200" />
 <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="Telepon (opsional)" className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200" />
 <input value={formSpec} onChange={(e) => setFormSpec(e.target.value)} placeholder="Spesialisasi (mis. Laptop & Hardware)" className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-red-200" />
 <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
 <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50 transition-colors">
 {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
 Tambah Teknisi
 </button>
 {formError && <span className="text-xs text-red-600">{formError}</span>}
 </div>
 </form>
 </div>

 <div className="bg-white border border-gray-200 rounded-2xl p-6">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-16 gap-3">
 <Loader2 className="w-7 h-7 text-[#dc2626] animate-spin" />
 <p className="text-sm text-gray-500">Memuat data teknisi...</p>
 </div>
 ) : error ? (
 <div className="flex flex-col items-center justify-center py-12 gap-3">
 <p className="text-sm text-red-600 text-center">{error}</p>
 <button onClick={fetchTechnicians} className="px-4 py-2 rounded-xl bg-gray-100 border border-gray-200 text-xs font-semibold text-gray-900 hover:bg-gray-100">Coba Lagi</button>
 </div>
 ) : technicians.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-16 gap-2">
 <UserCheck className="w-10 h-10 text-gray-400" />
 <p className="text-sm font-semibold text-gray-700">Belum ada teknisi</p>
 <p className="text-xs text-gray-500">Tambahkan teknisi pertama di form atas.</p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs text-gray-700">
 <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-[10px] tracking-wider border-b border-gray-200">
 <tr>
 <th className="py-3 px-4"><span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5" /> Nama</span></th>
 <th className="py-3 px-4"><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span></th>
 <th className="py-3 px-4"><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telepon</span></th>
 <th className="py-3 px-4"><span className="flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" /> Spesialisasi</span></th>
 <th className="py-3 px-4 text-center">Tiket</th>
 <th className="py-3 px-4 text-center">Status</th>
 <th className="py-3 px-4 text-center">Aksi</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-gray-200">
 {technicians.map((t) => (
 <tr key={t.id} className="hover:bg-gray-50 transition-colors">
 <td className="py-3 px-4 font-bold text-gray-900">{t.name}</td>
 <td className="py-3 px-4 text-gray-700">{t.email}</td>
 <td className="py-3 px-4 text-gray-500">{t.phone || '-'}</td>
 <td className="py-3 px-4 text-gray-500">{t.specialization || '-'}</td>
 <td className="py-3 px-4 text-center font-bold text-[#dc2626]">{t._count?.assignedRequests ?? 0}</td>
 <td className="py-3 px-4 text-center">
 <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border ${t.isActive ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-100 border-gray-200 text-gray-500'}`}>
 {t.isActive ? <CheckCircle2 className="w-3 h-3" /> : <Power className="w-3 h-3" />}
 {t.isActive ? 'Aktif' : 'Nonaktif'}
 </span>
 </td>
 <td className="py-3 px-4">
 <div className="flex items-center justify-center gap-1.5">
 <button onClick={() => toggleActive(t)} className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border text-xs transition-colors ${t.isActive ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-50' : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50'}`} title={t.isActive ? 'Nonaktifkan' : 'Aktifkan'}>
 <Power className="w-4 h-4" />
 </button>
 <button onClick={() => handleDelete(t.id, t.name)} disabled={deletingId === t.id} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 disabled:opacity-50" title={`Hapus ${t.name}`}>
 {deletingId === t.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </div>
 {toast && (
 <div className="fixed bottom-6 right-6 z-50 bg-white text-gray-900 text-sm font-medium px-4 py-3 rounded-xl shadow-lg border border-gray-200 flex items-center gap-2">
 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
 {toast}
 </div>
 )}
 </div>
 );
}
