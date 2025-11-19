import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
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
  Save,
} from 'lucide-react';
import {
  useGetListingByIdQuery,
  useUpdateListingMutation,
  useGetProductCatalogQuery,
  useGetListingCategoriesQuery,
  useUploadListingImagesMutation,
  useDeleteListingImageMutation,
} from '../../store/slices/vendor/vendorListingsApi';
import { addNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import FileUpload from '../../components/ui/FileUpload';
import EmptyState from '../../components/ui/EmptyState';

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
    data: listing,
    isLoading: listingLoading,
    error: listingError,
  } = useGetListingByIdQuery(listingId);

  // API mutations and queries
  const [updateListing] = useUpdateListingMutation();
  const [uploadImages] = useUploadListingImagesMutation();
  const [deleteImage] = useDeleteListingImageMutation();

  const { data: productsData, isLoading: productsLoading } =
    useGetProductCatalogQuery({
      limit: 1000,
    });

  const { data: categoriesData } = useGetListingCategoriesQuery();

  const products = productsData?.products || [];
  const categories = categoriesData || [];

  // Form management
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pricing: [
        {
          pricePerBaseUnit: '',
          unit: 'kg',
          enablePackSelling: false,
          packSize: '',
          packUnit: 'pack',
          minimumPacks: 1,
          maximumPacks: '',
          bulkDiscount: {
            minQuantity: '',
            discountPercentage: '',
          },
        },
      ],
      availability: {
        quantityAvailable: '',
        harvestDate: '',
        expiryDate: '',
      },
      deliveryOptions: [
        {
          type: 'pickup',
          cost: 0,
          timeRange: '30 minutes',
        },
      ],
      discount: {
        type: 'percentage',
        value: '',
        validUntil: '',
      },
      certifications: [],
      qualityGrade: 'Standard',
      minimumOrderValue: '',
      leadTime: '2-4 hours',
    },
  });

  // Field arrays for dynamic forms
  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({
    control,
    name: 'pricing',
  });

  const {
    fields: deliveryFields,
    append: appendDelivery,
    remove: removeDelivery,
  } = useFieldArray({
    control,
    name: 'deliveryOptions',
  });


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
    'Dhanmondi',
    'Gulshan',
    'Banani',
    'Uttara',
    'Mirpur',
    'Wari',
    'Old Dhaka',
    'Motijheel',
    'Tejgaon',
    'Pallabi',
  ];

  // Populate form with existing listing data
  useEffect(() => {
    if (listing) {
      // Set form values
      reset({
        productId: listing.product?.id || listing.productId,
        pricing: listing.pricing || [
          {
            pricePerUnit: '',
            unit: 'kg',
            bulkDiscount: { minQuantity: '', discountPercentage: '' },
          },
        ],
        qualityGrade: listing.qualityGrade || 'Standard',
        availability: listing.availability || {
          quantityAvailable: '',
          harvestDate: '',
          expiryDate: '',
        },
        description: listing.description || '',
        deliveryOptions: listing.deliveryOptions || [
          {
            type: 'pickup',
            cost: 0,
            timeRange: '30 minutes',
          },
        ],
        minimumOrderValue: listing.minimumOrderValue || '',
        leadTime: listing.leadTime || '2-4 hours',
        certifications: listing.certifications || [],
        discount: listing.discount || {
          type: 'percentage',
          value: '',
          validUntil: '',
        },
      });

      // Set existing images
      if (listing.images && listing.images.length > 0) {
        const images = listing.images.map((img, index) => ({
          id: `existing-${index}`,
          url: typeof img === 'string' ? img : img.url,
          isExisting: true,
        }));
        setExistingImages(images);
      }
    }
  }, [listing, reset]);

  // Handle image upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
      isExisting: false,
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (imageId, isExisting = false) => {
    if (isExisting) {
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    } else {
      setUploadedImages((prev) => {
        const imageToRemove = prev.find((img) => img.id === imageId);
        if (imageToRemove?.preview) {
          URL.revokeObjectURL(imageToRemove.preview);
        }
        return prev.filter((img) => img.id !== imageId);
      });

      setImageFiles((prev) =>
        prev.filter((file, index) => uploadedImages[index]?.id !== imageId)
      );
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    const totalImages = existingImages.length + uploadedImages.length;
    if (totalImages === 0) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Images Required',
          message: 'Please keep at least one product image.',
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // First update the listing with JSON data
      const updateData = {
        productId: data.productId,
        pricing: data.pricing,
        qualityGrade: data.qualityGrade,
        availability: data.availability,
        description: data.description,
        deliveryOptions: data.deliveryOptions,
        minimumOrderValue: data.minimumOrderValue,
        leadTime: data.leadTime,
        certifications: data.certifications,
        ...(data.discount.value && { discount: data.discount }),
      };

      const result = await updateListing({
        listingId: listingId,
        updateData: updateData,
      }).unwrap();

      // Handle image updates if there are new images to upload
      if (imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append('images', file);
        });

        await uploadImages({
          listingId: listingId,
          imagesFormData: imageFormData,
        }).unwrap();
      }

      // Delete removed existing images
      const currentImageUrls = listing.images?.map(img => 
        typeof img === 'string' ? img : img.url
      ) || [];
      const keptImageUrls = existingImages.map(img => img.url);
      
      for (const imageUrl of currentImageUrls) {
        if (!keptImageUrls.includes(imageUrl)) {
          // Find image ID and delete it
          const imageToDelete = listing.images?.find(img => 
            (typeof img === 'string' ? img : img.url) === imageUrl
          );
          if (imageToDelete && typeof imageToDelete === 'object' && imageToDelete.id) {
            await deleteImage({
              listingId: listingId,
              imageId: imageToDelete.id,
            }).unwrap();
          }
        }
      }

      dispatch(
        addNotification({
          type: 'success',
          title: 'Listing Updated',
          message: 'Your product listing has been updated successfully!',
        })
      );

      navigate('/vendor/listings');
    } catch (error) {
      console.error('Failed to update listing:', error);
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message:
            error.data?.message ||
            'Failed to update listing. Please try again.',
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cleanup image URLs on unmount
  useEffect(() => {
    return () => {
      uploadedImages.forEach((image) => {
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
          label: 'Back to Listings',
          onClick: () => navigate('/vendor/listings'),
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
                {...register('productId', {
                  required: 'Please select a product',
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
              >
                <option value="">Choose a product...</option>
                {products.map((product) => (
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
                {...register('qualityGrade', {
                  required: 'Please select quality grade',
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
              >
                {qualityGradeOptions.map((option) => (
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
                  {...register('description', {
                    required: 'Please provide a description',
                  })}
                  rows="4"
                  placeholder="Describe your product quality, freshness, origin, and any special features..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 resize-none"
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
              <div
                key={field.id}
                className="border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-dark">
                    Pricing Option {index + 1}
                  </h3>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    label="Price per Base Unit"
                    error={errors.pricing?.[index]?.pricePerBaseUnit?.message}
                    required
                    hint="Price per kg, piece, etc."
                  >
                    <input
                      type="number"
                      step="0.01"
                      {...register(`pricing.${index}.pricePerBaseUnit`, {
                        required: 'Price is required',
                        min: {
                          value: 0.01,
                          message: 'Price must be greater than 0',
                        },
                      })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    />
                  </FormField>

                  <FormField
                    label="Base Unit"
                    error={errors.pricing?.[index]?.unit?.message}
                    required
                  >
                    <select
                      {...register(`pricing.${index}.unit`, {
                        required: 'Unit is required',
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
                    >
                      {unitOptions.filter(opt => opt.value !== 'pack').map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                {/* Pack-Based Selling */}
                <div className="bg-mint-fresh/5 border border-mint-fresh/20 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-text-dark flex items-center gap-2">
                        <Package className="w-4 h-4 text-bottle-green" />
                        Pack-Based Selling
                      </h4>
                      <p className="text-sm text-text-muted mt-1">
                        Sell products in fixed pack sizes (e.g., 60kg packs)
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register(`pricing.${index}.enablePackSelling`)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-mint-fresh/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-mint-fresh"></div>
                    </label>
                  </div>

                  {watch(`pricing.${index}.enablePackSelling`) && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Pack Size"
                          error={errors.pricing?.[index]?.packSize?.message}
                          required
                          hint={`How many ${watch(`pricing.${index}.unit`) || 'units'} per pack`}
                        >
                          <input
                            type="number"
                            step="0.01"
                            {...register(`pricing.${index}.packSize`, {
                              required: watch(`pricing.${index}.enablePackSelling`)
                                ? 'Pack size is required when pack selling is enabled'
                                : false,
                              min: {
                                value: 0.01,
                                message: 'Pack size must be greater than 0',
                              },
                            })}
                            placeholder="60"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint-fresh/20"
                          />
                        </FormField>

                        <FormField label="Pack Unit Name">
                          <select
                            {...register(`pricing.${index}.packUnit`)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint-fresh/20 bg-white"
                          >
                            <option value="pack">Pack</option>
                            <option value="bundle">Bundle</option>
                            <option value="box">Box</option>
                            <option value="crate">Crate</option>
                            <option value="bag">Bag</option>
                          </select>
                        </FormField>
                      </div>

                      {/* Calculated Pack Price Display */}
                      {watch(`pricing.${index}.pricePerBaseUnit`) && watch(`pricing.${index}.packSize`) && (
                        <div className="bg-white border border-mint-fresh/30 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm text-text-muted">Calculated Price per Pack</p>
                              <p className="text-2xl font-semibold text-bottle-green mt-1">
                                ৳{(
                                  parseFloat(watch(`pricing.${index}.pricePerBaseUnit`) || 0) *
                                  parseFloat(watch(`pricing.${index}.packSize`) || 0)
                                ).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-text-muted">
                                {watch(`pricing.${index}.packSize`)} {watch(`pricing.${index}.unit`)} × ৳{watch(`pricing.${index}.pricePerBaseUnit`)}
                              </p>
                              <p className="text-xs text-text-muted mt-1">
                                per {watch(`pricing.${index}.packUnit`) || 'pack'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Minimum Packs"
                          error={errors.pricing?.[index]?.minimumPacks?.message}
                          hint="Minimum order in number of packs"
                        >
                          <input
                            type="number"
                            step="1"
                            {...register(`pricing.${index}.minimumPacks`, {
                              min: {
                                value: 1,
                                message: 'Minimum must be at least 1 pack',
                              },
                              validate: value => !value || Number.isInteger(parseFloat(value)) || 'Must be a whole number'
                            })}
                            placeholder="1"
                            defaultValue="1"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint-fresh/20"
                          />
                        </FormField>

                        <FormField
                          label="Maximum Packs (Optional)"
                          error={errors.pricing?.[index]?.maximumPacks?.message}
                          hint="Maximum order in number of packs"
                        >
                          <input
                            type="number"
                            step="1"
                            {...register(`pricing.${index}.maximumPacks`, {
                              validate: value => {
                                if (!value) return true;
                                if (!Number.isInteger(parseFloat(value))) return 'Must be a whole number';
                                const minPacks = parseInt(watch(`pricing.${index}.minimumPacks`) || 1);
                                return parseInt(value) >= minPacks || `Must be at least ${minPacks}`;
                              }
                            })}
                            placeholder="10"
                            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-mint-fresh/20"
                          />
                        </FormField>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3">
                        <p className="text-sm text-blue-800 flex items-center gap-2">
                          <Info className="w-4 h-4 flex-shrink-0" />
                          Buyers will only be able to purchase in multiples of {watch(`pricing.${index}.packSize`) || 0} {watch(`pricing.${index}.unit`)}.
                          {watch(`pricing.${index}.minimumPacks`) && ` Minimum order: ${watch(`pricing.${index}.minimumPacks`)} ${watch(`pricing.${index}.packUnit`) || 'pack'}(s).`}
                        </p>
                      </div>
                    </div>
                  )}
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
                        {...register(
                          `pricing.${index}.bulkDiscount.minQuantity`
                        )}
                        placeholder="10"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      />
                    </FormField>

                    <FormField label="Discount Percentage">
                      <input
                        type="number"
                        step="0.1"
                        max="50"
                        {...register(
                          `pricing.${index}.bulkDiscount.discountPercentage`
                        )}
                        placeholder="5.0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendPricing({
                  pricePerBaseUnit: '',
                  unit: 'kg',
                  enablePackSelling: false,
                  packSize: '',
                  packUnit: 'pack',
                  minimumPacks: 1,
                  maximumPacks: '',
                  bulkDiscount: { minQuantity: '', discountPercentage: '' },
                })
              }
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
                  min: { value: 0, message: 'Quantity must be 0 or greater' },
                })}
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              />
            </FormField>

            <FormField
              label="Harvest Date"
              error={errors.availability?.harvestDate?.message}
            >
              <input
                type="date"
                {...register('availability.harvestDate')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              />
            </FormField>

            <FormField
              label="Expiry Date"
              error={errors.availability?.expiryDate?.message}
            >
              <input
                type="date"
                {...register('availability.expiryDate')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
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
                <h3 className="text-sm font-medium text-text-dark mb-3">
                  Current Images
                </h3>
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
              <h3 className="text-sm font-medium text-text-dark mb-3">
                Add New Images
              </h3>
              <FileUpload
                accept="image/*"
                multiple
                maxFiles={5 - existingImages.length}
                onFilesSelected={handleImageUpload}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-muted-olive transition-colors"
              />
            </div>

            {/* New Images Preview */}
            {uploadedImages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-text-dark mb-3">
                  New Images
                </h3>
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
              Keep or upload up to 5 high-quality images total. First image will
              be used as the main product image.
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
              <div
                key={field.id}
                className="border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-text-dark">
                    Delivery Option {index + 1}
                  </h3>
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
                      {...register(`deliveryOptions.${index}.type`, {
                        required: 'Type is required',
                      })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
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
                        min: { value: 0, message: 'Cost must be 0 or greater' },
                      })}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    />
                  </FormField>

                  <FormField label="Time Range" required>
                    <input
                      type="text"
                      {...register(`deliveryOptions.${index}.timeRange`, {
                        required: 'Time range is required',
                      })}
                      placeholder="2-4 hours"
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    />
                  </FormField>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendDelivery({
                  type: 'pickup',
                  cost: 0,
                  timeRange: '30 minutes',
                })
              }
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
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              />
            </FormField>

            <FormField label="Lead Time">
              <select
                {...register('leadTime')}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
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
                  {certificationOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register('certifications')}
                        className="w-4 h-4 text-muted-olive border-gray-300 rounded focus:ring-muted-olive"
                      />
                      <span className="text-sm text-text-dark">
                        {option.label}
                      </span>
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
