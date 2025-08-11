import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test/test-utils';
import ListingManagement from '../ListingManagement';

// Mock the API slice
vi.mock('../../../store/slices/apiSlice', () => ({
  useGetVendorListingsQuery: vi.fn(),
  useDeleteListingMutation: vi.fn(),
  useUpdateListingStatusMutation: vi.fn(),
  useBulkUpdateListingsMutation: vi.fn(),
  useBulkDeleteListingsMutation: vi.fn()
}));

// Mock the child components
vi.mock('../../../components/vendor/ListingStatusToggle', () => ({
  default: ({ listing, variant }) => (
    <div data-testid={`status-toggle-${listing.id}`} data-variant={variant}>
      Status: {listing.status}
    </div>
  )
}));

vi.mock('../../../components/vendor/ListingBulkActions', () => ({
  default: ({ selectedListings, onClearSelection }) => (
    <div data-testid="bulk-actions">
      {selectedListings.length > 0 && (
        <>
          <span>Bulk Actions: {selectedListings.length} selected</span>
          <button onClick={onClearSelection}>Clear Selection</button>
        </>
      )}
    </div>
  )
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

import {
  useGetVendorListingsQuery,
  useDeleteListingMutation,
  useUpdateListingStatusMutation,
  useBulkUpdateListingsMutation,
  useBulkDeleteListingsMutation
} from '../../../store/slices/apiSlice';

const mockListingsData = {
  data: {
    listings: [
      {
        id: 'listing_1',
        product: {
          id: 'product_1',
          name: 'Fresh Tomatoes',
          category: { name: 'Vegetables' }
        },
        pricing: [{
          pricePerUnit: 25.50,
          unit: 'kg'
        }],
        availability: {
          quantityAvailable: 100
        },
        status: 'active',
        description: 'Farm fresh organic tomatoes',
        images: [{ url: 'https://example.com/tomato.jpg' }],
        updatedAt: '2024-01-01T12:00:00.000Z',
        discount: {
          value: 10
        }
      },
      {
        id: 'listing_2',
        product: {
          id: 'product_2',
          name: 'Fresh Carrots',
          category: { name: 'Vegetables' }
        },
        pricing: [{
          pricePerUnit: 18.00,
          unit: 'kg'
        }],
        availability: {
          quantityAvailable: 50
        },
        status: 'inactive',
        description: 'Organic carrots from local farm',
        images: [],
        updatedAt: '2024-01-02T10:30:00.000Z'
      },
      {
        id: 'listing_3',
        product: {
          id: 'product_3',
          name: 'Bell Peppers',
          category: { name: 'Vegetables' }
        },
        pricing: [{
          pricePerUnit: 35.00,
          unit: 'kg'
        }],
        availability: {
          quantityAvailable: 0
        },
        status: 'out_of_stock',
        description: 'Colorful bell peppers',
        images: [{ url: 'https://example.com/pepper.jpg' }],
        updatedAt: '2024-01-03T14:15:00.000Z'
      }
    ],
    pagination: {
      current: 1,
      pages: 2,
      totalListings: 25,
      totalPages: 2
    },
    stats: {
      activeListings: 15,
      inactiveListings: 5,
      outOfStockListings: 5
    }
  }
};

const defaultAuthState = {
  user: {
    id: 'vendor_1',
    name: 'Test Vendor',
    role: 'vendor'
  },
  token: 'test-token'
};

describe('ListingManagement', () => {
  const mockDeleteListing = vi.fn();
  const mockUpdateListingStatus = vi.fn();
  const mockBulkUpdateListings = vi.fn();
  const mockBulkDeleteListings = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful responses
    useGetVendorListingsQuery.mockReturnValue({
      data: mockListingsData,
      isLoading: false,
      error: null,
      refetch: mockRefetch
    });
    
    useDeleteListingMutation.mockReturnValue([mockDeleteListing, { isLoading: false }]);
    useUpdateListingStatusMutation.mockReturnValue([mockUpdateListingStatus, { isLoading: false }]);
    useBulkUpdateListingsMutation.mockReturnValue([mockBulkUpdateListings, { isLoading: false }]);
    useBulkDeleteListingsMutation.mockReturnValue([mockBulkDeleteListings, { isLoading: false }]);
    
    // Mock successful mutation responses
    mockDeleteListing.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockUpdateListingStatus.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockBulkUpdateListings.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
    mockBulkDeleteListings.mockResolvedValue({ unwrap: () => Promise.resolve({}) });
  });

  describe('Loading States', () => {
    it('shows loading spinner when listings are loading', async () => {
      useGetVendorListingsQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Loading listings...')).toBeInTheDocument();
    });
  });

  describe('Error States', () => {
    it('shows error state when listings fail to load', async () => {
      useGetVendorListingsQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { message: 'Network error' },
        refetch: mockRefetch
      });

      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Failed to load listings')).toBeInTheDocument();
      
      const retryButton = screen.getByRole('button', { name: 'Retry' });
      expect(retryButton).toBeInTheDocument();
      
      await userEvent.click(retryButton);
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  describe('Page Header', () => {
    it('renders page title and description', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByText('Listing Management')).toBeInTheDocument();
      expect(screen.getByText('Manage your product listings, inventory, and pricing')).toBeInTheDocument();
    });

    it('displays stats summary', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.getByText('15 Active')).toBeInTheDocument();
        expect(screen.getByText('5 Inactive')).toBeInTheDocument();
        expect(screen.getByText('5 Out of Stock')).toBeInTheDocument();
      });
    });

    it('has action buttons', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add listing/i })).toBeInTheDocument();
    });
  });

  describe('Search and Filters', () => {
    it('renders search bar', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const searchInput = screen.getByPlaceholderText('Search listings by product name, description...');
      expect(searchInput).toBeInTheDocument();
    });

    it('has filters toggle button', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      expect(filtersButton).toBeInTheDocument();
    });

    it('shows/hides expanded filters when toggle clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const filtersButton = screen.getByRole('button', { name: /filters/i });
      
      // Filters should be hidden initially
      expect(screen.queryByText('Status')).not.toBeInTheDocument();
      
      // Click to show filters
      await user.click(filtersButton);
      
      await waitFor(() => {
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Sort By')).toBeInTheDocument();
        expect(screen.getByText('Sort Order')).toBeInTheDocument();
      });
    });
  });

  describe('Listings Display', () => {
    it('renders listings in desktop table view', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Check table headers
        expect(screen.getByText('Product')).toBeInTheDocument();
        expect(screen.getByText('Price')).toBeInTheDocument();
        expect(screen.getByText('Stock')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
        expect(screen.getByText('Actions')).toBeInTheDocument();
        
        // Check listing data
        expect(screen.getByText('Fresh Tomatoes')).toBeInTheDocument();
        expect(screen.getByText('Fresh Carrots')).toBeInTheDocument();
        expect(screen.getByText('Bell Peppers')).toBeInTheDocument();
        
        // Check prices
        expect(screen.getByText('৳25.5/kg')).toBeInTheDocument();
        expect(screen.getByText('৳18/kg')).toBeInTheDocument();
        expect(screen.getByText('৳35/kg')).toBeInTheDocument();
        
        // Check stock
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText('50')).toBeInTheDocument();
        expect(screen.getByText('0')).toBeInTheDocument();
      });
    });

    it('shows discount information when available', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.getByText('10% off')).toBeInTheDocument();
      });
    });
  });

  describe('Selection Management', () => {
    it('allows selecting individual listings', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4); // 3 listings + select all
      });
      
      const firstListingCheckbox = screen.getAllByRole('checkbox')[1]; // Skip select all
      await user.click(firstListingCheckbox);
      
      // Should show bulk actions
      await waitFor(() => {
        expect(screen.getByText('Bulk Actions: 1 selected')).toBeInTheDocument();
      });
    });

    it('allows selecting all listings', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        const selectAllCheckbox = screen.getAllByRole('checkbox')[0]; // First checkbox is select all
        user.click(selectAllCheckbox);
      });
      
      await waitFor(() => {
        expect(screen.getByText('Bulk Actions: 3 selected')).toBeInTheDocument();
      });
    });

    it('can clear selection through bulk actions', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Select first listing
      await waitFor(() => {
        const firstListingCheckbox = screen.getAllByRole('checkbox')[1];
        user.click(firstListingCheckbox);
      });
      
      // Clear selection
      await waitFor(() => {
        const clearButton = screen.getByText('Clear Selection');
        user.click(clearButton);
      });
      
      // Bulk actions should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Bulk Actions:')).not.toBeInTheDocument();
      });
    });
  });

  describe('Status Toggle Integration', () => {
    it('renders ListingStatusToggle components', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.getByTestId('status-toggle-listing_1')).toBeInTheDocument();
        expect(screen.getByTestId('status-toggle-listing_2')).toBeInTheDocument();
        expect(screen.getByTestId('status-toggle-listing_3')).toBeInTheDocument();
      });
    });
  });

  describe('Bulk Actions Integration', () => {
    it('renders ListingBulkActions component', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(screen.getByTestId('bulk-actions')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('navigates to create listing page', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const addListingButton = screen.getByRole('button', { name: /add listing/i });
      await user.click(addListingButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/vendor/listings/create');
    });

    it('navigates to edit listing page', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(async () => {
        const editButtons = screen.getAllByTitle('Edit listing');
        expect(editButtons).toHaveLength(3);
        
        await user.click(editButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/vendor/listings/listing_1/edit');
      });
    });

    it('navigates to listing details page', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(async () => {
        const viewButtons = screen.getAllByTitle('View details');
        expect(viewButtons).toHaveLength(3);
        
        await user.click(viewButtons[0]);
        expect(mockNavigate).toHaveBeenCalledWith('/vendor/listings/listing_1');
      });
    });
  });

  describe('Pagination', () => {
    it('renders pagination when there are multiple pages', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Pagination should be rendered since totalPages = 2
        const paginationElement = screen.getByTestId('pagination');
        expect(paginationElement).toBeInTheDocument();
      });
    });

    it('does not render pagination when there is only one page', async () => {
      const singlePageData = {
        ...mockListingsData,
        data: {
          ...mockListingsData.data,
          pagination: {
            ...mockListingsData.data.pagination,
            totalPages: 1
          }
        }
      };
      
      useGetVendorListingsQuery.mockReturnValue({
        data: singlePageData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.queryByTestId('pagination')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('shows empty state when no listings exist', async () => {
      const emptyData = {
        data: {
          listings: [],
          pagination: { current: 1, pages: 0, totalListings: 0 },
          stats: { activeListings: 0, inactiveListings: 0, outOfStockListings: 0 }
        }
      };
      
      useGetVendorListingsQuery.mockReturnValue({
        data: emptyData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        expect(screen.getByText('No listings found')).toBeInTheDocument();
        expect(screen.getByText('You haven\'t created any listings yet.')).toBeInTheDocument();
      });
    });

    it('shows no results message when search yields no results', async () => {
      const emptySearchData = {
        data: {
          listings: [],
          pagination: { current: 1, pages: 0, totalListings: 0 },
          stats: { activeListings: 0, inactiveListings: 0, outOfStockListings: 0 }
        }
      };
      
      useGetVendorListingsQuery.mockReturnValue({
        data: emptySearchData,
        isLoading: false,
        error: null,
        refetch: mockRefetch
      });

      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      // Add search term to trigger search state
      const user = userEvent.setup();
      const searchInput = screen.getByPlaceholderText('Search listings by product name, description...');
      await user.type(searchInput, 'nonexistent product');

      await waitFor(() => {
        expect(screen.getByText('No listings match your search criteria.')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('applies mobile-first responsive classes', async () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      await waitFor(() => {
        // Check for responsive table (hidden on mobile)
        const desktopTable = document.querySelector('.hidden.lg\\:block');
        expect(desktopTable).toBeInTheDocument();
        
        // Check for mobile cards (hidden on desktop)
        const mobileCards = document.querySelector('.lg\\:hidden');
        expect(mobileCards).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('calls API with correct parameters', () => {
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      expect(useGetVendorListingsQuery).toHaveBeenCalledWith({
        page: 1,
        limit: 15,
        search: undefined,
        status: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
    });

    it('refetches data when refresh button is clicked', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(<ListingManagement />, {
        preloadedState: { auth: defaultAuthState }
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);
      
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});