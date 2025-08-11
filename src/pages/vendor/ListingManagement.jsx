import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetVendorListingsQuery,
  useDeleteListingMutation,
  useUpdateListingStatusMutation,
  useBulkUpdateListingsMutation,
  useBulkDeleteListingsMutation
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Pagination from '../../components/ui/Pagination';
import ListingStatusToggle from '../../components/vendor/ListingStatusToggle';
import ListingBulkActions from '../../components/vendor/ListingBulkActions';
import {
  Package,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Star,
  MapPin,
  RefreshCw,
  Download,
  Upload,
  Settings
} from 'lucide-react';

const ListingManagement = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const itemsPerPage = 15;

  // Query for vendor listings with filters
  const {
    data: listingsData,
    isLoading,
    error,
    refetch
  } = useGetVendorListingsQuery({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy,
    sortOrder
  });

  // Mutations
  const [deleteListing] = useDeleteListingMutation();
  const [updateListingStatus] = useUpdateListingStatusMutation();
  const [bulkUpdateListings] = useBulkUpdateListingsMutation();
  const [bulkDeleteListings] = useBulkDeleteListingsMutation();

  const listings = listingsData?.data?.listings || [];
  const pagination = listingsData?.data?.pagination || {};
  const stats = listingsData?.data?.stats || {};

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'pending', label: 'Pending Review' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Created Date' },
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'name', label: 'Product Name' },
    { value: 'price', label: 'Price' },
    { value: 'availableQuantity', label: 'Stock Level' },
  ];

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map(listing => listing.id)));
    }
  };

  const handleSelectListing = (listingId) => {
    setSelectedListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  // Handle individual listing actions
  const handleToggleStatus = async (listing) => {
    const newStatus = listing.status === 'active' ? 'inactive' : 'active';
    try {
      await updateListingStatus({ id: listing.id, status: newStatus }).unwrap();
    } catch (error) {
      console.error('Failed to update listing status:', error);
    }
  };

  const handleDeleteListing = (listing) => {
    setConfirmDialog({
      title: 'Delete Listing',
      message: `Are you sure you want to permanently delete "${listing.product?.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await deleteListing(listing.id).unwrap();
          setSelectedListings(prev => {
            const newSet = new Set(prev);
            newSet.delete(listing.id);
            return newSet;
          });
          setConfirmDialog(null);
        } catch (error) {
          console.error('Failed to delete listing:', error);
        }
      }
    });
  };

  // Handle bulk actions
  const handleBulkStatusUpdate = (status) => {
    const listingIds = Array.from(selectedListings);
    const actionName = status === 'active' ? 'activate' : 'deactivate';
    
    setConfirmDialog({
      title: `Bulk ${actionName.charAt(0).toUpperCase() + actionName.slice(1)} Listings`,
      message: `Are you sure you want to ${actionName} ${listingIds.length} selected listings?`,
      confirmText: actionName.charAt(0).toUpperCase() + actionName.slice(1),
      onConfirm: async () => {
        try {
          await bulkUpdateListings({
            listingIds,
            updates: { status }
          }).unwrap();
          setSelectedListings(new Set());
          setConfirmDialog(null);
        } catch (error) {
          console.error('Failed to bulk update listings:', error);
        }
      }
    });
  };

  const handleBulkDelete = () => {
    const listingIds = Array.from(selectedListings);
    
    setConfirmDialog({
      title: 'Bulk Delete Listings',
      message: `Are you sure you want to permanently delete ${listingIds.length} selected listings? This action cannot be undone.`,
      confirmText: 'Delete All',
      isDangerous: true,
      onConfirm: async () => {
        try {
          await bulkDeleteListings(listingIds).unwrap();
          setSelectedListings(new Set());
          setConfirmDialog(null);
        } catch (error) {
          console.error('Failed to bulk delete listings:', error);
        }
      }
    });
  };

  // Clear selection function for bulk actions component
  const handleClearSelection = () => {
    setSelectedListings(new Set());
  };

  // Get status styling
  const getStatusColor = (status) => {
    const colors = {
      active: 'text-bottle-green bg-mint-fresh/20',
      inactive: 'text-gray-600 bg-gray-100',
      out_of_stock: 'text-tomato-red bg-tomato-red/20',
      pending: 'text-orange-600 bg-orange-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  // Filtered and sorted data for display
  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      const matchesSearch = !searchTerm || 
        listing.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [listings, searchTerm, statusFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading listings..." />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load listings"
        description="There was an error loading your listings. Please try again."
        action={{
          label: "Retry",
          onClick: refetch
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Listing Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage your product listings, inventory, and pricing
          </p>
          
          {/* Stats Summary */}
          {stats && (
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-bottle-green" />
                <span className="text-bottle-green font-medium">{stats.activeListings || 0} Active</span>
              </div>
              <div className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{stats.inactiveListings || 0} Inactive</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="w-4 h-4 text-tomato-red" />
                <span className="text-tomato-red">{stats.outOfStockListings || 0} Out of Stock</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={refetch}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button 
            onClick={() => navigate('/vendor/listings/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Listing
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search listings by product name, description..."
              className="w-full"
            />
          </div>

          {/* Filters Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
          </Button>

        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Sort Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* Select All */}
        {listings.length > 0 && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedListings.size === listings.length && listings.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
              />
              <span className="text-sm text-text-muted">
                Select all {listings.length} listings
              </span>
            </label>
          </div>
        )}
      </Card>

      {/* Bulk Actions */}
      <ListingBulkActions 
        selectedListings={Array.from(selectedListings)}
        onClearSelection={handleClearSelection}
        listings={listings}
      />

      {/* Listings Grid/List */}
      {listings.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No listings found"
          description={searchTerm ? "No listings match your search criteria." : "You haven't created any listings yet."}
          action={{
            label: "Create Your First Listing",
            onClick: () => navigate('/vendor/listings/create')
          }}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedListings.size === listings.length && listings.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">
                      Product
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-text-dark cursor-pointer hover:text-bottle-green"
                      onClick={() => handleSort('price')}
                    >
                      Price
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-text-dark cursor-pointer hover:text-bottle-green"
                      onClick={() => handleSort('availableQuantity')}
                    >
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-text-dark">
                      Status
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-sm font-semibold text-text-dark cursor-pointer hover:text-bottle-green"
                      onClick={() => handleSort('updatedAt')}
                    >
                      Last Updated
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-text-dark">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedListings.has(listing.id)}
                          onChange={() => handleSelectListing(listing.id)}
                          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                            {listing.images && listing.images.length > 0 ? (
                              <img 
                                src={listing.images[0].url} 
                                alt={listing.product?.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-dark dark:text-white line-clamp-1">
                              {listing.product?.name}
                            </p>
                            <p className="text-sm text-text-muted line-clamp-2">
                              {listing.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-text-dark dark:text-white">
                            ৳{listing.pricing?.[0]?.pricePerUnit}/
                            {listing.pricing?.[0]?.unit}
                          </p>
                          {listing.discount && (
                            <p className="text-xs text-green-600">
                              {listing.discount.value}% off
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-text-dark dark:text-white">
                            {listing.availability?.quantityAvailable || 0}
                          </p>
                          <p className="text-xs text-text-muted">
                            {listing.pricing?.[0]?.unit}s
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ListingStatusToggle 
                          listing={listing}
                          variant="badge"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-muted">
                          {new Date(listing.updatedAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/vendor/listings/${listing.id}`)}
                            className="p-2 text-text-muted hover:text-bottle-green rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/vendor/listings/${listing.id}/edit`)}
                            className="p-2 text-text-muted hover:text-blue-600 rounded-lg transition-colors"
                            title="Edit listing"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <ListingStatusToggle 
                            listing={listing}
                            variant="button"
                            size="sm"
                          />
                          <button
                            onClick={() => handleDeleteListing(listing)}
                            className="p-2 text-text-muted hover:text-tomato-red rounded-lg transition-colors"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="lg:hidden grid grid-cols-1 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className={`p-4 ${selectedListings.has(listing.id) ? 'ring-2 ring-bottle-green/30 bg-bottle-green/5' : ''}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedListings.has(listing.id)}
                    onChange={() => handleSelectListing(listing.id)}
                    className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green mt-1"
                  />
                  
                  <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img 
                        src={listing.images[0].url} 
                        alt={listing.product?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-text-dark dark:text-white line-clamp-1">
                        {listing.product?.name}
                      </h3>
                      <ListingStatusToggle 
                        listing={listing}
                        variant="badge"
                      />
                    </div>

                    <p className="text-sm text-text-muted line-clamp-2 mb-3">
                      {listing.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium text-text-dark dark:text-white">
                          ৳{listing.pricing?.[0]?.pricePerUnit}/{listing.pricing?.[0]?.unit}
                        </p>
                        <p className="text-text-muted">
                          Stock: {listing.availability?.quantityAvailable || 0}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/vendor/listings/${listing.id}`)}
                          className="p-2 text-text-muted hover:text-bottle-green rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/vendor/listings/${listing.id}/edit`)}
                          className="p-2 text-text-muted hover:text-blue-600 rounded-lg transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <ListingStatusToggle 
                          listing={listing}
                          variant="button"
                          size="sm"
                        />
                        <button
                          onClick={() => handleDeleteListing(listing)}
                          className="p-2 text-text-muted hover:text-tomato-red rounded-lg transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs text-text-muted">
                      <span>Updated {new Date(listing.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                totalItems={pagination.totalListings}
                itemsPerPage={itemsPerPage}
              />
            </Card>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setConfirmDialog(null)}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmText={confirmDialog.confirmText}
          isDangerous={confirmDialog.isDangerous}
          onConfirm={confirmDialog.onConfirm}
        />
      )}
    </div>
  );
};

export default ListingManagement;