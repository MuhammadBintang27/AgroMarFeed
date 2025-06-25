"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

interface Store {
  _id: string;
  nama_toko: string;
  deskripsi: string;
  email: string;
  nomor_hp: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
}

export default function TokoSayaPage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const userId = user?._id || null;

  useEffect(() => {
    console.log("[TOKO SAYA] userId:", userId);
    if (!userId) return;
    setLoading(true);
    fetch(`/api/stores?user_id=${userId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setStore(data);
        if (data && data._id) {
          fetch(`/api/products?store_id=${data._id}`)
            .then((res) => (res.ok ? res.json() : []))
            .then((prods) => setProducts(prods));
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {store ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">{store.nama_toko}</h1>
              <p className="text-gray-600 mb-1">{store.deskripsi}</p>
              <p className="text-gray-500 text-sm">
                Email: {store.email} | No HP: {store.nomor_hp}
              </p>
            </div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Produk Saya</h2>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
                onClick={() => router.push("/tambahProduk")}
              >
                Tambah Produk Sekarang
              </button>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="mb-4">Belum ada Produk</p>
                <button
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600"
                  onClick={() => router.push("/tambahProduk")}
                >
                  Tambah Produk Sekarang
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="border rounded-lg p-4 flex gap-4 items-center"
                  >
                    <img
                      src={product.image || "/images/home/logo.png"}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-gray-600">
                        Rp{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
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
