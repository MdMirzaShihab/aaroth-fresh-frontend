import React, { useState } from 'react';
import {
  UserCheck,
  UserX,
  Clock,
  Phone,
  Calendar,
  MapPin,
  Store,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import {
  useGetPendingVendorsQuery,
  useVerifyVendorMutation,
  useGetAdminVendorsQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';

const VendorApproval = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendors, setSelectedVendors] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [viewingVendor, setViewingVendor] = useState(null);

  const itemsPerPage = 12;

  // Query for pending vendor approvals
  const {
    data: vendorsData,
    isLoading,
    error,
    refetch,
  } = useGetPendingVendorsQuery();

  const [verifyVendor, { isLoading: isVerifying }] = useVerifyVendorMutation();

  const pendingVendors = vendorsData?.data || [];
  const totalVendors = vendorsData?.count || 0;

  // Handle vendor approval
  const handleApproval = async (vendorId) => {
    try {
      await verifyVendor(vendorId).unwrap();
      setConfirmAction(null);
      setSelectedVendors((prev) => {
        const newSet = new Set(prev);
        newSet.delete(vendorId);
        return newSet;
      });
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to verify vendor:', error);
    }
  };

  // Handle bulk approvals
  const handleBulkApproval = async () => {
    try {
      const promises = Array.from(selectedVendors).map((vendorId) =>
        verifyVendor(vendorId).unwrap()
      );
      await Promise.all(promises);
      setSelectedVendors(new Set());
      setConfirmAction(null);
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to bulk verify vendors:', error);
    }
  };

  // Handle selection
  const handleSelectAll = () => {
    if (selectedVendors.size === pendingVendors.length) {
      setSelectedVendors(new Set());
    } else {
      setSelectedVendors(new Set(pendingVendors.map((vendor) => vendor._id)));
    }
  };

  const handleSelectVendor = (vendorId) => {
    setSelectedVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  // Get time since registration
  const getTimeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
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
        title="Failed to load vendor applications"
        description="There was an error loading vendor data. Please try again."
        action={{
          label: 'Retry',
          onClick: refetch,
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
            Vendor Approvals
          </h1>
          <p className="text-text-muted mt-1">
            Review and approve vendor applications
          </p>
          {vendors.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-earthy-yellow" />
              <span className="text-sm text-earthy-brown font-medium">
                {vendors.length} pending applications
              </span>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedVendors.size > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-text-muted">
              {selectedVendors.size} selected
            </span>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-approve',
                  title: 'Bulk Approve Vendors',
                  message: `Are you sure you want to approve ${selectedVendors.size} vendors? They will gain access to create listings.`,
                  confirmText: 'Approve All',
                  onConfirm: () => handleBulkApproval(true),
                })
              }
              className="flex items-center gap-2 text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
            >
              <UserCheck className="w-4 h-4" />
              Approve Selected
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-reject',
                  title: 'Bulk Reject Vendors',
                  message: `Are you sure you want to reject ${selectedVendors.size} vendors? This action cannot be undone.`,
                  confirmText: 'Reject All',
                  isDangerous: true,
                  onConfirm: () => handleBulkApproval(false),
                })
              }
              className="flex items-center gap-2 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
            >
              <UserX className="w-4 h-4" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search vendors by name, phone, business..."
              className="w-full"
            />
          </div>

          {vendors.length > 0 && (
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={
                    selectedVendors.size === vendors.length &&
                    vendors.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                />
                <span className="text-sm text-text-muted">Select all</span>
              </label>
            </div>
          )}
        </div>
      </Card>

      {/* Vendor Applications */}
      {vendors.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No pending approvals"
          description="All vendor applications have been processed. Check back later for new applications."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Card
                key={vendor.id}
                className={`p-6 hover:shadow-lg transition-all duration-300 ${
                  selectedVendors.has(vendor.id)
                    ? 'ring-2 ring-bottle-green/30 bg-bottle-green/5'
                    : ''
                }`}
              >
                {/* Selection Checkbox */}
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={selectedVendors.has(vendor.id)}
                    onChange={() => handleSelectVendor(vendor.id)}
                    className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green mt-1"
                  />
                  <div className="flex items-center gap-1 text-xs text-earthy-brown bg-earthy-yellow/20 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {getTimeSince(vendor.createdAt)}
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="space-y-3">
                  {/* Name and Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-secondary rounded-full flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
                      {vendor.name?.charAt(0) || vendor.phone?.slice(-1) || 'V'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-text-dark dark:text-white truncate">
                        {vendor.name || 'Unnamed Vendor'}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-text-muted">
                        <Phone className="w-3 h-3" />
                        {vendor.phone}
                      </div>
                    </div>
                  </div>

                  {/* Business Info */}
                  {(vendor.businessName || vendor.businessType) && (
                    <div className="space-y-1">
                      {vendor.businessName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Store className="w-4 h-4 text-text-muted" />
                          <span className="text-text-dark dark:text-white font-medium">
                            {vendor.businessName}
                          </span>
                        </div>
                      )}
                      {vendor.businessType && (
                        <p className="text-xs text-text-muted ml-6">
                          {vendor.businessType}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Location */}
                  {vendor.location && (
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{vendor.location}</span>
                    </div>
                  )}

                  {/* Registration Date */}
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Calendar className="w-3 h-3" />
                    Applied {new Date(vendor.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-6">
                  <button
                    onClick={() => setViewingVendor(vendor)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 text-text-muted hover:text-bottle-green hover:border-bottle-green rounded-xl transition-colors min-h-[36px] flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'approve',
                        vendor,
                        title: 'Approve Vendor',
                        message: `Approve ${vendor.name || vendor.phone}? They will be able to create and manage listings.`,
                        confirmText: 'Approve',
                        onConfirm: () => handleApproval(vendor.id, true),
                      })
                    }
                    className="flex-1 px-3 py-2 text-sm bg-bottle-green text-white hover:bg-bottle-green/90 rounded-xl transition-colors min-h-[36px] flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      setConfirmAction({
                        type: 'reject',
                        vendor,
                        title: 'Reject Vendor',
                        message: `Reject ${vendor.name || vendor.phone}? This will deny their application.`,
                        confirmText: 'Reject',
                        isDangerous: true,
                        onConfirm: () => handleApproval(vendor.id, false),
                      })
                    }
                    className="px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red hover:text-white border border-tomato-red rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
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
                totalItems={pagination.totalUsers}
                itemsPerPage={itemsPerPage}
              />
            </Card>
          )}
        </>
      )}

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

      {/* Vendor Details Modal */}
      {viewingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setViewingVendor(null)}
          />
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text-dark dark:text-white">
                  Vendor Application Details
                </h2>
                <button
                  onClick={() => setViewingVendor(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="font-medium text-text-dark dark:text-white mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-text-muted">
                        Full Name
                      </label>
                      <p className="font-medium text-text-dark dark:text-white">
                        {viewingVendor.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-text-muted">
                        Phone Number
                      </label>
                      <p className="font-medium text-text-dark dark:text-white">
                        {viewingVendor.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div>
                  <h3 className="font-medium text-text-dark dark:text-white mb-3">
                    Business Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-text-muted">
                        Business Name
                      </label>
                      <p className="font-medium text-text-dark dark:text-white">
                        {viewingVendor.businessName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-text-muted">
                        Business Type
                      </label>
                      <p className="font-medium text-text-dark dark:text-white">
                        {viewingVendor.businessType || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Application Timeline */}
                <div>
                  <h3 className="font-medium text-text-dark dark:text-white mb-3">
                    Application Timeline
                  </h3>
                  <div className="text-sm text-text-muted">
                    <p>
                      Submitted:{' '}
                      {new Date(viewingVendor.createdAt).toLocaleString()}
                    </p>
                    <p>Time since: {getTimeSince(viewingVendor.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => {
                    setConfirmAction({
                      type: 'approve',
                      vendor: viewingVendor,
                      title: 'Approve Vendor',
                      message: `Approve ${viewingVendor.name || viewingVendor.phone}? They will be able to create and manage listings.`,
                      confirmText: 'Approve',
                      onConfirm: () => {
                        handleApproval(viewingVendor.id, true);
                        setViewingVendor(null);
                      },
                    });
                  }}
                  className="flex-1"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Vendor
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmAction({
                      type: 'reject',
                      vendor: viewingVendor,
                      title: 'Reject Vendor',
                      message: `Reject ${viewingVendor.name || viewingVendor.phone}? This will deny their application.`,
                      confirmText: 'Reject',
                      isDangerous: true,
                      onConfirm: () => {
                        handleApproval(viewingVendor.id, false);
                        setViewingVendor(null);
                      },
                    });
                  }}
                  className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VendorApproval;
