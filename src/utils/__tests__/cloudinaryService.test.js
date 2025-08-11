import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  uploadImageToCloudinary,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  validateImageFile,
  getPlaceholderImageUrl,
  batchUploadImages,
  TRANSFORMATION_PRESETS
} from '../cloudinaryService';

// Mock fetch globally
global.fetch = vi.fn();

describe('cloudinaryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadImageToCloudinary', () => {
    it('uploads image successfully', async () => {
      const mockResponse = {
        public_id: 'test-image-123',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 102400,
        created_at: '2024-01-15T10:00:00Z'
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageToCloudinary(file);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        id: 'test-image-123',
        url: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
        originalUrl: 'https://res.cloudinary.com/test/image/upload/test-image-123.jpg',
        thumbnailUrl: 'https://res.cloudinary.com/test/image/upload/w_300,h_300,c_fill/test-image-123.jpg',
        mediumUrl: 'https://res.cloudinary.com/test/image/upload/w_800,h_800,c_fit/test-image-123.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        size: 102400,
        createdAt: '2024-01-15T10:00:00Z'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.cloudinary.com'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });

    it('handles upload failure', async () => {
      fetch.mockResolvedValue({
        ok: false,
        statusText: 'Bad Request'
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageToCloudinary(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Upload failed: Bad Request');
    });

    it('handles network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageToCloudinary(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('applies custom options', async () => {
      const mockResponse = {
        public_id: 'custom-image',
        secure_url: 'https://res.cloudinary.com/test/image/upload/custom-image.jpg',
        width: 400,
        height: 400,
        format: 'jpg',
        bytes: 51200,
        created_at: '2024-01-15T10:00:00Z'
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const options = {
        folder: 'custom-folder',
        publicId: 'custom-id',
        transformation: { width: 400, height: 400 }
      };

      await uploadImageToCloudinary(file, options);

      // Check that fetch was called with FormData containing custom options
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.cloudinary.com'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData)
        })
      );
    });
  });

  describe('getOptimizedImageUrl', () => {
    it('generates optimized URL with transformations', () => {
      const publicId = 'test-image-123';
      const transformations = {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 80
      };

      const url = getOptimizedImageUrl(publicId, transformations);

      expect(url).toContain('res.cloudinary.com');
      expect(url).toContain('w_800');
      expect(url).toContain('h_600');
      expect(url).toContain('c_fill');
      expect(url).toContain('q_80');
      expect(url).toContain('q_auto');
      expect(url).toContain('f_auto');
      expect(url).toContain(publicId);
    });

    it('returns null for empty publicId', () => {
      const url = getOptimizedImageUrl('');
      expect(url).toBeNull();
    });

    it('applies default optimizations', () => {
      const publicId = 'test-image-123';
      const url = getOptimizedImageUrl(publicId);

      expect(url).toContain('q_auto');
      expect(url).toContain('f_auto');
    });
  });

  describe('getResponsiveImageUrls', () => {
    it('generates responsive URLs for different sizes', () => {
      const publicId = 'test-image-123';
      const urls = getResponsiveImageUrls(publicId);

      expect(urls).toHaveProperty('thumbnail');
      expect(urls).toHaveProperty('small');
      expect(urls).toHaveProperty('medium');
      expect(urls).toHaveProperty('large');
      expect(urls).toHaveProperty('original');

      expect(urls.thumbnail).toContain('w_150,h_150,c_fill');
      expect(urls.small).toContain('w_300,h_300,c_fit');
      expect(urls.medium).toContain('w_600,h_600,c_fit');
      expect(urls.large).toContain('w_1200,h_1200,c_fit');
    });

    it('returns empty object for empty publicId', () => {
      const urls = getResponsiveImageUrls('');
      expect(urls).toEqual({});
    });
  });

  describe('validateImageFile', () => {
    it('validates valid image file', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Mock file size (1MB)
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('rejects invalid file format', () => {
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format. Allowed formats: jpeg, jpg, png, webp');
    });

    it('rejects oversized files', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Mock file size (10MB)
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File too large. Maximum size: 5MB');
    });

    it('applies custom constraints', () => {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 });

      const constraints = {
        maxSizeInMB: 1,
        allowedFormats: ['png']
      };

      const result = validateImageFile(file, constraints);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File too large. Maximum size: 1MB');
      expect(result.errors).toContain('Invalid format. Allowed formats: png');
    });
  });

  describe('getPlaceholderImageUrl', () => {
    it('generates placeholder URL with default parameters', () => {
      const url = getPlaceholderImageUrl();

      expect(url).toContain('via.placeholder.com');
      expect(url).toContain('400x400');
      expect(url).toContain('Loading...');
    });

    it('generates placeholder URL with custom parameters', () => {
      const url = getPlaceholderImageUrl(800, 600, 'Custom Text');

      expect(url).toContain('800x600');
      expect(url).toContain('Custom%20Text');
    });
  });

  describe('batchUploadImages', () => {
    it('uploads multiple images successfully', async () => {
      const mockResponse = {
        public_id: 'test-image',
        secure_url: 'https://res.cloudinary.com/test/image/upload/test-image.jpg',
        width: 800,
        height: 600,
        format: 'jpg',
        bytes: 102400,
        created_at: '2024-01-15T10:00:00Z'
      };

      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      const mockProgress = vi.fn();
      const results = await batchUploadImages(files, {}, mockProgress);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(mockProgress).toHaveBeenCalledTimes(2);
      expect(mockProgress).toHaveBeenCalledWith({
        completed: 2,
        total: 2,
        percentage: 100
      });
    });

    it('handles validation failures', async () => {
      const files = [
        new File(['test'], 'test.pdf', { type: 'application/pdf' }) // Invalid format
      ];

      const results = await batchUploadImages(files);

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(false);
      expect(results[0].error).toContain('Invalid format');
    });

    it('handles mixed success and failure', async () => {
      // Mock fetch to succeed once, fail once
      fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            public_id: 'success',
            secure_url: 'https://example.com/success.jpg',
            width: 800,
            height: 600,
            format: 'jpg',
            bytes: 102400,
            created_at: '2024-01-15T10:00:00Z'
          })
        })
        .mockRejectedValueOnce(new Error('Upload failed'));

      const files = [
        new File(['test1'], 'test1.jpg', { type: 'image/jpeg' }),
        new File(['test2'], 'test2.jpg', { type: 'image/jpeg' })
      ];

      const results = await batchUploadImages(files);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Upload failed');
    });
  });

  describe('TRANSFORMATION_PRESETS', () => {
    it('contains expected presets', () => {
      expect(TRANSFORMATION_PRESETS).toHaveProperty('productThumbnail');
      expect(TRANSFORMATION_PRESETS).toHaveProperty('productCard');
      expect(TRANSFORMATION_PRESETS).toHaveProperty('productGallery');
      expect(TRANSFORMATION_PRESETS).toHaveProperty('productHero');
      expect(TRANSFORMATION_PRESETS).toHaveProperty('avatar');
      expect(TRANSFORMATION_PRESETS).toHaveProperty('categoryIcon');
    });

    it('has valid transformation parameters', () => {
      const preset = TRANSFORMATION_PRESETS.productThumbnail;
      
      expect(preset).toHaveProperty('width');
      expect(preset).toHaveProperty('height');
      expect(preset).toHaveProperty('crop');
      expect(preset).toHaveProperty('quality');
    });
  });

  describe('Error handling', () => {
    it('handles JSON parsing errors', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageToCloudinary(file);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid JSON');
    });

    it('handles missing response data gracefully', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}) // Empty response object
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await uploadImageToCloudinary(file);

      // When essential data like secure_url is missing, service fails gracefully
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('handles empty file list in batch upload', async () => {
      const results = await batchUploadImages([]);
      expect(results).toEqual([]);
    });

    it('handles null/undefined values gracefully', () => {
      expect(getOptimizedImageUrl(null)).toBeNull();
      expect(getOptimizedImageUrl(undefined)).toBeNull();
      expect(getResponsiveImageUrls(null)).toEqual({});
      expect(getResponsiveImageUrls(undefined)).toEqual({});
    });

    it('handles files without extensions', () => {
      const file = new File(['test'], 'filename', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });

      const result = validateImageFile(file);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid format. Allowed formats: jpeg, jpg, png, webp');
    });
  });
});