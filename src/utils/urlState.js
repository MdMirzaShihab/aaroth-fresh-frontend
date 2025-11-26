import { useSearchParams } from 'react-router-dom';

/**
 * useMarketFilter - Custom hook for managing market filter in URL
 *
 * Provides URL-based state management for market filtering across pages.
 * Benefits:
 * - URL state persists across page refreshes
 * - Enables deep linking with pre-selected market
 * - Works with browser back/forward navigation
 * - Shareable URLs with filter state
 *
 * @returns {[string, Function]} [marketId, setMarketId]
 *
 * @example
 * const [marketFilter, setMarketFilter] = useMarketFilter();
 * // URL: /listings?marketId=123
 * // marketFilter = "123"
 */
export const useMarketFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const marketId = searchParams.get('marketId') || '';

  const setMarketId = (id) => {
    if (id) {
      searchParams.set('marketId', id);
    } else {
      searchParams.delete('marketId');
    }
    setSearchParams(searchParams);
  };

  return [marketId, setMarketId];
};

/**
 * buildQueryParams - Helper to build query params from searchParams
 *
 * @param {URLSearchParams} searchParams - Current URL search params
 * @param {Object} additionalParams - Additional params to merge
 * @returns {Object} Combined params object
 *
 * @example
 * const params = buildQueryParams(searchParams, { page: 1, limit: 20 });
 * // Returns: { marketId: "123", status: "active", page: 1, limit: 20 }
 */
export const buildQueryParams = (searchParams, additionalParams = {}) => {
  const params = {};

  // Preserve all existing params from URL
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Merge additional params
  return { ...params, ...additionalParams };
};

/**
 * useFilterState - Generic hook for managing any filter in URL
 *
 * @param {string} paramName - Name of the URL parameter
 * @param {string} defaultValue - Default value if param not in URL
 * @returns {[string, Function]} [value, setValue]
 *
 * @example
 * const [status, setStatus] = useFilterState('status', 'all');
 * const [category, setCategory] = useFilterState('category', '');
 */
export const useFilterState = (paramName, defaultValue = '') => {
  const [searchParams, setSearchParams] = useSearchParams();

  const value = searchParams.get(paramName) || defaultValue;

  const setValue = (newValue) => {
    if (newValue && newValue !== defaultValue) {
      searchParams.set(paramName, newValue);
    } else {
      searchParams.delete(paramName);
    }
    setSearchParams(searchParams);
  };

  return [value, setValue];
};

export default {
  useMarketFilter,
  buildQueryParams,
  useFilterState,
};
