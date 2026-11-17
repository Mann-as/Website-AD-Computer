'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Loader2, CheckCircle, AlertCircle, Receipt, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { estimatePriceFromDescription } from '@/lib/estimate';
import { formatRupiah } from '@/lib/utils';

type Service = {
 id: string;
 name: string;
 slug: string;
 category: string;
 price: number;
 estimatedDuration: string;
 description: string;
};

function formatDisplayDate(iso: string): string {
 if (!iso) return '';
 const d = new Date(iso + 'T00:00:00');
 if (Number.isNaN(d.getTime())) return iso;
 return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function toISODate(d: Date): string {
 const y = d.getFullYear();
 const m = String(d.getMonth() + 1).padStart(2, '0');
 const day = String(d.getDate()).padStart(2, '0');
 return `${y}-${m}-${day}`;
}

function CalendarDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
 const [open, setOpen] = useState(false);
 const [viewDate, setViewDate] = useState<Date>(() => {
 if (value) {
 const parsed = new Date(value + 'T00:00:00');
 if (!Number.isNaN(parsed.getTime())) return parsed;
 }
 return new Date();
 });
 const wrapperRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 if (value && !open) {
 const parsed = new Date(value + 'T00:00:00');
 if (!Number.isNaN(parsed.getTime())) setViewDate(parsed);
 }
 }, [value, open]);

 useEffect(() => {
 if (!open) return;
 const handleDown = (e: MouseEvent) => {
 if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
 };
 const handleKey = (e: KeyboardEvent) => {
 if (e.key === 'Escape') setOpen(false);
 };
 document.addEventListener('mousedown', handleDown);
 document.addEventListener('keydown', handleKey);
 return () => {
 document.removeEventListener('mousedown', handleDown);
 document.removeEventListener('keydown', handleKey);
 };
 }, [open]);

 const today = useMemo(() => {
 const t = new Date();
 t.setHours(0, 0, 0, 0);
 return t;
 }, []);

 const todayISO = toISODate(today);
 const monthLabel = viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
 const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
 const firstDow = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
 const cells: (number | null)[] = [];
 for (let i = 0; i < firstDow; i++) cells.push(null);
 for (let d = 1; d <= daysInMonth; d++) cells.push(d);
 const goPrev = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
 const goNext = () => setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
 const handleSelect = (day: number) => {
 const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
 d.setHours(0, 0, 0, 0);
 if (d < today) return;
 onChange(toISODate(d));
 setOpen(false);
 };
 const handleToday = () => {
 onChange(todayISO);
 setViewDate(new Date(today));
 setOpen(false);
 };
 const handleClear = () => {
 onChange('');
 setOpen(false);
 };
 const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
 return (
 <div ref={wrapperRef} className="relative">
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-left flex items-center justify-between gap-2 focus:outline-none focus:border-[#dc2626] hover:border-gray-200 transition-colors"
 aria-haspopup="dialog"
 aria-expanded={open}
 >
 <span className={value ? 'text-gray-900' : 'text-gray-500'}>{value ? formatDisplayDate(value) : 'Pilih tanggal'}</span>
 <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
 </button>
 {open && (
 <div className="absolute z-40 mt-2 left-0 w-[296px] bg-white border border-gray-200 rounded-2xl shadow-lg shadow-lg p-4 animate-in fade-in">
 <div className="flex items-center justify-between mb-3">
 <button type="button" onClick={goPrev} className="w-7 h-7 grid place-items-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Bulan sebelumnya">
 <ChevronLeft className="w-4 h-4" />
 </button>
 <span className="text-xs font-semibold text-gray-900 capitalize">{monthLabel}</span>
 <button type="button" onClick={goNext} className="w-7 h-7 grid place-items-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors" aria-label="Bulan berikutnya">
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 <div className="grid grid-cols-7 gap-1 mb-1">
 {weekDays.map((w) => (
 <span key={w} className="text-[10px] font-semibold text-gray-500 text-center py-1">{w}</span>
 ))}
 </div>
 <div className="grid grid-cols-7 gap-1">
 {cells.map((day, idx) => {
 if (day === null) return <span key={`empty-${idx}`} className="w-8 h-8" />;
 const cellDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
 cellDate.setHours(0, 0, 0, 0);
 const iso = toISODate(cellDate);
 const isPast = cellDate < today;
 const isSelected = value === iso;
 const isToday = iso === todayISO;
 return (
 <button
 key={iso}
 type="button"
 disabled={isPast}
 onClick={() => handleSelect(day)}
 className={[
 'w-8 h-8 rounded-lg text-xs flex items-center justify-center transition-colors',
 isSelected ? 'bg-[#dc2626] text-white font-semibold shadow shadow-red-500/10' : isToday ? 'bg-gray-100 text-[#dc2626] border border-red-200 font-semibold' : isPast ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
 ].join(' ')}
 >
 {day}
 </button>
 );
 })}
 </div>
 <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200">
 <button type="button" onClick={handleClear} className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-100 text-gray-700 text-xs font-medium transition-colors">Hapus</button>
 <button type="button" onClick={handleToday} className="px-3 py-1.5 rounded-lg bg-[#dc2626] hover:bg-red-700 text-white text-xs font-semibold transition-colors">Hari ini</button>
 </div>
 </div>
 )}
 </div>
 );
}

