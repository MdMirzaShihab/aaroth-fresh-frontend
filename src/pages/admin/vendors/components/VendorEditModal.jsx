import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Save, Upload, Mail, Phone, MapPin } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { useUpdateVendorMutation } from '../../../../services/admin/vendorsService';
import toast from 'react-hot-toast';

const VendorEditModal = ({
  vendor,
  isOpen,
  onClose,
  onVendorUpdate,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    businessName: vendor?.businessName || '',
    businessType: vendor?.businessType || '',
    businessDescription: vendor?.businessDescription || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    address: {
      street: vendor?.address?.street || '',
      city: vendor?.address?.city || '',
      state: vendor?.address?.state || '',
      postalCode: vendor?.address?.postalCode || '',
    },
    businessRegistrationNumber: vendor?.businessRegistrationNumber || '',
    businessLicenseNumber: vendor?.businessLicenseNumber || '',
    yearsInBusiness: vendor?.yearsInBusiness || '',
  });

  const [updateVendor, { isLoading: isUpdating }] = useUpdateVendorMutation();

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleAddressChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      // Create FormData for potential file uploads
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'address') {
          formDataToSend.append('address', JSON.stringify(formData.address));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      await updateVendor({
        vendorId: vendor._id,
        formData: formDataToSend,
      }).unwrap();

      toast.success('Vendor information updated successfully');
      onVendorUpdate?.();
      onClose();
    } catch (error) {
      toast.error(`Failed to update vendor: ${error.message}`);
    }
  }, [formData, vendor?._id, updateVendor, onVendorUpdate, onClose]);

  if (!vendor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 flex items-start justify-center overflow-y-auto"
          >
            <div className="w-full max-w-3xl my-4">
              <Card className="flex flex-col glass">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-muted-olive/10 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-muted-olive" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-text-dark">
                        Edit Vendor Information
                      </h2>
                      <p className="text-text-muted text-sm">
                        {vendor.businessName}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-2xl hover:bg-white/10 transition-colors"
                    disabled={isUpdating}
                  >
                    <X className="w-5 h-5 text-text-muted" />
                  </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Business Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-muted-olive" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Business Name *
                        </label>
                        <input
                          type="text"
                          value={formData.businessName}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Business Type
                        </label>
                        <input
                          type="text"
                          value={formData.businessType}
                          onChange={(e) => handleInputChange('businessType', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Years in Business
                        </label>
                        <input
                          type="number"
                          value={formData.yearsInBusiness}
                          onChange={(e) => handleInputChange('yearsInBusiness', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          value={formData.businessRegistrationNumber}
                          onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          License Number
                        </label>
                        <input
                          type="text"
                          value={formData.businessLicenseNumber}
                          onChange={(e) => handleInputChange('businessLicenseNumber', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-text-dark mb-2">
                        Business Description
                      </label>
                      <textarea
                        value={formData.businessDescription}
                        onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted resize-none"
                        placeholder="Describe your business..."
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-muted-olive" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-muted-olive" />
                      Address Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Street Address
                        </label>
                        <input
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => handleAddressChange('street', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => handleAddressChange('city', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          State/Province
                        </label>
                        <input
                          type="text"
                          value={formData.address.state}
                          onChange={(e) => handleAddressChange('state', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          value={formData.address.postalCode}
                          onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                          className="w-full p-3 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm focus:border-muted-olive/50 focus:ring-2 focus:ring-muted-olive/10 text-text-dark placeholder-text-muted"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-white/10">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdating || isLoading}
                      className="bg-sage-green hover:bg-sage-green/90 text-white flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VendorEditModal;