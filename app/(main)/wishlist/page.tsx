"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import ChatbotWidget from "@/components/ChatbotWidget";

interface WishlistItem {
  _id: string;
  product_id: {
    _id: string;
    name: string;
    imageUrl: string;
    price: number;
    stock: number;
    categoryOptions: string;
    rating: number;
  };
}

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadWishlist();
  }, [user, router]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlist/user/${user?._id}`);
      const data = await response.json();
      if (response.ok) {
        setWishlistItems(data.wishlist_item || []);
      } else {
        setError(data.message || 'Gagal memuat wishlist');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const response = await fetch(`/api/wishlist/remove/${productId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.product_id._id !== productId));
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal menghapus dari wishlist');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Gagal menghapus dari wishlist');
    }
  };

  const addToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?._id,
          product_id: productId,
          jumlah: 1,
          weight_id: 'default',
          weight_value: 'Default',
          harga_satuan: wishlistItems.find(item => item.product_id._id === productId)?.product_id.price || 0,
        }),
      });
      if (response.ok) {
        // Remove from wishlist after successfully adding to cart
        const removeResponse = await fetch(`/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
        });
        if (removeResponse.ok) {
          // Update local state to remove the item from wishlist
          setWishlistItems(prev => prev.filter(item => item.product_id._id !== productId));
          alert('Produk berhasil ditambahkan ke keranjang dan dihapus dari wishlist!');
          router.push('/keranjang');
        } else {
          alert('Produk berhasil ditambahkan ke keranjang, tetapi gagal dihapus dari wishlist');
          router.push('/keranjang');
        }
      } else {
        const data = await response.json();
        alert(data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Gagal menambahkan ke keranjang');
    }
  };

  if (loading) return <div className="text-center py-40">Loading...</div>;
  if (error) return <div className="text-center py-40 text-red-500">Error: {error}</div>;

  return (
    <section className="bg-white py-20 sm:py-40 w-full">
      <ChatbotWidget />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="w-full max-w-6xl px-4 mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-black/60 hover:text-black transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-normal text-black mb-4">Wishlist Saya</h1>
          <p className="text-black/50 max-w-2xl mx-auto">
            Simpan produk favorit Anda untuk dibeli nanti
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black mb-2">Wishlist Kosong</h3>
            <p className="text-black/50 mb-6">Anda belum memiliki produk di wishlist</p>
            <Link 
              href="/katalog" 
              className="bg-1 text-white px-6 py-3 rounded-full hover:bg-opacity-90 transition"
            >
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-7 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg transition h-full"
              >
                <div className="w-full flex justify-center items-center mb-4 pt-2 h-36 md:h-60">
                  <Image
                    src={item.product_id.imageUrl || "/images/placeholder.png"}
                    alt={item.product_id.name}
                    width={200}
                    height={200}
                    className="object-contain w-full h-full"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-semibold text-left text-black leading-tight mb-1">
                    {item.product_id.name}
                  </h3>

                  <div className="flex justify-between text-xs md:text-sm text-black/40 mb-2 px-1">
                    <span>{item.product_id.categoryOptions}</span>
                    <span className="flex items-center gap-1 text-yellow-500 text-[12px] md:text-[14px]">
                      ★ <span className="text-black/60">({item.product_id.rating ?? "0.0"})</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center px-1 mb-3">
                    <span className="text-sm md:text-base font-semibold text-black">
                      Rp{item.product_id.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-black/60">
                      Stok: {item.product_id.stock}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addToCart(item.product_id._id)}
                    className="flex-1 bg-1 text-white py-2 px-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={() => removeFromWishlist(item.product_id._id)}
                    className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition flex items-center justify-center"
                    title="Hapus dari wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Wishlist; 