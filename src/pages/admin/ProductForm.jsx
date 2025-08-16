import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Image as ImageIcon,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Star,
  Info,
} from 'lucide-react';
import {
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useGetAdminCategoriesQuery,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import FileUpload from '../../components/ui/FileUpload';

const ProductForm = ({ isEditing = false }) => {
  const navigate = useNavigate();
  const { id: productId } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  // RTK Query hooks
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useGetAdminProductQuery(productId, {
    skip: !isEditing || !productId,
  });

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetAdminCategoriesQuery();

  const [createProduct] = useCreateAdminProductMutation();
  const [updateProduct] = useUpdateAdminProductMutation();
  const [uploadImage] = useUploadProductImageMutation();
  const [deleteImage] = useDeleteProductImageMutation();

  const categories = categoriesData?.data?.categories || [];
  const product = productData?.data;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      unit: '',
      basePrice: '',
      sku: '',
      status: 'active',
      tags: '',
      nutritionalInfo: {
        calories: '',
        protein: '',
        carbs: '',
        fat: '',
        fiber: '',
      },
      storageInstructions: '',
      shelfLife: '',
      origin: '',
      isOrganic: false,
      minOrderQuantity: 1,
      maxOrderQuantity: '',
    },
  });

  const watchedValues = watch();

  // Load product data for editing
  useEffect(() => {
    if (isEditing && product) {
      const formData = {
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        unit: product.unit || '',
        basePrice: product.basePrice?.toString() || '',
        sku: product.sku || '',
        status: product.status || 'active',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        nutritionalInfo: {
          calories: product.nutritionalInfo?.calories?.toString() || '',
          protein: product.nutritionalInfo?.protein?.toString() || '',
          carbs: product.nutritionalInfo?.carbs?.toString() || '',
          fat: product.nutritionalInfo?.fat?.toString() || '',
          fiber: product.nutritionalInfo?.fiber?.toString() || '',
        },
        storageInstructions: product.storageInstructions || '',
        shelfLife: product.shelfLife?.toString() || '',
        origin: product.origin || '',
        isOrganic: product.isOrganic || false,
        minOrderQuantity: product.minOrderQuantity || 1,
        maxOrderQuantity: product.maxOrderQuantity?.toString() || '',
      };

      reset(formData);

      if (product.images && product.images.length > 0) {
        setImagePreviewUrls(
          product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt || product.name,
            isPrimary: img.isPrimary || false,
          }))
        );
      }
    }
  }, [isEditing, product, reset]);

  // Handle image upload
  const handleImageUpload = useCallback(
    async (files) => {
      if (!files || files.length === 0) return;

      const uploadPromises = Array.from(files).map(async (file, index) => {
        const uploadId = `upload-${Date.now()}-${index}`;
        setUploadingImages((prev) => new Set([...prev, uploadId]));

        try {
          const formData = new FormData();
          formData.append('image', file);
          if (productId) {
            formData.append('productId', productId);
          }

          const response = await uploadImage(formData).unwrap();

          setImagePreviewUrls((prev) => [
            ...prev,
            {
              id: response.data.id,
              url: response.data.url,
              alt: file.name,
              isPrimary: prev.length === 0, // First image is primary
            },
          ]);

          return response.data;
        } catch (error) {
          console.error('Failed to upload image:', error);
          throw error;
        } finally {
          setUploadingImages((prev) => {
            const newSet = new Set(prev);
            newSet.delete(uploadId);
            return newSet;
          });
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error('Some images failed to upload:', error);
      }
    },
    [uploadImage, productId]
  );

  // Handle image deletion
  const handleImageDelete = async (imageIndex) => {
    const image = imagePreviewUrls[imageIndex];

    try {
      if (image.id && productId) {
        await deleteImage({ productId, imageId: image.id }).unwrap();
      }

      setImagePreviewUrls((prev) => {
        const newImages = prev.filter((_, index) => index !== imageIndex);
        // If we deleted the primary image, make the first remaining image primary
        if (image.isPrimary && newImages.length > 0) {
          newImages[0] = { ...newImages[0], isPrimary: true };
        }
        return newImages;
      });

      // Adjust selected index if necessary
      if (selectedImageIndex >= imagePreviewUrls.length - 1) {
        setSelectedImageIndex(Math.max(0, imagePreviewUrls.length - 2));
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  // Set primary image
  const setPrimaryImage = (index) => {
    setImagePreviewUrls((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Process form data
      const processedData = {
        ...data,
        basePrice: parseFloat(data.basePrice) || 0,
        tags: data.tags
          ? data.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        nutritionalInfo: {
          calories: parseInt(data.nutritionalInfo.calories) || null,
          protein: parseFloat(data.nutritionalInfo.protein) || null,
          carbs: parseFloat(data.nutritionalInfo.carbs) || null,
          fat: parseFloat(data.nutritionalInfo.fat) || null,
          fiber: parseFloat(data.nutritionalInfo.fiber) || null,
        },
        shelfLife: parseInt(data.shelfLife) || null,
        minOrderQuantity: parseInt(data.minOrderQuantity) || 1,
        maxOrderQuantity: parseInt(data.maxOrderQuantity) || null,
        images: imagePreviewUrls.map((img, index) => ({
          id: img.id,
          url: img.url,
          alt: img.alt,
          isPrimary: img.isPrimary,
          order: index,
        })),
      };

      if (isEditing && productId) {
        await updateProduct({ id: productId, ...processedData }).unwrap();
      } else {
        const result = await createProduct(processedData).unwrap();
        if (result.data?.id) {
          navigate(`/admin/products/${result.data.id}/edit`);
          return;
        }
      }

      navigate('/admin/products');
    } catch (error) {
      console.error('Failed to save product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validation rules
  const validationRules = {
    name: {
      required: 'Product name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' },
      maxLength: {
        value: 100,
        message: 'Name must be less than 100 characters',
      },
    },
    category: {
      required: 'Category is required',
    },
    unit: {
      required: 'Unit is required',
    },
    basePrice: {
      required: 'Base price is required',
      min: { value: 0.01, message: 'Price must be greater than 0' },
    },
  };

  if (productLoading || categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isEditing && productError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Product not found"
        description="The product you're looking for doesn't exist or has been deleted."
        action={{
          label: 'Go back',
          onClick: () => navigate('/admin/products'),
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/products')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-text-dark dark:text-white">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h1>
          <p className="text-text-muted">
            {isEditing
              ? 'Update product information and settings'
              : 'Add a new product to the catalog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-text-dark dark:text-white mb-4 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Product Name" error={errors.name?.message}>
              <Input
                {...register('name', validationRules.name)}
                placeholder="Enter product name"
                hasError={!!errors.name}
              />
            </FormField>

            <FormField label="SKU (Optional)">
              <Input {...register('sku')} placeholder="Product SKU" />
            </FormField>

            <FormField label="Category" error={errors.category?.message}>
              <select
                {...register('category', validationRules.category)}
                className={`w-full px-4 py-3 border rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 ${
                  errors.category
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

            <FormField label="Unit" error={errors.unit?.message}>
              <select
                {...register('unit', validationRules.unit)}
                className={`w-full px-4 py-3 border rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 ${
                  errors.unit
                    ? 'border-tomato-red/30 bg-tomato-red/5'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <option value="">Select unit</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="g">Gram (g)</option>
                <option value="lb">Pound (lb)</option>
                <option value="oz">Ounce (oz)</option>
                <option value="piece">Piece</option>
                <option value="bunch">Bunch</option>
                <option value="bag">Bag</option>
                <option value="box">Box</option>
                <option value="dozen">Dozen</option>
              </select>
            </FormField>

            <FormField label="Base Price" error={errors.basePrice?.message}>
              <Input
                {...register('basePrice', validationRules.basePrice)}
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                hasError={!!errors.basePrice}
              />
            </FormField>

            <FormField label="Status">
              <select
                {...register('status')}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending Review</option>
              </select>
            </FormField>
          </div>

          <div className="mt-4">
            <FormField label="Description">
              <textarea
                {...register('description')}
                placeholder="Enter product description"
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
              />
            </FormField>
          </div>

          <div className="mt-4">
            <FormField label="Tags (comma-separated)">
              <Input
                {...register('tags')}
                placeholder="organic, fresh, local, seasonal"
              />
            </FormField>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-text-dark dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Product Images
          </h2>

          {imagePreviewUrls.length > 0 ? (
            <div className="space-y-4">
              {/* Main Image Preview */}
              <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden max-w-md mx-auto">
                <img
                  src={imagePreviewUrls[selectedImageIndex]?.url}
                  alt={imagePreviewUrls[selectedImageIndex]?.alt}
                  className="w-full h-full object-cover"
                />
                {imagePreviewUrls[selectedImageIndex]?.isPrimary && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-earthy-yellow text-earthy-brown text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Primary
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-xl hover:bg-black/70 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>

              {/* Image Thumbnails */}
              <div className="flex flex-wrap gap-2 justify-center">
                {imagePreviewUrls.map((image, index) => (
                  <div key={index} className="relative group">
                    <button
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImageIndex === index
                          ? 'border-bottle-green shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {/* Action Buttons */}
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      {!image.isPrimary && (
                        <button
                          type="button"
                          onClick={() => setPrimaryImage(index)}
                          className="bg-earthy-yellow text-earthy-brown p-1 rounded-full text-xs hover:bg-earthy-yellow/80 transition-colors"
                          title="Set as primary"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleImageDelete(index)}
                        className="bg-tomato-red text-white p-1 rounded-full text-xs hover:bg-tomato-red/80 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-text-muted mb-4">No images uploaded yet</p>
            </div>
          )}

          {/* Upload Area */}
          <div className="mt-4">
            <FileUpload
              onFilesSelected={handleImageUpload}
              accept="image/*"
              multiple
              maxFiles={5}
              maxFileSize={5 * 1024 * 1024} // 5MB
              disabled={uploadingImages.size > 0}
            >
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center hover:border-bottle-green transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-text-muted mb-1">
                  {uploadingImages.size > 0
                    ? `Uploading ${uploadingImages.size} image(s)...`
                    : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-text-muted">
                  PNG, JPG, WebP up to 5MB (max 5 images)
                </p>
              </div>
            </FileUpload>
          </div>
        </Card>

        {/* Additional Details */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-text-dark dark:text-white mb-4">
            Additional Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Origin/Source">
              <Input
                {...register('origin')}
                placeholder="e.g., Local Farm, California, USA"
              />
            </FormField>

            <FormField label="Shelf Life (days)">
              <Input
                {...register('shelfLife')}
                type="number"
                min="1"
                placeholder="e.g., 7"
              />
            </FormField>

            <FormField label="Min Order Quantity">
              <Input
                {...register('minOrderQuantity')}
                type="number"
                min="1"
                placeholder="1"
              />
            </FormField>

            <FormField label="Max Order Quantity">
              <Input
                {...register('maxOrderQuantity')}
                type="number"
                min="1"
                placeholder="Leave empty for no limit"
              />
            </FormField>
          </div>

          <div className="mt-4">
            <FormField label="Storage Instructions">
              <textarea
                {...register('storageInstructions')}
                placeholder="Storage and handling instructions"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
              />
            </FormField>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isOrganic')}
                className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
              />
              <span className="text-text-dark dark:text-white font-medium">
                Organic Product
              </span>
            </label>
          </div>
        </Card>

        {/* Nutritional Information */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-text-dark dark:text-white mb-4">
            Nutritional Information (per 100g)
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <FormField label="Calories">
              <Input
                {...register('nutritionalInfo.calories')}
                type="number"
                min="0"
                placeholder="0"
              />
            </FormField>

            <FormField label="Protein (g)">
              <Input
                {...register('nutritionalInfo.protein')}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
              />
            </FormField>

            <FormField label="Carbs (g)">
              <Input
                {...register('nutritionalInfo.carbs')}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
              />
            </FormField>

            <FormField label="Fat (g)">
              <Input
                {...register('nutritionalInfo.fat')}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
              />
            </FormField>

            <FormField label="Fiber (g)">
              <Input
                {...register('nutritionalInfo.fiber')}
                type="number"
                step="0.1"
                min="0"
                placeholder="0.0"
              />
            </FormField>
          </div>
        </Card>

        {/* Form Actions */}
        <Card className="p-6">
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={imagePreviewUrls[selectedImageIndex]?.url}
              alt={imagePreviewUrls[selectedImageIndex]?.alt}
              className="max-w-full max-h-full object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
