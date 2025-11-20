/**
 * ProductEditModal - Enhanced Design V2
 * Beautiful modal for creating and editing products
 * Features: Multiple images, glassmorphism, smooth animations, enhanced UX
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  Info,
  Image as ImageIcon,
  Settings,
  Check,
  Loader,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// UI Components
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import FormField from '../../../../../components/ui/FormField';
import ImageUploadZone from '../../../../../components/ui/ImageUploadZone';
import FormSection from '../../../../../components/ui/FormSection';

// API Slices
import {
  useCreateAdminProductV2Mutation,
  useUpdateAdminProductV2Mutation,
  useGetAdminCategoriesV2Query,
} from '../../../../../store/slices/admin/adminApiSlice';

const ProductEditModal = ({ product, isOpen, onClose, onSuccess }) => {
  const isEdit = !!product;

  // ========================================
  // STATE MANAGEMENT
  // ========================================

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
  });

  const [images, setImages] = useState([]); // Array of { file, url, isPrimary }
  const [existingImages, setExistingImages] = useState([]);
  const [errors, setErrors] = useState({});

  // ========================================
  // RTK QUERY HOOKS
  // ========================================

  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductV2Mutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductV2Mutation();
  const { data: categoriesData } = useGetAdminCategoriesV2Query({ limit: 100 });

  const categories = categoriesData?.data || [];
  const isSaving = isCreating || isUpdating;

  // Check if selected category is available
  const selectedCategory = categories.find((cat) => cat._id === formData.category);
  const isCategoryInactive = selectedCategory && !selectedCategory.isActive;
  const isCategoryUnavailable = selectedCategory && selectedCategory.isAvailable === false;
  const hasCategoryIssue = isCategoryInactive || isCategoryUnavailable;

  // ========================================
  // INITIALIZE FORM
  // ========================================

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      setExistingImages(product.images || []);
      setImages([]);
    } else if (!product && isOpen) {
      setFormData({
        name: '',
        description: '',
        category: '',
        isActive: true,
      });
      setExistingImages([]);
      setImages([]);
    }
    setErrors({});
  }, [product, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Combine existing and new images for the component
  const allImages = [...existingImages, ...images];

  const handleImagesChange = (updatedImages) => {
    // Separate existing and new images
    const existingCount = existingImages.length;
    const updatedExisting = updatedImages.slice(0, existingCount);
    const updatedNew = updatedImages.slice(existingCount).map((img, index) => ({
      ...img,
      file: img.file || images[index]?.file,
    }));

    setExistingImages(updatedExisting);
    setImages(updatedNew);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Product name must be at least 2 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    const totalImages = existingImages.length + images.length;
    if (totalImages === 0) {
      newErrors.images = 'At least one product image is required';
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
      const formDataToSend = new FormData();

      // Append form fields
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isActive', formData.isActive);

      // Append new images
      images.forEach((img) => {
        if (img.file) {
          formDataToSend.append('images', img.file);
        }
      });

      if (isEdit) {
        // For edit mode, include existing images if any
        if (existingImages.length > 0) {
          formDataToSend.append('existingImages', JSON.stringify(existingImages));
        }

        await updateProduct({
          id: product._id,
          formData: formDataToSend,
        }).unwrap();
        toast.success('Product updated successfully! 🎉');
      } else {
        await createProduct(formDataToSend).unwrap();
        toast.success('Product created successfully! 🎉');
      }

      // Clean up object URLs
      images.forEach((img) => {
        if (img.file) {
          URL.revokeObjectURL(img.url);
        }
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);

      let errorMessage = `Failed to ${isEdit ? 'update' : 'create'} product`;

      if (error?.data?.error) {
        errorMessage = error.data.error;
        if (error.data.error.includes('Duplicate') || error.data.stack?.includes('E11000')) {
          errorMessage = `A product with the name "${formData.name}" already exists. Please use a different name.`;
          setErrors({ name: 'This product name is already in use' });
        }
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      toast.error(errorMessage);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive to-sage-green flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-dark">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h2>
            <p className="text-sm text-text-muted">
              {isEdit
                ? 'Update product details and images'
                : 'Add a new product to your catalog'}
            </p>
          </div>
        </div>
      }
      size="lg"
      contentClassName="!px-0"
    >
      <form onSubmit={handleSubmit} className="space-y-6 px-6">
        {/* Image Upload Section */}
        <FormSection
          title="Product Images"
          description="Upload up to 5 images - first image will be the primary"
          icon={ImageIcon}
          variant="glass"
        >
          <ImageUploadZone
            values={allImages}
            onMultipleChange={handleImagesChange}
            multiple
            maxFiles={5}
            required
            label=""
          />
          {errors.images && (
            <p className="text-sm text-tomato-red mt-2">{errors.images}</p>
          )}
        </FormSection>

        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          description="Product name and description"
          icon={Info}
          variant="glass"
        >
          <div className="space-y-4">
            {/* Product Name */}
            <FormField label="Product Name" required error={errors.name}>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Fresh Organic Tomatoes, Red Onions"
                minLength={2}
                maxLength={100}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green transition-all bg-white/50"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-muted">
                  Clear and descriptive product name
                </p>
                <p className={`text-xs font-medium ${formData.name.length > 90 ? 'text-earthy-yellow' : 'text-text-muted'}`}>
                  {formData.name.length}/100
                </p>
              </div>
            </FormField>

            {/* Description */}
            <FormField label="Description" required error={errors.description}>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe the product, its quality, origin, or unique features..."
                rows={4}
                minLength={10}
                maxLength={500}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green resize-none transition-all bg-white/50 leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-muted">
                  Help vendors understand what they're selling
                </p>
                <p className={`text-xs font-medium ${formData.description.length > 450 ? 'text-earthy-yellow' : 'text-text-muted'}`}>
                  {formData.description.length}/500
                </p>
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Classification */}
        <FormSection
          title="Classification"
          description="Categorize and configure product availability"
          icon={Settings}
          variant="glass"
        >
          <div className="space-y-4">
            {/* Category */}
            <FormField label="Category" required error={errors.category}>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border-2 rounded-2xl focus:ring-2 focus:ring-sage-green/20 transition-all appearance-none bg-white/50 cursor-pointer ${
                    hasCategoryIssue
                      ? 'border-earthy-yellow/50 bg-earthy-yellow/5 focus:border-earthy-yellow'
                      : 'border-gray-200 focus:border-sage-green'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => {
                    const isInactive = !cat.isActive;
                    const isUnavailable = cat.isAvailable === false;
                    let statusLabel = '';
                    if (isInactive) {
                      statusLabel = ' (Inactive)';
                    } else if (isUnavailable) {
                      statusLabel = ' (Flagged)';
                    }

                    return (
                      <option
                        key={cat._id}
                        value={cat._id}
                        style={{
                          color:
                            isInactive || isUnavailable ? '#9CA3AF' : 'inherit',
                        }}
                      >
                        {cat.name}
                        {statusLabel}
                      </option>
                    );
                  })}
                </select>
                {/* Custom dropdown arrow */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-5 h-5 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Category Status Warning */}
              <AnimatePresence>
                {hasCategoryIssue && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 flex items-start gap-3 p-4 bg-amber-50/80 backdrop-blur-sm border-2 border-amber-200/50 rounded-2xl"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="text-sm text-amber-900 leading-relaxed">
                      {isCategoryInactive && (
                        <p>
                          <strong className="font-semibold">Warning:</strong>
                          {' '}
                          This category is currently inactive. Products in
                          inactive categories may not be visible to vendors.
                        </p>
                      )}
                      {isCategoryUnavailable && (
                        <p className={isCategoryInactive ? 'mt-2' : ''}>
                          <strong className="font-semibold">Warning:</strong>
                          {' '}
                          This category has been flagged as unavailable. It may
                          have restrictions or issues.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </FormField>

            {/* Active Status */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-start gap-4 p-5 rounded-2xl border-2 border-sage-green/30 bg-gradient-to-br from-mint-fresh/10 to-sage-green/5 cursor-pointer transition-all hover:shadow-glow-green/10"
            >
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="mt-1 w-5 h-5 rounded-lg border-2 border-sage-green/50 text-bottle-green focus:ring-2 focus:ring-bottle-green/20 cursor-pointer transition-all"
              />
              <div className="flex-1">
                <label htmlFor="isActive" className="font-semibold text-text-dark mb-1 cursor-pointer block">
                  Active Product
                </label>
                <p className="text-sm text-text-muted leading-relaxed">
                  Active products are available for vendors to create listings.
                  Inactive products will be hidden from the marketplace.
                </p>
              </div>
            </motion.div>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
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
                {isEdit ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Modal>
  );
};

export default ProductEditModal;
