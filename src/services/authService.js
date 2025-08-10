import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { apiSlice } from '../store/slices/apiSlice';
import { addNotification } from '../store/slices/notificationSlice';

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
   * Check if vendor is approved
   */
  isVendorApproved() {
    const user = this.getCurrentUser();
    if (!user || !this.isVendor()) return false;
    return user.isApproved === true;
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
        return user.isApproved
          ? '/vendor/dashboard'
          : '/vendor/pending-approval';
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
}

export default new AuthService();
