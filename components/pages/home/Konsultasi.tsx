"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { fetchKonsultan, Konsultan } from "@/lib/api/fetchKonsultan";

const Konsultasi = () => {
  const [konsultanList, setKonsultanList] = useState<Konsultan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKonsultan() {
      try {
        const fetchedKonsultan = await fetchKonsultan();
        setKonsultanList(fetchedKonsultan);
        setLoading(false);
      } catch (error) {
        console.error("Error loading konsultan:", error);
        setLoading(false);
      }
    }
    loadKonsultan();
  }, []);

  // Format price to Indonesian currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format rating to 1 decimal place
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  return (
    <section className="bg-white py-16 px-4 w-full">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-10"
      >
        {/* Kiri */}
        <div className="w-full md:w-1/2 text-center md:text-start">
          <h2 className="text-2xl md:text-5xl font-semibold text-black mb-4 leading-snug">
            Butuh Panduan Langsung dari Pakarnya?
          </h2>
          <p className="text-black text-base md:text-lg mb-6">
            Kami hadirkan konsultasi pribadi tanpa harus ke lapangan. Efisien,
            terpercaya, dan siap membantu Anda 24/7.
          </p>
          <div className="flex justify-center md:justify-start">
            <Button
              href="/konsultasi"
              size="md"
              className="bg-3 text-black font-semibold px-6 py-3 rounded-full hover:brightness-110 hover:scale-105 transform transition duration-300"
            >
              Mulai Konsultasi
            </Button>
          </div>
        </div>

        {/* Kanan */}
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          {loading
            ? // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-7 rounded-xl p-4 shadow-md animate-pulse"
                >
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))
            : konsultanList.length > 0
            ? // Display real konsultan data
              konsultanList.slice(0, 3).map((konsultan, index) => (
                <motion.div
                  key={konsultan._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-7 rounded-xl p-4 shadow-md flex flex-col gap-2 hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Baris 1: Nama Konselor */}
                  <div className="text-lg font-semibold text-black text-center md:text-start">
                    {konsultan.nama}
                  </div>

                  {/* Baris 2: Profesi */}
                  <div className="text-sm text-black/70 text-center md:text-start">
                    {konsultan.profesi}
                  </div>

                  {/* Baris 3: Durasi & Harga */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="bg-2 text-white px-3 py-1 rounded-full text-sm">
                      Durasi: 60 menit
                    </span>
                    <span className="bg-3 text-black px-3 py-1 rounded-full text-sm">
                      Harga: {formatPrice(konsultan.price)}
                    </span>
                  </div>

                  {/* Baris 4: Rating dan Jumlah Konsultasi */}
                  <div className="flex justify-center md:justify-start items-center gap-3 text-black text-sm">
                    <span className="flex items-center gap-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.223 3.768a1 1 0 00.95.69h3.961c.969 0 1.371 1.24.588 1.81l-3.205 2.314a1 1 0 00-.364 1.118l1.223 3.768c.3.921-.755 1.688-1.538 1.118l-3.205-2.314a1 1 0 00-1.175 0l-3.205 2.314c-.783.57-1.838-.197-1.538-1.118l1.223-3.768a1 1 0 00-.364-1.118L2.327 9.195c-.783-.57-.38-1.81.588-1.81h3.961a1 1 0 00.95-.69l1.223-3.768z" />
                      </svg>
                      {formatRating(konsultan.rating)}
                    </span>
                    <span>{konsultan.jumlah_penanganan} Konsultasi</span>
                  </div>
                </motion.div>
              ))
            : // Fallback when no data
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-7 rounded-xl p-4 shadow-md flex flex-col gap-2"
                >
                  <div className="text-lg font-semibold text-black text-center md:text-start">
                    Nama Konselor
                  </div>
                  <div className="text-sm text-black/70 text-center md:text-start">
                    Profesi
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="bg-2 text-white px-3 py-1 rounded-full text-sm">
                      Durasi: 30 menit
                    </span>
                    <span className="bg-3 text-black px-3 py-1 rounded-full text-sm">
                      Harga: Rp50.000
                    </span>
                  </div>
                  <div className="flex justify-center md:justify-start items-center gap-3 text-black text-sm">
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
