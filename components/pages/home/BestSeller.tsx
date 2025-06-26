"use client";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Button from "../../ui/Button";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";

const BestSeller = () => {
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchProducts()
      .then((products) => {
        if (!ignore && products.length > 0) {
          const randomIndex = Math.floor(Math.random() * products.length);
          setProduct(products[randomIndex]);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message || "Gagal memuat produk");
      });
    return () => {
      ignore = true;
    };
  }, []);

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
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : product ? (
            <>
              <p className="text-base md:text-xl text-gray-700 whitespace-pre-line mb-4 leading-relaxed">
                {product.description}
              </p>
              <div className="flex justify-center md:justify-start">
                <Button
                  href={`/detail/${product._id}`}
                  size="md"
                  className="hover:scale-105 hover:brightness-110 duration-300 bg-1 text-white mb-6"
                >
                  Lihat Produk
                  <ArrowRight className="ml-2" />
                </Button>
              </div>
            </>
          ) : null}
        </motion.div>

        {/* Right Column */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {product && product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={640}
              height={640}
              className="hover:scale-105 duration-300 object-contain w-full max-w-xs md:max-w-md"
              priority
              quality={100}
              sizes="(max-width: 768px) 100vw, 640px"
              style={{ imageRendering: "auto" }}
            />
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};

export default BestSeller;
