import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  Edit,
  Trash2,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  Users,
  Image as ImageIcon,
  MapPin,
  LayoutGrid,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

// API Slices
import {
  useSafeDeleteMarketMutation,
  useToggleMarketAvailabilityMutation,
} from '../../../store/slices/admin/adminApiSlice';

// Helper functions
import {
  formatMarketAddress,
  getMarketStatusColor,
  getMarketStatusLabel,
} from '../../../constants/markets';

const MarketDirectoryTable = ({
  markets = [],
  isLoading,
  pagination = {},
  selectedMarkets = [],
  onSelectMarkets,
  onEdit,
  onView,
  onPageChange,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState('cards'); // 'table' or 'cards'
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // ========================================
  // RTK QUERY MUTATIONS
  // ========================================

  const [deleteMarket] = useSafeDeleteMarketMutation();
  const [toggleAvailability] = useToggleMarketAvailabilityMutation();

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectMarkets(markets.map((market) => market._id));
    } else {
      onSelectMarkets([]);
    }
  };

  const handleSelectMarket = (marketId) => {
    if (selectedMarkets.includes(marketId)) {
      onSelectMarkets(selectedMarkets.filter((id) => id !== marketId));
    } else {
      onSelectMarkets([...selectedMarkets, marketId]);
    }
  };

  const handleDeleteMarket = async (market) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${market.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(market._id);
      await deleteMarket({ id: market._id }).unwrap();
      toast.success('Market deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error?.data?.message ||
          'Failed to delete market. It may be assigned to vendors.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (market) => {
    const willBeFlagged = market.isAvailable; // Currently available -> will be flagged

    // If flagging (disabling), require a reason
    if (willBeFlagged) {
      const flagReason = window.prompt(
        `Please provide a reason for flagging "${market.name}":`,
        ''
      );

      if (flagReason === null) {
        // User cancelled
        return;
      }

      if (!flagReason || flagReason.trim() === '') {
        toast.error('Flag reason is required when disabling availability');
        return;
      }

      try {
        setTogglingId(market._id);
        await toggleAvailability({
          id: market._id,
          isAvailable: false,
          flagReason: flagReason.trim(),
        }).unwrap();
        toast.success('Market flagged successfully');
        onRefresh();
      } catch (error) {
        console.error('Toggle error:', error);
        toast.error(error?.data?.message || 'Failed to flag market');
      } finally {
        setTogglingId(null);
      }
    } else {
      // Unflagging (enabling) - no reason required
      try {
        setTogglingId(market._id);
        await toggleAvailability({
          id: market._id,
          isAvailable: true,
        }).unwrap();
        toast.success('Market unflagged successfully');
        onRefresh();
      } catch (error) {
        console.error('Toggle error:', error);
        toast.error(error?.data?.message || 'Failed to unflag market');
      } finally {
        setTogglingId(null);
      }
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (isLoading) {
    return (
      <Card className="p-8 glass">
        <LoadingSpinner />
        <p className="text-center text-text-muted mt-4">Loading markets...</p>
      </Card>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  if (!markets || markets.length === 0) {
    return (
      <Card className="p-12 glass text-center">
        <Building2 className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-dark mb-2">
          No Markets Found
        </h3>
        <p className="text-text-muted mb-6">
          Get started by creating your first market
        </p>
      </Card>
    );
  }

  // ========================================
  // TABLE VIEW
  // ========================================

  const isAllSelected =
    markets.length > 0 && selectedMarkets.length === markets.length;
  const isSomeSelected = selectedMarkets.length > 0 && !isAllSelected;

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-end">
        <div className="flex items-center bg-earthy-beige/20 rounded-2xl p-1">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
              viewMode === 'table'
                ? 'bg-white text-muted-olive shadow-sm'
                : 'text-text-muted hover:text-text-dark'
            }`}
          >
            <List className="w-4 h-4" />
            Table
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm font-medium flex items-center gap-2 ${
              viewMode === 'cards'
                ? 'bg-white text-muted-olive shadow-sm'
                : 'text-text-muted hover:text-text-dark'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Cards
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="overflow-hidden glass z-0 shadow-lg shadow-bottle-green/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-mint-fresh/10 to-bottle-green/10 border-b-2 border-bottle-green/20">
              <tr>
                <th className="px-6 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                  />
                </th>
                <th className="px-6 py-4 text-left w-20">
                  <span className="text-sm font-bold text-text-dark">Image</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-bold text-text-dark">Market Name</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-bold text-text-dark">Location</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-bold text-text-dark">Vendors</span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-sm font-bold text-text-dark">Status</span>
                </th>
                <th className="px-6 py-4 text-right">
                  <span className="text-sm font-bold text-text-dark">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {markets.map((market, index) => (
                <motion.tr
                  key={market._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-mint-fresh/5 transition-all duration-200"
                >
                  {/* Checkbox */}
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedMarkets.includes(market._id)}
                      onChange={() => handleSelectMarket(market._id)}
                      className="w-4 h-4 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                    />
                  </td>

                  {/* Image */}
                  <td className="px-6 py-4">
                    {market.image ? (
                      <div className="w-20 h-16 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm">
                        <img
                          src={market.image}
                          alt={market.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-16 rounded-xl bg-mint-fresh/10 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-bottle-green" />
                      </div>
                    )}
                  </td>

                  {/* Name & Description */}
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-text-dark">
                        {market.name}
                      </p>
                      {market.description && (
                        <p className="text-xs text-text-muted mt-1 line-clamp-1">
                          {market.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-bottle-green mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-text-dark">
                          {market.location?.city || 'N/A'}
                        </p>
                        {market.location?.address && (
                          <p className="text-xs text-text-muted line-clamp-1">
                            {market.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Vendor Count */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-bottle-green" />
                      <span className="text-sm font-semibold text-text-dark">
                        {market.vendorCount || 0}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getMarketStatusColor(
                        market
                      )}`}
                    >
                      {getMarketStatusLabel(market)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(market)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(market)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={market.isAvailable ? 'outline' : 'default'}
                        onClick={() => handleToggleAvailability(market)}
                        disabled={togglingId === market._id}
                        className="flex items-center gap-1"
                      >
                        {togglingId === market._id ? (
                          <LoadingSpinner size="sm" />
                        ) : market.isAvailable ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMarket(market)}
                        disabled={deletingId === market._id}
                        className="flex items-center gap-1"
                      >
                        {deletingId === market._id ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {markets.map((market, index) => (
          <motion.div
            key={market._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-5 glass z-0 shadow-md shadow-bottle-green/5">
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedMarkets.includes(market._id)}
                  onChange={() => handleSelectMarket(market._id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                />

                {/* Image */}
                <div className="flex-shrink-0">
                  {market.image ? (
                    <div className="w-20 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={market.image}
                        alt={market.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-16 rounded-xl bg-mint-fresh/10 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-bottle-green" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-dark">{market.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-bottle-green" />
                    <p className="text-sm text-text-muted">
                      {market.location?.city || 'N/A'}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-text-muted flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {market.vendorCount || 0} vendors
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${getMarketStatusColor(
                        market
                      )}`}
                    >
                      {getMarketStatusLabel(market)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => onView(market)}
                      className="flex-1 touch-target"
                    >
                      View
                    </Button>
                    <Button
                      size="md"
                      variant="outline"
                      onClick={() => onEdit(market)}
                      className="flex-1 touch-target"
                    >
                      Edit
                    </Button>
                    <Button
                      size="md"
                      variant="destructive"
                      onClick={() => handleDeleteMarket(market)}
                      disabled={deletingId === market._id}
                      className="touch-target"
                    >
                      {deletingId === market._id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="p-4 glass">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <p className="text-sm text-text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} markets
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center gap-1 touch-target"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`
                        min-w-[2.5rem] h-10 rounded-xl text-sm font-medium transition-all touch-target
                        ${
                          pagination.page === pageNum
                            ? 'bg-gradient-secondary text-white'
                            : 'text-text-muted hover:bg-white/50'
                        }
                      `}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="flex items-center gap-1 touch-target"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarketDirectoryTable;
