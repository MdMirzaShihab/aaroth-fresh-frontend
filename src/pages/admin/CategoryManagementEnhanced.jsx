import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronRight,
  ChevronDown,
  GripVertical,
  Move3D,
  Layers,
  Grid,
  List,
  ArrowUp,
  ArrowDown,
  Archive,
  FolderTree,
  Search,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
  SortableContext as TreeSortableContext,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useReorderCategoriesMutation,
  useUpdateCategoryHierarchyMutation,
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
import CategoryStatistics from '../../components/admin/CategoryStatistics';
import CategoryFilters from '../../components/admin/CategoryFilters';
import CategoryFlagModal from '../../components/admin/CategoryFlagModal';
import CategoryUsageModal from '../../components/admin/CategoryUsageModal';
import SafeDeleteModal from '../../components/admin/SafeDeleteModal';

const CategoryManagementEnhanced = () => {
  const { user } = useSelector((state) => state.auth);
  const [viewMode, setViewMode] = useState('tree'); // 'tree', 'list', 'grid'
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [draggedCategory, setDraggedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Enhanced modal states
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
    hasChildren: undefined,
    page: 1,
    limit: 50, // Increased for tree view
    sortBy: 'sortOrder',
    sortOrder: 'asc',
  });

  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // RTK Query hooks
  const {
    data: categoriesData,
    isLoading,
    error,
    refetch,
  } = useGetAdminCategoriesQuery(filters);

  const [createCategory, { isLoading: isCreating }] = useCreateAdminCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAdminCategoryMutation();
  const [deleteCategory] = useDeleteAdminCategoryMutation();
  const [reorderCategories] = useReorderCategoriesMutation();
  const [updateCategoryHierarchy] = useUpdateCategoryHierarchyMutation();

  const categories = categoriesData?.data || [];
  const totalCount = categoriesData?.total || 0;
  const currentPage = categoriesData?.page || 1;
  const totalPages = categoriesData?.pages || 1;
  const stats = categoriesData?.stats || null;

  // Build category tree structure
  const categoryTree = useMemo(() => {
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => cat.parentCategory?._id === parentId || (!cat.parentCategory && parentId === null))
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map(cat => ({
          ...cat,
          children: buildTree(cat._id),
        }));
    };
    return buildTree();
  }, [categories]);

  // Flatten tree for search
  const flattenTree = useCallback((tree) => {
    const flattened = [];
    const flatten = (nodes, depth = 0) => {
      nodes.forEach(node => {
        flattened.push({ ...node, depth });
        if (node.children && node.children.length > 0) {
          flatten(node.children, depth + 1);
        }
      });
    };
    flatten(tree);
    return flattened;
  }, []);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm && viewMode !== 'tree') return categories;
    if (viewMode === 'tree') return categoryTree;
    
    return categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, categoryTree, searchTerm, viewMode]);

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

  // Handle category expansion in tree view
  const handleToggleExpand = useCallback((categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setDraggedCategory(null);
      return;
    }

    try {
      const activeCategory = categories.find(cat => cat._id === active.id);
      const overCategory = categories.find(cat => cat._id === over.id);
      
      if (!activeCategory || !overCategory) return;

      // Update hierarchy if dropping onto a different parent
      if (activeCategory.parentCategory?._id !== overCategory.parentCategory?._id) {
        await updateCategoryHierarchy({
          categoryId: activeCategory._id,
          newParentId: overCategory.parentCategory?._id || null,
          newSortOrder: overCategory.sortOrder + 1,
        }).unwrap();
      } else {
        // Reorder within same parent
        await reorderCategories({
          categoryId: activeCategory._id,
          newSortOrder: overCategory.sortOrder,
        }).unwrap();
      }
      
      refetch();
    } catch (error) {
      console.error('Failed to reorder categories:', error);
    }
    
    setDraggedCategory(null);
  };

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
      hasChildren: undefined,
      page: 1,
      limit: 50,
      sortBy: 'sortOrder',
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

    if (!nameValue) {
      errors.name = 'Category name is required';
    } else if (nameValue.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    } else if (nameValue.length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description cannot be more than 200 characters';
    }

    if (!editingCategory && !imageFile) {
      errors.image = 'Category image is required';
    }

    if (!user || !user._id) {
      errors.auth = 'User authentication required to create category';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!validateForm()) return;

    try {
      const formDataToSend = new FormData();
      const nameValue = formData.name.trim();
      
      formDataToSend.append('name', nameValue);
      
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }

      formDataToSend.append('isActive', formData.isActive ? 'true' : 'false');
      formDataToSend.append('sortOrder', String(parseInt(formData.sortOrder) || 0));

      if (formData.parentCategory && formData.parentCategory.trim()) {
        formDataToSend.append('parentCategory', formData.parentCategory.trim());
      }

      if (formData.metaTitle && formData.metaTitle.trim()) {
        formDataToSend.append('metaTitle', formData.metaTitle.trim());
      }
      
      if (formData.metaDescription && formData.metaDescription.trim()) {
        formDataToSend.append('metaDescription', formData.metaDescription.trim());
      }
      
      if (formData.metaKeywords && formData.metaKeywords.length > 0) {
        formDataToSend.append('metaKeywords', formData.metaKeywords.join(','));
      }

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingCategory) {
        await updateCategory({
          id: editingCategory._id,
          formData: formDataToSend,
        }).unwrap();
      } else {
        await createCategory(formDataToSend).unwrap();
      }

      resetForm();
    } catch (error) {
      let errorMessage = 'Failed to save category. Please try again.';
      const formFieldErrors = {};

      if (error?.data?.error) {
        errorMessage = error.data.error;
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
      }

      setFormErrors({
        submit: errorMessage,
        ...formFieldErrors,
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

    if (category.image) {
      setImagePreview(category.image);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);

    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  // Handle deletion
  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      setConfirmAction(null);
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/10 to-white p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-bottle-green to-earthy-brown bg-clip-text text-transparent">
              Category Management
            </h1>
            <p className="text-text-muted mt-2 max-w-2xl">
              Organize products with hierarchical categories, drag-and-drop reordering, and tree visualization
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
        </motion.div>

        {/* Statistics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CategoryStatistics stats={stats} isLoading={isLoading} />
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
                { id: 'tree', label: 'Tree View', icon: FolderTree, description: 'Hierarchical tree with drag-drop' },
                { id: 'list', label: 'List View', icon: List, description: 'Flat list with details' },
                { id: 'grid', label: 'Grid View', icon: Grid, description: 'Visual grid layout' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex-1 p-4 rounded-2xl transition-all duration-300 text-left ${
                    viewMode === tab.id
                      ? 'bg-gradient-secondary text-white shadow-lg'
                      : 'hover:bg-earthy-beige/20 text-text-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-5 h-5 ${
                      viewMode === tab.id ? 'text-white' : 'text-bottle-green'
                    }`} />
                    <div>
                      <h3 className={`font-semibold ${
                        viewMode === tab.id ? 'text-white' : 'text-text-dark'
                      }`}>
                        {tab.label}
                      </h3>
                      <p className={`text-sm ${
                        viewMode === tab.id ? 'text-white/80' : 'text-text-muted'
                      }`}>
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CategoryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            isLoading={isLoading}
            resultCount={categories.length}
            totalCount={totalCount}
          />
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'tree' ? (
              <CategoryTreeView
                categories={categoryTree}
                expandedCategories={expandedCategories}
                onToggleExpand={handleToggleExpand}
                onEdit={handleEdit}
                onDelete={handleSafeDelete}
                onFlag={handleFlagCategory}
                onViewUsage={handleViewUsage}
                onDragEnd={handleDragEnd}
                sensors={sensors}
                searchTerm={searchTerm}
              />
            ) : viewMode === 'list' ? (
              <CategoryListView
                categories={filteredCategories}
                onEdit={handleEdit}
                onDelete={handleSafeDelete}
                onFlag={handleFlagCategory}
                onViewUsage={handleViewUsage}
              />
            ) : (
              <CategoryGridView
                categories={filteredCategories}
                onEdit={handleEdit}
                onDelete={handleSafeDelete}
                onFlag={handleFlagCategory}
                onViewUsage={handleViewUsage}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && viewMode !== 'tree' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
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
                    onClick={() => handleFiltersChange({ ...filters, page: currentPage - 1 })}
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
                    onClick={() => handleFiltersChange({ ...filters, page: currentPage + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Create/Edit Category Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={resetForm}
          title={editingCategory ? 'Edit Category' : 'Create New Category'}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Image Upload */}
            <div className="col-span-full">
              <FormField
                label={`Category Image ${!editingCategory ? '*' : ''}`}
                error={formErrors.image}
                description="Upload an image for this category. Max size: 1MB. Supported formats: JPG, PNG, GIF"
              >
                <FileUpload
                  onFileSelect={handleImageUpload}
                  accept="image/*"
                  maxSize={1024 * 1024}
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  hasError={!!formErrors.name}
                />
              </FormField>

              <FormField label="Parent Category">
                <select
                  value={formData.parentCategory || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    parentCategory: e.target.value || null,
                  })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(cat => !editingCategory || cat._id !== editingCategory._id)
                    .map(category => (
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
                  onChange={(e) => setFormData({
                    ...formData,
                    sortOrder: parseInt(e.target.value) || 0,
                  })}
                  placeholder="0"
                  min="0"
                />
              </FormField>

              <div className="flex items-center">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                  />
                  <span className="text-text-dark font-medium">Active Category</span>
                </label>
              </div>
            </div>

            <FormField label="Description">
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional category description"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
              />
            </FormField>

            {/* SEO Fields */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-text-dark">SEO Settings</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Meta Title">
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                    placeholder="SEO title for this category"
                    maxLength={60}
                  />
                </FormField>

                <FormField label="Meta Keywords">
                  <Input
                    value={formData.metaKeywords?.join(', ') || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      metaKeywords: e.target.value
                        .split(',')
                        .map(k => k.trim())
                        .filter(k => k),
                    })}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </FormField>
              </div>

              <FormField label="Meta Description">
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="SEO description for this category"
                  rows={2}
                  maxLength={160}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
                />
              </FormField>
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
                disabled={isCreating || isUpdating || (!editingCategory && !imageFile)}
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
    </div>
  );
};

// Category Tree View Component with Drag & Drop
const CategoryTreeView = ({
  categories,
  expandedCategories,
  onToggleExpand,
  onEdit,
  onDelete,
  onFlag,
  onViewUsage,
  onDragEnd,
  sensors,
  searchTerm,
}) => {
  return (
    <Card className="p-6 glass">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FolderTree className="w-5 h-5 text-bottle-green" />
          <h3 className="text-lg font-semibold text-text-dark">Category Tree</h3>
        </div>
        <div className="text-sm text-text-muted">
          Drag categories to reorder or change hierarchy
        </div>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={TreePine}
          title="No categories found"
          description="No categories match your search criteria."
        />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <CategoryTreeNode
                key={category._id}
                category={category}
                depth={0}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onFlag={onFlag}
                onViewUsage={onViewUsage}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        </DndContext>
      )}
    </Card>
  );
};

