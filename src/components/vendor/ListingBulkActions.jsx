import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Package,
  Edit3,
  Zap,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import {
  useBulkUpdateListingsMutation,
  useBulkDeleteListingsMutation,
  useUpdateListingInventoryMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import ConfirmDialog from '../ui/ConfirmDialog';
import BulkPricingModal from './BulkPricingModal';

const ListingBulkActions = ({
  selectedListings = [],
  onClearSelection,
  listings = [],
  className = '',
}) => {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(null);
  const [bulkUpdateData, setBulkUpdateData] = useState({});
  const [showBulkPricing, setShowBulkPricing] = useState(false);

  const [bulkUpdateListings, { isLoading: isUpdating }] =
    useBulkUpdateListingsMutation();
  const [bulkDeleteListings, { isLoading: isDeleting }] =
    useBulkDeleteListingsMutation();
  const [updateListingInventory] = useUpdateListingInventoryMutation();

  const selectedCount = selectedListings.length;
  const selectedListingData = listings.filter((listing) =>
    selectedListings.includes(listing.id)
  );

  // Get statistics about selected listings
  const selectionStats = {
    active: selectedListingData.filter((l) => l.status === 'active').length,
    inactive: selectedListingData.filter((l) => l.status === 'inactive').length,
    outOfStock: selectedListingData.filter((l) => l.status === 'out_of_stock')
      .length,
    pending: selectedListingData.filter((l) => l.status === 'pending').length,
  };

  const handleBulkStatusUpdate = (status) => {
    if (selectionStats.pending > 0 && status !== 'pending') {
      dispatch(
        addNotification({
          type: 'warning',
          title: 'Cannot Update Pending Listings',
          message: `${selectionStats.pending} selected listings are pending review and cannot be modified.`,
        })
      );
      return;
    }

    setShowConfirm({
      type: 'status',
      action: status,
      title: `Bulk ${status === 'active' ? 'Activate' : status === 'inactive' ? 'Deactivate' : 'Update'} Listings`,
      message: `Are you sure you want to ${status === 'active' ? 'activate' : status === 'inactive' ? 'deactivate' : 'update'} ${selectedCount} selected listings?`,
      confirmText:
        status === 'active'
          ? 'Activate All'
          : status === 'inactive'
            ? 'Deactivate All'
            : 'Update All',
      data: { status },
    });
  };

  const handleBulkDelete = () => {
    const activeListings = selectionStats.active;
    setShowConfirm({
      type: 'delete',
      title: 'Bulk Delete Listings',
      message: (
        <div className="space-y-3">
          <p>
            Are you sure you want to permanently delete{' '}
            <strong>{selectedCount}</strong> selected listings?
          </p>
          {activeListings > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Warning: {activeListings} active listings will be deleted
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    These listings are currently visible to customers and may
                    have pending orders.
                  </p>
                </div>
              </div>
            </div>
          )}
          <p className="text-sm text-text-muted">
            This action cannot be undone.
          </p>
        </div>
      ),
      confirmText: 'Delete All',
      isDangerous: true,
    });
  };

  const handleBulkInventoryUpdate = () => {
    setShowConfirm({
      type: 'inventory',
      title: 'Bulk Update Inventory',
      message: (
        <div className="space-y-4">
          <p>
            Update inventory for <strong>{selectedCount}</strong> selected
            listings:
          </p>

          <div className="space-y-3">
            <FormField label="Available Quantity">
              <input
                type="number"
                min="0"
                placeholder="Leave empty to skip"
                value={bulkUpdateData.quantityAvailable || ''}
                onChange={(e) =>
                  setBulkUpdateData((prev) => ({
                    ...prev,
                    quantityAvailable: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Harvest Date">
                <input
                  type="date"
                  value={bulkUpdateData.harvestDate || ''}
                  onChange={(e) =>
                    setBulkUpdateData((prev) => ({
                      ...prev,
                      harvestDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>

              <FormField label="Expiry Date">
                <input
                  type="date"
                  value={bulkUpdateData.expiryDate || ''}
                  onChange={(e) =>
                    setBulkUpdateData((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                />
              </FormField>
            </div>
          </div>

          <p className="text-sm text-text-muted">
            Only filled fields will be updated. Empty fields will be ignored.
          </p>
        </div>
      ),
      confirmText: 'Update Inventory',
      data: bulkUpdateData,
    });
  };

  const handleConfirmAction = async () => {
    try {
      const { type, data } = showConfirm;

      if (type === 'status') {
        await bulkUpdateListings({
          listingIds: selectedListings,
          updates: { status: data.status },
        }).unwrap();

        dispatch(
          addNotification({
            type: 'success',
            title: 'Status Updated',
            message: `${selectedCount} listings have been ${data.status === 'active' ? 'activated' : data.status === 'inactive' ? 'deactivated' : 'updated'}`,
          })
        );
      } else if (type === 'delete') {
        await bulkDeleteListings(selectedListings).unwrap();

        dispatch(
          addNotification({
            type: 'success',
            title: 'Listings Deleted',
            message: `${selectedCount} listings have been permanently deleted`,
          })
        );
      } else if (type === 'inventory') {
        // Filter out empty values
        const inventoryUpdates = Object.entries(data)
          .filter(([key, value]) => value !== '' && value != null)
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

        if (Object.keys(inventoryUpdates).length === 0) {
          dispatch(
            addNotification({
              type: 'warning',
              title: 'No Updates',
              message: 'Please fill at least one field to update inventory',
            })
          );
          return;
        }

        // Update each listing individually since bulk inventory update might not be available
        const updatePromises = selectedListings.map((listingId) =>
          updateListingInventory({ id: listingId, inventory: inventoryUpdates })
        );

        await Promise.all(updatePromises);

        dispatch(
          addNotification({
            type: 'success',
            title: 'Inventory Updated',
            message: `Inventory updated for ${selectedCount} listings`,
          })
        );
      }

      onClearSelection();
      setShowConfirm(null);
      setBulkUpdateData({});
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Action Failed',
          message:
            error.data?.message || 'Bulk action failed. Please try again.',
        })
      );
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl p-4 shadow-sm ${className}`}
    >
      {/* Selection Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-text-dark">
            {selectedCount} listing{selectedCount === 1 ? '' : 's'} selected
          </span>

          {/* Selection breakdown */}
          <div className="flex items-center gap-3 text-xs">
            {selectionStats.active > 0 && (
              <span className="flex items-center gap-1 text-muted-olive">
                <CheckCircle className="w-3 h-3" />
                {selectionStats.active} active
              </span>
            )}
            {selectionStats.inactive > 0 && (
              <span className="flex items-center gap-1 text-gray-600">
                <XCircle className="w-3 h-3" />
                {selectionStats.inactive} inactive
              </span>
            )}
            {selectionStats.outOfStock > 0 && (
              <span className="flex items-center gap-1 text-tomato-red">
                <Package className="w-3 h-3" />
                {selectionStats.outOfStock} out of stock
              </span>
            )}
            {selectionStats.pending > 0 && (
              <span className="flex items-center gap-1 text-orange-600">
                <AlertTriangle className="w-3 h-3" />
                {selectionStats.pending} pending
              </span>
            )}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClearSelection}
          className="text-text-muted hover:text-text-dark"
        >
          Clear
        </Button>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate('active')}
          disabled={isUpdating || selectionStats.active === selectedCount}
          className="flex items-center gap-1 text-muted-olive border-muted-olive/30 hover:bg-muted-olive/10"
        >
          <CheckCircle className="w-4 h-4" />
          Activate ({selectedCount - selectionStats.active})
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate('inactive')}
          disabled={isUpdating || selectionStats.inactive === selectedCount}
          className="flex items-center gap-1 text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          <XCircle className="w-4 h-4" />
          Deactivate ({selectedCount - selectionStats.inactive})
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate('out_of_stock')}
          disabled={isUpdating}
          className="flex items-center gap-1 text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10"
        >
          <Package className="w-4 h-4" />
          Mark Out of Stock
        </Button>

        {/* Inventory Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkInventoryUpdate}
          disabled={isUpdating}
          className="flex items-center gap-1"
        >
          <Edit3 className="w-4 h-4" />
          Update Inventory
        </Button>

        {/* Bulk Pricing Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBulkPricing(true)}
          disabled={isUpdating}
          className="flex items-center gap-1 text-earthy-yellow border-earthy-yellow/30 hover:bg-earthy-yellow/10"
        >
          <DollarSign className="w-4 h-4" />
          Update Pricing
        </Button>

        {/* Delete Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleBulkDelete}
          disabled={isDeleting}
          className="flex items-center gap-1 text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10"
        >
          <Trash2 className="w-4 h-4" />
          Delete All
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-text-muted" />
          <span className="text-xs text-text-muted font-medium">
            Quick Actions:
          </span>
          <button
            onClick={() => handleBulkStatusUpdate('active')}
            disabled={isUpdating}
            className="text-xs text-muted-olive hover:underline"
          >
            Activate all inactive
          </button>
          <span className="text-xs text-gray-300">•</span>
          <button
            onClick={() => handleBulkStatusUpdate('inactive')}
            disabled={isUpdating}
            className="text-xs text-gray-600 hover:underline"
          >
            Deactivate all active
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && (
        <ConfirmDialog
          isOpen
          onClose={() => {
            setShowConfirm(null);
            setBulkUpdateData({});
          }}
          title={showConfirm.title}
          message={showConfirm.message}
          confirmText={showConfirm.confirmText}
          isDangerous={showConfirm.isDangerous}
          onConfirm={handleConfirmAction}
          isLoading={isUpdating || isDeleting}
        />
      )}

      {/* Bulk Pricing Modal */}
      <BulkPricingModal
        isOpen={showBulkPricing}
        onClose={() => setShowBulkPricing(false)}
        selectedListings={selectedListingData}
        onSuccess={(result) => {
          dispatch(
            addNotification({
              type: 'success',
              title: 'Pricing Updated',
              message: `Successfully updated prices for ${result.results?.updated || selectedCount} listings`,
            })
          );
          onClearSelection();
        }}
      />
    </div>
  );
};

export default ListingBulkActions;
