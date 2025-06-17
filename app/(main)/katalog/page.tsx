"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Search, Filter, Heart } from "lucide-react";
import Link from "next/link";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import ChatbotWidget from "@/components/ChatbotWidget";

const Katalog = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const categories = ["Pakan Ikan", "Pakan Ternak", "Pakan Ayam", "Pakan Burung"];
  const [isOpenLimbah, setIsOpenLimbah] = useState(false);
  const [isOpenFisik, setIsOpenFisik] = useState(false);
  const [selectedLimbah, setSelectedLimbah] = useState("Bahan dasar limbah");
  const [selectedFisik, setSelectedFisik] = useState("Bentuk fisik");

  const limbahOptions = [
    "Semua bahan dasar",
    "Limbah Laut",
    "Limbah Pertanian",
    "Limbah Sayur & Buah",
    "Limbah Roti & Biji",
    "Limbah Maritim", // Added to match API data
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
        // Filter out products with missing or invalid _id
        const validProducts = data.filter(
          (product: Product) => product._id && typeof product._id === "string"
        );
        console.log("Valid products:", validProducts); // Debug log
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
    const matchesCategory = activeCategory ? product.categoryOptions === activeCategory : true;
    const matchesLimbah =
      selectedLimbah === "Bahan dasar limbah" || selectedLimbah === "Semua bahan dasar"
        ? true
        : product.limbahOptions === selectedLimbah;
    const matchesFisik =
      selectedFisik === "Bentuk fisik" || selectedFisik === "Semua bentuk fisik"
        ? true
        : product.fisikOptions === selectedFisik;
    return matchesCategory && matchesLimbah && matchesFisik;
  });

  const bestSellers = filteredProducts.filter((product: Product) => product.isBestSeller);
  const specialOffers = filteredProducts.filter((product: Product) => product.isSpecialOffer);
  const pakanIkan = filteredProducts.filter(
    (product: Product) => product.categoryOptions === "Pakan Ikan"
  );

  const renderProductCard = (product: Product) => {
    if (!product._id) {
      console.warn("Product missing _id:", product);
      return null;
    }

    return (
      <Link
        href={`/detail/${product._id}`}
        className="flex-shrink-0 w-72 h-[400px]"
        onClick={() => console.log("Navigating to:", `/detail/${product._id}`)}
      >
        <div className="bg-7 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full">
          <div className="w-full flex justify-center items-center mb-6 pt-2 h-60">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain w-full h-full"
            />
          </div>

          <h3 className="text-lg font-semibold text-left text-black">{product.name}</h3>

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
  };

  if (loading) {
    return <div className="text-center py-40">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-40 text-red-500">Error: {error}</div>;
  }

  return (
    <section className="bg-white py-40 w-full">
      <ChatbotWidget />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mb-12"
      >
        <div className="flex items-center justify-center gap-4 mb-10">
          <h2 className="text-4xl font-normal text-black">Cari Pakan</h2>
        </div>
        <p className="text-black/50 max-w-2xl mb-10">
          Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli
          pakan, bantu bumi.
        </p>
        <div className="flex flex-wrap gap-8 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              href=""
              size="md"
              className={`mb-2 px-12 ${activeCategory === category ? "bg-1 text-white" : "bg-2 text-white"
                }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        <div className="w-full flex flex-col md:flex-row gap-6 md:gap-8 mt-4 mb-14">
          <div className="flex items-center gap-3 bg-6 rounded-full px-5 py-3 w-full md:w-1/2">
            <Search className="w-5 h-5 text-black/50" />
            <input
              type="text"
              placeholder="Cari pakan…"
              className="bg-transparent outline-none text-black/80 placeholder:text-black/50 w-full"
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
        <section className="w-full py-10">
          <h2 className="text-left text-2xl font-normal text-black mb-4">Best Seller</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
            {bestSellers.length > 0 ? (
              bestSellers.map((product: Product) => renderProductCard(product))
            ) : (
              <p className="text-black/50">No best sellers available.</p>
            )}
          </div>
        </section>
        <section className="w-full py-10">
          <h2 className="text-left text-2xl font-normal text-black mb-4">Special Offer</h2>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
            {specialOffers.length > 0 ? (
              specialOffers.map((product: Product) => renderProductCard(product))
            ) : (
              <p className="text-black/50">No special offers available.</p>
            )}
          </div>
        </section>
        <section className="w-full py-10">
          <h2 className="text-left text-2xl font-normal text-black mb-4">
            Rekomendasi untuk Pakan Ikan
          </h2>
          <div className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar">
            {pakanIkan.length > 0 ? (
              pakanIkan.map((product: Product) => renderProductCard(product))
            ) : (
              <p className="text-black/50">No products available for Pakan Ikan.</p>
            )}
          </div>
        </section>
      </motion.div>
    </section>
  );
};

export default Katalog;