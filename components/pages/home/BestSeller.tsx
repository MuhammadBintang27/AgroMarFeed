"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import React from "react";
import Link from "next/link";
import Button from "../../ui/Button";

const BestSeller = () => {
  return (
    <section className="bg-white py-30">
      <div className="px-40 mx-auto grid grid-cols-1 md:grid-cols-2 items-top gap-12">
        {/* Left Column */}
        <motion.div
          className="flex flex-col gap-6 pl-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 className="text-4xl md:text-6xl font-normal leading-tight whitespace-pre-line text-[#F7AB31] pt-20">
            BEST{"\n"}SELLER!
          </h1>
          <p className="text-xl text-gray-700 whitespace-pre-line mb-4">
            Pelet ikan, pakan ayam, dan ternak
            {"\n"}dari limbah agro-maritim. Hemat
            {"\n"}hingga 30%! Beli pakan, bantu bumi.
          </p>
          <div>
            <Button href="/catalog" size="md" className="bg-1 text-white mb-6">
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
            width={420}
            height={420}
            className="object-contain"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default BestSeller;
