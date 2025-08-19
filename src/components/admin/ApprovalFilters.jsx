import React from 'react';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Store,
  Utensils,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Calendar,
} from 'lucide-react';
import SearchBar from '../ui/SearchBar';
import Button from '../ui/Button';

const ApprovalFilters = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  // Filter options
  const typeOptions = [
    {
      value: 'all',
      label: 'All Applications',
      icon: Users,
      color: 'text-gray-600',
    },
    { value: 'vendor', label: 'Vendors', icon: Store, color: 'text-green-600' },
    {
      value: 'restaurant',
      label: 'Restaurants',
      icon: Utensils,
      color: 'text-blue-600',
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Users, color: 'text-gray-600' },
    {
      value: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'text-earthy-brown',
    },
    {
      value: 'approved',
      label: 'Approved',
      icon: CheckCircle,
      color: 'text-bottle-green',
    },
    {
      value: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      color: 'text-tomato-red',
    },
  ];

  // Quick filter presets
  const quickFilters = [
    {
      id: 'urgent',
      label: 'Urgent (7+ days)',
      icon: Clock,
      color: 'text-tomato-red',
      action: () => {
        onStatusChange('pending');
        // Note: Urgency filtering would be handled by the parent component
      },
    },
    {
      id: 'recent',
      label: 'Recent (Today)',
      icon: Calendar,
      color: 'text-blue-600',
      action: () => {
        onStatusChange('pending');
        // Note: Date filtering would be handled by the parent component
      },
    },
    {
      id: 'vendors-pending',
      label: 'Pending Vendors',
      icon: Store,
      color: 'text-green-600',
      action: () => {
        onTypeChange('vendor');
        onStatusChange('pending');
      },
    },
    {
      id: 'restaurants-pending',
      label: 'Pending Restaurants',
      icon: Utensils,
      color: 'text-blue-600',
      action: () => {
        onTypeChange('restaurant');
        onStatusChange('pending');
      },
    },
  ];

  // Clear all filters
  const clearAllFilters = () => {
    onSearchChange('');
    onTypeChange('all');
    onStatusChange('pending');
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1 lg:max-w-md">
          <SearchBar
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search by business name, phone, or email..."
            className="w-full"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap gap-3">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => onTypeChange(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 min-w-[140px] min-h-[44px]"
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 min-w-[140px] min-h-[44px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-bottle-green'
                  : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
              }`}
              title="Card view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-2 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-bottle-green'
                  : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm ||
            selectedType !== 'all' ||
            selectedStatus !== 'pending') && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-text-muted hover:text-text-dark border-gray-300 hover:border-gray-400"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-text-muted">
          Quick Filters:
        </span>
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive =
            (filter.id === 'vendors-pending' &&
              selectedType === 'vendor' &&
              selectedStatus === 'pending') ||
            (filter.id === 'restaurants-pending' &&
              selectedType === 'restaurant' &&
              selectedStatus === 'pending');

          return (
            <button
              key={filter.id}
              onClick={filter.action}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-bottle-green text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${isActive ? 'text-white' : filter.color}`}
              />
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Filter Summary */}
      {(selectedType !== 'all' || selectedStatus !== 'all' || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span>Showing:</span>

          {selectedStatus !== 'all' && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              {statusOptions.find((opt) => opt.value === selectedStatus)?.label}{' '}
              applications
            </span>
          )}

          {selectedType !== 'all' && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              from{' '}
              {typeOptions.find((opt) => opt.value === selectedType)?.label}
            </span>
          )}

          {searchTerm && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md">
              matching "{searchTerm}"
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ApprovalFilters;
