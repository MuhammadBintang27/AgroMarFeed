'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { User } from '@/types';
import Image from 'next/image';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user ?? null);
      } catch (err: any) {
        setError('Not authenticated');
        router.push('/auth/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Logout failed:', err);
      setError('Logout failed');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <section className="bg-white w-full text-black py-20 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* Sidebar kiri */}
        <div className="w-full lg:w-[30%]">
          {/* Info User */}
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
              <Image src="/default-user.png" alt="User" width={48} height={48} />
            </div>
            <div className="ml-4">
              <p className="font-semibold text-black">{user.name}</p>
              <p className="text-sm text-black">{user.email}</p>
            </div>
          </div>

          {/* Navigasi */}
          <nav className="flex flex-col gap-2">
            <div>
              <p className="font-semibold text-black">Akun Saya</p>
              <div className="ml-4 mt-1 flex flex-col gap-1 text-sm">
                <button className="text-left text-black hover:underline">Profil</button>
                <button className="text-left text-black hover:underline">Ubah Kata Sandi</button>
                <button className="text-left text-black hover:underline">Pengaturan Notifikasi</button>
                <button className="text-left text-black hover:underline">Pengaturan Privasi</button>
              </div>
            </div>

            <button className="mt-4 font-semibold text-left text-black hover:underline">Pesanan Saya</button>
            <button className="font-semibold text-left text-black hover:underline">Riwayat Pemesanan</button>
            <button
              onClick={handleLogout}
              className="font-semibold text-left text-black hover:underline"
            >
              Keluar
            </button>
          </nav>
        </div>

        {/* Konten kanan */}
        <div className="w-full lg:w-[70%]">
          {/* Kosong dulu */}
        </div>
      </div>
    </section>
  );
}
