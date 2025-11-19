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
  Trash2,
} from 'lucide-react';
import {
  useUpdateBuyerStatusMutation,
  useDeactivateBuyerMutation,
  useSafeDeleteBuyerMutation,
  useFlagBuyerMutation,
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

const BuyerDirectory = ({
  buyers,
  isLoading,
  error,
  filters,
  onFiltersChange,
  stats,
  locationFilter,
  onLocationFilterChange,
  onBuyerDetails,
  onBuyerEdit,
  onBuyerVerification,
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'map'
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [flagModalData, setFlagModalData] = useState({
    isOpen: false,
    buyer: null,
  });
  const [deactivateModalData, setDeactivateModalData] = useState({
    isOpen: false,
    buyer: null,
  });
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    buyer: null,
  });
  const [chainGrouping, setChainGrouping] = useState(false);

  // RTK Mutations
  const [updateBuyerStatus] = useUpdateBuyerStatusMutation();
  const [deactivateBuyer] = useDeactivateBuyerMutation();
  const [safeDeleteBuyer] = useSafeDeleteBuyerMutation();
  const [flagBuyer] = useFlagBuyerMutation();

  // Group buyers by chains if enabled
  const processedBuyers = useMemo(() => {
    if (!chainGrouping) return buyers;

    const grouped = buyers.reduce((acc, buyer) => {
      const chainName = buyer.chainName || 'Independent';
      if (!acc[chainName]) {
        acc[chainName] = [];
      }
      acc[chainName].push(buyer);
      return acc;
    }, {});

    return Object.entries(grouped).map(([chainName, chainBuyers]) => ({
      isChain: true,
      chainName,
      buyers: chainBuyers,
      totalLocations: chainBuyers.length,
      totalOrders: chainBuyers.reduce(
        (sum, r) => sum + (r.totalOrders || 0),
        0
      ),
      averageRating:
        chainBuyers.reduce((sum, r) => sum + (r.rating || 0), 0) /
        chainBuyers.length,
    }));
  }, [buyers, chainGrouping]);

  const handleBuyerClick = (buyer) => {
    if (onBuyerDetails) {
      onBuyerDetails(buyer);
    } else {
      // Fallback to original modal if callback not provided
      setSelectedBuyer(buyer);
      setProfileModalOpen(true);
    }
  };

  const handleStatusUpdate = async (buyerId, newStatus) => {
    try {
      await updateBuyerStatus({
        id: buyerId,
        status: newStatus,
      }).unwrap();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleFlagBuyer = (buyer) => {
    setFlagModalData({ isOpen: true, buyer });
    setActionMenuOpen(null);
  };

  const handleDeactivateBuyer = (buyer) => {
    setDeactivateModalData({ isOpen: true, buyer });
    setActionMenuOpen(null);
  };

  const handleDeactivateSubmit = async (deactivateData) => {
    try {
      await deactivateBuyer({
        id: deactivateData.buyer._id || deactivateData.buyer.id,
        reason: deactivateData.reason,
      }).unwrap();
      setDeactivateModalData({ isOpen: false, buyer: null });
    } catch (error) {
      console.error('Failed to deactivate buyer:', error);
    }
  };

  const handleDeleteBuyer = (buyer) => {
    setDeleteModalData({ isOpen: true, buyer });
    setActionMenuOpen(null);
  };

  const handleDeleteSubmit = async (deleteData) => {
    try {
      await safeDeleteBuyer({
        id: deleteData.buyer._id || deleteData.buyer.id,
        reason: deleteData.reason,
      }).unwrap();
      setDeleteModalData({ isOpen: false, buyer: null });
    } catch (error) {
      console.error('Failed to delete buyer:', error);
      // Error will be shown in modal if backend returns dependency info
    }
  };

  const handleFlagSubmit = async (flagData) => {
    try {
      await flagBuyer({
        id: flagData.buyer.id,
        reason: flagData.reason,
        details: flagData.details,
      }).unwrap();
      setFlagModalData({ isOpen: false, buyer: null });
    } catch (error) {
      console.error('Failed to flag buyer:', error);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load buyers"
        description="There was an error loading buyer data. Please try again."
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
                placeholder="Search buyers by name, cuisine, or location..."
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
              Showing {buyers.length} buyers
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
              <BuyerLocationMap
                buyers={buyers}
                onBuyerClick={handleBuyerClick}
                selectedLocation={locationFilter}
                onLocationSelect={onLocationFilterChange}
              />
            </motion.div>
          )}

          {/* Cards/List View */}
          {viewMode !== 'map' && (
            <>
              {buyers.length === 0 ? (
                <EmptyState
                  icon={Building2}
                  title="No buyers found"
                  description="No buyers match your current filters."
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
                  {processedBuyers.map((item, index) => (
                    <BuyerCard
                      key={item.isChain ? `chain-${item.chainName}` : item.id}
                      buyer={item}
                      viewMode={viewMode}
                      onBuyerClick={handleBuyerClick}
                      onBuyerEdit={onBuyerEdit}
                      onBuyerVerification={onBuyerVerification}
                      onStatusUpdate={handleStatusUpdate}
                      onFlag={handleFlagBuyer}
                      actionMenuOpen={actionMenuOpen}
                      setActionMenuOpen={setActionMenuOpen}
                      index={index}
                    />
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {buyers.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-text-muted">
                      Showing {(filters.page - 1) * filters.limit + 1} to{' '}
                      {Math.min(
                        filters.page * filters.limit,
                        stats.totalBuyers
                      )}{' '}
                      of {stats.totalBuyers} buyers
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
                          buyers.length < filters.limit || isLoading
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

      {/* Buyer Profile Modal */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedBuyer(null);
        }}
        title="Buyer Profile"
      >
        <div className="p-6">
          {selectedBuyer && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {selectedBuyer.name}
              </h3>
              <p className="text-gray-600">
                Buyer profile details would be displayed here.
              </p>
            </div>
          )}
        </div>
      </Modal>

      {/* Flag Buyer Modal */}
      <FlagBuyerModal
        isOpen={flagModalData.isOpen}
        onClose={() => setFlagModalData({ isOpen: false, buyer: null })}
        buyer={flagModalData.buyer}
        onSubmit={handleFlagSubmit}
      />

      {/* Deactivate Buyer Modal */}
      <DeactivateBuyerModal
        isOpen={deactivateModalData.isOpen}
        onClose={() => setDeactivateModalData({ isOpen: false, buyer: null })}
        buyer={deactivateModalData.buyer}
        onSubmit={handleDeactivateSubmit}
      />

      {/* Delete Buyer Modal */}
      <SafeDeleteBuyerModal
        isOpen={deleteModalData.isOpen}
        onClose={() => setDeleteModalData({ isOpen: false, buyer: null })}
        buyer={deleteModalData.buyer}
        onSubmit={handleDeleteSubmit}
      />
    </div>
  );
};

// Buyer Card Component
const BuyerCard = ({
  buyer,
  viewMode,
  onBuyerClick,
  onBuyerEdit,
  onBuyerVerification,
  onStatusUpdate,
  onFlag,
  actionMenuOpen,
  setActionMenuOpen,
  index,
}) => {
  if (buyer.isChain) {
    return (
      <ChainCard
        chain={buyer}
        viewMode={viewMode}
        onBuyerClick={onBuyerClick}
        index={index}
      />
    );
  }

  const verificationBadge = getVerificationBadge(buyer.verificationStatus);
  const riskLevel = getRiskLevel(buyer.riskScore || 0);

  const cardContent = (
    <>
      {/* Buyer Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
            {buyer.businessName?.[0]?.toUpperCase() || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-dark truncate text-lg">
              {buyer.businessName}
            </h3>
            <p className="text-text-muted text-sm flex items-center gap-1">
              <ChefHat className="w-3 h-3" />
              {buyer.cuisineType || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Action Menu */}
        <div className="relative">
          <button
            onClick={() =>
              setActionMenuOpen(
                actionMenuOpen === (buyer.id || buyer._id) ? null : (buyer.id || buyer._id)
              )
            }
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>

          {actionMenuOpen === (buyer.id || buyer._id) && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 min-w-48">
              <div className="py-2">
                <button
                  onClick={() => {
                    setActionMenuOpen(null);
                    onBuyerClick(buyer);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    setActionMenuOpen(null);
                    if (onBuyerEdit) {
                      onBuyerEdit(buyer);
                    } else {
                      onBuyerClick(buyer);
                    }
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
                {buyer.verificationStatus === 'pending' && onBuyerVerification && (
                  <button
                    onClick={() => {
                      setActionMenuOpen(null);
                      onBuyerVerification(buyer);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-blue-600"
                  >
                    <Shield className="w-4 h-4" />
                    Verify Buyer
                  </button>
                )}
                <hr className="my-2" />
                {buyer.isActive ? (
                  <button
                    onClick={() => handleDeactivateBuyer(buyer)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-amber-600"
                  >
                    <Ban className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => onStatusUpdate(buyer.id, 'active')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-sage-green"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => onFlag(buyer)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-tomato-red"
                >
                  <Flag className="w-4 h-4" />
                  Flag Buyer
                </button>
                <hr className="my-2" />
                <button
                  onClick={() => handleDeleteBuyer(buyer)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-tomato-red"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Buyer
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
        {buyer.isActive ? (
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

      {/* Buyer Info */}
      <div className="space-y-3 mb-4">
        {buyer.location && (
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{buyer.location}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Phone className="w-4 h-4" />
          <span>{buyer.phone || 'Not provided'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Mail className="w-4 h-4" />
          <span className="truncate">{buyer.email || 'Not provided'}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-lg font-bold text-text-dark">
            {buyer.totalOrders || 0}
          </p>
          <p className="text-xs text-text-muted">Total Orders</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-text-dark">
            ${buyer.averageOrderValue || 0}
          </p>
          <p className="text-xs text-text-muted">Avg Order Value</p>
        </div>
      </div>

      {/* Manager Info */}
      {buyer.managersCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Users className="w-4 h-4" />
          <span>
            {buyer.managersCount} manager
            {buyer.managersCount !== 1 ? 's' : ''}
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
          onClick={() => onBuyerClick(buyer)}
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
        onClick={() => onBuyerClick(buyer)}
      >
        {cardContent}
      </Card>
    </motion.div>
  );
};

// Chain Card Component
const ChainCard = ({ chain, viewMode, onBuyerClick, index }) => {
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
            {chain.buyers.map((buyer) => (
              <div
                key={buyer.id}
                onClick={() => onBuyerClick(buyer)}
                className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text-dark">
                      {buyer.businessName}
                    </p>
                    <p className="text-sm text-text-muted">
                      {buyer.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {buyer.totalOrders} orders
                    </p>
                    <p className="text-xs text-text-muted">
                      ${buyer.averageOrderValue}
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

// Flag Buyer Modal Component
const FlagBuyerModal = ({ isOpen, onClose, buyer, onSubmit }) => {
  const [flagData, setFlagData] = useState({
    reason: '',
    details: '',
    severity: 'medium',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...flagData, buyer });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Flag Buyer" size="md">
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
            Flag Buyer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Deactivate Buyer Modal Component
const DeactivateBuyerModal = ({ isOpen, onClose, buyer, onSubmit }) => {
  const [deactivateData, setDeactivateData] = useState({
    reason: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...deactivateData, buyer });
    setDeactivateData({ reason: '' }); // Reset form
  };

  if (!isOpen || !buyer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deactivate Buyer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900 mb-1">
                Deactivating {buyer.name || buyer.businessName}
              </h4>
              <p className="text-sm text-amber-800">
                This buyer will be temporarily deactivated and cannot accept new orders until reactivated.
                Existing orders will continue to be processed.
              </p>
            </div>
          </div>
        </div>

        <FormField label="Reason for Deactivation" required>
          <textarea
            value={deactivateData.reason}
            onChange={(e) =>
              setDeactivateData({ ...deactivateData, reason: e.target.value })
            }
            placeholder="Explain why this buyer is being deactivated..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-amber-500/20 resize-none"
            required
            minLength={10}
          />
          <p className="text-xs text-text-muted mt-1">
            Minimum 10 characters required
          </p>
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Deactivate Buyer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Safe Delete Buyer Modal Component
const SafeDeleteBuyerModal = ({ isOpen, onClose, buyer, onSubmit }) => {
  const [deleteData, setDeleteData] = useState({
    reason: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...deleteData, buyer });
    setDeleteData({ reason: '' }); // Reset form
  };

  if (!isOpen || !buyer) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Buyer" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-tomato-red/10 border border-tomato-red/30 rounded-2xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-tomato-red flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-tomato-red mb-1">
                Permanently Delete {buyer.name || buyer.businessName}?
              </h4>
              <p className="text-sm text-tomato-red/80">
                This action cannot be undone. The buyer will be soft-deleted and can only be restored by system administrators.
                This operation will fail if there are incomplete orders or active dependencies.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
          <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Safety Checks
          </h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Verifies no incomplete orders
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Checks for active dependencies
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              Soft delete (data preserved)
            </li>
          </ul>
        </div>

        <FormField label="Reason for Deletion (Optional)">
          <textarea
            value={deleteData.reason}
            onChange={(e) =>
              setDeleteData({ ...deleteData, reason: e.target.value })
            }
            placeholder="Explain why this buyer is being deleted..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-tomato-red/20 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-text-muted mt-1">
            Optional: 3-500 characters
          </p>
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-tomato-red hover:bg-tomato-red/90 text-white"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Buyer
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BuyerDirectory;
