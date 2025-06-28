"use client";
import { useState } from "react";
import {
  FaShoppingBasket,
  FaHeart,
  FaUserCircle,
  FaBars,
  FaHome,
  FaSearch,
  FaComments,
  FaNewspaper,
} from "react-icons/fa";
import { useUser } from "@/contexts/UserContext";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on auth pages to prevent interference with login
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden lg:block fixed top-0 left-0 right-0 z-50">
        <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between bg-transparent">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/images/agromarfeed-logo.png"
              alt="Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation Centered */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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
          <div className="flex items-center space-x-4">
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
        </div>
      </header>

      {/* Mobile Header - Hide on auth pages */}
      {!isAuthPage && (
        <div className="lg:hidden">
          {/* Top Mobile Header */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center">
                <img
                  src="/images/agromarfeed-logo.png"
                  alt="Logo"
                  className="h-8 w-auto"
                />
              </Link>

              {/* Cart and Wishlist Icons - Only show if user is logged in */}
              {user && (
                <div className="flex items-center space-x-3">
                  <Link href="/wishlist">
                    <button className="text-gray-600 p-2 rounded-full transition-colors hover:bg-gray-100">
                      <FaHeart size={18} />
                    </button>
                  </Link>
                  <Link href="/keranjang">
                    <button className="text-gray-600 p-2 rounded-full transition-colors hover:bg-gray-100">
                      <FaShoppingBasket size={18} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </header>
          {/* Bottom Mobile Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200">
            <div className="flex items-center justify-around py-2">
              <Link
                href="/"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-1 transition-colors"
              >
                <FaHome size={20} />
                <span className="text-xs mt-1">Beranda</span>
              </Link>
              <Link
                href="/katalog"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-1 transition-colors"
              >
                <FaSearch size={20} />
                <span className="text-xs mt-1">Cari Pakan</span>
              </Link>
              <Link
                href="/konsultasi"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-1 transition-colors"
              >
                <FaComments size={20} />
                <span className="text-xs mt-1">Konsul</span>
              </Link>
              <Link
                href="/artikel"
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-1 transition-colors"
              >
                <FaNewspaper size={20} />
                <span className="text-xs mt-1">Artikel</span>
              </Link>
              <Link
                href={user ? "/profile" : "/auth/login"}
                className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-1 transition-colors"
              >
                <FaUserCircle size={20} />
                <span className="text-xs mt-1">Akun</span>
              </Link>
            </div>
          </nav>
          {/* Spacer for mobile content */}
          <div className="h-10"></div> {/* Bottom spacer */}
        </div>
      )}
    </>
  );
}
