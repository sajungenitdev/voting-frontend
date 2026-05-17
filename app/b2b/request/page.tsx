"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { restoreSession } from "@/store/slices/authSlice";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  XMarkIcon,
  SparklesIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  EyeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/solid";

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
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [dynamicCategories, setDynamicCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Pre-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
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

  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(
        selectedCategories.filter((c) => c !== categoryName),
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const selectAllCategories = () => {
    setSelectedCategories(dynamicCategories.map((c) => c.name));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const filteredCategories = dynamicCategories.filter(
    (cat) =>
      cat.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Full name is required";
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Invalid email format";
    if (!phoneNumber.trim()) errors.phoneNumber = "Phone number is required";
    if (!purpose.trim()) errors.purpose = "Purpose is required";

    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one data category");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!termsAgreed || !complianceAgreed) {
      toast.error("Please agree to the terms and compliance");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
  };

  const prevStep = () => setCurrentStep(currentStep - 1);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

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
        const { accessToken, user: userData } = response.data.data;

        if (accessToken && userData) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(userData));
          dispatch(restoreSession());

          toast.success("Verification successful! Redirecting to dashboard...");

          setTimeout(() => {
            router.push("/b2b/dashboard");
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

  const steps = [
    { number: 1, title: "Account Info", icon: UserIcon },
    { number: 2, title: "Select Categories", icon: DocumentTextIcon },
    { number: 3, title: "Review & Submit", icon: ShieldCheckIcon },
  ];

  return (
    <div className="min-h-screen pt-20 pb-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container max-w-4xl px-4 mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-purple-500/20">
            <BuildingOfficeIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Request B2B Data Access
          </h1>
          <p className="mt-2 text-gray-400">
            Get access to comprehensive voting data, analytics, and insights for
            your organization
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between max-w-md mx-auto">
            {steps.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    currentStep >= step.number
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                      : "bg-gray-800 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="hidden ml-2 sm:block">
                  <p
                    className={`text-xs ${currentStep >= step.number ? "text-purple-400" : "text-gray-500"}`}
                  >
                    {step.title}
                  </p>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 transition-all ${currentStep > step.number ? "bg-purple-500" : "bg-gray-700"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black md:p-8"
        >
          <form onSubmit={handleSubmitRequest}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white">
                  Account Information
                </h2>

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
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:border-purple-500 focus:outline-none ${
                        step1Errors.fullName
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                      placeholder="John Doe"
                      required
                    />
                    {step1Errors.fullName && (
                      <p className="mt-1 text-xs text-red-500">
                        {step1Errors.fullName}
                      </p>
                    )}
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
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:border-purple-500 focus:outline-none ${
                        step1Errors.email ? "border-red-500" : "border-gray-700"
                      }`}
                      placeholder="contact@yourcompany.com"
                      required
                    />
                    {step1Errors.email && (
                      <p className="mt-1 text-xs text-red-500">
                        {step1Errors.email}
                      </p>
                    )}
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
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:border-purple-500 focus:outline-none ${
                        step1Errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                      placeholder="+1 234 567 8900"
                      required
                    />
                    {step1Errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-500">
                        {step1Errors.phoneNumber}
                      </p>
                    )}
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
                      rows={4}
                      className={`w-full pl-10 pr-4 py-2.5 bg-gray-800 border rounded-lg text-white focus:border-purple-500 focus:outline-none ${
                        step1Errors.purpose
                          ? "border-red-500"
                          : "border-gray-700"
                      }`}
                      placeholder="Describe how you plan to use the data (e.g., market research, voter behavior analysis, academic research)..."
                      required
                    />
                    {step1Errors.purpose && (
                      <p className="mt-1 text-xs text-red-500">
                        {step1Errors.purpose}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Categories */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white">
                  Select Data Categories
                </h2>

                {/* Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>

                {/* Select All / Clear All */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="px-4 py-2 text-sm text-purple-400 transition-colors rounded-lg bg-purple-500/10 hover:bg-purple-500/20"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllCategories}
                    className="px-4 py-2 text-sm text-gray-400 transition-colors rounded-lg bg-gray-800/50 hover:bg-gray-800"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories Grid */}
                {loadingCategories ? (
                  <div className="flex items-center justify-center py-8">
                    <ArrowPathIcon className="w-6 h-6 text-purple-500 animate-spin" />
                    <span className="ml-2 text-gray-400">
                      Loading categories...
                    </span>
                  </div>
                ) : (
                  <div className="pr-2 space-y-3 overflow-y-auto max-h-96">
                    {filteredCategories.map((category) => (
                      <motion.label
                        key={category._id}
                        whileHover={{ scale: 1.01 }}
                        className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                          selectedCategories.includes(category.name)
                            ? "bg-purple-500/10 border border-purple-500/30 shadow-lg shadow-purple-500/10"
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
                            {selectedCategories.includes(category.name) && (
                              <CheckCircleIcon className="w-4 h-4 ml-auto text-green-500" />
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-gray-500">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </motion.label>
                    ))}
                  </div>
                )}

                {/* Selected Count */}
                <div className="p-3 border rounded-lg bg-purple-500/10 border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">
                      Selected Categories:
                    </span>
                    <span className="text-sm font-bold text-purple-400">
                      {selectedCategories.length} selected
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Submit */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white">
                  Review & Submit
                </h2>

                {/* Review Information */}
                <div className="p-4 rounded-xl bg-white/5">
                  <h3 className="mb-3 text-sm font-semibold text-purple-400">
                    Account Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Full Name:</span>
                      <span className="text-white">{fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-white">{email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-white">{phoneNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Purpose:</span>
                      <span className="text-white line-clamp-2">{purpose}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5">
                  <h3 className="mb-3 text-sm font-semibold text-purple-400">
                    Selected Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs text-purple-400 rounded-full bg-purple-500/20"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
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
                      <span className="text-purple-500">
                        Terms & Conditions
                      </span>{" "}
                      and{" "}
                      <span className="text-purple-500">Privacy Policy</span>
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
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 mt-6 border-t border-gray-800">
              {currentStep > 1 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 text-sm font-medium text-gray-300 transition-all rounded-lg bg-gray-800 hover:bg-gray-700"
                >
                  <ChevronLeftIcon className="inline w-4 h-4 mr-1" />
                  Back
                </motion.button>
              )}
              {currentStep < 3 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  Continue
                  <ChevronRightIcon className="inline w-4 h-4 ml-1" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    "Submit Request"
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 mt-6 border rounded-lg bg-blue-500/10 border-blue-500/30"
        >
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
        </motion.div>
      </div>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-md border shadow-2xl bg-gradient-to-br from-gray-900 to-black border-purple-500/30 rounded-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">
                      Verify Your Email
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowOtpModal(false)}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-4 text-6xl"
                  >
                    📧
                  </motion.div>
                  <p className="text-sm text-gray-400">
                    We've sent a 6-digit verification code to
                  </p>
                  <p className="text-sm font-medium text-purple-400">
                    {requestEmail}
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(/\D/g, "").substring(0, 6),
                        )
                      }
                      className="w-full px-4 py-3 text-2xl tracking-widest text-center text-white bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      maxLength={6}
                      required
                    />
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 -z-10 blur-xl opacity-30"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full py-3 font-semibold text-white transition-all rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify & Continue"
                    )}
                  </motion.button>

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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
