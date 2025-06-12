"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Heart, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchProductById, fetchProducts, Product } from "@/lib/api/fetchProducts";

const Detail = () => {
  const [quantity, setQuantity] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;

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

  return (
    <section className="bg-white py-40 w-full">
      <div className="w-full max-w-5xl mx-auto flex flex-col item-left text-left mb-12">
        <h2 className="text-left text-2xl font-normal text-black mb-16">Detail Produk</h2>
        <div className="flex flex-col md:flex-row gap-10 mb-50">
          <div className="w-full md:w-2/5 flex justify-center items-start">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain"
            />
          </div>
          <div className="w-full md:w-3/5 flex flex-col gap-4">
            <h3 className="text-3xl font-normal text-black">{product.name}</h3>
            <div className="flex items-center gap-2 text-yellow-500">
              <span className="text-black ml-2">{product.rating}</span>
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
            <div className="text-4xl font-normal text-black">
              Rp{product.price.toLocaleString()}
            </div>
            <p className="text-black/50 text-sm mb-4">{product.description}</p>
            <p className="text-black text-xl">Tersedia Dalam :</p>
            <div className="flex gap-3">
              {product.weights.map((weight) => (
                <div
                  key={weight.id}
                  className="bg-2 px-2 py-2 rounded-[20px] text-sm text-white cursor-pointer hover:bg-2/80 transition"
                >
                  {weight.value}
                </div>
              ))}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-[#6D8044]/14 px-4 py-2 rounded-[20px]">
                <button onClick={decrement} className="text-black text-xl">
                  <Minus />
                </button>
                <span className="text-lg text-black">{quantity}</span>
                <button onClick={increment} className="text-black text-lg">
                  <Plus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="bg-2 px-5 py-2 rounded-[20px] text-white font-medium hover:bg-2/80 transition">
                  Tambah ke Keranjang
                </button>
                <button className="bg-3 px-5 py-2 rounded-[20px] text-black font-medium hover:bg-3/90 transition">
                  Beli Sekarang
                </button>
                <button className="w-7 text-black hover:text-red-500 transition flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
        <section className="w-full py-10">
          <h2 className="text-left text-2xl font-normal text-black mb-4">Best Seller</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
            {bestSellers.length > 0 ? (
              bestSellers.map((product) => renderProductCard(product))
            ) : (
              <p className="text-black/50">No best sellers available.</p>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Detail;