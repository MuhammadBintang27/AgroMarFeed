"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../../ui/Button";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ButtonLoading from "../../ui/ButtonLoading";
import { useRouter } from "next/navigation";

const BestSeller = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const router = useRouter();

  // Function to truncate text with ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    fetchProducts()
      .then((products) => {
        if (!ignore && products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          const selectedProduct = products[randomIndex];
          console.log("BestSeller - Selected product:", selectedProduct);
          console.log(
            "BestSeller - Product image URL:",
            selectedProduct.imageUrl
          );
          setProduct(selectedProduct);
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

  // Debug logging
  console.log("BestSeller - Loading:", loading);
  console.log("BestSeller - Product:", product);
  console.log("BestSeller - Error:", error);

  return (
    <section className="bg-white py-20 md:py-30">
      <div className="px-6 md:px-20 lg:px-40 mx-auto">
        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl md:text-6xl font-normal leading-tight whitespace-pre-line text-[#F7AB31] mb-6"
          >
            BEST{"\n"}SELLER!
          </motion.h1>

          {/* Mobile Image */}
          <motion.div
            className="flex justify-center mb-6 w-full"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {loading ? (
              <div className="w-full max-w-xs h-80 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : product && product.imageUrl ? (
              <div className="w-full max-w-xs h-80 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={320}
                  height={320}
                  className="hover:scale-105 duration-300 object-contain max-w-full max-h-full"
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    imageRendering: "auto",
                    objectFit: "contain",
                  }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            ) : (
              <div className="w-full max-w-xs h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gambar tidak tersedia</p>
              </div>
            )}
          </motion.div>

          {/* Mobile Content */}
          <motion.div
            className="flex flex-col gap-6 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <LoadingSpinner size="lg" text="Memuat produk terbaik..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Coba Lagi
                </button>
              </div>
            ) : product ? (
              <>
                <p className="text-base md:text-xl text-gray-700 whitespace-pre-line mb-4 leading-relaxed">
                  {truncateText(product.description, 150)}
                </p>
                <div className="flex justify-center">
                  {buttonLoading ? (
                    <ButtonLoading size="md" color="yellow" text="Menuju Detail..." className="mb-6" />
                  ) : (
                    <Button
                      size="md"
                      className="hover:scale-105 hover:brightness-110 duration-300 bg-1 text-white mb-6"
                      onClick={() => {
                        setButtonLoading(true);
                        setTimeout(() => {
                          router.push(`/detail/${product._id}`);
                          setButtonLoading(false);
                        }, 800);
                      }}
                    >
                      Lihat Produk
                      <ArrowRight className="ml-2" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-gray-500">Tidak ada produk tersedia</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-2 items-center gap-12">
          {/* Left Column */}
          <motion.div
            className="flex flex-col gap-6 md:pl-12 text-center md:text-left"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-6xl font-normal leading-tight whitespace-pre-line text-[#F7AB31]">
              BEST{"\n"}SELLER!
            </h1>
            {loading ? (
              <div className="flex flex-col items-center md:items-start gap-4">
                <LoadingSpinner size="lg" text="Memuat produk terbaik..." />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center md:items-start gap-4">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Coba Lagi
                </button>
              </div>
            ) : product ? (
              <>
                <p className="text-base md:text-xl text-gray-700 whitespace-pre-line mb-4 leading-relaxed">
                  {truncateText(product.description, 200)}
                </p>
                <div className="flex justify-center md:justify-start">
                  {buttonLoading ? (
                    <ButtonLoading size="md" color="yellow" text="Menuju Detail..." className="mb-6" />
                  ) : (
                    <Button
                      size="md"
                      className="hover:scale-105 hover:brightness-110 duration-300 bg-1 text-white mb-6"
                      onClick={() => {
                        setButtonLoading(true);
                        setTimeout(() => {
                          router.push(`/detail/${product._id}`);
                          setButtonLoading(false);
                        }, 800);
                      }}
                    >
                      Lihat Produk
                      <ArrowRight className="ml-2" />
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center md:items-start gap-4">
                <p className="text-gray-500">Tidak ada produk tersedia</p>
              </div>
            )}
          </motion.div>

          {/* Right Column */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {loading ? (
              <div className="w-full max-w-xs md:max-w-md h-64 md:h-120 bg-gray-200 rounded-lg animate-pulse flex items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : product && product.imageUrl ? (
              <div className="relative w-full max-w-xs md:max-w-md h-64 md:h-120 overflow-hidden rounded-lg">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="hover:scale-105 duration-300 object-contain"
                  priority
                  quality={100}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{
                    imageRendering: "auto",
                    objectFit: "contain",
                  }}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            ) : (
              <div className="w-full max-w-xs md:max-w-md h-64 md:h-120 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Gambar tidak tersedia</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
