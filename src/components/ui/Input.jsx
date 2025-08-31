import React, { forwardRef, useState } from 'react';
import { cva } from 'class-variance-authority';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { cn } from '../../utils';
import { useTheme } from '../../hooks/useTheme';

// Dynamic input variants with dark mode support
const getInputVariants = (isDarkMode) =>
  cva(
    // Base classes - mobile-first with 44px minimum height
    cn(
      'w-full rounded-2xl border-0 px-4 py-3 text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px] disabled:cursor-not-allowed disabled:opacity-50',
      isDarkMode
        ? 'bg-dark-olive-surface/50 text-dark-text-primary placeholder:text-dark-text-muted/70'
        : 'bg-earthy-beige/30 text-text-dark placeholder:text-text-muted/60'
    ),
    {
      variants: {
        variant: {
          default: isDarkMode
            ? 'focus:bg-dark-olive-surface focus:shadow-dark-depth-2 focus:ring-dark-sage-accent/50'
            : 'focus:bg-white focus:shadow-lg focus:ring-muted-olive/40',

          // Outlined variant with olive theme (dark mode optimized)
          outlined: isDarkMode
            ? 'bg-transparent border-2 border-dark-olive-border focus:border-dark-sage-accent focus:bg-dark-olive-surface/30 focus:ring-dark-sage-accent/30'
            : 'bg-transparent border-2 border-gray-200 focus:border-muted-olive focus:bg-white focus:ring-muted-olive/20',

          // Glass effect variant with olive theme (dark mode enhanced)
          glass: isDarkMode
            ? 'glass-2-dark border border-dark-olive-border/30 focus:glass-3-dark focus:border-dark-sage-accent/40 focus:ring-dark-sage-accent/20'
            : 'glass-2 border border-white/20 focus:glass-3 focus:border-muted-olive/30 focus:ring-muted-olive/20',

          // Glass Olive variant - olive-themed glass (dark mode enhanced)
          'glass-olive': isDarkMode
            ? 'glass-card-dark-olive border border-dark-sage-accent/20 focus:glass-3-dark focus:shadow-dark-glow-sage focus:ring-dark-sage-accent/20'
            : 'glass-card-olive border border-muted-olive/20 focus:glass-3 focus:shadow-glow-sage focus:ring-sage-green/20',

          // Search variant with olive theme (dark mode)
          search: isDarkMode
            ? 'pl-10 focus:bg-dark-olive-surface focus:shadow-dark-depth-2 focus:ring-dark-sage-accent/50'
            : 'pl-10 focus:bg-white focus:shadow-lg focus:ring-muted-olive/40',

          // Floating label variant with olive theme (dark mode)
          floating: isDarkMode
            ? 'pt-6 pb-2 focus:bg-dark-olive-surface focus:shadow-dark-depth-2 focus:ring-dark-sage-accent/50'
            : 'pt-6 pb-2 focus:bg-white focus:shadow-lg focus:ring-muted-olive/40',
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
            'border-2 border-success-dark/30 bg-success-light focus:border-muted-olive focus:ring-muted-olive/20',
          warning:
            'border-2 border-warning-dark/30 bg-warning-light focus:border-amber-warm focus:ring-amber-warm/20',
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
        state: 'default',
      },
    }
  );

// Base Input component with dark mode support
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
    const { isDarkMode } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [value, setValue] = useState(props.value || props.defaultValue || '');

    // Get theme-aware input variants
    const inputVariants = getInputVariants(isDarkMode);

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
          <div
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
              isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'
            )}
          >
            {leftIcon}
          </div>
        )}

        {/* Search Icon for search variant */}
        {variant === 'search' && !leftIcon && (
          <div
            className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
              isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'
            )}
          >
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
              className={cn(
                'transition-colors duration-200 p-1 rounded-full min-h-[32px] min-w-[32px] flex items-center justify-center',
                isDarkMode
                  ? 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-olive-border/30'
                  : 'text-text-muted hover:text-text-dark hover:bg-gray-100'
              )}
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
              className={cn(
                'transition-colors duration-200 p-1 rounded-full min-h-[32px] min-w-[32px] flex items-center justify-center',
                isDarkMode
                  ? 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-olive-border/30'
                  : 'text-text-muted hover:text-text-dark hover:bg-gray-100'
              )}
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
            <div
              className={cn(
                'pointer-events-none',
                isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'
              )}
            >
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
              ? 'top-2 text-xs text-muted-olive scale-90 origin-left'
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
          'w-full rounded-2xl border-0 bg-earthy-beige/30 px-4 py-3 text-base text-text-dark placeholder:text-text-muted/60 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[88px] focus:bg-white focus:shadow-lg focus:ring-muted-olive/40 disabled:cursor-not-allowed disabled:opacity-50',
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
