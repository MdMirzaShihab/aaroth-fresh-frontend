import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

// Loading spinner variants
const spinnerVariants = cva('animate-spin', {
  variants: {
    size: {
      xs: 'w-3 h-3',
      sm: 'w-4 h-4',
      md: 'w-6 h-6', // Keep compatibility with existing code
      default: 'w-6 h-6',
      lg: 'w-8 h-8',
      xl: 'w-12 h-12',
      '2xl': 'w-16 h-16',
    },
    color: {
      default: 'text-muted-olive',
      white: 'text-white',
      muted: 'text-text-muted',
      primary: 'text-muted-olive',
      secondary: 'text-earthy-brown',
      success: 'text-success-dark',
      error: 'text-tomato-red',
      warning: 'text-warning-dark',
      sage: 'text-sage-green',
      cedar: 'text-dusty-cedar',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
});

/**
 * Enhanced Loading Spinner Component with Organic Design
 * Follows CLAUDE.md design patterns for zen-like patience
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'default',
  className = '',
  text,
  fullScreen = false,
  ...props
}) => {
  const spinnerContent = (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className
      )}
      data-testid="loading-spinner"
      {...props}
    >
      {/* Enhanced Zen Circle Spinner */}
      <svg
        className={cn(spinnerVariants({ size, color }))}
        fill="none"
        viewBox="0 0 24 24"
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

      {/* Optional Loading Text */}
      {text && (
        <div className="text-text-muted text-sm font-medium animate-pulse">
          {text}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

// Organic dots spinner with breathing animation
export const DotsSpinner = ({
  className,
  size = 'default',
  color = 'default',
  ...props
}) => {
  const dotSize = {
    xs: 'w-1 h-1',
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    default: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-6 h-6',
  }[size];

  const containerSize = {
    xs: 'w-6 h-2',
    sm: 'w-8 h-3',
    md: 'w-12 h-4',
    default: 'w-12 h-4',
    lg: 'w-16 h-6',
    xl: 'w-20 h-8',
    '2xl': 'w-24 h-12',
  }[size];

  const colorClass = spinnerVariants({ color }).replace('animate-spin', '');

  return (
    <div
      className={cn(
        'flex items-center justify-between',
        containerSize,
        className
      )}
      {...props}
    >
      <div
        className={cn(dotSize, 'rounded-full animate-breathe', colorClass)}
        style={{ animationDelay: '0ms' }}
      />
      <div
        className={cn(dotSize, 'rounded-full animate-breathe', colorClass)}
        style={{ animationDelay: '150ms' }}
      />
      <div
        className={cn(dotSize, 'rounded-full animate-breathe', colorClass)}
        style={{ animationDelay: '300ms' }}
      />
    </div>
  );
};

// Pulse spinner with organic scaling
export const PulseSpinner = ({
  className,
  size = 'default',
  color = 'default',
  ...props
}) => {
  const sizeClass = spinnerVariants({ size }).replace(
    'animate-spin text-muted-olive',
    ''
  );
  const colorClass = spinnerVariants({ color }).replace('animate-spin', '');

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClass,
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'absolute rounded-full animate-ping',
          sizeClass,
          colorClass,
          'opacity-20'
        )}
      />
      <div
        className={cn(
          'relative rounded-full animate-pulse',
          sizeClass,
          colorClass
        )}
      />
    </div>
  );
};

// Full page loading overlay
export const LoadingOverlay = ({
  isLoading,
  spinner: SpinnerComponent = LoadingSpinner,
  message,
  className,
  backdropBlur = true,
  ...spinnerProps
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 transition-all duration-300',
        backdropBlur && 'backdrop-blur-sm',
        className
      )}
    >
      <SpinnerComponent size="xl" {...spinnerProps} />
      {message && (
        <p className="mt-4 text-text-muted text-center max-w-xs">{message}</p>
      )}
    </div>
  );
};

