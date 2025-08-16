import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../../../test/test-utils';
import UserManagement from '../UserManagement';

// Mock users data
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
      {
        id: '2',
        name: 'Jane Restaurant',
        phone: '+1234567891',
        role: 'restaurantOwner',
        isApproved: true,
        status: 'active',
        createdAt: '2024-01-08T15:30:00Z',
      },
      {
        id: '3',
        name: 'Mike Manager',
        phone: '+1234567892',
        role: 'restaurantManager',
        isApproved: true,
        status: 'active',
        createdAt: '2024-01-05T09:15:00Z',
      },
    ],
    pagination: {
      totalUsers: 3,
      currentPage: 1,
      totalPages: 1,
      limit: 10,
    },
  },
};

// MSW server setup
const server = setupServer(
  rest.get('/api/v1/admin/users', (req, res, ctx) => {
    return res(ctx.json(mockUsersData));
  }),
  rest.put('/api/v1/admin/users/:id/approve', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  rest.delete('/api/v1/admin/users/:id', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  rest.post('/api/v1/admin/users/bulk-approve', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  }),
  rest.post('/api/v1/admin/users/bulk-delete', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('UserManagement', () => {
  const renderUserManagement = () => {
    return renderWithProviders(<UserManagement />, {
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

  it('renders user management title and description', async () => {
    renderUserManagement();

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage users, approvals, and permissions across the platform'
      )
    ).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderUserManagement();

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders user table with correct data', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
      expect(screen.getByText('Jane Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Mike Manager')).toBeInTheDocument();
    });

    // Check phone numbers
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('+1234567891')).toBeInTheDocument();
  });

  it('displays correct role badges', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Vendor')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Owner')).toBeInTheDocument();
      expect(screen.getByText('Restaurant Manager')).toBeInTheDocument();
    });
  });

  it('displays correct status badges', async () => {
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getAllByText('Active')).toHaveLength(2);
    });
  });

  it('allows searching users', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search users by name, phone...'
    );
    await user.type(searchInput, 'John');

    // Should trigger search (debounced)
    await waitFor(() => {
      expect(searchInput.value).toBe('John');
    });
  });

  it('allows filtering by role', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    const roleFilter = screen.getByDisplayValue('All Roles');
    await user.selectOptions(roleFilter, 'vendor');

    expect(roleFilter.value).toBe('vendor');
  });

  it('allows filtering by status', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    const statusFilter = screen.getByDisplayValue('All Status');
    await user.selectOptions(statusFilter, 'pending');

    expect(statusFilter.value).toBe('pending');
  });

  it('handles individual user approval', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    // Click approve button for pending vendor
    const approveButtons = screen.getAllByTitle('Approve user');
    await user.click(approveButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Approve Vendor')).toBeInTheDocument();
      expect(
        screen.getByText(/Are you sure you want to approve/)
      ).toBeInTheDocument();
    });

    // Confirm approval
    const confirmButton = screen.getByText('Approve');
    await user.click(confirmButton);

    // Should call approve API
    await waitFor(() => {
      expect(screen.queryByText('Approve Vendor')).not.toBeInTheDocument();
    });
  });

  it('handles individual user rejection', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    // Click reject button for pending vendor
    const rejectButtons = screen.getAllByTitle('Reject user');
    await user.click(rejectButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Reject Vendor')).toBeInTheDocument();
    });
  });

  it('handles user deletion', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete user');
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Delete User')).toBeInTheDocument();
      expect(screen.getByText(/permanently delete/)).toBeInTheDocument();
    });
  });

  it('handles bulk selection', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    // Select all users
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument();
      expect(screen.getByText('Bulk Approve')).toBeInTheDocument();
      expect(screen.getByText('Bulk Reject')).toBeInTheDocument();
      expect(screen.getByText('Bulk Delete')).toBeInTheDocument();
    });
  });

  it('handles bulk approve action', async () => {
    const user = userEvent.setup();
    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('John Vendor')).toBeInTheDocument();
    });

    // Select some users
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First user checkbox
    await user.click(checkboxes[2]); // Second user checkbox

    // Click bulk approve
    const bulkApproveButton = screen.getByText('Bulk Approve');
    await user.click(bulkApproveButton);

    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText('Bulk Approve Users')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/v1/admin/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('prevents admin from deleting themselves', async () => {
    const adminUserData = {
      data: {
        users: [
          {
            id: 'admin-1', // Same as current user
            name: 'Admin User',
            phone: '+1234567890',
            role: 'admin',
            isApproved: true,
            status: 'active',
            createdAt: '2024-01-10T10:00:00Z',
          },
        ],
        pagination: {
          totalUsers: 1,
          currentPage: 1,
          totalPages: 1,
          limit: 10,
        },
      },
    };

    server.use(
      rest.get('/api/v1/admin/users', (req, res, ctx) => {
        return res(ctx.json(adminUserData));
      })
    );

    renderUserManagement();

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    // Should not show delete button for current admin user
    expect(screen.queryByTitle('Delete user')).not.toBeInTheDocument();
  });

  it('renders accessibility features correctly', async () => {
    renderUserManagement();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'User Management'
      );

      // Check for accessible form controls
      expect(screen.getByLabelText(/search users/i)).toBeInTheDocument();

      // Check table has proper structure
      expect(screen.getByRole('table')).toBeInTheDocument();
    });
  });
});
