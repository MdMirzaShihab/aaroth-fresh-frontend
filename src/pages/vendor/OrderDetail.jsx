import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  DollarSign,
  Calendar,
  FileText,
  Edit3,
  RefreshCw,
  MessageSquare,
  Star,
} from 'lucide-react';
import {
  useGetOrderQuery,
  useGetOrderWorkflowStepsQuery,
  useUpdateOrderStatusWorkflowMutation,
  useUpdateOrderFulfillmentStepMutation,
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // API queries with polling for real-time updates
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError,
    refetch: refetchOrder,
  } = useGetOrderQuery(orderId, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
  });

  const {
    data: workflowData,
    isLoading: workflowLoading,
    refetch: refetchWorkflow,
  } = useGetOrderWorkflowStepsQuery(orderId, {
    pollingInterval: 60000, // Poll every minute
    skip: !orderId,
  });

  // Mutations
  const [updateOrderStatus] = useUpdateOrderStatusWorkflowMutation();
  const [updateFulfillmentStep] = useUpdateOrderFulfillmentStepMutation();

  // Order status workflow configuration
  const statusWorkflow = [
    {
      value: 'pending',
      label: 'Order Received',
      color: 'text-orange-600 bg-orange-50',
      icon: Clock,
      description: 'Order has been received and is being reviewed',
    },
    {
      value: 'confirmed',
      label: 'Order Confirmed',
      color: 'text-blue-600 bg-blue-50',
      icon: CheckCircle,
      description: 'Order confirmed and preparation is starting',
    },
    {
      value: 'prepared',
      label: 'Order Prepared',
      color: 'text-purple-600 bg-purple-50',
      icon: Package,
      description: 'Items are prepared and ready for pickup/delivery',
    },
    {
      value: 'shipped',
      label: 'Order Shipped',
      color: 'text-indigo-600 bg-indigo-50',
      icon: Truck,
      description: 'Order is out for delivery',
    },
    {
      value: 'delivered',
      label: 'Order Delivered',
      color: 'text-muted-olive bg-sage-green/20',
      icon: CheckCircle,
      description: 'Order has been successfully delivered',
    },
  ];

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateOrderStatus({
        id: orderId,
        status: newStatus,
        notes: statusNotes,
        estimatedTime: newStatus === 'confirmed' ? '2-4 hours' : undefined,
        deliveryDetails:
          newStatus === 'shipped'
            ? { trackingNumber: `TRK${Date.now()}` }
            : undefined,
      }).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: 'Order Updated',
          message: `Order status updated to ${newStatus}`,
        })
      );

      setShowStatusUpdate(false);
      setStatusNotes('');
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

  // Handle fulfillment step update
  const handleStepUpdate = async (stepId, completed, notes = '') => {
    try {
      await updateFulfillmentStep({
        orderId,
        stepId,
        completed,
        notes,
      }).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: 'Step Updated',
          message: `Fulfillment step ${completed ? 'completed' : 'updated'}`,
        })
      );
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.data?.message || 'Failed to update step',
        })
      );
    }
  };

  // Get current status info
  const getCurrentStatusInfo = (status) => {
    return statusWorkflow.find((s) => s.value === status) || statusWorkflow[0];
  };

  // Get next possible statuses
  const getNextStatuses = (currentStatus) => {
    const currentIndex = statusWorkflow.findIndex(
      (s) => s.value === currentStatus
    );
    return statusWorkflow.slice(currentIndex + 1, currentIndex + 3); // Next 1-2 steps
  };

  // Loading state
  if (orderLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-olive" />
          <span className="text-lg font-medium text-text-dark">
            Loading order details...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (orderError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <AlertCircle className="w-16 h-16 text-tomato-red/60 mb-4" />
        <h2 className="text-2xl font-medium text-text-dark/80 mb-4">
          Failed to load order
        </h2>
        <p className="text-text-muted mb-8 max-w-md leading-relaxed">
          There was an error loading the order details. Please try again.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => refetchOrder()}
            className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
          <button
            onClick={() => navigate('/vendor/orders')}
            className="bg-gray-100 hover:bg-gray-200 text-text-dark px-8 py-3 rounded-2xl font-medium transition-colors"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const order = orderData?.data;
  const workflowSteps = workflowData?.data?.steps || [];

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-text-dark/80 mb-2">
          Order not found
        </h3>
        <p className="text-text-muted mb-6">
          The order you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate('/vendor/orders')}
          className="bg-muted-olive text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const currentStatusInfo = getCurrentStatusInfo(order.status);
  const nextStatuses = getNextStatuses(order.status);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/vendor/orders')}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-text-muted" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              Order #{order.id.slice(-8)}
            </h1>
            <div className="flex items-center gap-4">
              <span
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-medium ${currentStatusInfo.color}`}
              >
                <currentStatusInfo.icon className="w-4 h-4" />
                {currentStatusInfo.label}
              </span>
              <span className="text-text-muted">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => refetchOrder()}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>

          {nextStatuses.length > 0 &&
            order.status !== 'delivered' &&
            order.status !== 'cancelled' && (
              <button
                onClick={() => setShowStatusUpdate(true)}
                className="flex items-center gap-2 px-6 py-3 bg-muted-olive hover:bg-muted-olive/90 text-white rounded-2xl font-medium transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                Update Status
              </button>
            )}
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-text-dark mb-4">
              Update Order Status
            </h3>

            <div className="space-y-4 mb-6">
              {nextStatuses.map((status) => (
                <label
                  key={status.value}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={selectedStatus === status.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-muted-olive focus:ring-muted-olive/20"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <status.icon className="w-4 h-4" />
                      <span className="font-medium text-text-dark">
                        {status.label}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted">
                      {status.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-text-dark mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Add any notes about this status update..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-muted-olive/20 focus:bg-white transition-all duration-200 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowStatusUpdate(false);
                  setSelectedStatus('');
                  setStatusNotes('');
                }}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  selectedStatus && handleStatusUpdate(selectedStatus)
                }
                disabled={!selectedStatus}
                className="flex-1 px-4 py-3 bg-muted-olive hover:bg-muted-olive/90 text-white rounded-2xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Information */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xl font-bold text-text-dark mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-muted-olive" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-text-dark mb-3">
                  Buyer Details
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-text-muted mt-0.5" />
                    <div>
                      <div className="font-medium text-text-dark">
                        {order.buyer.name}
                      </div>
                      <div className="text-sm text-text-muted">
                        {order.buyer.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-text-muted mt-0.5" />
                    <div>
                      <div className="font-medium text-text-dark">
                        {order.buyer.phone}
                      </div>
                      <div className="text-sm text-text-muted">
                        Primary contact
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-text-muted mt-0.5" />
                    <div>
                      <div className="font-medium text-text-dark">
                        {order.deliveryAddress.street}
                      </div>
                      <div className="text-sm text-text-muted">
                        {order.deliveryAddress.city},{' '}
                        {order.deliveryAddress.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-text-dark mb-3">
                  Order Details
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-text-muted">Order Date</span>
                    <span className="font-medium text-text-dark">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-muted">Order Time</span>
                    <span className="font-medium text-text-dark">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-muted">Total Items</span>
                    <span className="font-medium text-text-dark">
                      {order.items.length}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-text-muted">Payment Method</span>
                    <span className="font-medium text-text-dark">
                      {order.paymentMethod || 'Cash on Delivery'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xl font-bold text-text-dark mb-6 flex items-center gap-3">
              <Package className="w-6 h-6 text-muted-olive" />
              Order Items
            </h3>

            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-2xl"
                >
                  {item.listing.images?.[0] && (
                    <img
                      src={item.listing.images[0].url}
                      alt={item.listing.product.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <div className="font-semibold text-text-dark mb-1">
                      {item.listing.product.name}
                    </div>
                    <div className="text-sm text-text-muted mb-2">
                      {item.listing.description}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-text-muted">
                        Quantity:{' '}
                        <span className="font-medium text-text-dark">
                          {item.quantity}
                        </span>
                      </span>
                      <span className="text-text-muted">
                        Unit:{' '}
                        <span className="font-medium text-text-dark">
                          {item.unit}
                        </span>
                      </span>
                      <span className="text-text-muted">
                        Price:{' '}
                        <span className="font-medium text-text-dark">
                          ৳{item.pricePerUnit}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-lg text-text-dark">
                      ৳{(item.quantity * item.pricePerUnit).toFixed(0)}
                    </div>
                    {item.discount && (
                      <div className="text-sm text-tomato-red">
                        -{item.discount}% off
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-text-muted">
                  <span>Subtotal</span>
                  <span>
                    ৳
                    {order.subtotal?.toFixed(0) ||
                      (order.totalAmount * 0.9).toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-text-muted">
                  <span>Delivery Fee</span>
                  <span>৳{order.deliveryFee?.toFixed(0) || '50'}</span>
                </div>

                {order.discount && (
                  <div className="flex justify-between text-tomato-red">
                    <span>Discount</span>
                    <span>-৳{order.discount.toFixed(0)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-text-dark pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>৳{order.totalAmount.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          {order.notes && (
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="text-xl font-bold text-text-dark mb-4 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-muted-olive" />
                Special Instructions
              </h3>
              <div className="bg-amber-50/80 rounded-2xl p-4">
                <p className="text-text-dark leading-relaxed">{order.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Status Timeline */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xl font-bold text-text-dark mb-6 flex items-center gap-3">
              <Clock className="w-6 h-6 text-muted-olive" />
              Order Timeline
            </h3>

            <div className="space-y-6">
              {statusWorkflow.map((status, index) => {
                const isCompleted =
                  order.statusHistory?.some((h) => h.status === status.value) ||
                  statusWorkflow.findIndex((s) => s.value === order.status) >=
                    index;
                const isCurrent = order.status === status.value;
                const statusEntry = order.statusHistory?.find(
                  (h) => h.status === status.value
                );

                return (
                  <div key={status.value} className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isCompleted
                          ? isCurrent
                            ? 'bg-muted-olive text-white'
                            : 'bg-sage-green/40 text-muted-olive'
                          : 'bg-gray-100 text-text-muted'
                      }`}
                    >
                      <status.icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div
                        className={`font-semibold ${
                          isCompleted ? 'text-text-dark' : 'text-text-muted'
                        }`}
                      >
                        {status.label}
                      </div>
                      <div className="text-sm text-text-muted mb-2">
                        {status.description}
                      </div>

                      {statusEntry && (
                        <div className="text-xs text-text-muted">
                          {new Date(statusEntry.timestamp).toLocaleString()}
                          {statusEntry.notes && (
                            <div className="mt-1 text-text-dark">
                              {statusEntry.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fulfillment Checklist */}
          {workflowSteps.length > 0 && !workflowLoading && (
            <div className="bg-white rounded-3xl shadow-soft p-6">
              <h3 className="text-xl font-bold text-text-dark mb-6 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-muted-olive" />
                Fulfillment Checklist
              </h3>

              <div className="space-y-4">
                {workflowSteps.map((step) => (
                  <div key={step.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={step.completed}
                      onChange={(e) =>
                        handleStepUpdate(step.id, e.target.checked, step.notes)
                      }
                      className="w-5 h-5 text-muted-olive bg-gray-100 border-gray-300 rounded focus:ring-muted-olive/20 focus:ring-2 mt-0.5"
                    />
                    <div className="flex-1">
                      <div
                        className={`font-medium ${step.completed ? 'text-text-dark line-through' : 'text-text-dark'}`}
                      >
                        {step.title}
                      </div>
                      {step.description && (
                        <div className="text-sm text-text-muted mt-1">
                          {step.description}
                        </div>
                      )}
                      {step.completedAt && (
                        <div className="text-xs text-text-muted mt-1">
                          Completed:{' '}
                          {new Date(step.completedAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-3xl shadow-soft p-6">
            <h3 className="text-xl font-bold text-text-dark mb-6">
              Quick Actions
            </h3>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                <MessageSquare className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-text-dark">
                  Contact Customer
                </span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                <FileText className="w-5 h-5 text-text-muted" />
                <span className="font-medium text-text-dark">
                  Print Receipt
                </span>
              </button>

              {order.status === 'delivered' && (
                <button className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors">
                  <Star className="w-5 h-5 text-text-muted" />
                  <span className="font-medium text-text-dark">
                    Request Review
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
