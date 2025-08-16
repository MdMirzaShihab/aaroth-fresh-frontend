import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  Filter,
  X,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react';

// Order filters slice for Redux state management
const initialFiltersState = {
  search: '',
  status: 'all',
  dateRange: '7d',
  customDateFrom: '',
  customDateTo: '',
  amountMin: '',
  amountMax: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  restaurantId: '',
  paymentMethod: 'all',
  deliveryArea: 'all',
};

const OrderFilters = ({
  onFiltersChange,
  totalResults = 0,
  isLoading = false,
  availableRestaurants = [],
  availableAreas = [],
}) => {
  const dispatch = useDispatch();

  // Local state for filters
  const [filters, setFilters] = useState(initialFiltersState);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Orders', count: 0 },
    { value: 'pending', label: 'Pending', count: 0, color: 'text-orange-600' },
    {
      value: 'confirmed',
      label: 'Confirmed',
      count: 0,
      color: 'text-blue-600',
    },
    {
      value: 'prepared',
      label: 'Prepared',
      count: 0,
      color: 'text-purple-600',
    },
    { value: 'shipped', label: 'Shipped', count: 0, color: 'text-indigo-600' },
    {
      value: 'delivered',
      label: 'Delivered',
      count: 0,
      color: 'text-bottle-green',
    },
    {
      value: 'cancelled',
      label: 'Cancelled',
      count: 0,
      color: 'text-tomato-red',
    },
  ];

  // Date range options
  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Order Date' },
    { value: 'totalAmount', label: 'Amount' },
    { value: 'status', label: 'Status' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'deliveryDate', label: 'Delivery Date' },
  ];

  // Payment method options
  const paymentMethodOptions = [
    { value: 'all', label: 'All Methods' },
    { value: 'cash', label: 'Cash on Delivery' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'mobile', label: 'Mobile Payment' },
    { value: 'bank', label: 'Bank Transfer' },
  ];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };

    // Reset custom dates when changing from custom range
    if (key === 'dateRange' && value !== 'custom') {
      newFilters.customDateFrom = '';
      newFilters.customDateTo = '';
      setShowDatePicker(false);
    }

    // Show date picker for custom range
    if (key === 'dateRange' && value === 'custom') {
      setShowDatePicker(true);
    }

    setFilters(newFilters);
  };

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const searchParams = { ...filters };

      // Clean up empty filters
      Object.keys(searchParams).forEach((key) => {
        if (searchParams[key] === '' || searchParams[key] === 'all') {
          delete searchParams[key];
        }
      });

      onFiltersChange(searchParams);
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersChange]);

  // Reset all filters
  const handleResetFilters = () => {
    setFilters(initialFiltersState);
    setShowAdvanced(false);
    setShowDatePicker(false);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).some((key) => {
      if (key === 'sortBy' || key === 'sortOrder') return false; // Ignore default sorting
      return (
        filters[key] !== initialFiltersState[key] &&
        filters[key] !== '' &&
        filters[key] !== 'all'
      );
    });
  }, [filters]);

  return (
    <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
      {/* Main Search and Quick Filters */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by restaurant name, order ID, customer..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-dark"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} {option.count > 0 && `(${option.count})`}
              </option>
            ))}
          </select>

          {/* Date Range */}
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
          >
            {dateRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 whitespace-nowrap ${
              showAdvanced || hasActiveFilters
                ? 'bg-bottle-green text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-text-dark'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Advanced
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-white rounded-full"></span>
            )}
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200 whitespace-nowrap"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            {isLoading ? 'Loading...' : `${totalResults} orders found`}
          </span>

          {/* Sort Options */}
          <div className="flex items-center gap-3">
            <span>Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="bg-transparent border-0 text-text-dark focus:ring-0 text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() =>
                handleFilterChange(
                  'sortOrder',
                  filters.sortOrder === 'asc' ? 'desc' : 'asc'
                )
              }
              className="text-text-muted hover:text-text-dark transition-colors"
              title={`Sort ${filters.sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              <ChevronDown
                className={`w-4 h-4 transition-transform ${filters.sortOrder === 'asc' ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-t border-gray-100 p-6 bg-gray-50/50 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-bottle-green" />
                Order Amount
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min amount"
                  value={filters.amountMin}
                  onChange={(e) =>
                    handleFilterChange('amountMin', e.target.value)
                  }
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
                />
                <input
                  type="number"
                  placeholder="Max amount"
                  value={filters.amountMax}
                  onChange={(e) =>
                    handleFilterChange('amountMax', e.target.value)
                  }
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
                />
              </div>
            </div>

            {/* Restaurant Filter */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-bottle-green" />
                Restaurant
              </label>
              <select
                value={filters.restaurantId}
                onChange={(e) =>
                  handleFilterChange('restaurantId', e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
              >
                <option value="">All Restaurants</option>
                {availableRestaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-bottle-green" />
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) =>
                  handleFilterChange('paymentMethod', e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
              >
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Delivery Area */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-bottle-green" />
                Delivery Area
              </label>
              <select
                value={filters.deliveryArea}
                onChange={(e) =>
                  handleFilterChange('deliveryArea', e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
              >
                <option value="all">All Areas</option>
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {showDatePicker && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="block text-sm font-medium text-text-dark mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-bottle-green" />
                Custom Date Range
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={filters.customDateFrom}
                    onChange={(e) =>
                      handleFilterChange('customDateFrom', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={filters.customDateTo}
                    onChange={(e) =>
                      handleFilterChange('customDateTo', e.target.value)
                    }
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green/30 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="border-t border-gray-100 p-4 bg-gray-25">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-text-dark">
              Active filters:
            </span>

            {filters.search && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-bottle-green/10 text-bottle-green text-sm rounded-xl">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:bg-bottle-green/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-bottle-green/10 text-bottle-green text-sm rounded-xl">
                Status:{' '}
                {
                  statusOptions.find((opt) => opt.value === filters.status)
                    ?.label
                }
                <button
                  onClick={() => handleFilterChange('status', 'all')}
                  className="hover:bg-bottle-green/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(filters.amountMin || filters.amountMax) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-bottle-green/10 text-bottle-green text-sm rounded-xl">
                Amount: ৳{filters.amountMin || '0'} - ৳
                {filters.amountMax || '∞'}
                <button
                  onClick={() => {
                    handleFilterChange('amountMin', '');
                    handleFilterChange('amountMax', '');
                  }}
                  className="hover:bg-bottle-green/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filters.paymentMethod !== 'all' && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-bottle-green/10 text-bottle-green text-sm rounded-xl">
                Payment:{' '}
                {
                  paymentMethodOptions.find(
                    (opt) => opt.value === filters.paymentMethod
                  )?.label
                }
                <button
                  onClick={() => handleFilterChange('paymentMethod', 'all')}
                  className="hover:bg-bottle-green/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;
