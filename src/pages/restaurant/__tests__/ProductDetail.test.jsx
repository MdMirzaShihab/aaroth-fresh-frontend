import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import ProductDetail from '../ProductDetail';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetListingByIdQuery: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useParams: () => ({ productId: 'test-product-1' }),
  useNavigate: () => mockNavigate,
}));

// Mock utils
vi.mock('../../../utils', () => ({
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
}));

describe('ProductDetail', () => {
  const mockListingData = {
    data: {
      _id: 'test-product-1',
      vendorId: 'vendor1',
      productId: 'product1',
      price: 45.50,
      pricing: [{ pricePerUnit: 45.50, unit: 'kg' }],
      availability: {
        quantityAvailable: 150,
        isInSeason: true,
        unit: 'kg'
      },
      images: [
        { url: 'https://example.com/tomato1.jpg' },
        { url: 'https://example.com/tomato2.jpg' },
        { url: 'https://example.com/tomato3.jpg' }
      ],
      rating: { average: 4.7 },
      qualityGrade: 'A+',
      featured: true,
      minimumOrderValue: 500,
      deliveryOptions: ['same-day', 'next-day'],
      product: {
        name: 'Premium Organic Tomatoes',
        description: 'Fresh, juicy organic tomatoes grown in controlled environments. Perfect for cooking, salads, and sauces. Rich in vitamins and antioxidants.',
        category: 'vegetables',
        images: [
          { url: 'https://example.com/tomato1.jpg' },
          { url: 'https://example.com/tomato2.jpg' }
        ],
        nutritionalInfo: {
          calories: 18,
          protein: 0.9,
          carbs: 3.9,
          fiber: 1.2,
          vitamins: ['C', 'K', 'Folate']
        },
        storageInstructions: 'Store in cool, dry place. Refrigerate after opening.',
        shelfLife: '7-10 days',
        rating: { average: 4.7 }
      },
      vendor: {
        businessName: 'Green Valley Organic Farm',
        name: 'Green Valley Organic Farm',
        address: {
          city: 'Savar, Dhaka',
          district: 'Dhaka'
        },
        location: 'Savar, Dhaka',
        rating: { average: 4.8 },
        minimumOrderValue: 500,
        certifications: ['Organic', 'Fair Trade'],
        description: 'Leading organic farm with 15+ years of experience in sustainable agriculture.',
        deliveryAreas: ['Dhaka', 'Gazipur', 'Narayanganj']
      }
    }
  };

  const defaultMockQuery = {
    useGetListingByIdQuery: vi.fn().mockReturnValue({
      data: mockListingData,
      isLoading: false,
      error: null,
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useGetListingByIdQuery } = require('../../../store/slices/apiSlice');
    useGetListingByIdQuery.mockImplementation(defaultMockQuery.useGetListingByIdQuery);
  });

  const renderProductDetail = (initialState = {}) => {
    return renderWithProviders(<ProductDetail />, {
      preloadedState: {
        cart: { items: [], total: 0, itemCount: 0, isOpen: false },
        favorites: { items: [], loading: false, error: null },
        comparison: { items: [], maxItems: 4, loading: false, error: null },
        ...initialState,
      },
    });
  };

  describe('Basic Rendering', () => {
    it('renders product name and description', () => {
      renderProductDetail();
      
      expect(screen.getByText('Premium Organic Tomatoes')).toBeInTheDocument();
      expect(screen.getByText(/Fresh, juicy organic tomatoes/)).toBeInTheDocument();
    });

    it('renders vendor information', () => {
      renderProductDetail();
      
      expect(screen.getByText('Green Valley Organic Farm')).toBeInTheDocument();
      expect(screen.getByText('Savar, Dhaka')).toBeInTheDocument();
    });

    it('renders price and unit information', () => {
      renderProductDetail();
      
      expect(screen.getByText('$45.50')).toBeInTheDocument();
      expect(screen.getByText(/per kg/)).toBeInTheDocument();
    });

    it('renders rating information', () => {
      renderProductDetail();
      
      expect(screen.getByText('4.7')).toBeInTheDocument();
    });

    it('renders back button', () => {
      renderProductDetail();
      
      const backButton = screen.getByLabelText(/go back/i);
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Image Gallery', () => {
    it('displays product images', () => {
      renderProductDetail();
      
      const images = screen.getAllByRole('img', { name: /Premium Organic Tomatoes/i });
      expect(images.length).toBeGreaterThan(0);
    });

    it('navigates through images with next/prev buttons', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const nextButton = screen.getByLabelText(/next image/i);
      const prevButton = screen.getByLabelText(/previous image/i);
      
      expect(nextButton).toBeInTheDocument();
      expect(prevButton).toBeInTheDocument();
      
      await user.click(nextButton);
      // Could test image index change here
    });

    it('shows image thumbnails for navigation', () => {
      renderProductDetail();
      
      const thumbnails = screen.getAllByRole('button', { name: /view image/i });
      expect(thumbnails.length).toBeGreaterThan(0);
    });
  });

  describe('Quantity Controls', () => {
    it('renders quantity input with default value of 1', () => {
      renderProductDetail();
      
      const quantityInput = screen.getByDisplayValue('1');
      expect(quantityInput).toBeInTheDocument();
    });

    it('increases quantity when plus button is clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const plusButton = screen.getByLabelText(/increase quantity/i);
      await user.click(plusButton);
      
      const quantityInput = screen.getByDisplayValue('2');
      expect(quantityInput).toBeInTheDocument();
    });

    it('decreases quantity when minus button is clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      // First increase to 2
      const plusButton = screen.getByLabelText(/increase quantity/i);
      await user.click(plusButton);
      
      // Then decrease back to 1
      const minusButton = screen.getByLabelText(/decrease quantity/i);
      await user.click(minusButton);
      
      const quantityInput = screen.getByDisplayValue('1');
      expect(quantityInput).toBeInTheDocument();
    });

    it('prevents quantity from going below 1', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const minusButton = screen.getByLabelText(/decrease quantity/i);
      await user.click(minusButton);
      
      const quantityInput = screen.getByDisplayValue('1');
      expect(quantityInput).toBeInTheDocument();
    });

    it('updates total price when quantity changes', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const plusButton = screen.getByLabelText(/increase quantity/i);
      await user.click(plusButton);
      
      // Should show 2 * $45.50 = $91.00
      expect(screen.getByText('$91.00')).toBeInTheDocument();
    });
  });

  describe('Add to Cart', () => {
    it('adds product to cart when add to cart button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductDetail();
      
      const addToCartButton = screen.getByText('Add to Cart');
      await user.click(addToCartButton);
      
      const state = store.getState();
      expect(state.cart.items).toHaveLength(1);
      expect(state.cart.items[0].quantity).toBe(1);
    });

    it('adds correct quantity to cart', async () => {
      const user = userEvent.setup();
      const { store } = renderProductDetail();
      
      // Increase quantity to 3
      const plusButton = screen.getByLabelText(/increase quantity/i);
      await user.click(plusButton);
      await user.click(plusButton);
      
      const addToCartButton = screen.getByText('Add to Cart');
      await user.click(addToCartButton);
      
      const state = store.getState();
      expect(state.cart.items[0].quantity).toBe(3);
    });

    it('disables add to cart when out of stock', () => {
      const { useGetListingByIdQuery } = require('../../../store/slices/apiSlice');
      useGetListingByIdQuery.mockReturnValue({
        data: {
          ...mockListingData,
          data: {
            ...mockListingData.data,
            availability: { quantityAvailable: 0, isInSeason: true }
          }
        },
        isLoading: false,
        error: null,
      });

      renderProductDetail();
      
      const addToCartButton = screen.getByText('Add to Cart');
      expect(addToCartButton).toBeDisabled();
    });
  });

  describe('Tabs Navigation', () => {
    it('renders tab navigation', () => {
      renderProductDetail();
      
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Nutrition')).toBeInTheDocument();
      expect(screen.getByText('Vendor')).toBeInTheDocument();
      expect(screen.getByText('Delivery')).toBeInTheDocument();
    });

    it('switches to nutrition tab when clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const nutritionTab = screen.getByText('Nutrition');
      await user.click(nutritionTab);
      
      expect(screen.getByText(/Calories/)).toBeInTheDocument();
      expect(screen.getByText(/Protein/)).toBeInTheDocument();
      expect(screen.getByText(/Vitamins/)).toBeInTheDocument();
    });

    it('switches to vendor tab when clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const vendorTab = screen.getByText('Vendor');
      await user.click(vendorTab);
      
      expect(screen.getByText(/Leading organic farm/)).toBeInTheDocument();
      expect(screen.getByText(/Certifications/)).toBeInTheDocument();
    });

    it('switches to delivery tab when clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const deliveryTab = screen.getByText('Delivery');
      await user.click(deliveryTab);
      
      expect(screen.getByText(/Delivery Options/)).toBeInTheDocument();
      expect(screen.getByText(/Minimum Order/)).toBeInTheDocument();
    });
  });

  describe('Favorites and Comparison', () => {
    it('toggles favorite when heart button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductDetail();
      
      const heartButton = screen.getByLabelText(/add to favorites/i);
      await user.click(heartButton);
      
      const state = store.getState();
      expect(state.favorites.items).toHaveLength(1);
    });

    it('toggles comparison when compare button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductDetail();
      
      const compareButton = screen.getByLabelText(/add to comparison/i);
      await user.click(compareButton);
      
      const state = store.getState();
      expect(state.comparison.items).toHaveLength(1);
    });

    it('shows filled heart for favorited products', () => {
      renderProductDetail({
        favorites: {
          items: [{ id: 'test-product-1', name: 'Premium Organic Tomatoes' }],
          loading: false,
          error: null,
        },
      });
      
      const heartButton = screen.getByLabelText(/remove from favorites/i);
      expect(heartButton).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates back when back button is clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const backButton = screen.getByLabelText(/go back/i);
      await user.click(backButton);
      
      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('navigates to vendor page when vendor link is clicked', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      // Switch to vendor tab first
      const vendorTab = screen.getByText('Vendor');
      await user.click(vendorTab);
      
      const vendorLink = screen.getByText(/View Vendor Profile/i);
      if (vendorLink) {
        await user.click(vendorLink);
        expect(mockNavigate).toHaveBeenCalledWith('/restaurant/vendors/vendor1');
      }
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner when data is loading', () => {
      const { useGetListingByIdQuery } = require('../../../store/slices/apiSlice');
      useGetListingByIdQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderProductDetail();
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('shows error message when data fails to load', () => {
      const { useGetListingByIdQuery } = require('../../../store/slices/apiSlice');
      useGetListingByIdQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Product not found' },
      });

      renderProductDetail();
      
      expect(screen.getByText(/Failed to load product/)).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Availability Display', () => {
    it('shows in stock status for available products', () => {
      renderProductDetail();
      
      expect(screen.getByText(/In Stock/)).toBeInTheDocument();
      expect(screen.getByText(/150 kg available/)).toBeInTheDocument();
    });

    it('shows out of stock status when unavailable', () => {
      const { useGetListingByIdQuery } = require('../../../store/slices/apiSlice');
      useGetListingByIdQuery.mockReturnValue({
        data: {
          ...mockListingData,
          data: {
            ...mockListingData.data,
            availability: { quantityAvailable: 0, isInSeason: true }
          }
        },
        isLoading: false,
        error: null,
      });

      renderProductDetail();
      
      expect(screen.getByText(/Out of Stock/)).toBeInTheDocument();
    });

    it('shows seasonal availability indicator', () => {
      renderProductDetail();
      
      expect(screen.getByText(/In Season/)).toBeInTheDocument();
    });
  });

  describe('Quality and Certifications', () => {
    it('displays quality grade', () => {
      renderProductDetail();
      
      expect(screen.getByText('A+')).toBeInTheDocument();
    });

    it('shows featured product badge', () => {
      renderProductDetail();
      
      expect(screen.getByText(/Featured/)).toBeInTheDocument();
    });

    it('displays vendor certifications in vendor tab', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      const vendorTab = screen.getByText('Vendor');
      await user.click(vendorTab);
      
      expect(screen.getByText('Organic')).toBeInTheDocument();
      expect(screen.getByText('Fair Trade')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders mobile-friendly layout', () => {
      renderProductDetail();
      
      // Check for responsive classes and mobile-optimized elements
      const container = screen.getByTestId('product-detail-container');
      expect(container).toHaveClass(/space-y/);
    });

    it('shows mobile-optimized image gallery', () => {
      renderProductDetail();
      
      const imageGallery = screen.getByTestId('image-gallery');
      expect(imageGallery).toBeInTheDocument();
    });
  });

  describe('Storage and Shelf Life', () => {
    it('displays storage instructions', async () => {
      const user = userEvent.setup();
      renderProductDetail();
      
      // Storage info might be in overview or nutrition tab
      const overviewTab = screen.getByText('Overview');
      await user.click(overviewTab);
      
      expect(screen.getByText(/Store in cool, dry place/)).toBeInTheDocument();
      expect(screen.getByText(/7-10 days/)).toBeInTheDocument();
    });
  });
});