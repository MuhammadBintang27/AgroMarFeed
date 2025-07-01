"use client";
import Image from "next/image";

export default function InformativeFooter() {
  const items = [
    {
      image: "/images/home/gratisOngkir.png",
      title: "Gratis Ongkir",
      description: "Nikmati pengiriman gratis untuk berbagai produk pakan pilihan",
    },
    {
      image: "/images/cart/pembayaranMudah.png",
      title: "Pembayaran Mudah",
      description: "Transaksi cepat dan fleksibel dengan berbagai metode pembayaran",
    },
    {
      image: "/images/cart/melayani.png",
      title: "24x7 Melayani",
      description: "Layanan pelanggan dan sistem toko online aktif setiap saat",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 mx-10">
      {items.map((item, index) => (
        <div key={index} className="flex flex-row items-center justify-center">
          <div>
            <Image src={item.image} alt={item.title} width={60} height={60} />
          </div>
          <div className="flex flex-col items-start ml-2">
            <p className="text-black text-lg font-bold mb-2">{item.title}</p>
            <p className="text-gray-700 text-sm font-thin">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
