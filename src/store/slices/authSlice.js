import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      // Clear localStorage
      localStorage.removeItem('token');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle login mutation
    builder
      .addMatcher(apiSlice.endpoints.login.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(apiSlice.endpoints.login.matchFulfilled, (state, action) => {
        const { data } = action.payload;
        if (data.success) {
          state.loading = false;
          state.user = data.user;
          state.token = data.token;
          state.isAuthenticated = true;
          state.error = null;

          // Store in localStorage
          localStorage.setItem('token', data.token);
        }
      })
      .addMatcher(apiSlice.endpoints.login.matchRejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;

        // Clear localStorage
        localStorage.removeItem('token');
      })

      // Handle register mutation
      .addMatcher(apiSlice.endpoints.register.matchPending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addMatcher(
        apiSlice.endpoints.register.matchFulfilled,
        (state, action) => {
          const { data } = action.payload;
          if (data.success) {
            state.loading = false;
            state.user = data.user;
            state.token = data.token;
            state.isAuthenticated = true;
            state.error = null;

            // Store in localStorage
            localStorage.setItem('token', data.token);
          }
        }
      )
      .addMatcher(
        apiSlice.endpoints.register.matchRejected,
        (state, action) => {
          state.loading = false;
          state.error = action.error.message || 'Registration failed';
        }
      )

      // Handle logout mutation
      .addMatcher(apiSlice.endpoints.logout.matchFulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.loading = false;

        // Clear localStorage
        localStorage.removeItem('token');
      })

      // Handle getCurrentUser query
      .addMatcher(
        apiSlice.endpoints.getCurrentUser.matchFulfilled,
        (state, action) => {
          const { data } = action.payload;
          if (data.success) {
            // Backend returns user in 'user' field per API docs
            state.user = data.user;
            state.isAuthenticated = true;
          }
        }
      )
      .addMatcher(apiSlice.endpoints.getCurrentUser.matchRejected, (state) => {
        // Token is invalid, logout user
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, updateUser, clearError, setLoading } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
