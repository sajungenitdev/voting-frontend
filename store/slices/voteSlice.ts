import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Vote {
  _id: string
  poll: {
    _id: string
    title: string
  }
  candidate: {
    _id: string
    name: string
  }
  voteReceipt: string
  createdAt: string
}

interface VoteState {
  myVotes: Vote[]
  isLoading: boolean
  error: string | null
}

const initialState: VoteState = {
  myVotes: [],
  isLoading: false,
  error: null,
}

// Get user's vote history
export const fetchMyVotes = createAsyncThunk(
  'votes/fetchMyVotes',
  async (params: { page?: number; limit?: number } = {}) => {
    const response = await api.get('/votes/my-votes', { params })
    return response.data.data.votes
  }
)

// Check if user has voted in a poll
export const checkHasVoted = createAsyncThunk(
  'votes/checkHasVoted',
  async (pollId: string) => {
    const response = await api.get(`/votes/check/${pollId}`)
    return { pollId, hasVoted: response.data.data.hasVoted }
  }
)

// Get vote receipt
export const getVoteReceipt = createAsyncThunk(
  'votes/getReceipt',
  async (voteId: string) => {
    const response = await api.get(`/votes/receipt/${voteId}`)
    return response.data.data.receipt
  }
)

const voteSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearMyVotes: (state) => {
      state.myVotes = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyVotes.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyVotes.fulfilled, (state, action) => {
        state.isLoading = false
        state.myVotes = action.payload
      })
      .addCase(fetchMyVotes.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message
      })
  },
})

export const { clearError, clearMyVotes } = voteSlice.actions
export default voteSlice.reducer