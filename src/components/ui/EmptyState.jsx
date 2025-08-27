import React from 'react';
import {
  Search,
  ShoppingCart,
  Package,
  Users,
  FileText,
  Heart,
  Star,
  Inbox,
  Calendar,
  Filter,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';

// EmptyState variants following peaceful void design
const emptyStateVariants = cva(
  'flex flex-col items-center justify-center text-center max-w-md mx-auto',
  {
    variants: {
      size: {
        sm: 'py-8 px-6',
        default: 'py-12 px-8',
        lg: 'py-16 px-8',
        xl: 'py-20 px-8',
      },
      spacing: {
        tight: 'space-y-3',
        default: 'space-y-4',
        relaxed: 'space-y-6',
      },
    },
    defaultVariants: {
      size: 'default',
      spacing: 'default',
    },
  }
);

// Icon variants for empty state illustrations
const iconVariants = cva(
  'flex items-center justify-center rounded-3xl mb-6 transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'w-24 h-24 bg-earthy-beige/30 text-text-muted/40',
        primary: 'w-24 h-24 bg-muted-olive/10 text-muted-olive/60',
        secondary: 'w-24 h-24 bg-earthy-brown/10 text-earthy-brown/60',
        warning: 'w-24 h-24 bg-warning-light text-warning-dark',
        error: 'w-24 h-24 bg-tomato-red/10 text-tomato-red/60',
        success: 'w-24 h-24 bg-success-light text-success-dark',
        sage: 'w-24 h-24 bg-sage-green/10 text-sage-green/80',
        cedar: 'w-24 h-24 bg-dusty-cedar/10 text-dusty-cedar/80',
      },
      size: {
        sm: 'w-16 h-16 mb-4',
        default: 'w-24 h-24 mb-6',
        lg: 'w-32 h-32 mb-8',
        xl: 'w-40 h-40 mb-10',
      },
      animation: {
        none: '',
        float: 'animate-float',
        pulse: 'animate-pulse',
        glow: 'hover:animate-glow-olive',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'float',
    },
  }
);

/**
 * Enhanced Empty State Component with Thoughtful Emptiness Design
 * Follows CLAUDE.md patterns for peaceful void and gentle guidance
 */
