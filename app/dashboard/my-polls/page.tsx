// app/dashboard/my-polls/page.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchPolls } from "@/store/slices/pollSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ChartBarIcon,
  UsersIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
} from "@heroicons/react/24/solid";

import type { Poll } from "@/store/slices/pollSlice";

export default function MyPollsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { polls, isLoading } = useAppSelector((state) => state.polls);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<"created" | "voted">("created");

  // Use useMemo instead of useState + useEffect for derived data
  const createdPolls = useMemo(() => {
    if (polls.length > 0 && user) {
      return polls.filter((p) => p.createdBy?._id === user._id);
    }
    return [];
  }, [polls, user]);

  const votedPolls = useMemo(() => {
    if (polls.length > 0 && user) {
      return polls.filter((p) => p.userVoted === true);
    }
    return [];
  }, [polls, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(fetchPolls({ limit: 100 }));
  }, [dispatch, isAuthenticated, router]);

  const getStatusBadge = (poll: Poll) => {
    if (!poll.isPublished) {
      return { text: "Draft", color: "bg-yellow-500/20 text-yellow-400" };
    }
    if (new Date(poll.endDate) < new Date()) {
      return { text: "Ended", color: "bg-gray-500/20 text-gray-400" };
    }
    return { text: "Active", color: "bg-green-500/20 text-green-400" };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Polls</h1>
            <p className="text-gray-400">
              Manage your created polls and track your votes
            </p>
          </div>
          <button
            onClick={() => router.push("/create-poll")}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg"
          >
            <PlusCircleIcon className="w-5 h-5" />
            Create New Poll
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("created")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "created"
                ? "text-red-400 border-b-2 border-red-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Created ({createdPolls.length})
          </button>
          <button
            onClick={() => setActiveTab("voted")}
            className={`px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "voted"
                ? "text-red-400 border-b-2 border-red-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Voted ({votedPolls.length})
          </button>
        </div>

        {/* Created Polls Tab */}
        {activeTab === "created" && (
          <>
            {createdPolls.length === 0 ? (
              <div className="py-12 text-center border border-gray-800 rounded-xl bg-gray-900/30">
                <div className="mb-4 text-6xl">📝</div>
                <p className="text-gray-400">
                  You haven't created any polls yet
                </p>
                <button
                  onClick={() => router.push("/create-poll")}
                  className="px-4 py-2 mt-4 text-sm font-medium text-white transition-all bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Create Your First Poll
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {createdPolls.map((poll) => {
                  const status = getStatusBadge(poll);
                  return (
                    <div
                      key={poll._id}
                      className="p-4 transition-all border border-gray-800 cursor-pointer rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-red-500/30"
                      onClick={() => router.push(`/polls/${poll._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">
                            {poll.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {poll.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <UsersIcon className="w-3 h-3" />
                              {poll.candidates?.length || 0} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <ChartBarIcon className="w-3 h-3" />
                              {poll.totalVotes || 0} votes
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-xs text-gray-500">
                            {status.text === "Active" ? "Live" : status.text}
                          </div>
                          {status.text === "Active" && (
                            <div className="px-2 py-0.5 mt-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                              Live
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Voted Polls Tab */}
        {activeTab === "voted" && (
          <>
            {votedPolls.length === 0 ? (
              <div className="py-12 text-center border border-gray-800 rounded-xl bg-gray-900/30">
                <div className="mb-4 text-6xl">🗳️</div>
                <p className="text-gray-400">
                  You haven't voted in any polls yet
                </p>
                <button
                  onClick={() => router.push("/")}
                  className="px-4 py-2 mt-4 text-sm font-medium text-white transition-all bg-red-500 rounded-lg hover:bg-red-600"
                >
                  Browse Polls
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {votedPolls.map((poll) => {
                  const status = getStatusBadge(poll);
                  const votedCandidate = poll.candidates?.find(
                    (c) => c._id === poll.userVoteCandidateId,
                  );

                  return (
                    <div
                      key={poll._id}
                      className="p-4 transition-all border cursor-pointer border-green-500/30 rounded-xl bg-gradient-to-r from-gray-900 to-black hover:border-green-500/50"
                      onClick={() => router.push(`/polls/${poll._id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-green-500">
                              You voted
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${status.color}`}
                            >
                              {status.text}
                            </span>
                          </div>
                          <h3 className="font-semibold text-white">
                            {poll.title}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {poll.description}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <UsersIcon className="w-3 h-3" />
                              {poll.candidates?.length || 0} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <ChartBarIcon className="w-3 h-3" />
                              {poll.totalVotes || 0} votes
                            </span>
                            {votedCandidate && (
                              <span className="flex items-center gap-1 text-green-500">
                                <CheckCircleIcon className="w-3 h-3" />
                                Voted for: {votedCandidate.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {status.text === "Active" ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1 text-xs text-green-500">
                                <ClockIcon className="w-3 h-3" />
                                <span>Active</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(poll.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          ) : (
                            <TrophyIcon className="w-8 h-8 text-yellow-500/50" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
