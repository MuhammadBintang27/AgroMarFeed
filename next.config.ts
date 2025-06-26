import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Abaikan error ESLint saat build (di Vercel juga)
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Abaikan error TypeScript saat build
  },
  // Konfigurasi lain jika ada
  images: {
    domains: ['your-domain.com'], // ✅ kalau pakai next/image
  },
};

export default nextConfig;
