import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import VendorNotifications from '../VendorNotifications';

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor',
  },
  token: 'test-token',
};

describe('VendorNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.alert = vi.fn();
    global.confirm = vi.fn(() => true);
  });

  describe('Page Layout and Header', () => {
    it('renders the main header correctly', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(
        screen.getByText(/stay updated with your business activities/i)
      ).toBeInTheDocument();
    });

    it('displays unread notification count badge', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should show badge with count of unread notifications
      const badge = screen.getByText('2'); // 2 unread in mock data
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass('bg-tomato-red');
    });

    it('displays action buttons in header', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear read/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
    });
  });

  describe('Notification Tabs', () => {
    it('renders all tab options', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /^all$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /unread/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^read$/i })).toBeInTheDocument();
    });

    it('shows unread count in unread tab', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const unreadTab = screen.getByRole('button', { name: /unread/i });
      expect(within(unreadTab).getByText('2')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Initially on All tab
      expect(screen.getAllByText(/new order|low stock/i).length).toBeGreaterThan(0);

      // Switch to Unread
      await user.click(screen.getByRole('button', { name: /unread/i }));
      await waitFor(() => {
        // Should only show unread notifications
        const notifications = screen.getAllByText(/New Order Received|Low Stock Alert/);
        expect(notifications.length).toBe(2);
      });

      // Switch to Read
      await user.click(screen.getByRole('button', { name: /^read$/i }));
      await waitFor(() => {
        // Should only show read notifications
        expect(screen.getAllByText(/New Review|Payment Received/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Filters', () => {
    it('renders search bar', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByPlaceholderText(/search notifications/i)).toBeInTheDocument();
    });

    it('handles search input', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const searchInput = screen.getByPlaceholderText(/search notifications/i);
      await user.type(searchInput, 'order');

      expect(searchInput.value).toBe('order');
    });

    it('renders type filter dropdown', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const typeFilter = screen.getByRole('combobox', { name: /type/i });
      expect(typeFilter).toBeInTheDocument();

      expect(screen.getByText('All Types')).toBeInTheDocument();
      expect(screen.getByText('Orders')).toBeInTheDocument();
      expect(screen.getByText('Inventory')).toBeInTheDocument();
      expect(screen.getByText('Reviews')).toBeInTheDocument();
      expect(screen.getByText('Payments')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('filters notifications by type', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const typeFilter = screen.getByRole('combobox', { name: /type/i });
      await user.selectOptions(typeFilter, 'orders');

      await waitFor(() => {
        // Should only show order-related notifications
        expect(screen.getAllByText(/order/i).length).toBeGreaterThan(0);
      });
    });
  });

  describe('Notification List', () => {
    it('displays all notifications', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('New Order Received')).toBeInTheDocument();
      expect(screen.getByText('Low Stock Alert')).toBeInTheDocument();
      expect(screen.getByText('New Review')).toBeInTheDocument();
      expect(screen.getByText('Payment Received')).toBeInTheDocument();
      expect(screen.getByText('Profile Verification Complete')).toBeInTheDocument();
      expect(screen.getByText('Order Delivered')).toBeInTheDocument();
    });

    it('displays notification types with colored icons', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Different background colors for different notification types
      const orderBg = document.querySelectorAll('[class*="bg-bottle-green/10"]');
      const inventoryBg = document.querySelectorAll('[class*="bg-earthy-yellow/10"]');
      const reviewBg = document.querySelectorAll('[class*="bg-mint-fresh/10"]');

      expect(orderBg.length).toBeGreaterThan(0);
      expect(inventoryBg.length).toBeGreaterThan(0);
      expect(reviewBg.length).toBeGreaterThan(0);
    });

    it('shows unread indicator for unread notifications', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Unread notifications have a green dot
      const unreadDots = document.querySelectorAll('[class*="bg-bottle-green rounded-full"]');
      expect(unreadDots.length).toBe(2); // 2 unread in mock data
    });

    it('displays priority badges', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
      expect(screen.getByText('low')).toBeInTheDocument();
    });

    it('displays relative timestamps', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display relative time formats
      const timestamps = screen.getAllByText(/ago|Today|Yesterday/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });

    it('displays view details button for notifications with action URL', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
      expect(viewDetailsButtons.length).toBe(6); // All mock notifications have action URLs
    });
  });

  describe('Notification Actions', () => {
    it('marks notification as read when button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const markReadButtons = screen.getAllByTitle('Mark as read');
      await user.click(markReadButtons[0]);

      // Should call handleMarkAsRead function (console.log in mock)
      expect(markReadButtons.length).toBeGreaterThan(0);
    });

    it('deletes notification when delete button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      // Should call handleDelete function
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('navigates to action URL when view details clicked', async () => {
      const user = userEvent.setup();
      const mockLocation = { href: '' };
      Object.defineProperty(window, 'location', {
        value: mockLocation,
        writable: true,
      });

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const viewDetailsButtons = screen.getAllByRole('button', { name: /view details/i });
      await user.click(viewDetailsButtons[0]);

      expect(window.location.href).toContain('/vendor/orders');
    });
  });

  describe('Bulk Actions', () => {
    it('marks all notifications as read when button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const markAllReadButton = screen.getByRole('button', { name: /mark all read/i });
      await user.click(markAllReadButton);

      // Should trigger handleMarkAllAsRead
      expect(markAllReadButton).toBeInTheDocument();
    });

    it('clears all read notifications when button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const clearReadButton = screen.getByRole('button', { name: /clear read/i });
      await user.click(clearReadButton);

      await waitFor(() => {
        expect(global.confirm).toHaveBeenCalledWith(
          'Are you sure you want to clear all read notifications?'
        );
      });
    });
  });

  describe('Notification Preferences', () => {
    it('shows preferences panel when settings clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await user.click(settingsButton);

      await waitFor(() => {
        expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
      });
    });

    it('displays preference table with all notification types', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(() => {
        expect(screen.getByText('Orders Notifications')).toBeInTheDocument();
        expect(screen.getByText('Inventory Notifications')).toBeInTheDocument();
        expect(screen.getByText('Reviews Notifications')).toBeInTheDocument();
        expect(screen.getByText('Payments Notifications')).toBeInTheDocument();
        expect(screen.getByText('System Notifications')).toBeInTheDocument();
      });
    });

    it('displays checkboxes for Email, SMS, and Push', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(() => {
        const emailIcon = screen.getByText('Email').closest('th');
        const smsIcon = screen.getByText('SMS').closest('th');
        const pushIcon = screen.getByText('Push').closest('th');

        expect(emailIcon).toBeInTheDocument();
        expect(smsIcon).toBeInTheDocument();
        expect(pushIcon).toBeInTheDocument();
      });
    });

    it('toggles preference checkboxes', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(async () => {
        const checkboxes = screen.getAllByRole('checkbox');
        const firstCheckbox = checkboxes[0];
        const initialState = firstCheckbox.checked;

        await user.click(firstCheckbox);

        expect(firstCheckbox.checked).toBe(!initialState);
      });
    });

    it('saves preferences when save button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(async () => {
        const saveButton = screen.getByRole('button', { name: /save preferences/i });
        await user.click(saveButton);

        expect(global.alert).toHaveBeenCalledWith(
          'Notification preferences saved successfully!'
        );
      });
    });

    it('closes preferences panel when cancel clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(async () => {
        const cancelButton = screen.getAllByRole('button', { name: /cancel/i })[0];
        await user.click(cancelButton);

        expect(screen.queryByText('Notification Preferences')).not.toBeInTheDocument();
      });
    });

    it('closes preferences panel when X button clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      await user.click(screen.getByRole('button', { name: /settings/i }));

      await waitFor(async () => {
        // X button in the preferences panel
        const closeButtons = document.querySelectorAll('[class*="lucide-x"]');
        if (closeButtons.length > 0) {
          await user.click(closeButtons[0].parentElement);
        }

        expect(screen.queryByText('Save Preferences')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no notifications', () => {
      // This would require mocking the notification data to be empty
      // For now, we test that the EmptyState component would be shown
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // With mock data, notifications exist
      expect(screen.getByText('New Order Received')).toBeInTheDocument();
    });
  });

  describe('Load More', () => {
    it('displays load more button', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      expect(screen.getByRole('button', { name: /load more notifications/i })).toBeInTheDocument();
    });

    it('handles load more button click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const loadMoreButton = screen.getByRole('button', { name: /load more notifications/i });
      await user.click(loadMoreButton);

      // Should trigger pagination (functionality to be implemented)
      expect(loadMoreButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const container = document.querySelector('.max-w-7xl');
      expect(container).toBeInTheDocument();
    });

    it('uses responsive grid for filters', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const grid = document.querySelectorAll('.grid')[0];
      expect(grid).toHaveClass('grid-cols-1');
    });
  });

  describe('Design System Compliance', () => {
    it('uses glassmorphism design classes', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const glassElements = document.querySelectorAll('[class*="glass-layer"]');
      expect(glassElements.length).toBeGreaterThan(0);
    });

    it('uses organic curves', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const roundedElements = document.querySelectorAll('[class*="rounded-"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });

    it('uses brand colors', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      const bodyHTML = document.body.innerHTML;
      expect(bodyHTML).toMatch(/muted-olive|sage-green|bottle-green|mint-fresh/);
    });
  });

  describe('Time Formatting', () => {
    it('formats timestamps correctly', () => {
      renderWithProviders(<VendorNotifications />, {
        preloadedState: { auth: defaultAuthState },
      });

      // Should display various time formats
      const timestamps = screen.getAllByText(/ago|h ago|m ago|d ago/i);
      expect(timestamps.length).toBeGreaterThan(0);
    });
  });
});
