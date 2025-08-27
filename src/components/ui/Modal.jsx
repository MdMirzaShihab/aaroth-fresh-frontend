import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import { useTheme } from '../../hooks/useTheme';

// Dynamic modal variants with dark mode support
const getModalVariants = (isDarkMode) => cva(
  // Base modal classes with enhanced glassmorphism and mobile optimization
  cn(
    'rounded-3xl border animate-scale-in max-h-[90vh] overflow-y-auto',
    isDarkMode ? 'glass-5-dark shadow-dark-depth-3' : 'glass-5 shadow-depth-5'
  ),
  {
    variants: {
      size: {
        sm: 'w-full max-w-md mx-4',
        default: 'w-full max-w-lg mx-4',
        lg: 'w-full max-w-2xl mx-4',
        xl: 'w-full max-w-4xl mx-4',
        full: 'w-full mx-4 h-[90vh]',
        // Mobile-first: full width on mobile, constrained on desktop
        responsive:
          'w-full mx-4 sm:max-w-md sm:mx-auto md:max-w-lg lg:max-w-xl',
      },
      position: {
        center: 'flex items-center justify-center',
        top: 'flex items-start justify-center pt-16',
        bottom: 'flex items-end justify-center pb-16',
      },
    },
    defaultVariants: {
      size: 'responsive',
      position: 'center',
    },
  }
);

// Enhanced backdrop variants with olive accents and dark mode support
const getBackdropVariants = (isDarkMode) => cva('fixed inset-0 z-50 transition-all duration-300', {
  variants: {
    blur: {
      none: isDarkMode ? 'bg-black/70' : 'bg-black/50',
      light: isDarkMode ? 'bg-black/40 backdrop-blur-sm' : 'bg-black/30 backdrop-blur-sm',
      medium: isDarkMode ? 'bg-black/60 backdrop-blur-md' : 'bg-black/40 backdrop-blur-md',
      heavy: isDarkMode ? 'bg-black/70 backdrop-blur-lg' : 'bg-black/50 backdrop-blur-lg',
      olive: isDarkMode ? 'bg-dark-olive-bg/20 backdrop-blur-md' : 'bg-muted-olive/10 backdrop-blur-md',
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
      className={cn(backdropVariants({ blur }))}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div className={cn(modalVariants({ size, position }))}>
        <div
          ref={modalRef}
          className={cn('relative focus:outline-none', className)}
          tabIndex={-1}
        >
          {/* Modal Header */}
          {(title || showCloseButton) && (
            <div
              className={cn(
                'flex items-center justify-between p-6 pb-4',
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

          {/* Modal Content */}
          <div
            className={cn(
              'px-6',
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
        'fixed inset-0 z-50 bg-black/40 backdrop-blur-md transition-all duration-300 flex',
        positionClasses[position]
      )}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={cn(
          'glass-5 shadow-depth-5 border overflow-y-auto',
          drawerClasses[position],
          animationClasses[position]
        )}
      >
        {/* Drawer Handle for mobile */}
        {(position === 'bottom' || position === 'top') && (
          <div className="flex justify-center p-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full" />
          </div>
        )}

        {/* Drawer Header */}
        {title && (
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
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

        {/* Drawer Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export { Modal, ModalHeader, ModalBody, ModalFooter, Drawer };
