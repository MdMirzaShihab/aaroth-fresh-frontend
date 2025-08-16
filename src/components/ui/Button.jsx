import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

// Button variants using class-variance-authority for type safety and consistency
const buttonVariants = cva(
  // Base classes - mobile-first with 44px minimum touch targets
  'inline-flex items-center justify-center rounded-2xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] active:scale-95',
  {
    variants: {
      variant: {
        // Primary - Gradient with glow effect
        primary:
          'bg-gradient-secondary text-white shadow-sm hover:shadow-lg hover:shadow-glow-green/20 hover:-translate-y-0.5 focus-visible:ring-bottle-green',

        // Secondary - Solid earth tone
        secondary:
          'bg-earthy-brown text-white hover:bg-earthy-brown/90 focus-visible:ring-earthy-brown',

        // Outline - Sophisticated border
        outline:
          'border-2 border-bottle-green text-bottle-green bg-transparent hover:bg-bottle-green hover:text-white focus-visible:ring-bottle-green',

        // Ghost - Minimal presence
        ghost:
          'text-bottle-green hover:bg-bottle-green/10 focus-visible:ring-bottle-green/50',

        // Destructive - For dangerous actions
        destructive:
          'bg-tomato-red text-white hover:bg-tomato-red/90 focus-visible:ring-tomato-red',

        // Success - For positive actions
        success:
          'bg-mint-fresh text-bottle-green hover:bg-mint-fresh/90 focus-visible:ring-mint-fresh',

        // Glass - Glassmorphism effect
        glass:
          'bg-glass backdrop-blur-sm border border-white/20 text-text-dark hover:bg-white/10 hover:border-white/30 focus-visible:ring-white/50',
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

// Button component with forwardRef for proper ref handling
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
    const isDisabled = disabled || loading;

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
