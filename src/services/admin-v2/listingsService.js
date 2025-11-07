/**
 * Listings Service - Admin V2
 * Utility functions for listing data processing and management
 * API endpoints are in store/slices/admin-v2/adminApiSlice.js
 */

/**
 * Listing Status Configuration
 */
export const LISTING_STATUSES = {
  active: {
    label: 'Active',
    color: 'text-mint-fresh bg-mint-fresh/10 border-mint-fresh/20',
    icon: 'CheckCircle',
    description: 'Listing is live and available for orders',
  },
  inactive: {
    label: 'Inactive',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
    icon: 'XCircle',
    description: 'Listing is temporarily disabled',
  },
  out_of_stock: {
    label: 'Out of Stock',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    icon: 'AlertCircle',
    description: 'Product is currently unavailable',
  },
  discontinued: {
    label: 'Discontinued',
    color: 'text-tomato-red bg-tomato-red/10 border-tomato-red/20',
    icon: 'Ban',
    description: 'Product has been permanently discontinued',
  },
};

/**
 * Bulk Action Types
 */
export const BULK_ACTIONS = {
  activate: {
    label: 'Activate',
    description: 'Make listings live and available',
    requiresReason: false,
    icon: 'CheckCircle',
  },
  deactivate: {
    label: 'Deactivate',
    description: 'Temporarily disable listings',
    requiresReason: true,
    icon: 'XCircle',
  },
  delete: {
    label: 'Delete',
    description: 'Permanently remove listings',
    requiresReason: true,
    icon: 'Trash2',
    destructive: true,
  },
  approve: {
    label: 'Approve',
    description: 'Approve pending listings',
    requiresReason: false,
    icon: 'ThumbsUp',
  },
  reject: {
    label: 'Reject',
    description: 'Reject flagged listings',
    requiresReason: true,
    icon: 'ThumbsDown',
  },
};

/**
 * Calculate listing health score based on multiple factors
 * @param {Object} listing - The listing object
 * @returns {Object} Health score and indicators
 */
export const calculateListingHealth = (listing) => {
  if (!listing) return { score: 0, status: 'poor', indicators: [] };

  const indicators = [];
  let score = 100;

  // Check stock status
  if (listing.status === 'out_of_stock') {
    score -= 30;
    indicators.push({
      type: 'warning',
      message: 'Currently out of stock',
    });
  }

  // Check if discontinued
  if (listing.status === 'discontinued') {
    score -= 50;
    indicators.push({
      type: 'error',
      message: 'Product discontinued',
    });
  }

  // Check if flagged
  if (listing.isFlagged) {
    score -= 40;
    indicators.push({
      type: 'error',
      message: `Flagged: ${listing.flagReason || 'Quality issues'}`,
    });
  }

  // Check if inactive
  if (listing.status === 'inactive') {
    score -= 20;
    indicators.push({
      type: 'warning',
      message: 'Listing is inactive',
    });
  }

  // Check pricing consistency
  if (listing.price && listing.originalPrice && listing.price > listing.originalPrice) {
    score -= 15;
    indicators.push({
      type: 'warning',
      message: 'Price higher than original price',
    });
  }

  // Check for missing images
  if (!listing.images || listing.images.length === 0) {
    score -= 10;
    indicators.push({
      type: 'info',
      message: 'No product images',
    });
  }

  // Determine status
  let status = 'excellent';
  if (score < 40) status = 'poor';
  else if (score < 60) status = 'fair';
  else if (score < 80) status = 'good';

  return {
    score: Math.max(0, score),
    status,
    indicators,
  };
};

/**
 * Calculate how long a listing has been flagged
 * @param {string} flaggedAt - ISO date string
 * @returns {string} Human-readable duration
 */
export const calculateFlaggedDuration = (flaggedAt) => {
  if (!flaggedAt) return 'Never';

  const now = new Date();
  const flaggedDate = new Date(flaggedAt);
  const diffMs = now - flaggedDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays >= 30) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  if (diffDays >= 7) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

/**
 * Determine urgency level for flagged listings
 * @param {string} flaggedAt - ISO date string
 * @returns {string} Urgency level: critical, high, medium, low
 */
export const calculateFlaggedUrgency = (flaggedAt) => {
  if (!flaggedAt) return 'none';

  const daysWaiting = Math.floor(
    (Date.now() - new Date(flaggedAt)) / (1000 * 60 * 60 * 24)
  );

  if (daysWaiting >= 7) return 'critical'; // 1+ week
  if (daysWaiting >= 3) return 'high'; // 3+ days
  if (daysWaiting >= 1) return 'medium'; // 1+ day
  return 'low'; // < 1 day
};

