import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import VendorCustomerManagement from '../VendorCustomerManagement';
import { useGetCustomerAnalyticsQuery } from '../../../store/slices/vendor/vendorDashboardApi';
import {
  useGetCustomerListQuery,
  useExportCustomerDataMutation,
} from '../../../store/slices/vendor/vendorExtensionsApi';

// Mock the API hooks
vi.mock('../../../store/slices/vendor/vendorDashboardApi', () => ({
  useGetCustomerAnalyticsQuery: vi.fn(),
}));

vi.mock('../../../store/slices/vendor/vendorExtensionsApi', () => ({
  useGetCustomerListQuery: vi.fn(),
  useExportCustomerDataMutation: vi.fn(),
}));

const mockCustomerData = {
  data: {
    totalCustomers: 4,
    totalOrders: 134,
    totalRevenue: 356000,
    avgOrderValue: 2657,
  },
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
  },
  token: 'test-token',
};

describe('VendorCustomerManagement', () => {
  const mockExportCustomers = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useGetCustomerAnalyticsQuery.mockReturnValue({
      data: mockCustomerData,
      isLoading: false,
      error: null,
    });

    useGetCustomerListQuery.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    useExportCustomerDataMutation.mockReturnValue([
      mockExportCustomers,
      { isLoading: false },
    ]);

    mockExportCustomers.mockResolvedValue({
      unwrap: () => Promise.resolve(new Blob()),
    });
  });

  describe('Loading and Error States', () => {
    it('shows loading spinner when data is loading', () => {
      useGetCustomerAnalyticsQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error state when data fails to load', () => {
      useGetCustomerAnalyticsQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to load customer data' },
      });

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
  });

  describe('Page Layout and Header', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Customer Management')).toBeInTheDocument();
      expect(
        screen.getByText(/manage relationships with your buyer partners/i)
      ).toBeInTheDocument();
    });

    it('displays export data button', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /export data/i })).toBeInTheDocument();
    });
  });

  describe('Summary Cards', () => {
    it('displays all summary KPI cards', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Total Customers')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();

      expect(screen.getByText('Total Orders')).toBeInTheDocument();
      expect(screen.getByText('134')).toBeInTheDocument();

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      expect(screen.getByText(/356,000/)).toBeInTheDocument();

      expect(screen.getByText('Avg Order Value')).toBeInTheDocument();
      expect(screen.getByText(/2,657/)).toBeInTheDocument();
    });
  });

  describe('Search and Filters', () => {
    it('renders search bar with correct placeholder', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const searchInput = screen.getByPlaceholderText(/search customers/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const searchInput = screen.getByPlaceholderText(/search customers/i);
      await user.type(searchInput, 'golden fork');

      expect(searchInput.value).toBe('golden fork');
    });

    it('displays sort by dropdown', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const sortSelect = screen.getByRole('combobox', { name: /sort/i });
      expect(sortSelect).toBeInTheDocument();
      expect(screen.getByText('Sort by Revenue')).toBeInTheDocument();
      expect(screen.getByText('Sort by Orders')).toBeInTheDocument();
      expect(screen.getByText('Sort by Last Order')).toBeInTheDocument();
    });

    it('displays filter dropdown', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const filterSelect = screen.getAllByRole('combobox')[1];
      expect(filterSelect).toBeInTheDocument();
      expect(screen.getByText('All Customers')).toBeInTheDocument();
      expect(screen.getByText('Top Customers')).toBeInTheDocument();
      expect(screen.getByText('Repeat Customers')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  describe('Customer Table', () => {
    it('renders customer table with correct headers', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Customer')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Total Spent')).toBeInTheDocument();
      expect(screen.getByText('Avg Order')).toBeInTheDocument();
      expect(screen.getByText('Last Order')).toBeInTheDocument();
      expect(screen.getByText('LTV')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('displays customer data correctly', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Golden Fork Buyer')).toBeInTheDocument();
      expect(screen.getByText('info@goldenfork.com')).toBeInTheDocument();
      expect(screen.getByText('48')).toBeInTheDocument();
      expect(screen.getByText(/125,000/)).toBeInTheDocument();
    });

    it('displays customer avatars with initials', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Golden Fork Buyer -> G
      expect(screen.getByText('G')).toBeInTheDocument();
      // Spice Garden -> S
      expect(screen.getByText('S')).toBeInTheDocument();
      // Ocean Blue Bistro -> O
      expect(screen.getByText('O')).toBeInTheDocument();
    });

    it('displays rating stars for each customer', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('4.9')).toBeInTheDocument();
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    it('shows action buttons for each customer', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const viewButtons = screen.getAllByTitle('View Details');
      expect(viewButtons.length).toBeGreaterThan(0);

      const messageButtons = screen.getAllByTitle('Send Message');
      expect(messageButtons.length).toBeGreaterThan(0);
    });

    it('handles view details button click', async () => {
      const user = userEvent.setup();
      global.alert = vi.fn();

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const viewButtons = screen.getAllByTitle('View Details');
      await user.click(viewButtons[0]);

      expect(global.alert).toHaveBeenCalledWith(
        expect.stringContaining('Viewing details for')
      );
    });

    it('handles message button click', async () => {
      const user = userEvent.setup();
      global.alert = vi.fn();

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const messageButtons = screen.getAllByTitle('Send Message');
      await user.click(messageButtons[0]);

      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('Messaging'));
    });
  });

  describe('Top Customers Section', () => {
    it('displays top customers section', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Top Customers')).toBeInTheDocument();
    });

    it('displays top 3 customers with rankings', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    it('shows order count and frequency for top customers', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('48 orders')).toBeInTheDocument();
      expect(screen.getByText('weekly')).toBeInTheDocument();
    });

    it('displays total revenue for top customers', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Total Revenue')).toBeInTheDocument();
      const revenueElements = screen.getAllByText(/125,000|98,000|75,000/);
      expect(revenueElements.length).toBeGreaterThan(0);
    });
  });

  describe('Export Functionality', () => {
    it('exports customer data when export button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockExportCustomers).toHaveBeenCalled();
      });
    });

    it('handles export errors gracefully', async () => {
      const user = userEvent.setup();
      mockExportCustomers.mockRejectedValue({
        data: { message: 'Export failed' },
      });

      global.alert = vi.fn();

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const exportButton = screen.getByRole('button', { name: /export data/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const container = document.querySelector('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });

    it('uses responsive grid for summary cards', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const grid = document.querySelector('.grid');
      expect(grid).toHaveClass('grid-cols-1');
    });
  });

  describe('Design System Compliance', () => {
    it('uses glassmorphism design classes', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const glassElements = document.querySelectorAll('[class*="glass-layer"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('uses organic curves', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const roundedElements = document.querySelectorAll('[class*="rounded-"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('uses brand colors', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      const bodyHTML = document.body.innerHTML;
      expect(bodyHTML).toMatch(/muted-olive|sage-green|bottle-green|mint-fresh/);
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no customers exist', () => {
      useGetCustomerAnalyticsQuery.mockReturnValue({
        data: { data: { totalCustomers: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Table should still render but with 0 customers
      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls customer analytics API', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetCustomerAnalyticsQuery).toHaveBeenCalled();
    });

    it('passes correct period parameter', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetCustomerAnalyticsQuery).toHaveBeenCalledWith(
        expect.objectContaining({ period: 'year' })
      );
    });
  });

  describe('Currency Formatting', () => {
    it('formats currency correctly in BDT', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display formatted currency values
      const formattedAmounts = screen.getAllByText(/BDT|৳/);
      expect(formattedAmounts.length).toBeGreaterThan(0);
    });
  });

  describe('Date Formatting', () => {
    it('displays relative date formatting correctly', () => {
      renderWithProviders(<VendorCustomerManagement />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display "Today", "Yesterday", or "X days ago"
      const dateElements = screen.getAllByText(/Today|Yesterday|days ago/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });
});
