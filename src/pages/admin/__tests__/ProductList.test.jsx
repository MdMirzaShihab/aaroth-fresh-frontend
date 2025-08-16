import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ProductList from '../ProductList';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminProductsQuery: vi.fn(),
    useGetAdminCategoriesQuery: vi.fn(),
    useUpdateAdminProductMutation: vi.fn(),
    useDeleteAdminProductMutation: vi.fn(),
    useBulkUpdateProductsMutation: vi.fn(),
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock products data
const mockProductsData = {
  data: {
    products: [
      {
        id: '1',
        name: 'Organic Tomatoes',
        sku: 'ORG-TOM-001',
        category: 'cat-1',
        price: 4.99,
        unit: 'lb',
        status: 'active',
        listingsCount: 5,
        images: [
          { url: 'https://example.com/tomato.jpg', alt: 'Organic Tomatoes' },
        ],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      },
      {
        id: '2',
        name: 'Fresh Spinach',
        sku: 'FRS-SPN-002',
        category: 'cat-2',
        price: 3.49,
        unit: 'bunch',
        status: 'inactive',
        listingsCount: 2,
        images: [],
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z',
      },
    ],
    pagination: {
      totalProducts: 2,
      currentPage: 1,
      totalPages: 1,
      limit: 15,
    },
  },
};

const mockCategoriesData = {
  data: {
    categories: [
      { id: 'cat-1', name: 'Vegetables' },
      { id: 'cat-2', name: 'Leafy Greens' },
    ],
  },
};

