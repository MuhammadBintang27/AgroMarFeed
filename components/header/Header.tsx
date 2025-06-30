"use client";
import { useState, useRef } from "react";
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

  // Loading states for icon and text buttons
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // Hide header on auth pages to prevent interference with login
  const isAuthPage = pathname?.startsWith("/auth");

  // Animation CSS
  const bounceAnim = "animate-bounce-fast";
  const flashAnim = "animate-flash-bg";
  const [navFlash, setNavFlash] = useState({
    home: false,
    katalog: false,
    konsultasi: false,
    artikel: false,
  });

  // Add keyframes for bounce and flash
  if (typeof window !== 'undefined') {
    const styleId = 'header-anim-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes bounce-fast {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
          50% { transform: translateY(-5px); }
          70% { transform: translateY(-15px); }
        }
        .animate-bounce-fast {
          animation: bounce-fast 0.9s;
        }
        @keyframes flash-bg {
          0%, 100% { background-color: #f7ab31; color: #fff; }
          50% { background-color: #fff; color: #f7ab31; }
        }
        .animate-flash-bg {
          animation: flash-bg 0.7s;
        }
        @keyframes flash-text {
          0%, 100% { color: #fff; }
          50% { color: #f7ab31; }
        }
        .animate-flash-text {
          animation: flash-text 0.7s;
        }
      `;
      document.head.appendChild(style);
    }
  }

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
              <Link
                href="/"
                className={`hover:scale-105 ${navFlash.home ? 'animate-flash-text' : ''}`}
                onClick={e => {
                  setNavFlash(f => ({ ...f, home: true }));
                  setTimeout(() => setNavFlash(f => ({ ...f, home: false })), 700);
                }}
              >
                Beranda
              </Link>
              <Link
                href="/katalog"
                className={`hover:scale-105 ${navFlash.katalog ? 'animate-flash-text' : ''}`}
                onClick={e => {
                  setNavFlash(f => ({ ...f, katalog: true }));
                  setTimeout(() => setNavFlash(f => ({ ...f, katalog: false })), 700);
                }}
              >
                Cari Pakan
              </Link>
              <Link
                href="/konsultasi"
                className={`hover:scale-105 ${navFlash.konsultasi ? 'animate-flash-text' : ''}`}
                onClick={e => {
                  setNavFlash(f => ({ ...f, konsultasi: true }));
                  setTimeout(() => setNavFlash(f => ({ ...f, konsultasi: false })), 700);
                }}
              >
                Konsul Pakan
              </Link>
              <Link
                href="/artikel"
                className={`hover:scale-105 ${navFlash.artikel ? 'animate-flash-text' : ''}`}
                onClick={e => {
                  setNavFlash(f => ({ ...f, artikel: true }));
                  setTimeout(() => setNavFlash(f => ({ ...f, artikel: false })), 700);
                }}
              >
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
                  className={`bg-2 text-white px-4 py-2 rounded-full text-sm font-medium transition-transform duration-150 hover:scale-105 ${loginLoading ? 'animate-flash-text' : ''}`}
                  onClick={e => {
                    e.preventDefault();
                    setLoginLoading(true);
                    setTimeout(() => {
                      setLoginLoading(false);
                      window.location.href = '/auth/login';
                    }, 700);
                  }}
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className={`bg-1 text-white px-4 py-2 rounded-full text-sm font-medium transition-transform duration-150 hover:scale-105 ${registerLoading ? 'animate-flash-text' : ''}`}
                  onClick={e => {
                    e.preventDefault();
                    setRegisterLoading(true);
                    setTimeout(() => {
                      setRegisterLoading(false);
                      window.location.href = '/auth/register';
                    }, 700);
                  }}
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
            <div className="flex items-center justify-around py-1">
              <Link
                href="/"
                className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-1 transition-colors"
              >
                <FaHome size={18} />
                <span className="text-xs mt-0.5">Beranda</span>
              </Link>
              <Link
                href="/katalog"
                className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-1 transition-colors"
              >
                <FaSearch size={18} />
                <span className="text-xs mt-0.5">Cari Pakan</span>
              </Link>
              <Link
                href="/konsultasi"
                className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-1 transition-colors"
              >
                <FaComments size={18} />
                <span className="text-xs mt-0.5">Konsul</span>
              </Link>
              <Link
                href="/artikel"
                className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-1 transition-colors"
              >
                <FaNewspaper size={18} />
                <span className="text-xs mt-0.5">Artikel</span>
              </Link>
              <Link
                href={user ? "/profile" : "/auth/login"}
                className="flex flex-col items-center py-1 px-2 text-gray-600 hover:text-1 transition-colors"
              >
                <FaUserCircle size={18} />
                <span className="text-xs mt-0.5">Akun</span>
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
