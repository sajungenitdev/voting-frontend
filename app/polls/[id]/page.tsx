// app/polls/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchPolls, castVote } from "@/store/slices/pollSlice";
import LoginModal from "@/components/ui/LoginModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  FlagIcon,
  TrophyIcon,
  FireIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  TagIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  SignalIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/solid";

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
  startDate?: string;
  isPublished: boolean;
  totalVotes: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  userVoted?: boolean;
  userVoteCandidateId?: string | null;
  createdAt?: string;
}

export default function PollDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { polls, isLoading } = useAppSelector((state) => state.polls);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [isVoting, setIsVoting] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);

  const pollId = params.id as string;

  useEffect(() => {
    if (polls.length === 0) {
      dispatch(fetchPolls({ limit: 100 }));
    }
  }, [dispatch, polls.length]);

  useEffect(() => {
    if (polls.length > 0 && pollId) {
      const foundPoll = polls.find((p: Poll) => p._id === pollId);
      if (foundPoll) {
        setPoll(foundPoll);
        if (foundPoll.userVoteCandidateId) {
          setSelectedCandidate(foundPoll.userVoteCandidateId);
        }
      }
    }
  }, [polls, pollId]);

  const handleVote = async (candidateId: string) => {
    if (!poll) return;

    if (poll.userVoted) {
      toast.error("You have already voted in this poll!");
      return;
    }

    if (!isAuthenticated) {
      setSelectedCandidate(candidateId);
      setShowLoginModal(true);
      return;
    }

    if (isVoting) return;

    setIsVoting(true);
    try {
      await dispatch(castVote({ pollId: poll._id, candidateId })).unwrap();
      toast.success("Vote cast successfully!");
      dispatch(fetchPolls({ limit: 100 }));
      setSelectedCandidate(candidateId);
    } catch (error: any) {
      toast.error(error.message || "Failed to cast vote");
    } finally {
      setIsVoting(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (selectedCandidate && poll && !poll.userVoted) {
      handleVote(selectedCandidate);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  if (isLoading && !poll) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Poll not found</h2>
          <p className="mb-6 text-gray-400">
            The poll you're looking for doesn't exist.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isActive = poll.isPublished && new Date(poll.endDate) > new Date();
  const totalVotes = poll.totalVotes;
  const timeLeft =
    new Date(poll.endDate) > new Date()
      ? formatDistanceToNow(new Date(poll.endDate), { addSuffix: true })
      : "Ended";

  const getVotePercentage = (candidateId: string) => {
    const candidate = poll.candidates.find((c) => c._id === candidateId);
    if (!candidate || totalVotes === 0) return 0;
    return (candidate.voteCount / totalVotes) * 100;
  };

  // Calculate winner and rankings
  const sortedCandidates = [...poll.candidates].sort(
    (a, b) => b.voteCount - a.voteCount,
  );
  const winner = sortedCandidates[0];
  const runnerUp = sortedCandidates[1];
  const participationRate =
    totalVotes > 0 ? (totalVotes / (poll.candidates.length * 100)) * 100 : 0;

  // Prepare chart data
  const chartData = poll.candidates.map((candidate) => ({
    name: candidate.name,
    votes: candidate.voteCount,
    percentage: getVotePercentage(candidate._id),
  }));

  const maxVotes = Math.max(...chartData.map((d) => d.votes), 1);

  return (
    <div className="min-h-screen py-20 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-400 transition-colors hover:text-white group"
        >
          <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </motion.button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2">
            {/* Poll Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 text-sm font-medium text-gray-300 bg-gray-800 rounded-full">
                    {poll.category}
                  </span>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${
                      isActive
                        ? "bg-green-500/20 text-green-400"
                        : "bg-gray-500/20 text-gray-400"
                    }`}
                  >
                    {isActive ? (
                      <FireIcon className="w-3 h-3" />
                    ) : (
                      <ClockIcon className="w-3 h-3" />
                    )}
                    {isActive ? "Active" : "Ended"}
                  </span>
                  {poll.userVoted && (
                    <span className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-green-400 rounded-full bg-green-500/20">
                      <CheckCircleIcon className="w-3 h-3" />
                      Voted
                    </span>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-2 transition-colors rounded-lg hover:bg-white/10"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showShareMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-xl"
                        >
                          <div className="p-3 border-b border-gray-800">
                            <p className="text-sm font-medium text-white">
                              Share this poll
                            </p>
                            <p className="text-xs text-gray-500">
                              Share with your network
                            </p>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={handleShare}
                              className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-5.656a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.102"
                                />
                              </svg>
                              Copy link
                            </button>
                            <button
                              onClick={() => {
                                window.open(
                                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this poll: ${poll.title}`)}&url=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                );
                                setShowShareMenu(false);
                              }}
                              className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                              X (Twitter)
                            </button>
                            <button
                              onClick={() => {
                                window.open(
                                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                                  "_blank",
                                );
                                setShowShareMenu(false);
                              }}
                              className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 rounded-lg hover:bg-white/10"
                            >
                              <svg
                                className="w-5 h-5 text-blue-500"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                              </svg>
                              Facebook
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
                {poll.title}
              </h1>
              <p className="text-lg text-gray-400">{poll.description}</p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mt-6 sm:grid-cols-4">
                <div className="p-4 text-center border border-gray-800 rounded-xl bg-white/5">
                  <UsersIcon className="w-5 h-5 mx-auto mb-2 text-blue-400" />
                  <p className="text-2xl font-bold text-white">
                    {poll.candidates.length}
                  </p>
                  <p className="text-xs text-gray-500">Candidates</p>
                </div>
                <div className="p-4 text-center border border-gray-800 rounded-xl bg-white/5">
                  <ChartBarIcon className="w-5 h-5 mx-auto mb-2 text-green-400" />
                  <p className="text-2xl font-bold text-white">
                    {totalVotes.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Votes</p>
                </div>
                <div className="p-4 text-center border border-gray-800 rounded-xl bg-white/5">
                  <ClockIcon className="w-5 h-5 mx-auto mb-2 text-yellow-400" />
                  <p className="text-sm font-bold text-yellow-400">
                    {timeLeft}
                  </p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
                <div className="p-4 text-center border border-gray-800 rounded-xl bg-white/5">
                  <SignalIcon className="w-5 h-5 mx-auto mb-2 text-purple-400" />
                  <p className="text-2xl font-bold text-purple-400">
                    {participationRate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">Participation</p>
                </div>
              </div>
            </motion.div>

            {/* Candidates Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Candidates</h2>
                {totalVotes > 0 && (
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-red-400"
                  >
                    <EyeIcon className="w-4 h-4" />
                    {showAnalytics ? "Hide Analytics" : "Show Analytics"}
                  </button>
                )}
              </div>

              {/* Analytics Section */}
              <AnimatePresence>
                {showAnalytics && totalVotes > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-5 mb-6 overflow-hidden border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black"
                  >
                    <h3 className="mb-4 text-lg font-semibold text-white">
                      Vote Distribution Analysis
                    </h3>

                    {/* Bar Chart */}
                    <div className="mb-6 space-y-3">
                      {chartData.map((item, idx) => (
                        <div key={idx} className="group">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    idx === 0
                                      ? "#EF4444"
                                      : idx === 1
                                        ? "#F59E0B"
                                        : "#3B82F6",
                                }}
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
                              animate={{
                                width: `${(item.votes / maxVotes) * 100}%`,
                              }}
                              transition={{ duration: 0.5, delay: idx * 0.1 }}
                              className="absolute inset-y-0 left-0 flex items-center justify-end px-2 transition-all rounded-lg"
                              style={{
                                width: `${(item.votes / maxVotes) * 100}%`,
                                background: `linear-gradient(90deg, ${idx === 0 ? "#EF4444" : idx === 1 ? "#F59E0B" : "#3B82F6"}80, ${idx === 0 ? "#EF4444" : idx === 1 ? "#F59E0B" : "#3B82F6"})`,
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

                    {/* Winners Section */}
                    {totalVotes > 0 && (
                      <div className="p-4 border rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-3">
                          <TrophyIcon className="w-5 h-5 text-yellow-500" />
                          <h4 className="font-semibold text-white">
                            Current Leaders
                          </h4>
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
                                {(
                                  (winner.voteCount / totalVotes) *
                                  100
                                ).toFixed(1)}
                                %
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
                                  {(
                                    (runnerUp.voteCount / totalVotes) *
                                    100
                                  ).toFixed(1)}
                                  %
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Candidates List */}
              {poll.candidates.map((candidate, idx) => {
                const percentage = getVotePercentage(candidate._id);
                const isSelected = selectedCandidate === candidate._id;
                const hasVoted = poll.userVoted || false;
                const isWinner = winner?._id === candidate._id;

                return (
                  <motion.div
                    key={candidate._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                    onMouseEnter={() => setHoveredCandidate(candidate._id)}
                    onMouseLeave={() => setHoveredCandidate(null)}
                    className={`relative overflow-hidden p-6 transition-all border rounded-xl ${
                      hasVoted && isSelected
                        ? "border-red-500 bg-gradient-to-r from-red-500/20 to-red-600/20 shadow-lg shadow-red-500/10"
                        : "border-gray-800 bg-gradient-to-br from-gray-900 to-black"
                    } hover:border-red-500/50 hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          {!hasVoted && isActive && (
                            <div
                              onClick={() => handleVote(candidate._id)}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                isSelected
                                  ? "border-red-500 bg-red-500/20"
                                  : "border-gray-500 hover:border-red-400"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 bg-red-500 rounded-full" />
                              )}
                            </div>
                          )}
                          {hasVoted && isSelected && (
                            <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          )}
                          <h3 className="text-lg font-semibold text-white">
                            {candidate.name}
                          </h3>
                          {hasVoted && isSelected && (
                            <span className="px-2 py-0.5 text-xs font-medium text-green-500 bg-green-500/10 rounded-full animate-pulse">
                              Your Vote
                            </span>
                          )}
                          {isWinner && !isSelected && totalVotes > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-yellow-500 bg-yellow-500/10 rounded-full">
                              <TrophyIcon className="w-3 h-3" />
                              Leading
                            </span>
                          )}
                        </div>
                        {candidate.description && (
                          <p className="text-sm text-gray-400">
                            {candidate.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {candidate.voteCount}
                        </div>
                        <div className="text-sm text-gray-400">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                        />
                      </div>
                    </div>

                    {/* Hover Glow Effect */}
                    {hoveredCandidate === candidate._id && (
                      <div className="absolute inset-0 pointer-events-none rounded-xl bg-gradient-to-r from-red-500/5 to-transparent" />
                    )}
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Vote Info Messages */}
            {poll.userVoted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 mt-6 text-center border rounded-lg bg-green-500/10 border-green-500/30"
              >
                <CheckCircleIcon className="inline-block w-5 h-5 mr-2 text-green-500" />
                <span className="text-green-500">
                  Thank you for voting! Your voice matters.
                </span>
              </motion.div>
            )}

            {!isActive && !poll.userVoted && (
              <div className="p-4 mt-6 text-center border rounded-lg bg-gray-500/10 border-gray-500/30">
                <ClockIcon className="inline-block w-5 h-5 mr-2 text-gray-500" />
                <span className="text-gray-500">
                  This poll has ended. Check out active polls!
                </span>
              </div>
            )}
          </div>

          {/* Right Sidebar - Info & Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Poll Info Card */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
              <h3 className="mb-4 text-lg font-semibold text-white">
                Poll Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm">Created</span>
                  </div>
                  <span className="text-sm text-white">
                    {poll.createdAt
                      ? new Date(poll.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-sm">End Date</span>
                  </div>
                  <span className="text-sm text-white">
                    {new Date(poll.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <TagIcon className="w-4 h-4" />
                    <span className="text-sm">Category</span>
                  </div>
                  <span className="text-sm text-white capitalize">
                    {poll.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <UserGroupIcon className="w-4 h-4" />
                    <span className="text-sm">Total Participants</span>
                  </div>
                  <span className="text-sm text-white">
                    {totalVotes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            {totalVotes > 0 && (
              <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-semibold text-white">
                  <HeartIcon className="w-5 h-5 text-red-400" />
                  Engagement Stats
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">
                        Vote Distribution
                      </span>
                      <span className="text-sm text-white">
                        {Math.max(
                          ...poll.candidates.map((c) => c.voteCount),
                        ).toLocaleString()}{" "}
                        max
                      </span>
                    </div>
                    <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
                        style={{
                          width: `${(Math.max(...poll.candidates.map((c) => c.voteCount)) / totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">
                        Competition Level
                      </span>
                      <span className="text-sm text-white">
                        {winner.voteCount / totalVotes > 0.5
                          ? "High"
                          : winner.voteCount / totalVotes > 0.3
                            ? "Medium"
                            : "Low"}
                      </span>
                    </div>
                    <div className="w-full h-2 overflow-hidden bg-gray-800 rounded-full">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"
                        style={{
                          width: `${(winner.voteCount / totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Call to Action */}
            {isActive && !poll.userVoted && (
              <div className="p-6 text-center border border-red-500/30 rounded-2xl bg-gradient-to-r from-red-500/10 to-red-600/10">
                <FireIcon className="w-8 h-8 mx-auto mb-3 text-red-400 animate-pulse" />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Cast Your Vote!
                </h3>
                <p className="mb-4 text-sm text-gray-400">
                  Your vote matters. Choose your favorite candidate above.
                </p>
                <div className="text-xs text-gray-500">
                  ⏰ {timeLeft} remaining
                </div>
              </div>
            )}

            {/* Result Summary */}
            {totalVotes > 0 && !isActive && (
              <div className="p-6 text-center border border-green-500/30 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                <TrophyIcon className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Poll Completed
                </h3>
                <p className="text-sm text-gray-400">
                  Winner:{" "}
                  <span className="font-bold text-yellow-500">
                    {winner.name}
                  </span>
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  with {winner.voteCount} votes (
                  {((winner.voteCount / totalVotes) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

// Helper function for formatDistanceToNow
function formatDistanceToNow(
  date: Date,
  options?: { addSuffix: boolean },
): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / (1000 * 60));
  const hours = Math.floor(absDiff / (1000 * 60 * 60));
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return options?.addSuffix
      ? diff > 0
        ? `in ${minutes} minutes`
        : `${minutes} minutes ago`
      : `${minutes} minutes`;
  }

  if (hours < 24) {
    return options?.addSuffix
      ? diff > 0
        ? `in ${hours} hours`
        : `${hours} hours ago`
      : `${hours} hours`;
  }

  return options?.addSuffix
    ? diff > 0
      ? `in ${days} days`
      : `${days} days ago`
    : `${days} days`;
}
