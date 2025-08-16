import React, { useState } from 'react';
import {
  Package,
  Clock,
  User,
  Phone,
  MapPin,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  Truck,
  Eye,
  MessageSquare,
  Star,
} from 'lucide-react';

/**
 * Mobile-optimized order card component
 * Designed specifically for touch interactions and small screens
 */
const MobileOrderCard = ({
  order,
  isSelected,
  onSelect,
  onStatusUpdate,
  onViewDetails,
  showActions = true,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Status configuration for mobile display
  const statusConfig = {
    pending: {
      color: 'text-orange-600 bg-orange-50',
      icon: Clock,
      label: 'Pending',
    },
    confirmed: {
      color: 'text-blue-600 bg-blue-50',
      icon: CheckCircle,
      label: 'Confirmed',
    },
    prepared: {
      color: 'text-purple-600 bg-purple-50',
      icon: Package,
      label: 'Prepared',
    },
    shipped: {
      color: 'text-indigo-600 bg-indigo-50',
      icon: Truck,
      label: 'Shipped',
    },
    delivered: {
      color: 'text-bottle-green bg-mint-fresh/20',
      icon: CheckCircle,
      label: 'Delivered',
    },
    cancelled: {
      color: 'text-tomato-red bg-tomato-red/20',
      icon: AlertTriangle,
      label: 'Cancelled',
    },
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = currentStatus.icon;

  // Format time for mobile display
  const formatMobileTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Handle touch interactions
  const handleCardTap = (e) => {
    // Prevent tap when interacting with buttons
    if (e.target.closest('button')) return;

    // Single tap to view details
    onViewDetails?.(order.id);
  };

  const handleLongPress = () => {
    // Long press to show actions
    setShowActions(true);
  };

  // Touch event handlers for mobile gestures
  let pressTimer = null;

  const handleTouchStart = () => {
    pressTimer = setTimeout(handleLongPress, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimer);
  };

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={`bg-white rounded-2xl shadow-soft p-4 mb-3 transition-all duration-200 touch-manipulation ${
          isSelected ? 'ring-2 ring-bottle-green/30 bg-mint-fresh/5' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardTap}
      >
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Selection Checkbox - Large touch target */}
            {onSelect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(order.id);
                }}
                className="w-6 h-6 flex items-center justify-center touch-target-large"
                aria-label={`${isSelected ? 'Deselect' : 'Select'} order ${order.id.slice(-8)}`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-bottle-green border-bottle-green'
                      : 'border-gray-300 hover:border-bottle-green'
                  }`}
                >
                  {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
              </button>
            )}

            {/* Order ID */}
            <div>
              <span className="text-sm font-medium text-text-muted">
                Order #
              </span>
              <span className="font-bold text-text-dark ml-1">
                {order.id.slice(-8)}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium ${currentStatus.color}`}
          >
            <StatusIcon className="w-4 h-4" />
            <span>{currentStatus.label}</span>
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-text-muted" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-dark truncate">
              {order.restaurant.name}
            </h3>
            <div className="flex items-center gap-4 text-sm text-text-muted mt-1">
              <span>{order.items.length} items</span>
              <span className="font-semibold text-text-dark">
                ৳{order.totalAmount.toFixed(0)}
              </span>
            </div>
          </div>

          {/* More Actions Button - Large touch target */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-dark hover:bg-gray-50 rounded-xl touch-target-large transition-colors"
            aria-label="More options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Time and Quick Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4 text-text-muted">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatMobileTime(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate max-w-[100px]">
                {order.deliveryAddress.city}
              </span>
            </div>
          </div>

          {/* Priority indicator */}
          {order.priority === 'high' && (
            <div className="w-2 h-2 bg-tomato-red rounded-full"></div>
          )}
        </div>

        {/* Expandable Details */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            {/* Items Preview */}
            <div className="mb-3">
              <h4 className="text-sm font-medium text-text-dark mb-2">
                Items:
              </h4>
              <div className="space-y-1">
                {order.items.slice(0, 2).map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-text-muted truncate flex-1">
                      {item.quantity}x {item.listing.product.name}
                    </span>
                    <span className="font-medium text-text-dark ml-2">
                      ৳{(item.quantity * item.pricePerUnit).toFixed(0)}
                    </span>
                  </div>
                ))}
                {order.items.length > 2 && (
                  <div className="text-sm text-text-muted">
                    +{order.items.length - 2} more items
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 text-text-muted">
                <Phone className="w-4 h-4" />
                <span>{order.restaurant.phone}</span>
              </div>
              <div className="flex items-center gap-1 text-text-muted">
                <MessageSquare className="w-4 h-4" />
                <span>Contact</span>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="w-full mt-3 py-2 text-sm text-bottle-green font-medium hover:bg-bottle-green/5 rounded-xl transition-colors touch-target"
        >
          {showDetails ? 'Show Less' : 'Show Details'}
        </button>
      </div>

      {/* Floating Action Menu */}
      {showActions && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowActions(false)}
          />

          {/* Action Menu */}
          <div className="absolute top-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 min-w-[160px] animate-scale-in">
            <div className="p-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(order.id);
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-xl transition-colors touch-target"
              >
                <Eye className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-dark">
                  View Details
                </span>
              </button>

              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusUpdate?.(order.id, 'next');
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-xl transition-colors touch-target"
                >
                  <CheckCircle className="w-4 h-4 text-bottle-green" />
                  <span className="text-sm font-medium text-text-dark">
                    Update Status
                  </span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle contact customer
                  setShowActions(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-xl transition-colors touch-target"
              >
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-text-dark">
                  Contact
                </span>
              </button>

              {order.status === 'delivered' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle review request
                    setShowActions(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded-xl transition-colors touch-target"
                >
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-text-dark">
                    Request Review
                  </span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileOrderCard;
