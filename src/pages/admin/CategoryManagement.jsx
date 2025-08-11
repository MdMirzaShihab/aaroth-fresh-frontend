import React, { useState } from 'react';
import { 
  useGetAdminCategoriesQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation
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
  Save
} from 'lucide-react';

const CategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // RTK Query hooks
  const { 
    data: categoriesData, 
    isLoading, 
    error,
    refetch 
  } = useGetAdminCategoriesQuery();

  const [createCategory, { isLoading: isCreating }] = useCreateAdminCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateAdminCategoryMutation();
  const [deleteCategory] = useDeleteAdminCategoryMutation();

  const categories = categoriesData?.data?.categories || [];

  // Form state for create/edit modal
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#10B981',
    isActive: true,
    sortOrder: 0,
    parentId: null
  });

  const [formErrors, setFormErrors] = useState({});

  // Filter categories based on search
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }
    
    if (formData.name.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }
    
    if (formData.name.length > 50) {
      errors.name = 'Category name must be less than 50 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim(),
        color: formData.color,
        isActive: formData.isActive,
        sortOrder: parseInt(formData.sortOrder) || 0,
        parentId: formData.parentId || null
      };

      if (editingCategory) {
        await updateCategory({ id: editingCategory.id, ...categoryData }).unwrap();
      } else {
        await createCategory(categoryData).unwrap();
      }

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#10B981',
        isActive: true,
        sortOrder: 0,
        parentId: null
      });
      setFormErrors({});
      setIsCreateModalOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  // Handle edit
  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#10B981',
      isActive: category.isActive !== false,
      sortOrder: category.sortOrder || 0,
      parentId: category.parentId || null
    });
    setEditingCategory(category);
    setIsCreateModalOpen(true);
  };

  // Handle deletion
  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId).unwrap();
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  // Get category hierarchy
  const getCategoryHierarchy = () => {
    const categoryMap = new Map();
    const rootCategories = [];

    // Create a map of categories
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build hierarchy
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id);
      if (category.parentId && categoryMap.has(category.parentId)) {
        categoryMap.get(category.parentId).children.push(categoryWithChildren);
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  };

  // Render category tree
  const renderCategoryTree = (categories, level = 0) => {
    return categories.map(category => (
      <div key={category.id}>
        <Card className={`p-4 ${level > 0 ? `ml-${level * 6}` : ''} hover:shadow-md transition-shadow duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {/* Category Icon and Color */}
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: category.color || '#10B981' }}
              >
                {category.icon ? (
                  <span>{category.icon}</span>
                ) : (
                  <Tag className="w-5 h-5" />
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-text-dark dark:text-white truncate">
                    {category.name}
                  </h3>
                  {!category.isActive && (
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      Inactive
                    </span>
                  )}
                  {category.children && category.children.length > 0 && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <TreePine className="w-3 h-3" />
                      {category.children.length} subcategories
                    </span>
                  )}
                </div>
                
                {category.description && (
                  <p className="text-sm text-text-muted truncate">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    {category.productCount || 0} products
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    Order: {category.sortOrder || 0}
                  </span>
                  {category.createdAt && (
                    <span>
                      Created {new Date(category.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {/* Handle view products */}}
                className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="View products"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Edit category"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setConfirmAction({
                  type: 'delete',
                  category,
                  title: 'Delete Category',
                  message: `Are you sure you want to delete "${category.name}"? This action cannot be undone and may affect related products.`,
                  confirmText: 'Delete',
                  isDangerous: true,
                  onConfirm: () => handleDelete(category.id)
                })}
                className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Delete category"
                disabled={(category.productCount || 0) > 0}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>

        {/* Render children */}
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
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
        action={{
          label: "Retry",
          onClick: refetch
        }}
      />
    );
  }

  const categoryHierarchy = getCategoryHierarchy();

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
            setFormData({
              name: '',
              description: '',
              icon: '',
              color: '#10B981',
              isActive: true,
              sortOrder: 0,
              parentId: null
            });
            setEditingCategory(null);
            setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search categories..."
              className="w-full"
            />
          </div>
          
          <div className="text-sm text-text-muted">
            {filteredCategories.length} of {categories.length} categories
          </div>
        </div>
      </Card>

      {/* Categories */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories found"
          description="No categories match your search criteria."
          action={{
            label: "Add Category",
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      ) : (
        <div className="space-y-4">
          {renderCategoryTree(searchTerm ? filteredCategories : categoryHierarchy)}
        </div>
      )}

      {/* Create/Edit Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingCategory(null);
          setFormData({
            name: '',
            description: '',
            icon: '',
            color: '#10B981',
            isActive: true,
            sortOrder: 0,
            parentId: null
          });
          setFormErrors({});
        }}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Category Name" error={formErrors.name}>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                hasError={!!formErrors.name}
              />
            </FormField>

            <FormField label="Parent Category">
              <select
                value={formData.parentId || ''}
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value || null })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200"
              >
                <option value="">None (Root Category)</option>
                {categories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="Icon (Emoji or Unicode)">
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🥬 or leave empty"
                maxLength={2}
              />
            </FormField>

            <FormField label="Color">
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-12 border border-gray-200 dark:border-gray-700 rounded-xl"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="#10B981"
                  className="flex-1"
                />
              </div>
            </FormField>

            <FormField label="Sort Order">
              <Input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
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
                <span className="text-text-dark dark:text-white font-medium">
                  Active Category
                </span>
              </label>
            </div>
          </div>

          <FormField label="Description">
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional category description"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
            />
          </FormField>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
            <p className="text-sm text-text-muted mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: formData.color }}
              >
                {formData.icon || <Tag className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-medium text-text-dark dark:text-white">
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

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setEditingCategory(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isCreating || isUpdating}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {editingCategory ? 'Update Category' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
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