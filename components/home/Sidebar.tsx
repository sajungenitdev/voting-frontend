"use client";

import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/16/solid";
import Link from "next/link";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SidebarProps {
  polls: any[];
  categories: Record<string, number>;
  topPolls?: any[];
}

interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

export default function Sidebar({
  polls,
  categories,
  topPolls = [],
}: SidebarProps) {
  const [promoVisible, setPromoVisible] = useState(true);
  const [showB2BModal, setShowB2BModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);

  // Fetch dynamic categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await api.get("/categories");
        if (response.data.success) {
          setDynamicCategories(response.data.data.categories || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Calculate statistics
  const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);
  const activePolls = polls.filter(
    (p) => p.isPublished && new Date(p.endDate) > new Date(),
  ).length;
  const endingSoon = polls.filter((p) => {
    const daysLeft =
      (new Date(p.endDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24);
    return p.isPublished && daysLeft <= 3 && daysLeft > 0;
  }).length;

  const topCategories = Object.entries(categories)
    .filter(([key]) => key !== "all")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const trendingPolls = [...polls]
    .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
    .slice(0, 5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      technology: "💻",
      sports: "⚽",
      politics: "🏛️",
      entertainment: "🎬",
      business: "💼",
      education: "📚",
      health: "🏥",
      gaming: "🎮",
      other: "📋",
    };
    return icons[category] || "📋";
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phoneNumber || !purpose) {
      toast.error("Please fill all required fields");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one data category");
      return;
    }

    if (!termsAgreed || !complianceAgreed) {
      toast.error("Please agree to the terms and compliance");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        fullName,
        email,
        phoneNumber,
        purpose,
        selectedCategories,
        termsAgreed: true, // ✅ Send as boolean, not state
        complianceAgreed: true, // ✅ Send as boolean, not state
      };

      console.log("📤 Sending Request:", payload);

      const response = await api.post("/b2b/request", payload);

      console.log("📥 Response:", response.data);

      if (response.data.success) {
        setRequestId(response.data.data.requestId);
        setRequestEmail(email);
        setShowB2BModal(false);
        setShowOtpModal(true);
        setResendTimer(60);
        toast.success("Request submitted! Please check your email for OTP.");
      }
    } catch (error: any) {
      console.error("Request error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };

  // In your Sidebar component, update handleVerifyOTP:

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!requestId) {
      toast.error("Request ID is missing. Please submit the form again.");
      return;
    }

    const payload = {
      email: requestEmail,
      otp: otp,
      requestId: requestId,
    };

    console.log("📤 Sending OTP Verification:", payload);

    setIsLoading(true);
    try {
      const response = await api.post("/b2b/verify-otp", payload);

      console.log("📥 OTP Response:", response.data);

      if (response.data.success) {
        toast.success("OTP verified! Redirecting to dashboard...");
        setShowOtpModal(false);
        setOtp("");

        if (response.data.data.accessToken) {
          localStorage.setItem("accessToken", response.data.data.accessToken);
          if (response.data.data.user) {
            localStorage.setItem(
              "user",
              JSON.stringify(response.data.data.user),
            );
          }
        }

        setTimeout(() => {
          window.location.href = "/b2b/dashboard";
        }, 1000);
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("❌ OTP Error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds`);
      return;
    }

    if (!requestId) {
      toast.error("Request ID is missing. Please submit the form again.");
      return;
    }

    const payload = {
      email: requestEmail,
      requestId: requestId,
    };

    console.log("📤 Resending OTP:", payload);

    setIsLoading(true);
    try {
      const response = await api.post("/b2b/resend-otp", payload);
      console.log("📥 Resend Response:", response.data);
      toast.success("New OTP sent to your email");
      setResendTimer(60);
    } catch (error: any) {
      console.error("Resend error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <aside className="space-y-6">
        {/* Promotional Banner */}
        {promoVisible && (
          <div className="relative p-5 overflow-hidden shadow-lg bg-gradient-to-br from-red-600 to-red-800 rounded-2xl shadow-red-500/20">
            <button
              onClick={() => setPromoVisible(false)}
              className="absolute transition-colors top-2 right-2 text-white/60 hover:text-white"
            >
              ✕
            </button>
            <div className="relative z-10">
              <div className="mb-2 text-3xl">🎉</div>
              <h3 className="mb-1 text-lg font-bold text-white">
                Create Your Own Poll
              </h3>
              <p className="mb-4 text-sm text-white/80">
                Start engaging with your audience today
              </p>
              <Link
                href="/create-poll"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-white/20 hover:bg-white/30"
              >
                Get Started
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute text-6xl -bottom-4 -right-4 opacity-10">
              🗳️
            </div>
          </div>
        )}

        {/* B2B Data Access Card */}
        <div className="relative p-5 overflow-hidden transition-all border cursor-pointer group bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500/30 rounded-2xl hover:shadow-lg hover:shadow-purple-500/20">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BuildingOfficeIcon className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">B2B Data Access</h3>
              </div>
              <span className="text-xs font-medium text-purple-200 bg-white/20 px-2 py-0.5 rounded-full">
                Enterprise
              </span>
            </div>
            <p className="mb-3 text-sm text-white/80">
              Get access to voting data, analytics, and insights for your
              organization
            </p>
            <div className="flex items-center gap-2 mb-4 text-xs text-white/60">
              <span>✓ Demographics</span>
              <span>✓ Voting History</span>
              <span>✓ Geographic Data</span>
            </div>
            <button
              onClick={() => setShowB2BModal(true)}
              className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-white/20 hover:bg-white/30"
            >
              Request Access
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
          <div className="absolute text-6xl -bottom-4 -right-4 opacity-10">
            📊
          </div>
        </div>

        {/* Statistics Card */}
        <div className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Platform Stats</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Polls</span>
              <span className="font-bold text-white">{polls.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Active Polls</span>
              <span className="font-bold text-green-400">{activePolls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Total Votes</span>
              <span className="font-bold text-red-400">
                {totalVotes.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Ending Soon</span>
              <span className="font-bold text-yellow-400">{endingSoon}</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <FireIcon className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Top Categories</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, count]) => (
              <Link
                key={category}
                href={`/?category=${category}`}
                className="flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getCategoryIcon(category)}</span>
                  <span className="text-gray-400 capitalize transition-colors group-hover:text-white">
                    {category}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{count} polls</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Trending Polls */}
        <div className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ArrowTrendingUpIcon className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Trending Polls</h3>
          </div>
          <div className="space-y-4">
            {trendingPolls.map((poll, idx) => (
              <Link
                key={poll._id}
                href={`/polls/${poll._id}`}
                className="block group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 text-center">
                    {idx === 0 && (
                      <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    )}
                    {idx === 1 && (
                      <TrophyIcon className="w-5 h-5 text-gray-400" />
                    )}
                    {idx === 2 && (
                      <TrophyIcon className="w-5 h-5 text-amber-600" />
                    )}
                    {idx > 2 && (
                      <span className="text-xs text-gray-600">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white transition-colors group-hover:text-red-400 line-clamp-1">
                      {poll.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 capitalize">
                        {poll.category}
                      </span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-red-400">
                        {poll.totalVotes || 0} votes
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ClockIcon className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-white">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-400">New poll created</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <UserGroupIcon className="w-4 h-4 text-blue-500" />
              <span className="text-gray-400">New user joined</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <FireIcon className="w-4 h-4 text-orange-500" />
              <span className="text-gray-400">Record votes today</span>
            </div>
          </div>
        </div>
      </aside>

      {/* B2B Request Modal */}
      {showB2BModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-purple-500/30 rounded-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-4 bg-gray-900 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="w-6 h-6 text-purple-500" />
                  <h2 className="text-xl font-bold text-white">
                    Request B2B Data Access
                  </h2>
                </div>
                <button
                  onClick={() => setShowB2BModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400">
                Fill out the form to request enterprise data access
              </p>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email Address *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <PhoneIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Purpose of Data Access *
                  </label>
                  <div className="relative">
                    <ClipboardDocumentListIcon className="absolute w-5 h-5 text-gray-500 left-3 top-3" />
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={3}
                      className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                      placeholder="Describe how you plan to use the data..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Select Data Categories *
                  </label>
                  {loadingCategories ? (
                    <div className="py-4 text-center text-gray-400">
                      Loading categories...
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dynamicCategories.map((category) => (
                        <label
                          key={category._id}
                          className="flex items-start gap-3 p-3 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category.name)}
                            onChange={() => toggleCategory(category.name)}
                            className="w-4 h-4 mt-1 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {category.icon || "📊"}
                              </span>
                              <p className="font-medium text-white">
                                {category.displayName}
                              </p>
                            </div>
                            {category.description && (
                              <p className="mt-1 text-xs text-gray-500">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-3 border rounded-lg bg-yellow-500/10 border-yellow-500/30">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to the{" "}
                      <span className="text-purple-500">
                        Terms & Conditions
                      </span>{" "}
                      and
                      <span className="text-purple-500"> Privacy Policy</span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={complianceAgreed}
                      onChange={(e) => setComplianceAgreed(e.target.checked)}
                      className="w-4 h-4 mt-1 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-300">
                      I agree to comply with all{" "}
                      <span className="text-purple-500">
                        data usage and compliance regulations
                      </span>
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-purple-500/30 rounded-2xl">
            <div className="p-6">
              <div className="mb-6 text-center">
                <div className="mb-4 text-5xl">📧</div>
                <h2 className="text-xl font-bold text-white">
                  Verify Your Email
                </h2>
                <p className="mt-2 text-sm text-gray-400">
                  We've sent a 6-digit verification code to
                </p>
                <p className="text-sm font-medium text-white">{requestEmail}</p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").substring(0, 6))
                  }
                  className="w-full px-4 py-3 text-2xl tracking-widest text-center text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                  maxLength={6}
                  required
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg disabled:opacity-50"
                >
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendTimer > 0}
                    className={`text-sm transition-colors ${
                      resendTimer > 0
                        ? "text-gray-500 cursor-not-allowed"
                        : "text-gray-400 hover:text-purple-400"
                    }`}
                  >
                    {resendTimer > 0
                      ? `Resend code in ${resendTimer}s`
                      : "Didn't receive code? Resend"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
