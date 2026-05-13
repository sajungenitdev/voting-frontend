// app/about/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChartBarIcon,
  UsersIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  StarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";

// Generate particles for background
function generateParticles(count = 30) {
  return Array.from({ length: count }).map(() => ({
    id: crypto.randomUUID(),
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: Math.random() * 15 + 8,
    delay: Math.random() * 5,
  }));
}

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  const particles = useMemo(() => generateParticles(25), []);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    {
      label: "Active Polls",
      value: "500+",
      icon: ChartBarIcon,
      color: "bg-red-500/20 text-red-400",
    },
    {
      label: "Registered Voters",
      value: "10K+",
      icon: UsersIcon,
      color: "bg-blue-500/20 text-blue-400",
    },
    {
      label: "Votes Cast",
      value: "50K+",
      icon: CheckCircleIcon,
      color: "bg-green-500/20 text-green-400",
    },
    {
      label: "Countries",
      value: "50+",
      icon: GlobeAltIcon,
      color: "bg-purple-500/20 text-purple-400",
    },
  ];

  const features = [
    {
      title: "Secure Voting",
      description:
        "Blockchain-verified votes with complete transparency and security.",
      icon: ShieldCheckIcon,
      color: "from-red-500 to-red-600",
    },
    {
      title: "Real-time Results",
      description:
        "Watch votes update live as they come in with instant analytics.",
      icon: ArrowTrendingUpIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "User Friendly",
      description:
        "Intuitive interface makes voting simple and accessible for everyone.",
      icon: HeartIcon,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Data Insights",
      description:
        "Deep analytics and insights from voting patterns and trends.",
      icon: LightBulbIcon,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "Fast & Reliable",
      description:
        "High-performance platform ensuring smooth voting experience.",
      icon: RocketLaunchIcon,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Community Driven",
      description:
        "Built by the community, for the community with open feedback.",
      icon: UserGroupIcon,
      color: "from-pink-500 to-pink-600",
    },
  ];

  const milestones = [
    {
      year: "2023",
      title: "Platform Launch",
      description: "Launched the first version of PlusVoting",
    },
    {
      year: "2024",
      title: "100K Votes",
      description: "Reached 100,000 votes milestone",
    },
    {
      year: "2025",
      title: "Global Expansion",
      description: "Expanded to 50+ countries worldwide",
    },
    {
      year: "2026",
      title: "Next Gen",
      description: "Launched AI-powered analytics",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-t from-red-900 via-black to-black">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-600/10 blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]" />
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

        <div className="relative px-4 mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div
              className={`transform transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border rounded-full bg-red-500/10 border-red-500/30">
                <StarIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-500">Our Story</span>
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-white md:text-7xl">
                Making Democracy
                <span className="block text-transparent bg-gradient-to-r from-red-500 to-red-800 bg-clip-text">
                  Accessible to All
                </span>
              </h1>
              <p className="max-w-2xl mx-auto text-lg text-gray-400">
                PlusVoting is on a mission to create the most secure,
                transparent, and accessible voting platform for communities
                worldwide.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Link
                  href="/register"
                  className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
                >
                  Get Started
                </Link>
                <Link
                  href="/polls"
                  className="px-6 py-3 font-semibold text-gray-300 transition-all border border-gray-700 rounded-lg hover:bg-white/5"
                >
                  Explore Polls
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-black">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-6 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black transform transition-all duration-700 hover:scale-105 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-flex p-3 mb-4 rounded-xl ${stat.color} bg-opacity-10`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2">
            <div
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-12 opacity-0"
              }`}
            >
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                Our Mission
              </h2>
              <p className="mb-6 text-lg text-gray-400">
                To empower communities through democratic participation by
                providing a secure, transparent, and accessible voting platform
                that ensures every voice is heard and every vote counts.
              </p>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500" />
                  <p className="text-gray-300">
                    100% Transparent Voting Process
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500" />
                  <p className="text-gray-300">
                    Bank-Level Security & Encryption
                  </p>
                </div>
                <div className="flex gap-3">
                  <CheckCircleIcon className="flex-shrink-0 w-6 h-6 text-green-500" />
                  <p className="text-gray-300">Real-time Results & Analytics</p>
                </div>
              </div>
            </div>
            <div
              className={`transform transition-all duration-700 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-12 opacity-0"
              }`}
            >
              <div className="p-8 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-red-500" />
                  <h3 className="text-xl font-semibold text-white">
                    Trust & Security
                  </h3>
                </div>
                <p className="text-gray-400">
                  Every vote is cryptographically secured and verified. Our
                  platform undergoes regular security audits to ensure the
                  highest level of protection for your data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Why Choose PlusVoting?
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400">
              We combine cutting-edge technology with user-centric design to
              deliver the best voting experience
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black hover:shadow-lg hover:shadow-red-500/10 transition-all duration-500 transform ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                } hover:scale-105`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div
                  className={`inline-flex p-3 mb-4 rounded-xl bg-gradient-to-r ${feature.color} bg-opacity-10`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Our Journey
            </h2>
            <p className="max-w-2xl mx-auto text-gray-400">
              Key milestones in our mission to revolutionize democratic
              participation
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {milestones.map((milestone, index) => (
              <div
                key={milestone.year}
                className={`relative p-6 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-12 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="absolute px-3 py-1 text-sm font-bold text-white transform -translate-x-1/2 bg-red-500 rounded-full -top-3 left-1/2">
                  {milestone.year}
                </div>
                <div className="pt-4">
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-red-800">
        <div className="px-4 mx-auto text-center max-w-7xl">
          <div
            className={`transform transition-all duration-700 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-white/80">
              Join thousands of users who are already using PlusVoting to
              participate in democratic processes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 font-semibold text-red-600 transition-all bg-white rounded-lg hover:shadow-lg hover:bg-gray-100"
              >
                Get Started Now
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 font-semibold text-white transition-all border border-white rounded-lg hover:bg-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-60px) translateX(20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
