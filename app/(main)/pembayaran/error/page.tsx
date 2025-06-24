'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function PaymentErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('order_id');
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetry = 15; // 15x2 detik = 30 detik
  const retryTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) throw new Error('Order tidak ditemukan');
      const data = await res.json();
      setOrder(data);
      // Jika data belum ada, retry
      if (!data.status && !data.payment_status && retryCount < maxRetry) {
        retryTimeout.current = setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } catch (err: any) {
      setFetchError(err.message);
      if (retryCount < maxRetry) {
        retryTimeout.current = setTimeout(() => setRetryCount(c => c + 1), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId && retryCount < maxRetry && (!order || (!order.status && !order.payment_status))) {
      fetchOrder();
    }
    return () => {
      if (retryTimeout.current) clearTimeout(retryTimeout.current);
    };
    // eslint-disable-next-line
  }, [orderId, retryCount]);

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

          {loading || (retryCount > 0 && retryCount < maxRetry && (!order || (!order.status && !order.payment_status))) ? (
            <p className="text-blue-600 mb-4">Sedang memproses pesanan Anda, mohon tunggu beberapa detik...</p>
          ) : fetchError ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Terjadi Kesalahan</h1>
              <p className="text-gray-600 mb-6">{fetchError}</p>
            </>
          ) : order ? (
            order.payment_status === 'pending' || order.status === 'pending' || (!order.status && !order.payment_status) ? (
              <>
                <h1 className="text-2xl font-bold text-yellow-700 mb-4">Pesanan Berhasil Dibuat</h1>
                <p className="text-gray-600 mb-6">Pesanan Anda berhasil dibuat dan menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                  <p className="text-sm text-gray-600">Status pesanan: {order.status || order.statusPesanan || order.order_status || 'Belum dibayar'}, pembayaran: {order.payment_status || order.paymentStatus || 'Belum dibayar'}</p>
                </div>
              </>
            ) : order.payment_status === 'failed' || order.status === 'cancelled' ? (
              <>
                <h1 className="text-2xl font-bold text-red-600 mb-4">Pembayaran Gagal / Dibatalkan</h1>
                <p className="text-gray-600 mb-6">Pembayaran Anda gagal atau dibatalkan. Silakan lakukan pemesanan ulang.</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                  <p className="text-sm text-gray-600">Status pesanan: {order.status || order.statusPesanan || order.order_status || 'Tidak ditemukan'}, pembayaran: {order.payment_status || order.paymentStatus || 'Tidak ditemukan'}</p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-green-700 mb-4">Status Pesanan</h1>
                <p className="text-gray-600 mb-6">Status pesanan: {order.status || order.statusPesanan || order.order_status || 'Belum dibayar'}, pembayaran: {order.payment_status || order.paymentStatus || 'Belum dibayar'}</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                </div>
              </>
            )
          ) : (
            <>
              <h1 className="text-2xl font-bold text-yellow-700 mb-4">Pesanan Berhasil Dibuat</h1>
              <p className="text-gray-600 mb-6">Pesanan Anda berhasil dibuat dan menunggu pembayaran. Silakan selesaikan pembayaran sesuai instruksi.</p>
              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600">Order ID: {orderId}</p>
                </div>
              )}
            </>
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