"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchPolls } from "@/store/slices/pollSlice";
import CategoryFilter from "@/components/home/CategoryFilter";
import PollCard from "@/components/polls/PollCard";
import Sidebar from "@/components/home/Sidebar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Hero from "@/components/home/Hero";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { polls, isLoading, error } = useAppSelector((state) => state.polls);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const params: any = { limit: 10 }; // ✅ Changed from 50 to 10 - Show only latest 10 polls
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    dispatch(fetchPolls(params));
  }, [dispatch, selectedCategory, refreshTrigger]);

  useEffect(() => {
    const counts: Record<string, number> = {};
    polls.forEach((poll) => {
      counts[poll.category] = (counts[poll.category] || 0) + 1;
    });
    counts.all = polls.length;
    setCategoryCounts(counts);
  }, [polls]);

  const handleVoteSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Get only the latest 10 polls (limit to 10)
  const filteredPolls = selectedCategory
    ? polls.filter((poll) => poll.category === selectedCategory).slice(0, 10)
    : polls.slice(0, 10);

  const activePollsCount = polls.filter(
    (p) => p.isPublished && new Date(p.endDate) > new Date()
  ).length;

  if (error) {
    return (
      <main className="min-h-screen bg-black">
        <Hero />
        <div className="px-4 py-20 mx-auto text-center max-w-7xl">
          <div className="mb-4 text-6xl text-red-500">⚠️</div>
          <h2 className="mb-2 text-2xl font-bold text-white">Unable to Load Polls</h2>
          <p className="mb-6 text-gray-400">{error}</p>
          <button onClick={() => dispatch(fetchPolls({ limit: 10 }))} className="btn-primary">
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
      <div className="py-4 bg-gradient-to-r from-red-500/5 to-transparent border-y border-red-500/10 top-16 backdrop-blur-sm">
        <div className="px-4 mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{polls.length}</div>
              <div className="text-xs text-gray-500">Total Polls</div>
            </div>
            <div className="w-px h-8 my-auto bg-gray-800" />
            <div>
              <div className="text-2xl font-bold text-green-400">{activePollsCount}</div>
              <div className="text-xs text-gray-500">Active Polls</div>
            </div>
            <div className="w-px h-8 my-auto bg-gray-800" />
            <div>
              <div className="text-2xl font-bold text-red-400">
                {polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Total Votes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {/* Categories Section */}
        <div className="mb-8">
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Left Column - Poll Feed */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex items-center justify-between px-3 py-3 mb-6 rounded-md bg-gradient-to-r from-red-500/20 to-transparent border-y border-red-500/10">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedCategory 
                    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Polls` 
                    : "Latest Polls"}
                </h3>
                <p className="text-sm text-gray-500">
                  Mark your vote and see real-time results. {activePollsCount} active polls to choose from!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-red-500/20 text-red-400' : 'text-gray-500 hover:text-white'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Polls Grid/List - Showing only latest 10 */}
            {isLoading ? (
              <LoadingSpinner />
            ) : filteredPolls.length === 0 ? (
              <div className="py-12 text-center border border-gray-800 bg-gray-900/30 rounded-2xl">
                <div className="mb-4 text-6xl">📭</div>
                <h3 className="mb-2 text-xl font-semibold text-white">No polls found</h3>
                <p className="text-gray-400">
                  {selectedCategory
                    ? `No polls available in ${selectedCategory} category yet.`
                    : "No polls available yet. Check back later!"}
                </p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6" 
                  : "space-y-4"
                }>
                  {filteredPolls.map((poll) => (
                    <PollCard
                      key={poll._id}
                      poll={poll}
                      onVoteSuccess={handleVoteSuccess}
                      viewMode={viewMode}
                    />
                  ))}
                </div>
                
                {/* Show "View More" button if there are more polls */}
                {!selectedCategory && polls.length > 10 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        const params: any = { limit: 50 };
                        dispatch(fetchPolls(params));
                      }}
                      className="px-6 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
                    >
                      View All {polls.length} Polls
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="flex-shrink-0 lg:w-80">
            <Sidebar polls={polls} categories={categoryCounts} />
          </div>
        </div>
      </div>
    </main>
  );
}