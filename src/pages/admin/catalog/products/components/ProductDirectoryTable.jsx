import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Edit,
  Eye,
  Trash2,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Image as ImageIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '../../../../../components/ui/Card';
import Button from '../../../../../components/ui/Button';
import LoadingSpinner from '../../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../../components/ui/EmptyState';
import SearchBar from '../../../../../components/ui/SearchBar';

const ProductDirectoryTable = ({
  products,
  isLoading,
  error,
  filters,
  onFiltersChange,
  onViewProduct,
  onEditProduct,
  onSelectionChange,
  selectedProducts,
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(products.map((p) => p._id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectProduct = (productId) => {
    if (selectedProducts.includes(productId)) {
      onSelectionChange(selectedProducts.filter((id) => id !== productId));
    } else {
      onSelectionChange([...selectedProducts, productId]);
    }
  };

  const getStatusBadge = (isActive, isFlagged) => {
    if (isFlagged) {
      return {
        color: 'bg-tomato-red/10 text-tomato-red',
        label: 'Flagged',
        icon: AlertTriangle,
      };
    }
    if (isActive) {
      return {
        color: 'bg-sage-green/10 text-sage-green',
        label: 'Active',
        icon: CheckCircle,
      };
    }
    return {
      color: 'bg-gray-100 text-gray-600',
      label: 'Inactive',
      icon: XCircle,
    };
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-sage-green';
    if (score >= 60) return 'text-earthy-yellow';
    return 'text-tomato-red';
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load products"
        description="There was an error loading product data. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <Card className="p-4 glass">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={filters.search}
              onChange={(value) =>
                onFiltersChange({ ...filters, search: value, page: 1 })
              }
              placeholder="Search products by name or description..."
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-earthy-beige/20 rounded-2xl p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                  viewMode === 'table'
                    ? 'bg-white text-muted-olive shadow-sm'
                    : 'text-text-muted hover:text-text-dark'
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                  viewMode === 'cards'
                    ? 'bg-white text-muted-olive shadow-sm'
                    : 'text-text-muted hover:text-text-dark'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Products Display */}
      {isLoading ? (
        <Card className="p-8 glass text-center">
          <LoadingSpinner size="lg" />
          <p className="text-text-muted mt-4">Loading products...</p>
        </Card>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="No products match your search criteria. Try adjusting your filters."
          actionLabel="Clear Filters"
          onAction={() =>
            onFiltersChange({
              search: '',
              category: 'all',
              status: 'all',
              stockLevel: 'all',
              page: 1,
            })
          }
        />
      ) : viewMode === 'table' ? (
        <Card className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-earthy-beige/20">
                <tr>
                  <th className="p-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProducts.length === products.length &&
                        products.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-dark">
                    Product
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-dark">
                    Category
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-dark">
                    Status
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-dark">
                    Performance
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-text-dark">
                    Created
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-text-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const statusBadge = getStatusBadge(
                    product.isActive,
                    product.isFlagged
                  );
                  const StatusIcon = statusBadge.icon;

                  return (
                    <motion.tr
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-t border-gray-100 hover:bg-earthy-beige/10 transition-colors"
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product._id)}
                          onChange={() => handleSelectProduct(product._id)}
                          className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-text-dark">
                              {product.name}
                            </p>
                            <p className="text-sm text-text-muted truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-text-dark">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          {product.category && !product.category.isActive && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600 flex items-center gap-1"
                              title="Category is inactive"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                          {product.category && product.category.isAvailable === false && (
                            <span
                              className="px-2 py-0.5 rounded-full text-xs bg-tomato-red/10 text-tomato-red flex items-center gap-1"
                              title="Category is flagged as unavailable"
                            >
                              <AlertTriangle className="w-3 h-3" />
                              Flagged
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp
                            className={`w-4 h-4 ${getPerformanceColor(product.performanceScore || 0)}`}
                          />
                          <span
                            className={`font-medium ${getPerformanceColor(product.performanceScore || 0)}`}
                          >
                            {product.performanceScore || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-text-muted">
                          {format(new Date(product.createdAt), 'MMM dd, yyyy')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewProduct(product)}
                            className="p-2"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditProduct(product)}
                            className="p-2"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, index) => {
            const statusBadge = getStatusBadge(
              product.isActive,
              product.isFlagged
            );
            const StatusIcon = statusBadge.icon;

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="glass overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelectProduct(product._id)}
                        className="w-5 h-5 text-muted-olive border-white rounded focus:ring-muted-olive shadow-sm"
                      />
                    </div>
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${statusBadge.color}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-text-dark mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                        {product.category && !product.category.isActive && (
                          <span
                            className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                            title="Inactive"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                        {product.category && product.category.isAvailable === false && (
                          <span
                            className="px-1.5 py-0.5 rounded text-xs bg-tomato-red/10 text-tomato-red"
                            title="Flagged"
                          >
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp
                          className={`w-3 h-3 ${getPerformanceColor(product.performanceScore || 0)}`}
                        />
                        <span
                          className={`text-xs font-medium ${getPerformanceColor(product.performanceScore || 0)}`}
                        >
                          {product.performanceScore || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onEditProduct(product)}
                        className="flex-1 flex items-center justify-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {products.length > 0 && (
        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-muted">
              Showing {(filters.page - 1) * filters.limit + 1} to{' '}
              {Math.min(filters.page * filters.limit, products.length)} of{' '}
              {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onFiltersChange({ ...filters, page: filters.page - 1 })
                }
                disabled={filters.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-text-dark px-3">
                Page {filters.page}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  onFiltersChange({ ...filters, page: filters.page + 1 })
                }
                disabled={products.length < filters.limit}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductDirectoryTable;
