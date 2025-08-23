import React from 'react';

/**
 * MobileResponsiveWrapper - Ensures mobile-first responsive design
 * Validates touch targets and mobile optimization
 *
 * This component enforces the 44px minimum touch target requirement
 * and provides mobile-optimized interactions
 */
const MobileResponsiveWrapper = ({
  children,
  className = '',
  touchTarget = true,
}) => {
  const baseClasses = 'touch-manipulation select-none';
  const touchClasses = touchTarget ? 'min-h-[44px] min-w-[44px]' : '';

  return (
    <div className={`${baseClasses} ${touchClasses} ${className}`}>
      {children}
    </div>
  );
};

/**
 * TouchFriendlyButton - Button component optimized for touch interactions
 * Ensures minimum 44px touch target and proper feedback
 */
export const TouchFriendlyButton = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'default',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 touch-manipulation select-none active:scale-95';

  const sizeClasses = {
    small: 'px-3 py-2 text-sm min-h-[40px]', // Slightly smaller for secondary actions
    default: 'px-6 py-3 text-sm min-h-[44px]', // Standard touch target
    large: 'px-8 py-4 text-base min-h-[48px]', // Larger for primary actions
  };

  const variantClasses = {
    primary:
      'bg-gradient-secondary text-white hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 disabled:opacity-50',
    secondary:
      'border-2 border-bottle-green/30 text-bottle-green hover:bg-bottle-green/5 disabled:opacity-50',
    outline:
      'border border-gray-300 text-text-dark hover:bg-gray-50 disabled:opacity-50',
    ghost: 'text-text-dark hover:bg-gray-100 disabled:opacity-50',
    danger:
      'bg-tomato-red text-white hover:bg-tomato-red/90 disabled:opacity-50',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * MobileOptimizedModal - Modal component optimized for mobile screens
 */
export const MobileOptimizedModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-sm',
    default: 'max-w-md',
    large: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 touch-manipulation">
      <div
        className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 animate-scale-in w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-text-dark"
            >
              {title}
            </h2>
            <TouchFriendlyButton
              onClick={onClose}
              variant="ghost"
              size="small"
              className="w-8 h-8 p-0 min-w-[32px] min-h-[32px] rounded-full"
              aria-label="Close modal"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </TouchFriendlyButton>
          </div>
        )}

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/**
 * ResponsiveGrid - Grid component that adapts to screen size
 */
export const ResponsiveGrid = ({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 6,
  className = '',
}) => {
  const gridClasses = `grid gap-${gap} grid-cols-${columns.sm} md:grid-cols-${columns.md} lg:grid-cols-${columns.lg} ${className}`;

  return <div className={gridClasses}>{children}</div>;
};

/**
 * MobileNavigation - Mobile-optimized navigation component
 */
export const MobileNavigation = ({ items = [], currentPath, onItemClick }) => {
  return (
    <nav className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-40">
      <div className="grid grid-cols-4 px-2 py-2">
        {items.slice(0, 4).map((item, index) => {
          const isActive = currentPath === item.path;
          const Icon = item.icon;

          return (
            <TouchFriendlyButton
              key={index}
              onClick={() => onItemClick(item.path)}
              variant="ghost"
              className={`flex-col gap-1 py-2 px-1 min-h-[56px] ${isActive ? 'text-bottle-green' : 'text-gray-600'}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.label}</span>
            </TouchFriendlyButton>
          );
        })}
      </div>
    </nav>
  );
};

/**
 * SwipeableCard - Card component with swipe gestures for mobile
 */
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className = '',
}) => {
  const [startX, setStartX] = React.useState(null);

  const handleTouchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (!startX) return;

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && onSwipeLeft) {
        onSwipeLeft();
      } else if (diff < 0 && onSwipeRight) {
        onSwipeRight();
      }
    }

    setStartX(null);
  };

  return (
    <div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

export default MobileResponsiveWrapper;
