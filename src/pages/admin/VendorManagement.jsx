import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  Filter,
  Grid3X3,
  List,
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
  Package,
  DollarSign,
} from 'lucide-react';
import {
  useGetAllVendorsQuery,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,
} from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
// Toast notifications temporarily replaced

const VendorManagement = () => {
  const navigate = useNavigate();
  
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('card');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // API queries and mutations
  const {
    data: vendorsData,
    isLoading,
    error,
    refetch,
  } = useGetAllVendorsQuery({
    search: searchTerm,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 50,
  });

  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [deleteVendor] = useDeleteVendorMutation();

  const vendors = vendorsData?.data || vendorsData?.vendors || [];
  const summary = vendorsData?.summary || {};

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status', count: summary.total || 0 },
    { value: 'active', label: 'Active', count: summary.active || 0 },
    { value: 'inactive', label: 'Inactive', count: summary.inactive || 0 },
    { value: 'suspended', label: 'Suspended', count: summary.suspended || 0 },
    { value: 'pending', label: 'Pending', count: summary.pending || 0 },
  ];

  // Handlers
  const handleStatusUpdate = async (vendorId, newStatus) => {
    try {
      await updateVendorStatus({ id: vendorId, status: newStatus }).unwrap();
      console.log(`Vendor status updated to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error(error.data?.message || 'Failed to update vendor status');
    }
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteVendor(vendorId).unwrap();
      console.log('Vendor deleted successfully');
      refetch();
    } catch (error) {
      console.error(error.data?.message || 'Failed to delete vendor');
    }
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
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
        title="Failed to load vendors"
        description="There was an error loading vendor data. Please try again."
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
            Vendor Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage all vendors on the platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/admin/approvals?type=vendor&status=pending')}
            variant="outline"
            className="text-earthy-brown border-earthy-brown hover:bg-earthy-brown hover:text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Review Applications
          </Button>
          <Button
            onClick={() => navigate('/admin/listings')}
            className="bg-gradient-secondary text-white"
          >
            <Package className="w-4 h-4 mr-2" />
            Manage Listings
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
              placeholder="Search vendors by business name, phone, or email..."
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

      {/* Vendor List */}
      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description={
            searchTerm || statusFilter !== 'all'
              ? 'No vendors match your current filters. Try adjusting your search criteria.'
              : 'No vendors have been registered yet.'
          }
          actionLabel={
            searchTerm || statusFilter !== 'all'
              ? 'Clear Filters'
              : 'Review Applications'
          }
          onAction={
            searchTerm || statusFilter !== 'all'
              ? () => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }
              : () => navigate('/admin/users/approvals?type=vendor&status=pending')
          }
        />
      ) : (
        <>
          {/* Card View */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => {
                const statusDisplay = getStatusDisplay(vendor.status);
                const StatusIcon = statusDisplay.icon;

                return (
                  <Card
                    key={vendor._id}
                    className="p-6 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Store className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-dark dark:text-white">
                              {vendor.businessName || vendor.name}
                            </h3>
                            <p className="text-sm text-text-muted">
                              {vendor.businessType || 'Vendor'}
                            </p>
                          </div>
                        </div>

                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color} flex items-center gap-1`}>
                          <StatusIcon className="w-3 h-3" />
                          {vendor.status}
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Phone className="w-4 h-4" />
                          <span>{vendor.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted">
                          <Mail className="w-4 h-4" />
                          <span>{vendor.email || 'No email provided'}</span>
                        </div>
                        {vendor.address && (
                          <div className="flex items-start gap-2 text-sm text-text-muted">
                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {typeof vendor.address === 'string' 
                                ? vendor.address 
                                : `${vendor.address.street || ''}, ${vendor.address.city || ''}`
                              }
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Business Stats */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-lg font-semibold text-text-dark dark:text-white">
                            {vendor.listingsCount || 0}
                          </p>
                          <p className="text-xs text-text-muted">Listings</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                          <p className="text-lg font-semibold text-text-dark dark:text-white">
                            {vendor.ordersCount || 0}
                          </p>
                          <p className="text-xs text-text-muted">Orders</p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-xs text-text-muted">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              Joined {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          {vendor.lastActive && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Last active {new Date(vendor.lastActive).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(vendor)}
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
                                onClick={() => handleStatusUpdate(vendor._id, vendor.status === 'active' ? 'inactive' : 'active')}
                                className="w-full text-left px-3 py-2 text-sm text-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {vendor.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(vendor._id, 'suspended')}
                                className="w-full text-left px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red/10 rounded-lg transition-colors"
                                disabled={vendor.status === 'suspended'}
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => navigate(`/admin/listings?vendor=${vendor._id}`)}
                                className="w-full text-left px-3 py-2 text-sm text-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                View Listings
                              </button>
                              <button
                                onClick={() => handleDeleteVendor(vendor._id)}
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
                        Vendor
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Contact
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Listings
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Orders
                      </th>
                      <th className="text-left py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Joined
                      </th>
                      <th className="text-right py-4 px-6 font-semibold text-text-dark dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, index) => {
                      const statusDisplay = getStatusDisplay(vendor.status);
                      const StatusIcon = statusDisplay.icon;

                      return (
                        <tr
                          key={vendor._id}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white">
                                <Store className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-text-dark dark:text-white">
                                  {vendor.businessName || vendor.name}
                                </p>
                                <p className="text-sm text-text-muted">
                                  {vendor.businessType || 'Vendor'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <p className="text-sm text-text-dark dark:text-white">
                                {vendor.phone || 'No phone'}
                              </p>
                              <p className="text-xs text-text-muted">
                                {vendor.email || 'No email'}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.bgColor} ${statusDisplay.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {vendor.status}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-sm text-text-dark dark:text-white">
                            {vendor.listingsCount || 0}
                          </td>
                          <td className="py-4 px-6 text-sm text-text-dark dark:text-white">
                            {vendor.ordersCount || 0}
                          </td>
                          <td className="py-4 px-6 text-sm text-text-dark dark:text-white">
                            {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'Recently'}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(vendor)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleStatusUpdate(vendor._id, vendor.status === 'active' ? 'inactive' : 'active')}
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

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Vendor Details"
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                  Business Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-text-muted">Business Name</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedVendor.businessName || selectedVendor.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Business Type</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedVendor.businessType || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Business License</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedVendor.businessLicense || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Status</label>
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusDisplay(selectedVendor.status).bgColor} ${getStatusDisplay(selectedVendor.status).color}`}>
                      <CheckCircle className="w-3 h-3" />
                      {selectedVendor.status}
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
                      {selectedVendor.phone || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Email</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedVendor.email || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-text-muted">Address</label>
                    <p className="font-medium text-text-dark dark:text-white">
                      {selectedVendor.address 
                        ? (typeof selectedVendor.address === 'string' 
                            ? selectedVendor.address 
                            : `${selectedVendor.address.street || ''}, ${selectedVendor.address.city || ''}, ${selectedVendor.address.state || ''} ${selectedVendor.address.zipCode || ''}`
                          )
                        : 'Not provided'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Business Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                Business Performance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">
                    {selectedVendor.listingsCount || 0}
                  </p>
                  <p className="text-sm text-text-muted">Active Listings</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">
                    {selectedVendor.ordersCount || 0}
                  </p>
                  <p className="text-sm text-text-muted">Total Orders</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">
                    ${selectedVendor.totalRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-sm text-text-muted">Total Revenue</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark dark:text-white">
                    {selectedVendor.rating?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-sm text-text-muted">Average Rating</p>
                </div>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={() => navigate(`/admin/listings?vendor=${selectedVendor._id}`)}
                className="flex-1"
              >
                View Listings
              </Button>
              <Button
                onClick={() => handleStatusUpdate(selectedVendor._id, selectedVendor.status === 'active' ? 'inactive' : 'active')}
                variant="outline"
                className="flex-1"
              >
                {selectedVendor.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate(selectedVendor._id, 'suspended')}
                className="flex-1 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                disabled={selectedVendor.status === 'suspended'}
              >
                Suspend
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleDeleteVendor(selectedVendor._id);
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

export default VendorManagement;