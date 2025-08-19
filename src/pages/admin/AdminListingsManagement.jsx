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
} from 'lucide-react';
import {
  useGetAdminListingsQuery,
  useGetAdminCategoriesQuery,
  useToggleFeaturedListingMutation,
  useUpdateAdminListingMutation,
  useDeleteAdminListingMutation,
  useApproveAdminListingMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';

const AdminListingsManagement = () => {
  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedVendor] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);

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
    }),
    [currentPage, searchTerm, selectedCategory, selectedStatus, selectedVendor]
  );

  // RTK Query hooks
  const {
    data: listingsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminListingsQuery(queryParams);

  const { data: categoriesData } = useGetAdminCategoriesQuery();

  const [toggleFeatured] = useToggleFeaturedListingMutation();
  const [updateListing] = useUpdateAdminListingMutation();
  const [deleteListing] = useDeleteAdminListingMutation();
  const [approveListing] = useApproveAdminListingMutation();

  const listings = listingsData?.data?.listings || listingsData?.data || [];
  const totalListings =
    listingsData?.total || listingsData?.data?.totalListings || 0;
  const totalPages = listingsData?.pages || listingsData?.data?.totalPages || 1;
  const categories =
    categoriesData?.data?.categories || categoriesData?.data || [];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'rejected', label: 'Rejected' },
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

  // Handle listing approval
  const handleApproval = async (listingId, isApproved) => {
    try {
      await approveListing({
        id: listingId,
        isApproved,
      }).unwrap();
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update listing approval:', error);
    }
  };

  // Handle listing deletion
  const handleDelete = async (listingId) => {
    try {
      await deleteListing(listingId).unwrap();
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

  // Get status badge styling
  const getStatusBadge = (status, isFeatured) => {
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
      case 'pending':
        return {
          className: 'bg-earthy-yellow/20 text-earthy-brown',
          icon: Clock,
          text: 'Pending',
        };
      case 'rejected':
        return {
          className: 'bg-tomato-red/20 text-tomato-red',
          icon: XCircle,
          text: 'Rejected',
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
            {listing.images?.[0]?.url || listing.product?.images?.[0]?.url ? (
              <img
                src={
                  listing.images?.[0]?.url || listing.product?.images?.[0]?.url
                }
                alt={listing.product?.name || listing.name}
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
              {listing.product?.name || listing.name || 'Unknown Product'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {listing.product?.category?.name || 'No Category'}
            </p>
            <p className="text-xs text-bottle-green truncate">
              {listing.product?.variety || ''}
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
              {listing.vendor?.businessName ||
                listing.vendor?.name ||
                'Unknown Vendor'}
            </p>
            <p className="text-xs text-text-muted">
              {listing.vendor?.phone || 'No contact'}
            </p>
            <p className="text-xs text-text-muted">
              {listing.vendor?.address?.city || ''}
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
          listing.featured || listing.isFeatured
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

          {listing.status === 'pending' && (
            <>
              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'approve',
                    listing,
                    title: 'Approve Listing',
                    message: `Are you sure you want to approve "${listing.product?.name || listing.name}"?`,
                    confirmText: 'Approve',
                    onConfirm: () => handleApproval(listing._id, true),
                  })
                }
                className="p-2 text-bottle-green hover:bg-mint-fresh/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Approve listing"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'reject',
                    listing,
                    title: 'Reject Listing',
                    message: `Are you sure you want to reject "${listing.product?.name || listing.name}"?`,
                    confirmText: 'Reject',
                    onConfirm: () => handleApproval(listing._id, false),
                  })
                }
                className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Reject listing"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => {
              /* Handle view/edit */
            }}
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
                message: `Are you sure you want to permanently delete "${listing.product?.name || listing.name}"? This action cannot be undone.`,
                confirmText: 'Delete',
                isDangerous: true,
                onConfirm: () => handleDelete(listing._id),
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

        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-mint-fresh/10 rounded-xl px-4 py-2">
            <p className="text-sm text-bottle-green font-medium">
              {totalListings} Total Listings
            </p>
          </div>
          {selectedListings.size > 0 && (
            <div className="bg-bottle-green/10 rounded-xl px-4 py-2">
              <p className="text-sm text-bottle-green font-medium">
                {selectedListings.size} Selected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search listings by name, vendor..."
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
          </div>
        </div>
      </Card>

      {/* Listings Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            data={listings}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Package}
                title="No listings found"
                description="No listings match your current filters."
              />
            }
          />
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
