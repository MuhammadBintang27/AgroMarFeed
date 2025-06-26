"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
import ChatbotWidget from "@/components/ChatbotWidget";
import Button from "../../../components/ui/Button";
import SearchBar from "../../../components/ui/SearchBar";
import Image from "next/image";

// Tipe data konsultan
type Konsultan = {
  _id: string;
  nama: string;
  profesi: string;
  description: string;
  price: number;
  rating?: number;
  jumlah_penanganan?: number;
  aktif?: boolean;
  jenis_kelamin?: string; // 'L' atau 'P'
};

export default function ConsultationPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [konsultanList, setKonsultanList] = useState<Konsultan[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/konsultan");
        const data = await res.json();
        setKonsultanList(data);
      } catch (err) {
        console.error("Gagal ambil data konsultan:", err);
      }
    };

    fetchData();
  }, []);

  if (!isMounted) return null;

  const handleBooking = (slug: string) => {
    router.push(`/pembayaranKonsultasi/${slug}`);
  };

  const consultationTypes = [
    "Nutrisi dan Pakan Ternak",
    "Nutrisi dan Pakan Ikan",
    "Formulasi Pakan",
    "Budidaya Ternak",
    "Budidaya Perikanan",
    "Manajemen Limbah",
    "Strategi Usaha dan Produksi",
  ];

  const handleTypeClick = (type: string) => {
    setSelectedType((prev) => (prev === type ? null : type));
  };

  // Filter hanya konsultan yang aktif
  const filteredKonsultanList = (
    selectedType
      ? konsultanList.filter((k) => k.profesi === selectedType)
      : konsultanList
  ).filter((k) => k.aktif === true);

  return (
    <div className="min-h-screen pt-32 pb-16 bg-white">
      <ChatbotWidget />
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black">
            Konsultasi Ahli Pakan & Dokter Hewan Langsung
          </h1>
          <p className="text-gray-600">
            Paket ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            hingga 30%! Beli pakan, bantu bumi.
          </p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {consultationTypes.map((type) => {
            const isActive = selectedType === type;
            return (
              <button
                key={type}
                onClick={() => handleTypeClick(type)}
                className={`px-4 py-1 rounded-full text-sm border 
                ${
                  isActive
                    ? "bg-1 text-white border-2"
                    : "bg-2 bg-opacity-20 text-2 border-transparent text-white"
                }
                transition-colors duration-200`}
              >
                {type}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <SearchBar placeholder="Cari Konsultasi..." className="mb-12" />

        {/* List Konsultan */}
        <div className="space-y-8">
          <motion.section
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-2xl font-bold mb-4 text-black">
              {selectedType || "Semua"} Konsultan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredKonsultanList.map((konsultan) => {
                // Foto profil default berdasarkan jenis_kelamin
                let profileImg = "/images/agromardoc-L.png"; // fallback default
                if (konsultan.jenis_kelamin === "P") {
                  profileImg = "/images/agromardoc-P.png";
                } else if (konsultan.jenis_kelamin === "L") {
                  profileImg = "/images/agromardoc-L.png";
                }
                return (
                  <div
                    key={konsultan._id}
                    onClick={() => handleBooking(konsultan._id)}
                    className="bg-white rounded-lg p-4 shadow-md group transition-all duration-300 hover:shadow-lg cursor-pointer flex gap-4"
                  >
                    {/* Gambar Profil */}
                    <div className="flex-shrink-0">
                      <img
                        src={profileImg}
                        alt={konsultan.nama}
                        className="w-20 h-20 rounded-full object-cover border border-gray-300"
                      />
                    </div>

                    {/* Info Konsultan */}
                    <div className="flex-1">
                      <h3 className="font-medium mb-2 text-black">
                        {konsultan.nama} - {konsultan.profesi}
                      </h3>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="flex items-center bg-2 text-white text-xs px-2 py-1 rounded-full">
                          <Clock size={12} className="mr-1" />
                          Durasi : 60 Menit
                        </span>
                        <span className="bg-3 text-white text-xs px-2 py-1 rounded-full">
                          Harga : {konsultan.price.toLocaleString("id-ID")}
                        </span>
                      </div>

                      <div className="flex items-center mb-2">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 text-black">
                          {konsultan.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="ml-3 text-gray-500 text-sm">
                          {konsultan.jumlah_penanganan || 0} Penanganan
                        </span>
                      </div>

                      <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out mb-2">
                        <p className="text-sm text-black/40">
                          {konsultan.description}
                        </p>
                      </div>

                      <div className="mt-2 text-left">
                        <span className="inline-flex items-center text-2 text-sm text-black">
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
                  </div>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
