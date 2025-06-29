"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Loading Skeleton for Special Offer Cards
const SpecialOfferCardSkeleton = ({ index }: { index: number }) => (
  <div
    className={`flex-shrink-0 w-full max-w-[480px] h-[280px] sm:h-[320px] overflow-hidden ${
      index === 0 ? "bg-3" : "bg-2"
    } rounded-2xl flex flex-col justify-between relative p-4 md:p-6 animate-pulse`}
  >
    <div
      className={`absolute top-4 left-4 md:top-6 md:left-6 ${
        index === 0 ? "bg-4 text-black" : "bg-3 text-black"
      } text-xs px-3 py-1 rounded-[20px]`}
    >
      Flat 25% Diskon
    </div>

    <div className="flex flex-row h-full pt-12 md:pt-16">
      {/* Teks */}
      <div className="flex flex-col justify-between w-1/2 pr-2 md:pr-4 h-full">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="h-4 sm:h-6 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 sm:h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-6 sm:h-8 bg-gray-300 rounded mb-4"></div>
        </div>
        <div className="h-8 sm:h-10 bg-gray-300 rounded w-full mt-2"></div>
      </div>

      {/* Gambar */}
      <div className="w-1/2 flex items-center justify-center">
        <div className="w-full aspect-square bg-gray-300 rounded"></div>
      </div>
    </div>
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
              className={`w-full h-[280px] sm:h-[320px] overflow-hidden ${
                idx === 0 ? "bg-3" : "bg-2"
              } rounded-2xl flex flex-col justify-between relative p-4 md:p-6`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div
                className={`absolute top-4 left-4 md:top-6 md:left-6 ${
                  idx === 0 ? "bg-4 text-black" : "bg-3 text-black"
                } text-xs px-3 py-1 rounded-[20px]`}
              >
                Flat 25% Diskon
              </div>

              <div className="flex flex-row h-full pt-12 md:pt-16">
                {/* Teks */}
                <div
                  className={`flex flex-col justify-between w-1/2 pr-2 md:pr-4 h-full ${
                    idx === 0 ? "text-black" : "text-white"
                  }`}
                >
                  <div className="flex flex-col flex-1 min-h-0">
                    <h3
                      className={`text-sm md:text-xl lg:text-2xl font-bold leading-snug mb-1 md:mb-2 line-clamp-2 ${
                        idx === 0 ? "text-black" : "text-white"
                      }`}
                    >
                      {product.name}
                    </h3>
                    <span
                      className={`text-xs md:text-sm lg:text-base mb-1 md:mb-2 line-through ${
                        idx === 0 ? "text-black/60" : "text-white/60"
                      }`}
                    >
                      {formatPrice(product.price)}
                    </span>
                    <span
                      className={`text-lg md:text-2xl lg:text-3xl font-extrabold mb-3 md:mb-4 ${
                        idx === 0 ? "text-black" : "text-white"
                      }`}
                    >
                      {formatPrice(Math.round(product.price * 0.75))}
                    </span>
                  </div>
                  <Button
                    href={`/detail/${product._id}`}
                    size="sm"
                    className={`hover:scale-105 hover:brightness-110 duration-300 text-xs md:text-sm lg:text-base px-3 py-1 md:px-4 md:py-2 ${
                      idx === 0 ? "bg-1 text-white" : "bg-3 text-black"
                    } w-full mt-2`}
                  >
                    Beli Sekarang
                    <ArrowRight className="ml-1 md:ml-2 w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </div>

                {/* Gambar */}
                <div className="w-1/2 flex items-center justify-center">
                  <div className="w-full aspect-square relative">
                    <Image
                      src={product.imageUrl || "/images/placeholder.png"}
                      alt={product.name}
                      fill
                      className="object-contain hover:scale-105 duration-300"
                      quality={100}
                      sizes="(max-width: 768px) 50vw, 200px"
                    />
                  </div>
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
