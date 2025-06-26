"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { fetchProducts } from "@/lib/api/fetchProducts";
import { Star, Eye, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

interface Store {
  _id: string;
  nama_toko: string;
  deskripsi: string;
  email: string;
  nomor_hp: string;
  rating?: number;
  verified?: boolean;
  online?: boolean;
  alamat?: {
    kabupaten?: string;
  };
}

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface StoreOrder {
  _id: string;
  orderId: string;
  total_bayar: number;
  status: string;
  payment_status: string;
  shipping_address: {
    nama: string;
    alamat: string;
    kota: string;
    telepon: string;
  };
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  order_item: Array<{
    product_id: {
      _id: string;
      name: string;
      price: number;
      imageUrl?: string;
    };
    jumlah: number;
    subtotal: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

const tabList = [
  { label: "Riwayat Pesanan", key: "pesanan" },
  { label: "Produk", key: "produk" },
  { label: "Keuangan", key: "keuangan" },
];
const subTabList = [
  { label: "Produk Saya", key: "produkSaya" },
  { label: "Habis", key: "habis" },
  { label: "Sedang Diperiksa", key: "diperiksa" },
  { label: "Arsip", key: "arsip" },
];

export default function TokoSayaPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { user } = useUser();
  const userId = user?._id || null;
  const [activeTab, setActiveTab] = useState("produk");
  const [activeSubTab, setActiveSubTab] = useState("produkSaya");
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);

  // Financial statistics
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalPending: 0,
    totalCancelled: 0,
    totalOrders: 0,
    paidOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0
  });

  useEffect(() => {
    console.log("[TOKO SAYA] userId:", userId);
    if (!userId) return;
    setLoading(true);
    fetch(`/api/stores?user_id=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(async (data) => {
        setStore(data);
        if (data && data._id) {
          const prods = await fetchProducts(data._id);
          setProducts(prods);
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (activeTab === "pesanan" && store?._id) {
      fetchStoreOrders();
    }
  }, [activeTab, store?._id]);

  useEffect(() => {
    if (activeTab === "keuangan" && orders.length > 0) {
      calculateFinancialStats();
    }
  }, [activeTab, orders]);

  const fetchStoreOrders = async () => {
    if (!store?._id) return;
    
    setOrdersLoading(true);
    try {
      const response = await fetch(`/api/orders/store/${store._id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true"
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching store orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const calculateFinancialStats = () => {
    const stats = {
      totalRevenue: 0,
      totalPaid: 0,
      totalPending: 0,
      totalCancelled: 0,
      totalOrders: orders.length,
      paidOrders: 0,
      pendingOrders: 0,
      cancelledOrders: 0
    };

    orders.forEach(order => {
      const orderTotal = order.total_bayar;
      
      // Count by payment status
      if (order.payment_status === 'paid') {
        stats.totalPaid += orderTotal;
        stats.paidOrders += 1;
      } else if (order.payment_status === 'pending') {
        stats.totalPending += orderTotal;
        stats.pendingOrders += 1;
      } else if (order.payment_status === 'cancelled' || order.payment_status === 'failed') {
        stats.totalCancelled += orderTotal;
        stats.cancelledOrders += 1;
      }

      // Total revenue includes all orders regardless of status
      stats.totalRevenue += orderTotal;
    });

    setFinancialStats(stats);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        alert('Gagal menghapus produk');
      }
    } catch (e) {
      alert('Gagal menghapus produk');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
      case 'shipped':
      case 'delivered':
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
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Diterima';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
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

  const handleOrderClick = (order: StoreOrder) => {
    setSelectedOrder(selectedOrder?._id === order._id ? null : order);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          store_id: store?._id
        }),
      });

      if (response.ok) {
        // Update the order in local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        alert('Status pesanan berhasil diupdate!');
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal mengupdate status pesanan');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  const canUpdateStatus = (order: StoreOrder) => {
    // Allow update if paid and not delivered/cancelled/failed
    return order.payment_status === 'paid' &&
      !['delivered', 'cancelled', 'failed'].includes(order.status);
  };

  const getNextStatus = (currentStatus: string) => {
    // Langsung ke delivered jika sudah paid dan belum delivered
    return 'delivered';
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7F7F7] py-8 px-2 md:px-0">
      <div className="max-w-5xl mx-auto">
        {store ? (
          <>
            {/* Header Card Toko */}
            <div className="bg-[#39381F] rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-8 shadow-lg relative">
              <div className="flex items-center gap-5">
                <img src="/images/home/avatar.png" alt="Toko" className="w-20 h-20 rounded-full border-4 border-white object-cover" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white text-xl font-bold">{store.nama_toko}</span>
                    {/* Rating jika ada */}
                    {typeof store.rating === 'number' && (
                      <span className="flex items-center gap-1 bg-yellow-400 text-[#39381F] px-2 py-0.5 rounded-full text-sm font-semibold">
                        <Star className="w-4 h-4" fill="#FFD700" /> {store.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {/* Badge jika ada, misal: store.verified, store.online */}
                  <div className="flex flex-wrap gap-2 mb-1">
                    {store.verified && <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-semibold">Verified</span>}
                    {store.online && <span className="bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full text-xs font-semibold">Online</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-white/80">
                    <span>Total produk: {products.length}</span>
                    {store.alamat?.kabupaten && <><span>•</span><span>Lokasi: {store.alamat.kabupaten}</span></>}
                  </div>
                </div>
              </div>
              <button className="absolute top-6 right-6 md:static bg-yellow-400 text-[#39381F] px-4 py-2 rounded-lg font-bold shadow hover:bg-yellow-500 transition">Kunjungi Toko</button>
            </div>
            {/* Tab Navigasi */}
            <div className="flex gap-2 mb-6">
              {tabList.map((tab) => (
                <button
                  key={tab.key}
                  className={`px-6 py-2 rounded-full font-semibold text-base transition border ${activeTab === tab.key ? "bg-yellow-400 text-[#39381F] border-yellow-400" : "bg-white text-gray-700 border-gray-200 hover:bg-yellow-50"}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Riwayat Pesanan Tab */}
            {activeTab === "pesanan" && (
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Riwayat Pesanan Toko</h2>
                  <button
                    onClick={fetchStoreOrders}
                    disabled={ordersLoading}
                    className="bg-yellow-400 text-[#39381F] px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200 disabled:bg-gray-400 flex items-center gap-2 font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {ordersLoading ? 'Memuat...' : 'Refresh'}
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat riwayat pesanan...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada pesanan</h3>
                    <p className="text-gray-600 mb-6">Pesanan dari produk Anda akan muncul di sini</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        {/* Order Header */}
                        <div className="p-6 border-b border-gray-200 bg-white">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                Order #{order.orderId}
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {formatDate(order.createdAt)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-medium text-gray-700">Pembeli:</span>
                                <span className="text-sm text-gray-900">{order.user_id.name}</span>
                                <span className="text-gray-400">•</span>
                                <span className="text-sm text-gray-600">{order.user_id.email}</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                📍 {order.shipping_address.nama} - {order.shipping_address.alamat}, {order.shipping_address.kota}
                              </p>
                              <p className="text-sm text-gray-600">
                                📞 {order.shipping_address.telepon}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                Rp {order.total_bayar.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-2 mt-2 justify-end">
                                {getStatusIcon(order.payment_status)}
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                  {getStatusText(order.payment_status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {order.order_item.map((item, index) => (
                              <div key={index} className="flex items-center space-x-4 bg-white p-4 rounded-lg border">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                  {item.product_id.imageUrl ? (
                                    <img
                                      src={item.product_id.imageUrl}
                                      alt={item.product_id.name}
                                      className="w-full h-full object-cover rounded-lg"
                                    />
                                  ) : (
                                    <Package className="w-8 h-8 text-gray-400" />
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
                                <p>Status Pesanan: <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {getStatusText(order.status)}
                                </span></p>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleOrderClick(order)}
                                  className="text-sm text-yellow-600 hover:text-yellow-800 font-medium flex items-center gap-1"
                                >
                                  <Eye className="w-4 h-4" />
                                  {selectedOrder?._id === order._id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                                </button>
                                
                                {/* Status Update Button */}
                                {canUpdateStatus(order) && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Yakin ingin menandai pesanan ini sebagai selesai?')) {
                                        updateOrderStatus(order._id, 'delivered');
                                      }
                                    }}
                                    className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition font-medium flex items-center gap-1"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                    </svg>
                                    Tandai Selesai
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Details */}
                          {selectedOrder?._id === order._id && (
                            <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
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
                                  <p className="text-gray-600">Info Pembeli:</p>
                                  <p className="font-medium">
                                    {order.user_id.name}<br />
                                    {order.user_id.email}
                                  </p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-gray-600">Alamat Pengiriman:</p>
                                  <p className="font-medium">
                                    {order.shipping_address.nama}<br />
                                    {order.shipping_address.alamat}<br />
                                    {order.shipping_address.kota}<br />
                                    📞 {order.shipping_address.telepon}
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
            )}

            {/* Produk Tab */}
            {activeTab === "produk" && (
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex gap-4 mb-6 border-b pb-2">
                  {subTabList.map((tab) => (
                    <button
                      key={tab.key}
                      className={`text-base font-semibold pb-1 border-b-2 transition ${activeSubTab === tab.key ? "border-yellow-400 text-yellow-600" : "border-transparent text-gray-400 hover:text-yellow-600"}`}
                      onClick={() => setActiveSubTab(tab.key)}
                    >
                      {tab.label} (0)
                    </button>
                  ))}
                </div>
                {/* List Produk */}
                {products.length === 0 ? (
                  <div className="flex flex-col items-center py-20 text-gray-500">
                    <img src="/images/cart/keranjangKosong.png" alt="Kosong" className="w-32 h-32 mb-4 opacity-80" />
                    <p className="mb-4 text-lg">Belum ada Produk</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                      <div key={product._id} className="bg-[#F6F6F6] rounded-xl shadow p-4 flex flex-col gap-2 items-center border border-gray-200">
                        <img src={product.imageUrl || "/images/home/logo.png"} alt={product.name} className="w-24 h-24 object-cover rounded-lg border mb-2" />
                        <div className="text-center w-full">
                          <div className="font-bold text-lg text-gray-800 mb-1 truncate" title={product.name}>{product.name}</div>
                          <div className="text-yellow-700 font-bold text-base mb-1">Rp{product.price.toLocaleString()}</div>
                          <div className="flex justify-center gap-2 text-xs text-gray-500 mb-2">
                            <span>Stok: 2</span>
                            <span>|</span>
                            <span>Terjual: 1</span>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full justify-center mt-auto">
                          <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded font-semibold text-sm transition">Arsipkan</button>
                          <button
                            className="bg-yellow-400 hover:bg-yellow-500 text-[#39381F] px-3 py-1 rounded font-bold text-sm transition"
                            onClick={() => router.push(`/editProduk/${product._id}`)}
                          >
                            Edit Produk
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Tombol Tambah Produk */}
                <div className="flex justify-center mt-10">
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-[#39381F] px-10 py-3 rounded-xl font-bold text-lg shadow-lg transition"
                    onClick={() => router.push("/tambahProduk")}
                  >
                    Tambah Produk Baru
                  </button>
                </div>
              </div>
            )}

            {/* Keuangan Tab */}
            {activeTab === "keuangan" && (
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Keuangan Toko</h2>
                  <button
                    onClick={fetchStoreOrders}
                    disabled={ordersLoading}
                    className="bg-yellow-400 text-[#39381F] px-4 py-2 rounded-lg hover:bg-yellow-500 transition duration-200 disabled:bg-gray-400 flex items-center gap-2 font-semibold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    {ordersLoading ? 'Memuat...' : 'Refresh Data'}
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat data keuangan...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
                    <p className="text-gray-600 mb-6">Data keuangan akan muncul setelah ada pesanan</p>
                  </div>
                ) : (
                  <>
                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                      {/* Total Revenue */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600">Total Pendapatan</p>
                            <p className="text-2xl font-bold text-green-900">
                              Rp {financialStats.totalRevenue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-green-500 text-white p-3 rounded-full">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                            </svg>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          {financialStats.totalOrders} pesanan total
                        </p>
                      </div>

                      {/* Total Paid */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600">Sudah Dibayar</p>
                            <p className="text-2xl font-bold text-blue-900">
                              Rp {financialStats.totalPaid.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-blue-500 text-white p-3 rounded-full">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          {financialStats.paidOrders} pesanan dibayar
                        </p>
                      </div>

                      {/* Total Pending */}
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-yellow-600">Menunggu Pembayaran</p>
                            <p className="text-2xl font-bold text-yellow-900">
                              Rp {financialStats.totalPending.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-yellow-500 text-white p-3 rounded-full">
                            <Clock className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-xs text-yellow-600 mt-2">
                          {financialStats.pendingOrders} pesanan pending
                        </p>
                      </div>

                      {/* Total Cancelled */}
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-600">Dibatalkan/Gagal</p>
                            <p className="text-2xl font-bold text-red-900">
                              Rp {financialStats.totalCancelled.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-red-500 text-white p-3 rounded-full">
                            <XCircle className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                          {financialStats.cancelledOrders} pesanan dibatalkan
                        </p>
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Payment Status Breakdown */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Pembayaran</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Dibayar</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{financialStats.paidOrders}</p>
                              <p className="text-xs text-gray-500">
                                {financialStats.totalOrders > 0 ? Math.round((financialStats.paidOrders / financialStats.totalOrders) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Menunggu Pembayaran</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{financialStats.pendingOrders}</p>
                              <p className="text-xs text-gray-500">
                                {financialStats.totalOrders > 0 ? Math.round((financialStats.pendingOrders / financialStats.totalOrders) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              <span className="text-sm font-medium text-gray-700">Dibatalkan/Gagal</span>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-gray-900">{financialStats.cancelledOrders}</p>
                              <p className="text-xs text-gray-500">
                                {financialStats.totalOrders > 0 ? Math.round((financialStats.cancelledOrders / financialStats.totalOrders) * 100) : 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Recent Financial Activity */}
                      <div className="bg-gray-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitas Terbaru</h3>
                        <div className="space-y-3">
                          {orders.slice(0, 5).map((order) => (
                            <div key={order._id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div>
                                <p className="text-sm font-medium text-gray-900">Order #{order.orderId}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  Rp {order.total_bayar.toLocaleString()}
                                </p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                  {getStatusText(order.payment_status)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Financial Insights */}
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Insight Keuangan</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-600">Rasio Pembayaran</p>
                          <p className="text-xl font-bold text-green-600">
                            {financialStats.totalOrders > 0 ? Math.round((financialStats.paidOrders / financialStats.totalOrders) * 100) : 0}%
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Rata-rata Order</p>
                          <p className="text-xl font-bold text-blue-600">
                            Rp {financialStats.totalOrders > 0 ? Math.round(financialStats.totalRevenue / financialStats.totalOrders).toLocaleString() : 0}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-600">Pendapatan Bersih</p>
                          <p className="text-xl font-bold text-green-600">
                            Rp {financialStats.totalPaid.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            Toko tidak ditemukan.
          </div>
        )}
      </div>
    </div>
  );
}
