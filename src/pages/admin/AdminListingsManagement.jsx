import React, { useState, useMemo } from 'react';
import {
  Package,
  Star,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Settings,
} from 'lucide-react';
import {
  useGetAdminListingsQuery,
  useGetAdminCategoriesQuery,
  useGetAdminListingQuery,
  useToggleListingFeaturedMutation,
  useUpdateAdminListingStatusMutation,
  useSoftDeleteListingMutation,
  useUpdateListingFlagMutation,
  useBulkUpdateAdminListingsMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DataTable } from '../../components/ui/Table';
import ListingFlagModal from '../../components/admin/ListingFlagModal';
import ListingStatusModal from '../../components/admin/ListingStatusModal';
import BulkActionsModal from '../../components/admin/BulkActionsModal';
import ListingDetailsModal from '../../components/admin/ListingDetailsModal';

const AdminListingsManagement = () => {
  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVendor] = useState('all');
  const [selectedFeatured, setSelectedFeatured] = useState('all');
  const [selectedFlagged, setSelectedFlagged] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  
  // Modal states
  const [flagModal, setFlagModal] = useState({ isOpen: false, listing: null });
  const [statusModal, setStatusModal] = useState({ isOpen: false, listing: null });
  const [bulkModal, setBulkModal] = useState({ isOpen: false });
  const [viewModal, setViewModal] = useState({ isOpen: false, listingId: null });

  const itemsPerPage = 10;

  // Query params for API call
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      vendor: selectedVendor !== 'all' ? selectedVendor : undefined,
      featured: selectedFeatured !== 'all' ? (selectedFeatured === 'true') : undefined,
      flagged: selectedFlagged !== 'all' ? (selectedFlagged === 'true') : undefined,
      sortBy,
      sortOrder,
    }),
    [currentPage, searchTerm, selectedCategory, selectedStatus, selectedVendor, selectedFeatured, selectedFlagged, sortBy, sortOrder]
  );

  // RTK Query hooks
  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminListingsQuery(queryParams);

  const { data: categoriesData } = useGetAdminCategoriesQuery();

  const [toggleFeatured] = useToggleListingFeaturedMutation();
  const [updateListingStatus] = useUpdateAdminListingStatusMutation();
  const [deleteListing] = useSoftDeleteListingMutation();
  const [updateListingFlag] = useUpdateListingFlagMutation();
  const [bulkUpdateListings] = useBulkUpdateAdminListingsMutation();

  // Fix data structure parsing to match backend response format
  const listings = listingsData?.data || [];
  const totalListings = listingsData?.total || 0;
  const totalPages = listingsData?.pages || 1;
  const currentPageFromAPI = listingsData?.page || 1;
  const stats = listingsData?.stats || null;
  
  const categories = categoriesData?.data || [];

  // Status options (matching backend enum values)
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'discontinued', label: 'Discontinued' },
  ];

  // Handle featured toggle
  const handleToggleFeatured = async (listingId) => {
    try {
      await toggleFeatured(listingId).unwrap();
      setConfirmAction(null);
    } catch (err) {
      console.error('Failed to toggle featured status:', err);
    }
  };

  // Handle listing status update
  const handleStatusUpdate = async (listingId, status, reason = '') => {
    try {
      await updateListingStatus({
        id: listingId,
        status,
        reason,
      }).unwrap();
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update listing status:', error);
    }
  };

  // Handle listing flag
  const handleFlag = async (listingId, flagReason, moderationNotes = '') => {
    try {
      await updateListingFlag({
        id: listingId,
        action: 'flag',
        flagReason,
        moderationNotes,
      }).unwrap();
    } catch (error) {
      throw error; // Re-throw to be handled by modal
    }
  };

  // Handle listing unflag
  const handleUnflag = async (listingId, moderationNotes = '') => {
    try {
      await updateListingFlag({
        id: listingId,
        action: 'unflag',
        moderationNotes,
      }).unwrap();
    } catch (error) {
      throw error; // Re-throw to be handled by modal
    }
  };

  // Handle bulk actions
  const handleBulkAction = async ({ action, listingIds, data }) => {
    try {
      await bulkUpdateListings({
        action,
        listingIds,
        ...data,
      }).unwrap();
      setSelectedListings(new Set()); // Clear selections after successful action
    } catch (error) {
      throw error; // Re-throw to be handled by modal
    }
  };

  // Handle view listing details
  const handleViewListing = (listingId) => {
    setViewModal({ isOpen: true, listingId });
  };

  // Handle listing deletion
  const handleDelete = async (listingId, reason = '') => {
    try {
      await deleteListing({
        id: listingId,
        reason,
      }).unwrap();
      setConfirmAction(null);
      setSelectedListings((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map((listing) => listing._id)));
    }
  };

  const handleSelectListing = (listingId) => {
    setSelectedListings((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  // Get status badge styling (updated for backend status values)
  const getStatusBadge = (status, isFeatured, isFlagged) => {
    if (isFlagged) {
      return {
        className: 'bg-tomato-red/20 text-tomato-red',
        icon: AlertTriangle,
        text: 'Flagged',
      };
    }

    if (isFeatured) {
      return {
        className: 'bg-amber-100 text-amber-800',
        icon: Star,
        text: 'Featured',
      };
    }

    switch (status?.toLowerCase()) {
      case 'active':
        return {
          className: 'bg-mint-fresh/20 text-bottle-green',
          icon: CheckCircle,
          text: 'Active',
        };
      case 'inactive':
        return {
          className: 'bg-gray-100 text-gray-600',
          icon: XCircle,
          text: 'Inactive',
        };
      case 'out_of_stock':
        return {
          className: 'bg-earthy-yellow/20 text-earthy-brown',
          icon: AlertTriangle,
          text: 'Out of Stock',
        };
      case 'discontinued':
        return {
          className: 'bg-tomato-red/20 text-tomato-red',
          icon: XCircle,
          text: 'Discontinued',
        };
      default:
        return {
          className: 'bg-gray-100 text-gray-600',
          icon: Clock,
          text: 'Unknown',
        };
    }
  };

  // Table columns configuration
  const columns = [
    {
      id: 'select',
      header: (
        <input
          type="checkbox"
          checked={
            selectedListings.size === listings.length && listings.length > 0
          }
          onChange={handleSelectAll}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      cell: (listing) => (
        <input
          type="checkbox"
          checked={selectedListings.has(listing._id)}
          onChange={() => handleSelectListing(listing._id)}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      width: '48px',
    },
    {
      id: 'product',
      header: 'Product',
      cell: (listing) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {listing.images?.[0]?.url || listing.productId?.images?.[0]?.url || listing.product?.images?.[0]?.url ? (
              <img
                src={
                  listing.images?.[0]?.url || listing.productId?.images?.[0]?.url || listing.product?.images?.[0]?.url
                }
                alt={listing.productId?.name || listing.product?.name || listing.name || 'Product'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-dark dark:text-white truncate">
              {listing.productId?.name || listing.product?.name || listing.name || 'Unknown Product'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {listing.productId?.category?.name || listing.product?.category?.name || 'No Category'}
            </p>
            <p className="text-xs text-bottle-green truncate">
              {listing.qualityGrade || 'Standard'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      width: '300px',
    },
    {
      id: 'vendor',
      header: 'Vendor',
      cell: (listing) => (
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-text-muted" />
          <div>
            <p className="text-sm font-medium text-text-dark dark:text-white">
              {listing.vendorId?.businessName ||
                listing.vendor?.businessName ||
                listing.vendorId?.name ||
                listing.vendor?.name ||
                'Unknown Vendor'}
            </p>
            <p className="text-xs text-text-muted">
              {listing.vendorId?.contactInfo?.phone || listing.vendor?.phone || 'No contact'}
            </p>
            <p className="text-xs text-text-muted">
              {listing.vendorId?.address?.city || listing.vendor?.address?.city || ''}
            </p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'price',
      header: 'Price',
      cell: (listing) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-text-muted" />
          <span className="text-sm font-medium text-text-dark dark:text-white">
            {listing.pricing?.[0]?.pricePerUnit?.toFixed(2) ||
              listing.price?.toFixed(2) ||
              '0.00'}
          </span>
          <span className="text-xs text-text-muted">
            /{listing.pricing?.[0]?.unit || listing.availability?.unit || 'kg'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'stock',
      header: 'Stock',
      cell: (listing) => (
        <div className="text-sm">
          <span className="text-text-dark dark:text-white">
            {listing.availability?.quantityAvailable || 0}
          </span>
          <span className="text-xs text-text-muted ml-1">
            {listing.availability?.unit || 'kg'}
          </span>
          {listing.availability?.isInSeason !== undefined && (
            <div className="text-xs">
              <span
                className={`px-1 py-0.5 rounded text-xs ${
                  listing.availability.isInSeason
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {listing.availability.isInSeason ? 'In Season' : 'Off Season'}
              </span>
            </div>
          )}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (listing) => {
        const badge = getStatusBadge(
          listing.status,
          listing.featured || listing.isFeatured,
          listing.isFlagged
        );
        return (
          <div className="flex items-center gap-1">
            <badge.icon className="w-3 h-3" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: 'created',
      header: 'Created',
      cell: (listing) => (
        <div className="text-sm text-text-muted">
          {listing.createdAt
            ? new Date(listing.createdAt).toLocaleDateString()
            : 'Unknown'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (listing) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              setConfirmAction({
                type: 'toggle-featured',
                listing,
                title: `${listing.featured || listing.isFeatured ? 'Remove from' : 'Add to'} Featured`,
                message: `Are you sure you want to ${
                  listing.featured || listing.isFeatured
                    ? 'remove this listing from'
                    : 'add this listing to'
                } featured products?`,
                confirmText:
                  listing.featured || listing.isFeatured ? 'Remove' : 'Feature',
                onConfirm: () => handleToggleFeatured(listing._id),
              })
            }
            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              listing.featured || listing.isFeatured
                ? 'text-amber-600 hover:bg-amber-50'
                : 'text-text-muted hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={
              listing.featured || listing.isFeatured
                ? 'Remove from featured'
                : 'Add to featured'
            }
          >
            <Star
              className={`w-4 h-4 ${listing.featured || listing.isFeatured ? 'fill-current' : ''}`}
            />
          </button>

          {/* Status Update Button */}
          <button
            onClick={() => setStatusModal({ isOpen: true, listing })}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Update status"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Flag/Unflag Button */}
          <button
            onClick={() => setFlagModal({ isOpen: true, listing })}
            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              listing.isFlagged
                ? 'text-tomato-red hover:bg-tomato-red/20'
                : 'text-text-muted hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={listing.isFlagged ? 'Remove flag' : 'Flag listing'}
          >
            <AlertTriangle className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleViewListing(listing._id)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View listing details"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setConfirmAction({
                type: 'delete',
                listing,
                title: 'Delete Listing',
                message: `Are you sure you want to permanently delete "${listing.productId?.name || listing.product?.name || 'this listing'}"? This action cannot be undone.`,
                confirmText: 'Delete',
                isDangerous: true,
                onConfirm: () => handleDelete(listing._id, 'Admin deletion'),
              })
            }
            className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Delete listing"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '200px',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load listings"
        description="There was an error loading listing data. Please try again."
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Vendor Listings Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage vendor listings for products, approvals, and featured
            listings
          </p>
        </div>

        {/* Enhanced Stats and Bulk Actions */}
        <div className="flex flex-wrap gap-4">
          {/* Bulk Actions Button */}
          {selectedListings.size > 0 && (
            <Button
              onClick={() => setBulkModal({ isOpen: true })}
              variant="outline"
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Bulk Actions ({selectedListings.size})
            </Button>
          )}
          {stats && (
            <>
              <div className="bg-mint-fresh/10 rounded-xl px-4 py-2">
                <p className="text-sm text-bottle-green font-medium">
                  {stats.totalListings || totalListings} Total
                </p>
              </div>
              <div className="bg-bottle-green/10 rounded-xl px-4 py-2">
                <p className="text-sm text-bottle-green font-medium">
                  {stats.activeListings || 0} Active
                </p>
              </div>
              <div className="bg-amber-100/80 rounded-xl px-4 py-2">
                <p className="text-sm text-amber-800 font-medium">
                  {stats.featuredListings || 0} Featured
                </p>
              </div>
              <div className="bg-tomato-red/10 rounded-xl px-4 py-2">
                <p className="text-sm text-tomato-red font-medium">
                  {stats.flaggedListings || 0} Flagged
                </p>
              </div>
            </>
          )}
          {selectedListings.size > 0 && (
            <div className="bg-blue-100/80 rounded-xl px-4 py-2">
              <p className="text-sm text-blue-800 font-medium">
                {selectedListings.size} Selected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search listings by name, vendor, product..."
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedFeatured}
              onChange={(e) => {
                setSelectedFeatured(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              <option value="all">All Listings</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>

            <select
              value={selectedFlagged}
              onChange={(e) => {
                setSelectedFlagged(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              <option value="all">All Flags</option>
              <option value="true">Flagged Only</option>
              <option value="false">Not Flagged</option>
            </select>

            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-');
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="price-asc">Price Low-High</option>
              <option value="price-desc">Price High-Low</option>
              <option value="status-asc">Status A-Z</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedStatus !== 'all' || selectedCategory !== 'all' || selectedFeatured !== 'all' || selectedFlagged !== 'all' || searchTerm) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <span className="font-medium">Active filters:</span>
                {searchTerm && (
                  <span className="bg-blue-100 px-2 py-1 rounded">Search: "{searchTerm}"</span>
                )}
                {selectedStatus !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Status: {statusOptions.find(s => s.value === selectedStatus)?.label}
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Category: {categories.find(c => c._id === selectedCategory)?.name}
                  </span>
                )}
                {selectedFeatured !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {selectedFeatured === 'true' ? 'Featured Only' : 'Non-Featured'}
                  </span>
                )}
                {selectedFlagged !== 'all' && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {selectedFlagged === 'true' ? 'Flagged Only' : 'Not Flagged'}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedStatus('all');
                  setSelectedCategory('all');
                  setSelectedFeatured('all');
                  setSelectedFlagged('all');
                  setSortBy('createdAt');
                  setSortOrder('desc');
                  setCurrentPage(1);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Listings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.id} style={{ width: column.width }}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-12">
                    <EmptyState
                      icon={Package}
                      title="No listings found"
                      description="No listings match your current filters."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                listings.map((listing) => (
                  <TableRow key={listing._id}>
                    {columns.map((column) => (
                      <TableCell key={column.id} style={{ width: column.width }}>
                        {column.cell(listing)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalListings}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>

      {/* Modals */}
      <ListingFlagModal
        isOpen={flagModal.isOpen}
        onClose={() => setFlagModal({ isOpen: false, listing: null })}
        listing={flagModal.listing}
        onFlag={handleFlag}
        onUnflag={handleUnflag}
        isLoading={updateListingFlag.isLoading}
      />

      <ListingStatusModal
        isOpen={statusModal.isOpen}
        onClose={() => setStatusModal({ isOpen: false, listing: null })}
        listing={statusModal.listing}
        onUpdateStatus={handleStatusUpdate}
        isLoading={updateListingStatus.isLoading}
      />

      <BulkActionsModal
        isOpen={bulkModal.isOpen}
        onClose={() => setBulkModal({ isOpen: false })}
        selectedListings={selectedListings}
        listings={listings}
        onBulkAction={handleBulkAction}
        isLoading={bulkUpdateListings.isLoading}
      />

      <ListingDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, listingId: null })}
        listingId={viewModal.listingId}
      />

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          isDangerous={confirmAction.isDangerous}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

export default AdminListingsManagement;