/**
 * Format price with currency
 * @param {number} price - Price value
 * @param {string} currency - Currency code (default: BDT)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'BDT') => {
  if (price === null || price === undefined) return 'N/A';

  const formatted = new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);

  return formatted;
};

/**
 * Format listing date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatListingDate = (dateString) => {
  if (!dateString) return 'Never';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'Never';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return formatListingDate(dateString);
  }
  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  }
  if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {number} Discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return 0;
  }

  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Validate listing data for bulk operations
 * @param {Array} selectedIds - Array of listing IDs
 * @param {string} action - Action to perform
 * @returns {Object} Validation result
 */
export const validateBulkOperation = (selectedIds, action) => {
  const errors = [];

  if (!selectedIds || selectedIds.length === 0) {
    errors.push('No listings selected');
  }

  if (selectedIds.length > 100) {
    errors.push('Cannot process more than 100 listings at once');
  }

  if (!action || !BULK_ACTIONS[action]) {
    errors.push('Invalid action selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate export data for listings
 * @param {Array} listings - Array of listing objects
 * @param {string} format - Export format (csv, json)
 * @returns {string|Object} Formatted export data
 */
export const generateExportData = (listings, format = 'csv') => {
  if (!listings || listings.length === 0) {
    return format === 'csv' ? '' : [];
  }

  if (format === 'json') {
    return listings.map((listing) => ({
      id: listing._id,
      productName: listing.product?.name || 'N/A',
      vendorName: listing.vendor?.businessName || 'N/A',
      status: listing.status,
      price: listing.price,
      unit: listing.unit,
      featured: listing.featured,
      isFlagged: listing.isFlagged,
      createdAt: formatListingDate(listing.createdAt),
      updatedAt: formatListingDate(listing.updatedAt),
    }));
  }

  // CSV format
  const headers = [
    'ID',
    'Product Name',
    'Vendor',
    'Status',
    'Price',
    'Unit',
    'Featured',
    'Flagged',
    'Created',
    'Updated',
  ];

  const rows = listings.map((listing) => [
    listing._id,
    listing.product?.name || 'N/A',
    listing.vendor?.businessName || 'N/A',
    listing.status,
    listing.price,
    listing.unit,
    listing.featured ? 'Yes' : 'No',
    listing.isFlagged ? 'Yes' : 'No',
    formatListingDate(listing.createdAt),
    formatListingDate(listing.updatedAt),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
};

/**
 * Get status badge configuration
 * @param {string} status - Listing status
 * @returns {Object} Badge configuration
 */
export const getStatusBadge = (status) => {
  return LISTING_STATUSES[status] || LISTING_STATUSES.inactive;
};

/**
 * Filter listings by search term
 * @param {Array} listings - Array of listings
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered listings
 */
export const filterListings = (listings, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') return listings;

  const term = searchTerm.toLowerCase().trim();

  return listings.filter((listing) => {
    const productName = listing.product?.name?.toLowerCase() || '';
    const vendorName = listing.vendor?.businessName?.toLowerCase() || '';
    const status = listing.status?.toLowerCase() || '';

    return (
      productName.includes(term) ||
      vendorName.includes(term) ||
      status.includes(term)
    );
  });
};

/**
 * Sort listings by field
 * @param {Array} listings - Array of listings
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - Sort order (asc, desc)
 * @returns {Array} Sorted listings
 */
export const sortListings = (listings, sortBy, sortOrder = 'desc') => {
  if (!listings || listings.length === 0) return [];

  const sorted = [...listings].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'productName':
        aValue = a.product?.name || '';
        bValue = b.product?.name || '';
        break;
      case 'vendorName':
        aValue = a.vendor?.businessName || '';
        bValue = b.vendor?.businessName || '';
        break;
      case 'price':
        aValue = a.price || 0;
        bValue = b.price || 0;
        break;
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortBy] || 0);
        bValue = new Date(b[sortBy] || 0);
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
};

/**
 * Get statistics from listings array
 * @param {Array} listings - Array of listings
 * @returns {Object} Statistics object
 */
export const getListingStatistics = (listings) => {
  if (!listings || listings.length === 0) {
    return {
      total: 0,
      active: 0,
      inactive: 0,
      outOfStock: 0,
      discontinued: 0,
      featured: 0,
      flagged: 0,
    };
  }

  return {
    total: listings.length,
    active: listings.filter((l) => l.status === 'active').length,
    inactive: listings.filter((l) => l.status === 'inactive').length,
    outOfStock: listings.filter((l) => l.status === 'out_of_stock').length,
    discontinued: listings.filter((l) => l.status === 'discontinued').length,
    featured: listings.filter((l) => l.featured).length,
    flagged: listings.filter((l) => l.isFlagged).length,
  };
};

export default {
  LISTING_STATUSES,
  BULK_ACTIONS,
  calculateListingHealth,
  calculateFlaggedDuration,
  calculateFlaggedUrgency,
  formatPrice,
  formatListingDate,
  getRelativeTime,
  calculateDiscount,
  validateBulkOperation,
  generateExportData,
  getStatusBadge,
  filterListings,
  sortListings,
  getListingStatistics,
};
