import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { User } from 'lucide-react';
import ProfileForm from '@/components/profile/ProfileForm';

export const revalidate = 0;

export default async function AdminProfilePage() {
  const session = await getCurrentUser();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?callbackUrl=/admin/profile');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { customerProfile: true },
  });

  if (!user) redirect('/login?callbackUrl=/admin/profile');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="pb-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-[#dc2626]" />
          Profil Admin
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola data kontak dan informasi akun administrator Anda.
        </p>
      </div>

      <ProfileForm
        initial={{
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.customerProfile?.address || '',
          city: user.customerProfile?.city || '',
          notes: user.customerProfile?.notes || '',
          telegramChatId: user.telegramChatId || '',
        }}
      />
    </div>
  );
}
