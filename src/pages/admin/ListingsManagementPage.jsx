import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Flag,
  MessageSquare,
  Star,
  DollarSign,
  MapPin,
  User,
  Calendar,
  Trash2,
  Edit,
  Archive,
  Shield,
  Grid,
  List,
  BarChart3,
  RefreshCw,
  Download,
  Upload,
  Zap,
  TrendingUp,
  Users,
  Building2,
  ChefHat,
  Image as ImageIcon,
  FileText,
  ExternalLink,
  Copy,
  Share,
} from 'lucide-react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';
import {
  useGetAdminListingsQuery,
  useGetAdminListingsStatsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useFlagListingMutation,
  useUnflagListingMutation,
  useBulkModerateMutation,
  useDeleteListingMutation,
} from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import FormField from '../../components/ui/FormField';
import ListingCard from '../../components/admin/listings/ListingCard';
import ListingListItem from '../../components/admin/listings/ListingListItem';
import ListingFilters from '../../components/admin/listings/ListingFilters';
import ListingDetailModal from '../../components/admin/listings/ListingDetailModal';
import BulkModerationBar from '../../components/admin/listings/BulkModerationBar';
import ModerationQueue from '../../components/admin/listings/ModerationQueue';
import ListingAnalytics from '../../components/admin/listings/ListingAnalytics';

