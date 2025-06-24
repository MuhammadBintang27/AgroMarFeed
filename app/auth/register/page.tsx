'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signup } from '@/lib/auth';
import { SignupCredentials } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/footer/Footer';
import { FiEye, FiEyeOff } from 'react-icons/fi'; // 👈 Icon import

export default function RegisterPage() {
  const [credentials, setCredentials] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (credentials.password !== confirmPassword) {
      setError('Password dan konfirmasi tidak cocok');
      return;
    }

    try {
      await signup(credentials);
      router.push('/auth/login');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPasswordStrength = (password: string) => {
    const lengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    const score = [lengthValid, hasUpperCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (score <= 1) return 'Lemah';
    if (score === 2 || score === 3) return 'Sedang';
    return 'Kuat';
  };

  const passwordStrength = getPasswordStrength(credentials.password);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="p-2 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="text-black" width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M15 18L9 12L15 6" />
          </svg>
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 container mx-auto px-4 py-8">
        {/* Left Image */}
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <div className="relative w-full">
            <Image
              src="/images/greeting.png"
              alt="Register Illustration"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-semibold text-black mb-6 text-left">Daftar</h1>

            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

{/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
          <input
            type="text"
            name="name"
            value={credentials.name}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none"
            placeholder="Masukkan nama"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none"
            placeholder="Masukkan email"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none pr-10"
              placeholder="Buat password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {credentials.password && (
            <p className={`text-sm mt-1 ${
              passwordStrength === 'Kuat'
                ? 'text-green-600'
                : passwordStrength === 'Sedang'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              Kekuatan Password: {passwordStrength}
            </p>
          )}
        </div>

        {/* Konfirmasi Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none pr-10"
              placeholder="Ulangi password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-1 text-white font-medium py-3 rounded-[25px] hover:opacity-90 transition"
        >
          Daftar
        </button>
      </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link href="/auth/login" className="text-bg-3 hover:underline font-medium">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
