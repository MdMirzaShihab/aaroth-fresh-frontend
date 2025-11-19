import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Users,
  ShoppingBag,
  DollarSign,
  Calendar,
  FileText,
  Shield,
  Trash2,
  Eye,
  MoreHorizontal,
  Download,
} from 'lucide-react';
import {
  useGetBuyerDetailsQuery,
  useGetBuyerManagersQuery,
  useRequestAdditionalDocumentsMutation,
} from '../../../../store/slices/apiSlice';
import {
  formatAddress,
  formatDate,
} from '../../../../services/admin/buyersService';
import { addNotification } from '../../../../store/slices/notificationSlice';
import Button from '../../../../components/ui/Button';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import BuyerVerificationModal from './BuyerVerificationModal';
import BuyerEditModal from './BuyerEditModal';

const BuyerDetailsModal = ({ buyer, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentRequestModal, setShowDocumentRequestModal] = useState(false);

  // RTK Query mutations
  const [requestDocuments, { isLoading: isRequestingDocuments }] = useRequestAdditionalDocumentsMutation();

  // Fetch detailed buyer data
  const {
    data: detailedBuyer,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetBuyerDetailsQuery(buyer._id, {
    skip: !buyer._id,
  });

  // Fetch buyer managers
  const {
    data: managers,
    isLoading: isLoadingManagers,
  } = useGetBuyerManagersQuery(buyer._id, {
    skip: !buyer._id,
  });

  if (!isOpen) return null;

  const buyerData = detailedBuyer || buyer;

  // Verification status configurations
  const verificationStatusConfig = {
    pending: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Pending Review',
      description: 'This buyer is awaiting admin verification',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-muted-olive',
      bgColor: 'bg-sage-green/20',
      label: 'Approved',
      description: 'This buyer has been verified and approved',
    },
    rejected: {
      icon: XCircle,
      color: 'text-tomato-red',
      bgColor: 'bg-tomato-red/20',
      label: 'Rejected',
      description: 'This buyer verification was rejected',
    },
  };

  const statusConfig = verificationStatusConfig[buyerData.verificationStatus] || verificationStatusConfig.pending;
  const StatusIcon = statusConfig.icon;

  // Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'business', label: 'Business Info', icon: FileText },
    { id: 'managers', label: 'Managers', icon: Users },
    { id: 'orders', label: 'Order History', icon: ShoppingBag },
    { id: 'documents', label: 'Documents', icon: Shield },
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'verify':
        setShowVerificationModal(true);
        break;
      case 'edit':
        setShowEditModal(true);
        break;
      default:
        break;
    }
  };

  if (isLoadingDetails) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 max-w-lg w-full mx-4">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-text-muted">Loading buyer details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {buyerData.logo ? (
                  <img
                    src={buyerData.logo}
                    alt={buyerData.businessName}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-secondary flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-dark">
                  {buyerData.businessName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bgColor}`}
                  >
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                  <span className="text-text-muted text-sm">
                    ID: {buyerData._id?.slice(-8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              {buyerData.verificationStatus === 'pending' && (
                <Button
                  onClick={() => handleAction('verify')}
                  className="bg-muted-olive hover:bg-muted-olive/90 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => handleAction('edit')}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>

              <Button
                variant="ghost"
                onClick={onClose}
                className="text-text-muted hover:text-text-dark"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-muted-olive text-muted-olive'
                      : 'border-transparent text-text-muted hover:text-text-dark'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'managers' && managers && (
                    <span className="bg-gray-200 text-text-muted px-1.5 py-0.5 rounded-full text-xs">
                      {managers.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Buyer Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Buyer Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted">Business Name</label>
                      <p className="text-text-dark font-medium">{buyerData.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Cuisine Types</label>
                      <p className="text-text-dark">
                        {buyerData.cuisineTypes && buyerData.cuisineTypes.length > 0 
                          ? buyerData.cuisineTypes.join(', ')
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Address</label>
                      <p className="text-text-dark">{formatAddress(buyerData.address)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Registration Date</label>
                      <p className="text-text-dark">{formatDate(buyerData.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Owner Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Owner Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted">Owner Name</label>
                      <p className="text-text-dark font-medium">{buyerData.userId?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Email</label>
                      <p className="text-text-dark">{buyerData.userId?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Phone</label>
                      <p className="text-text-dark">{buyerData.userId?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Account Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        buyerData.userId?.isActive ? 'bg-sage-green/20 text-muted-olive' : 'bg-gray-200 text-text-muted'
                      }`}>
                        {buyerData.userId?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Business Metrics Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Business Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        {buyerData.totalOrders || 0}
                      </div>
                      <div className="text-sm text-text-muted">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        ${(buyerData.totalSpent || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-text-muted">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        ${((buyerData.totalSpent || 0) / Math.max(buyerData.totalOrders || 1, 1)).toFixed(2)}
                      </div>
                      <div className="text-sm text-text-muted">Avg Order Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        {managers?.length || 0}
                      </div>
                      <div className="text-sm text-text-muted">Managers</div>
                    </div>
                  </div>
                </div>

                {/* Status Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Status Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted">Verification Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bgColor}`}
                        >
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-text-muted mt-1">{statusConfig.description}</p>
                    </div>
                    {buyerData.verificationDate && (
                      <div>
                        <label className="text-sm font-medium text-text-muted">Verification Date</label>
                        <p className="text-text-dark">{formatDate(buyerData.verificationDate)}</p>
                      </div>
                    )}
                    {buyerData.rejectionReason && (
                      <div>
                        <label className="text-sm font-medium text-text-muted">Rejection Reason</label>
                        <p className="text-text-dark bg-tomato-red/10 p-3 rounded-xl">
                          {buyerData.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Business Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted">Business License</label>
                        <p className="text-text-dark">{buyerData.businessLicense || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Tax ID</label>
                        <p className="text-text-dark">{buyerData.taxId || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Operating Permit</label>
                        <p className="text-text-dark">{buyerData.operatingPermit || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Business Hours</h3>
                    {buyerData.businessHours ? (
                      <div className="space-y-2">
                        {Object.entries(buyerData.businessHours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="capitalize text-text-muted">{day}</span>
                            <span className="text-text-dark">
                              {hours.open} - {hours.close}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-text-muted">Business hours not provided</p>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-text-muted" />
                        <div>
                          <label className="text-sm font-medium text-text-muted">Primary Phone</label>
                          <p className="text-text-dark">{buyerData.phone || buyerData.userId?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-text-muted" />
                        <div>
                          <label className="text-sm font-medium text-text-muted">Email</label>
                          <p className="text-text-dark">{buyerData.email || buyerData.userId?.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-text-muted mt-0.5" />
                        <div>
                          <label className="text-sm font-medium text-text-muted">Address</label>
                          <p className="text-text-dark">{formatAddress(buyerData.address)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Additional Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-text-muted">Description</label>
                        <p className="text-text-dark">
                          {buyerData.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Website</label>
                        <p className="text-text-dark">
                          {buyerData.website ? (
                            <a
                              href={buyerData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-olive hover:underline"
                            >
                              {buyerData.website}
                            </a>
                          ) : (
                            'Not provided'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Managers Tab */}
            {activeTab === 'managers' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-dark">Buyer Managers</h3>
                  <Button
                    onClick={() => dispatch(addNotification({
                      type: 'info',
                      title: 'Coming Soon',
                      message: 'Manager creation functionality will be available soon'
                    }))}
                    className="bg-muted-olive hover:bg-muted-olive/90 text-white"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Manager
                  </Button>
                </div>

                {isLoadingManagers ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : managers && managers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {managers.map((manager) => (
                      <div key={manager._id} className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-secondary flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-dark">{manager.name}</h4>
                            <p className="text-text-muted text-sm">{manager.email}</p>
                            <p className="text-text-muted text-sm">{manager.phone}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              manager.isActive ? 'bg-sage-green/20 text-muted-olive' : 'bg-gray-200 text-text-muted'
                            }`}>
                              {manager.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Added: {formatDate(manager.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
                    <h4 className="font-medium text-text-dark mb-2">No managers added</h4>
                    <p className="text-text-muted text-sm mb-4">
                      This buyer doesn't have any managers yet.
                    </p>
                    <Button
                      onClick={() => dispatch(addNotification({
                        type: 'info',
                        title: 'Coming Soon',
                        message: 'Manager creation functionality will be available soon'
                      }))}
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Add First Manager
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                {/* Order Statistics */}
                {buyerData.orderStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-sage-green/10 to-sage-green/5 rounded-2xl p-4 border border-sage-green/20">
                      <div className="flex items-center gap-3 mb-2">
                        <ShoppingBag className="w-5 h-5 text-bottle-green" />
                        <span className="text-sm text-text-muted">Total Orders</span>
                      </div>
                      <p className="text-2xl font-semibold text-bottle-green">
                        {buyerData.orderStats.totalOrders || 0}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-earthy-yellow/10 to-earthy-yellow/5 rounded-2xl p-4 border border-earthy-yellow/20">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-earthy-brown" />
                        <span className="text-sm text-text-muted">Total Amount</span>
                      </div>
                      <p className="text-2xl font-semibold text-earthy-brown">
                        ৳{buyerData.orderStats.totalAmount?.toLocaleString() || 0}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50/50 to-blue-50/20 rounded-2xl p-4 border border-blue-200/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-text-muted">Active Orders</span>
                      </div>
                      <p className="text-2xl font-semibold text-blue-600">
                        {buyerData.orderStats.activeOrders || 0}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-mint-fresh/10 to-mint-fresh/5 rounded-2xl p-4 border border-mint-fresh/20">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-muted-olive" />
                        <span className="text-sm text-text-muted">Completed</span>
                      </div>
                      <p className="text-2xl font-semibold text-muted-olive">
                        {buyerData.orderStats.completedOrders || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Orders List */}
                <div>
                  <h4 className="font-medium text-text-dark mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-bottle-green" />
                    Recent Orders (Last 30 Days)
                  </h4>

                  {isLoadingDetails ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : buyerData.recentOrders && buyerData.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {buyerData.recentOrders.map((order) => (
                        <div
                          key={order._id}
                          className="bg-white rounded-2xl p-4 border border-sage-green/20 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-text-dark">
                                  Order #{order.orderNumber || order._id.slice(-8)}
                                </span>
                                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                  order.status === 'completed' ? 'bg-mint-fresh/20 text-muted-olive' :
                                  order.status === 'pending' ? 'bg-orange-50 text-orange-600' :
                                  order.status === 'cancelled' ? 'bg-tomato-red/10 text-tomato-red' :
                                  'bg-blue-50 text-blue-600'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-text-muted">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {formatDate(order.createdAt)}
                                </span>
                                {order.vendorId?.businessName && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" />
                                    {order.vendorId.businessName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-lg font-semibold text-bottle-green">
                                ৳{order.totalAmount?.toLocaleString() || 0}
                              </p>
                              <p className="text-xs text-text-muted">
                                {order.items?.length || 0} items
                              </p>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          {order.items && order.items.length > 0 && (
                            <div className="pt-3 border-t border-sage-green/10">
                              <p className="text-sm text-text-muted mb-2">Items:</p>
                              <div className="flex flex-wrap gap-2">
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <span key={idx} className="text-xs bg-earthy-beige/30 text-earthy-brown px-2 py-1 rounded-lg">
                                    {item.productName || item.listingId?.productId?.name} × {item.quantity}
                                  </span>
                                ))}
                                {order.items.length > 3 && (
                                  <span className="text-xs bg-earthy-beige/30 text-earthy-brown px-2 py-1 rounded-lg">
                                    +{order.items.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-earthy-beige/10 rounded-2xl">
                      <ShoppingBag className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
                      <h4 className="font-medium text-text-dark mb-2">No Orders Yet</h4>
                      <p className="text-text-muted text-sm">
                        This buyer hasn't placed any orders in the last 30 days.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Document Status Overview */}
                <div className="bg-gradient-to-br from-sage-green/5 to-earthy-beige/10 rounded-2xl p-6 border border-sage-green/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-6 h-6 text-bottle-green" />
                    <h4 className="font-medium text-text-dark">Document Verification Status</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        buyerData.businessLicense?.document ? 'bg-mint-fresh' : 'bg-tomato-red/50'
                      }`}></div>
                      <span className="text-sm text-text-muted">Business License</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        buyerData.tradeLicenseNo ? 'bg-mint-fresh' : 'bg-tomato-red/50'
                      }`}></div>
                      <span className="text-sm text-text-muted">Trade License</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        buyerData.logo ? 'bg-mint-fresh' : 'bg-orange-400'
                      }`}></div>
                      <span className="text-sm text-text-muted">Buyer Logo</span>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                  {/* Business License */}
                  <div className="bg-white rounded-2xl p-5 border border-sage-green/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage-green/10 to-sage-green/5 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-bottle-green" />
                        </div>
                        <div>
                          <h5 className="font-medium text-text-dark">Business License</h5>
                          <p className="text-sm text-text-muted">Official business registration</p>
                        </div>
                      </div>
                      {buyerData.businessLicense?.document ? (
                        <CheckCircle className="w-5 h-5 text-muted-olive" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>

                    {buyerData.businessLicense ? (
                      <div className="space-y-2">
                        {buyerData.businessLicense.number && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">License Number:</span>
                            <span className="font-medium text-text-dark">
                              {buyerData.businessLicense.number}
                            </span>
                          </div>
                        )}
                        {buyerData.businessLicense.expiryDate && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-muted">Expiry Date:</span>
                            <span className={`font-medium ${
                              new Date(buyerData.businessLicense.expiryDate) < new Date()
                                ? 'text-tomato-red'
                                : new Date(buyerData.businessLicense.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                ? 'text-orange-500'
                                : 'text-muted-olive'
                            }`}>
                              {formatDate(buyerData.businessLicense.expiryDate)}
                              {new Date(buyerData.businessLicense.expiryDate) < new Date() && ' (Expired)'}
                            </span>
                          </div>
                        )}
                        {buyerData.businessLicense.document && (
                          <a
                            href={buyerData.businessLicense.document}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-bottle-green hover:text-muted-olive transition-colors mt-3 group"
                          >
                            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                            View Document
                          </a>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-tomato-red">No business license uploaded</p>
                    )}
                  </div>

                  {/* Trade License */}
                  <div className="bg-white rounded-2xl p-5 border border-sage-green/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-earthy-yellow/10 to-earthy-yellow/5 flex items-center justify-center">
                          <Shield className="w-6 h-6 text-earthy-brown" />
                        </div>
                        <div>
                          <h5 className="font-medium text-text-dark">Trade License</h5>
                          <p className="text-sm text-text-muted">Trade license number</p>
                        </div>
                      </div>
                      {buyerData.tradeLicenseNo ? (
                        <CheckCircle className="w-5 h-5 text-muted-olive" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      )}
                    </div>

                    {buyerData.tradeLicenseNo ? (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">License Number:</span>
                        <span className="font-medium text-text-dark">
                          {buyerData.tradeLicenseNo}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-tomato-red">No trade license number provided</p>
                    )}
                  </div>

                  {/* Buyer Logo */}
                  <div className="bg-white rounded-2xl p-5 border border-sage-green/20 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50/50 to-blue-50/20 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-text-dark">Buyer Logo</h5>
                          <p className="text-sm text-text-muted">Brand identity image</p>
                        </div>
                      </div>
                      {buyerData.logo ? (
                        <CheckCircle className="w-5 h-5 text-muted-olive" />
                      ) : (
                        <Clock className="w-5 h-5 text-orange-500" />
                      )}
                    </div>

                    {buyerData.logo ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={buyerData.logo}
                          alt={`${buyerData.name} logo`}
                          className="w-20 h-20 object-cover rounded-xl border border-sage-green/20"
                        />
                        <a
                          href={buyerData.logo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-bottle-green hover:text-muted-olive transition-colors group"
                        >
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          View Full Size
                        </a>
                      </div>
                    ) : (
                      <p className="text-sm text-orange-600">No logo uploaded</p>
                    )}
                  </div>
                </div>

                {/* Document Request Actions */}
                {buyerData.verificationStatus === 'pending' && (
                  <div className="bg-gradient-to-r from-earthy-beige/20 to-sage-green/10 rounded-2xl p-5 border border-sage-green/20">
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h5 className="font-medium text-text-dark mb-1">Missing Documents?</h5>
                        <p className="text-sm text-text-muted mb-3">
                          If documents are incomplete, you can request additional documents from the buyer.
                        </p>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => setShowDocumentRequestModal(true)}
                          disabled={isRequestingDocuments}
                          className="flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Request Documents
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <BuyerVerificationModal
          buyer={buyerData}
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <BuyerEditModal
          buyer={buyerData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Document Request Modal */}
      {showDocumentRequestModal && (
        <DocumentRequestModal
          buyer={buyerData}
          isOpen={showDocumentRequestModal}
          onClose={() => setShowDocumentRequestModal(false)}
          onSubmit={async (documentData) => {
            try {
              await requestDocuments({
                id: buyerData._id,
                documentTypes: documentData.documentTypes,
                message: documentData.message,
                deadline: documentData.deadline,
              }).unwrap();

              dispatch(addNotification({
                type: 'success',
                message: 'Document request sent successfully',
                duration: 3000
              }));

              setShowDocumentRequestModal(false);
            } catch (error) {
              dispatch(addNotification({
                type: 'error',
                message: error.data?.message || 'Failed to request documents',
                duration: 5000
              }));
            }
          }}
        />
      )}

    </>
  );
};

// Document Request Modal Component
const DocumentRequestModal = ({ buyer, isOpen, onClose, onSubmit }) => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [message, setMessage] = useState('');
  const [deadline, setDeadline] = useState('');

  const documentOptions = [
    { value: 'business_license', label: 'Business License' },
    { value: 'trade_license', label: 'Trade License' },
    { value: 'health_permit', label: 'Health Permit' },
    { value: 'fire_safety', label: 'Fire Safety Certificate' },
    { value: 'food_safety', label: 'Food Safety Certificate' },
    { value: 'tax_clearance', label: 'Tax Clearance' },
  ];

  const handleToggleDocument = (docValue) => {
    setSelectedDocuments(prev =>
      prev.includes(docValue)
        ? prev.filter(d => d !== docValue)
        : [...prev, docValue]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      documentTypes: selectedDocuments,
      message: message || 'Please submit the following documents for verification.',
      deadline: deadline || undefined,
    });
  };

  // Set default deadline to 7 days from now
  React.useEffect(() => {
    if (isOpen && !deadline) {
      const defaultDeadline = new Date();
      defaultDeadline.setDate(defaultDeadline.getDate() + 7);
      setDeadline(defaultDeadline.toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-sage-green/20 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h3 className="text-xl font-semibold text-text-dark">Request Documents</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Requesting documents from {buyer?.name || buyer?.businessName}
                </h4>
                <p className="text-sm text-blue-800">
                  Select the documents you need and set a deadline for submission. An email notification will be sent to the buyer owner.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-3">
              Select Required Documents *
            </label>
            <div className="space-y-2">
              {documentOptions.map((doc) => (
                <label
                  key={doc.value}
                  className="flex items-center gap-3 p-3 bg-earthy-beige/10 hover:bg-earthy-beige/20 rounded-xl cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedDocuments.includes(doc.value)}
                    onChange={() => handleToggleDocument(doc.value)}
                    className="w-5 h-5 text-bottle-green rounded focus:ring-2 focus:ring-bottle-green/20"
                  />
                  <span className="text-text-dark">{doc.label}</span>
                </label>
              ))}
            </div>
            {selectedDocuments.length === 0 && (
              <p className="text-sm text-tomato-red mt-2">
                Please select at least one document type
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Submission Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-2">
              Custom Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add any specific instructions or details..."
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green resize-none"
            />
            <p className="text-xs text-text-muted mt-1">
              Max 1000 characters
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-sage-green/20">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={selectedDocuments.length === 0}
              className="bg-bottle-green hover:bg-muted-olive text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Send Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerDetailsModal;