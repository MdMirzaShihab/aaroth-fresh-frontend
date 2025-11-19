import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  X,
  Image as ImageIcon,
  MapPin,
  AlertCircle,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

// UI Components
import { Modal } from '../../ui/Modal';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import LoadingSpinner from '../../ui/LoadingSpinner';

// API Hooks
import {
  useCreateMarketMutation,
  useUpdateMarketMutation,
} from '../../../store/slices/admin/adminApiSlice';

// Helper functions
import {
  validateMarketData,
  prepareMarketFormData,
} from '../../../constants/markets';

// Cities list
const CITIES = [
  'Dhaka',
  'Chittagong',
  'Sylhet',
  'Rajshahi',
  'Khulna',
  'Barishal',
  'Rangpur',
  'Mymensingh',
  'Nationwide',
];

const MarketEditModal = ({ isOpen, onClose, market = null, onSuccess }) => {
  const isEditMode = Boolean(market);
  const fileInputRef = useRef(null);

  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    district: '',
    coordinates: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragActive, setIsDragActive] = useState(false);

  // ========================================
  // RTK MUTATIONS
  // ========================================

  const [createMarket, { isLoading: isCreating }] = useCreateMarketMutation();
  const [updateMarket, { isLoading: isUpdating }] = useUpdateMarketMutation();

  const isSubmitting = isCreating || isUpdating;

  // ========================================
  // EFFECTS
  // ========================================

  // Initialize form data when market changes
  useEffect(() => {
    if (isEditMode && market) {
      setFormData({
        name: market.name || '',
        description: market.description || '',
        address: market.location?.address || '',
        city: market.location?.city || '',
        district: market.location?.district || '',
        coordinates: market.location?.coordinates
          ? `${market.location.coordinates[0]}, ${market.location.coordinates[1]}`
          : '',
        isActive: market.isActive !== false,
      });
      setImagePreview(market.image || null);
      setImageFile(null);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        district: '',
        coordinates: '',
        isActive: true,
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [isEditMode, market, isOpen]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleImageSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 1MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear image error
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? market.image : null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    const validationData = {
      ...formData,
      image: imageFile,
      existingImage: isEditMode ? market.image : null,
    };

    const { isValid, errors: validationErrors } =
      validateMarketData(validationData);

    if (!isValid) {
      setErrors(validationErrors);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      // Parse coordinates if provided
      let coordinates = null;
      if (formData.coordinates.trim()) {
        const coordParts = formData.coordinates
          .split(',')
          .map((c) => parseFloat(c.trim()));
        if (coordParts.length === 2 && !coordParts.some(isNaN)) {
          coordinates = coordParts;
        }
      }

      // Prepare form data
      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        address: formData.address.trim(),
        city: formData.city,
        district: formData.district.trim(),
        isActive: formData.isActive,
      };

      if (coordinates) {
        submitData.coordinates = coordinates;
      }

      // Create FormData object
      const apiFormData = prepareMarketFormData(submitData, imageFile);

      // Submit to API
      if (isEditMode) {
        await updateMarket({ id: market._id, formData: apiFormData }).unwrap();
        toast.success('Market updated successfully');
      } else {
        await createMarket(apiFormData).unwrap();
        toast.success('Market created successfully');
      }

      // Call success callback and close
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.data?.message || 'Failed to save market');
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Market' : 'Create New Market'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-6">
        {/* Image Upload Section */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-2">
            Market Image *
          </label>

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Market preview"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Drag and Drop Area */}
          {!imagePreview && (
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                ${
                  isDragActive
                    ? 'border-bottle-green bg-mint-fresh/10'
                    : 'border-gray-300 hover:border-bottle-green hover:bg-mint-fresh/5'
                }
              `}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-bottle-green mx-auto mb-3" />
              <p className="text-sm font-medium text-text-dark mb-1">
                Drop image here or click to upload
              </p>
              <p className="text-xs text-text-muted">
                JPG, PNG, or GIF (max 1MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {errors.image && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.image}
            </p>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <FormField label="Market Name" required error={errors.name}>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter market name"
              maxLength={50}
            />
            <p className="text-xs text-text-muted mt-1">
              {formData.name.length}/50 characters
            </p>
          </FormField>

          {/* City */}
          <FormField label="City" required error={errors.city}>
            <select
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
            >
              <option value="">Select City</option>
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Description */}
        <FormField label="Description" error={errors.description}>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter market description (optional)"
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green resize-none"
          />
          <p className="text-xs text-text-muted mt-1">
            {formData.description.length}/500 characters
          </p>
        </FormField>

        {/* Location Details */}
        <div className="bg-mint-fresh/5 rounded-2xl p-6 border border-mint-fresh/20">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-bottle-green" />
            <h3 className="text-lg font-semibold text-text-dark">
              Location Details
            </h3>
          </div>

          <div className="space-y-4">
            {/* Address */}
            <FormField label="Address" required error={errors.address}>
              <Input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
              />
            </FormField>

            {/* District */}
            <FormField label="District (Optional)">
              <Input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Enter district name"
              />
            </FormField>

            {/* Coordinates */}
            <FormField
              label="Coordinates (Optional)"
              helpText="Format: longitude, latitude (e.g., 90.4152, 23.7104)"
            >
              <Input
                type="text"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleInputChange}
                placeholder="e.g., 90.4152, 23.7104"
              />
            </FormField>
          </div>
        </div>

        {/* Active Status */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-5 h-5 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
          />
          <label htmlFor="isActive" className="text-sm text-text-dark">
            Mark this market as active
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-secondary text-white flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditMode ? 'Update Market' : 'Create Market'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MarketEditModal;
