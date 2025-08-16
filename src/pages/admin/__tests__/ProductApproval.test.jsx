import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ProductApproval from '../ProductApproval';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminProductsQuery: vi.fn(),
    useUpdateAdminProductMutation: vi.fn(),
    useBulkUpdateProductsMutation: vi.fn(),
  };
});

// Mock pending products data
const mockPendingProductsData = {
  data: {
    products: [
      {
        id: '1',
        name: 'Organic Cherry Tomatoes',
        description: 'Sweet and juicy cherry tomatoes from organic farm',
        category: 'cat-1',
        categoryName: 'Vegetables',
        unit: 'lb',
        basePrice: 5.99,
        status: 'pending',
        images: [
          {
            id: 'img-1',
            url: 'https://example.com/cherry-tomatoes.jpg',
            alt: 'Cherry Tomatoes',
            isPrimary: true,
          },
        ],
        vendor: {
          id: 'vendor-1',
          name: 'Green Valley Farm',
          businessName: 'Green Valley Organic Farm',
          phone: '+1234567890',
        },
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        name: 'Fresh Basil',
        description: 'Aromatic fresh basil leaves',
        category: 'cat-2',
        categoryName: 'Herbs',
        unit: 'bunch',
        basePrice: 2.99,
        status: 'pending',
        images: [],
        vendor: {
          id: 'vendor-2',
          name: 'Herb Garden Co',
          phone: '+1234567891',
        },
        createdAt: '2024-01-14T15:30:00Z',
        updatedAt: '2024-01-14T15:30:00Z',
      },
    ],
    pagination: {
      totalProducts: 2,
      currentPage: 1,
      totalPages: 1,
      limit: 12,
    },
  },
};

