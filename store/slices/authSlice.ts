// store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";
import toast from "react-hot-toast";

export interface User {
  _id: string;
  id?: string;
  name: string;
  fullName?: string;
  companyName?: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt?: string;
  lastLogin?: string;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };
  socialLinks?: {
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
  preferences?: {
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      voteUpdates?: boolean;
      pollEnding?: boolean;
    };
    language?: string;
  };
  statistics?: {
    totalVotes?: number;
    totalPollsCreated?: number;
    totalComments?: number;
    joinDate?: string;
    lastActive?: string;
  };
  googleId?: string;
  isActive?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingIn: false,
  error: null,
};

// Helper function to normalize user data
const normalizeUser = (userData: any): User => {
  return {
    _id: userData._id || userData.id,
    id: userData._id || userData.id,
    name:
      userData.name ||
      userData.fullName ||
      userData.companyName ||
      userData.email?.split("@")[0] ||
      "User",
    fullName: userData.fullName || userData.name,
    companyName: userData.companyName,
    email: userData.email,
    role: userData.role === "b2b_buyer" ? "b2b_buyer" : userData.role || "user",
    isVerified: userData.isVerified || false,
    createdAt: userData.createdAt,
    lastLogin: userData.lastLogin,
    phoneNumber: userData.phoneNumber,
    avatar: userData.avatar,
    bio: userData.bio,
    location: userData.location,
    socialLinks: userData.socialLinks,
    preferences: userData.preferences,
    statistics: userData.statistics,
    googleId: userData.googleId,
    isActive: userData.isActive,
  };
};

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async ({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });
    if (response.data.success) {
      return {
        success: true,
        message:
          response.data.message ||
          "Registration successful. Please verify your email.",
        email: email,
      };
    }
    throw new Error(response.data.message || "Registration failed");
  },
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success) {
      const { accessToken, user } = response.data.data;
      const normalizedUser = normalizeUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return { user: normalizedUser, token: accessToken };
    }
    throw new Error(response.data.message || "Login failed");
  },
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }) => {
    const response = await api.post("/auth/verify-otp", { email, otp });
    if (response.data.success) {
      const { accessToken, user } = response.data.data;
      const normalizedUser = normalizeUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return { user: normalizedUser, token: accessToken };
    }
    throw new Error(response.data.message || "OTP verification failed");
  },
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async ({ email }: { email: string }) => {
    const response = await api.post("/auth/resend-otp", { email });
    if (response.data.success) {
      return { success: true, message: response.data.message };
    }
    throw new Error(response.data.message || "Failed to resend OTP");
  },
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }: { email: string }) => {
    const response = await api.post("/auth/forgot-password", { email });
    if (response.data.success) {
      toast.success("Password reset email sent. Please check your inbox.");
      return response.data;
    }
    throw new Error(response.data.message || "Failed to send reset email");
  },
);

// Reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }: { token: string; password: string }) => {
    const response = await api.post("/auth/reset-password", {
      token,
      password,
    });
    if (response.data.success) {
      toast.success(
        "Password reset successful. Please login with your new password.",
      );
      return response.data;
    }
    throw new Error(response.data.message || "Failed to reset password");
  },
);

// Change password
export const changePassword = createAsyncThunk(
  "auth/changePassword",
  async ({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }) => {
    const response = await api.post("/auth/change-password", {
      currentPassword,
      newPassword,
    });
    if (response.data.success) {
      toast.success("Password changed successfully");
      return response.data;
    }
    throw new Error(response.data.message || "Failed to change password");
  },
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const token = localStorage.getItem("accessToken");
    if (!token || token === "undefined" || token === "null") {
      throw new Error("No valid token found");
    }
    const response = await api.get("/auth/me");
    if (response.data.success) {
      const normalizedUser = normalizeUser(response.data.data.user);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return normalizedUser;
    }
    throw new Error(response.data.message || "Failed to get user");
  },
);

// B2B Login
export const b2bLogin = createAsyncThunk(
  "auth/b2bLogin",
  async ({ email, password }: { email: string; password: string }) => {
    const response = await api.post("/b2b/login", { email, password });
    if (response.data.success) {
      const { accessToken, user } = response.data.data;
      const normalizedUser = normalizeUser(user);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return { user: normalizedUser, token: accessToken };
    }
    throw new Error(response.data.message || "B2B login failed");
  },
);

// Logout - FIXED: Don't let API errors break the logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
      try {
        await api.post("/auth/logout");
      } catch (apiError) {
        console.log("Logout API call failed, continuing with local cleanup");
      }
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Always clear local storage regardless of API response
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    // Dispatch events to notify other components
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("auth-storage-updated"));
    }
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.isLoading = false;
      state.isLoggingIn = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    restoreSession: (state) => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      console.log("Restoring session - Token exists:", !!token);
      console.log("Restoring session - User exists:", !!userStr);

      if (
        token &&
        userStr &&
        token !== "undefined" &&
        token !== "null" &&
        userStr !== "undefined"
      ) {
        try {
          const userData = JSON.parse(userStr);
          const normalizedUser = normalizeUser(userData);
          state.token = token;
          state.user = normalizedUser;
          state.isAuthenticated = true;
          state.isLoggingIn = false;
          console.log("Session restored successfully:", normalizedUser?.name);
        } catch (e) {
          console.error("Failed to restore session:", e);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          state.isLoggingIn = false;
        }
      } else {
        console.log("No valid session found");
        state.isLoggingIn = false;
      }
    },
    setSession: (
      state,
      action: PayloadAction<{ token: string; user: User }>,
    ) => {
      const { token, user } = action.payload;
      const normalizedUser = normalizeUser(user);
      state.token = token;
      state.user = normalizedUser;
      state.isAuthenticated = true;
      state.isLoggingIn = false;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      console.log("Session set manually:", normalizedUser);
    },
    setLoggingIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggingIn = action.payload;
    },
    resetAuthState: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isLoggingIn = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Registration failed";
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.error.message || "Login failed";
      })
      .addCase(b2bLogin.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(b2bLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(b2bLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.error.message || "B2B Login failed";
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoggingIn = false;
        state.error = action.error.message || "OTP verification failed";
      })
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to resend OTP";
      })
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to send reset email";
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to reset password";
      })
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to change password";
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoggingIn = false;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
        state.isLoggingIn = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoggingIn = false;
        state.error = null;
      });
  },
});

export const {
  clearError,
  clearAuthError,
  updateUser,
  restoreSession,
  setSession,
  setLoggingIn,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;
