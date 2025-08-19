import React from 'react';
import {
  BarChart3,
  Package,
  List,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  X,
  ExternalLink,
  TreePine,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import { useGetCategoryUsageStatsQuery } from '../../store/slices/apiSlice';

const CategoryUsageModal = ({ isOpen, onClose, category }) => {
  const {
    data: usageStats,
    isLoading,
    error,
  } = useGetCategoryUsageStatsQuery(category?._id, {
    skip: !category?._id || !isOpen,
  });

  if (!category) return null;

  const stats = usageStats?.data || {
    products: 0,
    activeListings: 0,
    subcategories: 0,
    canDelete: true,
    blockers: [],
  };

  const canDelete = stats.canDelete;
  const hasUsage =
    stats.products > 0 || stats.activeListings > 0 || stats.subcategories > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-bottle-green" />
          <span>Category Usage Statistics</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Category Header */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-400" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-text-dark">
                {category.name}
              </h3>
              {category.description && (
                <p className="text-sm text-text-muted mt-1">
                  {category.description}
                </p>
              )}

              {/* Category Metadata */}
              <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                <span>Level {category.level || 0}</span>
                {category.parentCategory && (
                  <span>Parent: {category.parentCategory.name}</span>
                )}
                <span>
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-text-muted">
              Loading usage statistics...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                Failed to load usage statistics
              </p>
              <p className="text-red-700 text-sm">
                {error?.data?.message || 'Please try again later'}
              </p>
            </div>
          </div>
        )}

        {/* Usage Statistics */}
        {!isLoading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.products}
                    </p>
                    <p className="text-sm text-text-muted">Products</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <List className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.activeListings}
                    </p>
                    <p className="text-sm text-text-muted">Active Listings</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <TreePine className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.subcategories}
                    </p>
                    <p className="text-sm text-text-muted">Subcategories</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Deletion Status */}
            <Card className="p-4">
              <div className="flex items-start gap-3">
                {canDelete ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h4
                    className={`font-semibold ${canDelete ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {canDelete ? 'Safe to Delete' : 'Cannot Delete'}
                  </h4>

                  {canDelete ? (
                    <p className="text-green-700 text-sm mt-1">
                      This category has no dependencies and can be safely
                      deleted.
                    </p>
                  ) : (
                    <div>
                      <p className="text-red-700 text-sm mt-1 mb-2">
                        This category cannot be deleted due to the following
                        dependencies:
                      </p>

                      {stats.blockers && stats.blockers.length > 0 && (
                        <div className="space-y-1">
                          {stats.blockers.map((blocker, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm text-red-600"
                            >
                              <span className="w-1 h-1 rounded-full bg-red-600 mt-2 flex-shrink-0"></span>
                              <span>{blocker}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Detailed Breakdown */}
            {hasUsage && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-text-dark flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Usage Breakdown
                </h4>

                {/* Products Section */}
                {stats.products > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-text-dark">
                          Products
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {stats.products}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Products
                      </Button>
                    </div>
                    <p className="text-sm text-text-muted">
                      Products directly assigned to this category. These must be
                      reassigned to another category or deleted before this
                      category can be removed.
                    </p>
                  </Card>
                )}

                {/* Listings Section */}
                {stats.activeListings > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <List className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-text-dark">
                          Active Listings
                        </span>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                          {stats.activeListings}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Listings
                      </Button>
                    </div>
                    <p className="text-sm text-text-muted">
                      Active listings that use products from this category.
                      These listings will be affected if the category is
                      removed.
                    </p>
                  </Card>
                )}

                {/* Subcategories Section */}
                {stats.subcategories > 0 && (
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-text-dark">
                          Subcategories
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                          {stats.subcategories}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-600 hover:bg-purple-50"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Subcategories
                      </Button>
                    </div>
                    <p className="text-sm text-text-muted">
                      Child categories under this category. These must be
                      reassigned to a different parent category or deleted
                      first.
                    </p>
                  </Card>
                )}
              </div>
            )}

            {/* Recommendations */}
            {!canDelete && (
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">
                      Recommended Actions
                    </h4>
                    <div className="space-y-2 text-sm text-amber-700">
                      {stats.products > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Move all {stats.products} products to another
                            category
                          </span>
                        </div>
                      )}
                      {stats.subcategories > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Reassign {stats.subcategories} subcategories to a
                            different parent
                          </span>
                        </div>
                      )}
                      {stats.activeListings > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Wait for {stats.activeListings} listings to expire
                            or be manually updated
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {!hasUsage && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold text-text-dark mb-2">
                  No Usage Found
                </h4>
                <p className="text-text-muted">
                  This category is not currently being used by any products,
                  listings, or subcategories.
                </p>
              </Card>
            )}
          </>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryUsageModal;
