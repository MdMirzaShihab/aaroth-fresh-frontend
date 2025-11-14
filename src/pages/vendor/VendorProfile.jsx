import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Save,
  Edit,
  Camera,
  FileText,
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Upload,
  Trash2,
} from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';

const VendorProfile = () => {
  const { user } = useSelector(selectAuth);

  // State management
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('business'); // business, contact, documents, banking

  // Vendor profile form state
  const [vendorData, setVendorData] = useState({
    businessName: user?.vendor?.businessName || '',
    businessType: user?.vendor?.businessType || '',
    businessRegistrationNumber: user?.vendor?.businessRegistrationNumber || '',
    gstNumber: user?.vendor?.gstNumber || '',
    description: user?.vendor?.description || '',
    specialties: user?.vendor?.specialties || [],
    businessAddress: user?.vendor?.businessAddress || {
      street: '',
      city: '',
      area: '',
      postalCode: '',
      landmark: '',
    },
    contactPerson: user?.vendor?.contactPerson || '',
    phone: user?.vendor?.phone || user?.phone || '',
    alternatePhone: user?.vendor?.alternatePhone || '',
    email: user?.vendor?.email || user?.email || '',
    website: user?.vendor?.website || '',
    operatingHours: user?.vendor?.operatingHours || {
      monday: { open: '06:00', close: '20:00', closed: false },
      tuesday: { open: '06:00', close: '20:00', closed: false },
      wednesday: { open: '06:00', close: '20:00', closed: false },
      thursday: { open: '06:00', close: '20:00', closed: false },
      friday: { open: '06:00', close: '20:00', closed: false },
      saturday: { open: '06:00', close: '20:00', closed: false },
      sunday: { open: '07:00', close: '18:00', closed: false },
    },
    bankDetails: user?.vendor?.bankDetails || {
      accountHolderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      branch: '',
    },
  });

  const [logo, setLogo] = useState(user?.vendor?.logo || null);
  const [documents, setDocuments] = useState({
    businessLicense: user?.vendor?.businessLicense || null,
    gstCertificate: user?.vendor?.gstCertificate || null,
    panCard: user?.vendor?.panCard || null,
  });

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setVendorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddressChange = (field, value) => {
    setVendorData((prev) => ({
      ...prev,
      businessAddress: {
        ...prev.businessAddress,
        [field]: value,
      },
    }));
  };

  const handleBankDetailsChange = (field, value) => {
    setVendorData((prev) => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value,
      },
    }));
  };

  const handleOperatingHoursChange = (day, field, value) => {
    setVendorData((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // In production, upload to server
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (docType, event) => {
    const file = event.target.files[0];
    if (file) {
      setDocuments((prev) => ({
        ...prev,
        [docType]: file,
      }));
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!vendorData.businessName) {
        alert('Business name is required');
        return;
      }

      if (!vendorData.phone) {
        alert('Phone number is required');
        return;
      }

      if (!vendorData.businessAddress.street || !vendorData.businessAddress.city) {
        alert('Complete business address is required');
        return;
      }

      // In production: Call API mutation
      // await updateVendorProfile(vendorData).unwrap();

      setIsEditing(false);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  // Verification status badge
  const getVerificationBadge = () => {
    const status = user?.vendor?.verificationStatus || 'pending';
    const badges = {
      approved: {
        icon: CheckCircle,
        text: 'Verified Business',
        className: 'bg-mint-fresh/20 text-bottle-green border-bottle-green/30',
      },
      pending: {
        icon: AlertCircle,
        text: 'Verification Pending',
        className: 'bg-earthy-yellow/20 text-earthy-brown border-earthy-brown/30',
      },
      rejected: {
        icon: XCircle,
        text: 'Verification Failed',
        className: 'bg-tomato-red/20 text-tomato-red border-tomato-red/30',
      },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${badge.className} text-sm font-medium`}
      >
        <Icon className="w-4 h-4" />
        {badge.text}
      </div>
    );
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative">
              {logo ? (
                <img
                  src={logo}
                  alt="Business Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-sage-green/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-muted-olive/20 to-sage-green/20 flex items-center justify-center border-2 border-sage-green/30">
                  <Store className="w-10 h-10 text-muted-olive" />
                </div>
              )}
              {isEditing && (
                <label className="absolute -bottom-2 -right-2 bg-gradient-primary text-white p-2 rounded-full cursor-pointer hover:shadow-glow-green transition-all duration-200 touch-target">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-text-dark">
                {vendorData.businessName || 'Vendor Profile'}
              </h1>
              <p className="text-text-muted mt-1">
                Manage your business information and settings
              </p>
              <div className="mt-2">{getVerificationBadge()}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-200 text-text-dark px-6 py-3 rounded-2xl font-medium hover:bg-gray-300 transition-all duration-200 touch-target"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-layer-1 rounded-3xl p-2 shadow-soft">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'business', label: 'Business Info', icon: Store },
            { id: 'contact', label: 'Contact & Hours', icon: Phone },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'banking', label: 'Banking Details', icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-200 whitespace-nowrap touch-target ${
                  activeTab === tab.id
                    ? 'bg-gradient-primary text-white shadow-glow-green'
                    : 'text-text-muted hover:bg-sage-green/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft animate-fade-in">
        {/* Business Info Tab */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark flex items-center gap-2">
              <Building className="w-5 h-5 text-muted-olive" />
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={vendorData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter business name"
                />
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Business Type
                </label>
                <select
                  value={vendorData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                >
                  <option value="">Select type</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="farmer">Farmer</option>
                  <option value="distributor">Distributor</option>
                  <option value="supplier">Supplier</option>
                </select>
              </div>

              {/* Registration Number */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  value={vendorData.businessRegistrationNumber}
                  onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter registration number"
                />
              </div>

              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={vendorData.gstNumber}
                  onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Business Description
              </label>
              <textarea
                value={vendorData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200 resize-none"
                placeholder="Describe your business, products, and services"
              />
            </div>

            {/* Business Address */}
            <div>
              <h3 className="text-lg font-medium text-text-dark mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-olive" />
                Business Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={vendorData.businessAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={vendorData.businessAddress.city}
                    onChange={(e) => handleAddressChange('city', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Area/Locality
                  </label>
                  <input
                    type="text"
                    value={vendorData.businessAddress.area}
                    onChange={(e) => handleAddressChange('area', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                    placeholder="Enter area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={vendorData.businessAddress.postalCode}
                    onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                    placeholder="Enter postal code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={vendorData.businessAddress.landmark}
                    onChange={(e) => handleAddressChange('landmark', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact & Hours Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark flex items-center gap-2">
              <Phone className="w-5 h-5 text-muted-olive" />
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={vendorData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter contact person name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Primary Phone *
                </label>
                <input
                  type="tel"
                  value={vendorData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="+880 1234 567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Alternate Phone
                </label>
                <input
                  type="tel"
                  value={vendorData.alternatePhone}
                  onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="+880 1234 567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={vendorData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="email@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={vendorData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Operating Hours */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-text-dark mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-olive" />
                Operating Hours
              </h3>
              <div className="space-y-3">
                {days.map((day) => (
                  <div
                    key={day}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center p-4 rounded-2xl glass-layer-2"
                  >
                    <div className="font-medium text-text-dark capitalize">{day}</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={vendorData.operatingHours[day].open}
                        onChange={(e) =>
                          handleOperatingHoursChange(day, 'open', e.target.value)
                        }
                        disabled={!isEditing || vendorData.operatingHours[day].closed}
                        className="flex-1 px-3 py-2 rounded-xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive disabled:opacity-60 transition-all duration-200"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={vendorData.operatingHours[day].close}
                        onChange={(e) =>
                          handleOperatingHoursChange(day, 'close', e.target.value)
                        }
                        disabled={!isEditing || vendorData.operatingHours[day].closed}
                        className="flex-1 px-3 py-2 rounded-xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive disabled:opacity-60 transition-all duration-200"
                      />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text-muted">
                      <input
                        type="checkbox"
                        checked={vendorData.operatingHours[day].closed}
                        onChange={(e) =>
                          handleOperatingHoursChange(day, 'closed', e.target.checked)
                        }
                        disabled={!isEditing}
                        className="rounded border-sage-green/30 text-muted-olive focus:ring-muted-olive/20 disabled:opacity-60"
                      />
                      Closed
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-olive" />
              Business Documents
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Business License */}
              <div className="glass-layer-2 p-6 rounded-2xl">
                <h3 className="font-medium text-text-dark mb-3">Business License</h3>
                {documents.businessLicense ? (
                  <div className="flex items-center justify-between p-3 bg-mint-fresh/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-bottle-green" />
                      <span className="text-sm text-bottle-green">Uploaded</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, businessLicense: null }))
                        }
                        className="text-tomato-red hover:text-tomato-red/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-sage-green/30 rounded-xl ${
                      isEditing
                        ? 'cursor-pointer hover:border-muted-olive hover:bg-sage-green/5'
                        : 'opacity-60'
                    } transition-all duration-200`}
                  >
                    <Upload className="w-8 h-8 text-muted-olive mb-2" />
                    <span className="text-sm text-text-muted">
                      {isEditing ? 'Click to upload' : 'Not uploaded'}
                    </span>
                    {isEditing && (
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('businessLicense', e)}
                      />
                    )}
                  </label>
                )}
              </div>

              {/* GST Certificate */}
              <div className="glass-layer-2 p-6 rounded-2xl">
                <h3 className="font-medium text-text-dark mb-3">GST Certificate</h3>
                {documents.gstCertificate ? (
                  <div className="flex items-center justify-between p-3 bg-mint-fresh/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-bottle-green" />
                      <span className="text-sm text-bottle-green">Uploaded</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() =>
                          setDocuments((prev) => ({ ...prev, gstCertificate: null }))
                        }
                        className="text-tomato-red hover:text-tomato-red/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-sage-green/30 rounded-xl ${
                      isEditing
                        ? 'cursor-pointer hover:border-muted-olive hover:bg-sage-green/5'
                        : 'opacity-60'
                    } transition-all duration-200`}
                  >
                    <Upload className="w-8 h-8 text-muted-olive mb-2" />
                    <span className="text-sm text-text-muted">
                      {isEditing ? 'Click to upload' : 'Not uploaded'}
                    </span>
                    {isEditing && (
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('gstCertificate', e)}
                      />
                    )}
                  </label>
                )}
              </div>

              {/* PAN Card */}
              <div className="glass-layer-2 p-6 rounded-2xl">
                <h3 className="font-medium text-text-dark mb-3">PAN Card</h3>
                {documents.panCard ? (
                  <div className="flex items-center justify-between p-3 bg-mint-fresh/10 rounded-xl">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-bottle-green" />
                      <span className="text-sm text-bottle-green">Uploaded</span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => setDocuments((prev) => ({ ...prev, panCard: null }))}
                        className="text-tomato-red hover:text-tomato-red/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <label
                    className={`flex flex-col items-center justify-center p-6 border-2 border-dashed border-sage-green/30 rounded-xl ${
                      isEditing
                        ? 'cursor-pointer hover:border-muted-olive hover:bg-sage-green/5'
                        : 'opacity-60'
                    } transition-all duration-200`}
                  >
                    <Upload className="w-8 h-8 text-muted-olive mb-2" />
                    <span className="text-sm text-text-muted">
                      {isEditing ? 'Click to upload' : 'Not uploaded'}
                    </span>
                    {isEditing && (
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleDocumentUpload('panCard', e)}
                      />
                    )}
                  </label>
                )}
              </div>
            </div>

            <div className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> All documents should be clear, legible, and in PDF, JPG, or PNG
                format. Maximum file size: 5MB per document.
              </p>
            </div>
          </div>
        )}

        {/* Banking Details Tab */}
        {activeTab === 'banking' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-text-dark flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-olive" />
              Banking Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={vendorData.bankDetails.accountHolderName}
                  onChange={(e) =>
                    handleBankDetailsChange('accountHolderName', e.target.value)
                  }
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter account holder name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={vendorData.bankDetails.accountNumber}
                  onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={vendorData.bankDetails.bankName}
                  onChange={(e) => handleBankDetailsChange('bankName', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter bank name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  IFSC Code
                </label>
                <input
                  type="text"
                  value={vendorData.bankDetails.ifscCode}
                  onChange={(e) => handleBankDetailsChange('ifscCode', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter IFSC code"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={vendorData.bankDetails.branch}
                  onChange={(e) => handleBankDetailsChange('branch', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-60 transition-all duration-200"
                  placeholder="Enter branch name"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50/80 border border-blue-200/50 rounded-2xl">
              <p className="text-sm text-blue-800">
                <strong>Security:</strong> Your banking information is encrypted and securely stored.
                This information will be used for payment processing and payouts only.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorProfile;
