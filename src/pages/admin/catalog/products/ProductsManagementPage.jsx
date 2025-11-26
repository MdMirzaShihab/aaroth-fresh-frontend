import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  FileDown,
  Filter,
} from 'lucide-react';
import {
  useGetAdminProductsV2Query,
  useGetProductStatsQuery,
} from '../../../../store/slices/admin/adminApiSlice';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// Lazy load heavy components
const ProductDirectoryTable = lazy(() => import('./components/ProductDirectoryTable'));
const ProductAnalytics = lazy(() => import('./components/ProductAnalytics'));
const ProductEditModal = lazy(() => import('./components/ProductEditModal'));
const ProductDetailsModal = lazy(() => import('./components/ProductDetailsModal'));
const ProductFilters = lazy(() => import('./components/ProductFilters'));
const BulkProductOperations = lazy(() => import('./components/BulkProductOperations'));

const ProductsManagementPage = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    marketId: '', // Market filter
    status: 'all',
    stockLevel: 'all',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // RTK Query hooks
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useGetAdminProductsV2Query(filters);

  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetProductStatsQuery();

  const products = productsData?.data || [];
  const stats = statsData?.data || {
    totalProducts: 0,
    activeProducts: 0,
    flaggedProducts: 0,
    lowStockProducts: 0,
    averagePerformanceScore: 0,
  };

  // Tab configuration
  const tabs = [
    {
      id: 'directory',
      label: 'Product Directory',
      icon: Package,
      description: 'Browse and manage all products',
      badge: stats.totalProducts || 0,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View product insights and metrics',
      badge: null,
    },
  ];

  const handleRefresh = () => {
    refetchProducts();
    refetchStats();
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowEditModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedProduct(null);
    handleRefresh();
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    console.log('Export CSV with filters:', filters);
  };

  const handleSelectionChange = (productIds) => {
    setSelectedProducts(productIds);
  };

  if (isLoadingStats && isLoadingProducts) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-muted-olive to-earthy-brown bg-clip-text text-transparent">
              Products Management
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              Manage your product catalog, monitor performance, and track inventory
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoadingProducts || isLoadingStats}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingProducts || isLoadingStats ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleCreateProduct}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <Card className="p-4 glass glow-green">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-muted-olive">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-muted-olive" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Active
                </p>
                <p className="text-2xl font-bold text-sage-green">
                  {stats.activeProducts}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {stats.totalProducts > 0
                    ? Math.round((stats.activeProducts / stats.totalProducts) * 100)
                    : 0}
                  % of total
                </p>
              </div>
              <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-sage-green" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Flagged
                </p>
                <p className="text-2xl font-bold text-tomato-red">
                  {stats.flaggedProducts}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Requires attention
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  stats.flaggedProducts > 0
                    ? 'bg-tomato-red/10'
                    : 'bg-gray-100'
                }`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    stats.flaggedProducts > 0
                      ? 'text-tomato-red'
                      : 'text-gray-400'
                  }`}
                />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-earthy-yellow">
                  {stats.lowStockProducts}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Needs restocking
                </p>
              </div>
              <div className="w-12 h-12 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-earthy-yellow" />
              </div>
            </div>
          </Card>

          <Card className="p-4 glass">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium">
                  Avg Performance
                </p>
                <p className="text-2xl font-bold text-text-dark">
                  {stats.averagePerformanceScore || 0}/100
                </p>
                <p className="text-xs text-sage-green mt-1">
                  Quality score
                </p>
              </div>
              <div className="w-12 h-12 bg-earthy-brown/10 rounded-2xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-earthy-brown" />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              <ProductFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            </Suspense>
          </motion.div>
        )}

        {/* Bulk Operations Bar */}
        {selectedProducts.length > 0 && (
          <Suspense fallback={null}>
            <BulkProductOperations
              selectedCount={selectedProducts.length}
              selectedIds={selectedProducts}
              onClearSelection={() => setSelectedProducts([])}
              onRefresh={handleRefresh}
            />
          </Suspense>
        )}

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-2 glass">
            <div className="flex flex-col md:flex-row gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 p-4 rounded-2xl transition-all duration-300 text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg scale-[1.02]'
                      : 'hover:bg-earthy-beige/20 text-text-dark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <tab.icon
                        className={`w-5 h-5 ${
                          activeTab === tab.id
                            ? 'text-white'
                            : 'text-muted-olive'
                        }`}
                      />
                      <div>
                        <h3
                          className={`font-semibold ${
                            activeTab === tab.id
                              ? 'text-white'
                              : 'text-text-dark'
                          }`}
                        >
                          {tab.label}
                        </h3>
                        <p
                          className={`text-sm ${
                            activeTab === tab.id
                              ? 'text-white/80'
                              : 'text-text-muted'
                          }`}
                        >
                          {tab.description}
                        </p>
                      </div>
                    </div>
                    {tab.badge !== null && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          activeTab === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-muted-olive/10 text-muted-olive'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === 'directory' && (
                <ProductDirectoryTable
                  products={products}
                  isLoading={isLoadingProducts}
                  error={productsError}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onViewProduct={handleViewProduct}
                  onEditProduct={handleEditProduct}
                  onSelectionChange={handleSelectionChange}
                  selectedProducts={selectedProducts}
                />
              )}

              {activeTab === 'analytics' && (
                <ProductAnalytics
                  stats={stats}
                  products={products}
                  isLoading={isLoadingStats}
                />
              )}
            </Suspense>
          </motion.div>
        </AnimatePresence>

        {/* Error State */}
        {(productsError || statsError) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-6 border-tomato-red/20 bg-tomato-red/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-tomato-red" />
                <div>
                  <h3 className="font-semibold text-tomato-red">
                    Error Loading Data
                  </h3>
                  <p className="text-sm text-tomato-red/80 mt-1">
                    {productsError?.data?.message ||
                      statsError?.data?.message ||
                      'Failed to load product data. Please try refreshing the page.'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    className="mt-3 border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <Suspense fallback={null}>
        {showEditModal && (
          <ProductEditModal
            product={selectedProduct}
            isOpen={showEditModal}
            onClose={handleCloseModals}
          />
        )}

        {showDetailsModal && (
          <ProductDetailsModal
            product={selectedProduct}
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            onEdit={() => {
              setShowDetailsModal(false);
              setShowEditModal(true);
            }}
          />
        )}
      </Suspense>
    </div>
  );
};

export default ProductsManagementPage;
