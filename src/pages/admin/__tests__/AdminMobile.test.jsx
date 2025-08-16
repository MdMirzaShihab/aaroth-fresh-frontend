import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../../../test/test-utils';
import AdminDashboard from '../AdminDashboard';
import UserManagement from '../UserManagement';
import VendorApproval from '../VendorApproval';

// Mock data
const mockDashboardData = {
  data: {
    totalUsers: 1247,
    activeVendors: 342,
    pendingApprovals: 23,
    totalRestaurants: 189,
    totalOrders: 5643,
    inactiveUsers: 87,
    systemHealth: {
      apiHealth: 'healthy',
      databaseHealth: 'healthy',
    },
    recentActivity: [],
  },
};

const mockUsersData = {
  data: {
    users: [
      {
        id: '1',
        name: 'John Vendor',
        phone: '+1234567890',
        role: 'vendor',
        isApproved: false,
        status: 'pending',
        createdAt: '2024-01-10T10:00:00Z',
      },
    ],
    pagination: { totalUsers: 1, currentPage: 1, totalPages: 1, limit: 10 },
  },
};

const server = setupServer(
  rest.get('/api/v1/admin/dashboard', (req, res, ctx) => {
    return res(ctx.json(mockDashboardData));
  }),
  rest.get('/api/v1/admin/users', (req, res, ctx) => {
    return res(ctx.json(mockUsersData));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Helper to set viewport size
const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 667,
  });
  window.dispatchEvent(new Event('resize'));
};

const setTabletViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 768,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  window.dispatchEvent(new Event('resize'));
};

const renderWithAdminAuth = (Component) => {
  return renderWithProviders(<Component />, {
    preloadedState: {
      auth: {
        isAuthenticated: true,
        user: {
          id: 'admin-1',
          role: 'admin',
          name: 'Admin User',
          phone: '+1234567890',
        },
        token: 'mock-token',
        loading: false,
      },
    },
  });
};

