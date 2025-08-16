/**
 * Cloudinary Integration Service for Aaroth Fresh
 *
 * This service handles image upload, transformation, and management
 * using Cloudinary's cloud-based image and video management service.
 */

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  apiKey: process.env.VITE_CLOUDINARY_API_KEY || 'your-api-key',
  uploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'aaroth-products',
  folder: 'aaroth-fresh/products',
};

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export const uploadImageToCloudinary = async (file, options = {}) => {
  try {
    const formData = new FormData();

    // Required fields
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

    // Optional configurations
    if (options.folder || CLOUDINARY_CONFIG.folder) {
      formData.append('folder', options.folder || CLOUDINARY_CONFIG.folder);
    }

    if (options.publicId) {
      formData.append('public_id', options.publicId);
    }

    // Image transformations
    if (options.transformation) {
      formData.append('transformation', JSON.stringify(options.transformation));
    }

    // Auto-optimize and format
    formData.append('quality', 'auto:best');
    formData.append('fetch_format', 'auto');

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      success: true,
      data: {
        id: result.public_id,
        url: result.secure_url,
        originalUrl: result.secure_url,
        thumbnailUrl: result.secure_url.replace(
          '/upload/',
          '/upload/w_300,h_300,c_fill/'
        ),
        mediumUrl: result.secure_url.replace(
          '/upload/',
          '/upload/w_800,h_800,c_fit/'
        ),
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
      },
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message || 'Upload failed',
    };
  }
};

/**
 * Generate optimized image URLs with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformation options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  if (!publicId) return null;

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`;

  // Build transformation string
  const transforms = [];

  if (transformations.width) transforms.push(`w_${transformations.width}`);
  if (transformations.height) transforms.push(`h_${transformations.height}`);
  if (transformations.crop) transforms.push(`c_${transformations.crop}`);
  if (transformations.quality) transforms.push(`q_${transformations.quality}`);
  if (transformations.format) transforms.push(`f_${transformations.format}`);

  // Default optimizations
  transforms.push('q_auto', 'f_auto');

  const transformString =
    transforms.length > 0 ? `/${transforms.join(',')}` : '';

  return `${baseUrl}${transformString}/${publicId}`;
};

/**
 * Generate responsive image URLs for different screen sizes
 * @param {string} publicId - Cloudinary public ID
 * @returns {Object} Object with URLs for different breakpoints
 */
export const getResponsiveImageUrls = (publicId) => {
  if (!publicId) return {};

  return {
    thumbnail: getOptimizedImageUrl(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
    }),
    small: getOptimizedImageUrl(publicId, {
      width: 300,
      height: 300,
      crop: 'fit',
    }),
    medium: getOptimizedImageUrl(publicId, {
      width: 600,
      height: 600,
      crop: 'fit',
    }),
    large: getOptimizedImageUrl(publicId, {
      width: 1200,
      height: 1200,
      crop: 'fit',
    }),
    original: getOptimizedImageUrl(publicId),
  };
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    // Note: This requires server-side implementation due to API key security
    // The actual deletion should be handled by your backend API
    const response = await fetch('/api/v1/admin/images/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message || 'Delete failed',
    };
  }
};

/**
 * Validate image file before upload
 * @param {File} file - Image file
 * @param {Object} constraints - Validation constraints
 * @returns {Object} Validation result
 */
export const validateImageFile = (file, constraints = {}) => {
  const errors = [];

  // Default constraints
  const {
    maxSizeInMB = 5,
    allowedFormats = ['jpeg', 'jpg', 'png', 'webp'],
    minWidth = 100,
    minHeight = 100,
    maxWidth = 4000,
    maxHeight = 4000,
  } = constraints;

  // Check file type
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedFormats.includes(fileExtension)) {
    errors.push(
      `Invalid format. Allowed formats: ${allowedFormats.join(', ')}`
    );
  }

  // Check file size
  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeInMB) {
    errors.push(`File too large. Maximum size: ${maxSizeInMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate placeholder image URL while loading
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} text - Placeholder text
 * @returns {string} Placeholder URL
 */
export const getPlaceholderImageUrl = (
  width = 400,
  height = 400,
  text = 'Loading...'
) => {
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/6b7280?text=${encodeURIComponent(text)}`;
};

/**
 * Batch upload multiple images
 * @param {FileList|Array} files - Array of image files
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array>} Array of upload results
 */
export const batchUploadImages = async (
  files,
  options = {},
  onProgress = null
) => {
  const fileArray = Array.from(files);
  const results = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];

    // Validate file
    const validation = validateImageFile(file, options.validation);
    if (!validation.isValid) {
      results.push({
        success: false,
        filename: file.name,
        error: validation.errors.join(', '),
      });
      continue;
    }

    try {
      const result = await uploadImageToCloudinary(file, {
        ...options,
        folder: options.folder ? `${options.folder}/${i}` : undefined,
      });

      results.push({
        ...result,
        filename: file.name,
        index: i,
      });

      // Call progress callback
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total: fileArray.length,
          percentage: Math.round(((i + 1) / fileArray.length) * 100),
        });
      }
    } catch (error) {
      results.push({
        success: false,
        filename: file.name,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Image transformation presets for common use cases
 */
export const TRANSFORMATION_PRESETS = {
  productThumbnail: { width: 200, height: 200, crop: 'fill', quality: 'auto' },
  productCard: { width: 400, height: 300, crop: 'fill', quality: 'auto' },
  productGallery: { width: 800, height: 600, crop: 'fit', quality: 'auto' },
  productHero: { width: 1200, height: 800, crop: 'fit', quality: 'auto' },
  avatar: { width: 150, height: 150, crop: 'fill', quality: 'auto' },
  categoryIcon: { width: 100, height: 100, crop: 'fill', quality: 'auto' },
};

export default {
  uploadImageToCloudinary,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  deleteImageFromCloudinary,
  validateImageFile,
  getPlaceholderImageUrl,
  batchUploadImages,
  TRANSFORMATION_PRESETS,
};
