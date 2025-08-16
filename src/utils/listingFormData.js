/**
 * Utility functions for creating FormData objects for listing API calls
 * According to backend API specifications in api-endpoints.md
 */

/**
 * Creates FormData for listing creation
 * @param {Object} listingData - Listing data object
 * @param {File[]} imageFiles - Array of image files
 * @returns {FormData} FormData object ready for API submission
 */
export const createListingFormData = (listingData, imageFiles = []) => {
  const formData = new FormData();

  // Add basic fields
  if (listingData.productId) {
    formData.append('productId', listingData.productId);
  }

  if (listingData.description) {
    formData.append('description', listingData.description);
  }

  if (listingData.qualityGrade) {
    formData.append('qualityGrade', listingData.qualityGrade);
  }

  if (listingData.minimumOrderValue) {
    formData.append('minimumOrderValue', listingData.minimumOrderValue);
  }

  if (listingData.leadTime) {
    formData.append('leadTime', listingData.leadTime);
  }

  // Add pricing data (array of pricing objects)
  if (listingData.pricing && Array.isArray(listingData.pricing)) {
    listingData.pricing.forEach((price, index) => {
      formData.append(`pricing[${index}][pricePerUnit]`, price.pricePerUnit);
      formData.append(`pricing[${index}][unit]`, price.unit);

      if (price.bulkDiscount) {
        formData.append(
          `pricing[${index}][bulkDiscount][minQuantity]`,
          price.bulkDiscount.minQuantity
        );
        formData.append(
          `pricing[${index}][bulkDiscount][discountPercentage]`,
          price.bulkDiscount.discountPercentage
        );
      }
    });
  }

  // Add availability data
  if (listingData.availability) {
    const { availability } = listingData;

    if (availability.quantityAvailable) {
      formData.append(
        'availability[quantityAvailable]',
        availability.quantityAvailable
      );
    }

    if (availability.harvestDate) {
      formData.append('availability[harvestDate]', availability.harvestDate);
    }

    if (availability.expiryDate) {
      formData.append('availability[expiryDate]', availability.expiryDate);
    }
  }

  // Add delivery options (array of delivery option objects)
  if (
    listingData.deliveryOptions &&
    Array.isArray(listingData.deliveryOptions)
  ) {
    listingData.deliveryOptions.forEach((option, index) => {
      formData.append(`deliveryOptions[${index}][type]`, option.type);
      formData.append(`deliveryOptions[${index}][cost]`, option.cost);
      formData.append(`deliveryOptions[${index}][timeRange]`, option.timeRange);

      if (option.areas && Array.isArray(option.areas)) {
        option.areas.forEach((area, areaIndex) => {
          formData.append(
            `deliveryOptions[${index}][areas][${areaIndex}]`,
            area
          );
        });
      }
    });
  }

  // Add discount data
  if (listingData.discount) {
    const { discount } = listingData;

    if (discount.type) {
      formData.append('discount[type]', discount.type);
    }

    if (discount.value) {
      formData.append('discount[value]', discount.value);
    }

    if (discount.validUntil) {
      formData.append('discount[validUntil]', discount.validUntil);
    }
  }

  // Add certifications (array of strings)
  if (listingData.certifications && Array.isArray(listingData.certifications)) {
    listingData.certifications.forEach((cert, index) => {
      formData.append(`certifications[${index}]`, cert);
    });
  }

  // Add image files (max 5 files)
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
  }

  // Add status if updating
  if (listingData.status) {
    formData.append('status', listingData.status);
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

    // Check file size (1MB limit per API spec)
    if (file.size > 1024 * 1024) {
      errors.push(`${file.name} is too large (max 1MB)`);
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
 * Helper to create a basic listing data structure
 * @param {Object} options - Basic options
 * @returns {Object} Basic listing data structure
 */
export const createBasicListingData = ({
  productId,
  pricePerUnit,
  unit = 'kg',
  quantityAvailable,
  description = '',
  qualityGrade = 'Standard',
} = {}) => {
  return {
    productId,
    pricing: [
      {
        pricePerUnit,
        unit,
      },
    ],
    availability: {
      quantityAvailable,
    },
    description,
    qualityGrade,
    deliveryOptions: [
      {
        type: 'pickup',
        cost: 0,
        timeRange: '30 minutes',
      },
    ],
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
    id: backendListing.id,
    vendor: backendListing.vendor || backendListing.vendorId,
    product: backendListing.product || backendListing.productId,
    pricing: backendListing.pricing || [],
    availability: backendListing.availability || {},
    description: backendListing.description || '',
    images: backendListing.images || [],
    qualityGrade: backendListing.qualityGrade || 'Standard',
    deliveryOptions: backendListing.deliveryOptions || [],
    minimumOrderValue: backendListing.minimumOrderValue || 0,
    leadTime: backendListing.leadTime || '',
    discount: backendListing.discount || null,
    certifications: backendListing.certifications || [],
    status: backendListing.status || 'active',
    createdAt: backendListing.createdAt,
    updatedAt: backendListing.updatedAt,
  };
};
