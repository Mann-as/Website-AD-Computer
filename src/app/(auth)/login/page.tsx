'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Cpu, Lock, Mail, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { sanitizeCallbackUrl } from '@/lib/utils';

function LoginFormContent() {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);

 const router = useRouter();
 const searchParams = useSearchParams();
 const callbackUrl = sanitizeCallbackUrl(searchParams.get('callbackUrl'));

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError('');
 setLoading(true);

 try {
 const res = await fetch('/api/auth/login', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email, password }),
 });

 const data = await res.json();

 if (!res.ok) {
 throw new Error(data.error || 'Gagal login');
 }

 if (data.user.role === 'ADMIN') {
 router.push('/admin');
 } else {
 router.push(callbackUrl);
 }
 router.refresh();
 } catch (err: unknown) {
 setError(err instanceof Error ? err.message : 'Gagal login');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="space-y-8">
 <div className="text-center space-y-2">
 <div className="w-12 h-12 rounded-2xl bg-[#dc2626] flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/10">
 <Cpu className="w-6 h-6" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Selamat Datang Kembali</h2>
 <p className="text-xs text-gray-500">Masuk ke akun AD Computer Anda</p>
 </div>

 {error && (
 <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
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
 <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
 <div className="relative">
 <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
 <input
 type="password"
 required
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••"
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
 <span>Masuk ke Akun</span>
 <ArrowRight className="w-4 h-4" />
 </>
 )}
 </button>
 </form>

 <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
 Belum punya akun?{' '}
 <Link href="/register" className="text-[#dc2626] font-semibold hover:underline">
 Daftar Sekarang
 </Link>
 </div>

 {process.env.NODE_ENV !== 'production' && (
 <div className="p-3 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-500 space-y-1">
 <p className="font-semibold text-gray-700">Akun Demo (development):</p>
 <p>• Admin: <code className="text-[#dc2626]">ahmad@adcomputer.com</code> (password: <code className="text-[#dc2626]">admin123</code>)</p>
 <p>• Customer: <code className="text-[#dc2626]">customer@gmail.com</code> (password: <code className="text-[#dc2626]">user123</code>)</p>
 </div>
 )}
 </div>
 );
}

export default function LoginPage() {
 return (
 <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
 <div className="max-w-md w-full bg-white border border-gray-200 p-8 rounded-2xl shadow-lg">
 <Suspense fallback={
 <div className="flex flex-col items-center justify-center py-12 space-y-3">
 <Loader2 className="w-8 h-8 text-[#dc2626] animate-spin" />
 <p className="text-xs text-gray-500">Memuat halaman login...</p>
 </div>
 }>
 <LoginFormContent />
 </Suspense>
 </div>
 </div>
 );
}
