"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const KenapaPilih = () => {
  return (
    <section className="bg-white py-20 w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center text-center mb-12">
        {/* Judul dan Logo */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <Image src="/images/home/logo.png" alt="Logo" width={70} height={70} />
          <h2 className="text-5xl font-normal text-black">Kenapa Pilih AgroMarFeed?</h2>
        </div>

        {/* Deskripsi */}
        <p className="text-black/70 max-w-2xl mb-10">
          Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
        </p>
      </motion.div>

      {/* Kontainer 2x2 */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
        {/* Kotak 1 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl flex">
          <div className="w-1/4 flex items-start justify-center">
            <Image src="/images/home/zeroWaste.png" alt="Zero Waste" width={100} height={60} />
          </div>
          <div className="w-3/4 pl-4">
            <h3 className="text-xl font-semibold text-black mb-2">Berbasis Zero Waste</h3>
            <p className="text-sm text-black/60">Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.</p>
          </div>
        </motion.div>

        {/* Kotak 2 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl flex">
          <div className="w-1/4 flex items-start justify-center">
            <Image src="/images/home/aksesSemua.png" alt="Akses Semua" width={100} height={60} />
          </div>
          <div className="w-3/4 pl-4">
            <h3 className="text-lg font-semibold text-black">Akses untuk Semua</h3>
            <p className="text-sm text-black/60">Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.</p>
          </div>
        </motion.div>

        {/* Kotak 3 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl flex">
          <div className="w-1/4 flex items-start justify-center">
            <Image src="/images/home/gratisOngkir.png" alt="Gratis Ongkis" width={100} height={60} />
          </div>
          <div className="w-3/4 pl-4">
            <h3 className="text-lg font-semibold text-black">Gratis Ongkos Kirim</h3>
            <p className="text-sm text-black/60">Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.</p>
          </div>
        </motion.div>

        {/* Kotak 4 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white rounded-xl flex">
          <div className="w-1/4 flex items-start justify-center">
            <Image src="/images/home/edukasi.png" alt="Edukasi" width={100} height={60} />
          </div>
          <div className="w-3/4 pl-4">
            <h3 className="text-lg font-semibold text-black">Edukasi Peternak</h3>
            <p className="text-sm text-black/60">Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default KenapaPilih;
