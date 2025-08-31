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
  useGetVendorAnalyticsQuery,
  useGetVerificationQueueQuery,
  useUpdateVendorVerificationMutation,
  useBulkVendorOperationsMutation,
} from '../../../services/admin-v2/vendorsService';
import VendorDirectory from './components/VendorDirectory';
import VerificationQueue from './components/VerificationQueue';
import VendorFilters from './components/VendorFilters';
import BulkVendorOperations from './components/BulkVendorOperations';
import VendorAnalytics from './components/VendorAnalytics';
import VendorProfileModal from './components/VendorProfileModal';
import VendorStatusManager from './components/VendorStatusManager';

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
  const [viewMode, setViewMode] = useState('directory'); // 'directory' | 'verification' | 'analytics'
  const [showFilters, setShowFilters] = useState(false);

  // Modal state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showVendorProfile, setShowVendorProfile] = useState(false);
  const [showStatusManager, setShowStatusManager] = useState(false);

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

  const { data: analyticsData, isLoading: analyticsLoading } =
    useGetVendorAnalyticsQuery({
      enabled: viewMode === 'analytics',
    });

  const {
    data: verificationData,
    isLoading: verificationLoading,
    refetch: refetchVerification,
  } = useGetVerificationQueueQuery({
    enabled: viewMode === 'verification',
  });

  // Mutations
  const [updateVendorVerification] = useUpdateVendorVerificationMutation();
  const [bulkVendorOperations] = useBulkVendorOperationsMutation();

  // Memoized data transformations
  const totalVendors = vendorsData?.total || 0;
  const vendors = vendorsData?.vendors || [];
  const totalPages = Math.ceil(totalVendors / pageSize);
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

  // Handle vendor actions
  const handleVendorAction = useCallback((vendor, action) => {
    switch (action) {
      case 'view_profile':
        setSelectedVendor(vendor);
        setShowVendorProfile(true);
        break;
      case 'edit_profile':
        setSelectedVendor(vendor);
        setShowVendorProfile(true);
        break;
      case 'manage_status':
        setSelectedVendor(vendor);
        setShowStatusManager(true);
        break;
      case 'approve_verification':
        handleVerificationAction(vendor.id, 'approved');
        break;
      case 'reject_verification':
        handleVerificationAction(vendor.id, 'rejected');
        break;
      default:
        console.log(`Unhandled vendor action: ${action}`, vendor);
    }
  }, []);

  // Handle verification actions
  const handleVerificationAction = useCallback(
    async (vendorId, status, reason = '') => {
      try {
        toast.loading(
          `${status === 'approved' ? 'Approving' : 'Rejecting'} vendor verification...`
        );

        await updateVendorVerification({
          vendorId,
          status,
          reason,
          documents: [], // Will be handled by verification modal
        }).unwrap();

        toast.dismiss();
        toast.success(
          `Vendor verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`
        );
        refetchVendors();
        refetchVerification();
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to ${status} verification: ${error.message}`);
      }
    },
    [updateVendorVerification, refetchVendors, refetchVerification]
  );

  // Handle bulk operations
  const handleBulkOperation = useCallback(
    async (operation, options = {}) => {
      if (selectedVendors.length === 0) {
        toast.error('Please select vendors first');
        return;
      }

      try {
        toast.loading(
          `Processing ${operation} for ${selectedVendors.length} vendors...`
        );

        await bulkVendorOperations({
          vendorIds: selectedVendors,
          operation,
          operationData: options,
        }).unwrap();

        toast.dismiss();
        toast.success(`${operation} completed successfully`);
        setSelectedVendors([]);
        refetchVendors();
        if (viewMode === 'verification') refetchVerification();
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to ${operation}: ${error.message}`);
      }
    },
    [
      selectedVendors,
      bulkVendorOperations,
      refetchVendors,
      refetchVerification,
      viewMode,
    ]
  );

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

  // Quick stats for header
  const quickStats = useMemo(() => {
    if (!vendorStats && !analyticsData) return null;

    const stats = vendorStats || {};
    return {
      totalVendors,
      verifiedVendors: stats.verifiedVendors || 0,
      pendingVerification: stats.pendingVerification || 0,
      activeVendors: stats.activeVendors || 0,
    };
  }, [vendorStats, analyticsData, totalVendors]);

  // View mode tabs
  const viewTabs = [
    { id: 'directory', label: 'Vendor Directory', icon: Store },
    { id: 'verification', label: 'Verification Queue', icon: CheckCircle },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
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
                      Active
                    </p>
                    <p
                      className={`text-lg font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                    >
                      {quickStats.activeVendors.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
                </div>
              </Card>
            </div>
          )}

          {/* View Mode Tabs */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-dark-surface rounded-2xl">
            {viewTabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    viewMode === tab.id
                      ? 'bg-white dark:bg-dark-bg text-muted-olive shadow-sm'
                      : 'text-text-muted hover:text-text-dark dark:hover:text-dark-text-primary'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
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

          {/* Bulk Operations Bar */}
          {selectedVendors.length > 0 && (
            <BulkVendorOperations
              selectedVendors={selectedVendors}
              totalVendors={vendors.length}
              onBulkOperation={handleBulkOperation}
              onClearSelection={() => setSelectedVendors([])}
            />
          )}

          {/* Content based on view mode */}
          {viewMode === 'directory' && (
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
          )}

          {viewMode === 'verification' && (
            <VerificationQueue
              vendors={verificationData?.vendors || []}
              loading={verificationLoading}
              urgentCount={verificationData?.urgentCount || 0}
              averageWaitTime={verificationData?.averageWaitTime || 0}
              onVerificationAction={handleVerificationAction}
              onVendorAction={handleVendorAction}
            />
          )}

          {viewMode === 'analytics' && (
            <VendorAnalytics
              data={analyticsData}
              loading={analyticsLoading}
              vendors={vendors}
            />
          )}
        </Card>
      </div>

      {/* Modals */}
      {showVendorProfile && selectedVendor && (
        <VendorProfileModal
          vendor={selectedVendor}
          isOpen={showVendorProfile}
          onClose={() => {
            setShowVendorProfile(false);
            setSelectedVendor(null);
          }}
          onVendorUpdate={refetchVendors}
        />
      )}

      {showStatusManager && selectedVendor && (
        <VendorStatusManager
          vendor={selectedVendor}
          isOpen={showStatusManager}
          onClose={() => {
            setShowStatusManager(false);
            setSelectedVendor(null);
          }}
          onStatusUpdate={refetchVendors}
        />
      )}
    </div>
  );
};

export default VendorsManagementPage;
