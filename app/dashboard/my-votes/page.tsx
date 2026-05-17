// app/my-votes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
  TagIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

interface Vote {
  id: string;
  voteReceipt: string;
  votedAt: string;
  poll: {
    id: string;
    title: string;
    category: string;
    endDate: string;
    isActive: boolean;
  };
  candidate: {
    id: string;
    name: string;
  };
}

export default function MyVotesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVotes, setTotalVotes] = useState(0);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchVotes();
  }, [isAuthenticated, router, page]);

  const fetchVotes = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/votes/my-votes", {
        params: { page, limit: 10 },
      });

      if (response.data.success) {
        setVotes(response.data.data.votes || []);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalVotes(response.data.total || 0);
      }
    } catch (error: any) {
      console.error("Failed to fetch votes:", error);
      toast.error(error.response?.data?.message || "Failed to load votes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReceipt = async (voteId: string) => {
    try {
      const response = await api.get(`/votes/receipt/${voteId}`);
      if (response.data.success) {
        setSelectedVote(response.data.data.receipt);
        setShowReceiptModal(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load receipt");
    }
  };

  const copyReceiptId = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Receipt ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30"
      : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/30";
  };

  const stats = [
    {
      label: "Total Votes Cast",
      value: totalVotes,
      icon: CheckCircleIcon,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-500/10 to-emerald-500/10",
    },
    {
      label: "Active Polls Voted",
      value: votes.filter((v) => v.poll?.isActive).length,
      icon: ClockIcon,
      gradient: "from-yellow-500 to-amber-500",
      bgGradient: "from-yellow-500/10 to-amber-500/10",
    },
    {
      label: "Completed Polls",
      value: votes.filter((v) => !v.poll?.isActive).length,
      icon: ChartBarIcon,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/10 to-cyan-500/10",
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              My Voting History
            </h1>
          </div>
          <p className="text-gray-400">
            Track all your votes and view your voting receipts
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid gap-4 mb-10 md:grid-cols-3"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`relative overflow-hidden p-5 rounded-2xl border border-gray-800 bg-gradient-to-br ${stat.bgGradient} from-gray-900 to-black backdrop-blur-sm`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient}`}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div
                className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-r ${stat.gradient} opacity-10 blur-2xl`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Votes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : votes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-16 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-4 text-7xl"
            >
              🗳️
            </motion.div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              No Votes Yet
            </h3>
            <p className="mb-4 text-gray-400">
              You haven't participated in any polls yet
            </p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 transform duration-200"
            >
              Browse Active Polls
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {votes.map((vote, idx) => (
                  <motion.div
                    key={vote.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                    className="relative p-5 overflow-hidden transition-all border border-gray-800 group rounded-2xl bg-gradient-to-r from-gray-900 to-black hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5"
                  >
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl group-hover:opacity-100">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/5 to-red-600/5" />
                    </div>

                    <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      {/* Left Section - Poll Info */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span
                            className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(vote.poll?.isActive)}`}
                          >
                            {vote.poll?.isActive ? (
                              <span className="flex items-center gap-1">
                                <SparklesIcon className="w-3 h-3" />
                                Active
                              </span>
                            ) : (
                              "Ended"
                            )}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium text-gray-300 bg-gray-800 rounded-full border border-gray-700">
                            {vote.poll?.category}
                          </span>
                          <span className="px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 rounded-full border border-purple-500/20">
                            Verified Vote
                          </span>
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-red-400 line-clamp-1">
                          {vote.poll?.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="font-medium">
                              Voted: {vote.candidate?.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(vote.votedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <QrCodeIcon className="w-4 h-4" />
                            <span className="font-mono text-xs">
                              Receipt: {vote.voteReceipt?.slice(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewReceipt(vote.id)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all bg-gray-800 rounded-xl hover:bg-gray-700 hover:text-white group/btn"
                        >
                          <DocumentTextIcon className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
                          Receipt
                        </motion.button>
                        {vote.poll?.isActive && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              router.push(`/polls/${vote.poll?.id}`)
                            }
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 group/btn"
                          >
                            <span>View Poll</span>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </motion.button>
                        )}
                      </div>
                    </div>

                    {/* Progress bar for visual effect */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </motion.button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                          page === pageNum
                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-400 transition-all rounded-lg hover:bg-gray-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && selectedVote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowReceiptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg overflow-hidden border shadow-2xl bg-gradient-to-br from-gray-900 to-black border-green-500/30 rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative p-6 border-b border-green-500/20 bg-gradient-to-r from-green-500/10 to-transparent">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-green-500/10 blur-2xl" />
                <div className="flex items-center justify-between">
                  <div className="z-10 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                      <DocumentTextIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Vote Receipt
                      </h2>
                      <p className="text-sm text-gray-400">
                        Proof of your participation
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className="z-20 text-gray-400 transition-colors cursor-pointer hover:text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Receipt ID with Copy */}
                {/* <div className="p-4 border border-gray-700 rounded-xl bg-gradient-to-r from-gray-800/50 to-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Receipt ID
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copyReceiptId(selectedVote.voteReceipt)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 transition-colors rounded-lg hover:bg-gray-700"
                    >
                      {copied ? (
                        <CheckCircleIcon className="w-3 h-3 text-green-400" />
                      ) : (
                        <DocumentDuplicateIcon className="w-3 h-3" />
                      )}
                      {copied ? "Copied!" : "Copy"}
                    </motion.button>
                  </div>
                  <p className="font-mono text-sm text-white break-all">
                    {selectedVote.voteReceipt}
                  </p>
                </div> */}

                {/* Poll Info */}
                <div className="p-4 border border-gray-700 rounded-xl bg-gray-800/30">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Poll Details
                  </p>
                  <p className="font-semibold text-white">
                    {selectedVote.poll?.title}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <TagIcon className="w-3 h-3 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      {selectedVote.poll?.category}
                    </span>
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedVote.poll?.isActive)}`}
                    >
                      {selectedVote.poll?.isActive ? "Active" : "Ended"}
                    </span>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="p-4 border rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-green-400 uppercase">
                    Your Vote
                  </p>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                    <span className="text-lg font-semibold text-white">
                      {selectedVote.candidate?.name}
                    </span>
                  </div>
                </div>

                {/* Vote Date */}
                <div className="p-4 border border-gray-700 rounded-xl bg-gray-800/30">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Vote Date
                  </p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-white">
                      {formatDate(selectedVote.votedAt)}
                    </span>
                  </div>
                </div>

                {/* Voter Info */}
                <div className="p-4 border border-gray-700 rounded-xl bg-gray-800/30">
                  <p className="mb-2 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Voter Information
                  </p>
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ShieldCheckIcon className="w-3 h-3 text-green-400" />
                    <span className="text-xs text-green-400">
                      Verified Voter
                    </span>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="flex items-center justify-center gap-2 p-3 border rounded-xl bg-green-500/5 border-green-500/20">
                  <ShieldCheckIcon className="w-4 h-4 text-green-400" />
                  <p className="text-xs text-green-400">
                    This is an official voting receipt. Keep it for your
                    records.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 pt-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-300 transition-all rounded-xl bg-gray-800 hover:bg-gray-700"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => copyReceiptId(selectedVote.voteReceipt)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25"
                >
                  {copied ? "Copied!" : "Copy Receipt"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
