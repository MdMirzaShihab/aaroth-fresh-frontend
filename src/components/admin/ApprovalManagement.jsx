import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import {
  useGetAdminVendorsUnifiedQuery,
  useGetAdminRestaurantsUnifiedQuery,
  useUpdateVendorVerificationStatusMutation,
  useUpdateRestaurantVerificationStatusMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { getErrorMessage, handleApiError } from '../../utils/errorHandler';
import LoadingSpinner from '../ui/LoadingSpinner';
import ApprovalCard from './ApprovalCard';

const ApprovalManagement = () => {
  const dispatch = useDispatch();
  const [filters, setFilters] = useState({
    type: '', // 'vendor', 'restaurant', or '' for all
    status: 'pending', // pending, approved, rejected
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch data using new unified endpoints
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useGetAdminVendorsUnifiedQuery(
    filters.type === '' || filters.type === 'vendor'
      ? {
          status: filters.status,
          search: filters.search,
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }
      : undefined,
    { skip: filters.type === 'restaurant' }
  );

  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useGetAdminRestaurantsUnifiedQuery(
    filters.type === '' || filters.type === 'restaurant'
      ? {
          status: filters.status,
          search: filters.search,
          page: filters.page,
          limit: filters.limit,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        }
      : undefined,
    { skip: filters.type === 'vendor' }
  );

  const [updateVendorVerification] =
    useUpdateVendorVerificationStatusMutation();
  const [updateRestaurantVerification] =
    useUpdateRestaurantVerificationStatusMutation();

  const handleApproval = async (type, id, action, data) => {
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const reason = action === 'approve' ? data.notes : data.reason;

      if (type === 'vendor') {
        await updateVendorVerification({ id, status, reason }).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: `Vendor ${action}d successfully`,
          })
        );
      } else if (type === 'restaurant') {
        await updateRestaurantVerification({ id, status, reason }).unwrap();
        dispatch(
          addNotification({
            type: 'success',
            message: `Restaurant ${action}d successfully`,
          })
        );
      }
    } catch (error) {
      handleApiError(error, dispatch, {
        showNotification: true,
        logError: true,
      });
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    refetchVendors();
    refetchRestaurants();
    dispatch(
      addNotification({
        type: 'info',
        message: 'Approvals list refreshed',
      })
    );
  };

  // Process data and combine results
  const isLoading = vendorsLoading || restaurantsLoading;
  const error = vendorsError || restaurantsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-tomato-red/10 border border-tomato-red/20 text-tomato-red p-4 rounded-2xl">
        <p className="font-medium">Error loading approvals</p>
        <p className="text-sm mt-1">{getErrorMessage(error)}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Combine data from both endpoints based on filter type
  let allData = [];
  let stats = {};
  let pagination = {};

  if (filters.type === 'vendor' || filters.type === '') {
    const vendors = vendorsData?.data || [];
    const vendorApprovals = vendors.map((vendor) => ({
      ...vendor,
      type: 'vendor',
    }));
    allData = [...allData, ...vendorApprovals];

    if (vendorsData?.stats) {
      stats.vendors = vendorsData.stats;
    }
    if (filters.type === 'vendor') {
      pagination = vendorsData || {};
    }
  }

  if (filters.type === 'restaurant' || filters.type === '') {
    const restaurants = restaurantsData?.data || [];
    const restaurantApprovals = restaurants.map((restaurant) => ({
      ...restaurant,
      type: 'restaurant',
    }));
    allData = [...allData, ...restaurantApprovals];

    if (restaurantsData?.stats) {
      stats.restaurants = restaurantsData.stats;
    }
    if (filters.type === 'restaurant') {
      pagination = restaurantsData || {};
    }
  }

  // Sort combined data when showing all types
  if (filters.type === '') {
    allData.sort((a, b) => {
      if (filters.sortOrder === 'desc') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }

  const totalCount = pagination.total || allData.length;
  const totalPages = pagination.pages || Math.ceil(totalCount / filters.limit);

  // Calculate combined statistics for display
  const combinedStats = {
    totalVendors: stats.vendors?.totalVendors || 0,
    pendingVendors: stats.vendors?.pendingVendors || 0,
    approvedVendors: stats.vendors?.approvedVendors || 0,
    rejectedVendors: stats.vendors?.rejectedVendors || 0,
    totalRestaurants: stats.restaurants?.totalRestaurants || 0,
    pendingRestaurants: stats.restaurants?.pendingRestaurants || 0,
    approvedRestaurants: stats.restaurants?.approvedRestaurants || 0,
    rejectedRestaurants: stats.restaurants?.rejectedRestaurants || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header with statistics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-medium text-text-dark">
            Business Approvals
          </h1>
          <p className="text-text-muted mt-1">
            Review and approve vendor and restaurant applications
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown rounded-xl font-medium transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics Cards */}
      {Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Businesses</p>
                <p className="text-xl font-semibold text-text-dark">
                  {combinedStats.totalVendors + combinedStats.totalRestaurants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Pending Approval</p>
                <p className="text-xl font-semibold text-text-dark">
                  {combinedStats.pendingVendors +
                    combinedStats.pendingRestaurants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Approved</p>
                <p className="text-xl font-semibold text-text-dark">
                  {combinedStats.approvedVendors +
                    combinedStats.approvedRestaurants}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Rejected</p>
                <p className="text-xl font-semibold text-text-dark">
                  {combinedStats.rejectedVendors +
                    combinedStats.rejectedRestaurants}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-text-muted" />
          <h3 className="font-medium text-text-dark">Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-text-dark/80 mb-2">
              Search Businesses
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
              />
            </div>
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-text-dark/80 mb-2">
              Business Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
            >
              <option value="">All Types</option>
              <option value="vendor">Vendors</option>
              <option value="restaurant">Restaurants</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-text-dark/80 mb-2">
              Approval Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-text-dark/80 mb-2">
              Items per page
            </label>
            <select
              value={filters.limit}
              onChange={(e) =>
                handleFilterChange('limit', parseInt(e.target.value))
              }
              className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approvals list */}
      <div className="space-y-4">
        {allData.length > 0 ? (
          allData.map((approval) => (
            <ApprovalCard
              key={`${approval.type}-${approval.id || approval._id}`}
              approval={approval}
              onApprove={(data) =>
                handleApproval(
                  approval.type,
                  approval.id || approval._id,
                  'approve',
                  data
                )
              }
              onReject={(data) =>
                handleApproval(
                  approval.type,
                  approval.id || approval._id,
                  'reject',
                  data
                )
              }
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50">
            <div className="w-16 h-16 bg-earthy-beige/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-text-muted/60" />
            </div>
            <h3 className="text-lg font-medium text-text-dark/80 mb-2">
              No {filters.status} approvals found
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
              {filters.type
                ? `No ${filters.status} ${filters.type}s found. Try adjusting your filters or check back later.`
                : `No ${filters.status} businesses found. Try adjusting your filters or check back later.`}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
          <p className="text-sm text-text-muted">
            Showing {(filters.page - 1) * filters.limit + 1} to{' '}
            {Math.min(filters.page * filters.limit, totalCount)} of {totalCount}{' '}
            results
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page <= 1}
              className="px-4 py-2 rounded-xl bg-earthy-beige/30 hover:bg-earthy-beige/50 text-text-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>

            <span className="px-4 py-2 bg-gradient-secondary text-white rounded-xl font-medium">
              {filters.page} of {totalPages}
            </span>

            <button
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="px-4 py-2 rounded-xl bg-earthy-beige/30 hover:bg-earthy-beige/50 text-text-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalManagement;
