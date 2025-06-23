"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import CourierAutocomplete from '@/components/ui/CourierAutocomplete';
import ServiceAutocomplete from '@/components/ui/ServiceAutocomplete';
import { useUser } from '@/contexts/UserContext';

interface CartItem {
  _id: string;
  product_id: {
    _id: string;
    nama?: string;
    name?: string;
    price: number;
    gambar?: string;
    imageUrl?: string;
    berat?: number;
  };
  jumlah: number;
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

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [recipientName, setRecipientName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // Tambahan untuk order detail jika ada order_id
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const orderId = searchParams.get('order_id');

  // Jika ada order_id, fetch detail order
  useEffect(() => {
    if (orderId) {
      setOrderLoading(true);
      fetch(`/api/orders/${orderId}`)
        .then(res => res.json())
        .then(data => {
          if (data.order) setOrderDetails(data.order);
          else if (data.success && data.data) setOrderDetails(data.data);
        })
        .catch(() => setOrderDetails(null))
        .finally(() => setOrderLoading(false));
    }
  }, [orderId]);

  // Get selected items from URL params
  useEffect(() => {
    const selectedItemsParam = searchParams.get('selectedItems');
    if (selectedItemsParam) {
      setSelectedItemIds(selectedItemsParam.split(','));
    }
  }, [searchParams]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product_id.price * item.jumlah), 0);
  const shippingCost = selectedShipping?.shipping_cost || 0;
  const tax = subtotal * 0.1; // 10% tax
  const discount = subtotal * 0.05; // 5% discount
  const total = subtotal + shippingCost + tax - discount;

