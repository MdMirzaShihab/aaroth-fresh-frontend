/**
 * className utility for merging Tailwind classes
 */
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { APP_CONFIG } from '../constants';

/**
 * Format currency value
 */
export const formatCurrency = (amount, currency = 'BDT') => {
  if (typeof amount !== 'number') {
    return `${currency} 0.00`;
  }

  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency === 'BDT' ? 'USD' : currency, // Fallback as BDT may not be supported
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace('$', `${currency} `);
};

/**
 * Format number with locale formatting
 */
export const formatNumber = (number, options = {}) => {
  if (typeof number !== 'number') {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
    ...options,
  }).format(number);
};

/**
 * Format percentage value
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number') {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/[^\d+]/g, '');

  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }

  return cleaned;
};

/**
 * Validate phone number
 */
export const validatePhoneNumber = (phone) => {
  return APP_CONFIG.PHONE_REGEX.test(phone);
};

/**
 * Format date for display
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(
    new Date(date)
  );
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date) => {
  if (!date) return '';

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Calculate time ago
 */
export const timeAgo = (date) => {
  if (!date) return '';

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(date);
};

/**
 * Generate unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Debounce function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength).trim() + '...';
};

/**
 * Validate file size and type
 */
export const validateFile = (file) => {
  const errors = [];

  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    errors.push('File size must be less than 5MB');
  }

  if (!APP_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
    errors.push('Please upload a valid image file (JPEG, PNG, WebP)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Create URL with query parameters
 */
export const createURL = (baseURL, params = {}) => {
  const url = new URL(baseURL, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.append(key, value);
    }
  });

  return url.toString();
};

/**
 * Parse URL query parameters
 */
export const parseQueryParams = (search) => {
  const params = new URLSearchParams(search);
  const result = {};

  for (const [key, value] of params.entries()) {
    result[key] = value;
  }

  return result;
};

/**
 * Check if user has permission
 */
export const hasPermission = (userRole, requiredRoles) => {
  if (!userRole || !requiredRoles) return false;

  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }

  return userRole === requiredRoles;
};

/**
 * Check if user has a specific role
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !user.role || !Array.isArray(roles)) return false;
  return roles.includes(user.role);
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '';

  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Scroll to element
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }
};

/**
 * Token Management Utilities
 */
export class TokenStorage {
  static TOKEN_KEY = 'token';

  static setToken(token) {
    if (typeof token === 'string' && token.trim()) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static hasToken() {
    const token = this.getToken();
    return Boolean(token && token.trim());
  }

  static isTokenExpired(token) {
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  static getTokenPayload(token) {
    if (!token) return null;

    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      return null;
    }
  }
}

/**
 * Enhanced Phone Number Validation for Bangladesh
 */
export const validateBangladeshPhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Phone number is required' };

  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Check if starts with +88 (Bangladesh country code)
  if (!cleanPhone.startsWith('+88')) {
    return {
      isValid: false,
      message: 'Phone number must start with +88 (Bangladesh country code)',
    };
  }

  // Remove country code for local validation
  const localNumber = cleanPhone.substring(3);

  // Bangladesh mobile numbers are 11 digits starting with 01
  if (localNumber.length !== 11 || !localNumber.startsWith('01')) {
    return {
      isValid: false,
      message:
        'Invalid Bangladesh mobile number format. Must be 11 digits starting with 01',
    };
  }

  // Valid operators in Bangladesh: 013, 014, 015, 016, 017, 018, 019
  const validOperators = ['013', '014', '015', '016', '017', '018', '019'];
  const operator = localNumber.substring(0, 3);

  if (!validOperators.includes(operator)) {
    return {
      isValid: false,
      message:
        'Invalid operator code. Must be 013, 014, 015, 016, 017, 018, or 019',
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Format Bangladesh phone number
 */
export const formatBangladeshPhone = (phone) => {
  if (!phone) return '';

  const cleaned = phone.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+88') && cleaned.length === 14) {
    // +8801712345678 -> +880 1712-345-678
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 8)}-${cleaned.substring(8, 11)}-${cleaned.substring(11)}`;
  }

  return cleaned.startsWith('+88') ? cleaned : `+88${cleaned}`;
};

/**
 * Format phone number for display (alias for formatBangladeshPhone)
 */
export const formatPhoneForDisplay = (phone) => {
  return formatBangladeshPhone(phone);
};

/**
 * Phone number utilities for input fields
 */
export const phoneInputUtils = {
  // Clean and format as user types
  formatInput: (value) => {
    let cleaned = value.replace(/[^\d]/g, '');

    // Handle case where input starts with 0 (local format)
    if (cleaned.startsWith('01')) {
      cleaned = '880' + cleaned;
    } else if (!cleaned.startsWith('880')) {
      cleaned = '880' + cleaned;
    }

    // Remove extra 880s if user types them
    cleaned = cleaned.replace(/^880+/, '880');

    // Format: +880 1712-345-678
    let formatted = '+';
    if (cleaned.length >= 3) {
      formatted += cleaned.substring(0, 3) + ' ';
      if (cleaned.length > 3) {
        formatted += cleaned.substring(3, 7);
        if (cleaned.length > 7) {
          formatted += '-' + cleaned.substring(7, 10);
          if (cleaned.length > 10) {
            formatted += '-' + cleaned.substring(10, 13);
          }
        }
      }
    }

    return formatted;
  },

  // Get clean value for API calls
  getCleanValue: (formattedValue) => {
    return formattedValue.replace(/[^\d+]/g, '');
  },

  // Placeholder text
  placeholder: '+880 1712-345-678',
};

/**
 * Role-based access control utilities
 */
export const roleUtils = {
  isAdmin: (userRole) => userRole === 'admin',
  isVendor: (userRole) => userRole === 'vendor',
  isBuyerOwner: (userRole) => userRole === 'buyerOwner',
  isBuyerManager: (userRole) => userRole === 'buyerManager',
  isBuyerUser: (userRole) =>
    ['buyerOwner', 'buyerManager'].includes(userRole),

  canManageListings: (userRole) => ['admin', 'vendor'].includes(userRole),
  canPlaceOrders: (userRole) =>
    ['buyerOwner', 'buyerManager'].includes(userRole),
  canManageUsers: (userRole) => userRole === 'admin',
  canViewAnalytics: (userRole) => userRole === 'admin',
  canApproveVendors: (userRole) => userRole === 'admin',
};

/**
 * API Error handling utilities
 */
export const apiUtils = {
  // Extract error message from API response
  getErrorMessage: (error) => {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return !error.response || error.code === 'NETWORK_ERROR';
  },

  // Check if error is authentication related
  isAuthError: (error) => {
    return error?.response?.status === 401;
  },

  // Check if error is permission related
  isPermissionError: (error) => {
    return error?.response?.status === 403;
  },

  // Format validation errors
  formatValidationErrors: (error) => {
    if (
      error?.response?.data?.errors &&
      Array.isArray(error.response.data.errors)
    ) {
      return error.response.data.errors
        .map((err) => err.message || err)
        .join(', ');
    }
    return apiUtils.getErrorMessage(error);
  },
};

/**
 * Local Storage utilities with error handling
 */
export const storageUtils = {
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
      return false;
    }
  },
};

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};
