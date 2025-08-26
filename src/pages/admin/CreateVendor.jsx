import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  Lock,
  Building2,
  MapPin,
  FileText,
  ArrowLeft,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Truck,
  Clock,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useCreateAdminVendorMutation } from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CreateVendor = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [createVendor, { isLoading, error }] = useCreateAdminVendorMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
    setError,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      // User account fields
      name: '',
      email: '',
      phone: '',
      password: '',
      
      // Vendor business fields
      businessName: '',
      ownerName: '',
      tradeLicenseNo: '',
      specialties: [],
      
      // Address fields
      'address.street': '',
      'address.city': '',
      'address.area': '',
      'address.postalCode': '',
      
      // Business license
      'businessLicense.number': '',
      'businessLicense.expiryDate': '',
      
      // Bank details
      'bankDetails.accountName': '',
      'bankDetails.accountNumber': '',
      'bankDetails.routingNumber': '',
      'bankDetails.bankName': '',
      
      // Operational settings
      deliveryRadius: 10,
      minimumOrderValue: 0,
      
      // Operating hours (simplified for now)
      operatingHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: true },
      },
    },
  });

  // Watch password for strength indication
  const password = watch('password');
  const specialtiesWatch = watch('specialties');

  // Password strength validation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const strength = {
      0: { text: 'Very Weak', color: 'text-tomato-red' },
      1: { text: 'Weak', color: 'text-orange-500' },
      2: { text: 'Fair', color: 'text-earthy-yellow' },
      3: { text: 'Good', color: 'text-blue-500' },
      4: { text: 'Strong', color: 'text-bottle-green' },
      5: { text: 'Very Strong', color: 'text-mint-fresh' },
    };

    return { score, ...strength[Math.min(score, 5)] };
  };

  const passwordStrength = getPasswordStrength(password);

  // Specialty options
  const specialtyOptions = [
    'Fresh Vegetables',
    'Organic Produce',
    'Fruits',
    'Herbs & Spices',
    'Dairy Products',
    'Meat & Poultry',
    'Seafood',
    'Grains & Cereals',
    'Local Farm Produce',
    'Imported Goods'
  ];

  // Form validation rules
  const validationRules = {
    name: {
      required: 'Full name is required',
      minLength: { value: 2, message: 'Name must be at least 2 characters' },
      maxLength: { value: 50, message: 'Name must be less than 50 characters' },
    },
    email: {
      required: 'Email is required',
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: 'Please enter a valid email address',
      },
    },
    phone: {
      required: 'Phone number is required',
      pattern: {
        value: /^\+880\d{10}$|^\+\d{1,3}\d{10}$/,
        message: 'Please enter a valid phone number with country code (e.g., +8801234567890)',
      },
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 6,
        message: 'Password must be at least 6 characters',
      },
    },
    businessName: {
      required: 'Business name is required',
      minLength: { value: 2, message: 'Business name must be at least 2 characters' },
      maxLength: { value: 100, message: 'Business name must be less than 100 characters' },
    },
    ownerName: {
      required: 'Owner name is required',
      minLength: { value: 2, message: 'Owner name must be at least 2 characters' },
      maxLength: { value: 50, message: 'Owner name must be less than 50 characters' },
    },
    tradeLicenseNo: {
      required: 'Trade license number is required',
      minLength: { value: 4, message: 'Trade license must be at least 4 characters' },
      maxLength: { value: 30, message: 'Trade license cannot exceed 30 characters' },
    },
    'address.street': { required: 'Street address is required' },
    'address.city': { required: 'City is required' },
    'address.area': { required: 'Area is required' },
    'address.postalCode': {
      required: 'Postal code is required',
      pattern: { value: /^\d{4}$/, message: 'Please enter a valid 4-digit postal code' },
    },
    deliveryRadius: {
      required: 'Delivery radius is required',
      min: { value: 1, message: 'Delivery radius must be at least 1 km' },
      max: { value: 100, message: 'Delivery radius cannot exceed 100 km' },
    },
    minimumOrderValue: {
      required: 'Minimum order value is required',
      min: { value: 0, message: 'Minimum order value cannot be negative' },
    },
  };

  const onSubmit = async (data) => {
    try {
      // Transform the form data to match backend schema
      const vendorData = {
        // User account data
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'vendor',

        // Vendor business data
        businessName: data.businessName,
        ownerName: data.ownerName,
        tradeLicenseNo: data.tradeLicenseNo,
        specialties: data.specialties,

        // Address structure
        address: {
          street: data.address.street,
          city: data.address.city,
          area: data.address.area,
          postalCode: data.address.postalCode,
        },

        // Business license
        businessLicense: data.businessLicense.number
          ? {
              number: data.businessLicense.number,
              expiryDate: data.businessLicense.expiryDate,
            }
          : undefined,

        // Bank details
        bankDetails: data.bankDetails.accountName
          ? {
              accountName: data.bankDetails.accountName,
              accountNumber: data.bankDetails.accountNumber,
              routingNumber: data.bankDetails.routingNumber,
              bankName: data.bankDetails.bankName,
            }
          : undefined,

        // Operational settings
        deliveryRadius: parseInt(data.deliveryRadius, 10),
        minimumOrderValue: parseInt(data.minimumOrderValue, 10),
        
        // Operating hours
        operatingHours: data.operatingHours,

        // Default values
        verificationStatus: 'pending',
        isActive: true,
      };

      const result = await createVendor(vendorData).unwrap();

      // Success - reset form and navigate
      reset();
      navigate('/admin/vendor-management', {
        state: {
          success: `Vendor "${data.businessName}" created successfully and is pending verification!`,
          newVendorId: result.data?.id || result.data?._id,
        },
      });
    } catch (err) {
      console.error('Failed to create vendor:', err);

      // Handle specific validation errors from backend
      if (err.data?.errors) {
        Object.keys(err.data.errors).forEach((field) => {
          setError(field, {
            type: 'server',
            message: err.data.errors[field],
          });
        });
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/vendor-management');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={handleCancel}
            className="w-10 h-10 rounded-2xl bg-white border border-gray-200 flex items-center justify-center hover:border-bottle-green/30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-text-dark mb-2">
              Create New Vendor
            </h1>
            <p className="text-text-muted">
              Add a new vendor business to the platform with comprehensive business information
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Account Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">Account Information</h2>
              <p className="text-text-muted text-sm">Login credentials and contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-text-dark">
                Full Name <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="name"
                  type="text"
                  {...register('name', validationRules.name)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.name
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter full name"
                />
              </div>
              {errors.name && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-text-dark">
                Email Address <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="email"
                  type="email"
                  {...register('email', validationRules.email)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.email
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-text-dark">
                Phone Number <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', validationRules.phone)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.phone
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="+8801234567890"
                />
              </div>
              {errors.phone && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-text-dark">
                Password <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', validationRules.password)}
                  className={`w-full pl-10 pr-12 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.password
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted hover:text-text-dark transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score <= 1
                            ? 'bg-tomato-red'
                            : passwordStrength.score <= 2
                              ? 'bg-orange-500'
                              : passwordStrength.score <= 3
                                ? 'bg-earthy-yellow'
                                : passwordStrength.score <= 4
                                  ? 'bg-blue-500'
                                  : 'bg-bottle-green'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${passwordStrength.color}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Business Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">Business Information</h2>
              <p className="text-text-muted text-sm">Business details and licensing information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="businessName" className="text-sm font-medium text-text-dark">
                Business Name <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="businessName"
                  type="text"
                  {...register('businessName', validationRules.businessName)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.businessName
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter business name"
                />
              </div>
              {errors.businessName && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label htmlFor="ownerName" className="text-sm font-medium text-text-dark">
                Owner Name <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="ownerName"
                  type="text"
                  {...register('ownerName', validationRules.ownerName)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.ownerName
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter owner name"
                />
              </div>
              {errors.ownerName && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.ownerName.message}
                </p>
              )}
            </div>

            {/* Trade License */}
            <div className="space-y-2">
              <label htmlFor="tradeLicenseNo" className="text-sm font-medium text-text-dark">
                Trade License Number <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="tradeLicenseNo"
                  type="text"
                  {...register('tradeLicenseNo', validationRules.tradeLicenseNo)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.tradeLicenseNo
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter trade license number"
                />
              </div>
              {errors.tradeLicenseNo && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.tradeLicenseNo.message}
                </p>
              )}
            </div>

            {/* Specialties */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-text-dark">
                Specialties
              </label>
              <div className="flex flex-wrap gap-2">
                {specialtyOptions.map((specialty) => (
                  <label
                    key={specialty}
                    className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      value={specialty}
                      {...register('specialties')}
                      className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green/20"
                    />
                    <span className="text-sm">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-mint-fresh to-bottle-green rounded-2xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">Address & Location</h2>
              <p className="text-text-muted text-sm">Business address and delivery settings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Street Address */}
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="address.street" className="text-sm font-medium text-text-dark">
                Street Address <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.street"
                type="text"
                {...register('address.street', validationRules['address.street'])}
                className={`w-full px-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                  errors.address?.street
                    ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                }`}
                placeholder="Enter street address"
              />
              {errors.address?.street && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.street.message}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <label htmlFor="address.city" className="text-sm font-medium text-text-dark">
                City <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.city"
                type="text"
                {...register('address.city', validationRules['address.city'])}
                className={`w-full px-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                  errors.address?.city
                    ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                }`}
                placeholder="Enter city"
              />
              {errors.address?.city && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.city.message}
                </p>
              )}
            </div>

            {/* Area */}
            <div className="space-y-2">
              <label htmlFor="address.area" className="text-sm font-medium text-text-dark">
                Area <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.area"
                type="text"
                {...register('address.area', validationRules['address.area'])}
                className={`w-full px-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                  errors.address?.area
                    ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                }`}
                placeholder="Enter area"
              />
              {errors.address?.area && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.area.message}
                </p>
              )}
            </div>

            {/* Postal Code */}
            <div className="space-y-2">
              <label htmlFor="address.postalCode" className="text-sm font-medium text-text-dark">
                Postal Code <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.postalCode"
                type="text"
                {...register('address.postalCode', validationRules['address.postalCode'])}
                className={`w-full px-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                  errors.address?.postalCode
                    ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                }`}
                placeholder="1234"
              />
              {errors.address?.postalCode && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.address.postalCode.message}
                </p>
              )}
            </div>

            {/* Delivery Radius */}
            <div className="space-y-2">
              <label htmlFor="deliveryRadius" className="text-sm font-medium text-text-dark">
                Delivery Radius (km) <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="deliveryRadius"
                  type="number"
                  {...register('deliveryRadius', validationRules.deliveryRadius)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.deliveryRadius
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="10"
                />
              </div>
              {errors.deliveryRadius && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.deliveryRadius.message}
                </p>
              )}
            </div>

            {/* Minimum Order Value */}
            <div className="space-y-2">
              <label htmlFor="minimumOrderValue" className="text-sm font-medium text-text-dark">
                Minimum Order Value (BDT) <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="minimumOrderValue"
                  type="number"
                  {...register('minimumOrderValue', validationRules.minimumOrderValue)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.minimumOrderValue
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.minimumOrderValue && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.minimumOrderValue.message}
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-tomato-red/5 border-tomato-red/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-tomato-red flex-shrink-0" />
              <div>
                <p className="text-tomato-red font-medium">Failed to create vendor</p>
                <p className="text-tomato-red/80 text-sm">
                  {error?.data?.message || 'Something went wrong. Please try again.'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Form Actions */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="min-w-[120px] min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="min-w-[160px] min-h-[44px] bg-gradient-secondary hover:shadow-lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Vendor
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateVendor;