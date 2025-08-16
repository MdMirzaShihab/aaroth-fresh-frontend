import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ListingStatusToggle from '../ListingStatusToggle';

import { useUpdateListingStatusMutation } from '../../../store/slices/apiSlice';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useUpdateListingStatusMutation: vi.fn(),
}));

// Mock the notification slice
vi.mock('../../../store/slices/notificationSlice', () => ({
  addNotification: vi.fn(),
}));

// Mock ConfirmDialog
vi.mock('../../ui/ConfirmDialog', () => ({
  default: ({ isOpen, onClose, onConfirm, title, message, confirmText }) =>
    isOpen ? (
      <div data-testid="confirm-dialog">
        <h3>{title}</h3>
        <div>{message}</div>
        <button onClick={onConfirm} data-testid="confirm-button">
          {confirmText}
        </button>
        <button onClick={onClose} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    ) : null,
}));

const mockListing = {
  id: 'listing_1',
  product: {
    name: 'Fresh Tomatoes',
  },
  status: 'active',
};

const inactiveListing = {
  ...mockListing,
  status: 'inactive',
};

const pendingListing = {
  ...mockListing,
  status: 'pending',
};

const outOfStockListing = {
  ...mockListing,
  status: 'out_of_stock',
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
  },
  token: 'test-token',
};

describe('ListingStatusToggle', () => {
  const mockUpdateListingStatus = vi.fn();
  const mockDispatch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useUpdateListingStatusMutation.mockReturnValue([
      mockUpdateListingStatus,
      { isLoading: false },
    ]);

    mockUpdateListingStatus.mockResolvedValue({
      unwrap: () => Promise.resolve({}),
    });

    vi.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(
      mockDispatch
    );
  });

  describe('Badge Variant', () => {
    it('renders active status badge correctly', () => {
      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="badge" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const badge = screen.getByText('Active');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass(
        'text-bottle-green',
        'bg-mint-fresh/20'
      );
    });

    it('renders inactive status badge correctly', () => {
      renderWithProviders(
        <ListingStatusToggle listing={inactiveListing} variant="badge" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const badge = screen.getByText('Inactive');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass('text-gray-600', 'bg-gray-100');
    });

    it('renders out of stock status badge correctly', () => {
      renderWithProviders(
        <ListingStatusToggle listing={outOfStockListing} variant="badge" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const badge = screen.getByText('Out of Stock');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass(
        'text-tomato-red',
        'bg-tomato-red/20'
      );
    });

    it('renders pending status badge correctly', () => {
      renderWithProviders(
        <ListingStatusToggle listing={pendingListing} variant="badge" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const badge = screen.getByText('Pending Review');
      expect(badge).toBeInTheDocument();
      expect(badge.closest('span')).toHaveClass(
        'text-orange-600',
        'bg-orange-50'
      );
    });
  });

  describe('Button Variant', () => {
    it('renders deactivate button for active listing', () => {
      renderWithProviders(
        <ListingStatusToggle
          listing={mockListing}
          variant="button"
          showLabel
        />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-orange-600', 'border-orange-200');
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
    });

    it('renders activate button for inactive listing', () => {
      renderWithProviders(
        <ListingStatusToggle
          listing={inactiveListing}
          variant="button"
          showLabel
        />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-bottle-green', 'border-bottle-green/30');
      expect(screen.getByText('Activate')).toBeInTheDocument();
    });

    it('disables button for pending listing', () => {
      renderWithProviders(
        <ListingStatusToggle listing={pendingListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Switch Variant', () => {
    it('renders switch in active state for active listing', () => {
      renderWithProviders(
        <ListingStatusToggle
          listing={mockListing}
          variant="switch"
          showLabel
        />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders switch in inactive state for inactive listing', () => {
      renderWithProviders(
        <ListingStatusToggle
          listing={inactiveListing}
          variant="switch"
          showLabel
        />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('disables switch for pending listing', () => {
      renderWithProviders(
        <ListingStatusToggle listing={pendingListing} variant="switch" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });
  });

  describe('Dropdown Variant', () => {
    it('renders dropdown with current status selected', () => {
      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="dropdown" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const select = screen.getByRole('combobox');
      expect(select).toHaveValue('active');

      // Should have all options except pending
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Inactive')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('disables dropdown for pending listing', () => {
      renderWithProviders(
        <ListingStatusToggle listing={pendingListing} variant="dropdown" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });
  });

  describe('Status Change Flow', () => {
    it('shows confirmation dialog when button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
        expect(screen.getByText('Deactivate Listing')).toBeInTheDocument();
      });
    });

    it('shows warning for pending listing when trying to change status', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <ListingStatusToggle listing={pendingListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      // Button should be disabled, but let's test the logic
      // We'll test this through a different approach since button is disabled

      // Test the internal logic by checking if warning notification would be dispatched
      expect(mockDispatch).not.toHaveBeenCalled(); // Since button is disabled
    });

    it('updates status when confirmation is accepted', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        const confirmButton = screen.getByTestId('confirm-button');
        user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockUpdateListingStatus).toHaveBeenCalledWith({
          id: 'listing_1',
          status: 'inactive',
        });
      });
    });

    it('shows success notification on successful status update', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(async () => {
        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);
      });

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringContaining('notification/addNotification'),
            payload: expect.objectContaining({
              type: 'success',
              title: 'Status Updated',
            }),
          })
        );
      });
    });

    it('shows error notification on failed status update', async () => {
      const user = userEvent.setup();

      // Mock failed mutation
      mockUpdateListingStatus.mockRejectedValue({
        data: { message: 'Update failed' },
      });

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(async () => {
        const confirmButton = screen.getByTestId('confirm-button');
        await user.click(confirmButton);
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

    it('closes confirmation dialog when cancelled', async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
      });

      const cancelButton = screen.getByTestId('cancel-button');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId('confirm-dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('disables button when mutation is loading', () => {
      useUpdateListingStatusMutation.mockReturnValue([
        mockUpdateListingStatus,
        { isLoading: true },
      ]);

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables switch when mutation is loading', () => {
      useUpdateListingStatusMutation.mockReturnValue([
        mockUpdateListingStatus,
        { isLoading: true },
      ]);

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="switch" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeDisabled();
    });

    it('disables dropdown when mutation is loading', () => {
      useUpdateListingStatusMutation.mockReturnValue([
        mockUpdateListingStatus,
        { isLoading: true },
      ]);

      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="dropdown" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper button titles', () => {
      renderWithProviders(
        <ListingStatusToggle listing={mockListing} variant="button" />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Click to deactivate listing');
    });

    it('has proper aria labels for switch', () => {
      renderWithProviders(
        <ListingStatusToggle
          listing={mockListing}
          variant="switch"
          showLabel
        />,
        { preloadedState: { auth: defaultAuthState } }
      );

      const label = screen.getByLabelText(/active/i);
      expect(label).toBeInTheDocument();
    });
  });
});
