"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";
import Link from "next/link";
import { fetchArticles, Article } from "@/lib/api/fetchArticles";
import ChatbotWidget from "@/components/ChatbotWidget";

export default function ArticlePage() {
  const [activeTab, setActiveTab] = useState("artikel");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function loadArticles() {
      const fetchedArticles = await fetchArticles();
      setArticles(fetchedArticles);
      setLoading(false);
    }
    loadArticles();
  }, []);

  // Reset visibleCount when tab changes
  useEffect(() => {
    setVisibleCount(6);
  }, [activeTab]);

  // Filtered articles by tab & search
  const filteredArticles = articles.filter((article) => {
    const matchesTab =
      activeTab === "artikel"
        ? article.kategori.toLowerCase() !== "tips"
        : article.kategori.toLowerCase() === "tips";
    const matchesSearch = article.judul
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Articles to show in current batch
  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = visibleArticles.length < filteredArticles.length;

  // Handler for search with loading animation
  const handleSearch = () => {
    setSearchLoading(true);
    setSearchTerm(searchInput);
    setTimeout(() => {
      setSearchLoading(false);
      setVisibleCount(6); // Reset visible count when searching
    }, 800);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-32 pb-16 bg-white">
      <ChatbotWidget />
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3 text-black">
              Artikel & Tips
            </h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
            Ubah Limbah Jadi Peluang! Temukan cara cerdas membuat pakan hemat, sehat, dan ramah lingkungan.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <div className="flex items-center gap-2 bg-6 rounded-full px-3 py-2 w-full md:w-[440px]">
              <svg
                className={`w-5 h-5 text-gray-400 ${
                  searchLoading ? "animate-spin" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari artikel..."
                className="bg-transparent outline-none text-black/80 placeholder:text-black/50 w-full text-sm"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                disabled={searchLoading}
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("artikel")}
                className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                  activeTab === "artikel"
                    ? "bg-2 text-white shadow-lg shadow-2/20"
                    : "bg-2/10 text-black hover:bg-2/20"
                }`}
              >
                <span className="flex items-center gap-2">Artikel</span>
              </button>
              <button
                onClick={() => setActiveTab("tips")}
                className={`px-6 py-2 rounded-full transition-all duration-300 font-medium ${
                  activeTab === "tips"
                    ? "bg-2 text-white shadow-lg shadow-2/20"
                    : "bg-2/10 text-black hover:bg-2/20"
                }`}
              >
                <span className="flex items-center gap-2">Tips & Tricks</span>
              </button>
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="text-center text-black">Loading articles...</div>
          ) : searchLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#6D8044] rounded-full animate-spin mb-4"></div>
              <p className="text-black/60 text-lg">Mencari artikel...</p>
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="text-center text-black">No articles available</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleArticles.map((article) => (
                  <Link href={`/artikel/${article._id}`} key={article._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-7 rounded-2xl p-4 flex flex-col group cursor-pointer hover:shadow-lg transition-all duration-300"
                    >
                      <div className="w-full h-48 relative mb-4 rounded-xl overflow-hidden">
                        <Image
                          src={article.gambar_sampul}
                          alt={article.judul}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                        />
                      </div>

                      <div className="flex items-center text-sm text-black/50 mb-2">
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {new Date(
                            article.tanggal_publikasi
                          ).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-black mb-2 line-clamp-2 hover:text-2">
                        {article.judul}
                      </h3>

                      <p className="text-sm text-black/60 mb-4 line-clamp-2">
                        {article.konten.substring(0, 100)}...
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-black/80">
                          {article.penulis[0]?.nama || "Unknown"}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:scale-110 transition text-2">
                            <svg
                              className="w-5 h-5"
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
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    className="px-8 py-2 rounded-full bg-1 text-white font-semibold hover:brightness-110 shadow-md"
                    onClick={() => setVisibleCount((prev) => prev + 6)}
                  >
                    Lihat lebih banyak
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
