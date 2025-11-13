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
  FolderTree,
  Package,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';

// API Slices
import {
  useSafeDeleteCategoryV2Mutation,
  useToggleCategoryAvailabilityV2Mutation,
} from '../../../../../store/slices/admin/adminApiSlice';

const CategoryDirectoryTable = ({
  categories = [],
  isLoading,
  pagination = {},
  selectedCategories = [],
  onSelectCategories,
  onEdit,
  onView,
  onPageChange,
  onRefresh,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // ========================================
  // RTK QUERY MUTATIONS
  // ========================================

  const [deleteCategory] = useSafeDeleteCategoryV2Mutation();
  const [toggleAvailability] = useToggleCategoryAvailabilityV2Mutation();

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectCategories(categories.map((cat) => cat._id));
    } else {
      onSelectCategories([]);
    }
  };

  const handleSelectCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      onSelectCategories(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onSelectCategories([...selectedCategories, categoryId]);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeletingId(category._id);
      await deleteCategory({ id: category._id }).unwrap();
      toast.success('Category deleted successfully');
      onRefresh();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error?.data?.message || 'Failed to delete category');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleAvailability = async (category) => {
    try {
      setTogglingId(category._id);
      await toggleAvailability({
        id: category._id,
        isAvailable: !category.isAvailable,
      }).unwrap();
      toast.success(
        `Category ${category.isAvailable ? 'flagged' : 'unflagged'} successfully`
      );
      onRefresh();
    } catch (error) {
      console.error('Toggle error:', error);
      toast.error(error?.data?.message || 'Failed to toggle availability');
    } finally {
      setTogglingId(null);
    }
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (isLoading) {
    return (
      <Card className="p-8 glass">
        <LoadingSpinner />
        <p className="text-center text-text-muted mt-4">Loading categories...</p>
      </Card>
    );
  }

  // ========================================
  // EMPTY STATE
  // ========================================

  if (!categories || categories.length === 0) {
    return (
      <Card className="p-12 glass text-center">
        <FolderTree className="w-16 h-16 text-text-muted mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-text-dark mb-2">
          No Categories Found
        </h3>
        <p className="text-text-muted mb-6">
          Get started by creating your first category
        </p>
      </Card>
    );
  }

  // ========================================
  // TABLE VIEW
  // ========================================

  const isAllSelected =
    categories.length > 0 && selectedCategories.length === categories.length;
  const isSomeSelected = selectedCategories.length > 0 && !isAllSelected;

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <Card className="overflow-hidden glass hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-muted-olive/5 to-sage-green/5">
              <tr>
                <th className="px-4 py-4 text-left w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-muted-olive focus:ring-muted-olive"
                  />
                </th>
                <th className="px-4 py-4 text-left w-20">
                  <span className="text-sm font-semibold text-text-dark">Image</span>
                </th>
                <th className="px-4 py-4 text-left">
                  <span className="text-sm font-semibold text-text-dark">Name</span>
                </th>
                <th className="px-4 py-4 text-left">
                  <span className="text-sm font-semibold text-text-dark">
                    Parent Category
                  </span>
                </th>
                <th className="px-4 py-4 text-left">
                  <span className="text-sm font-semibold text-text-dark">Products</span>
                </th>
                <th className="px-4 py-4 text-left">
                  <span className="text-sm font-semibold text-text-dark">Status</span>
                </th>
                <th className="px-4 py-4 text-right">
                  <span className="text-sm font-semibold text-text-dark">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((category, index) => (
                <motion.tr
                  key={category._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted-olive/5 transition-colors"
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleSelectCategory(category._id)}
                      className="w-4 h-4 rounded border-gray-300 text-muted-olive focus:ring-muted-olive"
                    />
                  </td>

                  {/* Image */}
                  <td className="px-4 py-4">
                    {category.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={category.image.url || category.image}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </td>

                  {/* Name & Description */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">
                        {category.name}
                      </p>
                      {category.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Parent Category */}
                  <td className="px-4 py-4">
                    <p className="text-sm text-text-dark">
                      {category.parentCategory?.name || (
                        <span className="text-text-muted italic">Top-level</span>
                      )}
                    </p>
                  </td>

                  {/* Products Count */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-olive" />
                      <span className="text-sm font-medium text-text-dark">
                        {category.productCount || 0}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
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
                      {!category.isAvailable && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-tomato-red/10 text-tomato-red">
                          Flagged
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onView(category)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(category)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={category.isAvailable ? 'outline' : 'default'}
                        onClick={() => handleToggleAvailability(category)}
                        disabled={togglingId === category._id}
                        className="flex items-center gap-1"
                      >
                        {togglingId === category._id ? (
                          <LoadingSpinner size="sm" />
                        ) : category.isAvailable ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={deletingId === category._id}
                        className="flex items-center gap-1"
                      >
                        {deletingId === category._id ? (
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 glass">
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category._id)}
                  onChange={() => handleSelectCategory(category._id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-muted-olive focus:ring-muted-olive"
                />

                {/* Image */}
                <div className="flex-shrink-0">
                  {category.image ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <img
                        src={category.image.url || category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-text-dark">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-text-muted mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-xs text-text-muted">
                      {category.productCount || 0} products
                    </span>
                    {category.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sage-green/10 text-sage-green">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                    {!category.isAvailable && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-tomato-red/10 text-tomato-red">
                        Flagged
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(category)}
                      className="flex-1"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(category)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteCategory(category)}
                      disabled={deletingId === category._id}
                    >
                      {deletingId === category._id ? (
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

      {/* Pagination */}
      {pagination.pages > 1 && (
        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} categories
            </p>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`
                        w-8 h-8 rounded-lg text-sm font-medium transition-all
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
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CategoryDirectoryTable;
