// store/slices/pollSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/lib/api";

// ============ TYPES ============
export interface Candidate {
  _id: string;
  name: string;
  description?: string;
  voteCount: number;
}

export interface Poll {
  _id: string;
  title: string;
  description: string;
  category: string;
  candidates: Candidate[];
  endDate: string;
  startDate?: string;
  isPublished: boolean;
  totalVotes: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  userVoted?: boolean;
  userVoteCandidateId?: string | null;
  isOngoing?: boolean;
  hasEnded?: boolean;
  isUpcoming?: boolean;
  tags?: string[];
  image?: string | null;
  settings?: {
    showResults?: boolean;
    allowComments?: boolean;
    isPrivate?: boolean;
  };
}

interface PollsResponse {
  success: boolean;
  count?: number;
  total?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  data: {
    polls: Poll[];
  };
}

interface PollState {
  polls: Poll[];
  isLoading: boolean;
  error: string | null;
  voteError: string | null; // Separate error for vote operations
}

// ============ INITIAL STATE ============
const initialState: PollState = {
  polls: [],
  isLoading: false,
  error: null,
  voteError: null,
};

// ============ ASYNC THUNKS ============
export const fetchPolls = createAsyncThunk<
  PollsResponse,
  | { limit?: number; category?: string; status?: string; search?: string }
  | undefined
>("polls/fetchPolls", async (params = { limit: 50 }, { rejectWithValue }) => {
  try {
    const response = await api.get<PollsResponse>("/polls", { params });
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || "Failed to fetch polls";
    return rejectWithValue(message);
  }
});

export const castVote = createAsyncThunk<
  { pollId: string; candidateId: string; voteData: any },
  { pollId: string; candidateId: string }
>("polls/castVote", async ({ pollId, candidateId }, { rejectWithValue }) => {
  try {
    const response = await api.post("/votes", {
      pollId,
      candidateId,
    });
    return { pollId, candidateId, voteData: response.data };
  } catch (error: any) {
    if (error.response?.status === 400) {
      // Return a specific error code for already voted
      return rejectWithValue({
        type: "ALREADY_VOTED",
        message: "You have already voted in this poll",
      });
    }
    const message =
      error.response?.data?.message || error.message || "Failed to cast vote";
    return rejectWithValue({ type: "ERROR", message });
  }
});


// ============ SLICE ============
const pollSlice = createSlice({
  name: "polls",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVoteError: (state) => {
      state.voteError = null;
    },
    updatePollVote: (
      state,
      action: PayloadAction<{ pollId: string; candidateId: string }>,
    ) => {
      const { pollId, candidateId } = action.payload;
      const poll = state.polls.find((p) => p._id === pollId);
      if (poll) {
        poll.userVoted = true;
        poll.userVoteCandidateId = candidateId;
        const candidate = poll.candidates.find((c) => c._id === candidateId);
        if (candidate) {
          candidate.voteCount += 1;
        }
        poll.totalVotes += 1;
      }
    },
    // ✅ ADD THIS - updatePollLocally for immediate UI updates
    updatePollLocally: (
      state,
      action: PayloadAction<{ pollId: string; candidateId: string }>,
    ) => {
      const { pollId, candidateId } = action.payload;
      const poll = state.polls.find((p) => p._id === pollId);
      if (poll) {
        poll.userVoted = true;
        poll.userVoteCandidateId = candidateId;
        const candidate = poll.candidates.find((c) => c._id === candidateId);
        if (candidate) {
          candidate.voteCount += 1;
        }
        poll.totalVotes += 1;
      }
    },
    resetPolls: (state) => {
      state.polls = [];
      state.error = null;
      state.voteError = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Polls
      .addCase(fetchPolls.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPolls.fulfilled, (state, action) => {
        state.isLoading = false;
        state.polls = action.payload?.data?.polls || [];
        state.error = null;
      })
      .addCase(fetchPolls.rejected, (state, action) => {
        state.isLoading = false;
        // Don't set error if it's just a vote-related issue
        if (action.payload !== "You have already voted in this poll") {
          state.error = action.payload as string;
        }
      })

      // Cast Vote
      .addCase(castVote.pending, (state) => {
        state.voteError = null;
      })
      .addCase(castVote.fulfilled, (state, action) => {
        const { pollId, candidateId } = action.payload;
        const poll = state.polls.find((p) => p._id === pollId);
        if (poll) {
          poll.userVoted = true;
          poll.userVoteCandidateId = candidateId;
          const candidate = poll.candidates.find((c) => c._id === candidateId);
          if (candidate) {
            candidate.voteCount += 1;
          }
          poll.totalVotes += 1;
        }
        state.voteError = null;
      })
      .addCase(castVote.rejected, (state, action) => {
        const error = action.payload as { type: string; message: string };
        if (error?.type === "ALREADY_VOTED") {
          // Don't set error, just update local state
          state.voteError = null;
        } else {
          state.voteError = error?.message || "Failed to cast vote";
        }
      });
  },
});

// ✅ EXPORT the new action
export const {
  clearError,
  clearVoteError,
  updatePollVote,
  updatePollLocally, // Added this export
  resetPolls,
} = pollSlice.actions;
export default pollSlice.reducer;
