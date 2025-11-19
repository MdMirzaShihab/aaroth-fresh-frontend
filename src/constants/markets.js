/**
 * Market Constants - Seed data and helper functions for markets
 * Used during development and as reference data
 */

// Initial seed data for Bangladesh markets
export const INITIAL_MARKETS = [
  {
    name: 'Dhaka Central Market',
    description: 'Main vegetable wholesale market in central Dhaka serving restaurants across the capital',
    city: 'Dhaka',
    district: 'Dhaka',
    address: 'Kawran Bazar, Dhaka-1215'
  },
  {
    name: 'Karwan Bazar',
    description: 'One of the largest wholesale markets for fresh produce in Dhaka',
    city: 'Dhaka',
    district: 'Dhaka',
    address: 'Tejgaon, Dhaka-1215'
  },
  {
    name: 'Chittagong Port Market',
    description: 'Major market hub in Chittagong for imported and local vegetables',
    city: 'Chittagong',
    district: 'Chittagong',
    address: 'Khatunganj, Chittagong-4000'
  },
  {
    name: 'Sylhet Fresh Market',
    description: 'Primary wholesale market for fresh vegetables in Sylhet region',
    city: 'Sylhet',
    district: 'Sylhet',
    address: 'Zindabazar, Sylhet-3100'
  },
  {
    name: 'Rajshahi Vegetable Hub',
    description: 'Main agricultural produce market in Rajshahi division',
    city: 'Rajshahi',
    district: 'Rajshahi',
    address: 'Shaheb Bazar, Rajshahi-6100'
  },
  {
    name: 'Khulna Wholesale Market',
    description: 'Central vegetable market serving Khulna and southwest Bangladesh',
    city: 'Khulna',
    district: 'Khulna',
    address: 'Daulatpur, Khulna-9000'
  }
];

// Market status constants
export const MARKET_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  FLAGGED: 'flagged'
};

// Admin status constants
export const ADMIN_STATUS = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  DEPRECATED: 'deprecated'
};

/**
 * Helper function to format market address
 * @param {Object} market - Market object
 * @returns {string} Formatted address
 */
export const formatMarketAddress = (market) => {
  if (!market || !market.location) return '';

  const { address, city, district } = market.location;
  const parts = [];

  if (address) parts.push(address);
  if (city && city !== district) parts.push(city);
  if (district) parts.push(district);

  return parts.join(', ');
};

/**
 * Helper function to get market display label
 * @param {Object} market - Market object
 * @returns {string} Display label
 */
export const getMarketLabel = (market) => {
  if (!market) return '';
  return market.name;
};

/**
 * Helper function to get market status badge color
 * @param {Object} market - Market object
 * @returns {string} Tailwind color class
 */
export const getMarketStatusColor = (market) => {
  if (!market) return 'bg-gray-100 text-gray-800';

  if (!market.isActive) {
    return 'bg-red-100 text-red-800';
  }

  if (!market.isAvailable) {
    return 'bg-amber-100 text-amber-800';
  }

  return 'bg-mint-fresh/20 text-bottle-green';
};

/**
 * Helper function to get market status label
 * @param {Object} market - Market object
 * @returns {string} Status label
 */
export const getMarketStatusLabel = (market) => {
  if (!market) return 'Unknown';

  if (!market.isActive) return 'Inactive';
  if (!market.isAvailable) return 'Flagged';

  return 'Active';
};

/**
 * Helper function to check if market is operational
 * @param {Object} market - Market object
 * @returns {boolean} True if market is operational
 */
export const isMarketOperational = (market) => {
  return market && market.isActive && market.isAvailable && !market.isDeleted;
};

/**
 * Helper function to group markets by city
 * @param {Array} markets - Array of market objects
 * @returns {Object} Markets grouped by city
 */
export const groupMarketsByCity = (markets) => {
  if (!Array.isArray(markets)) return {};

  return markets.reduce((acc, market) => {
    const city = market.location?.city || 'Other';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(market);
    return acc;
  }, {});
};

/**
 * Helper function to get unique cities from markets
 * @param {Array} markets - Array of market objects
 * @returns {Array} Array of unique city names
 */
export const getUniqueCities = (markets) => {
  if (!Array.isArray(markets)) return [];

  const cities = markets
    .map(market => market.location?.city)
    .filter(Boolean);

  return [...new Set(cities)].sort();
};

/**
 * Helper function to validate market data for form submission
 * @param {Object} marketData - Market data to validate
 * @returns {Object} Validation result { isValid, errors }
 */
export const validateMarketData = (marketData) => {
  const errors = {};

  if (!marketData.name || marketData.name.trim().length < 2) {
    errors.name = 'Market name must be at least 2 characters';
  }

  if (marketData.name && marketData.name.length > 50) {
    errors.name = 'Market name cannot exceed 50 characters';
  }

  if (marketData.description && marketData.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }

  if (!marketData.image && !marketData.existingImage) {
    errors.image = 'Market image is required';
  }

  if (!marketData.address) {
    errors.address = 'Market address is required';
  }

  if (!marketData.city) {
    errors.city = 'City is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Helper function to prepare market data for API submission
 * @param {Object} formData - Form data object
 * @param {File} imageFile - Image file (optional)
 * @returns {FormData} FormData object ready for API
 */
export const prepareMarketFormData = (formData, imageFile = null) => {
  const apiFormData = new FormData();

  // Add basic fields
  apiFormData.append('name', formData.name);

  if (formData.description) {
    apiFormData.append('description', formData.description);
  }

  // Add location fields (flattened for multipart/form-data)
  apiFormData.append('address', formData.address || formData['location.address']);
  apiFormData.append('city', formData.city || formData['location.city']);

  if (formData.district || formData['location.district']) {
    apiFormData.append('district', formData.district || formData['location.district']);
  }

  if (formData.coordinates) {
    apiFormData.append('coordinates', JSON.stringify(formData.coordinates));
  }

  // Add image if provided
  if (imageFile) {
    apiFormData.append('image', imageFile);
  }

  // Add status fields if provided
  if (typeof formData.isActive !== 'undefined') {
    apiFormData.append('isActive', formData.isActive);
  }

  return apiFormData;
};

export default {
  INITIAL_MARKETS,
  MARKET_STATUS,
  ADMIN_STATUS,
  formatMarketAddress,
  getMarketLabel,
  getMarketStatusColor,
  getMarketStatusLabel,
  isMarketOperational,
  groupMarketsByCity,
  getUniqueCities,
  validateMarketData,
  prepareMarketFormData
};
