"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  EyeSlashIcon,
  UserCircleIcon,
  CloudArrowUpIcon,
  KeyIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function PrivacyPage() {
  const particles = useMemo(() => {
    return Array.from({ length: 15 }).map(() => ({
      id: crypto.randomUUID(),
      size: Math.random() * 3 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 10 + 7,
      delay: Math.random() * 5,
    }));
  }, []);

  const privacyPoints = [
    {
      title: "Information Collection",
      content:
        "We collect only essential data: your name, email address, and encrypted credentials. We do not track your browsing history or collect off-platform data.",
      icon: UserCircleIcon,
    },
    {
      title: "How We Use Your Data",
      content:
        "Your data is used solely to verify your identity for voting, prevent duplicate entries, and send essential system notifications. We never use your data for marketing.",
      icon: CloudArrowUpIcon,
    },
    {
      title: "Anonymized Voting",
      content:
        "While we verify who you are to ensure one vote per person, your specific vote selection is decoupled from your identity in our database to ensure total ballot secrecy.",
      icon: EyeSlashIcon,
    },
    {
      title: "Security Protocols",
      content:
        "We use Industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. Your password is never stored in plain text; we use salted Bcrypt hashing.",
      icon: KeyIcon,
    },
  ];

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-black">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-red-500/5 blur-[120px]" />

        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-red-500/10"
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

      <div className="relative z-10 px-6 py-24 mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-12">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 mb-8 text-red-500 transition-colors hover:text-red-400 group"
          >
            <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Registration
          </Link>
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl">
            Privacy <span className="text-red-500">Policy</span>
          </h1>
          <p className="text-gray-400">
            Protecting your digital footprint in the democratic process.
          </p>
        </div>

        {/* CONTENT CARD */}
        <div className="p-8 border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl md:p-12">
          <div className="space-y-12">
            {/* Mission Statement */}
            <div className="pb-10 border-b border-white/10">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Our Commitment
              </h2>
              <p className="text-lg leading-relaxed text-gray-400">
                At the Voting Platform, we believe privacy is a fundamental
                right. Our infrastructure is built on the principle of{" "}
                <strong>Privacy by Design</strong>, ensuring that your personal
                data is never a commodity.
              </p>
            </div>

            {/* Grid of Points */}
            <div className="grid gap-8 md:grid-cols-2">
              {privacyPoints.map((point, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-red-500/30 transition-colors group"
                >
                  <point.icon className="w-8 h-8 mb-4 text-red-500 transition-transform group-hover:scale-110" />
                  <h3 className="mb-2 text-lg font-bold text-white">
                    {point.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-400">
                    {point.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Detailed Policy Text */}
            <div className="pt-10 space-y-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white">Data Retention</h3>
              <p className="leading-relaxed text-gray-400">
                We retain your account information only as long as your account
                is active. If you choose to delete your account, all associated
                personal data is permanently purged from our primary databases
                within 30 days.
              </p>

              <h3 className="text-xl font-bold text-white">
                Cookies & Tracking
              </h3>
              <p className="leading-relaxed text-gray-400">
                We use strictly necessary cookies to maintain your session and
                security. We do not use third-party tracking pixels (like
                Facebook or Google Analytics) to respect your browsing privacy.
              </p>
            </div>

            {/* Footer / GDPR Note */}
            <div className="p-6 mt-12 text-center border rounded-2xl bg-red-500/5 border-red-500/20">
              <p className="text-sm italic text-gray-300">
                This policy is designed to comply with global data protection
                standards, including GDPR and CCPA.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            transform: translateY(-40px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
