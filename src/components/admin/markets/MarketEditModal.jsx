/**
 * MarketEditModal - Enhanced Design V2
 * Beautiful modal for creating and editing market locations
 * Features: Glassmorphism, smooth animations, enhanced UX
 */

import React, { useState, useEffect } from 'react';
import { MapPin, Info, Settings, Check, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

// UI Components
import { Modal } from '../../ui/Modal';
import Button from '../../ui/Button';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';
import ImageUploadZone from '../../ui/ImageUploadZone';
import FormSection from '../../ui/FormSection';
import ControlledBDAddressForm from '../../address/ControlledBDAddressForm';

// API Hooks
import {
  useCreateMarketMutation,
  useUpdateMarketMutation,
} from '../../../store/slices/admin/adminApiSlice';

// Helper to extract location from market data (handles both populated and ObjectId)
const extractMarketLocation = (market) => {
  const loc = market?.location || {};
  return {
    division: loc.division?._id || loc.division || '',
    district: loc.district?._id || loc.district || '',
    upazila: loc.upazila?._id || loc.upazila || '',
    union: loc.union?._id || loc.union || '',
    street: loc.address || '',
    landmark: loc.landmark || '',
    postalCode: loc.postalCode || '',
  };
};

const MarketEditModal = ({ isOpen, onClose, market = null, onSuccess }) => {
  const isEditMode = Boolean(market);

  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: {
      division: '',
      district: '',
      upazila: '',
      union: '',
      street: '',
      landmark: '',
      postalCode: '',
    },
    coordinates: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [errors, setErrors] = useState({});

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
        location: extractMarketLocation(market),
        coordinates: market.location?.coordinates
          ? `${market.location.coordinates[0]}, ${market.location.coordinates[1]}`
          : '',
        isActive: market.isActive !== false,
      });
      setExistingImage(market.image || null);
      setImageFile(null);
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        description: '',
        location: {
          division: '',
          district: '',
          upazila: '',
          union: '',
          street: '',
          landmark: '',
          postalCode: '',
        },
        coordinates: '',
        isActive: true,
      });
      setExistingImage(null);
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Market name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Market name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Market name must not exceed 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (!imageFile && !existingImage) {
      newErrors.image = 'Market image is required';
    }

    // BD Address validation
    if (!formData.location.division) {
      newErrors['location.division'] = 'Division is required';
    }
    if (!formData.location.district) {
      newErrors['location.district'] = 'District is required';
    }
    if (!formData.location.upazila) {
      newErrors['location.upazila'] = 'Upazila is required';
    }
    if (!formData.location.street?.trim()) {
      newErrors['location.street'] = 'Street address is required';
    }
    if (!formData.location.postalCode || !/^\d{4}$/.test(formData.location.postalCode)) {
      newErrors['location.postalCode'] = 'Valid 4-digit postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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

      // Create FormData object
      const apiFormData = new FormData();
      apiFormData.append('name', formData.name.trim());
      apiFormData.append('description', formData.description.trim());
      apiFormData.append('isActive', formData.isActive);

      // BD Location fields
      apiFormData.append('location.division', formData.location.division);
      apiFormData.append('location.district', formData.location.district);
      apiFormData.append('location.upazila', formData.location.upazila);
      if (formData.location.union) {
        apiFormData.append('location.union', formData.location.union);
      }
      apiFormData.append('location.address', formData.location.street.trim());
      if (formData.location.landmark?.trim()) {
        apiFormData.append('location.landmark', formData.location.landmark.trim());
      }
      apiFormData.append('location.postalCode', formData.location.postalCode);

      if (coordinates) {
        apiFormData.append('coordinates', JSON.stringify(coordinates));
      }

      if (imageFile) {
        apiFormData.append('image', imageFile);
      }

      // Submit to API
      if (isEditMode) {
        await updateMarket({ id: market._id, formData: apiFormData }).unwrap();
        toast.success('Market updated successfully! 🎉');
      } else {
        await createMarket(apiFormData).unwrap();
        toast.success('Market created successfully! 🎉');
      }

      // Call success callback and close
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      // Extract error message from different possible locations
      let errorMessage = `Failed to ${isEditMode ? 'update' : 'create'} market`;

      if (error?.data?.error) {
        errorMessage = error.data.error;
        // Check for duplicate key error
        if (error.data.error.includes('Duplicate') || error.data.stack?.includes('E11000')) {
          errorMessage = `A market with the name "${formData.name}" already exists. Please use a different name.`;
          setErrors({ name: 'This market name is already in use' });
        }
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  const displayImage = imageFile || existingImage;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive to-sage-green flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-dark">
              {isEditMode ? 'Edit Market' : 'Create New Market'}
            </h2>
            <p className="text-sm text-text-muted">
              {isEditMode
                ? 'Update market location and details'
                : 'Add a new market location for vendors'}
            </p>
          </div>
        </div>
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <FormSection
          title="Market Image"
          description="Upload a photo of the market location"
          icon={null}
          variant="glass"
        >
          <ImageUploadZone
            value={displayImage}
            onChange={setImageFile}
            onRemove={() => {
              setImageFile(null);
              if (!isEditMode) setExistingImage(null);
            }}
            required
            label=""
            maxSize={1 * 1024 * 1024}
          />
          {errors.image && (
            <p className="text-sm text-tomato-red mt-2">{errors.image}</p>
          )}
        </FormSection>

        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          description="Market name and description"
          icon={Info}
          variant="glass"
        >
          <div className="space-y-4">
            {/* Name */}
            <FormField label="Market Name" required error={errors.name}>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Karwan Bazar, Shyambazar"
                maxLength={50}
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-text-muted">Must be unique</p>
                <p className="text-xs text-text-muted">
                  {formData.name.length}/50
                </p>
              </div>
            </FormField>

            {/* Description */}
            <FormField label="Description (Optional)">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the market..."
                rows={3}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive resize-none transition-all"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-text-muted">
                  What makes this market unique?
                </p>
                <p className="text-xs text-text-muted">
                  {formData.description.length}/500
                </p>
              </div>
            </FormField>
          </div>
        </FormSection>

        {/* Location Details */}
        <FormSection
          title="Location Details"
          description="Precise location information"
          icon={MapPin}
          variant="glass"
        >
          <div className="space-y-4">
            {/* BD Address Form */}
            <ControlledBDAddressForm
              address={formData.location}
              onAddressChange={(newAddress) =>
                setFormData((prev) => ({ ...prev, location: newAddress }))
              }
              errors={{
                division: errors['location.division'],
                district: errors['location.district'],
                upazila: errors['location.upazila'],
                union: errors['location.union'],
                street: errors['location.street'],
                landmark: errors['location.landmark'],
                postalCode: errors['location.postalCode'],
              }}
              required={true}
              includeUnion={true}
              includeLandmark={true}
            />

            {/* Coordinates */}
            <FormField
              label="GPS Coordinates (Optional)"
              helpText="Format: longitude, latitude (e.g., 90.4152, 23.7104)"
            >
              <Input
                type="text"
                name="coordinates"
                value={formData.coordinates}
                onChange={handleInputChange}
                placeholder="e.g., 90.4152, 23.7104"
              />
              <p className="text-xs text-text-muted mt-1">
                GPS coordinates for map integration
              </p>
            </FormField>
          </div>
        </FormSection>

        {/* Settings */}
        <FormSection
          title="Market Status"
          description="Configure market availability"
          icon={Settings}
          variant="glass"
        >
          <div className="flex items-start gap-3 p-4 rounded-xl border border-sage-green/20 bg-mint-fresh/5">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="mt-1 w-5 h-5 rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
            />
            <label htmlFor="isActive" className="flex-1 cursor-pointer">
              <div className="font-medium text-text-dark">Active Market</div>
              <p className="text-sm text-text-muted">
                Active markets are available for vendor selection
              </p>
            </label>
          </div>
        </FormSection>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200"
        >
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-secondary text-white min-w-[120px] flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                {isEditMode ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEditMode ? 'Update Market' : 'Create Market'}
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </Modal>
  );
};

export default MarketEditModal;
