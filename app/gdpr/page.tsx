"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  UserMinusIcon,
  ArrowPathIcon,
  DocumentMagnifyingGlassIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function GDPRPage() {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }).map(() => ({
        id: crypto.randomUUID(),
        size: Math.random() * 3 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 15 + 10,
      })),
    [],
  );

  const rights = [
    {
      title: "Right to be Informed",
      desc: "You have the right to know how your data is collected, processed, and stored. We provide this transparency via our Privacy Policy and this GDPR portal.",
      icon: DocumentMagnifyingGlassIcon,
    },
    {
      title: "Right of Access & Portability",
      desc: "You can request a digital copy of all personal data linked to your account. We provide this in a machine-readable JSON format upon request.",
      icon: ArrowPathIcon,
    },
    {
      title: "Right to Erasure (To be Forgotten)",
      desc: "You may request the permanent deletion of your account. Once processed, all personal identifiers are purged from our active databases and backup cycles.",
      icon: UserMinusIcon,
    },
    {
      title: "Data Integrity & Security",
      desc: "We implement 'Privacy by Design,' ensuring that data protection is integrated into our code from the very first line written.",
      icon: ShieldCheckIcon,
    },
  ];

  return (
    <section className="relative min-h-screen px-6 py-24 overflow-hidden text-gray-300 bg-black">
      {/* Visual Background */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/5 blur-[120px] rounded-full" />
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-red-500/10 animate-pulse"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              top: `${p.top}%`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 mb-12 text-red-500 transition-colors hover:text-red-400 group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Return to Platform
        </Link>

        <header className="mb-16">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            GDPR <span className="text-red-500">Compliance</span>
          </h1>
          <p className="max-w-2xl text-xl text-gray-400">
            We are committed to the highest standards of data sovereignty and
            user rights as defined by the EU General Data Protection Regulation.
          </p>
        </header>

        {/* Rights Grid */}
        <div className="grid gap-6 mb-16 md:grid-cols-2">
          {rights.map((right, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-red-500/40 transition-all duration-300 group"
            >
              <right.icon className="w-10 h-10 mb-6 text-red-500 transition-transform group-hover:scale-110" />
              <h3 className="mb-3 text-xl font-bold text-white">
                {right.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {right.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Legal Contact Section */}
        <div className="p-8 border rounded-3xl bg-gradient-to-b from-red-600/10 to-transparent border-red-500/20 md:p-12">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Exercising Your Rights
          </h2>
          <div className="space-y-6 text-gray-400">
            <p>
              To exercise any of your rights (Access, Correction, or Deletion),
              please contact our Data Protection Officer. We respond to all
              verified requests within 30 days.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <div className="flex-1 p-4 border bg-black/40 border-white/5 rounded-xl">
                <span className="block mb-1 text-xs font-bold tracking-widest text-red-500 uppercase">
                  DPO Email
                </span>
                <span className="font-mono text-white">
                  legal@yourdomain.com
                </span>
              </div>
              <div className="flex-1 p-4 border bg-black/40 border-white/5 rounded-xl">
                <span className="block mb-1 text-xs font-bold tracking-widest text-red-500 uppercase">
                  Response Time
                </span>
                <span className="font-mono text-white">
                  &lt; 72 Business Hours
                </span>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-xs text-center text-gray-600">
          <p>
            © 2026 Voting Platform. All systems are GDPR compliant and
            encrypted.
          </p>
        </footer>
      </div>
    </section>
  );
}
