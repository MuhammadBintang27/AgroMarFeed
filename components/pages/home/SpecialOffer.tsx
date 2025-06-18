"use client";
import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Button from "../../ui/Button";
import Image from "next/image";
import { motion } from "framer-motion";

const SpecialOffer = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <section className="bg-white w-full px-6 md:px-16 lg:px-48 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <motion.h2
          className="text-2xl md:text-4xl font-normal text-black"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Special Offer
        </motion.h2>

        <motion.a
          href="/katalog"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-base md:text-lg mt-4 md:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>
      </div>

      {/* Cards Container */}
      <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row justify-center items-center gap-8">

        {/* Kartu 1 */}
        <motion.div
          className="flex-shrink-0 basis-[90%] sm:basis-[420px] md:basis-[480px] max-w-[480px] w-full h-auto bg-3 rounded-2xl flex flex-col justify-between relative p-4 md:p-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute top-6 left-6 bg-4 text-black text-xs px-3 py-1 rounded-[20px]">
            Flat 25% Diskon
          </div>

          <div className="flex flex-col md:flex-row h-full pt-10 md:pt-14">
            {/* Teks */}
            <div className="flex flex-col justify-start w-full md:w-1/2 pr-2 md:pr-4 pl-1 md:pl-2 pt-2 md:pt-4">
              <h3 className="text-black text-xl md:text-3xl font-normal leading-snug mb-3 md:mb-4">
                SCRATCH & PECK FEEDS
              </h3>
              <p className="text-black text-xs md:text-sm mb-6 md:mb-8">
                limbah agro-maritim, Hemat hingga 30%! Beli pakan, bantu bumi.
              </p>
              <Button
                href="/katalog"
                size="md"
                className="bg-1 text-white mb-4 md:mb-6 text-sm md:text-base"
              >
                Beli Sekarang
                <ArrowRight className="ml-2" />
              </Button>
            </div>

            {/* Gambar */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-4">
              <Image
                src="/images/home/specialOffer1.png"
                alt="Special Offer Image"
                width={400}
                height={400}
                className="object-contain h-auto w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Kartu 2 */}
        <motion.div
          className="flex-shrink-0 basis-[90%] sm:basis-[420px] md:basis-[480px] max-w-[480px] w-full h-auto bg-2 rounded-2xl flex flex-col justify-between relative p-4 md:p-6"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute top-6 left-6 bg-3 text-black text-xs px-3 py-1 rounded-[20px]">
            Flat 25% Diskon
          </div>

          <div className="flex flex-col md:flex-row h-full pt-10 md:pt-14">
            {/* Teks */}
            <div className="flex flex-col justify-start w-full md:w-1/2 pr-2 md:pr-4 pl-1 md:pl-2 pt-2 md:pt-4">
              <h3 className="text-white text-xl md:text-3xl font-normal leading-snug mb-3 md:mb-4">
                SCRATCH & PECK FEEDS
              </h3>
              <p className="text-white text-xs md:text-sm mb-6 md:mb-8">
                limbah agro-maritim, Hemat hingga 30%! Beli pakan, bantu bumi.
              </p>
              <Button
                href="/katalog"
                size="md"
                className="bg-3 text-black mb-4 md:mb-6 text-sm md:text-base"
              >
                Beli Sekarang
                <ArrowRight className="ml-2" />
              </Button>
            </div>

            {/* Gambar */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-2 md:p-4">
              <Image
                src="/images/home/specialOffer1.png"
                alt="Special Offer Image"
                width={400}
                height={400}
                className="object-contain h-auto w-full"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SpecialOffer;
