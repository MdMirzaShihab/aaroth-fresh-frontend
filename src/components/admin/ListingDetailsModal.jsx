import React from 'react';
import {
  X,
  Package,
  User,
  MapPin,
  Clock,
  Star,
  Eye,
  ShoppingCart,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useGetAdminListingQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../ui/LoadingSpinner';

const ListingDetailsModal = ({ isOpen, onClose, listingId }) => {
  const {
    data: listingData,
    isLoading,
    error,
  } = useGetAdminListingQuery(listingId, {
    skip: !listingId || !isOpen,
  });

  if (!isOpen) return null;

  const listing = listingData?.data?.listing;
  const recentOrders = listingData?.data?.recentOrders || [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        color: 'bg-sage-green/20 text-muted-olive',
        icon: CheckCircle,
        text: 'Active',
      },
      inactive: {
        color: 'bg-gray-100 text-gray-600',
        icon: XCircle,
        text: 'Inactive',
      },
      out_of_stock: {
        color: 'bg-earthy-yellow/20 text-earthy-brown',
        icon: AlertTriangle,
        text: 'Out of Stock',
      },
      discontinued: {
        color: 'bg-tomato-red/20 text-tomato-red',
        icon: XCircle,
        text: 'Discontinued',
      },
    };

    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: 'bg-earthy-yellow/20 text-earthy-brown',
        text: 'Pending',
      },
      confirmed: { color: 'bg-blue-100 text-blue-700', text: 'Confirmed' },
      processing: {
        color: 'bg-purple-100 text-purple-700',
        text: 'Processing',
      },
      shipped: { color: 'bg-indigo-100 text-indigo-700', text: 'Shipped' },
      delivered: {
        color: 'bg-sage-green/20 text-muted-olive',
        text: 'Delivered',
      },
      cancelled: {
        color: 'bg-tomato-red/20 text-tomato-red',
        text: 'Cancelled',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Listing Details"
      size="2xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">
            Error Loading Listing
          </h3>
          <p className="text-text-muted">
            {error?.data?.message || 'Failed to load listing details'}
          </p>
        </div>
      ) : listing ? (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
              {listing.images?.[0]?.url || listing.primaryImage?.url ? (
                <img
                  src={listing.images?.[0]?.url || listing.primaryImage?.url}
                  alt={listing.productId?.name || 'Product'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-dark mb-2">
                {listing.productId?.name || 'Unknown Product'}
              </h2>
              <p className="text-text-muted mb-3">
                {listing.productId?.description || 'No description available'}
              </p>
              <div className="flex items-center gap-4">
                {getStatusBadge(listing.status)}
                {listing.featured && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-earthy-yellow/20 text-earthy-brown rounded-full text-sm font-medium">
                    <Star className="w-4 h-4" />
                    Featured
                  </span>
                )}
                {listing.isFlagged && (
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-tomato-red/20 text-tomato-red rounded-full text-sm font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    Flagged
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Product Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Category:
                    </span>
                    <p className="text-text-dark">
                      {listing.productId?.category?.name || 'Uncategorized'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Quality Grade:
                    </span>
                    <p className="text-text-dark">
                      {listing.qualityGrade || 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Availability:
                    </span>
                    <p className="text-text-dark">
                      {listing.availability?.quantityAvailable || 0}{' '}
                      {listing.availability?.unit || 'units'}
                      {listing.availability?.isInSeason && ' • In Season'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Minimum Order:
                    </span>
                    <p className="text-text-dark">
                      {formatPrice(listing.minimumOrderValue || 0)}
                    </p>
                  </div>
                  {listing.leadTime > 0 && (
                    <div>
                      <span className="text-sm font-medium text-text-muted">
                        Lead Time:
                      </span>
                      <p className="text-text-dark">{listing.leadTime} days</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Vendor Info */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Vendor Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Business Name:
                    </span>
                    <p className="text-text-dark">
                      {listing.vendorId?.businessName || 'Unknown Vendor'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Address:
                    </span>
                    <p className="text-text-dark">
                      {listing.vendorId?.address?.fullAddress ||
                        listing.vendorId?.fullAddress ||
                        'Address not available'}
                    </p>
                  </div>
                  {listing.vendorId?.tradeLicenseNo && (
                    <div>
                      <span className="text-sm font-medium text-text-muted">
                        Trade License:
                      </span>
                      <p className="text-text-dark">
                        {listing.vendorId.tradeLicenseNo}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Delivery Options
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        listing.deliveryOptions?.selfPickup?.enabled || false
                      }
                      readOnly
                      className="w-4 h-4"
                    />
                    <span className="text-text-dark">
                      Self Pickup Available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        listing.deliveryOptions?.delivery?.enabled || false
                      }
                      readOnly
                      className="w-4 h-4"
                    />
                    <span className="text-text-dark">Delivery Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Pricing
                </h3>
                <div className="space-y-3">
                  {listing.pricing?.map((price, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-white rounded-xl"
                    >
                      <div>
                        <p className="text-text-dark font-medium">
                          {formatPrice(price.pricePerUnit)} per {price.unit}
                        </p>
                        <p className="text-sm text-text-muted">
                          Min quantity: {price.minimumQuantity} {price.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">
                      {listing.views || 0}
                    </p>
                    <p className="text-sm text-text-muted">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">
                      {listing.totalOrders || 0}
                    </p>
                    <p className="text-sm text-text-muted">Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">
                      {listing.totalQuantitySold || 0}
                    </p>
                    <p className="text-sm text-text-muted">Units Sold</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-text-dark">
                      {listing.rating?.average?.toFixed(1) || '0.0'}
                    </p>
                    <p className="text-sm text-text-muted">Rating</p>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              {recentOrders.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Recent Orders (Last 30 days)
                  </h3>
                  <div className="space-y-3">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="flex justify-between items-center p-3 bg-white rounded-xl"
                      >
                        <div>
                          <p className="text-text-dark font-medium">
                            {order.restaurantId?.name || 'Unknown Restaurant'}
                          </p>
                          <p className="text-sm text-text-muted">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-text-dark font-medium">
                            {formatPrice(order.totalAmount)}
                          </p>
                          {getOrderStatusBadge(order.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Timeline
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Created:
                    </span>
                    <p className="text-text-dark">
                      {formatDate(listing.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-text-muted">
                      Last Updated:
                    </span>
                    <p className="text-text-dark">
                      {formatDate(listing.updatedAt)}
                    </p>
                  </div>
                  {listing.moderatedBy && (
                    <div>
                      <span className="text-sm font-medium text-text-muted">
                        Moderated By:
                      </span>
                      <p className="text-text-dark">
                        {listing.moderatedBy.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-dark mb-2">
            Listing Not Found
          </h3>
          <p className="text-text-muted">
            The requested listing could not be found.
          </p>
        </div>
      )}
    </Modal>
  );
};

export default ListingDetailsModal;
