import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Image as ImageIcon, Star, Trash2 } from 'lucide-react';
import { Modal } from '../../../../../components/ui/Modal';
import Button from '../../../../../components/ui/Button';
import { Input } from '../../../../../components/ui/Input';
import FormField from '../../../../../components/ui/FormField';
import {
  useCreateAdminProductV2Mutation,
  useUpdateAdminProductV2Mutation,
  useGetAdminCategoriesV2Query,
} from '../../../../../store/slices/admin-v2/adminApiSlice';

const ProductEditModal = ({ product, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    isActive: true,
  });

  const [images, setImages] = useState([]); // Array of { file, url, isPrimary }
  const [existingImages, setExistingImages] = useState([]); // For edit mode

  const [createProduct, { isLoading: isCreating }] = useCreateAdminProductV2Mutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateAdminProductV2Mutation();
  const { data: categoriesData } = useGetAdminCategoriesV2Query({ limit: 100 });

  const categories = categoriesData?.data || [];
  const isEdit = !!product;
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category?._id || '',
        isActive: product.isActive !== undefined ? product.isActive : true,
      });
      setExistingImages(product.images || []);
      setImages([]); // Clear new images
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        isActive: true,
      });
      setExistingImages([]);
      setImages([]);
    }
  }, [product, isOpen]);

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = images.length + existingImages.length + files.length;

    if (totalImages > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    const newImages = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      isPrimary: images.length === 0 && existingImages.length === 0 && index === 0,
    }));

    setImages([...images, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      const updatedImages = images.filter((_, i) => i !== index);
      // If removed image was primary, make first image primary
      if (images[index].isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      setImages(updatedImages);
    }
  };

  // Set primary image
  const handleSetPrimary = (index, isExisting = false) => {
    if (isExisting) {
      setExistingImages(
        existingImages.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        }))
      );
    } else {
      setImages(
        images.map((img, i) => ({
          ...img,
          isPrimary: i === index,
        }))
      );
      // Unmark existing images
      setExistingImages(
        existingImages.map((img) => ({ ...img, isPrimary: false }))
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate images - at least one image required
    const totalImages = existingImages.length + images.length;
    if (totalImages === 0) {
      alert('Please upload at least one product image');
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isActive', formData.isActive);

      // Append new images
      images.forEach((img) => {
        formDataToSend.append('images', img.file);
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
      } else {
        await createProduct(formDataToSend).unwrap();
      }

      // Clean up object URLs
      images.forEach((img) => URL.revokeObjectURL(img.url));

      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error?.data?.error || 'Failed to save product');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Product' : 'Create Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Product Name (Required)">
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
            required
            minLength={2}
            maxLength={100}
          />
        </FormField>

        <FormField label="Description (Required)">
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Enter product description..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 resize-none"
            required
            minLength={10}
            maxLength={500}
          />
        </FormField>

        <FormField label="Category (Required)">
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20"
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </FormField>

        {/* Image Upload Section */}
        <FormField label={`Product Images ${!isEdit ? '(Required)' : '(Optional)'}`}>
          <div className="space-y-4">
            {/* Existing and New Images Display */}
            {(existingImages.length > 0 || images.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Existing Images */}
                {existingImages.map((img, index) => (
                  <div key={`existing-${index}`} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={img.url}
                        alt={img.alt || `Product ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-earthy-yellow text-earthy-brown text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Primary
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index, true)}
                          className="bg-earthy-yellow text-earthy-brown p-1.5 rounded-full hover:bg-earthy-yellow/80"
                          title="Set as primary"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index, true)}
                        className="bg-tomato-red text-white p-1.5 rounded-full hover:bg-tomato-red/80"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* New Images */}
                {images.map((img, index) => (
                  <div key={`new-${index}`} className="relative group">
                    <div className="aspect-square rounded-xl overflow-hidden border-2 border-muted-olive/30">
                      <img
                        src={img.url}
                        alt={`New ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {img.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-earthy-yellow text-earthy-brown text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Primary
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index, false)}
                          className="bg-earthy-yellow text-earthy-brown p-1.5 rounded-full hover:bg-earthy-yellow/80"
                          title="Set as primary"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index, false)}
                        className="bg-tomato-red text-white p-1.5 rounded-full hover:bg-tomato-red/80"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(existingImages.length + images.length) < 5 && (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-muted-olive transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-text-muted mb-1">
                    Click to upload images
                  </p>
                  <p className="text-sm text-text-muted">
                    PNG, JPG, WebP up to 1MB (max 5 images)
                  </p>
                </div>
              </label>
            )}

            {(existingImages.length + images.length) === 0 && !isEdit && (
              <p className="text-sm text-tomato-red/80">
                At least one image is required for new products
              </p>
            )}
          </div>
        </FormField>

        <FormField label="Status">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={formData.isActive === true}
                onChange={() => setFormData({ ...formData, isActive: true })}
                className="w-4 h-4 text-muted-olive border-gray-300 focus:ring-muted-olive"
              />
              <span className="text-sm text-text-dark">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="isActive"
                checked={formData.isActive === false}
                onChange={() => setFormData({ ...formData, isActive: false })}
                className="w-4 h-4 text-muted-olive border-gray-300 focus:ring-muted-olive"
              />
              <span className="text-sm text-text-dark">Inactive</span>
            </label>
          </div>
        </FormField>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductEditModal;