describe('ProductApproval', () => {
  const renderProductApproval = (queryResult = {}) => {
    const defaultResult = {
      data: mockPendingProductsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    apiSlice.useGetAdminProductsQuery.mockReturnValue({
      ...defaultResult,
      ...queryResult,
    });

    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);

    return renderWithProviders(<ProductApproval />, {
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

  it('renders approval queue title and description', async () => {
    renderProductApproval();

    expect(screen.getByText('Product Approval Queue')).toBeInTheDocument();
    expect(
      screen.getByText('Review and approve product submissions from vendors')
    ).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderProductApproval({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders pending products with correct information', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Check product names
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Fresh Basil')).toBeInTheDocument();
    });

    // Check descriptions
    expect(
      screen.getByText('Sweet and juicy cherry tomatoes from organic farm')
    ).toBeInTheDocument();
    expect(screen.getByText('Aromatic fresh basil leaves')).toBeInTheDocument();

    // Check vendors
    expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
    expect(screen.getByText('Herb Garden Co')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('$5.99/lb')).toBeInTheDocument();
    expect(screen.getByText('$2.99/bunch')).toBeInTheDocument();

    // Check categories
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    expect(screen.getByText('Herbs')).toBeInTheDocument();
  });

  it('displays time since submission correctly', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Should show time ago (mocked dates will show specific times)
      const timeElements = screen.getAllByText(/\d+[hd] ago/);
      expect(timeElements.length).toBeGreaterThan(0);
    });
  });

  it('shows pending approval count', async () => {
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('2 pending approvals')).toBeInTheDocument();
    });
  });

  it('handles product search', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(
          'Search products by name, vendor, category...'
        )
      ).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search products by name, vendor, category...'
    );
    await user.type(searchInput, 'Organic');

    expect(searchInput.value).toBe('Organic');
  });

  it('handles individual product approval', async () => {
    const user = userEvent.setup();
    const mockUpdateProduct = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      mockUpdateProduct,
      { isLoading: false },
    ]);

    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Click approve button for first product
    const approveButtons = screen.getAllByText('Approve');
    await user.click(approveButtons[0]);

    // Confirm approval
    await waitFor(() => {
      expect(screen.getByText('Approve Product')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Approve');
    await user.click(confirmButton);

    expect(mockUpdateProduct).toHaveBeenCalledWith({
      id: '1',
      status: 'active',
      reviewNotes: '',
      reviewedAt: expect.any(String),
    });
  });

  it('handles individual product rejection', async () => {
    const user = userEvent.setup();
    const mockUpdateProduct = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      mockUpdateProduct,
      { isLoading: false },
    ]);

    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Click reject button for first product (X icon button)
    const rejectButtons = screen.getAllByRole('button');
    const rejectButton = rejectButtons.find((btn) => btn.querySelector('svg')); // Find button with X icon
    if (rejectButton) {
      await user.click(rejectButton);

      // Confirm rejection
      await waitFor(() => {
        expect(screen.getByText('Reject Product')).toBeInTheDocument();
      });

      const confirmButton = screen.getByText('Reject');
      await user.click(confirmButton);

      expect(mockUpdateProduct).toHaveBeenCalledWith({
        id: '1',
        status: 'rejected',
        reviewNotes: '',
        reviewedAt: expect.any(String),
      });
    }
  });

  it('handles product selection for bulk operations', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Select products using checkboxes
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First product checkbox (index 0 is select all)
    await user.click(checkboxes[2]); // Second product checkbox

    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('Approve Selected')).toBeInTheDocument();
      expect(screen.getByText('Reject Selected')).toBeInTheDocument();
    });
  });

  it('handles select all functionality', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Select all')).toBeInTheDocument();
    });

    // Click select all checkbox
    const selectAllCheckbox =
      screen.getByLabelText('Select all').previousElementSibling;
    await user.click(selectAllCheckbox);

    // Should show bulk actions with all products selected
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });
  });

  it('handles bulk approval', async () => {
    const user = userEvent.setup();
    const mockBulkUpdateProducts = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([
      mockBulkUpdateProducts,
      { isLoading: false },
    ]);

    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Select products
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    // Click bulk approve
    const bulkApproveButton = screen.getByText('Approve Selected');
    await user.click(bulkApproveButton);

    // Confirm bulk approval
    await waitFor(() => {
      expect(screen.getByText('Bulk Approve Products')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Approve All');
    await user.click(confirmButton);

    expect(mockBulkUpdateProducts).toHaveBeenCalledWith({
      productIds: ['1', '2'],
      updates: {
        status: 'active',
        reviewedAt: expect.any(String),
      },
    });
  });

  it('handles bulk rejection', async () => {
    const user = userEvent.setup();
    const mockBulkUpdateProducts = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({}),
    });
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([
      mockBulkUpdateProducts,
      { isLoading: false },
    ]);

    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Select products
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);

    // Click bulk reject
    const bulkRejectButton = screen.getByText('Reject Selected');
    await user.click(bulkRejectButton);

    // Confirm bulk rejection
    await waitFor(() => {
      expect(screen.getByText('Bulk Reject Products')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Reject All');
    await user.click(confirmButton);

    expect(mockBulkUpdateProducts).toHaveBeenCalledWith({
      productIds: ['1', '2'],
      updates: {
        status: 'rejected',
        reviewedAt: expect.any(String),
      },
    });
  });

  it('opens product review modal', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Click review button
    const reviewButtons = screen.getAllByText('Review');
    await user.click(reviewButtons[0]);

    // Should open modal
    await waitFor(() => {
      expect(screen.getByText('Product Review')).toBeInTheDocument();
      expect(screen.getByText('Product Information')).toBeInTheDocument();
      expect(screen.getByText('Vendor Information')).toBeInTheDocument();
    });
  });

  it('displays product images correctly', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Should show product image for first product
      const productImage = screen.getByAltText('Cherry Tomatoes');
      expect(productImage).toBeInTheDocument();
      expect(productImage.src).toBe('https://example.com/cherry-tomatoes.jpg');
    });
  });

  it('shows placeholder for products without images', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Fresh Basil has no images, should show placeholder
      expect(screen.getByText('Fresh Basil')).toBeInTheDocument();

      // Check for image placeholder icons
      const imageIcons = screen.getAllByTestId(/image-icon|placeholder/);
      expect(imageIcons.length).toBeGreaterThan(0);
    });
  });

  it('handles API errors gracefully', async () => {
    renderProductApproval({
      error: { status: 500, data: { error: 'Server error' } },
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('shows empty state when no pending products', async () => {
    renderProductApproval({
      data: {
        data: {
          products: [],
          pagination: {
            totalProducts: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 12,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No pending approvals')).toBeInTheDocument();
      expect(
        screen.getByText(
          'All product submissions have been reviewed. Check back later for new submissions.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays vendor information correctly', async () => {
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Green Valley Farm')).toBeInTheDocument();
      expect(screen.getByText('Herb Garden Co')).toBeInTheDocument();
    });
  });

  it('shows submission dates correctly', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Should show formatted dates
      const dateElements = screen.getAllByText(/Submitted \d+\/\d+\/\d+/);
      expect(dateElements.length).toBe(2); // One for each product
    });
  });

  it('renders accessibility features correctly', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Product Approval Queue'
      );

      // Check for accessible form controls
      expect(screen.getByRole('searchbox')).toBeInTheDocument();

      // Check all buttons have proper labels or titles
      const actionButtons = screen.getAllByRole('button');
      actionButtons.forEach((button) => {
        expect(
          button.textContent ||
            button.getAttribute('title') ||
            button.getAttribute('aria-label')
        ).toBeTruthy();
      });

      // Check all checkboxes are properly labeled
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(
          checkbox.getAttribute('aria-label') ||
            checkbox.nextElementSibling?.textContent ||
            checkbox.previousElementSibling?.textContent
        ).toBeTruthy();
      });
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    // Test tab navigation
    const searchInput = screen.getByRole('searchbox');
    searchInput.focus();

    await user.tab();

    // Next focusable element should be focused
    expect(document.activeElement).not.toBe(searchInput);
  });

  it('handles modal close functionality', async () => {
    const user = userEvent.setup();
    renderProductApproval();

    await waitFor(() => {
      expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
    });

    // Open review modal
    const reviewButtons = screen.getAllByText('Review');
    await user.click(reviewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Product Review')).toBeInTheDocument();
    });

    // Close modal by clicking X button
    const closeButton = screen.getByRole('button', { name: /close|×/i });
    await user.click(closeButton);

    // Modal should be closed
    expect(screen.queryByText('Product Review')).not.toBeInTheDocument();
  });

  it('displays responsive grid layout', async () => {
    renderProductApproval();

    await waitFor(() => {
      // Check that products use responsive grid classes
      const gridContainer = screen
        .getByText('Organic Cherry Tomatoes')
        .closest('.grid');
      expect(gridContainer).toHaveClass(
        'grid-cols-1',
        'md:grid-cols-2',
        'lg:grid-cols-3'
      );
    });
  });
});
