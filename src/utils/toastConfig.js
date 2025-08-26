import { toast } from 'react-hot-toast';

/**
 * Toast configuration utilities for consistent messaging
 * Uses Futuristic Minimalism design principles with glassmorphism effects
 */

// Success toast with gentle celebration styling
export const showSuccessToast = (message, options = {}) => {
  return toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: 'rgba(143, 212, 190, 0.1)',
      color: '#006A4E',
      border: '1px solid rgba(143, 212, 190, 0.3)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#006A4E',
      secondary: 'rgba(143, 212, 190, 0.2)',
    },
    ...options,
  });
};

// Error toast with soft alert styling
export const showErrorToast = (message, options = {}) => {
  return toast.error(message, {
    duration: 6000,
    position: 'top-right',
    style: {
      background: 'rgba(233, 75, 60, 0.05)',
      color: 'rgba(233, 75, 60, 0.9)',
      border: '1px solid rgba(233, 75, 60, 0.2)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px 0 rgba(233, 75, 60, 0.1)',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
    },
    iconTheme: {
      primary: '#E94B3C',
      secondary: 'rgba(233, 75, 60, 0.1)',
    },
    ...options,
  });
};

// Warning toast with cautious notice styling
export const showWarningToast = (message, options = {}) => {
  return toast(message, {
    duration: 5000,
    position: 'top-right',
    style: {
      background: 'rgba(245, 158, 11, 0.1)',
      color: 'rgba(180, 83, 9, 0.9)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px 0 rgba(245, 158, 11, 0.1)',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
    },
    icon: '⚠️',
    ...options,
  });
};

// Info toast with subtle information styling
export const showInfoToast = (message, options = {}) => {
  return toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: 'rgba(30, 64, 175, 0.9)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px 0 rgba(59, 130, 246, 0.1)',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
    },
    icon: 'ℹ️',
    ...options,
  });
};

// Loading toast with zen-like patience
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#3A2A1F',
      border: '1px solid rgba(229, 231, 235, 0.5)',
      borderRadius: '16px',
      backdropFilter: 'blur(8px)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
      padding: '16px 20px',
      fontSize: '14px',
      fontWeight: '500',
    },
    ...options,
  });
};

// Verification specific toasts (updated for three-state system)
export const showVerificationSuccessToast = (entityType, status) => {
  let actionText;
  let icon;
  
  switch (status) {
    case 'approved':
      actionText = 'verified';
      icon = '✅';
      break;
    case 'rejected':
      actionText = 'rejected';
      icon = '❌';
      break;
    case 'pending':
      actionText = 'set to pending';
      icon = '⏳';
      break;
    default:
      actionText = 'updated';
      icon = '🔄';
  }
  
  const message = `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} ${actionText} successfully`;

  return showSuccessToast(message, {
    icon,
    duration: 5000,
  });
};

export const showVerificationErrorToast = (entityType, status, error) => {
  const statusText = status === 'approved' ? 'approve' : status === 'rejected' ? 'reject' : 'update';
  const defaultMessage = `Failed to ${statusText} ${entityType}`;
  const message = error?.message || error?.data?.message || defaultMessage;

  return showErrorToast(message, {
    duration: 8000,
  });
};

// Business status change notifications (updated for three-state system)
export const showBusinessStatusUpdateToast = (businessName, status) => {
  if (status === 'approved') {
    return showSuccessToast(
      `🎉 Congratulations! ${businessName} is now verified and can access all platform features.`,
      {
        duration: 8000,
        style: {
          background:
            'linear-gradient(135deg, rgba(143, 212, 190, 0.1) 0%, rgba(0, 106, 78, 0.05) 100%)',
          minWidth: '400px',
        },
      }
    );
  } else {
    return showWarningToast(
      `Your business verification has been updated. Please check your dashboard for details.`,
      {
        duration: 6000,
      }
    );
  }
};

// Permission denied toast
export const showPermissionDeniedToast = (action = 'perform this action') => {
  return showWarningToast(
    `You don't have permission to ${action}. Please ensure your business is verified.`,
    {
      duration: 6000,
    }
  );
};

// Network error toast
export const showNetworkErrorToast = () => {
  return showErrorToast(
    'Network connection error. Please check your internet connection and try again.',
    {
      duration: 6000,
    }
  );
};

// Default toast configurations
export const toastConfig = {
  // Global toast container styling
  containerStyle: {
    top: 20,
    right: 20,
  },

  // Default options
  default: {
    duration: 4000,
    position: 'top-right',
  },

  // Toast positioning for mobile
  mobile: {
    position: 'top-center',
    containerStyle: {
      top: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100vw - 32px)',
      maxWidth: '400px',
    },
  },
};

export default {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  showVerificationSuccessToast,
  showVerificationErrorToast,
  showBusinessStatusUpdateToast,
  showPermissionDeniedToast,
  showNetworkErrorToast,
  toastConfig,
};
