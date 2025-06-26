"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Search, Filter, Heart } from "lucide-react";
import Link from "next/link";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import ChatbotWidget from "@/components/ChatbotWidget";
import WishlistButton from "@/components/ui/WishlistButton";

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          <svg
            className="w-4 h-4 text-gray-300 absolute"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="absolute overflow-hidden w-2 h-4">
            <svg
              className="w-4 h-4 text-yellow-500"
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
          className="w-4 h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const Katalog = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categories = [
    { label: "Ruminansia", image: "/images/kategori/Ruminansia.png" },
    { label: "Non-ruminansia", image: "/images/kategori/Non-ruminansia.png" },
    { label: "Akuakultur", image: "/images/kategori/Akuakultur.png" },
  ];
  const [isOpenLimbah, setIsOpenLimbah] = useState(false);
  const [isOpenFisik, setIsOpenFisik] = useState(false);
  const [selectedLimbah, setSelectedLimbah] = useState("Bahan dasar limbah");
  const [selectedFisik, setSelectedFisik] = useState("Bentuk fisik");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  const limbahOptions = [
    "Semua bahan dasar",
    "Limbah Pertanian",
    "Limbah Kelautan",
  ];

  const fisikOptions = [
    "Semua bentuk fisik",
    "Pelet",
    "Fermentasi Padat",
    "Serbuk",
    "Granul Kasar",
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        const validProducts = data.filter(
          (product: Product) => product._id && typeof product._id === "string"
        );
        setProducts(validProducts);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product: Product) => {
    const matchesCategory = activeCategory
      ? product.categoryOptions === activeCategory
      : true;
    const matchesLimbah =
      selectedLimbah === "Bahan dasar limbah" ||
      selectedLimbah === "Semua bahan dasar"
        ? true
        : product.limbahOptions === selectedLimbah;
    const matchesFisik =
      selectedFisik === "Bentuk fisik" || selectedFisik === "Semua bentuk fisik"
        ? true
        : product.fisikOptions === selectedFisik;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesLimbah && matchesFisik && matchesSearch;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const renderProductCard = (product: Product) => {
    if (!product._id) return null;

    return (
      <Link
        href={`/detail/${product._id}`}
        className="flex-shrink-0 w-full sm:w-72 h-[400px]"
      >
        <div className="bg-7 rounded-2xl p-2 sm:p-3 md:p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full">
          <div className="w-full flex justify-center items-center mb-2 sm:mb-3 md:mb-4 pt-1 sm:pt-2 h-24 sm:h-32 md:h-44">
            <Image
              src={product.imageUrl || "/images/placeholder.png"}
              alt={product.name}
              width={120}
              height={120}
              className="object-contain w-full h-full"
            />
          </div>
          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-left text-black leading-tight mb-0.5 sm:mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex justify-between text-[10px] sm:text-xs md:text-sm text-black/40 mb-0.5 sm:mb-1 px-0.5 sm:px-1">
            <span className="truncate max-w-[48px] sm:max-w-[80px] md:max-w-none">
              {product.categoryOptions}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <span className="scale-90 sm:scale-100">
                <RatingStars rating={product.rating || 0} />
              </span>
              <span className="text-black/60">
                ({product.rating?.toFixed(1) || "0.0"})
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center px-0.5 sm:px-1">
            <span className="text-xs sm:text-sm md:text-base font-semibold text-black">
              Rp{product.price.toLocaleString()}
            </span>
            <div className="flex items-center">
              <WishlistButton productId={product._id} />
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) return <div className="text-center py-40">Loading...</div>;
  if (error)
    return <div className="text-center py-40 text-red-500">Error: {error}</div>;

  return (
    <section className="bg-white py-20 sm:py-40 w-full">
      <ChatbotWidget />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-6xl px-4 mx-auto flex flex-col items-center text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-normal text-black mb-6">
          Cari Pakan
        </h2>
        <p className="text-black/50 max-w-2xl mb-10">
          Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
          hingga 30%! Beli pakan, bantu bumi.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {categories.map((category) => (
            <Button
              key={category.label}
              href=""
              size="md"
              className={`px-6 flex items-center gap-2 ${
                activeCategory === category.label
                  ? "bg-1 text-white"
                  : "bg-2 text-white"
              }`}
              onClick={() => setActiveCategory(category.label)}
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
        </div>
        <div className="w-full flex flex-col md:flex-row gap-4 md:gap-8 mt-4 mb-14">
          <div className="flex items-center gap-3 bg-6 rounded-full px-5 py-3 w-full md:w-1/2">
            <Search className="w-5 h-5 text-black/50" />
            <input
              type="text"
              placeholder="Cari pakan…"
              className="bg-transparent outline-none text-black/80 placeholder:text-black/50 w-full"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearchTerm(searchInput);
                }
              }}
            />
          </div>
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setIsOpenLimbah(!isOpenLimbah)}
              className="flex items-center justify-between gap-3 bg-2 text-white rounded-full px-5 py-3 w-full md:w-max"
            >
              <span>{selectedLimbah}</span>
              <Filter className="w-4 h-4" />
            </button>
            {isOpenLimbah && (
              <ul className="absolute z-10 mt-2 bg-[#3B3B3B]/50 rounded-xl shadow-md w-56">
                {limbahOptions.map((option) => (
                  <li
                    key={option}
                    className="px-4 py-2 hover:bg-[#353535]/50 cursor-pointer text-white"
                    onClick={() => {
                      setSelectedLimbah(option);
                      setIsOpenLimbah(false);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative w-full md:w-auto">
            <button
              onClick={() => setIsOpenFisik(!isOpenFisik)}
              className="flex items-center justify-between gap-3 bg-2 text-white rounded-full px-5 py-3 w-full md:w-max"
            >
              <span>{selectedFisik}</span>
              <Filter className="w-4 h-4" />
            </button>
            {isOpenFisik && (
              <ul className="absolute z-10 mt-2 bg-[#3B3B3B]/50 rounded-xl shadow-md w-56">
                {fisikOptions.map((option) => (
                  <li
                    key={option}
                    className="px-4 py-2 hover:bg-[#353535]/50 cursor-pointer text-white"
                    onClick={() => {
                      setSelectedFisik(option);
                      setIsOpenFisik(false);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <section className="w-full py-10 px-4 md:px-0">
          <h2 className="text-left text-2xl font-semibold text-black mb-6">
            {activeCategory || "Semua Produk"}
          </h2>

          {displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {displayedProducts.map((product: Product) => (
                  <Link
                    key={product._id}
                    href={`/detail/${product._id}`}
                    className="flex-shrink-0 w-full"
                  >
                    <div className="bg-7 rounded-2xl p-2 sm:p-3 md:p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full">
                      <div className="w-full flex justify-center items-center mb-2 sm:mb-3 md:mb-4 pt-1 sm:pt-2 h-24 sm:h-32 md:h-44">
                        <Image
                          src={product.imageUrl || "/images/placeholder.png"}
                          alt={product.name}
                          width={120}
                          height={120}
                          className="object-contain w-full h-full"
                        />
                      </div>

                      <h3 className="text-xs sm:text-sm md:text-base font-semibold text-left text-black leading-tight mb-0.5 sm:mb-1 line-clamp-2">
                        {product.name}
                      </h3>

                      <div className="flex justify-between text-[10px] sm:text-xs md:text-sm text-black/40 mb-0.5 sm:mb-1 px-0.5 sm:px-1">
                        <span className="truncate max-w-[48px] sm:max-w-[80px] md:max-w-none">
                          {product.categoryOptions}
                        </span>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <span className="scale-90 sm:scale-100">
                            <RatingStars rating={product.rating || 0} />
                          </span>
                          <span className="text-black/60">
                            ({product.rating?.toFixed(1) || "0.0"})
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center px-0.5 sm:px-1">
                        <span className="text-xs sm:text-sm md:text-base font-semibold text-black">
                          Rp{product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          <WishlistButton productId={product._id} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {visibleCount < filteredProducts.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-2 rounded-full bg-1 text-white font-semibold hover:brightness-110 shadow-md"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-black/50 mt-6 text-center">
              Tidak ada produk ditemukan.
            </p>
          )}
        </section>
      </motion.div>
    </section>
  );
};

export default Katalog;
