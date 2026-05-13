'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PollCard from '@/components/polls/PollCard';

export default function PollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPolls, setTotalPolls] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPolls();
  }, [page, selectedCategory]);

  const fetchPolls = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page, limit: 12 };
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      const response = await api.get('/polls', { params });
      
      // Handle different response structures
      const pollsData = response.data.data?.polls || response.data.polls || [];
      setPolls(pollsData);
      setTotalPolls(response.data.total || response.data.count || pollsData.length);
      setTotalPages(response.data.pagination?.pages || Math.ceil((response.data.total || pollsData.length) / 12));
      
      // Extract unique categories for filter
      if (pollsData.length > 0 && categories.length === 0) {
        const uniqueCategories = [...new Set(pollsData.map((poll: any) => poll.category))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Failed to fetch polls:', error);
      setError('Failed to load polls. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSuccess = () => {
    fetchPolls(); // Refresh polls after vote
  };

  if (loading && page === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-black">
      <div className="max-w-7xl px-4 mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">All Polls</h1>
          <p className="text-gray-400">Browse and vote on all available polls</p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory 
                  ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  selectedCategory === category 
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/25' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-12 text-center">
            <div className="mb-4 text-6xl text-red-500">⚠️</div>
            <p className="text-gray-400">{error}</p>
            <button
              onClick={fetchPolls}
              className="px-4 py-2 mt-4 text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Polls Grid */}
        {!error && (
          <>
            {polls.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mb-4 text-6xl">📭</div>
                <p className="text-gray-400">
                  {selectedCategory 
                    ? `No polls available in ${selectedCategory} category` 
                    : 'No polls available yet'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {polls.map((poll: any) => (
                    <PollCard
                      key={poll._id}
                      poll={poll}
                      onVoteSuccess={handleVoteSuccess}
                      viewMode="grid"
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 text-sm font-medium text-white transition-all bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                              page === pageNum
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/25'
                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 text-sm font-medium text-white transition-all bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* Total polls info */}
                <div className="mt-4 mb-[100] text-center">
                  <p className="text-sm text-gray-500">
                    Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, totalPolls)} of {totalPolls} polls
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}