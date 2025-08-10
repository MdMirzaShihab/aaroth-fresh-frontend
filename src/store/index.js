import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';
import { apiSlice } from './slices/apiSlice';
import { authMiddlewareWithRetry } from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notification: notificationReducer,
    theme: themeReducer,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware, authMiddlewareWithRetry),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
