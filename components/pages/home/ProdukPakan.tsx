"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import WishlistButton from "@/components/ui/WishlistButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5 sm:gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative w-3 h-3 sm:w-4 sm:h-4">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 absolute"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="absolute overflow-hidden w-1.5 h-3 sm:w-2 sm:h-4">
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Mobile Single Star Rating Component
const MobileRatingStar = ({ rating }: { rating: number }) => {
  const hasRating = rating > 0;

  return (
    <svg
      className="w-3 h-3 text-yellow-500"
      fill={hasRating ? "currentColor" : "none"}
      stroke={hasRating ? "currentColor" : "currentColor"}
      strokeWidth={hasRating ? "0" : "1.5"}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

// Category Icon Component
const CategoryIcon = ({ category }: { category: string }) => {
  const getCategoryImage = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "ruminansia":
        return "/images/kategori/Ruminansia.png";
      case "non-ruminansia":
        return "/images/kategori/Non-ruminansia.png";
      case "akuakultur":
        return "/images/kategori/Akuakultur.png";
      default:
        return "/images/kategori/Ruminansia.png"; // default fallback
    }
  };

  return (
    <Image
      src={getCategoryImage(category)}
      alt={category}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Limbah Icon Component
const LimbahIcon = ({ limbah }: { limbah: string }) => {
  const getLimbahImage = (limbahName: string) => {
    switch (limbahName.toLowerCase()) {
      case "limbah pertanian":
        return "/images/kategori/LimbahPertanian.png";
      case "limbah kelautan":
        return "/images/kategori/LimbahKelautan.png";
      default:
        return "/images/kategori/LimbahPertanian.png"; // default fallback
    }
  };

  return (
    <Image
      src={getLimbahImage(limbah)}
      alt={limbah}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Fisik Icon Component
const FisikIcon = ({ fisik }: { fisik: string }) => {
  const getFisikImage = (fisikName: string) => {
    // Remove spaces and convert to proper format
    const formattedName = fisikName.replace(/\s+/g, "");
    return `/images/kategori/${formattedName}.png`;
  };

  return (
    <Image
      src={getFisikImage(fisik)}
      alt={fisik}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Loading Skeleton for Product Cards
const ProductCardSkeleton = () => (
  <div className="bg-7 rounded-2xl p-4 flex flex-col justify-between h-full animate-pulse">
    <div className="w-full flex justify-center items-center mb-4 pt-2 h-36 md:h-60">
      <div className="w-full h-full bg-gray-300 rounded-lg"></div>
    </div>
    <div className="h-4 bg-gray-300 rounded mb-2"></div>
    <div className="flex justify-between mb-1">
      <div className="h-3 bg-gray-300 rounded w-16"></div>
      <div className="h-3 bg-gray-300 rounded w-12"></div>
    </div>
    <div className="h-4 bg-gray-300 rounded w-20"></div>
  </div>
);

const ProdukPakan = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = [
    { label: "Ruminansia", image: "/images/kategori/Ruminansia.png" },
    { label: "Non-ruminansia", image: "/images/kategori/Non-ruminansia.png" },
    { label: "Akuakultur", image: "/images/kategori/Akuakultur.png" },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        const validProducts = data.filter(
          (product: Product) => product._id && typeof product._id === "string"
        );
        setProducts(validProducts);
      } catch (err: any) {
        setError(err.message || "Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const renderProductCard = (product: Product) => {
    if (!product._id) return null;

    return (
      <Link
        key={product._id}
        href={`/detail/${product._id}`}
        className="flex-shrink-0"
        onClick={() => console.log("Navigating to:", `/detail/${product._id}`)}
      >
        <div className="bg-7 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full">
          <div className="w-full flex justify-center items-center mb-4 pt-2 h-36 md:h-60">
            <Image
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain w-full h-full"
            />
          </div>

          <h3 className="text-sm md:text-base font-semibold text-left text-black leading-tight">
            {product.name}
          </h3>

          <div className="flex justify-between text-xs md:text-sm text-black/40 mb-1 px-1">
            <span className="flex items-center gap-1">
              <CategoryIcon category={product.categoryOptions} />
              {product.limbahOptions && (
                <LimbahIcon limbah={product.limbahOptions} />
              )}
              {product.fisikOptions && (
                <FisikIcon fisik={product.fisikOptions} />
              )}
            </span>
            <span className="flex items-center gap-1 text-yellow-500 text-[12px] md:text-[14px]">
              {/* Mobile: Single star, Desktop: Full stars */}
              <div className="sm:hidden">
                <MobileRatingStar rating={product.rating || 0} />
              </div>
              <div className="hidden sm:block">
                <RatingStars rating={product.rating || 0} />
              </div>
              <span className="text-black/60">
                ({product.rating?.toFixed(1) || "0.0"})
              </span>
            </span>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-sm md:text-base font-semibold text-black">
              Rp{product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  // Filter dan batasi 6 produk random jika tidak ada kategori aktif
  const filteredProducts = activeCategory
    ? products
        .filter((product) => product.categoryOptions === activeCategory)
        .slice(0, 6)
    : (() => {
        // Ambil 6 produk random dari semua produk
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6);
      })();

  return (
    <section className="bg-white w-full px-6 md:px-16 lg:px-48 py-10">
      <motion.h2
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-3xl md:text-4xl font-normal text-black mb-4"
      >
        Produk Pakan
      </motion.h2>

      {/* Tombol kategori */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex overflow-x-auto flex-nowrap gap-x-4 mb-6 pb-2 -mx-2 md:mx-0 md:flex-wrap md:overflow-visible md:gap-4"
      >
        {categories.map((category) => (
          <Button
            key={category.label}
            href=""
            size="sm"
            className={`hover:brightness-110 whitespace-nowrap text-xs md:text-sm px-4 py-2 flex items-center gap-2 ${
              activeCategory === category.label
                ? "bg-1 text-white"
                : "bg-2 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory(
                activeCategory === category.label ? "" : category.label
              );
            }}
          >
            <Image
              src={category.image}
              alt={category.label}
              width={24}
              height={24}
              className="object-contain w-8 h-8"
            />
            {category.label}
          </Button>
        ))}
      </motion.div>

      {/* Lihat semua */}
      <div className="flex justify-end mb-4">
        <motion.a
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          href="/katalog"
          className="inline-flex items-center gap-2 text-black/40 text-base hover:scale-105 duration-300"
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>

      {/* Produk */}
      {loading ? (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4 w-full max-w-screen-xl"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </motion.div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">Gagal: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Coba Lagi
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-black/60 mb-4">
            Tidak ada produk untuk kategori ini.
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-4 w-full max-w-screen-xl"
        >
          {filteredProducts.map((product) => (
            <Link
              key={product._id}
              href={`/detail/${product._id}`}
              className="flex-shrink-0"
            >
              <div className="bg-7 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full">
                <div className="w-full flex justify-center items-center mb-4 pt-2 h-36 md:h-60">
                  <Image
                    src={product.imageUrl || "/images/placeholder.png"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                  />
                </div>

                <h3 className="text-sm md:text-base font-semibold text-left text-black leading-tight">
                  {product.name}
                </h3>

                <div className="flex justify-between text-xs md:text-sm text-black/40 mb-1 px-1">
                  <span className="flex items-center gap-1">
                    <CategoryIcon category={product.categoryOptions} />
                    {product.limbahOptions && (
                      <LimbahIcon limbah={product.limbahOptions} />
                    )}
                    {product.fisikOptions && (
                      <FisikIcon fisik={product.fisikOptions} />
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500 text-[12px] md:text-[14px]">
                    {/* Mobile: Single star, Desktop: Full stars */}
                    <div className="sm:hidden">
                      <MobileRatingStar rating={product.rating || 0} />
                    </div>
                    <div className="hidden sm:block">
                      <RatingStars rating={product.rating || 0} />
                    </div>
                    <span className="text-black/60">
                      ({product.rating?.toFixed(1) || "0.0"})
                    </span>
                  </span>
                </div>

                <div className="flex justify-between items-center px-1">
                  <span className="text-sm md:text-base font-semibold text-black">
                    Rp{product.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      )}
    </section>
  );
};

export default ProdukPakan;
