import React, { forwardRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '../../utils';

// Input variants for consistent styling
const inputVariants = cva(
  // Base classes - mobile-first with 44px minimum height
  'w-full rounded-2xl border-0 bg-earthy-beige/30 px-4 py-3 text-base text-text-dark placeholder:text-text-muted/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px] disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'focus:bg-white focus:shadow-lg focus:ring-bottle-green/40',

        // Outlined variant
        outlined:
          'bg-transparent border-2 border-gray-200 focus:border-bottle-green focus:bg-white focus:ring-bottle-green/20',

        // Glass effect variant
        glass:
          'bg-glass backdrop-blur-sm border border-white/20 focus:bg-white/10 focus:border-white/30 focus:ring-white/50',

        // Search variant
        search:
          'pl-10 focus:bg-white focus:shadow-lg focus:ring-bottle-green/40',

        // Floating label variant
        floating:
          'pt-6 pb-2 focus:bg-white focus:shadow-lg focus:ring-bottle-green/40',
      },
      size: {
        sm: 'h-10 px-3 text-sm min-h-[44px]', // Still meets touch target
        default: 'h-12 px-4 text-base min-h-[44px]',
        lg: 'h-14 px-6 text-lg min-h-[56px]',
      },
      state: {
        default: '',
        error:
          'border-2 border-tomato-red/30 bg-tomato-red/5 focus:border-tomato-red/50 focus:ring-tomato-red/10',
        success:
          'border-2 border-mint-fresh/50 bg-mint-fresh/5 focus:border-mint-fresh focus:ring-mint-fresh/20',
        warning:
          'border-2 border-earthy-yellow/50 bg-earthy-yellow/5 focus:border-earthy-yellow focus:ring-earthy-yellow/20',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  }
);

// Base Input component
const Input = forwardRef(
  (
    {
      className,
      type = 'text',
      variant,
      size,
      state,
      error,
      success,
      warning,
      disabled,
      leftIcon,
      rightIcon,
      clearable = false,
      onClear,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    // Determine validation state
    const validationState = error
      ? 'error'
      : success
        ? 'success'
        : warning
          ? 'warning'
          : state;

    // Handle password visibility toggle
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Handle clear input
    const handleClear = () => {
      setValue('');
      if (onClear) {
        onClear();
      }
    };

    // Handle input change
    const handleChange = (e) => {
      setValue(e.target.value);
      if (props.onChange) {
        props.onChange(e);
      }
    };

    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasValue = value && value.length > 0;
    const showClearButton = clearable && hasValue && !disabled;

    return (
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* Search Icon for search variant */}
        {variant === 'search' && !leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <Search className="w-5 h-5" />
          </div>
        )}

        <input
          type={inputType}
          className={cn(
            inputVariants({ variant, size, state: validationState }),
            leftIcon && 'pl-10',
            variant === 'search' && !leftIcon && 'pl-10',
            (showClearButton || rightIcon || isPassword) && 'pr-10',
            className
          )}
          ref={ref}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          {...props}
        />

        {/* Right Side Icons Container */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {/* Clear Button */}
          {showClearButton && (
            <button
              type="button"
              onClick={handleClear}
              className="text-text-muted hover:text-text-dark transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Password Toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-text-muted hover:text-text-dark transition-colors duration-200 p-1 hover:bg-gray-100 rounded-full min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Right Icon */}
          {rightIcon && !isPassword && !showClearButton && (
            <div className="text-text-muted pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

// Floating Label Input
const FloatingInput = forwardRef(({ label, className, id, ...props }, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  const handleFocus = (e) => {
    setFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setFocused(false);
    setHasValue(e.target.value.length > 0);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const shouldFloat = focused || hasValue;

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        variant="floating"
        className={className}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder=""
        {...props}
      />

      {label && (
        <label
          htmlFor={id}
          className={cn(
            'absolute left-4 text-text-muted transition-all duration-300 pointer-events-none',
            shouldFloat
              ? 'top-2 text-xs text-bottle-green scale-90 origin-left'
              : 'top-1/2 -translate-y-1/2 text-base'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';

// Textarea component
const Textarea = forwardRef(
  ({ className, rows = 4, resize = 'vertical', ...props }, ref) => {
    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <textarea
        className={cn(
          'w-full rounded-2xl border-0 bg-earthy-beige/30 px-4 py-3 text-base text-text-dark placeholder:text-text-muted/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[88px] focus:bg-white focus:shadow-lg focus:ring-bottle-green/40 disabled:cursor-not-allowed disabled:opacity-50',
          resizeClass,
          className
        )}
        rows={rows}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, FloatingInput, Textarea };
