import React, { useState } from 'react';
import {
  AlertTriangle,
  Trash2,
  Shield,
  CheckCircle,
  X,
  Package,
  List,
  TreePine,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  useSafeDeleteCategoryMutation,
  useGetCategoryUsageStatsQuery,
} from '../../store/slices/apiSlice';

const SafeDeleteModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  const {
    data: usageStats,
    isLoading: usageLoading,
    error: usageError,
  } = useGetCategoryUsageStatsQuery(category?._id, {
    skip: !category?._id || !isOpen,
  });

  const [safeDeleteCategory, { isLoading: deleteLoading }] =
    useSafeDeleteCategoryMutation();

  const expectedConfirmText = `DELETE ${category?.name || ''}`;
  const stats = usageStats?.data || {
    products: 0,
    activeListings: 0,
    subcategories: 0,
    canDelete: true,
    blockers: [],
  };

  const handleConfirmTextChange = (e) => {
    const value = e.target.value;
    setConfirmText(value);
    setIsConfirmed(value === expectedConfirmText);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConfirmed) {
      setError('Please type the confirmation text exactly as shown');
      return;
    }

    if (!stats.canDelete) {
      setError('Cannot delete category with dependencies');
      return;
    }

    try {
      await safeDeleteCategory(category._id).unwrap();
      onSuccess?.();
      onClose();

      // Reset form
      setIsConfirmed(false);
      setConfirmText('');
      setError('');
    } catch (error) {
      console.error('Failed to delete category:', error);
      setError(error?.data?.message || 'Failed to delete category');
    }
  };

  const handleClose = () => {
    setIsConfirmed(false);
    setConfirmText('');
    setError('');
    onClose();
  };

  if (!category) return null;

  const canDelete = stats.canDelete;
  const hasUsage =
    stats.products > 0 || stats.activeListings > 0 || stats.subcategories > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-tomato-red" />
          <span>Delete Category</span>
        </div>
      }
      size="lg"
    >
      <div className="space-y-6">
        {/* Category Information */}
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
        {usageLoading && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-text-muted">
              Checking dependencies...
            </span>
          </div>
        )}

        {/* Usage Error */}
        {usageError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">
                Failed to check dependencies
              </p>
              <p className="text-red-700 text-sm">
                {usageError?.data?.message || 'Please try again later'}
              </p>
            </div>
          </div>
        )}

        {/* Dependency Check Results */}
        {!usageLoading && !usageError && (
          <>
            {/* Safety Status */}
            <Card
              className={`p-4 ${canDelete ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
            >
              <div className="flex items-start gap-3">
                {canDelete ? (
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}

                <div className="flex-1">
                  <h4
                    className={`font-semibold ${canDelete ? 'text-green-800' : 'text-red-800'}`}
                  >
                    {canDelete
                      ? 'Safe to Delete'
                      : 'Cannot Delete - Dependencies Found'}
                  </h4>

                  {canDelete ? (
                    <p className="text-green-700 text-sm mt-1">
                      This category has no dependencies and can be safely
                      deleted. This action cannot be undone.
                    </p>
                  ) : (
                    <div>
                      <p className="text-red-700 text-sm mt-1 mb-2">
                        This category cannot be deleted because it has the
                        following dependencies:
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

            {/* Usage Statistics */}
            {hasUsage && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.products > 0 && (
                  <Card className="p-4 border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-xl">
                        <Package className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-800">
                          {stats.products}
                        </p>
                        <p className="text-sm text-red-600">Products</p>
                      </div>
                    </div>
                  </Card>
                )}

                {stats.activeListings > 0 && (
                  <Card className="p-4 border-orange-200 bg-orange-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-xl">
                        <List className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-orange-800">
                          {stats.activeListings}
                        </p>
                        <p className="text-sm text-orange-600">
                          Active Listings
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {stats.subcategories > 0 && (
                  <Card className="p-4 border-purple-200 bg-purple-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-xl">
                        <TreePine className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-800">
                          {stats.subcategories}
                        </p>
                        <p className="text-sm text-purple-600">Subcategories</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Required Actions */}
            {!canDelete && (
              <Card className="p-4 bg-amber-50 border-amber-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800 mb-2">
                      Required Actions Before Deletion
                    </h4>
                    <div className="space-y-2 text-sm text-amber-700">
                      {stats.products > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Move or delete all {stats.products} products
                            assigned to this category
                          </span>
                        </div>
                      )}
                      {stats.subcategories > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Reassign {stats.subcategories} subcategories to a
                            different parent or delete them
                          </span>
                        </div>
                      )}
                      {stats.activeListings > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-amber-600 mt-2 flex-shrink-0"></span>
                          <span>
                            Wait for {stats.activeListings} listings to expire
                            or update their categories
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Confirmation Section - Only show if can delete */}
            {canDelete && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Deletion Warning */}
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">
                        ⚠️ Permanent Deletion Warning
                      </h4>
                      <div className="space-y-1 text-sm text-red-700">
                        <p>• This action cannot be undone</p>
                        <p>• Category data will be permanently removed</p>
                        <p>• Category will be removed from audit trails</p>
                        <p>• Associated metadata and SEO data will be lost</p>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Confirmation Input */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Confirmation Required *
                  </label>
                  <p className="text-sm text-text-muted mb-3">
                    Type{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                      {expectedConfirmText}
                    </code>{' '}
                    to confirm deletion:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={handleConfirmTextChange}
                    placeholder={expectedConfirmText}
                    className={`w-full px-4 py-3 border rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 transition-all duration-200 ${
                      error
                        ? 'border-red-500 focus:ring-red-200'
                        : isConfirmed
                          ? 'border-green-500 focus:ring-green-200'
                          : 'border-gray-200 focus:ring-muted-olive/20 focus:border-muted-olive'
                    }`}
                    autoComplete="off"
                  />
                  {error && (
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  )}
                  {isConfirmed && (
                    <div className="flex items-center gap-1 text-green-600 text-sm mt-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmation text matches</span>
                    </div>
                  )}
                </div>
              </form>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={deleteLoading}
          >
            Cancel
          </Button>

          {canDelete && !usageLoading && !usageError && (
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!isConfirmed || deleteLoading}
              className="bg-tomato-red hover:bg-tomato-red/90 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {deleteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Category
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default SafeDeleteModal;
