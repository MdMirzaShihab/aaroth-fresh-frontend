import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import { useTheme } from '../../hooks/useTheme';

// Dynamic button variants with dark mode support
const getButtonVariants = (isDarkMode) => cva(
  // Base classes - mobile-first with 44px minimum touch targets
  'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] active:scale-95',
  {
    variants: {
      variant: {
        // Primary - Gradient with olive glow effect (enhanced dark mode)
        primary: isDarkMode
          ? 'bg-gradient-secondary text-white shadow-dark-depth-1 hover:shadow-dark-depth-2 hover:shadow-dark-glow-olive hover:-translate-y-0.5 focus-visible:ring-dark-sage-accent'
          : 'bg-gradient-secondary text-white shadow-sm hover:shadow-lg hover:shadow-glow-olive hover:-translate-y-0.5 focus-visible:ring-muted-olive',

        // Secondary - Solid earth tone (enhanced for dark mode)
        secondary: isDarkMode
          ? 'bg-dark-cedar-warm text-white hover:bg-dark-cedar-warm/90 shadow-dark-depth-1 hover:shadow-dark-depth-2 focus-visible:ring-dark-cedar-warm'
          : 'bg-earthy-brown text-white hover:bg-earthy-brown/90 focus-visible:ring-earthy-brown',

        // Outline - Sophisticated olive border (dark mode optimized)
        outline: isDarkMode
          ? 'border-2 border-dark-sage-accent text-dark-sage-accent bg-transparent hover:bg-dark-sage-accent hover:text-dark-olive-bg focus-visible:ring-dark-sage-accent'
          : 'border-2 border-muted-olive text-muted-olive bg-transparent hover:bg-muted-olive hover:text-white focus-visible:ring-muted-olive',

        // Ghost - Minimal olive presence (dark mode enhanced)
        ghost: isDarkMode
          ? 'text-dark-sage-accent hover:bg-dark-sage-accent/10 focus-visible:ring-dark-sage-accent/50'
          : 'text-muted-olive hover:bg-muted-olive/10 focus-visible:ring-muted-olive/50',

        // Destructive - For dangerous actions (consistent across themes)
        destructive: isDarkMode
          ? 'bg-tomato-red text-white hover:bg-tomato-red/90 shadow-dark-depth-1 hover:shadow-dark-depth-2 focus-visible:ring-tomato-red'
          : 'bg-tomato-red text-white hover:bg-tomato-red/90 focus-visible:ring-tomato-red',

        // Success - For positive actions (olive-harmonized dark mode)
        success: isDarkMode
          ? 'bg-dark-olive-surface border border-dark-sage-accent text-dark-sage-accent hover:bg-dark-sage-accent/10 focus-visible:ring-dark-sage-accent/30'
          : 'bg-success-light text-success-dark hover:bg-success-light/90 focus-visible:ring-muted-olive/30',

        // Glass - Enhanced glassmorphism effect (dark mode optimized)
        glass: isDarkMode
          ? 'glass-2-dark text-dark-text-primary hover:glass-3-dark hover:shadow-dark-glow-olive/30 focus-visible:ring-dark-sage-accent/20'
          : 'glass-2 text-text-dark hover:glass-3 hover:shadow-glow-olive/20 focus-visible:ring-muted-olive/20',

        // Glass Olive - New olive-themed glass variant (dark mode enhanced)
        'glass-olive': isDarkMode
          ? 'glass-card-dark-olive text-dark-sage-accent hover:glass-3-dark hover:shadow-dark-glow-sage focus-visible:ring-dark-sage-accent/20'
          : 'glass-card-olive text-muted-olive hover:glass-3 hover:shadow-glow-sage focus-visible:ring-sage-green/20',
      },
      size: {
        sm: 'h-10 px-4 text-sm min-h-[44px]', // Still meets touch target
        default: 'h-12 px-6 text-base min-h-[48px]',
        lg: 'h-14 px-8 text-lg min-h-[56px]',
        xl: 'h-16 px-10 text-xl min-h-[64px]',
        icon: 'h-12 w-12 min-h-[48px] min-w-[48px]', // Square for icons
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
      fullWidth: false,
      loading: false,
    },
  }
);

// Loading spinner component
const LoadingSpinner = ({ className }) => (
  <svg
    className={cn('animate-spin h-4 w-4', className)}
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Button component with forwardRef for proper ref handling and dark mode support
const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      children,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const { isDarkMode } = useTheme();
    const isDisabled = disabled || loading;
    
    // Get theme-aware button variants
    const buttonVariants = getButtonVariants(isDarkMode);

    return (
      <button
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        type={type}
        aria-disabled={isDisabled}
        {...props}
      >
        {/* Left Icon */}
        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner className="mr-2" />}

        {/* Button Content */}
        <span className={cn('truncate', loading && 'opacity-70')}>
          {children}
        </span>

        {/* Right Icon */}
        {rightIcon && !loading && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
