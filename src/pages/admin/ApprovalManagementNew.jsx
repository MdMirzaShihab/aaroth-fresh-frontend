import React, { useState, useMemo } from 'react';
import {
  Store,
  Users,
  Filter,
  Search,
  RefreshCw,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import {
  useGetPendingVendorsQuery,
  useGetPendingRestaurantsQuery,
  useGetAllVendorsAdminQuery,
  useGetAllRestaurantsAdminQuery,
  useToggleVendorVerificationNewMutation,
  useToggleRestaurantVerificationNewMutation,
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
  const [filterStatus, setFilterStatus] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Query parameters
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      isVerified:
        filterStatus === 'verified'
          ? true
          : filterStatus === 'unverified'
            ? false
            : undefined,
    }),
    [currentPage, itemsPerPage, searchTerm, filterStatus]
  );

  // API Hooks - Get data based on active tab
  const {
    data: pendingVendors,
    isLoading: vendorsLoading,
    refetch: refetchVendors,
  } = useGetPendingVendorsQuery(queryParams, {
    skip: activeTab === 'restaurants',
  });

  const {
    data: pendingRestaurants,
    isLoading: restaurantsLoading,
    refetch: refetchRestaurants,
  } = useGetPendingRestaurantsQuery(queryParams, {
    skip: activeTab === 'vendors',
  });

  const {
    data: allVendors,
    isLoading: allVendorsLoading,
    refetch: refetchAllVendors,
  } = useGetAllVendorsAdminQuery(queryParams, {
    skip: activeTab !== 'vendors' || filterStatus === 'pending',
  });

  const {
    data: allRestaurants,
    isLoading: allRestaurantsLoading,
    refetch: refetchAllRestaurants,
  } = useGetAllRestaurantsAdminQuery(queryParams, {
    skip: activeTab !== 'restaurants' || filterStatus === 'pending',
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
        (filterStatus === 'verified' && entity.isVerified) ||
        (filterStatus === 'unverified' && !entity.isVerified) ||
        (filterStatus === 'pending' && !entity.isVerified);

      return matchesSearch && matchesFilter;
    });
  };

  const displayData = getDisplayData();
  const isLoading =
    vendorsLoading ||
    restaurantsLoading ||
    allVendorsLoading ||
    allRestaurantsLoading;

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

  // Event handlers
  const handleVendorVerification = async ({ id, isVerified, reason }) => {
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
      refetchVendors();
      refetchAllVendors();
    } catch (error) {
      showVerificationErrorToast(
        'vendor',
        isVerified ? 'verify' : 'revoke',
        error
      );
    }
  };

  const handleRestaurantVerification = async ({ id, isVerified, reason }) => {
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
      refetchRestaurants();
      refetchAllRestaurants();
    } catch (error) {
      showVerificationErrorToast(
        'restaurant',
        isVerified ? 'verify' : 'revoke',
        error
      );
    }
  };

  const handleRefreshAll = () => {
    refetchVendors();
    refetchRestaurants();
    refetchAllVendors();
    refetchAllRestaurants();
    showSuccessToast('Data refreshed');
  };

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
                onClick={() => {
                  setActiveTab(key);
                  setCurrentPage(1);
                }}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
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
            <LoadingSpinner size="large" />
          </div>
        ) : paginatedData.length === 0 ? (
          <EmptyState
            icon={activeTab === 'vendors' ? Store : Users}
            title="No applications found"
            description="There are no applications matching your current filters."
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchTerm('');
                setFilterStatus('pending');
                setActiveTab('all');
                setCurrentPage(1);
              },
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
