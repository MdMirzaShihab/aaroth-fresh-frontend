/**
 * Vendor Orders Service
 * Handles all vendor order management API calls
 * Based on vendor-orders-api.md documentation
 */

import api from '../api';

const VENDOR_ORDERS_BASE = '/orders';

class VendorOrdersService {
  
  /**
   * Get all vendor orders with filtering and search
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status
   * @param {string} params.paymentStatus - Filter by payment status
   * @param {string} params.priority - Filter by priority
   * @param {string} params.customerId - Filter by specific customer
   * @param {string} params.startDate - Orders from date
   * @param {string} params.endDate - Orders to date
   * @param {string} params.search - Search in order number, customer name
   * @param {string} params.sortBy - Sort field
   * @param {string} params.sortOrder - Sort order
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response with orders data
   */
  async getAllOrders(params = {}) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get specific order details
   * @param {string} orderId - Order ID
   * @returns {Promise} API response with order data
   */
  async getOrderById(orderId) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/${orderId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update order status
   * @param {string} orderId - Order ID
   * @param {Object} statusData - Status update data
   * @returns {Promise} API response
   */
  async updateOrderStatus(orderId, statusData) {
    try {
      const formattedData = this.formatStatusUpdateData(statusData);
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/status`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm order
   * @param {string} orderId - Order ID
   * @param {Object} confirmationData - Confirmation details
   * @returns {Promise} API response
   */
  async confirmOrder(orderId, confirmationData = {}) {
    try {
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/confirm`, confirmationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Start processing order
   * @param {string} orderId - Order ID
   * @param {Object} processingData - Processing details
   * @returns {Promise} API response
   */
  async startProcessing(orderId, processingData = {}) {
    try {
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/process`, processingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark order as ready for delivery
   * @param {string} orderId - Order ID
   * @param {Object} readyData - Ready status details
   * @returns {Promise} API response
   */
  async markOrderReady(orderId, readyData = {}) {
    try {
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/ready`, readyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark order as delivered
   * @param {string} orderId - Order ID
   * @param {Object} deliveryData - Delivery confirmation data
   * @returns {Promise} API response
   */
  async markOrderDelivered(orderId, deliveryData) {
    try {
      const formattedData = this.formatDeliveryData(deliveryData);
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/deliver`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @param {Object} cancellationData - Cancellation details
   * @returns {Promise} API response
   */
  async cancelOrder(orderId, cancellationData) {
    try {
      const formattedData = this.formatCancellationData(cancellationData);
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/${orderId}/cancel`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update order items
   * @param {string} orderId - Order ID
   * @param {Object} itemsData - Updated items data
   * @returns {Promise} API response
   */
  async updateOrderItems(orderId, itemsData) {
    try {
      const formattedData = this.formatOrderItemsData(itemsData);
      const response = await api.put(`${VENDOR_ORDERS_BASE}/${orderId}/items`, formattedData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add note to order
   * @param {string} orderId - Order ID
   * @param {Object} noteData - Note data
   * @returns {Promise} API response
   */
  async addOrderNote(orderId, noteData) {
    try {
      const response = await api.post(`${VENDOR_ORDERS_BASE}/${orderId}/notes`, {
        note: noteData.note,
        type: noteData.type || 'general',
        isPrivate: noteData.isPrivate || false
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get order notes
   * @param {string} orderId - Order ID
   * @returns {Promise} API response with notes
   */
  async getOrderNotes(orderId) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/${orderId}/notes`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send message to customer
   * @param {string} orderId - Order ID
   * @param {Object} messageData - Message data
   * @returns {Promise} API response
   */
  async sendCustomerMessage(orderId, messageData) {
    try {
      const response = await api.post(`${VENDOR_ORDERS_BASE}/${orderId}/messages`, {
        message: messageData.message,
        type: messageData.type || 'general'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get order messages/communication
   * @param {string} orderId - Order ID
   * @returns {Promise} API response with messages
   */
  async getOrderMessages(orderId) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/${orderId}/messages`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get order analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with analytics data
   */
  async getOrderAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/analytics`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get order performance metrics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with performance data
   */
  async getOrderPerformance(params = {}) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/performance`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get revenue analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with revenue data
   */
  async getRevenueAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/analytics/revenue`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export orders data
   * @param {Object} params - Export parameters
   * @returns {Promise} API response with export data/URL
   */
  async exportOrders(params) {
    try {
      const response = await api.post(`${VENDOR_ORDERS_BASE}/export`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update order status
   * @param {Array} orderIds - Array of order IDs
   * @param {Object} statusData - Status update data
   * @returns {Promise} API response
   */
  async bulkUpdateStatus(orderIds, statusData) {
    try {
      const formattedData = this.formatStatusUpdateData(statusData);
      const response = await api.patch(`${VENDOR_ORDERS_BASE}/bulk-status`, {
        orderIds,
        ...formattedData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get order summary statistics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with summary data
   */
  async getOrderSummary(params = {}) {
    try {
      const response = await api.get(`${VENDOR_ORDERS_BASE}/summary`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods

  /**
   * Format status update data
   * @param {Object} statusData - Raw status data
   * @returns {Object} Formatted status data
   */
  formatStatusUpdateData(statusData) {
    return {
      status: statusData.status,
      notes: statusData.notes || '',
      estimatedDeliveryTime: statusData.estimatedDeliveryTime || null,
      notifyCustomer: statusData.notifyCustomer !== false // Default to true
    };
  }

  /**
   * Format delivery data
   * @param {Object} deliveryData - Raw delivery data
   * @returns {Object} Formatted delivery data
   */
  formatDeliveryData(deliveryData) {
    return {
      deliveredAt: deliveryData.deliveredAt || new Date().toISOString(),
      deliveryConfirmation: deliveryData.deliveryConfirmation || '',
      receiverName: deliveryData.receiverName || '',
      notes: deliveryData.notes || '',
      proofOfDelivery: deliveryData.proofOfDelivery || null
    };
  }

  /**
   * Format cancellation data
   * @param {Object} cancellationData - Raw cancellation data
   * @returns {Object} Formatted cancellation data
   */
  formatCancellationData(cancellationData) {
    return {
      reason: cancellationData.reason,
      notes: cancellationData.notes || '',
      refundAmount: cancellationData.refundAmount || null,
      notifyCustomer: cancellationData.notifyCustomer !== false
    };
  }

  /**
   * Format order items data
   * @param {Object} itemsData - Raw items data
   * @returns {Object} Formatted items data
   */
  formatOrderItemsData(itemsData) {
    return {
      items: itemsData.items.map(item => ({
        listingId: item.listingId,
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.unitPrice),
        notes: item.notes || ''
      })),
      notes: itemsData.notes || ''
    };
  }

  /**
   * Sanitize and validate query parameters
   * @param {Object} params - Raw parameters
   * @returns {Object} Sanitized parameters
   */
  sanitizeParams(params) {
    const sanitized = {};

    // Status filters
    const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'];
    if (params.status && validStatuses.includes(params.status)) {
      sanitized.status = params.status;
    }

    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (params.paymentStatus && validPaymentStatuses.includes(params.paymentStatus)) {
      sanitized.paymentStatus = params.paymentStatus;
    }

    const validPriorities = ['urgent', 'high', 'normal', 'low'];
    if (params.priority && validPriorities.includes(params.priority)) {
      sanitized.priority = params.priority;
    }

    // ID filters
    if (params.customerId) sanitized.customerId = params.customerId;

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

    // Text search
    if (params.search && typeof params.search === 'string') {
      sanitized.search = params.search.trim();
    }

    // Sorting
    const validSortFields = ['createdAt', 'totalAmount', 'status', 'deliveryDate'];
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
   * Get order status color and display information
   * @param {string} status - Order status
   * @returns {Object} Status display info
   */
  getStatusDisplayInfo(status) {
    const statusInfo = {
      pending: { color: 'yellow', label: 'Pending', urgent: true },
      confirmed: { color: 'blue', label: 'Confirmed', urgent: false },
      processing: { color: 'purple', label: 'Processing', urgent: false },
      ready: { color: 'green', label: 'Ready', urgent: false },
      delivered: { color: 'green', label: 'Delivered', urgent: false },
      cancelled: { color: 'red', label: 'Cancelled', urgent: false }
    };

    return statusInfo[status] || { color: 'gray', label: status, urgent: false };
  }

  /**
   * Calculate order metrics
   * @param {Array} orders - Array of orders
   * @returns {Object} Calculated metrics
   */
  calculateOrderMetrics(orders) {
    const metrics = {
      totalOrders: orders.length,
      totalRevenue: 0,
      averageOrderValue: 0,
      statusCounts: {},
      priorityCounts: {}
    };

    const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'];
    const validPriorities = ['urgent', 'high', 'normal', 'low'];

    // Initialize counters
    validStatuses.forEach(status => metrics.statusCounts[status] = 0);
    validPriorities.forEach(priority => metrics.priorityCounts[priority] = 0);

    // Calculate metrics
    orders.forEach(order => {
      metrics.totalRevenue += parseFloat(order.totalAmount || 0);
      
      if (validStatuses.includes(order.status)) {
        metrics.statusCounts[order.status]++;
      }
      
      if (validPriorities.includes(order.priority)) {
        metrics.priorityCounts[order.priority]++;
      }
    });

    metrics.averageOrderValue = orders.length > 0 
      ? metrics.totalRevenue / orders.length 
      : 0;

    return metrics;
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
        ORDER_NOT_FOUND: 'Order not found',
        INVALID_STATUS_TRANSITION: 'Cannot change to this status from current status',
        ORDER_ALREADY_CANCELLED: 'This order has already been cancelled',
        ORDER_ALREADY_DELIVERED: 'This order has already been delivered',
        INSUFFICIENT_PERMISSIONS: 'You do not have permission to perform this action',
        VALIDATION_ERROR: 'Please check your input and try again'
      };

      const userMessage = errorMessages[errorCode] || errorMessage || 'Failed to process order request';
      const processedError = new Error(userMessage);
      processedError.code = errorCode;
      processedError.status = error.response.status;
      
      return processedError;
    }

    return new Error('Network error. Please check your connection and try again.');
  }
}

export default new VendorOrdersService();