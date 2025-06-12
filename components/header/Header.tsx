"use client";
import { useState, useEffect } from "react";
import { FaShoppingBasket, FaHeart, FaUserCircle } from "react-icons/fa";
import { getCurrentUser } from "@/lib/auth"; // Adjust path to your auth file
import { User } from "@/types"; // Adjust path to your types file
import Link from "next/link";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user ?? null); // Convert undefined to null
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();
  });

  return (
    <header className="flex items-center justify-between px-10 py-8 bg-transparent absolute top-0 left-0 right-0 z-10">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src="/images/agromarfeed-logo.png"
          alt="Logo"
          className="h-10 w-auto"
        />
      </div>

      {/* Navigation - Centered */}
      <nav className="bg-1 text-white px-8 py-3 rounded-full flex space-x-6 text-sm font-medium gap-4 absolute left-1/2 transform -translate-x-1/2">
        <a href="/" className="hover:underline">
          Beranda
        </a>
        <a href="/katalog" className="hover:underline">
          Cari Pakan
        </a>
        <a href="/konsultasi" className="hover:underline">
          Konsul Pakan
        </a>
        <a href="/artikel" className="hover:underline">
          Artikel & Tips
        </a>
      </nav>

      {/* Icons or Auth Buttons */}
      <div className="flex items-center space-x-4">
        {loading ? (
          <div>Loading...</div> // Replace with a spinner if desired
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
            <a
              href="/auth/login"
              className="bg-1 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90"
            >
              Sign In
            </a>
            <a
              href="auth/register"
              className="bg-4 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90"
            >
              Sign Up
            </a>
          </>
        )}
      </div>
    </header>
  );
}
