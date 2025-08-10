import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../store/slices/notificationSlice';
import { logout } from '../store/slices/authSlice';
import { apiUtils } from '../utils';

/**
 * Custom hook for centralized error handling
 * Provides consistent error handling patterns across the application
 */
export const useErrorHandler = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleError = (error, options = {}) => {
    const {
      showNotification = true,
      title,
      fallbackMessage = 'An unexpected error occurred',
      redirectOnAuth = true,
      logError = true,
    } = options;

    // Log error in development
    if (logError && process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error);
    }

    // Handle authentication errors
    if (apiUtils.isAuthError(error)) {
      if (showNotification) {
        dispatch(
          addNotification({
            type: 'error',
            title: title || 'Authentication Error',
            message: 'Your session has expired. Please log in again.',
            duration: 6000,
          })
        );
      }

      // Auto logout and redirect
      if (redirectOnAuth) {
        dispatch(logout());
        navigate('/login');
      }
      return;
    }

    // Handle permission errors
    if (apiUtils.isPermissionError(error)) {
      if (showNotification) {
        dispatch(
          addNotification({
            type: 'error',
            title: title || 'Permission Denied',
            message: 'You do not have permission to perform this action.',
            duration: 6000,
          })
        );
      }
      return;
    }

    // Handle network errors
    if (apiUtils.isNetworkError(error)) {
      if (showNotification) {
        dispatch(
          addNotification({
            type: 'error',
            title: title || 'Connection Error',
            message:
              'Unable to connect to the server. Please check your internet connection.',
            duration: 8000,
          })
        );
      }
      return;
    }

    // Handle validation errors
    const errorMessage = apiUtils.formatValidationErrors(error);

    if (showNotification) {
      dispatch(
        addNotification({
          type: 'error',
          title: title || 'Error',
          message: errorMessage || fallbackMessage,
          duration: 6000,
        })
      );
    }
  };

  const handleSuccess = (message, title = 'Success') => {
    dispatch(
      addNotification({
        type: 'success',
        title,
        message,
        duration: 4000,
      })
    );
  };

  const handleWarning = (message, title = 'Warning') => {
    dispatch(
      addNotification({
        type: 'warning',
        title,
        message,
        duration: 5000,
      })
    );
  };

  const handleInfo = (message, title = 'Info') => {
    dispatch(
      addNotification({
        type: 'info',
        title,
        message,
        duration: 4000,
      })
    );
  };

  return {
    handleError,
    handleSuccess,
    handleWarning,
    handleInfo,
  };
};

/**
 * Hook for async operation error handling with loading state
 */
export const useAsyncError = () => {
  const { handleError, handleSuccess } = useErrorHandler();

  const executeAsync = async (asyncFn, options = {}) => {
    const {
      onSuccess,
      onError,
      successMessage,
      errorOptions = {},
      showSuccessNotification = false,
    } = options;

    try {
      const result = await asyncFn();

      if (successMessage && showSuccessNotification) {
        handleSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return { success: true, data: result };
    } catch (error) {
      handleError(error, errorOptions);

      if (onError) {
        onError(error);
      }

      return { success: false, error };
    }
  };

  return { executeAsync };
};

/**
 * Hook for form submission error handling
 */
export const useFormError = () => {
  const { handleError, handleSuccess } = useErrorHandler();

  const handleFormError = (error, formMethods) => {
    // If we have form methods (react-hook-form), set field-specific errors
    if (formMethods && error?.response?.data?.errors) {
      const errors = error.response.data.errors;

      if (Array.isArray(errors)) {
        errors.forEach((err) => {
          if (err.field) {
            formMethods.setError(err.field, {
              type: 'manual',
              message: err.message,
            });
          }
        });
      } else if (typeof errors === 'object') {
        Object.entries(errors).forEach(([field, message]) => {
          formMethods.setError(field, {
            type: 'manual',
            message: Array.isArray(message) ? message[0] : message,
          });
        });
      }
    }

    // Also show general error notification
    handleError(error, {
      title: 'Validation Error',
      showNotification: true,
    });
  };

  const handleFormSuccess = (message = 'Form submitted successfully') => {
    handleSuccess(message);
  };

  return {
    handleFormError,
    handleFormSuccess,
  };
};
