"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CityAutocomplete from "@/components/ui/CityAutocomplete";
import CourierAutocomplete from "@/components/ui/CourierAutocomplete";
import ServiceAutocomplete from "@/components/ui/ServiceAutocomplete";
import { useUser } from "@/contexts/UserContext";
import { fetchStoreById } from "@/lib/api/fetchProducts";
import {
  fetchOrderDetails,
  createOrder,
  createPayment,
} from "@/lib/api/paymentApi";
import { PageLoading, ButtonLoading } from "@/components/ui/loading";

interface CartItem {
  _id: string;
  product_id: {
    _id: string;
    store_id: string;
    nama?: string;
    name?: string;
    price: number;
    gambar?: string;
    imageUrl?: string;
    berat?: number;
  };
  jumlah: number;
  weight_value?: string;
  harga_satuan?: number;
}

interface ShippingOption {
  shipping_name: string;
  service_name: string;
  weight: number;
  is_cod: boolean;
  shipping_cost: number;
  shipping_cashback: number;
  shipping_cost_net: number;
  grandtotal: number;
  service_fee: number;
  net_income: number;
  etd: string;
}

interface Alamat {
  _id: string;
  nama?: string;
  nomor_hp?: string;
  label_alamat?: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  desa?: string;
  kode_pos?: string | number;
  alamat_lengkap?: string;
  catatan_kurir?: string;
  is_active?: boolean;
}

const PaymentPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] =
    useState<ShippingOption | null>(null);
  const [selectedUserAddress, setSelectedUserAddress] = useState<Alamat | null>(
    null
  );
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [store, setStore] = useState<any>(null);

  // Tambahan untuk order detail jika ada order_id
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const orderId = searchParams.get("order_id");

  // Check for Midtrans redirect parameters
  const transactionStatus = searchParams.get("transaction_status");
  const orderIdFromMidtrans = searchParams.get("order_id");
  const finalOrderId = orderId || orderIdFromMidtrans;

  // Jika ada order_id, fetch detail order
  useEffect(() => {
    if (finalOrderId) {
      setOrderLoading(true);
      fetchOrderDetails(finalOrderId)
        .then((data) => {
          console.log("Order data received:", data);
          if (data) {
            setOrderDetails(data);
          } else {
            console.error("No order data received");
            setOrderDetails(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching order:", error);
          setOrderDetails(null);
        })
        .finally(() => setOrderLoading(false));
    }
  }, [finalOrderId]);

  // Get selected items from URL params
  useEffect(() => {
    const selectedItemsParam = searchParams.get("selectedItems");
    if (selectedItemsParam) {
      setSelectedItemIds(selectedItemsParam.split(","));
    }
  }, [searchParams]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + (item.harga_satuan || item.product_id.price) * item.jumlah,
    0
  );
  const shippingCost = selectedShipping?.shipping_cost || 0;
  const tax = subtotal * 0.1; // 10% tax
  const discount = subtotal * 0.05; // 5% discount
  const total = subtotal + shippingCost + tax - discount;

  // Fetch cart data
  useEffect(() => {
    if (user) {
      fetchCartData(user._id);

      // Auto-select main address if available
      if (user.alamat && user.alamat.length > 0) {
        const mainAddress = user.alamat.find((addr) => addr.is_active);
        if (mainAddress) {
          setSelectedUserAddress(mainAddress as Alamat);
          // Auto-search destination based on main address
          if (mainAddress.kabupaten) {
            fetch(
              `/api/shipping/search-destination?keyword=${encodeURIComponent(
                mainAddress.kabupaten
              )}`
            )
              .then((res) => res.json())
              .then((data) => {
                if (data.data && data.data.length > 0) {
                  const destination = data.data[0];
                  setSelectedDestination({
                    id: destination.id,
                    city_name: destination.city_name,
                    province: destination.province,
                  });
                }
              })
              .catch((err) =>
                console.error("Error searching destination:", err)
              );
          }
        }
      }
    }
  }, [user, selectedItemIds]);

  const fetchCartData = async (userId: string) => {
    try {
      const response = await fetch(`/api/cart/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const allCartItems = data.cart_item || [];

        // Filter cart items based on selected items
        if (selectedItemIds.length > 0) {
          const filteredItems = allCartItems.filter((item: CartItem) =>
            selectedItemIds.includes(item.product_id._id)
          );
          setCartItems(filteredItems);
        } else {
          // If no selected items, show all items (fallback)
          setCartItems(allCartItems);
        }

        // Fetch store data from first product in cart
        if (allCartItems.length > 0 && allCartItems[0].product_id.store_id) {
          try {
            const storeData = await fetchStoreById(
              allCartItems[0].product_id.store_id
            );
            setStore(storeData);

            // Search for store location in RajaOngkir API
            if (storeData.alamat?.kabupaten) {
              try {
                const searchResponse = await fetch(
                  `/api/shipping/search-destination?keyword=${encodeURIComponent(
                    storeData.alamat.kabupaten
                  )}`
                );
                if (searchResponse.ok) {
                  const searchData = await searchResponse.json();
                  if (searchData.data && searchData.data.length > 0) {
                    // Use the first matching destination
                    const storeDestination = searchData.data[0];
                    setSelectedOrigin({
                      id: storeDestination.id,
                      city_name: storeDestination.city_name,
                      province: storeDestination.province,
                    });
                  }
                }
              } catch (searchError) {
                console.error("Error searching store location:", searchError);
              }
            }
          } catch (storeError) {
            console.error("Error fetching store:", storeError);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const getTotalWeightKg = () => {
    if (!cartItems || cartItems.length === 0) return 1.0;
    const totalGram = cartItems.reduce(
      (sum, item) => sum + (item.product_id.berat || 1000) * item.jumlah,
      0
    );
    return Math.max(totalGram / 1000, 0.1);
  };

  const calculateShipping = async () => {
    if (!selectedDestination?.id) {
      alert("Pilih lokasi penerima terlebih dahulu");
      return;
    }

    if (!selectedOrigin?.id) {
      alert("Lokasi pengirim belum tersedia");
      return;
    }

    const weight = getTotalWeightKg();
    const itemValue = subtotal;

    try {
      const params = new URLSearchParams({
        shipper_destination_id: selectedOrigin.id.toString(),
        receiver_destination_id: selectedDestination.id.toString(),
        weight: weight.toString(),
        item_value: itemValue.toString(),
        cod: "false",
      });

      const response = await fetch(
        `/api/shipping/calculate?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data?.calculate_reguler) {
          setShippingOptions(data.data.calculate_reguler);
        } else {
          setShippingOptions([]);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Gagal menghitung ongkir");
        setShippingOptions([]);
      }
    } catch (error) {
      console.error("Error calculating shipping:", error);
      alert("Terjadi kesalahan saat menghitung ongkir");
      setShippingOptions([]);
    }
  };

  const handleOriginChange = (option: any) => {
    setSelectedOrigin(option);
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  const handleDestinationChange = (option: any) => {
    setSelectedDestination(option);
    setShippingOptions([]);
    setSelectedShipping(null);
  };

  const handleUserAddressChange = (addressId: string) => {
    const address = user?.alamat?.find((addr) => addr._id === addressId);
    // Cast the address to Alamat type before setting state
    setSelectedUserAddress((address as Alamat) || null);

    // Auto-search destination based on selected address
    if (address?.kabupaten) {
      fetch(
        `/api/shipping/search-destination?keyword=${encodeURIComponent(
          address.kabupaten
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.data && data.data.length > 0) {
            const destination = data.data[0];
            setSelectedDestination({
              id: destination.id,
              city_name: destination.city_name,
              province: destination.province,
            });
          }
        })
        .catch((err) => console.error("Error searching destination:", err));
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert("Silakan login terlebih dahulu");
      return;
    }

    if (!selectedUserAddress) {
      alert("Pilih alamat pengiriman terlebih dahulu");
      return;
    }

    if (!selectedOrigin || !selectedDestination) {
      alert("Lokasi pengirim atau penerima belum tersedia");
      return;
    }

    if (!selectedShipping) {
      alert("Pilih layanan pengiriman");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order first
      const orderData = {
        user_id: user._id,
        shipping_address: {
          nama: selectedUserAddress.nama || "",
          telepon: selectedUserAddress.nomor_hp || "",
          alamat: selectedUserAddress.alamat_lengkap || "",
          kota: selectedDestination?.city_name || "",
          kode_pos: selectedUserAddress.kode_pos?.toString() || "",
          provinsi: selectedDestination?.province || "",
        },
        ongkir: selectedShipping.shipping_cost,
        catatan: notes,
        total_bayar: total,
      };

      console.log("Creating order with data:", orderData);

      const orderResult = await createOrder(orderData);

      if (!orderResult.success) {
        throw new Error(orderResult.message || "Gagal membuat order");
      }

      console.log("Order created:", orderResult);

      // Step 2: Create payment with order data
      const paymentItems = [
        ...cartItems.map((item) => ({
          productId: item.product_id._id,
          name: item.product_id.nama || item.product_id.name || "Product",
          price: item.harga_satuan || item.product_id.price,
          quantity: item.jumlah,
        })),
      ];
      if (selectedShipping && selectedShipping.shipping_cost > 0) {
        paymentItems.push({
          productId: "ONGKIR",
          name: "Ongkos Kirim",
          price: selectedShipping.shipping_cost,
          quantity: 1,
        });
      }
      if (tax > 0) {
        paymentItems.push({
          productId: "PAJAK",
          name: "Pajak (10%)",
          price: tax,
          quantity: 1,
        });
      }
      if (discount > 0) {
        paymentItems.push({
          productId: "DISKON",
          name: "Diskon (5%)",
          price: -discount,
          quantity: 1,
        });
      }
      const paymentData = {
        orderId: orderResult.order.orderId,
        items: paymentItems,
        customerDetails: {
          name: selectedUserAddress.nama || "",
          email: user.email,
          phone: selectedUserAddress.nomor_hp || "",
          address: selectedUserAddress.alamat_lengkap || "",
          city: selectedDestination?.city_name || "",
          postalCode: selectedUserAddress.kode_pos?.toString() || "",
          userId: user._id,
        },
        shippingDetails: {
          address: selectedUserAddress.alamat_lengkap || "",
          city: selectedDestination?.city_name || "",
          postalCode: selectedUserAddress.kode_pos?.toString() || "",
        },
      };

      console.log("Creating payment with data:", paymentData);

      // Create payment token
      const paymentResult = await createPayment(paymentData);

      if (paymentResult.redirect_url) {
        // Redirect to Midtrans payment page
        window.location.href = paymentResult.redirect_url;
      } else {
        alert(paymentResult.message || "Gagal membuat pembayaran");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat membuat pembayaran";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-calculate shipping when both origin and destination are selected
  useEffect(() => {
    if (selectedOrigin?.id && selectedDestination?.id && cartItems.length > 0) {
      calculateShipping();
    }
  }, [selectedOrigin, selectedDestination, cartItems]);

  // Render jika ada order_id (mode instruksi pembayaran)
  if (finalOrderId) {
    if (orderLoading) {
      return <PageLoading text="Memuat detail pesanan..." />;
    }
    if (!orderDetails) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Pesanan tidak ditemukan.</p>
            <button
              onClick={() => router.push("/riwayatBelanja")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Kembali ke Riwayat
            </button>
          </div>
        </div>
      );
    }

    // Handle Midtrans redirect status
    let statusMessage = "";
    let statusColor = "";
    let statusIcon = null;

    if (transactionStatus === "capture" || transactionStatus === "settlement") {
      statusMessage = "Pembayaran Berhasil!";
      statusColor = "text-green-600";
      statusIcon = (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
      );
    } else if (transactionStatus === "pending") {
      statusMessage = "Menunggu Pembayaran";
      statusColor = "text-yellow-600";
      statusIcon = (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg
            className="h-8 w-8 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
      );
    } else if (
      transactionStatus === "cancel" ||
      transactionStatus === "deny" ||
      transactionStatus === "expire"
    ) {
      statusMessage = "Pembayaran Gagal";
      statusColor = "text-red-600";
      statusIcon = (
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
      );
    }

    // Jika sudah dibayar
    if (orderDetails.payment_status === "paid") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Pembayaran Sudah Diterima
            </h1>
            <p className="text-gray-600 mb-6">
              Terima kasih, pesanan Anda sudah dibayar dan sedang diproses.
            </p>

            {/* Detail Pesanan */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">
                Detail Pesanan:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-medium text-gray-900">
                    {orderDetails.orderId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-gray-900">
                    Rp {orderDetails.total_bayar?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {orderDetails.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pembayaran:</span>
                  <span className="font-medium text-gray-900">
                    {orderDetails.payment_status}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/riwayatBelanja")}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Lihat Riwayat Pesanan
            </button>
          </div>
        </div>
      );
    }
    // Jika masih pending
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          {statusIcon}
          <h1
            className={`text-2xl font-bold mb-4 ${
              statusColor || "text-gray-900"
            }`}
          >
            {statusMessage || "Menunggu Pembayaran"}
          </h1>
          <p className="text-gray-600 mb-6">
            {transactionStatus === "pending"
              ? "Silakan selesaikan pembayaran Anda sesuai instruksi berikut:"
              : "Status pembayaran Anda saat ini:"}
          </p>

          {/* Detail Pesanan */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              Detail Pesanan:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium text-gray-900">
                  {orderDetails.orderId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-gray-900">
                  Rp {orderDetails.total_bayar?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-gray-900">
                  {orderDetails.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pembayaran:</span>
                <span className="font-medium text-gray-900">
                  {orderDetails.payment_status}
                </span>
              </div>
              {transactionStatus && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Status Midtrans:</span>
                  <span className="font-medium text-gray-900">
                    {transactionStatus}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 mb-2"
          >
            Refresh Status Pembayaran
          </button>
          {/* Tombol Bayar Sekarang di Midtrans */}
          {orderDetails.status === "pending" &&
            orderDetails.snap_redirect_url && (
              <div className="mb-2">
                <button
                  onClick={() =>
                    (window.location.href =
                      orderDetails.snap_redirect_url ?? "")
                  }
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200"
                >
                  Dapatkan Kode Pembayaran Kembali
                </button>
              </div>
            )}
          {orderDetails.payment_url && (
            <a
              href={orderDetails.payment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 mb-2"
            >
              Lihat Instruksi Pembayaran
            </a>
          )}
          <button
            onClick={() => router.push("/riwayatBelanja")}
            className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
          >
            Kembali ke Riwayat Pesanan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            {/* Back Button */}
            <div className="flex justify-start mb-6">
              <button
                onClick={() => router.push("/keranjang")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">
                  Kembali ke Keranjang
                </span>
              </button>
            </div>

            <h1 className="text-3xl font-bold mb-3 text-black">
              Checkout & Pembayaran
            </h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
              Lengkapi data pengiriman dan pilih layanan pengiriman
            </p>
            {selectedItemIds.length > 0 && (
              <p className="text-blue-600 text-sm mt-2">
                Checkout {selectedItemIds.length} item yang dipilih
              </p>
            )}
          </div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Checkout Form */}
            <div className="w-full lg:w-2/3">
              <div className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-xl font-semibold mb-6 text-black">
                    Alamat Pengiriman
                  </h2>

                  {/* Info Toko Pengirim */}
                  {store && (
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                      <h4 className="text-sm font-medium text-black mb-2">
                        Dikirim dari:
                      </h4>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-2 flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {store.nama_toko?.charAt(0)?.toUpperCase() || "T"}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-black text-sm">
                            {store.nama_toko}
                          </h5>
                          <p className="text-xs text-gray-600">
                            {store.alamat?.alamat_lengkap ||
                              `${store.alamat?.kabupaten}, ${store.alamat?.provinsi}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pilih Alamat dari Profil */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Alamat Pengiriman
                    </label>

                    {/* Check if user has addresses */}
                    {!user?.alamat || user.alamat.length === 0 ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                          <svg
                            className="h-6 w-6 text-yellow-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-yellow-800 mb-2">
                          Belum Ada Alamat Tersimpan
                        </h3>
                        <p className="text-yellow-700 mb-4">
                          Anda perlu menambahkan alamat pengiriman terlebih
                          dahulu sebelum melakukan checkout.
                        </p>
                        <div className="space-y-2">
                          <button
                            onClick={() => router.push("/profile")}
                            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition duration-200"
                          >
                            Tambah Alamat di Profil
                          </button>
                          <button
                            onClick={() => router.push("/keranjang")}
                            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition duration-200"
                          >
                            Kembali ke Keranjang
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <select
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={selectedUserAddress?._id || ""}
                          onChange={(e) =>
                            handleUserAddressChange(e.target.value)
                          }
                        >
                          <option value="">Pilih alamat pengiriman...</option>
                          {(user?.alamat as Alamat[] | undefined)?.map(
                            (alamat) => (
                              <option key={alamat._id} value={alamat._id}>
                                {alamat.is_active ? "🏠 " : ""}
                                {alamat.label_alamat ||
                                  alamat.alamat_lengkap} - {alamat.nama}
                                {alamat.is_active ? " (Utama)" : ""}
                              </option>
                            )
                          )}
                        </select>

                        {/* Add new address option */}
                        <div className="mt-3 text-center">
                          <button
                            onClick={() => router.push("/profile")}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                          >
                            + Tambah Alamat Baru
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Detail Alamat yang Dipilih */}
                  {selectedUserAddress && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                      <h4 className="text-sm font-medium text-black mb-2">
                        Detail Alamat Pengiriman:
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <strong>Nama:</strong> {selectedUserAddress.nama}
                        </p>
                        <p>
                          <strong>HP:</strong> {selectedUserAddress.nomor_hp}
                        </p>
                        <p>
                          <strong>Alamat:</strong>{" "}
                          {selectedUserAddress.alamat_lengkap}
                        </p>
                        <p>
                          <strong>Lokasi:</strong> {selectedUserAddress.desa},{" "}
                          {selectedUserAddress.kecamatan},{" "}
                          {selectedUserAddress.kabupaten},{" "}
                          {selectedUserAddress.provinsi}{" "}
                          {selectedUserAddress.kode_pos}
                        </p>
                        {selectedUserAddress.catatan_kurir && (
                          <p>
                            <strong>Catatan:</strong>{" "}
                            {selectedUserAddress.catatan_kurir}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Form Catatan */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Catatan tambahan untuk kurir atau pesanan"
                    />
                  </div>
                </div>

                {/* Shipping Options */}
                {!user?.alamat || user.alamat.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-black">
                      Pilihan Pengiriman
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                        <svg
                          className="h-6 w-6 text-yellow-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-yellow-800 mb-2">
                        Pilih Alamat Terlebih Dahulu
                      </h3>
                      <p className="text-yellow-700 mb-4">
                        Opsi pengiriman akan muncul setelah Anda memilih alamat
                        pengiriman.
                      </p>
                      <button
                        onClick={() => router.push("/profile")}
                        className="bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition duration-200"
                      >
                        Tambah Alamat
                      </button>
                    </div>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-black">
                      Pilihan Pengiriman
                    </h2>

                    <div className="space-y-3">
                      {shippingOptions.map((option, index) => (
                        <div
                          key={index}
                          className={`border rounded-xl p-4 cursor-pointer transition-all ${
                            selectedShipping === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-black">
                                {option.shipping_name} - {option.service_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Estimasi: {option.etd || "-"} hari
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-black">
                                Rp{option.shipping_cost?.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedUserAddress ? (
                  <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-xl font-semibold mb-6 text-black">
                      Pilihan Pengiriman
                    </h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <svg
                          className="h-6 w-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-blue-800 mb-2">
                        Menghitung Ongkos Kirim
                      </h3>
                      <p className="text-blue-700">
                        Sedang mencari opsi pengiriman untuk alamat Anda...
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <motion.div
              className="w-full lg:w-1/3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-32">
                <h2 className="text-lg font-semibold mb-4 text-black">
                  Ringkasan Pesanan
                </h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <Image
                        src={item.product_id.gambar || "/images/home/logo.png"}
                        alt={
                          item.product_id.nama ||
                          item.product_id.name ||
                          "Product Image"
                        }
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-black">
                          {item.product_id.nama ||
                            item.product_id.name ||
                            "Product Name"}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Qty: {item.jumlah}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-black">
                        Rp
                        {(
                          item.harga_satuan ||
                          item.product_id.price * item.jumlah
                        ).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6 text-black">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium">
                      Rp{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium">
                      {selectedShipping
                        ? `Rp${shippingCost.toLocaleString()}`
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak (10%)</span>
                    <span className="font-medium">
                      Rp{tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon (5%)</span>
                    <span className="font-medium text-red-500">
                      -Rp{discount.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">
                        Rp{total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                {!user?.alamat || user.alamat.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
                    <p className="text-yellow-800 text-sm mb-3">
                      Anda perlu menambahkan alamat pengiriman terlebih dahulu
                    </p>
                    <button
                      onClick={() => router.push("/profile")}
                      className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition duration-200"
                    >
                      Tambah Alamat di Profil
                    </button>
                  </div>
                ) : (
                  <button
                    className={`w-full font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2
                      ${
                        selectedShipping && selectedUserAddress
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={
                      !selectedShipping || !selectedUserAddress || isLoading
                    }
                    onClick={handleCheckout}
                  >
                    {isLoading ? (
                      <ButtonLoading text="Memproses..." />
                    ) : (
                      <>
                        <span>Bayar Sekarang</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const PaymentPage = () => {
  return (
    <Suspense fallback={<PageLoading />}>
      <PaymentPageContent />
    </Suspense>
  );
};

export default PaymentPage;
