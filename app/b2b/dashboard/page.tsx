// app/b2b/dashboard/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  KeyIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  CalendarIcon,
  HomeIcon,
  ShoppingBagIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  FireIcon,
  EyeIcon,
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  ClipboardIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ==================== TYPES ====================

interface Subscription {
  id?: string;
  hasSubscription: boolean;
  isActive: boolean;
  tier: string;
  price: number;
  priceBDT: number;
  startDate: string;
  endDate: string;
  remainingDays: number;
  maxCategories: number;
  autoRenew: boolean;
  paymentStatus: string;
  purchasedCategories?: string[];
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
  isVerified: boolean;
  createdAt: string;
}

interface Request {
  _id: string;
  status: string;
  selectedCategories: string[];
  createdAt: string;
}

interface ApiKey {
  _id: string;
  name: string;
  createdAt: string;
  expiresAt: string;
  lastUsed?: string;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
  trend?: string;
}

// ==================== SIDEBAR COMPONENT ====================

const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const menuItems = [
    {
      name: "Dashboard",
      icon: HomeIcon,
      href: "/b2b/dashboard",
      current: pathname === "/b2b/dashboard",
    },
    {
      name: "Data Access",
      icon: FolderOpenIcon,
      href: "/b2b/data",
      current: pathname === "/b2b/data",
    },
    {
      name: "Pricing",
      icon: ShoppingBagIcon,
      href: "/b2b/pricing",
      current: pathname === "/b2b/pricing",
    },
    {
      name: "Requests",
      icon: DocumentTextIcon,
      href: "/b2b/request",
      current: pathname === "/b2b/request",
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      href: "/b2b/settings",
      current: pathname === "/b2b/settings",
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex-shrink-0 w-64"
    >
      <div className="sticky top-20">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 mb-6 text-center border border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-900/20 to-purple-800/20"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <BuildingOfficeIcon className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-semibold text-purple-400">
              B2B Enterprise
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
            <SparklesIcon className="w-3 h-3 text-yellow-500" />
            <span>Premium Access</span>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 mb-6 text-center border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="relative w-20 h-20 mx-auto mb-3">
            <div className="absolute inset-0 rounded-full opacity-75 bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse" />
            <div className="relative w-full h-full overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-purple-600 p-0.5">
              <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-full">
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0).toUpperCase() || "B"}
                </span>
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-white">
            {user?.name || "B2B User"}
          </h3>
          <p className="text-xs text-gray-500">
            {user?.email || "b2b@example.com"}
          </p>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-2 rounded-full bg-purple-500/20 text-purple-400 text-xs">
            <BuildingOfficeIcon className="w-3 h-3" />
            B2B Account
          </div>
        </motion.div>

        <nav className="space-y-1">
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                  item.current
                    ? "bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${item.current ? "text-purple-400" : "text-gray-500 group-hover:text-white"}`}
                />
                <span className="text-sm font-medium">{item.name}</span>
                {item.current && (
                  <SparklesIcon className="w-3 h-3 ml-auto text-purple-400" />
                )}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </motion.aside>
  );
};

// ==================== STATS CARD COMPONENT ====================

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  trend,
}: StatsCardProps) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.02 }}
    className="relative p-6 overflow-hidden transition-all duration-300 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-purple-500/30 group"
  >
    <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent group-hover:opacity-100" />
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <ArrowPathIcon className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400">{trend}</span>
        </div>
      )}
    </div>
  </motion.div>
);

// ==================== HELPER FUNCTIONS ====================

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "rejected":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

const getTierLimit = (tier: string): number => {
  switch (tier.toLowerCase()) {
    case "basic":
      return 5;
    case "standard":
      return 15;
    case "premium":
      return 100;
    default:
      return 0;
  }
};

// ==================== MAIN COMPONENT ====================

