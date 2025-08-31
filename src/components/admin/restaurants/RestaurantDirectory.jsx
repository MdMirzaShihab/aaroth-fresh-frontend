import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Building2,
  Phone,
  Mail,
  Clock,
  Star,
  TrendingUp,
  TrendingDown,
  Shield,
  Users,
  ChefHat,
  MoreVertical,
  Eye,
  Edit,
  Flag,
  Ban,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Grid,
  List,
  MapIcon,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  useUpdateRestaurantStatusMutation,
  useFlagRestaurantMutation,
} from '../../../store/slices/apiSlice';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from '../../ui/EmptyState';
import SearchBar from '../../ui/SearchBar';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';

// Utility functions
const getVerificationBadge = (status) => {
  const badges = {
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
    approved: { color: 'bg-sage-green/10 text-sage-green', label: 'Verified' },
    rejected: { color: 'bg-tomato-red/10 text-tomato-red', label: 'Rejected' },
  };
  return badges[status] || badges.pending;
};

const getRiskLevel = (score) => {
  if (score >= 70)
    return {
      color: 'text-tomato-red',
      label: 'High Risk',
      icon: AlertTriangle,
    };
  if (score >= 40)
    return {
      color: 'text-amber-600',
      label: 'Medium Risk',
      icon: AlertTriangle,
    };
  return { color: 'text-sage-green', label: 'Low Risk', icon: CheckCircle };
};

