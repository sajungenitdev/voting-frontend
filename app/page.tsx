"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPolls } from "@/store/slices/pollSlice";
import { fetchCategories } from "@/store/slices/categorySlice";
import type { Poll } from "@/store/slices/pollSlice"; // ✅ Import the type from pollSlice
import CategoryFilter from "@/components/home/CategoryFilter";
import PollCard from "@/components/polls/PollCard";
import Sidebar from "@/components/home/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Hero from "@/components/home/Hero";

// ✅ Remove the local Poll interface - use the imported one instead

interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon?: string;
  isActive: boolean;
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { polls, isLoading, error } = useAppSelector((state) => state.polls);
  const { categories } = useAppSelector((state) => state.categories);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>("");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {},
  );
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [displayLimit, setDisplayLimit] = useState<number>(10);

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch polls based on selected category NAME
  useEffect(() => {
    const params: { limit: number; category?: string } = { limit: 100 };

    if (selectedCategoryName) {
      params.category = selectedCategoryName;
    }

    dispatch(fetchPolls(params));
  }, [dispatch, selectedCategoryName, refreshTrigger]);

  // Calculate category counts from polls
  useEffect(() => {
    const counts: Record<string, number> = {};

    polls.forEach((poll: Poll) => {
      const categoryName = poll.category;

      if (categoryName) {
        counts[categoryName] = (counts[categoryName] || 0) + 1;

        const category = categories.find(
          (cat: Category) => cat.name === categoryName,
        );
        if (category) {
          counts[category._id] = (counts[category._id] || 0) + 1;
        }
      }
    });

    counts.all = polls.length;

    setCategoryCounts(counts);
  }, [polls, categories]);

  const handleVoteSuccess = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleCategorySelect = useCallback(
    (categoryId: string) => {
      setSelectedCategoryId(categoryId);

      if (categoryId === "") {
        setSelectedCategoryName("");
        setDisplayLimit(10);
      } else {
        const category = categories.find(
          (cat: Category) => cat._id === categoryId,
        );
        const categoryName = category?.name || "";
        setSelectedCategoryName(categoryName);
        setDisplayLimit(10);
      }
    },
    [categories],
  );

  // Filter and sort polls - show latest first
  const filteredAndSortedPolls = useMemo(() => {
    let filtered = selectedCategoryName
      ? polls.filter((poll: Poll) => poll.category === selectedCategoryName)
      : [...polls];

    // Sort by creation date (newest first) - handle missing createdAt
    const sorted = filtered.sort((a: Poll, b: Poll) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    return sorted.slice(0, displayLimit);
  }, [polls, selectedCategoryName, displayLimit]);

  const activePollsCount = useMemo(() => {
    return polls.filter(
      (p: Poll) => p.isPublished && new Date(p.endDate) > new Date(),
    ).length;
  }, [polls]);

  const totalVotesCount = useMemo(() => {
    return polls.reduce((sum: number, p: Poll) => sum + (p.totalVotes || 0), 0);
  }, [polls]);

  const loadMorePolls = useCallback(() => {
    setDisplayLimit((prev) => prev + 10);
  }, []);

  const hasMorePolls = useMemo(() => {
    const totalFiltered = selectedCategoryName
      ? polls.filter((poll: Poll) => poll.category === selectedCategoryName)
          .length
      : polls.length;
    return displayLimit < totalFiltered;
  }, [polls, selectedCategoryName, displayLimit]);

  if (error) {
    return (
      <main className="min-h-screen bg-black">
        <Hero />
        <div className="px-4 py-20 mx-auto text-center max-w-7xl">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">
            Unable to Load Polls
          </h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button
            onClick={() => {
              const params: { limit: number; category?: string } = {
                limit: 100,
              };
              if (selectedCategoryName) params.category = selectedCategoryName;
              dispatch(fetchPolls(params));
            }}
            className="px-6 py-2 font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mb-20 bg-black">
      <Hero />

      {/* Stats Bar */}
      <div className="sticky z-30 py-4 bg-gradient-to-r from-red-500/5 to-transparent border-y border-red-500/10 backdrop-blur-sm top-16">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div className="cursor-pointer group">
              <div className="text-2xl font-bold text-white transition-colors group-hover:text-red-400">
                {polls.length}
              </div>
              <div className="text-xs text-gray-500">Total Polls</div>
            </div>
            <div className="w-px h-8 my-auto bg-gray-800" />
            <div className="cursor-pointer group">
              <div className="text-2xl font-bold text-green-400 transition-colors group-hover:text-green-300">
                {activePollsCount}
              </div>
              <div className="text-xs text-gray-500">Active Polls</div>
            </div>
            <div className="w-px h-8 my-auto bg-gray-800" />
            <div className="cursor-pointer group">
              <div className="text-2xl font-bold text-red-400 transition-colors group-hover:text-red-300">
                {totalVotesCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Votes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategoryId}
            onSelect={handleCategorySelect}
            categoryCounts={categoryCounts}
          />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main Content */}
          <div className="flex-1">
            {/* Header with View Toggle */}
            <div className="flex items-center justify-between px-3 py-3 mb-6 rounded-md bg-gradient-to-r from-red-500/20 to-transparent border-y border-red-500/10">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedCategoryName
                    ? `${selectedCategoryName.charAt(0).toUpperCase() + selectedCategoryName.slice(1)} Polls`
                    : "Latest Polls"}
                </h3>
                <p className="text-sm text-gray-500">
                  Showing latest {filteredAndSortedPolls.length} of{" "}
                  {selectedCategoryName
                    ? polls.filter((p) => p.category === selectedCategoryName)
                        .length
                    : polls.length}{" "}
                  polls
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
                      : "text-gray-500 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="Grid view"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/20"
                      : "text-gray-500 hover:text-white hover:bg-white/10"
                  }`}
                  aria-label="List view"
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
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && polls.length === 0 ? (
              <LoadingSpinner />
            ) : filteredAndSortedPolls.length === 0 ? (
              <div className="py-12 text-center border border-gray-800 bg-gray-900/30 rounded-2xl">
                <div className="mb-4 text-6xl animate-bounce">📭</div>
                <h3 className="mb-2 text-xl font-semibold text-white">
                  No polls found
                </h3>
                <p className="text-gray-400">
                  {selectedCategoryName
                    ? `No polls available in ${selectedCategoryName} category yet.`
                    : "No polls available yet. Check back later!"}
                </p>
              </div>
            ) : (
              <>
                {/* Polls Grid/List */}
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
                      : "space-y-4"
                  }
                >
                  {filteredAndSortedPolls.map((poll: Poll) => (
                    <PollCard
                      key={poll._id}
                      poll={poll}
                      onVoteSuccess={handleVoteSuccess}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {hasMorePolls && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={loadMorePolls}
                      className="px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 hover:scale-105 transform duration-200"
                    >
                      Load More Polls ({displayLimit} /{" "}
                      {selectedCategoryName
                        ? polls.filter(
                            (p) => p.category === selectedCategoryName,
                          ).length
                        : polls.length}
                      )
                    </button>
                  </div>
                )}

                {/* View All Button when filtered */}
                {selectedCategoryName &&
                  polls.length > displayLimit &&
                  !hasMorePolls && (
                    <div className="mt-8 text-center">
                      <button
                        onClick={() => {
                          setSelectedCategoryId("");
                          setSelectedCategoryName("");
                          setDisplayLimit(10);
                        }}
                        className="px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-lg hover:from-gray-500 hover:to-gray-600"
                      >
                        View All Categories
                      </button>
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex-shrink-0 lg:w-80">
            <Sidebar polls={polls} categories={categoryCounts} />
          </div>
        </div>
      </div>
    </main>
  );
}
