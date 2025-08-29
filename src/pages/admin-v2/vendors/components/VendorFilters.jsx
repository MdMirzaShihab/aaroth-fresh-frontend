/**
 * VendorFilters - Advanced Filtering Interface for Vendor Management
 * Comprehensive filtering and search functionality with real-time updates and saved filter presets
 * Features: Search, status filters, business type filters, location filters, date range filters
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  X,
  MapPin,
  Building2,
  Calendar,
  Star,
  DollarSign,
  Package,
  Clock,
  ChevronDown,
  Bookmark,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { Input } from '../../../../components/ui';

// Filter preset configurations
const FILTER_PRESETS = {
  all: { label: 'All Vendors', filters: {} },
  pending_verification: { 
    label: 'Pending Verification', 
    filters: { verificationStatus: 'pending' } 
  },
  high_performers: { 
    label: 'High Performers', 
    filters: { minRating: 4.5, minOrders: 100 } 
  },
  new_vendors: { 
    label: 'New Vendors', 
    filters: { dateRange: 'last_30_days' } 
  },
  at_risk: { 
    label: 'At Risk', 
    filters: { minRiskScore: 70 } 
  }
};

// Business type options
const BUSINESS_TYPES = [
  { value: 'farm', label: 'Farm' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'co-op', label: 'Cooperative' },
  { value: 'processor', label: 'Food Processor' },
  { value: 'supplier', label: 'Supplier' }
];

// Status options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'text-mint-fresh' },
  { value: 'inactive', label: 'Inactive', color: 'text-gray-500' },
  { value: 'suspended', label: 'Suspended', color: 'text-earthy-yellow' },
  { value: 'pending', label: 'Pending', color: 'text-sage-green' }
];

// Verification status options
const VERIFICATION_STATUS_OPTIONS = [
  { value: 'approved', label: 'Verified', color: 'text-mint-fresh' },
  { value: 'pending', label: 'Pending Review', color: 'text-earthy-yellow' },
  { value: 'rejected', label: 'Rejected', color: 'text-tomato-red' }
];

// Advanced filter section component
const FilterSection = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-text-dark">{title}</span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

// Multi-select checkbox component
const CheckboxGroup = ({ options, values, onChange, colorField }) => {
  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...values, option.value]);
              } else {
                onChange(values.filter(v => v !== option.value));
              }
            }}
            className="w-4 h-4 rounded border-2 border-muted-olive/30 text-muted-olive focus:ring-muted-olive/20"
          />
          <span className={`text-sm ${colorField ? option[colorField] : 'text-text-dark'}`}>
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
};

const VendorFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  onReset,
  totalResults = 0,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { isDarkMode } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const [activePreset, setActivePreset] = useState('all');
  const [expandedSections, setExpandedSections] = useState({
    status: true,
    business: false,
    location: false,
    performance: false,
    dates: false
  });
  
  // Update local filters when prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle filter changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange?.(localFilters);
    }, 300);
    return () => clearTimeout(timer);
  }, [localFilters, onFiltersChange]);

  // Apply filter preset
  const applyPreset = (presetKey) => {
    const preset = FILTER_PRESETS[presetKey];
    if (preset) {
      setLocalFilters(preset.filters);
      setActivePreset(presetKey);
    }
  };

  // Reset all filters
  const handleReset = () => {
    setLocalFilters({});
    setActivePreset('all');
    onReset?.();
  };

  // Update filter value
  const updateFilter = (key, value) => {
    setLocalFilters(prev => {
      if (value === null || value === undefined || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
    setActivePreset('custom');
  };

  // Toggle filter section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Count active filters
  const activeFilterCount = Object.keys(localFilters).length;

  if (isCollapsed) {
    return (
      <div className="flex items-center gap-4">
        <Button
          onClick={onToggleCollapse}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">
              {totalResults.toLocaleString()} results
            </span>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="text-tomato-red border-tomato-red/30 hover:bg-tomato-red/5"
            >
              <X className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="glass-card-olive border-sage-green/20">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-muted-olive" />
          <h3 className="font-semibold text-text-dark">Filter Vendors</h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-1 bg-muted-olive/10 text-muted-olive text-xs rounded-full font-medium">
              {activeFilterCount} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">
            {totalResults.toLocaleString()} results
          </span>
          <Button
            onClick={onToggleCollapse}
            variant="outline"
            size="sm"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input
            type="text"
            placeholder="Search by business name, owner, or location..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 bg-earthy-beige/30 border-0 focus:glass-3 focus:shadow-glow-olive"
          />
        </div>
      </div>

      {/* Filter Presets */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4 text-muted-olive" />
          <span className="text-sm font-medium text-text-dark">Quick Filters</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FILTER_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activePreset === key
                  ? 'bg-muted-olive text-white shadow-glow-olive'
                  : 'bg-gray-100 text-text-dark hover:bg-gray-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="max-h-96 overflow-y-auto">
        {/* Status Filters */}
        <FilterSection
          title="Status & Verification"
          isOpen={expandedSections.status}
          onToggle={() => toggleSection('status')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Account Status</label>
              <CheckboxGroup
                options={STATUS_OPTIONS}
                values={localFilters.status || []}
                onChange={(values) => updateFilter('status', values)}
                colorField="color"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Verification Status</label>
              <CheckboxGroup
                options={VERIFICATION_STATUS_OPTIONS}
                values={localFilters.verificationStatus || []}
                onChange={(values) => updateFilter('verificationStatus', values)}
                colorField="color"
              />
            </div>
          </div>
        </FilterSection>

        {/* Business Type Filters */}
        <FilterSection
          title="Business Information"
          isOpen={expandedSections.business}
          onToggle={() => toggleSection('business')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Business Type</label>
              <CheckboxGroup
                options={BUSINESS_TYPES}
                values={localFilters.businessType || []}
                onChange={(values) => updateFilter('businessType', values)}
              />
            </div>
          </div>
        </FilterSection>

        {/* Location Filters */}
        <FilterSection
          title="Location"
          isOpen={expandedSections.location}
          onToggle={() => toggleSection('location')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Location</label>
              <Input
                type="text"
                placeholder="City, state, or region..."
                value={localFilters.location || ''}
                onChange={(e) => updateFilter('location', e.target.value)}
                className="bg-earthy-beige/30 border-0 focus:glass-3 focus:shadow-glow-olive"
              />
            </div>
          </div>
        </FilterSection>

        {/* Performance Filters */}
        <FilterSection
          title="Performance Metrics"
          isOpen={expandedSections.performance}
          onToggle={() => toggleSection('performance')}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-dark mb-2 block">Min Rating</label>
                <select
                  value={localFilters.minRating || ''}
                  onChange={(e) => updateFilter('minRating', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-xl bg-earthy-beige/30 border-0 text-text-dark focus:outline-none"
                >
                  <option value="">Any rating</option>
                  <option value="4.5">4.5+ stars</option>
                  <option value="4.0">4.0+ stars</option>
                  <option value="3.5">3.5+ stars</option>
                  <option value="3.0">3.0+ stars</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-text-dark mb-2 block">Min Orders</label>
                <select
                  value={localFilters.minOrders || ''}
                  onChange={(e) => updateFilter('minOrders', e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 rounded-xl bg-earthy-beige/30 border-0 text-text-dark focus:outline-none"
                >
                  <option value="">Any orders</option>
                  <option value="100">100+ orders</option>
                  <option value="50">50+ orders</option>
                  <option value="10">10+ orders</option>
                  <option value="1">1+ orders</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Risk Level</label>
              <select
                value={localFilters.riskLevel || ''}
                onChange={(e) => updateFilter('riskLevel', e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-earthy-beige/30 border-0 text-text-dark focus:outline-none"
              >
                <option value="">All risk levels</option>
                <option value="low">Low risk (0-30%)</option>
                <option value="medium">Medium risk (31-70%)</option>
                <option value="high">High risk (71-100%)</option>
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Date Filters */}
        <FilterSection
          title="Date Range"
          isOpen={expandedSections.dates}
          onToggle={() => toggleSection('dates')}
        >
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-dark mb-2 block">Registration Date</label>
              <select
                value={localFilters.dateRange || ''}
                onChange={(e) => updateFilter('dateRange', e.target.value || null)}
                className="w-full px-3 py-2 rounded-xl bg-earthy-beige/30 border-0 text-text-dark focus:outline-none"
              >
                <option value="">All time</option>
                <option value="last_7_days">Last 7 days</option>
                <option value="last_30_days">Last 30 days</option>
                <option value="last_90_days">Last 90 days</option>
                <option value="last_year">Last year</option>
              </select>
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Filter Actions */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            disabled={activeFilterCount === 0}
            className="flex items-center gap-2 text-tomato-red border-tomato-red/30 hover:bg-tomato-red/5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Filters
          </Button>
          
          <div className="text-sm text-text-muted">
            {totalResults.toLocaleString()} vendor{totalResults !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VendorFilters;