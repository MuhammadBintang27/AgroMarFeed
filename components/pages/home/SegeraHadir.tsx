"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const SegeraHadir = () => {

  return (
    <section className="bg-white w-full py-30 flex justify-center">
      <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-1 w-full max-w-5xl h-[395px] rounded-[25px] flex overflow-hidden">
        {/* Bagian Kiri: Gambar */}
        <div className="w-1/2 relative flex items-end justify-start">
          <div
            className="absolute bottom-[-130px] left-[-110px]"
          >
            <Image
              src="/images/home/segeraHadir.png"
              alt="Segera Hadir"
              width={978}
              height={395}
              className="object-contain"
            />
          </div>
        </div>

        {/* Bagian Kanan: Teks */}
        <div className="w-1/2 flex flex-col items-end justify-center pr-12 py-12 text-right">
          <h2 className="text-white text-5xl font-bold mb-4">Segera Hadir!</h2>
          <p className="text-white text-lg mb-4">
            Pakan Jumbo, Harga Lebih Hemat
          </p>
          <p className="text-[#F7AB31] text-7xl font-semibold mb-8">30 Kg</p>
          <p className="text-white/70 text-sm max-w-sm">
            Peternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default SegeraHadir;