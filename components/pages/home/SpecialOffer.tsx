"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";

// Loading Skeleton for Special Offer Cards
const SpecialOfferCardSkeleton = ({ index }: { index: number }) => (
  <div
    className={`flex-shrink-0 w-full max-w-[480px] overflow-hidden ${
      index === 0 ? "bg-3" : "bg-2"
    } rounded-2xl flex flex-row relative animate-pulse`}
  >
    {/* Kolom Kiri - Teks */}
    <div className="w-1/2 p-4 md:p-6 flex flex-col justify-between">
      <div className="flex flex-col">
        <div className="h-6 bg-gray-300 rounded mb-2 w-24"></div>
        <div className="h-4 sm:h-6 bg-gray-300 rounded mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-6 sm:h-8 bg-gray-300 rounded mb-4"></div>
      </div>
      <div className="h-10 bg-gray-300 rounded w-full"></div>
    </div>

    {/* Kolom Kanan - Gambar */}
    <div className="w-1/2 h-48 bg-gray-300"></div>
  </div>
);

const SpecialOffer = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchProducts()
      .then((all) => {
        if (!ignore && all.length > 0) {
          // Shuffle and pick 2 random products
          const shuffled = all.sort(() => 0.5 - Math.random());
          setProducts(shuffled.slice(0, 2));
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Gagal memuat produk");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  // Helper untuk format harga
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);

  return (
    <section className="bg-white w-full px-6 md:px-16 lg:px-48 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <motion.h2
          className="text-2xl md:text-4xl font-normal text-black"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Special Offer
        </motion.h2>

        <motion.a
          href="/katalog"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-base md:text-lg mt-4 md:mt-0 self-end md:self-auto hover:scale-105 duration-300"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 2 }).map((_, index) => (
            <SpecialOfferCardSkeleton key={index} index={index} />
          ))
        ) : error ? (
          // Error state
          <div className="w-full text-center py-10 col-span-1 lg:col-span-2">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Coba Lagi
            </button>
          </div>
        ) : products.length < 2 ? (
          // Not enough products
          <div className="w-full text-center py-10 col-span-1 lg:col-span-2">
            <p className="text-gray-500">
              Tidak cukup produk untuk special offer
            </p>
          </div>
        ) : (
          // Actual products
          products.map((product, idx) => (
            <motion.div
              key={product._id}
              className={`w-full overflow-hidden ${
                idx === 0 ? "bg-3" : "bg-2"
              } rounded-2xl flex flex-row relative`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Kolom Kiri - Teks */}
              <div
                className={`w-1/2 p-4 md:p-6 flex flex-col justify-between ${
                  idx === 0 ? "text-black" : "text-white"
                }`}
              >
                <div className="flex flex-col">
                  {/* Badge Diskon */}
                  <div
                    className={`inline-block w-fit ${
                      idx === 0 ? "bg-4 text-black" : "bg-3 text-black"
                    } text-xs px-3 py-1 rounded-[20px] mb-3`}
                  >
                    Flat 25% Diskon
                  </div>

                  {/* Nama Produk */}
                  <h3
                    className={`text-sm md:text-xl lg:text-2xl font-bold leading-snug mb-2 ${
                      idx === 0 ? "text-black" : "text-white"
                    }`}
                  >
                    {product.name}
                  </h3>

                  {/* Harga Coret */}
                  <span
                    className={`text-xs md:text-sm lg:text-base line-through mb-1 ${
                      idx === 0 ? "text-black/60" : "text-white/60"
                    }`}
                  >
                    {formatPrice(product.price)}
                  </span>

                  {/* Harga Setelah Diskon */}
                  <span
                    className={`text-2xl md:text-4xl lg:text-5xl font-black mb-4 ${
                      idx === 0 ? "text-black" : "text-white"
                    } drop-shadow-sm`}
                  >
                    {formatPrice(Math.round(product.price * 0.75))}
                  </span>
                </div>

                {/* Tombol Beli Sekarang */}
                <Link
                  href={`/detail/${product._id}`}
                  className={`inline-flex items-center justify-center gap-2 text-xs md:text-sm lg:text-base px-4 py-2 rounded-[25px] font-medium transition-all duration-300 hover:scale-105 ${
                    idx === 0
                      ? "bg-1 text-white hover:bg-1/90"
                      : "bg-3 text-black hover:bg-3/90"
                  }`}
                >
                  Beli Sekarang
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                </Link>
              </div>

              {/* Kolom Kanan - Gambar */}
              <div className="w-1/2 flex items-center justify-center">
                <div className="relative w-full h-56">
                  <Image
                    src={product.imageUrl || "/images/placeholder.png"}
                    alt={product.name}
                    fill
                    className="object-contain"
                    quality={100}
                    sizes="(max-width: 768px) 50vw, 400px"
                  />
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
};

export default SpecialOffer;
