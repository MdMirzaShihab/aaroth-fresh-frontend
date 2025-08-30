import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils,
  Search,
  Filter,
  Grid3X3,
  List,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Settings,
  Star,
  TrendingUp,
  RefreshCw,
  FileText,
  Shield,
  Building2,
  UserCheck,
  User,
} from 'lucide-react';
import {
  useGetAdminRestaurantsUnifiedQuery,
  useDeactivateRestaurantMutation,
  useSafeDeleteRestaurantMutation,
} from '../../store/slices/apiSlice';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/notificationSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';

const RestaurantManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: '', // pending, approved, rejected, or '' for all
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState('card');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [operationReason, setOperationReason] = useState('');

  // API queries and mutations
  const {
    data: restaurantsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminRestaurantsUnifiedQuery(filters);

  const [deactivateRestaurant, { isLoading: isDeactivating }] = useDeactivateRestaurantMutation();
  const [safeDeleteRestaurant, { isLoading: isDeleting }] = useSafeDeleteRestaurantMutation();

  // Process data from API
  const restaurants = restaurantsData?.data || [];
  const stats = restaurantsData?.stats || {};
  const pagination = restaurantsData || {};

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    refetch();
    dispatch(addNotification({
      type: 'info',
      message: 'Restaurant list refreshed',
    }));
  };

  // Restaurant operations
  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailsModalOpen(true);
  };

  const handleDeactivate = async () => {
    if (!selectedRestaurant || !operationReason.trim()) return;

    try {
      await deactivateRestaurant({
        id: selectedRestaurant.id || selectedRestaurant._id,
        reason: operationReason.trim(),
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: `Restaurant "${selectedRestaurant.name}" deactivated successfully`,
      }));

      setIsDeactivateModalOpen(false);
      setOperationReason('');
      setSelectedRestaurant(null);
      refetch();
    } catch (error) {
      // Handle dependency errors
      if (error?.data?.dependencies) {
        dispatch(addNotification({
          type: 'warning',
          message: error.data.error || 'Cannot deactivate restaurant with active dependencies',
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: error?.data?.message || 'Failed to deactivate restaurant',
        }));
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedRestaurant || !operationReason.trim()) return;

    try {
      await safeDeleteRestaurant({
        id: selectedRestaurant.id || selectedRestaurant._id,
        reason: operationReason.trim(),
      }).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: `Restaurant "${selectedRestaurant.name}" deleted successfully`,
      }));

      setIsDeleteModalOpen(false);
      setOperationReason('');
      setSelectedRestaurant(null);
      refetch();
    } catch (error) {
      // Handle dependency errors
      if (error?.data?.dependencies) {
        const deps = error.data.dependencies;
        const messages = error.data.suggestions || [];
        dispatch(addNotification({
          type: 'warning',
          message: `Cannot delete: ${deps.count} ${deps.type} found. ${messages[0] || ''}`,
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: error?.data?.message || 'Failed to delete restaurant',
        }));
      }
    }
  };

  // Get verification status display
  const getVerificationStatus = (status) => {
    const statusMap = {
      pending: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        icon: Clock,
        label: 'Pending Verification',
      },
      approved: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: 'Verified',
      },
      rejected: {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: XCircle,
        label: 'Rejected',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  // Filter options based on statistics
  const statusOptions = [
    { value: '', label: 'All Status', count: stats.totalRestaurants || 0 },
    { value: 'pending', label: 'Pending', count: stats.pendingRestaurants || 0 },
    { value: 'approved', label: 'Approved', count: stats.approvedRestaurants || 0 },
    { value: 'rejected', label: 'Rejected', count: stats.rejectedRestaurants || 0 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load restaurants"
        description="There was an error loading restaurant data. Please try again."
        action={{
          label: 'Retry',
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-text-dark">
              Restaurant Management
            </h1>
            <p className="text-text-muted mt-1">
              Manage restaurants, owners, and verification status
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown rounded-xl font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/admin/create-restaurant-owner')}
              className="bg-gradient-secondary text-white px-6 py-2 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Owner
            </Button>
            <Button
              onClick={() => navigate('/admin/create-restaurant-manager')}
              className="bg-muted-olive text-white px-6 py-2 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
            >
              <Users className="w-4 h-4 mr-2" />
              Create Manager
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusOptions.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">{stat.label}</p>
                  <p className="text-2xl font-semibold text-text-dark">{stat.count}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filters and Controls */}
        <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-text-muted" />
            <h3 className="font-medium text-text-dark">Filters & Search</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-text-dark/80 mb-2">
                Search Restaurants
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name, email, phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-text-dark/80 mb-2">
                Verification Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-text-dark/80 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
              >
                <option value="createdAt">Creation Date</option>
                <option value="name">Restaurant Name</option>
                <option value="verificationStatus">Verification Status</option>
                <option value="updatedAt">Last Updated</option>
              </select>
            </div>

            {/* Items per page */}
            <div>
              <label className="block text-sm font-medium text-text-dark/80 mb-2">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing {restaurants.length} of {pagination.total || 0} restaurants
            </p>
            <div className="flex bg-gray-100 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'card'
                    ? 'bg-white shadow-sm text-muted-olive'
                    : 'text-gray-600 hover:text-muted-olive'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-muted-olive'
                    : 'text-gray-600 hover:text-muted-olive'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Restaurant List */}
        {restaurants.length === 0 ? (
          <EmptyState
            icon={Utensils}
            title="No restaurants found"
            description={
              filters.search || filters.status
                ? 'No restaurants match your current filters. Try adjusting your search criteria.'
                : 'No restaurants have been registered yet.'
            }
            action={{
              label: filters.search || filters.status ? 'Clear Filters' : 'Create Restaurant Owner',
              onClick: filters.search || filters.status
                ? () => setFilters({ ...filters, search: '', status: '', page: 1 })
                : () => navigate('/admin/create-restaurant-owner'),
            }}
          />
        ) : (
          <>
            {/* Card View */}
            {viewMode === 'card' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {restaurants.map((restaurant) => {
                  const verificationStatus = getVerificationStatus(restaurant.verificationStatus);
                  const StatusIcon = verificationStatus.icon;

                  return (
                    <Card
                      key={restaurant.id || restaurant._id}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                              <Utensils className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-text-dark">
                                {restaurant.name}
                              </h3>
                              <p className="text-sm text-text-muted">
                                Owner: {restaurant.ownerName || restaurant.createdBy?.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.bgColor} ${verificationStatus.color} flex items-center gap-1`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {verificationStatus.label}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Phone className="w-4 h-4" />
                            <span>{restaurant.phone || 'No phone provided'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <Mail className="w-4 h-4" />
                            <span>{restaurant.email || 'No email provided'}</span>
                          </div>
                          {restaurant.address && (
                            <div className="flex items-start gap-2 text-sm text-text-muted">
                              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-2">
                                {typeof restaurant.address === 'string'
                                  ? restaurant.address
                                  : restaurant.fullAddress || `${restaurant.address.street || ''}, ${restaurant.address.city || ''}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Trade License */}
                        {restaurant.tradeLicenseNo && (
                          <div className="flex items-center gap-2 text-sm text-text-muted">
                            <FileText className="w-4 h-4" />
                            <span>License: {restaurant.tradeLicenseNo}</span>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs text-text-muted">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                Created {restaurant.createdAt
                                  ? new Date(restaurant.createdAt).toLocaleDateString()
                                  : 'Recently'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{restaurant.managers?.length || 0} managers</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewDetails(restaurant)}
                            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 border-0"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Details
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setIsDeactivateModalOpen(true);
                            }}
                            className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-0"
                            disabled={!restaurant.isActive}
                          >
                            <Settings className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRestaurant(restaurant);
                              setIsDeleteModalOpen(true);
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 border-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-text-dark">Restaurant</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-dark">Contact</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-dark">Status</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-dark">License</th>
                        <th className="text-left py-4 px-6 font-semibold text-text-dark">Created</th>
                        <th className="text-right py-4 px-6 font-semibold text-text-dark">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restaurants.map((restaurant, index) => {
                        const verificationStatus = getVerificationStatus(restaurant.verificationStatus);
                        const StatusIcon = verificationStatus.icon;

                        return (
                          <tr
                            key={restaurant.id || restaurant._id}
                            className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                  <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-medium text-text-dark">{restaurant.name}</p>
                                  <p className="text-sm text-text-muted">
                                    Owner: {restaurant.ownerName || 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="space-y-1">
                                <p className="text-sm text-text-dark">{restaurant.phone || 'No phone'}</p>
                                <p className="text-xs text-text-muted">{restaurant.email || 'No email'}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${verificationStatus.bgColor} ${verificationStatus.color}`}
                              >
                                <StatusIcon className="w-3 h-3" />
                                {verificationStatus.label}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-text-dark">
                              {restaurant.tradeLicenseNo || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-sm text-text-dark">
                              {restaurant.createdAt
                                ? new Date(restaurant.createdAt).toLocaleDateString()
                                : 'Recently'}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleViewDetails(restaurant)}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-0"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRestaurant(restaurant);
                                    setIsDeactivateModalOpen(true);
                                  }}
                                  className="bg-amber-50 text-amber-600 hover:bg-amber-100 border-0"
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedRestaurant(restaurant);
                                    setIsDeleteModalOpen(true);
                                  }}
                                  className="bg-red-50 text-red-600 hover:bg-red-100 border-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-muted">
                    Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                    {Math.min(filters.page * filters.limit, pagination.total)} of{' '}
                    {pagination.total} restaurants
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="px-4 py-2 rounded-xl bg-earthy-beige/30 hover:bg-earthy-beige/50 text-text-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </Button>
                    
                    <span className="px-4 py-2 bg-gradient-secondary text-white rounded-xl font-medium">
                      {filters.page} of {pagination.pages}
                    </span>
                    
                    <Button
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page >= pagination.pages}
                      className="px-4 py-2 rounded-xl bg-earthy-beige/30 hover:bg-earthy-beige/50 text-text-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {/* Deactivate Modal */}
        {isDeactivateModalOpen && selectedRestaurant && (
          <Modal
            isOpen={isDeactivateModalOpen}
            onClose={() => setIsDeactivateModalOpen(false)}
            title="Deactivate Restaurant"
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">
                      Deactivate "{selectedRestaurant.name}"
                    </h4>
                    <p className="text-sm text-amber-700 mt-1">
                      This will deactivate the restaurant and all associated user accounts. 
                      Active orders will prevent deactivation.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Reason for deactivation *
                </label>
                <textarea
                  value={operationReason}
                  onChange={(e) => setOperationReason(e.target.value)}
                  placeholder="Please provide a reason for deactivation..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsDeactivateModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                  disabled={isDeactivating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeactivate}
                  className="flex-1 bg-amber-600 text-white hover:bg-amber-700 border-0"
                  disabled={isDeactivating || !operationReason.trim()}
                >
                  {isDeactivating ? <LoadingSpinner size="sm" /> : 'Deactivate'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {isDeleteModalOpen && selectedRestaurant && (
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Restaurant"
            maxWidth="md"
          >
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">
                      Delete "{selectedRestaurant.name}"
                    </h4>
                    <p className="text-sm text-red-700 mt-1">
                      This action will soft delete the restaurant and associated accounts. 
                      This action cannot be undone. Orders and dependencies will prevent deletion.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Reason for deletion *
                </label>
                <textarea
                  value={operationReason}
                  onChange={(e) => setOperationReason(e.target.value)}
                  placeholder="Please provide a reason for deletion..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg transition-all duration-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700 border-0"
                  disabled={isDeleting || !operationReason.trim()}
                >
                  {isDeleting ? <LoadingSpinner size="sm" /> : 'Delete'}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Restaurant Details Modal */}
        {selectedRestaurant && isDetailsModalOpen && (
          <Modal
            isOpen={isDetailsModalOpen}
            onClose={() => setIsDetailsModalOpen(false)}
            title={`${selectedRestaurant.name} - Details`}
            maxWidth="6xl"
          >
            <div className="space-y-6">
              {/* Restaurant Header */}
              <div className="flex items-start gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Utensils className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-text-dark mb-2">
                        {selectedRestaurant.name}
                      </h2>
                      <p className="text-text-muted mb-2">
                        Owner: {selectedRestaurant.ownerName || selectedRestaurant.createdBy?.name || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(() => {
                        const status = getVerificationStatus(selectedRestaurant.verificationStatus);
                        const StatusIcon = status.icon;
                        return (
                          <div className={`px-4 py-2 rounded-full text-sm font-medium ${status.bgColor} ${status.color} flex items-center gap-2`}>
                            <StatusIcon className="w-4 h-4" />
                            {status.label}
                          </div>
                        );
                      })()}
                      {selectedRestaurant.isActive ? (
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          Active
                        </div>
                      ) : (
                        <div className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          Inactive
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Key metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-muted-olive">
                        {selectedRestaurant.managers?.length || 0}
                      </p>
                      <p className="text-xs text-text-muted">Managers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-blue-600">
                        {selectedRestaurant.totalOrders || 0}
                      </p>
                      <p className="text-xs text-text-muted">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-purple-600">
                        ${selectedRestaurant.totalRevenue?.toLocaleString() || 0}
                      </p>
                      <p className="text-xs text-text-muted">Revenue</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contact Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-muted">Email</p>
                        <p className="text-text-dark">{selectedRestaurant.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-muted">Phone</p>
                        <p className="text-text-dark">{selectedRestaurant.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-text-muted mt-1" />
                      <div>
                        <p className="text-sm text-text-muted">Address</p>
                        <p className="text-text-dark">
                          {typeof selectedRestaurant.address === 'string'
                            ? selectedRestaurant.address
                            : selectedRestaurant.fullAddress || 
                              `${selectedRestaurant.address?.street || ''}, ${selectedRestaurant.address?.city || ''}` ||
                              'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Business Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Business Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-muted">Restaurant Name</p>
                        <p className="text-text-dark">{selectedRestaurant.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-muted">Trade License</p>
                        <p className="text-text-dark">{selectedRestaurant.tradeLicenseNo || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      <div>
                        <p className="text-sm text-text-muted">Registration Date</p>
                        <p className="text-text-dark">
                          {selectedRestaurant.createdAt
                            ? new Date(selectedRestaurant.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Restaurant Managers */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    Restaurant Managers
                  </h3>
                  {selectedRestaurant.managers && selectedRestaurant.managers.length > 0 ? (
                    <div className="space-y-3">
                      {selectedRestaurant.managers.map((manager, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-text-dark">{manager.name || 'Manager'}</p>
                            <p className="text-sm text-text-muted">{manager.email || 'No email'}</p>
                            {manager.phone && (
                              <p className="text-sm text-text-muted">{manager.phone}</p>
                            )}
                          </div>
                          <div className="text-xs text-text-muted">
                            {manager.isActive ? (
                              <span className="text-green-600">Active</span>
                            ) : (
                              <span className="text-red-600">Inactive</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-text-muted">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No managers assigned</p>
                    </div>
                  )}
                </Card>

                {/* Recent Activity & Stats */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Activity Overview
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">Total Orders</p>
                          <p className="font-semibold text-blue-600">
                            {selectedRestaurant.totalOrders || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">Average Rating</p>
                          <p className="font-semibold text-green-600">
                            {selectedRestaurant.averageRating || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">Last Updated</p>
                          <p className="font-semibold text-purple-600">
                            {selectedRestaurant.updatedAt
                              ? new Date(selectedRestaurant.updatedAt).toLocaleDateString()
                              : 'Recently'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => navigate(`/admin/restaurant-management/${selectedRestaurant.id || selectedRestaurant._id}/edit`)}
                  className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-0 px-4 py-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </Button>
                
                <Button
                  onClick={() => navigate('/admin/create-restaurant-manager', { 
                    state: { restaurantId: selectedRestaurant.id || selectedRestaurant._id, restaurantName: selectedRestaurant.name } 
                  })}
                  className="flex items-center gap-2 bg-green-50 text-green-600 hover:bg-green-100 border-0 px-4 py-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Manager
                </Button>

                <Button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedRestaurant(selectedRestaurant);
                    setIsDeactivateModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-amber-50 text-amber-600 hover:bg-amber-100 border-0 px-4 py-2"
                  disabled={!selectedRestaurant.isActive}
                >
                  <Settings className="w-4 h-4" />
                  {selectedRestaurant.isActive ? 'Deactivate' : 'Reactivate'}
                </Button>

                <Button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedRestaurant(selectedRestaurant);
                    setIsDeleteModalOpen(true);
                  }}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-0 px-4 py-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default RestaurantManagement;