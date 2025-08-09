import { store } from '../store';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from '../store/slices/authSlice';
import api from './api';

class AuthService {
  async login(phone, password) {
    store.dispatch(loginStart());

    try {
      const response = await api.post('/auth/login', {
        phone,
        password,
      });

      const { data } = response;

      if (data.success) {
        store.dispatch(
          loginSuccess({
            user: data.user,
            token: data.token,
          })
        );

        return { success: true, user: data.user };
      } else {
        store.dispatch(loginFailure(data.message || 'Login failed'));
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = error.message || 'Network error. Please try again.';
      store.dispatch(loginFailure(errorMessage));
      return { success: false, message: errorMessage };
    }
  }

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      const { data } = response;

      if (data.success) {
        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed. Please try again.',
      };
    }
  }

  async logout() {
    const state = store.getState();
    const { token } = state.auth;

    // Call backend logout endpoint
    if (token) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    // Clear frontend state
    store.dispatch(logout());
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  getToken() {
    return store.getState().auth.token;
  }

  isAuthenticated() {
    const state = store.getState();
    return state.auth.isAuthenticated && state.auth.token;
  }

  getUser() {
    return store.getState().auth.user;
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

  // Phone number validation helper
  validatePhoneNumber(phone) {
    // Basic validation for phone with country code
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phone);
  }

  // Format phone number for display
  formatPhoneNumber(phone) {
    if (!phone) return '';

    // Remove non-digits except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Add + if missing
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }

    return cleaned;
  }
}

export default new AuthService();
