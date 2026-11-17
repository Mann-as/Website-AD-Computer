'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
 LayoutDashboard,
 Users,
 UserCheck,
 Wrench,
 FileText,
 CreditCard,
 BarChart3,
 Bot,
 LogOut,
  Cpu,
  ArrowLeft,
  UserCircle,
} from 'lucide-react';

const adminMenu = [
 { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
 { name: 'Service Requests', href: '/admin/requests', icon: FileText },
 { name: 'Katalog Layanan', href: '/admin/services', icon: Wrench },
 { name: 'Manajemen Customer', href: '/admin/customers', icon: Users },
 { name: 'Manajemen Teknisi', href: '/admin/technicians', icon: UserCheck },
 { name: 'Pembayaran', href: '/admin/payments', icon: CreditCard },
 { name: 'AI Diagnostic Assistant', href: '/admin/ai-assistant', icon: Bot },
{ name: 'Laporan Bisnis', href: '/admin/reports', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Cpu },
  { name: 'Profil Admin', href: '/admin/profile', icon: UserCircle },
];

export function Sidebar() {
 const pathname = usePathname();
 const router = useRouter();

 const handleLogout = async () => {
 await fetch('/api/auth/logout', { method: 'POST' });
 router.push('/login');
 router.refresh();
 };

 return (
 <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen sticky top-0 text-gray-700">
 <div>
 <div className="p-5 border-b border-gray-200 flex items-center justify-between">
 <Link href="/admin" className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-lg bg-[#dc2626] flex items-center justify-center text-white font-bold shadow-md shadow-red-500/10">
 <Cpu className="w-4 h-4" />
 </div>
 <div>
 <span className="font-bold text-sm text-gray-900 tracking-wide">
 Admin <span className="text-[#dc2626]">Portal</span>
 </span>
 <span className="block text-[10px] text-gray-500">AD Computer Console</span>
 </div>
 </Link>
 </div>

 <nav className="p-3 space-y-1">
 {adminMenu.map((item) => {
 const Icon = item.icon;
 const isActive = pathname === item.href;
 return (
 <Link
 key={item.href}
 href={item.href}
 className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
 isActive
 ? 'bg-red-50 text-[#dc2626] border border-red-200 font-semibold'
 : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
 }`}
 >
 <Icon className={`w-4 h-4 ${isActive ? 'text-[#dc2626]' : 'text-gray-500'}`} />
 {item.name}
 </Link>
 );
 })}
 </nav>
 </div>

 <div className="p-3 border-t border-gray-200 space-y-1">
 <Link
 href="/"
 className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
 >
 <ArrowLeft className="w-4 h-4" />
 Lihat Landing Page
 </Link>
 <button
 onClick={handleLogout}
 className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
 >
 <LogOut className="w-4 h-4" />
 Logout Admin
 </button>
 </div>
 </aside>
 );
}
