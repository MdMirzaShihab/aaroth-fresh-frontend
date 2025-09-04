import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { apiSlice } from '../store/slices/apiSlice';
import { addNotification } from '../store/slices/notificationSlice';
import vendorAuthApi from '../store/slices/vendor/vendorAuthApi';

class AuthService {
  /**
   * Get current authentication state
   */
  getAuthState() {
    return store.getState().auth;
  }

  /**
   * Perform logout operation
   */
  async performLogout() {
    try {
      // Call logout mutation to notify backend
      await store.dispatch(apiSlice.endpoints.logout.initiate()).unwrap();
    } catch (error) {
      console.error('Backend logout failed:', error);
    } finally {
      // Always clear frontend state
      store.dispatch(logout());

      // Show logout success message
      store.dispatch(
        addNotification({
          type: 'success',
          message: 'You have been logged out successfully',
        })
      );
    }
  }

  /**
   * Handle token expiration
   */
  handleTokenExpiration() {
    store.dispatch(logout());
    store.dispatch(
      addNotification({
        type: 'warning',
        message: 'Your session has expired. Please log in again.',
      })
    );
  }

  /**
   * Initialize authentication check on app start
   */
  async initializeAuth() {
    const token = this.getToken();

    if (token) {
      try {
        // Verify token with backend by fetching current user
        await store
          .dispatch(apiSlice.endpoints.getCurrentUser.initiate())
          .unwrap();
      } catch (error) {
        // Token is invalid, clear auth state
        this.handleTokenExpiration();
      }
    }
  }

  getToken() {
    return store.getState().auth.token;
  }

  isAuthenticated() {
    const state = store.getState();
    return state.auth.isAuthenticated && state.auth.token;
  }

  getCurrentUser() {
    const { user } = this.getAuthState();
    return user;
  }

  getUser() {
    return this.getCurrentUser();
  }

  hasRole(role) {
    const user = this.getUser();
    return user && user.role === role;
  }

  hasAnyRole(roles) {
    const user = this.getUser();
    return user && roles.includes(user.role);
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  isVendor() {
    return this.hasRole('vendor');
  }

  isRestaurantOwner() {
    return this.hasRole('restaurantOwner');
  }

  isRestaurantManager() {
    return this.hasRole('restaurantManager');
  }

  canManageRestaurant() {
    return this.hasAnyRole(['restaurantOwner', 'restaurantManager']);
  }

  /**
   * Check if vendor is approved (three-state verification system)
   */
  isVendorApproved() {
    const user = this.getCurrentUser();
    if (!user || !this.isVendor()) return false;
    return user.verificationStatus === 'approved';
  }

  /**
   * Check verification status (pending, approved, rejected)
   */
  getVerificationStatus() {
    const user = this.getCurrentUser();
    if (!user) return null;
    return user.verificationStatus || 'pending';
  }

  /**
   * Check if user is pending verification
   */
  isPendingVerification() {
    return this.getVerificationStatus() === 'pending';
  }

  /**
   * Check if user is rejected
   */
  isRejected() {
    return this.getVerificationStatus() === 'rejected';
  }

  /**
   * Check if user account is active
   */
  isAccountActive() {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.status === 'active';
  }

  /**
   * Get role-based dashboard path
   */
  getDashboardPath() {
    const user = this.getCurrentUser();
    if (!user) return '/login';

    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'vendor':
        const verificationStatus = this.getVerificationStatus();
        switch (verificationStatus) {
          case 'approved':
            return '/vendor/dashboard';
          case 'rejected':
            return '/vendor/rejected';
          case 'pending':
          default:
            return '/vendor/pending-approval';
        }
      case 'restaurantOwner':
      case 'restaurantManager':
        return '/restaurant/dashboard';
      default:
        return '/dashboard';
    }
  }

  /**
   * Validate user permissions for a resource
   */
  canAccess(requiredRoles, requireApproval = false) {
    if (!this.isAuthenticated()) return false;

    const user = this.getCurrentUser();
    if (!user) return false;

    // Check role permissions
    if (requiredRoles) {
      const hasRequiredRole = Array.isArray(requiredRoles)
        ? this.hasAnyRole(requiredRoles)
        : this.hasRole(requiredRoles);

      if (!hasRequiredRole) return false;
    }

    // Check vendor approval if required
    if (requireApproval && this.isVendor() && !this.isVendorApproved()) {
      return false;
    }

    return true;
  }

  /**
   * Get user display name
   */
  getUserDisplayName() {
    const user = this.getCurrentUser();
    if (!user) return 'Guest';

    return user.name || user.email || user.phone || 'User';
  }

  /**
   * Vendor Authentication Methods
   */

  /**
   * Vendor login with phone and password
   */
  async vendorLogin(phone, password) {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.login.initiate({ phone, password })
      ).unwrap();

      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Login successful! Welcome back.',
        })
      );

      return result;
    } catch (error) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: error.message || 'Login failed. Please try again.',
        })
      );
      throw error;
    }
  }

  /**
   * Vendor registration
   */
  async vendorRegister(registrationData) {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.register.initiate(registrationData)
      ).unwrap();

      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Registration successful! Please complete your profile.',
        })
      );

      return result;
    } catch (error) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: error.message || 'Registration failed. Please try again.',
        })
      );
      throw error;
    }
  }

  /**
   * Update vendor profile
   */
  async updateVendorProfile(profileData) {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.updateProfile.initiate(profileData)
      ).unwrap();

      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Profile updated successfully.',
        })
      );

      return result;
    } catch (error) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: error.message || 'Profile update failed. Please try again.',
        })
      );
      throw error;
    }
  }

  /**
   * Upload vendor documents
   */
  async uploadVendorDocuments(documentsFormData) {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.uploadDocuments.initiate(documentsFormData)
      ).unwrap();

      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Documents uploaded successfully. Your verification is in progress.',
        })
      );

      return result;
    } catch (error) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: error.message || 'Document upload failed. Please try again.',
        })
      );
      throw error;
    }
  }

  /**
   * Change vendor password
   */
  async changeVendorPassword(passwordData) {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.changePassword.initiate(passwordData)
      ).unwrap();

      store.dispatch(
        addNotification({
          type: 'success',
          message: 'Password changed successfully.',
        })
      );

      return result;
    } catch (error) {
      store.dispatch(
        addNotification({
          type: 'error',
          message: error.message || 'Password change failed. Please try again.',
        })
      );
      throw error;
    }
  }

  /**
   * Get vendor verification status with detailed info
   */
  async getVendorVerificationStatus() {
    try {
      const result = await store.dispatch(
        vendorAuthApi.endpoints.getVerificationStatus.initiate()
      ).unwrap();

      return result;
    } catch (error) {
      console.error('Failed to get verification status:', error);
      return null;
    }
  }

  /**
   * Validate phone number for vendor registration
   */
  validateVendorPhone(phone) {
    // Enhanced phone validation for vendor registration
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number for display
   */
  formatPhoneNumber(phone) {
    if (!phone) return '';
    
    // Remove any non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Format based on length (assuming international format)
    if (cleaned.startsWith('+88')) {
      // Bangladesh format
      return cleaned.replace(/^\+88(\d{4})(\d{6})$/, '+88 $1 $2');
    }
    
    return cleaned;
  }
}

export default new AuthService();
