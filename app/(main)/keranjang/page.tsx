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

    // Debug logs
    console.log('CartPage - User:', user);
    console.log('CartPage - UserLoading:', userLoading);
    console.log('CartPage - UserError:', userError);

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
                const allItemIds = new Set<string>((data.cart_item || []).map((item: any) => item.product_id?._id || item.product_id));
                setSelectedItems(allItemIds);
            } else {
                setError(data.message || 'Gagal mengambil keranjang');
            }
        } catch (e) {
            setError('Gagal mengambil keranjang');
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
        await fetch('/api/cart/update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user._id, product_id: productId, jumlah: newQty })
        });
        fetchCart();
    };

    // Hapus item
    const removeItem = async (productId: string) => {
        if (!user) return;
        await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
        fetchCart();
    };

    // Bersihkan keranjang
    const clearCart = async () => {
        if (!user) return;
        await fetch(`/api/cart/clear/${user._id}`, { method: 'DELETE' });
        fetchCart();
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
        const allItemIds = new Set(cartItems.map(item => item.product_id?._id || item.product_id));
        setSelectedItems(allItemIds);
    };

    // Deselect all items
    const deselectAllItems = () => {
        setSelectedItems(new Set());
    };

    // Get selected cart items
    const getSelectedCartItems = () => {
        return cartItems.filter(item => selectedItems.has(item.product_id?._id || item.product_id));
    };

    // Hitung total untuk item yang dipilih
    const selectedCartItems = getSelectedCartItems();
    const subtotal = selectedCartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const shipping = 0; // Akan dihitung di checkout
    const tax = 0;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    const formatRupiahSingkat = (value: number) => {
        if (value >= 100000) return `Rp${Math.round(value / 1000)}RB`;
        return `Rp${value.toLocaleString()}`;
    };

    // Handle checkout
    const handleCheckout = () => {
        if (selectedItems.size === 0) {
            alert('Pilih minimal satu item untuk checkout');
            return;
        }
        
        // Pass selected items to payment page via URL params
        const selectedItemIds = Array.from(selectedItems).join(',');
        router.push(`/pembayaran?selectedItems=${selectedItemIds}`);
    };

    // Show loading while user is being fetched
    if (userLoading) {
        return (
            <div className="min-h-screen pt-32 pb-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-4 text-black">Keranjang Belanja</h1>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-16 bg-gray-50">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-3xl font-bold mb-4 text-black">Keranjang Belanja</h1>
                    <p className="text-gray-600 mb-8">Silakan login terlebih dahulu untuk melihat keranjang belanja Anda.</p>
                    {userError && <p className="text-red-500 mb-4">Error: {userError}</p>}
                    <button 
                        onClick={() => router.push('/auth/login')}
                        className="bg-2 text-white px-6 py-3 rounded-lg hover:bg-2/80 transition"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-32 pb-16 bg-gray-50">
            <div className="container mx-auto px-4">
                {/* Header Section*/}
                <div className="text-center mb-8 px-[30%]">
                    <h1 className="text-3xl font-bold mb-2 text-black">
                        Keranjang Belanja
                    </h1>
                    <p className="text-gray-600">
                        Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
                        hingga 30%! Beli pakan, bantu bumi.
                    </p>
                </div>

                {/* Selection Controls */}
                {cartItems.length > 0 && (
                    <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={selectAllItems}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                            >
                                Pilih Semua
                            </button>
                            <button
                                onClick={deselectAllItems}
                                className="text-sm text-gray-600 hover:text-gray-800 underline"
                            >
                                Hapus Pilihan
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedItems.size} dari {cartItems.length} item dipilih
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Tabel Produk */}
                    <div className="flex-1">
                        <div className="p-4">
                            <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr] bg-2 rounded-[50px] font-bold text-white p-[20px] mb-4">
                                <div className="pl-4">Pilih</div>
                                <div>Produk</div>
                                <div>Harga</div>
                                <div>Kuantitas</div>
                                <div>Subtotal</div>
                            </div>
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
                                        <div
                                            key={itemId}
                                            className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr] items-center border-b border-black py-4 ${
                                                isSelected ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            {/* Kolom Checkbox */}
                                            <div className="flex justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleItemSelection(itemId)}
                                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                            </div>
                                            
                                            {/* Kolom Produk */}
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={() => removeItem(itemId)}
                                                    className="text-black hover:text-red-700"
                                                >
                                                    ✕
                                                </button>
                                                <Image
                                                    src={item.product_id?.imageUrl || "/images/cart/gimmeOrganic.png"}
                                                    alt={item.product_id?.name || "Produk"}
                                                    width={50}
                                                    height={50}
                                                    className="rounded"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-black">{item.product_id?.name || "Produk"}</span>
                                                    <span className="text-gray-500 text-sm">{item.product_id?.besaran || "-"}</span>
                                                </div>
                                            </div>
                                            {/* Kolom Harga */}
                                            <div className="text-black">{formatRupiahSingkat(item.harga_satuan)}</div>
                                            {/* Kolom Kuantitas */}
                                            <div className="flex items-center gap-4 bg-5 rounded-full px-4 mr-10">
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.jumlah - 1)}
                                                    className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                                                    disabled={item.jumlah <= 1}
                                                >
                                                    -
                                                </button>
                                                <span className="text-black text-md font-medium">{item.jumlah}</span>
                                                <button
                                                    onClick={() => updateQuantity(itemId, item.jumlah + 1)}
                                                    className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            {/* Kolom Subtotal */}
                                            <div className="text-black">{formatRupiahSingkat(item.subtotal)}</div>
                                        </div>
                                    );
                                })
                            )}
                            {error && <div className="text-red-500 text-center mt-4">{error}</div>}
                        </div>
                    </div>

                    {/* Ringkasan Belanja */}
                    <div className="md:w-1/3">
                        <div className="border border-gray-300 rounded-[25px] p-4 shadow-md p-6">
                            <h2 className="text-xl text-gray-700 font-bold mb-4">Total Belanja</h2>
                            <div className="space-y-2 text-gray-700">
                                <div className="flex justify-between border-t pt-8">
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
                                <div className="flex justify-between font-bold text-lg  pt-8">
                                    <span>Total</span>
                                    <span>Rp{total.toLocaleString()}</span>
                                </div>
                            </div>
                            <button
                                className="w-full px-4 bg-3 text-white py-2 rounded-lg mt-4 hover:bg-yellow-500 disabled:opacity-60"
                                disabled={selectedItems.size === 0}
                                onClick={handleCheckout}
                            >
                                Lanjut ke pembayaran ({selectedItems.size} item)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bersihkan Keranjang */}
                <div className="text-center mt-8">
                    <button
                        onClick={clearCart}
                        className="text-black underline hover:text-red-700 font-medium"
                        disabled={cartItems.length === 0}
                    >
                        Bersihkan Keranjang Belanja
                    </button>
                </div>

                {/* Detil Informasi */}
                <InformativeFooter />
            </div>
        </div>
    );
}