const ListingsManagementPage = () => {
  const [viewMode, setViewMode] = useState('moderation'); // 'moderation', 'cards', 'list', 'analytics'
  const [selectedListings, setSelectedListings] = useState(new Set());
  const [listingDetailModalOpen, setListingDetailModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [moderationModalOpen, setModerationModalOpen] = useState(false);
  const [moderationType, setModerationAction] = useState(''); // 'approve', 'reject', 'flag'
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // 'pending', 'approved', 'rejected', 'flagged', 'all'
    category: 'all',
    vendor: '',
    priceRange: 'all',
    dateRange: 'all',
    quality: 'all', // Based on quality score
    priority: 'all', // 'high', 'medium', 'low'
    hasImages: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20,
  });

  // RTK Query hooks
  const {
    data: listingsData,
    isLoading: isLoadingListings,
    error: listingsError,
    refetch: refetchListings,
  } = useGetAdminListingsQuery(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetAdminListingsStatsQuery();

  // RTK Mutations
  const [approveListing] = useApproveListingMutation();
  const [rejectListing] = useRejectListingMutation();
  const [flagListing] = useFlagListingMutation();
  const [unflagListing] = useUnflagListingMutation();
  const [bulkModerate] = useBulkModerateMutation();
  const [deleteListing] = useDeleteListingMutation();

  const listings = listingsData?.data || [];
  const totalCount = listingsData?.total || 0;
  const currentPage = listingsData?.page || 1;
  const totalPages = listingsData?.pages || 1;
  const stats = statsData?.data || {
    totalListings: 0,
    pendingModeration: 0,
    approvedListings: 0,
    flaggedListings: 0,
    rejectedListings: 0,
    avgQualityScore: 0,
    moderationQueue: [],
    topCategories: [],
    recentActivity: [],
  };

  // Process listings for moderation queue
  const moderationQueue = useMemo(() => {
    return listings
      .filter(listing => listing.moderationStatus === 'pending' || listing.isFlagged)
      .sort((a, b) => {
        // Sort by priority: flagged first, then by creation date
        if (a.isFlagged && !b.isFlagged) return -1;
        if (!a.isFlagged && b.isFlagged) return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
  }, [listings]);

  // CSV export data
  const csvData = useMemo(() => {
    return listings.map(listing => ({
      ID: listing.id,
      Title: listing.title,
      'Vendor Name': listing.vendorName,
      Category: listing.category,
      Price: listing.price,
      Unit: listing.unit,
      'Moderation Status': listing.moderationStatus,
      'Quality Score': listing.qualityScore,
      'Is Flagged': listing.isFlagged ? 'Yes' : 'No',
      'Created Date': listing.createdAt,
      'Last Updated': listing.updatedAt,
    }));
  }, [listings]);

  const handleListingSelect = (listingId, selected) => {
    setSelectedListings(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(listingId);
      } else {
        newSet.delete(listingId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedListings.size === listings.length) {
      setSelectedListings(new Set());
    } else {
      setSelectedListings(new Set(listings.map(l => l.id)));
    }
  };

  const handleListingAction = (listing, action) => {
    setSelectedListing(listing);
    setModerationAction(action);
    setModerationModalOpen(true);
  };

  const handleViewListing = (listing) => {
    setSelectedListing(listing);
    setListingDetailModalOpen(true);
  };

  const handleModerationSubmit = async (actionData) => {
    try {
      const listingId = selectedListing.id;

      switch (moderationType) {
        case 'approve':
          await approveListing({
            id: listingId,
            notes: actionData.notes || '',
          }).unwrap();
          break;
        case 'reject':
          await rejectListing({
            id: listingId,
            reason: actionData.reason,
            notes: actionData.notes || '',
          }).unwrap();
          break;
        case 'flag':
          await flagListing({
            id: listingId,
            reason: actionData.reason,
            severity: actionData.severity,
            notes: actionData.notes || '',
          }).unwrap();
          break;
        case 'unflag':
          await unflagListing({
            id: listingId,
            notes: actionData.notes || '',
          }).unwrap();
          break;
      }

      setModerationModalOpen(false);
      setSelectedListing(null);
      refetchListings();
    } catch (error) {
      console.error('Moderation action failed:', error);
    }
  };

  const handleBulkAction = (actionType) => {
    setBulkActionType(actionType);
    setBulkActionModalOpen(true);
  };

  const handleBulkActionSubmit = async (actionData) => {
    try {
      await bulkModerate({
        listingIds: Array.from(selectedListings),
        action: bulkActionType,
        ...actionData,
      }).unwrap();
      
      setSelectedListings(new Set());
      setBulkActionModalOpen(false);
      refetchListings();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getModerationBadge = (status, isFlagged) => {
    if (isFlagged) {
      return { color: 'bg-tomato-red/10 text-tomato-red', label: 'Flagged', urgent: true };
    }
    
    const badges = {
      pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending Review', urgent: true },
      approved: { color: 'bg-sage-green/10 text-sage-green', label: 'Approved', urgent: false },
      rejected: { color: 'bg-tomato-red/10 text-tomato-red', label: 'Rejected', urgent: false },
    };
    return badges[status] || badges.pending;
  };

  const getQualityColor = (score) => {
    if (score >= 90) return 'text-sage-green';
    if (score >= 70) return 'text-muted-olive';
    if (score >= 50) return 'text-earthy-yellow';
    if (score >= 30) return 'text-amber-600';
    return 'text-tomato-red';
  };

  const getPriorityLevel = (listing) => {
    if (listing.isFlagged) return { level: 'high', color: 'text-tomato-red', label: 'High' };
    if (listing.qualityScore < 30) return { level: 'high', color: 'text-tomato-red', label: 'High' };
    if (listing.qualityScore < 50) return { level: 'medium', color: 'text-amber-600', label: 'Medium' };
    return { level: 'low', color: 'text-sage-green', label: 'Low' };
  };

  if (listingsError || statsError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load listings"
        description="There was an error loading listing data. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/10 to-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-muted-olive to-earthy-brown bg-clip-text text-transparent">
              Listings Management
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              Content moderation queue with quality scoring, bulk operations, and comprehensive listing oversight
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CSVLink
              data={csvData}
              filename={`listings-export-${new Date().toISOString().split('T')[0]}.csv`}
              className="flex items-center gap-2 px-4 py-2 bg-earthy-beige/20 hover:bg-earthy-beige/30 text-text-dark rounded-2xl transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </CSVLink>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchListings}
              disabled={isLoadingListings}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingListings ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="p-4 glass glow-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Listings</p>
                <p className="text-2xl font-bold text-muted-olive">{stats.totalListings}</p>
                <p className="text-xs text-sage-green mt-1">
                  {stats.approvedListings} approved
                </p>
              </div>
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-olive" />
              </div>
            </div>
          </Card>

          <Card className={`p-4 glass ${stats.pendingModeration > 0 ? 'border-amber-500/30' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Pending Review</p>
                <p className={`text-2xl font-bold ${stats.pendingModeration > 0 ? 'text-amber-600' : 'text-text-dark'}`}>
                  {stats.pendingModeration}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Need attention
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                stats.pendingModeration > 0 ? 'bg-amber-500/10' : 'bg-gray-100'
              }`}>
                <Clock className={`w-6 h-6 ${stats.pendingModeration > 0 ? 'text-amber-600' : 'text-gray-400'}`} />
                {stats.pendingModeration > 0 && (
                  <div className="absolute w-3 h-3 bg-amber-500 rounded-full animate-pulse -top-1 -right-1" />
                )}
              </div>
            </div>
          </Card>

          <Card className={`p-4 glass ${stats.flaggedListings > 0 ? 'border-tomato-red/30' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Flagged Items</p>
                <p className={`text-2xl font-bold ${stats.flaggedListings > 0 ? 'text-tomato-red' : 'text-text-dark'}`}>
                  {stats.flaggedListings}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Require review
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                stats.flaggedListings > 0 ? 'bg-tomato-red/10' : 'bg-gray-100'
              }`}>
                <Flag className={`w-6 h-6 ${stats.flaggedListings > 0 ? 'text-tomato-red animate-pulse' : 'text-gray-400'}`} />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Avg Quality</p>
                <p className={`text-2xl font-bold ${getQualityColor(stats.avgQualityScore)}`}>
                  {stats.avgQualityScore || 0}%
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Overall score
                </p>
              </div>
              <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                <Star className="w-6 h-6 text-sage-green" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-text-dark">{stats.rejectedListings}</p>
                <p className="text-xs text-text-muted mt-1">
                  Total rejected
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* View Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-2 glass">
            <div className="flex flex-col lg:flex-row gap-2">
              {[
                { id: 'moderation', label: 'Moderation Queue', icon: Shield, urgent: stats.pendingModeration + stats.flaggedListings },
                { id: 'cards', label: 'Card View', icon: Grid, urgent: 0 },
                { id: 'list', label: 'List View', icon: List, urgent: 0 },
                { id: 'analytics', label: 'Analytics', icon: BarChart3, urgent: 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex-1 p-4 rounded-2xl transition-all duration-300 text-left ${
                    viewMode === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg'
                      : 'hover:bg-earthy-beige/20 text-text-dark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <tab.icon className={`w-5 h-5 ${
                        viewMode === tab.id ? 'text-white' : 'text-muted-olive'
                      }`} />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                    {tab.urgent > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-earthy-yellow animate-pulse" />
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          viewMode === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-tomato-red/20 text-tomato-red'
                        }`}>
                          {tab.urgent}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Filters */}
        {viewMode !== 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ListingFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={listings.length}
              totalCount={totalCount}
              stats={stats}
            />
          </motion.div>
        )}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedListings.size > 0 && viewMode !== 'analytics' && (
            <BulkModerationBar
              selectedCount={selectedListings.size}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedListings(new Set())}
            />
          )}
        </AnimatePresence>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'analytics' ? (
              <ListingAnalytics stats={stats} listings={listings} />
            ) : viewMode === 'moderation' ? (
              <ModerationQueue
                queue={moderationQueue}
                isLoading={isLoadingListings}
                onViewListing={handleViewListing}
                onModerationAction={handleListingAction}
                getModerationBadge={getModerationBadge}
                getQualityColor={getQualityColor}
                getPriorityLevel={getPriorityLevel}
              />
            ) : (
              <>
                {/* Listings Content */}
                {isLoadingListings ? (
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : listings.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No listings found"
                    description="No listings match your current filters."
                    actionLabel="Clear Filters"
                    onAction={() => setFilters({
                      ...filters,
                      search: '',
                      status: 'all',
                      category: 'all',
                      vendor: '',
                      page: 1,
                    })}
                  />
                ) : (
                  <>
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing, index) => (
                          <ListingCard
                            key={listing.id}
                            listing={listing}
                            isSelected={selectedListings.has(listing.id)}
                            onSelect={handleListingSelect}
                            onView={handleViewListing}
                            onModerationAction={handleListingAction}
                            getModerationBadge={getModerationBadge}
                            getQualityColor={getQualityColor}
                            getPriorityLevel={getPriorityLevel}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <Card className="glass overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedListings.size === listings.length && listings.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
                              />
                              <span className="text-sm font-medium text-text-dark">
                                Select All
                              </span>
                            </label>
                            <span className="text-sm text-text-muted">
                              {selectedListings.size} of {listings.length} selected
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {listings.map((listing, index) => (
                            <ListingListItem
                              key={listing.id}
                              listing={listing}
                              isSelected={selectedListings.has(listing.id)}
                              onSelect={handleListingSelect}
                              onView={handleViewListing}
                              onModerationAction={handleListingAction}
                              getModerationBadge={getModerationBadge}
                              getQualityColor={getQualityColor}
                              getPriorityLevel={getPriorityLevel}
                              index={index}
                            />
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-text-muted">
                            Showing {(currentPage - 1) * filters.limit + 1} to{' '}
                            {Math.min(currentPage * filters.limit, totalCount)} of{' '}
                            {totalCount} listings
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1 || isLoadingListings}
                              onClick={() => setFilters({ ...filters, page: currentPage - 1 })}
                            >
                              Previous
                            </Button>

                            <span className="text-sm text-text-muted px-3">
                              Page {currentPage} of {totalPages}
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === totalPages || isLoadingListings}
                              onClick={() => setFilters({ ...filters, page: currentPage + 1 })}
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
          </motion.div>
        </AnimatePresence>

        {/* Listing Detail Modal */}
        <ListingDetailModal
          isOpen={listingDetailModalOpen}
          onClose={() => {
            setListingDetailModalOpen(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
          onModerationAction={(action) => {
            setListingDetailModalOpen(false);
            handleListingAction(selectedListing, action);
          }}
          getModerationBadge={getModerationBadge}
          getQualityColor={getQualityColor}
          getPriorityLevel={getPriorityLevel}
        />

        {/* Moderation Action Modal */}
        <ModerationActionModal
          isOpen={moderationModalOpen}
          onClose={() => {
            setModerationModalOpen(false);
            setSelectedListing(null);
          }}
          type={moderationType}
          listing={selectedListing}
          onSubmit={handleModerationSubmit}
        />

        {/* Bulk Action Modal */}
        <BulkModerationModal
          isOpen={bulkActionModalOpen}
          onClose={() => setBulkActionModalOpen(false)}
          actionType={bulkActionType}
          selectedCount={selectedListings.size}
          onSubmit={handleBulkActionSubmit}
        />
      </div>
    </div>
  );
};

// Moderation Action Modal Component
const ModerationActionModal = ({ isOpen, onClose, type, listing, onSubmit }) => {
  const [actionData, setActionData] = useState({});

  if (!isOpen || !listing) return null;

  const modalConfig = {
    approve: {
      title: 'Approve Listing',
      color: 'sage-green',
      icon: CheckCircle,
      description: 'This listing will be made public and available to customers.',
    },
    reject: {
      title: 'Reject Listing',
      color: 'tomato-red',
      icon: XCircle,
      description: 'This listing will be rejected and hidden from customers.',
    },
    flag: {
      title: 'Flag Listing',
      color: 'amber-500',
      icon: Flag,
      description: 'Mark this listing for further review and investigation.',
    },
    unflag: {
      title: 'Remove Flag',
      color: 'muted-olive',
      icon: Shield,
      description: 'Remove the flag from this listing.',
    },
  };

  const config = modalConfig[type] || modalConfig.approve;

  const handleSubmit = () => {
    onSubmit(actionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        {/* Listing Summary */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-200">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-text-dark truncate">{listing.title}</h4>
            <p className="text-sm text-text-muted">{listing.vendorName}</p>
            <p className="text-sm font-medium text-muted-olive">${listing.price}/{listing.unit}</p>
          </div>
        </div>

        {/* Action Description */}
        <div className={`p-4 rounded-2xl border ${
          config.color === 'tomato-red' ? 'bg-tomato-red/5 border-tomato-red/20' :
          config.color === 'amber-500' ? 'bg-amber-50 border-amber-200' :
          'bg-sage-green/5 border-sage-green/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              config.color === 'tomato-red' ? 'bg-tomato-red/10' :
              config.color === 'amber-500' ? 'bg-amber-100' :
              'bg-sage-green/10'
            }`}>
              <config.icon className={`w-4 h-4 ${
                config.color === 'tomato-red' ? 'text-tomato-red' :
                config.color === 'amber-500' ? 'text-amber-600' :
                'text-sage-green'
              }`} />
            </div>
            <p className="text-sm text-text-dark">{config.description}</p>
          </div>
        </div>

        {/* Form Fields */}
        {type === 'reject' && (
          <FormField label="Rejection Reason">
            <select
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
              required
            >
              <option value="">Select a reason</option>
              <option value="poor_quality">Poor Quality Images/Description</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="incorrect_information">Incorrect Information</option>
              <option value="duplicate_listing">Duplicate Listing</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="fake_product">Fake/Misleading Product</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        )}

        {type === 'flag' && (
          <>
            <FormField label="Flag Reason">
              <select
                value={actionData.reason || ''}
                onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
                required
              >
                <option value="">Select a reason</option>
                <option value="quality_concerns">Quality Concerns</option>
                <option value="pricing_issues">Pricing Issues</option>
                <option value="vendor_behavior">Vendor Behavior</option>
                <option value="customer_complaints">Customer Complaints</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="policy_review">Policy Review Required</option>
                <option value="other">Other</option>
              </select>
            </FormField>

            <FormField label="Severity Level">
              <select
                value={actionData.severity || 'medium'}
                onChange={(e) => setActionData({ ...actionData, severity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
              >
                <option value="low">Low - Minor concerns</option>
                <option value="medium">Medium - Moderate issues</option>
                <option value="high">High - Serious problems</option>
                <option value="critical">Critical - Immediate attention</option>
              </select>
            </FormField>
          </>
        )}

        <FormField label={type === 'approve' ? 'Approval Notes (Optional)' : 'Additional Notes'}>
          <textarea
            value={actionData.notes || ''}
            onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
            placeholder={
              type === 'approve' ? 'Any notes about the approval...' :
              type === 'reject' ? 'Explain the reasons for rejection...' :
              type === 'flag' ? 'Describe the specific concerns...' :
              'Any additional notes...'
            }
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 resize-none"
            required={type !== 'approve' && type !== 'unflag'}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`${
              config.color === 'tomato-red' ? 'bg-tomato-red hover:bg-tomato-red/90' :
              config.color === 'amber-500' ? 'bg-amber-500 hover:bg-amber-500/90' :
              'bg-sage-green hover:bg-sage-green/90'
            } text-white flex items-center gap-2`}
          >
            <config.icon className="w-4 h-4" />
            {config.title}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Bulk Moderation Modal Component
const BulkModerationModal = ({ isOpen, onClose, actionType, selectedCount, onSubmit }) => {
  const [actionData, setActionData] = useState({});

  if (!isOpen) return null;

  const actionConfig = {
    approve: {
      title: 'Bulk Approve Listings',
      description: `Approve ${selectedCount} selected listings?`,
      color: 'sage-green',
      icon: CheckCircle,
    },
    reject: {
      title: 'Bulk Reject Listings',
      description: `Reject ${selectedCount} selected listings?`,
      color: 'tomato-red',
      icon: XCircle,
      requiresReason: true,
    },
    flag: {
      title: 'Bulk Flag Listings',
      description: `Flag ${selectedCount} selected listings for review?`,
      color: 'amber-500',
      icon: Flag,
      requiresReason: true,
    },
    delete: {
      title: 'Bulk Delete Listings',
      description: `Permanently delete ${selectedCount} selected listings? This action cannot be undone.`,
      color: 'tomato-red',
      icon: Trash2,
      dangerous: true,
    },
  };

  const config = actionConfig[actionType] || actionConfig.approve;

  const handleSubmit = () => {
    onSubmit(actionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        <div className={`p-4 rounded-2xl ${config.dangerous ? 'bg-tomato-red/5 border border-tomato-red/20' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              config.dangerous ? 'bg-tomato-red/10' : 'bg-muted-olive/10'
            }`}>
              <config.icon className={`w-5 h-5 ${config.dangerous ? 'text-tomato-red' : 'text-muted-olive'}`} />
            </div>
            <div>
              <h4 className="font-semibold text-text-dark">{config.title}</h4>
              <p className="text-sm text-text-muted">{config.description}</p>
            </div>
          </div>
        </div>

        {config.requiresReason && (
          <FormField label={`${actionType === 'flag' ? 'Flag' : 'Rejection'} Reason`}>
            <select
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
              required
            >
              <option value="">Select a reason</option>
              <option value="quality_issues">Quality Issues</option>
              <option value="policy_violation">Policy Violation</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="duplicate_listings">Duplicate Listings</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        )}

        <FormField label="Bulk Action Notes">
          <textarea
            value={actionData.notes || ''}
            onChange={(e) => setActionData({ ...actionData, notes: e.target.value })}
            placeholder="Add notes for this bulk action..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 resize-none"
            required={config.requiresReason}
          />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`${config.dangerous ? 'bg-tomato-red hover:bg-tomato-red/90' : 'bg-muted-olive hover:bg-muted-olive/90'} text-white`}
          >
            {config.title}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ListingsManagementPage;