/**
 * VendorsManagementPage - Admin V2 Vendor Management Interface
 * Professional B2B vendor directory with verification workflows, performance monitoring, and business management
 * Features: Business card layout, verification queue, status management, performance analytics
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Search,
  Settings,
  BarChart3,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MapPin,
  Building2,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Button, Input } from '../../../components/ui';
import {
  useGetVendorsQuery,
  useUpdateVendorVerificationMutation,
  useDeactivateVendorMutation,
  useSafeDeleteVendorMutation,
} from '../../../services/admin/vendorsService';
import VendorDirectory from './components/VendorDirectory';
import VendorFilters from './components/VendorFilters';
import VendorDetailsModal from './components/VendorDetailsModal';
import VendorEditModal from './components/VendorEditModal';

const VendorsManagementPage = () => {
  const { isDarkMode } = useTheme();

  // Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc',
  });
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [showVendorEdit, setShowVendorEdit] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // API queries
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useGetVendorsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    sortBy: sortConfig.field,
    sortOrder: sortConfig.direction,
    ...activeFilters,
  });

  // Mutations
  const [updateVendorVerification] = useUpdateVendorVerificationMutation();
  const [deactivateVendor] = useDeactivateVendorMutation();
  const [safeDeleteVendor] = useSafeDeleteVendorMutation();

  // Follow RestaurantsManagementPage pattern - direct data access
  const vendors = vendorsData?.data || [];
  const totalVendors = vendorsData?.total || 0;
  const totalPages = vendorsData?.pages || Math.ceil(totalVendors / pageSize);
  const vendorStats = vendorsData?.stats || {};

  // Handle vendor selection
  const handleVendorSelect = useCallback((vendorId, selected) => {
    setSelectedVendors((prev) =>
      selected ? [...prev, vendorId] : prev.filter((id) => id !== vendorId)
    );
  }, []);

  const handleSelectAll = useCallback(
    (selected) => {
      if (selected) {
        setSelectedVendors(vendors.map((vendor) => vendor.id));
      } else {
        setSelectedVendors([]);
      }
    },
    [vendors]
  );

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  }, []);

  // Handle filtering
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  // Handle verification actions
  const handleVerificationAction = useCallback(
    async (vendorId, status, reason = '') => {
      try {
        setIsModalLoading(true);
        toast.loading(
          `${status === 'approved' ? 'Approving' : 'Rejecting'} vendor verification...`
        );

        const result = await updateVendorVerification({
          vendorId,
          status,
          reason,
        }).unwrap();

        toast.dismiss();
        toast.success(
          `Vendor verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`
        );
        refetchVendors();
        
        // Close the modal after successful verification
        setShowVendorDetails(false);
        setSelectedVendor(null);
      } catch (error) {
        toast.dismiss();
        
        // Handle different types of backend errors
        let errorMessage = `Failed to ${status} verification`;
        
        if (error.status === 400) {
          // Validation errors from backend
          if (error.data?.error) {
            errorMessage = error.data.error;
          } else if (error.data?.message) {
            errorMessage = error.data.message;
          } else {
            errorMessage += ': Invalid data provided';
          }
        } else if (error.status === 401) {
          errorMessage = 'You are not authorized to perform this action';
        } else if (error.status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        } else if (error.status === 404) {
          errorMessage = 'Vendor not found';
        } else if (error.status === 500) {
          errorMessage = 'Server error occurred. Please try again later';
        } else if (error.message) {
          errorMessage += `: ${error.message}`;
        } else {
          errorMessage += '. Please check your connection and try again';
        }
        
        toast.error(errorMessage);
        // Keep modal open on error so user can retry
      } finally {
        setIsModalLoading(false);
      }
    },
    [updateVendorVerification, refetchVendors]
  );

  // Handle individual vendor actions
  const handleVendorDeactivate = useCallback(async (vendorId, reason) => {
    try {
      setIsModalLoading(true);
      toast.loading('Deactivating vendor...');
      await deactivateVendor({ vendorId, reason }).unwrap();
      toast.dismiss();
      toast.success('Vendor deactivated successfully');
      refetchVendors();
      
      // Close the modal after successful deactivation
      setShowVendorDetails(false);
      setSelectedVendor(null);
    } catch (error) {
      toast.dismiss();
      if (error.data?.dependencies) {
        toast.error(`Cannot deactivate vendor: ${error.data.error}`);
      } else {
        toast.error(`Failed to deactivate vendor: ${error.message}`);
      }
      // Keep modal open on error so user can retry
    } finally {
      setIsModalLoading(false);
    }
  }, [deactivateVendor, refetchVendors]);

  const handleVendorDelete = useCallback(async (vendorId, reason) => {
    try {
      setIsModalLoading(true);
      toast.loading('Deleting vendor...');
      await safeDeleteVendor({ vendorId, reason }).unwrap();
      toast.dismiss();
      toast.success('Vendor deleted successfully');
      refetchVendors();
      
      // Close the modal after successful deletion
      setShowVendorDetails(false);
      setSelectedVendor(null);
    } catch (error) {
      toast.dismiss();
      if (error.data?.dependencies) {
        toast.error(`Cannot delete vendor: ${error.data.error}`);
      } else {
        toast.error(`Failed to delete vendor: ${error.message}`);
      }
      // Keep modal open on error so user can retry
    } finally {
      setIsModalLoading(false);
    }
  }, [safeDeleteVendor, refetchVendors]);

  // Handle export
  const handleExport = useCallback(async (format = 'csv') => {
    try {
      toast.loading('Preparing export...');

      // Export logic will be implemented with actual API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.dismiss();
      toast.success(`Vendors exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Export failed: ${error.message}`);
    }
  }, []);

  // Handle vendor actions
  const handleVendorAction = useCallback((vendor, action, data = {}) => {
    const vendorId = vendor._id || vendor.id;
    
    switch (action) {
      case 'view_details':
      case 'view_profile':
      case 'edit_profile':
        setSelectedVendor(vendor);
        setShowVendorDetails(true);
        break;
      case 'approve_verification':
        handleVerificationAction(vendorId, 'approved', data.reason);
        break;
      case 'reject_verification':
        handleVerificationAction(vendorId, 'rejected', data.reason);
        break;
      case 'deactivate':
        handleVendorDeactivate(vendorId, data.reason);
        break;
      case 'delete':
        handleVendorDelete(vendorId, data.reason);
        break;
      default:
        // Unhandled action
        break;
    }
  }, [handleVerificationAction, handleVendorDeactivate, handleVendorDelete]);

  // Quick stats for header - match API response structure
  const quickStats = useMemo(() => {
    if (!vendorStats) return null;

    const stats = vendorStats || {};
    return {
      totalVendors,
      verifiedVendors: stats.approvedVendors || 0,
      pendingVerification: stats.pendingVendors || 0,
      rejectedVendors: stats.rejectedVendors || 0,
    };
  }, [vendorStats, totalVendors]);

  // Status filter tabs
  const statusTabs = [
    { id: '', label: 'All Vendors', icon: Store, count: quickStats?.totalVendors || 0 },
    { id: 'pending', label: 'Pending Verification', icon: Clock, count: quickStats?.pendingVerification || 0, urgent: true },
    { id: 'approved', label: 'Approved', icon: CheckCircle, count: quickStats?.verifiedVendors || 0 },
    { id: 'rejected', label: 'Rejected', icon: XCircle, count: quickStats?.rejectedVendors || 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/30 via-white to-sage-green/20 dark:from-dark-bg dark:via-dark-bg-alt dark:to-dark-surface">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-dark-bg/80 border-b border-sage-green/20 dark:border-dark-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green flex items-center justify-center shadow-glow-olive">
                <Store className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1
                  className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Vendor Management
                </h1>
                <p
                  className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                >
                  Comprehensive business directory with verification workflows
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                className="hidden sm:flex"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  toast.info('Vendor registration handled by public portal')
                }
                className="hidden sm:flex"
              >
                <Building2 className="w-4 h-4 mr-2" />
                View Portal
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          {quickStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                    >
                      Total Vendors
                    </p>
                    <p
                      className={`text-lg font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                    >
                      {quickStats.totalVendors.toLocaleString()}
                    </p>
                  </div>
                  <Store
                    className={`w-4 h-4 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
                  />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                    >
                      Verified
                    </p>
                    <p
                      className={`text-lg font-bold ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
                    >
                      {quickStats.verifiedVendors.toLocaleString()}
                    </p>
                  </div>
                  <CheckCircle
                    className={`w-4 h-4 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
                  />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                    >
                      Pending Verification
                    </p>
                    <p
                      className={`text-lg font-bold ${quickStats.pendingVerification > 0 ? 'text-earthy-yellow' : isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                    >
                      {quickStats.pendingVerification.toLocaleString()}
                    </p>
                  </div>
                  <Clock
                    className={`w-4 h-4 ${quickStats.pendingVerification > 0 ? 'text-earthy-yellow' : 'text-gray-300'}`}
                  />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
                    >
                      Rejected
                    </p>
                    <p
                      className={`text-lg font-bold ${quickStats.rejectedVendors > 0 ? 'text-tomato-red' : isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                    >
                      {quickStats.rejectedVendors.toLocaleString()}
                    </p>
                  </div>
                  <XCircle
                    className={`w-4 h-4 ${quickStats.rejectedVendors > 0 ? 'text-tomato-red' : 'text-gray-300'}`}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-2xl">
            {statusTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeFilters.status === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange({...activeFilters, status: tab.id})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white dark:bg-dark-bg text-muted-olive shadow-sm'
                      : 'text-text-muted hover:text-text-dark dark:hover:text-dark-text-primary'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      isActive 
                        ? 'bg-muted-olive/10 text-muted-olive'
                        : tab.urgent
                          ? 'bg-earthy-yellow/20 text-earthy-yellow'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <VendorFilters
              filters={activeFilters}
              onFiltersChange={handleFilterChange}
              vendorCounts={{
                total: totalVendors,
                filtered: vendors.length,
              }}
            />
          </motion.div>
        )}

        {/* Search and Bulk Operations */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search vendors by business name, owner, location, or type..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refetchVendors}
                disabled={vendorsLoading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${vendorsLoading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Vendor Directory */}
          <VendorDirectory
            vendors={vendors}
            loading={vendorsLoading}
            error={vendorsError}
            selectedVendors={selectedVendors}
            sortConfig={sortConfig}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            totalVendors={totalVendors}
            onVendorSelect={handleVendorSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onVendorAction={handleVendorAction}
          />
        </Card>
      </div>

      {/* Vendor Details Modal */}
      {showVendorDetails && selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          isOpen={showVendorDetails}
          onClose={() => {
            setShowVendorDetails(false);
            setSelectedVendor(null);
          }}
          onEdit={(vendor) => {
            setShowVendorDetails(false);
            setSelectedVendor(vendor);
            setShowVendorEdit(true);
          }}
          onVerify={(vendorId, status, reason) => {
            // The modal passes the status (approved/rejected) and reason
            handleVerificationAction(vendorId, status, reason);
          }}
          onDeactivate={handleVendorDeactivate}
          onDelete={handleVendorDelete}
          isLoading={isModalLoading}
        />
      )}

      {/* Vendor Edit Modal */}
      {showVendorEdit && selectedVendor && (
        <VendorEditModal
          vendor={selectedVendor}
          isOpen={showVendorEdit}
          onClose={() => {
            setShowVendorEdit(false);
            setSelectedVendor(null);
          }}
          onVendorUpdate={() => {
            refetchVendors();
          }}
          isLoading={isModalLoading}
        />
      )}
    </div>
  );
};

export default VendorsManagementPage;
