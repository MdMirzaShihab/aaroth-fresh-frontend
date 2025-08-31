import React, { useState } from 'react';
import {
  X,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Star,
  Package,
  TrendingUp,
  DollarSign,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Trash2,
  Shield,
  Eye,
  Tag,
  Activity,
} from 'lucide-react';
import { useGetVendorDetailsQuery } from '../../store/slices/apiSlice';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { Modal } from '../ui/Modal';

const VendorDetailsModal = ({
  isOpen,
  onClose,
  vendorId,
  onEdit,
  onDeactivate,
  onDelete,
  onVerificationStatusChange,
}) => {
  const {
    data: vendorData,
    isLoading,
    error,
  } = useGetVendorDetailsQuery(vendorId, {
    skip: !vendorId || !isOpen,
  });

  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </Modal>
    );
  }

  if (error) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <p className="text-tomato-red font-medium">
            Failed to load vendor details
          </p>
          <p className="text-text-muted text-sm mt-2">{error.message}</p>
        </div>
      </Modal>
    );
  }

  const vendor = vendorData?.data?.vendor || {};
  const orderStats = vendorData?.data?.orderStats || {};
  const listingStats = vendorData?.data?.listingStats || {};
  const recentOrders = vendorData?.data?.recentOrders || [];

  // Verification status helper
  const getVerificationStatus = (status) => {
    const statusMap = {
      pending: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        icon: Clock,
        label: 'Pending Verification',
      },
      approved: {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: CheckCircle,
        label: 'Verified',
      },
      rejected: {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: XCircle,
        label: 'Rejected',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const verificationStatus = getVerificationStatus(vendor.verificationStatus);
  const StatusIcon = verificationStatus.icon;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'business', label: 'Business Info', icon: Building2 },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'orders', label: 'Recent Orders', icon: Package },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="6xl">
      <div className="bg-white rounded-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-muted-olive/5 to-sage-green/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Building2 className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-text-dark">
                    {vendor.businessName}
                  </h2>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${verificationStatus.bgColor} ${verificationStatus.color}`}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {verificationStatus.label}
                  </div>
                </div>
                <p className="text-text-muted">Owner: {vendor.ownerName}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">
                      {vendor.rating?.average?.toFixed(1) || '0.0'}
                      <span className="text-text-muted ml-1">
                        ({vendor.rating?.count || 0} reviews)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-text-muted">
                    <Activity className="w-4 h-4" />
                    Score: {vendor.performanceScore || 0}/100
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 mt-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-muted-olive text-white shadow-sm'
                      : 'text-text-muted hover:text-text-dark hover:bg-gray-50'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">
                        Total Orders
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        {orderStats.totalOrders || 0}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-blue-500" />
                  </div>
                </Card>

                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">
                        Revenue
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        ৳{orderStats.totalAmount?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </Card>

                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">
                        Active Listings
                      </p>
                      <p className="text-xl font-bold text-purple-900">
                        {listingStats.activeListings || 0}
                      </p>
                    </div>
                    <Tag className="w-8 h-8 text-purple-500" />
                  </div>
                </Card>

                <Card className="p-4 bg-orange-50 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">
                        Completion Rate
                      </p>
                      <p className="text-xl font-bold text-orange-900">
                        {orderStats.totalOrders > 0
                          ? Math.round(
                              (orderStats.completedOrders /
                                orderStats.totalOrders) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500" />
                  </div>
                </Card>
              </div>

              {/* Contact & Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <span>{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <span>{vendor.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-text-muted mt-1 flex-shrink-0" />
                      <span>{vendor.fullAddress}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Delivery Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">Delivery Radius:</span>
                      <span className="font-medium">
                        {vendor.deliveryRadius || 10} km
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">Minimum Order:</span>
                      <span className="font-medium">
                        ৳{vendor.minimumOrderValue || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted">Status:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          vendor.isActive
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Specialties */}
              {vendor.specialties && vendor.specialties.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.specialties.map((specialty, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted-olive/10 text-muted-olive rounded-full text-sm font-medium"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'business' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Business License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-muted">
                      Trade License Number
                    </label>
                    <p className="text-text-dark font-medium">
                      {vendor.tradeLicenseNo}
                    </p>
                  </div>
                  {vendor.businessLicense && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-text-muted">
                          Business License Number
                        </label>
                        <p className="text-text-dark font-medium">
                          {vendor.businessLicense.number || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">
                          License Expiry Date
                        </label>
                        <p className="text-text-dark font-medium">
                          {vendor.businessLicense.expiryDate
                            ? new Date(
                                vendor.businessLicense.expiryDate
                              ).toLocaleDateString()
                            : 'Not provided'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {vendor.bankDetails && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted">
                        Account Name
                      </label>
                      <p className="text-text-dark font-medium">
                        {vendor.bankDetails.accountName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">
                        Account Number
                      </label>
                      <p className="text-text-dark font-medium">
                        {vendor.bankDetails.accountNumber || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">
                        Bank Name
                      </label>
                      <p className="text-text-dark font-medium">
                        {vendor.bankDetails.bankName || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">
                        Routing Number
                      </label>
                      <p className="text-text-dark font-medium">
                        {vendor.bankDetails.routingNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {vendor.operatingHours && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Operating Hours
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(vendor.operatingHours).map(
                      ([day, hours]) => (
                        <div
                          key={day}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                        >
                          <span className="font-medium capitalize">{day}</span>
                          <span
                            className={
                              hours.closed ? 'text-red-600' : 'text-text-dark'
                            }
                          >
                            {hours.closed
                              ? 'Closed'
                              : `${hours.open} - ${hours.close}`}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark">
                    {vendor.performanceScore || 0}
                  </p>
                  <p className="text-text-muted text-sm">Performance Score</p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3">
                    <Star className="w-8 h-8" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark">
                    {vendor.rating?.average?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-text-muted text-sm">Average Rating</p>
                </Card>

                <Card className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-3">
                    <Package className="w-8 h-8" />
                  </div>
                  <p className="text-2xl font-bold text-text-dark">
                    {vendor.totalOrders || 0}
                  </p>
                  <p className="text-text-muted text-sm">Total Orders</p>
                </Card>
              </div>

              {/* Detailed Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Detailed Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Order Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Total Orders:</span>
                        <span className="font-medium">
                          {orderStats.totalOrders || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">
                          Completed Orders:
                        </span>
                        <span className="font-medium">
                          {orderStats.completedOrders || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Active Orders:</span>
                        <span className="font-medium">
                          {orderStats.activeOrders || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Total Revenue:</span>
                        <span className="font-medium">
                          ৳{orderStats.totalAmount?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Listing Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Total Listings:</span>
                        <span className="font-medium">
                          {listingStats.totalListings || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">
                          Active Listings:
                        </span>
                        <span className="font-medium">
                          {listingStats.activeListings || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">
                          Featured Listings:
                        </span>
                        <span className="font-medium">
                          {listingStats.featuredListings || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">
                          Inactive Listings:
                        </span>
                        <span className="font-medium">
                          {listingStats.inactiveListings || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {recentOrders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-text-muted">No recent orders found</p>
                </Card>
              ) : (
                recentOrders.map((order) => (
                  <Card key={order._id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            Order from{' '}
                            {order.restaurantId?.name || 'Unknown Restaurant'}
                          </p>
                          <p className="text-sm text-text-muted">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ৳{order.totalAmount?.toLocaleString()}
                        </p>
                        <p
                          className={`text-sm px-2 py-1 rounded-full ${
                            order.status === 'completed'
                              ? 'bg-green-100 text-green-600'
                              : order.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-600'
                                : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {order.status}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex flex-wrap gap-3 justify-end">
            {vendor.verificationStatus === 'pending' && (
              <>
                <Button
                  onClick={() =>
                    onVerificationStatusChange(vendor._id, 'approved')
                  }
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() =>
                    onVerificationStatusChange(vendor._id, 'rejected')
                  }
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}

            <Button variant="outline" onClick={() => onEdit(vendor)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>

            {vendor.isActive ? (
              <Button
                variant="outline"
                onClick={() => onDeactivate(vendor)}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Shield className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => onDelete(vendor)}
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VendorDetailsModal;
