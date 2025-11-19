import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  Upload,
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  FileText,
  Clock,
  AlertTriangle,
  Camera,
  Trash2,
} from 'lucide-react';
import { useUpdateBuyerMutation } from '../../../../store/slices/apiSlice';
import { addNotification } from '../../../../store/slices/notificationSlice';
import Button from '../../../../components/ui/Button';

const BuyerEditModal = ({ buyer, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    businessName: buyer.businessName || '',
    description: buyer.description || '',
    cuisineTypes: buyer.cuisineTypes || [],
    phone: buyer.phone || buyer.userId?.phone || '',
    email: buyer.email || buyer.userId?.email || '',
    website: buyer.website || '',
    address: {
      street: buyer.address?.street || '',
      area: buyer.address?.area || '',
      city: buyer.address?.city || '',
      postalCode: buyer.address?.postalCode || '',
    },
    businessHours: buyer.businessHours || {
      monday: { open: '09:00', close: '21:00', closed: false },
      tuesday: { open: '09:00', close: '21:00', closed: false },
      wednesday: { open: '09:00', close: '21:00', closed: false },
      thursday: { open: '09:00', close: '21:00', closed: false },
      friday: { open: '09:00', close: '21:00', closed: false },
      saturday: { open: '09:00', close: '21:00', closed: false },
      sunday: { open: '10:00', close: '20:00', closed: false },
    },
    businessLicense: buyer.businessLicense || '',
    taxId: buyer.taxId || '',
    operatingPermit: buyer.operatingPermit || '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(buyer.logo || null);
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('basic');

  const [updateBuyer, { isLoading }] = useUpdateBuyerMutation();

  if (!isOpen) return null;

  // Available cuisine types
  const availableCuisines = [
    'American', 'Italian', 'Chinese', 'Indian', 'Mexican', 'Japanese',
    'Thai', 'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Greek',
    'Turkish', 'Lebanese', 'Brazilian', 'Moroccan', 'Ethiopian', 'Other'
  ];

  // Days of the week
  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle cuisine type changes
  const handleCuisineChange = (cuisine) => {
    setFormData(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.includes(cuisine)
        ? prev.cuisineTypes.filter(c => c !== cuisine)
        : [...prev.cuisineTypes, cuisine],
    }));
  };

  // Handle business hours changes
  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }));
  };

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({ ...prev, logo: 'Logo file size must be less than 5MB' }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Logo must be an image file' }));
        return;
      }

      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear logo error
      setErrors(prev => ({ ...prev, logo: undefined }));
    }
  };

  // Remove logo
  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (formData.cuisineTypes.length === 0) {
      newErrors.cuisineTypes = 'At least one cuisine type is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Address validation
    if (!formData.address.street.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }

    if (!formData.address.city.trim()) {
      newErrors['address.city'] = 'City is required';
    }

    setErrors(newErrors || {});
    return Object.keys(newErrors || {}).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setActiveSection('basic'); // Switch to basic section if there are errors
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add logo file if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      // Add form data as JSON
      const buyerData = {
        ...formData,
        cuisineTypes: formData.cuisineTypes,
      };

      // Append form data fields
      Object.keys(buyerData || {}).forEach(key => {
        if (key === 'address' || key === 'businessHours') {
          submitData.append(key, JSON.stringify(buyerData[key]));
        } else if (Array.isArray(buyerData[key])) {
          submitData.append(key, JSON.stringify(buyerData[key]));
        } else {
          submitData.append(key, buyerData[key]);
        }
      });

      await updateBuyer({
        id: buyer._id,
        ...buyerData,
      }).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: 'Buyer Updated',
          message: 'Buyer information has been successfully updated',
        })
      );

      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.data?.message || 'Failed to update buyer information',
        })
      );
    }
  };

  // Section configurations
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: Building2 },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'hours', label: 'Hours', icon: Clock },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-muted-olive" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-dark">Edit Buyer</h2>
              <p className="text-text-muted text-sm">{buyer.businessName}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-text-muted hover:text-text-dark"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Section Navigation */}
        <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
          {sections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-muted-olive text-muted-olive'
                    : 'border-transparent text-text-muted hover:text-text-dark'
                }`}
              >
                <SectionIcon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Basic Info Section */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-3">
                    Buyer Logo
                  </label>
                  <div className="flex items-center gap-6">
                    <div className="flex-shrink-0">
                      {logoPreview ? (
                        <div className="relative">
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-24 h-24 rounded-2xl object-cover border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-2 -right-2 bg-tomato-red text-white rounded-full p-1 hover:bg-tomato-red/90 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-text-muted" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoPreview ? 'Change Logo' : 'Upload Logo'}
                      </Button>
                      <p className="text-sm text-text-muted mt-1">
                        JPG, PNG up to 5MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </div>
                  {errors.logo && (
                    <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.logo}
                    </p>
                  )}
                </div>

                {/* Business Name */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Business Name <span className="text-tomato-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 ${
                      errors.businessName ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                    }`}
                    placeholder="Enter buyer business name"
                  />
                  {errors.businessName && (
                    <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.businessName}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 resize-none"
                    placeholder="Brief description of the buyer"
                  />
                </div>

                {/* Cuisine Types */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-3">
                    Cuisine Types <span className="text-tomato-red">*</span>
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableCuisines.map((cuisine) => (
                      <label
                        key={cuisine}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.cuisineTypes.includes(cuisine)
                            ? 'border-muted-olive bg-muted-olive/10 text-muted-olive'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.cuisineTypes.includes(cuisine)}
                          onChange={() => handleCuisineChange(cuisine)}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{cuisine}</span>
                      </label>
                    ))}
                  </div>
                  {errors.cuisineTypes && (
                    <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.cuisineTypes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Contact Section */}
            {activeSection === 'contact' && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Phone Number <span className="text-tomato-red">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 ${
                        errors.phone ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    {errors.phone && (
                      <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Email Address <span className="text-tomato-red">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 ${
                        errors.email ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                      }`}
                      placeholder="buyer@example.com"
                    />
                    {errors.email && (
                      <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                    placeholder="https://buyer-website.com"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-3">
                    Address <span className="text-tomato-red">*</span>
                  </label>
                  <div className="space-y-4">
                    <div>
                      <input
                        type="text"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 ${
                          errors['address.street'] ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                        }`}
                        placeholder="Street address"
                      />
                      {errors['address.street'] && (
                        <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          {errors['address.street']}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={formData.address.area}
                        onChange={(e) => handleInputChange('address.area', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                        placeholder="Area/District"
                      />
                      <input
                        type="text"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 ${
                          errors['address.city'] ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                        }`}
                        placeholder="City"
                      />
                      <input
                        type="text"
                        value={formData.address.postalCode}
                        onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                        placeholder="Postal Code"
                      />
                    </div>
                    {errors['address.city'] && (
                      <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        {errors['address.city']}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours Section */}
            {activeSection === 'hours' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-4">
                    Business Hours
                  </label>
                  <div className="space-y-4">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                        <div className="w-24">
                          <span className="font-medium text-text-dark capitalize">{day}</span>
                        </div>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.businessHours[day]?.closed || false}
                            onChange={(e) => handleBusinessHoursChange(day, 'closed', e.target.checked)}
                            className="rounded text-muted-olive"
                          />
                          <span className="text-sm text-text-muted">Closed</span>
                        </label>

                        {!formData.businessHours[day]?.closed && (
                          <>
                            <div className="flex items-center gap-2">
                              <input
                                type="time"
                                value={formData.businessHours[day]?.open || '09:00'}
                                onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                              />
                              <span className="text-text-muted">to</span>
                              <input
                                type="time"
                                value={formData.businessHours[day]?.close || '21:00'}
                                onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Business License Number
                    </label>
                    <input
                      type="text"
                      value={formData.businessLicense}
                      onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      placeholder="Enter business license number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Tax ID
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      placeholder="Enter tax identification number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Operating Permit
                    </label>
                    <input
                      type="text"
                      value={formData.operatingPermit}
                      onChange={(e) => handleInputChange('operatingPermit', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20"
                      placeholder="Enter operating permit number"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-muted-olive hover:bg-muted-olive/90 text-white"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuyerEditModal;