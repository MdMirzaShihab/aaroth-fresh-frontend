import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Store,
  Users,
  Filter,
  Search,
  RefreshCw,
  Eye,
  MoreHorizontal,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetPendingVendorsQuery,
  useGetApprovedVendorsQuery,
  useGetRejectedVendorsQuery,
  useGetPendingRestaurantsQuery,
  useGetApprovedRestaurantsQuery,
  useGetRejectedRestaurantsQuery,
  useGetAllVendorsAdminQuery,
  useGetAllRestaurantsAdminQuery,
  useUpdateVendorVerificationStatusMutation,
  useUpdateRestaurantVerificationStatusMutation,
} from '../../store/slices/apiSlice';
import EntityCard from '../../components/admin/EntityCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import {
  showVerificationSuccessToast,
  showVerificationErrorToast,
  showSuccessToast,
} from '../../utils/toastConfig';

/**
 * ApprovalManagementNew - Modernized approval management with business verification
 * Uses cleaned API endpoints and business entity verification approach
 */
const ApprovalManagementNew = () => {
  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to first page when search changes
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearchTerm]);

  // Query parameters with debounced search
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
      status:
        filterStatus === 'approved'
          ? 'approved'
          : filterStatus === 'rejected'
          ? 'rejected'
          : filterStatus === 'pending'
          ? 'pending'
          : undefined,
    }),
    [currentPage, itemsPerPage, debouncedSearchTerm, filterStatus]
  );

  // API Hooks - Get data based on active tab (Fixed skipping logic)
  const {
    data: pendingVendors,
    isLoading: vendorsLoading,
    refetch: refetchVendors,
    error: vendorsError,
  } = useGetPendingVendorsQuery(queryParams, {
    skip: activeTab === 'restaurants' && filterStatus !== 'all',
  });

  const {
    data: pendingRestaurants,
    isLoading: restaurantsLoading,
    refetch: refetchRestaurants,
    error: restaurantsError,
  } = useGetPendingRestaurantsQuery(queryParams, {
    skip: activeTab === 'vendors' && filterStatus !== 'all',
  });

  const {
    data: allVendors,
    isLoading: allVendorsLoading,
    refetch: refetchAllVendors,
    error: allVendorsError,
  } = useGetAllVendorsAdminQuery(queryParams, {
    skip: (activeTab === 'restaurants' && filterStatus !== 'all') || filterStatus === 'pending',
  });

  const {
    data: allRestaurants,
    isLoading: allRestaurantsLoading,
    refetch: refetchAllRestaurants,
    error: allRestaurantsError,
  } = useGetAllRestaurantsAdminQuery(queryParams, {
    skip: (activeTab === 'vendors' && filterStatus !== 'all') || filterStatus === 'pending',
  });

  // Mutation hooks
  const [toggleVendorVerification, { isLoading: vendorToggleLoading }] =
    useToggleVendorVerificationNewMutation();
  const [toggleRestaurantVerification, { isLoading: restaurantToggleLoading }] =
    useToggleRestaurantVerificationNewMutation();

  // Data processing
  const getDisplayData = () => {
    let vendors = [];
    let restaurants = [];

    if (activeTab === 'all' || activeTab === 'vendors') {
      if (filterStatus === 'pending') {
        vendors = pendingVendors?.data || [];
      } else {
        vendors = allVendors?.data || [];
      }
    }

    if (activeTab === 'all' || activeTab === 'restaurants') {
      if (filterStatus === 'pending') {
        restaurants = pendingRestaurants?.data || [];
      } else {
        restaurants = allRestaurants?.data || [];
      }
    }

    const allEntities = [
      ...vendors.map((v) => ({ ...v, type: 'vendor' })),
      ...restaurants.map((r) => ({ ...r, type: 'restaurant' })),
    ];

    return allEntities.filter((entity) => {
      const matchesSearch =
        entity.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'approved' && entity.verificationStatus === 'approved') ||
        (filterStatus === 'rejected' && entity.verificationStatus === 'rejected') ||
        (filterStatus === 'pending' && entity.verificationStatus === 'pending');

      return matchesSearch && matchesFilter;
    });
  };

  const displayData = getDisplayData();
  const isLoading =
    vendorsLoading ||
    restaurantsLoading ||
    allVendorsLoading ||
    allRestaurantsLoading;

  // Error handling
  const hasErrors = vendorsError || restaurantsError || allVendorsError || allRestaurantsError;
  const errorMessage = hasErrors 
    ? 'Failed to load verification data. Please check your connection and try again.'
    : null;

  // Statistics
  const stats = useMemo(() => {
    const vendors =
      (filterStatus === 'pending' ? pendingVendors?.data : allVendors?.data) ||
      [];
    const restaurants =
      (filterStatus === 'pending'
        ? pendingRestaurants?.data
        : allRestaurants?.data) || [];

    const allItems = [...vendors, ...restaurants];

    return {
      total: allItems.length,
      pending: allItems.filter((item) => !item.isVerified).length,
      verified: allItems.filter((item) => item.isVerified).length,
      vendors: vendors.length,
      restaurants: restaurants.length,
    };
  }, [
    pendingVendors,
    pendingRestaurants,
    allVendors,
    allRestaurants,
    filterStatus,
  ]);

  // Enhanced event handlers with retry mechanism
  const handleVendorVerification = async ({ id, isVerified, reason }) => {
    const maxRetries = 2;
    let attempt = 0;
    
    const attemptVerification = async () => {
      try {
        const result = await toggleVendorVerification({
          id,
          isVerified,
          reason,
        }).unwrap();
        
        showVerificationSuccessToast(
          'vendor',
          isVerified ? 'verified' : 'revoked'
        );
        
        // Refetch data after successful verification
        refetchVendors();
        refetchAllVendors();
        
        return result;
      } catch (error) {
        attempt++;
        
        // Check if it's a transaction error that might resolve with retry
        const isTransactionError = error?.data?.message?.includes('transaction') || 
                                  error?.data?.message?.includes('abortTransaction') ||
                                  error?.status === 500;
        
        if (isTransactionError && attempt < maxRetries) {
          // Wait a bit and retry for transaction errors
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptVerification();
        }
        
        // Show error message with more context
        const errorMsg = error?.data?.message || `Failed to ${isVerified ? 'verify' : 'revoke'} vendor`;
        showVerificationErrorToast('vendor', isVerified ? 'verify' : 'revoke', {
          ...error,
          data: { 
            ...error?.data, 
            message: attempt > 1 ? `${errorMsg} (after ${attempt} attempts)` : errorMsg 
          }
        });
        throw error;
      }
    };
    
    return attemptVerification();
  };

  const handleRestaurantVerification = async ({ id, isVerified, reason }) => {
    const maxRetries = 2;
    let attempt = 0;
    
    const attemptVerification = async () => {
      try {
        const result = await toggleRestaurantVerification({
          id,
          isVerified,
          reason,
        }).unwrap();
        
        showVerificationSuccessToast(
          'restaurant',
          isVerified ? 'verified' : 'revoked'
        );
        
        // Refetch data after successful verification
        refetchRestaurants();
        refetchAllRestaurants();
        
        return result;
      } catch (error) {
        attempt++;
        
        // Check if it's a transaction error that might resolve with retry
        const isTransactionError = error?.data?.message?.includes('transaction') || 
                                  error?.data?.message?.includes('abortTransaction') ||
                                  error?.status === 500;
        
        if (isTransactionError && attempt < maxRetries) {
          // Wait a bit and retry for transaction errors
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptVerification();
        }
        
        // Show error message with more context
        const errorMsg = error?.data?.message || `Failed to ${isVerified ? 'verify' : 'revoke'} restaurant`;
        showVerificationErrorToast('restaurant', isVerified ? 'verify' : 'revoke', {
          ...error,
          data: { 
            ...error?.data, 
            message: attempt > 1 ? `${errorMsg} (after ${attempt} attempts)` : errorMsg 
          }
        });
        throw error;
      }
    };
    
    return attemptVerification();
  };

  const handleRefreshAll = useCallback(() => {
    refetchVendors();
    refetchRestaurants();
    refetchAllVendors();
    refetchAllRestaurants();
    showSuccessToast('Data refreshed');
  }, [refetchVendors, refetchRestaurants, refetchAllVendors, refetchAllRestaurants]);

  // Handler for tab changes with proper state reset
  const handleTabChange = useCallback((newTab) => {
    setActiveTab(newTab);
    setCurrentPage(1);
  }, []);

  // Handler for filter changes with proper state reset
  const handleFilterChange = useCallback((newFilter) => {
    setFilterStatus(newFilter);
    setCurrentPage(1);
  }, []);

  // Handler for search changes
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    // Current page reset is handled by the debounce effect
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterStatus('pending');
    setActiveTab('all');
    setCurrentPage(1);
  }, []);

  // Pagination
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-medium text-text-dark mb-2">
                Business Verification Management
              </h1>
              <p className="text-text-muted">
                Manage vendor and restaurant business entity verification
              </p>
            </div>

            <Button
              onClick={handleRefreshAll}
              variant="outline"
              className="flex items-center gap-2 bg-glass backdrop-blur-sm border border-white/20 text-text-dark px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-2xl font-semibold text-text-dark mb-1">
                {stats.total}
              </div>
              <div className="text-sm text-text-muted">Total Applications</div>
            </div>
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-2xl font-semibold text-amber-600 mb-1">
                {stats.pending}
              </div>
              <div className="text-sm text-text-muted">Pending Review</div>
            </div>
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-2xl font-semibold text-bottle-green mb-1">
                {stats.verified}
              </div>
              <div className="text-sm text-text-muted">Verified</div>
            </div>
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-2xl font-semibold text-text-dark mb-1">
                {stats.vendors}
              </div>
              <div className="text-sm text-text-muted">Vendors</div>
            </div>
            <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-4 border border-white/20">
              <div className="text-2xl font-semibold text-text-dark mb-1">
                {stats.restaurants}
              </div>
              <div className="text-sm text-text-muted">Restaurants</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Applications', icon: Filter },
              { key: 'vendors', label: 'Vendors', icon: Store },
              { key: 'restaurants', label: 'Restaurants', icon: Users },
            ].map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                onClick={() => handleTabChange(key)}
                variant={activeTab === key ? 'primary' : 'outline'}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-bottle-green text-white'
                    : 'text-text-dark hover:bg-bottle-green/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by business name, owner name, email..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg appearance-none cursor-pointer transition-all duration-300"
            >
              <option value="pending">Pending Only</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Unverified Only</option>
              <option value="all">All Status</option>
            </select>
          </div>
        </Card>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="large" text="Loading verification data..." />
          </div>
        ) : hasErrors ? (
          <div className="bg-tomato-red/5 backdrop-blur-sm border border-tomato-red/20 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-tomato-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-tomato-red" />
            </div>
            <h3 className="text-lg font-semibold text-tomato-red/90 mb-2">
              Failed to Load Data
            </h3>
            <p className="text-tomato-red/80 mb-6">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleRefreshAll}
                className="bg-tomato-red/90 hover:bg-tomato-red text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-tomato-red/30 text-tomato-red/80 hover:bg-tomato-red/5 px-6 py-3 rounded-xl font-medium transition-all duration-200"
              >
                Reload Page
              </Button>
            </div>
          </div>
        ) : paginatedData.length === 0 ? (
          <EmptyState
            icon={activeTab === 'vendors' ? Store : Users}
            title="No applications found"
            description="There are no applications matching your current filters."
            action={{
              label: 'Clear Filters',
              onClick: handleClearFilters,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {paginatedData.map((entity) => (
              <EntityCard
                key={`${entity.type}-${entity._id}`}
                entity={entity}
                type={entity.type}
                onToggleVerification={
                  entity.type === 'vendor'
                    ? handleVendorVerification
                    : handleRestaurantVerification
                }
                isVerificationLoading={
                  entity.type === 'vendor'
                    ? vendorToggleLoading
                    : restaurantToggleLoading
                }
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={displayData.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalManagementNew;
