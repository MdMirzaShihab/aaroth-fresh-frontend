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
  useGetRestaurantDetailsQuery,
  useGetRestaurantManagersQuery,
} from '../../../../store/slices/apiSlice';
import {
  formatAddress,
  formatDate,
} from '../../../../services/admin-v2/restaurantsService';
import { addNotification } from '../../../../store/slices/notificationSlice';
import Button from '../../../../components/ui/Button';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import RestaurantVerificationModal from './RestaurantVerificationModal';
import RestaurantEditModal from './RestaurantEditModal';

const RestaurantDetailsModal = ({ restaurant, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('overview');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch detailed restaurant data
  const {
    data: detailedRestaurant,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = useGetRestaurantDetailsQuery(restaurant._id, {
    skip: !restaurant._id,
  });

  // Fetch restaurant managers
  const {
    data: managers,
    isLoading: isLoadingManagers,
  } = useGetRestaurantManagersQuery(restaurant._id, {
    skip: !restaurant._id,
  });

  if (!isOpen) return null;

  const restaurantData = detailedRestaurant || restaurant;

  // Verification status configurations
  const verificationStatusConfig = {
    pending: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Pending Review',
      description: 'This restaurant is awaiting admin verification',
    },
    approved: {
      icon: CheckCircle,
      color: 'text-muted-olive',
      bgColor: 'bg-sage-green/20',
      label: 'Approved',
      description: 'This restaurant has been verified and approved',
    },
    rejected: {
      icon: XCircle,
      color: 'text-tomato-red',
      bgColor: 'bg-tomato-red/20',
      label: 'Rejected',
      description: 'This restaurant verification was rejected',
    },
  };

  const statusConfig = verificationStatusConfig[restaurantData.verificationStatus] || verificationStatusConfig.pending;
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
            <p className="mt-4 text-text-muted">Loading restaurant details...</p>
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
                {restaurantData.logo ? (
                  <img
                    src={restaurantData.logo}
                    alt={restaurantData.businessName}
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
                  {restaurantData.businessName}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.color} ${statusConfig.bgColor}`}
                  >
                    <StatusIcon className="w-4 h-4 mr-1" />
                    {statusConfig.label}
                  </span>
                  <span className="text-text-muted text-sm">
                    ID: {restaurantData._id?.slice(-8)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              {restaurantData.verificationStatus === 'pending' && (
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
                {/* Restaurant Info Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Restaurant Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-text-muted">Business Name</label>
                      <p className="text-text-dark font-medium">{restaurantData.businessName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Cuisine Types</label>
                      <p className="text-text-dark">
                        {restaurantData.cuisineTypes && restaurantData.cuisineTypes.length > 0 
                          ? restaurantData.cuisineTypes.join(', ')
                          : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Address</label>
                      <p className="text-text-dark">{formatAddress(restaurantData.address)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Registration Date</label>
                      <p className="text-text-dark">{formatDate(restaurantData.createdAt)}</p>
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
                      <p className="text-text-dark font-medium">{restaurantData.userId?.name || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Email</label>
                      <p className="text-text-dark">{restaurantData.userId?.email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Phone</label>
                      <p className="text-text-dark">{restaurantData.userId?.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-text-muted">Account Status</label>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        restaurantData.userId?.isActive ? 'bg-sage-green/20 text-muted-olive' : 'bg-gray-200 text-text-muted'
                      }`}>
                        {restaurantData.userId?.isActive ? 'Active' : 'Inactive'}
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
                        {restaurantData.totalOrders || 0}
                      </div>
                      <div className="text-sm text-text-muted">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        ${(restaurantData.totalSpent || 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-text-muted">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-text-dark">
                        ${((restaurantData.totalSpent || 0) / Math.max(restaurantData.totalOrders || 1, 1)).toFixed(2)}
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
                    {restaurantData.verificationDate && (
                      <div>
                        <label className="text-sm font-medium text-text-muted">Verification Date</label>
                        <p className="text-text-dark">{formatDate(restaurantData.verificationDate)}</p>
                      </div>
                    )}
                    {restaurantData.rejectionReason && (
                      <div>
                        <label className="text-sm font-medium text-text-muted">Rejection Reason</label>
                        <p className="text-text-dark bg-tomato-red/10 p-3 rounded-xl">
                          {restaurantData.rejectionReason}
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
                        <p className="text-text-dark">{restaurantData.businessLicense || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Tax ID</label>
                        <p className="text-text-dark">{restaurantData.taxId || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Operating Permit</label>
                        <p className="text-text-dark">{restaurantData.operatingPermit || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-text-dark mb-4">Business Hours</h3>
                    {restaurantData.businessHours ? (
                      <div className="space-y-2">
                        {Object.entries(restaurantData.businessHours).map(([day, hours]) => (
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
                          <p className="text-text-dark">{restaurantData.phone || restaurantData.userId?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-text-muted" />
                        <div>
                          <label className="text-sm font-medium text-text-muted">Email</label>
                          <p className="text-text-dark">{restaurantData.email || restaurantData.userId?.email || 'Not provided'}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-text-muted mt-0.5" />
                        <div>
                          <label className="text-sm font-medium text-text-muted">Address</label>
                          <p className="text-text-dark">{formatAddress(restaurantData.address)}</p>
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
                          {restaurantData.description || 'No description provided'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-text-muted">Website</label>
                        <p className="text-text-dark">
                          {restaurantData.website ? (
                            <a
                              href={restaurantData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-olive hover:underline"
                            >
                              {restaurantData.website}
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
                  <h3 className="text-xl font-semibold text-text-dark">Restaurant Managers</h3>
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
                      This restaurant doesn't have any managers yet.
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
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
                <h4 className="font-medium text-text-dark mb-2">Order History</h4>
                <p className="text-text-muted text-sm">
                  Order history functionality will be implemented here.
                </p>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-text-muted/40 mx-auto mb-4" />
                <h4 className="font-medium text-text-dark mb-2">Documents</h4>
                <p className="text-text-muted text-sm">
                  Document management functionality will be implemented here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <RestaurantVerificationModal
          restaurant={restaurantData}
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <RestaurantEditModal
          restaurant={restaurantData}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

    </>
  );
};

export default RestaurantDetailsModal;