import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import AdminDashboard from '../AdminDashboard';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hook
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminDashboardQuery: vi.fn(),
  };
});

// Mock dashboard data
const mockDashboardData = {
  data: {
    totalUsers: 1247,
    activeVendors: 342,
    pendingApprovals: 23,
    totalRestaurants: 189,
    totalOrders: 5643,
    inactiveUsers: 87,
    userGrowth: '+16.3%',
    vendorGrowth: '+12.8%',
    approvalChange: '+5',
    restaurantGrowth: '+8.2%',
    orderGrowth: '+24.1%',
    inactiveChange: '-2',
    systemHealth: {
      apiHealth: 'healthy',
      databaseHealth: 'healthy',
      storageHealth: 'warning',
    },
    recentActivity: [
      {
        description: 'New vendor approved: Fresh Greens Co.',
        timestamp: '2024-01-15T10:30:00Z',
      },
      {
        description: '15 new orders received',
        timestamp: '2024-01-15T09:15:00Z',
      },
    ],
  },
};

describe('AdminDashboard', () => {
  const renderDashboard = (queryResult = {}) => {
    const defaultQueryResult = {
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    apiSlice.useGetAdminDashboardQuery.mockReturnValue({
      ...defaultQueryResult,
      ...queryResult,
    });

    return renderWithProviders(<AdminDashboard />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: '1',
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title and description', async () => {
    renderDashboard();

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Monitor and manage your Aaroth Fresh platform')
    ).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderDashboard({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders metrics cards with correct data', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1,247')).toBeInTheDocument();
      expect(screen.getByText('+16.3%')).toBeInTheDocument();
    });

    expect(screen.getByText('Active Vendors')).toBeInTheDocument();
    expect(screen.getByText('342')).toBeInTheDocument();
    expect(screen.getByText('+12.8%')).toBeInTheDocument();

    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('shows urgent indicator for high pending approvals', async () => {
    const highApprovalData = {
      ...mockDashboardData,
      data: {
        ...mockDashboardData.data,
        pendingApprovals: 15, // Above threshold
      },
    };

    renderDashboard({ data: highApprovalData });

    await waitFor(() => {
      expect(screen.getByText('Needs Attention')).toBeInTheDocument();
    });
  });

  it('renders system health section', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('System Health')).toBeInTheDocument();
      expect(screen.getByText('Api Health')).toBeInTheDocument();
      expect(screen.getByText('healthy')).toBeInTheDocument();
      expect(screen.getByText('Storage Health')).toBeInTheDocument();
      expect(screen.getByText('warning')).toBeInTheDocument();
    });
  });

  it('renders recent activity section', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(
        screen.getByText('New vendor approved: Fresh Greens Co.')
      ).toBeInTheDocument();
      expect(screen.getByText('15 new orders received')).toBeInTheDocument();
    });
  });

  it('shows quick action buttons when there are pending approvals', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Review Approvals/)).toBeInTheDocument();
      expect(screen.getByText('View Reports')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    renderDashboard({
      error: { status: 500, data: { error: 'Internal server error' } },
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      expect(
        screen.getByText(
          'There was an error loading the dashboard data. Please try again.'
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('applies correct styling for positive trends', async () => {
    renderDashboard();

    await waitFor(() => {
      const positiveChange = screen.getByText('+16.3%');
      expect(positiveChange.closest('.bg-sage-green\\/20')).toBeInTheDocument();
    });
  });

  it('renders accessibility features correctly', async () => {
    renderDashboard();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Admin Dashboard'
      );

      // Check for accessible metric cards
      const metricsRegion = screen.getByText('Total Users').closest('div');
      expect(metricsRegion).toBeInTheDocument();
    });
  });
});
