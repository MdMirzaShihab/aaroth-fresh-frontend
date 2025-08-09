import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import { apiSlice } from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notification: notificationReducer,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
