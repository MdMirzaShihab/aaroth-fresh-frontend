import React, { useState, useEffect } from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

// UI Components
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import FormField from '../../../../../components/ui/FormField';

const CategoryFilters = ({ filters, onFilterChange, onClose }) => {
  // ========================================
  // LOCAL STATE
  // ========================================

  const [localFilters, setLocalFilters] = useState({
    search: filters.search || '',
    status: filters.status || 'all',
    level: filters.level || 'all',
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
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
      level: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
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
              placeholder="Search by name or description..."
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
            </select>
          </FormField>

          {/* Level Filter */}
          <FormField label="Category Level">
            <select
              value={localFilters.level}
              onChange={(e) => handleLocalChange('level', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="all">All Levels</option>
              <option value="top">Top-level Only</option>
              <option value="sub">Subcategories Only</option>
            </select>
          </FormField>

          {/* Sort By */}
          <FormField label="Sort By">
            <select
              value={localFilters.sortBy}
              onChange={(e) => handleLocalChange('sortBy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            >
              <option value="createdAt">Created Date</option>
              <option value="name">Name</option>
              <option value="productCount">Product Count</option>
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

export default CategoryFilters;
