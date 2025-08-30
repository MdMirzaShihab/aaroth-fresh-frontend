import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Package } from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Active',
    description: 'Listing is live and visible to customers',
    icon: CheckCircle,
    color: 'text-muted-olive',
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'Listing is hidden from customers',
    icon: XCircle,
    color: 'text-gray-600',
  },
  {
    value: 'out_of_stock',
    label: 'Out of Stock',
    description: 'Product is temporarily unavailable',
    icon: AlertTriangle,
    color: 'text-earthy-brown',
  },
  {
    value: 'discontinued',
    label: 'Discontinued',
    description: 'Product is no longer available',
    icon: XCircle,
    color: 'text-tomato-red',
  },
];

const ListingStatusModal = ({
  isOpen,
  onClose,
  listing,
  onUpdateStatus,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(
    listing?.status || 'active'
  );
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (selectedStatus === listing?.status) {
      setErrors({ status: 'Please select a different status to update' });
      return;
    }

    try {
      await onUpdateStatus(listing._id, selectedStatus, reason.trim());
      handleClose();
    } catch (error) {
      setErrors({
        submit: 'Failed to update listing status. Please try again.',
      });
    }
  };

  const handleClose = () => {
    setSelectedStatus(listing?.status || 'active');
    setReason('');
    setErrors({});
    onClose();
  };

  if (!listing) return null;

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === listing.status);
  const selectedStatusOption = STATUS_OPTIONS.find(
    (s) => s.value === selectedStatus
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Listing Status"
      size="lg"
    >
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
                  <Package className="w-5 h-5 text-gray-400" />
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
              {currentStatus && (
                <div className="flex items-center gap-1 mt-1">
                  <currentStatus.icon
                    className={`w-3 h-3 ${currentStatus.color}`}
                  />
                  <span className={`text-xs ${currentStatus.color}`}>
                    Currently: {currentStatus.label}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <FormField label="Select New Status *" error={errors.status}>
          <div className="space-y-3">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status.value}
                className={`flex items-start gap-3 p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                  selectedStatus === status.value
                    ? 'border-muted-olive bg-muted-olive/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-4 h-4 text-muted-olive border-gray-300 focus:ring-muted-olive mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <status.icon className={`w-4 h-4 ${status.color}`} />
                    <span className="font-medium text-text-dark">
                      {status.label}
                    </span>
                    {status.value === listing.status && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-1">
                    {status.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {/* Status Change Impact */}
        {selectedStatus !== listing?.status && selectedStatusOption && (
          <div className="p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-text-dark mb-1">
                  Status Change Impact
                </h4>
                <p className="text-sm text-text-muted">
                  {selectedStatus === 'active' &&
                    'This listing will become visible to customers and available for orders.'}
                  {selectedStatus === 'inactive' &&
                    'This listing will be hidden from customers and unavailable for orders.'}
                  {selectedStatus === 'out_of_stock' &&
                    'This listing will show as out of stock. Customers can view but not order.'}
                  {selectedStatus === 'discontinued' &&
                    'This listing will be marked as discontinued and hidden from customers.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reason for Change */}
        <FormField
          label="Reason for Status Change (Optional)"
          error={errors.reason}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why are you changing the status? (e.g., Vendor request, Quality issues, Stock update)"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200 resize-none"
            maxLength={500}
          />
          <div className="text-xs text-text-muted mt-1">
            {reason.length}/500 characters
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
            disabled={selectedStatus === listing?.status}
            className="bg-muted-olive hover:bg-muted-olive/90 text-white"
          >
            {isLoading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ListingStatusModal;
