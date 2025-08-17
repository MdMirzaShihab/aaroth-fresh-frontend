import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  Image as ImageIcon,
  Tag,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Grid3X3,
  List,
  MoreHorizontal,
} from 'lucide-react';
import {
  useGetAdminProductsQuery,
  useGetAdminCategoriesQuery,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
  useBulkUpdateProductsMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';

const ProductList = () => {
  const navigate = useNavigate();

  // Local state for filtering, sorting and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  const itemsPerPage = 15;

  // Query params for API call
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
      sortBy,
      sortOrder,
    }),
    [
      currentPage,
      searchTerm,
      selectedCategory,
      selectedStatus,
      sortBy,
      sortOrder,
    ]
  );

  // RTK Query hooks
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useGetAdminProductsQuery(queryParams);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAdminCategoriesQuery();

  const [updateProduct] = useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();
  const [bulkUpdateProducts] = useBulkUpdateProductsMutation();

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.data?.categories || [];
  const pagination = productsData?.data?.pagination || {};

  // Filter and sort options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'outOfStock', label: 'Out of Stock' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'category', label: 'Category' },
    { value: 'listingsCount', label: 'Listings' },
    { value: 'updatedAt', label: 'Last Updated' },
  ];

  // Handle sorting
  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setCurrentPage(1);
    },
    [sortBy]
  );

  // Handle product status toggle
  const handleStatusToggle = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateProduct({ id: productId, status: newStatus }).unwrap();
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  // Handle product deletion
  const handleDelete = async (productId) => {
    try {
      await deleteProduct(productId).unwrap();
      setConfirmAction(null);
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Handle bulk operations
  const handleBulkStatusUpdate = async (status) => {
    try {
      const productIds = Array.from(selectedProducts);
      await bulkUpdateProducts({ productIds, updates: { status } }).unwrap();
      setSelectedProducts(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk update products:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const productIds = Array.from(selectedProducts);
      const promises = productIds.map((id) => deleteProduct(id).unwrap());
      await Promise.all(promises);
      setSelectedProducts(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk delete products:', error);
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map((product) => product.id)));
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const statusMap = {
      active: {
        className: 'bg-mint-fresh/20 text-bottle-green',
        icon: CheckCircle,
        text: 'Active',
      },
      inactive: {
        className: 'bg-gray-100 text-gray-600',
        icon: XCircle,
        text: 'Inactive',
      },
      pending: {
        className: 'bg-earthy-yellow/20 text-earthy-brown',
        icon: Clock,
        text: 'Pending',
      },
      outOfStock: {
        className: 'bg-tomato-red/20 text-tomato-red',
        icon: AlertTriangle,
        text: 'Out of Stock',
      },
    };
    return statusMap[status] || statusMap.active;
  };

  // Mobile Card Component
  const ProductCard = ({
    product,
    isSelected,
    onSelect,
    onStatusToggle,
    onEdit,
    onDelete,
  }) => {
    const badge = getStatusBadge(product.status);

    return (
      <Card
        className={`p-4 hover:shadow-lg transition-all duration-300 ${
          isSelected ? 'ring-2 ring-bottle-green/30 bg-bottle-green/5' : ''
        }`}
      >
        {/* Header with selection and actions */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(product.id)}
            className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green mt-1"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(product.id)}
              className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Edit product"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onStatusToggle(product.id, product.status)}
              className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                product.status === 'active'
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  : 'text-green-600 hover:text-green-800 hover:bg-green-100'
              }`}
              title={product.status === 'active' ? 'Deactivate' : 'Activate'}
            >
              {product.status === 'active' ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Product Image and Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-8 h-8" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-text-dark dark:text-white truncate text-lg">
              {product.name}
            </h3>
            {product.sku && (
              <p className="text-sm text-text-muted">SKU: {product.sku}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-bottle-green/20 text-bottle-green">
                <Tag className="w-3 h-3" />
                {getCategoryName(product.category)}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Price */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <badge.icon className="w-4 h-4" />
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 font-medium text-text-dark dark:text-white">
              <DollarSign className="w-4 h-4" />
              {product.price ? `${product.price}/${product.unit}` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="flex items-center justify-between text-sm text-text-muted border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>{product.listingsCount || 0} listings</span>
          </div>
          <div className="text-xs">
            Updated{' '}
            {product.updatedAt
              ? new Date(product.updatedAt).toLocaleDateString()
              : 'Unknown'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => navigate(`/admin/products/${product.id}`)}
            className="flex-1 px-3 py-2 text-sm border border-gray-200 text-text-muted hover:text-bottle-green hover:border-bottle-green rounded-xl transition-colors min-h-[44px] flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={() => onDelete(product)}
            className="px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red hover:text-white border border-tomato-red rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </Card>
    );
  };

  // Table columns configuration
  const columns = [
    {
      id: 'select',
      header: (
        <input
          type="checkbox"
          checked={
            selectedProducts.size === products.length && products.length > 0
          }
          onChange={handleSelectAll}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      cell: (product) => (
        <input
          type="checkbox"
          checked={selectedProducts.has(product.id)}
          onChange={() => handleSelectProduct(product.id)}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      width: '48px',
    },
    {
      id: 'product',
      header: (
        <button
          onClick={() => handleSort('name')}
          className="flex items-center gap-1 font-medium hover:text-bottle-green"
        >
          Product
          {sortBy === 'name' &&
            (sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            ))}
        </button>
      ),
      cell: (product) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0 overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-dark dark:text-white truncate">
              {product.name}
            </p>
            <p className="text-sm text-text-muted truncate">
              SKU: {product.sku || 'N/A'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      width: '300px',
    },
    {
      id: 'category',
      header: (
        <button
          onClick={() => handleSort('category')}
          className="flex items-center gap-1 font-medium hover:text-bottle-green"
        >
          Category
          {sortBy === 'category' &&
            (sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            ))}
        </button>
      ),
      cell: (product) => (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-bottle-green/20 text-bottle-green">
          <Tag className="w-3 h-3" />
          {getCategoryName(product.category)}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'price',
      header: (
        <button
          onClick={() => handleSort('price')}
          className="flex items-center gap-1 font-medium hover:text-bottle-green"
        >
          Base Price
          {sortBy === 'price' &&
            (sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            ))}
        </button>
      ),
      cell: (product) => (
        <div className="flex items-center gap-1 font-medium text-text-dark dark:text-white">
          <DollarSign className="w-3 h-3" />
          {product.price ? `${product.price}/${product.unit}` : 'N/A'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (product) => {
        const badge = getStatusBadge(product.status);
        return (
          <div className="flex items-center gap-1">
            <badge.icon className="w-3 h-3" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
        );
      },
    },
    {
      id: 'listings',
      header: (
        <button
          onClick={() => handleSort('listingsCount')}
          className="flex items-center gap-1 font-medium hover:text-bottle-green"
        >
          Listings
          {sortBy === 'listingsCount' &&
            (sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            ))}
        </button>
      ),
      cell: (product) => (
        <div className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3 text-text-muted" />
          <span className="text-sm font-medium text-text-dark dark:text-white">
            {product.listingsCount || 0}
          </span>
          {product.listingsTrend &&
            (product.listingsTrend > 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            ))}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'updated',
      header: (
        <button
          onClick={() => handleSort('updatedAt')}
          className="flex items-center gap-1 font-medium hover:text-bottle-green"
        >
          Updated
          {sortBy === 'updatedAt' &&
            (sortOrder === 'asc' ? (
              <SortAsc className="w-4 h-4" />
            ) : (
              <SortDesc className="w-4 h-4" />
            ))}
        </button>
      ),
      cell: (product) => (
        <div className="text-sm text-text-muted">
          {product.updatedAt
            ? new Date(product.updatedAt).toLocaleDateString()
            : 'Unknown'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (product) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/admin/products/${product.id}`)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View product"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit product"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleStatusToggle(product.id, product.status)}
            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              product.status === 'active'
                ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                : 'text-green-600 hover:text-green-800 hover:bg-green-100'
            }`}
            title={
              product.status === 'active'
                ? 'Deactivate product'
                : 'Activate product'
            }
          >
            {product.status === 'active' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() =>
              setConfirmAction({
                type: 'delete',
                product,
                title: 'Delete Product',
                message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone and will affect all related listings.`,
                confirmText: 'Delete',
                isDangerous: true,
                onConfirm: () => handleDelete(product.id),
              })
            }
            className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '180px',
    },
  ];

  if (isLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load products"
        description="There was an error loading product data. Please try again."
        action={{
          label: 'Retry',
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Product Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage products, categories, and inventory across the platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Actions - Desktop */}
          {selectedProducts.size > 0 && (
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-text-muted">
                {selectedProducts.size} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-activate',
                    title: 'Bulk Activate Products',
                    message: `Activate ${selectedProducts.size} selected products?`,
                    confirmText: 'Activate',
                    onConfirm: () => handleBulkStatusUpdate('active'),
                  })
                }
                className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
              >
                Activate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-deactivate',
                    title: 'Bulk Deactivate Products',
                    message: `Deactivate ${selectedProducts.size} selected products?`,
                    confirmText: 'Deactivate',
                    onConfirm: () => handleBulkStatusUpdate('inactive'),
                  })
                }
                className="text-gray-600 border-gray-600 hover:bg-gray-600 hover:text-white"
              >
                Deactivate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-delete',
                    title: 'Bulk Delete Products',
                    message: `Permanently delete ${selectedProducts.size} selected products? This action cannot be undone.`,
                    confirmText: 'Delete All',
                    isDangerous: true,
                    onConfirm: handleBulkDelete,
                  })
                }
                className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
              >
                Delete
              </Button>
            </div>
          )}

          <Button
            onClick={() => navigate('/admin/products/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:max-w-md">
              <SearchBar
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Search products by name, SKU, description..."
                className="w-full"
              />
            </div>

            <div className="flex gap-3">
              {/* View Mode Toggle - Hidden on desktop, shown on tablet/mobile */}
              <div className="md:hidden flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    viewMode === 'table'
                      ? 'bg-bottle-green text-white'
                      : 'text-text-muted hover:text-bottle-green'
                  }`}
                  title="Table view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-xl transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    viewMode === 'cards'
                      ? 'bg-bottle-green text-white'
                      : 'text-text-muted hover:text-bottle-green'
                  }`}
                  title="Card view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {(selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <span className="w-2 h-2 bg-bottle-green rounded-full" />
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                  Sort By
                </label>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                    }
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {sortOrder === 'asc' ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Products Display */}
      {viewMode === 'table' ? (
        /* Table View */
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table
              data={products}
              columns={columns}
              emptyState={
                <EmptyState
                  icon={Package}
                  title="No products found"
                  description="No products match your current filters."
                  action={{
                    label: 'Add Product',
                    onClick: () => navigate('/admin/products/create'),
                  }}
                />
              }
            />
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
                totalItems={pagination.totalProducts}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </Card>
      ) : (
        /* Card View */
        <div className="space-y-6">
          {products.length === 0 ? (
            <Card className="p-12">
              <EmptyState
                icon={Package}
                title="No products found"
                description="No products match your current filters."
                action={{
                  label: 'Add Product',
                  onClick: () => navigate('/admin/products/create'),
                }}
              />
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isSelected={selectedProducts.has(product.id)}
                    onSelect={handleSelectProduct}
                    onStatusToggle={handleStatusToggle}
                    onEdit={(id) => navigate(`/admin/products/${id}/edit`)}
                    onDelete={(product) =>
                      setConfirmAction({
                        type: 'delete',
                        product,
                        title: 'Delete Product',
                        message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone and will affect all related listings.`,
                        confirmText: 'Delete',
                        isDangerous: true,
                        onConfirm: () => handleDelete(product.id),
                      })
                    }
                  />
                ))}
              </div>

              {/* Pagination for Card View */}
              {pagination.totalPages > 1 && (
                <Card className="p-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={pagination.totalProducts}
                    itemsPerPage={itemsPerPage}
                  />
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {/* Mobile Bulk Actions - Floating Bottom Bar */}
      {selectedProducts.size > 0 && (
        <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
          <Card className="p-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-text-dark dark:text-white">
                {selectedProducts.size} product
                {selectedProducts.size !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedProducts(new Set())}
                className="p-1 text-text-muted hover:text-text-dark dark:hover:text-white transition-colors"
                title="Clear selection"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-activate',
                    title: 'Bulk Activate Products',
                    message: `Activate ${selectedProducts.size} selected products?`,
                    confirmText: 'Activate',
                    onConfirm: () => handleBulkStatusUpdate('active'),
                  })
                }
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors min-h-[60px] justify-center"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Activate</span>
              </button>

              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-deactivate',
                    title: 'Bulk Deactivate Products',
                    message: `Deactivate ${selectedProducts.size} selected products?`,
                    confirmText: 'Deactivate',
                    onConfirm: () => handleBulkStatusUpdate('inactive'),
                  })
                }
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors min-h-[60px] justify-center"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs font-medium">Deactivate</span>
              </button>

              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'bulk-delete',
                    title: 'Bulk Delete Products',
                    message: `Permanently delete ${selectedProducts.size} selected products? This action cannot be undone.`,
                    confirmText: 'Delete All',
                    isDangerous: true,
                    onConfirm: handleBulkDelete,
                  })
                }
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors min-h-[60px] justify-center"
              >
                <Trash2 className="w-5 h-5" />
                <span className="text-xs font-medium">Delete</span>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          isDangerous={confirmAction.isDangerous}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

export default ProductList;
