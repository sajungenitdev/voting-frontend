// store/slices/categorySlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryAPI } from "@/lib/api";

// ✅ FIXED: Make isActive optional to match API response
export interface Category {
  _id: string;
  name: string;
  displayName: string;
  icon?: string;
  color?: string;
  isActive?: boolean; // Changed from required to optional
  pollCount?: number;
  description?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { categories: CategoryState };
      const now = Date.now();

      // Return cached data if still valid
      if (
        state.categories.lastFetched &&
        now - state.categories.lastFetched < CACHE_DURATION
      ) {
        return state.categories.categories;
      }

      const response = await categoryAPI.getAll();

      if (response.success && response.data?.categories) {
        // ✅ Fixed: Filter only active categories (treat undefined as active)
        const activeCategories = response.data.categories
          .filter((cat) => cat.isActive !== false) // undefined and true are both considered active
          .sort((a, b) => (a.order || 0) - (b.order || 0));

        return activeCategories as Category[];
      }

      return rejectWithValue(response.message || "Failed to fetch categories");
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch categories");
    }
  },
);

export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (categoryData: {
    name: string;
    displayName: string;
    description?: string;
    icon?: string;
  }) => {
    const response = await categoryAPI.create(categoryData);
    if (response.success && response.data) {
      return response.data as Category;
    }
    throw new Error(response.message || "Failed to create category");
  },
);

export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }: { id: string; data: Partial<Category> }) => {
    const response = await categoryAPI.update(id, data);
    if (response.success && response.data) {
      return response.data as Category;
    }
    throw new Error(response.message || "Failed to update category");
  },
);

export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string) => {
    const response = await categoryAPI.delete(id);
    if (response.success) {
      return id;
    }
    throw new Error(response.message || "Failed to delete category");
  },
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCategories: (state) => {
      state.categories = [];
      state.lastFetched = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
    addCategoryOptimistic: (state, action) => {
      state.categories.push(action.payload);
    },
    updateCategoryOptimistic: (state, action) => {
      const index = state.categories.findIndex(
        (cat) => cat._id === action.payload._id,
      );
      if (index !== -1) {
        state.categories[index] = {
          ...state.categories[index],
          ...action.payload,
        };
      }
    },
    removeCategoryOptimistic: (state, action) => {
      state.categories = state.categories.filter(
        (cat) => cat._id !== action.payload,
      );
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          (action.payload as string) ||
          action.error.message ||
          "Failed to fetch categories";
      })
      // Create Category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories.push(action.payload);
        state.lastFetched = null;
        state.error = null;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to create category";
      })
      // Update Category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.categories.findIndex(
          (cat) => cat._id === action.payload._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
        state.lastFetched = null;
        state.error = null;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update category";
      })
      // Delete Category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = state.categories.filter(
          (cat) => cat._id !== action.payload,
        );
        state.lastFetched = null;
        state.error = null;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to delete category";
      });
  },
});

export const {
  clearError,
  clearCategories,
  invalidateCache,
  addCategoryOptimistic,
  updateCategoryOptimistic,
  removeCategoryOptimistic,
} = categorySlice.actions;

export default categorySlice.reducer;
