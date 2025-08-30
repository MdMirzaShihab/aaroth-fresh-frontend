import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  X,
  ChevronDown,
  Search,
  RotateCcw,
} from 'lucide-react';
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
} from 'date-fns';

/**
 * FilterPanel Component
 *
 * Advanced filtering interface for dashboard analytics
 * Supports date ranges, categories, vendors, and custom filters
 */
const FilterPanel = ({
  filters = {},
  onFiltersChange,
  dateRanges = ['today', 'week', 'month', 'quarter', 'year', 'custom'],
  categories = [],
  vendors = [],
  statuses = [],
  priceRange = { min: 0, max: 10000 },
  className = '',
  showSearch = true,
  showPriceRange = true,
  showStatus = true,
  showCategory = true,
  showVendor = true,
  customFilters = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Predefined date range options
  const getDateRangeOptions = () => {
    const today = new Date();
    const options = {
      today: {
        label: 'Today',
        startDate: startOfDay(today),
        endDate: endOfDay(today),
      },
      week: {
        label: 'Last 7 days',
        startDate: startOfDay(subDays(today, 7)),
        endDate: endOfDay(today),
      },
      month: {
        label: 'Last 30 days',
        startDate: startOfDay(subDays(today, 30)),
        endDate: endOfDay(today),
      },
      quarter: {
        label: 'Last 3 months',
        startDate: startOfDay(subMonths(today, 3)),
        endDate: endOfDay(today),
      },
      year: {
        label: 'Last 12 months',
        startDate: startOfDay(subYears(today, 1)),
        endDate: endOfDay(today),
      },
    };

    return dateRanges
      .filter((range) => options[range])
      .map((range) => ({
        value: range,
        ...options[range],
      }));
  };

  // Handle filter updates
  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  // Handle date range selection
  const handleDateRangeChange = (rangeKey) => {
    const option = getDateRangeOptions().find((opt) => opt.value === rangeKey);
    if (option) {
      updateFilter('dateRange', {
        type: rangeKey,
        startDate: option.startDate,
        endDate: option.endDate,
      });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    onFiltersChange({});
    setSearchTerm('');
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).filter((key) => {
    const value = filters[key];
    return (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }).length;

  return (
    <div className={`glass rounded-3xl p-4 sm:p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-muted-olive flex-shrink-0" />
          <h3 className="text-base sm:text-lg font-semibold text-text-dark dark:text-white truncate">
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span className="bg-muted-olive text-white text-xs px-2 py-1 rounded-full flex-shrink-0">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Reset Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 touch-target"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4 text-text-muted dark:text-gray-300" />
            </button>
          )}

          {/* Expand/Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 touch-target"
          >
            <ChevronDown
              className={`w-4 h-4 text-text-muted dark:text-gray-300 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div
        className={`space-y-4 sm:space-y-6 ${isExpanded ? 'block' : 'hidden'}`}
      >
        {/* Search */}
        {showSearch && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-text-dark dark:text-white mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted dark:text-gray-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateFilter('search', e.target.value);
                }}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all text-sm touch-target"
              />
            </div>
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-text-dark dark:text-white mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {getDateRangeOptions().map((option) => (
              <button
                key={option.value}
                onClick={() => handleDateRangeChange(option.value)}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 touch-target ${
                  filters.dateRange?.type === option.value
                    ? 'bg-muted-olive text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500'
                }`}
              >
                <span className="truncate">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        {showCategory && categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Vendor Filter */}
        {showVendor && vendors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Vendor
            </label>
            <select
              value={filters.vendor || ''}
              onChange={(e) => updateFilter('vendor', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.value} value={vendor.value}>
                  {vendor.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        {showStatus && statuses.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    const currentStatuses = filters.status || [];
                    const newStatuses = currentStatuses.includes(status.value)
                      ? currentStatuses.filter((s) => s !== status.value)
                      : [...currentStatuses, status.value];
                    updateFilter('status', newStatuses);
                  }}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    (filters.status || []).includes(status.value)
                      ? 'bg-muted-olive text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-text-dark dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        {showPriceRange && (
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Price Range
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  placeholder="Min price"
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  placeholder="Max price"
                  min={priceRange.min}
                  max={priceRange.max}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Custom Filters */}
        {customFilters.map((filter, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              {filter.label}
            </label>
            {filter.type === 'select' ? (
              <select
                value={filters[filter.key] || ''}
                onChange={(e) => updateFilter(filter.key, e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={filter.type || 'text'}
                value={filters[filter.key] || ''}
                onChange={(e) => updateFilter(filter.key, e.target.value)}
                placeholder={filter.placeholder}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all"
              />
            )}
          </div>
        ))}
      </div>

      {/* Applied Filters Summary */}
      {activeFilterCount > 0 && !isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value || (Array.isArray(value) && value.length === 0))
                return null;

              const displayValue =
                key === 'dateRange'
                  ? value.type
                  : Array.isArray(value)
                    ? value.join(', ')
                    : value;

              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 bg-muted-olive/10 dark:bg-muted-olive/20 text-muted-olive dark:text-sage-green px-3 py-1 rounded-full text-sm font-medium"
                >
                  {key}: {displayValue}
                  <button
                    onClick={() =>
                      updateFilter(key, Array.isArray(value) ? [] : '')
                    }
                    className="hover:bg-muted-olive/20 dark:hover:bg-muted-olive/30 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
