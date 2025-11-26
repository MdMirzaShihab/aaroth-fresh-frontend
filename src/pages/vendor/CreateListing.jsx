import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Search,
} from 'lucide-react';
import {
  useCreateListingMutation,
  useGetProductCatalogQuery,
  useGetListingCategoriesQuery,
  useUploadListingImagesMutation,
} from '../../store/slices/vendor/vendorListingsApi';
import { addNotification } from '../../store/slices/notificationSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import FileUpload from '../../components/ui/FileUpload';
import MarketSelector from '../../components/common/MarketSelector';

const CreateListing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Form management
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      marketId: '',
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
        unit: '',
        harvestDate: '',
        expiryDate: '',
      },
      deliveryOptions: {
        selfPickup: {
          enabled: false,
          address: '',
          instructions: '',
        },
        delivery: {
          enabled: true,
          radius: '',
          fee: '',
          freeDeliveryMinimum: '',
          estimatedTime: '',
        },
      },
      minimumOrderQuantity: '',
      maximumOrderQuantity: '',
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

  // Field arrays for dynamic forms (only pricing is an array)
  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({
    control,
    name: 'pricing',
  });

  // API mutations and queries
  const [createListing] = useCreateListingMutation();
  const [uploadImages] = useUploadListingImagesMutation();

  const { data: productsData, isLoading: productsLoading } =
    useGetProductCatalogQuery({
      limit: 1000, // Get all products for selection
    });

  const { data: categoriesData } = useGetListingCategoriesQuery();

  const products = productsData || [];
  const categories = categoriesData || [];

  // Form data watchers
  const watchedProduct = watch('productId');
  const watchedPricing = watch('pricing');
  const watchedAvailability = watch('availability');

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const searchLower = productSearchTerm.toLowerCase();
    const productName = product.name?.toLowerCase() || '';
    const categoryName = product.category?.name?.toLowerCase() || '';
    return productName.includes(searchLower) || categoryName.includes(searchLower);
  });

  // Get selected product details
  const selectedProduct = products.find(p => p.id === watchedProduct);

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

  // Quality grade options (must match backend enum)
  const qualityGradeOptions = [
    { value: 'Premium', label: 'Premium' },
    { value: 'Grade A', label: 'Grade A' },
    { value: 'Grade B', label: 'Grade B' },
    { value: 'Standard', label: 'Standard' },
  ];

  // Certification options
  const certificationOptions = [
    { value: 'organic', label: 'Organic' },
    { value: 'fair-trade', label: 'Fair Trade' },
    { value: 'non-gmo', label: 'Non-GMO' },
    { value: 'locally-grown', label: 'Locally Grown' },
    { value: 'pesticide-free', label: 'Pesticide-Free' },
  ];

  // Delivery areas (this would typically come from a config or API)
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

  // Handle image upload
  const handleImageUpload = (files) => {
    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);

    // Create preview URLs
    const newImages = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random(),
    }));

    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  // Remove image
  const handleRemoveImage = (imageId) => {
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
  };

  // Form submission
  const onSubmit = async (data) => {
    if (imageFiles.length === 0) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Images Required',
          message: 'Please upload at least one product image.',
        })
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform certifications from array of strings to array of objects
      const transformedCertifications = data.certifications?.length > 0
        ? data.certifications.map(cert => ({ name: cert }))
        : [];

      // Build listing data
      const listingData = {
        marketId: data.marketId,
        productId: data.productId,
        pricing: data.pricing,
        qualityGrade: data.qualityGrade,
        availability: data.availability,
        description: data.description,
        deliveryOptions: data.deliveryOptions,
        minimumOrderValue: data.minimumOrderValue,
        leadTime: data.leadTime,
        certifications: transformedCertifications,
        ...(data.discount.value && { discount: data.discount }),
      };

      // Add order quantity limits if pack-based selling is disabled
      if (!data.pricing[0]?.enablePackSelling) {
        listingData.minimumOrderQuantity = parseFloat(data.minimumOrderQuantity);
        listingData.maximumOrderQuantity = parseFloat(data.maximumOrderQuantity);
      }

      const result = await createListing(listingData).unwrap();

      // Then upload images if listing was created successfully
      if (result.listing && imageFiles.length > 0) {
        const imageFormData = new FormData();
        imageFiles.forEach((file) => {
          imageFormData.append('images', file);
        });

        await uploadImages({
          listingId: result.listing.id,
          imagesFormData: imageFormData,
        }).unwrap();
      }

      dispatch(
        addNotification({
          type: 'success',
          title: 'Listing Created',
          message: 'Your product listing has been created successfully!',
        })
      );

      navigate('/vendor/listings/manage');
    } catch (error) {
      console.error('Failed to create listing:', error);
      dispatch(
        addNotification({
          type: 'error',
          title: 'Creation Failed',
          message:
            error.data?.message ||
            'Failed to create listing. Please try again.',
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

  // Close product dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProductDropdown && !event.target.closest('.product-selector')) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProductDropdown]);

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
            Create New Listing
          </h1>
          <p className="text-text-muted mt-1">
            Add a new product listing to showcase your offerings
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Market Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Market Location
          </h2>

          <MarketSelector
            name="marketId"
            register={register}
            error={errors.marketId?.message}
            required
            label="Select Market"
          />

          <p className="text-sm text-text-muted dark:text-gray-400 mt-2">
            Choose the market where this product will be available
          </p>
        </Card>

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
              <div className="relative product-selector">
                {/* Hidden input for form validation */}
                <input
                  type="hidden"
                  {...register('productId', {
                    required: 'Please select a product',
                  })}
                />

                {/* Search input or selected product display */}
                {selectedProduct ? (
                  <div className="border border-gray-200 rounded-2xl p-3 bg-white">
                    <div className="flex items-center gap-3">
                      {/* Product Image */}
                      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        {selectedProduct.images?.[0]?.url ? (
                          <img
                            src={selectedProduct.images[0].url}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text-dark truncate">
                          {selectedProduct.name}
                        </div>
                        {selectedProduct.category?.name && (
                          <div className="text-sm text-text-muted truncate">
                            {selectedProduct.category.name}
                          </div>
                        )}
                      </div>

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setValue('productId', '');
                          setProductSearchTerm('');
                          setShowProductDropdown(true);
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value);
                        setShowProductDropdown(true);
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      placeholder="Search for a product..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    />
                  </div>
                )}

                {/* Dropdown list */}
                {showProductDropdown && !selectedProduct && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-80 overflow-y-auto">
                    {productsLoading ? (
                      <div className="px-4 py-3 text-sm text-text-muted flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        Loading products...
                      </div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            setValue('productId', product.id);
                            setShowProductDropdown(false);
                            setProductSearchTerm('');
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-mint-fresh/10 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            {/* Product Image */}
                            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-400" />
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-text-dark truncate">
                                {product.name}
                              </div>
                              {product.category?.name && (
                                <div className="text-sm text-text-muted truncate">
                                  {product.category.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <div className="text-sm text-text-muted">
                          No products found matching "{productSearchTerm}"
                        </div>
                        <div className="text-xs text-text-muted mt-1">
                          Try searching with a different term
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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

        {/* Order Quantity Limits - Only shown when pack-based selling is disabled */}
        {!watch('pricing.0.enablePackSelling') && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Quantity Limits
            </h2>

            <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 mb-6">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                These limits apply when pack-based selling is disabled. Buyers must order within these quantity ranges.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Minimum Order Quantity"
                error={errors.minimumOrderQuantity?.message}
                required
                hint={`In ${watch('pricing.0.unit') || 'units'}`}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register('minimumOrderQuantity', {
                    required: !watch('pricing.0.enablePackSelling')
                      ? 'Minimum order quantity is required when not using pack-based selling'
                      : false,
                    min: {
                      value: 0,
                      message: 'Minimum quantity cannot be negative',
                    },
                    validate: value => {
                      const availableQty = parseFloat(watch('availability.quantityAvailable'));
                      if (availableQty && parseFloat(value) > availableQty) {
                        return 'Minimum order quantity cannot exceed available quantity';
                      }
                      return true;
                    }
                  })}
                  placeholder="10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>

              <FormField
                label="Maximum Order Quantity"
                error={errors.maximumOrderQuantity?.message}
                required
                hint={`In ${watch('pricing.0.unit') || 'units'}`}
              >
                <input
                  type="number"
                  step="0.01"
                  {...register('maximumOrderQuantity', {
                    required: !watch('pricing.0.enablePackSelling')
                      ? 'Maximum order quantity is required when not using pack-based selling'
                      : false,
                    min: {
                      value: 0,
                      message: 'Maximum quantity cannot be negative',
                    },
                    validate: value => {
                      const minQty = parseFloat(watch('minimumOrderQuantity'));
                      const availableQty = parseFloat(watch('availability.quantityAvailable'));

                      if (minQty && parseFloat(value) < minQty) {
                        return 'Maximum must be greater than or equal to minimum';
                      }

                      if (availableQty && parseFloat(value) > availableQty) {
                        return 'Maximum order quantity cannot exceed available quantity';
                      }

                      return true;
                    }
                  })}
                  placeholder="100"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>
            </div>
          </Card>
        )}

        {/* Availability */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability & Stock
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              label="Unit"
              error={errors.availability?.unit?.message}
              required
            >
              <select
                {...register('availability.unit', {
                  required: 'Unit is required',
                })}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
              >
                <option value="">Select unit...</option>
                {unitOptions.filter(opt => opt.value !== 'pack').map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            <FileUpload
              accept="image/*"
              multiple
              maxFiles={5}
              onFileSelect={handleImageUpload}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-muted-olive transition-colors"
            />

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
                      <img
                        src={image.preview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(image.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-tomato-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-text-muted">
              Upload up to 5 high-quality images. First image will be used as
              the main product image.
            </p>
          </div>
        </Card>

        {/* Delivery Options */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Delivery Configuration
          </h2>

          <div className="bg-blue-50/50 border border-blue-200/50 rounded-xl p-3 mb-6">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              Configure delivery options for your products. All deliveries will be handled by Aaroth Fresh delivery service.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Delivery Radius (km)"
                error={errors.deliveryOptions?.delivery?.radius?.message}
                hint="Maximum distance for delivery"
              >
                <input
                  type="number"
                  step="0.1"
                  {...register('deliveryOptions.delivery.radius')}
                  placeholder="10"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>

              <FormField
                label="Delivery Fee (৳)"
                error={errors.deliveryOptions?.delivery?.fee?.message}
                hint="Standard delivery charge"
              >
                <input
                  type="number"
                  step="0.01"
                  {...register('deliveryOptions.delivery.fee')}
                  placeholder="50.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>

              <FormField
                label="Free Delivery Minimum (৳)"
                error={errors.deliveryOptions?.delivery?.freeDeliveryMinimum?.message}
                hint="Order amount for free delivery"
              >
                <input
                  type="number"
                  step="0.01"
                  {...register('deliveryOptions.delivery.freeDeliveryMinimum')}
                  placeholder="500.00"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>

              <FormField
                label="Estimated Delivery Time"
                error={errors.deliveryOptions?.delivery?.estimatedTime?.message}
                hint="Expected delivery timeframe"
              >
                <input
                  type="text"
                  {...register('deliveryOptions.delivery.estimatedTime')}
                  placeholder="2-4 hours"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>
            </div>
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
                  Creating Listing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Listing
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateListing;
