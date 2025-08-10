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
} from 'lucide-react';
import { useRegisterMutation } from '../../store/slices/apiSlice';
import { validateBangladeshPhone, formatPhoneForDisplay } from '../../utils';
import { addNotification } from '../../store/slices/notificationSlice';
import { USER_ROLES } from '../../constants/models';

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
      businessAddress: '',
    },
    mode: 'onBlur',
  });

  const phoneValue = watch('phone');
  const selectedRole = watch('role');
  const passwordValue = watch('password');

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
    {
      value: 'restaurantManager',
      label: 'Restaurant Manager',
      description: 'Manage restaurant orders',
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

      // Add business details for vendors and restaurant roles
      if (
        data.role === 'vendor' ||
        data.role === 'restaurantOwner' ||
        data.role === 'restaurantManager'
      ) {
        registerData.businessName = data.businessName.trim();
        registerData.businessAddress = data.businessAddress.trim();
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
            case 'restaurantManager':
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
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must be less than 50 characters',
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
                    const cleanPhone = value.replace(/\D/g, '');
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
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
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

          {/* Business Information - Show for vendors and restaurant roles */}
          {(selectedRole === 'vendor' ||
            selectedRole === 'restaurantOwner' ||
            selectedRole === 'restaurantManager') && (
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
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
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

              {/* Business Address */}
              <div className="space-y-3">
                <label
                  htmlFor="businessAddress"
                  className="block text-sm font-medium text-text-dark/80 tracking-wide"
                >
                  {selectedRole === 'vendor'
                    ? 'Business Address'
                    : 'Restaurant Address'}
                </label>
                <textarea
                  id="businessAddress"
                  rows={3}
                  placeholder={`Enter your ${selectedRole === 'vendor' ? 'business' : 'restaurant'} address`}
                  className={`w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 resize-none focus:outline-none ${
                    errors.businessAddress
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('businessAddress', {
                    required: `${selectedRole === 'vendor' ? 'Business' : 'Restaurant'} address is required`,
                    minLength: {
                      value: 10,
                      message: 'Address must be at least 10 characters',
                    },
                  })}
                />
                {errors.businessAddress && (
                  <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                    <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                    {errors.businessAddress.message}
                  </p>
                )}
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
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message:
                      'Password must contain at least one uppercase letter, lowercase letter, and number',
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
