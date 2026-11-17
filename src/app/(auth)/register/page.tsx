'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Cpu, Lock, Mail, User, Phone, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

export default function RegisterPage() {
 const [name, setName] = useState('');
 const [email, setEmail] = useState('');
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);

 try {
 const res = await fetch('/api/auth/register', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ name, email, phone, password }),
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.error || 'Gagal registrasi akun');
 }

 router.push('/requests');
 router.refresh();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : 'Gagal registrasi akun');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
 <div className="max-w-md w-full space-y-8 bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
 <div className="text-center space-y-2">
 <div className="w-12 h-12 rounded-2xl bg-[#dc2626] flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/10">
 <Cpu className="w-6 h-6" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Buat Akun Customer Baru</h2>
 <p className="text-xs text-gray-500">Dapatkan layanan service komputer cepat & AI Diagnosis</p>
 </div>

 {error && (
 <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nama Lengkap</label>
 <div className="relative">
 <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
 <input
 type="text"
 required
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Budi Pratama"
 className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-500 transition-all"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
 <div className="relative">
 <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
 <input
 type="email"
 required
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="nama@email.com"
 className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-500 transition-all"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nomor WhatsApp / HP</label>
 <div className="relative">
 <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
 <input
 type="text"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="081234567890"
 className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-500 transition-all"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
 <div className="relative">
 <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Minimal 6 karakter"
 className="w-full bg-white border border-gray-200 rounded-xl px-10 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#dc2626] focus:ring-1 focus:ring-red-500 transition-all"
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="w-full mt-2 py-3 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
 >
 {loading ? (
 <Loader2 className="w-4 h-4 animate-spin" />
 ) : (
 <>
 <span>Daftar Akun</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>

 <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
 Sudah punya akun?{' '}
 <Link href="/login" className="text-[#dc2626] font-semibold hover:underline">
 Masuk Sekarang
 </Link>
 </div>
 </div>
 </div>
 );
}
