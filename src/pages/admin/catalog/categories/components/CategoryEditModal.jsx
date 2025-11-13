import React, { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import FormField from '../../../../../components/ui/FormField';

// API Slices
import {
  useGetAdminCategoriesV2Query,
  useCreateAdminCategoryV2Mutation,
  useUpdateAdminCategoryV2Mutation,
} from '../../../../../store/slices/admin/adminApiSlice';

const CategoryEditModal = ({ category, isOpen, onClose, onSuccess }) => {
  const isEdit = !!category;

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [existingImage, setExistingImage] = useState('');

  // ========================================
  // RTK QUERY HOOKS
  // ========================================

  const { data: categoriesData } = useGetAdminCategoriesV2Query({
    limit: 100,
    status: 'all',
  });

  const [createCategory, { isLoading: isCreating }] =
    useCreateAdminCategoryV2Mutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateAdminCategoryV2Mutation();

  const isSaving = isCreating || isUpdating;
  const categories = categoriesData?.data || [];

  // Filter out current category and its descendants for parent selection
  const availableParents = categories.filter((cat) => {
    if (!isEdit) return true;
    // Don't allow selecting itself or its children as parent
    return cat._id !== category?._id;
  });

  // ========================================
  // INITIALIZE FORM
  // ========================================

  useEffect(() => {
    if (category && isOpen) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategory: category.parentCategory?._id || '',
        isActive: category.isActive !== false,
      });
      setExistingImage(category.image?.url || category.image || '');
      setImagePreview('');
      setImageFile(null);
    } else if (!category && isOpen) {
      // Reset for create mode
      setFormData({
        name: '',
        description: '',
        parentCategory: '',
        isActive: true,
      });
      setExistingImage('');
      setImagePreview('');
      setImageFile(null);
    }
  }, [category, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (!isEdit) {
      setExistingImage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    if (!isEdit && !imageFile && !existingImage) {
      toast.error('Category image is required');
      return;
    }

    try {
      // Prepare FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('isActive', formData.isActive);

      if (formData.parentCategory) {
        formDataToSend.append('parentCategory', formData.parentCategory);
      }

      // Add image if new one selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // Keep existing image if no new image uploaded
      if (isEdit && existingImage && !imageFile) {
        formDataToSend.append('existingImage', existingImage);
      }

      if (isEdit) {
        await updateCategory({
          id: category._id,
          formData: formDataToSend,
        }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(formDataToSend).unwrap();
        toast.success('Category created successfully');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} category`);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  // ========================================
  // RENDER
  // ========================================

  const displayImage = imagePreview || existingImage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Category' : 'Create Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <FormField label="Category Image (Required)">
          <div className="space-y-3">
            {displayImage ? (
              <div className="relative group">
                <div className="aspect-video rounded-2xl overflow-hidden border-2 border-gray-200">
                  <img
                    src={displayImage}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-3 right-3 p-2 bg-tomato-red/90 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-tomato-red"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-muted-olive transition-colors">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-text-dark font-medium mb-1">
                    Click to upload category image
                  </p>
                  <p className="text-sm text-text-muted">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </label>
            )}
            {!displayImage && (
              <p className="text-xs text-tomato-red">
                * Category image is required
              </p>
            )}
          </div>
        </FormField>

        {/* Name */}
        <FormField label="Category Name (Required)">
          <Input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="e.g., Vegetables, Fruits, Dairy"
            required
            minLength={2}
            maxLength={100}
            className="w-full"
          />
          <p className="text-xs text-text-muted mt-1">
            2-100 characters, unique name
          </p>
        </FormField>

        {/* Description */}
        <FormField label="Description (Optional)">
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Brief description of this category..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive resize-none"
          />
          <p className="text-xs text-text-muted mt-1">
            Optional, max 500 characters
          </p>
        </FormField>

        {/* Parent Category */}
        <FormField label="Parent Category (Optional)">
          <select
            value={formData.parentCategory}
            onChange={(e) =>
              setFormData({ ...formData, parentCategory: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
          >
            <option value="">None (Top-level category)</option>
            {availableParents.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.parentCategory ? `${cat.parentCategory.name} > ` : ''}
                {cat.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-text-muted mt-1">
            Select a parent for hierarchical organization
          </p>
        </FormField>

        {/* Active Status */}
        <FormField label="Status">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-muted-olive/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage-green"></div>
            </label>
            <span className="text-sm text-text-dark">
              {formData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Inactive categories won't appear in product selection
          </p>
        </FormField>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-secondary text-white min-w-[120px]"
          >
            {isSaving
              ? 'Saving...'
              : isEdit
              ? 'Update Category'
              : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryEditModal;
