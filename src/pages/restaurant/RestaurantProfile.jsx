import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Building,
  MapPin,
  Clock,
  Save,
  Edit,
  Camera,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';
import { useUpdateRestaurantProfileMutation } from '../../store/slices/apiSlice';

const RestaurantProfile = () => {
  const { user } = useSelector(selectAuth);

  // State management
  const [isEditing, setIsEditing] = useState(false);

  // Restaurant profile form state - only restaurant business data
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: user?.restaurant?.restaurantName || '',
    restaurantAddress: user?.restaurant?.restaurantAddress || {
      street: '',
      city: '',
      area: '',
      postalCode: '',
    },
    restaurantType: user?.restaurant?.restaurantType || '',
    description: user?.restaurant?.description || '',
    operatingHours: user?.restaurant?.operatingHours || {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '09:00', close: '22:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false },
    },
  });

  // API mutations
  const [updateRestaurantProfile, { isLoading: isUpdating }] =
    useUpdateRestaurantProfileMutation();

  const handleRestaurantSave = async () => {
    try {
      // Validate required fields
      if (!restaurantData.restaurantName) {
        alert('Restaurant name is required');
        return;
      }

      if (
        !restaurantData.restaurantAddress.street ||
        !restaurantData.restaurantAddress.city
      ) {
        alert('Restaurant address is required');
        return;
      }

      // Send only restaurant-specific data to the API
      await updateRestaurantProfile({
        restaurant: restaurantData,
      }).unwrap();

      setIsEditing(false);
      alert('Restaurant profile updated successfully');
    } catch (error) {
      console.error('Failed to update restaurant profile:', error);
      alert('Failed to update restaurant profile. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Restaurant Profile
          </h1>
          <p className="text-text-muted mt-2">
            Manage your restaurant business information and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 touch-target"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Restaurant'}
          </button>
        </div>
      </div>

      {/* Restaurant Profile Content */}
      <div className="glass rounded-3xl p-6">
        <div className="space-y-6">
          {/* Restaurant Header */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {restaurantData.restaurantName?.charAt(0)?.toUpperCase() ||
                    'R'}
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
                {restaurantData.restaurantName || 'Restaurant Name'}
              </h3>
              <p className="text-text-muted">Owner: {user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-sage-green rounded-full"></div>
                <span className="text-sm text-text-muted">
                  {user?.isApproved
                    ? 'Verified Restaurant'
                    : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Restaurant Information */}
          <div>
            <h4 className="text-lg font-semibold text-text-dark mb-4">
              Restaurant Information
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
                    value={restaurantData.restaurantName}
                    onChange={(e) =>
                      setRestaurantData((prev) => ({
                        ...prev,
                        restaurantName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                    placeholder="Enter restaurant name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Restaurant Type
                </label>
                <select
                  value={restaurantData.restaurantType}
                  onChange={(e) =>
                    setRestaurantData((prev) => ({
                      ...prev,
                      restaurantType: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                >
                  <option value="">Select restaurant type</option>
                  <option value="fine-dining">Fine Dining</option>
                  <option value="casual-dining">Casual Dining</option>
                  <option value="fast-food">Fast Food</option>
                  <option value="cafe">Cafe</option>
                  <option value="bakery">Bakery</option>
                  <option value="catering">Catering</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Description
                </label>
                <textarea
                  value={restaurantData.description}
                  onChange={(e) =>
                    setRestaurantData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                  placeholder="Tell us about your restaurant..."
                />
              </div>
            </div>
          </div>

          {/* Restaurant Address */}
          <div>
            <h4 className="text-lg font-semibold text-text-dark mb-4">
              Restaurant Address
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Street Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={restaurantData.restaurantAddress?.street || ''}
                    onChange={(e) =>
                      setRestaurantData((prev) => ({
                        ...prev,
                        restaurantAddress: {
                          ...prev.restaurantAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={restaurantData.restaurantAddress?.city || ''}
                  onChange={(e) =>
                    setRestaurantData((prev) => ({
                      ...prev,
                      restaurantAddress: {
                        ...prev.restaurantAddress,
                        city: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Area
                </label>
                <input
                  type="text"
                  value={restaurantData.restaurantAddress?.area || ''}
                  onChange={(e) =>
                    setRestaurantData((prev) => ({
                      ...prev,
                      restaurantAddress: {
                        ...prev.restaurantAddress,
                        area: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                  placeholder="Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={restaurantData.restaurantAddress?.postalCode || ''}
                  onChange={(e) =>
                    setRestaurantData((prev) => ({
                      ...prev,
                      restaurantAddress: {
                        ...prev.restaurantAddress,
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive transition-all duration-200 disabled:bg-gray-50"
                  placeholder="Postal code"
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
              {Object.entries(restaurantData.operatingHours).map(
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
                              setRestaurantData((prev) => ({
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
                          className="text-muted-olive focus:ring-muted-olive/20 rounded"
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
                                setRestaurantData((prev) => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...hours, open: e.target.value },
                                  },
                                }));
                              }
                            }}
                            disabled={!isEditing}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive disabled:bg-gray-50"
                          />
                          <span className="text-text-muted">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              if (isEditing) {
                                setRestaurantData((prev) => ({
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
                            className="px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive disabled:bg-gray-50"
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

          {/* Additional Info */}
          <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900">
                  Profile Information
                </h5>
                <p className="text-sm text-blue-700 mt-1">
                  This page focuses on your restaurant business information. For
                  personal account settings, password changes, and user-specific
                  preferences, please visit your{' '}
                  <a href="/profile" className="font-medium underline">
                    User Profile
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button
                onClick={handleRestaurantSave}
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
                    Save Restaurant Profile
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
