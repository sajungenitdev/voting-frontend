"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // ✅ Change this
import { castVote, fetchPolls } from "@/store/slices/pollSlice";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

interface VoteButtonProps {
  pollId: string;
  candidateId: string;
  candidateName: string;
  disabled?: boolean;
  hasVoted?: boolean;
  onVoteSuccess?: () => void;
  onAuthRequired?: () => void;
}

export default function VoteButton({
  pollId,
  candidateId,
  candidateName,
  disabled,
  hasVoted = false,
  onVoteSuccess,
  onAuthRequired,
}: VoteButtonProps) {
  const dispatch = useAppDispatch(); // ✅ Use typed dispatch
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isVoting, setIsVoting] = useState(false);
  const [voted, setVoted] = useState(hasVoted);

  const handleVote = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    // Prevent duplicate votes
    if (voted || hasVoted) {
      console.log("Already voted - preventing duplicate");
      return;
    }

    setIsVoting(true);
    try {
      const result = await dispatch(castVote({ pollId, candidateId })).unwrap();
      console.log("Vote successful:", result);
      setVoted(true);

      // Refresh polls to get updated data
      dispatch(fetchPolls({ limit: 50 }));

      onVoteSuccess?.();
    } catch (error: any) {
      console.error("Vote failed:", error);
      // If error message indicates already voted, mark as voted
      if (
        error?.message?.includes("already voted") ||
        error?.type === "ALREADY_VOTED"
      ) {
        setVoted(true);
        onVoteSuccess?.();
      }
    } finally {
      setIsVoting(false);
    }
  };

  // If already voted, show voted badge (no button)
  if (voted || hasVoted) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 text-sm text-green-500">
        <CheckCircleIcon className="w-4 h-4" />
        <span>✓ Vote Cast</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleVote}
      disabled={disabled || isVoting || voted}
      className="w-full px-3 py-2 text-sm font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isVoting ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
          <span>Voting...</span>
        </div>
      ) : (
        `Confirm Vote for ${candidateName}`
      )}
    </button>
  );
}
