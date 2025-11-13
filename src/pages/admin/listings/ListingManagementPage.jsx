/**
 * ListingManagementPage - Admin V2 Listing Management Interface
 * Professional B2B listing directory with content moderation, status management, and featured listings
 * Features: Listing table, bulk operations, status updates, featured/flagged management
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Filter,
  Download,
  RefreshCw,
  Search,
  Star,
  Flag,
  Eye,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Button, Input } from '../../../components/ui';
import {
  useGetAdminListingsQuery,
  useGetFeaturedListingsQuery,
  useGetFlaggedListingsQuery,
  useUpdateListingStatusMutation,
  useToggleListingFeaturedMutation,
  useUpdateListingFlagMutation,
  useSoftDeleteListingMutation,
  useBulkUpdateListingsMutation,
} from '../../../store/slices/admin/adminApiSlice';
import {
  generateExportData,
  getListingStatistics,
  LISTING_STATUSES,
} from '../../../services/admin/listingsService';

// Lazy load sub-components (will be created next)
const ListingDirectoryTable = React.lazy(() =>
  import('./components/ListingDirectoryTable')
);
const ListingDetailsModal = React.lazy(() =>
  import('./components/ListingDetailsModal')
);
const ListingFilters = React.lazy(() => import('./components/ListingFilters'));
const BulkListingOperations = React.lazy(() =>
  import('./components/BulkListingOperations')
);

const ListingManagementPage = () => {
  const { isDarkMode } = useTheme();

  // View state
  const [currentView, setCurrentView] = useState('all'); // all, featured, flagged

  // Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListings, setSelectedListings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingDetails, setShowListingDetails] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Build query params based on current view
  const queryParams = useMemo(() => {
    const params = {
      page: currentPage,
      limit: pageSize,
      search: searchQuery,
      sortBy: sortConfig.field,
      sortOrder: sortConfig.direction,
      ...activeFilters,
    };

    // Add view-specific filters
    if (currentView === 'featured') {
      params.featured = true;
    } else if (currentView === 'flagged') {
      params.isFlagged = true;
    }

    return params;
  }, [currentPage, pageSize, searchQuery, sortConfig, activeFilters, currentView]);

  // API queries - use appropriate endpoint based on view
  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
    refetch: refetchListings,
  } = useGetAdminListingsQuery(queryParams);

  // Mutations
  const [updateListingStatus] = useUpdateListingStatusMutation();
  const [toggleListingFeatured] = useToggleListingFeaturedMutation();
  const [updateListingFlag] = useUpdateListingFlagMutation();
  const [softDeleteListing] = useSoftDeleteListingMutation();
  const [bulkUpdateListings] = useBulkUpdateListingsMutation();

  // Extract data
  const listings = listingsData?.data || [];
  const totalListings = listingsData?.total || 0;
  const totalPages = listingsData?.pages || Math.ceil(totalListings / pageSize);

  // Calculate statistics
  const statistics = useMemo(
    () => getListingStatistics(listings),
    [listings]
  );

  // Handle listing selection
  const handleListingSelect = useCallback((listingId, selected) => {
    setSelectedListings((prev) =>
      selected ? [...prev, listingId] : prev.filter((id) => id !== listingId)
    );
  }, []);

  const handleSelectAll = useCallback(
    (selected) => {
      if (selected) {
        setSelectedListings(listings.map((listing) => listing._id));
      } else {
        setSelectedListings([]);
      }
    },
    [listings]
  );

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  }, []);

  // Handle filtering
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  // Handle view change
  const handleViewChange = useCallback((view) => {
    setCurrentView(view);
    setCurrentPage(1);
    setSelectedListings([]);
  }, []);

  // Handle status update
  const handleStatusUpdate = useCallback(
    async (listingId, status, reason = '') => {
      try {
        setIsModalLoading(true);
        toast.loading(`Updating listing status to ${status}...`);

        await updateListingStatus({
          id: listingId,
          status,
          reason,
        }).unwrap();

        toast.dismiss();
        toast.success(`Listing status updated to ${status} successfully`);
        refetchListings();
        setShowListingDetails(false);
      } catch (error) {
        toast.dismiss();
        toast.error(error?.data?.message || 'Failed to update listing status');
      } finally {
        setIsModalLoading(false);
      }
    },
    [updateListingStatus, refetchListings]
  );

  // Handle featured toggle
  const handleFeaturedToggle = useCallback(
    async (listingId) => {
      try {
        toast.loading('Updating featured status...');

        await toggleListingFeatured({ id: listingId }).unwrap();

        toast.dismiss();
        toast.success('Featured status updated successfully');
        refetchListings();
      } catch (error) {
        toast.dismiss();
        toast.error(error?.data?.message || 'Failed to update featured status');
      }
    },
    [toggleListingFeatured, refetchListings]
  );

  // Handle flag update
  const handleFlagUpdate = useCallback(
    async (listingId, isFlagged, flagReason = '') => {
      try {
        setIsModalLoading(true);
        toast.loading(`${isFlagged ? 'Flagging' : 'Unflagging'} listing...`);

        await updateListingFlag({
          id: listingId,
          isFlagged,
          flagReason,
        }).unwrap();

        toast.dismiss();
        toast.success(
          `Listing ${isFlagged ? 'flagged' : 'unflagged'} successfully`
        );
        refetchListings();
        setShowListingDetails(false);
      } catch (error) {
        toast.dismiss();
        toast.error(error?.data?.message || 'Failed to update flag status');
      } finally {
        setIsModalLoading(false);
      }
    },
    [updateListingFlag, refetchListings]
  );

  // Handle listing deletion
  const handleDeleteListing = useCallback(
    async (listingId, reason = '') => {
      try {
        setIsModalLoading(true);
        toast.loading('Deleting listing...');

        await softDeleteListing({ id: listingId, reason }).unwrap();

        toast.dismiss();
        toast.success('Listing deleted successfully');
        refetchListings();
        setShowListingDetails(false);
      } catch (error) {
        toast.dismiss();
        toast.error(error?.data?.message || 'Failed to delete listing');
      } finally {
        setIsModalLoading(false);
      }
    },
    [softDeleteListing, refetchListings]
  );

  // Handle bulk operations
  const handleBulkAction = useCallback(
    async (action, reason = '') => {
      if (selectedListings.length === 0) {
        toast.error('No listings selected');
        return;
      }

      try {
        toast.loading(`Performing bulk ${action} on ${selectedListings.length} listings...`);

        await bulkUpdateListings({
          ids: selectedListings,
          action,
          reason,
        }).unwrap();

        toast.dismiss();
        toast.success(`Bulk ${action} completed successfully`);
        setSelectedListings([]);
        refetchListings();
      } catch (error) {
        toast.dismiss();
        toast.error(error?.data?.message || `Failed to perform bulk ${action}`);
      }
    },
    [selectedListings, bulkUpdateListings, refetchListings]
  );

  // Handle export
  const handleExport = useCallback(() => {
    try {
      const csvData = generateExportData(listings, 'csv');
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `listings-export-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Listings exported successfully');
    } catch (error) {
      toast.error('Failed to export listings');
    }
  }, [listings]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchListings();
    toast.success('Listings refreshed');
  }, [refetchListings]);

  // View listing details
  const handleViewDetails = useCallback((listing) => {
    setSelectedListing(listing);
    setShowListingDetails(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/30 via-white to-mint-fresh/10 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200/50 dark:border-slate-700/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-earthy-yellow/20 to-mint-fresh/20 rounded-2xl">
                <Package className="w-6 h-6 text-bottle-green" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
                  Listing Management
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Moderate product listings, manage featured items, and handle flags
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={listingsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`w-4 h-4 ${listingsLoading ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={listings.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                currentView === 'all'
                  ? 'bg-mint-fresh text-bottle-green shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Package className="w-4 h-4 inline mr-2" />
              All Listings
              <span className="ml-2 px-2 py-0.5 bg-bottle-green/20 rounded-full text-xs">
                {statistics.total}
              </span>
            </button>
            <button
              onClick={() => handleViewChange('featured')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                currentView === 'featured'
                  ? 'bg-earthy-yellow text-earthy-brown shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Star className="w-4 h-4 inline mr-2" />
              Featured
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {statistics.featured}
              </span>
            </button>
            <button
              onClick={() => handleViewChange('flagged')}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                currentView === 'flagged'
                  ? 'bg-tomato-red text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <Flag className="w-4 h-4 inline mr-2" />
              Flagged
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {statistics.flagged}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by product name, vendor, or status..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 pr-4 py-3 w-full rounded-xl border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Statistics Bar */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 bg-mint-fresh/10 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Active
                </span>
                <CheckCircle className="w-4 h-4 text-mint-fresh" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {statistics.active}
              </p>
            </div>
            <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Inactive
                </span>
                <XCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {statistics.inactive}
              </p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Out of Stock
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {statistics.outOfStock}
              </p>
            </div>
            <div className="p-3 bg-tomato-red/10 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Discontinued
                </span>
                <XCircle className="w-4 h-4 text-tomato-red" />
              </div>
              <p className="text-lg font-semibold text-slate-800 dark:text-white">
                {statistics.discontinued}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <React.Suspense
              fallback={
                <Card className="p-4">
                  <p className="text-center text-slate-600">Loading filters...</p>
                </Card>
              }
            >
              <ListingFilters
                activeFilters={activeFilters}
                onFilterChange={handleFilterChange}
                onClose={() => setShowFilters(false)}
              />
            </React.Suspense>
          </motion.div>
        )}

        {/* Bulk Operations */}
        {selectedListings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <React.Suspense fallback={<div>Loading...</div>}>
              <BulkListingOperations
                selectedCount={selectedListings.length}
                onBulkAction={handleBulkAction}
                onCancel={() => setSelectedListings([])}
              />
            </React.Suspense>
          </motion.div>
        )}

        {/* Listing Directory Table */}
        <React.Suspense
          fallback={
            <Card className="p-8">
              <div className="flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-bottle-green" />
                <span className="ml-3 text-slate-600">Loading listings...</span>
              </div>
            </Card>
          }
        >
          <ListingDirectoryTable
            listings={listings}
            isLoading={listingsLoading}
            error={listingsError}
            selectedListings={selectedListings}
            sortConfig={sortConfig}
            onSort={handleSort}
            onSelect={handleListingSelect}
            onSelectAll={handleSelectAll}
            onViewDetails={handleViewDetails}
            onStatusUpdate={handleStatusUpdate}
            onFeaturedToggle={handleFeaturedToggle}
            onFlagUpdate={handleFlagUpdate}
            onDelete={handleDeleteListing}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </React.Suspense>
      </div>

      {/* Listing Details Modal */}
      {showListingDetails && selectedListing && (
        <React.Suspense fallback={<div>Loading...</div>}>
          <ListingDetailsModal
            listing={selectedListing}
            isOpen={showListingDetails}
            isLoading={isModalLoading}
            onClose={() => {
              setShowListingDetails(false);
              setSelectedListing(null);
            }}
            onStatusUpdate={handleStatusUpdate}
            onFeaturedToggle={handleFeaturedToggle}
            onFlagUpdate={handleFlagUpdate}
            onDelete={handleDeleteListing}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default ListingManagementPage;
