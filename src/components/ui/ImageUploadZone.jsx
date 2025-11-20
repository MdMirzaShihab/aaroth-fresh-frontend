/**
 * ImageUploadZone - Enhanced Image Upload Component
 * Beautiful drag-and-drop with animations, previews, and organic design
 * Supports single and multiple image uploads
 */

import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Star, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUploadZone = ({
  value = null, // Single image: File | string URL
  values = [], // Multiple images: Array<{file?: File, url: string, isPrimary?: boolean}>
  onChange, // Callback for single image
  onMultipleChange, // Callback for multiple images
  onRemove, // Callback when image is removed
  onSetPrimary, // Callback to set primary image (multiple mode)
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB default
  accept = 'image/*',
  required = false,
  label = 'Upload Image',
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Handle file validation
  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }
    if (file.size > maxSize) {
      const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
      return `Image size must be less than ${sizeMB}MB`;
    }
    return null;
  };

  // Handle file selection
  const handleFiles = useCallback(
    (files) => {
      const fileArray = Array.from(files);

      if (multiple) {
        // Check total count
        const totalFiles = values.length + fileArray.length;
        if (totalFiles > maxFiles) {
          alert(`You can upload a maximum of ${maxFiles} images`);
          return;
        }

        // Validate and process each file
        const newImages = [];
        for (const file of fileArray) {
          const error = validateFile(file);
          if (error) {
            alert(error);
            return;
          }
          newImages.push({
            file,
            url: URL.createObjectURL(file),
            isPrimary: values.length === 0 && newImages.length === 0,
          });
        }

        onMultipleChange([...values, ...newImages]);
      } else {
        // Single file mode
        const file = fileArray[0];
        const error = validateFile(file);
        if (error) {
          alert(error);
          return;
        }
        onChange(file);
      }
    },
    [multiple, values, maxFiles, onChange, onMultipleChange]
  );

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      handleFiles(files);
    }
  };

  // File input change
  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files?.length > 0) {
      handleFiles(files);
    }
  };

  // Remove image
  const handleRemoveImage = (index) => {
    if (multiple) {
      const updatedImages = values.filter((_, i) => i !== index);
      // If removed image was primary, make first image primary
      if (values[index].isPrimary && updatedImages.length > 0) {
        updatedImages[0].isPrimary = true;
      }
      onMultipleChange(updatedImages);
      // Revoke object URL to free memory
      if (values[index].file) {
        URL.revokeObjectURL(values[index].url);
      }
    } else {
      if (onRemove) onRemove();
      onChange(null);
    }
  };

  // Set primary image (multiple mode)
  const handleSetPrimaryImage = (index) => {
    const updatedImages = values.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onMultipleChange(updatedImages);
    if (onSetPrimary) onSetPrimary(index);
  };

  // Render single image preview
  const renderSinglePreview = () => {
    const imageUrl = value instanceof File ? URL.createObjectURL(value) : value;

    if (!imageUrl) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative group"
      >
        <div className="aspect-video rounded-2xl overflow-hidden border-2 border-sage-green/20 shadow-glow-green/10">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
        <motion.button
          type="button"
          onClick={() => handleRemoveImage(0)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-3 right-3 p-2 bg-tomato-red/90 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-tomato-red shadow-lg"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </motion.div>
    );
  };

  // Render multiple images preview
  const renderMultiplePreview = () => {
    if (values.length === 0) return null;

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <AnimatePresence>
          {values.map((img, index) => (
            <motion.div
              key={`image-${index}-${img.url}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              <div className="aspect-square rounded-xl overflow-hidden border-2 border-sage-green/20 shadow-sm hover:shadow-glow-green/20 transition-shadow">
                <img
                  src={img.url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Primary badge */}
              {img.isPrimary && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 left-2"
                >
                  <span className="bg-earthy-yellow/90 backdrop-blur-sm text-earthy-brown text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    Primary
                  </span>
                </motion.div>
              )}

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {!img.isPrimary && (
                  <motion.button
                    type="button"
                    onClick={() => handleSetPrimaryImage(index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-earthy-yellow/90 backdrop-blur-sm text-earthy-brown p-1.5 rounded-full hover:bg-earthy-yellow shadow-md"
                    title="Set as primary"
                  >
                    <Star className="w-3 h-3" />
                  </motion.button>
                )}
                <motion.button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-tomato-red/90 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-tomato-red shadow-md"
                  title="Remove image"
                >
                  <X className="w-3 h-3" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // Render upload zone
  const renderUploadZone = () => {
    const showUploadZone = multiple ? values.length < maxFiles : !value;

    if (!showUploadZone) return null;

    return (
      <label className="block cursor-pointer">
        <input
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          multiple={multiple}
          disabled={disabled}
        />
        <motion.div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          animate={{
            borderColor: isDragging
              ? 'rgba(106, 153, 78, 0.5)'
              : 'rgba(209, 213, 219, 0.5)',
            backgroundColor: isDragging
              ? 'rgba(187, 247, 208, 0.1)'
              : 'rgba(249, 250, 251, 0.5)',
          }}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center
            transition-all duration-300 overflow-hidden
            ${isDragging ? 'scale-105 shadow-glow-green/20' : 'hover:border-sage-green/50 hover:bg-mint-fresh/10'}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
        >
          {/* Background gradient on drag */}
          <AnimatePresence>
            {isDragging && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-mint-fresh/20 to-sage-green/10 pointer-events-none"
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={{
              scale: isDragging ? 1.15 : 1,
              rotate: isDragging ? 5 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted-olive/10 to-sage-green/10 flex items-center justify-center">
              <Upload
                className={`w-8 h-8 transition-colors duration-300 ${
                  isDragging ? 'text-bottle-green' : 'text-muted-olive'
                }`}
              />
            </div>
          </motion.div>

          <div className="relative z-10 space-y-2">
            <p className="text-text-dark font-semibold text-lg">
              {isDragging ? 'Drop your images here' : `Click to upload or drag and drop`}
            </p>
            <p className="text-sm text-text-muted leading-relaxed">
              {multiple
                ? `PNG, JPG, GIF (max ${maxFiles} images, ${(maxSize / (1024 * 1024)).toFixed(0)}MB each)`
                : `PNG, JPG, GIF (max ${(maxSize / (1024 * 1024)).toFixed(0)}MB)`}
            </p>
            {required && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-tomato-red/80 font-medium mt-3"
              >
                * Required
              </motion.p>
            )}
          </div>
        </motion.div>
      </label>
    );
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-text-dark mb-2">
          {label}
          {required && <span className="text-tomato-red ml-1">*</span>}
        </label>
      )}

      <AnimatePresence mode="wait">
        {multiple ? (
          <div key="multiple">
            {renderMultiplePreview()}
            {renderUploadZone()}
          </div>
        ) : (
          <div key="single">
            {value ? renderSinglePreview() : renderUploadZone()}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUploadZone;
