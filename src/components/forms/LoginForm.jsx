import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock } from 'lucide-react';
import { useLoginMutation } from '../../store/slices/apiSlice';
import { validateBangladeshPhone, formatPhoneForDisplay } from '../../utils';
import { addNotification } from '../../store/slices/notificationSlice';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      phone: '',
      password: '',
    },
    mode: 'onBlur',
  });

  const phoneValue = watch('phone');

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

      const result = await login({
        phone: phoneWithCountryCode,
        password: data.password,
      }).unwrap();

      if (result.success) {
        dispatch(
          addNotification({
            type: 'success',
            message: `Welcome back, ${result.user.name}!`,
          })
        );

        // Navigate based on user role
        switch (result.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'vendor':
            navigate('/vendor/dashboard');
            break;
          case 'buyerOwner':
          case 'buyerManager':
            navigate('/buyer/dashboard');
            break;
          default:
            navigate('/dashboard');
        }
      }
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          message: error.data?.message || 'Login failed. Please try again.',
        })
      );
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 sm:space-y-6">
          {/* Phone Number Field */}
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
                className={`w-full pl-14 pr-6 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none backdrop-blur-sm ${
                  errors.phone
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...register('phone', {
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
              <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password Field */}
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
                placeholder="Enter your password"
                className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-white/60 dark:bg-dark-glass-olive/50 border-0 focus:bg-white dark:focus:bg-dark-glass-sage/60 focus:shadow-lg focus:shadow-glow-green dark:focus:shadow-dark-glow-olive transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-dark-text-muted/50 text-text-dark dark:text-dark-text-primary min-h-[44px] focus:outline-none backdrop-blur-sm ${
                  errors.password
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 dark:bg-tomato-red/10 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
                    : ''
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted dark:text-dark-text-muted/70 hover:text-muted-olive dark:hover:text-dark-sage-accent transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-tomato-red dark:text-red-400 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60 dark:text-red-400/60">⚠</span>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-secondary text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold transition-all duration-300 hover:shadow-depth-3 hover:shadow-glow-green dark:hover:shadow-dark-glow-olive hover:scale-105 active:scale-100 min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 dark:focus:ring-dark-sage-accent/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 text-sm sm:text-base"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center pt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-text-dark/60 dark:text-dark-text-primary/70 hover:text-bottle-green dark:hover:text-dark-sage-accent transition-colors duration-200 focus:outline-none focus:underline inline-block min-h-[44px] leading-[44px]"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
  );
};

export default LoginForm;
