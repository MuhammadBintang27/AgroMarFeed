"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ButtonLoading from "../../ui/ButtonLoading";
import LoadingSpinner from "../../ui/LoadingSpinner";

const Hero = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-start pb-10">
      {/* Gambar background */}
      <Image
        src="/images/home/bg_homepage.png"
        alt="Background"
        width={1920}
        height={1080}
        className="w-full h-full object-cover absolute inset-0 z-0"
        priority
      />

      {/* Overlay gelap agar teks lebih kontras */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Konten utama */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 md:px-8 pt-40 md:pt-60">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hover:scale-105 duration-300 text-white text-2xl sm:text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-snug"
        >
          Bersama AgroMarFeed, Limbah Bernilai<br className="hidden md:block" />
          Ternak Sejahtera
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hover:scale-105 duration-300 text-white/80 text-sm sm:text-base md:text-lg mb-6 md:mb-8 max-w-xl leading-relaxed"
        >
        Dari limbah agro-marine menjadi nutrisi ternak. Solusi cerdas mendorong ekonomi sirkular demi kesejahteraan Masyarakat.</motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Button
            size="md"
            className="mb-6 text-sm px-4 py-2 md:text-base md:px-6 md:py-3 transform transition-all duration-300 hover:scale-105 hover:brightness-110 hover:shadow-lg"
            disabled={isLoading}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                router.push("/katalog");
                setIsLoading(false);
              }, 800);
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="yellow" className="mr-2" />
                Menuju Katalog...
              </>
            ) : (
              <>
                Lihat Produk
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Stat Section */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-20 mt-10 md:mt-20 mx-auto bg-black/20 py-6 px-4 md:py-10 md:px-12 rounded-xl max-w-[95%] md:max-w-[1150px]"
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
          {[
            {
              value: "50+ Juta Ton",
              description:
                "Potensi tahunan limbah pertanian Indonesia untuk pakan ruminansia.",
            },
            {
              value: "500.000+ Ton",
              description: "Limbah kelautan terbuang percuma tiap tahunnya.",
            },
            {
              value: "93,3% Peternak",
              description:
                "Telah memanfaatkan limbah pertanian sebagai pakan alternatif.",
            },
            {
              value: "40% Lebih Murah",
              description:
                "Biaya pakan ternak dengan formula limbah fermentasi.",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className=" rounded-lg p-4 md:p-6 hover:scale-110 hover:shadow-xl transition-all duration-300 cursor-default"
            >
              <h2 className="text-white text-2xl sm:text-3xl md:text-[2.59rem] font-semibold">
                {stat.value}
              </h2>
              <p className="text-white text-xs sm:text-sm mt-4 leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
