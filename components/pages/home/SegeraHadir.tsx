"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SegeraHadir = () => {

  return (
<section className="bg-white w-full py-20 px-4 flex justify-center">
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, delay: 0.1 }}
    className="bg-1 w-full max-w-5xl rounded-[25px] flex flex-col md:flex-row overflow-hidden md:gap-0"
  >
    {/* Bagian Gambar */}
    <div className="w-full md:w-1/2 flex md:items-end md:justify-start relative md:h-[395px] h-auto">
      <div className="relative w-full h-56 md:h-full">
        <Image
          src="/images/home/segeraHadir.png"
          alt="Segera Hadir"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    </div>

    {/* Bagian Teks */}
    <div className="w-full md:w-1/2 flex flex-col items-center md:items-end justify-center text-center md:text-right px-6 py-8 md:py-12 gap-2 md:gap-4">
      <h2 className="text-white text-3xl md:text-5xl font-bold">Segera Hadir!</h2>
      <p className="text-white text-base md:text-lg">Pakan Jumbo, Harga Lebih Hemat</p>
      <p className="text-[#F7AB31] text-5xl md:text-7xl font-semibold">30 Kg</p>
      <p className="text-white/70 text-sm max-w-xs">
        Peternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
      </p>
    </div>
  </motion.div>
</section>



  );
};

export default SegeraHadir;