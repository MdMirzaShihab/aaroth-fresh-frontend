import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Clock,
  CheckCircle,
  Package,
  Truck,
  AlertTriangle,
  X,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import {
  useUpdateOrderStatusWorkflowMutation,
  useBulkUpdateOrderStatusMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const OrderStatusUpdate = ({
  order,
  orders = [], // For bulk operations
  onClose,
  onSuccess,
  variant = 'single', // 'single' or 'bulk'
}) => {
  const dispatch = useDispatch();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');

  const [updateOrderStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusWorkflowMutation();
  const [bulkUpdateOrderStatus, { isLoading: isBulkUpdating }] =
    useBulkUpdateOrderStatusMutation();

  const isLoading = isUpdating || isBulkUpdating;

  // Status workflow with enhanced metadata
  const statusOptions = [
    {
      value: 'confirmed',
      label: 'Confirm Order',
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-50',
      description: 'Confirm the order and start preparation',
      estimatedTimeRequired: true,
      nextSteps: [
        'Start gathering items',
        'Check inventory',
        'Begin preparation',
      ],
    },
    {
      value: 'prepared',
      label: 'Mark as Prepared',
      icon: Package,
      color: 'text-purple-600 bg-purple-50',
      description: 'All items are prepared and ready for pickup/delivery',
      estimatedTimeRequired: false,
      nextSteps: [
        'Quality check completed',
        'Items packaged',
        'Ready for dispatch',
      ],
    },
    {
      value: 'shipped',
      label: 'Ship Order',
      icon: Truck,
      color: 'text-indigo-600 bg-indigo-50',
      description: 'Order is out for delivery',
      estimatedTimeRequired: false,
      nextSteps: [
        'Driver assigned',
        'En route to customer',
        'Tracking available',
      ],
    },
    {
      value: 'delivered',
      label: 'Mark as Delivered',
      icon: CheckCircle,
      color: 'text-muted-olive bg-sage-green/20',
      description: 'Order has been successfully delivered to customer',
      estimatedTimeRequired: false,
      nextSteps: [
        'Order completed',
        'Payment processed',
        'Customer notification sent',
      ],
    },
    {
      value: 'cancelled',
      label: 'Cancel Order',
      icon: AlertTriangle,
      color: 'text-tomato-red bg-tomato-red/20',
      description: 'Cancel this order (requires reason)',
      estimatedTimeRequired: false,
      nextSteps: [
        'Refund processed',
        'Customer notified',
        'Inventory restored',
      ],
      requiresReason: true,
    },
  ];

  // Get available status options based on current status
  const getAvailableStatuses = (currentStatus) => {
    const statusOrder = [
      'pending',
      'confirmed',
      'prepared',
      'shipped',
      'delivered',
    ];
    const currentIndex = statusOrder.indexOf(currentStatus);

    // Can move forward in the workflow or cancel
    const forwardOptions = statusOptions.filter((option) => {
      const optionIndex = statusOrder.indexOf(option.value);
      return optionIndex > currentIndex || option.value === 'cancelled';
    });

    return forwardOptions;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStatus) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Status Required',
          message: 'Please select a status to update',
        })
      );
      return;
    }

    const selectedOption = statusOptions.find(
      (opt) => opt.value === selectedStatus
    );

    if (selectedOption?.requiresReason && !notes.trim()) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Reason Required',
          message: 'Please provide a reason for cancellation',
        })
      );
      return;
    }

    try {
      if (variant === 'bulk') {
        // Bulk update multiple orders
        const orderIds = orders.map((o) => o.id);

        await bulkUpdateOrderStatus({
          orderIds,
          status: selectedStatus,
          notes: notes.trim() || `Bulk updated to ${selectedStatus}`,
          estimatedTime: estimatedTime || undefined,
        }).unwrap();

        dispatch(
          addNotification({
            type: 'success',
            title: 'Bulk Update Successful',
            message: `${orderIds.length} orders updated to ${selectedOption.label.toLowerCase()}`,
          })
        );
      } else {
        // Single order update
        await updateOrderStatus({
          id: order.id,
          status: selectedStatus,
          notes: notes.trim(),
          estimatedTime: estimatedTime || undefined,
          deliveryDetails:
            selectedStatus === 'shipped'
              ? {
                  trackingNumber: `TRK${Date.now()}`,
                  estimatedDelivery: new Date(
                    Date.now() + 2 * 60 * 60 * 1000
                  ).toISOString(), // 2 hours from now
                }
              : undefined,
        }).unwrap();

        dispatch(
          addNotification({
            type: 'success',
            title: 'Order Updated',
            message: `Order status changed to ${selectedOption.label.toLowerCase()}`,
          })
        );
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.data?.message || 'Failed to update order status',
        })
      );
    }
  };

  const selectedOption = statusOptions.find(
    (opt) => opt.value === selectedStatus
  );
  const availableStatuses =
    variant === 'single' ? getAvailableStatuses(order?.status) : statusOptions; // For bulk, show all options

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-bold text-text-dark">
              {variant === 'bulk'
                ? `Update ${orders.length} Orders`
                : `Update Order #${order?.id?.slice(-8)}`}
            </h3>
            <p className="text-text-muted text-sm mt-1">
              {variant === 'bulk'
                ? 'Apply status change to selected orders'
                : 'Change the status of this order'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current Status (for single order) */}
          {variant === 'single' && order && (
            <div className="bg-gray-50/80 rounded-2xl p-4">
              <div className="text-sm text-text-muted mb-1">Current Status</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium text-text-dark capitalize">
                  {order.status}
                </span>
              </div>
            </div>
          )}

          {/* Status Options */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-4">
              Select New Status
            </label>
            <div className="space-y-3">
              {availableStatuses.map((status) => {
                const Icon = status.icon;
                return (
                  <label
                    key={status.value}
                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedStatus === status.value
                        ? 'border-muted-olive bg-sage-green/10'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={selectedStatus === status.value}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="sr-only"
                    />
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${status.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-text-dark mb-1">
                        {status.label}
                      </div>
                      <div className="text-sm text-text-muted mb-2">
                        {status.description}
                      </div>
                      {status.nextSteps && selectedStatus === status.value && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-text-dark">
                            Next Steps:
                          </div>
                          {status.nextSteps.map((step, index) => (
                            <div
                              key={index}
                              className="text-xs text-text-muted flex items-center gap-2"
                            >
                              <div className="w-1 h-1 bg-muted-olive rounded-full"></div>
                              {step}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Estimated Time (for confirmed status) */}
          {selectedOption?.estimatedTimeRequired && (
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Estimated Preparation Time
              </label>
              <select
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-muted-olive/20 focus:bg-white transition-all duration-200"
              >
                <option value="">Select preparation time...</option>
                <option value="30 minutes">30 minutes</option>
                <option value="1 hour">1 hour</option>
                <option value="1-2 hours">1-2 hours</option>
                <option value="2-4 hours">2-4 hours</option>
                <option value="Same day">Same day</option>
                <option value="Next day">Next day</option>
              </select>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              {selectedOption?.requiresReason
                ? 'Reason for Cancellation *'
                : 'Notes (Optional)'}
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-text-muted" />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  selectedOption?.requiresReason
                    ? 'Please provide a reason for cancellation...'
                    : 'Add any notes about this status update...'
                }
                rows={4}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-muted-olive/20 focus:bg-white transition-all duration-200 resize-none"
                required={selectedOption?.requiresReason}
              />
            </div>
          </div>

          {/* Warning for cancellation */}
          {selectedStatus === 'cancelled' && (
            <div className="bg-tomato-red/5 border border-tomato-red/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-tomato-red mt-0.5" />
              <div>
                <div className="text-sm font-medium text-tomato-red mb-1">
                  Order Cancellation
                </div>
                <div className="text-sm text-text-muted">
                  This action will cancel the order and notify the customer.
                  {variant === 'single' &&
                    'Any payments will be refunded automatically.'}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedStatus || isLoading}
              className="flex-1 px-4 py-3 bg-muted-olive hover:bg-muted-olive/90 text-white rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderStatusUpdate;
