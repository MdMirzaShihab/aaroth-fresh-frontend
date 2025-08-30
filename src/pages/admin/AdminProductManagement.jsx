import React, { useState, useMemo } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Eye,
  AlertTriangle,
  Tag,
  Image as ImageIcon,
  Search,
  Filter,
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
import FileUpload from '../../components/ui/FileUpload';

const AdminProductManagement = () => {
  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const itemsPerPage = 10;

  // Form state for create/edit - Updated to match complete backend Product model
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    variety: '',
    origin: '',
    seasonality: [],
    isOrganic: false,
    isLocallySourced: false,
    isSeasonal: false,
    tags: [],
    searchKeywords: [],
    standardUnits: [
      { name: 'kg', abbreviation: 'kg', baseUnit: true, conversionRate: 1 },
    ],
    qualityGrades: [
      { name: 'Premium', description: 'Highest quality', priceMultiplier: 1.2 },
    ],
    // Storage requirements
    storageRequirements: {
      temperature: { unit: 'celsius' },
      conditions: [],
    },
    // Nutritional info
    nutritionalInfo: {
      vitamins: [],
      minerals: [],
    },
  });

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
    isLoading,
    error,
    refetch,
  } = useGetAdminProductsQuery(queryParams);

  const { data: categoriesData } = useGetAdminCategoriesQuery();

  const [createProduct, { isLoading: isCreating }] =
    useCreateAdminProductMutation();
  const [updateProduct, { isLoading: isUpdating }] =
    useUpdateAdminProductMutation();
  const [deleteProduct] = useDeleteAdminProductMutation();

  // Enhanced data extraction to match backend response structure
  const products = productsData?.data || [];
  const totalProducts = productsData?.total || productsData?.count || 0;
  const totalPages =
    productsData?.pages || Math.ceil(totalProducts / itemsPerPage) || 1;
  const categories = categoriesData?.data || categoriesData || [];

  // Handle image upload
  const handleImageUpload = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required image for new products
    if (!editingProduct && !imageFile) {
      alert('Product image is required');
      return;
    }

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();

      // Append basic product fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('variety', formData.variety);
      formDataToSend.append('origin', formData.origin);
      formDataToSend.append('isOrganic', formData.isOrganic);
      formDataToSend.append('isLocallySourced', formData.isLocallySourced);
      formDataToSend.append('isSeasonal', formData.isSeasonal);

      // Append arrays and objects as JSON strings
      formDataToSend.append(
        'seasonality',
        JSON.stringify(formData.seasonality)
      );
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append(
        'searchKeywords',
        JSON.stringify(formData.searchKeywords)
      );
      formDataToSend.append(
        'standardUnits',
        JSON.stringify(formData.standardUnits)
      );
      formDataToSend.append(
        'qualityGrades',
        JSON.stringify(formData.qualityGrades)
      );
      formDataToSend.append(
        'storageRequirements',
        JSON.stringify(formData.storageRequirements)
      );
      formDataToSend.append(
        'nutritionalInfo',
        JSON.stringify(formData.nutritionalInfo)
      );

      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingProduct) {
        await updateProduct({
          id: editingProduct._id,
          formData: formDataToSend,
        }).unwrap();
      } else {
        await createProduct(formDataToSend).unwrap();
      }

      resetForm();
      setIsCreateModalOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  // Reset form - Updated to match complete backend Product model
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      variety: '',
      origin: '',
      seasonality: [],
      isOrganic: false,
      isLocallySourced: false,
      isSeasonal: false,
      tags: [],
      searchKeywords: [],
      standardUnits: [
        { name: 'kg', abbreviation: 'kg', baseUnit: true, conversionRate: 1 },
      ],
      qualityGrades: [
        {
          name: 'Premium',
          description: 'Highest quality',
          priceMultiplier: 1.2,
        },
      ],
      // Storage requirements
      storageRequirements: {
        temperature: { unit: 'celsius' },
        conditions: [],
      },
      // Nutritional info
      nutritionalInfo: {
        vitamins: [],
        minerals: [],
      },
    });

    // Reset image state
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle edit - Updated to map all backend fields
  const handleEdit = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category?._id || '',
      variety: product.variety || '',
      origin: product.origin || '',
      seasonality: product.seasonality || [],
      isOrganic: product.isOrganic || false,
      isLocallySourced: product.isLocallySourced || false,
      isSeasonal: product.isSeasonal || false,
      tags: product.tags || [],
      searchKeywords: product.searchKeywords || [],
      standardUnits: Array.isArray(product.standardUnits)
        ? product.standardUnits
        : [
            {
              name: 'kg',
              abbreviation: 'kg',
              baseUnit: true,
              conversionRate: 1,
            },
          ],
      qualityGrades: Array.isArray(product.qualityGrades)
        ? product.qualityGrades
        : [
            {
              name: 'Premium',
              description: 'Highest quality',
              priceMultiplier: 1.2,
            },
          ],
      // Storage requirements
      storageRequirements: product.storageRequirements || {
        temperature: { unit: 'celsius' },
        conditions: [],
      },
      // Nutritional info
      nutritionalInfo: product.nutritionalInfo || {
        vitamins: [],
        minerals: [],
      },
    });

    // Set existing image preview
    if (product.image) {
      setImagePreview(product.image);
    } else if (product.images && product.images.length > 0) {
      setImagePreview(product.images[0].url);
    } else {
      setImagePreview(null);
    }
    setImageFile(null); // Reset file input for editing

    setEditingProduct(product);
    setIsCreateModalOpen(true);
  };

  // Handle delete
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
      setSelectedProducts(new Set(products.map((product) => product._id)));
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
          className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
        />
      ),
      cell: (product) => (
        <input
          type="checkbox"
          checked={selectedProducts.has(product._id)}
          onChange={() => handleSelectProduct(product._id)}
          className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
        />
      ),
      width: '48px',
    },
    {
      id: 'product',
      header: 'Product',
      cell: (product) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {product.image || product.images?.[0]?.url ? (
              <img
                src={product.image || product.images[0].url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-dark dark:text-white truncate">
              {product.name}
            </p>
            <p className="text-xs text-text-muted truncate">
              {product.category?.name || 'No Category'}
            </p>
            {product.variety && (
              <p className="text-xs text-muted-olive truncate">
                {product.variety}
              </p>
            )}
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
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-text-muted" />
          <span className="text-sm text-text-dark dark:text-white">
            {product.category?.name || 'No Category'}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      id: 'details',
      header: 'Details',
      cell: (product) => (
        <div className="text-xs space-y-1">
          {product.origin && (
            <div className="text-text-muted">Origin: {product.origin}</div>
          )}
          {product.isOrganic && (
            <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
              Organic
            </span>
          )}
          {product.isLocallySourced && (
            <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs ml-1">
              Local
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'units',
      header: 'Units',
      cell: (product) => (
        <div className="text-sm text-text-muted">
          {product.standardUnits?.map((unit) => unit.name).join(', ') ||
            'No units'}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (product) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.isActive
              ? 'bg-sage-green/20 text-muted-olive'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'adminStatus',
      header: 'Admin Status',
      cell: (product) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            product.adminStatus === 'active'
              ? 'bg-sage-green/20 text-muted-olive'
              : product.adminStatus === 'inactive'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-gray-100 text-gray-600'
          }`}
        >
          {product.adminStatus
            ? product.adminStatus.charAt(0).toUpperCase() +
              product.adminStatus.slice(1)
            : 'Active'}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'created',
      header: 'Created',
      cell: (product) => (
        <div className="text-sm text-text-muted">
          {product.createdAt
            ? new Date(product.createdAt).toLocaleDateString()
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
            onClick={() => handleEdit(product)}
            className="p-2 text-text-muted hover:text-muted-olive hover:bg-muted-olive/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit product"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              // Handle view details
            }}
            className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="View details"
          >
            <Eye className="w-4 h-4" />
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
                onConfirm: () => handleDelete(product._id),
              })
            }
            className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
      width: '140px',
    },
  ];

  if (isLoading) {
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
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Product Management (UPDATED - AdminProductManagement.jsx)
          </h1>
          <p className="text-text-muted mt-1">
            Manage product master data, categories, and specifications - Backend
            Model Aligned
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => {
              resetForm();
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
              placeholder="Search products..."
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-muted-olive/20 min-h-[44px]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Package}
              title="No products found"
              description="No products match your current filters."
              actionLabel="Add Product"
              onAction={() => setIsCreateModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <thead className="bg-earthy-beige/10">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.id}
                      className="px-4 py-3 text-left text-sm font-medium text-text-dark"
                      style={column.width ? { width: column.width } : {}}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product, index) => (
                  <tr
                    key={product._id || index}
                    className="hover:bg-earthy-beige/20 transition-colors duration-200"
                  >
                    {columns.map((column) => (
                      <td key={column.id} className="px-4 py-3">
                        {column.cell(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalProducts}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProduct(null);
          resetForm();
        }}
        title={editingProduct ? 'Edit Product' : 'Create Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Image Upload - Full Width */}
          <div className="col-span-full">
            <FormField
              label={`Product Image ${!editingProduct ? '*' : ''}`}
              description="Upload an image for this product. Max size: 1MB. Supported formats: JPG, PNG, GIF"
            >
              <FileUpload
                onFileSelect={handleImageUpload}
                accept="image/*"
                maxSize={1024 * 1024} // 1MB
                maxFiles={1}
                multiple={false}
                className="w-full"
              >
                <div className="text-center py-8">
                  {imagePreview ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-2xl border-2 border-gray-200"
                      />
                      <p className="text-sm text-text-muted">
                        Click or drag to replace image
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-earthy-beige/30 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-text-dark mb-2">
                          Upload Product Image{!editingProduct && ' *'}
                        </p>
                        <p className="text-sm text-text-muted">
                          Drag and drop an image or click to select
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </FileUpload>
            </FormField>
          </div>

          <FormField label="Product Name" required>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter product name"
              required
            />
          </FormField>

          <FormField label="Description" required>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter product description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              required
            />
          </FormField>

          <FormField label="Category" required>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Variety">
              <Input
                value={formData.variety}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, variety: e.target.value }))
                }
                placeholder="e.g., Roma, Beefsteak"
              />
            </FormField>

            <FormField label="Origin">
              <Input
                value={formData.origin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, origin: e.target.value }))
                }
                placeholder="e.g., Local, California"
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isOrganic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isOrganic: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
              />
              <span className="text-sm text-text-dark dark:text-white">
                Organic
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isLocallySourced}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isLocallySourced: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
              />
              <span className="text-sm text-text-dark dark:text-white">
                Locally Sourced
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isSeasonal}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isSeasonal: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
              />
              <span className="text-sm text-text-dark dark:text-white">
                Seasonal Product
              </span>
            </label>
          </div>

          <FormField label="Tags">
            <Input
              value={formData.tags.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tags: e.target.value
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="Enter tags separated by commas (e.g., fresh, premium, local)"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isCreating || isUpdating || (!editingProduct && !imageFile)
              }
            >
              {isCreating || isUpdating
                ? 'Saving...'
                : editingProduct
                  ? 'Update Product'
                  : 'Create Product'}
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

export default AdminProductManagement;