// Inline loading state
export const InlineLoading = ({
  size = 'sm',
  message,
  className,
  spinner: SpinnerComponent = LoadingSpinner,
  ...props
}) => (
  <div
    className={cn('flex items-center gap-2 text-text-muted', className)}
    {...props}
  >
    <SpinnerComponent size={size} color="muted" />
    {message && <span className="text-sm">{message}</span>}
  </div>
);

// Skeleton loading components for different content types
export const SkeletonLine = ({
  className,
  width = 'w-full',
  height = 'h-4',
  ...props
}) => (
  <div
    className={cn(
      'animate-pulse bg-earthy-beige/50 rounded-full',
      width,
      height,
      className
    )}
    {...props}
  />
);

export const SkeletonCircle = ({ className, size = 'w-12 h-12', ...props }) => (
  <div
    className={cn(
      'animate-pulse bg-earthy-beige/50 rounded-full flex-shrink-0',
      size,
      className
    )}
    {...props}
  />
);

/**
 * Enhanced Skeleton Loading Component for Content Placeholders
 */
export const SkeletonLoader = ({
  lines = 3,
  className = '',
  animate = true,
}) => {
  return (
    <div className={cn('space-y-4', animate && 'animate-pulse', className)}>
      {Array.from({ length: lines }, (_, index) => (
        <SkeletonLine
          key={index}
          width={
            index === 0
              ? 'w-3/4'
              : index === 1
                ? 'w-1/2'
                : index === 2
                  ? 'w-5/6'
                  : 'w-full'
          }
        />
      ))}
    </div>
  );
};

/**
 * Enhanced Card Skeleton for Product/Listing Cards
 */
export const CardSkeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/80 backdrop-blur-sm rounded-3xl p-6 border border-white/50',
        className
      )}
      {...props}
    >
      {/* Image Placeholder */}
      <SkeletonLine className="rounded-2xl h-48 w-full mb-4" />

      {/* Title */}
      <SkeletonLine height="h-4" width="w-3/4" className="mb-3" />

      {/* Description Lines */}
      <div className="space-y-2 mb-4">
        <SkeletonLine height="h-3" width="w-full" />
        <SkeletonLine height="h-3" width="w-2/3" />
      </div>

      {/* Price/Button Area */}
      <div className="flex justify-between items-center">
        <SkeletonLine height="h-5" width="w-20" />
        <SkeletonLine height="h-10" width="w-24" className="rounded-2xl" />
      </div>
    </div>
  );
};

export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className,
  ...props
}) => (
  <div className={cn('animate-pulse space-y-4', className)} {...props}>
    {/* Header */}
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLine key={`header-${i}`} height="h-5" width="w-3/4" />
      ))}
    </div>

    {/* Separator */}
    <SkeletonLine height="h-px" width="w-full" />

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={`row-${rowIndex}`}
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLine
            key={`cell-${rowIndex}-${colIndex}`}
            height="h-4"
            width="w-full"
          />
        ))}
      </div>
    ))}
  </div>
);

/**
 * Enhanced Progress Bar Component
 */
export const ProgressBar = ({
  progress = 0,
  className = '',
  showPercentage = false,
  color = 'muted-olive',
  ...props
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('space-y-2', className)} {...props}>
      {showPercentage && (
        <div className="flex justify-between text-sm text-text-muted">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}

      <div className="w-full bg-earthy-beige/30 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-olive-sage rounded-full origin-left transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${clampedProgress / 100})` }}
        />
      </div>
    </div>
  );
};

/**
 * Enhanced Floating Loader for Overlay Loading States
 */
export const FloatingLoader = ({
  isVisible = true,
  text = 'Loading...',
  className = '',
  ...props
}) => {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 glass-5 rounded-3xl shadow-depth-5 p-8 border animate-scale-in z-50',
        className
      )}
      {...props}
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};

export default LoadingSpinner;
