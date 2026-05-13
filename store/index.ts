import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from 'redux'

// Import slices
import authReducer from './slices/authSlice'
import pollReducer from './slices/pollSlice'
import voteReducer from './slices/voteSlice'
import uiReducer from './slices/uiSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only auth will be persisted
  blacklist: ['polls', 'votes', 'ui'], // these won't be persisted
}

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  polls: pollReducer,
  votes: voteReducer,
  ui: uiReducer,
})

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Create persistor
export const persistor = persistStore(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch