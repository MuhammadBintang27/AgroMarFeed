// app/components/Hero.tsx
"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
// atau sesuai lokasi file
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";

const Hero = () => {
  return (
    <section className="relative w-full">
      {/* Gambar full width */}
      <Image
        src="/images/home/bg_homepage.png"
        alt="Background"
        width={1920}
        height={600}
        className="w-full h-auto block"
        priority
      />

      {/* Konten utama */}
      <div className="absolute inset-0 flex items-start justify-center pt-94">
        <div className="relative w-full max-w-5xl mx-auto px-4 md:px-10 text-center">
          {/* Judul Utama */}
          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-white text-[48px] md:text-5xl font-normal mb-8"
          >
            Diskon Pakan Ramah Lingkungan Mulai Hari Ini!
          </motion.h1>

          {/* Teks deskripsi kecil */}
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-[rgba(255,255,255,0.75)] text-lg mb-8"
          >
            Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            <br />
            hingga 30%! Beli pakan, bantu bumi.
          </motion.p>

          {/* Tombol dengan motion */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Button href="/katalog" size="md" className="mb-6">
              Lihat Produk
              <ArrowRight className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Container tambahan di bawah gambar */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute bottom-20 left-0 right-0 mx-auto bg-black/17 backdrop-blur-[3px] py-16 px-6 rounded-xl max-w-[1150px]"
      >
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-4">
          {/* Kolom 1 */}
          <div>
            <h2 className="text-white text-5xl font-normal">+20</h2>
            <p className="text-white text-sm mt-12">
              Dari jerami, kulit udang, hingga roti sisa, jadi pakan bernutrisi
            </p>
          </div>
          {/* Kolom 2 */}
          <div>
            <h2 className="text-white text-5xl font-normal">6.200kg</h2>
            <p className="text-white text-sm mt-12">
              Dari jerami, kulit udang, hingga roti sisa, jadi pakan bernutrisi
            </p>
          </div>
          {/* Kolom 3 */}
          <div>
            <h2 className="text-white text-5xl font-normal">500+</h2>
            <p className="text-white text-sm mt-12">
              Dari jerami, kulit udang, hingga roti sisa, jadi pakan bernutrisi
            </p>
          </div>
          {/* Kolom 4 */}
          <div>
            <h2 className="text-white text-5xl font-normal">85%</h2>
            <p className="text-white text-sm mt-12">
              Dari jerami, kulit udang, hingga roti sisa, jadi pakan bernutrisi
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;