"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import InformativeFooter from "@/components/footer/detilInformasi";

export default function CartPage() {
    const [isMounted, setIsMounted] = useState(false);
    const [cartItems, setCartItems] = useState([
        { id: 1, name: "GimMe Organic", besaran: "5 kg", price: 15000, quantity: 5 },
        { id: 2, name: "GimMe Organic", besaran: "10 kg", price: 30000, quantity: 5 },
        { id: 3, name: "GimMe Organic", besaran: "15 kg", price: 44000, quantity: 5 },
        { id: 4, name: "GimMe Organic", besaran: "20 kg", price: 55000, quantity: 5 },
    ]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    // Fungsi untuk menambah/mengurangi kuantitas
    const updateQuantity = (id: number, delta: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            )
        );
    };

    // Fungsi untuk menghapus item
    const removeItem = (id: number) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    // Hitung total
    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );
    const shipping = 0; // Gratis ongkir
    const tax = 0; // Pajak 0 untuk contoh
    const discount = 0; // Diskon 0 untuk contoh
    const total = subtotal + shipping + tax - discount;

    const formatRupiahSingkat = (value: number) => {
        if (value >= 100000) return `Rp${Math.round(value / 1000)}RB`;
        return `Rp${value.toLocaleString()}`;
    };


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

                {/* Main Content */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Tabel Produk */}
                    <div className="flex-1">
                        <div className="p-4">
                            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-2 rounded-[50px] font-bold text-white p-[20px] mb-4">

                                <div className="pl-4">Produk</div>
                                <div>Harga</div>
                                <div>Kuantitas</div>
                                <div>Subtotal</div>
                            </div>
                            {cartItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <Image
                                    src="/images/cart/keranjangKosong.png"
                                    alt="Keranjang kosong"
                                    width={120}
                                    height={120}
                                    />
                                </div>
                                ) : (
                                cartItems.map((item) => (
                                    <div
                                    key={item.id}
                                    className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center border-b border-black py-4"
                                    >
                                    {/* Kolom Produk */}
                                    <div className="flex items-center gap-4">
                                        <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-black hover:text-red-700"
                                        >
                                        ✕
                                        </button>
                                        <Image
                                        src="/images/cart/gimmeOrganic.png"
                                        alt={item.name}
                                        width={50}
                                        height={50}
                                        className="rounded"
                                        />
                                        <div className="flex flex-col">
                                        <span className="text-black">{item.name}</span>
                                        <span className="text-gray-500 text-sm">{item.besaran}</span>
                                        </div>
                                    </div>
                                    {/* Kolom Harga */}
                                    <div className="text-black">{formatRupiahSingkat(item.price)}</div>
                                    {/* Kolom Kuantitas */}
                                    <div className="flex items-center gap-4 bg-5 rounded-full px-4 mr-10">
                                        <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                                        >
                                        -
                                        </button>
                                        <span className="text-black text-md font-medium">{item.quantity}</span>
                                        <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="text-xl text-black px-2 hover:opacity-70 transition cursor-pointer"
                                        >
                                        +
                                        </button>
                                    </div>
                                    {/* Kolom Subtotal */}
                                    <div className="text-black">{formatRupiahSingkat(item.price * item.quantity)}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Ringkasan Belanja */}
                    <div className="md:w-1/3">
                        <div className="border border-gray-300 rounded-[25px] p-4 shadow-md p-6">
                            <h2 className="text-xl text-gray-700 font-bold mb-4">Total Belanja</h2>
                            <div className="space-y-2 text-gray-700">
                                <div className="flex justify-between border-t pt-8">
                                    <span>Produk</span>
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
                            <button className="w-full px-4 bg-3 text-white py-2 rounded-lg mt-4 hover:bg-yellow-500">
                                Lanjut ke pembayaran
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bersihkan Keranjang */}
                <div className="text-center mt-8">
                    <button
                        onClick={() => setCartItems([])}
                        className="text-black underline hover:text-red-700 font-medium"
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