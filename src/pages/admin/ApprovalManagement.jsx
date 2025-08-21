import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Store,
  Utensils,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  Shield,
  ShieldCheck,
  ShieldX,
  RotateCcw,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import {
  useGetAllApprovalsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useApproveRestaurantMutation,
  useRejectRestaurantMutation,
  useToggleVendorVerificationMutation,
  useToggleRestaurantVerificationMutation,
  useResetVendorApprovalMutation,
  useResetRestaurantApprovalMutation,
  useBulkToggleVerificationMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';
import ApprovalCard from '../../components/admin/ApprovalCard';
import ApprovalModal from '../../components/admin/ApprovalModal';
import ApprovalFilters from '../../components/admin/ApprovalFilters';
import VerificationToggleModal from '../../components/admin/VerificationToggleModal';
import StatusResetModal from '../../components/admin/StatusResetModal';
import BulkVerificationModal from '../../components/admin/BulkVerificationModal';

const ApprovalManagement = () => {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, vendor, restaurant
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('card'); // card, table
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBulkVerificationModal, setShowBulkVerificationModal] = useState(false);
  const [selectedApprovals, setSelectedApprovals] = useState(new Set());

  const itemsPerPage = 12;

  // Query params for API call
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      type: selectedType !== 'all' ? selectedType : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    }),
    [currentPage, searchTerm, selectedType, selectedStatus]
  );

  // RTK Query hooks
  const {
    data: approvalsData,
    isLoading,
    error,
    refetch,
  } = useGetAllApprovalsQuery(queryParams);

  const [approveVendor, { isLoading: isApprovingVendor }] =
    useApproveVendorMutation();
  const [rejectVendor, { isLoading: isRejectingVendor }] =
    useRejectVendorMutation();
  const [approveRestaurant, { isLoading: isApprovingRestaurant }] =
    useApproveRestaurantMutation();
  const [rejectRestaurant, { isLoading: isRejectingRestaurant }] =
    useRejectRestaurantMutation();
  
  // Enhanced verification mutations
  const [toggleVendorVerification, { isLoading: isTogglingVendorVerification }] =
    useToggleVendorVerificationMutation();
  const [toggleRestaurantVerification, { isLoading: isTogglingRestaurantVerification }] =
    useToggleRestaurantVerificationMutation();
  const [resetVendorApproval, { isLoading: isResettingVendorApproval }] =
    useResetVendorApprovalMutation();
  const [resetRestaurantApproval, { isLoading: isResettingRestaurantApproval }] =
    useResetRestaurantApprovalMutation();
  const [bulkToggleVerification, { isLoading: isBulkToggling }] =
    useBulkToggleVerificationMutation();

  const approvals = approvalsData?.data || [];
  const totalApprovals = approvalsData?.total || 0;
  const totalPages = approvalsData?.pages || 1;
  const metrics = approvalsData?.metrics || {};

  // Handle approval actions
  const handleApproval = async (type, id, action, data) => {
    try {
      if (type === 'vendor') {
        if (action === 'approve') {
          await approveVendor({ id, approvalNotes: data.notes }).unwrap();
        } else {
          await rejectVendor({ id, rejectionReason: data.reason }).unwrap();
        }
      } else if (type === 'restaurant') {
        if (action === 'approve') {
          await approveRestaurant({ id, approvalNotes: data.notes }).unwrap();
        } else {
          await rejectRestaurant({ id, rejectionReason: data.reason }).unwrap();
        }
      }
      setShowModal(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to process approval:', error);
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedApprovals.size === approvals.length) {
      setSelectedApprovals(new Set());
    } else {
      setSelectedApprovals(new Set(approvals.map((approval) => approval._id)));
    }
  };

  const handleSelectApproval = (approvalId) => {
    setSelectedApprovals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(approvalId)) {
        newSet.delete(approvalId);
      } else {
        newSet.add(approvalId);
      }
      return newSet;
    });
  };

  // Handle view approval details
  const handleViewDetails = (approval) => {
    setSelectedApproval(approval);
    setShowModal(true);
  };

  // Handle verification toggle
  const handleVerificationToggle = async (data) => {
    try {
      if (data.entityType === 'vendor') {
        await toggleVendorVerification(data).unwrap();
      } else if (data.entityType === 'restaurant') {
        await toggleRestaurantVerification(data).unwrap();
      }
      setShowVerificationModal(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to toggle verification:', error);
    }
  };

  // Handle status reset
  const handleStatusReset = async (data) => {
    try {
      if (data.entityType === 'vendor') {
        await resetVendorApproval(data).unwrap();
      } else if (data.entityType === 'restaurant') {
        await resetRestaurantApproval(data).unwrap();
      }
      setShowResetModal(false);
      setSelectedApproval(null);
    } catch (error) {
      console.error('Failed to reset status:', error);
    }
  };

  // Handle opening verification modal
  const handleOpenVerificationModal = (approval) => {
    setSelectedApproval(approval);
    setShowVerificationModal(true);
  };

  // Handle opening reset modal
  const handleOpenResetModal = (approval) => {
    setSelectedApproval(approval);
    setShowResetModal(true);
  };

  // Handle bulk verification
  const handleBulkVerification = async (data) => {
    try {
      await bulkToggleVerification(data).unwrap();
      setShowBulkVerificationModal(false);
      setSelectedApprovals(new Set());
    } catch (error) {
      console.error('Failed to perform bulk verification:', error);
    }
  };

  // Get selected approvals data
  const selectedApprovalsData = approvals.filter(approval => 
    selectedApprovals.has(approval._id)
  );

  // Get status badge styling with verification status
  const getStatusBadge = (approval) => {
    const businessEntity = approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
    const isVerified = businessEntity?.isVerified || false;
    
    // If entity is verified, show verification status instead of approval status
    if (isVerified) {
      return {
        className: 'bg-mint-fresh/20 text-bottle-green',
        icon: ShieldCheck,
        text: 'Verified',
        isVerified: true,
      };
    }
    
    // Check if previously processed but not verified
    if (businessEntity && businessEntity.verificationDate === null && (businessEntity.statusUpdatedAt || businessEntity.adminNotes)) {
      return {
        className: 'bg-gray-100 text-gray-600',
        icon: ShieldX,
        text: 'Unverified',
        isVerified: false,
      };
    }
    
    // Default to pending status
    return {
      className: 'bg-earthy-yellow/20 text-earthy-brown',
      icon: Clock,
      text: 'Pending Review',
      isVerified: null,
    };
  };

  // Get type icon and color
  const getTypeDisplay = (type) => {
    switch (type) {
      case 'vendor':
        return {
          icon: Store,
          color: 'text-green-600',
          label: 'Vendor',
        };
      case 'restaurant':
        return {
          icon: Utensils,
          color: 'text-blue-600',
          label: 'Restaurant',
        };
      default:
        return {
          icon: User,
          color: 'text-gray-600',
          label: 'Unknown',
        };
    }
  };

  // Table columns for table view
  const columns = [
    {
      id: 'select',
      header: (
        <input
          type="checkbox"
          checked={
            selectedApprovals.size === approvals.length && approvals.length > 0
          }
          onChange={handleSelectAll}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      cell: (approval) => (
        <input
          type="checkbox"
          checked={selectedApprovals.has(approval._id)}
          onChange={() => handleSelectApproval(approval._id)}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      width: '48px',
    },
    {
      id: 'applicant',
      header: 'Applicant',
      cell: (approval) => {
        const typeDisplay = getTypeDisplay(approval.type);
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <typeDisplay.icon className={`w-5 h-5 ${typeDisplay.color}`} />
            </div>
            <div>
              <p className="font-medium text-text-dark dark:text-white">
                {approval.businessName || approval.name || 'Unknown'}
              </p>
              <p className="text-sm text-text-muted">{approval.phone}</p>
              <p className="text-xs text-text-muted">{typeDisplay.label}</p>
            </div>
          </div>
        );
      },
      sortable: true,
      width: '250px',
    },
    {
      id: 'status',
      header: 'Status',
      cell: (approval) => {
        const badge = getStatusBadge(approval);
        return (
          <div className="flex items-center gap-2">
            <badge.icon className="w-4 h-4" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: 'submitted',
      header: 'Submitted',
      cell: (approval) => (
        <div className="text-sm text-text-muted">
          {approval.createdAt
            ? new Date(approval.createdAt).toLocaleDateString()
            : 'Unknown'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'urgency',
      header: 'Urgency',
      cell: (approval) => {
        const daysWaiting = approval.createdAt
          ? Math.floor(
              (new Date() - new Date(approval.createdAt)) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

        let urgencyClass = 'bg-gray-100 text-gray-600';
        let urgencyText = 'Normal';

        if (daysWaiting > 7) {
          urgencyClass = 'bg-tomato-red/20 text-tomato-red';
          urgencyText = 'Urgent';
        } else if (daysWaiting > 3) {
          urgencyClass = 'bg-earthy-yellow/20 text-earthy-brown';
          urgencyText = 'High';
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyClass}`}
          >
            {urgencyText} ({daysWaiting}d)
          </span>
        );
      },
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (approval) => {
        const badge = getStatusBadge(approval);
        const businessEntity = approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
        
        return (
          <div className="flex items-center gap-1">
            {/* View Details */}
            <button
              onClick={() => handleViewDetails(approval)}
              className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Traditional Approval Actions for Pending */}
            {badge.isVerified === null && (
              <>
                <button
                  onClick={() => {
                    setSelectedApproval(approval);
                    setShowModal(true);
                  }}
                  className="p-2 text-bottle-green hover:bg-mint-fresh/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Approve application"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedApproval(approval);
                    setShowModal(true);
                  }}
                  className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                  title="Reject application"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Verification Toggle for Processed Applications */}
            {(badge.isVerified === true || badge.isVerified === false) && (
              <button
                onClick={() => handleOpenVerificationModal(approval)}
                className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  badge.isVerified
                    ? 'text-amber-600 hover:bg-amber-100'
                    : 'text-bottle-green hover:bg-mint-fresh/20'
                }`}
                title={badge.isVerified ? 'Revoke verification' : 'Grant verification'}
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {/* Status Reset for Processed Applications */}
            {businessEntity && (businessEntity.statusUpdatedAt || businessEntity.adminNotes) && (
              <button
                onClick={() => handleOpenResetModal(approval)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Reset to pending"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      width: '140px',
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
        title="Failed to load approvals"
        description="There was an error loading approval data. Please try again."
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
            Approval Management
          </h1>
          <p className="text-text-muted mt-1">
            Review and manage vendor and restaurant applications
          </p>
        </div>

        {/* Metrics Overview */}
        <div className="flex flex-wrap gap-4">
          <div className="bg-earthy-yellow/10 rounded-xl px-4 py-2">
            <p className="text-sm text-earthy-brown font-medium">
              {metrics.totalPending || 0} Pending
            </p>
          </div>
          <div className="bg-mint-fresh/10 rounded-xl px-4 py-2">
            <p className="text-sm text-bottle-green font-medium">
              {metrics.totalApproved || 0} Approved Today
            </p>
          </div>
          {selectedApprovals.size > 0 && (
            <div className="bg-bottle-green/10 rounded-xl px-4 py-2">
              <p className="text-sm text-bottle-green font-medium">
                {selectedApprovals.size} Selected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <Card className="p-6">
        <ApprovalFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </Card>

      {/* Enhanced Bulk Actions */}
      {selectedApprovals.size > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-text-dark">
                {selectedApprovals.size} applications selected
              </span>
              
              {/* Selection Summary */}
              <div className="flex gap-2">
                {selectedApprovalsData.filter(a => a.type === 'vendor').length > 0 && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-lg flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    {selectedApprovalsData.filter(a => a.type === 'vendor').length}
                  </span>
                )}
                {selectedApprovalsData.filter(a => a.type === 'restaurant').length > 0 && (
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1">
                    <Utensils className="w-3 h-3" />
                    {selectedApprovalsData.filter(a => a.type === 'restaurant').length}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Legacy Bulk Actions */}
              <Button
                variant="outline"
                size="sm"
                className="text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
                onClick={() => {
                  // Handle bulk approve for truly pending items
                  // TODO: Implement bulk approval for legacy pending items
                }}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Bulk Approve
              </Button>
              
              {/* Enhanced Verification Actions */}
              <Button
                variant="outline"
                size="sm"
                className="text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
                onClick={() => setShowBulkVerificationModal(true)}
              >
                <Shield className="w-4 h-4 mr-1" />
                Bulk Verify
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Bulk Reject
              </Button>

              {/* Clear Selection */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedApprovals(new Set())}
                className="text-gray-600 border-gray-300"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Approvals Display */}
      {approvals.length > 0 ? (
        <>
          {viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {approvals.map((approval) => (
                <ApprovalCard
                  key={approval._id}
                  approval={approval}
                  onViewDetails={handleViewDetails}
                  onSelect={handleSelectApproval}
                  selected={selectedApprovals.has(approval._id)}
                />
              ))}
            </div>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <Table
                  data={approvals}
                  columns={columns}
                  emptyState={
                    <EmptyState
                      icon={FileText}
                      title="No approvals found"
                      description="No applications match your current filters."
                    />
                  }
                />
              </div>
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalApprovals}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={FileText}
          title="No approvals found"
          description="No applications match your current filters. Try adjusting your search criteria."
          action={{
            label: 'Clear Filters',
            onClick: () => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedStatus('pending');
              setCurrentPage(1);
            },
          }}
        />
      )}

      {/* Approval Details Modal */}
      {showModal && selectedApproval && (
        <ApprovalModal
          approval={selectedApproval}
          onClose={() => {
            setShowModal(false);
            setSelectedApproval(null);
          }}
          onApprove={(data) =>
            handleApproval(
              selectedApproval.type,
              selectedApproval._id,
              'approve',
              data
            )
          }
          onReject={(data) =>
            handleApproval(
              selectedApproval.type,
              selectedApproval._id,
              'reject',
              data
            )
          }
          isLoading={
            isApprovingVendor ||
            isRejectingVendor ||
            isApprovingRestaurant ||
            isRejectingRestaurant
          }
        />
      )}

      {/* Verification Toggle Modal */}
      {showVerificationModal && selectedApproval && (
        <VerificationToggleModal
          approval={selectedApproval}
          onClose={() => {
            setShowVerificationModal(false);
            setSelectedApproval(null);
          }}
          onToggleVerification={handleVerificationToggle}
          isLoading={isTogglingVendorVerification || isTogglingRestaurantVerification}
        />
      )}

      {/* Status Reset Modal */}
      {showResetModal && selectedApproval && (
        <StatusResetModal
          approval={selectedApproval}
          onClose={() => {
            setShowResetModal(false);
            setSelectedApproval(null);
          }}
          onResetStatus={handleStatusReset}
          isLoading={isResettingVendorApproval || isResettingRestaurantApproval}
        />
      )}

      {/* Bulk Verification Modal */}
      {showBulkVerificationModal && selectedApprovals.size > 0 && (
        <BulkVerificationModal
          selectedApprovals={selectedApprovalsData}
          onClose={() => {
            setShowBulkVerificationModal(false);
          }}
          onBulkVerification={handleBulkVerification}
          isLoading={isBulkToggling}
        />
      )}
    </div>
  );
};

export default ApprovalManagement;
