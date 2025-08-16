import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
} from 'lucide-react';
import { useCreateAdminRestaurantOwnerMutation } from '../../store/slices/apiSlice';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CreateRestaurantOwner = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [createOwner, { isLoading, error }] =
    useCreateAdminRestaurantOwnerMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setError,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      restaurantName: '',
      ownerName: '',
      address: {
        street: '',
        city: '',
        area: '',
        postalCode: '',
      },
      tradeLicenseNo: '',
    },
  });

  // Watch password for strength indication
  const password = watch('password');

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
        value: /^\+[1-9]\d{1,14}$/,
        message:
          'Please enter a valid phone number with country code (e.g., +8801234567890)',
      },
    },
    password: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
      validate: (value) => {
        if (!/(?=.*[a-z])/.test(value))
          return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value))
          return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value))
          return 'Password must contain at least one number';
        return true;
      },
    },
    restaurantName: {
      required: 'Restaurant name is required',
      minLength: {
        value: 2,
        message: 'Restaurant name must be at least 2 characters',
      },
      maxLength: {
        value: 100,
        message: 'Restaurant name must be less than 100 characters',
      },
    },
    ownerName: {
      required: 'Owner name is required',
      minLength: {
        value: 2,
        message: 'Owner name must be at least 2 characters',
      },
    },
    'address.street': {
      required: 'Street address is required',
    },
    'address.city': {
      required: 'City is required',
    },
    'address.area': {
      required: 'Area is required',
    },
    'address.postalCode': {
      required: 'Postal code is required',
      pattern: {
        value: /^\d{4}$/,
        message: 'Please enter a valid 4-digit postal code',
      },
    },
    tradeLicenseNo: {
      required: 'Trade license number is required',
      minLength: {
        value: 4,
        message: 'Trade license must be at least 4 characters',
      },
    },
  };

  const onSubmit = async (data) => {
    try {
      const result = await createOwner(data).unwrap();

      // Success - show success state and reset form
      reset();

      // Navigate back to user management with success message
      navigate('/admin/users', {
        state: {
          success: `Restaurant owner "${data.restaurantName}" created successfully!`,
          newUserId: result.data?.id,
        },
      });
    } catch (err) {
      // Handle API errors
      console.error('Failed to create restaurant owner:', err);

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
    navigate('/admin/users');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
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
              Create Restaurant Owner
            </h1>
            <p className="text-text-muted">
              Add a new restaurant owner account with full restaurant management
              capabilities
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">
                Personal Information
              </h2>
              <p className="text-text-muted text-sm">
                Basic details for the restaurant owner account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-text-dark"
              >
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
              <label
                htmlFor="email"
                className="text-sm font-medium text-text-dark"
              >
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
              <label
                htmlFor="phone"
                className="text-sm font-medium text-text-dark"
              >
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
              <label
                htmlFor="password"
                className="text-sm font-medium text-text-dark"
              >
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-medium ${passwordStrength.color}`}
                    >
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

        {/* Restaurant Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">
                Restaurant Information
              </h2>
              <p className="text-text-muted text-sm">
                Details about the restaurant business
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Restaurant Name */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="restaurantName"
                className="text-sm font-medium text-text-dark"
              >
                Restaurant Name <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="restaurantName"
                  type="text"
                  {...register(
                    'restaurantName',
                    validationRules.restaurantName
                  )}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border transition-colors min-h-[44px] ${
                    errors.restaurantName
                      ? 'border-tomato-red/50 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : 'border-gray-200 focus:border-bottle-green/50 focus:ring-2 focus:ring-bottle-green/10'
                  }`}
                  placeholder="Enter restaurant name"
                />
              </div>
              {errors.restaurantName && (
                <p className="text-tomato-red/80 text-sm flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.restaurantName.message}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div className="space-y-2">
              <label
                htmlFor="ownerName"
                className="text-sm font-medium text-text-dark"
              >
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
              <label
                htmlFor="tradeLicenseNo"
                className="text-sm font-medium text-text-dark"
              >
                Trade License Number <span className="text-tomato-red">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  id="tradeLicenseNo"
                  type="text"
                  {...register(
                    'tradeLicenseNo',
                    validationRules.tradeLicenseNo
                  )}
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
          </div>
        </Card>

        {/* Address Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-mint-fresh to-bottle-green rounded-2xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">
                Address Information
              </h2>
              <p className="text-text-muted text-sm">
                Restaurant location details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Street Address */}
            <div className="space-y-2 md:col-span-2">
              <label
                htmlFor="address.street"
                className="text-sm font-medium text-text-dark"
              >
                Street Address <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.street"
                type="text"
                {...register(
                  'address.street',
                  validationRules['address.street']
                )}
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
              <label
                htmlFor="address.city"
                className="text-sm font-medium text-text-dark"
              >
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
              <label
                htmlFor="address.area"
                className="text-sm font-medium text-text-dark"
              >
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
            <div className="space-y-2 md:col-start-1">
              <label
                htmlFor="address.postalCode"
                className="text-sm font-medium text-text-dark"
              >
                Postal Code <span className="text-tomato-red">*</span>
              </label>
              <input
                id="address.postalCode"
                type="text"
                {...register(
                  'address.postalCode',
                  validationRules['address.postalCode']
                )}
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
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="p-4 bg-tomato-red/5 border-tomato-red/20">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-tomato-red flex-shrink-0" />
              <div>
                <p className="text-tomato-red font-medium">
                  Failed to create restaurant owner
                </p>
                <p className="text-tomato-red/80 text-sm">
                  {error?.data?.message ||
                    'Something went wrong. Please try again.'}
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
                  Create Restaurant Owner
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default CreateRestaurantOwner;
