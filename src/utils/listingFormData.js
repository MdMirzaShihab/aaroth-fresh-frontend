/**
 * Utility functions for creating FormData objects for listing API calls
 * Matches backend Listing model schema and vendorDashboardController expectations
 */

/**
 * Converts estimated delivery time string to numeric hours for backend
 * @param {string} deliveryTimeString - Delivery time string from form
 * @returns {number} Hours as number
 */
export const convertDeliveryTimeToHours = (deliveryTimeString) => {
  const deliveryTimeMap = {
    '2-4 hours': 3,
    'same day': 12,
    'next day': 24,
  };

  return deliveryTimeMap[deliveryTimeString] || 3; // Default to 3 hours
};

/**
 * Creates FormData for listing creation matching backend expectations
 * Backend expects: vendorDashboardController.createListing + Listing model schema
 *
 * @param {Object} listingData - Listing data object from form
 * @param {File[]} imageFiles - Array of image files
 * @returns {FormData} FormData object ready for API submission
 */
export const createListingFormData = (listingData, imageFiles = []) => {
  const formData = new FormData();

  // Required: Market ID
  if (listingData.marketId) {
    formData.append('marketId', listingData.marketId);
  }

  // Required: Product ID
  if (listingData.productId) {
    formData.append('productId', listingData.productId);
  }

  // Required: Quality Grade
  if (listingData.qualityGrade) {
    formData.append('qualityGrade', listingData.qualityGrade);
  }

  // Optional: Description
  if (listingData.description) {
    formData.append('description', listingData.description);
  }

  // Required: Pricing array (at least one pricing option)
  if (listingData.pricing && Array.isArray(listingData.pricing)) {
    listingData.pricing.forEach((price, index) => {
      // Required fields in pricing
      if (price.pricePerBaseUnit) {
        formData.append(`pricing[${index}][pricePerBaseUnit]`, parseFloat(price.pricePerBaseUnit));
      }

      if (price.unit) {
        formData.append(`pricing[${index}][unit]`, price.unit);
      }

      // Pack selling options
      formData.append(`pricing[${index}][enablePackSelling]`, price.enablePackSelling || false);

      if (price.enablePackSelling) {
        if (price.packSize) {
          formData.append(`pricing[${index}][packSize]`, parseFloat(price.packSize));
        }

        if (price.packUnit) {
          formData.append(`pricing[${index}][packUnit]`, price.packUnit);
        }

        if (price.minimumPacks) {
          formData.append(`pricing[${index}][minimumPacks]`, parseInt(price.minimumPacks));
        }

        if (price.maximumPacks && price.maximumPacks !== '') {
          formData.append(`pricing[${index}][maximumPacks]`, parseInt(price.maximumPacks));
        }
      }
    });
  }

  // Required: Availability object
  if (listingData.availability) {
    const { availability } = listingData;

    // Required: Quantity Available
    if (availability.quantityAvailable !== undefined && availability.quantityAvailable !== '') {
      formData.append('availability[quantityAvailable]', parseFloat(availability.quantityAvailable));
    }

    // Required: Unit
    if (availability.unit) {
      formData.append('availability[unit]', availability.unit);
    }

    // Optional: Harvest Date
    if (availability.harvestDate) {
      formData.append('availability[harvestDate]', availability.harvestDate);
    }

    // Optional: Expiry Date
    if (availability.expiryDate) {
      formData.append('availability[expiryDate]', availability.expiryDate);
    }

    // Optional: Is In Season (defaults to true in backend)
    if (availability.isInSeason !== undefined) {
      formData.append('availability[isInSeason]', availability.isInSeason);
    }
  }

  // Required when pack selling is disabled: Order Quantity Limits
  if (listingData.minimumOrderQuantity && listingData.minimumOrderQuantity !== '') {
    formData.append('minimumOrderQuantity', parseFloat(listingData.minimumOrderQuantity));
  }

  if (listingData.maximumOrderQuantity && listingData.maximumOrderQuantity !== '') {
    formData.append('maximumOrderQuantity', parseFloat(listingData.maximumOrderQuantity));
  }

  // Optional: Delivery Options (nested object structure)
  if (listingData.deliveryOptions) {
    const { deliveryOptions } = listingData;

    // Self Pickup options
    if (deliveryOptions.selfPickup) {
      formData.append('deliveryOptions[selfPickup][enabled]', deliveryOptions.selfPickup.enabled || false);

      if (deliveryOptions.selfPickup.address) {
        formData.append('deliveryOptions[selfPickup][address]', deliveryOptions.selfPickup.address);
      }

      if (deliveryOptions.selfPickup.instructions) {
        formData.append('deliveryOptions[selfPickup][instructions]', deliveryOptions.selfPickup.instructions);
      }
    }

    // Delivery options (home delivery)
    if (deliveryOptions.delivery) {
      formData.append('deliveryOptions[delivery][enabled]', deliveryOptions.delivery.enabled || true);

      // Delivery fee (can be 0)
      if (deliveryOptions.delivery.fee !== undefined && deliveryOptions.delivery.fee !== '') {
        formData.append('deliveryOptions[delivery][fee]', parseFloat(deliveryOptions.delivery.fee));
      }

      // Quantity-based free delivery minimum
      if (deliveryOptions.delivery.freeDeliveryMinimumQuantity && deliveryOptions.delivery.freeDeliveryMinimumQuantity !== '') {
        formData.append('deliveryOptions[delivery][freeDeliveryMinimumQuantity]', parseFloat(deliveryOptions.delivery.freeDeliveryMinimumQuantity));
      }

      // Unit for free delivery minimum (matches pricing unit)
      if (deliveryOptions.delivery.freeDeliveryMinimumUnit) {
        formData.append('deliveryOptions[delivery][freeDeliveryMinimumUnit]', deliveryOptions.delivery.freeDeliveryMinimumUnit);
      }

      // Estimated delivery time (required, converted to hours)
      if (deliveryOptions.delivery.estimatedDeliveryTime) {
        const deliveryTimeHours = typeof deliveryOptions.delivery.estimatedDeliveryTime === 'string'
          ? convertDeliveryTimeToHours(deliveryOptions.delivery.estimatedDeliveryTime)
          : parseFloat(deliveryOptions.delivery.estimatedDeliveryTime);
        formData.append('deliveryOptions[delivery][estimatedDeliveryTime]', deliveryTimeHours);
      }
    }
  }

  // leadTime field is now calculated from estimatedDeliveryTime on backend
  // No need to send it separately from frontend

  // Optional: Discount object
  if (listingData.discount && listingData.discount.value) {
    if (listingData.discount.type) {
      formData.append('discount[type]', listingData.discount.type);
    }

    if (listingData.discount.value) {
      formData.append('discount[value]', parseFloat(listingData.discount.value));
    }

    if (listingData.discount.validUntil) {
      formData.append('discount[validUntil]', listingData.discount.validUntil);
    }
  }

  // Optional: Certifications (array of strings for now - simplified)
  if (listingData.certifications && Array.isArray(listingData.certifications)) {
    listingData.certifications.forEach((cert, index) => {
      if (cert) {
        formData.append(`certifications[${index}]`, cert);
      }
    });
  }

  // Required: Image files (backend expects at least one via multer middleware)
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
  }

  return formData;
};

