import React from 'react';
import { MapPin, TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils';

/**
 * MarketBreakdown Component
 * Displays per-market performance statistics for vendors
 *
 * @param {Array} marketBreakdown - Array of market statistics
 * @param {boolean} isLoading - Loading state
 */
const MarketBreakdown = ({ marketBreakdown = [], isLoading = false }) => {
  // Helper function for activation rate color coding
  const getActivationRateColor = (rate) => {
    if (rate >= 80) return 'text-sage-green'; // Green - High
    if (rate >= 50) return 'text-earthy-yellow'; // Yellow - Medium
    return 'text-tomato-red'; // Red - Low
  };

  const getActivationRateBgColor = (rate) => {
    if (rate >= 80) return 'bg-sage-green/10 border-sage-green/20';
    if (rate >= 50) return 'bg-earthy-yellow/10 border-earthy-yellow/20';
    return 'bg-tomato-red/10 border-tomato-red/20';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!marketBreakdown || marketBreakdown.length === 0) {
    return (
      <Card className="p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-dark mb-2">
          No Market Data Available
        </h3>
        <p className="text-text-muted">
          Market performance data will appear here once you have listings in different markets.
        </p>
      </Card>
    );
  }

  // Sort markets by revenue (highest first)
  const sortedMarkets = [...marketBreakdown].sort(
    (a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0)
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-dark flex items-center gap-2">
            <MapPin className="w-6 h-6 text-muted-olive" />
            Performance by Market
          </h2>
          <p className="text-text-muted mt-1">
            Track your business performance across different market locations
          </p>
        </div>
      </div>

      {/* Market Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedMarkets.map((market) => (
          <Card
            key={market.marketId}
            className="p-6 hover:shadow-lg transition-all duration-200 animate-fade-in"
          >
            {/* Market Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-text-dark mb-1">
                  {market.marketName}
                </h3>
                <div className="flex items-center gap-1 text-sm text-text-muted">
                  <MapPin className="w-3 h-3" />
                  <span>{market.marketCity}</span>
                </div>
              </div>

              {/* Activation Rate Badge */}
              <div
                className={`px-3 py-1 rounded-full border ${getActivationRateBgColor(market.activationRate)}`}
              >
                <span
                  className={`text-sm font-semibold ${getActivationRateColor(market.activationRate)}`}
                >
                  {market.activationRate}%
                </span>
              </div>
            </div>

            {/* Market Statistics */}
            <div className="space-y-3">
              {/* Listings */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <Package className="w-4 h-4" />
                  <span className="text-sm">Listings</span>
                </div>
                <span className="font-semibold text-text-dark">
                  {market.activeListings} / {market.totalListings}
                  <span className="text-xs text-text-muted ml-1">active</span>
                </span>
              </div>

              {/* Revenue */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">Revenue</span>
                </div>
                <span className="font-semibold text-muted-olive">
                  {formatCurrency(market.totalRevenue || 0)}
                </span>
              </div>

              {/* Orders */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="text-sm">Orders</span>
                </div>
                <span className="font-semibold text-text-dark">
                  {market.totalOrders || 0}
                </span>
              </div>

              {/* Quantity Sold */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-text-muted">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Quantity Sold</span>
                </div>
                <span className="font-semibold text-text-dark">
                  {market.totalQuantitySold || 0} units
                </span>
              </div>
            </div>

            {/* Performance Indicator */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      market.activationRate >= 80
                        ? 'bg-sage-green'
                        : market.activationRate >= 50
                        ? 'bg-earthy-yellow'
                        : 'bg-tomato-red'
                    }`}
                    style={{ width: `${market.activationRate}%` }}
                  ></div>
                </div>
                <span className="text-xs text-text-muted whitespace-nowrap">
                  Activation Rate
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      {sortedMarkets.length > 1 && (
        <Card className="p-6 bg-gradient-to-br from-muted-olive/5 to-sage-green/5">
          <h3 className="text-lg font-semibold text-text-dark mb-4">
            Overall Market Performance
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-olive">
                {sortedMarkets.length}
              </p>
              <p className="text-sm text-text-muted">Markets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-olive">
                {sortedMarkets.reduce((sum, m) => sum + (m.totalListings || 0), 0)}
              </p>
              <p className="text-sm text-text-muted">Total Listings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-olive">
                {formatCurrency(
                  sortedMarkets.reduce((sum, m) => sum + (m.totalRevenue || 0), 0)
                )}
              </p>
              <p className="text-sm text-text-muted">Total Revenue</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-muted-olive">
                {sortedMarkets.reduce((sum, m) => sum + (m.totalOrders || 0), 0)}
              </p>
              <p className="text-sm text-text-muted">Total Orders</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default MarketBreakdown;
