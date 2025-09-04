/**
 * Vendor Dashboard Service
 * Handles all vendor dashboard and analytics API calls
 * Based on vendor-dashboard-api.md documentation
 */

import api from '../api';

const VENDOR_DASHBOARD_BASE = '/vendor-dashboard';

class VendorDashboardService {
  
  /**
   * Get comprehensive dashboard overview with key business metrics
   * @param {Object} params - Query parameters
   * @param {string} params.period - Period filter (today, week, month, quarter, year)
   * @param {string} params.startDate - Custom start date (ISO format)
   * @param {string} params.endDate - Custom end date (ISO format)
   * @returns {Promise} API response with dashboard data
   */
  async getDashboardOverview(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/overview`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get detailed revenue analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with revenue data
   */
  async getRevenueAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/revenue`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get profit analysis data
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with profit data
   */
  async getProfitAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/profit`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get product performance analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with product performance data
   */
  async getProductAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/products`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get customer insights and analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with customer data
   */
  async getCustomerAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/customers`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get inventory health analytics
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with inventory health data
   */
  async getInventoryAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/inventory`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get financial summary and reports
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with financial data
   */
  async getFinancialSummary(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/financial-summary`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get business performance trends
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with trend data
   */
  async getPerformanceTrends(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/trends`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get comparative analytics (vs previous period)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with comparative data
   */
  async getComparativeAnalytics(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/analytics/comparative`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vendor notifications
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.type - Notification type filter
   * @param {boolean} params.unreadOnly - Show only unread notifications
   * @returns {Promise} API response with notifications
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/notifications`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise} API response
   */
  async markNotificationRead(notificationId) {
    try {
      const response = await api.put(`${VENDOR_DASHBOARD_BASE}/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Mark all notifications as read
   * @returns {Promise} API response
   */
  async markAllNotificationsRead() {
    try {
      const response = await api.put(`${VENDOR_DASHBOARD_BASE}/notifications/read-all`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete notification
   * @param {string} notificationId - Notification ID
   * @returns {Promise} API response
   */
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`${VENDOR_DASHBOARD_BASE}/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get recent activities
   * @param {Object} params - Query parameters
   * @param {number} params.limit - Number of activities to fetch
   * @returns {Promise} API response with recent activities
   */
  async getRecentActivity(params = {}) {
    try {
      const response = await api.get(`${VENDOR_DASHBOARD_BASE}/recent-activity`, { 
        params: this.sanitizeParams(params) 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export analytics data
   * @param {Object} params - Export parameters
   * @param {string} params.type - Export type (revenue, profit, products, etc.)
   * @param {string} params.format - Export format (csv, pdf, excel)
   * @param {string} params.period - Time period for export
   * @returns {Promise} API response with export data/URL
   */
  async exportAnalytics(params) {
    try {
      const response = await api.post(`${VENDOR_DASHBOARD_BASE}/export`, params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility Methods

  /**
   * Sanitize and validate query parameters
   * @param {Object} params - Raw parameters
   * @returns {Object} Sanitized parameters
   */
  sanitizeParams(params) {
    const sanitized = {};

    // Period validation
    if (params.period) {
      const validPeriods = ['today', 'week', 'month', 'quarter', 'year'];
      if (validPeriods.includes(params.period)) {
        sanitized.period = params.period;
      }
    }

    // Date validation
    if (params.startDate && this.isValidDate(params.startDate)) {
      sanitized.startDate = params.startDate;
    }
    if (params.endDate && this.isValidDate(params.endDate)) {
      sanitized.endDate = params.endDate;
    }

    // Pagination
    if (params.page && Number.isInteger(params.page) && params.page > 0) {
      sanitized.page = params.page;
    }
    if (params.limit && Number.isInteger(params.limit) && params.limit > 0 && params.limit <= 100) {
      sanitized.limit = params.limit;
    }

    // Other filters
    if (params.type) sanitized.type = params.type;
    if (params.unreadOnly !== undefined) sanitized.unreadOnly = Boolean(params.unreadOnly);
    if (params.category) sanitized.category = params.category;
    if (params.sortBy) sanitized.sortBy = params.sortBy;
    if (params.sortOrder) sanitized.sortOrder = params.sortOrder;

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
   * Get period boundaries for filtering
   * @param {string} period - Period name
   * @returns {Object} Start and end dates
   */
  getPeriodBoundaries(period) {
    const now = new Date();
    const boundaries = {
      start: new Date(),
      end: new Date(now)
    };

    switch (period) {
      case 'today':
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end.setHours(23, 59, 59, 999);
        break;
      
      case 'week':
        const startOfWeek = now.getDate() - now.getDay();
        boundaries.start.setDate(startOfWeek);
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end.setDate(startOfWeek + 6);
        boundaries.end.setHours(23, 59, 59, 999);
        break;
      
      case 'month':
        boundaries.start.setDate(1);
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        boundaries.end.setHours(23, 59, 59, 999);
        break;
      
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        boundaries.start = new Date(now.getFullYear(), quarter * 3, 1);
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
        boundaries.end.setHours(23, 59, 59, 999);
        break;
      
      case 'year':
        boundaries.start = new Date(now.getFullYear(), 0, 1);
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end = new Date(now.getFullYear(), 11, 31);
        boundaries.end.setHours(23, 59, 59, 999);
        break;
      
      default:
        // Default to current month
        boundaries.start.setDate(1);
        boundaries.start.setHours(0, 0, 0, 0);
        boundaries.end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        boundaries.end.setHours(23, 59, 59, 999);
    }

    return {
      start: boundaries.start.toISOString(),
      end: boundaries.end.toISOString()
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
      
      const userMessage = errorMessage || 'Failed to fetch dashboard data';
      const processedError = new Error(userMessage);
      processedError.code = errorCode;
      processedError.status = error.response.status;
      
      return processedError;
    }

    return new Error('Network error. Please check your connection and try again.');
  }

  /**
   * Format currency values
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code (default: BDT)
   * @returns {string} Formatted currency
   */
  formatCurrency(amount, currency = 'BDT') {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Calculate growth percentage
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {number} Growth percentage
   */
  calculateGrowth(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
}

export default new VendorDashboardService();