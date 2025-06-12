"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import { Clock, MapPin } from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function ConsultationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // Handler untuk navigasi ke halaman pemesanan
  const handleBooking = (consultationType: string, doctorName: string) => {
    router.push(
      `/pemesanan?type=${consultationType}&doctor=${encodeURIComponent(
        doctorName
      )}`
    );
  };

  const consultationTypes = [
    "Pakan ternak",
    "Pakan ikan",
    "Konsultasi nutrisi",
    "Formulasi pakan mandiri",
    "Konsultasi budidaya",
    "Konsultasi limbah organik",
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 bg-7">
      <ChatbotWidget />
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black">
            Konsultasi Ahli Pakan & Dokter Hewan Langsung
          </h1>
          <p className="text-gray-600">
            Paket ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            hingga 30%! Beli pakan, bantu bumi.
          </p>
        </div>

        {/* Consultation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button className="bg-2 text-white hover:opacity-90">
            Konsultasi Online
          </Button>
          <Button className="bg-2 text-white hover:opacity-90">
            Konsultasi Langsung
          </Button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {consultationTypes.map((type) => (
            <span
              key={type}
              className="bg-2 bg-opacity-20 text-2 px-4 py-1 rounded-full text-sm"
            >
              {type}
            </span>
          ))}
        </div>

        {/* Search Bar */}
        <SearchBar placeholder="Cari Konsultasi..." className="mb-12" />

        {/* Consultation Sections */}
        <div className="space-y-8">
          {/* Online Consultation Section */}
          <motion.section
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-black">
              Konsultasi Online
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  onClick={() => handleBooking("online", "Sari Utami, M.M.")}
                  className="bg-white rounded-lg p-6 shadow-md group transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <h3 className="font-medium mb-2 text-black">
                    Sari Utami, M.M. - Ahli Pemasaran Hasil Tani
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <span className="flex items-center bg-2 text-white text-xs px-2 py-1 rounded-full">
                      <Clock size={12} className="mr-1" />
                      Durasi : 60 Menit
                    </span>
                    <span className="bg-3 text-white text-xs px-2 py-1 rounded-full">
                      Harga : 25.000
                    </span>
                  </div>

                  {/* Hidden content that shows on hover */}
                  <div className="flex items-center mb-4">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">4.5</span>
                    <span className="ml-2 text-gray-500 text-sm">
                      25 Konsultasi
                    </span>
                  </div>

                  {/* Hidden content that shows on hover */}
                  <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out mb-4">
                    <p className="text-sm text-black/40">
                      Konsultasi dengan ahli pemasaran hasil tani untuk
                      mendapatkan strategi terbaik dalam mengembangkan bisnis
                      peternakan Anda.
                    </p>
                  </div>

                  {/* Add a visual indicator for clickable card */}
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center text-2 text-sm">
                      Klik untuk pesan
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Offline Consultation Section */}
          <motion.section
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-black">
              Konsultasi Langsung
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  onClick={() => handleBooking("offline", "Sari Utami, M.M.")}
                  className="bg-white rounded-lg p-6 shadow-md group transition-all duration-300 hover:shadow-lg cursor-pointer"
                >
                  <h3 className="font-medium mb-2 text-black">
                    Sari Utami, M.M. - Ahli Pemasaran Hasil Tani
                  </h3>
                  <div className="flex gap-2 mb-2">
                    <span className="flex items-center bg-2 text-white text-xs px-2 py-1 rounded-full">
                      <Clock size={12} className="mr-1" />
                      Durasi : 60 Menit
                    </span>
                    <span className="bg-3 text-white text-xs px-2 py-1 rounded-full">
                      Harga : 25.000
                    </span>
                  </div>

                  {/* Hidden content that shows on hover */}
                  <p className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin size={12} className="mr-1" />
                    Jl. Ternak Sejahtera No. 12, Kab. Sleman, Yogyakarta
                  </p>
                  <div className="flex items-center mb-2">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">4.5</span>
                    <span className="ml-2 text-gray-500 text-sm">
                      25 Konsultasi
                    </span>
                  </div>

                  {/* Hidden description that shows on hover */}
                  <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out">
                    <p className="text-sm text-black/40">
                      Konsultasi langsung dengan ahli peternakan untuk
                      mendapatkan solusi praktis dalam pengelolaan peternakan
                      Anda.
                    </p>
                  </div>

                  {/* Add a visual indicator for clickable card */}
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center text-2 text-sm">
                      Klik untuk pesan
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
