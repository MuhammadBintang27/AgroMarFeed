import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-1 text-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[60px_1.5fr_repeat(3,1fr)] items-start">
        {/* Kolom 1: Logo */}
        <div className="flex justify-center sm:justify-start">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-12 h-12 mt-1"
          />
        </div>

        {/* Kolom 2: Deskripsi + Sosial Media */}
        <div>
          <h2 className="text-xl font-semibold mb-4">AgroMarFeed</h2>
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            Pelet ikan, pakan ayam, dan ternak dari limbah agro-maritim. Hemat
            hingga 30%! Beli pakan, bantu bumi.
          </p>
          <div className="flex gap-5">
            {[FaFacebookF, FaInstagram, FaYoutube].map((Icon, idx) => (
              <a
                key={idx}
                href="#"
                className="text-white hover:scale-105 transition"
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
        </div>

        {/* Kolom 3: Company */}
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="/blog" className="hover:text-white">Blog</a>
            </li>
            <li>
              <a href="/artikel" className="hover:text-white">Artikel & Tips</a>
            </li>
            <li>
              <a href="/aboutus" className="hover:text-white">About Us</a>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Informasi */}
        <div>
          <h3 className="font-semibold mb-4">Informasi</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>
              <a href="#" className="hover:text-white">Akun Saya</a>
            </li>
            <li>
              <a href="#" className="hover:text-white">Keranjang Anda</a>
            </li>
            <li>
              <a href="#" className="hover:text-white">FAQ</a>
            </li>
          </ul>
        </div>

        {/* Kolom 5: Hubungi Kami */}
        <div>
          <h3 className="font-semibold mb-4">Hubungi Kami</h3>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-white">
              <FaWhatsapp size={20} />
            </div>
            <span className="text-sm text-gray-300">+62 822 6089 2330</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white">
              <FaEnvelope size={20} />
            </div>
            <span className="text-sm text-gray-300">agromarfeed@gmail.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