describe('ProductList', () => {
  const renderProductList = (queryResult = {}, categoriesResult = {}) => {
    const defaultProductsResult = {
      data: mockProductsData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    };

    const defaultCategoriesResult = {
      data: mockCategoriesData,
      isLoading: false,
      error: null,
    };

    apiSlice.useGetAdminProductsQuery.mockReturnValue({
      ...defaultProductsResult,
      ...queryResult,
    });

    apiSlice.useGetAdminCategoriesQuery.mockReturnValue({
      ...defaultCategoriesResult,
      ...categoriesResult,
    });

    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useDeleteAdminProductMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);

    return renderWithProviders(<ProductList />, {
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

  it('renders product list title and description', async () => {
    renderProductList();

    expect(screen.getByText('Product Management')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Manage products, categories, and inventory across the platform'
      )
    ).toBeInTheDocument();
  });

  it('displays loading state', () => {
    renderProductList({ isLoading: true });

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders products table with correct data', async () => {
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Fresh Spinach')).toBeInTheDocument();
    });

    // Check SKUs
    expect(screen.getByText('SKU: ORG-TOM-001')).toBeInTheDocument();
    expect(screen.getByText('SKU: FRS-SPN-002')).toBeInTheDocument();

    // Check prices
    expect(screen.getByText('$4.99/lb')).toBeInTheDocument();
    expect(screen.getByText('$3.49/bunch')).toBeInTheDocument();

    // Check status badges
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('allows searching products', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      'Search products by name, SKU, description...'
    );
    await user.type(searchInput, 'Organic');

    expect(searchInput.value).toBe('Organic');
  });

  it('allows filtering by category', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Open filters
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    // Select category
    const categoryFilter = screen.getByLabelText('Category').nextElementSibling;
    await user.selectOptions(categoryFilter, 'cat-1');

    expect(categoryFilter.value).toBe('cat-1');
  });

  it('allows filtering by status', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Open filters
    const filtersButton = screen.getByText('Filters');
    await user.click(filtersButton);

    // Select status
    const statusFilter = screen.getByLabelText('Status').nextElementSibling;
    await user.selectOptions(statusFilter, 'active');

    expect(statusFilter.value).toBe('active');
  });

  it('handles sorting by clicking column headers', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Click on product name header to sort
    const nameHeader = screen.getByRole('button', { name: /product/i });
    await user.click(nameHeader);

    // Should show sort icon
    expect(nameHeader.querySelector('svg')).toBeInTheDocument();
  });

  it('handles product status toggle', async () => {
    const user = userEvent.setup();
    const mockUpdateProduct = vi
      .fn()
      .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      mockUpdateProduct,
      { isLoading: false },
    ]);

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Click status toggle button (should be the deactivate button for active product)
    const statusToggleButtons = screen.getAllByTitle(/activate|deactivate/i);
    await user.click(statusToggleButtons[0]);

    expect(mockUpdateProduct).toHaveBeenCalledWith({
      id: '1',
      status: 'inactive',
    });
  });

  it('handles product deletion', async () => {
    const user = userEvent.setup();
    const mockDeleteProduct = vi
      .fn()
      .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    apiSlice.useDeleteAdminProductMutation.mockReturnValue([
      mockDeleteProduct,
      { isLoading: false },
    ]);

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByTitle('Delete product');
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    await waitFor(() => {
      expect(screen.getByText('Delete Product')).toBeInTheDocument();
      expect(
        screen.getByText(/permanently delete "Organic Tomatoes"/)
      ).toBeInTheDocument();
    });

    // Confirm deletion
    const confirmButton = screen.getByText('Delete');
    await user.click(confirmButton);

    expect(mockDeleteProduct).toHaveBeenCalledWith('1');
  });

  it('handles bulk selection', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Select all products
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    await user.click(selectAllCheckbox);

    // Should show bulk actions
    await waitFor(() => {
      expect(screen.getByText('2 selected')).toBeInTheDocument();
      expect(screen.getByText('Activate')).toBeInTheDocument();
      expect(screen.getByText('Deactivate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  it('handles bulk operations', async () => {
    const user = userEvent.setup();
    const mockBulkUpdateProducts = vi
      .fn()
      .mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) });
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([
      mockBulkUpdateProducts,
      { isLoading: false },
    ]);

    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Select some products
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First product checkbox
    await user.click(checkboxes[2]); // Second product checkbox

    // Click bulk activate
    const bulkActivateButton = screen.getByText('Activate');
    await user.click(bulkActivateButton);

    // Should show confirmation
    await waitFor(() => {
      expect(screen.getByText('Bulk Activate Products')).toBeInTheDocument();
    });

    // Confirm bulk action
    const confirmButton = screen.getByText('Activate');
    await user.click(confirmButton);

    expect(mockBulkUpdateProducts).toHaveBeenCalledWith({
      productIds: ['1', '2'],
      updates: { status: 'active' },
    });
  });

  it('navigates to create product page', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Add Product')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Product');
    await user.click(addButton);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/create');
  });

  it('navigates to edit product page', async () => {
    const user = userEvent.setup();
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('Organic Tomatoes')).toBeInTheDocument();
    });

    // Click edit button
    const editButtons = screen.getAllByTitle('Edit product');
    await user.click(editButtons[0]);

    expect(mockNavigate).toHaveBeenCalledWith('/admin/products/1/edit');
  });

  it('handles API errors gracefully', async () => {
    renderProductList({
      error: { status: 500, data: { error: 'Server error' } },
    });

    await waitFor(() => {
      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('shows empty state when no products found', async () => {
    renderProductList({
      data: {
        data: {
          products: [],
          pagination: {
            totalProducts: 0,
            currentPage: 1,
            totalPages: 0,
            limit: 15,
          },
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('No products found')).toBeInTheDocument();
      expect(
        screen.getByText('No products match your current filters.')
      ).toBeInTheDocument();
    });
  });

  it('displays product images correctly', async () => {
    renderProductList();

    await waitFor(() => {
      const productImage = screen.getByAltText('Organic Tomatoes');
      expect(productImage).toBeInTheDocument();
      expect(productImage.src).toBe('https://example.com/tomato.jpg');
    });
  });

  it('shows placeholder for products without images', async () => {
    renderProductList();

    await waitFor(() => {
      // Fresh Spinach has no images, should show placeholder icon
      const productRows = screen.getAllByText(/Fresh Spinach/);
      expect(productRows.length).toBeGreaterThan(0);

      // Check for image placeholder icons
      const imageIcons = screen.getAllByTestId(/image-icon|placeholder/);
      expect(imageIcons.length).toBeGreaterThan(0);
    });
  });

  it('renders accessibility features correctly', async () => {
    renderProductList();

    await waitFor(() => {
      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Product Management'
      );

      // Check for accessible form controls
      expect(screen.getByRole('searchbox')).toBeInTheDocument();

      // Check table has proper structure
      expect(screen.getByRole('table')).toBeInTheDocument();

      // Check all buttons have proper labels or titles
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
});
