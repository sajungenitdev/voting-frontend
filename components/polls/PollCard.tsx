"use client";

import { useState, useEffect, useRef, useCallback, memo } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  TrophyIcon,
  EyeIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  PresentationChartLineIcon,
} from "@heroicons/react/24/solid";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoginModal from "@/components/ui/LoginModal";
import toast from "react-hot-toast";
import {
  castVote,
  fetchPolls,
  updatePollLocally,
} from "@/store/slices/pollSlice";

// Types
interface Candidate {
  _id: string;
  name: string;
  description?: string;
  voteCount: number;
}

interface Poll {
  _id: string;
  title: string;
  description: string;
  category: string;
  candidates: Candidate[];
  endDate: string;
  isPublished: boolean;
  totalVotes: number;
  userVoted?: boolean;
  userVoteCandidateId?: string | null;
  createdAt?: string;
}

interface PollCardProps {
  poll: Poll;
  onVoteSuccess?: () => void;
  viewMode?: "grid" | "list";
}

// Analytics Modal Component
const AnalyticsModal = memo(
  ({
    poll,
    totalVotes,
    candidateCount,
    maxPercentage,
    timeLeft,
    onClose,
  }: {
    poll: Poll;
    totalVotes: number;
    candidateCount: number;
    maxPercentage: string;
    timeLeft: string;
    onClose: () => void;
  }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          modalRef.current &&
          !modalRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "auto";
      };
    }, [onClose]);

    // Calculate statistics
    const sortedCandidates = [...poll.candidates].sort(
      (a, b) => b.voteCount - a.voteCount,
    );
    const winner = sortedCandidates[0];
    const runnerUp = sortedCandidates[1];

    const getVotePercentage = (voteCount: number) => {
      if (totalVotes === 0) return 0;
      return (voteCount / totalVotes) * 100;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Prepare chart data
    const chartData = poll.candidates.map((candidate, idx) => ({
      name: candidate.name,
      votes: candidate.voteCount,
      percentage: getVotePercentage(candidate.voteCount),
      color: idx === 0 ? "#EF4444" : idx === 1 ? "#F59E0B" : "#3B82F6",
    }));

    const maxVotes = Math.max(...chartData.map((d) => d.votes), 1);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 via-gray-900 to-black rounded-2xl border border-red-500/30 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 p-5 border-b bg-gray-900/95 backdrop-blur-sm border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-500">
                  <PresentationChartLineIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Poll Analytics
                  </h2>
                  <p className="text-sm text-gray-400">
                    Detailed statistics and insights
                  </p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-1 text-gray-400 transition-colors rounded-lg hover:bg-white/10 hover:text-white"
              >
                <XMarkIcon className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Poll Title */}
            <div className="p-4 border rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20">
              <h3 className="text-lg font-bold text-white">{poll.title}</h3>
              <p className="mt-1 text-sm text-gray-400">{poll.description}</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="p-3 text-center rounded-xl bg-white/5">
                <UsersIcon className="w-5 h-5 mx-auto text-blue-400" />
                <p className="mt-1 text-2xl font-bold text-white">
                  {candidateCount}
                </p>
                <p className="text-xs text-gray-500">Candidates</p>
              </div>
              <div className="p-3 text-center rounded-xl bg-white/5">
                <ChartBarIcon className="w-5 h-5 mx-auto text-green-400" />
                <p className="mt-1 text-2xl font-bold text-white">
                  {totalVotes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Total Votes</p>
              </div>
              <div className="p-3 text-center rounded-xl bg-white/5">
                <ArrowTrendingUpIcon className="w-5 h-5 mx-auto text-purple-400" />
                <p className="mt-1 text-2xl font-bold text-purple-400">
                  {maxPercentage}%
                </p>
                <p className="text-xs text-gray-500">Max Share</p>
              </div>
              <div className="p-3 text-center rounded-xl bg-white/5">
                <ClockIcon className="w-5 h-5 mx-auto text-yellow-400" />
                <p className="mt-1 text-sm font-bold text-yellow-400">
                  {timeLeft}
                </p>
                <p className="text-xs text-gray-500">Remaining</p>
              </div>
            </div>

            {/* Bar Chart Section */}
            <div className="p-4 border border-gray-800 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-red-400" />
                  <h4 className="font-semibold text-white">
                    Vote Distribution
                  </h4>
                </div>
                <span className="text-xs text-gray-500">
                  Total: {totalVotes.toLocaleString()} votes
                </span>
              </div>

              <div className="space-y-4">
                {chartData.map((item, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm font-medium text-white">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {item.votes.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({item.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-8 overflow-hidden bg-gray-800 rounded-lg">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.votes / maxVotes) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 flex items-center justify-end px-2 transition-all rounded-lg"
                        style={{
                          width: `${(item.votes / maxVotes) * 100}%`,
                          background: `linear-gradient(90deg, ${item.color}80, ${item.color})`,
                        }}
                      >
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Bar Chart Alternative */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Donut Chart Visualization */}
              <div className="p-4 border border-gray-800 rounded-xl bg-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <PresentationChartLineIcon className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">
                    Share Distribution
                  </h4>
                </div>

                <div className="flex flex-col gap-3">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">
                          {item.name}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Winners Section */}
              {totalVotes > 0 && (
                <div className="p-4 border rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <TrophyIcon className="w-5 h-5 text-yellow-500" />
                    <h4 className="font-semibold text-white">Winners</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🥇</span>
                        <div>
                          <p className="font-medium text-white">
                            {winner.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {winner.description || "No description"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-500">
                          {winner.voteCount} votes
                        </p>
                        <p className="text-xs text-gray-400">
                          {getVotePercentage(winner.voteCount).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {runnerUp && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🥈</span>
                          <div>
                            <p className="font-medium text-white">
                              {runnerUp.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {runnerUp.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-400">
                            {runnerUp.voteCount} votes
                          </p>
                          <p className="text-xs text-gray-400">
                            {getVotePercentage(runnerUp.voteCount).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* All Candidates Breakdown Table */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">Complete Breakdown</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="pb-2 text-xs font-medium text-left text-gray-500">
                        Rank
                      </th>
                      <th className="pb-2 text-xs font-medium text-left text-gray-500">
                        Candidate
                      </th>
                      <th className="pb-2 text-xs font-medium text-right text-gray-500">
                        Votes
                      </th>
                      <th className="pb-2 text-xs font-medium text-right text-gray-500">
                        Percentage
                      </th>
                      <th className="pb-2 text-xs font-medium text-right text-gray-500">
                        Trend
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {poll.candidates.map((candidate, idx) => {
                      const percentage = getVotePercentage(candidate.voteCount);
                      const isWinner = winner?._id === candidate._id;
                      const trend = idx === 0 ? "↑" : idx === 1 ? "→" : "↓";

                      return (
                        <tr
                          key={candidate._id}
                          className="border-b border-gray-800/50"
                        >
                          <td className="py-3 text-left">
                            <span
                              className={`text-sm font-bold ${
                                idx === 0
                                  ? "text-yellow-500"
                                  : idx === 1
                                    ? "text-gray-400"
                                    : "text-gray-600"
                              }`}
                            >
                              #{idx + 1}
                            </span>
                          </td>
                          <td className="py-3 text-left">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium ${isWinner ? "text-yellow-500" : "text-white"}`}
                              >
                                {candidate.name}
                              </span>
                              {isWinner && <span className="text-xs">🏆</span>}
                            </div>
                            {candidate.description && (
                              <p className="text-xs text-gray-500">
                                {candidate.description}
                              </p>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm font-medium text-white">
                              {candidate.voteCount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-sm font-medium text-purple-400">
                              {percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span
                              className={`text-sm ${
                                idx === 0
                                  ? "text-green-500"
                                  : idx === 1
                                    ? "text-yellow-500"
                                    : "text-red-500"
                              }`}
                            >
                              {trend}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie Chart Style Visualization */}
            <div className="p-4 border border-gray-800 rounded-xl bg-white/5">
              <div className="flex items-center gap-2 mb-4">
                <FireIcon className="w-5 h-5 text-orange-400" />
                <h4 className="font-semibold text-white">Visual Summary</h4>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Progress Circle for each candidate */}
                {chartData.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="text-center">
                    <div className="relative inline-flex items-center justify-center w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="44"
                          stroke="#1f2937"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="48"
                          cy="48"
                          r="44"
                          stroke={item.color}
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0, 276.46" }}
                          animate={{
                            strokeDasharray: `${(item.percentage / 100) * 276.46}, 276.46`,
                          }}
                          transition={{ duration: 1, delay: idx * 0.2 }}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="text-lg font-bold text-white">
                          {item.percentage.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs font-medium text-gray-300 truncate">
                      {item.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Poll Metadata */}
            <div className="grid grid-cols-1 gap-3 p-4 rounded-xl bg-white/5 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <TagIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm text-white capitalize">
                    {poll.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-sm text-white">
                    {formatDate(poll.endDate)}
                  </p>
                </div>
              </div>
              {poll.createdAt && (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm text-white">
                      {formatDate(poll.createdAt)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm text-green-400">
                    {new Date(poll.endDate) > new Date() ? "Active" : "Ended"}
                  </p>
                </div>
              </div>
            </div>

            {/* Engagement Insight */}
            <div className="p-4 border rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FireIcon className="w-4 h-4 text-blue-400" />
                <h4 className="font-semibold text-white">Engagement Insight</h4>
              </div>
              <p className="text-sm text-gray-300">
                This poll has received {totalVotes.toLocaleString()} total votes
                across {candidateCount} candidates.
                {totalVotes > 0
                  ? ` The leading candidate has ${maxPercentage}% of the votes, showing ${Number(maxPercentage) > 50 ? "strong" : "moderate"} dominance.`
                  : " Be the first to cast your vote!"}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  },
);

AnalyticsModal.displayName = "AnalyticsModal";

// Analytics Popover Component
const AnalyticsPopover = memo(
  ({
    candidate,
    voteCounts,
    totalVotes,
    selectedCandidate,
    isActive,
    timeLeft,
    position,
    onClose,
  }: {
    candidate: Candidate;
    voteCounts: Record<string, number>;
    totalVotes: number;
    selectedCandidate: string | null;
    isActive: boolean;
    timeLeft: string;
    position: { x: number; y: number };
    onClose: () => void;
  }) => {
    const votePercentage =
      totalVotes === 0 ? 0 : (voteCounts[candidate._id] / totalVotes) * 100;
    const isSelected = selectedCandidate === candidate._id;
    const popoverRef = useRef<HTMLDivElement>(null);

    const rank =
      Object.entries(voteCounts)
        .sort((a, b) => b[1] - a[1])
        .findIndex(([id]) => id === candidate._id) + 1;

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          popoverRef.current &&
          !popoverRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };

      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }, [onClose]);

    const adjustedPosition = {
      x: Math.min(position.x, window.innerWidth - 400),
      y: Math.min(position.y, window.innerHeight - 500),
    };

    return (
      <motion.div
        ref={popoverRef}
        initial={{ opacity: 0, scale: 0.95, x: -10 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.95, x: -10 }}
        transition={{ duration: 0.2 }}
        className="fixed z-50 overflow-hidden border-2 shadow-2xl w-96 backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
      >
        <div className="relative p-5">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 rounded-2xl" />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-red-600">
                    {isSelected ? (
                      <CheckCircleIcon className="w-6 h-6 text-white" />
                    ) : (
                      <TrophyIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-transparent bg-gradient-to-r from-red-400 to-red-500 bg-clip-text">
                    {isSelected
                      ? "YOUR VOTE"
                      : rank === 1
                        ? "LEADING"
                        : "ANALYTICS"}
                  </p>
                  <p className="text-xs text-gray-400">Real-time statistics</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 transition-all rounded-lg hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-sm">
              <p className="text-lg font-bold text-white">{candidate.name}</p>
              {candidate.description && (
                <p className="mt-1 text-xs text-gray-400">
                  {candidate.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 text-center rounded-xl bg-white/5">
                <p className="text-2xl font-bold text-white">
                  {voteCounts[candidate._id]}
                </p>
                <p className="text-xs text-gray-400">Total Votes</p>
              </div>
              <div className="p-3 text-center rounded-xl bg-white/5">
                <div className="text-2xl font-bold text-transparent bg-gradient-to-r from-red-400 to-red-500 bg-clip-text">
                  {votePercentage.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-400">Percentage</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10">
              <span className="text-xs text-gray-400">Current Rank</span>
              <div className="flex items-center gap-1">
                <TrophyIcon
                  className={`w-4 h-4 ${rank === 1 ? "text-yellow-500" : rank === 2 ? "text-gray-400" : "text-amber-600"}`}
                />
                <span className="text-sm font-bold text-white">#{rank}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Popularity</span>
                <span className="text-red-400">
                  {votePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${votePercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                />
              </div>
            </div>

            {isActive && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-yellow-500/10">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-400">Time Remaining</span>
                </div>
                <span className="text-sm font-semibold text-yellow-500">
                  {timeLeft}
                </span>
              </div>
            )}

            {isSelected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 text-xs text-center text-red-500 border rounded-lg bg-red-500/10 border-red-500/30"
              >
                ✓ You voted for this candidate
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
);

AnalyticsPopover.displayName = "AnalyticsPopover";

// Main PollCard Component
function PollCardComponent({ poll, onVoteSuccess }: PollCardProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [localVoted, setLocalVoted] = useState(poll.userVoted || false);
  const [localVotedCandidateId, setLocalVotedCandidateId] = useState<
    string | null
  >(poll.userVoteCandidateId || null);

  // Sync local state with poll prop
  useEffect(() => {
    setLocalVoted(poll.userVoted || false);
    setLocalVotedCandidateId(poll.userVoteCandidateId || null);
  }, [poll.userVoted, poll.userVoteCandidateId]);

  const hasUserVoted = localVoted || poll.userVoted || false;
  const votedCandidateId =
    localVotedCandidateId || poll.userVoteCandidateId || null;
  const totalVotes = poll.totalVotes;
  const isActive = poll.isPublished && new Date(poll.endDate) > new Date();
  const timeLeft = formatDistanceToNow(new Date(poll.endDate), {
    addSuffix: true,
  });
  const candidateCount = poll.candidates.length;

  // Calculate max percentage
  const maxPercentage =
    totalVotes > 0
      ? Math.max(
          ...poll.candidates.map((c) => (c.voteCount / totalVotes) * 100),
        ).toFixed(1)
      : "0";

  // Find winner
  const winnerId = poll.candidates.reduce((a, b) =>
    a.voteCount > b.voteCount ? a : b,
  )._id;

  const getVotePercentage = useCallback(
    (candidateId: string) => {
      const candidate = poll.candidates.find((c) => c._id === candidateId);
      if (!candidate || totalVotes === 0) return 0;
      return (candidate.voteCount / totalVotes) * 100;
    },
    [poll.candidates, totalVotes],
  );

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

  const getStatusColor = () => {
    if (!poll.isPublished) return "bg-yellow-500/20 text-yellow-400";
    if (new Date(poll.endDate) < new Date())
      return "bg-gray-500/20 text-gray-400";
    return "bg-green-500/20 text-green-400";
  };

  const getStatusText = () => {
    if (!poll.isPublished) return "Draft";
    if (new Date(poll.endDate) < new Date()) return "Ended";
    return "Active";
  };

  // In PollCard.tsx, update the handleVote function

  const handleVote = useCallback(
    async (candidateId: string) => {
      if (hasUserVoted) {
        toast.error("You have already voted in this poll!");
        return;
      }
      if (!isActive) {
        toast.error("This poll has ended!");
        return;
      }
      if (!isAuthenticated) {
        setShowLoginModal(true);
        return;
      }
      if (isVoting) return;

      setIsVoting(true);
      try {
        const result = await dispatch(
          castVote({ pollId: poll._id, candidateId }),
        ).unwrap();
        // console.log("Vote result:", result);

        setLocalVoted(true);
        setLocalVotedCandidateId(candidateId);
        dispatch(updatePollLocally({ pollId: poll._id, candidateId }));
        toast.success("Vote cast successfully!");

        // Refresh polls to get updated data
        await dispatch(fetchPolls({ limit: 50 }));
        if (onVoteSuccess) onVoteSuccess();
      } catch (err: any) {
        console.error("Vote error details:", err);
        const errorMessage =
          err?.message || err?.response?.data?.message || "Failed to cast vote";
        toast.error(errorMessage);

        // If unauthorized, trigger login modal
        if (err?.response?.status === 401) {
          setShowLoginModal(true);
        }
      } finally {
        setIsVoting(false);
      }
    },
    [
      hasUserVoted,
      isActive,
      isAuthenticated,
      isVoting,
      dispatch,
      poll._id,
      onVoteSuccess,
    ],
  );

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    dispatch(fetchPolls({ limit: 50 }));
  }, [dispatch]);

  const handleCandidateHover = useCallback(
    (e: React.MouseEvent, candidateId: string) => {
      if (hasUserVoted) {
        const rect = e.currentTarget.getBoundingClientRect();
        setPopoverPosition({ x: rect.right + 10, y: rect.top - 50 });
        setShowPopover(candidateId);
      }
    },
    [hasUserVoted],
  );

  const openAnalyticsModal = () => {
    setShowAnalyticsModal(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden transition-all duration-300 border border-gray-800 group rounded-2xl bg-gradient-to-br from-gray-900 to-black hover:shadow-2xl hover:shadow-red-500/20 hover:border-red-500/30"
      >
        {/* Animated Border Glow */}
        <div className="absolute inset-0 transition-opacity duration-300 opacity-0 rounded-2xl group-hover:opacity-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/30 to-red-600/30 blur-xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-5">
          {/* Header with Category and Status */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 backdrop-blur-sm">
                <span className="text-2xl">
                  {getCategoryIcon(poll.category)}
                </span>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-medium text-gray-300 capitalize bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
                {poll.category}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg ${getStatusColor()}`}
              >
                {getStatusText()}
              </div>
              {!hasUserVoted && isActive && (
                <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-green-400 bg-green-500/10 rounded-full border border-green-500/20">
                  <FireIcon className="w-2.5 h-2.5" />
                  <span>Open</span>
                </div>
              )}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="mb-2 text-xl font-bold leading-tight text-white transition-colors line-clamp-1 group-hover:text-red-400">
            {poll.title}
          </h3>
          <p className="mb-5 text-sm text-gray-400 line-clamp-2">
            {poll.description}
          </p>

          {/* Candidates Section */}
          <div className="grid grid-cols-1 gap-3 mb-5">
            {poll.candidates.map((candidate, idx) => {
              const votePercentage = getVotePercentage(candidate._id);
              const isSelected = votedCandidateId === candidate._id;
              const isWinner = winnerId === candidate._id && hasUserVoted;

              return (
                <motion.div
                  key={candidate._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={!hasUserVoted ? { scale: 1.02, x: 4 } : {}}
                  onMouseEnter={(e) => handleCandidateHover(e, candidate._id)}
                  onMouseLeave={() => setShowPopover(null)}
                >
                  <div
                    className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                      hasUserVoted
                        ? isSelected
                          ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20"
                          : "bg-white/5 border border-gray-800/50 hover:border-gray-700"
                        : `cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-r from-red-500/15 to-red-600/15 border-2 border-red-500/50 shadow-lg shadow-red-500/10"
                              : "bg-white/5 border border-gray-800/50 hover:border-red-500/30 hover:bg-white/10 hover:scale-[1.01]"
                          }`
                    }`}
                    onClick={() => !hasUserVoted && handleVote(candidate._id)}
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-3">
                      {hasUserVoted ? (
                        isSelected ? (
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40" />
                            <CheckCircleIcon className="relative w-5 h-5 text-red-500" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full bg-gray-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                          </div>
                        )
                      ) : (
                        <div
                          className={`relative flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all ${
                            isSelected
                              ? "border-red-500 bg-red-500/20"
                              : "border-gray-500 group-hover:border-red-400"
                          }`}
                        >
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute inset-0.5 bg-red-500 rounded-full"
                            />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-medium truncate ${
                              isSelected
                                ? "text-white font-bold"
                                : "text-gray-300"
                            }`}
                          >
                            {candidate.name}
                          </span>
                          {isSelected && hasUserVoted && (
                            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide animate-pulse">
                              ✓ YOUR VOTE
                            </span>
                          )}
                          {isWinner && !isSelected && hasUserVoted && (
                            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wide">
                              🏆 LEADING
                            </span>
                          )}
                        </div>
                        {candidate.description && (
                          <p className="text-[10px] text-gray-500 truncate">
                            {candidate.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-2 text-right">
                      <p
                        className={`text-base font-bold ${isSelected ? "text-red-400" : "text-white"}`}
                      >
                        {candidate.voteCount}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {votePercentage.toFixed(1)}%
                      </p>
                    </div>

                    {/* Hover Overlay for Analytics */}
                    {hasUserVoted && (
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-help">
                        <EyeIcon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-[10px] font-medium text-gray-300">
                          View Analytics
                        </span>
                      </div>
                    )}

                    {/* Loading Overlay */}
                    {isVoting && isSelected && !hasUserVoted && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/90 backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3.5 h-3.5 border-2 rounded-full border-red-500/30 border-t-red-500 animate-spin" />
                          <span className="text-[11px] font-medium text-white">
                            Casting vote...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          {/* Time Remaining Footer */}
          {isActive && !hasUserVoted && (
            <div className="pt-3 border-t border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-yellow-500/70">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">{timeLeft}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <span className="text-[10px] font-medium">
                    Click on a candidate to vote
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Participation Rate Bar for Voted Users */}
          {hasUserVoted && (
            <div className="pt-3 mt-3 border-t border-gray-800/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-gray-500">Your Impact</span>
                <span className="text-[10px] text-gray-400">
                  {votedCandidateId
                    ? ((poll.candidates.find((c) => c._id === votedCandidateId)
                        ?.voteCount || 0) /
                        totalVotes) *
                      100
                    : 0}
                  .0% of total
                </span>
              </div>
              <div className="w-full h-1 overflow-hidden bg-gray-800 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${votedCandidateId ? ((poll.candidates.find((c) => c._id === votedCandidateId)?.voteCount || 0) / totalVotes) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                />
              </div>
              <p className="mt-1 text-[9px] text-center text-gray-500">
                You contributed to this candidate's success!
              </p>
            </div>
          )}
          {/* Stats Bar - Clickable to open Analytics Modal */}
          <div
            className="flex items-center justify-between p-3 mt-2 transition-all duration-200 cursor-pointer rounded-xl bg-white/5 hover:bg-white/10 group/stats"
            onClick={openAnalyticsModal}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-gray-400">
                <UsersIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">
                  {candidateCount} Candidates
                </span>
              </div>
              <div className="w-px h-3 bg-gray-700" />
              <div className="flex items-center gap-1.5 text-gray-400">
                <ChartBarIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">
                  {totalVotes.toLocaleString()} Votes
                </span>
              </div>
              <div className="w-px h-3 bg-gray-700" />
              <div className="flex items-center gap-1.5 text-gray-400">
                <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">
                  {maxPercentage}% Max
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-gray-500 transition-colors group-hover/stats:text-red-400">
              <span className="text-[11px] font-medium flex">
                <EyeIcon className="w-3.5 h-3.5" /> Analytics
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Analytics Popover */}
      <AnimatePresence>
        {showPopover && hasUserVoted && (
          <AnalyticsPopover
            candidate={poll.candidates.find((c) => c._id === showPopover)!}
            voteCounts={poll.candidates.reduce(
              (acc, c) => ({ ...acc, [c._id]: c.voteCount }),
              {},
            )}
            totalVotes={totalVotes}
            selectedCandidate={votedCandidateId}
            isActive={isActive}
            timeLeft={timeLeft}
            position={popoverPosition}
            onClose={() => setShowPopover(null)}
          />
        )}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {showAnalyticsModal && (
          <AnalyticsModal
            poll={poll}
            totalVotes={totalVotes}
            candidateCount={candidateCount}
            maxPercentage={maxPercentage}
            timeLeft={timeLeft}
            onClose={() => setShowAnalyticsModal(false)}
          />
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}

export default memo(PollCardComponent);
