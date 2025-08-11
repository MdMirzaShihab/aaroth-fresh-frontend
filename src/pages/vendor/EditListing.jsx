import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  useGetListingQuery,
  useUpdateListingMutation,
  useGetPublicProductsQuery,
  useGetCategoriesQuery
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import FileUpload from '../../components/ui/FileUpload';
import EmptyState from '../../components/ui/EmptyState';
import {
  ArrowLeft,
  Plus,
  Minus,
  Package,
  DollarSign,
  Calendar,
  MapPin,
  Truck,
  Percent,
  Info,
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  Save
} from 'lucide-react';

const EditListing = () => {
  const { id: listingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch the existing listing
  const {
    data: listingData,
    isLoading: listingLoading,
    error: listingError
  } = useGetListingQuery(listingId);

  const listing = listingData?.data || listingData?.listing;

  // Form management
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      pricing: [{
        pricePerUnit: '',
        unit: 'kg',
        bulkDiscount: {
          minQuantity: '',
          discountPercentage: ''
        }
      }],
      availability: {
        quantityAvailable: '',
        harvestDate: '',
        expiryDate: ''
      },
      deliveryOptions: [{
        type: 'pickup',
        cost: 0,
        timeRange: '30 minutes'
      }],
      discount: {
        type: 'percentage',
        value: '',
        validUntil: ''
      },
      certifications: [],
      qualityGrade: 'Standard',
      minimumOrderValue: '',
      leadTime: '2-4 hours'
    }
  });

  // Field arrays for dynamic forms
  const { fields: pricingFields, append: appendPricing, remove: removePricing } = useFieldArray({
    control,
    name: 'pricing'
  });

  const { fields: deliveryFields, append: appendDelivery, remove: removeDelivery } = useFieldArray({
    control,
    name: 'deliveryOptions'
  });

  // API mutations and queries
  const [updateListing] = useUpdateListingMutation();

  const {
    data: productsData,
    isLoading: productsLoading
  } = useGetPublicProductsQuery({
    limit: 1000 // Get all products for selection
  });

  const {
    data: categoriesData
  } = useGetCategoriesQuery();

  const products = productsData?.data?.products || [];
  const categories = categoriesData?.categories || [];

  // Unit options
  const unitOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'piece', label: 'Piece' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'pack', label: 'Pack' },
    { value: 'liter', label: 'Liter (L)' },
    { value: 'ml', label: 'Milliliter (ml)' },
  ];

  // Quality grade options
  const qualityGradeOptions = [
    { value: 'Premium', label: 'Premium' },
    { value: 'Standard', label: 'Standard' },
    { value: 'Economy', label: 'Economy' },
  ];

  // Certification options
  const certificationOptions = [
    { value: 'organic', label: 'Organic' },
    { value: 'fair-trade', label: 'Fair Trade' },
    { value: 'non-gmo', label: 'Non-GMO' },
    { value: 'locally-grown', label: 'Locally Grown' },
    { value: 'pesticide-free', label: 'Pesticide-Free' },
  ];

  // Delivery areas
  const deliveryAreas = [
    'Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur',
    'Wari', 'Old Dhaka', 'Motijheel', 'Tejgaon', 'Pallabi'
  ];

  // Populate form with existing listing data
  useEffect(() => {
    if (listing) {
      // Set form values
      reset({
        productId: listing.product?.id || listing.productId,
        pricing: listing.pricing || [{
          pricePerUnit: '',
          unit: 'kg',
          bulkDiscount: { minQuantity: '', discountPercentage: '' }
        }],
        qualityGrade: listing.qualityGrade || 'Standard',
        availability: listing.availability || {
          quantityAvailable: '',
          harvestDate: '',
          expiryDate: ''
        },
        description: listing.description || '',
        deliveryOptions: listing.deliveryOptions || [{
          type: 'pickup',
          cost: 0,
          timeRange: '30 minutes'
        }],
        minimumOrderValue: listing.minimumOrderValue || '',
        leadTime: listing.leadTime || '2-4 hours',
        certifications: listing.certifications || [],
        discount: listing.discount || {
          type: 'percentage',
          value: '',
          validUntil: ''
        }
      });

      // Set existing images
      if (listing.images && listing.images.length > 0) {
        const images = listing.images.map((img, index) => ({
          id: `existing-${index}`,
          url: typeof img === 'string' ? img : img.url,
          isExisting: true
        }));
        setExistingImages(images);
      }
    }
  }, [listing, reset]);

  // Handle image upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const newImages = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
      isExisting: false
    }));
    
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (imageId, isExisting = false) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } else {
      setUploadedImages(prev => {
        const imageToRemove = prev.find(img => img.id === imageId);
        if (imageToRemove?.preview) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
        return prev.filter(img => img.id !== imageId);
      });
      
      setImageFiles(prev => 
        prev.filter((file, index) => 
          uploadedImages[index]?.id !== imageId
        )
      );
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    const totalImages = existingImages.length + uploadedImages.length;
    if (totalImages === 0) {
      dispatch(addNotification({
        type: 'error',
        title: 'Images Required',
        message: 'Please keep at least one product image.',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add form data
      formData.append('productId', data.productId);
      formData.append('pricing', JSON.stringify(data.pricing));
      formData.append('qualityGrade', data.qualityGrade);
      formData.append('availability', JSON.stringify(data.availability));
      formData.append('description', data.description);
      formData.append('deliveryOptions', JSON.stringify(data.deliveryOptions));
      formData.append('minimumOrderValue', data.minimumOrderValue);
      formData.append('leadTime', data.leadTime);
      formData.append('certifications', JSON.stringify(data.certifications));
      
      if (data.discount.value) {
        formData.append('discount', JSON.stringify(data.discount));
      }

      // Add existing images that should be kept
      const existingImageUrls = existingImages.map(img => img.url);
      if (existingImageUrls.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImageUrls));
      }

      // Add new image files
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const result = await updateListing({ id: listingId, formData }).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Listing Updated',
        message: 'Your product listing has been updated successfully!',
      }));

      navigate('/vendor/listings');
    } catch (error) {
      console.error('Failed to update listing:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.data?.message || 'Failed to update listing. Please try again.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });
    };
  }, []);

  if (listingLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading listing..." />
      </div>
    );
  }

  if (listingError || !listing) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Listing not found"
        description="The listing you're looking for doesn't exist or you don't have permission to edit it."
        action={{
          label: "Back to Listings",
          onClick: () => navigate('/vendor/listings')
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/vendor/listings')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Button>
        
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Edit Listing
          </h1>
          <p className="text-text-muted mt-1">
            Update your product listing details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Product Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Product Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Select Product"
              error={errors.productId?.message}
              required
            >
              <select
                {...register('productId', { required: 'Please select a product' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 bg-white"
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.category?.name})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Quality Grade"
              error={errors.qualityGrade?.message}
              required
            >
              <select
                {...register('qualityGrade', { required: 'Please select quality grade' })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 bg-white"
              >
                {qualityGradeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Description"
                error={errors.description?.message}
                required
              >
                <textarea
                  {...register('description', { required: 'Please provide a description' })}
                  rows="4"
                  placeholder="Describe your product quality, freshness, origin, and any special features..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 resize-none"
                />
              </FormField>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Pricing & Units
          </h2>

          <div className="space-y-6">
            {pricingFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-dark">Pricing Option {index + 1}</h3>
                  {pricingFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePricing(index)}
                      className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <FormField
                    label="Price per Unit"
                    error={errors.pricing?.[index]?.pricePerUnit?.message}
                    required
                  >
                    <input
                      type="number"
                      step="0.01"
                      {...register(`pricing.${index}.pricePerUnit`, { 
                        required: 'Price is required',
                        min: { value: 0.01, message: 'Price must be greater than 0' }
                      })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                    />
                  </FormField>

                  <FormField
                    label="Unit"
                    error={errors.pricing?.[index]?.unit?.message}
                    required
                  >
                    <select
                      {...register(`pricing.${index}.unit`, { required: 'Unit is required' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 bg-white"
                    >
                      {unitOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Bulk Discount */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-text-dark mb-3 flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Bulk Discount (Optional)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Minimum Quantity">
                      <input
                        type="number"
                        {...register(`pricing.${index}.bulkDiscount.minQuantity`)}
                        placeholder="10"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                      />
                    </FormField>

                    <FormField label="Discount Percentage">
                      <input
                        type="number"
                        step="0.1"
                        max="50"
                        {...register(`pricing.${index}.bulkDiscount.discountPercentage`)}
                        placeholder="5.0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendPricing({
                pricePerUnit: '',
                unit: 'kg',
                bulkDiscount: { minQuantity: '', discountPercentage: '' }
              })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Pricing Option
            </Button>
          </div>
        </Card>

        {/* Availability */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability & Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Available Quantity"
              error={errors.availability?.quantityAvailable?.message}
              required
            >
              <input
                type="number"
                {...register('availability.quantityAvailable', { 
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Quantity must be 0 or greater' }
                })}
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              />
            </FormField>

            <FormField
              label="Harvest Date"
              error={errors.availability?.harvestDate?.message}
            >
              <input
                type="date"
                {...register('availability.harvestDate')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              />
            </FormField>

            <FormField
              label="Expiry Date"
              error={errors.availability?.expiryDate?.message}
            >
              <input
                type="date"
                {...register('availability.expiryDate')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              />
            </FormField>
          </div>
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Product Images
          </h2>

          <div className="space-y-4">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-dark mb-3">Current Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {existingImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                          src={image.url}
                          alt="Product image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id, true)}
                        className="absolute top-2 right-2 w-6 h-6 bg-tomato-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Image Upload */}
            <div>
              <h3 className="text-sm font-medium text-text-dark mb-3">Add New Images</h3>
              <FileUpload
                accept="image/*"
                multiple
                maxFiles={5 - existingImages.length}
                onFilesSelected={handleImageUpload}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-bottle-green transition-colors"
              />
            </div>

            {/* New Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-dark mb-3">New Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {uploadedImages.map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                          src={image.preview}
                          alt="New product preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id, false)}
                        className="absolute top-2 right-2 w-6 h-6 bg-tomato-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-text-muted">
              Keep or upload up to 5 high-quality images total. First image will be used as the main product image.
            </p>
          </div>
        </Card>

        {/* Delivery Options */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Options
          </h2>

          <div className="space-y-6">
            {deliveryFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-dark">Delivery Option {index + 1}</h3>
                  {deliveryFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeDelivery(index)}
                      className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                    >
                      <Minus className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Type" required>
                    <select
                      {...register(`deliveryOptions.${index}.type`, { required: 'Type is required' })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 bg-white"
                    >
                      <option value="pickup">Pickup</option>
                      <option value="delivery">Delivery</option>
                    </select>
                  </FormField>

                  <FormField label="Cost (৳)" required>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`deliveryOptions.${index}.cost`, { 
                        required: 'Cost is required',
                        min: { value: 0, message: 'Cost must be 0 or greater' }
                      })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                    />
                  </FormField>

                  <FormField label="Time Range" required>
                    <input
                      type="text"
                      {...register(`deliveryOptions.${index}.timeRange`, { required: 'Time range is required' })}
                      placeholder="2-4 hours"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                    />
                  </FormField>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => appendDelivery({
                type: 'pickup',
                cost: 0,
                timeRange: '30 minutes'
              })}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Delivery Option
            </Button>
          </div>
        </Card>

        {/* Additional Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Info className="w-5 h-5" />
            Additional Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Minimum Order Value (৳)">
              <input
                type="number"
                step="0.01"
                {...register('minimumOrderValue')}
                placeholder="250.00"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              />
            </FormField>

            <FormField label="Lead Time">
              <select
                {...register('leadTime')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 bg-white"
              >
                <option value="immediate">Immediate</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="same day">Same day</option>
                <option value="next day">Next day</option>
              </select>
            </FormField>

            <div className="md:col-span-2">
              <FormField label="Certifications">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {certificationOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register('certifications')}
                        className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
                      />
                      <span className="text-sm text-text-dark">{option.label}</span>
                    </label>
                  ))}
                </div>
              </FormField>
            </div>
          </div>
        </Card>

        {/* Submit Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vendor/listings')}
              className="sm:w-auto w-full"
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="sm:w-auto w-full min-w-[200px]"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating Listing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Listing
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default EditListing;