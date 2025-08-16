import React, { useEffect, useState, forwardRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Bell,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import {
  removeNotification,
  selectNotifications,
} from '../../store/slices/notificationSlice';

// Toast variants following floating messages design
const toastVariants = cva(
  'relative p-4 rounded-2xl shadow-lg backdrop-blur-sm border transition-all duration-300 animate-slide-up group max-w-sm',
  {
    variants: {
      variant: {
        success: 'bg-mint-fresh/10 border-mint-fresh/20 text-bottle-green',
        error: 'bg-tomato-red/5 border-tomato-red/20 text-tomato-red/90',
        warning: 'bg-amber-50/80 border-amber-200/50 text-amber-800',
        info: 'bg-blue-50/80 border-blue-200/50 text-blue-800',
        default: 'bg-white/90 border-gray-200/50 text-text-dark',
        loading: 'bg-earthy-beige/20 border-earthy-brown/20 text-text-dark',
      },
      size: {
        sm: 'p-3 text-xs',
        default: 'p-4 text-sm',
        lg: 'p-5 text-base',
      },
      position: {
        'top-right': '',
        'top-left': '',
        'bottom-right': '',
        'bottom-left': '',
        'top-center': '',
        'bottom-center': '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'top-right',
    },
  }
);

// Enhanced Toast Component with progress bar and animations
const Toast = forwardRef(
  (
    {
      id,
      variant = 'default',
      title,
      message,
      description, // Alternative to message
      action,
      onAction,
      onClose,
      duration = 5000,
      showProgress = true,
      showCloseButton = true,
      icon: CustomIcon,
      size = 'default',
      className,
      pauseOnHover = true,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
      if (!duration || duration <= 0) return;

      let progressInterval;
      let hideTimeout;

      if (!isPaused) {
        const progressStep = 100 / (duration / 50); // Update every 50ms

        progressInterval = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev - progressStep;
            if (newProgress <= 0) {
              setIsVisible(false);
              return 0;
            }
            return newProgress;
          });
        }, 50);

        hideTimeout = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(id), 300); // Allow fade out animation
        }, duration);
      }

      return () => {
        if (progressInterval) clearInterval(progressInterval);
        if (hideTimeout) clearTimeout(hideTimeout);
      };
    }, [duration, isPaused, id, onClose]);

    const handleClose = () => {
      setIsVisible(false);
      setTimeout(() => onClose?.(id), 300);
    };

    const handleMouseEnter = () => {
      if (pauseOnHover) setIsPaused(true);
    };

    const handleMouseLeave = () => {
      if (pauseOnHover) setIsPaused(false);
    };

    const getIcon = () => {
      const iconProps = { className: 'w-5 h-5 flex-shrink-0' };

      if (CustomIcon) return <CustomIcon {...iconProps} />;

      switch (variant) {
        case 'success':
          return (
            <CheckCircle
              {...iconProps}
              className={cn(iconProps.className, 'text-bottle-green')}
            />
          );
        case 'error':
          return (
            <XCircle
              {...iconProps}
              className={cn(iconProps.className, 'text-tomato-red')}
            />
          );
        case 'warning':
          return (
            <AlertTriangle
              {...iconProps}
              className={cn(iconProps.className, 'text-amber-600')}
            />
          );
        case 'info':
          return (
            <Info
              {...iconProps}
              className={cn(iconProps.className, 'text-blue-600')}
            />
          );
        case 'loading':
          return (
            <Loader
              {...iconProps}
              className={cn(
                iconProps.className,
                'text-text-muted animate-spin'
              )}
            />
          );
        default:
          return (
            <Bell
              {...iconProps}
              className={cn(iconProps.className, 'text-text-muted')}
            />
          );
      }
    };

    const finalMessage = message || description;

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant, size }),
          !isVisible && 'opacity-0 translate-x-full',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="alert"
        aria-live="polite"
        {...props}
      >
        {/* Progress Bar */}
        {showProgress && duration > 0 && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-black/10 rounded-t-2xl overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-75 ease-linear',
                variant === 'success' && 'bg-bottle-green',
                variant === 'error' && 'bg-tomato-red',
                variant === 'warning' && 'bg-amber-500',
                variant === 'info' && 'bg-blue-500',
                variant === 'loading' && 'bg-earthy-brown',
                variant === 'default' && 'bg-text-muted'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex items-start gap-3">
          {getIcon()}

          <div className="flex-1 min-w-0">
            {title && <h4 className="font-medium mb-1 truncate">{title}</h4>}
            {finalMessage && <p className="leading-relaxed">{finalMessage}</p>}
            {action && onAction && (
              <button
                onClick={onAction}
                className={cn(
                  'mt-2 text-xs font-medium underline underline-offset-2 hover:no-underline transition-all duration-200',
                  variant === 'success' &&
                    'text-bottle-green hover:text-bottle-green/80',
                  variant === 'error' &&
                    'text-tomato-red hover:text-tomato-red/80',
                  variant === 'warning' &&
                    'text-amber-700 hover:text-amber-600',
                  variant === 'info' && 'text-blue-700 hover:text-blue-600',
                  variant === 'default' &&
                    'text-text-dark hover:text-text-dark/80'
                )}
              >
                {action}
              </button>
            )}
          </div>

          {/* Close Button */}
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors duration-200 ml-2 min-h-[24px] min-w-[24px] flex items-center justify-center"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Container with position variants
const containerVariants = cva('fixed z-[9999] pointer-events-none', {
  variants: {
    position: {
      'top-right': 'top-4 right-4 flex flex-col gap-3',
      'top-left': 'top-4 left-4 flex flex-col gap-3',
      'top-center': 'top-4 left-1/2 -translate-x-1/2 flex flex-col gap-3',
      'bottom-right': 'bottom-4 right-4 flex flex-col-reverse gap-3',
      'bottom-left': 'bottom-4 left-4 flex flex-col-reverse gap-3',
      'bottom-center':
        'bottom-4 left-1/2 -translate-x-1/2 flex flex-col-reverse gap-3',
    },
  },
  defaultVariants: {
    position: 'top-right',
  },
});

// Enhanced ToastContainer with position support and animations
export const ToastContainer = ({
  position = 'top-right',
  maxToasts = 5,
  className,
  ...props
}) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleRemove = (id) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className={cn(containerVariants({ position }), className)} {...props}>
      {notifications.slice(0, maxToasts).map((notification, index) => {
        // Support backward compatibility
        if (notification.notification) {
          const { id, type, title, message, duration } =
            notification.notification;
          return (
            <div key={id} className="pointer-events-auto">
              <Toast
                id={id}
                variant={type}
                title={title}
                message={message}
                duration={duration}
                onClose={handleRemove}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              />
            </div>
          );
        }

        // New format support
        return (
          <div key={notification.id} className="pointer-events-auto">
            <Toast
              {...notification}
              onClose={handleRemove}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// Backward compatibility
const LegacyToastContainer = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);

  const handleRemove = (id) => {
    dispatch(removeNotification(id));
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 max-w-sm">
      {notifications.slice(0, 5).map((notification) => {
        const { id, type, title, message, duration = 5000 } = notification;
        return (
          <div key={id} className="pointer-events-auto">
            <Toast
              id={id}
              variant={type}
              title={title}
              message={message}
              duration={duration}
              onClose={handleRemove}
            />
          </div>
        );
      })}
    </div>
  );
};

// Standalone Toast components for direct usage
export const SuccessToast = ({ children, ...props }) => (
  <Toast variant="success" {...props}>
    {children}
  </Toast>
);

export const ErrorToast = ({ children, ...props }) => (
  <Toast variant="error" {...props}>
    {children}
  </Toast>
);

export const WarningToast = ({ children, ...props }) => (
  <Toast variant="warning" {...props}>
    {children}
  </Toast>
);

export const InfoToast = ({ children, ...props }) => (
  <Toast variant="info" {...props}>
    {children}
  </Toast>
);

export const LoadingToast = ({ children, ...props }) => (
  <Toast variant="loading" duration={0} showProgress={false} {...props}>
    {children}
  </Toast>
);

// Toast utility functions for programmatic usage
export const toast = {
  success: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'success',
    message,
    duration: 4000,
    ...options,
  }),

  error: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'error',
    message,
    duration: 6000,
    ...options,
  }),

  warning: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'warning',
    message,
    duration: 5000,
    ...options,
  }),

  info: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'info',
    message,
    duration: 4000,
    ...options,
  }),

  loading: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'loading',
    message,
    duration: 0,
    showProgress: false,
    showCloseButton: false,
    ...options,
  }),

  custom: (message, options = {}) => ({
    id: `toast-${Date.now()}-${Math.random()}`,
    variant: 'default',
    message,
    duration: 4000,
    ...options,
  }),
};

// Promise-based toast for async operations
export const promiseToast = async (
  promise,
  {
    loading = 'Loading...',
    success = 'Success!',
    error = 'Something went wrong',
    ...options
  } = {}
) => {
  const loadingToast = toast.loading(loading, options);

  try {
    const result = await promise;
    // Replace loading toast with success
    return {
      ...toast.success(
        typeof success === 'function' ? success(result) : success,
        options
      ),
      replaces: loadingToast.id,
    };
  } catch (err) {
    // Replace loading toast with error
    return {
      ...toast.error(typeof error === 'function' ? error(err) : error, options),
      replaces: loadingToast.id,
    };
  }
};

export { Toast };
export default LegacyToastContainer;
