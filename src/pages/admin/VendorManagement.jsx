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
  RefreshCw,
  FileText,
  Shield,
  Building2,
  User,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import {
  useGetAdminVendorsUnifiedQuery,
  useGetVendorDetailsQuery,
  useUpdateVendorMutation,
  useDeactivateVendorMutation,
  useSafeDeleteVendorMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import VendorDetailsModal from '../../components/admin/VendorDetailsModal';

const VendorManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // State management
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal states
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // API queries and mutations
  const {
    data: vendorsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminVendorsUnifiedQuery(filters);

  // Process data from API
  const vendors = vendorsData?.data || [];
  const stats = vendorsData?.stats || {};

  // Handle search
  const handleSearch = (searchTerm) => {
    setFilters((prev) => ({
      ...prev,
      search: searchTerm,
      page: 1,
    }));
  };

  // Modal handlers
  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVendor(null);
  };

  const handleEditVendor = (vendor) => {
    // Navigate to edit page with vendor data
    navigate(`/admin/edit-vendor/${vendor.id || vendor._id}`, {
      state: { vendor },
    });
  };

  // Placeholder handlers for other actions
  const handleVerificationStatusChange = (vendorId, status) => {
    console.log('Verification status change:', vendorId, status);
    // TODO: Implement verification status change
  };

  const handleDeactivateVendor = (vendor) => {
    console.log('Deactivate vendor:', vendor);
    // TODO: Implement deactivation modal
  };

  const handleDeleteVendor = (vendor) => {
    console.log('Delete vendor:', vendor);
    // TODO: Implement deletion modal
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error loading vendors: {error.message}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">
            Vendor Management
          </h1>
          <p className="text-text-muted">
            Manage and oversee all vendor accounts and their business operations
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/admin/create-vendor')}
            className="bg-gradient-secondary hover:shadow-lg"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Vendor
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Vendors</p>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalVendors || 0}
              </p>
            </div>
            <Store className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-900">
                {stats.approvedVendors || 0}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">
                {stats.pendingVendors || 0}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold text-red-900">
                {stats.rejectedVendors || 0}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search vendors by name, email, or business..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                status: e.target.value,
                page: 1,
              }))
            }
            className="px-4 py-3 rounded-2xl border border-gray-200 focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 min-w-[150px]"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <Button onClick={() => refetch()} className="px-4 py-3">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Vendor List */}
      {vendors.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No vendors found"
          description={
            filters.search || filters.status
              ? 'No vendors match your current filters. Try adjusting your search criteria.'
              : 'No vendors have been registered yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vendors.map((vendor) => (
            <Card
              key={vendor.id || vendor._id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                      <Store className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-dark">
                        {vendor.businessName}
                      </h3>
                      <p className="text-sm text-text-muted">
                        Owner: {vendor.ownerName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                      vendor.verificationStatus === 'approved'
                        ? 'bg-green-100 text-green-600'
                        : vendor.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-yellow-100 text-yellow-600'
                    }`}
                  >
                    {vendor.verificationStatus === 'approved' && (
                      <CheckCircle className="w-3 h-3" />
                    )}
                    {vendor.verificationStatus === 'rejected' && (
                      <XCircle className="w-3 h-3" />
                    )}
                    {vendor.verificationStatus === 'pending' && (
                      <Clock className="w-3 h-3" />
                    )}
                    {vendor.verificationStatus === 'approved'
                      ? 'Verified'
                      : vendor.verificationStatus === 'rejected'
                        ? 'Rejected'
                        : 'Pending'}
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
                        {vendor.fullAddress ||
                          `${vendor.address.street || ''}, ${vendor.address.area || ''}, ${vendor.address.city || ''}`}
                      </span>
                    </div>
                  )}

                  {/* Specialties */}
                  {vendor.specialties && vendor.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {vendor.specialties
                        .slice(0, 2)
                        .map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-muted-olive/10 text-muted-olive text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      {vendor.specialties.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{vendor.specialties.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(vendor)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditVendor(vendor)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Details Modal */}
      {selectedVendor && (
        <VendorDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          vendorId={selectedVendor.id || selectedVendor._id}
          onEdit={handleEditVendor}
          onDeactivate={handleDeactivateVendor}
          onDelete={handleDeleteVendor}
          onVerificationStatusChange={handleVerificationStatusChange}
        />
      )}
    </div>
  );
};

export default VendorManagement;
