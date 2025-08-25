/**
 * Error handling utilities for API responses and application errors
 * Handles the new backend API error structure
 */

/**
 * Extract user-friendly error message from API error response
 * @param {Object} error - RTK Query error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  // Handle network errors
  if (error.name === 'TypeError' || error.message?.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Handle RTK Query error structure
  if (error.status) {
    // Handle different HTTP status codes
    switch (error.status) {
      case 400:
        return (
          error.data?.message ||
          'Invalid request. Please check your input and try again.'
        );
      case 401:
        return 'Authentication required. Please log in and try again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return (
          error.data?.message || 'This action conflicts with existing data.'
        );
      case 422:
        return (
          error.data?.message || 'Validation failed. Please check your input.'
        );
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        break;
    }
  }

  // Handle API error response with message
  if (error.data?.message) {
    return error.data.message;
  }

  // Handle validation errors
  if (error.data?.errors) {
    const validationErrors = error.data.errors;
    if (Array.isArray(validationErrors)) {
      return (
        validationErrors[0]?.message ||
        validationErrors[0] ||
        'Validation error'
      );
    }
    if (typeof validationErrors === 'object') {
      const firstError = Object.values(validationErrors)[0];
      return Array.isArray(firstError) ? firstError[0] : firstError;
    }
  }

  // Handle serialized error from RTK Query
  if (error.error) {
    return error.error;
  }

  // Handle simple string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error structures
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Get notification type based on error status
 * @param {Object} error - RTK Query error object
 * @returns {string} Notification type ('error', 'warning', 'info')
 */
export const getErrorType = (error) => {
  if (!error.status) return 'error';

  if (error.status >= 500) return 'error';
  if (error.status === 401 || error.status === 403) return 'warning';
  if (error.status === 404) return 'info';

  return 'error';
};

/**
 * Check if error is a network/connectivity issue
 * @param {Object} error - RTK Query error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  return (
    error.name === 'TypeError' ||
    error.message?.includes('fetch') ||
    error.message?.includes('network') ||
    error.status === 'FETCH_ERROR'
  );
};

/**
 * Check if error indicates authentication failure
 * @param {Object} error - RTK Query error object
 * @returns {boolean} True if authentication error
 */
export const isAuthError = (error) => {
  return error.status === 401;
};

/**
 * Check if error indicates permission/authorization failure
 * @param {Object} error - RTK Query error object
 * @returns {boolean} True if permission error
 */
export const isPermissionError = (error) => {
  return error.status === 403;
};

/**
 * Check if error is retriable (temporary server issues)
 * @param {Object} error - RTK Query error object
 * @returns {boolean} True if error is retriable
 */
export const isRetriableError = (error) => {
  return error.status >= 500 || error.status === 429 || isNetworkError(error);
};

/**
 * Format validation errors for display
 * @param {Object} error - RTK Query error object
 * @returns {Array} Array of validation error messages
 */
export const getValidationErrors = (error) => {
  if (!error.data?.errors) return [];

  const errors = error.data.errors;

  if (Array.isArray(errors)) {
    return errors.map((err) => err.message || err);
  }

  if (typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, messages]) => {
        const messageList = Array.isArray(messages) ? messages : [messages];
        return messageList.map((msg) => `${field}: ${msg}`);
      })
      .flat();
  }

  return [errors.toString()];
};

/**
 * Handle common error scenarios with appropriate actions
 * @param {Object} error - RTK Query error object
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} options - Options for error handling
 */
export const handleApiError = (error, dispatch, options = {}) => {
  const {
    showNotification = true,
    logError = true,
    onAuthError = null,
    onPermissionError = null,
    onNetworkError = null,
  } = options;

  // Log error for debugging (only in development)
  if (logError && process.env.NODE_ENV === 'development') {
    console.error('API Error:', error);
  }

  // Handle specific error types
  if (isAuthError(error) && onAuthError) {
    onAuthError(error);
    return;
  }

  if (isPermissionError(error) && onPermissionError) {
    onPermissionError(error);
    return;
  }

  if (isNetworkError(error) && onNetworkError) {
    onNetworkError(error);
    return;
  }

  // Show notification if enabled
  if (showNotification && dispatch) {
    const { addNotification } = require('../store/slices/notificationSlice');
    dispatch(
      addNotification({
        type: getErrorType(error),
        message: getErrorMessage(error),
        duration: 5000,
      })
    );
  }
};

/**
 * Create error boundary fallback props
 * @param {Error} error - JavaScript error
 * @param {Function} resetError - Function to reset error boundary
 * @returns {Object} Props for error boundary fallback component
 */
export const createErrorBoundaryProps = (error, resetError) => ({
  error,
  resetError,
  message: getErrorMessage(error),
  isRetriable: isRetriableError(error),
});
