/**
 * CreatePlatformVendor - Modal for creating platform vendors (Aaroth Mall, etc.)
 * Admin-only component for creating internal platform vendor accounts
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  Building2,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import toast from 'react-hot-toast';
import { PlatformVendorName } from '../../../../types/vendor';
import { useGetAdminMarketsQuery } from '../../../../store/slices/admin/adminApiSlice';

const CreatePlatformVendor = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [formData, setFormData] = useState({
    platformName: 'Aaroth Mall',
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      area: '',
      postalCode: '',
    },
    tradeLicenseNo: '',
  });

  const [errors, setErrors] = useState({});

  // Fetch active markets
  const { data: marketsData } = useGetAdminMarketsQuery({
    status: 'active',
    limit: 100,
  });

  const availableMarkets = marketsData?.data || [];

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const handleAddressChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
    // Clear error for this field
    if (errors[`address.${field}`]) {
      setErrors((prev) => ({ ...prev, [`address.${field}`]: null }));
    }
  }, [errors]);

  const handleMarketToggle = (marketId) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId)
        ? prev.filter((id) => id !== marketId)
        : [...prev, marketId]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Manager details validation
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Manager name must be at least 2 characters';
    }

    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }

    if (!formData.phone.trim() || !/^\+?[1-9]\d{10,14}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Valid phone number is required';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Address validation
    if (!formData.address.street.trim() || formData.address.street.length < 5) {
      newErrors['address.street'] = 'Street address must be at least 5 characters';
    }

    if (!formData.address.city.trim() || formData.address.city.length < 2) {
      newErrors['address.city'] = 'City is required';
    }

    if (!formData.address.area.trim() || formData.address.area.length < 2) {
      newErrors['address.area'] = 'Area is required';
    }

    if (!formData.address.postalCode.trim() || !/^\d{4}$/.test(formData.address.postalCode)) {
      newErrors['address.postalCode'] = 'Postal code must be 4 digits';
    }

    // Market validation
    if (selectedMarkets.length === 0) {
      newErrors.markets = 'Please select at least one market';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        toast.error('Please fix the form errors');
        return;
      }

      setIsLoading(true);

      try {
        // Format phone number
        let phone = formData.phone.replace(/[\s-]/g, '');
        if (!phone.startsWith('+')) {
          phone = phone.startsWith('88') ? `+${phone}` : `+88${phone}`;
        }

        const payload = {
          platformName: formData.platformName,
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone,
          password: formData.password,
          address: {
            street: formData.address.street.trim(),
            city: formData.address.city.trim(),
            area: formData.address.area.trim(),
            postalCode: formData.address.postalCode.trim(),
          },
          tradeLicenseNo: formData.tradeLicenseNo.trim() || undefined,
          markets: selectedMarkets,
        };

        const response = await fetch('/api/v1/admin/vendors/platform', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(`${formData.platformName} created successfully!`);
          onSuccess?.();
          onClose();
          // Reset form
          setFormData({
            platformName: 'Aaroth Mall',
            name: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            address: { street: '', city: '', area: '', postalCode: '' },
            tradeLicenseNo: '',
          });
          setSelectedMarkets([]);
        } else {
          toast.error(result.message || 'Failed to create platform vendor');
        }
      } catch (error) {
        console.error('Error creating platform vendor:', error);
        toast.error('Failed to create platform vendor. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [formData, onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border bg-gradient-to-r from-muted-olive/10 to-sage-green/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted-olive to-sage-green flex items-center justify-center shadow-glow-olive">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-text-dark dark:text-dark-text-primary">
                  Create Platform Vendor
                </h2>
                <p className="text-sm text-text-muted dark:text-dark-text-muted">
                  Create an internal Aaroth platform vendor account
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-text-muted dark:text-dark-text-muted" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Platform Selection */}
              <Card className="p-4 bg-blue-50/30 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Platform Name *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.platformName}
                        onChange={(e) => handleInputChange('platformName', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-dark-input border-2 border-gray-200 dark:border-dark-border focus:border-muted-olive dark:focus:border-dark-sage-accent transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="Aaroth Mall">Aaroth Mall</option>
                        <option value="Aaroth Organics">Aaroth Organics</option>
                        <option value="Aaroth Fresh Store">Aaroth Fresh Store</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
                    </div>
                    <p className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
                      This will be the business name for the platform vendor
                    </p>
                  </div>
                </div>
              </Card>

              {/* Manager Information */}
              <Card className="p-4">
                <h3 className="font-medium text-text-dark dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-olive" />
                  Account Manager Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Manager Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Manager Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter manager name"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors.name
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-tomato-red text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="manager@aaroth.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors.email
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-tomato-red text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+880 1XXX XXXXXX"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors.phone
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-tomato-red text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Trade License (Optional) */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Trade License (Optional)
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={formData.tradeLicenseNo}
                        onChange={(e) => handleInputChange('tradeLicenseNo', e.target.value)}
                        placeholder="Auto-generated if empty"
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 border-transparent focus:border-muted-olive transition-all"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Min 6 characters"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors.password
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                    </div>
                    {errors.password && (
                      <p className="text-tomato-red text-xs mt-1">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors.confirmPassword
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-tomato-red text-xs mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Business Address */}
              <Card className="p-4">
                <h3 className="font-medium text-text-dark dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-olive" />
                  Business Address
                </h3>

                <div className="space-y-4">
                  {/* Street */}
                  <div>
                    <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleAddressChange('street', e.target.value)}
                      placeholder="Enter street address"
                      className={`w-full px-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                        errors['address.street']
                          ? 'border-tomato-red/50'
                          : 'border-transparent focus:border-muted-olive'
                      } transition-all`}
                    />
                    {errors['address.street'] && (
                      <p className="text-tomato-red text-xs mt-1">{errors['address.street']}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        placeholder="e.g., Dhaka"
                        className={`w-full px-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors['address.city']
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                      {errors['address.city'] && (
                        <p className="text-tomato-red text-xs mt-1">{errors['address.city']}</p>
                      )}
                    </div>

                    {/* Area */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                        Area *
                      </label>
                      <input
                        type="text"
                        value={formData.address.area}
                        onChange={(e) => handleAddressChange('area', e.target.value)}
                        placeholder="e.g., Gulshan"
                        className={`w-full px-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors['address.area']
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                      {errors['address.area'] && (
                        <p className="text-tomato-red text-xs mt-1">{errors['address.area']}</p>
                      )}
                    </div>

                    {/* Postal Code */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary mb-2">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        placeholder="1212"
                        maxLength="4"
                        className={`w-full px-4 py-3 rounded-xl bg-earthy-beige/30 dark:bg-dark-input border-2 ${
                          errors['address.postalCode']
                            ? 'border-tomato-red/50'
                            : 'border-transparent focus:border-muted-olive'
                        } transition-all`}
                      />
                      {errors['address.postalCode'] && (
                        <p className="text-tomato-red text-xs mt-1">{errors['address.postalCode']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Market Selection */}
              <Card className="p-4">
                <h3 className="font-medium text-text-dark dark:text-dark-text-primary mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-olive" />
                  Operating Markets *
                </h3>
                <p className="text-sm text-text-muted dark:text-dark-text-muted mb-4">
                  Select the markets where this platform vendor operates (minimum 1 required)
                </p>

                {availableMarkets.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                    <p className="text-sm text-amber-800">
                      No active markets available. Please create markets first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto border border-gray-200 dark:border-dark-border rounded-2xl p-4 bg-white/50 dark:bg-dark-input/50">
                    {availableMarkets.map((market) => (
                      <label
                        key={market._id}
                        className="flex items-center gap-3 p-3 border border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:bg-mint-fresh/5 dark:hover:bg-dark-sage-accent/5 transition-colors min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMarkets.includes(market._id)}
                          onChange={() => handleMarketToggle(market._id)}
                          className="w-5 h-5 rounded border-gray-300 text-bottle-green focus:ring-bottle-green touch-target"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-text-dark dark:text-dark-text-primary">
                            {market.name}
                          </p>
                          <p className="text-sm text-text-muted dark:text-dark-text-muted">
                            {market.location?.city || 'N/A'}
                          </p>
                        </div>
                        {market.image && (
                          <img
                            src={market.image}
                            alt={market.name}
                            className="w-12 h-10 object-cover rounded-lg"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {errors.markets && (
                  <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.markets}
                  </p>
                )}

                {selectedMarkets.length > 0 && (
                  <p className="text-mint-fresh text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {selectedMarkets.length} market(s) selected
                  </p>
                )}
              </Card>

              {/* Info Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Note:</strong> Platform vendors are auto-approved with special privileges
                  including featured listings and priority support. The manager will be able to log
                  in immediately using the provided credentials.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-dark-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-6 bg-gradient-secondary"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    Creating...
                  </div>
                ) : (
                  'Create Platform Vendor'
                )}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePlatformVendor;
