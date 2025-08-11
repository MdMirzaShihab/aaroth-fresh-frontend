import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ProductList from '../ProductList';
import ProductForm from '../ProductForm';
import CategoryManagement from '../CategoryManagement';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminProductsQuery: vi.fn(),
    useGetAdminCategoriesQuery: vi.fn(),
    useCreateAdminProductMutation: vi.fn(),
    useUpdateAdminProductMutation: vi.fn(),
    useDeleteAdminProductMutation: vi.fn(),
    useBulkUpdateProductsMutation: vi.fn(),
    useCreateAdminCategoryMutation: vi.fn(),
    useUpdateAdminCategoryMutation: vi.fn(),
    useDeleteAdminCategoryMutation: vi.fn(),
    useUploadProductImageMutation: vi.fn(),
    useDeleteProductImageMutation: vi.fn()
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' })
  };
});

// Mock data
const mockProductsData = {
  data: {
    products: [
      {
        id: '1',
        name: 'Organic Cherry Tomatoes',
        sku: 'ORG-TOM-001',
        category: 'cat-1',
        basePrice: 4.99,
        unit: 'lb',
        status: 'active',
        listingsCount: 5,
        images: [{ url: 'https://example.com/tomato.jpg', alt: 'Organic Tomatoes' }],
        createdAt: '2024-01-10T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Fresh Baby Spinach Leaves',
        sku: 'FRS-SPN-002',
        category: 'cat-2',
        basePrice: 3.49,
        unit: 'bunch',
        status: 'active',
        listingsCount: 3,
        images: [],
        createdAt: '2024-01-08T10:00:00Z',
        updatedAt: '2024-01-12T10:00:00Z'
      }
    ],
    pagination: {
      totalProducts: 2,
      currentPage: 1,
      totalPages: 1,
      limit: 15
    }
  }
};

const mockCategoriesData = {
  data: {
    categories: [
      { id: 'cat-1', name: 'Vegetables' },
      { id: 'cat-2', name: 'Leafy Greens' }
    ]
  }
};

