// app/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchPolls } from "@/store/slices/pollSlice";
import PollCard from "@/components/polls/PollCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ChartBarIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  TrophyIcon,
  HomeIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Squares2X2Icon,
  ListBulletIcon,
  StarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

interface DashboardStats {
  totalPolls: number;
  totalVotes: number;
  activePolls: number;
  createdPolls: number;
}

// Sidebar Component
const DashboardSidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  // In your dashboard sidebar, add the My Votes link
  const menuItems = [
    {
      name: "Overview",
      icon: Squares2X2Icon,
      href: "/dashboard",
      current: pathname === "/dashboard",
    },
    {
      name: "My Polls",
      icon: ListBulletIcon,
      href: "/dashboard/my-polls",
      current: pathname === "/dashboard/my-polls",
    },
    {
      name: "My Votes",
      icon: StarIcon,
      href: "/dashboard/my-votes",
      current: pathname === "/dashboard/my-votes",
    },
    {
      name: "Profile",
      icon: UserIcon,
      href: "/dashboard/profile",
      current: pathname === "/dashboard/profile",
    },
    {
      name: "Settings",
      icon: Cog6ToothIcon,
      href: "/dashboard/settings",
      current: pathname === "/dashboard/settings",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className="flex-shrink-0 w-64">
      <div className="sticky top-20">
        {/* User Profile */}
        <div className="p-4 mb-6 text-center border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
          <div className="w-20 h-20 mx-auto mb-3 overflow-hidden rounded-full bg-gradient-to-r from-red-500 to-red-600 p-0.5">
            <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-full">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          </div>
          <h3 className="font-semibold text-white">{user?.name || "User"}</h3>
          <p className="text-xs text-gray-500">
            {user?.email || "user@example.com"}
          </p>
          <div className="mt-2 px-2 py-0.5 inline-block rounded-full bg-green-500/20 text-green-400 text-xs">
            {user?.role === "admin" ? "Admin" : "Member"}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                item.current
                  ? "bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${item.current ? "text-red-400" : "text-gray-500 group-hover:text-white"}`}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="pt-6 mt-6 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full gap-3 px-4 py-2.5 text-sm font-medium text-gray-400 transition-all rounded-lg hover:text-white hover:bg-white/5"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};

// Main Dashboard Content
export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { polls, isLoading } = useAppSelector((state) => state.polls);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [stats, setStats] = useState<DashboardStats>({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    createdPolls: 0,
  });
  const [myPolls, setMyPolls] = useState([]);
  const [recentVotes, setRecentVotes] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    dispatch(fetchPolls({ limit: 100 }));
  }, [dispatch, isAuthenticated, router]);

  useEffect(() => {
    if (polls.length > 0) {
      // Calculate statistics
      const activePolls = polls.filter(
        (p) => p.isPublished && new Date(p.endDate) > new Date(),
      ).length;

      const totalVotes = polls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

      const createdPolls = polls.filter(
        (p) => p.createdBy?._id === user?._id,
      ).length;

      setStats({
        totalPolls: polls.length,
        totalVotes,
        activePolls,
        createdPolls,
      });

      // Get user's created polls
      setMyPolls(
        polls.filter((p) => p.createdBy?._id === user?._id).slice(0, 5),
      );
    }
  }, [polls, user]);

  if (!isAuthenticated) {
    return null;
  }

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
        <div className="flex gap-8">
          {/* Sidebar */}
          <DashboardSidebar />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                Dashboard Overview
              </h1>
              <p className="text-gray-400">
                Welcome back, {user?.name || "User"}!
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-500/10">
                    <ChartBarIcon className="w-6 h-6 text-red-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats.totalPolls}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Total Polls</p>
              </div>

              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/10">
                    <UsersIcon className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats.totalVotes.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Total Votes</p>
              </div>

              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/10">
                    <ClockIcon className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats.activePolls}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Active Polls</p>
              </div>

              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-purple-500/10">
                    <UserGroupIcon className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    {stats.createdPolls}
                  </span>
                </div>
                <p className="text-sm text-gray-400">Polls Created</p>
              </div>
            </div>

            {/* Recent Polls Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Recent Polls
                </h2>
                <button
                  onClick={() => router.push("/dashboard/my-polls")}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  View all →
                </button>
              </div>

              {myPolls.length === 0 ? (
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
                  {myPolls.map((poll: any) => (
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
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                poll.isPublished
                                  ? new Date(poll.endDate) > new Date()
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-gray-500/20 text-gray-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {poll.isPublished
                                ? new Date(poll.endDate) > new Date()
                                  ? "Active"
                                  : "Ended"
                                : "Draft"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {poll.isPublished &&
                          new Date(poll.endDate) > new Date() ? (
                            <div className="px-3 py-1 text-xs text-green-400 rounded-full bg-green-500/20">
                              Live
                            </div>
                          ) : (
                            <TrophyIcon className="w-8 h-8 text-yellow-500/50" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <CheckCircleIcon className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="font-semibold text-white">Recent Votes</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Track your voting history and see which polls you've
                  participated in.
                </p>
                <button
                  onClick={() => router.push("/dashboard/my-votes")}
                  className="mt-4 text-sm text-red-400 hover:text-red-300"
                >
                  View My Votes →
                </button>
              </div>

              <div className="p-6 transition-all border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black hover:border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <ChartBarIcon className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="font-semibold text-white">Analytics</h3>
                </div>
                <p className="text-sm text-gray-400">
                  View detailed analytics about your polls and voting patterns.
                </p>
                <button
                  onClick={() => router.push("/dashboard/analytics")}
                  className="mt-4 text-sm text-red-400 hover:text-red-300"
                >
                  View Analytics →
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
