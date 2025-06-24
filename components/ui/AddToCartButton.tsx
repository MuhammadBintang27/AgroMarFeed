'use client';

import { useState, useEffect } from 'react';
import Button from './Button';
import { useUser } from '@/contexts/UserContext';
import { Weight } from '@/lib/api/fetchProducts';

interface AddToCartButtonProps {
  productId: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
  quantity?: number;
  weight?: Weight | null;
}

export default function AddToCartButton({ 
  productId, 
  onSuccess, 
  onError, 
  quantity: propQuantity,
  weight
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
    if (!weight) {
      onError?.('Pilih berat produk terlebih dahulu');
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
          weight_id: weight.id,
          weight_value: weight.value,
          harga_satuan: weight.price,
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