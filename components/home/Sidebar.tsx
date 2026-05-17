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
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SignalIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import {
  ArrowPathIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState, useEffect } from "react";
import { categoryAPI } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  polls: any[];
  categories: Record<string, number>;
  topPolls?: any[];
}

// ✅ FIXED: Make isActive optional to match API response
interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon?: string;
  description?: string;
  isActive?: boolean; // Changed from required to optional
}

export default function Sidebar({
  polls,
  categories,
  topPolls = [],
}: SidebarProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
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
  const [hoveredStat, setHoveredStat] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredPoll, setHoveredPoll] = useState<string | null>(null);

  // Modal state
  const [selectedModalCategories, setSelectedModalCategories] = useState<
    string[]
  >([]);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<
    "basic" | "standard" | "premium"
  >("standard");

  // Form state
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await categoryAPI.getAll();
        if (response.success && response.data?.categories) {
          // ✅ Safe filtering with optional isActive
          setDynamicCategories(
            response.data.categories.filter((cat) => cat.isActive !== false),
          );
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Reset form when modal closes
  useEffect(() => {
    if (!showB2BModal) {
      setCurrentStep(1);
      setFullName("");
      setCompanyName("");
      setEmail("");
      setPhoneNumber("");
      setPurpose("");
      setSelectedModalCategories([]);
      setTermsAgreed(false);
      setComplianceAgreed(false);
      setStep1Errors({});
      setCategorySearchTerm("");
    }
  }, [showB2BModal]);

  // Auto-fill user data when logged in and modal opens
  useEffect(() => {
    if (showB2BModal && user) {
      if (!fullName && (user.name || user.fullName))
        setFullName(user.name || user.fullName || "");
      if (!email && user.email) setEmail(user.email);
      if (!phoneNumber && user.phoneNumber) setPhoneNumber(user.phoneNumber);
      if (!companyName && user.companyName) setCompanyName(user.companyName);
    }
  }, [showB2BModal, user, fullName, email, phoneNumber, companyName]);

  // Statistics
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
  const engagementRate =
    polls.length > 0
      ? ((totalVotes / (polls.length * 100)) * 100).toFixed(1)
      : "0";

  const topCategories = Object.entries(categories)
    .filter(([key]) => key !== "all")
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const trendingPolls = [...polls]
    .sort((a, b) => (b.totalVotes || 0) - (a.totalVotes || 0))
    .slice(0, 5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0)
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      technology: "from-blue-500 to-cyan-500",
      sports: "from-green-500 to-emerald-500",
      politics: "from-indigo-500 to-purple-500",
      entertainment: "from-pink-500 to-rose-500",
      business: "from-amber-500 to-yellow-500",
      education: "from-purple-500 to-violet-500",
      health: "from-teal-500 to-emerald-500",
      gaming: "from-red-500 to-orange-500",
      other: "from-gray-500 to-slate-500",
    };
    return colors[category] || "from-gray-500 to-slate-500";
  };

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

  const toggleModalCategory = (categoryName: string) => {
    setSelectedModalCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName],
    );
  };

  const selectAllCategories = () =>
    setSelectedModalCategories(dynamicCategories.map((c) => c.name));
  const clearAllCategories = () => setSelectedModalCategories([]);

  const filteredCategories = dynamicCategories.filter(
    (cat) =>
      cat.displayName
        .toLowerCase()
        .includes(categorySearchTerm.toLowerCase()) ||
      cat.name.toLowerCase().includes(categorySearchTerm.toLowerCase()),
  );

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(3);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModalCategories.length === 0) {
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
        companyName,
        purpose,
        selectedCategories: selectedModalCategories,
        selectedPlan,
        termsAgreed: true,
        complianceAgreed: true,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/b2b/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await response.json();
      if (data.success) {
        setRequestId(data.data.requestId);
        setRequestEmail(email);
        setShowB2BModal(false);
        setShowOtpModal(true);
        setResendTimer(60);
        toast.success("Request submitted! Please check your email for OTP.");
      } else {
        toast.error(data.message || "Failed to submit request");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit request");
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/b2b/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: requestEmail, otp, requestId }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("OTP verified! Redirecting to dashboard...");
        setShowOtpModal(false);
        setOtp("");
        if (data.data.accessToken) {
          localStorage.setItem("accessToken", data.data.accessToken);
          if (data.data.user)
            localStorage.setItem("user", JSON.stringify(data.data.user));
        }
        setTimeout(() => (window.location.href = "/b2b/dashboard"), 1000);
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to verify OTP");
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/b2b/resend-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: requestEmail, requestId }),
        },
      );
      const data = await response.json();
      if (data.success) {
        toast.success("New OTP sent to your email");
        setResendTimer(60);
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Polls",
      value: polls.length,
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-cyan-500",
      change: "+12%",
    },
    {
      label: "Active Polls",
      value: activePolls,
      icon: FireIcon,
      gradient: "from-green-500 to-emerald-500",
      change: "+5%",
    },
    {
      label: "Total Votes",
      value: totalVotes.toLocaleString(),
      icon: UserGroupIcon,
      gradient: "from-red-500 to-rose-500",
      change: "+23%",
    },
    {
      label: "Engagement",
      value: `${engagementRate}%`,
      icon: SignalIcon,
      gradient: "from-purple-500 to-violet-500",
      change: "+8%",
    },
  ];

  const plans = [
    {
      id: "basic",
      name: "Basic",
      price: "$99",
      priceBDT: "৳10,000",
      features: ["5 Categories", "Basic Analytics", "Email Support"],
    },
    {
      id: "standard",
      name: "Standard",
      price: "$199",
      priceBDT: "৳20,000",
      features: [
        "15 Categories",
        "Advanced Analytics",
        "Priority Support",
        "API Access",
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "$399",
      priceBDT: "৳40,000",
      features: [
        "Unlimited Categories",
        "Full Analytics",
        "24/7 Support",
        "Full API Access",
        "Custom Reports",
      ],
    },
  ];

  return (
    <>
      <aside className="space-y-6">
        {/* User Info Card */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-5 overflow-hidden border border-gray-800 shadow-xl bg-gradient-to-br from-gray-900 to-black rounded-2xl"
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                  <span className="text-lg font-bold text-white">
                    {user.name?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">
                    {user.name ||
                      user.fullName ||
                      user.email?.split("@")[0] ||
                      "User"}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  <span className="text-[10px] text-green-400">
                    {user.role === "admin"
                      ? "Administrator"
                      : user.role === "b2b_buyer"
                        ? "B2B Enterprise"
                        : "Member"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-800">
                <Link
                  href="/dashboard/profile"
                  className="flex-1 text-xs text-center text-gray-400 transition-colors hover:text-white"
                >
                  View Profile
                </Link>
                <div className="w-px h-3 bg-gray-700" />
                <Link
                  href="/dashboard/my-votes"
                  className="flex-1 text-xs text-center text-gray-400 transition-colors hover:text-white"
                >
                  My Votes
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative p-5 overflow-hidden border border-gray-800 shadow-xl bg-gradient-to-br from-gray-900 to-black rounded-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-purple-500/10 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-yellow-500" />
              <h3 className="font-bold text-white">Platform Analytics</h3>
              <span className="px-2 py-0.5 text-[10px] font-medium text-green-400 bg-green-500/20 rounded-full">
                Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  onMouseEnter={() => setHoveredStat(stat.label)}
                  onMouseLeave={() => setHoveredStat(null)}
                  className="relative p-3 transition-all duration-300 cursor-pointer rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <div
                    className={`absolute inset-0 rounded-xl bg-gradient-to-r ${stat.gradient} opacity-0 transition-opacity duration-300 ${hoveredStat === stat.label ? "opacity-10" : ""}`}
                  />
                  <div className="relative flex items-center justify-between mb-1">
                    <stat.icon className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-medium text-green-400">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[10px] text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Promo Banner */}
        <AnimatePresence>
          {promoVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative p-5 overflow-hidden shadow-2xl bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-2xl shadow-red-500/30 group"
            >
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-white/10 to-transparent group-hover:opacity-100" />
              <button
                onClick={() => setPromoVisible(false)}
                className="absolute z-10 transition-colors top-3 right-3 text-white/60 hover:text-white"
              >
                ✕
              </button>
              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-3 text-4xl"
                >
                  🎉
                </motion.div>
                <h3 className="mb-2 text-xl font-bold text-white">
                  Create Your Own Poll
                </h3>
                <p className="mb-4 text-sm text-white/80">
                  Start engaging with your audience
                </p>
                <Link
                  href="/create-poll"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-sm group"
                >
                  <span>Get Started</span>
                  <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="absolute text-8xl -bottom-6 -right-6 opacity-10">
                🗳️
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* B2B Card */}
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          transition={{ duration: 0.3 }}
          className="relative p-5 overflow-hidden border shadow-xl cursor-pointer group bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 rounded-2xl border-purple-500/30 hover:shadow-purple-500/25"
        >
          <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-r from-white/10 to-transparent group-hover:opacity-100" />
          <div className="absolute w-40 h-40 transition-opacity bg-purple-500 rounded-full -top-20 -right-20 blur-3xl opacity-20 group-hover:opacity-40" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10">
                  <BuildingOfficeIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white">Enterprise Access</h3>
              </div>
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2 py-0.5 text-[10px] font-bold text-purple-200 bg-white/20 rounded-full"
              >
                Premium
              </motion.span>
            </div>
            <p className="mb-3 text-sm text-white/80">
              Unlock advanced analytics, voting data, and insights
            </p>
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2 text-center rounded-lg bg-white/5">
                <GlobeAltIcon className="w-4 h-4 mx-auto text-purple-400" />
                <p className="text-[9px] text-white/60 mt-1">Demographics</p>
              </div>
              <div className="p-2 text-center rounded-lg bg-white/5">
                <DocumentTextIcon className="w-4 h-4 mx-auto text-purple-400" />
                <p className="text-[9px] text-white/60 mt-1">History</p>
              </div>
              <div className="p-2 text-center rounded-lg bg-white/5">
                <CurrencyDollarIcon className="w-4 h-4 mx-auto text-purple-400" />
                <p className="text-[9px] text-white/60 mt-1">Analytics</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowB2BModal(true);
                setCurrentStep(1);
              }}
              className="inline-flex items-center justify-between w-full gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-white/10 hover:bg-white/20 group"
            >
              <span>Request Access</span>
              <ChevronRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
              <FireIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-white">Popular Categories</h3>
          </div>
          <div className="space-y-3">
            {topCategories.map(([category, count], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link href={`/?category=${category}`} className="block">
                  <div className="flex items-center justify-between p-2 transition-all rounded-xl hover:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center`}
                        >
                          <span className="text-sm">
                            {getCategoryIcon(category)}
                          </span>
                        </div>
                        {hoveredCategory === category && (
                          <motion.div
                            layoutId="categoryGlow"
                            className="absolute inset-0 rounded-lg opacity-50 bg-gradient-to-r from-red-500 to-orange-500 blur-md -z-10"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white capitalize">
                          {category}
                        </p>
                        <p className="text-xs text-gray-500">{count} polls</p>
                      </div>
                    </div>
                    <motion.div
                      animate={
                        hoveredCategory === category ? { x: 5 } : { x: 0 }
                      }
                      className="text-gray-500"
                    >
                      <ChevronRightIcon className="w-4 h-4" />
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trending Polls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-5 border border-gray-800 bg-gradient-to-br from-gray-900 to-black rounded-2xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
              <ArrowTrendingUpIcon className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-white">Trending Now</h3>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ArrowPathIcon className="w-3 h-3 text-gray-500" />
            </motion.div>
          </div>
          <div className="space-y-4">
            {trendingPolls.map((poll, idx) => (
              <motion.div
                key={poll._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onMouseEnter={() => setHoveredPoll(poll._id)}
                onMouseLeave={() => setHoveredPoll(null)}
              >
                <Link href={`/polls/${poll._id}`} className="block group">
                  <div className="flex items-start gap-3 p-2 transition-all rounded-xl hover:bg-white/5">
                    <div className="relative flex-shrink-0 w-8 text-center">
                      {idx === 0 && (
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <TrophyIcon className="w-6 h-6 text-yellow-500" />
                        </motion.div>
                      )}
                      {idx === 1 && (
                        <TrophyIcon className="w-6 h-6 text-gray-400" />
                      )}
                      {idx === 2 && (
                        <TrophyIcon className="w-6 h-6 text-amber-600" />
                      )}
                      {idx > 2 && (
                        <span className="text-sm font-bold text-gray-600">
                          {idx + 1}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white transition-colors line-clamp-2 group-hover:text-red-400">
                        {poll.title}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-gray-500 capitalize">
                          {poll.category}
                        </span>
                        <div className="w-1 h-1 bg-gray-600 rounded-full" />
                        <div className="flex items-center gap-1">
                          <HeartIcon className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-400">
                            {poll.totalVotes || 0}
                          </span>
                        </div>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((poll.totalVotes / (trendingPolls[0]?.totalVotes || 1)) * 100, 100)}%`,
                        }}
                        className="h-1 mt-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/10"
                    >
                      <ShareIcon className="w-3 h-3 text-gray-400" />
                    </motion.button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ending Soon Alert */}
        {endingSoon > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 border bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl border-yellow-500/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <ClockIcon className="w-4 h-4 text-yellow-500 animate-pulse" />
              <p className="text-sm font-medium text-yellow-500">Ending Soon</p>
            </div>
            <p className="text-xs text-gray-400">
              {endingSoon} poll{endingSoon !== 1 ? "s" : ""} will end within 3
              days.
            </p>
          </motion.div>
        )}
      </aside>

      {/* B2B Request Modal */}
      <AnimatePresence>
        {showB2BModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-md"
            onClick={() => setShowB2BModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-purple-500/30 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 p-5 border-b bg-gray-900/95 backdrop-blur-sm border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                      <BuildingOfficeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Enterprise Data Access
                      </h2>
                      <p className="text-sm text-gray-400">
                        Get access to premium analytics and insights
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowB2BModal(false)}
                    className="p-1 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between max-w-md mx-auto mt-4">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${currentStep >= step ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25" : "bg-gray-800 text-gray-500"}`}
                      >
                        {step}
                      </div>
                      {step < 3 && (
                        <div
                          className={`w-16 h-0.5 mx-2 transition-all ${currentStep > step ? "bg-purple-500" : "bg-gray-700"}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between max-w-md mx-auto mt-2 text-xs">
                  <span
                    className={
                      currentStep >= 1 ? "text-purple-400" : "text-gray-500"
                    }
                  >
                    Account Info
                  </span>
                  <span
                    className={
                      currentStep >= 2 ? "text-purple-400" : "text-gray-500"
                    }
                  >
                    Select Plan
                  </span>
                  <span
                    className={
                      currentStep >= 3 ? "text-purple-400" : "text-gray-500"
                    }
                  >
                    Categories
                  </span>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmitRequest}>
                  {/* Step 1 */}
                  {currentStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Account Information
                      </h3>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
                              className={`w-full py-3 pl-10 pr-4 text-white bg-gray-800 border rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${step1Errors.fullName ? "border-red-500" : "border-gray-700"}`}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          {step1Errors.fullName && (
                            <p className="mt-1 text-xs text-red-500">
                              {step1Errors.fullName}
                            </p>
                          )}
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
                              className={`w-full py-3 pl-10 pr-4 text-white bg-gray-800 border rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${step1Errors.email ? "border-red-500" : "border-gray-700"}`}
                              placeholder="your@email.com"
                              required
                            />
                          </div>
                          {step1Errors.email && (
                            <p className="mt-1 text-xs text-red-500">
                              {step1Errors.email}
                            </p>
                          )}
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
                              className={`w-full py-3 pl-10 pr-4 text-white bg-gray-800 border rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${step1Errors.phoneNumber ? "border-red-500" : "border-gray-700"}`}
                              placeholder="+880 1234 567890"
                              required
                            />
                          </div>
                          {step1Errors.phoneNumber && (
                            <p className="mt-1 text-xs text-red-500">
                              {step1Errors.phoneNumber}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">
                            Organization/Company
                          </label>
                          <div className="relative">
                            <BuildingOfficeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full py-3 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                              placeholder="Your organization/company name"
                            />
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Purpose of Access *
                        </label>
                        <div className="relative">
                          <ClipboardDocumentListIcon className="absolute w-5 h-5 text-gray-500 left-3 top-3" />
                          <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            rows={3}
                            className={`w-full py-3 pl-10 pr-4 text-white bg-gray-800 border rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 ${step1Errors.purpose ? "border-red-500" : "border-gray-700"}`}
                            placeholder="Describe how you plan to use the data..."
                            required
                          />
                        </div>
                        {step1Errors.purpose && (
                          <p className="mt-1 text-xs text-red-500">
                            {step1Errors.purpose}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2 */}
                  {currentStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Choose Your Plan
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {plans.map((plan) => (
                          <motion.div
                            key={plan.id}
                            whileHover={{ scale: 1.02, y: -4 }}
                            onClick={() => setSelectedPlan(plan.id as any)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? "border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/25" : "border-gray-700 bg-white/5 hover:border-purple-500/50"}`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-lg font-bold text-white">
                                {plan.name}
                              </h4>
                              {selectedPlan === plan.id && (
                                <CheckCircleIcon className="w-5 h-5 text-purple-500" />
                              )}
                            </div>
                            <div className="mb-3">
                              <span className="text-2xl font-bold text-white">
                                {plan.price}
                              </span>
                              <span className="text-sm text-gray-400">
                                /month
                              </span>
                            </div>
                            <p className="mb-3 text-xs text-purple-400">
                              {plan.priceBDT}/month (BDT)
                            </p>
                            <div className="space-y-2">
                              {plan.features.map((feature, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-2 text-xs text-gray-300"
                                >
                                  <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 */}
                  {currentStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-white">
                        Select Data Categories
                      </h3>
                      <div className="relative mb-4">
                        <MagnifyingGlassIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="text"
                          placeholder="Search categories..."
                          value={categorySearchTerm}
                          onChange={(e) =>
                            setCategorySearchTerm(e.target.value)
                          }
                          className="w-full py-3 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
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
                      {loadingCategories ? (
                        <div className="py-8 text-center text-gray-400">
                          <div className="inline-block w-8 h-8 border-2 rounded-full border-purple-500/30 border-t-purple-500 animate-spin" />
                          <p className="mt-2 text-sm">Loading categories...</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3 p-1 overflow-y-auto max-h-64">
                          {filteredCategories.map((category) => (
                            <motion.label
                              key={category._id}
                              whileHover={{ scale: 1.02 }}
                              className={`flex items-center gap-3 p-3 transition-all rounded-xl cursor-pointer ${selectedModalCategories.includes(category.name) ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50" : "bg-gray-800/50 hover:bg-gray-800 border border-gray-700"}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedModalCategories.includes(
                                  category.name,
                                )}
                                onChange={() =>
                                  toggleModalCategory(category.name)
                                }
                                className="w-4 h-4 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">
                                    {category.icon || "📊"}
                                  </span>
                                  <span className="text-sm font-medium text-white">
                                    {category.displayName}
                                  </span>
                                </div>
                                {category.description && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </motion.label>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 border rounded-xl bg-purple-500/10 border-purple-500/30">
                        <span className="text-sm text-gray-300">
                          Selected Categories:
                        </span>
                        <span className="text-sm font-bold text-purple-400">
                          {selectedModalCategories.length} selected
                        </span>
                      </div>
                      <div className="p-4 space-y-3 border rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={termsAgreed}
                            onChange={(e) => setTermsAgreed(e.target.checked)}
                            className="w-4 h-4 mt-0.5 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300">
                            I agree to the{" "}
                            <span className="text-purple-400">
                              Terms & Conditions
                            </span>{" "}
                            and{" "}
                            <span className="text-purple-400">
                              Privacy Policy
                            </span>
                          </span>
                        </label>
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={complianceAgreed}
                            onChange={(e) =>
                              setComplianceAgreed(e.target.checked)
                            }
                            className="w-4 h-4 mt-0.5 text-purple-500 border-gray-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-300">
                            I agree to comply with all{" "}
                            <span className="text-purple-400">
                              data usage regulations
                            </span>
                          </span>
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3 pt-4 mt-8 border-t border-gray-800">
                    {currentStep > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={prevStep}
                        className="px-6 py-2.5 text-sm font-medium text-gray-300 transition-all rounded-xl bg-gray-800 hover:bg-gray-700"
                      >
                        Back
                      </motion.button>
                    )}
                    {currentStep < 3 ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={nextStep}
                        className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25"
                      >
                        Continue
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={
                          isLoading ||
                          selectedModalCategories.length === 0 ||
                          !termsAgreed ||
                          !complianceAgreed
                        }
                        className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                            Submitting...
                          </div>
                        ) : (
                          "Submit Request"
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md border shadow-2xl bg-gradient-to-br from-gray-900 to-black rounded-2xl border-purple-500/30"
            >
              <div className="p-6">
                <div className="mb-6 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="mb-4 text-6xl"
                  >
                    📧
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">
                    Verify Your Email
                  </h2>
                  <p className="mt-2 text-sm text-gray-400">
                    We've sent a verification code to
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
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </motion.button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0}
                      className="text-sm text-gray-400 transition-colors hover:text-purple-400 disabled:opacity-50"
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
    </>
  );
}
