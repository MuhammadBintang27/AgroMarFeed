'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');

  const handleTryAgain = () => {
    if (orderId) {
      router.push(`/pembayaran?order_id=${orderId}`);
    } else {
      router.push('/keranjang');
    }
  };

  const handleBackToCart = () => {
    router.push('/keranjang');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pembayaran Gagal
          </h1>

          <p className="text-gray-600 mb-6">
            Maaf, pembayaran Anda tidak dapat diproses. Silakan coba lagi atau pilih metode pembayaran lain.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleTryAgain}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Coba Lagi
            </button>

            <button
              onClick={handleBackToCart}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Kembali ke Keranjang
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Jika masalah berlanjut, silakan hubungi customer service kami.
          </p>
        </div>
      </div>
    </div>
  );
} 