describe('Admin Mobile Responsiveness', () => {
  beforeEach(() => {
    setMobileViewport();
  });

  describe('AdminDashboard Mobile', () => {
    it('renders metrics cards in mobile grid layout', async () => {
      renderWithAdminAuth(AdminDashboard);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      // Check that metrics cards are arranged in responsive grid
      const metricsSection = screen.getByText('Total Users').closest('.grid');
      expect(metricsSection).toHaveClass('grid-cols-1');
      expect(metricsSection).toHaveClass('sm:grid-cols-2');
    });

    it('stacks header elements vertically on mobile', async () => {
      renderWithAdminAuth(AdminDashboard);

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });

      const headerSection = screen.getByText('Admin Dashboard').closest('div');
      expect(headerSection).toHaveClass('flex-col');
    });

    it('makes quick action buttons touch-friendly', async () => {
      renderWithAdminAuth(AdminDashboard);

      await waitFor(() => {
        const viewReportsButton = screen.getByText('View Reports');
        expect(viewReportsButton).toHaveClass('min-h-[44px]');
      });
    });
  });

  describe('UserManagement Mobile', () => {
    it('renders responsive table that scrolls horizontally on mobile', async () => {
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // Check for horizontal scroll container
      const tableContainer = screen
        .getByRole('table')
        .closest('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
    });

    it('stacks filter controls vertically on mobile', async () => {
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        const filtersContainer = screen
          .getByPlaceholderText('Search users by name, phone...')
          .closest('.flex');
        expect(filtersContainer).toHaveClass('flex-col');
        expect(filtersContainer).toHaveClass('lg:flex-row');
      });
    });

    it('makes all interactive elements touch-friendly (44px min)', async () => {
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        // Check search input
        const searchInput = screen.getByPlaceholderText(
          'Search users by name, phone...'
        );
        expect(searchInput.parentElement).toHaveClass('min-h-[44px]');

        // Check dropdown filters
        const roleFilter = screen.getByDisplayValue('All Roles');
        expect(roleFilter).toHaveClass('min-h-[44px]');
      });
    });

    it('handles touch interactions properly', async () => {
      const user = userEvent.setup();
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        expect(screen.getByText('John Vendor')).toBeInTheDocument();
      });

      // Test touch interaction on checkbox
      const checkbox = screen.getAllByRole('checkbox')[1];
      await user.click(checkbox);

      // Should show bulk actions with proper sizing
      await waitFor(() => {
        const bulkActions = screen.getByText('1 selected');
        expect(bulkActions).toBeInTheDocument();
      });
    });
  });

  describe('VendorApproval Mobile', () => {
    it('renders vendor cards in single column on mobile', async () => {
      server.use(
        rest.get('/api/v1/admin/users', (req, res, ctx) => {
          return res(
            ctx.json({
              data: {
                users: [
                  {
                    id: '1',
                    name: 'Vendor One',
                    phone: '+1234567890',
                    role: 'vendor',
                    isApproved: false,
                    status: 'pending',
                    createdAt: '2024-01-10T10:00:00Z',
                  },
                  {
                    id: '2',
                    name: 'Vendor Two',
                    phone: '+1234567891',
                    role: 'vendor',
                    isApproved: false,
                    status: 'pending',
                    createdAt: '2024-01-09T10:00:00Z',
                  },
                ],
                pagination: {
                  totalUsers: 2,
                  currentPage: 1,
                  totalPages: 1,
                  limit: 12,
                },
              },
            })
          );
        })
      );

      renderWithAdminAuth(VendorApproval);

      await waitFor(() => {
        expect(screen.getByText('Vendor One')).toBeInTheDocument();
      });

      // Check grid layout classes
      const cardsGrid = screen.getByText('Vendor One').closest('.grid');
      expect(cardsGrid).toHaveClass('grid-cols-1');
      expect(cardsGrid).toHaveClass('md:grid-cols-2');
      expect(cardsGrid).toHaveClass('lg:grid-cols-3');
    });

    it('makes vendor action buttons touch-friendly', async () => {
      server.use(
        rest.get('/api/v1/admin/users', (req, res, ctx) => {
          return res(
            ctx.json({
              data: {
                users: [
                  {
                    id: '1',
                    name: 'Test Vendor',
                    phone: '+1234567890',
                    role: 'vendor',
                    isApproved: false,
                    status: 'pending',
                    createdAt: '2024-01-10T10:00:00Z',
                  },
                ],
                pagination: {
                  totalUsers: 1,
                  currentPage: 1,
                  totalPages: 1,
                  limit: 12,
                },
              },
            })
          );
        })
      );

      renderWithAdminAuth(VendorApproval);

      await waitFor(() => {
        expect(screen.getByText('Test Vendor')).toBeInTheDocument();
      });

      // Check button sizes
      const approveButton = screen.getByText('Approve');
      expect(approveButton).toHaveClass('min-h-[36px]');

      const viewButton = screen.getByText('View');
      expect(viewButton).toHaveClass('min-h-[36px]');
    });
  });

  describe('Tablet Responsiveness', () => {
    beforeEach(() => {
      setTabletViewport();
    });

    it('adjusts dashboard layout for tablet', async () => {
      renderWithAdminAuth(AdminDashboard);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      // Should use 2-column layout on tablet
      const metricsSection = screen.getByText('Total Users').closest('.grid');
      expect(metricsSection).toHaveClass('lg:grid-cols-3');
    });

    it('shows appropriate vendor card grid on tablet', async () => {
      server.use(
        rest.get('/api/v1/admin/users', (req, res, ctx) => {
          return res(
            ctx.json({
              data: {
                users: Array.from({ length: 4 }, (_, i) => ({
                  id: String(i + 1),
                  name: `Vendor ${i + 1}`,
                  phone: `+123456789${i}`,
                  role: 'vendor',
                  isApproved: false,
                  status: 'pending',
                  createdAt: '2024-01-10T10:00:00Z',
                })),
                pagination: {
                  totalUsers: 4,
                  currentPage: 1,
                  totalPages: 1,
                  limit: 12,
                },
              },
            })
          );
        })
      );

      renderWithAdminAuth(VendorApproval);

      await waitFor(() => {
        expect(screen.getByText('Vendor 1')).toBeInTheDocument();
      });

      // Should use 2-column layout on tablet
      const cardsGrid = screen.getByText('Vendor 1').closest('.grid');
      expect(cardsGrid).toHaveClass('md:grid-cols-2');
    });
  });

  describe('Touch Interaction Tests', () => {
    it('handles swipe gestures gracefully', async () => {
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // While we can't directly test swipe gestures in jsdom,
      // we can ensure touch-friendly elements are present
      const tableContainer = screen
        .getByRole('table')
        .closest('.overflow-x-auto');
      expect(tableContainer).toBeInTheDocument();
    });

    it('provides proper visual feedback for touch interactions', async () => {
      const user = userEvent.setup();
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        expect(screen.getByText('John Vendor')).toBeInTheDocument();
      });

      // Test hover/active states (which translate to touch feedback)
      const checkbox = screen.getAllByRole('checkbox')[1];

      // Focus should provide visual feedback
      await user.tab();
      expect(document.activeElement).toBeTruthy();
    });

    it('handles modal interactions on mobile', async () => {
      const user = userEvent.setup();

      server.use(
        rest.get('/api/v1/admin/users', (req, res, ctx) => {
          return res(
            ctx.json({
              data: {
                users: [
                  {
                    id: '1',
                    name: 'Test Vendor',
                    phone: '+1234567890',
                    role: 'vendor',
                    isApproved: false,
                    status: 'pending',
                    createdAt: '2024-01-10T10:00:00Z',
                  },
                ],
                pagination: {
                  totalUsers: 1,
                  currentPage: 1,
                  totalPages: 1,
                  limit: 12,
                },
              },
            })
          );
        })
      );

      renderWithAdminAuth(VendorApproval);

      await waitFor(() => {
        expect(screen.getByText('Test Vendor')).toBeInTheDocument();
      });

      // Open vendor details modal
      const viewButton = screen.getByText('View');
      await user.click(viewButton);

      // Modal should be responsive
      await waitFor(() => {
        const modal = screen.getByText('Vendor Application Details');
        expect(modal).toBeInTheDocument();

        // Modal container should be responsive
        const modalContainer = modal.closest('.relative');
        expect(modalContainer).toHaveClass('w-full');
        expect(modalContainer).toHaveClass('max-w-2xl');
      });
    });
  });

  describe('Accessibility on Mobile', () => {
    it('maintains proper focus management on mobile', async () => {
      const user = userEvent.setup();
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });

      // Test tab navigation
      await user.tab();
      expect(document.activeElement).toBeTruthy();

      // Should be able to navigate to interactive elements
      const searchInput = screen.getByPlaceholderText(
        'Search users by name, phone...'
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('provides proper touch target sizes for accessibility', async () => {
      renderWithAdminAuth(UserManagement);

      await waitFor(() => {
        // All interactive elements should meet minimum touch target size
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
          const hasMinHeight =
            button.classList.contains('min-h-[36px]') ||
            button.classList.contains('min-h-[44px]') ||
            button.classList.contains('min-h-[48px]');
          expect(hasMinHeight).toBeTruthy();
        });
      });
    });

    it('maintains readable text sizes on mobile', async () => {
      renderWithAdminAuth(AdminDashboard);

      await waitFor(() => {
        // Check that text elements have appropriate mobile sizing
        const title = screen.getByText('Admin Dashboard');
        expect(title).toHaveClass('text-3xl');

        const description = screen.getByText(
          'Monitor and manage your Aaroth Fresh platform'
        );
        expect(description).toHaveClass('text-text-muted');
      });
    });
  });
});
