/**
 * UserProfileModal - Comprehensive User Profile Management
 * Features: Tabbed interface, role-based editing, status management, audit trail, business associations
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Shield,
  Activity,
  Building,
  FileText,
  Settings,
  Edit3,
  Save,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { Input } from '../../../../components/ui';
import { StatusBadge } from '../../../../components/ui';
import { Modal } from '../../../../components/ui/Modal';
import { Tabs } from '../../../../components/ui/Tabs';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

// User avatar component
const UserProfileAvatar = ({ user, size = 'lg' }) => {
  const sizeClasses = {
    md: 'w-16 h-16 text-xl',
    lg: 'w-24 h-24 text-3xl',
    xl: 'w-32 h-32 text-4xl'
  };

  const getRoleGradient = (role) => {
    const gradients = {
      admin: 'bg-gradient-to-br from-tomato-red via-earthy-yellow to-earthy-brown',
      vendor: 'bg-gradient-to-br from-muted-olive via-sage-green to-sage-green',
      restaurantOwner: 'bg-gradient-to-br from-earthy-brown via-dusty-cedar to-earthy-tan',
      restaurantManager: 'bg-gradient-to-br from-muted-olive via-sage-green to-dusty-cedar'
    };
    return gradients[role] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div className={`${sizeClasses[size]} rounded-3xl ${getRoleGradient(user.role)} flex items-center justify-center shadow-xl text-white font-bold relative`}>
      {user.name?.charAt(0)?.toUpperCase() || 'U'}
      {user.verificationStatus === 'approved' && (
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-sage-green rounded-full flex items-center justify-center border-2 border-white">
          <CheckCircle className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
};

// Basic information tab
const BasicInfoTab = ({ user, isEditing, editedData, onDataChange }) => {
  const { isDarkMode } = useTheme();

  const handleInputChange = (field, value) => {
    onDataChange({ ...editedData, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header with Avatar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gradient-to-r from-sage-green/10 to-sage-green/10 rounded-2xl">
        <UserProfileAvatar user={user} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              {user.name}
            </h2>
            <StatusBadge status={user.status} variant="glass" />
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'} mb-1`}>
            {user.role === 'restaurantOwner' ? 'Restaurant Owner' : 
             user.role === 'restaurantManager' ? 'Restaurant Manager' :
             user.role === 'vendor' ? 'Vendor' : 'Administrator'}
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
            Member since {format(new Date(user.createdAt), 'MMMM yyyy')}
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Full Name
            </label>
            {isEditing ? (
              <Input
                value={editedData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter full name"
              />
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className={isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}>
                  {user.name}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Email Address
            </label>
            {isEditing ? (
              <Input
                type="email"
                value={editedData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter email address"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className={isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}>
                  {user.email}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Phone Number
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={editedData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter phone number"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className={isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}>
                  {user.phone || 'Not provided'}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Location
            </label>
            {isEditing ? (
              <Input
                value={editedData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter location"
              />
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className={isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}>
                  {user.location || 'Not provided'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Account Status */}
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          Account Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-xl">
            <div className={`text-lg font-bold ${user.isActive ? 'text-sage-green' : 'text-gray-400'}`}>
              {user.isActive ? <CheckCircle className="w-6 h-6 mx-auto mb-1" /> : <XCircle className="w-6 h-6 mx-auto mb-1" />}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-xl">
            <div className={`text-lg font-bold ${user.isApproved ? 'text-sage-green' : 'text-earthy-yellow'}`}>
              {user.isApproved ? <CheckCircle className="w-6 h-6 mx-auto mb-1" /> : <Clock className="w-6 h-6 mx-auto mb-1" />}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {user.isApproved ? 'Approved' : 'Pending'}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-xl">
            <div className={`text-lg font-bold ${user.verificationStatus === 'approved' ? 'text-sage-green' : user.verificationStatus === 'pending' ? 'text-earthy-yellow' : 'text-tomato-red'}`}>
              {user.verificationStatus === 'approved' ? <CheckCircle className="w-6 h-6 mx-auto mb-1" /> : 
               user.verificationStatus === 'pending' ? <Clock className="w-6 h-6 mx-auto mb-1" /> : 
               <XCircle className="w-6 h-6 mx-auto mb-1" />}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
              {user.verificationStatus}
            </p>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-dark-surface rounded-xl">
            <div className={`text-lg font-bold ${user.riskScore <= 30 ? 'text-sage-green' : user.riskScore <= 60 ? 'text-earthy-yellow' : 'text-tomato-red'}`}>
              <span>{user.riskScore || 0}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Risk Score
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Activity timeline tab
const ActivityTab = ({ user }) => {
  const { isDarkMode } = useTheme();
  
  // Mock activity data - replace with real data from API
  const activities = [
    {
      id: 1,
      type: 'login',
      description: 'User logged in',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      icon: Eye,
      color: 'sage-green'
    },
    {
      id: 2,
      type: 'profile_update',
      description: 'Updated profile information',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: Edit3,
      color: 'sage-green'
    },
    {
      id: 3,
      type: 'verification',
      description: 'Verification documents submitted',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: FileText,
      color: 'earthy-yellow'
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          Recent Activity
        </h3>
        <div className="space-y-4">
          {activities.map((activity) => {
            const IconComponent = activity.icon;
            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-lg bg-${activity.color}/10 flex items-center justify-center`}>
                  <IconComponent className={`w-4 h-4 text-${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                    {activity.description}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    {format(activity.timestamp, 'PPp')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Login History */}
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          Login History
        </h3>
        <div className="text-sm text-text-muted">
          <div className="flex justify-between py-2">
            <span>Last Login:</span>
            <span>{user.lastLogin ? format(new Date(user.lastLogin), 'PPp') : 'Never'}</span>
          </div>
          <div className="flex justify-between py-2">
            <span>Account Created:</span>
            <span>{format(new Date(user.createdAt), 'PPp')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Business associations tab
const BusinessTab = ({ user }) => {
  const { isDarkMode } = useTheme();
  const { businessInfo } = user;

  if (!businessInfo || !businessInfo.businessName) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          No Business Association
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
          This user is not associated with any business
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          Business Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Business Name
            </label>
            <p className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
              {businessInfo.businessName}
            </p>
          </div>
          
          {businessInfo.businessType && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                Business Type
              </label>
              <p className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
                {businessInfo.businessType}
              </p>
            </div>
          )}

          {businessInfo.location && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                Location
              </label>
              <p className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
                {businessInfo.location}
              </p>
            </div>
          )}

          {businessInfo.totalOrders !== undefined && (
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                Total Orders
              </label>
              <p className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
                {businessInfo.totalOrders.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const UserProfileModal = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle save changes
  const handleSave = useCallback(async () => {
    setIsLoading(true);
    try {
      // API call to update user
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast.success('User updated successfully');
      setIsEditing(false);
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  }, [editedData, onUserUpdate]);

  // Handle cancel editing
  const handleCancel = useCallback(() => {
    setEditedData({});
    setIsEditing(false);
  }, []);

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="flex flex-col h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <div>
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              User Profile
            </h2>
            <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
              Manage user information and settings
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-dark-border">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="underline"
          />
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'basic' && (
                <BasicInfoTab
                  user={user}
                  isEditing={isEditing}
                  editedData={editedData}
                  onDataChange={setEditedData}
                />
              )}
              {activeTab === 'activity' && <ActivityTab user={user} />}
              {activeTab === 'business' && <BusinessTab user={user} />}
              {activeTab === 'settings' && (
                <div className="text-center py-12">
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    Settings panel coming soon
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileModal;