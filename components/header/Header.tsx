"use client";
import { useState, useEffect } from "react";
import { FaShoppingBasket, FaHeart, FaUserCircle, FaBars } from "react-icons/fa";
import { getCurrentUser } from "@/lib/auth";
import { User } from "@/types";
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user ?? null);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`max-w-7xl mx-auto px-6 py-4 flex items-center justify-between 
    transition ${menuOpen ? 'bg-white shadow-md' : 'bg-transparent lg:bg-transparent'}`}
      >


        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img src="/images/agromarfeed-logo.png" alt="Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center bg-1 text-white px-8 py-3 rounded-full gap-6 text-sm font-medium">
          <Link href="/" className="hover:underline">Beranda</Link>
          <Link href="/katalog" className="hover:underline">Cari Pakan</Link>
          <Link href="/konsultasi" className="hover:underline">Konsul Pakan</Link>
          <Link href="/artikel" className="hover:underline">Artikel & Tips</Link>
        </nav>

        {/* Icons / Auth Buttons */}
        <div className="hidden lg:flex items-center space-x-4">
          {loading ? (
            <div>Loading...</div>
          ) : user ? (
            <>
              <Link href="/keranjang">
                <button className="bg-1 text-white p-2 rounded-full">
                  <FaShoppingBasket />
                </button>
              </Link>
              <Link href="/wishlist">
                <button className="bg-1 text-white p-2 rounded-full">
                  <FaHeart />
                </button>
              </Link>
              <Link href="/profile">
                <button className="bg-4 text-white p-2 rounded-full">
                  <FaUserCircle />
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="bg-1 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90">
                Sign In
              </Link>
              <Link href="/auth/register" className="bg-4 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90">
                Sign Up
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
          <Link href="/" className="block text-sm font-medium text-black hover:underline">Beranda</Link>
          <Link href="/katalog" className="block text-sm font-medium text-black hover:underline">Cari Pakan</Link>
          <Link href="/konsultasi" className="block text-sm font-medium text-black hover:underline">Konsul Pakan</Link>
          <Link href="/artikel" className="block text-sm font-medium text-black hover:underline">Artikel & Tips</Link>

          <hr className="my-2" />

          {loading ? (
            <div>Loading...</div>
          ) : user ? (
            <div className="space-y-2">
              <Link href="/keranjang" className="block text-sm text-black">Keranjang</Link>
              <Link href="/wishlist" className="block text-sm text-black">Wishlist</Link>
              <Link href="/profile" className="block text-sm text-black">Profil Saya</Link>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login" className="block bg-1 text-white px-4 py-2 rounded-full text-sm text-center">Sign In</Link>
              <Link href="/auth/register" className="block bg-4 text-white px-4 py-2 rounded-full text-sm text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
