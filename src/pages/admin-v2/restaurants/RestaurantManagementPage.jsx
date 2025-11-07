import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Building2,
  MapPin,
  Shield,
  Users,
  BarChart3,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  Globe,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetAdminRestaurantsUnifiedQuery,
  useGetAdminRestaurantsStatsQuery,
} from '../../../store/slices/apiSlice';
import {
  formatAddress,
  formatDate,
} from '../../../services/admin-v2/restaurantsService';
import { Card } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import EmptyState from '../../../components/ui/EmptyState';
import RestaurantDirectory from '../../../components/admin/restaurants/RestaurantDirectory';
import RestaurantVerification from '../../../components/admin/restaurants/RestaurantVerification';
import OwnerManagerRelations from '../../../components/admin/restaurants/OwnerManagerRelations';
import RestaurantDetailsModal from './components/RestaurantDetailsModal';
import RestaurantEditModal from './components/RestaurantEditModal';
import RestaurantVerificationModal from './components/RestaurantVerificationModal';

const RestaurantManagementPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Modal states
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  
  const [filters, setFilters] = useState({
    search: '',
    verificationStatus: 'all',
    cuisineType: 'all',
    activityLevel: 'all',
    urgencyLevel: 'all',
    location: '',
    hasManagers: undefined,
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // RTK Query hooks
  const {
    data: restaurantsData,
    isLoading: isLoadingRestaurants,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useGetAdminRestaurantsUnifiedQuery(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetAdminRestaurantsStatsQuery();

  // Transform restaurants data to ensure compatibility with cards
  const restaurants = (restaurantsData?.data || []).map((restaurant) => ({
    ...restaurant,
    id: restaurant._id || restaurant.id, // Ensure id field exists
    location: restaurant.address ? formatAddress(restaurant.address) : (restaurant.location || 'Not provided'),
    email: restaurant.userId?.email || restaurant.email || 'Not provided',
    phone: restaurant.userId?.phone || restaurant.phone || 'Not provided',
    cuisineType: restaurant.cuisineTypes?.join(', ') || restaurant.cuisineType || 'Not specified',
  }));
  // Map backend response to expected frontend structure
  const backendStats = statsData?.data || {};
  const stats = {
    totalRestaurants: backendStats.totalRestaurants || 0,
    pendingVerification: backendStats.pendingRestaurants || 0,
    activeRestaurants: backendStats.activeRestaurants || 0,
    inactiveRestaurants: backendStats.inactiveRestaurants || 0,
    approvedRestaurants: backendStats.approvedRestaurants || 0,
    rejectedRestaurants: backendStats.rejectedRestaurants || 0,
    totalManagers: backendStats.totalManagers || 0,
    avgManagersPerRestaurant: backendStats.avgManagersPerRestaurant || 0,
    topCities: backendStats.topCities || [],
    averageOrderValue: 0, // Not implemented yet
    monthlyGrowth: 0, // Not implemented yet
    verificationQueue: [], // Not implemented yet
  };

  // Tab configuration
  const tabs = [
    {
      id: 'directory',
      label: 'Restaurant Directory',
      icon: Building2,
      description: 'Browse and manage all restaurants',
      badge: stats.totalRestaurants || 0,
    },
    {
      id: 'verification',
      label: 'Verification Queue',
      icon: Shield,
      description: 'Review pending verifications',
      badge: stats.pendingVerification || 0,
      urgent: stats.pendingVerification > 0,
    },
    {
      id: 'relations',
      label: 'Owners & Managers',
      icon: Users,
      description: 'View restaurant ownership and manager assignments',
      badge: stats.totalManagers || 0,
    },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // Reset tab-specific filters
    if (tabId === 'verification') {
      setFilters((prev) => ({
        ...prev,
        verificationStatus: 'pending',
        sortBy: 'createdAt',
        sortOrder: 'asc',
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        verificationStatus: 'all',
      }));
    }
  };

  const handleRefresh = () => {
    refetchRestaurants();
    refetchStats();
  };

  // Modal handlers
  const handleRestaurantDetails = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDetailsModal(true);
  };

  const handleRestaurantEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleRestaurantVerification = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowVerificationModal(true);
  };

  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowVerificationModal(false);
    setSelectedRestaurant(null);
  };

  if (isLoadingStats && isLoadingRestaurants) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-muted-olive to-earthy-brown bg-clip-text text-transparent">
              Restaurant Management
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              Comprehensive restaurant directory with location mapping,
              verification workflows, and relationship management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingRestaurants || isLoadingStats}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingRestaurants || isLoadingStats ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="p-4 glass glow-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-muted-olive">
                  {stats.totalRestaurants}
                </p>
                <p className="text-xs text-sage-green mt-1">
                  +{stats.monthlyGrowth || 0}% this month
                </p>
              </div>
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-muted-olive" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Pending Verification
                </p>
                <p className="text-2xl font-bold text-earthy-yellow">
                  {stats.pendingVerification}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Requires attention
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  stats.pendingVerification > 0
                    ? 'bg-earthy-yellow/10'
                    : 'bg-gray-100'
                }`}
              >
                <Shield
                  className={`w-6 h-6 ${
                    stats.pendingVerification > 0
                      ? 'text-earthy-yellow'
                      : 'text-gray-400'
                  }`}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Active Restaurants
                </p>
                <p className="text-2xl font-bold text-text-dark">
                  {stats.activeRestaurants}
                </p>
                <p className="text-xs text-sage-green mt-1">
                  {stats.totalRestaurants > 0
                    ? Math.round(
                        (stats.activeRestaurants / stats.totalRestaurants) * 100
                      )
                    : 0}
                  % active rate
                </p>
              </div>
              <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-sage-green" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Total Managers
                </p>
                <p className="text-2xl font-bold text-text-dark">
                  {stats.totalManagers}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Across all restaurants
                </p>
              </div>
              <div className="w-12 h-12 bg-earthy-brown/10 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-earthy-brown" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Location Insights */}
        {stats.topCities && stats.topCities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 glass">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-muted-olive" />
                <h3 className="text-lg font-semibold text-text-dark">
                  Top Locations
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {stats.topCities.slice(0, 6).map((city, index) => (
                  <div
                    key={city.name || index}
                    className="text-center p-3 rounded-2xl bg-earthy-beige/20 hover:bg-earthy-beige/30 transition-colors cursor-pointer"
                    onClick={() => setLocationFilter(city.name)}
                  >
                    <p className="font-semibold text-text-dark text-sm">
                      {city.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {city.count} restaurants
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-2 glass">
            <div className="flex flex-col lg:flex-row gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex-1 p-4 rounded-2xl transition-all duration-300 text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg scale-[1.02]'
                      : 'hover:bg-earthy-beige/20 text-text-dark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <tab.icon
                        className={`w-5 h-5 ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'text-muted-olive'
                        }`}
                      />
                      <div>
                        <h3
                          className={`font-semibold ${
                            activeTab === tab.id
                              ? 'text-white'
                              : 'text-text-dark'
                          }`}
                        >
                          {tab.label}
                        </h3>
                        <p
                          className={`text-sm ${
                            activeTab === tab.id
                              ? 'text-white/80'
                              : 'text-text-muted'
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {tab.urgent && (
                        <AlertCircle className="w-4 h-4 text-earthy-yellow animate-pulse" />
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white'
                            : tab.urgent
                              ? 'bg-earthy-yellow/20 text-earthy-yellow'
                              : 'bg-muted-olive/10 text-muted-olive'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'directory' && (
              <RestaurantDirectory
                restaurants={restaurants}
                isLoading={isLoadingRestaurants}
                error={restaurantsError}
                filters={filters}
                onFiltersChange={setFilters}
                stats={stats}
                locationFilter={locationFilter}
                onLocationFilterChange={setLocationFilter}
                onRestaurantDetails={handleRestaurantDetails}
                onRestaurantEdit={handleRestaurantEdit}
                onRestaurantVerification={handleRestaurantVerification}
              />
            )}

            {activeTab === 'verification' && (
              <RestaurantVerification
                restaurants={restaurants.filter(
                  (r) => r.verificationStatus === 'pending'
                )}
                isLoading={isLoadingRestaurants}
                error={restaurantsError}
                filters={filters}
                onFiltersChange={setFilters}
                stats={stats}
                onRefresh={handleRefresh}
              />
            )}

            {activeTab === 'relations' && (
              <OwnerManagerRelations
                restaurants={restaurants}
                isLoading={isLoadingRestaurants}
                error={restaurantsError}
                filters={filters}
                onFiltersChange={setFilters}
                stats={stats}
                onRefresh={handleRefresh}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error State */}
        {(restaurantsError || statsError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 border-tomato-red/20 bg-tomato-red/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-tomato-red" />
                <div>
                  <h3 className="font-semibold text-tomato-red">
                    Error Loading Data
                  </h3>
                  <p className="text-sm text-tomato-red/80 mt-1">
                    {restaurantsError?.data?.message ||
                      statsError?.data?.message ||
                      'Failed to load restaurant data. Please try refreshing the page.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-3 border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Restaurant Modals */}
      {selectedRestaurant && (
        <>
          <RestaurantDetailsModal
            restaurant={selectedRestaurant}
            isOpen={showDetailsModal}
            onClose={closeAllModals}
          />
          <RestaurantEditModal
            restaurant={selectedRestaurant}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRestaurant(null);
              handleRefresh(); // Refresh data after edit
            }}
          />
          <RestaurantVerificationModal
            restaurant={selectedRestaurant}
            isOpen={showVerificationModal}
            onClose={() => {
              setShowVerificationModal(false);
              setSelectedRestaurant(null);
              handleRefresh(); // Refresh data after verification update
            }}
          />
        </>
      )}
    </div>
  );
};

export default RestaurantManagementPage;