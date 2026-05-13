// store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface User {
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
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Helper function to normalize user data (handles both regular and B2B users)
const normalizeUser = (userData: any): User => {
  return {
    _id: userData._id || userData.id,
    id: userData._id || userData.id,
    name: userData.name || userData.fullName || userData.companyName || "User",
    fullName: userData.fullName || userData.name,
    companyName: userData.companyName,
    email: userData.email,
    role: userData.role === "b2b_buyer" ? "b2b_buyer" : userData.role || "user",
    isVerified: userData.isVerified || false,
    createdAt: userData.createdAt,
    lastLogin: userData.lastLogin,
    phoneNumber: userData.phoneNumber,
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
      return { email, message: response.data.message };
    }
    throw new Error(response.data.message);
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
    throw new Error(response.data.message);
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
    throw new Error(response.data.message);
  },
);

// Resend OTP
export const resendOTP = createAsyncThunk(
  "auth/resendOTP",
  async ({ email }: { email: string }) => {
    const response = await api.post("/auth/resend-otp", { email });
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message);
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
    throw new Error(response.data.message);
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
    throw new Error(response.data.message);
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
    throw new Error(response.data.message);
  },
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No token found");
    }
    const response = await api.get("/auth/me");
    if (response.data.success) {
      const normalizedUser = normalizeUser(response.data.data.user);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      return normalizedUser;
    }
    throw new Error(response.data.message);
  },
);

// Logout
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
});

// B2B Login (for B2B users)
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
    throw new Error(response.data.message);
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      if (state.user) {
        const updatedUser = normalizeUser(state.user);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        state.user = updatedUser;
      }
    },
    // Restore session from localStorage
    restoreSession: (state) => {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");

      console.log("Restoring session - Token exists:", !!token);
      console.log("Restoring session - User exists:", !!userStr);

      if (token && userStr) {
        try {
          const userData = JSON.parse(userStr);
          const normalizedUser = normalizeUser(userData);
          state.token = token;
          state.user = normalizedUser;
          state.isAuthenticated = true;
          console.log("Session restored successfully:", normalizedUser);
        } catch (e) {
          console.error("Failed to restore session:", e);
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      } else {
        console.log("No session found in localStorage");
      }
    },
    // Force set session (for B2B OTP flow)
    setSession: (state, action) => {
      const { token, user } = action.payload;
      const normalizedUser = normalizeUser(user);
      state.token = token;
      state.user = normalizedUser;
      state.isAuthenticated = true;
      localStorage.setItem("accessToken", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
      console.log("Session set manually:", normalizedUser);
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.isLoading = false;
        toast.success(
          "Registration successful! Please check your email for OTP.",
        );
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })

      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Login successful!");
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })

      // B2B Login
      .addCase(b2bLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(b2bLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("B2B Login successful!");
      })
      .addCase(b2bLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })

      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        toast.success("Email verified successfully!");
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })

      // Resend OTP
      .addCase(resendOTP.fulfilled, () => {
        toast.success("New OTP sent to your email");
      })
      .addCase(resendOTP.rejected, (state, action) => {
        toast.error(action.error.message);
      })

      // Forgot Password
      .addCase(forgotPassword.rejected, (state, action) => {
        toast.error(action.error.message);
      })

      // Reset Password
      .addCase(resetPassword.rejected, (state, action) => {
        toast.error(action.error.message);
      })

      // Change Password
      .addCase(changePassword.rejected, (state, action) => {
        toast.error(action.error.message);
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.token = null;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        toast.success("Logged out successfully");
      });
  },
});

export const { clearError, updateUser, restoreSession, setSession } =
  authSlice.actions;
export default authSlice.reducer;
