"use client";
import Button from "@/components/ui/Button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

const PaymentPage = () => {
  const [selectedPayment, setSelectedPayment] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const paymentMethods = [
    {
      id: "transfer",
      name: "Transfer Bank",
    },
    {
      id: "cod",
      name: "COD",
    },
    {
      id: "credit",
      name: "Kartu Kredit/Debit",
    },
    {
      id: "oneklik",
      name: "BCA One Klik",
    },
    {
      id: "direct",
      name: "BCA Direct Debit",
    },
    {
      id: "tunai",
      name: "Bayar Tunai Mitra/Agen",
    },
  ];

  const bankImages = [
    { id: "bsi", image: "bsi.png", name: "Bank BSI" },
    { id: "bca", image: "bca.png", name: "Bank BCA" },
    { id: "bni", image: "bni.png", name: "Bank BNI" },
    { id: "bri", image: "bri.png", name: "Bank BRI" },
    { id: "cimb", image: "cimb.png", name: "Bank CIMB" },
    { id: "mandiri", image: "mandiri.png", name: "Bank Mandiri" },
    { id: "btn", image: "btn.png", name: "Bank BTN" },
    { id: "danamon", image: "danamon.png", name: "Bank Danamon" },
    { id: "maybank", image: "maybank.png", name: "Bank Maybank" },
    { id: "mega", image: "mega.png", name: "Bank Mega" },
    { id: "panin", image: "panin.png", name: "Bank Panin" },
    { id: "sinarmas", image: "standard chartered.png", name: "Bank Sinarmas" },
    { id: "uob", image: "uob.png", name: "Bank UOB" },
    { id: "bjb", image: "bjb.png", name: "Bank BJB" },
  ];

  const handleBankSelection = async (bankId: string) => {
    setIsLoading(true);
    setSelectedBank(bankId);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-16 bg-7">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3 text-black">
              Konsultasi Ahli Pakan & Dokter Hewan Langsung
            </h1>
            <p className="text-black text-sm max-w-2xl mx-auto">
              Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
              hingga 30%! Beli pakan, bantu bumi.
            </p>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-2/3">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h2 className="text-xl font-semibold mb-6 text-black">
                  Pembayaran
                </h2>

                {/* Enhanced Payment Method Selection */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-black">
                    Metode Pembayaran
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        className={`px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-2
                          ${
                            selectedPayment === method.id
                              ? "bg-2 text-white ring-2 ring-offset-2"
                              : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                          }`}
                        onClick={() => setSelectedPayment(method.id)}
                      >
                        <span>{method.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Bank Selection */}
                {selectedPayment === "transfer" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                  >
                    <h3 className="text-lg font-medium mb-4 text-black">
                      Pilih Bank
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {bankImages.map((bank) => (
                        <motion.div
                          key={bank.id}
                          className={`relative bg-white border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer
                            ${
                              selectedBank === bank.id
                                ? "ring-2 ring-offset-2"
                                : ""
                            }
                          `}
                          onClick={() => handleBankSelection(bank.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading && selectedBank === bank.id && (
                            <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                          <Image
                            src={`/images/pembayaran/${bank.image}`}
                            alt={bank.name}
                            width={100}
                            height={40}
                            className="object-contain w-full h-12"
                          />
                          <p className="text-xs text-center mt-2 text-gray-600">
                            {bank.name}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <motion.div
              className="w-full md:w-1/3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-4 text-black">
                  Produk dipilih
                </h2>

                {/* Selected Product */}
                <div className="bg-white rounded-xl shadow-md p-5 mb-6 text-gray-800">
                  <h3 className="text-lg font-semibold mb-2">
                    Sari Utami, M.M. - Ahli Pemasaran Hasil Tani
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-2 text-white text-xs px-2 py-1 rounded-full">
                      60 Menit
                    </span>
                    <span className="bg-3 text-black text-xs px-2 py-1 rounded-full">
                      25.000
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">4.5</span>
                    <span className="ml-2 text-gray-500">25 Konsultasi</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6 text-black">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Produk</span>
                    <span className="font-medium">Rp25.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium">Rp25.000</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pengiriman</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pajak</span>
                    <span className="font-medium">Rp2.500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Diskon</span>
                    <span className="font-medium text-red-500">-Rp5.000</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold">Rp22.500</span>
                    </div>
                  </div>
                </div>

                {/* Enhanced Checkout Button */}
                <button
                  className={`w-full font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2
                    ${
                      selectedPayment && selectedBank
                        ? "bg-2 text-white hover:bg-2/90"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  disabled={!selectedPayment || !selectedBank}
                >
                  <span>Checkout</span>
                  {selectedPayment && selectedBank && <span>→</span>}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentPage;
