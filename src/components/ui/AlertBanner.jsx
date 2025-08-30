import React, { useState, forwardRef } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';

// AlertBanner variants following system message design
const alertBannerVariants = cva(
  'w-full border backdrop-blur-sm transition-all duration-300 animate-fade-in',
  {
    variants: {
      variant: {
        info: 'bg-blue-50/80 border-blue-200/50 text-blue-800',
        success: 'bg-sage-green/10 border-sage-green/20 text-muted-olive',
        warning: 'bg-amber-50/80 border-amber-200/50 text-amber-800',
        error: 'bg-tomato-red/5 border-tomato-red/20 text-tomato-red/90',
        default: 'bg-earthy-beige/20 border-earthy-brown/20 text-text-dark',
      },
      size: {
        sm: 'px-4 py-3 text-sm',
        default: 'px-6 py-4 text-sm',
        lg: 'px-8 py-5 text-base',
      },
      position: {
        inline: 'rounded-2xl',
        top: 'rounded-none border-t-0 border-l-0 border-r-0',
        bottom: 'rounded-none border-b-0 border-l-0 border-r-0',
        sticky:
          'sticky top-0 z-40 rounded-none border-t-0 border-l-0 border-r-0',
        fixed:
          'fixed top-0 left-0 right-0 z-50 rounded-none border-t-0 border-l-0 border-r-0',
      },
      emphasis: {
        subtle: '',
        medium: 'shadow-sm',
        strong: 'shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      position: 'inline',
      emphasis: 'subtle',
    },
  }
);

/**
 * Enhanced AlertBanner Component for System Messages
 * Follows CLAUDE.md patterns for gentle guidance and system communication
 */
const AlertBanner = forwardRef(
  (
    {
      variant = 'default',
      size = 'default',
      position = 'inline',
      emphasis = 'subtle',
      icon: CustomIcon,
      title,
      children,
      message,
      description, // Alternative to children/message
      action,
      actionLabel,
      onAction,
      onClose,
      dismissible = false,
      collapsible = false,
      defaultCollapsed = false,
      showIcon = true,
      className,
      titleClassName,
      contentClassName,
      actionsClassName,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
    const [isDismissed, setIsDismissed] = useState(false);

    const handleClose = () => {
      setIsDismissed(true);
      onClose?.();
    };

    const handleToggleCollapse = () => {
      setIsCollapsed(!isCollapsed);
    };

    const getIcon = () => {
      const iconProps = { className: 'w-5 h-5 flex-shrink-0' };

      if (CustomIcon) return <CustomIcon {...iconProps} />;

      switch (variant) {
        case 'success':
          return <CheckCircle {...iconProps} />;
        case 'error':
          return <AlertCircle {...iconProps} />;
        case 'warning':
          return <AlertTriangle {...iconProps} />;
        case 'info':
          return <Info {...iconProps} />;
        default:
          return <Info {...iconProps} />;
      }
    };

    const finalContent = children || message || description;

    if (isDismissed) return null;

    return (
      <div
        ref={ref}
        className={cn(
          alertBannerVariants({ variant, size, position, emphasis }),
          className
        )}
        role="alert"
        aria-live={variant === 'error' ? 'assertive' : 'polite'}
        {...props}
      >
        <div className="flex items-start gap-3">
          {/* Icon */}
          {showIcon && getIcon()}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Title Row */}
            <div className="flex items-center gap-2">
              {title && (
                <h4 className={cn('font-medium', titleClassName)}>{title}</h4>
              )}

              {/* Collapse Toggle */}
              {collapsible && (
                <button
                  onClick={handleToggleCollapse}
                  className="p-1 hover:bg-black/10 rounded-lg transition-colors duration-200 ml-auto"
                  aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Content */}
            {!isCollapsed && finalContent && (
              <div
                className={cn(
                  'leading-relaxed',
                  title && 'mt-1',
                  contentClassName
                )}
              >
                {typeof finalContent === 'string' ? (
                  <p>{finalContent}</p>
                ) : (
                  finalContent
                )}
              </div>
            )}

            {/* Actions */}
            {!isCollapsed && (action || (actionLabel && onAction)) && (
              <div
                className={cn('mt-3 flex items-center gap-2', actionsClassName)}
              >
                {action || (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAction}
                    className="text-current hover:bg-current/10"
                  >
                    {actionLabel}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Dismiss Button */}
          {dismissible && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded-lg transition-colors duration-200"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

AlertBanner.displayName = 'AlertBanner';

// Pre-built AlertBanner variants for common system messages

export const MaintenanceBanner = ({
  scheduledTime,
  duration = '30 minutes',
  onLearnMore,
  className,
  ...props
}) => (
  <AlertBanner
    variant="warning"
    position="top"
    emphasis="medium"
    icon={AlertTriangle}
    title="Scheduled Maintenance"
    dismissible
    className={className}
    {...props}
  >
    <p>
      We'll be performing scheduled maintenance{' '}
      {scheduledTime && `on ${scheduledTime}`}
      for approximately {duration}. Some features may be temporarily
      unavailable.
    </p>
    {onLearnMore && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onLearnMore}
        className="text-current hover:bg-current/10 mt-2"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Learn More
      </Button>
    )}
  </AlertBanner>
);

export const UpdateBanner = ({
  version,
  onUpdate,
  onDismiss,
  features = [],
  className,
  ...props
}) => (
  <AlertBanner
    variant="info"
    position="top"
    emphasis="medium"
    icon={RefreshCw}
    title={`Update Available${version ? ` - v${version}` : ''}`}
    dismissible
    onClose={onDismiss}
    className={className}
    {...props}
  >
    <div className="space-y-2">
      <p>A new version is available with improvements and bug fixes.</p>
      {features.length > 0 && (
        <ul className="text-xs space-y-1 ml-4 list-disc">
          {features.slice(0, 3).map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      )}
    </div>
    {onUpdate && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onUpdate}
        className="text-current hover:bg-current/10 mt-2"
      >
        Update Now
      </Button>
    )}
  </AlertBanner>
);

export const ErrorBanner = ({
  error,
  onRetry,
  onReport,
  showDetails = false,
  className,
  ...props
}) => (
  <AlertBanner
    variant="error"
    emphasis="medium"
    icon={AlertCircle}
    title="Something went wrong"
    dismissible
    className={className}
    {...props}
  >
    <div className="space-y-2">
      <p>
        We encountered an unexpected error. Please try again or contact support
        if the problem persists.
      </p>
      {showDetails && error && (
        <details className="text-xs bg-black/5 rounded-lg p-2 mt-2">
          <summary className="cursor-pointer font-medium">
            Error Details
          </summary>
          <pre className="mt-1 overflow-auto">{error.toString()}</pre>
        </details>
      )}
    </div>
    <div className="flex gap-2 mt-3">
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="text-current hover:bg-current/10"
        >
          Try Again
        </Button>
      )}
      {onReport && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReport}
          className="text-current hover:bg-current/10"
        >
          Report Issue
        </Button>
      )}
    </div>
  </AlertBanner>
);

export const OfflineBanner = ({ onRetry, className, ...props }) => (
  <AlertBanner
    variant="warning"
    position="sticky"
    emphasis="medium"
    icon={AlertTriangle}
    title="You're offline"
    className={className}
    {...props}
  >
    <p>Check your internet connection. Some features may not work properly.</p>
    {onRetry && (
      <Button
        variant="ghost"
        size="sm"
        onClick={onRetry}
        className="text-current hover:bg-current/10 mt-2"
      >
        Try Again
      </Button>
    )}
  </AlertBanner>
);

export const CookieBanner = ({
  onAccept,
  onDecline,
  onCustomize,
  policyUrl,
  className,
  ...props
}) => (
  <AlertBanner
    variant="default"
    position="bottom"
    emphasis="strong"
    size="lg"
    className={cn('border-t-2', className)}
    {...props}
  >
    <div className="space-y-3">
      <p className="font-medium">We use cookies to enhance your experience</p>
      <p className="text-sm opacity-90">
        This website uses cookies to ensure you get the best experience. By
        continuing to use this site, you consent to our use of cookies.
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          variant="primary"
          size="sm"
          onClick={onAccept}
          className="flex-shrink-0"
        >
          Accept All
        </Button>
        {onCustomize && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCustomize}
            className="flex-shrink-0"
          >
            Customize
          </Button>
        )}
        {onDecline && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDecline}
            className="flex-shrink-0"
          >
            Decline
          </Button>
        )}
        {policyUrl && (
          <a
            href={policyUrl}
            className="text-sm text-current hover:underline flex items-center gap-1 mt-1 sm:mt-0 sm:ml-auto"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  </AlertBanner>
);

export const FeatureBanner = ({
  featureName,
  description,
  onTryNow,
  onLearnMore,
  onDismiss,
  beta = false,
  className,
  ...props
}) => (
  <AlertBanner
    variant="success"
    emphasis="medium"
    icon={CheckCircle}
    title={`${beta ? 'Beta: ' : 'New: '}${featureName}`}
    dismissible
    onClose={onDismiss}
    className={className}
    {...props}
  >
    <div className="space-y-2">
      <p>{description}</p>
      {beta && (
        <p className="text-xs opacity-75">
          This feature is in beta. Your feedback helps us improve it.
        </p>
      )}
    </div>
    <div className="flex gap-2 mt-3">
      {onTryNow && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onTryNow}
          className="text-current hover:bg-current/10"
        >
          Try Now
        </Button>
      )}
      {onLearnMore && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onLearnMore}
          className="text-current hover:bg-current/10"
        >
          Learn More
        </Button>
      )}
    </div>
  </AlertBanner>
);

// Utility hook for managing banner states
export const useAlertBanner = (initialVisible = false) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);
  const toggle = () => setIsVisible(!isVisible);
  const collapse = () => setIsCollapsed(true);
  const expand = () => setIsCollapsed(false);
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return {
    isVisible,
    isCollapsed,
    show,
    hide,
    toggle,
    collapse,
    expand,
    toggleCollapse,
    setIsVisible,
    setIsCollapsed,
  };
};

export default AlertBanner;
