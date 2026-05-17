"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  ArrowPathIcon,
  CalendarIcon,
  ClockIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  PencilSquareIcon,
  XMarkIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon,
  ChartBarIcon,
  LinkIcon,
  LanguageIcon,
  BellIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

interface UserStats {
  memberSince: string;
  lastLogin: string;
  totalVotes: number;
  totalPollsCreated: number;
  totalComments: number;
  accountStatus: string;
}

interface ProfileField {
  key: string;
  label: string;
  value: string;
  required?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [completedFields, setCompletedFields] = useState<string[]>([]);
  const [profileProgress, setProfileProgress] = useState(0);

  // Profile form state
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState({
    country: "",
    city: "",
    timezone: "UTC",
  });
  const [socialLinks, setSocialLinks] = useState({
    website: "",
    twitter: "",
    linkedin: "",
    github: "",
  });
  const [preferences, setPreferences] = useState({
    theme: "dark",
    notifications: {
      email: true,
      push: true,
      voteUpdates: true,
      pollEnding: true,
    },
    language: "en",
  });

  const [originalName, setOriginalName] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Stats state
  const [stats, setStats] = useState<UserStats>({
    memberSince: "N/A",
    lastLogin: "N/A",
    totalVotes: 0,
    totalPollsCreated: 0,
    totalComments: 0,
    accountStatus: "Active",
  });

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      { key: "name", value: name },
      { key: "fullName", value: fullName },
      { key: "phoneNumber", value: phoneNumber },
      { key: "bio", value: bio },
      { key: "location", value: location.country || location.city },
      { key: "companyName", value: companyName, required: false },
      { key: "socialLinks", value: Object.values(socialLinks).some((v) => v) },
    ];

    const requiredFields = fields.filter((f) => f.required !== false);
    const completed = requiredFields.filter(
      (f) => f.value && f.value.toString().trim() !== "",
    );
    const percentage = Math.floor(
      (completed.length / requiredFields.length) * 100,
    );

    setProfileProgress(percentage);
    setCompletedFields(completed.map((f) => f.key));
  };

  useEffect(() => {
    calculateProfileCompletion();
  }, [name, fullName, phoneNumber, bio, location, companyName, socialLinks]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (user) {
      setName(user.name || "");
      setFullName(user.fullName || "");
      setOriginalName(user.name || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setCompanyName(user.companyName || "");
      setBio(user.bio || "");

      if (user.location) {
        setLocation({
          country: user.location.country || "",
          city: user.location.city || "",
          timezone: user.location.timezone || "UTC",
        });
      }

      if (user.socialLinks) {
        setSocialLinks({
          website: user.socialLinks.website || "",
          twitter: user.socialLinks.twitter || "",
          linkedin: user.socialLinks.linkedin || "",
          github: user.socialLinks.github || "",
        });
      }

      if (user.preferences) {
        setPreferences({
          theme: user.preferences.theme || "dark",
          notifications: {
            email: user.preferences.notifications?.email ?? true,
            push: user.preferences.notifications?.push ?? true,
            voteUpdates: user.preferences.notifications?.voteUpdates ?? true,
            pollEnding: user.preferences.notifications?.pollEnding ?? true,
          },
          language: user.preferences.language || "en",
        });
      }

      setStats({
        memberSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A",
        lastLogin: user.lastLogin
          ? new Date(user.lastLogin).toLocaleString()
          : "N/A",
        totalVotes: user.statistics?.totalVotes || 0,
        totalPollsCreated: user.statistics?.totalPollsCreated || 0,
        totalComments: user.statistics?.totalComments || 0,
        accountStatus: user.isVerified ? "Verified" : "Unverified",
      });
    }
  }, [isAuthenticated, router, user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const updateData: any = { name };

      if (fullName !== user?.fullName) updateData.fullName = fullName;
      if (phoneNumber !== user?.phoneNumber)
        updateData.phoneNumber = phoneNumber;
      if (companyName !== user?.companyName)
        updateData.companyName = companyName;
      if (bio !== user?.bio) updateData.bio = bio;
      if (
        location.country !== user?.location?.country ||
        location.city !== user?.location?.city
      ) {
        updateData.location = location;
      }
      if (JSON.stringify(socialLinks) !== JSON.stringify(user?.socialLinks)) {
        updateData.socialLinks = socialLinks;
      }
      if (JSON.stringify(preferences) !== JSON.stringify(user?.preferences)) {
        updateData.preferences = preferences;
      }

      const response = await api.put("/auth/update-profile", updateData);

      if (response.data.success) {
        dispatch(updateUser(response.data.data.user));
        toast.success("Profile updated successfully!");
        setIsEditing(false);
        calculateProfileCompletion();
      }
    } catch (error: any) {
      console.error("Backend update failed:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
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

    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
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
        toast.success("User data refreshed!");
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Failed to refresh user data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const cancelEditing = () => {
    if (user) {
      setName(user.name || "");
      setFullName(user.fullName || "");
      setPhoneNumber(user.phoneNumber || "");
      setCompanyName(user.companyName || "");
      setBio(user.bio || "");
      if (user.location) {
        setLocation({
          country: user.location.country || "",
          city: user.location.city || "",
          timezone: user.location.timezone || "UTC",
        });
      }
      if (user.socialLinks) {
        setSocialLinks({
          website: user.socialLinks.website || "",
          twitter: user.socialLinks.twitter || "",
          linkedin: user.socialLinks.linkedin || "",
          github: user.socialLinks.github || "",
        });
      }
      if (user.preferences) {
        setPreferences({
          theme: user.preferences.theme || "dark",
          notifications: {
            email: user.preferences.notifications?.email ?? true,
            push: user.preferences.notifications?.push ?? true,
            voteUpdates: user.preferences.notifications?.voteUpdates ?? true,
            pollEnding: user.preferences.notifications?.pollEnding ?? true,
          },
          language: user.preferences.language || "en",
        });
      }
    }
    setIsEditing(false);
  };

  const getFieldStatus = (
    value: string | boolean | undefined,
    fieldName: string,
  ) => {
    const hasValue = value && value.toString().trim() !== "";
    const isCompleted = completedFields.includes(fieldName);
    return { hasValue, isCompleted };
  };

  const renderField = (
    label: string,
    value: string,
    fieldKey: string,
    icon?: React.ReactNode,
  ) => {
    const { hasValue } = getFieldStatus(value, fieldKey);
    return (
      <div className="p-4 transition-all border border-gray-800 rounded-xl bg-white/5 hover:border-gray-700">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {icon}
            <p className="text-xs text-gray-500">{label}</p>
          </div>
          {hasValue && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
        </div>
        <p className={`text-white ${!hasValue ? "opacity-50" : ""}`}>
          {value && value.trim() !== "" ? value : "N/A"}
        </p>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  const isB2BUser = user?.role === "b2b_buyer" || !!user?.companyName;
  const isProfileIncomplete = profileProgress < 100;

  // Get progress color
  const getProgressColor = () => {
    if (profileProgress < 30) return "from-red-500 to-red-600";
    if (profileProgress < 60) return "from-yellow-500 to-orange-500";
    if (profileProgress < 90) return "from-blue-500 to-cyan-500";
    return "from-green-500 to-emerald-500";
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              Profile Settings
            </h1>
            <p className="mt-1 text-gray-400">
              Manage your account information and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefreshUserData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 transition-all bg-gray-800 rounded-xl hover:bg-gray-700 disabled:opacity-50"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Profile Completion Progress */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 mb-8 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl bg-gradient-to-r ${getProgressColor()}`}
              >
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Profile Completion</h3>
                <p className="text-xs text-gray-400">
                  {completedFields.length}/6 fields completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`text-2xl font-bold bg-gradient-to-r ${getProgressColor()} bg-clip-text text-transparent`}
              >
                {profileProgress}%
              </span>
            </div>
          </div>

          <div className="relative h-3 overflow-hidden bg-gray-800 rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profileProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${getProgressColor()}`}
            />
          </div>

          {isProfileIncomplete && (
            <p className="flex items-center gap-1 mt-3 text-xs text-yellow-500">
              <PencilSquareIcon className="w-3 h-3" />
              Complete your profile to get better experience
            </p>
          )}
          {profileProgress === 100 && (
            <p className="flex items-center gap-1 mt-3 text-xs text-green-500">
              <CheckCircleIcon className="w-3 h-3" />
              Your profile is complete! 🎉
            </p>
          )}
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar - Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="sticky space-y-6 top-20">
              {/* Profile Card */}
              <div className="relative overflow-hidden border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-red-500/10 to-purple-500/10 blur-2xl" />
                <div className="relative p-6 text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 mx-auto overflow-hidden rounded-full bg-gradient-to-r from-red-500 to-red-600 p-0.5">
                      <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-full">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={name}
                            className="object-cover w-full h-full rounded-full"
                          />
                        ) : (
                          <span className="text-4xl font-bold text-white">
                            {name?.charAt(0).toUpperCase() || "U"}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 text-white transition-all bg-gray-800 rounded-full hover:bg-gray-700">
                      <CameraIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {name || fullName || "N/A"}
                  </h3>
                  <p className="text-sm text-gray-400">{email || "N/A"}</p>
                  {companyName && (
                    <p className="text-sm text-purple-400">{companyName}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400">
                      {user?.role === "admin"
                        ? "Administrator"
                        : user?.role === "b2b_buyer"
                          ? "B2B Enterprise"
                          : "Member"}
                    </span>
                    {user?.isVerified && (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400">
                        <CheckCircleIcon className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Card */}
              <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
                <h4 className="flex items-center gap-2 mb-4 text-sm font-semibold tracking-wider text-gray-400 uppercase">
                  <ChartBarIcon className="w-4 h-4" />
                  Account Statistics
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">
                        Member since
                      </span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {stats.memberSince}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Last login</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {stats.lastLogin}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <TrophyIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Total Votes</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {stats.totalVotes.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-gray-400">Comments</span>
                    </div>
                    <span className="text-sm font-medium text-white">
                      {stats.totalComments.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <div className="flex items-center gap-2">
                      <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Status</span>
                    </div>
                    <span className="text-sm font-medium text-green-400">
                      {stats.accountStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Forms */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6 lg:col-span-2"
          >
            {/* All Profile Fields - Always Visible */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-400">
                    All your profile details at a glance
                  </p>
                </div>
                {!isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}
              </div>

              {/* All Fields Display */}
              <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                {renderField(
                  "Display Name",
                  name,
                  "name",
                  <UserIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Full Name",
                  fullName,
                  "fullName",
                  <UserIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Email",
                  email,
                  "email",
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Phone Number",
                  phoneNumber,
                  "phoneNumber",
                  <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400" />,
                )}
                {isB2BUser &&
                  renderField(
                    "Company Name",
                    companyName,
                    "companyName",
                    <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />,
                  )}
                {renderField(
                  "Bio",
                  bio,
                  "bio",
                  <ChatBubbleLeftRightIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Location",
                  [location.city, location.country].filter(Boolean).join(", "),
                  "location",
                  <GlobeAltIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Website",
                  socialLinks.website,
                  "website",
                  <LinkIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Twitter",
                  socialLinks.twitter,
                  "twitter",
                  <LinkIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "LinkedIn",
                  socialLinks.linkedin,
                  "linkedin",
                  <LinkIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "GitHub",
                  socialLinks.github,
                  "github",
                  <LinkIcon className="w-4 h-4 text-gray-400" />,
                )}
                {renderField(
                  "Language",
                  preferences.language,
                  "language",
                  <LanguageIcon className="w-4 h-4 text-gray-400" />,
                )}
              </div>

              {/* Edit Form - Shown when editing */}
              <AnimatePresence mode="wait">
                {isEditing && (
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={handleUpdateProfile}
                    className="pt-6 mt-6 space-y-4 border-t border-gray-800"
                  >
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Display Name *
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            required
                            placeholder="Enter your display name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Full Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            placeholder="Your full name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Phone Number
                        </label>
                        <div className="relative">
                          <DevicePhoneMobileIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full py-3 pl-10 pr-4 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                            placeholder="+880 1234 567890"
                          />
                        </div>
                      </div>

                      {isB2BUser && (
                        <div>
                          <label className="block mb-2 text-sm font-medium text-gray-300">
                            Company Name
                          </label>
                          <div className="relative">
                            <BuildingOfficeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                            <input
                              type="text"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="w-full py-3 pl-10 pr-4 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                              placeholder="Your company name"
                            />
                          </div>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Bio
                        </label>
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="Tell us about yourself..."
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Country
                        </label>
                        <input
                          type="text"
                          value={location.country}
                          onChange={(e) =>
                            setLocation({
                              ...location,
                              country: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="Country"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          City
                        </label>
                        <input
                          type="text"
                          value={location.city}
                          onChange={(e) =>
                            setLocation({ ...location, city: e.target.value })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="City"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Website
                        </label>
                        <input
                          type="url"
                          value={socialLinks.website}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              website: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Twitter
                        </label>
                        <input
                          type="text"
                          value={socialLinks.twitter}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              twitter: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="@username"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          LinkedIn
                        </label>
                        <input
                          type="text"
                          value={socialLinks.linkedin}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              linkedin: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="LinkedIn username"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          GitHub
                        </label>
                        <input
                          type="text"
                          value={socialLinks.github}
                          onChange={(e) =>
                            setSocialLinks({
                              ...socialLinks,
                              github: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                          placeholder="GitHub username"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-300">
                          Language Preference
                        </label>
                        <select
                          value={preferences.language}
                          onChange={(e) =>
                            setPreferences({
                              ...preferences,
                              language: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none"
                        >
                          <option value="en">English</option>
                          <option value="bn">বাংলা</option>
                          <option value="hi">हिन्दी</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block mb-2 text-sm font-medium text-gray-300">
                        Email Address
                      </label>
                      <div className="relative">
                        <EnvelopeIcon className="absolute w-5 h-5 text-gray-500 -translate-y-1/2 left-3 top-1/2" />
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full py-3 pl-10 pr-4 text-gray-400 border border-gray-700 cursor-not-allowed bg-gray-800/50 rounded-xl"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed. Contact support for assistance.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isUpdating}
                        className="flex-1 px-6 py-2.5 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                      >
                        {isUpdating ? "Saving..." : "Save Changes"}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={cancelEditing}
                        className="px-6 py-2.5 text-sm font-medium text-gray-300 transition-all rounded-xl bg-gray-800 hover:bg-gray-700"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Change Password Form */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Change Password
                </h2>
                <p className="text-sm text-gray-400">
                  Update your password to keep your account secure
                </p>
              </div>

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
                      className="w-full py-3 pl-10 pr-10 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                      placeholder="Enter current password"
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
                      className="w-full py-3 pl-10 pr-10 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                      minLength={6}
                      placeholder="Enter new password (min 6 characters)"
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
                      className="w-full py-3 pl-10 pr-10 text-white transition-all bg-gray-800 border border-gray-700 rounded-xl focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                      required
                      placeholder="Confirm new password"
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
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-sm text-red-500"
                    >
                      <XMarkIcon className="w-4 h-4" />
                      Passwords do not match
                    </motion.div>
                  )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={
                    isChangingPassword || newPassword !== confirmPassword
                  }
                  className="w-full px-6 py-3 text-sm font-medium text-white transition-all rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-4 h-4 animate-spin" />
                      Changing Password...
                    </span>
                  ) : (
                    "Change Password"
                  )}
                </motion.button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="p-6 border border-gray-800 rounded-2xl bg-gradient-to-br from-gray-900 to-black">
              <div className="flex items-center gap-2 mb-4">
                <BellIcon className="w-5 h-5 text-gray-400" />
                <h2 className="text-xl font-semibold text-white">
                  Notification Preferences
                </h2>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-white/5">
                  <span className="text-gray-300">Email Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.email}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          email: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-white/5">
                  <span className="text-gray-300">Push Notifications</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.push}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          push: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-white/5">
                  <span className="text-gray-300">Vote Updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.voteUpdates}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          voteUpdates: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-lg cursor-pointer bg-white/5">
                  <span className="text-gray-300">Poll Ending Reminders</span>
                  <input
                    type="checkbox"
                    checked={preferences.notifications.pollEnding}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        notifications: {
                          ...preferences.notifications,
                          pollEnding: e.target.checked,
                        },
                      })
                    }
                    className="w-5 h-5 text-red-500 rounded focus:ring-red-500"
                  />
                </label>
              </div>
            </div>

            {/* Info Note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="p-4 border rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30"
            >
              <p className="flex items-center gap-2 text-sm text-blue-400">
                <ShieldCheckIcon className="w-4 h-4" />
                💡 Profile updates and password changes are saved securely. Your
                email address cannot be changed for security reasons.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
