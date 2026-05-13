"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPolls } from "@/store/slices/pollSlice";
import PollCard from "@/components/polls/PollCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Hero from "@/components/home/Hero";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { polls, isLoading, error } = useAppSelector((state) => state.polls);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    dispatch(fetchPolls({ limit: 10 }));
  }, [dispatch, refreshTrigger]);

  const handleVoteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (error) {
    return (
      <main className="min-h-screen bg-black">
        <Hero />
        <div className="container px-4 py-20 mx-auto text-center">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Unable to Load Polls
          </h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button
            onClick={() => dispatch(fetchPolls({}))}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Hero />
      <div className="container px-4 py-8 mx-auto">
        <h1 className="mb-8 text-3xl font-bold text-white">Latest Polls</h1>
        {isLoading ? (
          <LoadingSpinner />
        ) : polls.length === 0 ? (
          <div className="py-12 text-center border border-gray-800 bg-gray-900/30 rounded-2xl">
            <div className="mb-4 text-6xl">📭</div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              No polls found
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <PollCard
                key={poll._id}
                poll={poll}
                onVoteSuccess={handleVoteSuccess}
                viewMode="grid"
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
