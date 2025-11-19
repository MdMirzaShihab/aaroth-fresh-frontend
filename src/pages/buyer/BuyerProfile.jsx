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
import { useUpdateBuyerProfileMutation } from '../../store/slices/apiSlice';

const BuyerProfile = () => {
  const { user } = useSelector(selectAuth);

  // State management
  const [isEditing, setIsEditing] = useState(false);

  // Buyer profile form state - only buyer business data
  const [buyerData, setBuyerData] = useState({
    buyerName: user?.buyer?.buyerName || '',
    buyerAddress: user?.buyer?.buyerAddress || {
      street: '',
      city: '',
      area: '',
      postalCode: '',
    },
    buyerType: user?.buyer?.buyerType || '',
    description: user?.buyer?.description || '',
    operatingHours: user?.buyer?.operatingHours || {
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
  const [updateBuyerProfile, { isLoading: isUpdating }] =
    useUpdateBuyerProfileMutation();

  const handleBuyerSave = async () => {
    try {
      // Validate required fields
      if (!buyerData.buyerName) {
        alert('Buyer name is required');
        return;
      }

      if (
        !buyerData.buyerAddress.street ||
        !buyerData.buyerAddress.city
      ) {
        alert('Buyer address is required');
        return;
      }

      // Send only buyer-specific data to the API
      await updateBuyerProfile({
        buyer: buyerData,
      }).unwrap();

      setIsEditing(false);
      alert('Buyer profile updated successfully');
    } catch (error) {
      console.error('Failed to update buyer profile:', error);
      alert('Failed to update buyer profile. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Buyer Profile
          </h1>
          <p className="text-text-muted mt-2">
            Manage your buyer business information and settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 touch-target"
          >
            <Edit className="w-4 h-4" />
            {isEditing ? 'Cancel' : 'Edit Buyer'}
          </button>
        </div>
      </div>

      {/* Buyer Profile Content */}
      <div className="glass rounded-3xl p-6">
        <div className="space-y-6">
          {/* Buyer Header */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-primary rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {buyerData.buyerName?.charAt(0)?.toUpperCase() ||
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
                {buyerData.buyerName || 'Buyer Name'}
              </h3>
              <p className="text-text-muted">Owner: {user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-sage-green rounded-full"></div>
                <span className="text-sm text-text-muted">
                  {user?.isApproved
                    ? 'Verified Buyer'
                    : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div>
            <h4 className="text-lg font-semibold text-text-dark mb-4">
              Buyer Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Buyer Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={buyerData.buyerName}
                    onChange={(e) =>
                      setBuyerData((prev) => ({
                        ...prev,
                        buyerName: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                    placeholder="Enter buyer name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Buyer Type
                </label>
                <select
                  value={buyerData.buyerType}
                  onChange={(e) =>
                    setBuyerData((prev) => ({
                      ...prev,
                      buyerType: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                >
                  <option value="">Select buyer type</option>
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
                  value={buyerData.description}
                  onChange={(e) =>
                    setBuyerData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                  placeholder="Tell us about your buyer..."
                />
              </div>
            </div>
          </div>

          {/* Buyer Address */}
          <div>
            <h4 className="text-lg font-semibold text-text-dark mb-4">
              Buyer Address
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
                    value={buyerData.buyerAddress?.street || ''}
                    onChange={(e) =>
                      setBuyerData((prev) => ({
                        ...prev,
                        buyerAddress: {
                          ...prev.buyerAddress,
                          street: e.target.value,
                        },
                      }))
                    }
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                    placeholder="Street address"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={buyerData.buyerAddress?.city || ''}
                  onChange={(e) =>
                    setBuyerData((prev) => ({
                      ...prev,
                      buyerAddress: {
                        ...prev.buyerAddress,
                        city: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                  Area
                </label>
                <input
                  type="text"
                  value={buyerData.buyerAddress?.area || ''}
                  onChange={(e) =>
                    setBuyerData((prev) => ({
                      ...prev,
                      buyerAddress: {
                        ...prev.buyerAddress,
                        area: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                  placeholder="Area"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={buyerData.buyerAddress?.postalCode || ''}
                  onChange={(e) =>
                    setBuyerData((prev) => ({
                      ...prev,
                      buyerAddress: {
                        ...prev.buyerAddress,
                        postalCode: e.target.value,
                      },
                    }))
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all duration-200 disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/60"
                  placeholder="Postal code"
                />
              </div>
            </div>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-lg font-semibold text-text-dark dark:text-dark-text-primary mb-4">
              Operating Hours
            </h4>
            <div className="space-y-4">
              {Object.entries(buyerData.operatingHours).map(
                ([day, hours]) => (
                  <div
                    key={day}
                    className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl"
                  >
                    <div className="w-20">
                      <span className="font-medium text-text-dark dark:text-dark-text-primary capitalize">
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
                              setBuyerData((prev) => ({
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
                          className="text-muted-olive dark:text-dark-sage-accent focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 rounded"
                        />
                        <span className="text-sm text-text-muted dark:text-dark-text-muted">Open</span>
                      </label>

                      {!hours.closed && (
                        <>
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => {
                              if (isEditing) {
                                setBuyerData((prev) => ({
                                  ...prev,
                                  operatingHours: {
                                    ...prev.operatingHours,
                                    [day]: { ...hours, open: e.target.value },
                                  },
                                }));
                              }
                            }}
                            disabled={!isEditing}
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary"
                          />
                          <span className="text-text-muted dark:text-dark-text-muted">to</span>
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => {
                              if (isEditing) {
                                setBuyerData((prev) => ({
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
                            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/20 focus:border-muted-olive dark:focus:border-dark-sage-accent disabled:bg-gray-50 dark:disabled:bg-gray-700 text-text-dark dark:text-dark-text-primary"
                          />
                        </>
                      )}

                      {hours.closed && (
                        <span className="text-text-muted/70 dark:text-dark-text-muted/70 italic">
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
          <div className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-900 dark:text-blue-300">
                  Profile Information
                </h5>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                  This page focuses on your buyer business information. For
                  personal account settings, password changes, and user-specific
                  preferences, please visit your{' '}
                  <a href="/profile" className="font-medium underline text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    User Profile
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleBuyerSave}
                disabled={isUpdating}
                className="bg-gradient-to-r from-muted-olive to-sage-green text-white px-8 py-3 rounded-2xl font-medium hover:shadow-glow-green hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-target"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Buyer Profile
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

export default BuyerProfile;
