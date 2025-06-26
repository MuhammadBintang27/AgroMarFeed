"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Send, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchArticles, Article } from "@/lib/api/fetchArticles";

const LatestBlog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const loadArticles = async () => {
      const fetched = await fetchArticles();
      setArticles(fetched.slice(0, 5));
    };
    loadArticles();
  }, []);

  if (!isMounted || articles.length === 0) return null;

  return (
    <section className="bg-white py-16 px-4 md:px-20 w-full">
      {/* Header */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-5xl mx-auto flex flex-col md:flex-row justify-between md:items-center mb-6 gap-2"
      >
        <h2 className="text-2xl md:text-4xl font-normal text-black">
          Latest Blog
        </h2>
        <Link
          href="/artikel"
          className="inline-flex items-center gap-2 text-black/50 text-base hover:underline"
        >
          Lihat semua <ArrowRight size={18} />
        </Link>
      </motion.div>

      {/* Blog cards */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full max-w-5xl mx-auto flex overflow-x-auto gap-4 md:gap-6 pb-4 hide-scrollbar scroll-smooth"
      >
        {articles.map((article) => (
          <Link
            href={`/artikel/${article._id}`}
            key={article._id}
            className="bg-7 flex-shrink-0 w-64 sm:w-72 md:w-80 rounded-2xl p-4 flex flex-col group transition-all duration-300 hover:shadow-lg"
          >
            {/* Cover Image */}
            <div className="w-full h-32 sm:h-36 md:h-44 relative mb-4 rounded-xl overflow-hidden">
              <Image
                src={article.gambar_sampul}
                alt={article.judul}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>

            {/* Date */}
            <div className="flex items-center text-sm text-black/50 mb-2">
              <Clock size={16} className="mr-2" />
              <span>
                {new Date(article.tanggal_publikasi).toLocaleDateString(
                  "id-ID",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm sm:text-base font-semibold text-black mb-2 leading-snug line-clamp-2">
              {article.judul}
            </h3>

            {/* Hover excerpt */}
            <div className="overflow-hidden max-h-0 opacity-0 group-hover:max-h-[80px] sm:group-hover:max-h-[100px] group-hover:opacity-100 transition-all duration-500 ease-in-out mb-4">
              <p className="text-xs sm:text-sm text-black/40">
                {article.konten.substring(0, 100)}...
              </p>
            </div>

            {/* Author & Send icon */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center">
                <span className="text-xs sm:text-sm text-black">
                  {article.penulis[0]?.nama || "Unknown"}
                </span>
              </div>
              <div className="p-2">
                <Send size={16} className="text-[#919199]" />
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </section>
  );
};

export default LatestBlog;
