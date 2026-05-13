// app/my-votes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import api from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="max-w-6xl px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Votes</h1>
          <p className="text-gray-400">
            Track your voting history and view receipts
          </p>
        </div>

        {/* Stats Summary */}
        <div className="grid gap-4 mb-8 md:grid-cols-3">
          <div className="p-4 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Votes Cast</p>
                <p className="text-2xl font-bold text-white">{totalVotes}</p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Polls Voted</p>
                <p className="text-2xl font-bold text-white">
                  {votes.filter((v) => v.poll?.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <ClockIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completed Polls</p>
                <p className="text-2xl font-bold text-white">
                  {votes.filter((v) => !v.poll?.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-gray-500/10">
                <ChartBarIcon className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Votes List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : votes.length === 0 ? (
          <div className="py-12 text-center border border-gray-800 rounded-xl bg-gray-900/30">
            <div className="mb-4 text-6xl">🗳️</div>
            <p className="text-gray-400">You haven't voted in any polls yet</p>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 mt-4 text-sm font-medium text-white transition-all bg-red-500 rounded-lg hover:bg-red-600"
            >
              Browse Polls
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {votes.map((vote) => (
                <div
                  key={vote.id}
                  className="p-5 transition-all border border-gray-800 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-green-500/30"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Poll Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            vote.poll?.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {vote.poll?.isActive ? "Active" : "Ended"}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-800 text-gray-400">
                          {vote.poll?.category}
                        </span>
                      </div>

                      <h3 className="mb-1 text-lg font-semibold text-white">
                        {vote.poll?.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Voted for: {vote.candidate?.name}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(vote.votedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleViewReceipt(vote.id)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 transition-all bg-gray-800 rounded-lg hover:bg-gray-700"
                      >
                        <DocumentTextIcon className="w-4 h-4" />
                        Receipt
                      </button>
                      {vote.poll?.isActive && (
                        <button
                          onClick={() => router.push(`/polls/${vote.poll?.id}`)}
                          className="px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
                        >
                          View Poll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1">
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
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                          page === pageNum
                            ? "bg-red-500 text-white"
                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 text-gray-400 transition-colors rounded-lg hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Receipt Modal */}
      {showReceiptModal && selectedVote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg border shadow-2xl bg-gradient-to-b from-gray-900 to-black border-green-500/30 rounded-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-bold text-white">Vote Receipt</h2>
                </div>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="text-gray-400 transition-colors hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Receipt ID */}
                {/* <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Receipt ID</p>
                  <p className="font-mono text-sm text-white">
                    {selectedVote.voteReceipt}
                  </p>
                </div> */}

                {/* Poll Info */}
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Poll</p>
                  <p className="font-semibold text-white">
                    {selectedVote.poll?.title}
                  </p>
                  <p className="text-sm text-gray-400">
                    {selectedVote.poll?.category}
                  </p>
                </div>

                {/* Candidate Info */}
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Voted For</p>
                  <p className="font-semibold text-green-500">
                    {selectedVote.candidate?.name}
                  </p>
                </div>

                {/* Vote Date */}
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Vote Date</p>
                  <p className="text-sm text-white">
                    {formatDate(selectedVote.votedAt)}
                  </p>
                </div>

                {/* Voter Info */}
                <div className="p-3 rounded-lg bg-gray-800/50">
                  <p className="text-xs text-gray-500">Voter</p>
                  <p className="text-sm text-white">{user?.name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-300 transition-all bg-gray-800 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedVote.voteReceipt);
                    toast.success("Receipt ID copied!");
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
                >
                  Copy Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
