import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ProductAnalytics from '../ProductAnalytics';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetProductAnalyticsQuery: vi.fn(),
    useGetAdminProductsQuery: vi.fn(),
    useGetProductPerformanceQuery: vi.fn(),
  };
});

// Mock chart components
vi.mock('../../../components/ui/charts/SimpleLineChart', () => ({
  default: ({ data, height, color }) => (
    <div data-testid="line-chart" data-height={height} data-color={color}>
      {data.map((point, index) => (
        <span key={index}>
          {point.label}:{point.value}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('../../../components/ui/charts/SimpleBarChart', () => ({
  default: ({ data, height }) => (
    <div data-testid="bar-chart" data-height={height}>
      {data.map((point, index) => (
        <span key={index}>
          {point.label}:{point.value}
        </span>
      ))}
    </div>
  ),
}));

vi.mock('../../../components/ui/charts/SimplePieChart', () => ({
  default: ({ data, size }) => (
    <div data-testid="pie-chart" data-size={size}>
      {data.map((point, index) => (
        <span key={index}>
          {point.label}:{point.value}%
        </span>
      ))}
    </div>
  ),
}));

// Mock analytics data
const mockAnalyticsData = {
  data: {
    overview: {
      totalProducts: 847,
      activeProducts: 782,
      totalViews: 45280,
      totalOrders: 3420,
      revenue: 125430,
      conversionRate: 7.56,
      averageRating: 4.3,
    },
    trends: {
      viewsTrend: '+12.5%',
      ordersTrend: '+8.3%',
      revenueTrend: '+15.7%',
      conversionTrend: '-2.1%',
    },
  },
};

const mockProductsData = {
  data: {
    products: [
      { id: '1', name: 'Organic Tomatoes', status: 'active' },
      { id: '2', name: 'Fresh Spinach', status: 'active' },
      { id: '3', name: 'Bell Peppers', status: 'active' },
    ],
  },
};

const mockProductPerformanceData = {
  data: {
    views: 1248,
    orders: 89,
    conversionRate: 7.1,
    revenue: 2680,
  },
};

describe('ProductAnalytics', () => {
  const renderProductAnalytics = (
    analyticsResult = {},
    productsResult = {},
    performanceResult = {}
  ) => {
    const defaultAnalyticsResult = {
      data: mockAnalyticsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    const defaultProductsResult = {
      data: mockProductsData,
      isLoading: false,
      error: null,
    };

    const defaultPerformanceResult = {
      data: mockProductPerformanceData,
      isLoading: false,
      error: null,
    };

    apiSlice.useGetProductAnalyticsQuery.mockReturnValue({
      ...defaultAnalyticsResult,
      ...analyticsResult,
    });

    apiSlice.useGetAdminProductsQuery.mockReturnValue({
      ...defaultProductsResult,
      ...productsResult,
    });

    apiSlice.useGetProductPerformanceQuery.mockReturnValue({
      ...defaultPerformanceResult,
      ...performanceResult,
    });

    return renderWithProviders(<ProductAnalytics />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 'admin-1',
            role: 'admin',
            name: 'Admin User',
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

  it('renders analytics dashboard title and description', async () => {
    renderProductAnalytics();

    expect(screen.getByText('Product Analytics')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track product performance, sales metrics, and customer insights'
      )
    ).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderProductAnalytics({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders key metrics cards', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      // Check metric titles
      expect(screen.getByText('Total Products')).toBeInTheDocument();
      expect(screen.getByText('Product Views')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Revenue')).toBeInTheDocument();
      expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
      expect(screen.getByText('Avg. Rating')).toBeInTheDocument();
    });

    // Check metric values (using mock data)
    expect(screen.getByText('847')).toBeInTheDocument();
    expect(screen.getByText('45,280')).toBeInTheDocument();
    expect(screen.getByText('3,420')).toBeInTheDocument();
    expect(screen.getByText('$125,430')).toBeInTheDocument();
    expect(screen.getByText('7.6%')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('displays trend indicators correctly', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      // Check positive trends
      expect(screen.getByText('+12.5%')).toBeInTheDocument();
      expect(screen.getByText('+8.3%')).toBeInTheDocument();
      expect(screen.getByText('+15.7%')).toBeInTheDocument();

      // Check negative trend
      expect(screen.getByText('-2.1%')).toBeInTheDocument();
    });
  });

  it('renders charts correctly', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      // Check for chart components
      expect(screen.getAllByTestId('line-chart')).toHaveLength(2); // Views and Orders trends
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument(); // Categories
    });
  });

  it('allows time range selection', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    renderProductAnalytics({ refetch: mockRefetch });

    await waitFor(() => {
      expect(screen.getByDisplayValue('Last 30 Days')).toBeInTheDocument();
    });

    // Change time range
    const timeRangeSelect = screen.getByDisplayValue('Last 30 Days');
    await user.selectOptions(timeRangeSelect, '7d');

    expect(timeRangeSelect.value).toBe('7d');
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();
    const mockRefetch = vi.fn();
    renderProductAnalytics({ refetch: mockRefetch });

    await waitFor(() => {
      expect(screen.getByText('Refresh')).toBeInTheDocument();
    });

    const refreshButton = screen.getByText('Refresh');
    await user.click(refreshButton);

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('displays top performing products table', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Top Performing Products')).toBeInTheDocument();
      expect(
        screen.getByText('Best selling products this month')
      ).toBeInTheDocument();
    });

    // Check for mock product data in the table
    expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    expect(screen.getByText('Fresh Spinach')).toBeInTheDocument();
    expect(screen.getByText('Bell Peppers')).toBeInTheDocument();
  });

  it('handles individual product performance selection', async () => {
    const user = userEvent.setup();
    renderProductAnalytics();

    await waitFor(() => {
      expect(
        screen.getByText('Individual Product Performance')
      ).toBeInTheDocument();
    });

    // Select a product
    const productSelect = screen.getByDisplayValue(
      'Select a product to analyze'
    );
    await user.selectOptions(productSelect, '1');

    await waitFor(() => {
      expect(screen.getByText('1,248')).toBeInTheDocument(); // Views
      expect(screen.getByText('89')).toBeInTheDocument(); // Orders
      expect(screen.getByText('7.1%')).toBeInTheDocument(); // Conversion rate
    });
  });

  it('shows loading state for individual product performance', async () => {
    const user = userEvent.setup();
    renderProductAnalytics({}, {}, { isLoading: true });

    await waitFor(() => {
      expect(
        screen.getByText('Individual Product Performance')
      ).toBeInTheDocument();
    });

    // Select a product
    const productSelect = screen.getByDisplayValue(
      'Select a product to analyze'
    );
    await user.selectOptions(productSelect, '1');

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('displays insights and recommendations', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      expect(
        screen.getByText('Insights & Recommendations')
      ).toBeInTheDocument();
    });

    // Check for insight categories
    expect(screen.getByText('Growth Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Attention Needed')).toBeInTheDocument();
    expect(screen.getByText('Customer Behavior')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    renderProductAnalytics({
      error: { status: 500, data: { error: 'Server error' } },
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load analytics')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('renders export functionality', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeInTheDocument();
  });

  it('displays chart titles and descriptions', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      expect(screen.getByText('Product Views Trend')).toBeInTheDocument();
      expect(screen.getByText('Orders Trend')).toBeInTheDocument();
      expect(screen.getByText('Top Performing Categories')).toBeInTheDocument();
    });

    // Check descriptions
    expect(screen.getByText('Daily product page views')).toBeInTheDocument();
    expect(screen.getByText('Daily orders placed')).toBeInTheDocument();
    expect(screen.getByText('Orders by category')).toBeInTheDocument();
  });

  it('shows correct chart data attributes', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      const lineCharts = screen.getAllByTestId('line-chart');
      expect(lineCharts[0]).toHaveAttribute('data-height', '250');
      expect(lineCharts[0]).toHaveAttribute('data-color', '#3B82F6');
      expect(lineCharts[1]).toHaveAttribute('data-color', '#10B981');

      const pieChart = screen.getByTestId('pie-chart');
      expect(pieChart).toHaveAttribute('data-size', '280');
    });
  });

  it('renders accessibility features correctly', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Product Analytics'
      );

      // Check form controls have labels
      const timeRangeSelect = screen.getByDisplayValue('Last 30 Days');
      expect(timeRangeSelect).toBeInTheDocument();

      // Check all buttons have proper labels
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach((button) => {
        expect(
          button.textContent ||
            button.getAttribute('title') ||
            button.getAttribute('aria-label')
        ).toBeTruthy();
      });
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderProductAnalytics();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Last 30 Days')).toBeInTheDocument();
    });

    // Test tab navigation
    const timeRangeSelect = screen.getByDisplayValue('Last 30 Days');
    timeRangeSelect.focus();

    await user.tab();

    // Next focusable element should be focused
    expect(document.activeElement).not.toBe(timeRangeSelect);
  });

  it('displays responsive grid layouts', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      // Check that metric cards use responsive grid classes
      const metricsContainer = screen
        .getByText('Total Products')
        .closest('.grid');
      expect(metricsContainer).toHaveClass(
        'grid-cols-1',
        'sm:grid-cols-2',
        'lg:grid-cols-3',
        'xl:grid-cols-6'
      );
    });
  });

  it('shows empty state message when no product selected', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Select a product to view detailed performance metrics'
        )
      ).toBeInTheDocument();
    });
  });

  it('handles chart color theming correctly', async () => {
    renderProductAnalytics();

    await waitFor(() => {
      const lineCharts = screen.getAllByTestId('line-chart');

      // Views chart should be blue
      expect(lineCharts[0]).toHaveAttribute('data-color', '#3B82F6');

      // Orders chart should be green
      expect(lineCharts[1]).toHaveAttribute('data-color', '#10B981');
    });
  });
});
