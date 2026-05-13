"use client";

import { useState, useEffect, useRef } from "react";
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
} from "@heroicons/react/24/solid";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import LoginModal from "@/components/ui/LoginModal";
import toast from "react-hot-toast";
import {
  castVote,
  fetchPolls,
  updatePollLocally,
} from "@/store/slices/pollSlice";

// Analytics Popover Component
const AnalyticsPopover = ({
  candidate,
  voteCounts,
  totalVotes,
  selectedCandidate,
  isActive,
  timeLeft,
  position,
  onClose,
}: {
  candidate: any;
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <motion.div
      ref={popoverRef}
      initial={{ opacity: 0, scale: 0.95, x: -10 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -10 }}
      transition={{ duration: 0.2 }}
      className="fixed z-50 overflow-hidden border-2 shadow-2xl w-96 backdrop-blur-xl bg-gradient-to-br from-gray-900/95 to-black/95 rounded-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
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
              <span className="text-red-400">{votePercentage.toFixed(1)}%</span>
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
};

interface PollCardProps {
  poll: {
    _id: string;
    title: string;
    description: string;
    category: string;
    candidates: Array<{
      _id: string;
      name: string;
      description?: string;
      voteCount: number;
    }>;
    endDate: string;
    isPublished: boolean;
    totalVotes: number;
    userVoted?: boolean;
    userVoteCandidateId?: string;
  };
  onVoteSuccess?: () => void;
}

export default function PollCard({ poll, onVoteSuccess }: PollCardProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [showPopover, setShowPopover] = useState<string | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [localVoted, setLocalVoted] = useState(poll.userVoted || false);
  const [localVotedCandidateId, setLocalVotedCandidateId] = useState(
    poll.userVoteCandidateId || null,
  );

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
  const totalVoters = poll.totalVotes;

  // Find winner
  const winnerId = poll.candidates.reduce((a, b) =>
    a.voteCount > b.voteCount ? a : b,
  )._id;

  const getVotePercentage = (candidateId: string) => {
    const candidate = poll.candidates.find((c) => c._id === candidateId);
    if (!candidate || totalVotes === 0) return 0;
    return (candidate.voteCount / totalVotes) * 100;
  };

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

  const handleVote = async (candidateId: string) => {
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
      await dispatch(castVote({ pollId: poll._id, candidateId })).unwrap();
      setLocalVoted(true);
      setLocalVotedCandidateId(candidateId);
      dispatch(updatePollLocally({ pollId: poll._id, candidateId }));
      toast.success("Vote cast successfully!");
      await dispatch(fetchPolls({ limit: 50 }));
      onVoteSuccess?.();
    } catch (err: any) {
      const errorMessage =
        typeof err === "string" ? err : err?.message || "Failed to cast vote";
      toast.error(errorMessage);
    } finally {
      setIsVoting(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    dispatch(fetchPolls({ limit: 50 }));
  };

  const handleCandidateHover = (e: React.MouseEvent, candidateId: string) => {
    if (hasUserVoted) {
      const rect = e.currentTarget.getBoundingClientRect();
      setPopoverPosition({ x: rect.right + 10, y: rect.top - 50 });
      setShowPopover(candidateId);
    }
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

          {/* Candidates Section with Grid Layout */}
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
                  {hasUserVoted ? (
                    // AFTER VOTE - Red Highlight for voted candidate with percentage
                    <div
                      className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                        isSelected
                          ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-2 border-red-500/50 shadow-lg shadow-red-500/20"
                          : "bg-white/5 border border-gray-800/50 hover:border-gray-700"
                      }`}
                    >
                      <div className="flex items-center flex-1 min-w-0 gap-3">
                        {isSelected ? (
                          <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-40" />
                            <CheckCircleIcon className="relative w-5 h-5 text-red-500" />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center flex-shrink-0 w-5 h-5 rounded-full bg-gray-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-500" />
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
                            {isSelected && (
                              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wide animate-pulse">
                                ✓ YOUR VOTE
                              </span>
                            )}
                            {isWinner && !isSelected && (
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
                          className={`text-base font-bold ${
                            isSelected ? "text-red-400" : "text-white"
                          }`}
                        >
                          {candidate.voteCount}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {votePercentage.toFixed(1)}%
                        </p>
                      </div>

                      {/* Hover Overlay for Analytics */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-xl bg-black/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-help">
                        <EyeIcon className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-[10px] font-medium text-gray-300">
                          View Analytics
                        </span>
                      </div>
                    </div>
                  ) : (
                    // BEFORE VOTE - Selectable with radio and percentage preview
                    <div
                      className={`relative flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-red-500/15 to-red-600/15 border-2 border-red-500/50 shadow-lg shadow-red-500/10"
                          : "bg-white/5 border border-gray-800/50 hover:border-red-500/30 hover:bg-white/10 hover:scale-[1.01]"
                      }`}
                      onClick={() => handleVote(candidate._id)}
                    >
                      <div className="flex items-center flex-1 min-w-0 gap-3">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {candidate.name}
                          </p>
                          {candidate.description && (
                            <p className="text-[10px] text-gray-500 truncate">
                              {candidate.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 text-right">
                        <p className="text-sm font-bold text-white">
                          {candidate.voteCount}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {votePercentage.toFixed(1)}%
                        </p>
                      </div>

                      {/* Loading Overlay */}
                      {isVoting && isSelected && (
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
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Stats Footer with Analytics Summary */}
          <div className="pt-3 border-t border-gray-800/50">
            <div className="flex items-center justify-between">
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
                    {totalVoters.toLocaleString()} Votes
                  </span>
                </div>
                <div className="w-px h-3 bg-gray-700" />
                <div className="flex items-center gap-1.5 text-gray-400">
                  <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium">
                    {totalVotes > 0
                      ? `${poll.candidates.reduce((max, c) => Math.max(max, getVotePercentage(c._id)), 0).toFixed(1)}% Max`
                      : "0% Max"}
                  </span>
                </div>
              </div>
              {isActive && !hasUserVoted && (
                <div className="flex items-center gap-1.5 text-yellow-500/70">
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-medium">{timeLeft}</span>
                </div>
              )}
            </div>

            {/* Participation Rate Bar */}
            {hasUserVoted && (
              <div className="pt-2 mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500">
                    Participation
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {(votedCandidateId
                      ? ((poll.candidates.find(
                          (c) => c._id === votedCandidateId,
                        )?.voteCount || 0) /
                          totalVotes) *
                        100
                      : 0
                    ).toFixed(1)}
                    % of total
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
