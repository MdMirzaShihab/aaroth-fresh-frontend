import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const { token } = state.auth;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        type: 'network',
      });
    }

    // Handle other HTTP errors
    const errorMessage =
      error.response?.data?.message || 'Something went wrong';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export default api;
