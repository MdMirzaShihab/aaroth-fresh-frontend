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
} from 'lucide-react';
import {
  useGetAllRestaurantsQuery,
  useUpdateRestaurantStatusMutation,
  useDeleteRestaurantMutation,
} from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
// Toast notifications temporarily replaced

const RestaurantManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // API queries and mutations
  const {
    data: restaurantsData,
    isLoading,
    error,
    refetch,
  } = useGetAllRestaurantsQuery({
    search: searchTerm,
    status: statusFilter,
    limit: 50,
  });

  const [updateRestaurantStatus] = useUpdateRestaurantStatusMutation();
  const [deleteRestaurant] = useDeleteRestaurantMutation();

  const restaurants = restaurantsData?.data || restaurantsData?.restaurants || [];
  const summary = restaurantsData?.summary || {};

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status', count: summary.total || 0 },
    { value: 'active', label: 'Active', count: summary.active || 0 },
    { value: 'inactive', label: 'Inactive', count: summary.inactive || 0 },
    { value: 'suspended', label: 'Suspended', count: summary.suspended || 0 },
    { value: 'pending', label: 'Pending', count: summary.pending || 0 },
  ];

  // Handlers
  const handleStatusUpdate = async (restaurantId, newStatus) => {
    try {
      await updateRestaurantStatus({ id: restaurantId, status: newStatus }).unwrap();
      console.log(`Restaurant status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error(error.data?.message || 'Failed to update restaurant status');
    }
  };

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteRestaurant(restaurantId).unwrap();
      console.log('Restaurant deleted successfully');
      refetch();
    } catch (error) {
      console.error(error.data?.message || 'Failed to delete restaurant');
    }
  };

  const handleViewDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailsModalOpen(true);
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      active: { color: 'text-bottle-green', bgColor: 'bg-mint-fresh/20', icon: CheckCircle },
      inactive: { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock },
      suspended: { color: 'text-tomato-red', bgColor: 'bg-tomato-red/20', icon: XCircle },
      pending: { color: 'text-earthy-brown', bgColor: 'bg-earthy-yellow/20', icon: Clock },
    };
    return statusMap[status] || statusMap.inactive;
  };

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
        title="Failed to load restaurants"
        description="There was an error loading restaurant data. Please try again."
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Restaurant Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage all restaurants on the platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/admin/create-restaurant-owner')}
            className="bg-gradient-secondary text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Restaurant Owner
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/create-restaurant-manager')}
          >
            <Users className="w-4 h-4 mr-2" />
            Create Manager
          </Button>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search restaurants by name, phone, or email..."
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 min-w-[140px] min-h-[44px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'card'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-bottle-green'
                  : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
              }`}
              title="Card view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all duration-200 min-h-[36px] min-w-[36px] flex items-center justify-center ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 shadow-sm text-bottle-green'
                  : 'text-gray-600 hover:text-bottle-green dark:text-gray-300 dark:hover:text-green-400'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          {statusOptions.slice(1).map((status) => (
            <div key={status.value} className="text-center">
              <p className="text-2xl font-bold text-text-dark dark:text-white">
                {status.count}
              </p>
              <p className="text-sm text-text-muted capitalize">
                {status.label}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Restaurant List */}
      {restaurants.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No restaurants found"
          description={
            searchTerm || statusFilter !== 'all'
              ? 'No restaurants match your current filters. Try adjusting your search criteria.'
              : 'No restaurants have been registered yet.'
          }
          actionLabel={
            searchTerm || statusFilter !== 'all'
              ? 'Clear Filters'
              : 'Create Restaurant Owner'
          }
          onAction={
            searchTerm || statusFilter !== 'all'
              ? () => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }
              : () => navigate('/admin/create-restaurant-owner')
          }
        />
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => {
                const statusDisplay = getStatusDisplay(restaurant.status);
                const StatusIcon = statusDisplay.icon;

                return (
                  <Card
                    key={restaurant._id}
                    className="p-6 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Utensils className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-dark dark:text-white">
                              {restaurant.name}
                            </h3>
                            <p className="text-sm text-text-muted">
                              {restaurant.cuisineType || 'Various cuisines'}
                            </p>
                          </div>
                        </div>

                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {restaurant.status}
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
                                : `${restaurant.address.street || ''}, ${restaurant.address.city || ''}`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Joined {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{restaurant.managersCount || 0} managers</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(restaurant)}
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        
                        <div className="relative group">
                          <Button size="sm" variant="outline">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                            <div className="p-2">
                              <button
                                onClick={() => handleStatusUpdate(restaurant._id, restaurant.status === 'active' ? 'inactive' : 'active')}
                                className="w-full text-left px-3 py-2 text-sm text-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {restaurant.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(restaurant._id, 'suspended')}
                                className="w-full text-left px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red/10 rounded-lg transition-colors"
                                disabled={restaurant.status === 'suspended'}
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => handleDeleteRestaurant(restaurant._id)}
                                className="w-full text-left px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red/10 rounded-lg transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <Card className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Restaurant
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Joined
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Managers
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant, index) => {
                      const statusDisplay = getStatusDisplay(restaurant.status);
                      const StatusIcon = statusDisplay.icon;

                      return (
                        <tr
                          key={restaurant._id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                <Utensils className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-text-dark dark:text-white">
                                  {restaurant.name}
                                </p>
                                <p className="text-sm text-text-muted">
                                  {restaurant.cuisineType || 'Various cuisines'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <p className="text-sm text-text-dark dark:text-white">
                                {restaurant.phone || 'No phone'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {restaurant.email || 'No email'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {restaurant.status}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-text-dark dark:text-white">
                            {restaurant.createdAt ? new Date(restaurant.createdAt).toLocaleDateString() : 'Recently'}
                          </td>
                          <td className="py-4 px-6 text-sm text-text-dark dark:text-white">
                            {restaurant.managersCount || 0}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(restaurant)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(restaurant._id, restaurant.status === 'active' ? 'inactive' : 'active')}
                              >
                                <Settings className="w-4 h-4" />
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
        </>
      )}

      {/* Restaurant Details Modal */}
      {selectedRestaurant && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Restaurant Details"
          maxWidth="3xl"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                  Basic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-muted">Restaurant Name</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedRestaurant.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Cuisine Type</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedRestaurant.cuisineType || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Status</label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(selectedRestaurant.status).bgColor} ${getStatusDisplay(selectedRestaurant.status).color}`}>
                      <CheckCircle className="w-3 h-3" />
                      {selectedRestaurant.status}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-muted">Phone</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedRestaurant.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Email</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedRestaurant.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Address</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedRestaurant.address 
                        ? (typeof selectedRestaurant.address === 'string' 
                            ? selectedRestaurant.address 
                            : `${selectedRestaurant.address.street || ''}, ${selectedRestaurant.address.city || ''}, ${selectedRestaurant.address.state || ''} ${selectedRestaurant.address.zipCode || ''}`
                          )
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => handleStatusUpdate(selectedRestaurant._id, selectedRestaurant.status === 'active' ? 'inactive' : 'active')}
                className="flex-1"
              >
                {selectedRestaurant.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(selectedRestaurant._id, 'suspended')}
                className="flex-1 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                disabled={selectedRestaurant.status === 'suspended'}
              >
                Suspend
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleDeleteRestaurant(selectedRestaurant._id);
                }}
                className="flex-1 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RestaurantManagement;