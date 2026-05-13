// app/b2b/data/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { restoreSession } from '@/store/slices/authSlice';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShoppingBagIcon,
  EyeIcon,
  TrophyIcon,
} from '@heroicons/react/24/solid';

interface PurchaseInfo {
  subscriptionTier: string;
  purchasedCategories: string[];
  maxCategoriesAllowed: number | string;
  remainingCategories: number | string;
  subscriptionValidUntil: string;
  remainingDays: number;
}

interface CategoryData {
  categoryName: string;
  totalPolls: number;
  totalVotes: number;
  uniqueVoters: number;
  polls: Array<{
    id: string;
    title: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    location: string;
    age: string;
    gender: string;
    registeredAt: string;
    isVerified: boolean;
    lastLogin: string;
  }>;
  votes: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    pollTitle: string;
    votedAt: string;
  }>;
}

export default function B2BDataPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<Record<string, CategoryData>>({});
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [isExporting, setIsExporting] = useState(false);
  const [loadingExport, setLoadingExport] = useState<string | null>(null);

  useEffect(() => {
    dispatch(restoreSession());
    fetchData();
  }, [dispatch]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/b2b/data');
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        setData(response.data.data);
        setPurchaseInfo(response.data.purchaseInfo);
        
        // Initialize expanded states
        const categories = Object.keys(response.data.data);
        const initialExpanded: Record<string, boolean> = {};
        const initialSections: Record<string, Record<string, boolean>> = {};
        
        categories.forEach(cat => {
          initialExpanded[cat] = true;
          initialSections[cat] = {
            overview: true,
            users: true,
            votes: true,
          };
        });
        
        setExpandedCategories(initialExpanded);
        setExpandedSections(initialSections);
      }
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (error.response?.status === 401) {
        dispatch(restoreSession());
        toast.error('Session expired. Please login again.');
        router.push('/b2b/login');
      } else if (error.response?.status === 403) {
        toast.error('Please purchase a subscription to access data');
        router.push('/b2b/pricing');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const exportCategoryData = async (category: string, format: 'json' | 'csv') => {
    setLoadingExport(category);
    try {
      const categoryData = data[category];
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${category}_data_${timestamp}.${format}`;
      
      if (format === 'csv') {
        // Create CSV for this category
        let csv = `"Category","${category}"\n`;
        csv += `"Total Polls","${categoryData.totalPolls}"\n`;
        csv += `"Total Votes","${categoryData.totalVotes}"\n`;
        csv += `"Unique Voters","${categoryData.uniqueVoters}"\n\n`;
        
        csv += `"--- USERS ---"\n`;
        csv += `"Name","Email","Phone","Location","Age","Gender","Verified","Registered"\n`;
        categoryData.users.forEach(user => {
          csv += `"${user.name}","${user.email}","${user.phoneNumber}","${user.location}","${user.age}","${user.gender}","${user.isVerified ? 'Yes' : 'No'}","${new Date(user.registeredAt).toLocaleDateString()}"\n`;
        });
        
        csv += `\n"--- VOTES ---"\n`;
        csv += `"User Name","User Email","Poll Title","Voted At"\n`;
        categoryData.votes.forEach(vote => {
          csv += `"${vote.userName}","${vote.userEmail}","${vote.pollTitle}","${new Date(vote.votedAt).toLocaleString()}"\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const jsonStr = JSON.stringify(categoryData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success(`${category} data exported as ${format.toUpperCase()}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export ${category} data`);
    } finally {
      setLoadingExport(null);
    }
  };

  const exportAllData = async () => {
    setIsExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `all_purchased_data_${timestamp}.${exportFormat}`;
      
      if (exportFormat === 'csv') {
        let csv = `"--- PURCHASED CATEGORIES SUMMARY ---"\n`;
        csv += `"Category","Total Polls","Total Votes","Unique Voters"\n`;
        
        for (const [category, categoryData] of Object.entries(data)) {
          csv += `"${category}",${categoryData.totalPolls},${categoryData.totalVotes},${categoryData.uniqueVoters}\n`;
        }
        
        csv += `\n\n`;
        
        for (const [category, categoryData] of Object.entries(data)) {
          csv += `"========== ${category.toUpperCase()} DATA =========="\n\n`;
          
          csv += `"--- USERS ---"\n`;
          csv += `"Name","Email","Phone","Location","Age","Gender","Verified","Registered"\n`;
          categoryData.users.forEach(user => {
            csv += `"${user.name}","${user.email}","${user.phoneNumber}","${user.location}","${user.age}","${user.gender}","${user.isVerified ? 'Yes' : 'No'}","${new Date(user.registeredAt).toLocaleDateString()}"\n`;
          });
          
          csv += `\n"--- VOTES ---"\n`;
          csv += `"User Name","User Email","Poll Title","Voted At"\n`;
          categoryData.votes.forEach(vote => {
            csv += `"${vote.userName}","${vote.userEmail}","${vote.pollTitle}","${new Date(vote.votedAt).toLocaleString()}"\n`;
          });
          
          csv += `\n\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      toast.success(`All data exported as ${exportFormat.toUpperCase()}!`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleSection = (category: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [section]: !prev[category]?.[section],
      },
    }));
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  const purchasedCategories = purchaseInfo?.purchasedCategories || [];
  const hasPurchasedData = Object.keys(data).length > 0;

  return (
    <div className="min-h-screen pt-20 bg-black">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Data Access Portal</h1>
          <p className="mt-2 text-gray-400">
            Access and export your purchased data categories
          </p>
        </div>

        {/* Purchase Info Card */}
        {purchaseInfo && (
          <div className="p-6 mb-8 border border-purple-500/30 rounded-2xl bg-gradient-to-br from-purple-900/20 to-purple-800/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Subscription Details</h3>
                <p className="text-sm text-gray-400">
                  Plan: <span className="font-semibold text-purple-400 capitalize">{purchaseInfo.subscriptionTier}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Valid until: {formatDate(purchaseInfo.subscriptionValidUntil)} ({purchaseInfo.remainingDays} days remaining)
                </p>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 text-center rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-purple-400">{purchasedCategories.length}</p>
                  <p className="text-xs text-gray-500">Categories Purchased</p>
                </div>
                <div className="px-4 py-2 text-center rounded-lg bg-white/5">
                  <p className="text-2xl font-bold text-purple-400">{purchaseInfo.remainingCategories}</p>
                  <p className="text-xs text-gray-500">Remaining Slots</p>
                </div>
              </div>
            </div>

            {purchasedCategories.length > 0 && (
              <div className="pt-4 mt-4 border-t border-purple-500/30">
                <p className="mb-2 text-sm text-gray-400">Your Purchased Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {purchasedCategories.map((category) => (
                    <span
                      key={category}
                      className="px-3 py-1 text-xs font-medium text-purple-400 capitalize rounded-full bg-purple-500/20"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Export Controls */}
        {hasPurchasedData && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 mb-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Export format:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setExportFormat('json')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    exportFormat === 'json'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  JSON
                </button>
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`px-3 py-1 text-sm rounded-lg transition-all ${
                    exportFormat === 'csv'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  CSV
                </button>
              </div>
            </div>
            <button
              onClick={exportAllData}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              {isExporting ? 'Exporting...' : `Export All (${Object.keys(data).length} categories)`}
            </button>
          </div>
        )}

        {/* No Data Message */}
        {!hasPurchasedData && (
          <div className="p-12 text-center border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
            <div className="mb-4 text-6xl">📊</div>
            <h2 className="text-xl font-semibold text-white">No Data Access</h2>
            <p className="mt-2 text-gray-400">You haven't purchased any data categories yet.</p>
            <button
              onClick={() => router.push('/b2b/pricing')}
              className="inline-flex items-center gap-2 px-6 py-2 mt-4 text-white transition-all rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:shadow-lg"
            >
              <ShoppingBagIcon className="w-4 h-4" />
              Purchase Data Access
            </button>
          </div>
        )}

        {/* Data by Category */}
        {hasPurchasedData && Object.entries(data).map(([category, categoryData]) => (
          <div key={category} className="mb-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
            {/* Category Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center flex-1 gap-3 text-left"
              >
                <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                  <TrophyIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white capitalize">{category}</h2>
                  <p className="text-xs text-gray-500">
                    {categoryData.totalPolls} polls • {categoryData.totalVotes} votes • {categoryData.uniqueVoters} voters
                  </p>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">Purchased</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => exportCategoryData(category, 'json')}
                  disabled={loadingExport === category}
                  className="px-3 py-1 text-xs text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {loadingExport === category ? '...' : 'JSON'}
                </button>
                <button
                  onClick={() => exportCategoryData(category, 'csv')}
                  disabled={loadingExport === category}
                  className="px-3 py-1 text-xs text-gray-400 bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                  {loadingExport === category ? '...' : 'CSV'}
                </button>
                {expandedCategories[category] ? (
                  <ChevronUpIcon onClick={() => toggleCategory(category)} className="w-5 h-5 text-gray-400 cursor-pointer" />
                ) : (
                  <ChevronDownIcon onClick={() => toggleCategory(category)} className="w-5 h-5 text-gray-400 cursor-pointer" />
                )}
              </div>
            </div>

            {expandedCategories[category] && (
              <div className="p-5">
                {/* Overview Stats */}
                <div className="mb-6">
                  <button
                    onClick={() => toggleSection(category, 'overview')}
                    className="flex items-center justify-between w-full p-3 mb-2 rounded-lg bg-white/5"
                  >
                    <span className="font-medium text-white">Overview Statistics</span>
                    {expandedSections[category]?.overview ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  {expandedSections[category]?.overview && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="p-4 text-center rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-white">{categoryData.totalPolls}</p>
                        <p className="text-xs text-gray-500">Total Polls</p>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-purple-400">{categoryData.totalVotes}</p>
                        <p className="text-xs text-gray-500">Total Votes</p>
                      </div>
                      <div className="p-4 text-center rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-green-400">{categoryData.uniqueVoters}</p>
                        <p className="text-xs text-gray-500">Unique Voters</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Users Section */}
                {categoryData.users.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection(category, 'users')}
                      className="flex items-center justify-between w-full p-3 mb-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <UsersIcon className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-white">Users ({categoryData.users.length})</span>
                      </div>
                      {expandedSections[category]?.users ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedSections[category]?.users && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-800">
                            <tr className="text-left">
                              <th className="p-2 text-gray-400">Name</th>
                              <th className="p-2 text-gray-400">Email</th>
                              <th className="p-2 text-gray-400">Location</th>
                              <th className="p-2 text-gray-400">Age/Gender</th>
                              <th className="p-2 text-gray-400">Verified</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryData.users.map((user) => (
                              <tr key={user.id} className="border-b border-gray-800/50 hover:bg-white/5">
                                <td className="p-2 font-medium text-white">{user.name}</td>
                                <td className="p-2 text-gray-400">{user.email}</td>
                                <td className="p-2 text-gray-400">{user.location}</td>
                                <td className="p-2 text-gray-400">{user.age} / {user.gender}</td>
                                <td className="p-2">
                                  {user.isVerified ? (
                                    <span className="text-green-500">✓</span>
                                  ) : (
                                    <span className="text-yellow-500">✗</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Votes Section */}
                {categoryData.votes.length > 0 && (
                  <div className="mb-6">
                    <button
                      onClick={() => toggleSection(category, 'votes')}
                      className="flex items-center justify-between w-full p-3 mb-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <ChartBarIcon className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-white">Recent Votes ({categoryData.votes.length})</span>
                      </div>
                      {expandedSections[category]?.votes ? (
                        <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    {expandedSections[category]?.votes && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b border-gray-800">
                            <tr className="text-left">
                              <th className="p-2 text-gray-400">User</th>
                              <th className="p-2 text-gray-400">Poll</th>
                              <th className="p-2 text-gray-400">Voted At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryData.votes.map((vote, idx) => (
                              <tr key={idx} className="border-b border-gray-800/50 hover:bg-white/5">
                                <td className="p-2 text-white">{vote.userName}</td>
                                <td className="p-2 text-gray-400">{vote.pollTitle}</td>
                                <td className="p-2 text-gray-400">{formatDateTime(vote.votedAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}