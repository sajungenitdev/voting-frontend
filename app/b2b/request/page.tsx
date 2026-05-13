"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { setSession } from "@/store/slices/authSlice";

interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon: string;
  description?: string;
  isActive: boolean;
}

export default function B2BRequestPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
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

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

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
      const response = await api.post("/b2b/request", {
        fullName,
        email,
        phoneNumber,
        purpose,
        selectedCategories,
        termsAgreed,
        complianceAgreed,
      });

      if (response.data.success) {
        setRequestId(response.data.data.requestId);
        setRequestEmail(email);
        setShowOtpModal(true);
        setResendTimer(60);
        toast.success("Request submitted! Please check your email for OTP.");
      }
    } catch (error: any) {
      console.error("Request error:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsLoading(false);
    }
  };
  // app/b2b/request/page.tsx - Update handleVerifyOTP

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post("/b2b/verify-otp", {
        email: requestEmail,
        otp,
        requestId,
      });

      if (response.data.success) {
        const { accessToken, user } = response.data.data;

        if (accessToken && user) {
          // Store in localStorage
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(user));

          // ✅ Force restore session in Redux
          dispatch(restoreSession());

          toast.success("Verification successful! Redirecting to dashboard...");

          // ✅ Redirect to dashboard
          setTimeout(() => {
            window.location.href = "/b2b/dashboard";
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error("OTP error:", error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      toast.error(`Please wait ${resendTimer} seconds`);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/b2b/resend-otp", { email: requestEmail, requestId });
      toast.success("New OTP sent to your email");
      setResendTimer(60);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container max-w-4xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-purple-500/20">
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Request B2B Data Access
          </h1>
          <p className="mt-2 text-gray-400">
            Get access to comprehensive voting data, analytics, and insights for
            your organization
          </p>
        </div>

        {/* Main Form */}
        <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black md:p-8">
          <form onSubmit={handleSubmitRequest} className="space-y-6">
            {/* Full Name */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="contact@yourcompany.com"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
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
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>

            {/* Purpose */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Purpose of Data Access *
              </label>
              <div className="relative">
                <ClipboardDocumentListIcon className="absolute w-5 h-5 text-gray-500 left-3 top-3" />
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={4}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  placeholder="Describe how you plan to use the data (e.g., market research, voter behavior analysis, academic research)..."
                  required
                />
              </div>
            </div>

            {/* Data Categories */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Select Data Categories *
              </label>
              {loadingCategories ? (
                <div className="flex items-center justify-center py-8">
                  <ArrowPathIcon className="w-6 h-6 text-purple-500 animate-spin" />
                  <span className="ml-2 text-gray-400">
                    Loading categories...
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  {dynamicCategories.map((category) => (
                    <label
                      key={category._id}
                      className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                        selectedCategories.includes(category.name)
                          ? "bg-purple-500/10 border border-purple-500/30"
                          : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.name)}
                        onChange={() => toggleCategory(category.name)}
                        className="w-4 h-4 mt-1 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">
                            {category.icon || "📊"}
                          </span>
                          <span className="font-medium text-white">
                            {category.displayName}
                          </span>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Terms and Compliance */}
            <div className="p-4 space-y-4 border rounded-xl bg-yellow-500/5 border-yellow-500/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 mt-1 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">
                  I agree to the{" "}
                  <span className="text-purple-500">Terms & Conditions</span>{" "}
                  and <span className="text-purple-500">Privacy Policy</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Submitting...
                </div>
              ) : (
                "Submit Request"
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="p-4 mt-6 border rounded-lg bg-blue-500/10 border-blue-500/30">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-400">
                After submitting your request, you will receive an OTP via email
                for verification. Once verified, you'll get access to the B2B
                dashboard where you can purchase subscriptions and access data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-purple-500/30 rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Verify Your Email
                </h2>
                <button
                  onClick={() => setShowOtpModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6 text-center">
                <div className="mb-4 text-5xl">📧</div>
                <p className="text-sm text-gray-400">
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
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify & Continue"
                  )}
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
    </div>
  );
}
