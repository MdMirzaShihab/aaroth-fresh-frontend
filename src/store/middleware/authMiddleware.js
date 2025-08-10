import { isRejectedWithValue } from '@reduxjs/toolkit';
import { logout } from '../slices/authSlice';
import { addNotification } from '../slices/notificationSlice';

/**
 * Auth Middleware
 *
 * Handles authentication-related errors and token expiration
 */
export const authMiddleware = (store) => (next) => (action) => {
  // Handle RTK Query rejected actions
  if (isRejectedWithValue(action)) {
    const { payload } = action;

    // Check for authentication errors
    if (payload && payload.status === 401) {
      const state = store.getState();

      // Only logout if user was previously authenticated
      if (state.auth.isAuthenticated) {
        // Clear auth state
        store.dispatch(logout());

        // Show appropriate notification
        store.dispatch(
          addNotification({
            type: 'warning',
            message: 'Your session has expired. Please log in again.',
          })
        );

        // Redirect to login page
        if (typeof window !== 'undefined' && window.location) {
          const currentPath = window.location.pathname;

          // Don't redirect if already on auth pages
          if (
            !currentPath.startsWith('/login') &&
            !currentPath.startsWith('/register') &&
            !currentPath.startsWith('/forgot-password')
          ) {
            // Store the current path for redirect after login
            localStorage.setItem('redirectAfterLogin', currentPath);

            // Redirect to login
            window.location.href = '/login';
          }
        }
      }
    }

    // Handle other authentication-related errors
    else if (payload && payload.status === 403) {
      store.dispatch(
        addNotification({
          type: 'error',
          message:
            'Access denied. You do not have permission to perform this action.',
        })
      );
    }

    // Handle account suspension
    else if (
      payload &&
      payload.data &&
      payload.data.code === 'ACCOUNT_SUSPENDED'
    ) {
      store.dispatch(logout());
      store.dispatch(
        addNotification({
          type: 'error',
          message: 'Your account has been suspended. Please contact support.',
        })
      );

      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/account/suspended';
      }
    }

    // Handle account deactivation
    else if (
      payload &&
      payload.data &&
      payload.data.code === 'ACCOUNT_INACTIVE'
    ) {
      store.dispatch(logout());
      store.dispatch(
        addNotification({
          type: 'warning',
          message:
            'Your account is inactive. Please contact support to reactivate.',
        })
      );

      if (typeof window !== 'undefined' && window.location) {
        window.location.href = '/account/inactive';
      }
    }
  }

  return next(action);
};

/**
 * Enhanced auth middleware with retry logic
 */
export const authMiddlewareWithRetry = (store) => (next) => (action) => {
  // Handle RTK Query rejected actions with retry logic
  if (isRejectedWithValue(action)) {
    const { payload, meta } = action;

    // Check for network errors that might be retryable
    if (payload && payload.status === 'FETCH_ERROR') {
      const retryCount = meta?.baseQueryMeta?.retryCount || 0;

      if (retryCount < 2) {
        // Retry up to 2 times
        // Show network error notification
        store.dispatch(
          addNotification({
            type: 'warning',
            message: `Network error. Retrying... (${retryCount + 1}/2)`,
          })
        );
      } else {
        // Show final network error
        store.dispatch(
          addNotification({
            type: 'error',
            message:
              'Network connection failed. Please check your internet connection.',
          })
        );
      }
    }

    // Check for server errors
    else if (payload && payload.status >= 500) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: 'Server error occurred. Please try again later.',
        })
      );
    }
  }

  // Call the basic auth middleware
  return authMiddleware(store)(next)(action);
};

/**
 * Token refresh middleware (for future implementation)
 */
export const tokenRefreshMiddleware = (store) => (next) => (action) => {
  // This can be extended to handle token refresh logic
  // when refresh tokens are implemented
  return next(action);
};

export default authMiddleware;
