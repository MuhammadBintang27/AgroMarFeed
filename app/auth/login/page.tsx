"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, initiateGoogleLogin, initiateGitHubLogin } from "@/lib/auth";
import { AuthCredentials } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer/Footer";

export default function LoginPage() {
  const [credentials, setCredentials] = useState<AuthCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await login(credentials);
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Back Button (tidak mengganggu gambar) */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className=" p-2 rounded-full transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="text-black"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          >
            <path d="M15 18L9 12L15 6" />
          </svg>
        </Link>
      </div>

      {/* Main Container */}
      <div className="flex flex-1 container mx-auto px-4 py-8">
        {/* Left Image (Full width, height menyesuaikan agar gambar tidak terpotong) */}
        <div className="w-1/2 hidden md:flex items-center justify-center">
          <div className="relative w-full">
            <Image
              src="/images/greeting.png"
              alt="Greeting"
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
            <h1 className="text-3xl font-semibold text-black mb-6">Masuk</h1>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-1 text-white font-medium py-3 rounded-[25] hover:opacity-90 transition"
              >
                Masuk
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                onClick={initiateGoogleLogin}
                className="w-full bg-white text-black border border-gray-300 font-medium py-3 rounded-[25px] flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              >
                <Image
                  src="/images/icons/google.png"
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
                Masuk dengan Google
              </button>
              <button
                onClick={initiateGitHubLogin}
                className="w-full bg-white text-black border border-gray-300 font-medium py-3 rounded-[25px] flex items-center justify-center gap-2 hover:bg-gray-50 transition"
              >
                <Image
                  src="/images/icons/github.png"
                  alt="GitHub Logo"
                  width={20}
                  height={20}
                />
                Masuk dengan GitHub
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/auth/register"
                className="text-bg-3 hover:underline font-medium"
              >
                Daftar
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


