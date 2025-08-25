import { createSlice } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  tokenExpiry: localStorage.getItem('tokenExpiry')
    ? parseInt(localStorage.getItem('tokenExpiry'))
    : null,
  isRefreshing: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      const { user, token, refreshToken, expiresIn } = action.payload;
      state.loading = false;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.tokenExpiry = Date.now() + expiresIn * 1000;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiry', state.tokenExpiry.toString());
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    refreshTokenStart: (state) => {
      state.isRefreshing = true;
    },
    refreshTokenSuccess: (state, action) => {
      const { token, expiresIn } = action.payload;
      state.token = token;
      state.tokenExpiry = Date.now() + expiresIn * 1000;
      state.isRefreshing = false;

      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', state.tokenExpiry.toString());
    },
    refreshTokenFailure: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isRefreshing = false;
      state.tokenExpiry = null;

      localStorage.clear();
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
      state.error = null;
      state.loading = false;
      state.isRefreshing = false;

      // Clear localStorage
      localStorage.clear();
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
        const response = action.payload;
        if (response.success) {
          state.loading = false;
          state.user = response.user;
          state.token = response.token;
          state.isAuthenticated = true;
          state.error = null;

          // Store in localStorage
          localStorage.setItem('token', response.token);
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
          const response = action.payload;
          if (response.success) {
            state.loading = false;
            state.user = response.user;
            state.token = response.token;
            state.isAuthenticated = true;
            state.error = null;

            // Store in localStorage
            localStorage.setItem('token', response.token);
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
          const response = action.payload;
          if (response.success) {
            // Backend returns user in 'data' field for getCurrentUser endpoint
            state.user = response.data;
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

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
  updateUser,
  clearError,
  setLoading,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectShouldRefresh = (state) => {
  const { isAuthenticated, isRefreshing, tokenExpiry } = state.auth;
  return (
    isAuthenticated &&
    !isRefreshing &&
    tokenExpiry &&
    Date.now() >= tokenExpiry - 120000
  ); // Refresh 2 minutes before expiry
};

export default authSlice.reducer;
