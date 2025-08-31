import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import notificationReducer from './slices/notificationSlice';
import themeReducer from './slices/themeSlice';
import favoritesReducer from './slices/favoritesSlice';
import comparisonReducer from './slices/comparisonSlice';
import { apiSlice } from './slices/apiSlice';
import { adminApiV2Slice } from './slices/admin-v2/adminApiSlice';
import { authMiddlewareWithRetry } from './middleware/authMiddleware';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    notification: notificationReducer,
    theme: themeReducer,
    favorites: favoritesReducer,
    comparison: comparisonReducer,
    api: apiSlice.reducer,
    adminApiV2: adminApiV2Slice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(
      apiSlice.middleware,
      adminApiV2Slice.middleware,
      authMiddlewareWithRetry
    ),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
