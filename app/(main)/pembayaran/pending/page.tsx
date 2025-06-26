'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

interface Order {
  orderId: string;
  total: number;
  status: string;
  payment_status: string;
  items: unknown[];
  customerDetails: unknown;
  shippingDetails: unknown;
  snap_redirect_url?: string;
  redirect_url?: string;
}

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order_id');

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      if (!response.ok) {
        throw new Error('Order tidak ditemukan');
      }
      
      const data = await response.json();
      setOrder(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check payment status
  const handleCheckStatus = async () => {
    if (!orderId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch latest order status
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      
      if (!response.ok) {
        throw new Error('Order tidak ditemukan');
      }
      
      const data = await response.json();
      setOrder(data);
      
      // If payment is completed, redirect to success page
      if (data.payment_status === 'paid' || data.status === 'processing') {
        router.push(`/pembayaran/success?order_id=${orderId}`);
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      console.error('Error checking status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToOrders = () => {
    router.push('/riwayatBelanja');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Fetch order details on component mount
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

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
            Menunggu Pembayaran
          </h1>

          <p className="text-gray-600 mb-6">
            Silakan selesaikan pembayaran Anda sesuai instruksi berikut:
          </p>

          {loading && (
            <div className="mb-6">
              <p className="text-blue-600">Memuat data...</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {order && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 mb-2">Order ID: {order.orderId}</p>
              <p className="text-sm text-gray-600 mb-2">
                Total: Rp {order.total?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Status: <span className="font-medium text-yellow-600">{order.status}</span>
              </p>
              <p className="text-sm text-gray-600">
                Pembayaran: <span className="font-medium text-yellow-600">{order.payment_status}</span>
              </p>
            </div>
          )}

          {orderId && !order && !loading && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Order ID: {orderId}</p>
              <p className="text-sm text-gray-600 mt-2">
                Silakan cek email Anda atau klik tombol di bawah untuk melihat instruksi pembayaran di Midtrans.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckStatus}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400"
            >
              {loading ? 'Memuat...' : 'Refresh Status Pembayaran'}
            </button>

            <button
              onClick={handleBackToOrders}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Kembali ke Riwayat Pesanan
            </button>

            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-100 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Kembali ke Beranda
            </button>
          </div>

          {/* Tombol Bayar Sekarang di bawah tombol lain */}
          {order && order.status === 'pending' && order.snap_redirect_url && (
            <div className="mt-6">
              <button
                onClick={() => window.location.href = order.snap_redirect_url ?? ''}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Bayar Sekarang di Midtrans
              </button>
              <p className="text-xs text-gray-500 mt-2">Klik tombol ini untuk kembali ke halaman pembayaran Midtrans jika Anda belum menyelesaikan pembayaran.</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Informasi Penting:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Pembayaran akan diproses dalam 1x24 jam</li>
              <li>• Pastikan Anda menyelesaikan pembayaran sesuai instruksi</li>
              <li>• Jika pembayaran gagal, Anda dapat mencoba lagi</li>
              <li>• Hubungi customer service jika mengalami masalah</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
} 