"use client";
import { useState } from "react";
import {
  FaShoppingBasket,
  FaHeart,
  FaUserCircle,
  FaBars,
} from "react-icons/fa";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";

export default function Header() {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between 
    transition ${
      menuOpen ? "bg-white shadow-md" : "bg-transparent lg:bg-transparent"
    }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src="/images/agromarfeed-logo.png"
            alt="Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation Centered */}
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <nav className="flex items-center bg-1 text-white px-8 py-3 rounded-full gap-6 text-sm font-medium">
            <Link href="/" className="hover:scale-105">
              Beranda
            </Link>
            <Link href="/katalog" className="hover:scale-105">
              Cari Pakan
            </Link>
            <Link href="/konsultasi" className="hover:scale-105">
              Konsul Pakan
            </Link>
            <Link href="/artikel" className="hover:scale-105">
              Artikel & Tips
            </Link>
          </nav>
        </div>

        {/* Icons / Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {loading ? (
            <div>Loading...</div>
          ) : user ? (
            <>
              <Link href="/keranjang">
                <button className="bg-1 text-white p-2 rounded-full transition-transform duration-150 hover:scale-105">
                  <FaShoppingBasket />
                </button>
              </Link>
              <Link href="/wishlist">
                <button className="bg-1 text-white p-2 rounded-full transition-transform duration-150 hover:scale-105">
                  <FaHeart />
                </button>
              </Link>
              <Link href="/profile">
                <button className="bg-4 text-white p-2 rounded-full transition-transform duration-150 hover:scale-105">
                  <FaUserCircle />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="bg-2 text-white px-4 py-2 rounded-full text-sm font-medium transition-transform duration-150 hover:scale-105"
              >
                Masuk
              </Link>
              <Link
                href="/auth/register"
                className="bg-1 text-white px-4 py-2 rounded-full text-sm font-medium transition-transform duration-150 hover:scale-105"
              >
                Daftar
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="lg:hidden p-2 text-black"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {menuOpen && (
        <div className="lg:hidden px-6 pb-4 pt-2 bg-white shadow-md">
          <Link
            href="/"
            className="block text-sm font-medium text-black hover:underline"
          >
            Beranda
          </Link>
          <Link
            href="/katalog"
            className="block text-sm font-medium text-black hover:underline"
          >
            Cari Pakan
          </Link>
          <Link
            href="/konsultasi"
            className="block text-sm font-medium text-black hover:underline"
          >
            Konsul Pakan
          </Link>
          <Link
            href="/artikel"
            className="block text-sm font-medium text-black hover:underline"
          >
            Artikel & Tips
          </Link>

          <hr className="my-2" />

          {loading ? (
            <div>Loading...</div>
          ) : user ? (
            <div className="space-y-2">
              <Link href="/keranjang" className="block text-sm text-black">
                Keranjang
              </Link>
              <Link href="/wishlist" className="block text-sm text-black">
                Wishlist
              </Link>
              <Link href="/profile" className="block text-sm text-black">
                Profil Saya
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                className="block bg-1 text-white px-4 py-2 rounded-full text-sm text-center"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="block bg-4 text-white px-4 py-2 rounded-full text-sm text-center"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
