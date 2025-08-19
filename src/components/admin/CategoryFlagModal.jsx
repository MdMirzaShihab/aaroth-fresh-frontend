import React, { useState, useEffect } from 'react';
import {
  Flag,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  X,
  Clock,
  User,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { useToggleCategoryAvailabilityMutation } from '../../store/slices/apiSlice';

const CategoryFlagModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    isAvailable: true,
    flagReason: '',
  });
  const [errors, setErrors] = useState({});

  const [toggleAvailability, { isLoading }] =
    useToggleCategoryAvailabilityMutation();

  // Initialize form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        isAvailable: category.isAvailable !== false, // Default to true if undefined
        flagReason: category.flagReason || '',
      });
      setErrors({});
    }
  }, [category]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.isAvailable && !formData.flagReason.trim()) {
      newErrors.flagReason =
        'Flag reason is required when disabling availability';
    }

    if (formData.flagReason && formData.flagReason.length > 500) {
      newErrors.flagReason = 'Flag reason cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await toggleAvailability({
        id: category._id,
        isAvailable: formData.isAvailable,
        flagReason: formData.isAvailable
          ? undefined
          : formData.flagReason.trim(),
      }).unwrap();

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to toggle category availability:', error);
      setErrors({
        submit:
          error?.data?.message || 'Failed to update category availability',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      isAvailable: true,
      flagReason: '',
    });
    setErrors({});
    onClose();
  };

  if (!category) return null;

  const isCurrentlyFlagged = category.isAvailable === false;
  const willBeFlagged = !formData.isAvailable;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          {willBeFlagged ? (
            <Flag className="w-5 h-5 text-tomato-red" />
          ) : (
            <CheckCircle className="w-5 h-5 text-bottle-green" />
          )}
          <span>{willBeFlagged ? 'Flag Category' : 'Enable Category'}</span>
        </div>
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category Information */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center">
                <Flag className="w-5 h-5 text-gray-400" />
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-text-dark">{category.name}</h3>
              <p className="text-sm text-text-muted">{category.description}</p>

              {/* Current Status */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-text-muted">Current Status:</span>
                {isCurrentlyFlagged ? (
                  <span className="inline-flex items-center gap-1 bg-tomato-red/10 text-tomato-red px-2 py-1 rounded-lg text-xs">
                    <EyeOff className="w-3 h-3" />
                    Flagged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-bottle-green/10 text-bottle-green px-2 py-1 rounded-lg text-xs">
                    <Eye className="w-3 h-3" />
                    Available
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Current Flag Information */}
        {isCurrentlyFlagged && category.flagReason && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  Currently Flagged
                </p>
                <p className="text-sm text-amber-700 mb-2">
                  {category.flagReason}
                </p>

                {/* Flag metadata */}
                <div className="flex items-center gap-4 text-xs text-amber-600">
                  {category.flaggedBy && (
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>
                        By:{' '}
                        {category.flaggedBy.name || category.flaggedBy.email}
                      </span>
                    </div>
                  )}
                  {category.flaggedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        On: {new Date(category.flaggedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Availability Toggle */}
        <FormField
          label="Category Availability"
          description="Control whether this category is available for use in the system"
        >
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="availability"
                value="true"
                checked={formData.isAvailable === true}
                onChange={() => setFormData({ ...formData, isAvailable: true })}
                className="w-4 h-4 text-bottle-green border-gray-300 focus:ring-bottle-green"
              />
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-bottle-green" />
                <div>
                  <span className="font-medium text-text-dark">Available</span>
                  <p className="text-xs text-text-muted">
                    Category is available for use and will appear in listings
                  </p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
              <input
                type="radio"
                name="availability"
                value="false"
                checked={formData.isAvailable === false}
                onChange={() =>
                  setFormData({ ...formData, isAvailable: false })
                }
                className="w-4 h-4 text-tomato-red border-gray-300 focus:ring-tomato-red"
              />
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 text-tomato-red" />
                <div>
                  <span className="font-medium text-text-dark">
                    Flagged (Unavailable)
                  </span>
                  <p className="text-xs text-text-muted">
                    Category will be hidden and unavailable for new assignments
                  </p>
                </div>
              </div>
            </label>
          </div>
        </FormField>

        {/* Flag Reason */}
        {!formData.isAvailable && (
          <FormField
            label="Flag Reason *"
            error={errors.flagReason}
            description="Please provide a clear reason for flagging this category"
          >
            <textarea
              value={formData.flagReason}
              onChange={(e) =>
                setFormData({ ...formData, flagReason: e.target.value })
              }
              placeholder="e.g., Category no longer relevant, needs restructuring, quality issues..."
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 resize-none ${
                errors.flagReason
                  ? 'border-tomato-red/50 bg-tomato-red/5'
                  : 'border-gray-200'
              }`}
            />
            <div className="flex justify-between text-xs text-text-muted mt-1">
              <span>
                {errors.flagReason && (
                  <span className="text-tomato-red">{errors.flagReason}</span>
                )}
              </span>
              <span>{formData.flagReason.length}/500</span>
            </div>
          </FormField>
        )}

        {/* Impact Warning */}
        {!formData.isAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 mb-1">
                  Impact of Flagging This Category
                </p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>
                    • Category will be hidden from new product assignments
                  </li>
                  <li>• Existing products will remain assigned but flagged</li>
                  <li>
                    • Category will not appear in public category listings
                  </li>
                  <li>• Admin users can still view and manage the category</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className={`flex items-center gap-2 ${
              willBeFlagged
                ? 'bg-tomato-red hover:bg-tomato-red/90 text-white'
                : 'bg-bottle-green hover:bg-bottle-green/90 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              <>
                {willBeFlagged ? (
                  <>
                    <Flag className="w-4 h-4" />
                    Flag Category
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Enable Category
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryFlagModal;
