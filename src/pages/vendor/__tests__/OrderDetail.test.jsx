import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import OrderDetail from '../OrderDetail';

import {
  useGetOrderQuery,
  useGetOrderWorkflowStepsQuery,
  useUpdateOrderStatusWorkflowMutation,
  useUpdateOrderFulfillmentStepMutation,
} from '../../../store/slices/apiSlice';

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockParams = { orderId: 'order_123' };

vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
}));

// Mock API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetOrderQuery: vi.fn(),
  useGetOrderWorkflowStepsQuery: vi.fn(),
  useUpdateOrderStatusWorkflowMutation: vi.fn(),
  useUpdateOrderFulfillmentStepMutation: vi.fn(),
}));

// Mock notification slice
vi.mock('../../../store/slices/notificationSlice', () => ({
  addNotification: vi.fn(),
}));

const mockOrderData = {
  data: {
    id: 'order_123',
    restaurant: {
      name: 'Test Restaurant',
      email: 'test@restaurant.com',
      phone: '+1234567890',
      address: '123 Test Street',
    },
    items: [
      {
        quantity: 2,
        pricePerUnit: 25.5,
        unit: 'kg',
        listing: {
          product: { name: 'Fresh Tomatoes' },
          description: 'Organic red tomatoes',
          images: [{ url: 'https://example.com/tomato.jpg' }],
        },
        discount: 5,
      },
      {
        quantity: 1,
        pricePerUnit: 30.0,
        unit: 'kg',
        listing: {
          product: { name: 'Fresh Carrots' },
          description: 'Organic carrots',
          images: [],
        },
      },
    ],
    totalAmount: 76.5,
    subtotal: 81.0,
    deliveryFee: 50,
    discount: 4.5,
    status: 'confirmed',
    createdAt: '2024-01-15T10:00:00.000Z',
    deliveryAddress: {
      street: '123 Delivery Street',
      city: 'Test City',
      postalCode: '12345',
    },
    paymentMethod: 'cash',
    notes: 'Please deliver fresh vegetables only',
    statusHistory: [
      {
        status: 'pending',
        timestamp: '2024-01-15T10:00:00.000Z',
        notes: 'Order placed',
        updatedBy: 'customer',
      },
      {
        status: 'confirmed',
        timestamp: '2024-01-15T10:15:00.000Z',
        notes: 'Order confirmed by vendor',
        updatedBy: 'vendor',
      },
    ],
  },
};

