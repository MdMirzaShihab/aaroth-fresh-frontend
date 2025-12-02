import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Grid3x3,
  LayoutGrid,
  Package,
  AlertCircle,
  X,
  ChevronDown,
} from 'lucide-react';
import ProductCard from './ProductCard';
import LoadingSpinner, { CardSkeleton } from '../ui/LoadingSpinner';
import { useGetPublicListingsQuery } from '../../store/slices/apiSlice';

/**
 * ProductGrid Component
 *
 * Modern, performant product grid with:
 * - Integrated toolbar (sort + view toggle + product count)
 * - Active filters display with removal
 * - Infinite scroll pagination
 * - Grid/Compact view modes
 * - Comprehensive loading/error/empty states
 * - Full accessibility support (WCAG 2.1 AA)
 *
 * @param {Object} filters - Filter state from useProductFilters hook
 * @param {Function} updateFilter - Update a single filter
 * @param {Function} removeFilter - Remove a specific filter
 * @param {Function} clearFilters - Clear all filters
 * @param {Function} getFilterLabel - Get display label for a filter
 * @param {boolean} hasActiveFilters - Whether any filters are active
 * @param {number} activeFilterCount - Count of active filters
 * @param {string} className - Optional additional classes
 * @param {boolean} enableInfiniteScroll - Enable/disable infinite scroll (default: true)
 * @param {number} initialLimit - Items per page (default: 20)
 */
