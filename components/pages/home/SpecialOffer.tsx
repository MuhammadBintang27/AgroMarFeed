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
    <section className="bg-white w-full px-48">
      <div className="flex justify-between items-center">
        <motion.h2
          className="text-3xl md:text-4xl font-normal text-black"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Special Offer
        </motion.h2>

        <motion.a
          href="/catalog"
          className="inline-flex items-center gap-2 text-[rgba(0,0,0,0.4)] text-lg mb-8 px-4 py-2 bg-transparent hover:underline pt-12"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Lihat semua
          <ArrowRight className="ml-0" />
        </motion.a>

      </div>

      <div className="flex justify-center gap-8 py-6 px-6 pb-50">
        <motion.div
          style={{ width: 500, height: 360 }}
          className="bg-3 flex-shrink-0 rounded-2xl flex flex-col justify-between relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="absolute top-6 left-6 bg-4 text-black text-xs px-3 py-1 rounded-[20]">
            Flat 25% Diskon
          </div>

          <div className="flex h-full pt-14">
            {/* Kiri: Teks */}
            <div className="flex flex-col justify-start w-1/2 pr-4 pl-7 pt-4">
              <h3 className="text-black text-3xl font-normal leading-snug mb-4">
                SCRATCH & PECK FEEDS
              </h3>
              <p className="text-black text-sm mb-8">
                limbah agro-maritim, Hemat hingga 30%! Beli pakan, bantu bumi.
              </p>
              <Button href="/catalog" size="md" className="bg-1 text-white mb-6">
                Beli Sekarang
                <ArrowRight className="ml-2" />
              </Button>
            </div>

            {/* Kanan: Gambar */}
            <div className="w-1/2 relative overflow-hidden flex items-center justify-center">
              <motion.div
                className="absolute bottom-[-60px] right-[-40px]" // geser ke pojok kanan bawah dan agak keluar
                whileHover={{
                  scale: 0.75,
                  x: -30,
                  y: -30,
                  transition: { duration: 0.3 },
                }}
              >
                <Image
                  src="/images/home/specialOffer1.png"
                  alt="Special Offer Image"
                  width={420}
                  height={420}
                  className="object-contain"
                />
              </motion.div>
            </div>

          </div>
        </motion.div>

        {/* Kotak 2*/}
        <motion.div
          style={{ width: 500, height: 360 }}
          className="bg-2 flex-shrink-0 rounded-2xl flex flex-col justify-between relative"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
        <div className="absolute top-6 left-6 bg-3 text-black text-xs px-3 py-1 rounded-[20]">
          Flat 25% Diskon
        </div>

        <div className="flex h-full pt-14">
          {/* Kiri: Teks */}
          <div className="flex flex-col justify-start w-1/2 pr-4 pl-7 pt-4">
            <h3 className="text-white text-3xl font-normal leading-snug mb-4">
              GIMME ORGANIC
            </h3>
            <p className="text-white text-sm mb-8">
              limbah agro-maritim, Hemat hingga 30%! Beli pakan, bantu bumi.
            </p>
            <Button href="/catalog" size="md" className="bg-3 text-black mb-6">
              Beli Sekarang
              <ArrowRight className="ml-2" />
            </Button>
          </div>

          {/* Kanan: Gambar */}
          <div className="w-1/2 relative overflow-hidden flex items-center justify-center">
            <motion.div
              className="absolute bottom-[-100px] right-[0px]" // geser ke pojok kanan bawah dan agak keluar
              whileHover={{
                scale: 0.75,
                x: -25,
                y: -45,
                transition: { duration: 0.3 },
              }}
            >
              <Image
                src="/images/home/specialOffer2.png"
                alt="Special Offer Image"
                width={210}
                height={250}
                className="object-contain"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>

    </section >
  );
};

export default SpecialOffer;