// Sortable Tree Node Component
const CategoryTreeNode = ({
  category,
  depth,
  expandedCategories,
  onToggleExpand,
  onEdit,
  onDelete,
  onFlag,
  onViewUsage,
  searchTerm,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.has(category._id);
  const paddingLeft = depth * 24;

  return (
    <div style={style} ref={setNodeRef}>
      <div
        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 ${
          isDragging
            ? 'border-bottle-green bg-bottle-green/5 shadow-lg'
            : 'border-gray-200 hover:border-bottle-green/30 hover:bg-earthy-beige/10'
        }`}
        style={{ paddingLeft: `${paddingLeft + 12}px` }}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-text-muted" />
        </button>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => hasChildren && onToggleExpand(category._id)}
          className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors ${
            hasChildren
              ? 'hover:bg-gray-100 text-text-dark'
              : 'text-transparent'
          }`}
        >
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          )}
        </button>

        {/* Category Image */}
        <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0">
          {category.image ? (
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Tag className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        {/* Category Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-medium truncate ${
              searchTerm && category.name.toLowerCase().includes(searchTerm.toLowerCase())
                ? 'bg-yellow-200'
                : 'text-text-dark'
            }`}>
              {category.name}
            </h4>
            
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
            
            {hasChildren && (
              <span className="bg-bottle-green/10 text-bottle-green text-xs px-2 py-1 rounded-full">
                {category.children.length} children
              </span>
            )}
          </div>
          
          {category.description && (
            <p className="text-sm text-text-muted truncate">
              {category.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
            <span>Level {category.level || 0}</span>
            <span>Order: {category.sortOrder || 0}</span>
            {category.totalProducts > 0 && (
              <span className="text-bottle-green">
                {category.totalProducts} products
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewUsage(category)}
            className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View usage statistics"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onFlag(category)}
            className={`p-2 rounded-lg transition-colors ${
              category.isAvailable === false
                ? 'text-tomato-red hover:bg-tomato-red/20'
                : 'text-text-muted hover:text-amber-600 hover:bg-amber-50'
            }`}
            title={category.isAvailable === false ? 'Category is flagged' : 'Flag category'}
          >
            <Flag className="w-4 h-4" />
          </button>

          <button
            onClick={() => onEdit(category)}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors"
            title="Edit category"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => onDelete(category)}
            className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-2 space-y-2"
          >
            {category.children.map((child) => (
              <CategoryTreeNode
                key={child._id}
                category={child}
                depth={depth + 1}
                expandedCategories={expandedCategories}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onFlag={onFlag}
                onViewUsage={onViewUsage}
                searchTerm={searchTerm}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Category List View Component
const CategoryListView = ({ categories, onEdit, onDelete, onFlag, onViewUsage }) => {
  return (
    <div className="space-y-4">
      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="No categories match your search criteria."
        />
      ) : (
        categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
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
                    </div>

                    {category.description && (
                      <p className="text-sm text-text-muted truncate">
                        {category.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                      <span>Level {category.level || 0}</span>
                      {category.parentCategory && (
                        <span>Parent: {category.parentCategory.name}</span>
                      )}
                      <span>Order: {category.sortOrder || 0}</span>
                      {category.totalProducts > 0 && (
                        <span className="text-bottle-green">
                          {category.totalProducts} products
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onViewUsage(category)}
                    className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View usage statistics"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onFlag(category)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.isAvailable === false
                        ? 'text-tomato-red hover:bg-tomato-red/20'
                        : 'text-text-muted hover:text-amber-600 hover:bg-amber-50'
                    }`}
                    title={category.isAvailable === false ? 'Category is flagged' : 'Flag category'}
                  >
                    <Flag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEdit(category)}
                    className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDelete(category)}
                    className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
};

// Category Grid View Component
const CategoryGridView = ({ categories, onEdit, onDelete, onFlag, onViewUsage }) => {
  return (
    <>
      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="No categories match your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="p-6 hover:shadow-md transition-all duration-300 glass glow-green">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl overflow-hidden mb-4">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Tag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-text-dark mb-2 truncate">
                    {category.name}
                  </h3>

                  {category.description && (
                    <p className="text-sm text-text-muted mb-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
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

                    <span className="bg-bottle-green/10 text-bottle-green text-xs px-2 py-1 rounded-full">
                      Level {category.level || 0}
                    </span>
                  </div>

                  <div className="text-sm text-text-muted mb-4">
                    {category.totalProducts > 0 && (
                      <p className="font-medium text-bottle-green">
                        {category.totalProducts} products
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onViewUsage(category)}
                      className="p-2 text-text-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View usage"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEdit(category)}
                      className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onFlag(category)}
                      className="p-2 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Flag"
                    >
                      <Flag className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(category)}
                      className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
};

export default CategoryManagementEnhanced;