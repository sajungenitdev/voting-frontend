"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { logout, restoreSession } from "@/store/slices/authSlice";
import {
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  ChartBarIcon,
  ChevronDownIcon,
  UserIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Force re-render when auth state changes
    console.log("Auth state changed:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  useEffect(() => {
    setMounted(true);

    // ✅ Restore session from localStorage on mount
    dispatch(restoreSession());

    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);

    // ✅ Listen for storage events (when localStorage changes in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "accessToken" || e.key === "user") {
        dispatch(restoreSession());
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  // ✅ Also check for token on route changes
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    if (token && userStr && !isAuthenticated) {
      dispatch(restoreSession());
    }
  }, [pathname, dispatch, isAuthenticated]);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/");
    setIsUserMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Polls", href: "/polls", icon: ClipboardDocumentListIcon },
    { name: "Dashboard", href: "/dashboard", icon: ChartBarIcon, auth: true },
    {
      name: "B2B",
      href: "/b2b/dashboard",
      icon: ChartBarIcon,
      auth: true,
      b2b: true,
    },
  ];

  const userMenuItems = [
    { name: "My Profile", href: "/dashboard/profile", icon: UserIcon },
    {
      name: "My Votes",
      href: "/dashboard/my-votes",
      icon: ClipboardDocumentListIcon,
    },
    { name: "B2B Dashboard", href: "/b2b/dashboard", icon: ChartBarIcon },
    { name: "B2B Pricing", href: "/b2b/pricing", icon: ChartBarIcon },
  ];

  // Check if user is B2B (has companyName or role)
  const isB2BUser = user?.companyName || user?.role === "b2b_buyer";

  if (!mounted) {
    return (
      <header className="fixed top-0 z-50 w-full border-b bg-black/90 backdrop-blur-xl border-red-500/20">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗳️</span>
              <span className="text-xl font-bold text-white">
                Voting Platform
              </span>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl shadow-lg shadow-red-500/5"
            : "bg-transparent"
        }`}
      >
        <div className="p-4 mx-auto max-w-7xl">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/images/logo-black.png"
                alt="Logo"
                width={200}
                height={300}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="items-center hidden gap-1 p-1 border rounded-full md:flex bg-white/5 backdrop-blur-sm border-white/10">
              {navLinks.map((item) => {
                if (item.auth && !isAuthenticated) return null;
                if (item.b2b && !isB2BUser && !user?.role === "admin")
                  return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                        : "text-gray-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                    {item.b2b && (
                      <span className="ml-1 text-[10px] px-1 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                        B2B
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side - User Menu / Auth Buttons */}
            <div className="flex items-center gap-3">
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 transition-opacity bg-red-500 rounded-full opacity-50 blur-md group-hover:opacity-100" />
                      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                        <span className="text-sm font-bold text-white">
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.fullName?.charAt(0)?.toUpperCase() ||
                            user.companyName?.charAt(0)?.toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                    </div>
                    <div className="hidden text-left lg:block">
                      <p className="text-sm font-medium text-white">
                        {user.name ||
                          user.fullName ||
                          user.companyName ||
                          "User"}
                      </p>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-gray-400 -mt-1 capitalize">
                          {user.role === "b2b_buyer"
                            ? "B2B Enterprise"
                            : user.role || "user"}
                        </p>
                        {user.role === "b2b_buyer" && (
                          <span className="text-[9px] px-1 rounded-full bg-purple-500/20 text-purple-400">
                            B2B
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronDownIcon
                      className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-50 w-64 mt-2 overflow-hidden border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-red-500/30 rounded-2xl animate-fadeIn">
                      <div className="p-4 border-b border-red-500/20 bg-gradient-to-r from-red-500/10 to-transparent">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                            <span className="text-lg font-bold text-white">
                              {user.name?.charAt(0)?.toUpperCase() ||
                                user.fullName?.charAt(0)?.toUpperCase() ||
                                user.companyName?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-white">
                              {user.name ||
                                user.fullName ||
                                user.companyName ||
                                "User"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {user.email}
                            </p>
                            {user.role === "b2b_buyer" && (
                              <p className="text-[10px] text-purple-400 mt-0.5">
                                B2B Enterprise Account
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-red-500/10 transition-colors"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      <div className="py-2 border-t border-red-500/20">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="px-4 py-2 text-sm btn-primary">
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="hidden px-4 py-2 text-sm sm:block btn-secondary"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 transition-colors rounded-lg md:hidden hover:bg-white/10"
              >
                <div className="flex flex-col justify-between w-6 h-5">
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
                  />
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""}`}
                  />
                  <span
                    className={`w-full h-0.5 bg-white transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 pt-20 bg-black/95 backdrop-blur-xl animate-fadeIn md:hidden">
          <nav className="flex flex-col items-center gap-4 p-6">
            {navLinks.map((item) => {
              if (item.auth && !isAuthenticated) return null;
              if (item.b2b && !isB2BUser && user?.role !== "admin") return null;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 w-full max-w-xs px-6 py-3 rounded-xl text-center transition-all ${
                    pathname === item.href
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                      : "text-gray-300 hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                  {item.b2b && (
                    <span className="ml-1 text-[10px] px-1 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      B2B
                    </span>
                  )}
                </Link>
              );
            })}
            {isAuthenticated && (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-full max-w-xs gap-2 px-6 py-3 text-center text-red-400 border rounded-xl border-red-500/30 hover:bg-red-500/10"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                Logout
              </button>
            )}
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full max-w-xs text-center btn-primary"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full max-w-xs text-center btn-secondary"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
