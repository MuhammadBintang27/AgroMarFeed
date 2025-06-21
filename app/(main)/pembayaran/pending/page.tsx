'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');

  const handleCheckStatus = () => {
    if (orderId) {
      router.push(`/riwayatBelanja?order_id=${orderId}`);
    } else {
      router.push('/riwayatBelanja');
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Pending Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pembayaran Pending
          </h1>

          <p className="text-gray-600 mb-6">
            Pembayaran Anda sedang diproses. Silakan selesaikan pembayaran sesuai instruksi yang diberikan.
          </p>

          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
              <p className="text-sm text-gray-600 mt-2">
                Simpan Order ID ini untuk melacak status pembayaran Anda.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Cek Status Pembayaran
            </button>

            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Kembali ke Beranda
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pembayaran akan diproses dalam 1x24 jam</li>
              <li>• Pastikan pembayaran sesuai dengan nominal yang tertera</li>
              <li>• Simpan bukti pembayaran Anda</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 