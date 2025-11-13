import React from 'react';
import { BarChart3, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { Card } from '../../../../../components/ui/Card';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';

const ProductAnalytics = ({ stats, products, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="p-8 glass text-center">
        <LoadingSpinner size="lg" />
        <p className="text-text-muted mt-4">Loading analytics...</p>
      </Card>
    );
  }

  // Calculate category distribution
  const categoryDistribution = products.reduce((acc, product) => {
    const categoryName = product.category?.name || 'Uncategorized';
    acc[categoryName] = (acc[categoryName] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate status distribution
  const activeCount = products.filter((p) => p.isActive).length;
  const inactiveCount = products.filter((p) => !p.isActive).length;
  const flaggedCount = products.filter((p) => p.isFlagged).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Active Products
              </p>
              <p className="text-3xl font-bold text-sage-green mt-2">
                {activeCount}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {stats.totalProducts > 0
                  ? Math.round((activeCount / stats.totalProducts) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="w-16 h-16 bg-sage-green/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-sage-green" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Inactive Products
              </p>
              <p className="text-3xl font-bold text-text-dark mt-2">
                {inactiveCount}
              </p>
              <p className="text-xs text-text-muted mt-1">
                {stats.totalProducts > 0
                  ? Math.round((inactiveCount / stats.totalProducts) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">
                Flagged Products
              </p>
              <p className="text-3xl font-bold text-tomato-red mt-2">
                {flaggedCount}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Needs attention
              </p>
            </div>
            <div className="w-16 h-16 bg-tomato-red/10 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-tomato-red" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card className="p-6 glass">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-muted-olive" />
          <h3 className="text-lg font-semibold text-text-dark">
            Top Categories
          </h3>
        </div>

        <div className="space-y-4">
          {topCategories.length > 0 ? (
            topCategories.map(([category, count], index) => {
              const percentage =
                stats.totalProducts > 0
                  ? Math.round((count / stats.totalProducts) * 100)
                  : 0;

              return (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-dark">{category}</span>
                    <span className="text-text-muted">
                      {count} products ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-muted-olive to-sage-green transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-text-muted text-center py-8">
              No category data available
            </p>
          )}
        </div>
      </Card>

      {/* Performance Overview */}
      <Card className="p-6 glass">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Performance Overview
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-text-muted mb-2">Average Performance Score</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-muted-olive">
                {stats.averagePerformanceScore || 0}
              </p>
              <p className="text-xl text-text-muted mb-1">/100</p>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-earthy-yellow to-sage-green"
                style={{ width: `${stats.averagePerformanceScore || 0}%` }}
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-text-muted mb-2">Low Stock Alerts</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold text-earthy-yellow">
                {stats.lowStockProducts || 0}
              </p>
              <p className="text-xl text-text-muted mb-1">products</p>
            </div>
            <p className="text-sm text-text-muted mt-2">
              Requires immediate attention
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProductAnalytics;
