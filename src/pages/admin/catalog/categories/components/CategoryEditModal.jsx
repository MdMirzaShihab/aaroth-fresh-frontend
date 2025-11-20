/**
 * CategoryEditModal - Enhanced Design V2
 * Beautiful modal for creating and editing product categories
 * Features: Glassmorphism, smooth animations, enhanced UX
 */

import React, { useState, useEffect } from 'react';
import { FolderOpen, Info, Settings, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// UI Components
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import FormField from '../../../../../components/ui/FormField';
import ImageUploadZone from '../../../../../components/ui/ImageUploadZone';
import FormSection from '../../../../../components/ui/FormSection';

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
  const [existingImage, setExistingImage] = useState('');
  const [errors, setErrors] = useState({});

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
      setImageFile(null);
    }
    setErrors({});
  }, [category, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name must not exceed 100 characters';
    }

    if (!isEdit && !imageFile && !existingImage) {
      newErrors.image = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
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
        toast.success('Category updated successfully! 🎉');
      } else {
        await createCategory(formDataToSend).unwrap();
        toast.success('Category created successfully! 🎉');
      }

      onSuccess();
    } catch (error) {
      console.error('Submit error:', error);

      // Better error handling
      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} category`;

      if (error?.data?.error) {
        errorMessage = error.data.error;
        // Check for duplicate name
        if (error.data.error.includes('Duplicate') || error.data.stack?.includes('E11000')) {
          errorMessage = `A category with the name "${formData.name}" already exists. Please use a different name.`;
          setErrors({ name: 'This category name is already in use' });
        }
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      toast.error(errorMessage);
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

  const displayImage = imageFile || existingImage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive to-sage-green flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-dark">
              {isEdit ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-sm text-text-muted">
              {isEdit
                ? 'Update category details and settings'
                : 'Add a new product category to your catalog'}
            </p>
          </div>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <FormSection
          title="Category Image"
          description="Upload a representative image for this category"
          icon={null}
          variant="glass"
        >
          <ImageUploadZone
            value={displayImage}
            onChange={setImageFile}
            onRemove={() => {
              setImageFile(null);
              if (!isEdit) setExistingImage('');
            }}
            required={!isEdit}
            label=""
            maxSize={5 * 1024 * 1024}
          />
          {errors.image && (
            <p className="text-sm text-tomato-red mt-2 flex items-center gap-1">
              {errors.image}
            </p>
          )}
        </FormSection>

        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          description="Category name and description"
          icon={Info}
          variant="glass"
        >
          {/* Name */}
          <FormField label="Category Name" required error={errors.name}>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Vegetables, Fruits, Dairy Products"
              minLength={2}
              maxLength={100}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-text-muted">
                Must be unique and descriptive
              </p>
              <p className="text-xs text-text-muted">
                {formData.name.length}/100
              </p>
            </div>
          </FormField>

          {/* Description */}
          <FormField label="Description (Optional)">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of this category..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive resize-none transition-all"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-text-muted">
                Helps users understand what products belong here
              </p>
              <p className="text-xs text-text-muted">
                {formData.description.length}/500
              </p>
            </div>
          </FormField>
        </FormSection>

        {/* Organization Settings */}
        <FormSection
          title="Organization"
          description="Configure category hierarchy and status"
          icon={Settings}
          variant="glass"
        >
          {/* Parent Category */}
          <FormField label="Parent Category (Optional)">
            <select
              name="parentCategory"
              value={formData.parentCategory}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all"
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
              Create sub-categories by selecting a parent
            </p>
          </FormField>

          {/* Active Status */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-sage-green/20 bg-mint-fresh/5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
            />
            <label htmlFor="isActive" className="flex-1 cursor-pointer">
              <div className="font-medium text-text-dark">
                Active Category
              </div>
              <p className="text-sm text-text-muted">
                Active categories are visible to vendors and can be used for products
              </p>
            </label>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-secondary text-white min-w-[120px] flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEdit ? 'Update Category' : 'Create Category'}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Modal>
  );
};

export default CategoryEditModal;
