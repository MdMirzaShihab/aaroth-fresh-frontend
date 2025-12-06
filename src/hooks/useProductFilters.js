import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * useProductFilters - Custom hook for managing product filter state via URL params
 *
 * Provides URL-based state management for homepage product filtering.
 * Benefits:
 * - URL state persists across page refreshes
 * - Shareable URLs with filter state
 * - Browser back/forward navigation works
 * - No Redux boilerplate needed
 * - SEO-friendly for filter combinations
 *
 * @returns {Object} {filters, updateFilter, clearFilters, apiQuery, hasActiveFilters, activeFilterCount}
 *
 * @example
 * const { filters, updateFilter, clearFilters, apiQuery } = useProductFilters();
 *
 * // Update a filter
 * updateFilter('category', 'vegetables');
 * updateFilter('minPrice', 20);
 * updateFilter('seasonal', true);
 *
 * // Clear all filters
 * clearFilters();
 *
 * // Use in API call
 * const { data } = useGetPublicListingsQuery(apiQuery);
 */
export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters = useMemo(() => {
    return {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || 'all',
      product: searchParams.get('product') || 'all',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      market: searchParams.get('market') || '',
      sortBy: searchParams.get('sort') || 'createdAt',
      sortOrder: searchParams.get('order') || 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };
  }, [searchParams]);

  // Update a single filter
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);

    // Handle different value types
    if (value === '' || value === false || value === 'all' || value === null || value === undefined) {
      // Remove param if value is empty/false/default
      newParams.delete(key);
    } else {
      // Set param with string value
      newParams.set(key, String(value));
    }

    // Reset to page 1 when filters change (except when changing page itself)
    if (key !== 'page') {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams({});
  };

  // Build API query object from filters
  const apiQuery = useMemo(() => {
    const query = {};

    // Only include non-empty values
    if (filters.search) query.search = filters.search;
    if (filters.category && filters.category !== 'all') query.category = filters.category;
    if (filters.product && filters.product !== 'all') query.productId = filters.product;
    if (filters.minPrice) query.minPrice = parseFloat(filters.minPrice);
    if (filters.maxPrice) query.maxPrice = parseFloat(filters.maxPrice);
    if (filters.market) query.marketId = filters.market;

    // Sorting - backend uses '-' prefix for descending order
    const sortField = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';
    query.sort = sortOrder === 'desc' ? `-${sortField}` : sortField;

    // Pagination
    query.page = filters.page;
    query.limit = filters.limit;

    return query;
  }, [filters]);

  // Check if any filters are active (excluding defaults)
  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.category !== 'all' ||
      filters.product !== 'all' ||
      filters.minPrice !== '' ||
      filters.maxPrice !== '' ||
      filters.market !== ''
    );
  }, [filters]);

  // Count active filters for badge display
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category && filters.category !== 'all') count++;
    if (filters.product && filters.product !== 'all') count++;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.market) count++;
    return count;
  }, [filters]);

  // Get filter labels for display (for active filter chips)
  const getFilterLabel = (key, value) => {
    switch (key) {
      case 'search':
        return `Search: "${value}"`;
      case 'category':
        return `Category: ${value}`;
      case 'product':
        return `Product: ${value}`;
      case 'minPrice':
        return `Min: ৳${value}`;
      case 'maxPrice':
        return `Max: ৳${value}`;
      case 'market':
        return 'Market filter';
      default:
        return value;
    }
  };

  // Remove a specific filter
  const removeFilter = (key) => {
    if (key === 'price') {
      // Special handling for price range
      updateFilter('minPrice', '');
      updateFilter('maxPrice', '');
    } else if (key === 'product') {
      updateFilter('product', 'all');
    } else {
      updateFilter(key, '');
    }
  };

  return {
    filters,
    updateFilter,
    clearFilters,
    removeFilter,
    apiQuery,
    hasActiveFilters,
    activeFilterCount,
    getFilterLabel,
  };
};

export default useProductFilters;
