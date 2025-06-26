"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";

const SpecialOffer = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
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

  if (error)
    return <div className="text-red-500 text-center py-10">{error}</div>;
  if (products.length < 2) return null;

  return (
    <section className="bg-white w-full px-6 md:px-16 lg:px-48 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
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
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-base md:text-lg mt-4 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row justify-center items-center gap-8">
        {products.map((product, idx) => (
          <motion.div
            key={product._id}
            className={`flex-shrink-0 basis-[90%] sm:basis-[420px] md:basis-[480px] max-w-[480px] w-full h-[320px] md:h-[320px] overflow-hidden ${
              idx === 0 ? "bg-3" : "bg-2"
            } rounded-2xl flex flex-col justify-between relative p-4 md:p-6`}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div
              className={`absolute top-6 left-6 ${
                idx === 0 ? "bg-4 text-black" : "bg-3 text-black"
              } text-xs px-3 py-1 rounded-[20px]`}
            >
              Flat 25% Diskon
            </div>

            <div className="flex flex-row h-full pt-6 md:pt-8">
              {/* Teks */}
              <div
                className={`flex flex-col justify-between w-1/2 pr-1 md:pr-4 pl-1 md:pl-2 pt-2 md:pt-4 h-full ${
                  idx === 0 ? "text-black" : "text-white"
                }`}
              >
                <div className="flex flex-col flex-1 min-h-0">
                  <h3
                    className={`text-sm md:text-xl lg:text-3xl font-bold leading-snug mb-1 md:mb-2 line-clamp-2 ${
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
                    className={`text-lg md:text-2xl lg:text-4xl font-extrabold mb-3 md:mb-4 ${
                      idx === 0 ? "text-black" : "text-white"
                    }`}
                  >
                    {formatPrice(Math.round(product.price * 0.75))}
                  </span>
                </div>
                <Button
                  href={`/detail/${product._id}`}
                  size="md"
                  className={`hover:scale-105 hover:brightness-110 duration-300 text-xs md:text-sm lg:text-base ${
                    idx === 0 ? "bg-1 text-white" : "bg-3 text-black"
                  } w-full mt-2`}
                >
                  Beli Sekarang
                  <ArrowRight className="ml-2" />
                </Button>
              </div>

              {/* Gambar */}
              <div className="hover:scale-105 duration-300 w-1/2 flex items-center justify-center p-1 md:p-4">
                <Image
                  src={product.imageUrl || "/images/placeholder.png"}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="object-contain h-24 md:h-40 lg:h-56 w-full"
                  quality={100}
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ imageRendering: "auto" }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SpecialOffer;
