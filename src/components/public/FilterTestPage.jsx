import React from 'react';
import { useProductFilters } from '../../hooks/useProductFilters';
import { useGetPublicListingsQuery } from '../../store/slices/apiSlice';
import FilterSidebar from './FilterSidebar';
import MobileFilterButton from './MobileFilterButton';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Package } from 'lucide-react';

/**
 * FilterTestPage Component
 *
 * Test page to verify Phase 1 filter functionality:
 * - URL state management
 * - API integration with filters
 * - Desktop and mobile filter UI
 * - Active filter display
 *
 * This is a temporary test component that can be removed once
 * filters are integrated into the main Homepage.
 */
const FilterTestPage = () => {
  const {
    filters,
    updateFilter,
    clearFilters,
    apiQuery,
    hasActiveFilters,
    activeFilterCount,
    getFilterLabel,
  } = useProductFilters();

  // Fetch listings with filters
  const { data: listingsData, isLoading, error } = useGetPublicListingsQuery(apiQuery, {
    skip: !hasActiveFilters, // Only fetch when filters are active
  });

  const listings = listingsData?.data || [];
  const totalResults = listingsData?.total || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-dark mb-2">
            Filter System Test
          </h1>
          <p className="text-text-muted">
            Testing Phase 1: Advanced Filtering System
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">Debug Info:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>URL Filters:</strong> {JSON.stringify(filters, null, 2)}
            </p>
            <p>
              <strong>API Query:</strong> {JSON.stringify(apiQuery, null, 2)}
            </p>
            <p>
              <strong>Has Active Filters:</strong> {hasActiveFilters ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Active Filter Count:</strong> {activeFilterCount}
            </p>
          </div>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="flex gap-8">
          {/* Desktop Sidebar - Hidden on Mobile */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-text-dark mb-2">
                {hasActiveFilters ? 'Filtered Results' : 'All Products'}
              </h2>
              {hasActiveFilters && (
                <p className="text-text-muted">
                  Showing {totalResults} results
                </p>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-6 p-4 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-text-dark">Active Filters:</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-tomato-red hover:text-tomato-red/80 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.category && filters.category !== 'all' && (
                    <FilterChip
                      label={getFilterLabel('category', filters.category)}
                      onRemove={() => updateFilter('category', 'all')}
                    />
                  )}
                  {filters.minPrice && (
                    <FilterChip
                      label={getFilterLabel('minPrice', filters.minPrice)}
                      onRemove={() => updateFilter('minPrice', '')}
                    />
                  )}
                  {filters.maxPrice && (
                    <FilterChip
                      label={getFilterLabel('maxPrice', filters.maxPrice)}
                      onRemove={() => updateFilter('maxPrice', '')}
                    />
                  )}
                  {filters.market && (
                    <FilterChip
                      label={getFilterLabel('market', filters.market)}
                      onRemove={() => updateFilter('market', '')}
                    />
                  )}
                  {filters.organic && (
                    <FilterChip
                      label="Organic"
                      onRemove={() => updateFilter('organic', false)}
                    />
                  )}
                  {filters.seasonal && (
                    <FilterChip
                      label="In Season"
                      onRemove={() => updateFilter('seasonal', false)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Results */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12 p-8 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted mb-4">Failed to load listings</p>
                <p className="text-sm text-tomato-red">{error.message || 'Unknown error'}</p>
              </div>
            ) : !hasActiveFilters ? (
              <div className="text-center py-12 p-8 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted mb-4">
                  Select filters to see results
                </p>
                <p className="text-sm text-text-muted">
                  Use the sidebar to filter products by category, price, location, etc.
                </p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 p-8 bg-white rounded-2xl border border-gray-200">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted">No products found</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-muted-olive hover:text-muted-olive/80 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing._id || listing.id}
                    className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-soft transition-shadow"
                  >
                    <h3 className="font-semibold text-text-dark mb-2">
                      {listing.productId?.name || 'Unknown Product'}
                    </h3>
                    <p className="text-sm text-text-muted mb-3">
                      {listing.productId?.category?.name || 'Uncategorized'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-muted-olive">
                        ৳{listing.pricing?.[0]?.pricePerBaseUnit || 'N/A'}
                      </span>
                      <span className="text-sm text-text-muted">
                        per {listing.pricing?.[0]?.unit || 'unit'}
                      </span>
                    </div>
                    {listing.vendorId?.businessName && (
                      <p className="text-xs text-text-muted mt-2">
                        by {listing.vendorId.businessName}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <MobileFilterButton
        filters={filters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
};

// Filter Chip Component
const FilterChip = ({ label, onRemove }) => (
  <button
    onClick={onRemove}
    className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted-olive/10 text-muted-olive rounded-full text-sm hover:bg-muted-olive/20 transition-colors touch-target"
  >
    <span>{label}</span>
    <span className="text-lg leading-none">×</span>
  </button>
);

export default FilterTestPage;
