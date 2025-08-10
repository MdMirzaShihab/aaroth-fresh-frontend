import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import authReducer from '../store/slices/authSlice';
import cartReducer from '../store/slices/cartSlice';
import notificationReducer from '../store/slices/notificationSlice';
import themeReducer from '../store/slices/themeSlice';
import { apiSlice } from '../store/slices/apiSlice';

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      notification: notificationReducer,
      theme: themeReducer,
      api: apiSlice.reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }).concat(apiSlice.middleware),
  });
};

export const renderWithProviders = (ui, options = {}) => {
  const {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
};

// Mock RTK Query hooks for testing
export const createMockRTKQuery = (data, isLoading = false, error = null) => ({
  data,
  isLoading,
  error,
  refetch: vi.fn(),
  isSuccess: !isLoading && !error,
  isError: !!error,
  isFetching: isLoading,
});

// Mock auth user for testing
export const createMockUser = (role = 'vendor') => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  phone: '+8801234567890',
  role,
  isApproved: true,
  createdAt: '2024-01-01T00:00:00.000Z',
});

// Mock listing for testing
export const createMockListing = (overrides = {}) => ({
  id: '1',
  title: 'Fresh Tomatoes',
  description: 'Fresh red tomatoes from local farm',
  price: 50.0,
  unit: 'kg',
  category: 'vegetables',
  vendorId: '1',
  imageUrl: '/mock-image.jpg',
  status: 'active',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Mock order for testing
export const createMockOrder = (overrides = {}) => ({
  id: '1',
  items: [
    {
      id: '1',
      title: 'Fresh Tomatoes',
      price: 50.0,
      quantity: 2,
      unit: 'kg',
    },
  ],
  total: 100.0,
  status: 'pending',
  vendorId: '1',
  restaurantId: '2',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

// Test helpers
export const waitFor = (callback, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      try {
        callback();
        resolve();
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, 50);
        }
      }
    };

    check();
  });
};
