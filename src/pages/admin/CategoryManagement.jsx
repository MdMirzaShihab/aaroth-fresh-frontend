import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  Package,
  TreePine,
  Hash,
  Users,
  TrendingUp,
  Eye,
  Save,
  Image as ImageIcon,
  Flag,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import {
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import FileUpload from '../../components/ui/FileUpload';

// Import new components
import CategoryStatistics from '../../components/admin/CategoryStatistics';
import CategoryFilters from '../../components/admin/CategoryFilters';
import CategoryFlagModal from '../../components/admin/CategoryFlagModal';
import CategoryUsageModal from '../../components/admin/CategoryUsageModal';
import SafeDeleteModal from '../../components/admin/SafeDeleteModal';

const CategoryManagement = () => {
  // Get current user for createdBy field
  const { user } = useSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // New modal states
  const [flagModalData, setFlagModalData] = useState({
    isOpen: false,
    category: null,
  });
  const [usageModalData, setUsageModalData] = useState({
    isOpen: false,
    category: null,
  });
  const [deleteModalData, setDeleteModalData] = useState({
    isOpen: false,
    category: null,
  });

  // Enhanced filters state
  const [filters, setFilters] = useState({
    search: '',
    isActive: undefined,
    isAvailable: undefined,
    adminStatus: '',
    level: undefined,
    page: 1,
    limit: 20,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // RTK Query hooks
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useGetAdminCategoriesQuery(filters);

  const [createCategory, { isLoading: isCreating }] =
    useCreateAdminCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateAdminCategoryMutation();
  const [deleteCategory] = useDeleteAdminCategoryMutation();

  const categories = categoriesData?.data || [];
  const totalCount = categoriesData?.total || 0;
  const currentPage = categoriesData?.page || 1;
  const totalPages = categoriesData?.pages || 1;

  // Use backend-provided statistics
  const stats = categoriesData?.stats || null;

  // Form state for create/edit modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    parentCategory: null,
    level: 0,
    isActive: true,
    sortOrder: 0,
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
  });

  const [formErrors, setFormErrors] = useState({});

  // Handle image upload
  const handleImageUpload = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      isActive: undefined,
      isAvailable: undefined,
      adminStatus: '',
      level: undefined,
      page: 1,
      limit: 20,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  // Handle modal operations
  const handleFlagCategory = (category) => {
    setFlagModalData({ isOpen: true, category });
  };

  const handleViewUsage = (category) => {
    setUsageModalData({ isOpen: true, category });
  };

  const handleSafeDelete = (category) => {
    setDeleteModalData({ isOpen: true, category });
  };

  const handleModalSuccess = () => {
    refetch();
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    const nameValue = formData.name.trim();

    // Check name field
    if (!nameValue) {
      errors.name = 'Category name is required';
    } else if (nameValue.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (nameValue.length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }

    // Check description length (align with backend validation: 200 chars)
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description cannot be more than 200 characters';
    }

    // Validate image for new categories
    if (!editingCategory && !imageFile) {
      errors.image = 'Category image is required';
    }

    // Check if user is authenticated (backend will add createdBy automatically)
    if (!user || !user._id) {
      errors.auth = 'User authentication required to create category';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      // Create FormData for multipart upload
      const formDataToSend = new FormData();
      
      // Add required fields - ensure name is properly set
      const nameValue = formData.name.trim();
      if (!nameValue) {
        throw new Error('Name value is empty after trimming');
      }
      formDataToSend.append('name', nameValue);
      
      // Add description (optional)
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      
      // Add boolean and number fields (FormData converts everything to strings)
      formDataToSend.append('isActive', formData.isActive ? 'true' : 'false');
      formDataToSend.append('sortOrder', String(parseInt(formData.sortOrder) || 0));
      
      // Add parent category if selected
      if (formData.parentCategory && formData.parentCategory.trim()) {
        formDataToSend.append('parentCategory', formData.parentCategory.trim());
      }

      // Add SEO fields (optional)
      if (formData.metaTitle && formData.metaTitle.trim()) {
        formDataToSend.append('metaTitle', formData.metaTitle.trim());
      }
      if (formData.metaDescription && formData.metaDescription.trim()) {
        formDataToSend.append('metaDescription', formData.metaDescription.trim());
      }
      if (formData.metaKeywords && formData.metaKeywords.length > 0) {
        // Send as comma-separated string instead of JSON
        formDataToSend.append('metaKeywords', formData.metaKeywords.join(','));
      }

      // Add image file if selected (required for new categories)
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // FormData is ready for submission

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          formData: formDataToSend,
        }).unwrap();
      } else {
        await createCategory(formDataToSend).unwrap();
      }

      // Reset form and close modal
      resetForm();
    } catch (error) {
      // Parse backend validation errors
      let errorMessage = 'Failed to save category. Please try again.';
      const formFieldErrors = {};
      
      if (error?.data?.error) {
        errorMessage = error.data.error;
        
        // Parse specific field errors from backend message
        const errorText = error.data.error.toLowerCase();
        if (errorText.includes('name is required') || errorText.includes('category name')) {
          formFieldErrors.name = 'Category name is required and must be 2-50 characters';
        }
        if (errorText.includes('image')) {
          formFieldErrors.image = 'Category image is required - upload an image file';
        }
        if (errorText.includes('description')) {
          formFieldErrors.description = 'Description cannot exceed 200 characters';
        }
        if (errorText.includes('unique') && errorText.includes('name')) {
          formFieldErrors.name = 'Category name already exists - choose a different name';
        }
      } else if (error?.status === 400) {
        errorMessage = 'Validation failed - please check your input';
      } else if (error?.status === 401) {
        errorMessage = 'Authentication failed - please log in again';
      } else if (error?.status === 500) {
        errorMessage = 'Server error - please try again later';
      }
      
      setFormErrors({ 
        submit: errorMessage,
        ...formFieldErrors 
      });
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: '',
      parentCategory: null,
      level: 0,
      isActive: true,
      sortOrder: 0,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: [],
    });
    setFormErrors({});
    setImageFile(null);
    setImagePreview(null);
    setIsCreateModalOpen(false);
    setEditingCategory(null);
  };

  // Handle edit
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      image: category.image || '',
      parentCategory: category.parentCategory?._id || null,
      level: category.level || 0,
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
      metaTitle: category.metaTitle || '',
      metaDescription: category.metaDescription || '',
      metaKeywords: category.metaKeywords || [],
    });

    // Set existing image preview
    if (category.image) {
      setImagePreview(category.image);
    } else {
      setImagePreview(null);
    }
    setImageFile(null); // Reset file input for editing

    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  // Handle deletion
  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      setConfirmAction(null);
    } catch (error) {
      // Handle deletion error - this would typically show a toast notification
      setFormErrors({ delete: 'Failed to delete category. Please try again.' });
    }
  };


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
        title="Failed to load categories"
        description="There was an error loading category data. Please try again."
        actionLabel="Retry"
        onAction={refetch}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Category Management
          </h1>
          <p className="text-text-muted mt-1">
            Organize products into categories and subcategories
          </p>
        </div>

        <Button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Statistics Dashboard */}
      <CategoryStatistics stats={stats} isLoading={isLoading} />

      {/* Enhanced Filters */}
      <CategoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        isLoading={isLoading}
        resultCount={categories.length}
        totalCount={totalCount}
      />

      {/* Categories */}
      {categories.length === 0 && !isLoading ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="No categories match your search criteria."
          actionLabel="Add Category"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card
              key={category._id}
              className="p-4 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Category Image */}
                  <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Tag className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-dark truncate">
                        {category.name}
                      </h3>

                      {/* Status badges */}
                      {!category.isActive && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      )}

                      {category.isAvailable === false && (
                        <span className="bg-tomato-red/10 text-tomato-red text-xs px-2 py-1 rounded-full">
                          Flagged
                        </span>
                      )}

                      {category.adminStatus && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.adminStatus === 'active'
                            ? 'bg-mint-fresh/10 text-mint-fresh'
                            : category.adminStatus === 'disabled'
                            ? 'bg-gray-100 text-gray-600'
                            : category.adminStatus === 'deprecated'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {category.adminStatus}
                        </span>
                      )}
                    </div>

                    {category.description && (
                      <p className="text-sm text-text-muted truncate">
                        {category.description}
                      </p>
                    )}

                    <div className="space-y-2 mt-2">
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        <span>Level {category.level || 0}</span>
                        {category.parentCategory && (
                          <span>Parent: {category.parentCategory.name}</span>
                        )}
                        <span>Order: {category.sortOrder || 0}</span>
                        {category.slug && (
                          <span>Slug: {category.slug}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-text-muted">
                        {category.createdAt && (
                          <span>
                            Created{' '}
                            {new Date(category.createdAt).toLocaleDateString()}
                            {category.createdBy && (
                              <span className="ml-1">by {category.createdBy.name || category.createdBy.phone}</span>
                            )}
                          </span>
                        )}
                        {category.updatedAt && category.updatedAt !== category.createdAt && (
                          <span>
                            Updated{' '}
                            {new Date(category.updatedAt).toLocaleDateString()}
                            {category.updatedBy && (
                              <span className="ml-1">by {category.updatedBy.name || category.updatedBy.phone}</span>
                            )}
                          </span>
                        )}
                      </div>
                      
                      {/* Flag information */}
                      {category.isAvailable === false && category.flaggedBy && (
                        <div className="text-xs text-tomato-red bg-tomato-red/10 px-2 py-1 rounded">
                          Flagged by {category.flaggedBy.name || category.flaggedBy.phone}
                          {category.flagReason && (
                            <span className="ml-2">Reason: {category.flagReason}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleViewUsage(category)}
                    className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="View usage statistics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleFlagCategory(category)}
                    className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                      category.isAvailable === false
                        ? 'text-tomato-red hover:bg-tomato-red/20'
                        : 'text-text-muted hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    title={
                      category.isAvailable === false
                        ? 'Category is flagged'
                        : 'Flag category'
                    }
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Edit category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleSafeDelete(category)}
                    className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-text-muted">
              Showing {(currentPage - 1) * filters.limit + 1} to{' '}
              {Math.min(currentPage * filters.limit, totalCount)} of{' '}
              {totalCount} categories
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || isLoading}
                onClick={() =>
                  handleFiltersChange({ ...filters, page: currentPage - 1 })
                }
              >
                Previous
              </Button>

              <span className="text-sm text-text-muted px-3">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || isLoading}
                onClick={() =>
                  handleFiltersChange({ ...filters, page: currentPage + 1 })
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={resetForm}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Image Upload - Full Width */}
          <div className="col-span-full">
            <FormField
              label={`Category Image ${!editingCategory ? '*' : ''}`}
              error={formErrors.image}
              description="Upload an image for this category. Max size: 1MB. Supported formats: JPG, PNG, GIF"
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
                        alt="Category preview"
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
                          Upload Category Image{!editingCategory && ' *'}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Category Name *" error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter category name"
                hasError={!!formErrors.name}
              />
            </FormField>

            <FormField label="Parent Category">
              <select
                value={formData.parentCategory || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parentCategory: e.target.value || null,
                  })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200"
              >
                <option value="">None (Root Category)</option>
                {categories
                  .filter(
                    (cat) => !editingCategory || cat._id !== editingCategory._id
                  )
                  .map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name} (Level {category.level || 0})
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Sort Order">
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min="0"
              />
            </FormField>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                />
                <span className="text-text-dark font-medium">
                  Active Category
                </span>
              </label>
            </div>
          </div>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional category description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
            />
          </FormField>

          {/* SEO Fields */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-text-dark">
              SEO Settings
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Meta Title">
                <Input
                  value={formData.metaTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, metaTitle: e.target.value })
                  }
                  placeholder="SEO title for this category"
                  maxLength={60}
                />
              </FormField>

              <FormField label="Meta Keywords">
                <Input
                  value={formData.metaKeywords?.join(', ') || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      metaKeywords: e.target.value
                        .split(',')
                        .map((k) => k.trim())
                        .filter((k) => k),
                    })
                  }
                  placeholder="keyword1, keyword2, keyword3"
                />
              </FormField>
            </div>

            <FormField label="Meta Description">
              <textarea
                value={formData.metaDescription}
                onChange={(e) =>
                  setFormData({ ...formData, metaDescription: e.target.value })
                }
                placeholder="SEO description for this category"
                rows={2}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
              />
            </FormField>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-2xl">
            <p className="text-sm text-text-muted mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-10 h-10 rounded-2xl object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-200 rounded-2xl flex items-center justify-center">
                  <Tag className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <p className="font-medium text-text-dark">
                  {formData.name || 'Category Name'}
                </p>
                {formData.description && (
                  <p className="text-sm text-text-muted">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Errors Display */}
          {(formErrors.submit || formErrors.auth) && (
            <div className="p-4 bg-tomato-red/10 border border-tomato-red/20 rounded-2xl">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-tomato-red flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-tomato-red mb-1">
                    Error Creating Category
                  </h4>
                  <p className="text-sm text-tomato-red/80">
                    {formErrors.submit || formErrors.auth}
                  </p>
                  {formErrors.name && (
                    <p className="text-sm text-tomato-red/80 mt-1">
                      • Name: {formErrors.name}
                    </p>
                  )}
                  {formErrors.image && (
                    <p className="text-sm text-tomato-red/80 mt-1">
                      • Image: {formErrors.image}
                    </p>
                  )}
                  {formErrors.description && (
                    <p className="text-sm text-tomato-red/80 mt-1">
                      • Description: {formErrors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreating || isUpdating}
              disabled={
                isCreating || isUpdating || (!editingCategory && !imageFile)
              }
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isCreating || isUpdating
                ? 'Saving...'
                : editingCategory
                  ? 'Update Category'
                  : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Enhanced Modals */}
      <CategoryFlagModal
        isOpen={flagModalData.isOpen}
        onClose={() => setFlagModalData({ isOpen: false, category: null })}
        category={flagModalData.category}
        onSuccess={handleModalSuccess}
      />

      <CategoryUsageModal
        isOpen={usageModalData.isOpen}
        onClose={() => setUsageModalData({ isOpen: false, category: null })}
        category={usageModalData.category}
      />

      <SafeDeleteModal
        isOpen={deleteModalData.isOpen}
        onClose={() => setDeleteModalData({ isOpen: false, category: null })}
        category={deleteModalData.category}
        onSuccess={handleModalSuccess}
      />

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

export default CategoryManagement;
