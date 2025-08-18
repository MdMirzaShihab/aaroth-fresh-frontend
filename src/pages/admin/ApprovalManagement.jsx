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
} from 'lucide-react';
import {
  useGetAllApprovalsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useApproveRestaurantMutation,
  useRejectRestaurantMutation,
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

const ApprovalManagement = () => {
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // all, vendor, restaurant
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('card'); // card, table
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

  const [approveVendor, { isLoading: isApprovingVendor }] = useApproveVendorMutation();
  const [rejectVendor, { isLoading: isRejectingVendor }] = useRejectVendorMutation();
  const [approveRestaurant, { isLoading: isApprovingRestaurant }] = useApproveRestaurantMutation();
  const [rejectRestaurant, { isLoading: isRejectingRestaurant }] = useRejectRestaurantMutation();

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

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return {
          className: 'bg-earthy-yellow/20 text-earthy-brown',
          icon: Clock,
          text: 'Pending Review',
        };
      case 'approved':
        return {
          className: 'bg-mint-fresh/20 text-bottle-green',
          icon: CheckCircle,
          text: 'Approved',
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
          checked={selectedApprovals.size === approvals.length && approvals.length > 0}
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
              <p className="text-sm text-text-muted">
                {approval.phone}
              </p>
              <p className="text-xs text-text-muted">
                {typeDisplay.label}
              </p>
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
        const badge = getStatusBadge(approval.status);
        return (
          <div className="flex items-center gap-2">
            <badge.icon className="w-4 h-4" />
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
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
          ? Math.floor((new Date() - new Date(approval.createdAt)) / (1000 * 60 * 60 * 24))
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
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyClass}`}>
            {urgencyText} ({daysWaiting}d)
          </span>
        );
      },
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (approval) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleViewDetails(approval)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View details"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {approval.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedApproval(approval);
                  setShowModal(true);
                }}
                className="p-2 text-bottle-green hover:bg-mint-fresh/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Quick approve"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedApproval(approval);
                  setShowModal(true);
                }}
                className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Quick reject"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
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

      {/* Bulk Actions */}
      {selectedApprovals.size > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-dark">
              {selectedApprovals.size} applications selected
            </span>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                className="text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
              >
                Bulk Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
              >
                Bulk Reject
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
          onApprove={(data) => handleApproval(selectedApproval.type, selectedApproval._id, 'approve', data)}
          onReject={(data) => handleApproval(selectedApproval.type, selectedApproval._id, 'reject', data)}
          isLoading={isApprovingVendor || isRejectingVendor || isApprovingRestaurant || isRejectingRestaurant}
        />
      )}
    </div>
  );
};

export default ApprovalManagement;