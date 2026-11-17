import Link from 'next/link';
import { Sidebar } from '@/components/common/Sidebar';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';

export default async function AdminLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 const user = await getCurrentUser();

 if (!user || user.role !== 'ADMIN') {
 redirect('/login?callbackUrl=/admin');
 }

 return (
 <div className="flex min-h-screen bg-white text-gray-900">
 <Sidebar />
 <div className="flex-1 flex flex-col min-w-0">
 <header className="h-16 border-b border-gray-200 bg-white/50 px-6 flex items-center justify-between sticky top-0 z-40">
 <div className="flex items-center gap-2">
 <span className="px-2.5 py-1 rounded-md bg-red-50 text-[#dc2626] border border-red-200 text-xs font-semibold flex items-center gap-1.5">
 <ShieldCheck className="w-3.5 h-3.5" />
 Role: System Administrator
 </span>
 </div>

 <div className="flex items-center gap-3">
 <Link
 href="/admin/profile"
 className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs hover:border-red-200 hover:bg-red-50 transition-colors"
 title="Buka profil admin"
 >
 <div className="w-6 h-6 rounded-full bg-[#dc2626] flex items-center justify-center text-white font-bold text-[10px]">
 {user.name.charAt(0)}
 </div>
 <span className="font-semibold text-gray-900">{user.name}</span>
 </Link>
 </div>
 </header>

 <main className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</main>
 </div>
 </div>
 );
}
