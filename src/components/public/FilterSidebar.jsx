import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Leaf,
  MapPin,
  DollarSign,
  X,
  Check,
} from 'lucide-react';
import { cn } from '../../utils';
import { useGetCategoriesQuery, useGetPublicMarketsQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * FilterSidebar Component
 *
 * Advanced filtering sidebar for product listings with:
 * - Category filter with product counts
 * - Price range filter (min/max)
 * - Market/location filter
 * - Collapsible sections with smooth animations
 * - Mobile and desktop responsive
 *
 * @param {Object} props
 * @param {Object} props.filters - Current filter state from useProductFilters
 * @param {Function} props.updateFilter - Function to update a filter
 * @param {Function} props.clearFilters - Function to clear all filters
 * @param {boolean} props.mobile - Whether in mobile mode (for styling adjustments)
 * @param {string} props.className - Additional CSS classes
 */
const FilterSidebar = ({
  filters,
  updateFilter,
  clearFilters,
  mobile = false,
  className,
}) => {
  // Collapsible section state
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    price: true,
    market: true,
    attributes: true,
  });

  // Fetch categories and markets
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { data: marketsData, isLoading: marketsLoading } = useGetPublicMarketsQuery({ limit: 50 });

  const categories = categoriesData?.data || [];
  const markets = marketsData?.data || [];

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Filter section header component
  const FilterSection = ({ title, icon: Icon, section, children }) => (
    <div className="border-b border-gray-200/50 last:border-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted-olive/5 transition-colors duration-200 touch-target"
        aria-expanded={expandedSections[section]}
        aria-controls={`filter-section-${section}`}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-muted-olive" />}
          <span className="font-semibold text-text-dark">{title}</span>
        </div>
        {expandedSections[section] ? (
          <ChevronUp className="w-5 h-5 text-text-muted" />
        ) : (
          <ChevronDown className="w-5 h-5 text-text-muted" />
        )}
      </button>

      {expandedSections[section] && (
        <div
          id={`filter-section-${section}`}
          className="p-4 pt-2 animate-fade-in"
        >
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'bg-white rounded-3xl overflow-hidden',
        mobile ? 'border-0' : 'border border-gray-200 shadow-soft',
        className
      )}
      role="complementary"
      aria-label="Product filters"
    >
      {/* Header */}
      <div className="p-6 pb-4 border-b border-gray-200/50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
          <span>Filters</span>
          {filters.category !== 'all' && (
            <span className="text-xs bg-muted-olive/20 text-muted-olive px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </h2>
        {(filters.category !== 'all' ||
          filters.minPrice ||
          filters.maxPrice ||
          filters.market) && (
          <button
            onClick={clearFilters}
            className="text-sm text-tomato-red hover:text-tomato-red/80 font-medium transition-colors"
            aria-label="Clear all filters"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200/50">
        {/* Category Filter */}
        <FilterSection title="Categories" icon={Leaf} section="category">
          {categoriesLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="space-y-2">
              {/* All Categories Option */}
              <label
                className={cn(
                  'flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-sage-green/10 touch-target',
                  filters.category === 'all' && 'bg-sage-green/20 ring-2 ring-sage-green/30'
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="category"
                    value="all"
                    checked={filters.category === 'all'}
                    onChange={() => updateFilter('category', 'all')}
                    className="sr-only"
                  />
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      filters.category === 'all'
                        ? 'border-muted-olive bg-muted-olive'
                        : 'border-gray-300'
                    )}
                  >
                    {filters.category === 'all' && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-text-dark">All Categories</span>
                </div>
              </label>

              {/* Category List */}
              {categories.slice(0, 10).map((category) => (
                <label
                  key={category._id || category.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-200 hover:bg-sage-green/10 touch-target',
                    filters.category === (category._id || category.id) &&
                      'bg-sage-green/20 ring-2 ring-sage-green/30'
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="radio"
                      name="category"
                      value={category._id || category.id}
                      checked={filters.category === (category._id || category.id)}
                      onChange={() => updateFilter('category', category._id || category.id)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0',
                        filters.category === (category._id || category.id)
                          ? 'border-muted-olive bg-muted-olive'
                          : 'border-gray-300'
                      )}
                    >
                      {filters.category === (category._id || category.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-text-dark truncate">
                      {category.name}
                    </span>
                  </div>
                  {category.productCount > 0 && (
                    <span className="text-xs text-text-muted ml-2 flex-shrink-0">
                      {category.productCount}
                    </span>
                  )}
                </label>
              ))}

              {categories.length > 10 && (
                <button className="text-sm text-muted-olive hover:text-muted-olive/80 font-medium w-full text-left p-2">
                  Show all categories ({categories.length})
                </button>
              )}
            </div>
          )}
        </FilterSection>

        {/* Price Range Filter */}
        <FilterSection title="Price Range" icon={DollarSign} section="price">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="minPrice" className="text-xs text-text-muted mb-2 block">
                  Min Price (৳)
                </label>
                <input
                  id="minPrice"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 outline-none transition-all text-sm touch-target"
                />
              </div>
              <div>
                <label htmlFor="maxPrice" className="text-xs text-text-muted mb-2 block">
                  Max Price (৳)
                </label>
                <input
                  id="maxPrice"
                  type="number"
                  min="0"
                  placeholder="Any"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 outline-none transition-all text-sm touch-target"
                />
              </div>
            </div>

            {(filters.minPrice || filters.maxPrice) && (
              <button
                onClick={() => {
                  updateFilter('minPrice', '');
                  updateFilter('maxPrice', '');
                }}
                className="text-sm text-tomato-red hover:text-tomato-red/80 font-medium flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Clear price range
              </button>
            )}
          </div>
        </FilterSection>

        {/* Market Filter */}
        <FilterSection title="Location" icon={MapPin} section="market">
          {marketsLoading ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <div className="space-y-2">
              <select
                value={filters.market}
                onChange={(e) => updateFilter('market', e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 outline-none transition-all text-sm appearance-none bg-white cursor-pointer touch-target"
                aria-label="Select market"
              >
                <option value="">All Markets</option>
                {markets.map((market) => (
                  <option key={market._id || market.id} value={market._id || market.id}>
                    {market.name} {market.location?.city && `- ${market.location.city}`}
                  </option>
                ))}
              </select>
            </div>
          )}
        </FilterSection>

        {/* Product Attributes - Removed: Organic and Seasonal filters not supported by backend */}
      </div>

      {/* Mobile Apply Button */}
      {mobile && (
        <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
          <button
            onClick={() => {
              // Parent component should handle closing drawer
              if (window.closeFilterDrawer) window.closeFilterDrawer();
            }}
            className="w-full bg-gradient-secondary text-white px-6 py-4 rounded-2xl font-semibold hover:shadow-depth-2 transition-all duration-200 touch-target"
          >
            Apply Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
