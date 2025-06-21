"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import InformativeFooter from "@/components/footer/detilInformasi";
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface Product {
  name: string;
  besaran: string;
  quantity: number;
}

interface HistoryItem {
  id: string;
  date: string;
  products: Product[];
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
}

interface Order {
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
      image?: string;
    };
    jumlah: number;
    subtotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/orders/user/${user?._id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Dibayar';
      case 'processing':
        return 'Diproses';
      case 'pending':
        return 'Menunggu Pembayaran';
      case 'cancelled':
        return 'Dibatalkan';
      case 'failed':
        return 'Gagal';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(selectedOrder?._id === order._id ? null : order);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat riwayat pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Pesanan</h1>
          <p className="text-gray-600">Lihat semua pesanan Anda</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pesanan</h3>
            <p className="text-gray-600 mb-6">Mulai berbelanja untuk melihat riwayat pesanan Anda</p>
            <button
              onClick={() => router.push('/katalog')}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.orderId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.shipping_address.nama} - {order.shipping_address.alamat}, {order.shipping_address.kota}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        Rp {order.total_bayar.toLocaleString()}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(order.payment_status)}`}>
                        {getStatusText(order.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="space-y-4">
                    {order.order_item.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          {item.product_id.image ? (
                            <img
                              src={item.product_id.image}
                              alt={item.product_id.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product_id.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.jumlah} x Rp {item.product_id.price.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Rp {item.subtotal.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>Status: <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span></p>
                      </div>
                      <div className="space-x-3">
                        <button
                          onClick={() => handleOrderClick(order)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {selectedOrder?._id === order._id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                        </button>
                        {order.payment_status === 'pending' && (
                          <button
                            onClick={() => router.push(`/pembayaran?order_id=${order.orderId}`)}
                            className="text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200"
                          >
                            Bayar Sekarang
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedOrder?._id === order._id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4">Detail Pesanan</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Order ID:</p>
                          <p className="font-medium">{order.orderId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tanggal Pesanan:</p>
                          <p className="font-medium">{formatDate(order.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status Pembayaran:</p>
                          <p className="font-medium">{getStatusText(order.payment_status)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status Pesanan:</p>
                          <p className="font-medium">{getStatusText(order.status)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-gray-600">Alamat Pengiriman:</p>
                          <p className="font-medium">
                            {order.shipping_address.nama}<br />
                            {order.shipping_address.alamat}<br />
                            {order.shipping_address.kota}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

