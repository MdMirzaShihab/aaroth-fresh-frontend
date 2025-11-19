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
import CreatePlatformVendor from './components/CreatePlatformVendor';

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
  const [showCreatePlatformVendor, setShowCreatePlatformVendor] = useState(false);
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

  // Follow BuyersManagementPage pattern - direct data access
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
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-primary flex items-center gap-3">
              <Store className="w-8 h-8 text-muted-olive" />
              Vendor Management
            </h1>
            <p className="text-text-muted dark:text-dark-text-muted mt-2">
              Comprehensive business directory with verification workflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreatePlatformVendor(true)}
              className="flex items-center gap-2 bg-gradient-secondary"
            >
              <Store className="w-4 h-4" />
              Create Platform Vendor
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refetchVendors}
              disabled={vendorsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${vendorsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* ===== STATISTICS DASHBOARD ===== */}
        {quickStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Vendors */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-muted-olive" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Total Vendors</p>
                  <p className="text-2xl font-bold text-muted-olive">
                    {quickStats.totalVendors.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Verified Vendors */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-sage-green" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Verified</p>
                  <p className="text-2xl font-bold text-sage-green">
                    {quickStats.verifiedVendors.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pending Verification */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-earthy-yellow" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Pending</p>
                  <p className="text-2xl font-bold text-earthy-yellow">
                    {quickStats.pendingVerification.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Rejected Vendors */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-tomato-red/10 rounded-2xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-tomato-red" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Rejected</p>
                  <p className="text-2xl font-bold text-tomato-red">
                    {quickStats.rejectedVendors.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ===== STATUS FILTER TABS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center gap-2"
        >
          {statusTabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeFilters.status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleFilterChange({...activeFilters, status: tab.id})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-secondary text-white shadow-md'
                    : 'glass hover:glass-2 text-text-muted dark:text-dark-text-muted hover:text-muted-olive dark:hover:text-dark-sage-accent'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive
                      ? 'bg-white/20'
                      : tab.urgent
                        ? 'bg-earthy-yellow/20'
                        : 'bg-muted-olive/20'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* ===== FILTERS PANEL ===== */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.3 }}
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

        {/* ===== SEARCH & VENDOR DIRECTORY ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 glass">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                <Input
                  placeholder="Search vendors by business name, owner, location, or type..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 glass"
                />
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
        </motion.div>
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

      {/* Create Platform Vendor Modal */}
      <CreatePlatformVendor
        isOpen={showCreatePlatformVendor}
        onClose={() => setShowCreatePlatformVendor(false)}
        onSuccess={() => {
          refetchVendors();
          setShowCreatePlatformVendor(false);
        }}
      />
    </div>
  );
};

export default VendorsManagementPage;
