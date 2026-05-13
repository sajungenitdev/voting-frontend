"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightIcon,
  PlayIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

function generateParticles(count = 20) {
  return Array.from({ length: count }).map(() => ({
    id: crypto.randomUUID(),
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 10 + 6,
    delay: Math.random() * 5,
  }));
}

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const particles = useMemo(() => generateParticles(20), []);

  const stats = useMemo(
    () => [
      { value: "10,000+", label: "Active Polls", icon: ChartBarIcon },
      { value: "50,000+", label: "Happy Voters", icon: UsersIcon },
      { value: "99.9%", label: "Uptime", icon: ShieldCheckIcon },
    ],
    [],
  );

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 blur-3xl animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Particles */}
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

      <div className="relative z-10 px-4 pt-32 pb-20 mx-auto max-w-7xl">
        <div
          className={`text-center transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-full bg-red-500/10 border-red-500/20">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-400">
              10,000+ Active Polls Created
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl lg:text-8xl">
            <span className="text-transparent bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text">
              Your Voice -
            </span>
            <span className="text-transparent bg-gradient-to-r from-red-500 to-red-300 bg-clip-text">
              Your Vote
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-400">
            Create and participate in secure polls with real-time results.
            Designed for fast, transparent decision-making.
          </p>

          {/* CTA */}
          <div className="flex flex-col justify-center gap-4 mt-10 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 font-medium text-white transition bg-red-600 rounded-full hover:bg-red-700"
            >
              Get Started
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Link>

            <Link
              href="/polls"
              className="inline-flex items-center justify-center px-6 py-3 text-white transition border rounded-full border-red-500/40 hover:bg-red-500/10"
            >
              <PlayIcon className="w-5 h-5 mr-2" />
              Browse Polls
            </Link>
          </div>

          {/* Stats */}
          <div className="grid max-w-3xl gap-8 mx-auto mt-16 md:grid-cols-3">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="text-center"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="flex justify-center mb-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10">
                    <stat.icon className="w-6 h-6 text-red-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div className="mt-20 text-center animate-fade-in">
            <p className="mb-8 text-xs font-bold tracking-[0.3em] text-gray-500 uppercase">
              Trusted Infrastructure
            </p>

            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {["Enterprise", "Government", "Education", "Business", "NGO"].map(
                (sector) => (
                  <div
                    key={sector}
                    className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all duration-300 hover:border-red-500/50 hover:bg-red-500/5"
                  >
                    {/* The "Active" Indicator Dot */}
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inline-flex w-full h-full bg-red-400 rounded-full animate-ping opacity-20"></span>
                      <span className="relative inline-flex w-2 h-2 rounded-full bg-red-500/80"></span>
                    </span>

                    <span className="text-xs font-medium tracking-wide text-gray-400 transition-colors group-hover:text-white">
                      {sector}
                    </span>

                    {/* Subtle Hover Glow */}
                    <div className="absolute inset-0 rounded-full bg-red-500/0 group-hover:bg-red-500/[0.02] blur-md transition-all" />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scoped animation */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
