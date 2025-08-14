import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  Mail,
  Building2,
  ChevronDown,
  MapPin,
} from 'lucide-react';
import { useRegisterMutation } from '../../store/slices/apiSlice';
import { validateBangladeshPhone, formatPhoneForDisplay } from '../../utils';
import { addNotification } from '../../store/slices/notificationSlice';

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'restaurantOwner',
      businessName: '',
      // Structured address fields
      address: {
        street: '',
        city: '',
        area: '',
        postalCode: '',
      },
    },
    mode: 'onBlur',
  });

  const phoneValue = watch('phone');
  const selectedRole = watch('role');
  const passwordValue = watch('password');

  // Password strength calculation
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score === 0) return { score: 0, text: '', color: '' };
    if (score === 1)
      return { score: 1, text: 'Very Weak', color: 'text-tomato-red' };
    if (score === 2)
      return { score: 2, text: 'Weak', color: 'text-orange-500' };
    if (score === 3)
      return { score: 3, text: 'Fair', color: 'text-earthy-yellow' };
    if (score === 4)
      return { score: 4, text: 'Good', color: 'text-mint-fresh' };
    return { score: 5, text: 'Strong', color: 'text-bottle-green' };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  const roleOptions = [
    {
      value: 'vendor',
      label: 'Vendor',
      description: 'Sell fresh produce to restaurants',
    },
    {
      value: 'restaurantOwner',
      label: 'Restaurant Owner',
      description: 'Purchase fresh ingredients',
    },
  ];

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneForDisplay(value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      // Remove formatting for API call
      const cleanPhone = data.phone.replace(/\D/g, '');
      const phoneWithCountryCode = cleanPhone.startsWith('88')
        ? `+${cleanPhone}`
        : `+88${cleanPhone}`;

      const registerData = {
        name: data.name.trim(),
        phone: phoneWithCountryCode,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      };

      // Add business details for vendors and restaurant owners
      if (data.role === 'vendor' || data.role === 'restaurantOwner') {
        registerData.businessName = data.businessName.trim();
        registerData.address = {
          street: data.address.street.trim(),
          city: data.address.city.trim(),
          area: data.address.area.trim(),
          postalCode: data.address.postalCode.trim(),
        };
      }

      const result = await register(registerData).unwrap();

      if (result.success) {
        dispatch(
          addNotification({
            type: 'success',
            message: `Welcome to Aaroth Fresh, ${result.user.name}!`,
          })
        );

        // Navigate based on user role or approval status
        if (result.user.role === 'vendor' && !result.user.isApproved) {
          navigate('/vendor/pending-approval');
        } else {
          switch (result.user.role) {
            case 'vendor':
              navigate('/vendor/dashboard');
              break;
            case 'restaurantOwner':
              navigate('/restaurant/dashboard');
              break;
            default:
              navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message:
            error.data?.message || 'Registration failed. Please try again.',
        })
      );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 p-8 border border-white/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-medium text-text-dark/80 mb-4">
            Join Aaroth Fresh
          </h2>
          <p className="text-text-muted leading-relaxed">
            Create your account and start trading fresh produce
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Account Type
            </label>
            <div className="relative">
              <select
                id="role"
                className="w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 min-h-[44px] focus:outline-none appearance-none cursor-pointer pr-12"
                {...registerField('role', {
                  required: 'Please select an account type',
                })}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted/60 pointer-events-none" />
            </div>
            {errors.role && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.role.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div className="space-y-3">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                <User className="w-5 h-5" />
              </div>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.name
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...registerField('name', {
                  required: 'Full name is required',
                  validate: (value) => {
                    if (!value.trim()) return 'Full name is required';

                    if (value.trim().length < 2) {
                      return 'Name must be at least 2 characters';
                    }
                    if (value.length > 50) {
                      return 'Name must be less than 50 characters';
                    }
                    if (!/^[a-zA-Z\s.-]+$/.test(value.trim())) {
                      return 'Name can only contain letters, spaces, dots, and hyphens';
                    }
                    return true;
                  },
                })}
              />
            </div>
            {errors.name && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                <Phone className="w-5 h-5" />
              </div>
              <input
                id="phone"
                type="tel"
                placeholder="+880 1XXX XXXXXX"
                value={phoneValue}
                onChange={handlePhoneChange}
                className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.phone
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...registerField('phone', {
                  required: 'Phone number is required',
                  validate: (value) => {
                    if (!value.trim()) return 'Phone number is required';

                    const cleanPhone = value.replace(/\D/g, '');
                    if (cleanPhone.length < 11) {
                      return 'Phone number must be at least 11 digits';
                    }

                    const phoneWithCountryCode = cleanPhone.startsWith('88')
                      ? `+${cleanPhone}`
                      : `+88${cleanPhone}`;

                    const validation =
                      validateBangladeshPhone(phoneWithCountryCode);
                    return validation.isValid || validation.message;
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                <Mail className="w-5 h-5" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.email
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...registerField('email', {
                  required: 'Email address is required',
                  validate: (value) => {
                    if (!value.trim()) return 'Email address is required';

                    const emailPattern =
                      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                    if (!emailPattern.test(value)) {
                      return 'Please enter a valid email address';
                    }

                    if (value.length > 100) {
                      return 'Email address must be less than 100 characters';
                    }

                    return true;
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Business Information - Show for vendors and restaurant owners */}
          {(selectedRole === 'vendor' ||
            selectedRole === 'restaurantOwner') && (
            <>
              {/* Business Name */}
              <div className="space-y-3">
                <label
                  htmlFor="businessName"
                  className="block text-sm font-medium text-text-dark/80 tracking-wide"
                >
                  {selectedRole === 'vendor'
                    ? 'Business Name'
                    : 'Restaurant Name'}
                </label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <input
                    id="businessName"
                    type="text"
                    placeholder={`Enter your ${selectedRole === 'vendor' ? 'business' : 'restaurant'} name`}
                    className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                      errors.businessName
                        ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                        : ''
                    }`}
                    {...registerField('businessName', {
                      required: `${selectedRole === 'vendor' ? 'Business' : 'Restaurant'} name is required`,
                      validate: (value) => {
                        if (!value.trim()) {
                          return `${selectedRole === 'vendor' ? 'Business' : 'Restaurant'} name is required`;
                        }
                        if (value.trim().length < 2) {
                          return 'Name must be at least 2 characters';
                        }
                        if (value.length > 100) {
                          return 'Name must be less than 100 characters';
                        }
                        return true;
                      },
                    })}
                  />
                </div>
                {errors.businessName && (
                  <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                    <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                    {errors.businessName.message}
                  </p>
                )}
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-text-dark/80 tracking-wide border-b border-earthy-beige/50 pb-2">
                  {selectedRole === 'vendor'
                    ? 'Business Address'
                    : 'Restaurant Address'}
                </h3>

                {/* Street Address */}
                <div className="space-y-3">
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-text-dark/80 tracking-wide"
                  >
                    Street Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input
                      id="street"
                      type="text"
                      placeholder="Enter street address"
                      className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                        errors.address?.street
                          ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                          : ''
                      }`}
                      {...registerField('address.street', {
                        required: 'Street address is required',
                        minLength: {
                          value: 5,
                          message:
                            'Street address must be at least 5 characters',
                        },
                      })}
                    />
                  </div>
                  {errors.address?.street && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.address.street.message}
                    </p>
                  )}
                </div>

                {/* City and Area Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div className="space-y-3">
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-text-dark/80 tracking-wide"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Enter city"
                      className={`w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                        errors.address?.city
                          ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                          : ''
                      }`}
                      {...registerField('address.city', {
                        required: 'City is required',
                        minLength: {
                          value: 2,
                          message: 'City must be at least 2 characters',
                        },
                      })}
                    />
                    {errors.address?.city && (
                      <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                        <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                        {errors.address.city.message}
                      </p>
                    )}
                  </div>

                  {/* Area */}
                  <div className="space-y-3">
                    <label
                      htmlFor="area"
                      className="block text-sm font-medium text-text-dark/80 tracking-wide"
                    >
                      Area/District
                    </label>
                    <input
                      id="area"
                      type="text"
                      placeholder="Enter area/district"
                      className={`w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                        errors.address?.area
                          ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                          : ''
                      }`}
                      {...registerField('address.area', {
                        required: 'Area/District is required',
                        minLength: {
                          value: 2,
                          message: 'Area must be at least 2 characters',
                        },
                      })}
                    />
                    {errors.address?.area && (
                      <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                        <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                        {errors.address.area.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Postal Code */}
                <div className="space-y-3">
                  <label
                    htmlFor="postalCode"
                    className="block text-sm font-medium text-text-dark/80 tracking-wide"
                  >
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    placeholder="Enter postal code (e.g., 1000)"
                    className={`w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                      errors.address?.postalCode
                        ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                        : ''
                    }`}
                    {...registerField('address.postalCode', {
                      required: 'Postal code is required',
                      pattern: {
                        value: /^\d{4}$/,
                        message: 'Postal code must be 4 digits',
                      },
                    })}
                  />
                  {errors.address?.postalCode && (
                    <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                      <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                      {errors.address.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div className="space-y-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.password
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...registerField('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters',
                  },
                  validate: (value) => {
                    if (!/(?=.*[a-z])/.test(value)) {
                      return 'Password must contain at least one lowercase letter';
                    }
                    if (!/(?=.*[A-Z])/.test(value)) {
                      return 'Password must contain at least one uppercase letter';
                    }
                    if (!/(?=.*\d)/.test(value)) {
                      return 'Password must contain at least one number';
                    }
                    if (passwordStrength.score < 3) {
                      return 'Password strength is too weak. Please improve it.';
                    }
                    return true;
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted/60 hover:text-bottle-green transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            {passwordValue && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-text-muted">
                    Password Strength
                  </span>
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="w-full bg-earthy-beige/30 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      passwordStrength.score === 1
                        ? 'bg-tomato-red w-1/5'
                        : passwordStrength.score === 2
                          ? 'bg-orange-500 w-2/5'
                          : passwordStrength.score === 3
                            ? 'bg-earthy-yellow w-3/5'
                            : passwordStrength.score === 4
                              ? 'bg-mint-fresh w-4/5'
                              : passwordStrength.score === 5
                                ? 'bg-bottle-green w-full'
                                : 'w-0'
                    }`}
                  ></div>
                </div>
                <ul className="text-xs text-text-muted/80 space-y-1">
                  <li
                    className={`flex items-center gap-2 ${passwordValue.length >= 8 ? 'text-bottle-green' : ''}`}
                  >
                    <span>{passwordValue.length >= 8 ? '✓' : '○'}</span>
                    At least 8 characters
                  </li>
                  <li
                    className={`flex items-center gap-2 ${/[A-Z]/.test(passwordValue) ? 'text-bottle-green' : ''}`}
                  >
                    <span>{/[A-Z]/.test(passwordValue) ? '✓' : '○'}</span>
                    Uppercase letter
                  </li>
                  <li
                    className={`flex items-center gap-2 ${/[a-z]/.test(passwordValue) ? 'text-bottle-green' : ''}`}
                  >
                    <span>{/[a-z]/.test(passwordValue) ? '✓' : '○'}</span>
                    Lowercase letter
                  </li>
                  <li
                    className={`flex items-center gap-2 ${/\d/.test(passwordValue) ? 'text-bottle-green' : ''}`}
                  >
                    <span>{/\d/.test(passwordValue) ? '✓' : '○'}</span>
                    Number
                  </li>
                  <li
                    className={`flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) ? 'text-bottle-green' : ''}`}
                  >
                    <span>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue) ? '✓' : '○'}
                    </span>
                    Special character
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-3">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-text-dark/80 tracking-wide"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted/60">
                <Lock className="w-5 h-5" />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...registerField('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    const password = getValues('password');
                    return value === password || 'Passwords do not match';
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted/60 hover:text-bottle-green transition-colors duration-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                <span>Creating Account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
