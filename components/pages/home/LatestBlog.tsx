"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Send, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const LatestBlog = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="w-full px-50 py-16 bg-white">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }} className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-normal text-black">
          Latest Blog
        </h2>
        <a
          href="/artikel"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-lg mb-8 px-4 py-2 bg-transparent hover:underline pt-12"
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </a>
      </motion.div>

      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }} className="flex overflow-x-auto gap-6 pb-4 hide-scrollbar mb-60">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-7 flex-shrink-0 w-80 rounded-2xl p-4 flex flex-col group transition-all duration-300"
          >
            {/* Gambar utama */}
            <div className="w-full h-44 relative mb-4 rounded-xl overflow-hidden">
              <Image
                src="/images/home/latestBlog.png"
                alt="Blog"
                fill
                className="object-cover"
              />
            </div>

            {/* Jam dan waktu */}
            <div className="flex items-center text-sm text-black/50 mb-2">
              <Clock size={16} className="mr-2" />
              <span>Minggu lalu</span>
            </div>

            {/* Judul artikel */}
            <h3 className="text-base font-semibold text-black mb-2 leading-snug">
              Mengubah Limbah Jadi Cuan: Cara Buat Pakan Ternak Sendiri dari Sisa Dapur
            </h3>

            {/* Teks tambahan dengan animasi */}
            <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out mb-4">
              <p className="text-sm text-black/40">
                Pelajari cara sederhana mengubah kulit pisang, sayuran busuk, dan sisa sayur lainnya menjadi pakan ayam organik yang sehat dan hemat biaya
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
              {/* Avatar dan nama */}
              <div className="flex items-center">
                <Image
                  src="/images/home/avatar.png"
                  alt="Author"
                  width={30}
                  height={30}
                  className="rounded-full mr-2"
                />
                <span className="text-sm text-black">Azimah Al-Huda</span>
              </div>

              {/* Tombol buka */}
              <button className="p-2 hover:scale-110 transition">
                <Send size={16} className="text-[#919199]" />
              </button>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default LatestBlog;