const RestaurantDirectory = ({
  restaurants,
  isLoading,
  error,
  filters,
  onFiltersChange,
  stats,
  locationFilter,
  onLocationFilterChange,
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'map'
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [flagModalData, setFlagModalData] = useState({
    isOpen: false,
    restaurant: null,
  });
  const [chainGrouping, setChainGrouping] = useState(false);

  // RTK Mutations
  const [updateRestaurantStatus] = useUpdateRestaurantStatusMutation();
  const [flagRestaurant] = useFlagRestaurantMutation();

  // Group restaurants by chains if enabled
  const processedRestaurants = useMemo(() => {
    if (!chainGrouping) return restaurants;

    const grouped = restaurants.reduce((acc, restaurant) => {
      const chainName = restaurant.chainName || 'Independent';
      if (!acc[chainName]) {
        acc[chainName] = [];
      }
      acc[chainName].push(restaurant);
      return acc;
    }, {});

    return Object.entries(grouped).map(([chainName, chainRestaurants]) => ({
      isChain: true,
      chainName,
      restaurants: chainRestaurants,
      totalLocations: chainRestaurants.length,
      totalOrders: chainRestaurants.reduce(
        (sum, r) => sum + (r.totalOrders || 0),
        0
      ),
      averageRating:
        chainRestaurants.reduce((sum, r) => sum + (r.rating || 0), 0) /
        chainRestaurants.length,
    }));
  }, [restaurants, chainGrouping]);

  const handleRestaurantClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setProfileModalOpen(true);
  };

  const handleStatusUpdate = async (restaurantId, newStatus) => {
    try {
      await updateRestaurantStatus({
        id: restaurantId,
        status: newStatus,
      }).unwrap();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFlagRestaurant = (restaurant) => {
    setFlagModalData({ isOpen: true, restaurant });
    setActionMenuOpen(null);
  };

  const handleFlagSubmit = async (flagData) => {
    try {
      await flagRestaurant({
        id: flagData.restaurant.id,
        reason: flagData.reason,
        details: flagData.details,
      }).unwrap();
      setFlagModalData({ isOpen: false, restaurant: null });
    } catch (error) {
      console.error('Failed to flag restaurant:', error);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load restaurants"
        description="There was an error loading restaurant data. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <Card className="p-4 glass">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search and Location Filter */}
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <SearchBar
                value={filters.search}
                onChange={(value) =>
                  onFiltersChange({ ...filters, search: value, page: 1 })
                }
                placeholder="Search restaurants by name, cuisine, or location..."
                className="w-full"
              />
            </div>
            {locationFilter && (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted-olive/10 text-muted-olive rounded-2xl text-sm">
                <MapPin className="w-4 h-4" />
                <span>{locationFilter}</span>
                <button
                  onClick={() => onLocationFilterChange('')}
                  className="ml-2 hover:bg-white/50 rounded-full p-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-2">
            {/* Chain Grouping Toggle */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={chainGrouping}
                onChange={(e) => setChainGrouping(e.target.checked)}
                className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
              />
              <span className="text-text-dark">Group Chains</span>
            </label>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-earthy-beige/20 rounded-2xl p-1">
              {[
                { mode: 'cards', icon: Grid, label: 'Cards' },
                { mode: 'list', icon: List, label: 'List' },
                { mode: 'map', icon: MapIcon, label: 'Map' },
              ].map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200 ${
                    viewMode === mode
                      ? 'bg-white text-muted-olive shadow-sm'
                      : 'text-text-muted hover:text-text-dark'
                  }`}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mt-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600">
              Showing {restaurants.length} restaurants
            </p>
          </div>
        </div>
      </Card>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Map View */}
          {viewMode === 'map' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-[600px]"
            >
              <RestaurantLocationMap
                restaurants={restaurants}
                onRestaurantClick={handleRestaurantClick}
                selectedLocation={locationFilter}
                onLocationSelect={onLocationFilterChange}
              />
            </motion.div>
          )}

          {/* Cards/List View */}
          {viewMode !== 'map' && (
            <>
              {restaurants.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No restaurants found"
                  description="No restaurants match your current filters."
                  actionLabel="Clear Filters"
                  onAction={() =>
                    onFiltersChange({
                      ...filters,
                      search: '',
                      verificationStatus: 'all',
                      cuisineType: 'all',
                      activityLevel: 'all',
                      location: '',
                      page: 1,
                    })
                  }
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    viewMode === 'cards'
                      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {processedRestaurants.map((item, index) => (
                    <RestaurantCard
                      key={item.isChain ? `chain-${item.chainName}` : item.id}
                      restaurant={item}
                      viewMode={viewMode}
                      onRestaurantClick={handleRestaurantClick}
                      onStatusUpdate={handleStatusUpdate}
                      onFlag={handleFlagRestaurant}
                      actionMenuOpen={actionMenuOpen}
                      setActionMenuOpen={setActionMenuOpen}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {restaurants.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                      Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                      {Math.min(
                        filters.page * filters.limit,
                        stats.totalRestaurants
                      )}{' '}
                      of {stats.totalRestaurants} restaurants
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page === 1 || isLoading}
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            page: filters.page - 1,
                          })
                        }
                      >
                        Previous
                      </Button>

                      <span className="text-sm text-text-muted px-3">
                        Page {filters.page}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          restaurants.length < filters.limit || isLoading
                        }
                        onClick={() =>
                          onFiltersChange({
                            ...filters,
                            page: filters.page + 1,
                          })
                        }
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Restaurant Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedRestaurant(null);
        }}
        title="Restaurant Profile"
      >
        <div className="p-6">
          {selectedRestaurant && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {selectedRestaurant.name}
              </h3>
              <p className="text-gray-600">
                Restaurant profile details would be displayed here.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Flag Restaurant Modal */}
      <FlagRestaurantModal
        isOpen={flagModalData.isOpen}
        onClose={() => setFlagModalData({ isOpen: false, restaurant: null })}
        restaurant={flagModalData.restaurant}
        onSubmit={handleFlagSubmit}
      />
    </div>
  );
};

// Restaurant Card Component
const RestaurantCard = ({
  restaurant,
  viewMode,
  onRestaurantClick,
  onStatusUpdate,
  onFlag,
  actionMenuOpen,
  setActionMenuOpen,
  index,
}) => {
  if (restaurant.isChain) {
    return (
      <ChainCard
        chain={restaurant}
        viewMode={viewMode}
        onRestaurantClick={onRestaurantClick}
        index={index}
      />
    );
  }

  const verificationBadge = getVerificationBadge(restaurant.verificationStatus);
  const riskLevel = getRiskLevel(restaurant.riskScore || 0);

  const cardContent = (
    <>
      {/* Restaurant Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            {restaurant.businessName?.[0]?.toUpperCase() || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-dark truncate text-lg">
              {restaurant.businessName}
            </h3>
            <p className="text-text-muted text-sm flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              {restaurant.cuisineType || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() =>
              setActionMenuOpen(
                actionMenuOpen === restaurant.id ? null : restaurant.id
              )
            }
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>

          {actionMenuOpen === restaurant.id && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 min-w-48">
              <div className="py-2">
                <button
                  onClick={() => onRestaurantClick(restaurant)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => onRestaurantClick(restaurant)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                <hr className="my-2" />
                {restaurant.isActive ? (
                  <button
                    onClick={() => onStatusUpdate(restaurant.id, 'inactive')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-amber-600"
                  >
                    <Ban className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusUpdate(restaurant.id, 'active')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-sage-green"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => onFlag(restaurant)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-tomato-red"
                >
                  <Flag className="w-4 h-4" />
                  Flag Restaurant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${verificationBadge.color}`}
        >
          {verificationBadge.label}
        </span>
        {restaurant.isActive ? (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-sage-green/10 text-sage-green">
            Active
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
            Inactive
          </span>
        )}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 ${riskLevel.color}`}
        >
          <riskLevel.icon className="w-3 h-3 inline mr-1" />
          {riskLevel.label}
        </span>
      </div>

      {/* Restaurant Info */}
      <div className="space-y-3 mb-4">
        {restaurant.location && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{restaurant.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Phone className="w-4 h-4" />
          <span>{restaurant.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Mail className="w-4 h-4" />
          <span className="truncate">{restaurant.email || 'Not provided'}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-text-dark">
            {restaurant.totalOrders || 0}
          </p>
          <p className="text-xs text-text-muted">Total Orders</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-dark">
            ${restaurant.averageOrderValue || 0}
          </p>
          <p className="text-xs text-text-muted">Avg Order Value</p>
        </div>
      </div>

      {/* Manager Info */}
      {restaurant.managersCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Users className="w-4 h-4" />
          <span>
            {restaurant.managersCount} manager
            {restaurant.managersCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card
          className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer glass"
          onClick={() => onRestaurantClick(restaurant)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">{cardContent}</div>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className="p-6 hover:shadow-md transition-all duration-300 cursor-pointer glass glow-green"
        onClick={() => onRestaurantClick(restaurant)}
      >
        {cardContent}
      </Card>
    </motion.div>
  );
};

// Chain Card Component
const ChainCard = ({ chain, viewMode, onRestaurantClick, index }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="p-6 glass border-muted-olive/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-muted-olive to-sage-green rounded-2xl flex items-center justify-center text-white font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-text-dark text-lg">
                {chain.chainName}
              </h3>
              <p className="text-text-muted text-sm">Chain Network</p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-muted-olive hover:bg-muted-olive/10 p-2 rounded-xl transition-colors"
          >
            {expanded ? '−' : '+'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-muted-olive">
              {chain.totalLocations}
            </p>
            <p className="text-xs text-text-muted">Locations</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text-dark">
              {chain.totalOrders}
            </p>
            <p className="text-xs text-text-muted">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-text-dark">
              {chain.averageRating.toFixed(1)}
            </p>
            <p className="text-xs text-text-muted">Avg Rating</p>
          </div>
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 pt-4 border-t border-gray-100"
          >
            {chain.restaurants.map((restaurant) => (
              <div
                key={restaurant.id}
                onClick={() => onRestaurantClick(restaurant)}
                className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-dark">
                      {restaurant.businessName}
                    </p>
                    <p className="text-sm text-text-muted">
                      {restaurant.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {restaurant.totalOrders} orders
                    </p>
                    <p className="text-xs text-text-muted">
                      ${restaurant.averageOrderValue}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

// Flag Restaurant Modal Component
const FlagRestaurantModal = ({ isOpen, onClose, restaurant, onSubmit }) => {
  const [flagData, setFlagData] = useState({
    reason: '',
    details: '',
    severity: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...flagData, restaurant });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Flag Restaurant" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Reason for flagging">
          <select
            value={flagData.reason}
            onChange={(e) =>
              setFlagData({ ...flagData, reason: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-tomato-red/20"
            required
          >
            <option value="">Select a reason</option>
            <option value="fake_information">Fake Information</option>
            <option value="policy_violation">Policy Violation</option>
            <option value="suspicious_activity">Suspicious Activity</option>
            <option value="quality_issues">Quality Issues</option>
            <option value="other">Other</option>
          </select>
        </FormField>

        <FormField label="Severity Level">
          <select
            value={flagData.severity}
            onChange={(e) =>
              setFlagData({ ...flagData, severity: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-tomato-red/20"
          >
            <option value="low">Low - Minor issues</option>
            <option value="medium">Medium - Moderate concerns</option>
            <option value="high">High - Serious violations</option>
            <option value="critical">
              Critical - Immediate action required
            </option>
          </select>
        </FormField>

        <FormField label="Additional Details">
          <textarea
            value={flagData.details}
            onChange={(e) =>
              setFlagData({ ...flagData, details: e.target.value })
            }
            placeholder="Provide additional details about the issue..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-tomato-red/20 resize-none"
            required
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-tomato-red hover:bg-tomato-red/90 text-white"
          >
            Flag Restaurant
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RestaurantDirectory;
