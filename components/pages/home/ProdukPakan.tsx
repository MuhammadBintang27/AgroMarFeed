"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const ProdukPakan = () => {
  const [activeCategory, setActiveCategory] = useState("");

  const categories = ["Pakan Ikan", "Pakan Ternak", "Pakan Ayam", "Pakan Burung"];

  return (
    <section className="bg-white w-full px-48 py-10">
      {/* Judul */}
      <motion.h2
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="text3xl md:text-4xl font-normal text-black mb-4">
        Produk Pakan
      </motion.h2>

      {/* Tombol Kategori */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-wrap gap-8 mb-6">
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
      </motion.div>

      {/* Link Lihat Semua */}
      <div className="flex justify-end mb-2">
        <motion.a
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          href="/catalog"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-lg px-4 py-2 bg-transparent hover:underline"
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 w-full max-w-screen-xl">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-7 rounded-2xl p-4 flex flex-col">
            {/* Gambar Produk */}
            <div className="w-full flex justify-center mb-4 pt-8">
              <Image
                src="/images/home/specialOffer1.png"
                alt="Produk"
                width={150}
                height={120}
                className="object-contain"
              />
            </div>

            {/* Judul Produk */}
            <h3 className="text-lg font-semibold text-left mb-2 text-black">
              Scratch & Peck Feeds
            </h3>

            {/* Keterangan + Rating */}
            <div className="flex justify-between text-sm text-black/30 mb-2 px-1">
              <span>Pakan ternak ayam</span>
              <span className="flex items-center gap-1 text-yellow-500 text-[16px]">
                ★ <span className="text-black/60">(4.5)</span>
              </span>
            </div>

            {/* Harga + Aksi */}
            <div className="flex justify-between items-center px-1">
              <span className="text-base font-semibold text-black">Rp120RB</span>
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
        ))}
      </motion.div>

    </section>
  );
};

export default ProdukPakan;
