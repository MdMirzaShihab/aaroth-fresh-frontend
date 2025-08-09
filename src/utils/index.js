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
