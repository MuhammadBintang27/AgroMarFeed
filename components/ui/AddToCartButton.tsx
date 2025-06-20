'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { useUser } from '@/contexts/UserContext';

interface AddToCartButtonProps {
  productId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  quantity?: number;
}

export default function AddToCartButton({ 
  productId, 
  onSuccess, 
  onError, 
  quantity: propQuantity
}: AddToCartButtonProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(propQuantity ?? 1);

  useEffect(() => {
    if (typeof propQuantity === 'number') {
      setQuantity(propQuantity);
    }
  }, [propQuantity]);

  const handleAddToCart = async () => {
    if (!user) {
      onError?.('Silakan login terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user._id,
          product_id: productId,
          jumlah: quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess?.();
        if (typeof propQuantity !== 'number') setQuantity(1);
      } else {
        onError?.(data.message || 'Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      onError?.('Terjadi kesalahan server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100"
          disabled={quantity <= 1 || typeof propQuantity === 'number'}
        >
          -
        </button>
        <span className="px-3 py-2 border-x">{quantity}</span>
        <button
          onClick={() => setQuantity(quantity + 1)}
          className="px-3 py-2 text-gray-600 hover:bg-gray-100"
          disabled={typeof propQuantity === 'number'}
        >
          +
        </button>
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={isLoading}
        className="flex-1"
      >
        {isLoading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
      </Button>
    </div>
  );
} 