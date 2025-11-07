/**
 * ListingFilters - Comprehensive filtering for admin listings
 * Enhanced with category, vendor, date range, quality grade, and more
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Filter, Calendar, DollarSign, Star, Package, User, Tag } from 'lucide-react';
import { Card, Button } from '../../../../components/ui';
import { LISTING_STATUSES } from '../../../../services/admin-v2/listingsService';

const ListingFilters = ({ activeFilters, onFilterChange, onClose }) => {
  const [filters, setFilters] = useState(activeFilters || {});
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Fetch categories and vendors for filter options
  useEffect(() => {
    // TODO: Fetch categories and vendors from API
    // For now, we'll use the filters that already exist in the backend
  }, []);

  const handleFilterUpdate = (key, value) => {
    setFilters((prev) => {
      const updated = { ...prev };
      if (value === '' || value === null || value === undefined) {
        delete updated[key];
      } else {
        updated[key] = value;
      }
      return updated;
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key] !== '' && filters[key] !== null && filters[key] !== undefined
  ).length;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bottle-green/10 rounded-xl">
            <Filter className="w-5 h-5 text-bottle-green" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
              Advanced Filters
            </h3>
            {activeFilterCount > 0 && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
              </p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Section 1: Status & Flags */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-earthy-yellow" />
            Status & Flags
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterUpdate('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {Object.entries(LISTING_STATUSES).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Featured
              </label>
              <select
                value={filters.featured || ''}
                onChange={(e) => handleFilterUpdate('featured', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Listings</option>
                <option value="true">Featured Only</option>
                <option value="false">Non-Featured</option>
              </select>
            </div>

            {/* Flagged Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Flagged
              </label>
              <select
                value={filters.isFlagged || ''}
                onChange={(e) => handleFilterUpdate('isFlagged', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Listings</option>
                <option value="true">Flagged Only</option>
                <option value="false">Not Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Price & Quality */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-mint-fresh" />
            Price & Quality
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Min Price (AED)
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={filters.minPrice || ''}
                onChange={(e) => handleFilterUpdate('minPrice', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Max Price (AED)
              </label>
              <input
                type="number"
                placeholder="10000"
                min="0"
                step="0.01"
                value={filters.maxPrice || ''}
                onChange={(e) => handleFilterUpdate('maxPrice', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Quality Grade
              </label>
              <select
                value={filters.qualityGrade || ''}
                onChange={(e) => handleFilterUpdate('qualityGrade', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Grades</option>
                <option value="A+">A+ Premium</option>
                <option value="A">A High Quality</option>
                <option value="B">B Standard</option>
                <option value="C">C Economy</option>
              </select>
            </div>

            {/* In Season */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                In Season
              </label>
              <select
                value={filters.isInSeason || ''}
                onChange={(e) => handleFilterUpdate('isInSeason', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Products</option>
                <option value="true">In Season Only</option>
                <option value="false">Off Season</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Vendor & Category */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-bottle-green" />
            Product & Vendor
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vendor Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Vendor
              </label>
              <input
                type="text"
                placeholder="Search by vendor name..."
                value={filters.vendor || ''}
                onChange={(e) => handleFilterUpdate('vendor', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Category
              </label>
              <input
                type="text"
                placeholder="Search by category..."
                value={filters.category || ''}
                onChange={(e) => handleFilterUpdate('category', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Date Range */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-earthy-yellow" />
            Date Range
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Created After
              </label>
              <input
                type="date"
                value={filters.createdAfter || ''}
                onChange={(e) => handleFilterUpdate('createdAfter', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Created Before
              </label>
              <input
                type="date"
                value={filters.createdBefore || ''}
                onChange={(e) => handleFilterUpdate('createdBefore', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Availability & Stock */}
        <div>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-mint-fresh" />
            Availability & Performance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Min Quantity Available */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Min Quantity Available
              </label>
              <input
                type="number"
                placeholder="0"
                min="0"
                value={filters.minQuantity || ''}
                onChange={(e) => handleFilterUpdate('minQuantity', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              />
            </div>

            {/* Min Rating */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleFilterUpdate('minRating', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3">3+ Stars</option>
              </select>
            </div>

            {/* Has Orders */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Order Activity
              </label>
              <select
                value={filters.hasOrders || ''}
                onChange={(e) => handleFilterUpdate('hasOrders', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:ring-2 focus:ring-bottle-green focus:border-transparent"
              >
                <option value="">All Listings</option>
                <option value="true">With Orders</option>
                <option value="false">No Orders Yet</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <Button variant="outline" onClick={handleReset} className="flex items-center gap-2">
          <X className="w-4 h-4" />
          Reset All
        </Button>
        <Button onClick={handleApply} className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Apply Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default ListingFilters;
