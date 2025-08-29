import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Search,
  Filter,
  Plus,
  Grid,
  List,
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Eye,
  Edit,
  Trash2,
  Flag,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  Clock,
  Users,
  ShoppingCart,
  DollarSign,
  Image as ImageIcon,
  Archive,
  Zap,
} from 'lucide-react';
import { CSVLink } from 'react-csv';
import {
  useGetAdminProductsQuery,
  useGetAdminProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useBulkUpdateProductsMutation,
  useFlagProductMutation,
} from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import SearchBar from '../../components/ui/SearchBar';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import FormField from '../../components/ui/FormField';
import ProductCard from '../../components/admin/products/ProductCard';
import ProductListItem from '../../components/admin/products/ProductListItem';
import ProductFilters from '../../components/admin/products/ProductFilters';
import ProductModal from '../../components/admin/products/ProductModal';
import BulkActionsBar from '../../components/admin/products/BulkActionsBar';
import ProductAnalytics from '../../components/admin/products/ProductAnalytics';

const ProductsManagementPage = () => {
  const [viewMode, setViewMode] = useState('cards'); // 'cards', 'list', 'analytics'
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [bulkActionModalOpen, setBulkActionModalOpen] = useState(false);
  const [bulkActionType, setBulkActionType] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    availability: 'all',
    priceRange: 'all',
    performanceScore: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 20,
  });

  // RTK Query hooks
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useGetAdminProductsQuery(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetAdminProductStatsQuery();

  // RTK Mutations
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [bulkUpdateProducts] = useBulkUpdateProductsMutation();
  const [flagProduct] = useFlagProductMutation();

  const products = productsData?.data || [];
  const totalCount = productsData?.total || 0;
  const currentPage = productsData?.page || 1;
  const totalPages = productsData?.pages || 1;
  const stats = statsData?.data || {
    totalProducts: 0,
    activeProducts: 0,
    flaggedProducts: 0,
    lowStockProducts: 0,
    totalListings: 0,
    avgPerformanceScore: 0,
    topPerformingProducts: [],
    categoryDistribution: [],
  };

  // CSV export data
  const csvData = useMemo(() => {
    return products.map(product => ({
      ID: product.id,
      Name: product.name,
      Category: product.category,
      Status: product.status,
      'Total Listings': product.totalListings,
      'Average Price': product.averagePrice,
      'Total Orders': product.totalOrders,
      'Performance Score': product.performanceScore,
      'Created Date': product.createdAt,
      'Last Updated': product.updatedAt,
    }));
  }, [products]);

  const handleProductSelect = (productId, selected) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId).unwrap();
        refetchProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  const handleBulkAction = (actionType) => {
    setBulkActionType(actionType);
    setBulkActionModalOpen(true);
  };

  const handleBulkActionSubmit = async (actionData) => {
    try {
      await bulkUpdateProducts({
        productIds: Array.from(selectedProducts),
        action: bulkActionType,
        ...actionData,
      }).unwrap();
      
      setSelectedProducts(new Set());
      setBulkActionModalOpen(false);
      refetchProducts();
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-mint-fresh';
    if (score >= 60) return 'text-earthy-yellow';
    if (score >= 40) return 'text-amber-600';
    return 'text-tomato-red';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-mint-fresh/10 text-mint-fresh', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-600', label: 'Inactive' },
      flagged: { color: 'bg-tomato-red/10 text-tomato-red', label: 'Flagged' },
      draft: { color: 'bg-blue-100 text-blue-600', label: 'Draft' },
    };
    return badges[status] || badges.draft;
  };

  if (productsError || statsError) {
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
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/10 to-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-bottle-green to-earthy-brown bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              Comprehensive product catalog management with performance analytics and bulk operations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <CSVLink
              data={csvData}
              filename={`products-export-${new Date().toISOString().split('T')[0]}.csv`}
              className="flex items-center gap-2 px-4 py-2 bg-earthy-beige/20 hover:bg-earthy-beige/30 text-text-dark rounded-2xl transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </CSVLink>
            <Button
              variant="outline"
              size="sm"
              onClick={refetchProducts}
              disabled={isLoadingProducts}
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingProducts ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              onClick={handleCreateProduct}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="p-4 glass glow-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Products</p>
                <p className="text-2xl font-bold text-bottle-green">{stats.totalProducts}</p>
                <p className="text-xs text-mint-fresh mt-1">
                  {stats.activeProducts} active
                </p>
              </div>
              <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-bottle-green" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Total Listings</p>
                <p className="text-2xl font-bold text-text-dark">{stats.totalListings}</p>
                <p className="text-xs text-text-muted mt-1">
                  Across all products
                </p>
              </div>
              <div className="w-12 h-12 bg-earthy-brown/10 rounded-2xl flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-earthy-brown" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Avg Performance</p>
                <p className={`text-2xl font-bold ${getPerformanceColor(stats.avgPerformanceScore)}`}>
                  {stats.avgPerformanceScore || 0}%
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Overall score
                </p>
              </div>
              <div className="w-12 h-12 bg-mint-fresh/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-mint-fresh" />
              </div>
            </div>
          </Card>

          <Card className={`p-4 glass ${stats.flaggedProducts > 0 ? 'border-tomato-red/30' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">Flagged Products</p>
                <p className={`text-2xl font-bold ${stats.flaggedProducts > 0 ? 'text-tomato-red' : 'text-text-dark'}`}>
                  {stats.flaggedProducts}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Need attention
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                stats.flaggedProducts > 0 ? 'bg-tomato-red/10' : 'bg-gray-100'
              }`}>
                <Flag className={`w-6 h-6 ${stats.flaggedProducts > 0 ? 'text-tomato-red' : 'text-gray-400'}`} />
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
                { id: 'cards', label: 'Product Cards', icon: Grid },
                { id: 'list', label: 'List View', icon: List },
                { id: 'analytics', label: 'Analytics Dashboard', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex-1 p-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    viewMode === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg'
                      : 'hover:bg-earthy-beige/20 text-text-dark'
                  }`}
                >
                  <tab.icon className={`w-5 h-5 ${viewMode === tab.id ? 'text-white' : 'text-bottle-green'}`} />
                  <span className="font-medium">{tab.label}</span>
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
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={products.length}
              totalCount={totalCount}
              stats={stats}
            />
          </motion.div>
        )}

        {/* Bulk Actions Bar */}
        <AnimatePresence>
          {selectedProducts.size > 0 && (
            <BulkActionsBar
              selectedCount={selectedProducts.size}
              onBulkAction={handleBulkAction}
              onClearSelection={() => setSelectedProducts(new Set())}
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
              <ProductAnalytics stats={stats} products={products} />
            ) : (
              <>
                {/* Products Content */}
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center min-h-[50vh]">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : products.length === 0 ? (
                  <EmptyState
                    icon={Package}
                    title="No products found"
                    description="No products match your current filters."
                    actionLabel="Create Product"
                    onAction={handleCreateProduct}
                  />
                ) : (
                  <>
                    {viewMode === 'cards' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product, index) => (
                          <ProductCard
                            key={product.id}
                            product={product}
                            isSelected={selectedProducts.has(product.id)}
                            onSelect={handleProductSelect}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onFlag={(product) => flagProduct({ id: product.id }).unwrap()}
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
                                checked={selectedProducts.size === products.length && products.length > 0}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                              />
                              <span className="text-sm font-medium text-text-dark">
                                Select All
                              </span>
                            </label>
                            <span className="text-sm text-text-muted">
                              {selectedProducts.size} of {products.length} selected
                            </span>
                          </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {products.map((product, index) => (
                            <ProductListItem
                              key={product.id}
                              product={product}
                              isSelected={selectedProducts.has(product.id)}
                              onSelect={handleProductSelect}
                              onEdit={handleEditProduct}
                              onDelete={handleDeleteProduct}
                              onFlag={(product) => flagProduct({ id: product.id }).unwrap()}
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
                            {totalCount} products
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={currentPage === 1 || isLoadingProducts}
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
                              disabled={currentPage === totalPages || isLoadingProducts}
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

        {/* Product Modal */}
        <ProductModal
          isOpen={productModalOpen}
          onClose={() => {
            setProductModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSave={(productData) => {
            const mutation = editingProduct ? updateProduct : createProduct;
            return mutation(productData).unwrap().then(() => {
              refetchProducts();
              setProductModalOpen(false);
              setEditingProduct(null);
            });
          }}
          categories={stats.categoryDistribution.map(cat => ({
            id: cat.categoryId,
            name: cat.categoryName,
          }))}
        />

        {/* Bulk Action Modal */}
        <BulkActionModal
          isOpen={bulkActionModalOpen}
          onClose={() => setBulkActionModalOpen(false)}
          actionType={bulkActionType}
          selectedCount={selectedProducts.size}
          onSubmit={handleBulkActionSubmit}
        />
      </div>
    </div>
  );
};

// Bulk Action Modal Component
const BulkActionModal = ({ isOpen, onClose, actionType, selectedCount, onSubmit }) => {
  const [actionData, setActionData] = useState({});

  if (!isOpen) return null;

  const actionConfig = {
    activate: {
      title: 'Activate Products',
      description: `Activate ${selectedCount} selected products?`,
      color: 'mint-fresh',
      icon: CheckCircle,
    },
    deactivate: {
      title: 'Deactivate Products',
      description: `Deactivate ${selectedCount} selected products?`,
      color: 'amber-500',
      icon: Clock,
    },
    delete: {
      title: 'Delete Products',
      description: `Permanently delete ${selectedCount} selected products? This action cannot be undone.`,
      color: 'tomato-red',
      icon: Trash2,
      dangerous: true,
    },
    flag: {
      title: 'Flag Products',
      description: `Flag ${selectedCount} selected products for review?`,
      color: 'tomato-red',
      icon: Flag,
    },
    category: {
      title: 'Update Category',
      description: `Update category for ${selectedCount} selected products?`,
      color: 'bottle-green',
      icon: Archive,
      requiresInput: true,
    },
  };

  const config = actionConfig[actionType] || actionConfig.activate;

  const handleSubmit = () => {
    onSubmit(actionData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-4">
        <div className={`p-4 rounded-2xl ${config.dangerous ? 'bg-tomato-red/5 border border-tomato-red/20' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              config.dangerous ? 'bg-tomato-red/10' : 'bg-bottle-green/10'
            }`}>
              <config.icon className={`w-5 h-5 ${config.dangerous ? 'text-tomato-red' : 'text-bottle-green'}`} />
            </div>
            <div>
              <h4 className="font-semibold text-text-dark">{config.title}</h4>
              <p className="text-sm text-text-muted">{config.description}</p>
            </div>
          </div>
        </div>

        {config.requiresInput && actionType === 'category' && (
          <FormField label="New Category">
            <select
              value={actionData.categoryId || ''}
              onChange={(e) => setActionData({ ...actionData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20"
              required
            >
              <option value="">Select category</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="grains">Grains</option>
              <option value="dairy">Dairy</option>
              <option value="spices">Spices</option>
            </select>
          </FormField>
        )}

        {actionType === 'flag' && (
          <FormField label="Flag Reason">
            <textarea
              value={actionData.reason || ''}
              onChange={(e) => setActionData({ ...actionData, reason: e.target.value })}
              placeholder="Explain why these products are being flagged..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 resize-none"
              required
            />
          </FormField>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className={`${config.dangerous ? 'bg-tomato-red hover:bg-tomato-red/90' : 'bg-bottle-green hover:bg-bottle-green/90'} text-white`}
          >
            {config.title}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductsManagementPage;