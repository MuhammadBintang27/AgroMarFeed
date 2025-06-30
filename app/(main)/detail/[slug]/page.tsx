"use client";
import Button from "@/components/ui/Button";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Heart, Minus, Plus, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  fetchProductById,
  fetchProducts,
  Product,
  Weight,
  fetchStoreById,
} from "@/lib/api/fetchProducts";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import WishlistButton from "@/components/ui/WishlistButton";
import PageLoading from "@/components/ui/PageLoading";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Category Icon Component
const CategoryIcon = ({ category }: { category: string }) => {
  const getCategoryImage = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "ruminansia":
        return "/images/kategori/Ruminansia.png";
      case "non-ruminansia":
        return "/images/kategori/Non-ruminansia.png";
      case "akuakultur":
        return "/images/kategori/Akuakultur.png";
      default:
        return "/images/kategori/Ruminansia.png"; // default fallback
    }
  };

  return (
    <Image
      src={getCategoryImage(category)}
      alt={category}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Limbah Icon Component
const LimbahIcon = ({ limbah }: { limbah: string }) => {
  const getLimbahImage = (limbahName: string) => {
    switch (limbahName.toLowerCase()) {
      case "limbah pertanian":
        return "/images/kategori/LimbahPertanian.png";
      case "limbah kelautan":
        return "/images/kategori/LimbahKelautan.png";
      default:
        return "/images/kategori/LimbahPertanian.png"; // default fallback
    }
  };

  return (
    <Image
      src={getLimbahImage(limbah)}
      alt={limbah}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Fisik Icon Component
const FisikIcon = ({ fisik }: { fisik: string }) => {
  const getFisikImage = (fisikName: string) => {
    // Remove spaces and convert to proper format
    const formattedName = fisikName.replace(/\s+/g, "");
    return `/images/kategori/${formattedName}.png`;
  };

  return (
    <Image
      src={getFisikImage(fisik)}
      alt={fisik}
      width={16}
      height={16}
      className="w-4 h-4 sm:w-5 sm:h-5 object-contain"
    />
  );
};

// Single Star Rating Component
const SingleStarRating = ({ rating }: { rating: number }) => {
  const hasRating = rating > 0;

  return (
    <svg
      className="w-3 h-3 text-yellow-500"
      fill={hasRating ? "currentColor" : "none"}
      stroke={hasRating ? "currentColor" : "currentColor"}
      strokeWidth={hasRating ? "0" : "1.5"}
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
};

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

interface Review {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  ulasan: string;
  gambar?: string;
  createdAt: string;
}

const Detail = () => {
  const [quantity, setQuantity] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [store, setStore] = useState<any>(null);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedReviews, setDisplayedReviews] = useState(3); // Show 3 reviews initially
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useUser();
  const [selectedWeight, setSelectedWeight] = useState<Weight | null>(null);
  const [beliLoading, setBeliLoading] = useState(false);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 0 ? q - 1 : 0));

  // Function to load more reviews
  const loadMoreReviews = () => {
    setDisplayedReviews((prev) => prev + 3);
  };

  // Function to show all reviews
  const showAllReviews = () => {
    setDisplayedReviews(reviews.length);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!slug || slug === "undefined") {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        const productData = await fetchProductById(slug);
        setProduct(productData);

        // Fetch store data
        if (productData.store_id) {
          try {
            const storeData = await fetchStoreById(productData.store_id);
            setStore(storeData);
          } catch (storeError) {
            console.error("Error fetching store:", storeError);
          }
        }

        // Fetch reviews
        try {
          const reviewsResponse = await fetch(`/api/productReviews/${slug}`);
          if (reviewsResponse.ok) {
            const reviewsData = await reviewsResponse.json();
            setReviews(reviewsData);
          }
        } catch (reviewsError) {
          console.error("Error fetching reviews:", reviewsError);
        }

        const productsData = await fetchProducts();
        // Get 4 random products excluding current product
        const otherProducts = productsData
          .filter((p) => p._id !== slug)
          .sort(() => Math.random() - 0.5)
          .slice(0, 4);
        setOtherProducts(otherProducts);

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadData();
  }, [slug]);

  if (loading) {
    return <PageLoading text="Memuat detail produk..." />;
  }

  if (error || !product) {
    return (
      <div className="text-center py-40 text-red-500">
        Error: {error || "Product not found"}
      </div>
    );
  }

  const router = useRouter();

  return (
    <section className="bg-white pt-22 sm:pt-24 md:pt-28 pb-10 w-full">
      <div className="w-full max-w-5xl mx-auto flex flex-col px-4">
        {/* Tombol Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-black text-sm mb-4 hover:underline w-fit"
        >
          <ArrowLeft className="w-6 h-6 mr-1" />
        </button>

        <h2 className="text-left text-2xl font-semibold text-black mb-8">
          Detail Produk
        </h2>

        {/* Detail Produk */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Gambar Produk */}
          <div className="w-full md:w-2/5 flex justify-center items-start">
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={300}
              height={300}
              className="object-contain w-full max-w-xs md:max-w-sm"
            />
          </div>

          {/* Info Produk */}
          <div className="w-full md:w-3/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl md:text-3xl font-semibold text-black">
                {product.name}
              </h3>
              {store && (
                <button
                  className="flex items-center justify-between bg-white border border-orange-200 text-black text-xs py-2 px-3 rounded-[25px] font-semibold hover:scale-105 duration-300 transition text-left"
                  onClick={() => router.push(`/toko/${store._id}`)}
                >
                  <span className="text-left">{store.nama_toko}</span>
                  <img
                    src="/images/icons/toko.png"
                    alt="Toko"
                    className="w-5 h-5 ml-2"
                  />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-yellow-500 text-sm md:text-base">
              <span className="text-black">{product.rating}</span>
              <RatingStars rating={product.rating || 0} />
            </div>

            <div className="text-2xl md:text-4xl font-semibold text-black">
              {selectedWeight
                ? `Rp${selectedWeight.price.toLocaleString()}`
                : `Rp${product.price.toLocaleString()}`}
            </div>

            {/* Deskripsi Produk */}
            <div className="bg-white p-6 mt-4">
              <h4 className="text-lg font-semibold text-black mb-3">
                Deskripsi Produk
              </h4>
              <div className="text-black/70 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <p className="text-black text-base md:text-lg font-medium mt-4">
              Tersedia Dalam:
            </p>
            <div className="flex flex-wrap gap-2">
              {product.weights.map((weight) => (
                <label
                  key={weight.id}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border transition ${
                    selectedWeight?.id === weight.id
                      ? "bg-2 text-white border-2 border-2"
                      : "bg-white text-black border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="weight"
                    value={weight.id}
                    checked={selectedWeight?.id === weight.id}
                    onChange={() => setSelectedWeight(weight)}
                    className="form-radio accent-2"
                  />
                  {weight.value}
                </label>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
              {/* Counter */}
              <div className="flex items-center gap-3 bg-[#6D8044]/14 px-4 py-2 rounded-full">
                <button onClick={decrement} className="text-black text-lg">
                  <Minus />
                </button>
                <span className="text-lg font-medium text-black">
                  {quantity}
                </span>
                <button onClick={increment} className="text-black text-lg">
                  <Plus />
                </button>
              </div>

              {/* Tombol Aksi */}
              <div className="flex flex-wrap gap-2">
                <AddToCartButton
                  productId={product._id}
                  quantity={quantity}
                  weight={selectedWeight}
                  onSuccess={() => {
                    alert("Produk berhasil ditambahkan ke keranjang!");
                    setQuantity(0);
                  }}
                  onError={(message) => alert(message)}
                />
                <button
                  className="bg-3 px-5 py-2 rounded-full text-black font-medium hover:bg-3/90 transition"
                  disabled={beliLoading}
                  onClick={async () => {
                    if (!user) {
                      alert("Silakan login terlebih dahulu");
                      router.push("/auth/login");
                      return;
                    }
                    if (quantity < 1) {
                      alert("Jumlah produk harus minimal 1");
                      return;
                    }
                    if (!selectedWeight) {
                      alert("Pilih berat produk terlebih dahulu");
                      return;
                    }
                    setBeliLoading(true);
                    // Tambahkan ke keranjang dengan jumlah dan berat yang dipilih
                    const response = await fetch("/api/cart/add", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        user_id: user._id,
                        product_id: product._id,
                        jumlah: quantity,
                        weight_id: selectedWeight.id,
                        weight_value: selectedWeight.value,
                        harga_satuan: selectedWeight.price,
                      }),
                    });
                    if (response.ok) {
                      router.push("/pembayaran");
                    } else {
                      const data = await response.json();
                      alert(data.message || "Gagal menambahkan ke keranjang");
                    }
                    setBeliLoading(false);
                  }}
                >
                  {beliLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="yellow" className="mr-2" />
                      Memproses...
                    </>
                  ) : (
                    "Beli Sekarang"
                  )}
                </button>
                <WishlistButton productId={product._id} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="w-full pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-left text-xl md:text-2xl font-semibold text-black">
              Ulasan Produk
            </h2>
            {reviews.length > 0 && (
              <span className="text-sm text-gray-600">
                {displayedReviews} dari {reviews.length} ulasan
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {reviews.slice(0, displayedReviews).map((review) => (
                  <div key={review._id} className="bg-gray-50 rounded-xl p-6">
                    {/* Review Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Profile Picture */}
                        <div className="w-12 h-12 rounded-full bg-2 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {review.user_id.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* User Info */}
                        <div>
                          <h4 className="font-semibold text-black">
                            {review.user_id.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1">
                        <RatingStars rating={review.rating} />
                        <span className="text-sm text-gray-600 ml-2">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="mb-4">
                      <p className="text-black leading-relaxed">
                        {review.ulasan}
                      </p>
                    </div>

                    {/* Review Image */}
                    {review.gambar && (
                      <div className="mt-4">
                        <img
                          src={review.gambar}
                          alt="Review image"
                          className="w-full max-w-xs rounded-lg object-cover"
                          style={{ maxHeight: "200px" }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {displayedReviews < reviews.length && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    className="bg-3 px-6 py-2 rounded-full text-black font-medium hover:bg-3/90 transition"
                    onClick={loadMoreReviews}
                  >
                    Lihat {Math.min(3, reviews.length - displayedReviews)}{" "}
                    Ulasan Lainnya
                  </button>
                  {reviews.length > 6 && (
                    <button
                      className="bg-gray-200 px-6 py-2 rounded-full text-black font-medium hover:bg-gray-300 transition"
                      onClick={showAllReviews}
                    >
                      Lihat Semua Ulasan
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
        {/* Produk Lain */}
        <section className="w-full pt-4">
          <h2 className="text-left text-xl md:text-2xl font-semibold text-black mb-4">
            Produk Lain yang Mungkin Anda Suka
          </h2>
          {/* Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar md:hidden">
            {otherProducts.length > 0 ? (
              otherProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/detail/${product._id}`}
                  className="flex-shrink-0 w-48"
                >
                  <div className="bg-7 rounded-2xl flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full overflow-hidden">
                    <div className="w-full aspect-square">
                      <Image
                        src={product.imageUrl || "/images/placeholder.png"}
                        alt={product.name}
                        width={120}
                        height={120}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-left text-black leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex justify-between text-xs text-black/40 mb-1 px-1">
                        <span className="flex items-center gap-1">
                          <CategoryIcon category={product.categoryOptions} />
                          {product.limbahOptions && (
                            <LimbahIcon limbah={product.limbahOptions} />
                          )}
                          {product.fisikOptions && (
                            <FisikIcon fisik={product.fisikOptions} />
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <SingleStarRating rating={product.rating || 0} />
                          <span className="text-black/60 text-xs">
                            ({product.rating?.toFixed(1) || "0.0"})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-semibold text-black">
                          Rp{product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <WishlistButton productId={product._id} size="sm" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500 w-full">
                Tidak ada produk lain
              </div>
            )}
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {otherProducts.length > 0 ? (
              otherProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/detail/${product._id}`}
                  className="flex-shrink-0 w-full"
                >
                  <div className="bg-7 rounded-2xl flex flex-col justify-between hover:shadow-lg transition cursor-pointer h-full overflow-hidden">
                    <div className="w-full aspect-square">
                      <Image
                        src={product.imageUrl || "/images/placeholder.png"}
                        alt={product.name}
                        width={150}
                        height={150}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-semibold text-left text-black leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex justify-between text-sm text-black/40 mb-1 px-1">
                        <span className="flex items-center gap-1">
                          <CategoryIcon category={product.categoryOptions} />
                          {product.limbahOptions && (
                            <LimbahIcon limbah={product.limbahOptions} />
                          )}
                          {product.fisikOptions && (
                            <FisikIcon fisik={product.fisikOptions} />
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <SingleStarRating rating={product.rating || 0} />
                          <span className="text-black/60 text-xs">
                            ({product.rating?.toFixed(1) || "0.0"})
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center px-1">
                        <span className="text-base font-semibold text-black">
                          Rp{product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          <span
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <WishlistButton productId={product._id} size="sm" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center text-gray-500 col-span-full">
                Tidak ada produk lain
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
};

export default Detail;
