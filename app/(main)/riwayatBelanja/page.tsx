"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import InformativeFooter from "@/components/footer/detilInformasi";

interface Product {
  name: string;
  besaran: string;
  quantity: number;
}

interface HistoryItem {
  id: string;
  date: string;
  products: Product[];
  total: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
}

export default function HistoryPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    {
      id: "ORD001",
      date: "15 Mei 2025",
      products: [
        { name: "GimMe Organic", besaran: "5 kg", quantity: 2 },
        { name: "GimMe Organic", besaran: "10 kg", quantity: 1 },
      ],
      total: 60000,
      status: "Selesai",
      paymentMethod: "Transfer Bank",
      shippingAddress: "Jl. Ternak Sejahtera No. 12, Sleman, Yogyakarta",
    },
    {
      id: "ORD002",
      date: "14 Mei 2025",
      products: [{ name: "GimMe Organic", besaran: "15 kg", quantity: 3 }],
      total: 132000,
      status: "Dikirim",
      paymentMethod: "COD",
      shippingAddress: "Jl. Budidaya No. 5, Bandung",
    },
    {
      id: "ORD003",
      date: "13 Mei 2025",
      products: [
        { name: "GimMe Organic", besaran: "20 kg", quantity: 1 },
        { name: "GimMe Organic", besaran: "5 kg", quantity: 4 },
      ],
      total: 115000,
      status: "Diproses",
      paymentMethod: "E-Wallet",
      shippingAddress: "Jl. Peternakan No. 10, Surabaya",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const formatRupiahSingkat = (value: number) => {
    if (value >= 100000) return `Rp${Math.round(value / 1000)}RB`;
    return `Rp${value.toLocaleString()}`;
  };

  const handleOpenModal = (item: HistoryItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 px-[30%]">
          <h1 className="text-3xl font-bold mb-2 text-black">Riwayat Belanja</h1>
          <p className="text-gray-600">
            Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat hingga 30%! Beli pakan, bantu bumi.
          </p>
        </div>

        <div className="flex-1">
          <div className="px-20 py-4">
            {historyItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Image
                  src="/images/cart/keranjangKosong.png"
                  alt="Belum ada riwayat"
                  width={120}
                  height={120}
                />
                <p className="text-gray-600 mt-4">Belum ada riwayat belanja</p>
              </div>
            ) : (
              historyItems.map((item: HistoryItem) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[25px] p-6 mb-4 shadow-md"
                >
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                    <div>
                      <span className="font-bold text-black">{item.id}</span>
                      <span className="text-gray-500 text-sm ml-2">{item.date}</span>
                    </div>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        item.status === "Selesai"
                          ? "bg-green-100 text-green-700"
                          : item.status === "Dikirim"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {item.products.map((product: Product, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <Image
                          src="/images/cart/gimmeOrganic.png"
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <span className="text-black">{product.name}</span>
                          <span className="text-gray-500 text-sm ml-2">
                            {product.besaran} x {product.quantity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-gray-600">Total Belanja:</span>
                      <span className="font-bold text-black ml-2">
                        {formatRupiahSingkat(item.total)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="px-4 py-2 bg-3 text-white rounded-lg hover:bg-yellow-500"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && selectedItem && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white rounded-[25px] p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-black mb-4">
                Detail Pesanan #{selectedItem.id}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600">Tanggal: {selectedItem.date}</p>
                  <p className="text-gray-600">Status: {selectedItem.status}</p>
                  <p className="text-gray-600">
                    Metode Pembayaran: {selectedItem.paymentMethod}
                  </p>
                  <p className="text-gray-600">
                    Alamat Pengiriman: {selectedItem.shippingAddress}
                  </p>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-bold text-black">Daftar Produk:</h3>
                  {selectedItem.products.map((product: Product, index: number) => (
                    <div key={index} className="flex items-center gap-4 mt-2">
                      <Image
                        src="/images/cart/gimmeOrganic.png"
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <div>
                        <span className="text-black">{product.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {product.besaran} x {product.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <p className="text-gray-600">Total Belanja:</p>
                  <p className="font-bold text-black">
                    {formatRupiahSingkat(selectedItem.total)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="mt-6 w-full px-4 py-2 bg-3 text-white rounded-lg hover:bg-yellow-500"
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Detil Informasi */}
        <div className="mt-20">
          <InformativeFooter />
        </div>
      </div>
    </div>
  );
}

