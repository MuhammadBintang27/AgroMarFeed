'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

// Define order type
interface OrderDetails {
  _id: string;
  orderId: string;
  total_bayar: number;
  status: string;
  payment_status: string;
  shipping_address: {
    nama: string;
    alamat: string;
    kota: string;
  };
  order_item: Array<{
    product_id: {
      name: string;
      price: number;
    };
    jumlah: number;
    subtotal: number;
  }>;
  createdAt: string;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      // Fetch order details
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Order details response:', data);
        
        // Handle both response formats
        if (data.success && data.order) {
          setOrderDetails(data.order);
        } else if (data.order) {
          setOrderDetails(data.order);
        } else {
          console.error('Unexpected response format:', data);
        }
      } else {
        console.error('Failed to fetch order details:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    router.push('/katalog');
  };

  const handleViewOrders = () => {
    router.push('/riwayatBelanja');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memproses pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Pembayaran Berhasil!
          </h1>

          <p className="text-gray-600 mb-6">
            Terima kasih telah berbelanja di AgroMarFeed. Pesanan Anda telah berhasil diproses.
          </p>

          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Detail Pesanan:</h3>
              <p className="text-sm text-gray-600">Order ID: {orderDetails.orderId}</p>
              <p className="text-sm text-gray-600">Total: Rp {orderDetails.total_bayar?.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Status: {orderDetails.status}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleContinueShopping}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Lanjutkan Belanja
            </button>

            <button
              onClick={handleViewOrders}
              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
            >
              Lihat Pesanan Saya
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Email konfirmasi telah dikirim ke {user?.email || 'email Anda'}
          </p>
        </div>
      </div>
    </div>
  );
} 