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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'your-domain.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'agromarfeed-backend.vercel.app',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  // Add experimental features for better OAuth support
  experimental: {
    serverComponentsExternalPackages: ['passport'],
  },
  // Add headers for better mobile and OAuth support
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
