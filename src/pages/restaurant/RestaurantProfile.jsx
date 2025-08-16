import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Save,
  Edit,
  Camera,
  Building,
  Users,
  Shield,
  Bell,
  Eye,
  EyeOff,
} from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';
import { useUpdateRestaurantProfileMutation } from '../../store/slices/apiSlice';
import {
  formatPhoneForDisplay,
  validateBangladeshPhone,
  phoneInputUtils,
} from '../../utils';

const RestaurantProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    restaurantName: user?.restaurantName || '',
    ownerName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    restaurantAddress: user?.restaurantAddress || '',
    cuisineType: user?.cuisineType || '',
    description: user?.description || '',
    operatingHours: user?.operatingHours || {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notifications preferences
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newsletters: true,
    smsAlerts: true,
    emailAlerts: true,
  });

  // API mutation
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateRestaurantProfileMutation();

  const handleProfileSave = async () => {
    try {
      // Validate phone number
      const phoneValidation = validateBangladeshPhone(profileData.phone);
      if (!phoneValidation.isValid) {
        alert(phoneValidation.message);
        return;
      }

      await updateProfile(profileData).unwrap();
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Show error message
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
      // API call to change password
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      // Show success message
    } catch (error) {
      console.error('Failed to change password:', error);
      // Show error message
    }
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
          <h1 className="text-3xl font-bold text-text-dark">
            Restaurant Profile
          </h1>
          <p className="text-text-muted mt-2">
            Manage your restaurant information and settings
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
            {/* Profile Photo */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {profileData.restaurantName?.charAt(0) || 'R'}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center hover:shadow-xl transition-all duration-200">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-dark">
                  {profileData.restaurantName || 'Restaurant Name'}
                </h3>
                <p className="text-text-muted">
                  Member since{' '}
                  {new Date(user?.createdAt).getFullYear() || '2024'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 bg-mint-fresh rounded-full"></div>
                  <span className="text-sm text-text-muted">
                    {user?.isApproved
                      ? 'Verified Restaurant'
                      : 'Pending Verification'}
                  </span>
                </div>
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
                    Restaurant Name *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={profileData.restaurantName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          restaurantName: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Enter restaurant name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Owner Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={profileData.ownerName}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          ownerName: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Enter owner name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Enter email address"
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Cuisine Type
                  </label>
                  <select
                    value={profileData.cuisineType}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        cuisineType: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                  >
                    <option value="">Select cuisine type</option>
                    <option value="bengali">Bengali</option>
                    <option value="indian">Indian</option>
                    <option value="chinese">Chinese</option>
                    <option value="continental">Continental</option>
                    <option value="fast-food">Fast Food</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Restaurant Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    <textarea
                      value={profileData.restaurantAddress}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          restaurantAddress: e.target.value,
                        }))
                      }
                      disabled={!isEditing}
                      rows={3}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                      placeholder="Enter complete restaurant address"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Description
                  </label>
                  <textarea
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200 disabled:bg-gray-50"
                    placeholder="Tell us about your restaurant..."
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div>
              <h4 className="text-lg font-semibold text-text-dark mb-4">
                Operating Hours
              </h4>
              <div className="space-y-4">
                {Object.entries(profileData.operatingHours).map(
                  ([day, hours]) => (
                    <div
                      key={day}
                      className="flex items-center gap-4 p-4 bg-white/50 border border-gray-100 rounded-2xl"
                    >
                      <div className="w-20">
                        <span className="font-medium text-text-dark capitalize">
                          {day}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => {
                              if (isEditing) {
                                setProfileData((prev) => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: {
                                      ...hours,
                                      closed: !e.target.checked,
                                    },
                                  },
                                }));
                              }
                            }}
                            disabled={!isEditing}
                            className="text-bottle-green focus:ring-bottle-green/20 rounded"
                          />
                          <span className="text-sm text-text-muted">Open</span>
                        </label>

                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => {
                                if (isEditing) {
                                  setProfileData((prev) => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: { ...hours, open: e.target.value },
                                    },
                                  }));
                                }
                              }}
                              disabled={!isEditing}
                              className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green disabled:bg-gray-50"
                            />
                            <span className="text-text-muted">to</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => {
                                if (isEditing) {
                                  setProfileData((prev) => ({
                                    ...prev,
                                    operatingHours: {
                                      ...prev.operatingHours,
                                      [day]: {
                                        ...hours,
                                        close: e.target.value,
                                      },
                                    },
                                  }));
                                }
                              }}
                              disabled={!isEditing}
                              className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green disabled:bg-gray-50"
                            />
                          </>
                        )}

                        {hours.closed && (
                          <span className="text-text-muted/70 italic">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
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
                    !passwordData.confirmPassword
                  }
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-target"
                >
                  Change Password
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
                  promotions: 'Promotions & Offers',
                  newsletters: 'Newsletters',
                  smsAlerts: 'SMS Alerts',
                  emailAlerts: 'Email Alerts',
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
                        {key === 'promotions' &&
                          'Receive promotional offers and discounts'}
                        {key === 'newsletters' &&
                          'Weekly newsletters with fresh produce updates'}
                        {key === 'smsAlerts' &&
                          'SMS notifications for important updates'}
                        {key === 'emailAlerts' &&
                          'Email notifications for all activities'}
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

export default RestaurantProfile;
