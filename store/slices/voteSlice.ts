import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";

interface VoteReceipt {
  _id: string;
  pollId: string;
  candidateId: string;
  userId: string;
  transactionHash?: string;
  createdAt: string;
}

interface VoteState {
  myVotes: VoteReceipt[];
  isLoading: boolean;
  error: string | null;
}

const initialState: VoteState = {
  myVotes: [],
  isLoading: false,
  error: null,
};

export const fetchMyVotes = createAsyncThunk(
  "votes/fetchMyVotes",
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await api.get("/votes/my-votes", { params });
    if (response.data.success) {
      return response.data.data.votes;
    }
    throw new Error(response.data.message || "Failed to fetch your votes");
  },
);

const voteSlice = createSlice({
  name: "votes",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMyVotes: (state) => {
      state.myVotes = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyVotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myVotes = action.payload;
      })
      .addCase(fetchMyVotes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch your votes";
      });
  },
});

export const { clearError, clearMyVotes } = voteSlice.actions;
export default voteSlice.reducer;
