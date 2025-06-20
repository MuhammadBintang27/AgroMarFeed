"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, User, Mail, Phone } from "lucide-react";
import CityAutocomplete from '@/components/ui/CityAutocomplete';
import CourierAutocomplete from '@/components/ui/CourierAutocomplete';
import ServiceAutocomplete from '@/components/ui/ServiceAutocomplete';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrigin, setSelectedOrigin] = useState<any>(null);
  const [selectedDestination, setSelectedDestination] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [form, setForm] = useState({
    nama: "",
    telepon: "",
    alamat: "",
    kode_pos: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data keranjang
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/cart/user/${user._id}`);
        const data = await res.json();
        setCartItems(data.cart_item || []);
      } catch {
        setError("Gagal mengambil keranjang");
      } finally {
        setLoading(false);
      }
    };
    fetchCart();
  }, [user]);

  // Hitung ongkir jika origin, destination, dan kurir dipilih
  useEffect(() => {
    if (selectedOrigin && selectedDestination && selectedCourier && user) {
      calculateShippingWithOriginDestCourier(
        String(selectedOrigin.id),
        String(selectedDestination.id),
        selectedCourier.code,
        user._id
      );
    }
  }, [selectedOrigin, selectedDestination, selectedCourier, user]);

  const calculateShippingWithOriginDestCourier = async (
    originId: string,
    destinationId: string,
    courier: string,
    userId: string
  ) => {
    if (!originId || !destinationId || !courier || !userId) return;
    try {
      // Hitung total berat keranjang (default 1000g jika tidak ada)
      const totalWeight = cartItems.reduce((sum, item) => sum + (item.product_id?.berat || 1000) * (item.jumlah || 1), 0) || 1000;
      const res = await fetch(`/api/shipping/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originId,
          destination: destinationId,
          weight: totalWeight,
          courier: courier,
          price: 'lowest',
        }),
      });
      const data = await res.json();
      setShippingOptions(data.shipping_options || []);
    } catch (e) {
      setShippingOptions([]);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const total = subtotal + (selectedService?.cost[0]?.value || 0);

  const handleChange = (e: any) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleOrder = async () => {
    if (!user || !form.nama || !form.telepon || !form.alamat || !form.kode_pos || !selectedOrigin || !selectedDestination || !selectedCourier || !selectedService) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user._id,
          shipping_address: {
            nama: form.nama,
            telepon: form.telepon,
            alamat: form.alamat,
            kode_pos: form.kode_pos,
            origin: selectedOrigin.label,
            destination: selectedDestination.label,
          },
          courier: selectedCourier.code,
          service: selectedService.service,
          ongkir: selectedService.cost[0].value,
        }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        // Initiate payment
        const payRes = await fetch(`/api/orders/${data.order._id}/payment`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payment_type: selectedCourier.code }),
        });
        const payData = await payRes.json();
        if (payRes.ok && payData.payment_url) {
          window.location.href = payData.payment_url;
        } else {
          alert("Gagal inisiasi pembayaran");
        }
      } else {
        alert(data.message || "Gagal membuat order");
      }
    } catch {
      alert("Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-7">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">Checkout</h1>
          <p className="text-gray-600 mb-8">Silakan login terlebih dahulu untuk melanjutkan checkout.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-2 text-white px-6 py-3 rounded-lg hover:bg-2/80 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-7">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-black text-center">Checkout</h1>
        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Keranjang kosong</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Form Alamat Pengiriman */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Alamat Pengiriman</h2>
              <input 
                className="w-full border rounded p-2 mb-2" 
                name="nama" 
                placeholder="Nama Penerima" 
                value={form.nama} 
                onChange={handleChange} 
              />
              <input 
                className="w-full border rounded p-2 mb-2" 
                name="telepon" 
                placeholder="No. Telepon" 
                value={form.telepon} 
                onChange={handleChange} 
              />
              <input 
                className="w-full border rounded p-2 mb-2" 
                name="alamat" 
                placeholder="Alamat Lengkap" 
                value={form.alamat} 
                onChange={handleChange} 
              />
              <input 
                className="w-full border rounded p-2 mb-2" 
                name="kode_pos" 
                placeholder="Kode Pos" 
                value={form.kode_pos} 
                onChange={handleChange} 
              />
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Pengirim (Origin)</label>
                <CityAutocomplete
                  value={selectedOrigin}
                  onChange={setSelectedOrigin}
                  placeholder="Cari lokasi pengirim..."
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Penerima (Destination)</label>
                <CityAutocomplete
                  value={selectedDestination}
                  onChange={setSelectedDestination}
                  placeholder="Cari lokasi penerima..."
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Kurir</label>
                <CourierAutocomplete
                  value={selectedCourier}
                  onChange={setSelectedCourier}
                  placeholder="Cari kurir..."
                />
              </div>
              {shippingOptions.length > 0 && (
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Layanan Pengiriman</label>
                  <ServiceAutocomplete
                    options={shippingOptions}
                    value={selectedService}
                    onChange={setSelectedService}
                    placeholder="Cari layanan pengiriman..."
                  />
                </div>
              )}
              <button
                className={`w-full font-medium py-3 rounded-xl mt-4 transition-all flex items-center justify-center gap-2
                  ${form.nama && form.telepon && form.alamat && form.kode_pos && selectedOrigin && selectedDestination && selectedCourier && selectedService && !isSubmitting
                    ? "bg-2 text-white hover:bg-2/90"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                disabled={!form.nama || !form.telepon || !form.alamat || !form.kode_pos || !selectedOrigin || !selectedDestination || !selectedCourier || !selectedService || isSubmitting}
                onClick={handleOrder}
              >
                {isSubmitting ? "Memproses..." : "Bayar Sekarang"}
              </button>
            </div>
            {/* Ringkasan Pesanan */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-xl font-bold mb-4">Ringkasan Pesanan</h2>
              {cartItems.map((item) => (
                <div key={item.product_id?._id || item.product_id} className="flex justify-between mb-2">
                  <span>{item.product_id?.nama || "Produk"} x {item.jumlah}</span>
                  <span>Rp{(item.subtotal || 0).toLocaleString()}</span>
                </div>
              ))}
              <hr className="my-4" />
              <div className="flex justify-between mb-2">
                <span className="font-medium">Subtotal</span>
                <span>Rp{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Ongkir</span>
                <span>{selectedService ? `Rp${selectedService.cost[0].value.toLocaleString()}` : '-'}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>Rp{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
