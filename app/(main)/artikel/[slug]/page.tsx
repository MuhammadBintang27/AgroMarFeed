"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import {
  fetchArticleById,
  Article,
  incrementViewCount,
} from "@/lib/api/fetchArticles";

export default function ArticleDetail() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const fetchedArticle = await fetchArticleById(slug);
        setArticle(fetchedArticle);
        setLoading(false);
      } catch (error) {
        console.error("Error loading article:", error);
        setLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  if (loading) {
    return <div className="text-center text-black">Loading article...</div>;
  }

  if (!article) {
    return <div className="text-center text-black">Article not found</div>;
  }

  const primaryAuthor = article.penulis[0] || { nama: "Unknown" };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <Link
            href="/artikel"
            className="inline-flex items-center gap-2 text-black/60 hover:text-2 mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Kembali ke Artikel</span>
          </Link>

          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-black">
              {article.judul}
            </h1>
            <div className="flex items-center gap-6 text-black/60">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
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
              <div className="flex items-center gap-2">
              </div>
              <div className="flex items-center gap-2">
                <span>{primaryAuthor.nama}</span>
                {primaryAuthor.role && (
                  <span className="text-black/40">• {primaryAuthor.role}</span>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="w-full h-[400px] relative rounded-2xl overflow-hidden mb-8">
            <Image
              src={article.gambar_sampul}
              alt={article.judul}
              fill
              className="object-cover"
            />
          </div>

          {/* Article Content */}
          <div
            className="max-w-none [&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-black/80 
            [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-black [&>h3]:mt-8 [&>h3]:mb-4
            [&>ul]:list-disc [&>ul]:list-inside [&>ul]:mb-4
            [&>ol]:list-decimal [&>ol]:list-inside [&>ol]:mb-4"
            dangerouslySetInnerHTML={{ __html: `<p>${article.konten}</p>` }}
          />

          {/* Author Box */}
          <div className="mt-12 flex items-start gap-4 bg-7 rounded-2xl p-6">
            <div>
              <h3 className="font-semibold text-black mb-1">
                {primaryAuthor.nama}
              </h3>
              {primaryAuthor.role && (
                <p className="text-black/60 text-sm">{primaryAuthor.role}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
