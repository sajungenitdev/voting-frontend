// lib/api.ts
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";

// ==================== TYPES ====================

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// User types
// lib/api.ts - Add this to your User interface
export interface User {
  _id: string;
  id?: string;
  name: string;
  fullName?: string;
  companyName?: string;
  email: string;
  role: "user" | "admin" | "moderator" | "b2b_buyer";
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
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

// Poll types
export interface Candidate {
  id: string;
  name: string;
  voteCount?: number;
}

export interface Poll {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  category: string;
  candidates: Candidate[];
  startDate?: string;
  endDate?: string;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePollData {
  title: string;
  description?: string;
  category: string;
  candidates: { name: string }[];
  endDate?: string;
}

// Vote types
export interface VoteData {
  pollId: string;
  candidateId: string;
}

export interface VoteReceipt {
  _id: string;
  pollId: string;
  candidateId: string;
  userId: string;
  transactionHash?: string;
  createdAt: string;
}

// Comment types
export interface Comment {
  _id: string;
  content: string;
  pollId: string;
  userId: string;
  userName: string;
  userEmail?: string;
  parentId?: string;
  likes: number;
  isFlagged?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCommentData {
  pollId: string;
  content: string;
  parentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

export interface CreateCategoryData {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
}

// B2B Types
export interface B2BRequestData {
  fullName: string;
  email: string;
  phoneNumber: string;
  purpose: string;
  selectedCategories: string[];
  termsAgreed: boolean;
  complianceAgreed: boolean;
}

export interface B2BVerifyOTPData {
  email: string;
  otp: string;
  requestId: string;
}

export interface B2BResendOTPData {
  email: string;
  requestId: string;
}

export interface B2BLoginData {
  email: string;
  password: string;
}

export interface B2BUpdateProfileData {
  companyName?: string;
  phoneNumber?: string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
}

export interface SubscriptionPlan {
  name: string;
  price: number;
  priceBDT: number;
  maxCategories: number | "Unlimited";
  features: string[];
}

export interface SubscriptionData {
  tier: "basic" | "standard" | "premium";
  paymentMethod: string;
  autoRenew?: boolean;
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingAddress?: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  couponCode?: string;
}

export interface ApiKeyData {
  name: string;
  permissions?: string[];
  allowedCategories?: string[];
}

// Admin Types
export interface UpdateUserRoleData {
  role: User["role"];
}

export interface UpdateUserStatusData {
  isActive: boolean;
}

// Query params type
export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  period?: "day" | "week" | "month" | "year";
}

// ==================== CONFIGURATION ====================
const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

if (process.env.NODE_ENV === "development") {
  console.log(`🔗 API Base URL: ${API_BASE_URL}`);
}

// ==================== AXIOS INSTANCE ====================
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// ==================== INTERCEPTORS ====================
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token: string | null = localStorage.getItem("accessToken");
    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error),
);

api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError): Promise<never> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.error(
        `API Error [${error.response?.status}]:`,
        error.response?.data,
      );
    }

    return Promise.reject(error);
  },
);

// ==================== GENERIC REQUEST METHODS ====================
// Using generics with proper constraints
export const get = async <T = unknown>(
  url: string,
  params?: QueryParams,
): Promise<ApiResponse<T>> => {
  const response = await api.get<ApiResponse<T>>(url, { params });
  return response.data;
};

// Using Record<string, unknown> for flexible but type-safe data
export const post = async <T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D,
): Promise<ApiResponse<T>> => {
  const response = await api.post<ApiResponse<T>>(url, data);
  return response.data;
};

export const put = async <T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D,
): Promise<ApiResponse<T>> => {
  const response = await api.put<ApiResponse<T>>(url, data);
  return response.data;
};

export const del = async <T = unknown>(
  url: string,
): Promise<ApiResponse<T>> => {
  const response = await api.delete<ApiResponse<T>>(url);
  return response.data;
};

export const patch = async <T = unknown, D = Record<string, unknown>>(
  url: string,
  data?: D,
): Promise<ApiResponse<T>> => {
  const response = await api.patch<ApiResponse<T>>(url, data);
  return response.data;
};

// ==================== AUTH HELPERS ====================
export const setAuthToken = (token: string | null): void => {
  if (token && token !== "undefined" && token !== "null") {
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common.Authorization;
  }
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  delete api.defaults.headers.common.Authorization;
};

