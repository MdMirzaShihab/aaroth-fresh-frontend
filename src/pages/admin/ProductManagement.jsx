import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  Tag,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import {
  useGetAdminProductsQuery,
  useGetAdminCategoriesQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';

const ProductManagement = () => {
  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const itemsPerPage = 10;

  // Query params for API call
  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      category: selectedCategory !== 'all' ? selectedCategory : undefined,
    }),
    [currentPage, searchTerm, selectedCategory]
  );

  // RTK Query hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
    refetch,
  } = useGetAdminProductsQuery(queryParams);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAdminCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] =
    useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.pages || 1;

  // Form state for create/edit modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    variety: '',
    origin: '',
    seasonality: [],
    shelfLife: {
      value: '',
      unit: 'days',
    },
    storageRequirements: {
      temperature: {
        min: '',
        max: '',
        unit: 'celsius',
      },
      humidity: {
        min: '',
        max: '',
      },
      conditions: [],
    },
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
    },
    standardUnits: [
      {
        name: 'kg',
        abbreviation: 'kg',
        baseUnit: true,
        conversionRate: 1,
      },
    ],
    qualityGrades: [
      {
        name: 'Premium',
        description: 'Highest quality grade',
        priceMultiplier: 1.5,
      },
    ],
    tags: [],
    isActive: true,
    isSeasonal: false,
    isOrganic: false,
    isLocallySourced: false,
    images: [],
  });

  const [formErrors, setFormErrors] = useState({});

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

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.category) {
      errors.category = 'Category is required';
    }

    if (!formData.unit.trim()) {
      errors.unit = 'Unit is required';
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      errors.price = 'Valid price is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        unit: formData.unit.trim(),
        price: parseFloat(formData.price),
      };

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...productData }).unwrap();
      } else {
        await createProduct(productData).unwrap();
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        category: '',
        unit: '',
        price: '',
        image: null,
      });
      setFormErrors({});
      setIsCreateModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  // Handle edit
  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      unit: product.unit,
      price: product.price.toString(),
      image: null,
    });
    setEditingProduct(product);
    setIsCreateModalOpen(true);
  };

  // Get category name from ID
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || 'Unknown';
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
      header: 'Product',
      cell: (product) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 flex-shrink-0">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
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
              {product.description || 'No description'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      width: '300px',
    },
    {
      id: 'category',
      header: 'Category',
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
      header: 'Price',
      cell: (product) => (
        <div className="flex items-center gap-1 font-medium text-text-dark dark:text-white">
          <DollarSign className="w-3 h-3" />
          {product.price ? `${product.price}/${product.unit}` : 'N/A'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'listings',
      header: 'Active Listings',
      cell: (product) => (
        <span className="text-sm text-text-muted">
          {product.listingsCount || 0} listings
        </span>
      ),
      sortable: true,
    },
    {
      id: 'updated',
      header: 'Last Updated',
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
            onClick={() => {
              /* Handle view */
            }}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View product"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleEdit(product)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit product"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() =>
              setConfirmAction({
                type: 'delete',
                product,
                title: 'Delete Product',
                message: `Are you sure you want to permanently delete "${product.name}"? This action cannot be undone.`,
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
      width: '120px',
    },
  ];

  if (productsLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (productsError) {
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
            Manage products, categories, and pricing across the platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Bulk Actions */}
          {selectedProducts.size > 0 && (
            <>
              <span className="text-sm text-text-muted">
                {selectedProducts.size} selected
              </span>
              <Button variant="outline" size="sm">
                Bulk Delete
              </Button>
            </>
          )}

          <Button
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                category: '',
                unit: '',
                price: '',
                image: null,
              });
              setEditingProduct(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search products by name..."
              className="w-full"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
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
                  onClick: () => setIsCreateModalOpen(true),
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

      {/* Create/Edit Product Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
          setFormData({
            name: '',
            description: '',
            category: '',
            unit: '',
            price: '',
            image: null,
          });
          setFormErrors({});
        }}
        title={editingProduct ? 'Edit Product' : 'Create New Product'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Product Name" error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter product name"
                hasError={!!formErrors.name}
              />
            </FormField>

            <FormField label="Category" error={formErrors.category}>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`w-full px-4 py-3 border rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 ${
                  formErrors.category
                    ? 'border-tomato-red/30 bg-tomato-red/5'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Unit" error={formErrors.unit}>
              <Input
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                placeholder="e.g., kg, lbs, pieces"
                hasError={!!formErrors.unit}
              />
            </FormField>

            <FormField label="Base Price" error={formErrors.price}>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                hasError={!!formErrors.price}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter product description (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingProduct(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isCreating || isUpdating}>
              {editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>

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

export default ProductManagement;
