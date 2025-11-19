import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

// UI Components
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';

const MarketFilters = ({ filters, onFilterChange, onClose }) => {
  // ========================================
  // LOCAL STATE
  // ========================================

  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    status: filters.status || 'all',
    city: filters.city || 'all',
    sortBy: filters.sortBy || 'name',
    sortOrder: filters.sortOrder || 'asc',
  });

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localFilters.search !== filters.search) {
        onFilterChange({ search: localFilters.search });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localFilters.search]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleReset = () => {
    const defaultFilters = {
      search: '',
      status: 'all',
      city: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleLocalChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Card className="p-6 glass">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-text-dark">Filters</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Search */}
        <FormField label="Search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <Input
              type="text"
              value={localFilters.search}
              onChange={(e) => handleLocalChange('search', e.target.value)}
              placeholder="Search by name, description, or city..."
              className="pl-10"
            />
          </div>
        </FormField>

        {/* Two Column Layout for Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status Filter */}
          <FormField label="Status">
            <select
              value={localFilters.status}
              onChange={(e) => handleLocalChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="flagged">Flagged Only</option>
            </select>
          </FormField>

          {/* City Filter */}
          <FormField label="City">
            <select
              value={localFilters.city}
              onChange={(e) => handleLocalChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="all">All Cities</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Chittagong">Chittagong</option>
              <option value="Sylhet">Sylhet</option>
              <option value="Rajshahi">Rajshahi</option>
              <option value="Khulna">Khulna</option>
              <option value="Nationwide">Nationwide</option>
            </select>
          </FormField>

          {/* Sort By */}
          <FormField label="Sort By">
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleLocalChange('sortBy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="name">Name</option>
              <option value="location.city">City</option>
              <option value="createdAt">Created Date</option>
              <option value="updatedAt">Last Updated</option>
            </select>
          </FormField>

          {/* Sort Order */}
          <FormField label="Sort Order">
            <select
              value={localFilters.sortOrder}
              onChange={(e) => handleLocalChange('sortOrder', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </FormField>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              className="bg-gradient-secondary text-white"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MarketFilters;
