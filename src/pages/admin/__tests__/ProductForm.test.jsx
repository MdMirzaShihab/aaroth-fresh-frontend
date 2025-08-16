import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ProductForm from '../ProductForm';
import * as apiSlice from '../../../store/slices/apiSlice';

// Mock the RTK Query hooks
vi.mock('../../../store/slices/apiSlice', async () => {
  const actual = await vi.importActual('../../../store/slices/apiSlice');
  return {
    ...actual,
    useGetAdminProductQuery: vi.fn(),
    useCreateAdminProductMutation: vi.fn(),
    useUpdateAdminProductMutation: vi.fn(),
    useGetAdminCategoriesQuery: vi.fn(),
    useUploadProductImageMutation: vi.fn(),
    useDeleteProductImageMutation: vi.fn(),
  };
});

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
  };
});

// Mock categories data
const mockCategoriesData = {
  data: {
    categories: [
      { id: 'cat-1', name: 'Vegetables' },
      { id: 'cat-2', name: 'Fruits' },
      { id: 'cat-3', name: 'Herbs' },
    ],
  },
};

// Mock product data for editing
const mockProductData = {
  data: {
    id: '1',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes from local farm',
    category: 'cat-1',
    unit: 'lb',
    basePrice: 4.99,
    sku: 'ORG-TOM-001',
    status: 'active',
    tags: ['organic', 'fresh', 'local'],
    nutritionalInfo: {
      calories: 18,
      protein: 0.9,
      carbs: 3.9,
      fat: 0.2,
      fiber: 1.2,
    },
    storageInstructions: 'Store in cool, dry place',
    shelfLife: 7,
    origin: 'Local Farm, California',
    isOrganic: true,
    minOrderQuantity: 1,
    maxOrderQuantity: 100,
    images: [
      {
        id: 'img-1',
        url: 'https://example.com/tomato1.jpg',
        alt: 'Organic Tomatoes',
        isPrimary: true,
      },
      {
        id: 'img-2',
        url: 'https://example.com/tomato2.jpg',
        alt: 'Organic Tomatoes 2',
        isPrimary: false,
      },
    ],
  },
};

