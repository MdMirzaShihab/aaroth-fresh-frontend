/**
 * UserFilters - Advanced Filtering System for User Management
 * Features: Saved filter sets, quick filter chips, real-time counts, date range picker
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  Save,
  Star,
  Calendar,
  MapPin,
  Users,
  Shield,
  Store,
  Utensils,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button, Input } from '../../../../components/ui';
import { getUserFilters } from '../../../../services/admin/usersService';

// Quick filter chips component
const FilterChip = ({
  label,
  count,
  isActive,
  onClick,
  onRemove,
  icon: IconComponent,
  color = 'muted-olive',
}) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all
        ${
          isActive
            ? `bg-${color} text-white shadow-md`
            : `${isDarkMode ? 'bg-dark-surface text-dark-text-primary hover:bg-dark-sage-accent/10' : 'bg-gray-100 text-text-dark hover:bg-gray-200'}`
        }
      `}
      onClick={onClick}
    >
      {IconComponent && <IconComponent className="w-3 h-3" />}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1.5 py-0.5 rounded-full text-xs ${isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}`}
        >
          {count}
        </span>
      )}
      {isActive && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-white/20 rounded-full p-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </motion.div>
  );
};

// Saved filter sets component
const SavedFilters = ({
  savedFilters,
  onApplyFilter,
  onSaveFilter,
  onDeleteFilter,
}) => {
  const { isDarkMode } = useTheme();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  const handleSaveFilter = () => {
    if (!filterName.trim()) return;
    onSaveFilter(filterName.trim());
    setFilterName('');
    setShowSaveDialog(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4
          className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
        >
          Saved Filters
        </h4>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => setShowSaveDialog(true)}
        >
          <Bookmark className="w-3 h-3 mr-1" />
          Save Current
        </Button>
      </div>

      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg p-3 bg-gray-50 dark:bg-dark-surface"
        >
          <div className="flex gap-2">
            <Input
              placeholder="Filter set name..."
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              size="sm"
              className="flex-1"
            />
            <Button
              size="xs"
              onClick={handleSaveFilter}
              disabled={!filterName.trim()}
            >
              <Save className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setShowSaveDialog(false);
                setFilterName('');
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex flex-wrap gap-2">
        {savedFilters.map((filter) => (
          <div
            key={filter.id}
            className={`
              group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all
              ${isDarkMode ? 'bg-dark-surface hover:bg-dark-sage-accent/10' : 'bg-gray-100 hover:bg-gray-200'}
            `}
            onClick={() => onApplyFilter(filter)}
          >
            <BookmarkCheck className="w-3 h-3 text-sage-green" />
            <span>{filter.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFilter(filter.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-tomato-red transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Date range picker component
const DateRangePicker = ({ label, value, onChange }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
      >
        <Calendar className="w-4 h-4 inline mr-2" />
        {label}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={value?.start || ''}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          size="sm"
        />
        <Input
          type="date"
          value={value?.end || ''}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          size="sm"
        />
      </div>
    </div>
  );
};

const UserFilters = ({
  filters = {},
  onFiltersChange,
  userCounts = { total: 0, filtered: 0 },
}) => {
  const { isDarkMode } = useTheme();
  const [savedFilters, setSavedFilters] = useState([
    {
      id: 1,
      name: 'Active Vendors',
      filters: { role: 'vendor', status: 'active' },
    },
    {
      id: 2,
      name: 'Pending Approval',
      filters: { status: 'pending_approval' },
    },
    { id: 3, name: 'High Risk Users', filters: { riskLevel: 'high' } },
  ]);

  // Get filter options from service
  const filterOptions = useMemo(() => getUserFilters(), []);

  // Quick filters for common searches
  const quickFilters = [
    { key: 'role', value: 'vendor', label: 'Vendors', icon: Store, count: 142 },
    {
      key: 'role',
      value: 'buyerOwner',
      label: 'Buyer Owners',
      icon: Utensils,
      count: 89,
    },
    {
      key: 'status',
      value: 'pending_approval',
      label: 'Pending Approval',
      icon: Clock,
      count: 23,
    },
    {
      key: 'status',
      value: 'active',
      label: 'Active Users',
      icon: CheckCircle,
      count: 256,
    },
    {
      key: 'verificationStatus',
      value: 'approved',
      label: 'Verified',
      icon: Shield,
      count: 198,
    },
  ];

  // Handle filter change
  const handleFilterChange = useCallback(
    (key, value) => {
      const newFilters = { ...filters };

      if (value === 'all' || value === '' || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      onFiltersChange?.(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Handle quick filter toggle
  const handleQuickFilter = useCallback(
    (key, value) => {
      const isActive = filters[key] === value;
      handleFilterChange(key, isActive ? null : value);
    },
    [filters, handleFilterChange]
  );

  // Handle saved filter application
  const handleApplyFilter = useCallback(
    (savedFilter) => {
      onFiltersChange?.(savedFilter.filters);
    },
    [onFiltersChange]
  );

  // Handle saving current filter
  const handleSaveFilter = useCallback(
    (name) => {
      const newFilter = {
        id: Date.now(),
        name,
        filters: { ...filters },
      };
      setSavedFilters((prev) => [...prev, newFilter]);
    },
    [filters]
  );

  // Handle deleting saved filter
  const handleDeleteFilter = useCallback((filterId) => {
    setSavedFilters((prev) => prev.filter((f) => f.id !== filterId));
  }, []);

  // Handle clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange?.({});
  }, [onFiltersChange]);

  // Get active filter count
  const activeFilterCount = Object.keys(filters).length;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter
            className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
          />
          <div>
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Advanced Filters
            </h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
            >
              Showing {userCounts.filtered.toLocaleString()} of{' '}
              {userCounts.total.toLocaleString()} users
              {activeFilterCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-muted-olive/10 text-muted-olive rounded-full text-xs font-medium">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}{' '}
                  active
                </span>
              )}
            </p>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <h4
          className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
        >
          Quick Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <FilterChip
              key={`${filter.key}-${filter.value}`}
              label={filter.label}
              count={filter.count}
              isActive={filters[filter.key] === filter.value}
              onClick={() => handleQuickFilter(filter.key, filter.value)}
              onRemove={() => handleFilterChange(filter.key, null)}
              icon={filter.icon}
            />
          ))}
        </div>
      </div>

      {/* Detailed Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Role Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Role
          </label>
          <select
            value={filters.role || 'all'}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className={`
              w-full px-3 py-2 text-sm border rounded-lg transition-colors
              ${
                isDarkMode
                  ? 'bg-dark-surface border-dark-border text-dark-text-primary'
                  : 'bg-white border-gray-300 text-text-dark'
              }
            `}
          >
            {filterOptions.role.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={`
              w-full px-3 py-2 text-sm border rounded-lg transition-colors
              ${
                isDarkMode
                  ? 'bg-dark-surface border-dark-border text-dark-text-primary'
                  : 'bg-white border-gray-300 text-text-dark'
              }
            `}
          >
            {filterOptions.status.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Status Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Verification
          </label>
          <select
            value={filters.verificationStatus || 'all'}
            onChange={(e) =>
              handleFilterChange('verificationStatus', e.target.value)
            }
            className={`
              w-full px-3 py-2 text-sm border rounded-lg transition-colors
              ${
                isDarkMode
                  ? 'bg-dark-surface border-dark-border text-dark-text-primary'
                  : 'bg-white border-gray-300 text-text-dark'
              }
            `}
          >
            {filterOptions.verificationStatus.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <label
            className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Risk Level
          </label>
          <select
            value={filters.riskLevel || 'all'}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className={`
              w-full px-3 py-2 text-sm border rounded-lg transition-colors
              ${
                isDarkMode
                  ? 'bg-dark-surface border-dark-border text-dark-text-primary'
                  : 'bg-white border-gray-300 text-text-dark'
              }
            `}
          >
            {filterOptions.riskLevel.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <DateRangePicker
          label="Registration Date"
          value={filters.registrationDate}
          onChange={(value) => handleFilterChange('registrationDate', value)}
        />
        <DateRangePicker
          label="Last Login"
          value={filters.lastLoginDate}
          onChange={(value) => handleFilterChange('lastLoginDate', value)}
        />
      </div>

      {/* Location Filter */}
      <div className="mb-6">
        <label
          className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Location
        </label>
        <Input
          placeholder="Enter city, state, or country..."
          value={filters.location || ''}
          onChange={(e) => handleFilterChange('location', e.target.value)}
        />
      </div>

      {/* Saved Filters */}
      <SavedFilters
        savedFilters={savedFilters}
        onApplyFilter={handleApplyFilter}
        onSaveFilter={handleSaveFilter}
        onDeleteFilter={handleDeleteFilter}
      />
    </Card>
  );
};

export default UserFilters;
