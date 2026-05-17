// app/b2b/data/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { restoreSession } from "@/store/slices/authSlice";
import api from "@/lib/api";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  EyeIcon,
  TrophyIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  InformationCircleIcon,
  CloudArrowDownIcon,
  BoltIcon,
} from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

interface PurchaseInfo {
  subscriptionTier: string;
  purchasedCategories: string[];
  maxCategoriesAllowed: number | string;
  remainingCategories: number | string;
  subscriptionValidUntil: string;
  remainingDays: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  location: string | { country: string; city: string; timezone: string };
  age: string;
  gender: string;
  registeredAt: string;
  isVerified: boolean;
  lastLogin: string;
}

interface Vote {
  userId: string;
  userName: string;
  userEmail: string;
  pollTitle: string;
  votedAt: string;
}

interface CategoryData {
  categoryName: string;
  totalPolls: number;
  totalVotes: number;
  uniqueVoters: number;
  polls: Array<{
    id: string;
    title: string;
  }>;
  users: User[];
  votes: Vote[];
}

export default function B2BDataPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Record<string, CategoryData>>({});
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, Record<string, boolean>>
  >({});
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);
  const [loadingExport, setLoadingExport] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "votes">(
    "overview",
  );

  useEffect(() => {
    dispatch(restoreSession());
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/b2b/data");
      console.log("API Response:", response.data);

      if (response.data.success) {
        setData(response.data.data);
        setPurchaseInfo(response.data.purchaseInfo);

        const categories = Object.keys(response.data.data);
        const initialExpanded: Record<string, boolean> = {};
        const initialSections: Record<string, Record<string, boolean>> = {};

        categories.forEach((cat) => {
          initialExpanded[cat] = false; // Default: closed
          initialSections[cat] = {
            overview: false,
            users: false,
            votes: false,
          };
        });

        setExpandedCategories(initialExpanded);
        setExpandedSections(initialSections);
      }
    } catch (error: any) {
      console.error("Failed to fetch data:", error);
      if (error.response?.status === 401) {
        dispatch(restoreSession());
        toast.error("Session expired. Please login again.");
        router.push("/b2b/login");
      } else if (error.response?.status === 403) {
        toast.error("Please purchase a subscription to access data");
        router.push("/b2b/pricing");
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatLocation = (
    location: string | { country: string; city: string; timezone: string },
  ) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    return (
      [location.city, location.country].filter(Boolean).join(", ") || "N/A"
    );
  };

  const exportCategoryData = async (
    category: string,
    format: "json" | "csv",
  ) => {
    setLoadingExport(category);
    try {
      const categoryData = data[category];
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `${category}_data_${timestamp}.${format}`;

      if (format === "csv") {
        let csv = `"Category","${category}"\n`;
        csv += `"Total Polls","${categoryData.totalPolls}"\n`;
        csv += `"Total Votes","${categoryData.totalVotes}"\n`;
        csv += `"Unique Voters","${categoryData.uniqueVoters}"\n\n`;
        csv += `"--- USERS ---"\n`;
        csv += `"Name","Email","Phone","Location","Age","Gender","Verified","Registered"\n`;
        categoryData.users.forEach((user) => {
          const locationStr = formatLocation(user.location);
          csv += `"${user.name}","${user.email}","${user.phoneNumber}","${locationStr}","${user.age}","${user.gender}","${user.isVerified ? "Yes" : "No"}","${new Date(user.registeredAt).toLocaleDateString()}"\n`;
        });
        csv += `\n"--- VOTES ---"\n`;
        csv += `"User Name","User Email","Poll Title","Voted At"\n`;
        categoryData.votes.forEach((vote) => {
          csv += `"${vote.userName}","${vote.userEmail}","${vote.pollTitle}","${new Date(vote.votedAt).toLocaleString()}"\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const exportData = {
          ...categoryData,
          users: categoryData.users.map((user) => ({
            ...user,
            location: formatLocation(user.location),
          })),
        };
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      toast.success(`${category} data exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${category} data`);
    } finally {
      setLoadingExport(null);
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const fileName = `all_purchased_data_${timestamp}.${exportFormat}`;

      if (exportFormat === "csv") {
        let csv = `"--- PURCHASED CATEGORIES SUMMARY ---"\n`;
        csv += `"Category","Total Polls","Total Votes","Unique Voters"\n`;
        for (const [category, categoryData] of Object.entries(data)) {
          csv += `"${category}",${categoryData.totalPolls},${categoryData.totalVotes},${categoryData.uniqueVoters}\n`;
        }
        csv += `\n\n`;
        for (const [category, categoryData] of Object.entries(data)) {
          csv += `"========== ${category.toUpperCase()} DATA =========="\n\n`;
          csv += `"--- USERS ---"\n`;
          csv += `"Name","Email","Phone","Location","Age","Gender","Verified","Registered"\n`;
          categoryData.users.forEach((user) => {
            const locationStr = formatLocation(user.location);
            csv += `"${user.name}","${user.email}","${user.phoneNumber}","${locationStr}","${user.age}","${user.gender}","${user.isVerified ? "Yes" : "No"}","${new Date(user.registeredAt).toLocaleDateString()}"\n`;
          });
          csv += `\n"--- VOTES ---"\n`;
          csv += `"User Name","User Email","Poll Title","Voted At"\n`;
          categoryData.votes.forEach((vote) => {
            csv += `"${vote.userName}","${vote.userEmail}","${vote.pollTitle}","${new Date(vote.votedAt).toLocaleString()}"\n`;
          });
          csv += `\n\n`;
        }
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const exportData: Record<string, any> = {};
        for (const [category, categoryData] of Object.entries(data)) {
          exportData[category] = {
            ...categoryData,
            users: categoryData.users.map((user) => ({
              ...user,
              location: formatLocation(user.location),
            })),
          };
        }
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      toast.success(`All data exported as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const toggleSection = (category: string, section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [category]: { ...prev[category], [section]: !prev[category]?.[section] },
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  const purchasedCategories = purchaseInfo?.purchasedCategories || [];
  const hasPurchasedData = Object.keys(data).length > 0;

  const filteredCategories = Object.entries(data).filter(([category]) =>
    category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalStats = Object.values(data).reduce(
    (acc, cat) => ({
      totalPolls: acc.totalPolls + cat.totalPolls,
      totalVotes: acc.totalVotes + cat.totalVotes,
      totalUsers: acc.totalUsers + cat.users.length,
      totalUniqueVoters: acc.totalUniqueVoters + cat.uniqueVoters,
    }),
    { totalPolls: 0, totalVotes: 0, totalUsers: 0, totalUniqueVoters: 0 },
  );

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-white md:text-4xl">
                Data Access Portal
              </h1>
              <p className="mt-2 text-gray-400">
                Access and export your purchased data categories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs text-purple-400 rounded-full bg-purple-500/20">
                <SparklesIcon className="inline w-3 h-3 mr-1" />
                {purchaseInfo?.subscriptionTier || "No"} Plan
              </span>
            </div>
          </div>
        </motion.div>
        {/* Stats Overview */}
        {hasPurchasedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4"
          >
            <div className="p-4 text-center transition-all border border-gray-800 rounded-xl bg-white/5 hover:border-purple-500/30 hover:bg-white/10">
              <GlobeAltIcon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-bold text-white">
                {filteredCategories.length}
              </p>
              <p className="text-xs text-gray-500">Categories</p>
            </div>
            <div className="p-4 text-center transition-all border border-gray-800 rounded-xl bg-white/5 hover:border-purple-500/30 hover:bg-white/10">
              <ChartBarIcon className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-white">
                {totalStats.totalPolls}
              </p>
              <p className="text-xs text-gray-500">Total Polls</p>
            </div>
            <div className="p-4 text-center transition-all border border-gray-800 rounded-xl bg-white/5 hover:border-purple-500/30 hover:bg-white/10">
              <UserGroupIcon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">
                {totalStats.totalVotes.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Votes</p>
            </div>
            <div className="p-4 text-center transition-all border border-gray-800 rounded-xl bg-white/5 hover:border-purple-500/30 hover:bg-white/10">
              <UsersIcon className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
              <p className="text-2xl font-bold text-white">
                {totalStats.totalUniqueVoters.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Unique Voters</p>
            </div>
          </motion.div>
        )}

        {/* Purchase Info Card */}
        {purchaseInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 mb-8 border border-purple-500/30 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-800/20"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                  <ServerIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Subscription Details
                  </h3>
                  <p className="text-sm text-gray-400">
                    Plan:{" "}
                    <span className="font-semibold text-purple-400 capitalize">
                      {purchaseInfo.subscriptionTier}
                    </span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Valid until:{" "}
                    {formatDate(purchaseInfo.subscriptionValidUntil)} (
                    {purchaseInfo.remainingDays} days remaining)
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 text-center rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-purple-400">
                    {purchasedCategories.length}
                  </p>
                  <p className="text-xs text-gray-500">Categories Purchased</p>
                </div>
                <div className="px-4 py-2 text-center rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-yellow-400">
                    {purchaseInfo.remainingCategories}
                  </p>
                  <p className="text-xs text-gray-500">Remaining Slots</p>
                </div>
              </div>
            </div>

            {purchasedCategories.length > 0 && (
              <div className="pt-4 mt-4 border-t border-purple-500/30">
                <p className="mb-2 text-sm text-gray-400">
                  Your Purchased Categories:
                </p>
                <div className="flex flex-wrap gap-2">
                  {purchasedCategories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 text-xs font-medium text-purple-400 capitalize rounded-full bg-purple-500/20"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
        <div className="my-6">
          <h1 className="text-2xl font-bold text-white">Data Categories</h1>
        </div>
        {/* Search and Export Controls */}
        {hasPurchasedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-4 p-4 mb-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black md:flex-row md:items-center md:justify-between"
          >
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute w-4 h-4 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-white bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Export format:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportFormat("json")}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      exportFormat === "json"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => setExportFormat("csv")}
                    className={`px-3 py-1 text-sm rounded-lg transition-all ${
                      exportFormat === "csv"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    CSV
                  </button>
                </div>
              </div>
              <button
                onClick={exportAllData}
                disabled={isExporting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
              >
                <CloudArrowDownIcon className="w-4 h-4" />
                {isExporting
                  ? "Exporting..."
                  : `Export All (${Object.keys(data).length} categories)`}
              </button>
            </div>
          </motion.div>
        )}

        {/* No Data Message */}
        {!hasPurchasedData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black"
          >
            <div className="mb-4 text-6xl">📊</div>
            <h2 className="text-xl font-semibold text-white">No Data Access</h2>
            <p className="mt-2 text-gray-400">
              You haven't purchased any data categories yet.
            </p>
            <button
              onClick={() => router.push("/b2b/pricing")}
              className="inline-flex items-center gap-2 px-6 py-2 mt-4 text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Purchase Data Access
            </button>
          </motion.div>
        )}
        {/* 3-Column Grid Data Categories */}
        {hasPurchasedData && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map(([category, categoryData], idx) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col overflow-hidden transition-all duration-300 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5"
              >
                {/* Category Header */}
                <div
                  className="p-4 transition-colors cursor-pointer hover:bg-white/5"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                        <TrophyIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white capitalize line-clamp-1">
                          {category}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {categoryData.totalPolls} polls •{" "}
                          {categoryData.totalVotes} votes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex-shrink-0 px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
                        Active
                      </span>
                      {expandedCategories[category] ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 p-3 border-t border-b border-gray-800">
                  <div className="text-center">
                    <p className="text-lg font-bold text-white">
                      {categoryData.totalPolls}
                    </p>
                    <p className="text-[10px] text-gray-500">Total Polls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-400">
                      {categoryData.totalVotes}
                    </p>
                    <p className="text-[10px] text-gray-500">Total Votes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-400">
                      {categoryData.uniqueVoters}
                    </p>
                    <p className="text-[10px] text-gray-500">Unique Voters</p>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex gap-2 p-3">
                  <button
                    onClick={() => exportCategoryData(category, "json")}
                    disabled={loadingExport === category}
                    className="flex-1 px-2 py-1.5 text-xs text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingExport === category ? "..." : "📄 JSON"}
                  </button>
                  <button
                    onClick={() => exportCategoryData(category, "csv")}
                    disabled={loadingExport === category}
                    className="flex-1 px-2 py-1.5 text-xs text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    {loadingExport === category ? "..." : "📊 CSV"}
                  </button>
                </div>

                {/* Expanded Content - Closed by Default */}
                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-gray-800"
                    >
                      <div className="p-3 space-y-3 bg-gray-900/50">
                        {/* Users Section */}
                        {categoryData.users.length > 0 && (
                          <div>
                            <button
                              onClick={() => toggleSection(category, "users")}
                              className="flex items-center justify-between w-full p-2 transition-colors rounded-lg hover:bg-white/5"
                            >
                              <div className="flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-medium text-white">
                                  Users ({categoryData.users.length})
                                </span>
                              </div>
                              {expandedSections[category]?.users ? (
                                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedSections[category]?.users && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-2"
                                >
                                  {categoryData.users
                                    .slice(0, 10)
                                    .map((user) => (
                                      <div
                                        key={user.id}
                                        className="p-2 text-xs rounded-lg bg-white/5"
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="font-medium text-white">
                                            {user.name}
                                          </span>
                                          {user.isVerified ? (
                                            <CheckCircleIcon className="w-3 h-3 text-green-500" />
                                          ) : (
                                            <XCircleIcon className="w-3 h-3 text-red-500" />
                                          )}
                                        </div>
                                        <p className="text-gray-500">
                                          {user.email}
                                        </p>
                                        <p className="text-gray-500">
                                          {formatLocation(user.location)}
                                        </p>
                                      </div>
                                    ))}
                                  {categoryData.users.length > 10 && (
                                    <p className="text-xs text-center text-gray-500">
                                      Showing 10 of {categoryData.users.length}{" "}
                                      users
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Votes Section */}
                        {categoryData.votes.length > 0 && (
                          <div>
                            <button
                              onClick={() => toggleSection(category, "votes")}
                              className="flex items-center justify-between w-full p-2 transition-colors rounded-lg hover:bg-white/5"
                            >
                              <div className="flex items-center gap-2">
                                <ChartBarIcon className="w-4 h-4 text-green-400" />
                                <span className="text-sm font-medium text-white">
                                  Recent Votes ({categoryData.votes.length})
                                </span>
                              </div>
                              {expandedSections[category]?.votes ? (
                                <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            <AnimatePresence>
                              {expandedSections[category]?.votes && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-2 space-y-2"
                                >
                                  {categoryData.votes
                                    .slice(0, 10)
                                    .map((vote, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 text-xs rounded-lg bg-white/5"
                                      >
                                        <p className="font-medium text-white">
                                          {vote.pollTitle}
                                        </p>
                                        <p className="text-gray-500">
                                          by {vote.userName}
                                        </p>
                                        <p className="text-gray-500">
                                          {formatDateTime(vote.votedAt)}
                                        </p>
                                      </div>
                                    ))}
                                  {categoryData.votes.length > 10 && (
                                    <p className="text-xs text-center text-gray-500">
                                      Showing 10 of {categoryData.votes.length}{" "}
                                      votes
                                    </p>
                                  )}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* Quick Stats Widget */}
                        <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10">
                          <div className="flex items-center gap-2 mb-2">
                            <BoltIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs font-medium text-white">
                              Quick Insights
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">
                                Avg Votes/Poll:
                              </span>
                              <p className="font-medium text-white">
                                {(
                                  categoryData.totalVotes /
                                  categoryData.totalPolls
                                ).toFixed(1)}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">
                                Participation Rate:
                              </span>
                              <p className="font-medium text-white">
                                {(
                                  (categoryData.uniqueVoters /
                                    categoryData.totalVotes) *
                                  100
                                ).toFixed(1)}
                                %
                              </p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-gray-500">Top Poll:</span>
                              <p className="text-white truncate">
                                {categoryData.polls.sort((a, b) =>
                                  b.id.localeCompare(a.id),
                                )[0]?.title || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Info */}
        {hasPurchasedData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 mt-8 text-center border rounded-lg bg-blue-500/10 border-blue-500/30"
          >
            <div className="flex items-center justify-center gap-2 text-sm text-blue-400">
              <InformationCircleIcon className="w-5 h-5" />
              <span>
                Data is updated in real-time. Export your data in JSON or CSV
                format for analysis.
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