  // Fetch cart data
  useEffect(() => {
    if (user) {
      fetchCartData(user._id);
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
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const getTotalWeightKg = () => {
    if (!cartItems || cartItems.length === 0) return 1.0;
    const totalGram = cartItems.reduce((sum, item) => sum + ((item.product_id.berat || 1000) * item.jumlah), 0);
    return Math.max(totalGram / 1000, 0.1);
  };

  const calculateShipping = async () => {
    if (!selectedOrigin?.id || !selectedDestination?.id) {
      alert('Pilih lokasi pengirim dan penerima terlebih dahulu');
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
        cod: 'false'
      });

      const response = await fetch(`/api/shipping/calculate?${params.toString()}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.data?.calculate_reguler) {
          setShippingOptions(data.data.calculate_reguler);
        } else {
          setShippingOptions([]);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Gagal menghitung ongkir');
        setShippingOptions([]);
      }
    } catch (error) {
      console.error('Error calculating shipping:', error);
      alert('Terjadi kesalahan saat menghitung ongkir');
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

  const handleCheckout = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    if (!recipientName || !phone || !address || !postalCode || !selectedOrigin || !selectedDestination) {
      alert('Lengkapi semua data pengiriman');
      return;
    }

    if (!selectedShipping) {
      alert('Pilih layanan pengiriman');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create order first
      const orderData = {
        user_id: user._id,
        shipping_address: {
          nama: recipientName,
          telepon: phone,
          alamat: address,
          kota: selectedDestination?.city_name || '',
          kode_pos: postalCode,
          provinsi: selectedDestination?.province || '',
        },
        ongkir: selectedShipping.shipping_cost,
        catatan: notes,
      };

      console.log('Creating order with data:', orderData);

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.message || 'Gagal membuat order');
      }

      console.log('Order created:', orderResult);

      // Step 2: Create payment with order data
      const paymentData = {
        orderId: orderResult.order.orderId,
        items: cartItems.map(item => ({
          productId: item.product_id._id,
          name: item.product_id.nama || item.product_id.name,
          price: item.product_id.price,
          quantity: item.jumlah
        })),
        customerDetails: {
          name: recipientName,
          email: user.email,
          phone: phone,
          address: address,
          city: selectedDestination?.city_name || '',
          postalCode: postalCode,
          userId: user._id,
        },
        shippingDetails: {
          address: address,
          city: selectedDestination?.city_name || '',
          postalCode: postalCode,
        },
      };

      console.log('Creating payment with data:', paymentData);

      // Create payment token
      const paymentResponse = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResponse.ok && paymentResult.redirect_url) {
        // Redirect to Midtrans payment page
        window.location.href = paymentResult.redirect_url;
      } else {
        alert(paymentResult.message || 'Gagal membuat pembayaran');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat pembayaran';
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
  if (orderId) {
    if (orderLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat detail pesanan...</p>
          </div>
        </div>
      );
    }
    if (!orderDetails) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500">Pesanan tidak ditemukan.</p>
            <button onClick={() => router.push('/riwayatBelanja')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Kembali ke Riwayat</button>
          </div>
        </div>
      );
    }
    // Jika sudah dibayar
    if (orderDetails.payment_status === 'paid') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pembayaran Sudah Diterima</h1>
            <p className="text-gray-600 mb-6">Terima kasih, pesanan Anda sudah dibayar dan sedang diproses.</p>
            <button onClick={() => router.push('/riwayatBelanja')} className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200">Lihat Riwayat Pesanan</button>
          </div>
        </div>
      );
    }
    // Jika masih pending
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Menunggu Pembayaran</h1>
          <p className="text-gray-600 mb-6">Silakan selesaikan pembayaran Anda sesuai instruksi berikut:</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">Order ID: {orderDetails.orderId}</p>
            <p className="text-sm text-gray-600">Total: Rp {orderDetails.total_bayar?.toLocaleString()}</p>
            {/* Tambahkan instruksi pembayaran/kode pembayaran di sini jika ada */}
            <p className="text-sm text-blue-700 mt-2">Silakan cek email Anda atau klik tombol di bawah untuk melihat instruksi pembayaran di Midtrans.</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 mb-2"
          >
            Refresh Status Pembayaran
          </button>
          {orderDetails.payment_url && (
            <a href={orderDetails.payment_url} target="_blank" rel="noopener noreferrer" className="w-full block bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition duration-200 mb-2">Lihat Instruksi Pembayaran</a>
          )}
          <button onClick={() => router.push('/riwayatBelanja')} className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition duration-200">Kembali ke Riwayat Pesanan</button>
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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Penerima</label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={e => setRecipientName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nama Penerima"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                    <textarea
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kode Pos</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={e => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Kode Pos"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catatan (Opsional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                      placeholder="Catatan tambahan untuk kurir atau pesanan"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Pengirim (Origin)</label>
                    <CityAutocomplete
                      value={selectedOrigin}
                      onChange={handleOriginChange}
                      placeholder="Cari lokasi pengirim..."
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lokasi Penerima (Destination)</label>
                    <CityAutocomplete
                      value={selectedDestination}
                      onChange={handleDestinationChange}
                      placeholder="Cari lokasi penerima..."
                    />
                  </div>
                </div>

                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
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
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedShipping(option)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium text-black">
                                {option.shipping_name} - {option.service_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Estimasi: {option.etd || '-'} hari
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
                )}
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
                        src={item.product_id.gambar || '/images/home/logo.png'}
                        alt={item.product_id.nama || item.product_id.name || 'Product Image'}
                        width={50}
                        height={50}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-black">
                          {item.product_id.nama || item.product_id.name || 'Product Name'}
                        </h3>
                        <p className="text-xs text-gray-600">
                          Qty: {item.jumlah}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-black">
                        Rp{(item.product_id.price * item.jumlah).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6 text-black">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium">Rp{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium">
                      {selectedShipping ? `Rp${shippingCost.toLocaleString()}` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak (10%)</span>
                    <span className="font-medium">Rp{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon (5%)</span>
                    <span className="font-medium text-red-500">-Rp{discount.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">Rp{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  className={`w-full font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2
                    ${
                      selectedShipping && address && phone && recipientName
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!selectedShipping || !address || !phone || !recipientName || isLoading}
                  onClick={handleCheckout}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Bayar Sekarang</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
