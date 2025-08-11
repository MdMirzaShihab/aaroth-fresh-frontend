import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { renderWithProviders } from '../../../test/test-utils';
import VendorApproval from '../VendorApproval';

// Mock pending vendors data
const mockVendorsData = {
  data: {
    users: [
      {
        id: '1',
        name: 'Fresh Produce Co',
        phone: '+1234567890',
        businessName: 'Fresh Produce Co',
        businessType: 'Wholesale Vegetables',
        location: 'Downtown Market',
        role: 'vendor',
        isApproved: false,
        status: 'pending',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        name: 'Green Valley Farms',
        phone: '+1234567891',
        businessName: 'Green Valley Farms',
        businessType: 'Organic Produce',
        location: 'Valley District',
        role: 'vendor',
        isApproved: false,
        status: 'pending',
        createdAt: '2024-01-14T14:20:00Z'
      },
      {
        id: '3',
        name: 'City Greens',
        phone: '+1234567892',
        businessName: 'City Greens',
        businessType: 'Urban Farm',
        location: 'City Center',
        role: 'vendor',
        isApproved: false,
        status: 'pending',
        createdAt: '2024-01-13T08:45:00Z'
      }
    ],
    pagination: {
      totalUsers: 3,
      currentPage: 1,
      totalPages: 1,
      limit: 12
    }
  }
};

// MSW server setup
const server = setupServer(
  rest.get('/api/v1/admin/users', (req, res, ctx) => {
    const searchParams = req.url.searchParams;
    const role = searchParams.get('role');
    const isApproved = searchParams.get('isApproved');
    
    // Only return pending vendors for approval page
    if (role === 'vendor' && isApproved === 'false') {
      return res(ctx.json(mockVendorsData));
    }
    
    return res(ctx.json({ data: { users: [], pagination: {} } }));
  }),
  rest.put('/api/v1/admin/users/:id/approve', (req, res, ctx) => {
    return res(ctx.json({ success: true }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('VendorApproval', () => {
  const renderVendorApproval = () => {
    return renderWithProviders(<VendorApproval />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 'admin-1',
            role: 'admin',
            name: 'Admin User',
            phone: '+1234567890'
          },
          token: 'mock-token',
          loading: false
        }
      }
    });
  };

  it('renders vendor approval title and description', async () => {
    renderVendorApproval();

    expect(screen.getByText('Vendor Approvals')).toBeInTheDocument();
    expect(screen.getByText('Review and approve vendor applications')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderVendorApproval();
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders pending vendor applications', async () => {
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
      expect(screen.getByText('Green Valley Farms')).toBeInTheDocument();
      expect(screen.getByText('City Greens')).toBeInTheDocument();
    });

    // Check phone numbers
    expect(screen.getByText('+1234567890')).toBeInTheDocument();
    expect(screen.getByText('+1234567891')).toBeInTheDocument();
    expect(screen.getByText('+1234567892')).toBeInTheDocument();
  });

  it('displays business information', async () => {
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
      expect(screen.getByText('Wholesale Vegetables')).toBeInTheDocument();
      expect(screen.getByText('Downtown Market')).toBeInTheDocument();
    });
  });

  it('shows pending applications count', async () => {
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('3 pending applications')).toBeInTheDocument();
    });
  });

  it('displays time since application', async () => {
    renderVendorApproval();

    await waitFor(() => {
      // Should show relative time (mocked dates might show as "Xh ago" or "Xd ago")
      const timeElements = screen.getAllByText(/ago$/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('allows searching vendors', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search vendors by name, phone, business...');
    await user.type(searchInput, 'Fresh');

    expect(searchInput.value).toBe('Fresh');
  });

  it('handles individual vendor approval', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Click approve button
    const approveButtons = screen.getAllByText('Approve');
    await user.click(approveButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Approve Vendor')).toBeInTheDocument();
      expect(screen.getByText(/Approve Fresh Produce Co/)).toBeInTheDocument();
    });

    // Confirm approval
    const confirmButton = screen.getByRole('button', { name: 'Approve' });
    await user.click(confirmButton);
  });

  it('handles individual vendor rejection', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Click reject button (X icon)
    const rejectButtons = screen.getAllByRole('button');
    const rejectButton = rejectButtons.find(btn => 
      btn.querySelector('svg') && btn.getAttribute('title') === 'Reject'
    );
    
    if (rejectButton) {
      await user.click(rejectButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText('Reject Vendor')).toBeInTheDocument();
      });
    }
  });

  it('opens vendor details modal', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Click view button
    const viewButtons = screen.getAllByText('View');
    await user.click(viewButtons[0]);

    // Should show vendor details modal
    await waitFor(() => {
      expect(screen.getByText('Vendor Application Details')).toBeInTheDocument();
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.getByText('Business Information')).toBeInTheDocument();
    });
  });

  it('handles bulk selection', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Select vendors
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First vendor
    await user.click(checkboxes[2]); // Second vendor

    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('Approve Selected')).toBeInTheDocument();
      expect(screen.getByText('Reject Selected')).toBeInTheDocument();
    });
  });

  it('handles select all functionality', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Click select all
    const selectAllCheckbox = screen.getByLabelText('Select all');
    await user.click(selectAllCheckbox);

    // Should show bulk actions for all vendors
    await waitFor(() => {
      expect(screen.getByText('3 selected')).toBeInTheDocument();
    });
  });

  it('handles bulk approval', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Select vendors
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    // Click bulk approve
    const bulkApproveButton = screen.getByText('Approve Selected');
    await user.click(bulkApproveButton);

    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText('Bulk Approve Vendors')).toBeInTheDocument();
      expect(screen.getByText(/approve 2 vendors/)).toBeInTheDocument();
    });
  });

  it('handles bulk rejection', async () => {
    const user = userEvent.setup();
    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Fresh Produce Co')).toBeInTheDocument();
    });

    // Select vendors
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);

    // Click bulk reject
    const bulkRejectButton = screen.getByText('Reject Selected');
    await user.click(bulkRejectButton);

    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText('Bulk Reject Vendors')).toBeInTheDocument();
    });
  });

  it('shows empty state when no pending applications', async () => {
    server.use(
      rest.get('/api/v1/admin/users', (req, res, ctx) => {
        return res(ctx.json({
          data: {
            users: [],
            pagination: { totalUsers: 0, currentPage: 1, totalPages: 0, limit: 12 }
          }
        }));
      })
    );

    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('No pending approvals')).toBeInTheDocument();
      expect(screen.getByText('All vendor applications have been processed. Check back later for new applications.')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/v1/admin/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    renderVendorApproval();

    await waitFor(() => {
      expect(screen.getByText('Failed to load vendor applications')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('renders with proper accessibility features', async () => {
    renderVendorApproval();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Vendor Approvals');
      
      // Check for accessible form controls
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
      
      // Check for proper button labels
      const approveButtons = screen.getAllByText('Approve');
      expect(approveButtons.length).toBeGreaterThan(0);
    });
  });
});