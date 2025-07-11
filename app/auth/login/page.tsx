"use client";
import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login, initiateGoogleLogin } from "@/lib/auth";
import { AuthCredentials } from "@/types";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/footer/Footer";
import { useUser } from "@/contexts/UserContext";
import { FiEye, FiEyeOff } from "react-icons/fi"; // 👈 Icon import

export default function LoginPage() {
  const [credentials, setCredentials] = useState<AuthCredentials>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { refetch } = useUser();

  // Check for OAuth errors on page load using window.location instead of useSearchParams
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const oauthError = urlParams.get("error");
      if (oauthError === "oauth_failed") {
        setError(
          "OAuth login failed. Please try again or use email/password login."
        );
        // Clean up the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("error");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("🔍 Login form submitted with:", {
        email: credentials.email,
        password: credentials.password ? "[HIDDEN]" : "missing",
      });

      const response = await login(credentials);
      console.log("✅ Login response:", response);

      // Immediately refetch user data to update the UI
      console.log("🔄 Refetching user data...");
      await refetch();

      // Add a small delay to ensure UserContext is updated
      setTimeout(() => {
        console.log("✅ Redirecting to home page...");
        router.push("/");
      }, 500);
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setError("");
    initiateGoogleLogin();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <svg
      className="w-5 h-5 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

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
                  disabled={loading}
                  className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={credentials.password}
                    onChange={handleInputChange}
                    disabled={loading}
                    className="w-full p-3 bg-gray-100 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-bg-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    placeholder="Enter your password"
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
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full font-medium py-3 rounded-[25px] transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-1 text-white hover:opacity-90"
                }`}
              >
                {loading ? (
                  <>
                    <LoadingSpinner />
                    <span>Memproses Login...</span>
                  </>
                ) : (
                  "Masuk"
                )}
              </button>
            </form>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className={`w-full bg-white text-black border border-gray-300 font-medium py-3 rounded-[25px] flex items-center justify-center gap-2 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                }`}
              >
                <Image
                  src="/images/icons/google.png"
                  alt="Google Logo"
                  width={24}
                  height={24}
                />
                {loading ? "Memproses..." : "Masuk dengan Google"}
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
