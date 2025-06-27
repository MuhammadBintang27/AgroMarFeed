"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { fetchStoreById } from "@/lib/api/fetchProducts";
import { fetchProducts, Product } from "@/lib/api/fetchProducts";
import PageLoading from "@/components/ui/PageLoading";
import WishlistButton from "@/components/ui/WishlistButton";
import { useUser } from "@/contexts/UserContext";

// Rating Stars Component
const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {/* Full Stars */}
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}

      {/* Half Star */}
      {hasHalfStar && (
        <div className="relative w-4 h-4">
          <svg
            className="w-4 h-4 text-gray-300 absolute"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div className="absolute overflow-hidden w-2 h-4">
            <svg
              className="w-4 h-4 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
      )}

      {/* Empty Stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-4 h-4 text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

const StorePage = () => {
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const user = useUser();

  useEffect(() => {
    const loadData = async () => {
      if (!slug || slug === "undefined") {
        setError("Invalid store ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch store data
        const storeData = await fetchStoreById(slug);
        setStore(storeData);

        // Fetch all products and filter by store
        const allProducts = await fetchProducts();
        const storeProducts = allProducts.filter(
          (product) => product.store_id === slug
        );
        setProducts(storeProducts);

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return <PageLoading text="Memuat informasi toko..." />;
  }

  if (error || !store) {
    return (
      <div className="text-center py-40 text-red-500">
        Error: {error || "Store not found"}
      </div>
    );
  }

  return (
    <section className="bg-white pt-22 sm:pt-24 md:pt-28 pb-10 w-full">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4">
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-black text-sm mb-4 hover:underline w-fit"
        >
          <ArrowLeft className="w-6 h-6 mr-1" />
          Kembali
        </button>

        {/* Store Header */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-2 flex items-center justify-center">
                <span className="text-white font-semibold text-2xl">
                  {store.nama_toko?.charAt(0)?.toUpperCase() || "T"}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-black mb-1">
                  {store.nama_toko}
                </h1>
                <p className="text-gray-600">
                  {store.alamat?.kabupaten || "Lokasi tidak tersedia"}
                </p>
                {store.alamat?.provinsi && (
                  <p className="text-gray-600">{store.alamat.provinsi}</p>
                )}
              </div>
            </div>
            {user && store.user_id === user.user?._id && (
              <button
                onClick={() => router.push("/tokoSaya")}
                className="flex items-center justify-between bg-white border border-orange-200 text-black text-xs py-2 px-3 rounded-[25px] font-semibold hover:scale-105 duration-300 transition text-left"
              >
                <span className="text-left">Atur Toko</span>
                <img
                  src="/images/icons/toko.png"
                  alt="Toko"
                  className="w-5 h-5 ml-2"
                />
              </button>
            )}
          </div>
        </div>

        {/* Store Products */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-black mb-6">
            Produk dari {store.nama_toko}
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Belum ada produk dari toko ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  href={`/detail/${product._id}`}
                  className="bg-7 rounded-2xl p-4 flex flex-col hover:shadow-lg transition cursor-pointer h-full"
                >
                  <div className="w-full h-48 flex justify-center items-center mb-4">
                    <Image
                      src={product.imageUrl || "/images/placeholder.png"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-left mb-2 text-black">
                    {product.name}
                  </h3>
                  <div className="flex justify-between text-sm text-black/30 mb-2 px-1">
                    <span>{product.categoryOptions}</span>
                    <div className="flex items-center gap-1">
                      <RatingStars rating={product.rating || 0} />
                      <span className="text-black/60">
                        ({product.rating?.toFixed(1) || "0.0"})
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-1 mt-auto">
                    <span className="text-base font-semibold text-black">
                      Rp{product.price.toLocaleString()}
                    </span>
                    <div className="flex gap-2">
                      <button className="w-6 h-6 rounded-full bg-black text-xl text-white border border-black/10 flex items-center justify-center">
                        +
                      </button>
                      <WishlistButton productId={product._id} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default StorePage;