export default function BookingPage() {
 const router = useRouter();
 const [services, setServices] = useState<Service[]>([]);
 const [servicesLoading, setServicesLoading] = useState(true);
 const [serviceId, setServiceId] = useState('');
 const [problemDescription, setProblemDescription] = useState('');
 const [serviceType, setServiceType] = useState<'ONSITE' | 'DROP_OFF' | 'REMOTE'>('DROP_OFF');
 const [preferredDate, setPreferredDate] = useState('');
 const [preferredTime, setPreferredTime] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const autoEstimate = useMemo(() => {
 if (problemDescription.trim().length < 5) return null;
 return estimatePriceFromDescription(problemDescription);
 }, [problemDescription]);
 const selectedServicePrice = useMemo(() => {
 if (!serviceId) return null;
 const svc = services.find((s) => s.id === serviceId);
 return svc ? svc.price : null;
 }, [serviceId, services]);
 useEffect(() => {
 fetch('/api/services')
 .then((r) => r.json())
 .then((data) => setServices(data.services || []))
 .catch(() => setServices([]))
 .finally(() => setServicesLoading(false));
 }, []);
 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 if (problemDescription.trim().length < 5) {
 setError('Deskripsi masalah minimal 5 karakter.');
 return;
 }
 setLoading(true);
 try {
 const res = await fetch('/api/service-requests', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 serviceId: serviceId || undefined,
 problemDescription: problemDescription.trim(),
 serviceType,
 preferredDate: preferredDate || undefined,
 preferredTime: preferredTime || undefined,
 }),
 });
 const data = await res.json();
 if (!res.ok) {
 if (res.status === 401) {
 router.push('/login?callbackUrl=/booking');
 return;
 }
 const msg = data?.error || data?.details ? JSON.stringify(data.details) : 'Gagal membuat booking.';
 setError(typeof msg === 'string' ? msg : 'Gagal membuat booking. Periksa input Anda.');
 return;
 }
 router.push('/requests');
 router.refresh();
 } catch {
 setError('Terjadi gangguan koneksi. Silakan coba lagi.');
 } finally {
 setLoading(false);
 }
 };
 return (
 <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 <Wrench className="w-6 h-6 text-[#dc2626]" />
 Booking Service
 </h1>
 <p className="text-xs text-gray-500 mt-1">Pilih layanan, jelaskan keluhan, dan jadwalkan kunjungan. Admin akan mengonfirmasi estimasi biaya sebelum pengerjaan.</p>
 </div>
 <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Layanan (opsional)</label>
 {servicesLoading ? (
 <div className="text-xs text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Memuat layanan...</div>
 ) : (
 <select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#dc2626]">
 <option value="">General IT Service (tanpa katalog spesifik)</option>
 {services.map((s) => (
 <option key={s.id} value={s.id}>{s.name} — {s.category} — {s.estimatedDuration}</option>
 ))}
 </select>
 )}
 <p className="text-[11px] text-gray-500 mt-1">Jika tidak memilih layanan katalog, request akan dicatat sebagai General IT Service.</p>
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Deskripsi Keluhan <span className="text-red-600">*</span></label>
 <textarea required rows={4} value={problemDescription} onChange={(e) => setProblemDescription(e.target.value)} placeholder="Contoh: Laptop ASUS mati mendadak saat dipakai, kipas berisik, perlu cek hardware dan install ulang..." className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] resize-none" />
 {(selectedServicePrice !== null || autoEstimate) && (
 <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
 <Receipt className="w-4 h-4 text-[#dc2626] mt-0.5 shrink-0" />
 <div className="text-xs leading-relaxed space-y-1">
 {autoEstimate ? (
 <>
 <div><span className="font-semibold text-[#dc2626]">Estimasi umum ({autoEstimate.label}): {formatRupiah(autoEstimate.min)} – {formatRupiah(autoEstimate.max)}</span><span className="text-gray-500"> — {autoEstimate.note}</span></div>
 {selectedServicePrice !== null && <div className="text-gray-500">Harga katalog terpilih: <span className="font-semibold text-gray-900">{formatRupiah(selectedServicePrice)}</span> — harga final dikonfirmasi Admin setelah pengecekan.</div>}
 <div className="text-[11px] text-gray-500">Estimasi dihitung otomatis dari deskripsi keluhan (harga jasa umum, belum termasuk spare part tertentu). Final setelah diagnosa Admin.</div>
 </>
 ) : selectedServicePrice !== null ? (
 <><span className="font-semibold text-[#dc2626]">Estimasi dari katalog: {formatRupiah(selectedServicePrice)}</span><span className="text-gray-500"> — harga final dikonfirmasi Admin setelah pengecekan.</span></>
 ) : null}
 </div>
 </div>
 )}
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tipe Service</label>
 <select value={serviceType} onChange={(e) => setServiceType(e.target.value as typeof serviceType)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#dc2626]">
 <option value="DROP_OFF">DROP_OFF — Antar ke workshop</option>
 <option value="ONSITE">ONSITE — Kunjungan ke lokasi</option>
 <option value="REMOTE">REMOTE — Bantuan jarak jauh</option>
 </select>
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tanggal Preferensi</label>
 <CalendarDropdown value={preferredDate} onChange={setPreferredDate} />
 </div>
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Jam Preferensi</label>
 <input type="text" placeholder="Contoh: 10:00 atau Pagi" value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626]" />
 </div>
 </div>
 {error && (
 <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
 <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
 <span>{error}</span>
 </div>
 )}
 <div className="flex items-center justify-between gap-3 pt-2">
 <Link href="/requests" className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-100 text-gray-900 text-xs font-semibold">Batal</Link>
 <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs shadow-lg shadow-red-500/10 flex items-center gap-2 disabled:opacity-50">
 {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>) : (<><CheckCircle className="w-4 h-4" /> Buat Booking</>)}
 </button>
 </div>
 </form>
 <p className="text-[11px] text-gray-500 text-center">Setelah booking, pantau status di <Link href="/requests" className="text-[#dc2626] hover:underline">Service Saya</Link>. Estimasi biaya awal diambil dari katalog layanan yang dipilih.</p>
 </div>
 );
}
