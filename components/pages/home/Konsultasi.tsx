"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";

const Konsultasi = () => {
  return (
    <section className="bg-white py-20 w-full">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center mb-24"
      >
        {/* Kiri */}
        <div className="md:w-1/2 text-start md:pr-8 mb-8 md:mb-0">
          <h2 className="text-3xl md:text-5xl font-normal text-black mb-4">
            Butuh Panduan Langsung dari Pakarnya?
          </h2>
          <p className="text-black text-base md:text-lg mb-6">
            Kami hadirkan konsultasi pribadi tanpa harus ke lapangan. Efisien, terpercaya, dan siap membantu Anda 24/7.
          </p>
          <button className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full hover:bg-yellow-500 transition duration-300">
            Mulai Konsultasi
          </button>
        </div>

        {/* Kanan */}
        <div className="md:w-1/2 flex flex-col gap-4">
          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="bg-7 rounded-xl p-4 shadow-md flex flex-col gap-2"
            >
              {/* Baris 1: Nama Konselor */}
              <div className="text-lg font-normal text-black">
                Nama Konselor
              </div>

              {/* Baris 2: Durasi & Harga */}
              <div className="flex items-center gap-3">
                <span className="bg-2 text-white px-3 py-1 rounded-full text-sm">
                  Durasi: 30 menit
                </span>
                <span className="bg-3 text-black px-3 py-1 rounded-full text-sm">
                  Harga: Rp50.000
                </span>
              </div>

              {/* Baris 3: Rating dan Jumlah Konsultasi */}
              <div className="flex items-center gap-3 text-black text-sm">
                <span className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-yellow-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.223 3.768a1 1 0 00.95.69h3.961c.969 0 1.371 1.24.588 1.81l-3.205 2.314a1 1 0 00-.364 1.118l1.223 3.768c.3.921-.755 1.688-1.538 1.118l-3.205-2.314a1 1 0 00-1.175 0l-3.205 2.314c-.783.57-1.838-.197-1.538-1.118l1.223-3.768a1 1 0 00-.364-1.118L2.327 9.195c-.783-.57-.38-1.81.588-1.81h3.961a1 1 0 00.95-.69l1.223-3.768z" />
                  </svg>
                  0.0
                </span>
                <span>0 Konsultasi</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Konsultasi;
