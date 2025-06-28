"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import InformativeFooter from "@/components/footer/detilInformasi";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: userLoading, error: userError } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);

  // Debug logs
  console.log("CartPage - User:", user);
  console.log("CartPage - UserLoading:", userLoading);
  console.log("CartPage - UserError:", userError);

  // Ambil data keranjang dari backend
  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/cart/user/${user._id}`);
      const data = await res.json();
      if (res.ok) {
        setCartItems(data.cart_item || []);
        // Auto-select all items initially
        const allItemIds = new Set<string>(
          (data.cart_item || []).map(
            (item: any) => item.product_id?._id || item.product_id
          )
        );
        setSelectedItems(allItemIds);
      } else {
        setError(data.message || "Gagal mengambil keranjang");
      }
    } catch (e) {
      setError("Gagal mengambil keranjang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    if (user) {
      fetchCart();
    }
  }, [user]);

  // Update jumlah item
  const updateQuantity = async (productId: string, newQty: number) => {
    if (!user || newQty < 1) return;
    await fetch("/api/cart/update", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user._id,
        product_id: productId,
        jumlah: newQty,
      }),
    });
    fetchCart();
  };

  // Hapus item
  const removeItem = async (productId: string) => {
    if (!user) return;

    console.log("Removing item with productId:", productId);
    console.log("User ID:", user._id);

    // Set loading state for this specific item
    setRemovingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch(
        `/api/cart/remove/${user._id}/${productId}`,
        {
          method: "DELETE",
        }
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error removing item:", errorData);
        alert("Gagal menghapus item dari keranjang");
        return;
      }

      const result = await response.json();
      console.log("Remove result:", result);
      console.log("Item berhasil dihapus");

      // Refresh cart data
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Terjadi kesalahan saat menghapus item");
    } finally {
      // Remove loading state for this item
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  // Bersihkan keranjang
  const clearCart = async () => {
    if (!user) return;

    setClearingCart(true);

    try {
      await fetch(`/api/cart/clear/${user._id}`, { method: "DELETE" });
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      alert("Gagal membersihkan keranjang");
    } finally {
      setClearingCart(false);
    }
  };

  // Toggle item selection
  const toggleItemSelection = (productId: string) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(productId)) {
      newSelectedItems.delete(productId);
    } else {
      newSelectedItems.add(productId);
    }
    setSelectedItems(newSelectedItems);
  };

  // Select all items
  const selectAllItems = () => {
    const allItemIds = new Set(
      cartItems.map((item) => item.product_id?._id || item.product_id)
    );
    setSelectedItems(allItemIds);
  };

  // Deselect all items
  const deselectAllItems = () => {
    setSelectedItems(new Set());
  };

  // Get selected cart items
  const getSelectedCartItems = () => {
    return cartItems.filter((item) =>
      selectedItems.has(item.product_id?._id || item.product_id)
    );
  };

  // Hitung total untuk item yang dipilih
  const selectedCartItems = getSelectedCartItems();
  const subtotal = selectedCartItems.reduce(
    (sum, item) => sum + (item.subtotal || 0),
    0
  );
  const shipping = 0; // Akan dihitung di checkout
  const tax = 0;
  const discount = 0;
  const total = subtotal + shipping + tax - discount;

  const formatRupiahSingkat = (value: number) => {
    if (value >= 100000) return `Rp${Math.round(value / 1000)}RB`;
    return `Rp${value.toLocaleString()}`;
  };

  // Loading Spinner Component
  const LoadingSpinner = () => (
    <svg
      className="w-5 h-5 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // Handle checkout
  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      alert("Pilih minimal satu item untuk checkout");
      return;
    }

    // Pass selected items to payment page via URL params
    const selectedItemIds = Array.from(selectedItems).join(",");
    router.push(`/pembayaran?selectedItems=${selectedItemIds}`);
  };

  // Show loading while user is being fetched
  if (userLoading) {
    return (
      <div className="min-h-screen pt-20 md:pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 md:pt-32 pb-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 text-black">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan login terlebih dahulu untuk melihat keranjang belanja Anda.
          </p>
          {userError && <p className="text-red-500 mb-4">Error: {userError}</p>}
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-2 text-white px-6 py-3 rounded-lg hover:bg-2/80 transition"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section*/}
        <div className="text-center mb-8 px-4 md:px-[30%]">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-black">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            hingga 30%! Beli pakan, bantu bumi.
          </p>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Tabel Produk */}
          <div className="flex-1 order-1">
            <div className="p-2 md:p-4">
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] bg-2 rounded-[50px] font-bold text-white p-[20px] mb-4">
                <div className="flex justify-center">Pilih</div>
                <div className="px-4">Produk</div>
                <div className="px-4">Harga</div>
                <div className="px-4">Kuantitas</div>
                <div className="px-4">Subtotal</div>
                <div className="px-4">Aksi</div>
              </div>

              {/* Mobile Table Header */}
              <div className="md:hidden bg-2 rounded-[25px] font-bold text-white p-4 mb-4">
                <div className="grid grid-cols-[auto_1fr_auto] gap-4">
                  <div className="flex justify-center">Pilih</div>
                  <div>Produk</div>
                  <div className="flex justify-center">Aksi</div>
                </div>
              </div>

              {/* Baris Pilih Semua */}
              {cartItems.length > 0 && (
                <>
                  {/* Desktop Select All */}
                  <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] items-center border-b border-gray-200 py-4 bg-gray-50">
                    <div className="flex justify-center px-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.size === cartItems.length &&
                          cartItems.length > 0
                        }
                        onChange={() => {
                          if (selectedItems.size === cartItems.length) {
                            deselectAllItems();
                          } else {
                            selectAllItems();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="px-4">
                      <span className="text-sm font-bold text-gray-700">
                        Pilih Semua ({selectedItems.size} dari{" "}
                        {cartItems.length})
                      </span>
                    </div>
                    <div className="px-4"></div>
                    <div className="px-4"></div>
                    <div className="px-4"></div>
                    <div className="flex justify-center px-4">
                      <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 px-3 py-1 rounded-md hover:bg-red-50 transition-colors text-sm font-bold"
                        title="Bersihkan keranjang"
                        disabled={clearingCart}
                      >
                        {clearingCart ? (
                          <div className="flex items-center gap-2">
                            <LoadingSpinner />
                            <span>Menghapus...</span>
                          </div>
                        ) : (
                          "Hapus"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Mobile Select All */}
                  <div className="md:hidden grid grid-cols-[auto_1fr_auto] items-center border-b border-gray-200 py-4 bg-gray-50 rounded-lg mb-2">
                    <div className="flex justify-center px-2">
                      <input
                        type="checkbox"
                        checked={
                          selectedItems.size === cartItems.length &&
                          cartItems.length > 0
                        }
                        onChange={() => {
                          if (selectedItems.size === cartItems.length) {
                            deselectAllItems();
                          } else {
                            selectAllItems();
                          }
                        }}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="px-2">
                      <span className="text-sm font-bold text-gray-700">
                        Pilih Semua ({selectedItems.size} dari{" "}
                        {cartItems.length})
                      </span>
                    </div>
                    <div className="flex justify-center px-2">
                      <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50 transition-colors text-xs font-bold"
                        title="Bersihkan keranjang"
                        disabled={clearingCart}
                      >
                        {clearingCart ? (
                          <div className="flex items-center gap-1">
                            <LoadingSpinner />
                            <span>Hapus</span>
                          </div>
                        ) : (
                          "Hapus"
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}
              {loading ? (
                <div className="text-center py-10">Loading...</div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Image
                    src="/images/cart/keranjangKosong.png"
                    alt="Keranjang kosong"
                    width={120}
                    height={120}
                  />
                  <div className="mt-4 text-gray-500">Keranjang kosong</div>
                </div>
              ) : (
                cartItems.map((item) => {
                  const itemId = item.product_id?._id || item.product_id;
                  const isSelected = selectedItems.has(itemId);

                  return (
                    <div key={itemId}>
                      {/* Desktop Cart Item */}
                      <div
                        className={`hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] items-center border-b border-black py-4 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        {/* Kolom Checkbox */}
                        <div className="flex justify-center px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleItemSelection(itemId)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>

                        {/* Kolom Produk */}
                        <div className="flex items-center gap-4 px-4">
                          <Image
                            src={
                              item.product_id?.imageUrl ||
                              "/images/cart/gimmeOrganic.png"
                            }
                            alt={item.product_id?.name || "Produk"}
                            width={50}
                            height={50}
                            className="rounded"
                          />
                          <div className="flex flex-col">
                            <span className="text-black">
                              {item.product_id?.name || "Produk"}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {item.weight_value ||
                                item.product_id?.besaran ||
                                "-"}
                            </span>
                          </div>
                        </div>
                        {/* Kolom Harga */}
                        <div className="text-black px-4">
                          {formatRupiahSingkat(item.harga_satuan)}
                        </div>
                        {/* Kolom Kuantitas */}
                        <div className="flex items-center gap-4 bg-5 rounded-full px-4 mr-10">
                          <button
                            onClick={() =>
                              updateQuantity(itemId, item.jumlah - 1)
                            }
                            className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                            disabled={item.jumlah <= 1}
                          >
                            -
                          </button>
                          <span className="text-black text-md font-medium">
                            {item.jumlah}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(itemId, item.jumlah + 1)
                            }
                            className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        {/* Kolom Subtotal */}
                        <div className="text-black px-4">
                          {formatRupiahSingkat(item.subtotal)}
                        </div>
                        {/* Kolom Aksi */}
                        <div className="flex justify-center px-6">
                          <button
                            onClick={() => removeItem(itemId)}
                            className="text-gray-400 hover:scale-105 duration-300 rounded-full"
                            title="Hapus item"
                            disabled={removingItems.has(itemId)}
                          >
                            {removingItems.has(itemId) ? (
                              <LoadingSpinner />
                            ) : (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Mobile Cart Item */}
                      <div
                        className={`md:hidden border-b border-gray-200 py-4 px-2 ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
                          {/* Checkbox */}
                          <div className="flex justify-center pt-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleItemSelection(itemId)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <Image
                                src={
                                  item.product_id?.imageUrl ||
                                  "/images/cart/gimmeOrganic.png"
                                }
                                alt={item.product_id?.name || "Produk"}
                                width={40}
                                height={40}
                                className="rounded"
                              />
                              <div className="flex flex-col">
                                <span className="text-black font-medium text-sm">
                                  {item.product_id?.name || "Produk"}
                                </span>
                                <span className="text-gray-500 text-xs">
                                  {item.weight_value ||
                                    item.product_id?.besaran ||
                                    "-"}
                                </span>
                              </div>
                            </div>

                            {/* Price and Quantity for Mobile */}
                            <div className="flex justify-between items-center mt-2">
                              <div className="text-sm">
                                <span className="text-gray-600">Harga: </span>
                                <span className="font-medium text-black">
                                  {formatRupiahSingkat(item.harga_satuan)}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="text-gray-600">Total: </span>
                                <span className="font-medium text-black">
                                  {formatRupiahSingkat(item.subtotal)}
                                </span>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-5 rounded-full px-3 py-1 w-fit">
                              <button
                                onClick={() =>
                                  updateQuantity(itemId, item.jumlah - 1)
                                }
                                className="text-lg text-black px-1 hover:opacity-70 transition cursor-pointer"
                                disabled={item.jumlah <= 1}
                              >
                                -
                              </button>
                              <span className="text-black text-sm font-medium min-w-[20px] text-center">
                                {item.jumlah}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(itemId, item.jumlah + 1)
                                }
                                className="text-lg text-black px-1 hover:opacity-70 transition cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-center pt-2">
                            <button
                              onClick={() => removeItem(itemId)}
                              className="text-gray-400 hover:scale-105 duration-300 rounded-full"
                              title="Hapus item"
                              disabled={removingItems.has(itemId)}
                            >
                              {removingItems.has(itemId) ? (
                                <LoadingSpinner />
                              ) : (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {error && (
                <div className="text-red-500 text-center mt-4">{error}</div>
              )}
            </div>
          </div>

          {/* Ringkasan Belanja */}
          <div className="w-full lg:w-1/3 order-2">
            <div className="border border-gray-300 rounded-[25px] p-4 md:p-6 shadow-md">
              <h2 className="text-lg md:text-xl text-gray-700 font-bold mb-4">
                Total Belanja
              </h2>
              <div className="space-y-2 text-gray-700 text-sm md:text-base">
                <div className="flex justify-between border-t pt-4 md:pt-8">
                  <span>Produk ({selectedItems.size} item)</span>
                  <span>Rp{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sub Total</span>
                  <span>Rp{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pengiriman</span>
                  <span>Rp{shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pajak</span>
                  <span>Rp{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Diskon</span>
                  <span>Rp{discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-base md:text-lg pt-4 md:pt-8">
                  <span>Total</span>
                  <span>Rp{total.toLocaleString()}</span>
                </div>
              </div>
              <button
                className="w-full px-4 bg-3 text-white py-3 md:py-2 rounded-lg mt-4 hover:bg-yellow-500 disabled:opacity-60 text-sm md:text-base"
                disabled={selectedItems.size === 0}
                onClick={handleCheckout}
              >
                Lanjut ke pembayaran ({selectedItems.size} item)
              </button>
            </div>
          </div>
        </div>

        {/* Detil Informasi */}
        <InformativeFooter />
      </div>
    </div>
  );
}
