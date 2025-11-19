import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authService from '../authService';
import authReducer from '../../store/slices/authSlice';
import notificationReducer from '../../store/slices/notificationSlice';
import { apiSlice } from '../../store/slices/apiSlice';

// Mock the store
const createMockStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      notification: notificationReducer,
      api: apiSlice.reducer,
    },
    preloadedState,
  });
};

// Mock the store import
vi.mock('../../store', () => ({
  store: createMockStore(),
}));

describe('AuthService', () => {
  let mockStore;

  beforeEach(() => {
    mockStore = createMockStore({
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      },
      notification: {
        notifications: [],
      },
    });

    // Replace the mocked store with our test store
    vi.doMock('../../store', () => ({
      store: mockStore,
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication State Getters', () => {
    it('gets current authentication state', () => {
      const authState = {
        user: { id: 1, role: 'vendor' },
        token: 'test-token',
        isAuthenticated: true,
        loading: false,
        error: null,
      };

      mockStore = createMockStore({ auth: authState });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getAuthState()).toEqual(authState);
    });

    it('gets current user', () => {
      const user = { id: 1, role: 'vendor', name: 'Test User' };

      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getCurrentUser()).toEqual(user);
    });

    it('gets auth token', () => {
      const token = 'test-auth-token';

      mockStore = createMockStore({
        auth: { token, isAuthenticated: true, user: { id: 1 } },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getToken()).toBe(token);
    });

    it('checks if user is authenticated', () => {
      mockStore = createMockStore({
        auth: { isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('returns false for authentication when token is missing', () => {
      mockStore = createMockStore({
        auth: { isAuthenticated: true, token: null },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Role Checking', () => {
    const testUser = { id: 1, role: 'vendor', name: 'Test Vendor' };

    beforeEach(() => {
      mockStore = createMockStore({
        auth: { user: testUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));
    });

    it('checks if user has specific role', () => {
      expect(authService.hasRole('vendor')).toBe(true);
      expect(authService.hasRole('admin')).toBe(false);
    });

    it('checks if user has any of multiple roles', () => {
      expect(authService.hasAnyRole(['vendor', 'admin'])).toBe(true);
      expect(authService.hasAnyRole(['admin', 'buyerOwner'])).toBe(false);
    });

    it('returns false for role checks with no user', () => {
      mockStore = createMockStore({
        auth: { user: null, isAuthenticated: false, token: null },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.hasRole('vendor')).toBe(false);
      expect(authService.hasAnyRole(['vendor', 'admin'])).toBe(false);
    });

    it('returns false for hasAnyRole with non-array input', () => {
      expect(authService.hasAnyRole('vendor')).toBe(false);
      expect(authService.hasAnyRole(null)).toBe(false);
    });
  });

  describe('Specific Role Checks', () => {
    it('correctly identifies admin users', () => {
      const adminUser = { id: 1, role: 'admin' };
      mockStore = createMockStore({
        auth: { user: adminUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isAdmin()).toBe(true);
      expect(authService.isVendor()).toBe(false);
    });

    it('correctly identifies vendor users', () => {
      const vendorUser = { id: 1, role: 'vendor' };
      mockStore = createMockStore({
        auth: { user: vendorUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isVendor()).toBe(true);
      expect(authService.isAdmin()).toBe(false);
    });

    it('correctly identifies buyer users', () => {
      const buyerOwner = { id: 1, role: 'buyerOwner' };
      mockStore = createMockStore({
        auth: {
          user: buyerOwner,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isBuyerOwner()).toBe(true);
      expect(authService.isBuyerUser()).toBe(true);
      expect(authService.isBusinessUser()).toBe(true);
    });

    it('correctly identifies buyer managers', () => {
      const buyerManager = { id: 1, role: 'buyerManager' };
      mockStore = createMockStore({
        auth: {
          user: buyerManager,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isBuyerManager()).toBe(true);
      expect(authService.isBuyerUser()).toBe(true);
      expect(authService.isBusinessUser()).toBe(true);
    });

    it('identifies business users correctly', () => {
      const vendorUser = { id: 1, role: 'vendor' };
      mockStore = createMockStore({
        auth: { user: vendorUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isBusinessUser()).toBe(true);
    });
  });

  describe('Vendor Approval Status', () => {
    it('checks vendor approval status', () => {
      const approvedVendor = { id: 1, role: 'vendor', isApproved: true };
      mockStore = createMockStore({
        auth: {
          user: approvedVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isVendorApproved()).toBe(true);
    });

    it('returns false for unapproved vendors', () => {
      const unapprovedVendor = { id: 1, role: 'vendor', isApproved: false };
      mockStore = createMockStore({
        auth: {
          user: unapprovedVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isVendorApproved()).toBe(false);
    });

    it('returns false for non-vendor users', () => {
      const adminUser = { id: 1, role: 'admin' };
      mockStore = createMockStore({
        auth: { user: adminUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isVendorApproved()).toBe(false);
    });
  });

  describe('Account Status Checks', () => {
    it('checks if account is active', () => {
      const activeUser = { id: 1, role: 'vendor', status: 'active' };
      mockStore = createMockStore({
        auth: { user: activeUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isAccountActive()).toBe(true);
    });

    it('checks if account is suspended', () => {
      const suspendedUser = { id: 1, role: 'vendor', status: 'suspended' };
      mockStore = createMockStore({
        auth: {
          user: suspendedUser,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.isAccountSuspended()).toBe(true);
      expect(authService.isAccountActive()).toBe(false);
    });
  });

  describe('Dashboard Path Generation', () => {
    it('returns correct dashboard path for admin', () => {
      const adminUser = { id: 1, role: 'admin' };
      mockStore = createMockStore({
        auth: { user: adminUser, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getDashboardPath()).toBe('/admin/dashboard');
    });

    it('returns correct dashboard path for approved vendor', () => {
      const approvedVendor = { id: 1, role: 'vendor', isApproved: true };
      mockStore = createMockStore({
        auth: {
          user: approvedVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getDashboardPath()).toBe('/vendor/dashboard');
    });

    it('returns pending approval path for unapproved vendor', () => {
      const unapprovedVendor = { id: 1, role: 'vendor', isApproved: false };
      mockStore = createMockStore({
        auth: {
          user: unapprovedVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getDashboardPath()).toBe('/vendor/pending-approval');
    });

    it('returns buyer dashboard for buyer roles', () => {
      const buyerOwner = { id: 1, role: 'buyerOwner' };
      mockStore = createMockStore({
        auth: {
          user: buyerOwner,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getDashboardPath()).toBe('/buyer/dashboard');
    });

    it('returns login path when no user', () => {
      mockStore = createMockStore({
        auth: { user: null, isAuthenticated: false, token: null },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getDashboardPath()).toBe('/login');
    });
  });

  describe('Access Control', () => {
    const activeVendor = {
      id: 1,
      role: 'vendor',
      status: 'active',
      isApproved: true,
    };

    it('allows access for authenticated users with correct role', () => {
      mockStore = createMockStore({
        auth: {
          user: activeVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.canAccess(['vendor'])).toBe(true);
      expect(authService.canAccess('vendor')).toBe(true);
    });

    it('denies access for unauthenticated users', () => {
      mockStore = createMockStore({
        auth: { user: null, isAuthenticated: false, token: null },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.canAccess(['vendor'])).toBe(false);
    });

    it('denies access for users without required role', () => {
      mockStore = createMockStore({
        auth: {
          user: activeVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.canAccess(['admin'])).toBe(false);
    });

    it('checks vendor approval when required', () => {
      const unapprovedVendor = { ...activeVendor, isApproved: false };
      mockStore = createMockStore({
        auth: {
          user: unapprovedVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.canAccess(['vendor'], true)).toBe(false);
    });

    it('allows access without role requirements', () => {
      mockStore = createMockStore({
        auth: {
          user: activeVendor,
          isAuthenticated: true,
          token: 'test-token',
        },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.canAccess()).toBe(true);
    });
  });

  describe('User Display Information', () => {
    it('returns user display name', () => {
      const user = { id: 1, name: 'John Doe', role: 'vendor' };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserDisplayName()).toBe('John Doe');
    });

    it('falls back to email for display name', () => {
      const user = { id: 1, email: 'john@example.com', role: 'vendor' };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserDisplayName()).toBe('john@example.com');
    });

    it('falls back to phone for display name', () => {
      const user = { id: 1, phone: '+8801712345678', role: 'vendor' };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserDisplayName()).toBe('+8801712345678');
    });

    it('returns "Guest" when no user', () => {
      mockStore = createMockStore({
        auth: { user: null, isAuthenticated: false, token: null },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserDisplayName()).toBe('Guest');
    });

    it('generates user avatar initials', () => {
      const user = { id: 1, name: 'John Doe', role: 'vendor' };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserAvatar()).toBe('JD');
    });

    it('returns avatar URL when available', () => {
      const user = {
        id: 1,
        name: 'John Doe',
        avatar: 'http://example.com/avatar.jpg',
        role: 'vendor',
      };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserAvatar()).toBe('http://example.com/avatar.jpg');
    });

    it('handles single word names for initials', () => {
      const user = { id: 1, name: 'John', role: 'vendor' };
      mockStore = createMockStore({
        auth: { user, isAuthenticated: true, token: 'test-token' },
      });
      vi.doMock('../../store', () => ({ store: mockStore }));

      expect(authService.getUserAvatar()).toBe('J');
    });
  });
});
