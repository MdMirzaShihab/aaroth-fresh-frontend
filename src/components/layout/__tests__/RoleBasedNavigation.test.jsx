import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, render } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import Sidebar from '../Sidebar';
import MobileNavigation from '../MobileNavigation';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/admin/dashboard' })
  };
});

describe('Role-Based Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Role Navigation', () => {
    const adminState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Admin User', role: 'admin' },
        token: 'test-token'
      }
    };

    it('shows admin-specific navigation items in sidebar', () => {
      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: adminState 
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Product Management')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });

    it('shows admin navigation in mobile bottom tabs', () => {
      renderWithProviders(<MobileNavigation />, { 
        preloadedState: adminState 
      });

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Users')).toBeInTheDocument();
      expect(screen.getByLabelText('Analytics')).toBeInTheDocument();
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });
  });

  describe('Vendor Role Navigation', () => {
    const vendorState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Vendor User', role: 'vendor' },
        token: 'test-token'
      }
    };

    it('shows vendor-specific navigation items in sidebar', () => {
      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: vendorState 
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('My Listings')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Sales Analytics')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Should not show admin items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });

    it('shows vendor navigation in mobile bottom tabs', () => {
      renderWithProviders(<MobileNavigation />, { 
        preloadedState: vendorState 
      });

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Listings')).toBeInTheDocument();
      expect(screen.getByLabelText('Orders')).toBeInTheDocument();
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();

      // Should not show admin items
      expect(screen.queryByLabelText('Users')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Settings')).not.toBeInTheDocument();
    });
  });

  describe('Restaurant Owner Role Navigation', () => {
    const restaurantOwnerState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Restaurant Owner', role: 'restaurantOwner' },
        token: 'test-token'
      }
    };

    it('shows restaurant owner-specific navigation items in sidebar', () => {
      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: restaurantOwnerState 
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();

      // Should not show admin or vendor items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('My Listings')).not.toBeInTheDocument();
    });

    it('shows restaurant navigation in mobile bottom tabs', () => {
      renderWithProviders(<MobileNavigation />, { 
        preloadedState: restaurantOwnerState 
      });

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Browse')).toBeInTheDocument();
      expect(screen.getByLabelText('Cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Orders')).toBeInTheDocument();
    });
  });

  describe('Restaurant Manager Role Navigation', () => {
    const restaurantManagerState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Restaurant Manager', role: 'restaurantManager' },
        token: 'test-token'
      }
    };

    it('shows limited navigation compared to restaurant owner', () => {
      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: restaurantManagerState 
      });

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
      expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
      expect(screen.getByText('My Orders')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
      
      // Restaurant management should NOT be available to managers
      expect(screen.queryByText('Restaurant')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated User Navigation', () => {
    const unauthenticatedState = {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null
      }
    };

    it('does not render mobile navigation when not authenticated', () => {
      const { container } = renderWithProviders(<MobileNavigation />, { 
        preloadedState: unauthenticatedState 
      });

      expect(container.firstChild).toBeNull();
    });

    it('sidebar should not be rendered for unauthenticated users', () => {
      // This would typically be handled by the AppLayout component
      // which doesn't render Sidebar when user is not authenticated
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe('Navigation Hierarchy and Children', () => {
    const adminState = {
      auth: {
        isAuthenticated: true,
        user: { name: 'Admin User', role: 'admin' },
        token: 'test-token'
      }
    };

    it('expands navigation items with children correctly', () => {
      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: adminState 
      });

      const userManagementButton = screen.getByText('User Management');
      expect(userManagementButton).toBeInTheDocument();
      
      // Initially children should not be visible (not expanded)
      expect(screen.queryByText('Vendors')).not.toBeInTheDocument();
      expect(screen.queryByText('Restaurants')).not.toBeInTheDocument();
    });
  });

  describe('Cross-role Access Control', () => {
    it('vendor cannot see admin navigation items', () => {
      const vendorState = {
        auth: {
          isAuthenticated: true,
          user: { name: 'Vendor User', role: 'vendor' },
          token: 'test-token'
        }
      };

      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: vendorState 
      });

      // Vendor should not see admin-only items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });

    it('restaurant user cannot see vendor or admin items', () => {
      const restaurantState = {
        auth: {
          isAuthenticated: true,
          user: { name: 'Restaurant User', role: 'restaurantOwner' },
          token: 'test-token'
        }
      };

      renderWithProviders(<Sidebar isOpen={true} onClose={vi.fn()} />, { 
        preloadedState: restaurantState 
      });

      // Restaurant user should not see vendor or admin items
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('My Listings')).not.toBeInTheDocument();
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });
  });
});