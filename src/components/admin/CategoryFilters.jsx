import React from 'react';
import {
  Search,
  Filter,
  X,
  ChevronDown,
  SortAsc,
  SortDesc,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import SearchBar from '../ui/SearchBar';

const CategoryFilters = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false,
  resultCount = 0,
  totalCount = 0,
}) => {
  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filter changes
    });
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';

    onFiltersChange({
      ...filters,
      sortBy,
      sortOrder: newSortOrder,
      page: 1,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.isActive !== undefined && filters.isActive !== 'all') count++;
    if (filters.isAvailable !== undefined && filters.isAvailable !== 'all')
      count++;
    if (filters.adminStatus && filters.adminStatus !== 'all') count++;
    if (filters.level !== undefined && filters.level !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="bg-muted-olive text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">
            {resultCount} of {totalCount} categories
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-tomato-red hover:bg-tomato-red/10"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Search Categories
          </label>
          <SearchBar
            value={filters.search || ''}
            onChange={(value) => handleFilterChange('search', value)}
            placeholder="Search by name or description..."
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* Status Filters */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Status */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Active Status
            </label>
            <div className="relative">
              <select
                value={filters.isActive || 'all'}
                onChange={(e) =>
                  handleFilterChange(
                    'isActive',
                    e.target.value === 'all' ? undefined : e.target.value
                  )
                }
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive appearance-none pr-10"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Availability Status */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Availability
            </label>
            <div className="relative">
              <select
                value={filters.isAvailable || 'all'}
                onChange={(e) =>
                  handleFilterChange(
                    'isAvailable',
                    e.target.value === 'all' ? undefined : e.target.value
                  )
                }
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive appearance-none pr-10"
              >
                <option value="all">All</option>
                <option value="true">Available</option>
                <option value="false">Flagged</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Admin Status */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Admin Status
          </label>
          <div className="relative">
            <select
              value={filters.adminStatus || 'all'}
              onChange={(e) =>
                handleFilterChange(
                  'adminStatus',
                  e.target.value === 'all' ? '' : e.target.value
                )
              }
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive appearance-none pr-10"
            >
              <option value="all">All Admin Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="deprecated">Deprecated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Category Level */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Category Level
          </label>
          <div className="relative">
            <select
              value={filters.level || 'all'}
              onChange={(e) =>
                handleFilterChange(
                  'level',
                  e.target.value === 'all'
                    ? undefined
                    : parseInt(e.target.value)
                )
              }
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive appearance-none pr-10"
            >
              <option value="all">All Levels</option>
              <option value="0">Level 0 (Root)</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Page Size */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Items per page
          </label>
          <div className="relative">
            <select
              value={filters.limit || 20}
              onChange={(e) =>
                handleFilterChange('limit', parseInt(e.target.value))
              }
              disabled={isLoading}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive appearance-none pr-10"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div>
        <label className="block text-sm font-medium text-text-dark mb-3">
          Sort By
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'name', label: 'Name' },
            { key: 'createdAt', label: 'Created Date' },
            { key: 'updatedAt', label: 'Updated Date' },
            { key: 'sortOrder', label: 'Sort Order' },
            { key: 'level', label: 'Level' },
          ].map((sort) => {
            const isActive = filters.sortBy === sort.key;
            const isAsc = isActive && filters.sortOrder === 'asc';

            return (
              <Button
                key={sort.key}
                variant={isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSortChange(sort.key)}
                className={`flex items-center gap-1 ${
                  isActive ? 'bg-muted-olive text-white' : ''
                }`}
                disabled={isLoading}
              >
                <span>{sort.label}</span>
                {isActive &&
                  (isAsc ? (
                    <SortAsc className="w-3 h-3" />
                  ) : (
                    <SortDesc className="w-3 h-3" />
                  ))}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-text-dark">
              Active filters:
            </span>

            {filters.search && (
              <div className="flex items-center gap-1 bg-muted-olive/10 text-muted-olive px-2 py-1 rounded-lg text-sm">
                <Search className="w-3 h-3" />
                <span>"{filters.search}"</span>
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:bg-muted-olive/20 rounded p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.isActive !== undefined && filters.isActive !== 'all' && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-sm">
                <span>
                  {filters.isActive === 'true' ? 'Active' : 'Inactive'}
                </span>
                <button
                  onClick={() => handleFilterChange('isActive', undefined)}
                  className="hover:bg-blue-200 rounded p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.isAvailable !== undefined &&
              filters.isAvailable !== 'all' && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-lg text-sm">
                  <span>
                    {filters.isAvailable === 'true' ? 'Available' : 'Flagged'}
                  </span>
                  <button
                    onClick={() => handleFilterChange('isAvailable', undefined)}
                    className="hover:bg-green-200 rounded p-0.5 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

            {filters.adminStatus && filters.adminStatus !== 'all' && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-lg text-sm">
                <span>{filters.adminStatus}</span>
                <button
                  onClick={() => handleFilterChange('adminStatus', '')}
                  className="hover:bg-purple-200 rounded p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.level !== undefined && filters.level !== 'all' && (
              <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-sm">
                <span>Level {filters.level}</span>
                <button
                  onClick={() => handleFilterChange('level', undefined)}
                  className="hover:bg-orange-200 rounded p-0.5 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default CategoryFilters;
