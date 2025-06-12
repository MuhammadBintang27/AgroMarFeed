// app/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/lib/auth';
import { User } from '@/types';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user ?? null); // Convert undefined to null
      } catch (err: any) {
        setError('Not authenticated');
        router.push('/login');
      }
    };
    fetchUser();
  }, [router]);

  const handleLogout = async () => {
  try {
    await logout();
    console.log('Logout API call successful');
    setUser(null);
    router.push('/auth/login');
  } catch (err: any) {
    console.error('Logout failed:', err);
    setError('Logout failed');
  }
};

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p className="mb-4">Welcome, {user.name}!</p>
        <p className="mb-4">Email: {user.email}</p>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}