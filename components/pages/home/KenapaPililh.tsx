"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const KenapaPilih = () => {
  return (
    <section className="bg-white py-20 px-4 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mb-12"
      >
        {/* Judul dan Logo */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <Image src="/images/home/logo.png" alt="Logo" width={70} height={70} />
          <h2 className="text-3xl md:text-5xl font-normal text-black leading-tight">
            Kenapa Pilih AgroMarFeed?
          </h2>
        </div>

        {/* Deskripsi */}
        <p className="text-black/70 max-w-2xl text-base md:text-lg">
          Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
        </p>
      </motion.div>

      {/* Kontainer Fitur 2x2 */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-2 gap-6">
        {[
          {
            img: "/images/home/zeroWaste.png",
            title: "Berbasis Zero Waste",
          },
          {
            img: "/images/home/aksesSemua.png",
            title: "Akses untuk Semua",
          },
          {
            img: "/images/home/gratisOngkir.png",
            title: "Gratis Ongkos Kirim",
          },
          {
            img: "/images/home/edukasi.png",
            title: "Edukasi Peternak",
          },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 + index * 0.1 }}
            className="bg-white rounded-xl shadow-md flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 text-center md:text-start"
          >
            <div className="flex-shrink-0">
              <Image src={item.img} alt={item.title} width={100} height={60} />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-black mb-1">{item.title}</h3>
              <p className="text-sm text-black/60">
                Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default KenapaPilih;
