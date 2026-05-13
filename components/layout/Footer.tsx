"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  const footerLinks = {
    platform: [
      { name: "About Us", href: "/about" },
      { name: "How It Works", href: "/coming-soon" },
      { name: "Pricing", href: "/pricing" },
      { name: "Contact", href: "/contact" },
    ],
    resources: [
      { name: "Help Center", href: "/contact" },
      { name: "Blog", href: "/coming-soon" },
      { name: "API Documentation", href: "/coming-soon" },
      { name: "Status", href: "/coming-soon" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      alert(`Subscribed with: ${email}`);
      setEmail("");
    }
  };

  if (!mounted) {
    return (
      <footer className="pt-16 pb-8 mt-auto border-t bg-gradient-to-b from-black to-gray-900 border-red-500/20">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm text-white">
              © {currentYear} PlusVote. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer
      className="pt-16 pb-8 mt-auto border-t bg-gradient-to-b from-black to-gray-900 border-red-500/20"
      suppressHydrationWarning
    >
      <div className="mx-auto max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 mb-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div>
                <Image
                src="/images/logo-black.png"
                alt="PlusVote Logo"
                width={200}
                height={300}
              />
              </div>
            </div>
            <p className="mb-4 text-sm text-gray-400">
              Empowering democracy through secure, transparent, and real-time
              online voting.
            </p>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Platform</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="mb-4 font-semibold text-white">Stay Updated</h4>
            <p className="mb-3 text-sm text-gray-400">
              Get the latest updates and new features.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm text-white placeholder-gray-500 transition-colors border border-gray-700 rounded-lg bg-white/5 focus:outline-none focus:border-red-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t md:flex-row border-white/10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full opacity-75 animate-ping" />
              </div>
              <span className="text-xs text-gray-500">
                All Systems Operational
              </span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">99.9% Uptime</span>
            </div>
            <div className="w-px h-4 bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">24/7 Support</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              © {currentYear} NGen IT LTD. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Privacy
            </button>
            <Link href="/terms" className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Terms
            </Link>
            <button className="text-xs text-gray-500 transition-colors hover:text-gray-400">
              Cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