const mockWorkflowData = {
  data: {
    steps: [
      {
        id: 'verify_order',
        title: 'Verify order details',
        description: 'Check all order information',
        completed: true,
        completedAt: '2024-01-15T10:16:00.000Z',
        notes: 'All details verified',
      },
      {
        id: 'check_inventory',
        title: 'Check inventory availability',
        description: 'Ensure all items are in stock',
        completed: true,
        completedAt: '2024-01-15T10:18:00.000Z',
      },
      {
        id: 'gather_items',
        title: 'Gather all ordered items',
        description: 'Collect items for packaging',
        completed: false,
      },
      {
        id: 'quality_check',
        title: 'Quality inspection',
        description: 'Inspect items for quality',
        completed: false,
      },
    ],
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

describe('OrderDetail', () => {
  const mockUpdateOrderStatus = vi.fn();
  const mockUpdateFulfillmentStep = vi.fn();
  const mockRefetchOrder = vi.fn();
  const mockRefetchWorkflow = vi.fn();
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful API responses
    useGetOrderQuery.mockReturnValue({
      data: mockOrderData,
      isLoading: false,
      error: null,
      refetch: mockRefetchOrder,
    });

    useGetOrderWorkflowStepsQuery.mockReturnValue({
      data: mockWorkflowData,
      isLoading: false,
      refetch: mockRefetchWorkflow,
    });

    useUpdateOrderStatusWorkflowMutation.mockReturnValue([
      mockUpdateOrderStatus,
      { isLoading: false },
    ]);
    useUpdateOrderFulfillmentStepMutation.mockReturnValue([
      mockUpdateFulfillmentStep,
      { isLoading: false },
    ]);

    // Mock successful mutation responses
    mockUpdateOrderStatus.mockResolvedValue({
      unwrap: () => Promise.resolve({}),
    });
    mockUpdateFulfillmentStep.mockResolvedValue({
      unwrap: () => Promise.resolve({}),
    });

    vi.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(
      mockDispatch
    );
  });

  describe('Loading and Error States', () => {
    it('shows loading state when order is loading', () => {
      useGetOrderQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetchOrder,
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    });

    it('shows error state when order fails to load', () => {
      useGetOrderQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' },
        refetch: mockRefetchOrder,
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Failed to load order')).toBeInTheDocument();
      expect(
        screen.getByText(
          'There was an error loading the order details. Please try again.'
        )
      ).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      const backButton = screen.getByRole('button', { name: 'Back to Orders' });
      expect(retryButton).toBeInTheDocument();
      expect(backButton).toBeInTheDocument();
    });

    it('shows order not found when order data is null', () => {
      useGetOrderQuery.mockReturnValue({
        data: { data: null },
        isLoading: false,
        error: null,
        refetch: mockRefetchOrder,
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Order not found')).toBeInTheDocument();
      expect(
        screen.getByText("The order you're looking for doesn't exist.")
      ).toBeInTheDocument();
    });
  });

  describe('Order Header and Navigation', () => {
    it('displays order header with correct information', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Order #order_123')).toBeInTheDocument();
        expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
        expect(screen.getByText(/Placed on/)).toBeInTheDocument();
      });
    });

    it('has back button that navigates to orders page', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      const backButton = screen.getByRole('button', {
        'aria-label': undefined,
      }); // Back arrow button
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/vendor/orders');
    });

    it('shows update status button when order can be updated', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /update status/i })
        ).toBeInTheDocument();
      });
    });

    it('shows refresh button', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /refresh/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Customer Information', () => {
    it('displays restaurant details correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
        expect(screen.getByText('test@restaurant.com')).toBeInTheDocument();
        expect(screen.getByText('+1234567890')).toBeInTheDocument();
      });
    });

    it('displays delivery address correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('123 Delivery Street')).toBeInTheDocument();
        expect(screen.getByText('Test City, 12345')).toBeInTheDocument();
      });
    });

    it('displays order metadata correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('1/15/2024')).toBeInTheDocument(); // Order date
        expect(screen.getByText('2')).toBeInTheDocument(); // Total items
        expect(screen.getByText('cash')).toBeInTheDocument(); // Payment method
      });
    });
  });

  describe('Order Items', () => {
    it('displays all order items correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
        expect(screen.getByText('Fresh Carrots')).toBeInTheDocument();
        expect(screen.getByText('Organic red tomatoes')).toBeInTheDocument();
        expect(screen.getByText('Organic carrots')).toBeInTheDocument();
      });
    });

    it('shows item quantities, units, and prices correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Quantity: 2')).toBeInTheDocument();
        expect(screen.getByText('Quantity: 1')).toBeInTheDocument();
        expect(screen.getByText('Unit: kg')).toBeInTheDocument();
        expect(screen.getByText('Price: ৳25.5')).toBeInTheDocument();
        expect(screen.getByText('Price: ৳30')).toBeInTheDocument();
        expect(screen.getByText('৳51')).toBeInTheDocument(); // 2 * 25.50
        expect(screen.getByText('৳30')).toBeInTheDocument(); // 1 * 30.00
      });
    });

    it('displays discount information when available', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('-5% off')).toBeInTheDocument();
      });
    });

    it('shows order summary with totals', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('৳81')).toBeInTheDocument(); // Subtotal
        expect(screen.getByText('৳50')).toBeInTheDocument(); // Delivery fee
        expect(screen.getByText('-৳4')).toBeInTheDocument(); // Discount
        expect(screen.getByText('৳76')).toBeInTheDocument(); // Total
      });
    });
  });

  describe('Special Instructions', () => {
    it('displays special instructions when present', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Special Instructions')).toBeInTheDocument();
        expect(
          screen.getByText('Please deliver fresh vegetables only')
        ).toBeInTheDocument();
      });
    });

    it('hides special instructions section when notes are empty', async () => {
      const orderWithoutNotes = {
        ...mockOrderData,
        data: { ...mockOrderData.data, notes: null },
      };

      useGetOrderQuery.mockReturnValue({
        data: orderWithoutNotes,
        isLoading: false,
        error: null,
        refetch: mockRefetchOrder,
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(
          screen.queryByText('Special Instructions')
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Order Timeline', () => {
    it('displays order timeline with status history', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Order Timeline')).toBeInTheDocument();
        expect(screen.getByText('Order Confirmation')).toBeInTheDocument();
        expect(screen.getByText('Order Preparation')).toBeInTheDocument();
        expect(screen.getByText('Shipping & Delivery')).toBeInTheDocument();
        expect(screen.getByText('Order Completion')).toBeInTheDocument();
      });
    });

    it('shows status history timestamps and notes', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Order placed')).toBeInTheDocument();
        expect(
          screen.getByText('Order confirmed by vendor')
        ).toBeInTheDocument();
      });
    });

    it('highlights current status correctly', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        // Current status should have different styling
        const confirmedStatus = screen
          .getByText('Order Confirmed')
          .closest('div');
        expect(confirmedStatus).toHaveClass('bg-muted-olive', 'text-white');
      });
    });
  });

  describe('Fulfillment Checklist', () => {
    it('displays workflow steps when available', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Fulfillment Checklist')).toBeInTheDocument();
        expect(screen.getByText('Verify order details')).toBeInTheDocument();
        expect(
          screen.getByText('Check inventory availability')
        ).toBeInTheDocument();
        expect(
          screen.getByText('Gather all ordered items')
        ).toBeInTheDocument();
        expect(screen.getByText('Quality inspection')).toBeInTheDocument();
      });
    });

    it('shows completed steps with timestamps', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('All details verified')).toBeInTheDocument();
        expect(screen.getByText(/Completed:/)).toBeInTheDocument();
      });
    });

    it('allows toggling step completion', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        const incompleteCheckbox = checkboxes.find((cb) => !cb.checked);

        if (incompleteCheckbox) {
          user.click(incompleteCheckbox);
        }
      });

      await waitFor(() => {
        expect(mockUpdateFulfillmentStep).toHaveBeenCalled();
      });
    });
  });

  describe('Status Update Modal', () => {
    it('opens status update modal when update button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        user.click(updateButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Update Order Status')).toBeInTheDocument();
        expect(screen.getByText('Order Prepared')).toBeInTheDocument();
        expect(screen.getByText('Ship Order')).toBeInTheDocument();
      });
    });

    it('shows available status transitions only', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        user.click(updateButton);
      });

      await waitFor(() => {
        // Should not show previous statuses
        expect(screen.queryByText('Confirm Order')).not.toBeInTheDocument();
        // Should show next possible statuses
        expect(screen.getByText('Mark as Prepared')).toBeInTheDocument();
      });
    });

    it('allows adding notes for status update', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        user.click(updateButton);
      });

      await waitFor(() => {
        const notesTextarea = screen.getByPlaceholderText(
          'Add any notes about this status update...'
        );
        user.type(notesTextarea, 'Items prepared and ready');

        expect(notesTextarea.value).toBe('Items prepared and ready');
      });
    });

    it('submits status update with selected status and notes', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(async () => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(updateButton);
      });

      await waitFor(async () => {
        // Select a status
        const preparedRadio = screen.getByRole('radio', { name: /prepared/i });
        await user.click(preparedRadio);

        // Add notes
        const notesTextarea = screen.getByPlaceholderText(
          'Add any notes about this status update...'
        );
        await user.type(notesTextarea, 'Ready for shipping');

        // Submit
        const submitButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockUpdateOrderStatus).toHaveBeenCalledWith({
          id: 'order_123',
          status: 'prepared',
          notes: 'Ready for shipping',
          estimatedTime: undefined,
          deliveryDetails: undefined,
        });
      });
    });
  });

  describe('Quick Actions', () => {
    it('displays quick action buttons', async () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
        expect(screen.getByText('Contact Customer')).toBeInTheDocument();
        expect(screen.getByText('Print Receipt')).toBeInTheDocument();
      });
    });

    it('shows request review button for delivered orders', async () => {
      const deliveredOrder = {
        ...mockOrderData,
        data: { ...mockOrderData.data, status: 'delivered' },
      };

      useGetOrderQuery.mockReturnValue({
        data: deliveredOrder,
        isLoading: false,
        error: null,
        refetch: mockRefetchOrder,
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        expect(screen.getByText('Request Review')).toBeInTheDocument();
      });
    });
  });

  describe('Polling and Real-time Updates', () => {
    it('configures polling for order data', () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetOrderQuery).toHaveBeenCalledWith('order_123', {
        pollingInterval: 30000,
        refetchOnMountOrArgChange: true,
      });
    });

    it('configures polling for workflow steps', () => {
      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(useGetOrderWorkflowStepsQuery).toHaveBeenCalledWith('order_123', {
        pollingInterval: 60000,
        skip: false,
      });
    });

    it('refreshes data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(() => {
        const refreshButton = screen.getByRole('button', { name: /refresh/i });
        user.click(refreshButton);
      });

      await waitFor(() => {
        expect(mockRefetchOrder).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows success notification after successful status update', async () => {
      const user = userEvent.setup();

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Simulate successful status update
      await waitFor(async () => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(updateButton);
      });

      // Select status and submit
      await waitFor(async () => {
        const preparedRadio = screen.getByRole('radio', { name: /prepared/i });
        await user.click(preparedRadio);

        const submitButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('notification/addNotification'),
            payload: expect.objectContaining({
              type: 'success',
              title: 'Order Updated',
            }),
          })
        );
      });
    });

    it('shows error notification when status update fails', async () => {
      const user = userEvent.setup();

      mockUpdateOrderStatus.mockRejectedValue({
        data: { message: 'Update failed' },
      });

      renderWithProviders(<OrderDetail />, {
        preloadedState: { auth: defaultAuthState },
      });

      await waitFor(async () => {
        const updateButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(updateButton);
      });

      await waitFor(async () => {
        const preparedRadio = screen.getByRole('radio', { name: /prepared/i });
        await user.click(preparedRadio);

        const submitButton = screen.getByRole('button', {
          name: /update status/i,
        });
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('notification/addNotification'),
            payload: expect.objectContaining({
              type: 'error',
              title: 'Update Failed',
            }),
          })
        );
      });
    });
  });
});
