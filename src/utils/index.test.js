import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  formatCurrency,
  formatPhoneNumber,
  validatePhoneNumber,
  formatDate,
  capitalize,
  truncate,
  hasPermission,
  getInitials,
  TokenStorage,
  validateBangladeshPhone,
  formatBangladeshPhone,
  phoneInputUtils,
  roleUtils,
  apiUtils,
  storageUtils,
} from './index';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(100)).toBe('BDT 100.00');
      expect(formatCurrency(99.99)).toBe('BDT 99.99');
      expect(formatCurrency(0)).toBe('BDT 0.00');
    });

    it('should handle invalid input', () => {
      expect(formatCurrency('invalid')).toBe('BDT 0.00');
      expect(formatCurrency(null)).toBe('BDT 0.00');
      expect(formatCurrency(undefined)).toBe('BDT 0.00');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format phone numbers correctly', () => {
      expect(formatPhoneNumber('8801234567890')).toBe('+8801234567890');
      expect(formatPhoneNumber('+8801234567890')).toBe('+8801234567890');
      expect(formatPhoneNumber('880-123-456-7890')).toBe('+8801234567890');
    });

    it('should handle empty input', () => {
      expect(formatPhoneNumber('')).toBe('');
      expect(formatPhoneNumber(null)).toBe('');
      expect(formatPhoneNumber(undefined)).toBe('');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate phone numbers correctly', () => {
      expect(validatePhoneNumber('+8801234567890')).toBe(true);
      expect(validatePhoneNumber('+14155552222')).toBe(true);
      expect(validatePhoneNumber('8801234567890')).toBe(false);
      expect(validatePhoneNumber('+123')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
    });
  });

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      const formatted = formatDate(date);
      expect(formatted).toMatch(/Jan 15, 2024/);
    });

    it('should handle invalid dates', () => {
      expect(formatDate('')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });

  describe('capitalize', () => {
    it('should capitalize strings correctly', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('hELLO wORLD')).toBe('Hello world');
    });

    it('should handle invalid input', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
      expect(capitalize(undefined)).toBe('');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const longText = 'This is a very long text that should be truncated';
      expect(truncate(longText, 20)).toBe('This is a very long...');
    });

    it('should not truncate short text', () => {
      const shortText = 'Short text';
      expect(truncate(shortText, 20)).toBe('Short text');
    });

    it('should handle invalid input', () => {
      expect(truncate('', 10)).toBe('');
      expect(truncate(null, 10)).toBe('');
      expect(truncate(undefined, 10)).toBe('');
    });
  });

  describe('hasPermission', () => {
    it('should check permissions correctly', () => {
      expect(hasPermission('admin', 'admin')).toBe(true);
      expect(hasPermission('vendor', 'admin')).toBe(false);
      expect(hasPermission('admin', ['admin', 'vendor'])).toBe(true);
      expect(hasPermission('restaurant', ['admin', 'vendor'])).toBe(false);
    });

    it('should handle invalid input', () => {
      expect(hasPermission(null, 'admin')).toBe(false);
      expect(hasPermission('admin', null)).toBe(false);
    });
  });

  describe('getInitials', () => {
    it('should get initials correctly', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice Bob Charlie')).toBe('AB');
      expect(getInitials('admin')).toBe('A');
    });

    it('should handle invalid input', () => {
      expect(getInitials('')).toBe('');
      expect(getInitials(null)).toBe('');
      expect(getInitials(undefined)).toBe('');
    });
  });

  describe('TokenStorage', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set and get token', () => {
      const token = 'test-token-123';
      TokenStorage.setToken(token);
      expect(TokenStorage.getToken()).toBe(token);
    });

    it('should clear token', () => {
      TokenStorage.setToken('test-token');
      TokenStorage.clearToken();
      expect(TokenStorage.getToken()).toBeNull();
    });

    it('should check if token exists', () => {
      expect(TokenStorage.hasToken()).toBe(false);
      TokenStorage.setToken('test-token');
      expect(TokenStorage.hasToken()).toBe(true);
    });

    it('should not set empty or invalid token', () => {
      TokenStorage.setToken('');
      expect(TokenStorage.hasToken()).toBe(false);

      TokenStorage.setToken('   ');
      expect(TokenStorage.hasToken()).toBe(false);

      TokenStorage.setToken(null);
      expect(TokenStorage.hasToken()).toBe(false);
    });

    it('should detect expired token', () => {
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjEwfQ.invalid';
      expect(TokenStorage.isTokenExpired(expiredToken)).toBe(true);
    });

    it('should handle invalid token format', () => {
      expect(TokenStorage.isTokenExpired('invalid-token')).toBe(true);
      expect(TokenStorage.getTokenPayload('invalid-token')).toBeNull();
    });
  });

  describe('validateBangladeshPhone', () => {
    it('should validate correct Bangladesh phone numbers', () => {
      const result = validateBangladeshPhone('+8801712345678');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('');
    });

    it('should reject phone numbers without country code', () => {
      const result = validateBangladeshPhone('01712345678');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('must start with +88');
    });

    it('should reject phone numbers with wrong length', () => {
      const result = validateBangladeshPhone('+880171234567');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('11 digits');
    });

    it('should reject invalid operator codes', () => {
      const result = validateBangladeshPhone('+8801012345678');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Invalid operator code');
    });

    it('should handle empty input', () => {
      const result = validateBangladeshPhone('');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('required');
    });
  });

  describe('formatBangladeshPhone', () => {
    it('should format valid phone numbers', () => {
      const result = formatBangladeshPhone('+8801712345678');
      expect(result).toBe('+880 1712-345-678');
    });

    it('should add country code if missing', () => {
      const result = formatBangladeshPhone('01712345678');
      expect(result).toBe('+8801712345678');
    });

    it('should handle empty input', () => {
      expect(formatBangladeshPhone('')).toBe('');
      expect(formatBangladeshPhone(null)).toBe('');
    });
  });

  describe('phoneInputUtils', () => {
    it('should format input correctly', () => {
      const result = phoneInputUtils.formatInput('01712345678');
      expect(result).toBe('+880 1712-345-678');
    });

    it('should clean formatted value', () => {
      const result = phoneInputUtils.getCleanValue('+880 1712-345-678');
      expect(result).toBe('+8801712345678');
    });

    it('should provide placeholder', () => {
      expect(phoneInputUtils.placeholder).toBe('+880 1712-345-678');
    });
  });

  describe('roleUtils', () => {
    it('should identify roles correctly', () => {
      expect(roleUtils.isAdmin('admin')).toBe(true);
      expect(roleUtils.isVendor('vendor')).toBe(true);
      expect(roleUtils.isRestaurantOwner('restaurantOwner')).toBe(true);
      expect(roleUtils.isRestaurantManager('restaurantManager')).toBe(true);
      expect(roleUtils.isRestaurantUser('restaurantOwner')).toBe(true);
      expect(roleUtils.isRestaurantUser('restaurantManager')).toBe(true);
    });

    it('should check permissions correctly', () => {
      expect(roleUtils.canManageListings('admin')).toBe(true);
      expect(roleUtils.canManageListings('vendor')).toBe(true);
      expect(roleUtils.canManageListings('restaurantOwner')).toBe(false);

      expect(roleUtils.canPlaceOrders('restaurantOwner')).toBe(true);
      expect(roleUtils.canPlaceOrders('vendor')).toBe(false);

      expect(roleUtils.canManageUsers('admin')).toBe(true);
      expect(roleUtils.canManageUsers('vendor')).toBe(false);
    });
  });

  describe('apiUtils', () => {
    it('should extract error messages', () => {
      const errorWithResponseData = {
        response: { data: { message: 'API Error' } },
      };
      expect(apiUtils.getErrorMessage(errorWithResponseData)).toBe('API Error');

      const errorWithMessage = { message: 'Network Error' };
      expect(apiUtils.getErrorMessage(errorWithMessage)).toBe('Network Error');

      const unknownError = {};
      expect(apiUtils.getErrorMessage(unknownError)).toBe(
        'An unexpected error occurred'
      );
    });

    it('should identify error types', () => {
      const networkError = { code: 'NETWORK_ERROR' };
      expect(apiUtils.isNetworkError(networkError)).toBe(true);

      const authError = { response: { status: 401 } };
      expect(apiUtils.isAuthError(authError)).toBe(true);

      const permissionError = { response: { status: 403 } };
      expect(apiUtils.isPermissionError(permissionError)).toBe(true);
    });

    it('should format validation errors', () => {
      const validationError = {
        response: {
          data: {
            errors: [
              { message: 'Field is required' },
              { message: 'Invalid format' },
            ],
          },
        },
      };

      const result = apiUtils.formatValidationErrors(validationError);
      expect(result).toBe('Field is required, Invalid format');
    });
  });

  describe('storageUtils', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should set and get items', () => {
      const data = { test: 'value' };
      const result = storageUtils.setItem('test-key', data);
      expect(result).toBe(true);

      const retrieved = storageUtils.getItem('test-key');
      expect(retrieved).toEqual(data);
    });

    it('should return default value for non-existent keys', () => {
      const defaultValue = { default: true };
      const result = storageUtils.getItem('non-existent', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should remove items', () => {
      storageUtils.setItem('test-key', 'test-value');
      const removed = storageUtils.removeItem('test-key');
      expect(removed).toBe(true);

      const retrieved = storageUtils.getItem('test-key');
      expect(retrieved).toBeNull();
    });

    it('should clear all items', () => {
      storageUtils.setItem('key1', 'value1');
      storageUtils.setItem('key2', 'value2');

      const cleared = storageUtils.clear();
      expect(cleared).toBe(true);

      expect(storageUtils.getItem('key1')).toBeNull();
      expect(storageUtils.getItem('key2')).toBeNull();
    });
  });
});