const EmptyState = ({
  icon: IconComponent,
  title,
  description,
  action,
  actionLabel,
  onAction,
  type = 'default', // Keep backward compatibility
  message, // Keep backward compatibility
  size = 'default',
  variant = 'default',
  animation = 'float',
  className,
  iconClassName,
  titleClassName,
  descriptionClassName,
  actionClassName,
  illustration,
  children,
  ...props
}) => {
  // Backward compatibility mapping
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: Search,
          title: title || 'No results found',
          description:
            description ||
            message ||
            "Try adjusting your search terms or filters to find what you're looking for.",
        };
      case 'products':
        return {
          icon: Package,
          title: title || 'No products available',
          description:
            description ||
            message ||
            'There are currently no products in this category. Check back later for new additions.',
        };
      case 'orders':
        return {
          icon: FileText,
          title: title || 'No orders yet',
          description:
            description ||
            message ||
            "You haven't placed any orders yet. Start exploring products to place your first order.",
        };
      case 'users':
        return {
          icon: Users,
          title: title || 'No users found',
          description:
            description ||
            message ||
            'No users match your current filters or search criteria.',
        };
      case 'error':
        return {
          icon: AlertCircle,
          title: title || 'Unable to load content',
          description:
            description ||
            message ||
            'We encountered an issue loading this content. Please try refreshing the page.',
          variant: 'error',
        };
      case 'create':
        return {
          icon: Plus,
          title: title || 'Get started',
          description:
            description ||
            message ||
            'Create your first item to get started with this section.',
        };
      default:
        return {
          icon: Package,
          title: title || 'Nothing here yet',
          description:
            description ||
            message ||
            'This section is empty. Content will appear here when available.',
        };
    }
  };

  const defaults = getDefaultContent();
  const FinalIcon = IconComponent || defaults.icon;
  const finalTitle = title || defaults.title;
  const finalDescription = description || message || defaults.description;
  const finalVariant =
    variant === 'default' ? defaults.variant || variant : variant;

  const renderIcon = () => {
    if (illustration) {
      return (
        <div
          className={cn(
            iconVariants({ variant: finalVariant, size, animation }),
            iconClassName
          )}
        >
          {illustration}
        </div>
      );
    }

    return (
      <div
        className={cn(
          iconVariants({ variant: finalVariant, size, animation }),
          iconClassName
        )}
      >
        <FinalIcon className="w-1/2 h-1/2" />
      </div>
    );
  };

  return (
    <div
      className={cn(
        emptyStateVariants({ size, spacing: 'default' }),
        className
      )}
      {...props}
    >
      {/* Illustration/Icon */}
      {renderIcon()}

      {/* Title */}
      {finalTitle && (
        <h3
          className={cn(
            'text-lg font-medium text-text-dark/70 mb-2',
            titleClassName
          )}
        >
          {finalTitle}
        </h3>
      )}

      {/* Description */}
      {finalDescription && (
        <p
          className={cn(
            'text-text-muted mb-8 leading-relaxed',
            descriptionClassName
          )}
        >
          {finalDescription}
        </p>
      )}

      {/* Custom Children */}
      {children}

      {/* Action Button */}
      {(action || (actionLabel && onAction)) && (
        <div className={cn('mt-2', actionClassName)}>
          {action || (
            <Button variant="primary" onClick={onAction} className="px-8 py-3">
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Specialized Empty States
 */

// Enhanced specialized empty states with new system
export const NoSearchResults = ({
  searchTerm,
  onClearSearch,
  onCreateNew,
  createLabel,
  className,
  ...props
}) => (
  <EmptyState
    icon={Search}
    variant="default"
    title="No results found"
    description={
      searchTerm
        ? `We couldn't find anything matching "${searchTerm}". Try adjusting your search terms or filters.`
        : 'No results match your current search criteria.'
    }
    className={className}
    {...props}
  >
    <div className="flex flex-col sm:flex-row gap-3 mt-6">
      {onClearSearch && (
        <Button variant="outline" onClick={onClearSearch}>
          Clear search
        </Button>
      )}
      {onCreateNew && createLabel && (
        <Button variant="primary" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          {createLabel}
        </Button>
      )}
    </div>
  </EmptyState>
);

export const EmptyCart = ({
  onBrowseProducts,
  browseLabel = 'Browse Products',
  className,
  ...props
}) => (
  <EmptyState
    icon={ShoppingCart}
    variant="default"
    title="Your cart is empty"
    description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
    actionLabel={browseLabel}
    onAction={onBrowseProducts}
    className={className}
    {...props}
  />
);

export const NoProducts = ({
  onAddProduct,
  addLabel = 'Add Product',
  entity = 'products',
  className,
  ...props
}) => (
  <EmptyState
    icon={Package}
    variant="default"
    title={`No ${entity} yet`}
    description={`You haven't created any ${entity} yet. Create your first ${entity.slice(0, -1)} to get started.`}
    actionLabel={addLabel}
    onAction={onAddProduct}
    className={className}
    {...props}
  />
);

export const NoFavorites = ({
  onBrowse,
  browseLabel = 'Start Browsing',
  favoriteType = 'favorites',
  className,
  ...props
}) => (
  <EmptyState
    icon={Heart}
    variant="default"
    title={`No ${favoriteType} yet`}
    description={`You haven't saved any ${favoriteType} yet. Browse items and save the ones you love.`}
    actionLabel={browseLabel}
    onAction={onBrowse}
    className={className}
    {...props}
  />
);

export const ErrorState = ({
  onRetry,
  retryLabel = 'Try Again',
  errorMessage = 'Something went wrong',
  className,
  ...props
}) => (
  <EmptyState
    icon={AlertCircle}
    variant="error"
    title="Oops! Something went wrong"
    description={errorMessage}
    actionLabel={retryLabel}
    onAction={onRetry}
    className={className}
    {...props}
  />
);

// Backward compatibility exports (keep existing API)
export const SearchEmptyState = ({
  searchTerm,
  onClearSearch,
  className = '',
}) => (
  <NoSearchResults
    searchTerm={searchTerm}
    onClearSearch={onClearSearch}
    className={className}
  />
);

export const ProductsEmptyState = ({
  onAddProduct,
  userCanAdd = false,
  className = '',
}) => (
  <NoProducts
    onAddProduct={userCanAdd ? onAddProduct : undefined}
    className={className}
  />
);

export const OrdersEmptyState = ({ onStartShopping, className = '' }) => (
  <EmptyState
    type="orders"
    actionLabel="Start Shopping"
    onAction={onStartShopping}
    className={className}
  />
);

export const ErrorEmptyState = ({
  onRetry,
  retryText = 'Try Again',
  className = '',
}) => (
  <ErrorState onRetry={onRetry} retryLabel={retryText} className={className} />
);

export const CreateEmptyState = ({
  title,
  message,
  buttonText = 'Create New',
  onAction,
  icon,
  className = '',
}) => (
  <EmptyState
    type="create"
    title={title}
    description={message}
    illustration={icon}
    actionLabel={buttonText}
    onAction={onAction}
    className={className}
  />
);

export default EmptyState;
