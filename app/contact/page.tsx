"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { 
  EnvelopeIcon, 
  ChatBubbleLeftRightIcon, 
  MapPinIcon,
  PaperAirplaneIcon,
  ArrowLeftIcon 
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [pending, setPending] = useState(false);

  const particles = useMemo(() => Array.from({ length: 15 }).map(() => ({
    id: crypto.randomUUID(),
    size: Math.random() * 3 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 12 + 8,
  })), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setTimeout(() => setPending(false), 2000); // Simulate sending
  };

  return (
    <section className="relative min-h-screen py-24 overflow-hidden bg-black">
      {/* Background Glows */}
      <div className="absolute inset-0" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-red-900/10 blur-[120px] rounded-full" />
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-red-500/10 animate-pulse"
            style={{ width: p.size, height: p.size, left: `${p.left}%`, top: `${p.top}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-12 text-red-500 transition-colors hover:text-red-400 group">
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <div className="grid items-start gap-16 lg:grid-cols-2">
          {/* LEFT SIDE: INFO */}
          <div>
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-6xl">
              Get in <span className="text-red-500">Touch</span>
            </h1>
            <p className="max-w-md mb-12 text-lg text-gray-400">
              Have questions about ballot security or system integration? Our technical team is standing by to assist you.
            </p>

            <div className="space-y-8">
              <div className="flex gap-6 group">
                <div className="flex items-center justify-center w-12 h-12 transition-colors border shrink-0 rounded-2xl bg-white/5 border-white/10 group-hover:border-red-500/50">
                  <EnvelopeIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Email Support</h3>
                  <p className="text-sm text-gray-500">support@votingplatform.com</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex items-center justify-center w-12 h-12 transition-colors border shrink-0 rounded-2xl bg-white/5 border-white/10 group-hover:border-red-500/50">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Live Assistance</h3>
                  <p className="text-sm text-gray-500">Available Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>

              <div className="flex gap-6 group">
                <div className="flex items-center justify-center w-12 h-12 transition-colors border shrink-0 rounded-2xl bg-white/5 border-white/10 group-hover:border-red-500/50">
                  <MapPinIcon className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Global HQ</h3>
                  <p className="text-sm text-gray-500">Tech District, Digital Plaza, NY 10001</p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: FORM */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-transparent rounded-[2rem] blur-xl" />
            <form 
              onSubmit={handleSubmit}
              className="relative bg-white/5 border border-white/10 backdrop-blur-2xl p-8 md:p-10 rounded-[2rem] shadow-2xl space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold tracking-widest text-gray-500 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="ml-1 text-xs font-bold tracking-widest text-gray-500 uppercase">Email Address</label>
                  <input 
                    type="email" 
                    required
                    className="w-full px-4 py-3 text-white transition-all border outline-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-widest text-gray-500 uppercase">Subject</label>
                <select className="w-full px-4 py-3 text-white transition-all border outline-none bg-black/50 border-white/10 rounded-xl focus:border-red-500">
                  <option className="bg-black">Technical Support</option>
                  <option className="bg-black">Partnership Inquiry</option>
                  <option className="bg-black">Security Report</option>
                  <option className="bg-black">General Question</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-xs font-bold tracking-widest text-gray-500 uppercase">Message</label>
                <textarea 
                  rows={4}
                  required
                  className="w-full px-4 py-3 text-white transition-all border outline-none resize-none bg-white/5 border-white/10 rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="How can we help you?"
                />
              </div>

              <button 
                type="submit"
                disabled={pending}
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {pending ? (
                  <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Transmit Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}