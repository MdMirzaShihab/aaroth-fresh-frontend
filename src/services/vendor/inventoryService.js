/**
 * Vendor Inventory Service
 * Handles all vendor inventory management API calls
 * Based on vendor-inventory-api.md documentation
 */

import api from '../api';

const VENDOR_INVENTORY_BASE = '/inventory';

class VendorInventoryService {
  
  /**
   * Get complete inventory overview with filtering
   * @param {Object} params - Query parameters
   * @param {string} params.status - Status filter (active, low_stock, out_of_stock, overstocked, inactive)
   * @param {boolean} params.lowStock - Show only low stock items
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order (asc/desc)
   * @returns {Promise} API response with inventory data
   */
  async getInventoryOverview(params = {}) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific inventory item details
   * @param {string} inventoryId - Inventory item ID
   * @returns {Promise} API response with inventory item data
   */
  async getInventoryItem(inventoryId) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/${inventoryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create new inventory item
   * @param {Object} inventoryData - Inventory item data
   * @returns {Promise} API response with created inventory item
   */
  async createInventoryItem(inventoryData) {
    try {
      const formattedData = this.formatInventoryData(inventoryData);
      const response = await api.post(`${VENDOR_INVENTORY_BASE}/`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update inventory item
   * @param {string} inventoryId - Inventory item ID
   * @param {Object} updateData - Updated inventory data
   * @returns {Promise} API response with updated inventory item
   */
  async updateInventoryItem(inventoryId, updateData) {
    try {
      const formattedData = this.formatInventoryData(updateData);
      const response = await api.put(`${VENDOR_INVENTORY_BASE}/${inventoryId}`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete inventory item
   * @param {string} inventoryId - Inventory item ID
   * @returns {Promise} API response
   */
  async deleteInventoryItem(inventoryId) {
    try {
      const response = await api.delete(`${VENDOR_INVENTORY_BASE}/${inventoryId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Record purchase transaction
   * @param {Object} purchaseData - Purchase transaction data
   * @returns {Promise} API response with purchase record
   */
  async recordPurchase(purchaseData) {
    try {
      const formattedData = this.formatPurchaseData(purchaseData);
      const response = await api.post(`${VENDOR_INVENTORY_BASE}/purchases`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get purchase history
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with purchase history
   */
  async getPurchaseHistory(params = {}) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/purchases`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update purchase record
   * @param {string} purchaseId - Purchase ID
   * @param {Object} updateData - Updated purchase data
   * @returns {Promise} API response
   */
  async updatePurchase(purchaseId, updateData) {
    try {
      const formattedData = this.formatPurchaseData(updateData);
      const response = await api.put(`${VENDOR_INVENTORY_BASE}/purchases/${purchaseId}`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete purchase record
   * @param {string} purchaseId - Purchase ID
   * @returns {Promise} API response
   */
  async deletePurchase(purchaseId) {
    try {
      const response = await api.delete(`${VENDOR_INVENTORY_BASE}/purchases/${purchaseId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Adjust stock quantity
   * @param {string} inventoryId - Inventory item ID
   * @param {Object} adjustmentData - Stock adjustment data
   * @returns {Promise} API response
   */
  async adjustStock(inventoryId, adjustmentData) {
    try {
      const formattedData = this.formatStockAdjustmentData(adjustmentData);
      const response = await api.post(`${VENDOR_INVENTORY_BASE}/${inventoryId}/adjust`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get stock adjustment history
   * @param {string} inventoryId - Inventory item ID (optional)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with adjustment history
   */
  async getStockAdjustments(inventoryId = null, params = {}) {
    try {
      const endpoint = inventoryId 
        ? `${VENDOR_INVENTORY_BASE}/${inventoryId}/adjustments`
        : `${VENDOR_INVENTORY_BASE}/adjustments`;
      
      const response = await api.get(endpoint, { params: this.sanitizeParams(params) });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get low stock alerts
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with low stock items
   */
  async getLowStockAlerts(params = {}) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/alerts/low-stock`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get inventory analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with inventory analytics
   */
  async getInventoryAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/analytics`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get inventory valuation report
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with valuation data
   */
  async getInventoryValuation(params = {}) {
    try {
      const response = await api.get(`${VENDOR_INVENTORY_BASE}/valuation`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Sync inventory with external systems
   * @param {Object} syncData - Sync configuration
   * @returns {Promise} API response with sync results
   */
  async syncInventory(syncData) {
    try {
      const response = await api.post(`${VENDOR_INVENTORY_BASE}/sync`, syncData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export inventory data
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export data/URL
   */
  async exportInventory(params) {
    try {
      const response = await api.post(`${VENDOR_INVENTORY_BASE}/export`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update inventory items
   * @param {Array} updates - Array of inventory updates
   * @returns {Promise} API response with bulk update results
   */
  async bulkUpdateInventory(updates) {
    try {
      const formattedUpdates = updates.map(update => this.formatInventoryData(update));
      const response = await api.put(`${VENDOR_INVENTORY_BASE}/bulk-update`, {
        updates: formattedUpdates
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods

  /**
   * Format inventory data for API submission
   * @param {Object} inventoryData - Raw inventory data
   * @returns {Object} Formatted inventory data
   */
  formatInventoryData(inventoryData) {
    const formatted = {};

    if (inventoryData.productId) formatted.productId = inventoryData.productId;
    if (inventoryData.availableQuantity !== undefined) {
      formatted.availableQuantity = parseFloat(inventoryData.availableQuantity);
    }
    if (inventoryData.reservedQuantity !== undefined) {
      formatted.reservedQuantity = parseFloat(inventoryData.reservedQuantity);
    }
    if (inventoryData.unit) formatted.unit = inventoryData.unit;
    if (inventoryData.averagePurchasePrice !== undefined) {
      formatted.averagePurchasePrice = parseFloat(inventoryData.averagePurchasePrice);
    }
    if (inventoryData.reorderLevel !== undefined) {
      formatted.reorderLevel = parseFloat(inventoryData.reorderLevel);
    }
    if (inventoryData.maxStockLevel !== undefined) {
      formatted.maxStockLevel = parseFloat(inventoryData.maxStockLevel);
    }
    if (inventoryData.status) formatted.status = inventoryData.status;
    if (inventoryData.location) formatted.location = inventoryData.location;
    if (inventoryData.notes) formatted.notes = inventoryData.notes;

    return formatted;
  }

  /**
   * Format purchase data for API submission
   * @param {Object} purchaseData - Raw purchase data
   * @returns {Object} Formatted purchase data
   */
  formatPurchaseData(purchaseData) {
    return {
      inventoryId: purchaseData.inventoryId,
      quantity: parseFloat(purchaseData.quantity),
      unitCost: parseFloat(purchaseData.unitCost),
      totalCost: parseFloat(purchaseData.totalCost),
      supplier: purchaseData.supplier || '',
      purchaseDate: purchaseData.purchaseDate,
      invoiceNumber: purchaseData.invoiceNumber || '',
      notes: purchaseData.notes || '',
      paymentStatus: purchaseData.paymentStatus || 'pending'
    };
  }

  /**
   * Format stock adjustment data
   * @param {Object} adjustmentData - Raw adjustment data
   * @returns {Object} Formatted adjustment data
   */
  formatStockAdjustmentData(adjustmentData) {
    return {
      quantity: parseFloat(adjustmentData.quantity),
      type: adjustmentData.type, // 'increase' or 'decrease'
      reason: adjustmentData.reason,
      notes: adjustmentData.notes || ''
    };
  }

  /**
   * Sanitize and validate query parameters
   * @param {Object} params - Raw parameters
   * @returns {Object} Sanitized parameters
   */
  sanitizeParams(params) {
    const sanitized = {};

    // Status filter
    const validStatuses = ['active', 'low_stock', 'out_of_stock', 'overstocked', 'inactive'];
    if (params.status && validStatuses.includes(params.status)) {
      sanitized.status = params.status;
    }

    // Boolean filters
    if (params.lowStock !== undefined) sanitized.lowStock = Boolean(params.lowStock);

    // Pagination
    if (params.page && Number.isInteger(params.page) && params.page > 0) {
      sanitized.page = params.page;
    }
    if (params.limit && Number.isInteger(params.limit) && params.limit > 0 && params.limit <= 100) {
      sanitized.limit = params.limit;
    }

    // Sorting
    const validSortFields = ['productName', 'availableQuantity', 'averagePurchasePrice', 'totalValue', 'createdAt'];
    if (params.sortBy && validSortFields.includes(params.sortBy)) {
      sanitized.sortBy = params.sortBy;
    }
    if (params.sortOrder && ['asc', 'desc'].includes(params.sortOrder)) {
      sanitized.sortOrder = params.sortOrder;
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
   * Calculate total inventory value
   * @param {Array} inventoryItems - Array of inventory items
   * @returns {number} Total value
   */
  calculateTotalValue(inventoryItems) {
    return inventoryItems.reduce((total, item) => {
      return total + (item.availableQuantity * item.averagePurchasePrice);
    }, 0);
  }

  /**
   * Determine inventory status based on quantities
   * @param {Object} item - Inventory item
   * @returns {string} Status
   */
  determineInventoryStatus(item) {
    const { availableQuantity, reorderLevel, maxStockLevel } = item;

    if (availableQuantity <= 0) return 'out_of_stock';
    if (availableQuantity <= reorderLevel) return 'low_stock';
    if (maxStockLevel && availableQuantity >= maxStockLevel) return 'overstocked';
    return 'active';
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
        INVENTORY_NOT_FOUND: 'Inventory item not found',
        PRODUCT_NOT_FOUND: 'Product not found',
        INSUFFICIENT_STOCK: 'Insufficient stock for this operation',
        INVALID_QUANTITY: 'Invalid quantity specified',
        VALIDATION_ERROR: 'Please check your input and try again'
      };

      const userMessage = errorMessages[errorCode] || errorMessage || 'Failed to process inventory request';
      const processedError = new Error(userMessage);
      processedError.code = errorCode;
      processedError.status = error.response.status;
      
      return processedError;
    }

    return new Error('Network error. Please check your connection and try again.');
  }
}

export default new VendorInventoryService();