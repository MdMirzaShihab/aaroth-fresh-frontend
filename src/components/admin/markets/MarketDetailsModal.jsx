import React from 'react';
import {
  MapPin,
  Users,
  Calendar,
  Edit,
  X,
  Check,
  AlertTriangle,
  Building2,
} from 'lucide-react';

// UI Components
import { Modal } from '../../ui/Modal';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';

// API Hooks
import { useGetMarketUsageStatsQuery } from '../../../store/slices/admin/adminApiSlice';

// Helper functions
import {
  formatMarketAddress,
  getMarketStatusColor,
  getMarketStatusLabel,
} from '../../../constants/markets';

const MarketDetailsModal = ({ isOpen, onClose, market, onEdit }) => {
  // Fetch usage stats for the market
  const {
    data: usageStatsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetMarketUsageStatsQuery(market?._id, {
    skip: !market?._id || !isOpen,
  });

  const usageStats = usageStatsData?.data || {};

  if (!market) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      className="overflow-hidden"
    >
      <div className="space-y-0">
        {/* Market Image Header */}
        <div className="relative h-64 w-full -mx-6 -mt-6 mb-6">
          {market.image ? (
            <img
              src={market.image}
              alt={market.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-mint-fresh/20 to-bottle-green/20 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-bottle-green/40" />
            </div>
          )}

          {/* Overlay with name */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end">
            <div className="p-6 w-full">
              <h2 className="text-3xl font-bold text-white mb-2">
                {market.name}
              </h2>
              {market.description && (
                <p className="text-white/90 text-sm line-clamp-2">
                  {market.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Market Info Section */}
        <div className="space-y-6 pb-6">
          {/* Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`px-4 py-2 rounded-xl text-sm font-medium ${getMarketStatusColor(
                market
              )}`}
            >
              {getMarketStatusLabel(market)}
            </span>

            {market.isActive && (
              <span className="px-4 py-2 rounded-xl text-sm font-medium bg-mint-fresh/20 text-bottle-green flex items-center gap-2">
                <Check className="w-4 h-4" />
                Active
              </span>
            )}

            {!market.isActive && (
              <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 flex items-center gap-2">
                <X className="w-4 h-4" />
                Inactive
              </span>
            )}

            {!market.isAvailable && market.flagReason && (
              <span className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-100 text-amber-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Flagged
              </span>
            )}
          </div>

          {/* Flag Reason (if flagged) */}
          {!market.isAvailable && market.flagReason && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-sm font-medium text-amber-900 mb-1">
                Flag Reason:
              </p>
              <p className="text-sm text-amber-800">{market.flagReason}</p>
              {market.flaggedAt && (
                <p className="text-xs text-amber-700 mt-2">
                  Flagged on {new Date(market.flaggedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Location Details */}
          <div className="bg-mint-fresh/5 rounded-2xl p-6 border border-mint-fresh/20">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-bottle-green" />
              <h3 className="text-lg font-semibold text-text-dark">Location</h3>
            </div>

            <div className="space-y-3">
              {market.location?.address && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Address
                  </p>
                  <p className="text-sm text-text-dark">
                    {market.location.address}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {market.location?.city && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">
                      City
                    </p>
                    <p className="text-sm font-semibold text-text-dark">
                      {market.location.city}
                    </p>
                  </div>
                )}

                {market.location?.district && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">
                      District
                    </p>
                    <p className="text-sm font-semibold text-text-dark">
                      {market.location.district}
                    </p>
                  </div>
                )}
              </div>

              {market.location?.coordinates &&
                market.location.coordinates.length === 2 && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">
                      Coordinates
                    </p>
                    <p className="text-sm text-text-dark font-mono">
                      {market.location.coordinates[1]},{' '}
                      {market.location.coordinates[0]}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-bottle-green/5 rounded-2xl p-6 border border-bottle-green/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-bottle-green" />
              <h3 className="text-lg font-semibold text-text-dark">
                Usage Statistics
              </h3>
            </div>

            {isLoadingStats ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : statsError ? (
              <div className="text-sm text-red-600">
                Failed to load usage statistics
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Total Vendors
                  </p>
                  <p className="text-2xl font-bold text-bottle-green">
                    {usageStats.totalVendors || 0}
                  </p>
                </div>

                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Active Vendors
                  </p>
                  <p className="text-2xl font-bold text-mint-fresh">
                    {usageStats.activeVendors || 0}
                  </p>
                </div>

                {usageStats.canDelete !== undefined && !usageStats.canDelete && (
                  <div className="col-span-2 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Cannot Delete Market
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          This market is currently assigned to{' '}
                          {usageStats.totalVendors || 0} vendor(s) and cannot be
                          deleted.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Information */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-text-dark">
                Audit Information
              </h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {market.createdAt && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">
                      Created
                    </p>
                    <p className="text-sm text-text-dark">
                      {new Date(market.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {market.createdBy?.name && (
                      <p className="text-xs text-text-muted mt-0.5">
                        by {market.createdBy.name}
                      </p>
                    )}
                  </div>
                )}

                {market.updatedAt && (
                  <div>
                    <p className="text-xs font-medium text-text-muted uppercase mb-1">
                      Last Updated
                    </p>
                    <p className="text-sm text-text-dark">
                      {new Date(market.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    {market.updatedBy?.name && (
                      <p className="text-xs text-text-muted mt-0.5">
                        by {market.updatedBy.name}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {market.slug && (
                <div>
                  <p className="text-xs font-medium text-text-muted uppercase mb-1">
                    Slug
                  </p>
                  <p className="text-sm text-text-dark font-mono">{market.slug}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                onEdit(market);
                onClose();
              }}
              className="bg-gradient-secondary text-white flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Market
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MarketDetailsModal;
