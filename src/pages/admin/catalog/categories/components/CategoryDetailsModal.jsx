import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Edit,
  X,
  Check,
  AlertTriangle,
  FolderTree,
  Calendar,
} from 'lucide-react';

// UI Components
import { Modal } from '../../../../../components/ui/Modal';
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';

// API Slices
import { useGetCategoryUsageStatsQuery } from '../../../../../store/slices/admin/adminApiSlice';

const CategoryDetailsModal = ({ category, isOpen, onClose, onEdit }) => {
  // ========================================
  // RTK QUERY HOOKS
  // ========================================

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetCategoryUsageStatsQuery(category?._id, {
    skip: !category?._id,
  });

  const stats = statsData?.data || {};

  // ========================================
  // RENDER HELPERS
  // ========================================

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // ========================================
  // RENDER
  // ========================================

  if (!category) return null;

  const hasDependencies =
    (stats.productsCount || 0) > 0 ||
    (stats.activeListingsCount || 0) > 0 ||
    (category.subcategories || []).length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Category Details" size="lg">
      <div className="space-y-6">
        {/* Category Image */}
        {category.image && (
          <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
            <img
              src={category.image.url || category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h3 className="text-2xl font-bold text-text-dark mb-2">{category.name}</h3>
          {category.description && (
            <p className="text-text-muted leading-relaxed">{category.description}</p>
          )}

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {/* Status Badge */}
            {category.isActive ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-sage-green/10 text-sage-green flex items-center gap-1">
                <Check className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
                <X className="w-3 h-3" />
                Inactive
              </span>
            )}

            {/* Availability Badge */}
            {category.isAvailable !== false ? (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-mint-fresh/10 text-bottle-green flex items-center gap-1">
                <Check className="w-3 h-3" />
                Available
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-tomato-red/10 text-tomato-red flex items-center gap-1">
                <X className="w-3 h-3" />
                Flagged
              </span>
            )}

            {/* Parent Category */}
            {category.parentCategory && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted-olive/10 text-muted-olive flex items-center gap-1">
                <FolderTree className="w-3 h-3" />
                Child of: {category.parentCategory.name}
              </span>
            )}

            {/* Created Date */}
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(category.createdAt)}
            </span>
          </div>
        </div>

        {/* Usage Statistics */}
        <div>
          <h4 className="text-lg font-semibold text-text-dark mb-4">Usage Statistics</h4>

          {isLoadingStats ? (
            <div className="py-8">
              <LoadingSpinner />
              <p className="text-center text-text-muted mt-4">
                Loading statistics...
              </p>
            </div>
          ) : statsError ? (
            <Card className="p-4 border-tomato-red/20 bg-tomato-red/5">
              <p className="text-sm text-tomato-red">
                Failed to load statistics: {statsError?.data?.message || 'Unknown error'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Products Count */}
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-olive" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Total Products</p>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.productsCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Active Listings */}
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-sage-green" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Active Listings</p>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.activeListingsCount || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Total Orders */}
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-bottle-green" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Total Orders</p>
                    <p className="text-2xl font-bold text-text-dark">
                      {stats.totalOrders || 0}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Revenue */}
              <Card className="p-4 glass">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-earthy-yellow" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Total Revenue</p>
                    <p className="text-2xl font-bold text-text-dark">
                      {formatCurrency(stats.totalRevenue || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Dependency Warning */}
        {hasDependencies && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 border-earthy-yellow/30 bg-earthy-yellow/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-earthy-yellow flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-earthy-brown mb-1">
                    Category Has Dependencies
                  </h5>
                  <p className="text-sm text-earthy-brown/80">
                    This category cannot be deleted because it has:
                  </p>
                  <ul className="text-sm text-earthy-brown/80 mt-2 space-y-1">
                    {(stats.productsCount || 0) > 0 && (
                      <li>• {stats.productsCount} product(s)</li>
                    )}
                    {(stats.activeListingsCount || 0) > 0 && (
                      <li>• {stats.activeListingsCount} active listing(s)</li>
                    )}
                    {(category.subcategories || []).length > 0 && (
                      <li>• {category.subcategories.length} subcategory(ies)</li>
                    )}
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Subcategories */}
        {(category.subcategories || []).length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-text-dark mb-3">
              Subcategories ({category.subcategories.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {category.subcategories.map((subcat) => (
                <span
                  key={subcat._id}
                  className="px-3 py-1 rounded-full text-sm bg-muted-olive/10 text-muted-olive"
                >
                  {subcat.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="flex items-center gap-2 bg-gradient-secondary text-white"
          >
            <Edit className="w-4 h-4" />
            Edit Category
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CategoryDetailsModal;
