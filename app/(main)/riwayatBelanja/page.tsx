"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import InformativeFooter from "@/components/footer/detilInformasi";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

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

interface Appointment {
  _id: string;
  orderId: string;
  total_harga: number;
  status: string;
  payment_status: string;
  nama_lengkap: string;
  email: string;
  no_hp: string;
  konsultan_id: {
    _id: string;
    nama: string;
    profesi: string;
  };
  tanggal_konsultasi: string;
  jadwal: {
    jam_mulai: string;
    jam_berakhir: string;
  };
  createdAt: string;
  updatedAt: string;
  snap_redirect_url?: string;
  payment_url?: string;
  zoom_link?: string;
}

type HistoryItemType = Order | Appointment;

export default function OrderHistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItemType | null>(
    null
  );
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] =
    useState<HistoryItemType | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<string[]>([]);

  // Helper function to get product ID and name
  const getProductIdAndName = (product: any) => {
    return {
      _id: product._id || product.id,
      name: product.name,
    };
  };

  // Helper function to check if item is an appointment
  const isAppointment = (item: HistoryItemType): item is Appointment => {
    return "konsultan_id" in item;
  };

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/orders/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/appointment?user_id=${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchReviewedOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/reviews/user/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        // Extract order_ids from reviews
        const orderIds = data
          .map((r: any) => r.order_id?.toString() || r.order_id)
          .filter(Boolean);
        setReviewedOrders(orderIds);
      }
    } catch (error) {
      console.error("Error fetching reviewed orders:", error);
    }
  };

  // Load all data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        await Promise.all([
          fetchOrders(),
          fetchAppointments(),
          fetchReviewedOrders(),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "processing":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Dibayar";
      case "processing":
        return "Diproses";
      case "pending":
        return "Menunggu Pembayaran";
      case "cancelled":
        return "Dibatalkan";
      case "failed":
        return "Gagal";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatConsultationDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleItemClick = (item: HistoryItemType) => {
    setSelectedItem(selectedItem?._id === item._id ? null : item);
  };

  const handlePayNow = (item: HistoryItemType) => {
    setSelectedPaymentItem(item);
    setShowPaymentModal(true);
  };

  // Combine and sort all items by date
  const allItems: HistoryItemType[] = [
    ...orders.map((order) => ({ ...order, type: "order" as const })),
    ...appointments.map((appointment) => ({
      ...appointment,
      type: "appointment" as const,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleRefreshOrders = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchAppointments(),
        fetchReviewedOrders(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50 py-8 pt-12 md:pt-24">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Riwayat Pesanan & Konsultasi
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Lihat semua pesanan dan konsultasi Anda
              </p>
            </div>
            <button
              onClick={handleRefreshOrders}
              disabled={loading}
              className="bg-2 text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-400 flex items-center gap-2 text-sm sm:text-base self-start sm:self-auto"
            >
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
              {loading ? "Memuat..." : "Refresh"}
            </button>
          </div>
        </div>

        {allItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada pesanan atau konsultasi
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai berbelanja atau booking konsultasi untuk melihat riwayat
              Anda
            </p>
            <div className="space-x-4">
              <button
                onClick={() => router.push("/katalog")}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition duration-200"
              >
                Mulai Belanja
              </button>
              <button
                onClick={() => router.push("/konsultasi")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Booking Konsultasi
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {allItems.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Item Header */}
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        {isAppointment(item) ? (
                          <span className="bg-4 text-white text-xs font-bold px-2 py-1 rounded-full self-start">
                            Konsultasi
                          </span>
                        ) : (
                          <span className="bg-5 text-white text-xs font-bold px-2 py-1 rounded-full self-start">
                            Order
                          </span>
                        )}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                          {item.orderId}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {formatDate(item.createdAt)}
                      </p>
                      {isAppointment(item) ? (
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {item.nama_lengkap} - {item.email}
                        </p>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-600 break-words">
                          {item.shipping_address.nama} -{" "}
                          {item.shipping_address.alamat},{" "}
                          {item.shipping_address.kota}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-2 sm:ml-4">
                      <p className="text-base sm:text-lg font-bold text-gray-900">
                        Rp{" "}
                        {(isAppointment(item)
                          ? item.total_harga
                          : item.total_bayar
                        ).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 sm:px-3 rounded-full text-xs font-medium mt-1 sm:mt-2 ${getStatusColor(
                          item.payment_status
                        )}`}
                      >
                        {getStatusText(item.payment_status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Item Content */}
                <div className="p-6">
                  {isAppointment(item) ? (
                    // Appointment Content
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-8 h-8 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            ></path>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            Konsultasi dengan {item.konsultan_id.nama}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.konsultan_id.profesi}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatConsultationDate(item.tanggal_konsultasi)} •{" "}
                            {item.jadwal.jam_mulai} - {item.jadwal.jam_berakhir}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Rp {item.total_harga.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Order Content
                    <div className="space-y-4">
                      {item.order_item.map((orderItem, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4"
                        >
                          <div
                            className="flex-shrink-0 w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer"
                            onClick={() =>
                              router.push(`/detail/${orderItem.product_id._id}`)
                            }
                          >
                            {orderItem.product_id.imageUrl ? (
                              <img
                                src={orderItem.product_id.imageUrl}
                                alt={orderItem.product_id.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                ></path>
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">
                              {orderItem.product_id.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {orderItem.jumlah} x Rp{" "}
                              {orderItem.product_id.price.toLocaleString()}
                            </p>
                            {/* Review Button Logic - Show only once per order */}
                            {(() => {
                              const isDelivered = item.status === "delivered";
                              const isReviewed = reviewedOrders.includes(
                                item.orderId
                              );

                              // Show review button only for the first product in the order
                              const isFirstProduct =
                                orderItem === item.order_item[0];

                              if (
                                isDelivered &&
                                user &&
                                !isReviewed &&
                                isFirstProduct
                              ) {
                                return (
                                  <button
                                    className="text-xs bg-yellow-400 text-[#39381F] px-3 py-1 rounded font-bold mt-2"
                                    onClick={() => {
                                      const productInfo = getProductIdAndName(
                                        item.order_item[0].product_id
                                      );
                                      setReviewProduct({
                                        ...productInfo,
                                        order_id: item.orderId,
                                      });
                                      setShowReviewModal(true);
                                    }}
                                  >
                                    Beri Review Order Ini
                                  </button>
                                );
                              } else if (
                                isDelivered &&
                                user &&
                                isReviewed &&
                                isFirstProduct
                              ) {
                                return (
                                  <span className="text-xs text-green-600 font-medium mt-2 inline-block">
                                    ✓ Order sudah direview
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="text-xs text-gray-500 mt-2 inline-block">
                                    {item.status === "pending"
                                      ? "Menunggu pembayaran"
                                      : item.status === "processing"
                                      ? "Sedang diproses"
                                      : item.status === "shipped"
                                      ? "Dalam pengiriman"
                                      : "Belum selesai"}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              Rp {orderItem.subtotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Item Actions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-start">
                      <div className="text-xs sm:text-sm text-gray-600">
                        <p>
                          Status:{" "}
                          <span
                            className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {getStatusText(item.status)}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1 sm:space-y-2">
                        <div className="flex space-x-2 sm:space-x-3">
                          <button
                            onClick={() => handleItemClick(item)}
                            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedItem?._id === item._id
                              ? "Sembunyikan Detail"
                              : "Lihat Detail"}
                          </button>
                          {item.payment_status === "pending" && (
                            <button
                              onClick={() => handlePayNow(item)}
                              className="text-xs sm:text-sm bg-blue-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded hover:bg-blue-700 transition duration-200"
                            >
                              Bayar Sekarang
                            </button>
                          )}
                        </div>
                        {item.payment_status === "pending" && (
                          <p className="text-xs text-gray-500 text-right">
                            {isAppointment(item)
                              ? "Klik untuk melanjutkan pembayaran konsultasi."
                              : "Klik untuk melihat instruksi pembayaran tanpa input ulang."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {selectedItem?._id === item._id && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-4">
                        Detail {isAppointment(item) ? "Konsultasi" : "Pesanan"}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Order ID:</p>
                          <p className="font-medium">{item.orderId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Tanggal{" "}
                            {isAppointment(item) ? "Konsultasi" : "Pesanan"}:
                          </p>
                          <p className="font-medium">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status Pembayaran:</p>
                          <p className="font-medium">
                            <span className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium ${getStatusColor(item.payment_status)}`}>
                              {getStatusText(item.payment_status)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            Status{" "}
                            {isAppointment(item) ? "Konsultasi" : "Pesanan"}:
                          </p>
                          <p className="font-medium">
                            <span className={`inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                              {getStatusText(item.status)}
                            </span>
                          </p>
                        </div>
                        {isAppointment(item) ? (
                          <>
                            <div>
                              <p className="text-gray-600">Konsultan:</p>
                              <p className="font-medium">
                                {item.konsultan_id.nama} -{" "}
                                {item.konsultan_id.profesi}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Jadwal:</p>
                              <p className="font-medium">
                                {formatConsultationDate(
                                  item.tanggal_konsultasi
                                )}
                                <br />
                                {item.jadwal.jam_mulai} -{" "}
                                {item.jadwal.jam_berakhir}
                              </p>
                            </div>
                            <div className="md:col-span-2">
                              <p className="text-gray-600">Data Pribadi:</p>
                              <p className="font-medium">
                                {item.nama_lengkap}
                                <br />
                                {item.email}
                                <br />
                                {item.no_hp}
                              </p>
                            </div>
                            {item.zoom_link &&
                              item.payment_status === "paid" && (
                                <div className="md:col-span-2 mt-2">
                                  <span className="text-sm text-gray-600">
                                    Link Zoom:{" "}
                                  </span>
                                  <a
                                    href={item.zoom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline break-all text-sm"
                                  >
                                    {item.zoom_link}
                                  </a>
                                </div>
                              )}
                          </>
                        ) : (
                          <div className="md:col-span-2">
                            <p className="text-gray-600">Alamat Pengiriman:</p>
                            <p className="font-medium">
                              {item.shipping_address.nama}
                              <br />
                              {item.shipping_address.alamat}
                              <br />
                              {item.shipping_address.kota}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPaymentItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Opsi Pembayaran</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                {isAppointment(selectedPaymentItem)
                  ? `Konsultasi dengan ${selectedPaymentItem.konsultan_id.nama}`
                  : "Pesanan Produk"}
              </p>
              <p className="text-sm font-medium">
                Total: Rp{" "}
                {isAppointment(selectedPaymentItem)
                  ? selectedPaymentItem.total_harga?.toLocaleString()
                  : selectedPaymentItem.total_bayar?.toLocaleString()}
              </p>
            </div>

            <div className="space-y-3">
              {/* Tombol Bayar Sekarang (redirect ke halaman pembayaran) */}
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  if (isAppointment(selectedPaymentItem)) {
                    router.push(
                      `/pembayaranKonsultasi/${selectedPaymentItem.konsultan_id._id}?order_id=${selectedPaymentItem.orderId}`
                    );
                  } else {
                    router.push(
                      `/pembayaran?order_id=${selectedPaymentItem.orderId}`
                    );
                  }
                }}
                className="w-full bg-3 text-white py-3 px-4 rounded-lg hover:scale-102 transition duration-200"
              >
                Bayar Sekarang
              </button>
            </div>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="w-full mt-3 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:scale-102 transition duration-200"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {showReviewModal && reviewProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">
              Review untuk {reviewProduct.name}
            </h3>
            <div className="mb-2">
              <label className="block mb-1">Rating:</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} Bintang
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Ulasan:</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="border rounded w-full px-2 py-1"
                rows={3}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Gambar (opsional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setReviewImage(e.target.files?.[0] || null)}
                className="border rounded px-2 py-1 w-full"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded"
                disabled={reviewLoading}
                onClick={async () => {
                  setReviewLoading(true);
                  try {
                    let gambarBase64 = null;

                    // Convert image to base64 if selected
                    if (reviewImage) {
                      const reader = new FileReader();
                      gambarBase64 = await new Promise((resolve) => {
                        reader.onload = () => resolve(reader.result);
                        reader.readAsDataURL(reviewImage);
                      });
                    }

                    const requestBody: any = {
                      product_id: reviewProduct._id,
                      rating: reviewRating,
                      ulasan: reviewText,
                      user_id: user?._id || "",
                      order_id: reviewProduct.order_id,
                    };

                    if (gambarBase64) {
                      requestBody.gambar = gambarBase64;
                    }

                    const res = await fetch("/api/productReviews", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(requestBody),
                    });

                    if (res.ok) {
                      alert("Review berhasil dikirim!");
                      setShowReviewModal(false);
                      setReviewText("");
                      setReviewRating(5);
                      setReviewImage(null);
                      // Refresh reviewed orders to update UI
                      await fetchReviewedOrders();
                    } else {
                      const data = await res.json();
                      alert(data.message || "Gagal mengirim review");
                    }
                  } catch (error) {
                    console.error("Error submitting review:", error);
                    alert("Gagal mengirim review");
                  } finally {
                    setReviewLoading(false);
                  }
                }}
              >
                {reviewLoading ? "Mengirim..." : "Kirim Review"}
              </button>
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowReviewModal(false)}
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
