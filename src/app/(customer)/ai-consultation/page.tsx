'use client';

import { useState } from 'react';
import { Bot, Send, Sparkles, Loader2, Wrench, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';

const deviceOptions = [
 'Laptop ASUS / Lenovo / Acer / HP / Dell / Mac',
 'PC Desktop / Gaming Rig',
 'Server / Workstation',
 'Router / Wi-Fi / Mikrotik Network',
 'Perangkat IT Lainnya',
];

export default function AIConsultationPage() {
 const [deviceType, setDeviceType] = useState(deviceOptions[0]);
 const [issueDescription, setIssueDescription] = useState('');
 const [loading, setLoading] = useState(false);
 const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);

 const handleDiagnose = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!issueDescription.trim()) return;

 setLoading(true);
 setDiagnosisResult(null);

 try {
 const res = await fetch('/api/ai/diagnose', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ deviceType, issueDescription }),
 });

 const data = await res.json();
 if (res.ok) {
 setDiagnosisResult(data.diagnosis);
 } else {
 setDiagnosisResult('⚠️ Gagal mendapatkan diagnosa AI. Silakan coba beberapa saat lagi.');
 }
 } catch (err) {
 setDiagnosisResult('⚠️ Terjadi gangguan koneksi ke server AI Assistant.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
 <div className="text-center space-y-3">
 <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-200 text-[#dc2626] text-xs font-semibold">
 <Bot className="w-4 h-4" />
 <span>AD Computer Smart Assistant</span>
 </div>
 <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
 Konsultasi & Diagnosa Masalah IT Gratis
 </h1>
 <p className="text-gray-500 text-sm max-w-xl mx-auto">
 Jelaskan keluhan perangkat komputer atau jaringan Anda. AI Assistant kami akan memberikan analisis awal dan perkiraan layanan service yang Anda butuhkan.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
 {/* FORM CONSULTATION */}
 <div className="md:col-span-1 bg-white border border-gray-200 p-6 rounded-2xl space-y-5">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <HelpCircle className="w-4 h-4 text-[#dc2626]" />
 Detail Perangkat
 </h2>

 <form onSubmit={handleDiagnose} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Jenis Perangkat
 </label>
 <select
 value={deviceType}
 onChange={(e) => setDeviceType(e.target.value)}
 className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-900 focus:outline-none focus:border-[#dc2626] transition-all"
 >
 {deviceOptions.map((opt) => (
 <option key={opt} value={opt}>
 {opt}
 </option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">
 Jelaskan Keluhan / Gejala
 </label>
 <textarea
 required
 rows={5}
 value={issueDescription}
 onChange={(e) => setIssueDescription(e.target.value)}
 placeholder="Contoh: Laptop mati sendiri setelah 10 menit dipake, fan berisik dan bagian keyboard sangat panas..."
 className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-500 transition-all resize-none"
 />
 </div>

 <button
 type="submit"
 disabled={loading || !issueDescription.trim()}
 className="w-full py-3 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {loading ? (
 <>
 <Loader2 className="w-4 h-4 animate-spin" />
 <span>Menganalisis Gejala...</span>
 </>
 ) : (
 <>
 <Sparkles className="w-4 h-4" />
 <span>Analisis Masalah Sekarang</span>
 </>
 )}
 </button>
 </form>
 </div>

 {/* DIAGNOSIS RESULTS DISPLAY */}
 <div className="md:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl min-h-[380px] flex flex-col justify-between">
 <div>
 <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
 <div className="flex items-center gap-2">
 <Bot className="w-5 h-5 text-[#dc2626]" />
 <span className="font-bold text-sm text-gray-900">Hasil Analisis & Diagnosa AI</span>
 </div>
 {diagnosisResult && (
 <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold flex items-center gap-1">
 <CheckCircle className="w-3 h-3" /> Ready
 </span>
 )}
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-16 space-y-4 text-center">
 <Loader2 className="w-10 h-10 text-[#dc2626] animate-spin" />
 <p className="text-xs text-gray-500">
 AI sedang memproses gejala hardware/software perangkat Anda...
 </p>
 </div>
 ) : diagnosisResult ? (
 <div className="space-y-4 text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-5 rounded-xl border border-gray-200">
 {diagnosisResult}
 </div>
 ) : (
 <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
 <Bot className="w-6 h-6" />
 </div>
 <p className="text-xs text-gray-500 max-w-xs">
 Isi formulir di sebelah kiri dan klik <strong>Analisis Masalah Sekarang</strong> untuk melihat hasil diagnosis kecerdasan buatan.
 </p>
 </div>
 )}
 </div>

 {diagnosisResult && (
 <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
 <span className="text-xs text-gray-500">
 Apakah Anda ingin menjadwalkan perbaikan oleh Tim Profesional kami?
 </span>
 <Link
 href="/booking"
 className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs shadow-lg shadow-red-500/10 transition-all flex items-center justify-center gap-2 shrink-0"
 >
 <Wrench className="w-4 h-4" />
 Booking Service
 </Link>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
