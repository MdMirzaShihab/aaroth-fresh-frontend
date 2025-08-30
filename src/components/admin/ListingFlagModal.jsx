import React, { useState } from 'react';
import { AlertTriangle, Flag, X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';

const FLAG_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'misleading_information', label: 'Misleading Information' },
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'pricing_violation', label: 'Pricing Violation' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];

const ListingFlagModal = ({
  isOpen,
  onClose,
  listing,
  onFlag,
  onUnflag,
  isLoading = false,
}) => {
  const [flagReason, setFlagReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate based on action
    const newErrors = {};

    if (!listing?.isFlagged && !flagReason) {
      newErrors.flagReason = 'Please select a reason for flagging this listing';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (listing?.isFlagged) {
        // Unflag
        await onUnflag(listing._id, moderationNotes || 'Flag removed by admin');
      } else {
        // Flag
        await onFlag(listing._id, flagReason, moderationNotes);
      }
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to update flag status. Please try again.' });
    }
  };

  const handleClose = () => {
    setFlagReason('');
    setModerationNotes('');
    setErrors({});
    onClose();
  };

  if (!listing) return null;

  const isCurrentlyFlagged = listing.isFlagged;
  const modalTitle = isCurrentlyFlagged
    ? 'Remove Flag from Listing'
    : 'Flag Listing';
  const modalIcon = isCurrentlyFlagged ? X : Flag;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={modalTitle} size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Listing Info */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {listing.images?.[0]?.url ||
              listing.productId?.images?.[0]?.url ? (
                <img
                  src={
                    listing.images?.[0]?.url ||
                    listing.productId?.images?.[0]?.url
                  }
                  alt={listing.productId?.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h4 className="font-medium text-text-dark">
                {listing.productId?.name ||
                  listing.product?.name ||
                  'Unknown Product'}
              </h4>
              <p className="text-sm text-text-muted">
                by{' '}
                {listing.vendorId?.businessName ||
                  listing.vendor?.businessName ||
                  'Unknown Vendor'}
              </p>
              {isCurrentlyFlagged && listing.flagReason && (
                <p className="text-xs text-tomato-red mt-1">
                  Currently flagged for:{' '}
                  {FLAG_REASONS.find((r) => r.value === listing.flagReason)
                    ?.label || listing.flagReason}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
          <modalIcon
            className={`w-5 h-5 mt-0.5 ${isCurrentlyFlagged ? 'text-tomato-red' : 'text-amber-600'}`}
          />
          <div>
            <h4 className="text-sm font-medium text-text-dark mb-1">
              {isCurrentlyFlagged
                ? 'Listing is Currently Flagged'
                : 'Flag This Listing'}
            </h4>
            <p className="text-sm text-text-muted">
              {isCurrentlyFlagged
                ? 'This listing is currently flagged and may not be visible to customers. Remove the flag to restore visibility.'
                : 'Flagging this listing will hide it from customers until the issues are resolved.'}
            </p>
          </div>
        </div>

        {/* Flag Reason (only show for flagging) */}
        {!isCurrentlyFlagged && (
          <FormField label="Reason for Flagging *" error={errors.flagReason}>
            <div className="space-y-2">
              {FLAG_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="flagReason"
                    value={reason.value}
                    checked={flagReason === reason.value}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-4 h-4 text-tomato-red border-gray-300 focus:ring-tomato-red"
                  />
                  <span className="text-text-dark">{reason.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        {/* Moderation Notes */}
        <FormField
          label={
            isCurrentlyFlagged
              ? 'Reason for Removing Flag'
              : 'Additional Notes (Optional)'
          }
          error={errors.moderationNotes}
        >
          <textarea
            value={moderationNotes}
            onChange={(e) => setModerationNotes(e.target.value)}
            placeholder={
              isCurrentlyFlagged
                ? 'Why are you removing this flag? (e.g., Issue resolved, Content updated)'
                : 'Any additional details about the flag...'
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200 resize-none"
            maxLength={1000}
          />
          <div className="text-xs text-text-muted mt-1">
            {moderationNotes.length}/1000 characters
          </div>
        </FormField>

        {/* Error Display */}
        {errors.submit && (
          <div className="p-4 bg-tomato-red/10 border border-tomato-red/20 rounded-2xl">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-tomato-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-tomato-red">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            className={`${
              isCurrentlyFlagged
                ? 'bg-muted-olive hover:bg-muted-olive/90'
                : 'bg-tomato-red hover:bg-tomato-red/90'
            } text-white`}
          >
            {isLoading
              ? 'Processing...'
              : isCurrentlyFlagged
                ? 'Remove Flag'
                : 'Flag Listing'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ListingFlagModal;
