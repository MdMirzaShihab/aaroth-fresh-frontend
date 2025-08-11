import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import CreateListing from '../CreateListing';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useCreateListingMutation: vi.fn(),
  useGetPublicProductsQuery: vi.fn(),
  useGetCategoriesQuery: vi.fn()
}));

// Mock the notification slice
vi.mock('../../../store/slices/notificationSlice', () => ({
  addNotification: vi.fn()
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock UI components that might not be available
vi.mock('../../../components/ui/FileUpload', () => ({
  default: ({ onFilesSelected, className, accept, multiple, maxFiles }) => (
    <div className={className} data-testid="file-upload">
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        data-max-files={maxFiles}
        onChange={(e) => onFilesSelected(e.target.files)}
        data-testid="file-input"
      />
      <span>Upload Images</span>
    </div>
  )
}));

import {
  useCreateListingMutation,
  useGetPublicProductsQuery,
  useGetCategoriesQuery
} from '../../../store/slices/apiSlice';

const mockProductsData = {
  data: {
    products: [
      {
        id: 'product_1',
        name: 'Tomatoes',
        category: { id: 'cat_1', name: 'Vegetables' }
      },
      {
        id: 'product_2', 
        name: 'Carrots',
        category: { id: 'cat_1', name: 'Vegetables' }
      }
    ]
  }
};

const mockCategoriesData = {
  categories: [
    { id: 'cat_1', name: 'Vegetables' },
    { id: 'cat_2', name: 'Fruits' }
  ]
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor'
  },
  token: 'test-token'
};

describe('CreateListing', () => {
  const mockCreateListing = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    useCreateListingMutation.mockReturnValue([mockCreateListing, { isLoading: false }]);
    
    useGetPublicProductsQuery.mockReturnValue({
      data: mockProductsData,
      isLoading: false
    });
    
    useGetCategoriesQuery.mockReturnValue({
      data: mockCategoriesData
    });
    
    // Mock successful mutation response
    mockCreateListing.mockResolvedValue({
      unwrap: () => Promise.resolve({
        data: {
          id: 'new_listing_1',
          product: { name: 'Tomatoes' }
        }
      })
    });
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  describe('Page Layout', () => {
    it('renders page header correctly', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Create New Listing')).toBeInTheDocument();
      expect(screen.getByText('Add a new product listing to showcase your offerings')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /back to listings/i })).toBeInTheDocument();
    });

    it('has navigation back to listings', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const backButton = screen.getByRole('button', { name: /back to listings/i });
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/vendor/listings');
    });
  });

  describe('Form Sections', () => {
    it('renders all required form sections', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Check section headers
      expect(screen.getByText('Product Information')).toBeInTheDocument();
      expect(screen.getByText('Pricing & Units')).toBeInTheDocument();
      expect(screen.getByText('Availability & Stock')).toBeInTheDocument();
      expect(screen.getByText('Product Images')).toBeInTheDocument();
      expect(screen.getByText('Delivery Options')).toBeInTheDocument();
      expect(screen.getByText('Additional Settings')).toBeInTheDocument();
    });

    it('loads products and categories', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const productSelect = screen.getByLabelText('Select Product');
        expect(productSelect).toBeInTheDocument();
        
        // Check that products are loaded
        expect(screen.getByText('Tomatoes (Vegetables)')).toBeInTheDocument();
        expect(screen.getByText('Carrots (Vegetables)')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /create listing/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a product')).toBeInTheDocument();
        expect(screen.getByText('Price is required')).toBeInTheDocument();
        expect(screen.getByText('Quantity is required')).toBeInTheDocument();
        expect(screen.getByText('Please provide a description')).toBeInTheDocument();
      });
    });

    it('validates price must be greater than 0', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const priceInput = screen.getByPlaceholderText('0.00');
      await user.type(priceInput, '0');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument();
      });
    });

    it('validates quantity must be 0 or greater', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const quantityInput = screen.getByPlaceholderText('100');
      await user.type(quantityInput, '-1');
      await user.tab(); // Trigger validation

      await waitFor(() => {
        expect(screen.getByText('Quantity must be 0 or greater')).toBeInTheDocument();
      });
    });

    it('shows error when no images are uploaded', async () => {
      const user = userEvent.setup();
      
      // Mock dispatch for notifications
      const mockDispatch = vi.fn();
      vi.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Fill required fields except images
      const productSelect = screen.getByLabelText('Select Product');
      await user.selectOptions(productSelect, 'product_1');
      
      const priceInput = screen.getByPlaceholderText('0.00');
      await user.type(priceInput, '25.50');
      
      const quantityInput = screen.getByPlaceholderText('100');
      await user.type(quantityInput, '100');
      
      const descriptionInput = screen.getByPlaceholderText(/describe your product/i);
      await user.type(descriptionInput, 'Fresh organic tomatoes');

      // Submit without images
      const submitButton = screen.getByRole('button', { name: /create listing/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('notification/addNotification'),
          payload: expect.objectContaining({
            type: 'error',
            title: 'Images Required',
            message: 'Please upload at least one product image.'
          })
        }));
      });
    });
  });

  describe('Dynamic Form Fields', () => {
    it('allows adding and removing pricing options', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Should have one pricing option by default
      expect(screen.getByText('Pricing Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Pricing Option 2')).not.toBeInTheDocument();

      // Add pricing option
      const addPricingButton = screen.getByRole('button', { name: /add pricing option/i });
      await user.click(addPricingButton);

      await waitFor(() => {
        expect(screen.getByText('Pricing Option 2')).toBeInTheDocument();
      });

      // Remove pricing option
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      const removePricingButton = removeButtons.find(btn => btn.textContent.includes('Remove'));
      if (removePricingButton) {
        await user.click(removePricingButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('Pricing Option 2')).not.toBeInTheDocument();
      });
    });

    it('allows adding and removing delivery options', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Should have one delivery option by default
      expect(screen.getByText('Delivery Option 1')).toBeInTheDocument();
      expect(screen.queryByText('Delivery Option 2')).not.toBeInTheDocument();

      // Add delivery option
      const addDeliveryButton = screen.getByRole('button', { name: /add delivery option/i });
      await user.click(addDeliveryButton);

      await waitFor(() => {
        expect(screen.getByText('Delivery Option 2')).toBeInTheDocument();
      });
    });
  });

  describe('Image Upload', () => {
    it('handles image upload and preview', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const fileInput = screen.getByTestId('file-input');
      
      // Create mock file
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      
      // Upload file
      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        // Should create object URL for preview
        expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockFile);
      });
    });

    it('allows removing uploaded images', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const fileInput = screen.getByTestId('file-input');
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      
      // Upload file
      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        // Should have remove button for uploaded image
        const removeImageButton = screen.getByRole('button', { 'aria-label': /remove image/i });
        expect(removeImageButton).toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Fill required fields
      const productSelect = screen.getByLabelText('Select Product');
      await user.selectOptions(productSelect, 'product_1');
      
      const priceInput = screen.getByPlaceholderText('0.00');
      await user.type(priceInput, '25.50');
      
      const quantityInput = screen.getByPlaceholderText('100');
      await user.type(quantityInput, '100');
      
      const descriptionInput = screen.getByPlaceholderText(/describe your product/i);
      await user.type(descriptionInput, 'Fresh organic tomatoes');

      // Upload image
      const fileInput = screen.getByTestId('file-input');
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, mockFile);

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create listing/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreateListing).toHaveBeenCalled();
        
        // Check FormData was created
        const call = mockCreateListing.mock.calls[0];
        expect(call[0]).toBeInstanceOf(FormData);
      });
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const mockDispatch = vi.fn();
      vi.spyOn(require('react-redux'), 'useDispatch').mockReturnValue(mockDispatch);
      
      // Mock failed submission
      mockCreateListing.mockRejectedValue({
        data: { message: 'Server error' }
      });
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Fill and submit form
      const productSelect = screen.getByLabelText('Select Product');
      await user.selectOptions(productSelect, 'product_1');
      
      const priceInput = screen.getByPlaceholderText('0.00');
      await user.type(priceInput, '25.50');
      
      const quantityInput = screen.getByPlaceholderText('100');
      await user.type(quantityInput, '100');
      
      const descriptionInput = screen.getByPlaceholderText(/describe your product/i);
      await user.type(descriptionInput, 'Fresh organic tomatoes');

      const fileInput = screen.getByTestId('file-input');
      const mockFile = new File(['test'], 'test-image.jpg', { type: 'image/jpeg' });
      await user.upload(fileInput, mockFile);

      const submitButton = screen.getByRole('button', { name: /create listing/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
          type: expect.stringContaining('notification/addNotification'),
          payload: expect.objectContaining({
            type: 'error',
            title: 'Creation Failed'
          })
        }));
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      useCreateListingMutation.mockReturnValue([mockCreateListing, { isLoading: true }]);
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const submitButton = screen.getByRole('button', { name: /creating listing/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Fields Content', () => {
    it('has all quality grade options', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const qualitySelect = screen.getByLabelText('Quality Grade');
      expect(qualitySelect).toBeInTheDocument();
      
      expect(screen.getByText('Premium')).toBeInTheDocument();
      expect(screen.getByText('Standard')).toBeInTheDocument();
      expect(screen.getByText('Economy')).toBeInTheDocument();
    });

    it('has all unit options', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Check that unit options are available
      expect(screen.getByText('Kilogram (kg)')).toBeInTheDocument();
      expect(screen.getByText('Gram (g)')).toBeInTheDocument();
      expect(screen.getByText('Piece')).toBeInTheDocument();
      expect(screen.getByText('Bunch')).toBeInTheDocument();
    });

    it('has certification options', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Organic')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade')).toBeInTheDocument();
      expect(screen.getByText('Non-GMO')).toBeInTheDocument();
      expect(screen.getByText('Locally Grown')).toBeInTheDocument();
      expect(screen.getByText('Pesticide-Free')).toBeInTheDocument();
    });

    it('has lead time options', async () => {
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const leadTimeSelect = screen.getByLabelText('Lead Time');
      expect(leadTimeSelect).toBeInTheDocument();
      
      expect(screen.getByText('Immediate')).toBeInTheDocument();
      expect(screen.getByText('30 minutes')).toBeInTheDocument();
      expect(screen.getByText('1-2 hours')).toBeInTheDocument();
      expect(screen.getByText('2-4 hours')).toBeInTheDocument();
      expect(screen.getByText('Same day')).toBeInTheDocument();
      expect(screen.getByText('Next day')).toBeInTheDocument();
    });
  });

  describe('Cancel Action', () => {
    it('navigates back to listings on cancel', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<CreateListing />, {
        preloadedState: { auth: defaultAuthState }
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/vendor/listings');
    });
  });
});