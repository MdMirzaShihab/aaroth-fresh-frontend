// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  BUYER_OWNER: 'buyerOwner',
  BUYER_MANAGER: 'buyerManager',
};

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Listing statuses
export const LISTING_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  PENDING_APPROVAL: 'pending_approval',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  LISTINGS: {
    GET_ALL: '/listings',
    GET_ONE: (id) => `/listings/${id}`,
    CREATE: '/listings',
    UPDATE: (id) => `/listings/${id}`,
    DELETE: (id) => `/listings/${id}`,
  },
  ORDERS: {
    GET_ALL: '/orders',
    GET_ONE: (id) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
  },
  PUBLIC: {
    CATEGORIES: '/public/categories',
    FEATURED_PRODUCTS: '/public/featured-products',
  },
  ADMIN: {
    USERS: '/admin/users',
    APPROVE_VENDOR: (id) => `/admin/users/${id}/approve`,
    ANALYTICS: '/admin/analytics',
  },
};

// App configuration from environment variables
export const APP_CONFIG = {
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Aaroth Fresh',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION:
    import.meta.env.VITE_APP_DESCRIPTION || 'B2B Fresh Produce Marketplace',

  // API Configuration
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  API_TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,

  // UI Configuration
  ITEMS_PER_PAGE: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 20,
  DEBOUNCE_DELAY: parseInt(import.meta.env.VITE_DEBOUNCE_DELAY) || 300,
  DEFAULT_THEME: import.meta.env.VITE_DEFAULT_THEME || 'light',

  // File Upload
  MAX_FILE_SIZE:
    parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: import.meta.env.VITE_ALLOWED_IMAGE_TYPES?.split(',') || [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ],

  // Authentication
  TOKEN_STORAGE_KEY: import.meta.env.VITE_TOKEN_STORAGE_KEY || 'token',
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 24, // hours

  // Validation
  PHONE_REGEX: /^\+\d{10,15}$/,
  PASSWORD_MIN_LENGTH: 6,

  // Feature Flags
  ENABLE_DEV_TOOLS: import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true',
  ENABLE_MOCK_API: import.meta.env.VITE_ENABLE_MOCK_API === 'true',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_ERROR_REPORTING:
    import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',

  // Development
  SHOW_DEBUG_INFO: import.meta.env.VITE_SHOW_DEBUG_INFO === 'true',
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',

  // Environment
  IS_DEVELOPMENT: import.meta.env.MODE === 'development',
  IS_PRODUCTION: import.meta.env.MODE === 'production',
};

// Navigation routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  LISTINGS: '/listings',
  ORDERS: '/orders',
  PROFILE: '/profile',
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    ANALYTICS: '/admin/analytics',
  },
  VENDOR: {
    DASHBOARD: '/vendor',
    LISTINGS: '/vendor/listings',
    ORDERS: '/vendor/orders',
    PROFILE: '/vendor/profile',
  },
  BUYER: {
    DASHBOARD: '/buyer',
    BROWSE: '/buyer/browse',
    ORDERS: '/buyer/orders',
    PROFILE: '/buyer/profile',
  },
};

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Product categories (fallback)
export const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Vegetables', slug: 'vegetables' },
  { id: 2, name: 'Fruits', slug: 'fruits' },
  { id: 3, name: 'Herbs & Spices', slug: 'herbs-spices' },
  { id: 4, name: 'Leafy Greens', slug: 'leafy-greens' },
  { id: 5, name: 'Root Vegetables', slug: 'root-vegetables' },
];

// Measurement units
export const MEASUREMENT_UNITS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'lb', label: 'Pound (lb)' },
  { value: 'piece', label: 'Piece' },
  { value: 'bunch', label: 'Bunch' },
  { value: 'box', label: 'Box' },
  { value: 'bag', label: 'Bag' },
];

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Your session has expired. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PHONE_INVALID:
    'Please enter a valid phone number with country code (e.g., +8801234567890)',
  PASSWORD_WEAK: `Password must be at least ${APP_CONFIG.PASSWORD_MIN_LENGTH} characters long`,
  FILE_TOO_LARGE: 'File size must be less than 5MB',
  FILE_TYPE_INVALID: 'Please upload a valid image file (JPEG, PNG, WebP)',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'You have been logged out successfully.',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  PROFILE_UPDATED: 'Profile updated successfully.',
  LISTING_CREATED: 'Listing created successfully.',
  LISTING_UPDATED: 'Listing updated successfully.',
  LISTING_DELETED: 'Listing deleted successfully.',
  ORDER_PLACED: 'Order placed successfully.',
  ORDER_UPDATED: 'Order status updated successfully.',
};
