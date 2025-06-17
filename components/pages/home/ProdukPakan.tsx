"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight, Heart } from "lucide-react";
import Button from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";

const ProdukPakan = () => {
  const [activeCategory, setActiveCategory] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Pakan Ikan", "Pakan Ternak", "Pakan Ayam", "Pakan Burung"];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        const validProducts = data.filter((product: Product) => product._id && typeof product._id === "string");
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
          <div className="w-full flex justify-center items-center mb-6 pt-2 h-60">
            <Image
              src={product.imageUrl || "/images/placeholder.png"}
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
              ★ <span className="text-black/60">({product.rating ?? "0.0"})</span>
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

  // Filter dan batasi 6 produk dari kategori aktif
  const filteredProducts = activeCategory
    ? products.filter((product) => product.categoryOptions === activeCategory).slice(0, 6)
    : products.slice(0, 6); // Jika tidak ada kategori aktif, tampilkan 6 pertama

  return (
    <section className="bg-white w-full px-48 py-10">
      <motion.h2
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text3xl md:text-4xl font-normal text-black mb-4"
      >
        Produk Pakan
      </motion.h2>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-wrap gap-8 mb-6"
      >
        {categories.map((category) => (
          <Button
            key={category}
            href=""
            size="md"
            className={`mb-2 px-12 ${
              activeCategory === category ? "bg-1 text-white" : "bg-2 text-white"
            }`}
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory(category);
            }}
          >
            {category}
          </Button>
        ))}
      </motion.div>

      <div className="flex justify-end mb-2">
        <motion.a
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          href="/katalog"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-lg px-4 py-2 bg-transparent hover:underline"
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>

      {loading ? (
        <p className="text-black/60 text-center">Memuat produk...</p>
      ) : error ? (
        <p className="text-red-500 text-center">Gagal: {error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-black/60 text-center">Tidak ada produk untuk kategori ini.</p>
      ) : (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full max-w-screen-xl"
        >
          {filteredProducts.map(renderProductCard)}
        </motion.div>
      )}
    </section>
  );
};

export default ProdukPakan;