/**
 * Creates FormData for listing update
 * @param {Object} listingData - Updated listing data object
 * @param {File[]} imageFiles - Array of image files (will replace existing images)
 * @returns {FormData} FormData object ready for API submission
 */
export const updateListingFormData = (listingData, imageFiles = []) => {
  // For updates, use the same structure but all fields are optional
  return createListingFormData(listingData, imageFiles);
};

/**
 * Validates image files before uploading
 * @param {FileList|File[]} files - Files to validate
 * @param {number} maxFiles - Maximum number of files allowed
 * @returns {Object} Validation result
 */
export const validateListingImages = (files, maxFiles = 5) => {
  const fileArray = Array.from(files);
  const errors = [];
  const validFiles = [];

  // Check number of files
  if (fileArray.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} images allowed`);
    return { isValid: false, errors, validFiles: [] };
  }

  // Validate each file
  fileArray.forEach((file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name} is not an image file`);
      return;
    }

    // Check file size (5MB limit for better quality)
    if (file.size > 5 * 1024 * 1024) {
      errors.push(`${file.name} is too large (max 5MB)`);
      return;
    }

    // Check supported formats
    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!supportedFormats.includes(file.type)) {
      errors.push(
        `${file.name} format not supported. Use JPG, PNG, WebP, or GIF`
      );
      return;
    }

    validFiles.push(file);
  });

  return {
    isValid: errors.length === 0,
    errors,
    validFiles,
  };
};

/**
 * Converts backend listing response to frontend format
 * @param {Object} backendListing - Listing from backend API
 * @returns {Object} Formatted listing for frontend use
 */
export const formatListingFromBackend = (backendListing) => {
  if (!backendListing) return null;

  return {
    id: backendListing.id || backendListing._id,
    vendor: backendListing.vendor || backendListing.vendorId,
    product: backendListing.product || backendListing.productId,
    market: backendListing.market || backendListing.marketId,
    pricing: backendListing.pricing || [],
    availability: backendListing.availability || {},
    description: backendListing.description || '',
    images: backendListing.images || [],
    qualityGrade: backendListing.qualityGrade || 'Standard',
    deliveryOptions: backendListing.deliveryOptions || {},
    minimumOrderValue: backendListing.minimumOrderValue || 0,
    minimumOrderQuantity: backendListing.minimumOrderQuantity,
    maximumOrderQuantity: backendListing.maximumOrderQuantity,
    leadTime: backendListing.leadTime || 0,
    discount: backendListing.discount || null,
    certifications: backendListing.certifications || [],
    status: backendListing.status || 'active',
    createdAt: backendListing.createdAt,
    updatedAt: backendListing.updatedAt,
  };
};
