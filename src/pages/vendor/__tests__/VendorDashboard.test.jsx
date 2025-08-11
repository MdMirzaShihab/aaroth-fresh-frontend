import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/test-utils';
import VendorDashboard from '../VendorDashboard';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetVendorDashboardQuery: vi.fn(),
  useGetVendorOrdersQuery: vi.fn(),
  useGetVendorAnalyticsQuery: vi.fn()
}));

import {
  useGetVendorDashboardQuery,
  useGetVendorOrdersQuery,
  useGetVendorAnalyticsQuery
} from '../../../store/slices/apiSlice';

const mockDashboardData = {
  data: {
    totalListings: 15,
    activeListings: 12,
    totalOrders: 45,
    totalRevenue: 12500,
    averageRating: 4.2,
    pendingOrders: 3,
    listingsChange: '+15%',
    activeListingsChange: '+8%',
    ordersChange: '+12%',
    revenueChange: '+18%',
    ratingChange: '+0.2',
    pendingOrdersChange: '+1',
    periodRevenue: 12500,
    periodOrders: 45,
    insights: [
      'Your listings have increased by 15% this month',
      'Revenue growth is trending upward'
    ]
  }
};

const mockOrdersData = {
  data: {
    orders: [
      {
        id: 'order_1',
        restaurant: { name: 'Test Restaurant' },
        items: [{ quantity: 2 }],
        totalAmount: 125.50,
        status: 'pending',
        createdAt: '2024-01-01T00:00:00.000Z'
      },
      {
        id: 'order_2',
        restaurant: { name: 'Another Restaurant' },
        items: [{ quantity: 3 }],
        totalAmount: 250.75,
        status: 'confirmed',
        createdAt: '2024-01-02T00:00:00.000Z'
      }
    ]
  }
};

const mockAnalyticsData = {
  data: {
    revenueChart: [
      { date: '2024-01-01', value: 100 },
      { date: '2024-01-02', value: 150 },
      { date: '2024-01-03', value: 200 }
    ],
    ordersChart: [
      { date: '2024-01-01', value: 5 },
      { date: '2024-01-02', value: 8 },
      { date: '2024-01-03', value: 12 }
    ]
  }
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor'
  },
  token: 'test-token'
};

describe('VendorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    useGetVendorDashboardQuery.mockReturnValue({
      data: mockDashboardData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    
    useGetVendorOrdersQuery.mockReturnValue({
      data: mockOrdersData,
      isLoading: false
    });
    
    useGetVendorAnalyticsQuery.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner when dashboard data is loading', async () => {
      useGetVendorDashboardQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error state when dashboard fails to load', async () => {
      const mockRefetch = vi.fn();
      useGetVendorDashboardQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' },
        refetch: mockRefetch
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument();
      expect(screen.getByText('There was an error loading your dashboard data. Please try again.')).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Dashboard Content', () => {
    it('renders welcome message with user name', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Welcome back, Test Vendor!')).toBeInTheDocument();
        expect(screen.getByText('Here\'s what\'s happening with your business today')).toBeInTheDocument();
      });
    });

    it('displays key performance metrics', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        // Check for metric values
        expect(screen.getByText('15')).toBeInTheDocument(); // Total Listings
        expect(screen.getByText('12')).toBeInTheDocument(); // Active Listings
        expect(screen.getByText('45')).toBeInTheDocument(); // Total Orders
        expect(screen.getByText('৳12,500')).toBeInTheDocument(); // Revenue
        expect(screen.getByText('4.2')).toBeInTheDocument(); // Rating
        expect(screen.getByText('3')).toBeInTheDocument(); // Pending Orders
        
        // Check for metric labels
        expect(screen.getByText('Total Listings')).toBeInTheDocument();
        expect(screen.getByText('Active Listings')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('Average Rating')).toBeInTheDocument();
        expect(screen.getByText('Pending Orders')).toBeInTheDocument();
      });
    });

    it('shows percentage changes for metrics', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('+15%')).toBeInTheDocument(); // Listings change
        expect(screen.getByText('+8%')).toBeInTheDocument(); // Active listings change
        expect(screen.getByText('+12%')).toBeInTheDocument(); // Orders change
        expect(screen.getByText('+18%')).toBeInTheDocument(); // Revenue change
      });
    });

    it('displays recent orders section', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Recent Orders')).toBeInTheDocument();
        expect(screen.getByText('Latest orders from customers')).toBeInTheDocument();
        
        // Check for order data
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
        expect(screen.getByText('৳125')).toBeInTheDocument();
        expect(screen.getByText('৳250')).toBeInTheDocument();
      });
    });

    it('shows business insights when available', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Business Insights')).toBeInTheDocument();
        expect(screen.getByText('Your listings have increased by 15% this month')).toBeInTheDocument();
        expect(screen.getByText('Revenue growth is trending upward')).toBeInTheDocument();
      });
    });
  });

  describe('Interactive Elements', () => {
    it('has time range selector', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        const timeRangeSelect = screen.getByDisplayValue('Last 7 Days');
        expect(timeRangeSelect).toBeInTheDocument();
      });
    });

    it('has refresh button', async () => {
      const mockRefetch = vi.fn();
      useGetVendorDashboardQuery.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        expect(refreshButton).toBeInTheDocument();
      });
    });

    it('has quick action buttons', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Manage Listings')).toBeInTheDocument();
        expect(screen.getByText('View Orders')).toBeInTheDocument();
        expect(screen.getByText('View Analytics')).toBeInTheDocument();
        expect(screen.getByText('Edit Profile')).toBeInTheDocument();
        expect(screen.getByText('New Listing')).toBeInTheDocument();
      });
    });
  });

  describe('Charts Integration', () => {
    it('renders revenue trend chart', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
        expect(screen.getByText('Daily revenue over time')).toBeInTheDocument();
      });
    });

    it('renders orders trend chart', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Orders Trend')).toBeInTheDocument();
        expect(screen.getByText('Daily orders received')).toBeInTheDocument();
      });
    });

    it('shows loading state for analytics charts', async () => {
      useGetVendorAnalyticsQuery.mockReturnValue({
        data: null,
        isLoading: true
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        // Should show loading spinners in chart areas
        const loadingElements = screen.getAllByTestId('loading-spinner');
        expect(loadingElements.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no recent orders', async () => {
      useGetVendorOrdersQuery.mockReturnValue({
        data: { data: { orders: [] } },
        isLoading: false
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('No orders yet')).toBeInTheDocument();
        expect(screen.getByText('Your recent orders will appear here')).toBeInTheDocument();
      });
    });

    it('shows default insights when none provided', async () => {
      const dashboardWithoutInsights = {
        data: {
          ...mockDashboardData.data,
          insights: null
        }
      };
      
      useGetVendorDashboardQuery.mockReturnValue({
        data: dashboardWithoutInsights,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        expect(screen.getByText('Great job! Your listings are performing well.')).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Features', () => {
    it('configures polling for dashboard data', () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      expect(useGetVendorDashboardQuery).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          pollingInterval: 30000
        })
      );
    });

    it('configures polling for analytics data', () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      expect(useGetVendorAnalyticsQuery).toHaveBeenCalledWith(
        expect.objectContaining({ timeRange: '7d' }),
        undefined
      );
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', async () => {
      renderWithProviders(<VendorDashboard />, {
        preloadedState: {
          auth: defaultAuthState
        }
      });

      await waitFor(() => {
        // Check for responsive grid classes
        const metricsGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
        expect(metricsGrid).toBeInTheDocument();
      });
    });
  });
});