"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HomeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function NotFound() {
  // Same particle logic from your other modern pages
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      id: crypto.randomUUID(),
      size: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 6,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <section className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-black">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 blur-[150px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-red-500/20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* CONTENT */}
      <div className="relative z-10 text-center">
        <div className="relative inline-block mb-8">
          <span className="text-[12rem] font-black text-white/5 select-none">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="flex items-center justify-center w-20 h-20 border rounded-3xl bg-red-600/20 border-red-500/30 backdrop-blur-xl">
                <MagnifyingGlassIcon className="w-10 h-10 text-red-500 animate-bounce" />
             </div>
          </div>
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Page <span className="text-red-500">Not Found</span>
        </h1>
        
        <p className="max-w-sm mx-auto mb-10 text-lg text-gray-400">
          The link you followed may be broken, or the page may have been moved to a restricted sector.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white transition-all bg-red-600 shadow-lg rounded-xl hover:bg-red-500 shadow-red-600/20 active:scale-95"
        >
          <HomeIcon className="w-5 h-5" />
          Back to Dashboard
        </Link>
      </div>

      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: translateY(-40px) translateX(10px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}