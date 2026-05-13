// app/dashboard/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    memberSince: "",
    lastLogin: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setStats({
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString()
          : "N/A",
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "N/A",
      });
    }
  }, [isAuthenticated, router, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      // Try to call the backend if you added the endpoint
      const response = await api.put("/auth/update-profile", { name });

      if (response.data.success) {
        dispatch(updateUser({ name }));
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      // If endpoint doesn't exist, update locally only
      console.error("Backend update failed, updating locally only");
      dispatch(updateUser({ name }));
      toast.success("Profile updated locally! (Backend endpoint pending)");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleRefreshUserData = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/auth/me");
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        dispatch(updateUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setName(updatedUser.name);
        setStats({
          memberSince: updatedUser.createdAt
            ? new Date(updatedUser.createdAt).toLocaleDateString()
            : "N/A",
          lastLogin: updatedUser.lastLogin
            ? new Date(updatedUser.lastLogin).toLocaleString()
            : "N/A",
        });
        toast.success("User data refreshed!");
      }
    } catch (error: any) {
      toast.error("Failed to refresh user data");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-20 bg-black">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400">
              Manage your account information and preferences
            </p>
          </div>
          <button
            onClick={handleRefreshUserData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 transition-all bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              {/* Profile Card */}
              <div className="p-6 mb-6 text-center border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
                <div className="relative inline-block">
                  <div className="w-32 h-32 mx-auto overflow-hidden rounded-full bg-gradient-to-r from-red-500 to-red-600 p-0.5">
                    <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-full">
                      <span className="text-4xl font-bold text-white">
                        {name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">
                  {name}
                </h3>
                <p className="text-sm text-gray-400">{email}</p>
                <div className="mt-2 px-2 py-0.5 inline-block rounded-full bg-green-500/20 text-green-400 text-xs">
                  {user?.role === "admin" ? "Administrator" : "Member"}
                </div>
                {user?.isVerified && (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-500">
                    <CheckCircleIcon className="w-3 h-3" />
                    Verified Account
                  </div>
                )}
              </div>

              {/* Stats Card */}
              <div className="p-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
                <h4 className="mb-4 text-sm font-semibold tracking-wider text-gray-400 uppercase">
                  Account Statistics
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Member since</span>
                    <span className="text-sm text-white">
                      {stats.memberSince}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last login</span>
                    <span className="text-sm text-white">
                      {stats.lastLogin}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Forms */}
          <div className="lg:col-span-2">
            {/* Update Profile Form */}
            <div className="p-6 mb-8 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Edit Profile
              </h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </button>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="p-6 border border-gray-800 rounded-xl bg-gradient-to-br from-gray-900 to-black">
              <h2 className="mb-4 text-xl font-semibold text-white">
                Change Password
              </h2>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-300"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    New Password
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-300"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <KeyIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute text-gray-500 -translate-y-1/2 right-3 top-1/2 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {newPassword &&
                  confirmPassword &&
                  newPassword !== confirmPassword && (
                    <div className="text-sm text-red-500">
                      Passwords do not match
                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    isChangingPassword || newPassword !== confirmPassword
                  }
                  className="px-6 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
            </div>

            {/* Info Note */}
            <div className="p-4 mt-6 border rounded-lg bg-blue-500/10 border-blue-500/30">
              <p className="text-sm text-blue-400">
                💡 Note: Profile updates and password changes are saved
                securely. Your email address cannot be changed for security
                reasons.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
