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
          case 'restaurantOwner':
          case 'restaurantManager':
            navigate('/restaurant/dashboard');
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 p-8 border border-white/50">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Phone Number Field */}
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
              <p className="text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in">
                <span className="w-4 h-4 text-tomato-red/60">⚠</span>
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password Field */}
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
                placeholder="Enter your password"
                className={`w-full pl-14 pr-14 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none ${
                  errors.password
                    ? 'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-2 focus:ring-tomato-red/10'
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
                className="absolute right-6 top-1/2 transform -translate-y-1/2 text-text-muted/60 hover:text-muted-olive transition-colors duration-200"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-text-muted">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-muted-olive hover:text-muted-olive/80 font-medium transition-colors duration-200 focus:outline-none focus:underline"
            >
              Sign up here
            </Link>
          </p>
          <Link
            to="/forgot-password"
            className="block text-text-muted/80 hover:text-muted-olive text-sm transition-colors duration-200 focus:outline-none focus:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