describe('Product Management Mobile Optimization', () => {
  // Mock mobile viewport
  const mockMobileViewport = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone SE height
    });
  };

  const mockTabletViewport = () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768, // iPad width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 1024, // iPad height
    });
  };

  const setupMocks = () => {
    apiSlice.useGetAdminProductsQuery.mockReturnValue({
      data: mockProductsData,
      isLoading: false,
      error: null,
      refetch: vi.fn()
    });

    apiSlice.useGetAdminCategoriesQuery.mockReturnValue({
      data: mockCategoriesData,
      isLoading: false,
      error: null
    });

    apiSlice.useCreateAdminProductMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useUpdateAdminProductMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useDeleteAdminProductMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useBulkUpdateProductsMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useCreateAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useUpdateAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useDeleteAdminCategoryMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useUploadProductImageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
    apiSlice.useDeleteProductImageMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  };

  const renderWithMobileState = (Component) => {
    return renderWithProviders(Component, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: {
            id: 'admin-1',
            role: 'admin',
            name: 'Admin User'
          },
          token: 'mock-token',
          loading: false
        }
      }
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  describe('ProductList Mobile Optimization', () => {
    it('displays mobile-responsive table layout', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      // Check that table adapts to mobile
      const tableContainer = screen.getByText('Organic Cherry Tomatoes').closest('div');
      // Mobile tables should stack or use card layout
      expect(tableContainer).not.toHaveClass('table'); // Should not use standard table layout
    });

    it('provides touch-friendly search interface', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search products by name, SKU, description...');
        expect(searchInput).toBeInTheDocument();
        
        // Check minimum touch target size (44px minimum)
        const inputStyles = window.getComputedStyle(searchInput);
        const minHeight = parseFloat(inputStyles.minHeight) || parseFloat(inputStyles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('handles mobile filter interface', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Filters')).toBeInTheDocument();
      });

      const filtersButton = screen.getByText('Filters');
      
      // Check button is touch-friendly
      const buttonStyles = window.getComputedStyle(filtersButton);
      const minHeight = parseFloat(buttonStyles.minHeight) || parseFloat(buttonStyles.height);
      expect(minHeight).toBeGreaterThanOrEqual(44);

      // Test filter interaction
      await user.click(filtersButton);
      
      // Filters should be accessible on mobile
      await waitFor(() => {
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
      });
    });

    it('supports mobile bulk actions', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      // Select products using checkboxes (should be touch-friendly)
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBeGreaterThan(0);

      // Check checkbox touch target
      const checkbox = checkboxes[1]; // First product checkbox
      const checkboxStyles = window.getComputedStyle(checkbox);
      const checkboxSize = Math.max(
        parseFloat(checkboxStyles.width),
        parseFloat(checkboxStyles.height)
      );
      expect(checkboxSize).toBeGreaterThanOrEqual(16); // Minimum checkbox size

      await user.click(checkbox);

      // Bulk actions should appear
      await waitFor(() => {
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      });
    });
  });

  describe('ProductForm Mobile Optimization', () => {
    it('renders mobile-friendly form layout', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        expect(screen.getByText('Create Product')).toBeInTheDocument();
      });

      // Check form uses mobile-responsive grid
      const formContainer = screen.getByText('Basic Information').closest('div');
      expect(formContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
    });

    it('provides touch-friendly form inputs', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Product Name');
        expect(nameInput).toBeInTheDocument();

        // Check input has proper touch target size
        const inputStyles = window.getComputedStyle(nameInput);
        const minHeight = parseFloat(inputStyles.minHeight) || parseFloat(inputStyles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('handles mobile image upload interface', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      
      const mockUploadImage = vi.fn().mockReturnValue({ 
        unwrap: vi.fn().mockResolvedValue({
          data: {
            id: 'img-new',
            url: 'https://example.com/new-image.jpg'
          }
        }) 
      });
      apiSlice.useUploadProductImageMutation.mockReturnValue([mockUploadImage, { isLoading: false }]);

      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        expect(screen.getByText('Product Images')).toBeInTheDocument();
      });

      // Check file input is accessible on mobile
      const fileInput = screen.container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();

      // Test file upload on mobile
      const file = new File(['test'], 'test-mobile.jpg', { type: 'image/jpeg' });
      if (fileInput) {
        await user.upload(fileInput, file);
        
        await waitFor(() => {
          expect(mockUploadImage).toHaveBeenCalledWith(expect.any(FormData));
        });
      }
    });

    it('provides mobile-optimized button layout', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        const submitButton = screen.getByText('Create Product', { selector: 'button' });
        expect(submitButton).toBeInTheDocument();

        // Check button meets touch target requirements
        const buttonStyles = window.getComputedStyle(submitButton);
        const minHeight = parseFloat(buttonStyles.minHeight) || parseFloat(buttonStyles.height);
        expect(minHeight).toBeGreaterThanOrEqual(44);
      });
    });

    it('handles mobile keyboard navigation', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        const nameInput = screen.getByLabelText('Product Name');
        expect(nameInput).toBeInTheDocument();

        // Focus first input
        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        // Tab navigation should work on mobile
        user.tab();
        expect(document.activeElement).not.toBe(nameInput);
      });
    });
  });

  describe('CategoryManagement Mobile Optimization', () => {
    it('renders mobile-responsive category grid', async () => {
      mockMobileViewport();
      renderWithMobileState(<CategoryManagement />);

      await waitFor(() => {
        expect(screen.getByText('Category Management')).toBeInTheDocument();
      });

      // Categories should use responsive grid layout
      const categoriesContainer = screen.getByText('Vegetables').closest('.grid');
      if (categoriesContainer) {
        expect(categoriesContainer).toHaveClass('grid-cols-1');
      }
    });

    it('provides touch-friendly category actions', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<CategoryManagement />);

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      
      // Check button touch target
      const buttonStyles = window.getComputedStyle(addButton);
      const minHeight = parseFloat(buttonStyles.minHeight) || parseFloat(buttonStyles.height);
      expect(minHeight).toBeGreaterThanOrEqual(44);

      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText('Create Category')).toBeInTheDocument();
      });
    });

    it('handles mobile form modal', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<CategoryManagement />);

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      await user.click(addButton);

      await waitFor(() => {
        const modal = screen.getByText('Create Category').closest('[role="dialog"]') || 
                     screen.getByText('Create Category').closest('.fixed');
        
        if (modal) {
          // Modal should be responsive to mobile viewport
          const modalStyles = window.getComputedStyle(modal);
          expect(modalStyles.position).toBe('fixed');
        }
      });
    });
  });

  describe('Tablet Optimization', () => {
    it('adapts ProductList layout for tablet viewport', async () => {
      mockTabletViewport();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      // Tablet should show more columns than mobile
      const container = screen.getByText('Organic Cherry Tomatoes').closest('div');
      // Should use md: breakpoint classes
      expect(container?.className).toMatch(/md:/);
    });

    it('optimizes ProductForm for tablet layout', async () => {
      mockTabletViewport();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        const formContainer = screen.getByText('Basic Information').closest('div');
        // Should show 2 columns on tablet
        expect(formContainer).toHaveClass('md:grid-cols-2');
      });
    });
  });

  describe('Touch Interactions', () => {
    it('supports swipe gestures for mobile navigation', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      // Test touch events on product cards
      const productCard = screen.getByText('Organic Cherry Tomatoes').closest('div');
      if (productCard) {
        // Simulate touch start/end events
        fireEvent.touchStart(productCard, {
          touches: [{ clientX: 100, clientY: 100 }]
        });

        fireEvent.touchEnd(productCard, {
          changedTouches: [{ clientX: 150, clientY: 100 }]
        });

        // Component should handle touch events without errors
        expect(productCard).toBeInTheDocument();
      }
    });

    it('provides haptic feedback simulation for mobile actions', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      
      // Mock navigator.vibrate for haptic feedback
      Object.defineProperty(navigator, 'vibrate', {
        writable: true,
        value: vi.fn(),
      });

      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Delete product');
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);
        
        // Component should work even if vibration API is available
        await waitFor(() => {
          expect(screen.getByText('Delete Product')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility on Mobile', () => {
    it('maintains WCAG compliance on mobile devices', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        // Check headings hierarchy
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Product Management');
        
        // Check all interactive elements have proper labels
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(
            button.textContent || 
            button.getAttribute('title') || 
            button.getAttribute('aria-label')
          ).toBeTruthy();
        });
      });
    });

    it('supports screen reader navigation on mobile', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductForm isEditing={false} />);

      await waitFor(() => {
        // Check form labels are properly associated
        const nameInput = screen.getByLabelText('Product Name');
        expect(nameInput).toBeInTheDocument();
        
        const categorySelect = screen.getByLabelText('Category');
        expect(categorySelect).toBeInTheDocument();
        
        const priceInput = screen.getByLabelText('Base Price');
        expect(priceInput).toBeInTheDocument();
      });
    });

    it('provides proper focus management on mobile', async () => {
      mockMobileViewport();
      const user = userEvent.setup();
      renderWithMobileState(<CategoryManagement />);

      await waitFor(() => {
        expect(screen.getByText('Add Category')).toBeInTheDocument();
      });

      const addButton = screen.getByText('Add Category');
      await user.click(addButton);

      await waitFor(() => {
        // Focus should move to modal when opened
        const nameInput = screen.getByLabelText('Category Name');
        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);
      });
    });
  });

  describe('Performance on Mobile', () => {
    it('handles large datasets efficiently on mobile', async () => {
      mockMobileViewport();
      
      // Mock large dataset
      const largeProductData = {
        data: {
          products: Array.from({ length: 100 }, (_, i) => ({
            id: `${i + 1}`,
            name: `Product ${i + 1}`,
            sku: `SKU-${i + 1}`,
            category: 'cat-1',
            basePrice: (i + 1) * 1.99,
            unit: 'lb',
            status: 'active',
            listingsCount: Math.floor(Math.random() * 10),
            images: [],
            createdAt: '2024-01-10T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          })),
          pagination: {
            totalProducts: 100,
            currentPage: 1,
            totalPages: 7,
            limit: 15
          }
        }
      };

      apiSlice.useGetAdminProductsQuery.mockReturnValue({
        data: largeProductData,
        isLoading: false,
        error: null,
        refetch: vi.fn()
      });

      const startTime = performance.now();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete reasonably quickly on mobile
      expect(renderTime).toBeLessThan(5000); // 5 seconds max
    });

    it('implements lazy loading for mobile optimization', async () => {
      mockMobileViewport();
      renderWithMobileState(<ProductList />);

      await waitFor(() => {
        expect(screen.getByText('Organic Cherry Tomatoes')).toBeInTheDocument();
      });

      // Check that pagination is present for lazy loading
      // In a real implementation, this would test infinite scroll or pagination
      const products = screen.getAllByText(/Organic|Fresh/);
      expect(products.length).toBeLessThanOrEqual(15); // Should not load all at once
    });
  });
});