import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  isSidebarOpen: boolean
  isModalOpen: boolean
  modalType: string | null
  modalData: any
  theme: 'dark' | 'light'
  notifications: Notification[]
}

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const initialState: UIState = {
  isSidebarOpen: false,
  isModalOpen: false,
  modalType: null,
  modalData: null,
  theme: 'dark',
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
    openModal: (state, action: PayloadAction<{ type: string; data?: any }>) => {
      state.isModalOpen = true
      state.modalType = action.payload.type
      state.modalData = action.payload.data || null
    },
    closeModal: (state) => {
      state.isModalOpen = false
      state.modalType = null
      state.modalData = null
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString()
      state.notifications.push({ ...action.payload, id })
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  openModal,
  closeModal,
  toggleTheme,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer