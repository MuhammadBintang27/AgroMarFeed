"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import Button from "../../ui/Button";

const BestSeller = () => {
  return (
    <section className="bg-white py-20 md:py-30">
      <div className="px-6 md:px-20 lg:px-40 mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
        {/* Left Column */}
        <motion.div
          className="flex flex-col gap-6 md:pl-12 text-center md:text-left"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-3xl md:text-6xl font-normal leading-tight whitespace-pre-line text-[#F7AB31]">
            BEST{"\n"}SELLER!
          </h1>
          <p className="text-base md:text-xl text-gray-700 whitespace-pre-line mb-4 leading-relaxed">
            Pelet ikan, pakan ayam, dan ternak
            {"\n"}dari limbah agro-maritim. Hemat
            {"\n"}hingga 30%! Beli pakan, bantu bumi.
          </p>
          <div className="flex justify-center md:justify-start">
            <Button href="/katalog" size="md" className="hover:scale-105 hover:brightness-110 duration-300 bg-1 text-white mb-6">
              Lihat Produk
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Image
            src="/images/home/bestSeller.png"
            alt="Banner Icon"
            width={320}
            height={320}
            className="hover:scale-105 duration-300 object-contain w-full max-w-xs md:max-w-md"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default BestSeller;