export const isAuthenticated = (): boolean => {
  const token: string | null = localStorage.getItem("accessToken");
  return !!token && token !== "undefined" && token !== "null";
};

export const getCurrentUser = (): User | null => {
  const userStr: string | null = localStorage.getItem("user");
  if (userStr && userStr !== "undefined" && userStr !== "null") {
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }
  return null;
};

// ==================== AUTH API ====================
export const authAPI = {
  login: (credentials: LoginCredentials) =>
    post<AuthResponse, LoginCredentials>("/auth/login", credentials),

  register: (data: RegisterData) =>
    post<{ email: string }, RegisterData>("/auth/register", data),

  verifyOTP: (data: VerifyOTPData) =>
    post<AuthResponse, VerifyOTPData>("/auth/verify-otp", data),

  resendOTP: (data: ResendOTPData) =>
    post<{ message: string }, ResendOTPData>("/auth/resend-otp", data),

  logout: () => post<{ message: string }>("/auth/logout"),

  getMe: () => get<User>("/auth/me"),

  changePassword: (data: ChangePasswordData) =>
    post<{ message: string }, ChangePasswordData>(
      "/auth/change-password",
      data,
    ),

  forgotPassword: (data: ForgotPasswordData) =>
    post<{ message: string }, ForgotPasswordData>(
      "/auth/forgot-password",
      data,
    ),

  resetPassword: (data: ResetPasswordData) =>
    post<{ message: string }, ResetPasswordData>("/auth/reset-password", data),

  refreshToken: (refreshToken: string) =>
    post<{ accessToken: string }, { refreshToken: string }>(
      "/auth/refresh-token",
      { refreshToken },
    ),
};

// ==================== POLL API ====================
export const pollAPI = {
  getAll: (params?: QueryParams) =>
    get<{
      polls: Poll[];
      totalPages: number;
      currentPage: number;
      totalPolls: number;
    }>("/polls", params),

  getById: (id: string) => get<Poll>(`/polls/${id}`),

  create: (data: CreatePollData) => post<Poll, CreatePollData>("/polls", data),

  update: (id: string, data: Partial<CreatePollData>) =>
    put<Poll, Partial<CreatePollData>>(`/polls/${id}`, data),

  delete: (id: string) => del<{ message: string }>(`/polls/${id}`),

  getResults: (id: string) =>
    get<{ results: Candidate[]; totalVotes: number }>(`/polls/${id}/results`),

  publish: (id: string) => post<Poll>(`/polls/${id}/publish`),

  unpublish: (id: string) => post<Poll>(`/polls/${id}/unpublish`),

  getMyPolls: (params?: QueryParams) =>
    get<{ polls: Poll[]; totalPages: number }>("/polls/my/polls", params),

  getByCategory: (category: string, params?: QueryParams) =>
    get<{ polls: Poll[] }>(`/polls/category/${category}`, params),
};

// ==================== VOTE API ====================
export const voteAPI = {
  cast: (data: VoteData) => post<VoteReceipt, VoteData>("/votes", data),

  getMyVotes: (params?: QueryParams) =>
    get<{ votes: VoteReceipt[]; total: number }>("/votes/my-votes", params),

  checkVoted: (pollId: string) =>
    get<{ hasVoted: boolean; voteId?: string }>(`/votes/check/${pollId}`),

  getReceipt: (id: string) => get<VoteReceipt>(`/votes/receipt/${id}`),

  getResults: (pollId: string) =>
    get<{ results: Candidate[]; totalVotes: number }>(
      `/votes/results/${pollId}`,
    ),

  getStatistics: () =>
    get<{
      totalVotes: number;
      uniqueVoters: number;
      votesByPoll: Record<string, number>;
    }>("/votes/statistics"),
};

// ==================== CATEGORY API ====================
export const categoryAPI = {
  getAll: () => get<{ categories: Category[] }>("/categories"),

  getById: (id: string) => get<Category>(`/categories/${id}`),

  create: (data: CreateCategoryData) =>
    post<Category, CreateCategoryData>("/categories", data),

  update: (id: string, data: Partial<CreateCategoryData>) =>
    put<Category, Partial<CreateCategoryData>>(`/categories/${id}`, data),

  delete: (id: string) => del<{ message: string }>(`/categories/${id}`),
};

