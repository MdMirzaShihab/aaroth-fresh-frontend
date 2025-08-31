/**
 * VendorDirectory - Business Card Layout for Vendor Management
 * Professional business information cards with verification status, performance metrics, and geographic data
 * Features: Grid/list toggle, business card design, performance indicators, location mapping
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Star,
  TrendingUp,
  Package,
  DollarSign,
  Eye,
  Edit3,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  Users,
  Building2,
  Grid3X3,
  List,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button, StatusBadge } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

// Vendor business card component
const VendorBusinessCard = ({ vendor, isSelected, onSelect, onAction }) => {
  const { isDarkMode } = useTheme();
  const [showActions, setShowActions] = useState(false);

  const getVerificationStatusColor = (status) => {
    const colors = {
      approved: 'text-sage-green bg-sage-green/10 border-sage-green/20',
      pending: 'text-earthy-yellow bg-earthy-yellow/10 border-earthy-yellow/20',
      rejected: 'text-tomato-red bg-tomato-red/10 border-tomato-red/20',
    };
    return colors[status] || colors.pending;
  };

  const formatBusinessMetrics = (metrics) => {
    return {
      revenue: metrics?.totalRevenue
        ? `$${(metrics.totalRevenue / 1000).toFixed(1)}k`
        : '$0',
      orders: metrics?.totalOrders || 0,
      rating: metrics?.rating ? metrics.rating.toFixed(1) : 'N/A',
      listings: metrics?.totalListings || 0,
    };
  };

  const metrics = formatBusinessMetrics(vendor.businessMetrics);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative"
    >
      <Card
        className={`glass-card-olive rounded-3xl p-6 border sage-highlight hover:shadow-glow-sage 
                        transition-all duration-300 cursor-pointer ${isSelected ? 'ring-2 ring-muted-olive/30' : ''}`}
      >
        {/* Header with selection and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(vendor.id, e.target.checked)}
              className="w-4 h-4 rounded border-2 border-muted-olive/30 text-muted-olive focus:ring-muted-olive/20"
            />
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                            flex items-center justify-center shadow-lg text-white font-medium"
            >
              <Store className="w-6 h-6" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge
              status={vendor.verificationStatus}
              className={`${getVerificationStatusColor(vendor.verificationStatus)} px-2 py-1 rounded-lg text-xs font-medium border`}
            >
              {vendor.verificationStatus === 'approved' && (
                <CheckCircle className="w-3 h-3 mr-1" />
              )}
              {vendor.verificationStatus === 'pending' && (
                <Clock className="w-3 h-3 mr-1" />
              )}
              {vendor.verificationStatus === 'rejected' && (
                <XCircle className="w-3 h-3 mr-1" />
              )}
              {vendor.verificationStatus.charAt(0).toUpperCase() +
                vendor.verificationStatus.slice(1)}
            </StatusBadge>

            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showActions && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActions(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface rounded-xl 
                                  shadow-xl border border-gray-200 dark:border-dark-border z-20"
                  >
                    <button
                      onClick={() => onAction(vendor, 'view_profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 
                                 dark:hover:bg-gray-600 first:rounded-t-xl transition-colors text-text-dark dark:text-dark-text-primary"
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => onAction(vendor, 'edit_profile')}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 
                                 dark:hover:bg-gray-600 transition-colors text-text-dark dark:text-dark-text-primary"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Profile
                    </button>
                    {vendor.verificationStatus === 'pending' && (
                      <>
                        <button
                          onClick={() =>
                            onAction(vendor, 'approve_verification')
                          }
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 
                                     dark:hover:bg-gray-600 transition-colors text-sage-green"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            onAction(vendor, 'reject_verification')
                          }
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 
                                     dark:hover:bg-gray-600 last:rounded-b-xl transition-colors text-tomato-red"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="olive-accent pl-4 mb-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-dark-text-primary mb-1">
            {vendor.businessName}
          </h3>
          <p className="text-sm text-text-muted">Owner: {vendor.ownerName}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-1 bg-dusty-cedar/10 text-dusty-cedar text-xs rounded-full font-medium">
              {vendor.businessType}
            </span>
            {vendor.riskScore > 0 && (
              <span
                className={`px-2 py-1 text-xs rounded-full font-medium ${
                  vendor.riskScore > 70
                    ? 'bg-tomato-red/10 text-tomato-red'
                    : vendor.riskScore > 40
                      ? 'bg-earthy-yellow/10 text-earthy-yellow'
                      : 'bg-sage-green/10 text-sage-green'
                }`}
              >
                Risk: {vendor.riskScore}%
              </span>
            )}
          </div>
        </div>

        {/* Business Details */}
        <div className="cedar-warmth rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <Mail className="w-4 h-4 text-muted-olive" />
              <span className="truncate">{vendor.email}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Phone className="w-4 h-4 text-muted-olive" />
              <span>{vendor.phone || 'No phone'}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <MapPin className="w-4 h-4 text-muted-olive" />
              <span className="truncate">{vendor.location}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-4 h-4 text-muted-olive" />
              <span>Joined: {vendor.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-sage-green/10 rounded-lg mb-1">
              <DollarSign className="w-4 h-4 text-sage-green" />
            </div>
            <p className="text-xs text-text-muted">Revenue</p>
            <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
              {metrics.revenue}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-sage-green/10 rounded-lg mb-1">
              <Package className="w-4 h-4 text-sage-green" />
            </div>
            <p className="text-xs text-text-muted">Orders</p>
            <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
              {metrics.orders}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-earthy-yellow/10 rounded-lg mb-1">
              <Star className="w-4 h-4 text-earthy-yellow" />
            </div>
            <p className="text-xs text-text-muted">Rating</p>
            <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
              {metrics.rating}
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-8 h-8 bg-dusty-cedar/10 rounded-lg mb-1">
              <Building2 className="w-4 h-4 text-dusty-cedar" />
            </div>
            <p className="text-xs text-text-muted">Listings</p>
            <p className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
              {metrics.listings}
            </p>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>Last active: {vendor.lastActiveAt}</span>
            {vendor.urgencyLevel && vendor.urgencyLevel !== 'none' && (
              <span
                className={`flex items-center gap-1 ${
                  vendor.urgencyLevel === 'critical'
                    ? 'text-tomato-red'
                    : vendor.urgencyLevel === 'high'
                      ? 'text-earthy-yellow'
                      : 'text-sage-green'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                {vendor.urgencyLevel}
              </span>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// List view component
const VendorListItem = ({ vendor, isSelected, onSelect, onAction }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 p-4 bg-white dark:bg-dark-bg-alt rounded-2xl border 
                 border-gray-200 dark:border-dark-border hover:border-muted-olive/30 transition-all duration-200"
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(vendor.id, e.target.checked)}
        className="w-4 h-4 rounded border-2 border-muted-olive/30 text-muted-olive focus:ring-muted-olive/20"
      />

      <div
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                      flex items-center justify-center shadow-lg text-white font-medium"
      >
        <Store className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h4 className="font-medium text-text-dark dark:text-dark-text-primary truncate">
            {vendor.businessName}
          </h4>
          <StatusBadge
            status={vendor.verificationStatus}
            variant="glass"
            size="small"
          />
        </div>
        <p className="text-sm text-text-muted truncate">
          {vendor.ownerName} • {vendor.businessType} • {vendor.location}
        </p>
      </div>

      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="font-medium text-text-dark dark:text-dark-text-primary">
            {vendor.businessMetrics?.totalOrders || 0}
          </p>
          <p className="text-xs text-text-muted">Orders</p>
        </div>
        <div className="text-center">
          <p className="font-medium text-text-dark dark:text-dark-text-primary">
            {vendor.businessMetrics?.rating?.toFixed(1) || 'N/A'}
          </p>
          <p className="text-xs text-text-muted">Rating</p>
        </div>
        <div className="text-center">
          <p
            className={`font-medium ${vendor.riskScore > 70 ? 'text-tomato-red' : 'text-text-dark dark:text-dark-text-primary'}`}
          >
            {vendor.riskScore}%
          </p>
          <p className="text-xs text-text-muted">Risk</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction(vendor, 'view_profile')}
        >
          <Eye className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onAction(vendor, 'edit_profile')}
        >
          <Edit3 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

const VendorDirectory = ({
  vendors = [],
  loading = false,
  error = null,
  selectedVendors = [],
  currentPage = 1,
  pageSize = 20,
  totalPages = 1,
  totalVendors = 0,
  onVendorSelect,
  onSelectAll,
  onPageChange,
  onPageSizeChange,
  onVendorAction,
}) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  // Handle select all
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (onSelectAll) {
      onSelectAll(isChecked);
    }
  };

  // Loading state
  if (loading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load vendors"
          description={
            error.message || 'An error occurred while loading vendors'
          }
          action={
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!loading && vendors.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Store}
          title="No vendors found"
          description="No vendors match your current search and filter criteria"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Directory Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selectedVendors.length === vendors.length && vendors.length > 0
              }
              onChange={handleSelectAll}
              className="w-4 h-4 rounded border-2 border-muted-olive/30 text-muted-olive focus:ring-muted-olive/20"
            />
            <span className="text-sm text-text-muted">
              {selectedVendors.length > 0
                ? `${selectedVendors.length} selected`
                : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalVendors)} of ${totalVendors.toLocaleString()}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-dark-bg text-muted-olive shadow-sm'
                  : 'text-text-muted hover:text-text-dark dark:hover:text-dark-text-primary'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-dark-bg text-muted-olive shadow-sm'
                  : 'text-text-muted hover:text-text-dark dark:hover:text-dark-text-primary'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Page Size Selector */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
              className="border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 
                         bg-white dark:bg-dark-surface text-text-dark dark:text-dark-text-primary"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendor Grid/List */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <VendorBusinessCard
              key={vendor.id}
              vendor={vendor}
              isSelected={selectedVendors.includes(vendor.id)}
              onSelect={onVendorSelect}
              onAction={onVendorAction}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <VendorListItem
              key={vendor.id}
              vendor={vendor}
              isSelected={selectedVendors.includes(vendor.id)}
              onSelect={onVendorSelect}
              onAction={onVendorAction}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm text-text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showPageNumbers
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && vendors.length > 0 && (
        <div className="absolute inset-0 bg-white/50 dark:bg-dark-bg/50 flex items-center justify-center rounded-2xl">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
};

export default VendorDirectory;
