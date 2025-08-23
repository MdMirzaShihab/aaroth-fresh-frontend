import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Flag,
  Trash2,
  Package,
  Users,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const BULK_ACTIONS = [
  {
    value: 'update_status',
    label: 'Update Status',
    icon: Settings,
    description: 'Change status for selected listings',
  },
  {
    value: 'toggle_featured',
    label: 'Toggle Featured',
    icon: CheckCircle,
    description: 'Add/remove featured status for selected listings',
  },
  {
    value: 'flag_listings',
    label: 'Flag Listings',
    icon: Flag,
    description: 'Flag selected listings with reason',
  },
  {
    value: 'unflag_listings',
    label: 'Unflag Listings',
    icon: CheckCircle,
    description: 'Remove flags from selected listings',
  },
  {
    value: 'delete_listings',
    label: 'Delete Listings',
    icon: Trash2,
    description: 'Permanently delete selected listings',
    isDangerous: true,
  },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', icon: CheckCircle },
  { value: 'inactive', label: 'Inactive', icon: XCircle },
  { value: 'out_of_stock', label: 'Out of Stock', icon: AlertTriangle },
  { value: 'discontinued', label: 'Discontinued', icon: XCircle },
];

const FLAG_REASONS = [
  { value: 'inappropriate_content', label: 'Inappropriate Content' },
  { value: 'misleading_information', label: 'Misleading Information' },
  { value: 'quality_issues', label: 'Quality Issues' },
  { value: 'pricing_violation', label: 'Pricing Violation' },
  { value: 'spam', label: 'Spam' },
  { value: 'other', label: 'Other' },
];

