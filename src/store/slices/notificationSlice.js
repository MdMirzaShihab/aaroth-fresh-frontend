import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      const notification = {
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
        ...action.payload,
      };
      state.notifications.unshift(notification);
    },
    removeNotification: (state, action) => {
      const id = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== id
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markAsRead: (state, action) => {
      const id = action.payload;
      const notification = state.notifications.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        notification.read = true;
      });
    },
  },
});

export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markAsRead,
  markAllAsRead,
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

export default notificationSlice.reducer;
