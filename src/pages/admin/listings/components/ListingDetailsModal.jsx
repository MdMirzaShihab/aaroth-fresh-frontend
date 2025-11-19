/**
 * ListingDetailsModal - Comprehensive listing details and management
 * Enhanced to match Admin V1 feature parity with complete vendor, product, and analytics information
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Flag,
  Trash2,
  Package,
  TrendingUp,
  ShoppingCart,
  Eye,
  DollarSign,
  Truck,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  Tag,
  Leaf,
  Shield,
  User,
  Clock,
  BarChart3,
} from 'lucide-react';
import { Card, Button } from '../../../../components/ui';
import {
  formatPrice,
  formatListingDate,
  getStatusBadge,
  calculateListingHealth,
  LISTING_STATUSES,
} from '../../../../services/admin/listingsService';

const ListingDetailsModal = ({
  listing,
  isOpen,
  isLoading,
  onClose,
  onStatusUpdate,
  onFeaturedToggle,
  onFlagUpdate,
  onDelete,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [newStatus, setNewStatus] = useState(listing?.status || 'active');
  const [statusReason, setStatusReason] = useState('');
  const [showFlagUpdate, setShowFlagUpdate] = useState(false);
  const [flagReason, setFlagReason] = useState(listing?.flagReason || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');

  if (!isOpen || !listing) return null;

  const statusBadge = getStatusBadge(listing.status);
  const health = calculateListingHealth(listing);

  // Safely access nested properties
  const product = listing.productId || listing.product || {};
  const vendor = listing.vendorId || listing.vendor || {};
  const category = product.category || {};
  const availability = listing.availability || {};
  const deliveryOptions = listing.deliveryOptions || {};
  const pricing = listing.pricing || [];
  const rating = listing.rating || {};
  const profitAnalytics = listing.profitAnalytics || {};
  const recentOrders = listing.recentOrders || [];

  const handleStatusSubmit = () => {
    onStatusUpdate(listing._id, newStatus, statusReason);
    setShowStatusChange(false);
    setStatusReason('');
  };

  const handleFlagSubmit = () => {
    onFlagUpdate(listing._id, !listing.isFlagged, flagReason);
    setShowFlagUpdate(false);
    setFlagReason('');
  };

  const handleDeleteSubmit = () => {
    onDelete(listing._id, deleteReason);
    setShowDeleteConfirm(false);
    setDeleteReason('');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'vendor', label: 'Vendor', icon: User },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
                Listing Details
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? 'bg-earthy-yellow text-earthy-brown font-medium'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Product Images */}
                {(listing.images?.length > 0 || listing.primaryImage || product.images?.length > 0) && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-earthy-yellow" />
                      Product Images
                    </h3>
                    <div className="grid grid-cols-4 gap-3">
                      {(listing.images || product.images || [listing.primaryImage].filter(Boolean)).slice(0, 4).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                          <img
                            src={img?.url || img}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Information */}
                <div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-mint-fresh" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Product Name</p>
                      <p className="font-medium text-slate-800 dark:text-white">{product.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Category</p>
                      <p className="font-medium text-slate-800 dark:text-white">{category.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Quality Grade</p>
                      <div className="flex items-center gap-1">
                        {listing.qualityGrade ? (
                          <>
                            <Star className="w-4 h-4 text-earthy-yellow fill-current" />
                            <span className="font-medium text-slate-800 dark:text-white">{listing.qualityGrade}</span>
                          </>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </div>
                    </div>
                    {product.variety && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Variety</p>
                        <p className="font-medium text-slate-800 dark:text-white">{product.variety}</p>
                      </div>
                    )}
                    {product.origin && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Origin</p>
                        <p className="font-medium text-slate-800 dark:text-white">{product.origin}</p>
                      </div>
                    )}
                    {availability.isInSeason !== undefined && (
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">In Season</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                          availability.isInSeason
                            ? 'bg-mint-fresh/20 text-bottle-green'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {availability.isInSeason ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                    {product.description && (
                      <div className="col-span-2 lg:col-span-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Description</p>
                        <p className="text-sm text-slate-800 dark:text-white">{product.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Details */}
                {(availability.quantityAvailable || availability.unit) && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <Package className="w-5 h-5 text-bottle-green" />
                      Availability
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Quantity Available</p>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {availability.quantityAvailable || 0} {availability.unit || ''}
                        </p>
                      </div>
                      {availability.harvestDate && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Harvest Date</p>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {formatListingDate(availability.harvestDate)}
                          </p>
                        </div>
                      )}
                      {availability.expiryDate && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Expiry Date</p>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {formatListingDate(availability.expiryDate)}
                          </p>
                        </div>
                      )}
                      {listing.minimumOrderValue && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Minimum Order</p>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {formatPrice(listing.minimumOrderValue)}
                          </p>
                        </div>
                      )}
                      {listing.leadTime && (
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Lead Time</p>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {listing.leadTime}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Options */}
                {(deliveryOptions.selfPickup || deliveryOptions.delivery) && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-earthy-yellow" />
                      Delivery Options
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {deliveryOptions.selfPickup && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Self Pickup</p>
                          <p className={`font-medium ${deliveryOptions.selfPickup.enabled ? 'text-mint-fresh' : 'text-slate-500'}`}>
                            {deliveryOptions.selfPickup.enabled ? 'Available' : 'Not Available'}
                          </p>
                        </div>
                      )}
                      {deliveryOptions.delivery && (
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Delivery</p>
                          <p className={`font-medium ${deliveryOptions.delivery.enabled ? 'text-mint-fresh' : 'text-slate-500'}`}>
                            {deliveryOptions.delivery.enabled ? 'Available' : 'Not Available'}
                          </p>
                          {deliveryOptions.delivery.enabled && deliveryOptions.delivery.fee && (
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              Fee: {formatPrice(deliveryOptions.delivery.fee)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Status & Moderation */}
                <div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-3">Status & Moderation</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Current Status</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>
                      <Button size="sm" onClick={() => setShowStatusChange(!showStatusChange)}>
                        Change Status
                      </Button>
                    </div>

                    {showStatusChange && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
                      >
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                        >
                          {Object.entries(LISTING_STATUSES).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                        <textarea
                          placeholder="Reason for status change (optional)"
                          value={statusReason}
                          onChange={(e) => setStatusReason(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleStatusSubmit} disabled={isLoading}>Update Status</Button>
                          <Button variant="outline" onClick={() => setShowStatusChange(false)}>Cancel</Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Featured Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Star className={`w-5 h-5 ${listing.featured ? 'text-earthy-yellow fill-current' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-800 dark:text-white">Featured Listing</span>
                      </div>
                      <Button
                        size="sm"
                        variant={listing.featured ? 'outline' : 'default'}
                        onClick={() => onFeaturedToggle(listing._id)}
                      >
                        {listing.featured ? 'Remove Featured' : 'Set Featured'}
                      </Button>
                    </div>

                    {/* Flag Status */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Flag className={`w-5 h-5 ${listing.isFlagged ? 'text-tomato-red' : 'text-slate-400'}`} />
                        <span className="text-sm font-medium text-slate-800 dark:text-white">Flagged for Review</span>
                      </div>
                      <Button
                        size="sm"
                        variant={listing.isFlagged ? 'outline' : 'default'}
                        onClick={() => setShowFlagUpdate(!showFlagUpdate)}
                      >
                        {listing.isFlagged ? 'Remove Flag' : 'Flag Listing'}
                      </Button>
                    </div>

                    {showFlagUpdate && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3"
                      >
                        <textarea
                          placeholder="Reason for flagging/unflagging"
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                          rows="3"
                        />
                        <div className="flex gap-2">
                          <Button onClick={handleFlagSubmit} disabled={isLoading}>
                            {listing.isFlagged ? 'Remove Flag' : 'Flag Listing'}
                          </Button>
                          <Button variant="outline" onClick={() => setShowFlagUpdate(false)}>Cancel</Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Vendor Tab */}
            {activeTab === 'vendor' && (
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-bottle-green" />
                  Vendor Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Business Name</p>
                    <p className="font-medium text-slate-800 dark:text-white">{vendor.businessName || 'N/A'}</p>
                  </div>
                  {vendor.ownerName && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl">
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Owner Name</p>
                      <p className="font-medium text-slate-800 dark:text-white">{vendor.ownerName}</p>
                    </div>
                  )}
                  {vendor.email && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center gap-3">
                      <Mail className="w-5 h-5 text-earthy-yellow flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Email</p>
                        <p className="font-medium text-slate-800 dark:text-white truncate">{vendor.email}</p>
                      </div>
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center gap-3">
                      <Phone className="w-5 h-5 text-mint-fresh flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Phone</p>
                        <p className="font-medium text-slate-800 dark:text-white">{vendor.phone}</p>
                      </div>
                    </div>
                  )}
                  {vendor.tradeLicenseNo && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center gap-3">
                      <Shield className="w-5 h-5 text-bottle-green flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Trade License</p>
                        <p className="font-medium text-slate-800 dark:text-white">{vendor.tradeLicenseNo}</p>
                      </div>
                    </div>
                  )}
                  {(vendor.address?.fullAddress || vendor.fullAddress) && (
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-start gap-3 lg:col-span-2">
                      <MapPin className="w-5 h-5 text-tomato-red flex-shrink-0 mt-1" />
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Address</p>
                        <p className="text-sm text-slate-800 dark:text-white">
                          {vendor.address?.fullAddress || vendor.fullAddress}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pricing Tab */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-mint-fresh" />
                    Pricing Tiers
                  </h3>
                  {pricing.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900">
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400 rounded-tl-xl">Unit</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">Price per Unit</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400">Min Quantity</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-slate-600 dark:text-slate-400 rounded-tr-xl">Max Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                          {pricing.map((tier, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                              <td className="px-4 py-3 text-sm text-slate-800 dark:text-white font-medium">{tier.unit || 'N/A'}</td>
                              <td className="px-4 py-3 text-sm text-slate-800 dark:text-white font-semibold text-mint-fresh">
                                {formatPrice(tier.pricePerUnit)}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{tier.minimumQuantity || 0}</td>
                              <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{tier.maximumQuantity || 'Unlimited'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl text-center">
                      <Tag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-600 dark:text-slate-400 mb-1">Single Price</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {formatPrice(listing.price)} <span className="text-sm font-normal">/ {listing.unit || 'unit'}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Profit Analytics */}
                {(profitAnalytics.totalRevenue || profitAnalytics.grossProfit) && (
                  <div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-bottle-green" />
                      Profit Analytics
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {profitAnalytics.totalRevenue && (
                        <div className="bg-mint-fresh/10 p-4 rounded-xl border border-mint-fresh/20">
                          <p className="text-sm text-bottle-green mb-1">Total Revenue</p>
                          <p className="text-xl font-bold text-bottle-green">{formatPrice(profitAnalytics.totalRevenue)}</p>
                        </div>
                      )}
                      {profitAnalytics.totalCost && (
                        <div className="bg-tomato-red/10 p-4 rounded-xl border border-tomato-red/20">
                          <p className="text-sm text-tomato-red mb-1">Total Cost</p>
                          <p className="text-xl font-bold text-tomato-red">{formatPrice(profitAnalytics.totalCost)}</p>
                        </div>
                      )}
                      {profitAnalytics.grossProfit && (
                        <div className="bg-earthy-yellow/10 p-4 rounded-xl border border-earthy-yellow/20">
                          <p className="text-sm text-earthy-brown mb-1">Gross Profit</p>
                          <p className="text-xl font-bold text-earthy-brown">{formatPrice(profitAnalytics.grossProfit)}</p>
                        </div>
                      )}
                      {profitAnalytics.profitMargin && (
                        <div className="bg-bottle-green/10 p-4 rounded-xl border border-bottle-green/20">
                          <p className="text-sm text-bottle-green mb-1">Profit Margin</p>
                          <p className="text-xl font-bold text-bottle-green">{profitAnalytics.profitMargin}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-earthy-yellow" />
                  Business Metrics
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
                    <Eye className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Total Views</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{listing.views || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
                    <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">{listing.totalOrders || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
                    <Package className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-2" />
                    <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Quantity Sold</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{listing.totalQuantitySold || 0}</p>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-6 rounded-xl">
                    <Star className="w-8 h-8 text-amber-600 dark:text-amber-400 mb-2" />
                    <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Average Rating</p>
                    <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">
                      {rating.average ? rating.average.toFixed(1) : 'N/A'}
                      {rating.count && <span className="text-sm font-normal ml-1">({rating.count})</span>}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-mint-fresh" />
                  Recent Orders (Last 30 Days)
                </h3>
                {recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {recentOrders.map((order, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-earthy-yellow/20 rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-earthy-brown" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">
                              {order.buyerId?.name || 'Unknown Buyer'}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatListingDate(order.createdAt)}
                              </span>
                              {order.orderNumber && (
                                <span className="text-xs px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded">
                                  #{order.orderNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 dark:text-white">{formatPrice(order.totalAmount)}</p>
                          <span className={`text-xs px-2 py-1 rounded-lg mt-1 inline-block ${
                            order.status === 'delivered' ? 'bg-mint-fresh/20 text-bottle-green' :
                            order.status === 'cancelled' ? 'bg-tomato-red/20 text-tomato-red' :
                            'bg-earthy-yellow/20 text-earthy-brown'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-xl text-center">
                    <ShoppingCart className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">No recent orders in the last 30 days</p>
                  </div>
                )}
              </div>
            )}

            {/* Danger Zone - Always visible at bottom */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-8">
              <h3 className="text-lg font-medium text-tomato-red mb-3">Danger Zone</h3>
              <div className="p-4 bg-tomato-red/5 border border-tomato-red/20 rounded-lg">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                  Permanently delete this listing. This action cannot be undone.
                </p>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    className="border-tomato-red text-tomato-red hover:bg-tomato-red hover:text-white"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Listing
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Reason for deletion (required)"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg"
                      rows="3"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="border-tomato-red text-tomato-red hover:bg-tomato-red hover:text-white"
                        onClick={handleDeleteSubmit}
                        disabled={isLoading || !deleteReason}
                      >
                        Confirm Delete
                      </Button>
                      <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Created At
                  </p>
                  <p className="text-slate-800 dark:text-white">{formatListingDate(listing.createdAt)}</p>
                </div>
                <div>
                  <p className="text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Updated At
                  </p>
                  <p className="text-slate-800 dark:text-white">{formatListingDate(listing.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ListingDetailsModal;