const BulkActionsModal = ({
  isOpen,
  onClose,
  selectedListings,
  listings,
  onBulkAction,
  isLoading = false,
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState({
    status: 'active',
    flagReason: '',
    reason: '',
    moderationNotes: '',
  });
  const [errors, setErrors] = useState({});

  const selectedListingObjects = listings.filter((listing) =>
    selectedListings.has(listing._id)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validate based on selected action
    const newErrors = {};

    if (!selectedAction) {
      newErrors.action = 'Please select an action to perform';
    }

    if (selectedAction === 'flag_listings' && !actionData.flagReason) {
      newErrors.flagReason = 'Please select a reason for flagging';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onBulkAction({
        action: selectedAction,
        listingIds: Array.from(selectedListings),
        data: actionData,
      });
      handleClose();
    } catch (error) {
      setErrors({ submit: 'Failed to perform bulk action. Please try again.' });
    }
  };

  const handleClose = () => {
    setSelectedAction('');
    setActionData({
      status: 'active',
      flagReason: '',
      reason: '',
      moderationNotes: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen || selectedListings.size === 0) return null;

  const selectedActionObj = BULK_ACTIONS.find(
    (a) => a.value === selectedAction
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Bulk Actions (${selectedListings.size} items)`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selected Items Preview */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-text-muted" />
            <span className="text-sm font-medium text-text-dark">
              {selectedListings.size} listings selected
            </span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-2">
            {selectedListingObjects.slice(0, 5).map((listing) => (
              <div
                key={listing._id}
                className="flex items-center gap-2 text-sm"
              >
                <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                  {listing.images?.[0]?.url ||
                  listing.productId?.images?.[0]?.url ? (
                    <img
                      src={
                        listing.images?.[0]?.url ||
                        listing.productId?.images?.[0]?.url
                      }
                      alt="Product"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-3 h-3 text-gray-400" />
                    </div>
                  )}
                </div>
                <span className="text-text-dark truncate">
                  {listing.productId?.name ||
                    listing.product?.name ||
                    'Unknown Product'}
                </span>
              </div>
            ))}
            {selectedListingObjects.length > 5 && (
              <div className="text-xs text-text-muted">
                ... and {selectedListingObjects.length - 5} more items
              </div>
            )}
          </div>
        </div>

        {/* Action Selection */}
        <FormField label="Select Action *" error={errors.action}>
          <div className="space-y-3">
            {BULK_ACTIONS.map((action) => (
              <label
                key={action.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedAction === action.value
                    ? 'border-bottle-green bg-bottle-green/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${action.isDangerous ? 'hover:border-tomato-red/30' : ''}`}
              >
                <input
                  type="radio"
                  name="action"
                  value={action.value}
                  checked={selectedAction === action.value}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-4 h-4 text-bottle-green border-gray-300 focus:ring-bottle-green mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <action.icon
                      className={`w-4 h-4 ${
                        action.isDangerous
                          ? 'text-tomato-red'
                          : 'text-bottle-green'
                      }`}
                    />
                    <span className="font-medium text-text-dark">
                      {action.label}
                    </span>
                    {action.isDangerous && (
                      <span className="text-xs bg-tomato-red/10 text-tomato-red px-2 py-1 rounded-full">
                        Dangerous
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {action.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Action-specific Options */}
        {selectedAction === 'update_status' && (
          <FormField label="New Status *" error={errors.status}>
            <div className="space-y-2">
              {STATUS_OPTIONS.map((status) => (
                <label key={status.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={actionData.status === status.value}
                    onChange={(e) =>
                      setActionData({ ...actionData, status: e.target.value })
                    }
                    className="w-4 h-4 text-bottle-green border-gray-300 focus:ring-bottle-green"
                  />
                  <status.icon className="w-4 h-4 text-text-muted" />
                  <span className="text-text-dark">{status.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        {selectedAction === 'flag_listings' && (
          <FormField label="Flag Reason *" error={errors.flagReason}>
            <div className="space-y-2">
              {FLAG_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="flagReason"
                    value={reason.value}
                    checked={actionData.flagReason === reason.value}
                    onChange={(e) =>
                      setActionData({
                        ...actionData,
                        flagReason: e.target.value,
                      })
                    }
                    className="w-4 h-4 text-tomato-red border-gray-300 focus:ring-tomato-red"
                  />
                  <span className="text-text-dark">{reason.label}</span>
                </label>
              ))}
            </div>
          </FormField>
        )}

        {/* Reason/Notes Field */}
        {(selectedAction === 'update_status' ||
          selectedAction === 'flag_listings' ||
          selectedAction === 'unflag_listings' ||
          selectedAction === 'delete_listings') && (
          <FormField
            label={
              selectedAction === 'delete_listings'
                ? 'Reason for Deletion *'
                : selectedAction === 'flag_listings'
                  ? 'Additional Notes (Optional)'
                  : 'Reason (Optional)'
            }
            error={errors.reason}
          >
            <textarea
              value={
                selectedAction === 'flag_listings'
                  ? actionData.moderationNotes
                  : actionData.reason
              }
              onChange={(e) => {
                if (selectedAction === 'flag_listings') {
                  setActionData({
                    ...actionData,
                    moderationNotes: e.target.value,
                  });
                } else {
                  setActionData({ ...actionData, reason: e.target.value });
                }
              }}
              placeholder={
                selectedAction === 'delete_listings'
                  ? 'Explain why these listings are being deleted...'
                  : selectedAction === 'flag_listings'
                    ? 'Additional moderation notes...'
                    : selectedAction === 'update_status'
                      ? 'Why are you changing the status?'
                      : 'Optional notes...'
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-bottle-green/20 transition-all duration-200 resize-none"
              maxLength={500}
              required={selectedAction === 'delete_listings'}
            />
            <div className="text-xs text-text-muted mt-1">
              {
                (selectedAction === 'flag_listings'
                  ? actionData.moderationNotes
                  : actionData.reason
                ).length
              }
              /500 characters
            </div>
          </FormField>
        )}

        {/* Impact Warning */}
        {selectedActionObj && (
          <div
            className={`p-4 rounded-2xl ${
              selectedActionObj.isDangerous
                ? 'bg-tomato-red/10 border border-tomato-red/20'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={`w-5 h-5 mt-0.5 ${
                  selectedActionObj.isDangerous
                    ? 'text-tomato-red'
                    : 'text-blue-600'
                }`}
              />
              <div>
                <h4 className="text-sm font-medium text-text-dark mb-1">
                  {selectedActionObj.isDangerous ? 'Warning' : 'Impact'}
                </h4>
                <p className="text-sm text-text-muted">
                  {selectedAction === 'update_status' &&
                    `This will change the status of ${selectedListings.size} listings to "${actionData.status}".`}
                  {selectedAction === 'toggle_featured' &&
                    `This will toggle the featured status for ${selectedListings.size} listings.`}
                  {selectedAction === 'flag_listings' &&
                    `This will flag ${selectedListings.size} listings and may hide them from customers.`}
                  {selectedAction === 'unflag_listings' &&
                    `This will remove flags from ${selectedListings.size} listings.`}
                  {selectedAction === 'delete_listings' &&
                    `This will permanently delete ${selectedListings.size} listings. This action cannot be undone.`}
                </p>
              </div>
            </div>
          </div>
        )}

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
            disabled={!selectedAction}
            className={`${
              selectedActionObj?.isDangerous
                ? 'bg-tomato-red hover:bg-tomato-red/90'
                : 'bg-bottle-green hover:bg-bottle-green/90'
            } text-white`}
          >
            {isLoading
              ? 'Processing...'
              : selectedActionObj?.isDangerous
                ? `Delete ${selectedListings.size} Listings`
                : `Apply to ${selectedListings.size} Listings`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BulkActionsModal;
