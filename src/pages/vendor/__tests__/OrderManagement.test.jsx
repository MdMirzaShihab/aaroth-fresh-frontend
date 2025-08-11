import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import OrderManagement from '../OrderManagement';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetVendorOrdersQuery: vi.fn(),
  useGetVendorOrderAnalyticsQuery: vi.fn(),
  useGetOrderNotificationsQuery: vi.fn(),
  useUpdateOrderStatusWorkflowMutation: vi.fn(),
  useBulkUpdateOrderStatusMutation: vi.fn(),
  useMarkNotificationAsReadMutation: vi.fn()
}));

// Mock notification slice
vi.mock('../../../store/slices/notificationSlice', () => ({
  addNotification: vi.fn()
}));

import {
  useGetVendorOrdersQuery,
  useGetVendorOrderAnalyticsQuery,
  useGetOrderNotificationsQuery,
  useUpdateOrderStatusWorkflowMutation,
  useBulkUpdateOrderStatusMutation,
  useMarkNotificationAsReadMutation
} from '../../../store/slices/apiSlice';

const mockOrdersData = {
  data: {
    orders: [
      {
        id: 'order_1',
        restaurant: {
          name: 'Test Restaurant',
          email: 'test@restaurant.com',
          phone: '+1234567890',
          address: '123 Test St'
        },
        items: [
          {
            quantity: 2,
            pricePerUnit: 25.50,
            unit: 'kg',
            listing: {
              product: { name: 'Fresh Tomatoes' },
              description: 'Organic tomatoes',
              images: [{ url: 'tomato.jpg' }]
            }
          }
        ],
        totalAmount: 51.00,
        status: 'pending',
        createdAt: '2024-01-15T10:00:00.000Z',
        deliveryAddress: {
          street: '123 Test St',
          city: 'Test City',
          postalCode: '12345'
        },
        paymentMethod: 'cash'
      },
      {
        id: 'order_2',
        restaurant: {
          name: 'Another Restaurant',
          email: 'another@restaurant.com',
          phone: '+0987654321',
          address: '456 Another St'
        },
        items: [
          {
            quantity: 1,
            pricePerUnit: 30.00,
            unit: 'kg',
            listing: {
              product: { name: 'Fresh Carrots' },
              description: 'Organic carrots',
              images: []
            }
          }
        ],
        totalAmount: 30.00,
        status: 'confirmed',
        createdAt: '2024-01-15T11:00:00.000Z',
        deliveryAddress: {
          street: '456 Another St',
          city: 'Test City',
          postalCode: '12346'
        },
        paymentMethod: 'card'
      }
    ],
    pagination: {
      current: 1,
      totalPages: 1,
      totalOrders: 2
    }
  }
};

const mockAnalyticsData = {
  data: {
    totalOrders: 45,
    pendingOrders: 3,
    activeOrders: 12,
    totalRevenue: 12500,
    ordersChange: '+15%',
    pendingChange: '+1',
    activeChange: '+8%',
    revenueChange: '+18%'
  }
};