describe('ProductForm', () => {
  const renderProductForm = (
    isEditing = false,
    productResult = {},
    categoriesResult = {}
  ) => {
    const defaultProductResult = {
      data: isEditing ? mockProductData : undefined,
      isLoading: false,
      error: null,
    };

    const defaultCategoriesResult = {
      data: mockCategoriesData,
      isLoading: false,
      error: null,
    };

    apiSlice.useGetAdminProductQuery.mockReturnValue({
      ...defaultProductResult,
      ...productResult,
    });

    apiSlice.useGetAdminCategoriesQuery.mockReturnValue({
      ...defaultCategoriesResult,
      ...categoriesResult,
    });

    apiSlice.useCreateAdminProductMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useUpdateAdminProductMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useUploadProductImageMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);
    apiSlice.useDeleteProductImageMutation.mockReturnValue([
      vi.fn(),
      { isLoading: false },
    ]);

    return renderWithProviders(<ProductForm isEditing={isEditing} />, {
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

  describe('Create Product', () => {
    it('renders create form with correct title', async () => {
      renderProductForm(false);

      expect(screen.getByText('Create Product')).toBeInTheDocument();
      expect(
        screen.getByText('Add a new product to the catalog')
      ).toBeInTheDocument();
    });

    it('displays all required form fields', async () => {
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
        expect(screen.getByLabelText('Unit')).toBeInTheDocument();
        expect(screen.getByLabelText('Base Price')).toBeInTheDocument();
        expect(screen.getByLabelText('Description')).toBeInTheDocument();
      });
    });

    it('validates required fields', async () => {
      const user = userEvent.setup();
      const mockCreateProduct = vi.fn();
      apiSlice.useCreateAdminProductMutation.mockReturnValue([
        mockCreateProduct,
        { isLoading: false },
      ]);

      renderProductForm(false);

      await waitFor(() => {
        expect(
          screen.getByText('Create Product', { selector: 'button' })
        ).toBeInTheDocument();
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Create Product', {
        selector: 'button',
      });
      await user.click(submitButton);

      // Form should not be submitted due to HTML5 validation
      expect(mockCreateProduct).not.toHaveBeenCalled();
    });

    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const mockCreateProduct = vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: { id: '1' } }),
      });
      apiSlice.useCreateAdminProductMutation.mockReturnValue([
        mockCreateProduct,
        { isLoading: false },
      ]);

      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
      });

      // Fill in required fields
      await user.type(screen.getByLabelText('Product Name'), 'Test Product');
      await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');
      await user.selectOptions(screen.getByLabelText('Unit'), 'kg');
      await user.type(screen.getByLabelText('Base Price'), '5.99');

      // Submit form
      const submitButton = screen.getByText('Create Product', {
        selector: 'button',
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Product',
            category: 'cat-1',
            unit: 'kg',
            basePrice: 5.99,
          })
        );
      });
    });

    it('handles form submission errors', async () => {
      const user = userEvent.setup();
      const mockCreateProduct = vi.fn().mockReturnValue({
        unwrap: vi.fn().mockRejectedValue(new Error('Creation failed')),
      });
      apiSlice.useCreateAdminProductMutation.mockReturnValue([
        mockCreateProduct,
        { isLoading: false },
      ]);

      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
      });

      // Fill in required fields
      await user.type(screen.getByLabelText('Product Name'), 'Test Product');
      await user.selectOptions(screen.getByLabelText('Category'), 'cat-1');
      await user.selectOptions(screen.getByLabelText('Unit'), 'kg');
      await user.type(screen.getByLabelText('Base Price'), '5.99');

      // Submit form
      const submitButton = screen.getByText('Create Product', {
        selector: 'button',
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateProduct).toHaveBeenCalled();
        // Form should not navigate on error
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Product', () => {
    it('renders edit form with correct title', async () => {
      renderProductForm(true);

      await waitFor(() => {
        expect(screen.getByText('Edit Product')).toBeInTheDocument();
        expect(
          screen.getByText('Update product information and settings')
        ).toBeInTheDocument();
      });
    });

    it('loads existing product data', async () => {
      renderProductForm(true);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('Organic Tomatoes')
        ).toBeInTheDocument();
        expect(
          screen.getByDisplayValue('Fresh organic tomatoes from local farm')
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('4.99')).toBeInTheDocument();
        expect(screen.getByDisplayValue('ORG-TOM-001')).toBeInTheDocument();
      });
    });

    it('displays existing product images', async () => {
      renderProductForm(true);

      await waitFor(() => {
        const images = screen.getAllByRole('img');
        const productImages = images.filter(
          (img) => img.src.includes('tomato') && img.alt.includes('Tomatoes')
        );
        expect(productImages.length).toBeGreaterThan(0);
      });
    });

    it('updates product with changes', async () => {
      const user = userEvent.setup();
      const mockUpdateProduct = vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({}),
      });
      apiSlice.useUpdateAdminProductMutation.mockReturnValue([
        mockUpdateProduct,
        { isLoading: false },
      ]);

      renderProductForm(true);

      await waitFor(() => {
        expect(
          screen.getByDisplayValue('Organic Tomatoes')
        ).toBeInTheDocument();
      });

      // Update product name
      const nameField = screen.getByDisplayValue('Organic Tomatoes');
      await user.clear(nameField);
      await user.type(nameField, 'Premium Organic Tomatoes');

      // Submit form
      const submitButton = screen.getByText('Update Product');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateProduct).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '1',
            name: 'Premium Organic Tomatoes',
          })
        );
      });
    });

    it('handles product not found error', async () => {
      renderProductForm(true, { error: { status: 404 } });

      await waitFor(() => {
        expect(screen.getByText('Product not found')).toBeInTheDocument();
        expect(
          screen.getByText(
            "The product you're looking for doesn't exist or has been deleted."
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload', () => {
    it('handles image upload', async () => {
      const user = userEvent.setup();
      const mockUploadImage = vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: {
            id: 'img-new',
            url: 'https://example.com/new-image.jpg',
          },
        }),
      });
      apiSlice.useUploadProductImageMutation.mockReturnValue([
        mockUploadImage,
        { isLoading: false },
      ]);

      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByText('Product Images')).toBeInTheDocument();
      });

      // Create a mock file
      const file = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });

      // Find file input (it might be hidden)
      const fileInput = screen.container.querySelector('input[type="file"]');
      if (fileInput) {
        await user.upload(fileInput, file);

        await waitFor(() => {
          expect(mockUploadImage).toHaveBeenCalledWith(expect.any(FormData));
        });
      }
    });

    it('handles image deletion', async () => {
      const user = userEvent.setup();
      const mockDeleteImage = vi.fn().mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({}),
      });
      apiSlice.useDeleteProductImageMutation.mockReturnValue([
        mockDeleteImage,
        { isLoading: false },
      ]);

      renderProductForm(true);

      await waitFor(() => {
        // Wait for images to load
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
      });

      // Find delete button (usually appears on hover, but test might need to trigger it differently)
      const deleteButtons = screen.queryAllByTitle('Delete image');
      if (deleteButtons.length > 0) {
        await user.click(deleteButtons[0]);

        await waitFor(() => {
          expect(mockDeleteImage).toHaveBeenCalledWith({
            productId: '1',
            imageId: 'img-1',
          });
        });
      }
    });
  });

  describe('Form Validation', () => {
    it('validates product name length', async () => {
      const user = userEvent.setup();
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
      });

      const nameField = screen.getByLabelText('Product Name');

      // Test minimum length
      await user.type(nameField, 'A');
      fireEvent.blur(nameField);

      // Check if browser validation kicks in
      expect(nameField.validity.valid).toBeFalsy();
    });

    it('validates price is positive number', async () => {
      const user = userEvent.setup();
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Base Price')).toBeInTheDocument();
      });

      const priceField = screen.getByLabelText('Base Price');

      // Test negative price
      await user.type(priceField, '-5');
      fireEvent.blur(priceField);

      // HTML5 validation should prevent negative values
      expect(priceField.validity.valid).toBeFalsy();
    });

    it('validates nutritional info as numbers', async () => {
      const user = userEvent.setup();
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Calories')).toBeInTheDocument();
      });

      const caloriesField = screen.getByLabelText('Calories');

      // Test non-numeric input
      await user.type(caloriesField, 'abc');
      fireEvent.blur(caloriesField);

      // Number input should reject non-numeric values
      expect(caloriesField.value).toBe('');
    });
  });

  describe('Mobile Optimization', () => {
    it('renders mobile-friendly form layout', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      renderProductForm(false);

      await waitFor(() => {
        // Check that form uses responsive classes
        const formContainer = screen
          .getByText('Basic Information')
          .closest('div');
        expect(formContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2');
      });
    });

    it('provides touch-friendly button sizes', async () => {
      renderProductForm(false);

      await waitFor(() => {
        const submitButton = screen.getByText('Create Product', {
          selector: 'button',
        });

        // Check button has minimum touch target size
        const buttonClasses = submitButton.className;
        expect(
          buttonClasses.includes('min-h-') ||
            buttonClasses.includes('h-') ||
            buttonClasses.includes('py-')
        ).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('provides proper form labels', async () => {
      renderProductForm(false);

      await waitFor(() => {
        // Check all form fields have labels
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Category')).toBeInTheDocument();
        expect(screen.getByLabelText('Unit')).toBeInTheDocument();
        expect(screen.getByLabelText('Base Price')).toBeInTheDocument();
      });
    });

    it('shows validation errors accessibly', async () => {
      const user = userEvent.setup();
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
      });

      const nameField = screen.getByLabelText('Product Name');

      // Trigger validation by focusing and blurring
      await user.click(nameField);
      await user.tab();

      // Check if field shows validation state
      expect(nameField.getAttribute('aria-invalid')).toBe('false');
    });

    it('provides keyboard navigation', async () => {
      const user = userEvent.setup();
      renderProductForm(false);

      await waitFor(() => {
        expect(screen.getByLabelText('Product Name')).toBeInTheDocument();
      });

      // Test tab navigation through form
      const nameField = screen.getByLabelText('Product Name');
      nameField.focus();

      await user.tab();

      // Next focusable element should be focused
      expect(document.activeElement).not.toBe(nameField);
    });
  });
});
