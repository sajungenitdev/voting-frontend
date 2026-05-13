// app/b2b/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  KeyIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  CreditCardIcon,
  CalendarIcon,
  HomeIcon,
  ShoppingBagIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserGroupIcon,
  SparklesIcon,
  TrophyIcon,
  FireIcon,
} from "@heroicons/react/24/solid";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Subscription {
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

// Sidebar Component
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <aside className="flex-shrink-0 w-64">
      <div className="sticky top-20">
        {/* B2B Badge */}
        <div className="p-4 mb-6 text-center border border-purple-500/30 rounded-xl bg-gradient-to-br from-purple-900/20 to-purple-800/20">
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
        </div>

        {/* User Profile */}
        <div className="p-4 mb-6 text-center border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
          <div className="w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full bg-gradient-to-r from-purple-500 to-purple-600 p-0.5">
            <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-full">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "B"}
              </span>
            </div>
          </div>
          <h3 className="font-semibold text-white">
            {user?.name || "B2B User"}
          </h3>
          <p className="text-xs text-gray-500">
            {user?.email || "b2b@example.com"}
          </p>
          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs">
            <BuildingOfficeIcon className="w-3 h-3" />
            B2B Account
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
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
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
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
    </aside>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="p-6 transition-all duration-300 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-purple-500/30">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-2xl font-bold text-white">{value}</span>
    </div>
    <p className="text-sm text-gray-400">{title}</p>
    {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
  </div>
);

export default function B2BDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user: authUser } = useAppSelector(
    (state) => state.auth,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
    apiKeysCount: 0,
    dataAccessCount: 0,
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [generatedApiKey, setGeneratedApiKey] = useState("");
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token && !isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchDashboardData();
  }, [isAuthenticated, router]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch user profile
      const profileRes = await api.get("/b2b/profile");
      if (profileRes.data.success) {
        setUser(profileRes.data.data.user);
      }

      // Fetch subscription
      const subRes = await api.get("/b2b/my-subscription");
      if (subRes.data.success && subRes.data.data.hasSubscription) {
        setSubscription(subRes.data.data);
      }

      // Fetch requests
      const requestsRes = await api.get("/b2b/my-requests");
      if (requestsRes.data.success) {
        const requestsList = requestsRes.data.data.requests || [];
        setRequests(requestsList);
        setStats({
          totalRequests: requestsList.length,
          approvedRequests: requestsList.filter(
            (r: any) => r.status === "approved",
          ).length,
          pendingRequests: requestsList.filter(
            (r: any) => r.status === "pending",
          ).length,
          apiKeysCount: 0,
          dataAccessCount: requestsList.filter(
            (r: any) => r.status === "approved",
          ).length,
        });
      }

      // Fetch API keys
      const apiKeysRes = await api.get("/b2b/api-keys");
      if (apiKeysRes.data.success) {
        setApiKeys(apiKeysRes.data.data.apiKeys || []);
        setStats((prev) => ({
          ...prev,
          apiKeysCount: apiKeysRes.data.data.apiKeys?.length || 0,
        }));
      }

      // Mock recent activity
      setRecentActivity([
        {
          id: 1,
          action: "Data request approved",
          time: "2 hours ago",
          status: "success",
        },
        {
          id: 2,
          action: "API key generated",
          time: "1 day ago",
          status: "success",
        },
        {
          id: 3,
          action: "Subscription renewed",
          time: "3 days ago",
          status: "info",
        },
      ]);
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("accessToken");
        router.push("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleRevokeApiKey = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      await api.delete(`/b2b/api-keys/${keyId}`);
      toast.success("API key revoked successfully");
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to revoke API key");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen py-20 bg-black">
      <div className="container px-4 mx-auto">
        <div className="flex gap-8">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">B2B Dashboard</h1>
              <p className="text-gray-400">
                Manage your enterprise data access and subscriptions
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
              <StatsCard
                title="Total Requests"
                value={stats.totalRequests}
                icon={DocumentTextIcon}
                color="bg-blue-500/10 text-blue-400"
              />
              <StatsCard
                title="Approved Requests"
                value={stats.approvedRequests}
                icon={CheckCircleIcon}
                color="bg-green-500/10 text-green-400"
              />
              <StatsCard
                title="Pending Requests"
                value={stats.pendingRequests}
                icon={ClockIcon}
                color="bg-yellow-500/10 text-yellow-400"
              />
              <StatsCard
                title="API Keys"
                value={stats.apiKeysCount}
                icon={KeyIcon}
                color="bg-purple-500/10 text-purple-400"
              />
              <StatsCard
                title="Data Access"
                value={stats.dataAccessCount}
                icon={FolderOpenIcon}
                color="bg-cyan-500/10 text-cyan-400"
              />
              <StatsCard
                title="Subscription"
                value={
                  subscription?.hasSubscription ? subscription.tier : "None"
                }
                icon={CreditCardIcon}
                color="bg-orange-500/10 text-orange-400"
                subtitle={
                  subscription?.hasSubscription
                    ? `${subscription.remainingDays} days left`
                    : "No active plan"
                }
              />
            </div>

            {/* Subscription Section */}
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Subscription Status
              </h2>
              {subscription?.hasSubscription && subscription.isActive ? (
                <div className="p-6 border border-green-500/30 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <CreditCardIcon className="w-6 h-6 text-green-500" />
                      <span className="text-lg font-semibold text-white capitalize">
                        {subscription.tier} Plan
                      </span>
                    </div>
                    <span className="px-2 py-1 text-xs text-green-400 rounded-full bg-green-500/20">
                      Active
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="text-lg font-bold text-white">
                        ${subscription.price} / month
                      </p>
                      <p className="text-xs text-gray-500">
                        ~৳{subscription.priceBDT} BDT
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Valid Until</p>
                      <p className="text-lg font-bold text-white">
                        {formatDate(subscription.endDate)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {subscription.remainingDays} days remaining
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Data Categories</p>
                      <p className="text-lg font-bold text-white">
                        Up to {subscription.maxCategories}
                      </p>
                      <p className="text-xs text-gray-500">
                        Auto-renew: {subscription.autoRenew ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                  <p className="mb-4 text-gray-400">No active subscription</p>
                  <button
                    onClick={() => router.push("/b2b/pricing")}
                    className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
                  >
                    Purchase a Plan
                  </button>
                </div>
              )}
            </div>

            {/* Data Access Requests */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Recent Requests
                </h2>
                <button
                  onClick={() => router.push("/b2b/request")}
                  className="text-sm text-purple-400 hover:text-purple-300"
                >
                  + New Request
                </button>
              </div>

              {requests.length === 0 ? (
                <div className="p-6 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                  <p className="text-gray-400">No data access requests yet</p>
                  <button
                    onClick={() => router.push("/b2b/request")}
                    className="mt-4 text-sm text-purple-400 hover:text-purple-300"
                  >
                    Create your first request →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request._id}
                      className="p-4 border border-gray-800 rounded-xl bg-gradient-to-r from-gray-900 to-black"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full ${
                                request.status === "approved"
                                  ? "bg-green-500/20 text-green-400"
                                  : request.status === "pending"
                                    ? "bg-yellow-500/20 text-yellow-400"
                                    : "bg-red-500/20 text-red-400"
                              }`}
                            >
                              {request.status.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(request.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {request.selectedCategories.map((cat) => (
                              <span
                                key={cat}
                                className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                        {request.status === "approved" &&
                          subscription?.hasSubscription && (
                            <button
                              onClick={() => router.push("/b2b/data")}
                              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                            >
                              Access Data
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* API Keys Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">API Keys</h2>
                <button
                  onClick={() => setShowApiKeyModal(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                >
                  Generate API Key
                </button>
              </div>

              {apiKeys.length === 0 ? (
                <div className="p-6 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                  <p className="text-gray-400">No API keys generated yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key) => (
                    <div
                      key={key._id}
                      className="flex items-center justify-between p-4 border border-gray-800 rounded-xl bg-gradient-to-r from-gray-900 to-black"
                    >
                      <div>
                        <p className="font-medium text-white">{key.name}</p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(key.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires: {formatDate(key.expiresAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevokeApiKey(key._id)}
                        className="px-3 py-1 text-sm text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity Card - Right Side */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
              <div className="flex items-center gap-2 mb-4">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <h3 className="font-semibold text-white">Recent Activity</h3>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-3 text-sm"
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.status === "success"
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    />
                    <span className="flex-1 text-gray-300">
                      {activity.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Generate API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-purple-500/30 rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  Generate API Key
                </h2>
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
                      API Key Generated Successfully!
                    </p>
                    <code className="block p-2 font-mono text-sm text-white break-all bg-gray-800 rounded-lg">
                      {generatedApiKey}
                    </code>
                    <p className="mt-2 text-xs text-gray-400">
                      Make sure to copy this key now. You won't be able to see
                      it again!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedApiKey);
                      toast.success("API key copied to clipboard!");
                    }}
                    className="w-full py-2 mb-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                  >
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={() => {
                      setShowApiKeyModal(false);
                      setGeneratedApiKey("");
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
                    {isGeneratingKey ? "Generating..." : "Generate"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
