'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react';

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  telegramChatId: string;
};

export default function ProfileForm({ initial }: { initial: ProfileData }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
          notes: form.notes,
          telegramChatId: form.telegramChatId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui profil');
      setMessage(data.message || 'Profil berhasil diperbarui');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    'w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626]';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
      {message && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
          <input
            required
            minLength={2}
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
          <input value={form.email} disabled className={`${inputCls} bg-gray-50 text-gray-500`} />
          <p className="text-[11px] text-gray-500 mt-1">Email tidak dapat diubah.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / HP</label>
          <input
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            placeholder="081234567890"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kota</label>
          <input
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Cirebon"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Alamat</label>
          <input
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Jl. Contoh No. 1"
            className={inputCls}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Telegram Chat ID</label>
          <input
            value={form.telegramChatId}
            onChange={(e) => update('telegramChatId', e.target.value)}
            placeholder="Contoh: 123456789"
            className={inputCls}
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Mulai chat dengan bot Telegram Anda, lalu masukkan Chat ID agar menerima notifikasi tiket dan pembayaran.
          </p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Catatan Tambahan</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Preferensi jadwal, catatan akses lokasi, dan lain-lain."
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-red-500/10 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {loading ? 'Menyimpan...' : 'Simpan Profil'}
        </button>
      </div>
    </form>
  );
}