// ==================== COMMENT API ====================
export const commentAPI = {
  getByPoll: (pollId: string, params?: QueryParams) =>
    get<{ comments: Comment[]; total: number }>(
      `/comments/poll/${pollId}`,
      params,
    ),

  getReplies: (commentId: string, params?: QueryParams) =>
    get<{ replies: Comment[] }>(`/comments/replies/${commentId}`, params),

  add: (data: CreateCommentData) =>
    post<Comment, CreateCommentData>("/comments", data),

  update: (id: string, data: UpdateCommentData) =>
    put<Comment, UpdateCommentData>(`/comments/${id}`, data),

  delete: (id: string) => del<{ message: string }>(`/comments/${id}`),

  like: (id: string) =>
    post<{ likeCount: number; isLiked: boolean }>(`/comments/${id}/like`),

  unlike: (id: string) =>
    post<{ likeCount: number; isLiked: boolean }>(`/comments/${id}/unlike`),

  flag: (id: string) => post<{ message: string }>(`/comments/${id}/flag`),

  getFlagged: (params?: QueryParams) =>
    get<{ comments: Comment[] }>("/comments/admin/flagged", params),

  moderate: (id: string, action: "approve" | "reject" | "delete") =>
    post<{ message: string }, { action: string }>(
      `/comments/admin/${id}/moderate`,
      { action },
    ),
};

// ==================== B2B API ====================
export const b2bAPI = {
  submitRequest: (data: B2BRequestData) =>
    post<
      { requestId: string; email: string; isNewUser: boolean },
      B2BRequestData
    >("/b2b/request", data),

  verifyOTP: (data: B2BVerifyOTPData) =>
    post<AuthResponse, B2BVerifyOTPData>("/b2b/verify-otp", data),

  resendOTP: (data: B2BResendOTPData) =>
    post<{ message: string }, B2BResendOTPData>("/b2b/resend-otp", data),

  login: (data: B2BLoginData) =>
    post<AuthResponse, B2BLoginData>("/b2b/login", data),

  getProfile: () => get<User>("/b2b/profile"),

  updateProfile: (data: B2BUpdateProfileData) =>
    put<User, B2BUpdateProfileData>("/b2b/profile", data),

  getCategories: () => get<{ categories: Category[] }>("/b2b/categories"),

  getPlans: () =>
    get<{ plans: Record<string, SubscriptionPlan> }>("/b2b/plans"),

  subscribe: (data: SubscriptionData) =>
    post<
      {
        subscription: {
          id: string;
          tier: string;
          endDate: string;
          invoiceNumber: string;
        };
      },
      SubscriptionData
    >("/b2b/subscribe", data),

  getSubscription: () =>
    get<{
      hasSubscription: boolean;
      tier?: string;
      endDate?: string;
      remainingDays?: number;
      maxCategories?: number;
    }>("/b2b/my-subscription"),

  cancelSubscription: () =>
    post<{ message: string }>("/b2b/cancel-subscription"),

  getPaymentHistory: () =>
    get<{
      payments: Array<{
        invoiceNumber: string;
        transactionId: string;
        amount: number;
        date: string;
        status: string;
        tier: string;
      }>;
    }>("/b2b/payment-history"),

  getInvoice: (invoiceNumber: string) =>
    get<{
      invoice: {
        invoiceNumber: string;
        amount: number;
        date: string;
        plan: string;
        status: string;
      };
    }>(`/b2b/invoice/${invoiceNumber}`),

  confirmPayment: (subscriptionId: string, transactionId?: string) =>
    post<
      {
        message: string;
        subscription: { id: string; tier: string; paymentStatus: string };
      },
      { subscriptionId: string; transactionId?: string }
    >("/b2b/confirm-payment", { subscriptionId, transactionId }),

  validateAccess: (requestedCategories?: string[]) =>
    post<
      {
        subscription: { tier: string; isValid: boolean; remainingDays: number };
        accessibleCategories: Category[];
        canAccess: boolean;
      },
      { requestedCategories?: string[] }
    >("/b2b/validate-access", { requestedCategories }),

  getData: (params?: QueryParams) =>
    get<Record<string, unknown>>("/b2b/data", params),

  getDashboardStats: () =>
    get<{
      stats: {
        totalRequests: number;
        approvedRequests: number;
        pendingRequests: number;
        hasActiveSubscription: boolean;
        subscriptionTier?: string;
        apiKeysCount: number;
        remainingDays: number;
      };
    }>("/b2b/dashboard/stats"),

  getMyRequests: () =>
    get<{
      requests: Array<{
        _id: string;
        status: string;
        createdAt: string;
        selectedCategories: string[];
      }>;
    }>("/b2b/my-requests"),

  getRequestById: (id: string) =>
    get<{
      request: {
        _id: string;
        status: string;
        createdAt: string;
        selectedCategories: string[];
        purpose: string;
      };
    }>(`/b2b/requests/${id}`),

  generateApiKey: (data: ApiKeyData) =>
    post<
      { apiKey: string; name: string; expiresAt: string; keyId: string },
      ApiKeyData
    >("/b2b/api-keys", data),

  getApiKeys: () =>
    get<{
      apiKeys: Array<{
        id: string;
        name: string;
        createdAt: string;
        expiresAt: string;
        lastUsed?: string;
        isActive: boolean;
      }>;
    }>("/b2b/api-keys"),

  revokeApiKey: (id: string) => del<{ message: string }>(`/b2b/api-keys/${id}`),
};