const ProductGrid = ({
  filters = {},
  updateFilter = () => {},
  removeFilter = () => {},
  clearFilters = () => {},
  getFilterLabel = () => {},
  hasActiveFilters = false,
  activeFilterCount = 0,
  className = '',
  enableInfiniteScroll = true,
  initialLimit = 20,
}) => {
  const navigate = useNavigate();

  // View mode (persisted to localStorage)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('productGridViewMode') || 'grid';
    } catch {
      return 'grid'; // Fallback if localStorage is disabled
    }
  });

  // Infinite scroll state
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Intersection Observer refs
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // RTK Query - fetch listings
  const { data, isLoading, isFetching, error, refetch } =
    useGetPublicListingsQuery(
      {
        ...filters,
        page: currentPage,
        limit: initialLimit,
      },
      {
        skip: !filters, // Skip if no filters provided
      }
    );

  // Persist view mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('productGridViewMode', viewMode);
    } catch {
      // Silently fail if localStorage is disabled
    }
  }, [viewMode]);

  // Handle data updates (page accumulation)
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        // Replace products on filter change or initial load
        setAllProducts(data.data);
      } else if (enableInfiniteScroll) {
        // Append products for infinite scroll
        setAllProducts((prev) => [...prev, ...data.data]);
      } else {
        // Replace if infinite scroll is disabled
        setAllProducts(data.data);
      }

      // Check if more pages available
      const pagination = data.pagination || {};
      setHasMore(pagination.page < pagination.pages);
    }
  }, [data, currentPage, enableInfiniteScroll]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    setAllProducts([]);

    // Scroll to top on filter change for better UX
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.market,
    filters.organic,
    filters.seasonal,
    filters.sortBy,
    filters.sortOrder,
  ]);

  // Infinite scroll - Intersection Observer
  useEffect(() => {
    if (!enableInfiniteScroll) {
      return undefined; // Explicit return for cleanup function
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetching) {
          setCurrentPage((prev) => prev + 1);
        }
      },
      { rootMargin: '200px' } // Trigger 200px before bottom
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isFetching, enableInfiniteScroll]);

  // Transform listings to product format
  const transformListingToProduct = (listing) => {
    const productId = listing.productId || {};
    const pricing = listing.pricing?.[0] || {};
    const availability = listing.availability || {};

    return {
      // eslint-disable-next-line no-underscore-dangle
      id: listing.id || listing._id,
      name: productId.name || listing.name || 'Unknown Product',
      category: productId.category || listing.category,
      images:
        listing.images?.length > 0
          ? listing.images.map((img) =>
              typeof img === 'string' ? img : img.url
            )
          : productId.images || [],

      // Pricing
      priceRange: pricing.pricePerBaseUnit
        ? {
            min: pricing.pricePerBaseUnit,
            max: pricing.pricePerBaseUnit,
          }
        : productId.priceRange,
      averagePrice:
        listing.effectivePrice ||
        pricing.pricePerUnit ||
        pricing.pricePerBaseUnit,
      unit:
        pricing.unit ||
        availability.unit ||
        productId.standardUnits?.[0]?.name ||
        'unit',

      // Vendor info
      activeListingsCount: 1,
      vendorCount: 1,
      vendorName: listing.vendorId?.businessName || 'Local Vendor',

      // Product details
      rating: listing.rating || productId.rating,
      nutritionalInfo: productId.nutritionalInfo,
      certifications: productId.certifications || listing.certifications,
      qualityGrades:
        productId.qualityGrades || [listing.qualityGrade].filter(Boolean),

      // Attributes
      isOrganic: productId.isOrganic || listing.isOrganic || false,
      isLocallySourced:
        productId.isLocallySourced || listing.isLocallySourced || false,
      seasonality: productId.seasonality,
      isSeasonal: availability.isInSeason || productId.isSeasonal,

      // Storage
      shelfLife: productId.shelfLife,
      storageRequirements: productId.storageRequirements,

      // Additional
      variety: productId.variety,
      origin: productId.origin || listing.origin,
      standardUnits: productId.standardUnits,
    };
  };

  const products = allProducts.map(transformListingToProduct);

  // Sort options
  const sortOptions = [
    { label: 'Newest First', value: 'createdAt', order: 'desc' },
    {
      label: 'Price: Low to High',
      value: 'pricing.pricePerBaseUnit',
      order: 'asc',
    },
    {
      label: 'Price: High to Low',
      value: 'pricing.pricePerBaseUnit',
      order: 'desc',
    },
    { label: 'Most Popular', value: 'totalOrders', order: 'desc' },
    { label: 'Highest Rated', value: 'rating.average', order: 'desc' },
  ];

  const currentSort =
    sortOptions.find(
      (opt) => opt.value === filters.sortBy && opt.order === filters.sortOrder
    ) || sortOptions[0];

  // Handle sort change
  const handleSortChange = (sortOption) => {
    updateFilter('sortBy', sortOption.value);
    updateFilter('sortOrder', sortOption.order);
  };

  // Handle view mode toggle
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips = [];

    if (filters.search) {
      chips.push({
        key: 'search',
        label: getFilterLabel('search', filters.search),
        value: filters.search,
      });
    }

    if (filters.category && filters.category !== 'all') {
      chips.push({
        key: 'category',
        label: getFilterLabel('category', filters.category),
        value: filters.category,
      });
    }

    if (filters.minPrice || filters.maxPrice) {
      let priceLabel;
      if (filters.minPrice && filters.maxPrice) {
        priceLabel = `৳${filters.minPrice} - ৳${filters.maxPrice}`;
      } else if (filters.minPrice) {
        priceLabel = `Min: ৳${filters.minPrice}`;
      } else {
        priceLabel = `Max: ৳${filters.maxPrice}`;
      }
      chips.push({
        key: 'price',
        label: priceLabel,
        value: priceLabel,
      });
    }

    if (filters.market) {
      chips.push({
        key: 'market',
        label: getFilterLabel('market', filters.market),
        value: filters.market,
      });
    }

    if (filters.organic) {
      chips.push({
        key: 'organic',
        label: 'Organic',
        value: true,
      });
    }

    if (filters.seasonal) {
      chips.push({
        key: 'seasonal',
        label: 'In Season',
        value: true,
      });
    }

    return chips;
  };

  const activeFilterChips = getActiveFilterChips();

  // Grid classes based on view mode
  const gridClasses =
    viewMode === 'compact'
      ? 'grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6'
      : 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`w-full ${className}`}>
      {/* Grid Toolbar */}
      <div
        role="toolbar"
        aria-label="Product grid controls"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
      >
        {/* Product count */}
        <div className="text-text-muted text-sm">
          {isLoading && currentPage === 1 ? (
            <span>Loading products...</span>
          ) : (
            <span>
              Showing {products.length}{' '}
              {products.length === 1 ? 'product' : 'products'}
            </span>
          )}
        </div>

        {/* Sort dropdown + View toggle */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Sort dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              aria-label="Sort products by"
              value={`${currentSort.value}-${currentSort.order}`}
              onChange={(e) => {
                const [value, order] = e.target.value.split('-');
                const sortOption = sortOptions.find(
                  (opt) => opt.value === value && opt.order === order
                );
                if (sortOption) handleSortChange(sortOption);
              }}
              className="w-full sm:w-auto appearance-none bg-white border border-border-light rounded-2xl px-4 py-2.5 pr-10 text-sm text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option
                  key={`${option.value}-${option.order}`}
                  value={`${option.value}-${option.order}`}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>

          {/* View mode toggle */}
          <div
            role="group"
            aria-label="View mode toggle"
            className="flex items-center gap-2 bg-white border border-border-light rounded-2xl p-1"
          >
            <button
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              onClick={() => handleViewModeChange('grid')}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 touch-target ${
                viewMode === 'grid'
                  ? 'bg-gradient-secondary text-white shadow-sm'
                  : 'text-text-muted hover:bg-gray-50'
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
            </button>
            <button
              aria-label="Compact view"
              aria-pressed={viewMode === 'compact'}
              onClick={() => handleViewModeChange('compact')}
              className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 touch-target ${
                viewMode === 'compact'
                  ? 'bg-gradient-secondary text-white shadow-sm'
                  : 'text-text-muted hover:bg-gray-50'
              }`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {hasActiveFilters && activeFilterChips.length > 0 && (
        <div
          role="region"
          aria-label="Active filters"
          className="flex flex-wrap items-center gap-2 mb-6 pb-6 border-b border-border-light"
        >
          <span className="text-sm text-text-muted font-medium">
            Active Filters:
          </span>

          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              onClick={() => removeFilter(chip.key)}
              aria-label={`Remove ${chip.label} filter`}
              className="inline-flex items-center gap-2 bg-sage-green/10 text-muted-olive px-3 py-1.5 rounded-full text-sm font-medium hover:bg-sage-green/20 transition-all duration-200 group"
            >
              <span className="max-w-[200px] truncate">{chip.label}</span>
              <X className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </button>
          ))}

          {activeFilterCount >= 2 && (
            <button
              onClick={clearFilters}
              className="text-sm text-tomato-red hover:text-tomato-red/80 font-medium transition-colors ml-2"
            >
              Clear All
            </button>
          )}
        </div>
      )}

      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" className="sr-only">
        {isFetching && currentPage > 1 && 'Loading more products'}
        {!hasMore &&
          products.length > 0 &&
          `All ${products.length} products loaded`}
      </div>

      {/* Product Grid Container */}
      <div role="region" aria-label="Product grid" aria-live="polite">
        {/* Initial Loading State */}
        {isLoading && currentPage === 1 && (
          <div className={gridClasses}>
            {Array.from({ length: 12 }, (_, i) => (
              <CardSkeleton
                key={`skeleton-${i}`}
                className="animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-tomato-red/5 border border-tomato-red/20 rounded-2xl p-6 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-tomato-red/80 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">
                Unable to load products
              </h3>
              <p className="text-text-muted mb-4">
                {error.data?.message ||
                  'Something went wrong. Please try again.'}
              </p>
              <button
                onClick={refetch}
                className="bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown px-6 py-2 rounded-xl font-medium transition-all duration-200"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && products.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 px-4">
            <Package className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              No products found
            </h3>
            <p className="text-text-muted text-center max-w-md mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms'
                : 'No products available at the moment'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="bg-gradient-secondary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && products.length > 0 && (
          <>
            <div className={gridClasses}>
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => navigate(`/products/${product.id}`)}
                  showDetailed={false}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index, 12) * 50}ms` }}
                />
              ))}
            </div>

            {/* Infinite Scroll Loading Indicator */}
            {enableInfiniteScroll && isFetching && currentPage > 1 && (
              <div className="flex justify-center items-center py-8 gap-3">
                <LoadingSpinner size="md" color="primary" />
                <span className="text-text-muted text-sm">
                  Loading more products...
                </span>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {enableInfiniteScroll && hasMore && (
              <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            )}

            {/* End of Results */}
            {!hasMore && products.length > 0 && (
              <div className="col-span-full flex justify-center py-8">
                <div className="bg-sage-green/10 text-muted-olive px-6 py-3 rounded-full text-sm font-medium">
                  You&apos;ve reached the end • {products.length} products shown
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

ProductGrid.propTypes = {
  filters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    minPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    market: PropTypes.string,
    organic: PropTypes.bool,
    seasonal: PropTypes.bool,
    sortBy: PropTypes.string,
    sortOrder: PropTypes.string,
  }),
  updateFilter: PropTypes.func,
  removeFilter: PropTypes.func,
  clearFilters: PropTypes.func,
  getFilterLabel: PropTypes.func,
  hasActiveFilters: PropTypes.bool,
  activeFilterCount: PropTypes.number,
  className: PropTypes.string,
  enableInfiniteScroll: PropTypes.bool,
  initialLimit: PropTypes.number,
};

ProductGrid.defaultProps = {
  filters: {},
  updateFilter: () => {},
  removeFilter: () => {},
  clearFilters: () => {},
  getFilterLabel: () => {},
  hasActiveFilters: false,
  activeFilterCount: 0,
  className: '',
  enableInfiniteScroll: true,
  initialLimit: 20,
};

export default ProductGrid;
