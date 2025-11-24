import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import { useTheme } from '../../hooks/useTheme';

// Dynamic modal variants with dark mode support - Enhanced glassmorphism
const getModalVariants = (isDarkMode) =>
  cva(
    // Base modal classes with enhanced glassmorphism and mobile optimization
    cn(
      'rounded-3xl border animate-scale-in flex flex-col backdrop-blur-xl',
      isDarkMode
        ? 'bg-gray-900/95 border-gray-700/50 shadow-2xl shadow-black/50'
        : 'bg-white/95 border-gray-200/50 shadow-2xl shadow-black/10'
    ),
    {
      variants: {
        size: {
          sm: 'w-full max-w-md',
          default: 'w-full max-w-lg',
          lg: 'w-full max-w-2xl',
          xl: 'w-full max-w-4xl',
          full: 'w-full h-[90vh]',
          // Mobile-first: full width on mobile, constrained on desktop
          responsive:
            'w-full sm:max-w-md md:max-w-lg lg:max-w-xl',
        },
      },
      defaultVariants: {
        size: 'responsive',
      },
    }
  );

// Enhanced backdrop variants with olive accents and dark mode support
const getBackdropVariants = (isDarkMode) =>
  cva('fixed inset-0 z-[999] transition-all duration-300', {
    variants: {
      blur: {
        none: isDarkMode ? 'bg-black/70' : 'bg-black/50',
        light: isDarkMode
          ? 'bg-black/40 backdrop-blur-md'
          : 'bg-black/30 backdrop-blur-md',
        medium: isDarkMode
          ? 'bg-black/60 backdrop-blur-xl'
          : 'bg-black/40 backdrop-blur-xl',
        heavy: isDarkMode
          ? 'bg-black/70 backdrop-blur-2xl'
          : 'bg-black/50 backdrop-blur-2xl',
        olive: isDarkMode
          ? 'bg-dark-olive-bg/30 backdrop-blur-xl'
          : 'bg-muted-olive/20 backdrop-blur-xl',
      },
    },
    defaultVariants: {
      blur: 'medium',
    },
  });

const Modal = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size,
  position,
  blur,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  backdropClassName,
  headerClassName,
  contentClassName,
  footerClassName,
  preventScroll = true,
}) => {
  const { isDarkMode } = useTheme();
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Get theme-aware variants
  const modalVariants = getModalVariants(isDarkMode);
  const backdropVariants = getBackdropVariants(isDarkMode);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Focus the modal
    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      // Restore focus to the previously focused element
      if (
        previousActiveElement.current &&
        previousActiveElement.current.focus
      ) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && closeOnBackdrop) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  const modalContent = (
    <div
      className={cn(
        backdropVariants({ blur }),
        'flex items-center justify-center p-4',
        // Add safe-area padding for notched devices
        'supports-[padding:env(safe-area-inset-bottom)]:p-[max(1rem,env(safe-area-inset-top))_max(1rem,env(safe-area-inset-right))_max(1rem,env(safe-area-inset-bottom))_max(1rem,env(safe-area-inset-left))]',
        backdropClassName
      )}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div
        className={cn(
          modalVariants({ size }),
          'max-h-[90vh]',
          className
        )}
      >
        <div
          ref={modalRef}
          className="relative focus:outline-none flex flex-col max-h-[90vh]"
          tabIndex={-1}
        >
          {/* Modal Header - Sticky with Glass Effect */}
          {(title || showCloseButton) && (
            <div
              className={cn(
                'flex items-center justify-between p-6 pb-4 flex-shrink-0 border-b border-gray-200/30 bg-white/40 backdrop-blur-sm rounded-t-3xl',
                headerClassName
              )}
            >
              <div className="flex-1 min-w-0">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-text-dark truncate"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id="modal-description"
                    className="text-sm text-text-muted mt-1"
                  >
                    {description}
                  </p>
                )}
              </div>

              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-4 p-2 rounded-2xl text-text-muted hover:text-text-dark hover:bg-muted-olive/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Modal Content - Scrollable */}
          <div
            className={cn(
              'px-4 sm:px-6 py-6 overflow-y-auto flex-1',
              !title && !showCloseButton && 'pt-6',
              contentClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  // Render modal in portal
  return createPortal(modalContent, document.body);
};

// Modal Header component for better composition
const ModalHeader = ({ children, className }) => (
  <div className={cn('px-6 pt-6 pb-4', className)}>{children}</div>
);

// Modal Body component for better composition
const ModalBody = ({ children, className }) => (
  <div className={cn('px-6 py-2', className)}>{children}</div>
);

// Modal Footer component for better composition
const ModalFooter = ({ children, className, justify = 'end' }) => {
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[justify];

  return (
    <div
      className={cn(
        'px-6 pb-6 pt-4 flex items-center gap-3',
        justifyClass,
        className
      )}
    >
      {children}
    </div>
  );
};

// Drawer component for mobile slide-up modals
const Drawer = ({
  isOpen,
  onClose,
  children,
  title,
  position = 'bottom',
  ...props
}) => {
  const positionClasses = {
    bottom: 'items-end',
    top: 'items-start',
    left: 'items-center justify-start',
    right: 'items-center justify-end',
  };

  const drawerClasses = {
    bottom: 'w-full rounded-t-3xl rounded-b-none max-h-[90vh]',
    top: 'w-full rounded-b-3xl rounded-t-none max-h-[90vh]',
    left: 'h-full w-80 max-w-[90vw] rounded-r-3xl rounded-l-none',
    right: 'h-full w-80 max-w-[90vw] rounded-l-3xl rounded-r-none',
  };

  const animationClasses = {
    bottom: 'animate-slide-up',
    top: 'animate-slide-down',
    left: 'animate-slide-right',
    right: 'animate-slide-left',
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[999] bg-black/40 backdrop-blur-md transition-all duration-300 flex',
        positionClasses[position]
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'glass-5 shadow-depth-5 border flex flex-col',
          drawerClasses[position],
          animationClasses[position]
        )}
      >
        {/* Drawer Handle for mobile */}
        {(position === 'bottom' || position === 'top') && (
          <div className="flex justify-center p-4 flex-shrink-0">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Drawer Header - Sticky */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-text-dark">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-2xl text-text-muted hover:text-text-dark hover:bg-muted-olive/10 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Drawer Content - Scrollable */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter, Drawer };
