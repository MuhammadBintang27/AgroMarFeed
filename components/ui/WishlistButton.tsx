"use client";
import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface WishlistButtonProps {
  productId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ 
  productId, 
  className = "", 
  size = "md" 
}) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  useEffect(() => {
    if (user && productId) {
      checkWishlistStatus();
    }
  }, [user, productId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await fetch(`/api/wishlist/check/${user?._id}/${productId}`);
      const data = await response.json();
      if (response.ok) {
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/wishlist/remove/${productId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setIsInWishlist(false);
        } else {
          const data = await response.json();
          alert(data.message || 'Gagal menghapus dari wishlist');
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/wishlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user._id,
            product_id: productId,
          }),
        });
        if (response.ok) {
          setIsInWishlist(true);
        } else {
          const data = await response.json();
          alert(data.message || 'Gagal menambahkan ke wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  // Add heartbeat animation style
  const heartbeatStyle = `
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    10%, 30% { transform: scale(1.2); }
    20%, 40% { transform: scale(0.95); }
    50% { transform: scale(1.1); }
    60% { transform: scale(0.98); }
    70% { transform: scale(1.05); }
    80% { transform: scale(1); }
  }
  `;

  if (typeof window !== 'undefined') {
    const styleId = 'wishlist-heartbeat-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = heartbeatStyle;
      document.head.appendChild(style);
    }
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isLoading}
      className={`${className} ${sizeClasses[size]} text-[#C7C7CC] hover:text-red-500 transition flex items-center justify-center disabled:opacity-50`}
      title={isInWishlist ? "Hapus dari wishlist" : "Tambah ke wishlist"}
    >
      <Heart 
        className={
          `${sizeClasses[size]} ` +
          (
            isLoading
              ? 'fill-red-500 text-red-500 animate-heartbeat'
              : isInWishlist
                ? 'fill-red-500 text-red-500'
                : ''
          )
        }
        style={isLoading ? { animation: 'heartbeat 0.8s infinite' } : {}}
      />
    </button>
  );
};

export default WishlistButton; 