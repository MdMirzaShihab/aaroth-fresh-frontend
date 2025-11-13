import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderTree,
  Package,
  TrendingUp,
  Clock,
  Activity,
  Plus,
  Filter,
  RefreshCw,
  AlertTriangle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// API Slices
import {
  useGetAdminCategoriesV2Query,
  useGetAdminCategoryDetailsQuery,
  useGetCategoryUsageStatsQuery,
} from '../../../../store/slices/admin/adminApiSlice';

// Lazy-loaded components
const CategoryDirectoryTable = lazy(() =>
  import('./components/CategoryDirectoryTable')
);
const CategoryEditModal = lazy(() => import('./components/CategoryEditModal'));
const CategoryDetailsModal = lazy(() =>
  import('./components/CategoryDetailsModal')
);
const CategoryFilters = lazy(() => import('./components/CategoryFilters'));

const CategoriesManagementPage = () => {
  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [activeTab, setActiveTab] = useState('directory');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    level: 'all',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // ========================================
  // RTK QUERY HOOKS
  // ========================================

  const {
    data: categoriesData,
    isLoading: isLoadingCategories,
    error: categoriesError,
    refetch: refetchCategories,
  } = useGetAdminCategoriesV2Query(filters);

  const categories = categoriesData?.data || [];
  const pagination = categoriesData?.pagination || {};

  // Calculate statistics from categories data
  const stats = {
    total: pagination.total || 0,
    active: categories.filter((cat) => cat.isActive).length,
    inUse: categories.filter((cat) => (cat.productCount || 0) > 0).length,
    recentlyAdded: categories.filter((cat) => {
      const createdDate = new Date(cat.createdAt);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return createdDate >= sevenDaysAgo;
    }).length,
    avgProducts: categories.length > 0
      ? Math.round(
          categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0) /
            categories.length
        )
      : 0,
  };

  // ========================================
  // TAB CONFIGURATION
  // ========================================

  const tabs = [
    {
      id: 'directory',
      label: 'Category Directory',
      icon: FolderTree,
      badge: stats.total,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: Activity,
      badge: null,
    },
  ];

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setShowEditModal(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedCategory(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    refetchCategories();
    toast.success('Categories refreshed');
  };

  const handleClearSelection = () => {
    setSelectedCategories([]);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-dark flex items-center gap-3">
              <FolderTree className="w-8 h-8 text-muted-olive" />
              Category Management
            </h1>
            <p className="text-text-muted mt-2">
              Manage product categories and hierarchy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>

            <Button
              onClick={handleCreateCategory}
              className="flex items-center gap-2 bg-gradient-secondary text-white"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </Button>
          </div>
        </motion.div>

        {/* ===== STATISTICS DASHBOARD ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          {/* Total Categories */}
          <Card className="p-4 glass glow-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <FolderTree className="w-6 h-6 text-muted-olive" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Total Categories</p>
                <p className="text-2xl font-bold text-muted-olive">{stats.total}</p>
              </div>
            </div>
          </Card>

          {/* Active Categories */}
          <Card className="p-4 glass glow-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-sage-green" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Active</p>
                <p className="text-2xl font-bold text-sage-green">{stats.active}</p>
              </div>
            </div>
          </Card>

          {/* Categories in Use */}
          <Card className="p-4 glass glow-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6 text-bottle-green" />
              </div>
              <div>
                <p className="text-sm text-text-muted">In Use</p>
                <p className="text-2xl font-bold text-bottle-green">{stats.inUse}</p>
              </div>
            </div>
          </Card>

          {/* Recently Added */}
          <Card className="p-4 glass glow-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-earthy-yellow" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Recent (7 days)</p>
                <p className="text-2xl font-bold text-earthy-yellow">
                  {stats.recentlyAdded}
                </p>
              </div>
            </div>
          </Card>

          {/* Avg Products per Category */}
          <Card className="p-4 glass glow-green">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-muted-olive" />
              </div>
              <div>
                <p className="text-sm text-text-muted">Avg Products</p>
                <p className="text-2xl font-bold text-muted-olive">{stats.avgProducts}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ===== FILTERS PANEL ===== */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== TAB NAVIGATION ===== */}
        <Card className="p-2 glass">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap
                  ${
                    activeTab === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg'
                      : 'text-text-muted hover:bg-white/50'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.badge !== null && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-semibold
                    ${
                      activeTab === tab.id
                        ? 'bg-white/20 text-white'
                        : 'bg-muted-olive/10 text-muted-olive'
                    }
                  `}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </Card>

        {/* ===== BULK OPERATIONS BAR ===== */}
        <AnimatePresence>
          {selectedCategories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-4 glass border-2 border-muted-olive/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-text-dark">
                      {selectedCategories.length} categories selected
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearSelection}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Activate Selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Deactivate Selected
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== ERROR STATE ===== */}
        {categoriesError && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 border-tomato-red/20 bg-tomato-red/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-tomato-red" />
                <div>
                  <h3 className="font-semibold text-tomato-red">Error Loading Categories</h3>
                  <p className="text-sm text-tomato-red/80 mt-1">
                    {categoriesError?.data?.message || 'Failed to load categories'}
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

        {/* ===== TAB CONTENT ===== */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'directory' && (
              <Suspense fallback={<LoadingSpinner />}>
                <CategoryDirectoryTable
                  categories={categories}
                  isLoading={isLoadingCategories}
                  pagination={pagination}
                  selectedCategories={selectedCategories}
                  onSelectCategories={setSelectedCategories}
                  onEdit={handleEditCategory}
                  onView={handleViewCategory}
                  onPageChange={handlePageChange}
                  onRefresh={handleRefresh}
                />
              </Suspense>
            )}

            {activeTab === 'analytics' && (
              <Card className="p-6 glass">
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-text-muted mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-text-dark mb-2">
                    Analytics Coming Soon
                  </h3>
                  <p className="text-text-muted">
                    Category analytics and insights will be available here
                  </p>
                </div>
              </Card>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ===== MODALS ===== */}
      <Suspense fallback={null}>
        {showEditModal && (
          <CategoryEditModal
            category={selectedCategory}
            isOpen={showEditModal}
            onClose={handleCloseModals}
            onSuccess={() => {
              handleCloseModals();
              refetchCategories();
            }}
          />
        )}

        {showDetailsModal && selectedCategory && (
          <CategoryDetailsModal
            category={selectedCategory}
            isOpen={showDetailsModal}
            onClose={handleCloseModals}
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

export default CategoriesManagementPage;
