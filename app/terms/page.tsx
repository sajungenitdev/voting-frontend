"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShieldCheckIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function TermsPage() {
  // Maintaining visual consistency with your Hero/Login design
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map(() => ({
      id: crypto.randomUUID(),
      size: Math.random() * 3 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 5,
    }));
  }, []);

  const sections = [
    {
      title: "1. Data Security & Safety",
      content:
        "Your privacy is our priority. We employ end-to-end encryption and advanced hashing algorithms to ensure that your personal information and voting choices remain confidential. We do not sell or share your data with third-party advertisers.",
      icon: ShieldCheckIcon,
    },
    {
      title: "2. User Eligibility",
      content:
        "By creating an account, you represent that you are of legal age to participate in voting activities within your jurisdiction and that all information provided is accurate and truthful.",
      icon: DocumentTextIcon,
    },
    {
      title: "3. Platform Integrity",
      content:
        "Any attempt to manipulate vote counts, create multiple accounts for a single user, or exploit system vulnerabilities will result in an immediate permanent ban and potential legal action.",
      icon: LockClosedIcon,
    },
  ];

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-black">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-900/5 blur-[120px]" />

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
            Terms & <span className="text-red-500">Conditions</span>
          </h1>
          <p className="text-gray-400">Last Updated: May 12, 2026</p>
        </div>

        {/* CONTENT CARD */}
        <div className="p-8 border shadow-2xl backdrop-blur-xl bg-white/5 border-white/10 rounded-3xl md:p-12">
          <div className="space-y-12 prose prose-invert max-w-none">
            {/* Introductory Text */}
            <div className="p-6 border-l-4 border-red-500 bg-red-500/5 rounded-r-xl">
              <p className="m-0 leading-relaxed text-gray-300">
                Welcome to the Voting Platform. By accessing or using our
                services, you agree to be bound by these terms.
                <strong>
                  {" "}
                  We guarantee that your data is handled with the highest
                  security standards available in modern web technology.
                </strong>
              </p>
            </div>

            {/* Dynamic Sections */}
            {sections.map((section, idx) => (
              <div key={idx} className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 border rounded-lg bg-red-500/10 border-red-500/20">
                    <section.icon className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="m-0 text-2xl font-semibold text-white">
                    {section.title}
                  </h2>
                </div>
                <p className="pl-12 leading-relaxed text-gray-400">
                  {section.content}
                </p>
              </div>
            ))}

            {/* Additional Detailed Content */}
            <div className="pt-6 space-y-6 border-t border-white/10">
              <h3 className="text-xl font-bold text-white">
                4. Limitation of Liability
              </h3>
              <p className="text-gray-400">
                While we strive for 99.9% uptime and total data accuracy, the
                platform is provided "as is." We are not liable for any indirect
                damages resulting from your use of the service or any
                unauthorized access to your account due to weak password
                security.
              </p>

              <h3 className="text-xl font-bold text-white">5. Termination</h3>
              <p className="text-gray-400">
                We reserve the right to suspend or terminate access to our
                services for anyone who violates these terms or engages in
                behavior that threatens the democratic integrity of our polls.
              </p>
            </div>
          </div>

          {/* Contact Footer */}
          <div className="pt-8 mt-12 text-center border-t border-white/10">
            <p className="mb-4 text-gray-500">Questions about our security?</p>
            <Link
              href="mailto:support@votingplatform.com"
              className="inline-block px-6 py-3 text-white transition-all border rounded-full bg-white/5 border-white/10 hover:bg-white/10"
            >
              Contact Support Team
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-40px) translateX(10px);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
