import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
  unreadCount: 0,
  settings: {
    enablePush: true,
    enableSound: true,
    enableEmail: true,
    types: {
      orders: true,
      products: true,
      system: true,
      marketing: false,
    },
  },
  isLoading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: action.payload.id || `notification_${Date.now()}_${Math.random()}`,
        type: action.payload.type || 'info',
        title: action.payload.title,
        message: action.payload.message,
        timestamp: action.payload.timestamp || Date.now(),
        read: action.payload.read || false,
        priority: action.payload.priority || 'normal',
        data: action.payload.data || null,
        duration: action.payload.duration || 5000,
        actions: action.payload.actions || null,
      };

      state.notifications.unshift(notification);

      if (!notification.read) {
        state.unreadCount += 1;
      }

      // Keep only last 100 notifications
      if (state.notifications.length > 100) {
        state.notifications = state.notifications.slice(0, 100);
      }
    },

    removeNotification: (state, action) => {
      const id = action.payload;
      const index = state.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    markAsRead: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },

    // Increment unread count (for external updates)
    incrementUnreadNotifications: (state) => {
      state.unreadCount += 1;
    },

    // Update notification settings
    updateNotificationSettings: (state, action) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      };
    },

    // Set loading state
    setNotificationsLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    // Set error state
    setNotificationsError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
  markAllAsRead,
  incrementUnreadNotifications,
  updateNotificationSettings,
  setNotificationsLoading,
  setNotificationsError,
} = notificationSlice.actions;

// Helper action creators for common notification types
export const showSuccessNotification = (message, title = 'Success') =>
  addNotification({
    type: 'success',
    title,
    message,
    duration: 5000,
  });

export const showErrorNotification = (message, title = 'Error') =>
  addNotification({
    type: 'error',
    title,
    message,
    duration: 8000,
  });

export const showWarningNotification = (message, title = 'Warning') =>
  addNotification({
    type: 'warning',
    title,
    message,
    duration: 6000,
  });

export const showInfoNotification = (message, title = 'Info') =>
  addNotification({
    type: 'info',
    title,
    message,
    duration: 4000,
  });

// Selectors
export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadNotifications = (state) =>
  state.notification.notifications.filter((n) => !n.read);
export const selectUnreadNotificationCount = (state) =>
  state.notification.unreadCount;
export const selectNotificationSettings = (state) =>
  state.notification.settings;
export const selectNotificationsLoading = (state) =>
  state.notification.isLoading;
export const selectNotificationsError = (state) => state.notification.error;

export default notificationSlice.reducer;
