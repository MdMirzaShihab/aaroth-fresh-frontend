/**
 * Vendor Authentication Service
 * Handles all vendor authentication and profile management API calls
 * Based on vendor-auth-api.md documentation
 */

import api from '../api';

const VENDOR_AUTH_BASE = '/auth';

class VendorAuthService {
  // Authentication Endpoints
  
  /**
   * Login vendor with phone and password
   * @param {Object} credentials - { phone, password }
   * @returns {Promise} API response with token and user data
   */
  async login(credentials) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/login`, credentials);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register new vendor account
   * @param {Object} vendorData - Registration data including vendorInfo
   * @returns {Promise} API response with registration status
   */
  async register(vendorData) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/register`, vendorData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Refresh access token using refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} API response with new tokens
   */
  async refreshToken(refreshToken) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/refresh`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Logout current session
   * @param {string} refreshToken - Refresh token to invalidate
   * @returns {Promise} API response
   */
  async logout(refreshToken) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/logout`, {
        refreshToken
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request password reset
   * @param {string} phone - Phone number
   * @returns {Promise} API response
   */
  async forgotPassword(phone) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/forgot-password`, {
        phone
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Reset password with token
   * @param {Object} resetData - { resetToken, newPassword }
   * @returns {Promise} API response
   */
  async resetPassword(resetData) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/reset-password`, resetData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Profile Management Endpoints

  /**
   * Get current authenticated vendor profile
   * @returns {Promise} API response with user data
   */
  async getCurrentUser() {
    try {
      const response = await api.get(`${VENDOR_AUTH_BASE}/me`);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update vendor profile information
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} API response with updated user data
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put(`${VENDOR_AUTH_BASE}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Change current password
   * @param {Object} passwordData - { currentPassword, newPassword }
   * @returns {Promise} API response
   */
  async changePassword(passwordData) {
    try {
      const response = await api.put(`${VENDOR_AUTH_BASE}/change-password`, passwordData);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Upload business verification documents
   * @param {FormData} documentsFormData - Form data with documents
   * @returns {Promise} API response with document URLs
   */
  async uploadDocuments(documentsFormData) {
    try {
      const response = await api.post(`${VENDOR_AUTH_BASE}/upload-documents`, 
        documentsFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Update payment information
   * @param {Object} paymentInfo - Bank account and payment details
   * @returns {Promise} API response with masked payment info
   */
  async updatePaymentInfo(paymentInfo) {
    try {
      const response = await api.put(`${VENDOR_AUTH_BASE}/payment-info`, paymentInfo);
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  /**
   * Request account deletion
   * @param {Object} deletionData - { password, reason }
   * @returns {Promise} API response with deletion status
   */
  async deleteAccount(deletionData) {
    try {
      const response = await api.delete(`${VENDOR_AUTH_BASE}/account`, {
        data: deletionData
      });
      return response.data;
    } catch (error) {
      throw this.handleAuthError(error);
    }
  }

  // Utility Methods

  /**
   * Handle authentication errors and provide user-friendly messages
   * @param {Error} error - API error
   * @returns {Error} Processed error
   */
  handleAuthError(error) {
    if (error.response?.data) {
      const { errorCode, error: errorMessage, details } = error.response.data;
      
      // Map backend error codes to user-friendly messages
      const errorMessages = {
        INVALID_CREDENTIALS: 'Invalid phone number or password',
        ACCOUNT_PENDING: 'Your account is pending approval',
        ACCOUNT_SUSPENDED: 'Your account has been suspended',
        ACCOUNT_DEACTIVATED: 'Your account has been deactivated',
        PHONE_EXISTS: 'This phone number is already registered',
        EMAIL_EXISTS: 'This email address is already registered',
        INVALID_TOKEN: 'Your session has expired. Please login again.',
        TOKEN_EXPIRED: 'Your session has expired. Please login again.',
        REFRESH_TOKEN_INVALID: 'Session expired. Please login again.',
        INVALID_PASSWORD: 'Current password is incorrect',
        WEAK_PASSWORD: 'Password must be at least 6 characters long',
        VALIDATION_ERROR: 'Please check your input and try again',
        FILE_TOO_LARGE: 'File size exceeds 10MB limit',
        INVALID_FILE_TYPE: 'Only PDF files are allowed',
        RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later.'
      };

      const userMessage = errorMessages[errorCode] || errorMessage || 'An error occurred';
      
      const processedError = new Error(userMessage);
      processedError.code = errorCode;
      processedError.details = details;
      processedError.status = error.response.status;
      
      return processedError;
    }

    // Network or other errors
    return new Error('Network error. Please check your connection and try again.');
  }

  /**
   * Validate phone number format
   * @param {string} phone - Phone number to validate
   * @returns {boolean} Whether phone is valid
   */
  isValidPhone(phone) {
    const phoneRegex = /^\+8801[3-9]\d{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password) {
    const result = {
      isValid: true,
      errors: []
    };

    if (!password || password.length < 6) {
      result.isValid = false;
      result.errors.push('Password must be at least 6 characters long');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      result.errors.push('Password should contain both uppercase and lowercase letters');
    }

    if (!/(?=.*\d)/.test(password)) {
      result.errors.push('Password should contain at least one number');
    }

    return result;
  }

  /**
   * Format vendor registration data
   * @param {Object} formData - Raw form data
   * @returns {Object} Formatted registration data
   */
  formatRegistrationData(formData) {
    return {
      name: formData.name,
      phone: formData.phone.startsWith('+') ? formData.phone : `+880${formData.phone.replace(/^0/, '')}`,
      email: formData.email || undefined,
      password: formData.password,
      role: 'vendor',
      vendorInfo: {
        businessName: formData.businessName,
        businessType: formData.businessType,
        description: formData.description || '',
        address: {
          street: formData.address?.street || '',
          city: formData.address?.city || '',
          state: formData.address?.state || '',
          zipCode: formData.address?.zipCode || '',
          country: 'Bangladesh'
        },
        contactInfo: {
          businessPhone: formData.businessPhone || formData.phone,
          businessEmail: formData.businessEmail || formData.email,
          website: formData.website || undefined
        }
      }
    };
  }
}

export default new VendorAuthService();