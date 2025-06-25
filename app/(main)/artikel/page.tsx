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

  useEffect(() => {
    async function loadArticles() {
      const fetchedArticles = await fetchArticles();
      console.log("Setting articles:", fetchedArticles);
      setArticles(fetchedArticles);
      setLoading(false);
    }
    loadArticles();
  }, []);

  return (
    <div className="min-h-screen pt-32 pb-16 bg-white">
      <ChatbotWidget />
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3 text-black">Artikel & Tips</h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
              Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
              hingga 30%! Beli pakan, bantu bumi.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
            <SearchBar placeholder="Cari artikel..." className="w-full md:w-[440px]" />
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
          ) : articles.length === 0 ? (
            <div className="text-center text-black">No articles available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles
                .filter((article) =>
                  activeTab === "artikel"
                    ? article.kategori.toLowerCase() !== "tips" // Show all except "tips"
                    : article.kategori.toLowerCase() === "tips"
                )
                .map((article) => (
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
                          {new Date(article.tanggal_publikasi).toLocaleDateString("id-ID", {
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
          )}
        </motion.div>
      </div>
    </div>
  );
}