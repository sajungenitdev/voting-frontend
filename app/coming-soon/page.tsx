"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { RocketLaunchIcon, BellAlertIcon } from "@heroicons/react/24/outline";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");

  // Visual background logic
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }).map(() => ({
        id: crypto.randomUUID(),
        size: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 8 + 5,
      })),
    [],
  );

  return (
    <section className="relative flex items-center justify-center min-h-screen p-6 overflow-hidden bg-black">
      {/* ANIMATED BACKGROUND */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)]" />

        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-red-500/20"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animation: `float-up ${p.duration}s linear infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        {/* ICON & STATUS */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold tracking-widest text-red-500 uppercase border rounded-full bg-red-500/10 border-red-500/20 animate-bounce">
          <RocketLaunchIcon className="w-4 h-4" />
          System Launch Approaching
        </div>

        {/* MAIN TEXT */}
        <h1 className="mb-6 text-6xl italic font-black tracking-tighter text-white md:text-8xl">
          COMING{" "}
          <span className="text-red-500 underline decoration-red-500/30">
            SOON
          </span>
        </h1>

        <p className="max-w-xl mx-auto mb-12 text-lg leading-relaxed text-gray-400 md:text-xl">
          The next generation of decentralized voting is currently in final
          calibration. Get ready for a secure, transparent, and immutable
          future.
        </p>

        {/* NOTIFY FORM */}
        <div className="relative max-w-md mx-auto mb-16">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-red-900 rounded-2xl blur opacity-20" />
          <form className="relative flex flex-col gap-2 p-2 border sm:flex-row bg-white/5 border-white/10 backdrop-blur-xl rounded-2xl">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 text-white bg-transparent border-none focus:ring-0 placeholder:text-gray-600"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="flex items-center justify-center gap-2 px-6 py-3 font-bold text-white transition-all bg-red-600 hover:bg-red-500 rounded-xl active:scale-95">
              <BellAlertIcon className="w-5 h-5" />
              Notify Me
            </button>
          </form>
        </div>

        {/* FOOTER LINKS */}
        <div className="flex justify-center gap-8">
          <Link
            href="/privacy"
            className="text-xs text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
          >
            Privacy
          </Link>
          <Link
            href="/gdpr"
            className="text-xs text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
          >
            GDPR
          </Link>
          <Link
            href="/terms"
            className="text-xs text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
          >
            Terms
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            transform: translateY(100vh) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 0.5;
          }
          80% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-10vh) scale(1.2);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