// ==================== ADMIN API ====================
export const adminAPI = {
  getDashboard: () =>
    get<{
      stats: {
        totalUsers: number;
        totalPolls: number;
        totalVotes: number;
        activePolls: number;
        totalComments: number;
        pendingFlags: number;
      };
    }>("/admin/dashboard"),

  getAnalytics: (params?: { period?: "day" | "week" | "month" | "year" }) =>
    get<{
      analytics: {
        votesOverTime: Array<{ date: string; count: number }>;
        popularPolls: Poll[];
        userGrowth: Array<{ month: string; count: number }>;
      };
    }>("/admin/analytics", params),

  getUsers: (params?: QueryParams) =>
    get<{
      users: User[];
      totalPages: number;
      currentPage: number;
      totalUsers: number;
    }>("/admin/users", params),

  getUserById: (id: string) => get<User>(`/admin/users/${id}`),

  updateUserRole: (userId: string, data: UpdateUserRoleData) =>
    put<User, UpdateUserRoleData>(`/admin/users/${userId}/role`, data),

  updateUserStatus: (userId: string, data: UpdateUserStatusData) =>
    put<{ message: string }, UpdateUserStatusData>(
      `/admin/users/${userId}/status`,
      data,
    ),

  deleteUser: (userId: string) =>
    del<{ message: string }>(`/admin/users/${userId}`),

  getAllPolls: (params?: QueryParams) =>
    get<{
      polls: Poll[];
      totalPages: number;
      currentPage: number;
      totalPolls: number;
    }>("/admin/polls", params),

  getPollById: (id: string) => get<Poll>(`/admin/polls/${id}`),

  deletePoll: (pollId: string) =>
    del<{ message: string }>(`/admin/polls/${pollId}`),

  getVotes: (params?: QueryParams) =>
    get<{ votes: VoteReceipt[]; total: number }>("/admin/votes", params),

  getTurnout: () =>
    get<{
      turnout: {
        percentage: number;
        totalVoters: number;
        totalEligible: number;
      };
    }>("/admin/turnout"),

  getActivityLogs: (params?: QueryParams) =>
    get<{
      logs: Array<{
        action: string;
        user: { id: string; name: string };
        timestamp: string;
        details?: Record<string, unknown>;
      }>;
      total: number;
    }>("/admin/logs/activity", params),

  getSystemBackup: () =>
    get<{ backupUrl: string; size: number; createdAt: string }>(
      "/admin/system/backup",
    ),

  clearCache: () => post<{ message: string }>("/admin/system/cache/clear"),
};

// ==================== UTILITY API ====================
export const utilityAPI = {
  health: () =>
    get<{ status: string; uptime: number; timestamp: string }>("/health"),

  getStatus: () =>
    get<{ status: string; version: string; environment: string }>(
      "/api/v1/status",
    ),

  getDebugPaths: () => get<{ routes: string[] }>("/api/v1/debug/paths"),

  ping: () => get<{ pong: boolean; timestamp: string }>("/api/v1/ping"),
};

export default api;
