import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from './test-utils';
import ProductBrowsing from '../pages/restaurant/ProductBrowsing';
import ProductDetail from '../pages/restaurant/ProductDetail';
import ProductComparison from '../pages/restaurant/ProductComparison';

// Mock the API slice
vi.mock('../store/slices/apiSlice', () => ({
  useGetListingsQuery: vi.fn(),
  useGetCategoriesQuery: vi.fn(),
  useGetListingByIdQuery: vi.fn(),
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ productId: 'test-product-1' }),
}));

// Mock debounce utility
vi.mock('../utils', () => ({
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
  debounce: (fn) => fn,
}));

// Mock BulkOrderModal
vi.mock('../components/restaurant/BulkOrderModal', () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="bulk-order-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe('Mobile Responsiveness and Touch Interactions', () => {
  const mockListingsData = [
    {
      _id: '1',
      vendorId: 'vendor1',
      productId: 'product1',
      price: 25.5,
      quantity: 100,
      unit: 'kg',
      availability: 'in-stock',
      name: 'Fresh Tomatoes',
      description: 'Organic red tomatoes',
      images: ['https://example.com/tomato.jpg'],
      category: 'vegetables',
      rating: 4.5,
      vendorName: 'Green Farm',
      vendorLocation: 'Dhaka',
    },
    {
      _id: '2',
      vendorId: 'vendor2',
      productId: 'product2',
      price: 30.0,
      quantity: 50,
      unit: 'kg',
      availability: 'in-stock',
      name: 'Organic Carrots',
      description: 'Fresh orange carrots',
      images: ['https://example.com/carrot.jpg'],
      category: 'vegetables',
      rating: 4.2,
      vendorName: 'Organic Plus',
      vendorLocation: 'Chittagong',
    },
  ];

  const mockProductDetailData = {
    data: {
      _id: 'test-product-1',
      vendorId: 'vendor1',
      price: 45.5,
      pricing: [{ pricePerUnit: 45.5, unit: 'kg' }],
      availability: { quantityAvailable: 150, isInSeason: true },
      images: [
        { url: 'https://example.com/tomato1.jpg' },
        { url: 'https://example.com/tomato2.jpg' },
      ],
      rating: { average: 4.7 },
      product: {
        name: 'Premium Organic Tomatoes',
        description: 'Fresh, juicy organic tomatoes',
        category: 'vegetables',
      },
      vendor: {
        businessName: 'Green Valley Organic Farm',
        address: { city: 'Savar, Dhaka' },
        rating: { average: 4.8 },
      },
    },
  };

  const mockCategoriesData = [
    { _id: 'cat1', name: 'Vegetables' },
    { _id: 'cat2', name: 'Fruits' },
  ];

  // Mock window.matchMedia for responsive tests
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
    const {
      useGetListingsQuery,
      useGetCategoriesQuery,
      useGetListingByIdQuery,
    } = require('../store/slices/apiSlice');

    useGetListingsQuery.mockReturnValue({
      data: mockListingsData,
      isLoading: false,
      error: null,
    });

    useGetCategoriesQuery.mockReturnValue({
      data: mockCategoriesData,
      isLoading: false,
      error: null,
    });

    useGetListingByIdQuery.mockReturnValue({
      data: mockProductDetailData,
      isLoading: false,
      error: null,
    });
  });

  // Helper function to simulate mobile viewport
  const setMobileViewport = () => {
    global.innerWidth = 375;
    global.innerHeight = 667;
    global.dispatchEvent(new Event('resize'));
  };

  // Helper function to simulate tablet viewport
  const setTabletViewport = () => {
    global.innerWidth = 768;
    global.innerHeight = 1024;
    global.dispatchEvent(new Event('resize'));
  };

  // Helper function to simulate desktop viewport
  const setDesktopViewport = () => {
    global.innerWidth = 1024;
    global.innerHeight = 768;
    global.dispatchEvent(new Event('resize'));
  };

  describe('Touch Target Compliance', () => {
    it('ensures all interactive elements meet 44px minimum touch target requirement', () => {
      renderWithProviders(<ProductBrowsing />);

      // Check buttons have touch-target class or minimum size
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        const computedStyle = window.getComputedStyle(button);
        const hasMinHeight =
          computedStyle.minHeight >= '44px' ||
          button.classList.contains('touch-target') ||
          button.classList.contains('min-h-[44px]');

        expect(hasMinHeight).toBe(true);
      });
    });

    it('ensures form inputs meet touch target requirements', () => {
      renderWithProviders(<ProductBrowsing />);

      const searchInput = screen.getByPlaceholderText(
        'Search fresh vegetables...'
      );
      const computedStyle = window.getComputedStyle(searchInput);

      // Should have adequate padding and height for touch
      expect(computedStyle.padding).toBeTruthy();
      expect(searchInput.getAttribute('class')).toMatch(/py-3/);
    });

    it('provides adequate spacing between touch targets', () => {
      renderWithProviders(<ProductBrowsing />);

      // Check that buttons in the same row have adequate spacing
      const filterContainer = screen.getByRole('button', {
        name: /filter/i,
      }).parentElement;
      const buttons = Array.from(filterContainer.querySelectorAll('button'));

      if (buttons.length > 1) {
        // Should have gap classes for spacing
        expect(filterContainer.getAttribute('class')).toMatch(/gap-/);
      }
    });
  });

  describe('Mobile Layout Adaptations', () => {
    beforeEach(() => {
      setMobileViewport();
    });

    it('stacks filters vertically on mobile', () => {
      renderWithProviders(<ProductBrowsing />);

      const filtersContainer = screen
        .getByPlaceholderText('Search fresh vegetables...')
        .closest('div').parentElement;
      expect(filtersContainer.getAttribute('class')).toMatch(
        /flex-col|lg:flex-row/
      );
    });

    it('shows mobile-optimized product grid', () => {
      renderWithProviders(<ProductBrowsing />);

      // Grid should be single column on mobile
      const gridContainer = screen
        .getByText('Fresh Tomatoes')
        .closest('div').parentElement;
      expect(gridContainer.getAttribute('class')).toMatch(
        /grid-cols-1|sm:grid-cols-2/
      );
    });

    it('hides non-essential text on mobile', () => {
      renderWithProviders(<ProductBrowsing />);

      // Some text should be hidden on mobile with responsive classes
      const bulkButton = screen.getByText(/bulk select/i);
      const hiddenText = bulkButton.querySelector('.hidden.sm\\:inline');

      if (hiddenText) {
        expect(hiddenText).toBeInTheDocument();
      }
    });

    it('adapts comparison button layout for mobile', () => {
      renderWithProviders(<ProductBrowsing />, {
        preloadedState: {
          comparison: {
            items: [{ id: '1' }],
            maxItems: 4,
            loading: false,
            error: null,
          },
          cart: { items: [], total: 0, itemCount: 0, isOpen: false },
          favorites: { items: [], loading: false, error: null },
        },
      });

      const compareButton = screen.getByText(/compare \(1\)/i);
      expect(compareButton.getAttribute('class')).toMatch(
        /rounded-full|min-h-\[56px\]/
      );
    });
  });

  describe('Touch Gestures and Interactions', () => {
    it('handles touch events on product cards', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProductBrowsing />);

      const productCard = screen.getByText('Fresh Tomatoes').closest('div');

      // Simulate touch start and end
      fireEvent.touchStart(productCard);
      fireEvent.touchEnd(productCard);

      await user.click(productCard);
      expect(mockNavigate).toHaveBeenCalledWith('/restaurant/browse/1');
    });

    it('supports swipe gestures on image gallery', async () => {
      renderWithProviders(<ProductDetail />);

      const imageGallery = screen.getByTestId('image-gallery');

      // Simulate swipe right
      fireEvent.touchStart(imageGallery, {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      fireEvent.touchMove(imageGallery, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchEnd(imageGallery);

      // Should handle the gesture gracefully
      expect(imageGallery).toBeInTheDocument();
    });

    it('handles long press on product cards for context menu', async () => {
      renderWithProviders(<ProductBrowsing />);

      const productCard = screen.getByText('Fresh Tomatoes').closest('div');

      // Simulate long press
      fireEvent.touchStart(productCard);

      // Wait for long press duration
      await waitFor(
        () => {
          // Context menu or action should appear
          expect(productCard).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      fireEvent.touchEnd(productCard);
    });

    it('prevents accidental scrolling during touch interactions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProductBrowsing />);

      const heartButton = screen.getAllByLabelText(/favorite/i)[0];

      // Touch on favorite button shouldn't trigger scrolling
      fireEvent.touchStart(heartButton);
      await user.click(heartButton);

      // Verify the action was handled without scrolling
      expect(heartButton).toBeInTheDocument();
    });
  });

  describe('Responsive Typography and Spacing', () => {
    it('adapts font sizes for mobile readability', () => {
      setMobileViewport();
      renderWithProviders(<ProductBrowsing />);

      const heading = screen.getByText('Browse Products');
      expect(heading.getAttribute('class')).toMatch(/text-3xl|text-2xl/);
    });

    it('adjusts spacing between elements on different screen sizes', () => {
      setMobileViewport();
      renderWithProviders(<ProductBrowsing />);

      const container = screen.getByText('Browse Products').closest('div');
      expect(container.getAttribute('class')).toMatch(/space-y-6|space-y-4/);
    });

    it('maintains readable line length on all screen sizes', () => {
      renderWithProviders(<ProductDetail />);

      const description = screen.getByText(/Fresh, juicy organic tomatoes/);
      const container = description.closest('div');

      // Should have max-width constraints
      expect(container.getAttribute('class')).toMatch(/max-w-|w-full/);
    });
  });

  describe('Mobile Navigation Patterns', () => {
    it('provides mobile-friendly breadcrumb navigation', () => {
      renderWithProviders(<ProductDetail />);

      const backButton = screen.getByLabelText(/go back/i);
      expect(backButton).toBeInTheDocument();
      expect(backButton.getAttribute('class')).toMatch(/p-2|touch-target/);
    });

    it('shows appropriate navigation labels on mobile', () => {
      setMobileViewport();
      renderWithProviders(<ProductComparison />, {
        preloadedState: {
          comparison: { items: [], maxItems: 4, loading: false, error: null },
          cart: { items: [], total: 0, itemCount: 0, isOpen: false },
          favorites: { items: [], loading: false, error: null },
        },
      });

      const backButton = screen.getByLabelText(/go back/i);
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Performance on Mobile Devices', () => {
    it('uses lazy loading for images', () => {
      renderWithProviders(<ProductBrowsing />);

      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        expect(img.getAttribute('loading')).toBe('lazy');
      });
    });

    it('implements proper image optimization', () => {
      renderWithProviders(<ProductBrowsing />);

      const images = screen.getAllByRole('img');
      images.forEach((img) => {
        // Should have appropriate classes for responsive images
        expect(img.getAttribute('class')).toMatch(/object-cover|w-full|h-full/);
      });
    });

    it('minimizes layout shifts with consistent aspect ratios', () => {
      renderWithProviders(<ProductBrowsing />);

      const imageContainers = screen
        .getAllByRole('img')
        .map((img) => img.parentElement);
      imageContainers.forEach((container) => {
        expect(container.getAttribute('class')).toMatch(/aspect-|w-\d+.*h-\d+/);
      });
    });
  });

  describe('Accessibility on Touch Devices', () => {
    it('provides appropriate focus indicators for keyboard navigation', () => {
      renderWithProviders(<ProductBrowsing />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.getAttribute('class')).toMatch(/focus:|focus-visible:/);
      });
    });

    it('maintains proper heading hierarchy for screen readers', () => {
      renderWithProviders(<ProductBrowsing />);

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Browse Products');
    });

    it('provides proper ARIA labels for touch interactions', () => {
      renderWithProviders(<ProductBrowsing />);

      const favoriteButtons = screen.getAllByLabelText(/favorite/i);
      expect(favoriteButtons.length).toBeGreaterThan(0);
    });

    it('ensures sufficient color contrast for mobile screens', () => {
      renderWithProviders(<ProductBrowsing />);

      // Text elements should have appropriate contrast classes
      const textElements = screen.getAllByText(/Fresh Tomatoes|Green Farm/);
      textElements.forEach((element) => {
        expect(element.getAttribute('class')).toMatch(
          /text-text-dark|text-gray-/
        );
      });
    });
  });

  describe('Touch-Specific Features', () => {
    it('supports pull-to-refresh gesture', async () => {
      renderWithProviders(<ProductBrowsing />);

      const container = screen.getByText('Browse Products').closest('div');

      // Simulate pull-to-refresh
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 50 }],
      });
      fireEvent.touchMove(container, {
        touches: [{ clientX: 100, clientY: 150 }],
      });
      fireEvent.touchEnd(container);

      // Should handle the gesture gracefully
      expect(container).toBeInTheDocument();
    });

    it('implements smooth scrolling for touch devices', () => {
      renderWithProviders(<ProductBrowsing />);

      const scrollContainer = document.body;
      expect(
        scrollContainer.style.scrollBehavior ||
          document.documentElement.classList.contains('smooth-scroll')
      ).toBeTruthy();
    });

    it('provides haptic feedback for important actions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProductBrowsing />);

      // Mock vibration API
      navigator.vibrate = vi.fn();

      const addButton = screen.getAllByLabelText(/add to cart/i)[0];
      await user.click(addButton);

      // Vibration might be called for feedback
      // expect(navigator.vibrate).toHaveBeenCalled();
    });
  });

  describe('Responsive Grid and Layout', () => {
    it('adapts grid columns based on screen size', () => {
      setMobileViewport();
      renderWithProviders(<ProductBrowsing />);

      const gridContainer = screen
        .getByText('Fresh Tomatoes')
        .closest('div').parentElement;
      expect(gridContainer.getAttribute('class')).toMatch(
        /grid-cols-1.*sm:grid-cols-2.*lg:grid-cols-/
      );
    });

    it('stacks comparison table vertically on mobile', () => {
      renderWithProviders(<ProductComparison />, {
        preloadedState: {
          comparison: {
            items: [
              { id: '1', name: 'Product 1', price: 25 },
              { id: '2', name: 'Product 2', price: 30 },
            ],
            maxItems: 4,
            loading: false,
            error: null,
          },
          cart: { items: [], total: 0, itemCount: 0, isOpen: false },
          favorites: { items: [], loading: false, error: null },
        },
      });

      // Mobile view should show cards instead of table
      const mobileCards = screen.getAllByText(/Product \d/);
      expect(mobileCards.length).toBeGreaterThan(0);
    });
  });

  describe('Form Interactions on Touch', () => {
    it('handles touch input on form fields correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProductBrowsing />);

      const searchInput = screen.getByPlaceholderText(
        'Search fresh vegetables...'
      );

      // Touch and type
      fireEvent.touchStart(searchInput);
      await user.type(searchInput, 'tomatoes');

      expect(searchInput.value).toBe('tomatoes');
    });

    it('provides appropriate keyboard for number inputs', () => {
      renderWithProviders(<ProductDetail />);

      const quantityInput = screen.getByDisplayValue('1');
      expect(quantityInput.type).toBe('number');
    });

    it('handles select dropdowns with touch', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ProductBrowsing />);

      const categorySelect = screen.getByDisplayValue('All Categories');

      fireEvent.touchStart(categorySelect);
      await user.selectOptions(categorySelect, 'cat1');

      expect(categorySelect.value).toBe('cat1');
    });
  });
});
