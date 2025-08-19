import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  User,
  Phone,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Save,
  Edit,
  Camera,
  Building,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import FileUpload from '../../components/ui/FileUpload';
import { selectAuth } from '../../store/slices/authSlice';
import {
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
} from '../../store/slices/apiSlice';
import {
  formatPhoneForDisplay,
  validateBangladeshPhone,
  phoneInputUtils,
} from '../../utils';

const Profile = () => {
  const { user } = useSelector(selectAuth);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile form state - basic user data only
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
    pushNotifications: true,
    smsAlerts: true,
  });

  // API mutations
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateUserProfileMutation();
  const [changeUserPassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Handle image upload
  const handleImageUpload = (file) => {
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSave = async () => {
    try {
      // Validate phone number
      const phoneValidation = validateBangladeshPhone(profileData.phone);
      if (!phoneValidation.isValid) {
        alert(phoneValidation.message);
        return;
      }

      // Create FormData for multipart upload (optional image)
      const formDataToSend = new FormData();
      formDataToSend.append('name', profileData.name);
      formDataToSend.append('phone', profileData.phone);

      // Add profile image if selected
      if (imageFile) {
        formDataToSend.append('profileImage', imageFile);
      }

      await updateProfile(formDataToSend).unwrap();
      setIsEditing(false);
      setImageFile(null); // Reset file input after successful update
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }).unwrap();

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Failed to change password. Please try again.');
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      admin: 'System Administrator',
      vendor: 'Vendor',
      restaurantOwner: 'Restaurant Owner',
      restaurantManager: 'Restaurant Manager',
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800 border-purple-200',
      vendor: 'bg-green-100 text-green-800 border-green-200',
      restaurantOwner: 'bg-blue-100 text-blue-800 border-blue-200',
      restaurantManager: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 touch-target ${
        isActive
          ? 'bg-gradient-primary text-white shadow-sm'
          : 'text-text-muted hover:text-text-dark hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">User Profile</h1>
          <p className="text-text-muted mt-2">
            Manage your account information and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'profile' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 touch-target"
            >
              <Edit className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass rounded-2xl p-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <TabButton
            id="profile"
            label="Profile"
            icon={User}
            isActive={activeTab === 'profile'}
            onClick={setActiveTab}
          />
          <TabButton
            id="security"
            label="Security"
            icon={Shield}
            isActive={activeTab === 'security'}
            onClick={setActiveTab}
          />
          <TabButton
            id="notifications"
            label="Notifications"
            icon={Bell}
            isActive={activeTab === 'notifications'}
            onClick={setActiveTab}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass rounded-3xl p-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Photo & Basic Info */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt={profileData.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <span className="text-white text-2xl font-bold">
                        {profileData.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <FileUpload
                      onFileSelect={handleImageUpload}
                      accept="image/*"
                      maxSize={1024 * 1024} // 1MB
                      maxFiles={1}
                      multiple={false}
                    >
                      <button className="w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200">
                        <Camera className="w-4 h-4 text-gray-600" />
                      </button>
                    </FileUpload>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">
                  {profileData.name || 'User Name'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                      user?.role
                    )}`}
                  >
                    {getRoleDisplayName(user?.role)}
                  </span>
                  {user?.isApproved && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                </div>
                <p className="text-text-muted text-sm mt-1">
                  Member since{' '}
                  {new Date(user?.createdAt).getFullYear() || '2024'}
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div>
              <h4 className="text-lg font-semibold text-text-dark mb-4">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={
                        isEditing
                          ? profileData.phone
                          : formatPhoneForDisplay(profileData.phone)
                      }
                      onChange={(e) => {
                        if (isEditing) {
                          setProfileData((prev) => ({
                            ...prev,
                            phone: e.target.value,
                          }));
                        }
                      }}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder={phoneInputUtils.placeholder}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific Information Display */}
            {user?.role === 'vendor' && user?.vendor && (
              <div>
                <h4 className="text-lg font-semibold text-text-dark mb-4">
                  Business Information
                </h4>
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-text-dark">
                      {user.vendor.businessName}
                    </span>
                  </div>
                  {user.vendor.businessAddress && (
                    <p className="text-text-muted text-sm">
                      {user.vendor.businessAddress.street},{' '}
                      {user.vendor.businessAddress.city}
                    </p>
                  )}
                  <p className="text-xs text-text-muted mt-2">
                    <span className="font-medium">Note:</span> To update
                    business information, contact support.
                  </p>
                </div>
              </div>
            )}

            {['restaurantOwner', 'restaurantManager'].includes(user?.role) &&
              user?.restaurant && (
                <div>
                  <h4 className="text-lg font-semibold text-text-dark mb-4">
                    Restaurant Information
                  </h4>
                  <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-text-dark">
                        {user.restaurant.restaurantName}
                      </span>
                    </div>
                    {user.restaurant.restaurantAddress && (
                      <p className="text-text-muted text-sm">
                        {user.restaurant.restaurantAddress.street},{' '}
                        {user.restaurant.restaurantAddress.city}
                      </p>
                    )}
                    <p className="text-xs text-text-muted mt-2">
                      <span className="font-medium">Note:</span> To update
                      restaurant details,
                      {user.role === 'restaurantOwner'
                        ? ' visit the Restaurant Profile page.'
                        : ' contact your restaurant owner.'}
                    </p>
                  </div>
                </div>
              )}

            {/* Account Status */}
            <div>
              <h4 className="text-lg font-semibold text-text-dark mb-4">
                Account Status
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-dark">
                      Account Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        user?.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="bg-white/50 border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-dark">
                      Verification Status
                    </span>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        user?.isApproved
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {user?.isApproved ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={handleProfileSave}
                  disabled={isUpdating}
                  className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-text-dark mb-4">
                Change Password
              </h4>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-4 pr-12 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  onClick={handlePasswordChange}
                  disabled={
                    !passwordData.currentPassword ||
                    !passwordData.newPassword ||
                    !passwordData.confirmPassword ||
                    isChangingPassword
                  }
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Changing...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-text-dark mb-4">
                Notification Preferences
              </h4>
              <div className="space-y-4">
                {Object.entries({
                  orderUpdates: 'Order Updates',
                  systemAlerts: 'System Alerts',
                  marketingEmails: 'Marketing Emails',
                  pushNotifications: 'Push Notifications',
                  smsAlerts: 'SMS Alerts',
                }).map(([key, label]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 bg-white/50 border border-gray-100 rounded-2xl"
                  >
                    <div>
                      <span className="font-medium text-text-dark">
                        {label}
                      </span>
                      <p className="text-sm text-text-muted mt-1">
                        {key === 'orderUpdates' &&
                          'Get notified about order status changes'}
                        {key === 'systemAlerts' &&
                          'Important system notifications and updates'}
                        {key === 'marketingEmails' &&
                          'Promotional offers and newsletters'}
                        {key === 'pushNotifications' &&
                          'Browser push notifications'}
                        {key === 'smsAlerts' &&
                          'SMS notifications for critical updates'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[key]}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            [key]: e.target.checked,
                          }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-bottle-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-bottle-green"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
