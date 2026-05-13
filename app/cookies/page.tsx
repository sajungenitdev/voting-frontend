"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  CircleStackIcon,
  FingerPrintIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function CookiePage() {
  return (
    <section className="relative flex items-center justify-center min-h-screen p-6 bg-black">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-7xl">
        <Link
          href="/register"
          className="flex items-center gap-2 mb-8 text-red-500 hover:underline"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Back to Registration
        </Link>

        <h1 className="mb-2 text-5xl font-bold text-white">
          Cookie <span className="text-red-500">Policy</span>
        </h1>
        <p className="mb-10 text-gray-400">
          GDPR Compliance and essential storage information.
        </p>

        <div className="grid gap-6">
          {/* GDPR Box */}
          <div className="p-8 border backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-4">
              <FingerPrintIcon className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-white">GDPR Rights</h2>
            </div>
            <p className="text-gray-400">
              Under EU law, you have the right to access, delete, or port your
              data. You can request a full data wipe at any time by contacting
              our DPO.
            </p>
          </div>

          {/* Cookie Table Box */}
          <div className="p-8 border backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl">
            <div className="flex items-center gap-3 mb-6">
              <CircleStackIcon className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-white">
                Essential Cookies
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between pb-2 text-sm border-b border-white/5">
                <span className="font-mono text-red-400">auth_session</span>
                <span className="italic text-gray-500">Essential Security</span>
              </div>
              <div className="flex justify-between pb-2 text-sm border-b border-white/5">
                <span className="font-mono text-red-400">xsrf_token</span>
                <span className="italic text-gray-500">Attack Prevention</span>
              </div>
            </div>
            <p className="mt-6 text-xs tracking-widest text-gray-500 uppercase">
              We do not use tracking or advertising cookies.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