export default function B2BDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [purchasedCategories, setPurchasedCategories] = useState<string[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<Request[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    apiKeysCount: 0,
    dataAccessCount: 0,
  });

  // ==================== FETCH DATA ====================

  type ApiResponse<T> = {
    data?: T;
    error?: any;
    status?: number;
  };

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileRes, subRes, requestsRes, apiKeysRes] = await Promise.all([
        api
          .get("/b2b/profile")
          .then((res) => ({ data: res.data, error: null, status: res.status })),
        api
          .get("/b2b/my-subscription")
          .then((res) => ({ data: res.data, error: null, status: res.status })),
        api
          .get("/b2b/my-requests")
          .then((res) => ({ data: res.data, error: null, status: res.status })),
        api
          .get("/b2b/api-keys")
          .then((res) => ({ data: res.data, error: null, status: res.status })),
      ]).catch((err) => ({
        profile: { data: null, error: err, status: err.response?.status },
        sub: { data: null, error: err, status: err.response?.status },
        requests: { data: null, error: err, status: err.response?.status },
        apiKeys: { data: null, error: err, status: err.response?.status },
      }));

      // Safely extract results
      const profileResult = profileRes as ApiResponse<any>;
      const subResult = subRes as ApiResponse<any>;
      const requestsResult = requestsRes as ApiResponse<any>;
      const apiKeysResult = apiKeysRes as ApiResponse<any>;

      // Check if user is not authenticated for B2B (but might be authenticated for regular)
      if (
        profileResult.status === 401 ||
        profileResult.error?.response?.status === 401
      ) {
        console.log(
          "B2B access not available - showing empty state instead of redirect",
        );
        setIsLoading(false);
        return;
      }

      if (profileResult.data?.success) setUser(profileResult.data.data.user);

      let approvedCategoriesList: string[] = [];
      let approvedReqs: Request[] = [];

      if (requestsResult.data?.success) {
        const requestsList = requestsResult.data.data.requests || [];
        setRequests(requestsList);
        approvedReqs = requestsList.filter(
          (r: Request) => r.status === "approved",
        );
        setApprovedRequests(approvedReqs);
        approvedCategoriesList = [
          ...new Set(
            approvedReqs.flatMap((r: Request) => r.selectedCategories),
          ),
        ];
        setStats((prev) => ({
          ...prev,
          totalRequests: requestsList.length,
          approvedRequests: approvedReqs.length,
          pendingRequests: requestsList.filter(
            (r: Request) => r.status === "pending",
          ).length,
          dataAccessCount: approvedReqs.length,
        }));
      }

      if (subResult.data?.success && subResult.data.data.hasSubscription) {
        const subData = subResult.data.data;
        const purchasedCats =
          subData.purchasedCategories?.length > 0
            ? subData.purchasedCategories
            : approvedCategoriesList;
        setSubscription({
          ...subData,
          maxCategories: subData.maxCategories || getTierLimit(subData.tier),
        });
        setPurchasedCategories(purchasedCats);
      }

      if (apiKeysResult.data?.success) {
        const keys = apiKeysResult.data.data.apiKeys || [];
        setApiKeys(keys);
        setStats((prev) => ({ ...prev, apiKeysCount: keys.length }));
      }
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      if (error.response?.status !== 401) {
        toast.error("Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ MERGE these two into ONE useEffect
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      console.log("=== B2B Dashboard Debug ===");
      console.log("Token exists:", !!token);
      console.log("User exists:", !!userStr);

      if (!token && !isAuthenticated) {
        router.push("/login");
        return;
      }

      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          console.log("User role:", userData.role);
          console.log("User email:", userData.email);

          if (userData.role !== "b2b_buyer" && userData.role !== "admin") {
            toast.error(
              "You don't have B2B access. Please submit a request first.",
            );
            router.push("/b2b/request");
            return;
          }
        } catch (error) {
          console.error("Error parsing user:", error);
        }
      }

      await fetchDashboardData();
    };

    checkAuthAndFetch();
  }, [isAuthenticated, router, fetchDashboardData]);
  // ==================== API KEY HANDLERS ====================

  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) {
      toast.error("Please enter an API key name");
      return;
    }
    setIsGeneratingKey(true);
    try {
      const response = await api.post("/b2b/api-keys", {
        name: newApiKeyName,
        permissions: ["read:voting_data"],
      });
      if (response.data.success) {
        setGeneratedApiKey(response.data.data.apiKey);
        toast.success("API key generated successfully!");
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to generate API key",
      );
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeApiKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Are you sure you want to revoke API key "${keyName}"?`))
      return;
    try {
      await api.delete(`/b2b/api-keys/${keyId}`);
      toast.success("API key revoked successfully");
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke API key");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("API key copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // ==================== SUBSCRIPTION HANDLERS ====================

  const handleRenewSubscription = async () => {
    try {
      const response = await api.post("/b2b/renew-subscription");
      if (response.data.success) {
        toast.success("Subscription renewed successfully!");
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to renew subscription",
      );
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You will lose access at the end of the billing period.",
      )
    )
      return;
    try {
      const response = await api.post("/b2b/cancel-subscription");
      if (response.data.success) {
        toast.success("Subscription cancelled successfully");
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription",
      );
    }
  };

  const handleToggleAutoRenew = async () => {
    try {
      const endpoint = subscription?.autoRenew
        ? "/b2b/disable-auto-renew"
        : "/b2b/enable-auto-renew";
      const response = await api.post(endpoint);
      if (response.data.success) {
        toast.success(
          subscription?.autoRenew
            ? "Auto-renew disabled"
            : "Auto-renew enabled",
        );
        fetchDashboardData();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update auto-renew settings",
      );
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const isTierComplete =
    purchasedCategories.length >= (subscription?.maxCategories || 0);
  const remainingSlots =
    (subscription?.maxCategories || 0) - purchasedCategories.length;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 lg:flex-row">
          <DashboardSidebar />

          <main className="flex-1 min-w-0">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white md:text-4xl">
                    B2B Dashboard
                  </h1>
                  <p className="text-gray-400">
                    Manage your enterprise data access and subscriptions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-xs text-purple-400 rounded-full bg-purple-500/20">
                    <SparklesIcon className="inline w-3 h-3 mr-1" />
                    {subscription?.tier || "No"} Plan
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4"
            >
              <StatsCard
                title="Total Requests"
                value={stats.totalRequests}
                icon={DocumentTextIcon}
                color="bg-blue-500/10 text-blue-400"
                trend="+12% this month"
              />
              <StatsCard
                title="Approved"
                value={stats.approvedRequests}
                icon={CheckCircleIcon}
                color="bg-green-500/10 text-green-400"
                trend="+8% vs last month"
              />
              <StatsCard
                title="Pending"
                value={stats.pendingRequests}
                icon={ClockIcon}
                color="bg-yellow-500/10 text-yellow-400"
                trend="3 awaiting review"
              />
              <StatsCard
                title="API Keys"
                value={stats.apiKeysCount}
                icon={KeyIcon}
                color="bg-purple-500/10 text-purple-400"
                subtitle="Active keys"
              />
            </motion.div>

            {/* Subscription Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Subscription Status
                </h2>
                {subscription?.hasSubscription && subscription.isActive && (
                  <button
                    onClick={() => router.push("/b2b/pricing")}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Upgrade Plan →
                  </button>
                )}
              </div>

              {subscription?.hasSubscription && subscription.isActive ? (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="relative p-6 overflow-hidden border border-green-500/30 rounded-2xl bg-gradient-to-br from-gray-900 to-black"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                        <CreditCardIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-white capitalize">
                            {subscription.tier} Plan
                          </span>
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            ● Active
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Subscription ID: {subscription.id || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {subscription.autoRenew ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 rounded-lg bg-blue-500/10">
                          <ArrowPathIcon className="w-3 h-3" />
                          Auto-renew ON
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs text-yellow-400 rounded-lg bg-yellow-500/10">
                          <ClockIcon className="w-3 h-3" />
                          Auto-renew OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-6 mb-6 md:grid-cols-4">
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="mb-1 text-xs text-gray-500">
                        Monthly Price
                      </p>
                      <p className="text-2xl font-bold text-white">
                        ${subscription.price}
                      </p>
                      <p className="text-xs text-gray-500">
                        ~৳{subscription.priceBDT} BDT
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-gray-500">Data Categories</p>
                        <p className="text-xs font-medium text-purple-400">
                          {purchasedCategories.length} /{" "}
                          {subscription.maxCategories}
                        </p>
                      </div>
                      <div className="w-full h-2 mb-2 overflow-hidden bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(purchasedCategories.length / subscription.maxCategories) * 100}%`,
                          }}
                          className={`h-full rounded-full ${isTierComplete ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
                        />
                      </div>
                      {purchasedCategories.length === 0 ? (
                        <p className="text-xs text-yellow-400">
                          No categories purchased yet. Submit a request to get
                          started.
                        </p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-500">
                            {remainingSlots} slot
                            {remainingSlots !== 1 ? "s" : ""} remaining
                          </p>
                          {!isTierComplete &&
                            purchasedCategories.length > 0 && (
                              <p className="flex items-center gap-1 mt-1 text-xs text-green-400">
                                <CheckCircleIcon className="w-3 h-3" />
                                You can add {remainingSlots} more{" "}
                                {remainingSlots === 1
                                  ? "category"
                                  : "categories"}
                              </p>
                            )}
                        </>
                      )}
                      {isTierComplete && (
                        <p className="flex items-center gap-1 mt-1 text-xs text-red-400">
                          <ShieldCheckIcon className="w-3 h-3" />
                          Limit reached. Upgrade to add more.
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="mb-1 text-xs text-gray-500">
                        Time Remaining
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">
                          {subscription.remainingDays}
                        </span>
                        <span className="text-sm text-gray-500">days</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Valid until: {formatDate(subscription.endDate)}
                      </p>
                      {subscription.remainingDays <= 7 &&
                        subscription.remainingDays > 0 && (
                          <p className="flex items-center gap-1 mt-1 text-xs text-yellow-400">
                            <ClockIcon className="w-3 h-3" />
                            Expiring soon! Renew to continue.
                          </p>
                        )}
                    </div>

                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="mb-1 text-xs text-gray-500">
                        Payment Status
                      </p>
                      <div className="flex items-center gap-2">
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400 capitalize">
                          {subscription.paymentStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Next billing: {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 mt-6 border-t border-gray-800">
                    {subscription.remainingDays <= 30 &&
                      subscription.remainingDays > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          onClick={handleRenewSubscription}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:shadow-lg"
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                          Renew Subscription
                        </motion.button>
                      )}
                    {isTierComplete && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => router.push("/b2b/pricing")}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                      >
                        <SparklesIcon className="w-4 h-4" />
                        Upgrade Plan
                      </motion.button>
                    )}
                    <button
                      onClick={handleToggleAutoRenew}
                      className="px-4 py-2 text-sm text-gray-400 rounded-lg hover:bg-white/5 hover:text-white"
                    >
                      {subscription.autoRenew
                        ? "Cancel Auto-renew"
                        : "Enable Auto-renew"}
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="px-4 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10"
                    >
                      Cancel Subscription
                    </button>
                  </div>

                  {subscription.remainingDays <= 7 &&
                    subscription.remainingDays > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 mt-4 border rounded-lg bg-yellow-500/10 border-yellow-500/30"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">
                              Your subscription will expire in{" "}
                              {subscription.remainingDays} days!
                            </span>
                          </div>
                          <button
                            onClick={handleRenewSubscription}
                            className="px-3 py-1 text-xs font-medium text-yellow-400 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30"
                          >
                            Renew Now
                          </button>
                        </div>
                      </motion.div>
                    )}
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ y: -2 }}
                  className="p-8 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black"
                >
                  <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                    <SparklesIcon className="w-10 h-10 text-purple-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-white">
                    No Active Subscription
                  </h3>
                  <p className="max-w-md mx-auto mb-6 text-gray-400">
                    Subscribe to a plan to unlock premium features, access data
                    analytics, and get API access.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <button
                      onClick={() => router.push("/b2b/pricing")}
                      className="px-6 py-2.5 text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                    >
                      View Plans
                    </button>
                    <button
                      onClick={() => router.push("/b2b/request")}
                      className="px-6 py-2.5 text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/10"
                    >
                      Request Demo
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* NEW: Approved Data Access Section */}
            {/* NEW: Approved Data Access Section */}
            {approvedRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                      <FolderOpenIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Approved Data Access
                    </h2>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                      {purchasedCategories.length} Categories
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/b2b/data")}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg transition-all group"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Access Data Portal
                  </button>
                </div>

                {/* Approved Categories Summary */}
                <div className="p-5 mb-4 border border-green-500/30 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    <h3 className="font-semibold text-white">
                      Your Data Access Summary
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs text-gray-500">
                        Approved Categories:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {purchasedCategories.map((cat, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30"
                          >
                            <CheckCircleIcon className="w-3 h-3 text-green-400" />
                            <span className="text-sm text-green-400">
                              {cat}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs text-gray-500">
                        Available Actions:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => router.push("/b2b/data")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                        >
                          <EyeIcon className="w-3 h-3" />
                          View Data
                        </button>
                        <button
                          onClick={() => router.push("/b2b/request")}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-400 rounded-lg border border-purple-500/30 hover:bg-purple-500/10"
                        >
                          <PlusIcon className="w-3 h-3" />
                          Request More Categories
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approved Requests List */}
                <div className="space-y-3">
                  <p className="mb-2 text-sm text-gray-400">
                    Approved Requests ({approvedRequests.length})
                  </p>
                  {approvedRequests.map((request, idx) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ x: 4 }}
                      className="p-4 transition-all border border-green-500/30 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-green-500/50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                              <CheckCircleIcon className="w-3 h-3" />
                              APPROVED
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <CalendarIcon className="w-3 h-3" />
                              <span>{formatDate(request.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FolderOpenIcon className="w-3 h-3" />
                              <span>
                                {request.selectedCategories.length} categories
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {request.selectedCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/30"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={() => router.push("/b2b/data")}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                        >
                          <EyeIcon className="w-4 h-4" />
                          Access Data
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recent Requests & API Keys Grid */}
            <div className="grid gap-8 mb-8 lg:grid-cols-2">
              {/* Recent Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                      <DocumentTextIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      Recent Requests
                    </h2>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400">
                      {requests.length} Total
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/b2b/request")}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-purple-400 rounded-lg hover:bg-purple-500/10 group"
                  >
                    <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    New Request
                  </button>
                </div>
                {requests.length === 0 ? (
                  <div className="p-8 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No data access requests yet</p>
                    <button
                      onClick={() => router.push("/b2b/request")}
                      className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                    >
                      Create your first request →
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {requests.slice(0, 5).map((request, idx) => (
                      <motion.div
                        key={request._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 4 }}
                        className="relative p-4 overflow-hidden transition-all border border-gray-800 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-purple-500/30 group"
                      >
                        <div className="relative flex flex-wrap items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}
                              >
                                {request.status === "approved" && (
                                  <CheckCircleIcon className="w-3 h-3" />
                                )}
                                {request.status === "pending" && (
                                  <ClockIcon className="w-3 h-3" />
                                )}
                                {request.status === "rejected" && (
                                  <XCircleIcon className="w-3 h-3" />
                                )}
                                {request.status.toUpperCase()}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <CalendarIcon className="w-3 h-3" />
                                <span>{formatDate(request.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FolderOpenIcon className="w-3 h-3" />
                                <span>
                                  {request.selectedCategories.length} categories
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {request.selectedCategories
                                .slice(0, 3)
                                .map((cat) => (
                                  <span
                                    key={cat}
                                    className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-300 border border-gray-700"
                                  >
                                    {cat}
                                  </span>
                                ))}
                              {request.selectedCategories.length > 3 && (
                                <span
                                  className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-500 cursor-help"
                                  title={request.selectedCategories
                                    .slice(3)
                                    .join(", ")}
                                >
                                  +{request.selectedCategories.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {request.status === "approved" ? (
                              subscription?.hasSubscription &&
                              subscription.isActive &&
                              !isTierComplete ? (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  onClick={() => router.push("/b2b/data")}
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                                >
                                  <EyeIcon className="w-4 h-4" />
                                  Access Data
                                </motion.button>
                              ) : (
                                <div className="flex flex-col items-end gap-2 p-2 border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                                  <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                                    <ShieldCheckIcon className="w-3 h-3" />
                                    <span>
                                      {!subscription?.hasSubscription
                                        ? "Subscription Required"
                                        : "Category Limit Reached"}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => router.push("/b2b/pricing")}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500"
                                  >
                                    <ShoppingBagIcon className="w-3 h-3" />
                                    {!subscription?.hasSubscription
                                      ? "Purchase Plan"
                                      : "Upgrade Plan"}
                                  </button>
                                </div>
                              )
                            ) : request.status === "pending" ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg">
                                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                                  <span>Under Review</span>
                                </div>
                                <span className="text-[10px] text-gray-500">
                                  Typically responds within 24h
                                </span>
                              </div>
                            ) : request.status === "rejected" ? (
                              <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-red-400 bg-red-500/10 rounded-lg">
                                  <XCircleIcon className="w-3 h-3" />
                                  <span>Request Declined</span>
                                </div>
                                <button
                                  onClick={() => router.push("/b2b/request")}
                                  className="text-[10px] text-purple-400 hover:text-purple-300"
                                >
                                  Resubmit →
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                        {request.status === "approved" &&
                          subscription?.hasSubscription && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                          )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* API Keys */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                      <KeyIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      API Keys
                    </h2>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400">
                      {apiKeys.length} Active
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setShowApiKeyModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg hover:shadow-lg group"
                  >
                    <PlusIcon className="w-4 h-4 transition-transform group-hover:rotate-90" />
                    Generate Key
                  </motion.button>
                </div>
                {apiKeys.length === 0 ? (
                  <div className="p-8 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                    <KeyIcon className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">No API keys generated yet</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Create your first API key to integrate with our API
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {apiKeys.map((key, idx) => {
                      const isExpiringSoon =
                        new Date(key.expiresAt).getTime() -
                          new Date().getTime() <
                        7 * 24 * 60 * 60 * 1000;
                      const isExpired = new Date(key.expiresAt) < new Date();
                      return (
                        <motion.div
                          key={key._id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -2 }}
                          className="relative p-4 transition-all border border-gray-800 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-purple-500/30 group"
                        >
                          <div className="absolute inset-0 transition-opacity duration-500 opacity-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-transparent group-hover:opacity-100" />
                          <div className="relative flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <KeyIcon className="w-4 h-4 text-purple-400" />
                                <p className="font-medium text-white">
                                  {key.name}
                                </p>
                                {key.lastUsed && (
                                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-green-500/20 text-green-400">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-2 mt-2 gap-x-4 gap-y-1">
                                <div className="flex items-center gap-1">
                                  <CalendarIcon className="w-3 h-3 text-gray-500" />
                                  <p className="text-xs text-gray-500">
                                    Created: {formatDate(key.createdAt)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1">
                                  <ClockIcon className="w-3 h-3 text-gray-500" />
                                  <p
                                    className={`text-xs ${isExpired ? "text-red-400" : isExpiringSoon ? "text-yellow-400" : "text-gray-500"}`}
                                  >
                                    Expires: {formatDate(key.expiresAt)}
                                    {isExpiringSoon && !isExpired && (
                                      <span className="ml-1 text-yellow-400">
                                        (Soon)
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="ml-1 text-red-400">
                                        (Expired)
                                      </span>
                                    )}
                                  </p>
                                </div>
                                {key.lastUsed && (
                                  <div className="flex items-center col-span-2 gap-1">
                                    <ArrowPathIcon className="w-3 h-3 text-gray-500" />
                                    <p className="text-xs text-gray-500">
                                      Last used: {formatDate(key.lastUsed)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  copyToClipboard(`Bearer ${key._id}`)
                                }
                                className="p-2 text-gray-400 rounded-lg hover:bg-white/5 hover:text-white"
                                title="Copy API key format"
                              >
                                <ClipboardIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRevokeApiKey(key._id, key.name)
                                }
                                className="p-2 text-red-400 rounded-lg hover:bg-red-500/10"
                                title="Revoke API key"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          {!isExpired && (
                            <div className="mt-3">
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Validity</span>
                                <span>
                                  {Math.ceil(
                                    (new Date(key.expiresAt).getTime() -
                                      new Date().getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  days left
                                </span>
                              </div>
                              <div className="w-full h-1 overflow-hidden bg-gray-800 rounded-full">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(((new Date(key.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)) * 100, 100)}%`,
                                  }}
                                  className={`h-full rounded-full ${isExpiringSoon ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-purple-500 to-pink-500"}`}
                                />
                              </div>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </main>
        </div>
      </div>

      {/* Generate API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => {
              setShowApiKeyModal(false);
              setGeneratedApiKey("");
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-purple-500/30 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <KeyIcon className="w-5 h-5 text-purple-400" />
                    <h2 className="text-xl font-bold text-white">
                      Generate API Key
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setGeneratedApiKey("");
                    }}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                {generatedApiKey ? (
                  <div>
                    <div className="p-4 mb-4 border rounded-lg bg-green-500/10 border-green-500/30">
                      <p className="mb-2 text-sm text-green-500">
                        ✓ API Key Generated Successfully!
                      </p>
                      <code className="block p-2 font-mono text-sm text-white break-all bg-gray-800 rounded-lg">
                        {generatedApiKey}
                      </code>
                      <p className="mt-2 text-xs text-red-400">
                        ⚠️ Make sure to copy this key now. You won't be able to
                        see it again!
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedApiKey)}
                      className="flex items-center justify-center w-full gap-2 py-2 mb-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                    >
                      {copied ? (
                        <CheckCircleIcon className="w-4 h-4" />
                      ) : (
                        <ClipboardIcon className="w-4 h-4" />
                      )}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </button>
                    <button
                      onClick={() => {
                        setShowApiKeyModal(false);
                        setGeneratedApiKey("");
                        setNewApiKeyName("");
                      }}
                      className="w-full py-2 text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="API Key Name (e.g., Production Server)"
                      value={newApiKeyName}
                      onChange={(e) => setNewApiKeyName(e.target.value)}
                      className="w-full px-4 py-2 mb-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={handleGenerateApiKey}
                      disabled={isGeneratingKey}
                      className="w-full py-2 font-semibold text-white rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg disabled:opacity-50"
                    >
                      {isGeneratingKey ? (
                        <div className="flex items-center justify-center gap-2">
                          <ArrowPathIcon className="w-4 h-4 animate-spin" />
                          Generating...
                        </div>
                      ) : (
                        "Generate"
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
