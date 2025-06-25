"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { fetchProducts } from "@/lib/api/fetchProducts";
import { Star } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const userId = user?._id || null;
  const [activeTab, setActiveTab] = useState("produk");
  const [activeSubTab, setActiveSubTab] = useState("produkSaya");

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
            {/* Sub Tab Produk */}
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
