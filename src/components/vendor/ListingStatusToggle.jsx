import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Package,
} from 'lucide-react';
import { useUpdateListingStatusMutation } from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import ConfirmDialog from '../ui/ConfirmDialog';

const ListingStatusToggle = ({
  listing,
  variant = 'button',
  size = 'sm',
  showLabel = false,
  className = '',
}) => {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const [updateListingStatus, { isLoading }] = useUpdateListingStatusMutation();

  // Status options with metadata
  const statusOptions = {
    active: {
      label: 'Active',
      icon: CheckCircle,
      color: 'text-muted-olive',
      bgColor: 'bg-sage-green/20',
      description: 'Listing is visible to customers',
    },
    inactive: {
      label: 'Inactive',
      icon: EyeOff,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      description: 'Listing is hidden from customers',
    },
    out_of_stock: {
      label: 'Out of Stock',
      icon: Package,
      color: 'text-tomato-red',
      bgColor: 'bg-tomato-red/20',
      description: 'No inventory available',
    },
    pending: {
      label: 'Pending Review',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Awaiting admin approval',
    },
  };

  const currentStatus = statusOptions[listing.status] || statusOptions.inactive;
  const nextStatus = listing.status === 'active' ? 'inactive' : 'active';
  const nextStatusData = statusOptions[nextStatus];

  const handleStatusToggle = async () => {
    if (listing.status === 'pending') {
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Cannot Change Status',
          message:
            'Listings under review cannot be modified. Please wait for admin approval.',
        })
      );
      return;
    }

    setShowConfirm(true);
  };

  const confirmStatusChange = async () => {
    try {
      await updateListingStatus({
        id: listing.id,
        status: nextStatus,
      }).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: 'Status Updated',
          message: `Listing is now ${nextStatusData.label.toLowerCase()}`,
        })
      );

      setShowConfirm(false);
    } catch (error) {
      console.error('Failed to update listing status:', error);
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message:
            error.data?.message ||
            'Failed to update listing status. Please try again.',
        })
      );
    }
  };

  // Badge variant
  if (variant === 'badge') {
    const IconComponent = currentStatus.icon;
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          currentStatus.color
        } ${currentStatus.bgColor} ${className}`}
      >
        <IconComponent className="w-3 h-3" />
        {currentStatus.label}
      </span>
    );
  }

  // Toggle switch variant
  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={listing.status === 'active'}
              onChange={handleStatusToggle}
              disabled={isLoading || listing.status === 'pending'}
              className="sr-only"
            />
            <div
              className={`block w-10 h-6 rounded-full transition-colors ${
                listing.status === 'active' ? 'bg-muted-olive' : 'bg-gray-300'
              } ${isLoading ? 'opacity-50' : ''}`}
            >
              <div
                className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  listing.status === 'active'
                    ? 'translate-x-4'
                    : 'translate-x-0'
                }`}
              />
            </div>
          </div>
          {showLabel && (
            <span className="ml-3 text-sm text-text-dark">
              {currentStatus.label}
            </span>
          )}
        </label>

        {showConfirm && (
          <ConfirmDialog
            isOpen
            onClose={() => setShowConfirm(false)}
            title={`${nextStatus === 'active' ? 'Activate' : 'Deactivate'} Listing`}
            message={`Are you sure you want to ${nextStatus === 'active' ? 'activate' : 'deactivate'} this listing? ${
              nextStatus === 'active'
                ? 'It will become visible to customers.'
                : 'It will be hidden from customers.'
            }`}
            confirmText={nextStatus === 'active' ? 'Activate' : 'Deactivate'}
            onConfirm={confirmStatusChange}
          />
        )}
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    const availableStatuses = Object.entries(statusOptions).filter(
      ([key]) => key !== 'pending' // Vendors can't set pending status
    );

    return (
      <div className={`relative ${className}`}>
        <select
          value={listing.status}
          onChange={(e) => {
            updateListingStatus({
              id: listing.id,
              status: e.target.value,
            });
          }}
          disabled={isLoading || listing.status === 'pending'}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 bg-white"
        >
          {availableStatuses.map(([key, status]) => (
            <option key={key} value={key}>
              {status.label}
            </option>
          ))}
        </select>
        {listing.status === 'pending' && (
          <div className="absolute inset-0 bg-gray-100/50 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
        )}
      </div>
    );
  }

  // Default button variant
  const IconComponent = currentStatus.icon;
  const NextIconComponent = nextStatusData.icon;

  return (
    <>
      <Button
        variant="outline"
        size={size}
        onClick={handleStatusToggle}
        disabled={isLoading || listing.status === 'pending'}
        className={`flex items-center gap-2 ${className} ${
          listing.status === 'active'
            ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
            : 'text-muted-olive border-muted-olive/30 hover:bg-muted-olive/10'
        }`}
        title={`Click to ${nextStatus === 'active' ? 'activate' : 'deactivate'} listing`}
      >
        {listing.status === 'active' ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
        {showLabel && (
          <span>{listing.status === 'active' ? 'Deactivate' : 'Activate'}</span>
        )}
      </Button>

      {showConfirm && (
        <ConfirmDialog
          isOpen
          onClose={() => setShowConfirm(false)}
          title={`${nextStatus === 'active' ? 'Activate' : 'Deactivate'} Listing`}
          message={
            <div className="space-y-3">
              <p>
                Are you sure you want to{' '}
                {nextStatus === 'active' ? 'activate' : 'deactivate'}
                <strong className="mx-1">"{listing.product?.name}"</strong>?
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <IconComponent className={`w-4 h-4 ${currentStatus.color}`} />
                  <span className="text-sm font-medium">
                    Current: {currentStatus.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <NextIconComponent
                    className={`w-4 h-4 ${nextStatusData.color}`}
                  />
                  <span className="text-sm font-medium">
                    New: {nextStatusData.label}
                  </span>
                </div>
              </div>
              <p className="text-sm text-text-muted">
                {nextStatusData.description}
              </p>
            </div>
          }
          confirmText={nextStatus === 'active' ? 'Activate' : 'Deactivate'}
          onConfirm={confirmStatusChange}
        />
      )}
    </>
  );
};

export default ListingStatusToggle;
