/**
 * Vendor Listings Service
 * Handles all vendor product listings and catalog management API calls
 * Based on vendor-listings-api.md documentation
 */

import api from '../api';

const VENDOR_LISTINGS_BASE = '/listings';

class VendorListingsService {
  
  /**
   * Get all vendor listings with filtering and search
   * @param {Object} params - Query parameters
   * @param {string} params.search - Search in product name, description
   * @param {string} params.category - Filter by product category
   * @param {string} params.status - Filter by status (active, inactive, out_of_stock, draft)
   * @param {number} params.priceMin - Minimum price filter
   * @param {number} params.priceMax - Maximum price filter
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response with listings data
   */
  async getAllListings(params = {}) {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific listing details
   * @param {string} listingId - Listing ID
   * @returns {Promise} API response with listing data
   */
  async getListingById(listingId) {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/${listingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new product listing
   * @param {Object} listingData - Listing data
   * @returns {Promise} API response with created listing
   */
  async createListing(listingData) {
    try {
      const formattedData = this.formatListingData(listingData);
      const response = await api.post(`${VENDOR_LISTINGS_BASE}/`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update existing listing
   * @param {string} listingId - Listing ID
   * @param {Object} updateData - Updated listing data
   * @returns {Promise} API response with updated listing
   */
  async updateListing(listingId, updateData) {
    try {
      const formattedData = this.formatListingData(updateData);
      const response = await api.put(`${VENDOR_LISTINGS_BASE}/${listingId}`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete listing
   * @param {string} listingId - Listing ID
   * @returns {Promise} API response
   */
  async deleteListing(listingId) {
    try {
      const response = await api.delete(`${VENDOR_LISTINGS_BASE}/${listingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update listing status
   * @param {string} listingId - Listing ID
   * @param {string} status - New status (active, inactive, draft)
   * @returns {Promise} API response
   */
  async updateListingStatus(listingId, status) {
    try {
      const response = await api.patch(`${VENDOR_LISTINGS_BASE}/${listingId}/status`, { status });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update listing inventory availability
   * @param {string} listingId - Listing ID
   * @param {Object} inventoryData - Inventory update data
   * @returns {Promise} API response
   */
  async updateListingInventory(listingId, inventoryData) {
    try {
      const formattedData = this.formatInventoryData(inventoryData);
      const response = await api.patch(`${VENDOR_LISTINGS_BASE}/${listingId}/inventory`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update listing pricing
   * @param {string} listingId - Listing ID
   * @param {Object} pricingData - Pricing update data
   * @returns {Promise} API response
   */
  async updateListingPricing(listingId, pricingData) {
    try {
      const formattedData = this.formatPricingData(pricingData);
      const response = await api.patch(`${VENDOR_LISTINGS_BASE}/${listingId}/pricing`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get listing performance analytics
   * @param {string} listingId - Listing ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with performance data
   */
  async getListingPerformance(listingId, params = {}) {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/${listingId}/performance`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get listing reviews and ratings
   * @param {string} listingId - Listing ID
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with reviews data
   */
  async getListingReviews(listingId, params = {}) {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/${listingId}/reviews`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Respond to listing review
   * @param {string} listingId - Listing ID
   * @param {string} reviewId - Review ID
   * @param {Object} responseData - Response data
   * @returns {Promise} API response
   */
  async respondToReview(listingId, reviewId, responseData) {
    try {
      const response = await api.post(`${VENDOR_LISTINGS_BASE}/${listingId}/reviews/${reviewId}/respond`, responseData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Duplicate listing
   * @param {string} listingId - Listing ID to duplicate
   * @param {Object} modifications - Optional modifications to the duplicated listing
   * @returns {Promise} API response with new listing
   */
  async duplicateListing(listingId, modifications = {}) {
    try {
      const response = await api.post(`${VENDOR_LISTINGS_BASE}/${listingId}/duplicate`, modifications);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update listings
   * @param {Array} updates - Array of listing updates
   * @returns {Promise} API response with bulk update results
   */
  async bulkUpdateListings(updates) {
    try {
      const formattedUpdates = updates.map(update => ({
        id: update.id,
        data: this.formatListingData(update.data)
      }));
      const response = await api.put(`${VENDOR_LISTINGS_BASE}/bulk-update`, { updates: formattedUpdates });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update listing status
   * @param {Array} listingIds - Array of listing IDs
   * @param {string} status - New status
   * @returns {Promise} API response
   */
  async bulkUpdateStatus(listingIds, status) {
    try {
      const response = await api.patch(`${VENDOR_LISTINGS_BASE}/bulk-status`, { 
        listingIds, 
        status 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export listings data
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export data/URL
   */
  async exportListings(params) {
    try {
      const response = await api.post(`${VENDOR_LISTINGS_BASE}/export`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get product catalog (available products for listings)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with products data
   */
  async getProductCatalog(params = {}) {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/catalog`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get listing categories
   * @returns {Promise} API response with categories
   */
  async getListingCategories() {
    try {
      const response = await api.get(`${VENDOR_LISTINGS_BASE}/categories`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload listing images
   * @param {string} listingId - Listing ID
   * @param {FormData} imagesFormData - Form data with images
   * @returns {Promise} API response with image URLs
   */
  async uploadListingImages(listingId, imagesFormData) {
    try {
      const response = await api.post(
        `${VENDOR_LISTINGS_BASE}/${listingId}/images`, 
        imagesFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete listing image
   * @param {string} listingId - Listing ID
   * @param {string} imageId - Image ID
   * @returns {Promise} API response
   */
  async deleteListingImage(listingId, imageId) {
    try {
      const response = await api.delete(`${VENDOR_LISTINGS_BASE}/${listingId}/images/${imageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods

  /**
   * Format listing data for API submission
   * @param {Object} listingData - Raw listing data
   * @returns {Object} Formatted listing data
   */
  formatListingData(listingData) {
    const formatted = {};

    // Required fields
    if (listingData.productId) formatted.productId = listingData.productId;
    if (listingData.title) formatted.title = listingData.title.trim();
    if (listingData.description) formatted.description = listingData.description.trim();

    // Pricing
    if (listingData.price) {
      formatted.price = this.formatPricingData(listingData.price);
    }

    // Inventory
    if (listingData.inventory) {
      formatted.inventory = this.formatInventoryData(listingData.inventory);
    }

    // Status and visibility
    if (listingData.status) formatted.status = listingData.status;
    if (listingData.visibility) formatted.visibility = listingData.visibility;

    // Quality specifications
    if (listingData.quality) {
      formatted.quality = {
        grade: listingData.quality.grade,
        certifications: Array.isArray(listingData.quality.certifications) 
          ? listingData.quality.certifications 
          : [],
        shelfLife: listingData.quality.shelfLife ? parseInt(listingData.quality.shelfLife) : undefined,
        storageInstructions: listingData.quality.storageInstructions || ''
      };
    }

    // Delivery information
    if (listingData.delivery) {
      formatted.delivery = {
        areas: Array.isArray(listingData.delivery.areas) ? listingData.delivery.areas : [],
        timeSlots: Array.isArray(listingData.delivery.timeSlots) ? listingData.delivery.timeSlots : [],
        minDeliveryTime: listingData.delivery.minDeliveryTime || '',
        maxDeliveryTime: listingData.delivery.maxDeliveryTime || ''
      };
    }

    return formatted;
  }

  /**
   * Format pricing data
   * @param {Object} pricingData - Raw pricing data
   * @returns {Object} Formatted pricing data
   */
  formatPricingData(pricingData) {
    return {
      selling: parseFloat(pricingData.selling),
      minimum: pricingData.minimum ? parseFloat(pricingData.minimum) : undefined,
      bulk: pricingData.bulk ? parseFloat(pricingData.bulk) : undefined,
      currency: pricingData.currency || 'BDT'
    };
  }

  /**
   * Format inventory data
   * @param {Object} inventoryData - Raw inventory data
   * @returns {Object} Formatted inventory data
   */
  formatInventoryData(inventoryData) {
    return {
      available: parseFloat(inventoryData.available),
      reserved: inventoryData.reserved ? parseFloat(inventoryData.reserved) : 0,
      unit: inventoryData.unit,
      minOrderQuantity: inventoryData.minOrderQuantity ? parseFloat(inventoryData.minOrderQuantity) : 1,
      maxOrderQuantity: inventoryData.maxOrderQuantity ? parseFloat(inventoryData.maxOrderQuantity) : undefined,
      inventoryId: inventoryData.inventoryId
    };
  }

  /**
   * Sanitize and validate query parameters
   * @param {Object} params - Raw parameters
   * @returns {Object} Sanitized parameters
   */
  sanitizeParams(params) {
    const sanitized = {};

    // Text search
    if (params.search && typeof params.search === 'string') {
      sanitized.search = params.search.trim();
    }

    // Category filter
    if (params.category && typeof params.category === 'string') {
      sanitized.category = params.category;
    }

    // Status filter
    const validStatuses = ['active', 'inactive', 'out_of_stock', 'draft'];
    if (params.status && validStatuses.includes(params.status)) {
      sanitized.status = params.status;
    }

    // Price filters
    if (params.priceMin && !isNaN(params.priceMin)) {
      sanitized.priceMin = parseFloat(params.priceMin);
    }
    if (params.priceMax && !isNaN(params.priceMax)) {
      sanitized.priceMax = parseFloat(params.priceMax);
    }

    // Sorting
    const validSortFields = ['name', 'price', 'createdAt', 'updatedAt', 'rating', 'sales'];
    if (params.sortBy && validSortFields.includes(params.sortBy)) {
      sanitized.sortBy = params.sortBy;
    }
    if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder)) {
      sanitized.sortOrder = params.sortOrder;
    }

    // Pagination
    if (params.page && Number.isInteger(params.page) && params.page > 0) {
      sanitized.page = params.page;
    }
    if (params.limit && Number.isInteger(params.limit) && params.limit > 0 && params.limit <= 100) {
      sanitized.limit = params.limit;
    }

    // Date filters
    if (params.startDate && this.isValidDate(params.startDate)) {
      sanitized.startDate = params.startDate;
    }
    if (params.endDate && this.isValidDate(params.endDate)) {
      sanitized.endDate = params.endDate;
    }

    // Period filter
    const validPeriods = ['today', 'week', 'month', 'quarter', 'year'];
    if (params.period && validPeriods.includes(params.period)) {
      sanitized.period = params.period;
    }

    return sanitized;
  }

  /**
   * Validate ISO date string
   * @param {string} dateString - Date to validate
   * @returns {boolean} Whether date is valid
   */
  isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }

  /**
   * Validate listing data before submission
   * @param {Object} listingData - Listing data to validate
   * @returns {Object} Validation result
   */
  validateListingData(listingData) {
    const errors = [];

    // Required fields
    if (!listingData.productId) errors.push('Product is required');
    if (!listingData.title || listingData.title.trim().length < 5) {
      errors.push('Title must be at least 5 characters long');
    }
    if (!listingData.description || listingData.description.trim().length < 20) {
      errors.push('Description must be at least 20 characters long');
    }

    // Pricing validation
    if (!listingData.price?.selling || listingData.price.selling <= 0) {
      errors.push('Selling price is required and must be greater than 0');
    }
    if (listingData.price?.minimum && listingData.price.minimum >= listingData.price.selling) {
      errors.push('Minimum price must be less than selling price');
    }

    // Inventory validation
    if (!listingData.inventory?.available || listingData.inventory.available < 0) {
      errors.push('Available quantity is required and cannot be negative');
    }
    if (!listingData.inventory?.unit) {
      errors.push('Unit of measurement is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Handle API errors
   * @param {Error} error - API error
   * @returns {Error} Processed error
   */
  handleError(error) {
    if (error.response?.data) {
      const { errorCode, error: errorMessage } = error.response.data;
      
      const errorMessages = {
        LISTING_NOT_FOUND: 'Listing not found',
        PRODUCT_NOT_FOUND: 'Product not found',
        INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
        DUPLICATE_LISTING: 'A listing for this product already exists',
        INVALID_STATUS: 'Invalid listing status',
        VALIDATION_ERROR: 'Please check your input and try again',
        FILE_TOO_LARGE: 'Image file size exceeds 5MB limit',
        INVALID_FILE_TYPE: 'Only JPG, PNG, and WebP images are allowed'
      };

      const userMessage = errorMessages[errorCode] || errorMessage || 'Failed to process listing request';
      const processedError = new Error(userMessage);
      processedError.code = errorCode;
      processedError.status = error.response.status;
      
      return processedError;
    }

    return new Error('Network error. Please check your connection and try again.');
  }
}

export default new VendorListingsService();