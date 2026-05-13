"use client";

import { useState, useEffect } from "react";
import PollCard from "@/components/polls/PollCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface FeaturedPollsProps {
  polls: any[];
  loading: boolean;
  title?: string;
  subtitle?: string;
}

export default function FeaturedPolls({
  polls,
  loading,
  title = "Latest Polls",
  subtitle = "Cast your vote and see real-time results",
}: FeaturedPollsProps) {
  if (loading) {
    return (
      <div className="py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-6xl">📭</div>
        <h3 className="mb-2 text-xl font-semibold text-white">
          No polls found
        </h3>
        <p className="text-gray-400">
          Check back later for new polls in this category
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 text-center">
        <h2 className="mb-3 text-3xl font-bold text-white">{title}</h2>
        <p className="text-gray-400">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {polls.map((poll) => (
          <PollCard key={poll._id} poll={poll} />
        ))}
      </div>
    </div>
  );
}
