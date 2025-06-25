"use client";
import Button from "@/components/ui/Button";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Heart, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchProductById, fetchProducts, Product, Weight, fetchStoreById } from "@/lib/api/fetchProducts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";

const Detail = () => {
  const [quantity, setQuantity] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<any>(null);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  const [selectedWeight, setSelectedWeight] = useState<Weight | null>(null);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 0 ? q - 1 : 0));

  useEffect(() => {
    const loadData = async () => {
      if (!slug || slug === "undefined") {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        const productData = await fetchProductById(slug);
        setProduct(productData);

        // Fetch store data
        if (productData.store_id) {
          try {
            const storeData = await fetchStoreById(productData.store_id);
            setStore(storeData);
          } catch (storeError) {
            console.error("Error fetching store:", storeError);
          }
        }

        const productsData = await fetchProducts();
        const bestSellersData = productsData.filter((p) => p.isBestSeller && p._id !== slug);
        setBestSellers(bestSellersData);

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  const renderProductCard = (product: Product) => (
    <Link href={`/detail/${product._id}`} className="flex-shrink-0 w-72">
      <div className="bg-7 rounded-2xl p-4 flex flex-col hover:shadow-lg transition cursor-pointer">
        <div className="w-full flex justify-center mb-4 pt-8">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={150}
            height={120}
            className="object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold text-left mb-2 text-black">{product.name}</h3>
        <div className="flex justify-between text-sm text-black/30 mb-2 px-1">
          <span>{product.categoryOptions}</span>
          <span className="flex items-center gap-1 text-yellow-500 text-[16px]">
            ★ <span className="text-black/60">({product.rating})</span>
          </span>
        </div>
        <div className="flex justify-between items-center px-1">
          <span className="text-base font-semibold text-black">
            Rp{product.price.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button className="w-6 h-6 rounded-full bg-black text-xl text-white border border-black/10 flex items-center justify-center">
              +
            </button>
            <button className="w-6 h-6 text-[#C7C7CC] hover:text-red-500 transition flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );

  if (loading) {
    return <div className="text-center py-40">Loading...</div>;
  }

  if (error || !product) {
    return <div className="text-center py-40 text-red-500">Error: {error || "Product not found"}</div>;
  }

  const router = useRouter();

  return (
    <section className="bg-white pt-22 sm:pt-24 md:pt-28 pb-10 w-full">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4">
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-black text-sm mb-4 hover:underline w-fit"
        >
          <ArrowLeft className="w-6 h-6 mr-1" />
        </button>

        <h2 className="text-left text-2xl font-semibold text-black mb-8">Detail Produk</h2>

        {/* Detail Produk */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Gambar Produk */}
          <div className="w-full md:w-2/5 flex justify-center items-start">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain w-full max-w-xs md:max-w-sm"
            />
          </div>

          {/* Info Produk */}
          <div className="w-full md:w-3/5 flex flex-col gap-4">
            <h3 className="text-2xl md:text-3xl font-semibold text-black">{product.name}</h3>

            <div className="flex items-center gap-2 text-yellow-500 text-sm md:text-base">
              <span className="text-black">{product.rating}</span>
              {[...Array(Math.floor(product.rating))].map((_, i) => (
                <Star key={i} fill="currentColor" stroke="currentColor" className="w-5 h-5" />
              ))}
              {product.rating % 1 !== 0 && (
                <Star fill="none" stroke="currentColor" className="w-5 h-5" />
              )}
              {[...Array(5 - Math.ceil(product.rating))].map((_, i) => (
                <Star key={i} fill="none" stroke="currentColor" className="w-5 h-5" />
              ))}
            </div>

            <div className="text-2xl md:text-4xl font-semibold text-black">
              {selectedWeight ? `Rp${selectedWeight.price.toLocaleString()}` : `Rp${product.price.toLocaleString()}`}
            </div>

            <p className="text-black/60 text-sm">{product.description}</p>

            {/* Info Toko */}
            {store && (
              <div className="bg-gray-50 rounded-xl p-4 mt-4">
                <h4 className="text-sm font-medium text-black mb-3">Dijual oleh:</h4>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-2 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {store.nama_toko?.charAt(0)?.toUpperCase() || 'T'}
                    </span>
                  </div>
                  <div>
                    <h5 className="font-semibold text-black">{store.nama_toko}</h5>
                    <p className="text-sm text-gray-600">{store.alamat?.kabupaten || 'Lokasi tidak tersedia'}</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-black text-base md:text-lg font-medium mt-4">Tersedia Dalam:</p>
            <div className="flex flex-wrap gap-2">
              {product.weights.map((weight) => (
                <label key={weight.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${selectedWeight?.id === weight.id ? 'bg-2 text-white border-2 border-2' : 'bg-white text-black border-gray-300'}`}>
                  <input
                    type="radio"
                    name="weight"
                    value={weight.id}
                    checked={selectedWeight?.id === weight.id}
                    onChange={() => setSelectedWeight(weight)}
                    className="form-radio accent-2"
                  />
                  {weight.value}
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
              {/* Counter */}
              <div className="flex items-center gap-3 bg-[#6D8044]/14 px-4 py-2 rounded-full">
                <button onClick={decrement} className="text-black text-lg">
                  <Minus />
                </button>
                <span className="text-lg font-medium text-black">{quantity}</span>
                <button onClick={increment} className="text-black text-lg">
                  <Plus />
                </button>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap gap-2">
                <AddToCartButton
                  productId={product._id}
                  quantity={quantity}
                  weight={selectedWeight}
                  onSuccess={() => {
                    alert('Produk berhasil ditambahkan ke keranjang!');
                    setQuantity(0);
                  }}
                  onError={(message) => alert(message)}
                />
                <button
                  className="bg-3 px-5 py-2 rounded-full text-black font-medium hover:bg-3/90 transition"
                  onClick={async () => {
                    if (!user) {
                      alert('Silakan login terlebih dahulu');
                      router.push('/auth/login');
                      return;
                    }
                    if (quantity < 1) {
                      alert('Jumlah produk harus minimal 1');
                      return;
                    }
                    if (!selectedWeight) {
                      alert('Pilih berat produk terlebih dahulu');
                      return;
                    }
                    // Tambahkan ke keranjang dengan jumlah dan berat yang dipilih
                    const response = await fetch('/api/cart/add', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        user_id: user._id,
                        product_id: product._id,
                        jumlah: quantity,
                        weight_id: selectedWeight.id,
                        weight_value: selectedWeight.value,
                        harga_satuan: selectedWeight.price,
                      }),
                    });
                    if (response.ok) {
                      router.push('/pembayaran');
                    } else {
                      const data = await response.json();
                      alert(data.message || 'Gagal menambahkan ke keranjang');
                    }
                  }}
                >
                  Beli Sekarang
                </button>
                <button className="w-8 h-8 text-black hover:text-red-500 transition flex items-center justify-center">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Produk Lain */}
        <section className="w-full pt-4">
          <h2 className="text-left text-xl md:text-2xl font-semibold text-black mb-4">Produk Lain</h2>
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
            {bestSellers.length > 0 ? (
              bestSellers.map((product) => (
                <Link href={`/detail/${product._id}`} className="flex-shrink-0 w-60 md:w-72">
                  <div className="bg-7 rounded-2xl p-4 flex flex-col hover:shadow-lg transition cursor-pointer h-full">
                    <div className="w-full h-48 md:h-60 flex justify-center items-center mb-4">
                      <Image
                        src={product.imageUrl || "/images/placeholder.png"}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-left mb-2 text-black">{product.name}</h3>
                    <div className="flex justify-between text-sm text-black/30 mb-2 px-1">
                      <span>{product.categoryOptions}</span>
                      <span className="flex items-center gap-1 text-yellow-500 text-[16px]">
                        ★ <span className="text-black/60">({product.rating})</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className="text-base font-semibold text-black">
                        Rp{product.price.toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <button className="w-6 h-6 rounded-full bg-black text-xl text-white border border-black/10 flex items-center justify-center">
                          +
                        </button>
                        <button className="w-6 h-6 text-[#C7C7CC] hover:text-red-500 transition flex items-center justify-center">
                          <Heart className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500">Tidak ada produk lain</div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Detail;