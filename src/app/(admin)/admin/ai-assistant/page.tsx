'use client';

import { useState } from 'react';
import { Bot, MessageSquare, Sparkles, Loader2, Copy, Check } from 'lucide-react';

export default function AdminAIAssistantPage() {
 const [issueDescription, setIssueDescription] = useState('');
 const [status, setStatus] = useState('IN_PROGRESS');
 const [techNote, setTechNote] = useState('');
 const [loading, setLoading] = useState(false);
 const [draftReply, setDraftReply] = useState('');
 const [copied, setCopied] = useState(false);

 const handleGenerateReply = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!issueDescription.trim()) return;

 setLoading(true);
 setDraftReply('');

 try {
 const res = await fetch('/api/ai/reply', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ issueDescription, status, techNote }),
 });

 const data = await res.json();
 if (res.ok) {
 setDraftReply(data.reply);
 } else {
 setDraftReply(`⚠️ ${data.error || 'Gagal membuat draft balasan AI.'}`);
 }
 } catch (err) {
 setDraftReply('⚠️ Gangguan koneksi ke AI Assistant.');
 } finally {
 setLoading(false);
 }
 };

 const copyToClipboard = () => {
 if (!draftReply) return;
 navigator.clipboard.writeText(draftReply);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 };

 return (
 <div className="max-w-4xl mx-auto space-y-6">
 <div>
 <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
 <Bot className="w-5 h-5 text-[#dc2626]" />
 AI Diagnostic & Customer Draft Reply Assistant
 </h1>
 <p className="text-xs text-gray-500 mt-0.5">
 Asisten kecerdasan buatan untuk membantu Admin menganalisis kerusakan dan menyusun balasan pesan WhatsApp/Email ke customer secara otomatis.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4">
 <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
 <MessageSquare className="w-4 h-4 text-[#dc2626]" />
 Input Data Service Request
 </h2>

 <form onSubmit={handleGenerateReply} className="space-y-4 text-xs">
 <div>
 <label className="block text-gray-700 font-semibold mb-1">Keluhan Customer</label>
 <textarea
 rows={3}
 required
 value={issueDescription}
 onChange={(e) => setIssueDescription(e.target.value)}
 placeholder="Misal: Laptop ASUS ROG cepat panas dan fan mati..."
 className="w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-200 transition-all resize-none"
 />
 </div>

 <div>
 <label className="block text-gray-700 font-semibold mb-1">Status Perbaikan</label>
 <select
 value={status}
 onChange={(e) => setStatus(e.target.value)}
 className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-gray-900 focus:outline-none focus:border-red-200"
 >
 <option value="REQUESTED">Menunggu Antrean</option>
 <option value="CONFIRMED">Terkonfirmasi</option>
 <option value="IN_PROGRESS">Sedang Dikerjakan</option>
 <option value="WAITING_CUSTOMER">Menunggu Customer</option>
 <option value="COMPLETED">Selesai</option>
 <option value="PAID">Lunas</option>
 <option value="CANCELLED">Dibatalkan</option>
 </select>
 </div>

 <div>
 <label className="block text-gray-700 font-semibold mb-1">Catatan Pengerjaan Tambahan</label>
 <input
 type="text"
 value={techNote}
 onChange={(e) => setTechNote(e.target.value)}
 placeholder="Misal: Thermal paste telah diganti, sedang burn-in test 30 menit."
 className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-200"
 />
 </div>

 <button
 type="submit"
 disabled={loading || !issueDescription.trim()}
 className="w-full py-2.5 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
 >
 {loading ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <>
 <Sparkles className="w-4 h-4" />
 <span>Generate Draft Balasan AI</span>
 </>
 )}
 </button>
 </form>
 </div>

 <div className="p-6 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between space-y-4">
 <div>
 <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-3">
 <span className="text-xs font-bold text-gray-900 flex items-center gap-2">
 <Bot className="w-4 h-4 text-[#dc2626]" />
 Draft Respon AI Siap Kirim
 </span>
 {draftReply && (
 <button
 onClick={copyToClipboard}
 className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-100 text-gray-700 text-[10px] font-semibold flex items-center gap-1 transition-colors"
 >
 {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
 {copied ? 'Tersalin!' : 'Salin Pesan'}
 </button>
 )}
 </div>

 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
 <Loader2 className="w-8 h-8 animate-spin text-[#dc2626] mb-2" />
 <p className="text-xs">Menyusun rekomendasi dan balasan ramah...</p>
 </div>
 ) : draftReply ? (
 <div className="p-4 rounded-xl bg-white border border-gray-200 text-xs text-gray-700 whitespace-pre-line leading-relaxed">
 {draftReply}
 </div>
 ) : (
 <p className="text-xs text-gray-500 py-12 text-center">
 Isi form di samping untuk membuat rekomendasi diagnosa & balasan profesional secara otomatis.
 </p>
 )}
 </div>
 </div>
 </div>
 </div>
 );
}