const mockNotificationsData = {
  data: {
    notifications: [
      {
        id: 'notif_1',
        type: 'new_order',
        title: 'New Order Received',
        message: 'Order #12345 has been placed by Test Restaurant',
        read: false,
        createdAt: '2024-01-15T12:00:00.000Z'
      }
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

describe('OrderManagement', () => {
  const mockUpdateOrderStatus = vi.fn();
  const mockBulkUpdateOrderStatus = vi.fn();
  const mockMarkNotificationAsRead = vi.fn();
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful API responses
    useGetVendorOrdersQuery.mockReturnValue({
      data: mockOrdersData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });
    
    useGetVendorOrderAnalyticsQuery.mockReturnValue({
      data: mockAnalyticsData,
      isLoading: false
    });
    
    useGetOrderNotificationsQuery.mockReturnValue({
      data: mockNotificationsData,
      isLoading: false
    });
    
    useUpdateOrderStatusWorkflowMutation.mockReturnValue([mockUpdateOrderStatus, { isLoading: false }]);
    useBulkUpdateOrderStatusMutation.mockReturnValue([mockBulkUpdateOrderStatus, { isLoading: false }]);
    useMarkNotificationAsReadMutation.mockReturnValue([mockMarkNotificationAsRead, { isLoading: false }]);
    
    // Mock successful mutation responses
    mockUpdateOrderStatus.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockBulkUpdateOrderStatus.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockMarkNotificationAsRead.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    
    vi.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
  });

  describe('Loading and Error States', () => {
    it('shows loading state when orders are loading', () => {
      useGetVendorOrdersQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Loading orders...')).toBeInTheDocument();
    });

    it('shows error state when orders fail to load', () => {
      const mockRefetch = vi.fn();
      useGetVendorOrdersQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' },
        refetch: mockRefetch
      });

      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
      expect(screen.getByText('There was an error loading your order data. Please try again.')).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Page Layout and Header', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Order Management')).toBeInTheDocument();
      expect(screen.getByText('Manage your orders, track fulfillment, and optimize delivery')).toBeInTheDocument();
    });

    it('displays analytics summary cards', async () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument(); // Total Orders
        expect(screen.getByText('3')).toBeInTheDocument(); // Pending Orders
        expect(screen.getByText('12')).toBeInTheDocument(); // Active Orders
        expect(screen.getByText('৳12,500')).toBeInTheDocument(); // Revenue
        
        // Check for percentage changes
        expect(screen.getByText('+15%')).toBeInTheDocument();
        expect(screen.getByText('+1')).toBeInTheDocument();
        expect(screen.getByText('+8%')).toBeInTheDocument();
        expect(screen.getByText('+18%')).toBeInTheDocument();
      });
    });

    it('shows notification badge when notifications exist', async () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const notificationBadge = document.querySelector('[class*="bg-tomato-red"]');
        expect(notificationBadge).toBeInTheDocument();
      });
    });
  });

  describe('Search and Filters', () => {
    it('renders search bar with correct placeholder', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const searchInput = screen.getByPlaceholderText('Search orders by restaurant name, order ID...');
      expect(searchInput).toBeInTheDocument();
    });

    it('handles search input changes', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const searchInput = screen.getByPlaceholderText('Search orders by restaurant name, order ID...');
      await user.type(searchInput, 'test restaurant');
      
      expect(searchInput.value).toBe('test restaurant');
    });

    it('shows/hides filters when toggle is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      
      // Filters should be hidden initially
      expect(screen.queryByText('Sort By')).not.toBeInTheDocument();
      
      // Click to show filters
      await user.click(filtersButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sort By')).toBeInTheDocument();
        expect(screen.getByText('Sort Order')).toBeInTheDocument();
      });
    });

    it('has time range selector', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const timeRangeSelect = screen.getByDisplayValue('Last 7 Days');
      expect(timeRangeSelect).toBeInTheDocument();
      
      expect(screen.getByText('Last 30 Days')).toBeInTheDocument();
      expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
    });

    it('has action buttons (refresh, export)', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
    });
  });

  describe('Orders Display', () => {
    it('renders orders in desktop table view', async () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Order ID')).toBeInTheDocument();
        expect(screen.getByText('Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Items')).toBeInTheDocument();
        expect(screen.getByText('Amount')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
        
        // Check order data
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Another Restaurant')).toBeInTheDocument();
        expect(screen.getByText('৳51')).toBeInTheDocument();
        expect(screen.getByText('৳30')).toBeInTheDocument();
        expect(screen.getByText('2 items')).toBeInTheDocument();
        expect(screen.getByText('1 items')).toBeInTheDocument();
      });
    });

    it('shows order status badges correctly', async () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Should show status badges
        expect(screen.getByText('Pending')).toBeInTheDocument();
        expect(screen.getByText('Confirmed')).toBeInTheDocument();
      });
    });

    it('renders mobile card view on small screens', async () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Check for mobile-specific elements
        const mobileCards = document.querySelector('.lg\\:hidden');
        expect(mobileCards).toBeInTheDocument();
      });
    });
  });

  describe('Order Selection and Bulk Actions', () => {
    it('allows selecting individual orders', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes.length).toBeGreaterThan(0);
      });
      
      const firstOrderCheckbox = screen.getAllByRole('checkbox')[1]; // Skip select all
      await user.click(firstOrderCheckbox);
      
      // Should show bulk actions
      await waitFor(() => {
        expect(screen.getByText(/1 orders selected/)).toBeInTheDocument();
      });
    });

    it('allows selecting all orders', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
        user.click(selectAllCheckbox);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/2 orders selected/)).toBeInTheDocument();
      });
    });

    it('shows bulk action buttons when orders are selected', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const firstOrderCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstOrderCheckbox);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Mark as confirmed')).toBeInTheDocument();
        expect(screen.getByText('Mark as prepared')).toBeInTheDocument();
        expect(screen.getByText('Mark as shipped')).toBeInTheDocument();
      });
    });

    it('can clear selection', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Select an order first
      await waitFor(() => {
        const firstOrderCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstOrderCheckbox);
      });
      
      // Clear selection
      await waitFor(() => {
        const clearButton = screen.getByText('Clear selection');
        user.click(clearButton);
      });
      
      // Bulk actions should be hidden
      await waitFor(() => {
        expect(screen.queryByText(/orders selected/)).not.toBeInTheDocument();
      });
    });
  });

  describe('Order Status Updates', () => {
    it('calls update mutation when bulk status update is triggered', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Select an order
      await waitFor(() => {
        const firstOrderCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstOrderCheckbox);
      });
      
      // Click bulk update
      await waitFor(() => {
        const confirmButton = screen.getByText('Mark as confirmed');
        user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockBulkUpdateOrderStatus).toHaveBeenCalledWith({
          orderIds: ['order_1'],
          status: 'confirmed',
          notes: 'Bulk updated to confirmed'
        });
      });
    });

    it('shows success notification after successful bulk update', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const firstOrderCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstOrderCheckbox);
      });
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Mark as confirmed');
        user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('notification/addNotification'),
          payload: expect.objectContaining({
            type: 'success',
            title: 'Bulk Update Successful'
          })
        }));
      });
    });

    it('handles bulk update errors gracefully', async () => {
      const user = userEvent.setup();
      
      mockBulkUpdateOrderStatus.mockRejectedValue({
        data: { message: 'Update failed' }
      });
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const firstOrderCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstOrderCheckbox);
      });
      
      await waitFor(() => {
        const confirmButton = screen.getByText('Mark as confirmed');
        user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('notification/addNotification'),
          payload: expect.objectContaining({
            type: 'error',
            title: 'Bulk Update Failed'
          })
        }));
      });
    });
  });

  describe('Export Functionality', () => {
    it('exports orders data when export button is clicked', async () => {
      const user = userEvent.setup();
      
      // Mock URL.createObjectURL and createElement
      global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
      global.URL.revokeObjectURL = vi.fn();
      const mockClick = vi.fn();
      const mockAElement = { href: '', download: '', click: mockClick };
      vi.spyOn(document, 'createElement').mockReturnValue(mockAElement);
      
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const exportButton = screen.getByRole('button', { name: /export/i });
      await user.click(exportButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
        expect(mockClick).toHaveBeenCalled();
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('notification/addNotification'),
          payload: expect.objectContaining({
            type: 'success',
            title: 'Export Complete'
          })
        }));
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no orders exist', () => {
      useGetVendorOrdersQuery.mockReturnValue({
        data: {
          data: {
            orders: [],
            pagination: { current: 1, totalPages: 0, totalOrders: 0 }
          }
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('No orders yet')).toBeInTheDocument();
      expect(screen.getByText('Your orders will appear here once customers start placing them.')).toBeInTheDocument();
    });

    it('shows no results message during search with no results', async () => {
      const user = userEvent.setup();
      
      useGetVendorOrdersQuery.mockReturnValue({
        data: {
          data: {
            orders: [],
            pagination: { current: 1, totalPages: 0, totalOrders: 0 }
          }
        },
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Perform search
      const searchInput = screen.getByPlaceholderText('Search orders by restaurant name, order ID...');
      await user.type(searchInput, 'nonexistent');

      await waitFor(() => {
        expect(screen.getByText('No orders match your search')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile-first design', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Check for desktop table (hidden on mobile)
      const desktopTable = document.querySelector('.hidden.lg\\:block');
      expect(desktopTable).toBeInTheDocument();
      
      // Check for mobile cards (hidden on desktop)
      const mobileCards = document.querySelector('.lg\\:hidden');
      expect(mobileCards).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('calls API with correct initial parameters', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(useGetVendorOrdersQuery).toHaveBeenCalledWith({
        page: 1,
        limit: 15,
        search: undefined,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        timeRange: '7d'
      });
    });

    it('polls for analytics data', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(useGetVendorOrderAnalyticsQuery).toHaveBeenCalledWith({ timeRange: '7d' });
    });

    it('polls for notifications', () => {
      renderWithProviders(<OrderManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(useGetOrderNotificationsQuery).toHaveBeenCalled();
    });
  });
});