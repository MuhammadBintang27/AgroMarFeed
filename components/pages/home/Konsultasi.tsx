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
        transition={{ duration: 0.8, delay: 0.2 }} className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center mb-24">
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
        <div className="md:w-1/2 flex justify-center">
        </div>
      </motion.div>
    </section>
  );
};

export default Konsultasi;
