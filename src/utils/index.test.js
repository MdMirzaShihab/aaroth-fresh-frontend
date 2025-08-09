import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatPhoneNumber,
  validatePhoneNumber,
  formatDate,
  capitalize,
  truncate,
  hasPermission,
  getInitials,
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
});
