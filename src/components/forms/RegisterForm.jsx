import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useRegisterMutation, useGetPublicMarketsQuery } from '../../store/slices/apiSlice';
import { validateBangladeshPhone, formatPhoneForDisplay } from '../../utils';
import { addNotification } from '../../store/slices/notificationSlice';
import BDAddressForm from '../address/BDAddressForm';

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const { data: marketsData } = useGetPublicMarketsQuery({
    status: 'active',
    limit: 100,
  });

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm({
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'buyerOwner',
      businessName: '',
      buyerType: 'restaurant',
      tradeLicenseNo: '',
      address: {
        division: '',
        district: '',
        upazila: '',
        union: '',
        street: '',
        landmark: '',
        postalCode: '',
      },
    },
    mode: 'onBlur',
  });

  const phoneValue = watch('phone');
  const selectedRole = watch('role');
  const passwordValue = watch('password');

  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    if (score === 0) return { score: 0, text: '', color: '' };
    if (score === 1) return { score: 1, text: 'Very Weak', color: 'text-tomato-red dark:text-red-400' };
    if (score === 2) return { score: 2, text: 'Weak', color: 'text-orange-500 dark:text-orange-400' };
    if (score === 3) return { score: 3, text: 'Fair', color: 'text-earthy-yellow dark:text-yellow-400' };
    if (score === 4) return { score: 4, text: 'Good', color: 'text-sage-green dark:text-green-400' };
    return { score: 5, text: 'Strong', color: 'text-muted-olive dark:text-dark-sage-accent' };
  };

  const passwordStrength = getPasswordStrength(passwordValue);

  const roleOptions = [
    { value: 'vendor', label: 'Vendor', description: 'Sell fresh produce to buyers' },
    { value: 'buyerOwner', label: 'Buyer Owner', description: 'Purchase fresh ingredients' },
  ];

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneForDisplay(value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  const handleMarketToggle = (marketId) => {
    setSelectedMarkets((prev) =>
      prev.includes(marketId) ? prev.filter((id) => id !== marketId) : [...prev, marketId]
    );
  };

  const availableMarkets = marketsData?.data || [];

  // Step definitions
  const totalSteps = selectedRole === 'vendor' || selectedRole === 'buyerOwner' ? 4 : 2;

  const getStepFields = (step) => {
    switch (step) {
      case 1:
        return ['role', 'name', 'phone', 'email'];
      case 2:
        return selectedRole === 'vendor' || selectedRole === 'buyerOwner'
          ? ['businessName', 'buyerType', 'tradeLicenseNo']
          : [];
      case 3:
        return selectedRole === 'vendor' || selectedRole === 'buyerOwner'
          ? ['address.street', 'address.city', 'address.area', 'address.postalCode']
          : [];
      case 4:
        return ['password', 'confirmPassword'];
      default:
        return [];
    }
  };

  const handleNextStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger(fields);

    // Vendor market validation
    if (currentStep === 2 && selectedRole === 'vendor' && selectedMarkets.length === 0) {
      dispatch(
        addNotification({
          type: 'error',
          message: 'Please select at least one market',
        })
      );
      return;
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data) => {
    try {
      const cleanPhone = data.phone.replace(/\D/g, '');
      const phoneWithCountryCode = cleanPhone.startsWith('88') ? `+${cleanPhone}` : `+88${cleanPhone}`;

      const registerData = {
        name: data.name.trim(),
        phone: phoneWithCountryCode,
        email: data.email.trim().toLowerCase(),
        password: data.password,
        role: data.role,
      };

      if (data.role === 'vendor' || data.role === 'buyerOwner') {
        registerData.address = {
          division: data.address.division,
          district: data.address.district,
          upazila: data.address.upazila,
          union: data.address.union || undefined, // Optional
          street: data.address.street.trim(),
          landmark: data.address.landmark?.trim() || undefined, // Optional
          postalCode: data.address.postalCode.trim(),
        };
        registerData.tradeLicenseNo = data.tradeLicenseNo.trim();

        if (data.role === 'vendor') {
          registerData.businessName = data.businessName.trim();
          if (selectedMarkets.length === 0) {
            dispatch(addNotification({ type: 'error', message: 'Please select at least one market' }));
            return;
          }
          registerData.markets = selectedMarkets;
        } else if (data.role === 'buyerOwner') {
          registerData.businessName = data.businessName.trim();
          registerData.buyerType = data.buyerType;
        }
      }

      const result = await register(registerData).unwrap();

      if (result.success) {
        dispatch(
          addNotification({
            type: 'success',
            message: `Welcome to Aaroth Fresh, ${result.user.name}!`,
          })
        );

        if (result.user.role === 'vendor' && !result.user.isApproved) {
          navigate('/vendor/pending-approval');
        } else {
          switch (result.user.role) {
            case 'vendor':
              navigate('/vendor/dashboard');
              break;
            case 'buyerOwner':
              navigate('/buyer/dashboard');
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
          message: error.data?.message || 'Registration failed. Please try again.',
        })
      );
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <React.Fragment key={stepNum}>
                <div
                  className={`relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full font-semibold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-secondary text-white shadow-depth-2'
                      : isActive
                        ? 'bg-gradient-secondary text-white shadow-glow-green dark:shadow-dark-glow-olive scale-110'
                        : 'bg-white/60 dark:bg-dark-glass-olive/50 text-text-muted dark:text-dark-text-muted border-2 border-sage-green/20 dark:border-dark-sage-accent/30'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <span className="text-xs sm:text-sm">{stepNum}</span>
                  )}
                </div>
                {stepNum < totalSteps && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 md:w-16 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-gradient-secondary'
                        : 'bg-sage-green/20 dark:bg-dark-sage-accent/20'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-text-dark/70 dark:text-dark-text-primary/80 font-medium transition-colors duration-300">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-bottle-green dark:text-dark-sage-accent mb-4 sm:mb-6 transition-colors duration-300">
              Account Information
            </h3>

            {/* Role Selection */}
            <div className="space-y-3">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Account Type
              </label>
              <div className="relative">
                <select
                  id="role"
                  className="w-full px-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 min-h-[44px] focus:outline-none appearance-none cursor-pointer pr-12 text-text-dark dark:text-dark-text-primary"
                  {...registerField('role', { required: 'Please select an account type' })}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted/70 pointer-events-none transition-colors duration-300" />
              </div>
              {errors.role && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Full Name */}
            <div className="space-y-3">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <User className="w-5 h-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.name
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('name', {
                    required: 'Full name is required',
                    validate: (value) => {
                      if (!value.trim()) return 'Full name is required';
                      if (value.trim().length < 2) return 'Name must be at least 2 characters';
                      if (value.length > 50) return 'Name must be less than 50 characters';
                      if (!/^[a-zA-Z\s.-]+$/.test(value.trim()))
                        return 'Name can only contain letters, spaces, dots, and hyphens';
                      return true;
                    },
                  })}
                />
              </div>
              {errors.name && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-3">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+880 1XXX XXXXXX"
                  value={phoneValue}
                  onChange={handlePhoneChange}
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.phone
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('phone', {
                    required: 'Phone number is required',
                    validate: (value) => {
                      if (!value.trim()) return 'Phone number is required';
                      const cleanPhone = value.replace(/\D/g, '');
                      if (cleanPhone.length < 11) return 'Phone number must be at least 11 digits';
                      const phoneWithCountryCode = cleanPhone.startsWith('88')
                        ? `+${cleanPhone}`
                        : `+88${cleanPhone}`;
                      const validation = validateBangladeshPhone(phoneWithCountryCode);
                      return validation.isValid || validation.message;
                    },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.email
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('email', {
                    required: 'Email address is required',
                    validate: (value) => {
                      if (!value.trim()) return 'Email address is required';
                      const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                      if (!emailPattern.test(value)) return 'Please enter a valid email address';
                      if (value.length > 100) return 'Email address must be less than 100 characters';
                      return true;
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Business Information */}
        {currentStep === 2 && (selectedRole === 'vendor' || selectedRole === 'buyerOwner') && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-bottle-green dark:text-dark-sage-accent mb-4 sm:mb-6 transition-colors duration-300">
              Business Details
            </h3>

            {/* Business Name */}
            <div className="space-y-3">
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                {selectedRole === 'vendor' ? 'Business Name' : 'Buyer Name'}
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  id="businessName"
                  type="text"
                  placeholder={`Enter your ${selectedRole === 'vendor' ? 'business' : 'buyer'} name`}
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.businessName
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('businessName', {
                    required: `${selectedRole === 'vendor' ? 'Business' : 'Buyer'} name is required`,
                    validate: (value) => {
                      if (!value.trim()) return `${selectedRole === 'vendor' ? 'Business' : 'Buyer'} name is required`;
                      if (value.trim().length < 2) return 'Name must be at least 2 characters';
                      if (value.length > 100) return 'Name must be less than 100 characters';
                      return true;
                    },
                  })}
                />
              </div>
              {errors.businessName && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Buyer Type - Buyers only */}
            {selectedRole === 'buyerOwner' && (
              <div className="space-y-3">
                <label
                  htmlFor="buyerType"
                  className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
                >
                  Business Type
                </label>
                <div className="relative">
                  <select
                    id="buyerType"
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 min-h-[44px] focus:outline-none appearance-none cursor-pointer pr-12 text-text-dark dark:text-dark-text-primary"
                    {...registerField('buyerType', {
                      required: selectedRole === 'buyerOwner' ? 'Please select a business type' : false,
                    })}
                  >
                    <option value="restaurant">Restaurant</option>
                    <option value="corporate">Corporate Company</option>
                    <option value="supershop">Supershop</option>
                    <option value="catering">Catering Service</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted/70 pointer-events-none transition-colors duration-300" />
                </div>
                {errors.buyerType && (
                  <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                    <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                    {errors.buyerType.message}
                  </p>
                )}
              </div>
            )}

            {/* Market Selection - Vendors only */}
            {selectedRole === 'vendor' && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300">
                  Operating Markets *
                </label>
                <p className="text-text-muted dark:text-dark-text-muted/70 text-xs mb-3 transition-colors duration-300">
                  Select the markets where you operate (minimum 1 required)
                </p>

                {availableMarkets.length === 0 ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      No active markets available. Please contact support.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 sm:max-h-56 md:max-h-64 lg:max-h-[280px] overflow-y-auto border border-gray-200 dark:border-dark-sage-accent/30 rounded-2xl p-3 sm:p-4 bg-white/50 dark:bg-dark-glass-olive/30 backdrop-blur-sm">
                    {availableMarkets.map((market) => (
                      <label
                        key={market._id}
                        className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border border-gray-200 dark:border-dark-sage-accent/20 rounded-xl cursor-pointer hover:bg-mint-fresh/5 dark:hover:bg-dark-sage-accent/10 transition-colors min-h-[44px]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMarkets.includes(market._id)}
                          onChange={() => handleMarketToggle(market._id)}
                          className="w-5 h-5 rounded border-gray-300 dark:border-dark-sage-accent/40 text-bottle-green dark:text-dark-sage-accent focus:ring-bottle-green dark:focus:ring-dark-sage-accent touch-target"
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

                {selectedMarkets.length === 0 && (
                  <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    Please select at least one market
                  </p>
                )}

                {selectedMarkets.length > 0 && (
                  <p className="text-mint-fresh dark:text-green-400 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {selectedMarkets.length} market(s) selected
                  </p>
                )}
              </div>
            )}

            {/* Trade License */}
            <div className="space-y-3">
              <label
                htmlFor="tradeLicenseNo"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Trade License Number
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  id="tradeLicenseNo"
                  type="text"
                  placeholder="Enter trade license number"
                  className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.tradeLicenseNo
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('tradeLicenseNo', {
                    required: 'Trade license number is required',
                    validate: (value) => {
                      if (!value.trim()) return 'Trade license number is required';
                      if (value.trim().length < 3) return 'Trade license number must be at least 3 characters';
                      if (value.length > 30) return 'Trade license number must be less than 30 characters';
                      if (!/^[A-Za-z0-9\/\-_]+$/.test(value.trim()))
                        return 'Trade license number can only contain letters, numbers, hyphens, slashes, and underscores';
                      return true;
                    },
                  })}
                />
              </div>
              {errors.tradeLicenseNo && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.tradeLicenseNo.message}
                </p>
              )}
              <p className="text-text-muted dark:text-dark-text-muted/70 text-xs mt-1 transition-colors duration-300">
                Required for business verification and compliance
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Address Information */}
        {currentStep === 3 && (selectedRole === 'vendor' || selectedRole === 'buyerOwner') && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-bottle-green dark:text-dark-sage-accent mb-4 sm:mb-6 transition-colors duration-300">
              {selectedRole === 'vendor' ? 'Business Address' : 'Buyer Address'}
            </h3>

            {/* Bangladesh Address Form with Cascading Dropdowns */}
            <BDAddressForm
              control={control}
              errors={errors}
              setValue={setValue}
              watch={watch}
              name="address"
              required={true}
              includeUnion={true}
              includeLandmark={true}
              language="en"
              showLanguageToggle={false}
            />
          </div>
        )}

        {/* Step 4: Password (or Step 2 for non-business users) */}
        {((currentStep === 4 && (selectedRole === 'vendor' || selectedRole === 'buyerOwner')) ||
          (currentStep === 2 && selectedRole !== 'vendor' && selectedRole !== 'buyerOwner')) && (
          <div className="space-y-5 sm:space-y-6 animate-fade-in">
            <h3 className="text-lg sm:text-xl font-semibold text-bottle-green dark:text-dark-sage-accent mb-4 sm:mb-6 transition-colors duration-300">
              Security
            </h3>

            {/* Password */}
            <div className="space-y-3">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.password
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                      : ''
                  }`}
                  {...registerField('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                    validate: (value) => {
                      if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
                      if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
                      if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
                      if (passwordStrength.score < 3) return 'Password strength is too weak. Please improve it.';
                      return true;
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.password.message}
                </p>
              )}

              {/* Password Strength */}
              {passwordValue && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted">Password Strength</span>
                    <span className={`text-xs sm:text-sm font-medium ${passwordStrength.color}`}>{passwordStrength.text}</span>
                  </div>
                  <div className="w-full bg-earthy-beige/30 dark:bg-dark-glass-olive/30 rounded-full h-2 sm:h-2.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordStrength.score === 1
                          ? 'bg-tomato-red dark:bg-red-400 w-1/5'
                          : passwordStrength.score === 2
                            ? 'bg-orange-500 dark:bg-orange-400 w-2/5'
                            : passwordStrength.score === 3
                              ? 'bg-earthy-yellow dark:bg-yellow-400 w-3/5'
                              : passwordStrength.score === 4
                                ? 'bg-sage-green dark:bg-green-400 w-4/5'
                                : passwordStrength.score === 5
                                  ? 'bg-muted-olive dark:bg-dark-sage-accent w-full'
                                  : 'w-0'
                      }`}
                    />
                  </div>
                  <ul className="text-xs sm:text-sm text-text-muted dark:text-dark-text-muted/80 space-y-1.5 sm:space-y-2">
                    <li className={`flex items-center gap-2 min-h-[32px] sm:min-h-[24px] ${passwordValue.length >= 8 ? 'text-muted-olive dark:text-dark-sage-accent' : ''}`}>
                      <span className="text-sm sm:text-base">{passwordValue.length >= 8 ? '✓' : '○'}</span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 min-h-[32px] sm:min-h-[24px] ${/[A-Z]/.test(passwordValue) ? 'text-muted-olive dark:text-dark-sage-accent' : ''}`}>
                      <span className="text-sm sm:text-base">{/[A-Z]/.test(passwordValue) ? '✓' : '○'}</span>
                      Uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 min-h-[32px] sm:min-h-[24px] ${/[a-z]/.test(passwordValue) ? 'text-muted-olive dark:text-dark-sage-accent' : ''}`}>
                      <span className="text-sm sm:text-base">{/[a-z]/.test(passwordValue) ? '✓' : '○'}</span>
                      Lowercase letter
                    </li>
                    <li className={`flex items-center gap-2 min-h-[32px] sm:min-h-[24px] ${/\d/.test(passwordValue) ? 'text-muted-olive dark:text-dark-sage-accent' : ''}`}>
                      <span className="text-sm sm:text-base">{/\d/.test(passwordValue) ? '✓' : '○'}</span>
                      Number
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-3">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-dark dark:text-dark-text-primary tracking-wide transition-colors duration-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 transition-colors duration-300">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive backdrop-blur-sm transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none ${
                    errors.confirmPassword
                      ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
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
                  className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                  <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 sm:pt-6 gap-3 sm:gap-4">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-2 border-sage-green/20 dark:border-dark-sage-accent/30 text-text-dark dark:text-dark-text-primary font-medium hover:bg-white dark:hover:bg-dark-glass-sage/60 hover:border-sage-green/30 dark:hover:border-dark-sage-accent/40 transition-all duration-300 min-h-[44px] backdrop-blur-sm text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex items-center gap-1.5 sm:gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-secondary text-white font-semibold hover:shadow-depth-3 hover:shadow-glow-green dark:hover:shadow-dark-glow-olive hover:scale-105 active:scale-100 transition-all duration-300 min-h-[44px] ml-auto text-sm sm:text-base"
            >
              Next
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-secondary text-white font-semibold hover:shadow-depth-3 hover:shadow-glow-green dark:hover:shadow-dark-glow-olive hover:scale-105 active:scale-100 transition-all duration-300 min-h-[44px] ml-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white" />
                  <span className="hidden xs:inline">Creating Account...</span>
                  <span className="xs:hidden">Creating...</span>
                </div>
              ) : (
                <>
                  <span className="hidden xs:inline">Create Account</span>
                  <span className="xs:hidden">Create</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
