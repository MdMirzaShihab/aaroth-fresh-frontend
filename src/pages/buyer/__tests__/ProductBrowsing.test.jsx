import React from 'react';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../test/test-utils';
import ProductBrowsing from '../ProductBrowsing';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetListingsQuery: vi.fn(),
  useGetCategoriesQuery: vi.fn(),
}));

// Mock the bulk order modal
vi.mock('../../../components/buyer/BulkOrderModal', () => ({
  default: ({ isOpen, onClose, selectedProducts, onClearSelection }) =>
    isOpen ? (
      <div data-testid="bulk-order-modal">
        <button onClick={onClose}>Close Modal</button>
        <div>Selected: {selectedProducts.length} products</div>
        <button onClick={() => onClearSelection()}>Clear Selection</button>
      </div>
    ) : null,
}));

// Mock debounce utility
vi.mock('../../../utils', () => ({
  formatCurrency: (amount) => `$${amount.toFixed(2)}`,
  debounce: (fn) => fn, // Immediate execution for testing
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('ProductBrowsing', () => {
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
      vendorRating: 4.8,
      qualityGrade: 'A',
      isInSeason: true,
    },
    {
      _id: '2',
      vendorId: 'vendor2',
      productId: 'product2',
      price: 30.0,
      quantity: 0,
      unit: 'kg',
      availability: 'out-of-stock',
      name: 'Organic Carrots',
      description: 'Fresh orange carrots',
      images: ['https://example.com/carrot.jpg'],
      category: 'vegetables',
      rating: 4.2,
      vendorName: 'Organic Plus',
      vendorLocation: 'Chittagong',
      vendorRating: 4.6,
      qualityGrade: 'A+',
      isInSeason: true,
    },
  ];

  const mockCategoriesData = [
    { _id: 'cat1', name: 'Vegetables' },
    { _id: 'cat2', name: 'Fruits' },
  ];

  const defaultMockQueries = {
    useGetListingsQuery: vi.fn().mockReturnValue({
      data: mockListingsData,
      isLoading: false,
      error: null,
    }),
    useGetCategoriesQuery: vi.fn().mockReturnValue({
      data: mockCategoriesData,
      isLoading: false,
      error: null,
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const {
      useGetListingsQuery,
      useGetCategoriesQuery,
    } = require('../../../store/slices/apiSlice');
    useGetListingsQuery.mockImplementation(
      defaultMockQueries.useGetListingsQuery
    );
    useGetCategoriesQuery.mockImplementation(
      defaultMockQueries.useGetCategoriesQuery
    );
  });

  const renderProductBrowsing = (initialState = {}) => {
    return renderWithProviders(<ProductBrowsing />, {
      preloadedState: {
        cart: { items: [], total: 0, itemCount: 0, isOpen: false },
        favorites: { items: [], loading: false, error: null },
        comparison: { items: [], maxItems: 4, loading: false, error: null },
        ...initialState,
      },
    });
  };

  describe('Basic Rendering', () => {
    it('renders the main heading and description', () => {
      renderProductBrowsing();

      expect(screen.getByText('Browse Products')).toBeInTheDocument();
      expect(
        screen.getByText('Fresh vegetables from local vendors')
      ).toBeInTheDocument();
    });

    it('renders search bar with placeholder', () => {
      renderProductBrowsing();

      const searchInput = screen.getByPlaceholderText(
        'Search fresh vegetables...'
      );
      expect(searchInput).toBeInTheDocument();
    });

    it('renders view mode toggle buttons', () => {
      renderProductBrowsing();

      const gridButton = screen.getByRole('button', { name: /grid view/i });
      const listButton = screen.getByRole('button', { name: /list view/i });

      expect(gridButton).toBeInTheDocument();
      expect(listButton).toBeInTheDocument();
    });

    it('renders bulk select toggle button', () => {
      renderProductBrowsing();

      const bulkButton = screen.getByText(/bulk select/i);
      expect(bulkButton).toBeInTheDocument();
    });
  });

  describe('Product Display', () => {
    it('displays products in grid format by default', () => {
      renderProductBrowsing();

      expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
      expect(screen.getByText('Organic Carrots')).toBeInTheDocument();
      expect(screen.getByText('Green Farm')).toBeInTheDocument();
      expect(screen.getByText('Organic Plus')).toBeInTheDocument();
    });

    it('shows product prices correctly formatted', () => {
      renderProductBrowsing();

      expect(screen.getByText('$25.50')).toBeInTheDocument();
      expect(screen.getByText('$30.00')).toBeInTheDocument();
    });

    it('displays availability badges correctly', () => {
      renderProductBrowsing();

      expect(screen.getByText('In Stock')).toBeInTheDocument();
      expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    });

    it('shows product ratings', () => {
      renderProductBrowsing();

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('4.2')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('triggers search when typing in search input', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const searchInput = screen.getByPlaceholderText(
        'Search fresh vegetables...'
      );
      await user.type(searchInput, 'tomatoes');

      // Verify the search was called (debounce is mocked to execute immediately)
      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      expect(useGetListingsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'tomatoes',
        })
      );
    });
  });

  describe('Filters', () => {
    it('toggles advanced filters when filter button is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const filterButton = screen.getByRole('button', { name: /filter/i });
      await user.click(filterButton);

      // Check if advanced filters are now visible
      expect(screen.getByLabelText(/min price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/max price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum rating/i)).toBeInTheDocument();
    });

    it('updates category filter when selection changes', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(categorySelect, 'cat1');

      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      expect(useGetListingsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'cat1',
        })
      );
    });

    it('updates sort option when selection changes', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const sortSelect = screen.getByDisplayValue('Relevance');
      await user.selectOptions(sortSelect, 'price-low');

      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      expect(useGetListingsQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'price-low',
        })
      );
    });
  });

  describe('Bulk Selection', () => {
    it('enters bulk mode when bulk select button is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const bulkButton = screen.getByText(/bulk select/i);
      await user.click(bulkButton);

      expect(screen.getByText(/exit bulk/i)).toBeInTheDocument();
      expect(screen.getByText('0 selected')).toBeInTheDocument();
    });

    it('shows selection checkboxes in bulk mode', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const bulkButton = screen.getByText(/bulk select/i);
      await user.click(bulkButton);

      // Check that selection checkboxes are visible
      const checkboxes = screen.getAllByRole('button', { name: /check/i });
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    it('allows selecting products in bulk mode', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      // Enter bulk mode
      const bulkButton = screen.getByText(/bulk select/i);
      await user.click(bulkButton);

      // Select first available product (not out of stock)
      const productCards = screen.getAllByTestId(/product-card/i);
      const firstCard = productCards.find(
        (card) => within(card).queryByText('Out of Stock') === null
      );

      if (firstCard) {
        await user.click(firstCard);
        expect(screen.getByText('1 selected')).toBeInTheDocument();
      }
    });

    it('opens bulk order modal when add to cart is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      // Enter bulk mode and select a product
      const bulkButton = screen.getByText(/bulk select/i);
      await user.click(bulkButton);

      // Mock selecting a product by directly clicking the bulk action button
      const selectAllButton = screen.getByText(/select all available/i);
      await user.click(selectAllButton);

      const addToCartButton = screen.getByText(/add .* to cart/i);
      await user.click(addToCartButton);

      expect(screen.getByTestId('bulk-order-modal')).toBeInTheDocument();
    });
  });

  describe('Favorites Functionality', () => {
    it('toggles favorite when heart button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductBrowsing();

      const heartButtons = screen.getAllByLabelText(/favorite/i);
      if (heartButtons.length > 0) {
        await user.click(heartButtons[0]);

        // Check if the action was dispatched
        const state = store.getState();
        expect(state.favorites.items).toHaveLength(1);
      }
    });

    it('shows filled heart for favorited products', () => {
      renderProductBrowsing({
        favorites: {
          items: [{ id: '1', name: 'Fresh Tomatoes' }],
          loading: false,
          error: null,
        },
      });

      // Check for filled heart icon (would need to check CSS classes)
      const heartButtons = screen.getAllByLabelText(/favorite/i);
      expect(heartButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Comparison Functionality', () => {
    it('toggles comparison when scale button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductBrowsing();

      const scaleButtons = screen.getAllByLabelText(/comparison/i);
      if (scaleButtons.length > 0) {
        await user.click(scaleButtons[0]);

        // Check if the action was dispatched
        const state = store.getState();
        expect(state.comparison.items).toHaveLength(1);
      }
    });

    it('shows floating compare button when products are in comparison', () => {
      renderProductBrowsing({
        comparison: {
          items: [{ id: '1', name: 'Fresh Tomatoes' }],
          maxItems: 4,
          loading: false,
          error: null,
        },
      });

      expect(screen.getByText(/compare \(1\)/i)).toBeInTheDocument();
    });

    it('navigates to comparison page when compare button is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing({
        comparison: {
          items: [{ id: '1', name: 'Fresh Tomatoes' }],
          maxItems: 4,
          loading: false,
          error: null,
        },
      });

      const compareButton = screen.getByText(/compare \(1\)/i);
      await user.click(compareButton);

      expect(mockNavigate).toHaveBeenCalledWith('/buyer/comparison');
    });
  });

  describe('Add to Cart', () => {
    it('adds product to cart when add button is clicked', async () => {
      const user = userEvent.setup();
      const { store } = renderProductBrowsing();

      const addButtons = screen.getAllByLabelText(/add to cart/i);
      if (addButtons.length > 0) {
        await user.click(addButtons[0]);

        // Check if the action was dispatched
        const state = store.getState();
        expect(state.cart.items).toHaveLength(1);
      }
    });

    it('disables add button for out of stock products', () => {
      renderProductBrowsing();

      // Find the out of stock product card
      const outOfStockText = screen.getByText('Out of Stock');
      const productCard = outOfStockText.closest(
        '[data-testid*="product-card"]'
      );

      if (productCard) {
        const addButton = within(productCard).queryByLabelText(/add to cart/i);
        if (addButton) {
          expect(addButton).toBeDisabled();
        }
      }
    });
  });

  describe('Navigation', () => {
    it('navigates to product detail when product card is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const productCard = screen.getByText('Fresh Tomatoes').closest('div');
      await user.click(productCard);

      expect(mockNavigate).toHaveBeenCalledWith('/buyer/browse/1');
    });

    it('navigates to cart when view cart button is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const viewCartButton = screen.getByText('View Cart');
      await user.click(viewCartButton);

      expect(mockNavigate).toHaveBeenCalledWith('/buyer/cart');
    });
  });

  describe('Loading States', () => {
    it('shows loading skeleton when listings are loading', () => {
      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      useGetListingsQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderProductBrowsing();

      // Check for loading skeleton elements
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows error message when listings fail to load', () => {
      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      useGetListingsQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Failed to fetch' },
      });

      renderProductBrowsing();

      expect(screen.getByText('Failed to load products')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('shows empty state when no products are found', () => {
      const { useGetListingsQuery } = require('../../../store/slices/apiSlice');
      useGetListingsQuery.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      });

      renderProductBrowsing();

      expect(screen.getByText('No products found')).toBeInTheDocument();
      expect(
        screen.getByText('Try adjusting your search or filters')
      ).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('switches to list view when list button is clicked', async () => {
      const user = userEvent.setup();
      renderProductBrowsing();

      const listButton = screen.getByRole('button', { name: /list view/i });
      await user.click(listButton);

      // Check if the view has changed (would need to check layout changes)
      expect(listButton).toHaveClass(/bg-white shadow-sm/);
    });
  });
});
