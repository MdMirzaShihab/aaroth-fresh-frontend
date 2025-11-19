import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { renderWithProviders } from '../../../test/test-utils';
import ProtectedRoute, {
  AdminRoute,
  VendorRoute,
  BuyerRoute,
  PublicRoute,
  GuestRoute,
} from '../ProtectedRoute';

const TestComponent = () => <div>Protected Content</div>;

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Check', () => {
    it('renders children when user is authenticated', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects to login when user is not authenticated', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows loading spinner when authentication is loading', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: true,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('allows access when user has required role', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'admin', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute roles={['admin']}>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects when user does not have required role', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <ProtectedRoute roles={['admin']}>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('allows access when user has any of multiple required roles', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'buyerOwner', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute roles={['buyerOwner', 'buyerManager']}>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Vendor Approval Check', () => {
    it('allows access for approved vendors when approval is required', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active', isApproved: true },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute requireApproval>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('redirects unapproved vendors to pending approval page', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active', isApproved: false },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/vendor/dashboard']}>
          <ProtectedRoute requireApproval>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('does not check approval for non-vendor roles', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'buyerOwner', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute requireApproval>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Account Status Check', () => {
    it('redirects suspended users to suspended page', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'suspended' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('redirects inactive users to inactive page', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'inactive' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Specialized Route Components', () => {
    it('AdminRoute only allows admin users', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'admin', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <AdminRoute>
            <TestComponent />
          </AdminRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('VendorRoute only allows vendor users', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active', isApproved: true },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <VendorRoute>
            <TestComponent />
          </VendorRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('VendorRoute checks approval by default', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active', isApproved: false },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/vendor/dashboard']}>
          <VendorRoute>
            <TestComponent />
          </VendorRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('BuyerRoute allows both buyer roles', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'buyerManager', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <BuyerRoute>
            <TestComponent />
          </BuyerRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Public and Guest Routes', () => {
    it('PublicRoute renders content for unauthenticated users', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <PublicRoute>
            <TestComponent />
          </PublicRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('GuestRoute redirects authenticated users', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/login']}>
          <GuestRoute>
            <TestComponent />
          </GuestRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('PublicRoute allows authenticated users when redirectAuthenticated is false', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <PublicRoute redirectAuthenticated={false}>
            <TestComponent />
          </PublicRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Custom Redirect Paths', () => {
    it('uses custom redirect path when provided', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/admin-only']}>
          <ProtectedRoute roles={['admin']} redirectTo="/custom-redirect">
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles missing user object when authenticated', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: null,
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </MemoryRouter>,
        { preloadedState }
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('allows access when no role requirements specified', () => {
      const preloadedState = {
        auth: {
          isAuthenticated: true,
          user: { id: 1, role: 'vendor', status: 'active' },
          token: 'valid-token',
          loading: false,
          error: null,
        },
      };

      renderWithProviders(
        <BrowserRouter>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </BrowserRouter>,
        { preloadedState }
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
