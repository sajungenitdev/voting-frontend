// app/polls/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchPolls, castVote } from "@/store/slices/pollSlice";
import LoginModal from "@/components/ui/LoginModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  FlagIcon,
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

  return (
    <div className="min-h-screen py-20 bg-black">
      <div className="max-w-7xl max-w-7xl px-4 py-8 mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back
        </button>

        {/* Poll Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-sm text-gray-300 bg-gray-800 rounded-full">
                {poll.category}
              </span>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  isActive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-gray-500/20 text-gray-400"
                }`}
              >
                {isActive ? "Active" : "Ended"}
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 transition-colors rounded-lg hover:bg-white/10"
              >
                <ShareIcon className="w-5 h-5 text-gray-400" />
              </button>

              {showShareMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowShareMenu(false)}
                  />

                  {/* Share Menu */}
                  <div className="absolute right-0 z-50 w-64 mt-2 overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-xl">
                    <div className="p-3 border-b border-gray-800">
                      <p className="text-sm font-medium text-white">
                        Share this poll
                      </p>
                      <p className="text-xs text-gray-500">
                        Share with your network
                      </p>
                    </div>

                    <div className="p-2">
                      {/* Copy Link */}
                      <button
                        onClick={handleShare}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
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

                      {/* Twitter/X */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          const text = encodeURIComponent(
                            `Check out this poll: ${poll?.title}`,
                          );
                          window.open(
                            `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
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

                      {/* Facebook */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          window.open(
                            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
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

                      {/* LinkedIn */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          const title = encodeURIComponent(poll?.title || "");
                          window.open(
                            `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <svg
                          className="w-5 h-5 text-blue-700"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.204 0 22.225 0z" />
                        </svg>
                        LinkedIn
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          const text = encodeURIComponent(
                            `Check out this poll: ${poll?.title}\n\n`,
                          );
                          window.open(
                            `https://wa.me/?text=${text}${url}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <svg
                          className="w-5 h-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20.52 3.48C18.27 1.23 15.21 0 12 0 5.37 0 0 5.37 0 12c0 2.11.55 4.17 1.6 6.01L.01 24l6.05-1.58c1.76.96 3.78 1.49 5.94 1.49 6.63 0 12-5.37 12-12 0-3.21-1.23-6.27-3.48-8.52zM12 21.6c-1.82 0-3.6-.49-5.16-1.42l-.37-.22-3.59.94.96-3.5-.24-.38c-1-1.62-1.53-3.49-1.53-5.42 0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93 1.89 1.89 2.93 4.4 2.93 7.07 0 5.52-4.48 10-10 10z" />
                          <path d="M17.2 14.68c-.29-.15-1.71-.84-1.98-.94-.26-.1-.45-.15-.64.15-.19.3-.74.94-.91 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.03-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.46-.48-.64-.49-.16 0-.35-.01-.54-.01-.19 0-.49.07-.75.35-.26.28-1 .97-1 2.37 0 1.4 1.02 2.76 1.16 2.95.14.19 2.01 3.07 4.87 4.3.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.24.17-1.36-.07-.12-.26-.19-.55-.34z" />
                        </svg>
                        WhatsApp
                      </button>

                      {/* Telegram */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          const text = encodeURIComponent(
                            `Check out this poll: ${poll?.title}`,
                          );
                          window.open(
                            `https://t.me/share/url?url=${url}&text=${text}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <svg
                          className="w-5 h-5 text-blue-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-1.96 1.24-5.54 3.66-.52.36-.99.53-1.41.52-.47-.02-1.36-.26-2.03-.48-.82-.26-1.47-.4-1.41-.85.03-.23.35-.48.95-.73 3.74-1.63 6.23-2.7 7.48-3.22 3.56-1.48 4.3-1.74 4.78-1.74.11 0 .35.03.5.2.14.16.16.37.18.54-.02-.01.03-.85-.06.51z" />
                        </svg>
                        Telegram
                      </button>

                      {/* Reddit */}
                      <button
                        onClick={() => {
                          const url = encodeURIComponent(window.location.href);
                          const title = encodeURIComponent(poll?.title || "");
                          window.open(
                            `https://reddit.com/submit?url=${url}&title=${title}`,
                            "_blank",
                          );
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <svg
                          className="w-5 h-5 text-orange-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 13c0 .83-.67 1.5-1.5 1.5-.45 0-.86-.2-1.14-.52-.91.58-2.12.93-3.36.98.07.6.18 1.2.38 1.77.27.75.68 1.36 1.17 1.87.55.55 1.1 1.12 1.1 1.96 0 .68-.37 1.28-.92 1.62-.55.34-1.23.5-1.97.5-.84 0-1.6-.25-2.17-.67-.56-.42-.9-1.02-.9-1.68 0-.55.2-1.05.6-1.45.28-.28.66-.45 1.08-.48-.02-.05-.04-.1-.04-.15 0-.55.45-1 1-1s1 .45 1 1c0 .05-.02.1-.04.15 1.24-.05 2.45-.4 3.36-.98-.28-.32-.69-.52-1.14-.52-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5c0-.47-.22-.89-.56-1.17.77-.36 1.46-.87 2.05-1.5.66-.71 1.05-1.62 1.12-2.58 1.44-.07 2.62-1.26 2.62-2.72z" />
                        </svg>
                        Reddit
                      </button>

                      {/* Email */}
                      <button
                        onClick={() => {
                          const url = window.location.href;
                          const subject = encodeURIComponent(
                            `Check out this poll: ${poll?.title}`,
                          );
                          const body = encodeURIComponent(
                            `I thought you might be interested in this poll:\n\n${url}\n\nVote now!`,
                          );
                          window.location.href = `mailto:?subject=${subject}&body=${body}`;
                          setShowShareMenu(false);
                        }}
                        className="flex items-center w-full gap-3 px-3 py-2 text-sm text-gray-300 transition-colors rounded-lg hover:bg-white/10"
                      >
                        <svg
                          className="w-5 h-5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                        Email
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            {poll.title}
          </h1>
          <p className="text-lg text-gray-400">{poll.description}</p>

          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              <span>{poll.candidates.length} Candidates</span>
            </div>
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4" />
              <span>{totalVotes.toLocaleString()} Total Votes</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              <span>Ends {timeLeft}</span>
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Candidates</h2>

          {poll.candidates.map((candidate) => {
            const percentage = getVotePercentage(candidate._id);
            const isSelected = selectedCandidate === candidate._id;
            const hasVoted = poll.userVoted || false;

            return (
              <div
                key={candidate._id}
                className={`p-6 transition-all border rounded-xl ${
                  hasVoted && isSelected
                    ? "border-red-500 bg-gradient-to-r from-red-500/20 to-red-600/20"
                    : "border-gray-800 bg-gradient-to-br from-gray-900 to-black"
                } hover:border-red-500/50`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
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
                        <span className="px-2 py-0.5 text-xs font-medium text-green-500 bg-green-500/10 rounded-full">
                          Your Vote
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
                    <div
                      className="h-full transition-all duration-500 rounded-full bg-gradient-to-r from-red-500 to-red-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vote Info */}
        {poll.userVoted && (
          <div className="p-4 mt-6 text-center border rounded-lg bg-green-500/10 border-green-500/30">
            <CheckCircleIcon className="inline-block w-5 h-5 mr-2 text-green-500" />
            <span className="text-green-500">Thank you for voting!</span>
          </div>
        )}

        {!isActive && !poll.userVoted && (
          <div className="p-4 mt-6 text-center border rounded-lg bg-gray-500/10 border-gray-500/30">
            <ClockIcon className="inline-block w-5 h-5 mr-2 text-gray-500" />
            <span className="text-gray-500">This poll has ended</span>
          </div>
        )}
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
