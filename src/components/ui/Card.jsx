import React, { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';

// Card variants with CSS-based dark mode support
const cardVariants = cva(
  // Base card classes with organic curves and glassmorphism
  'rounded-3xl border transition-all duration-500 group',
  {
    variants: {
      variant: {
        // Default - Subtle elevation with CSS dark mode
        default: 'bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:shadow-shadow-soft border-white/50 hover:-translate-y-1 dark:bg-dark-olive-surface/80 dark:shadow-dark-depth-1 dark:hover:shadow-dark-depth-3 dark:border-dark-olive-border/50',

        // Elevated - More prominent shadow with CSS dark mode
        elevated: 'bg-white shadow-lg hover:shadow-2xl hover:shadow-shadow-soft border-gray-100 hover:-translate-y-2 dark:bg-dark-olive-surface dark:shadow-dark-depth-2 dark:hover:shadow-dark-depth-3 dark:hover:shadow-dark-glow-olive/20 dark:border-dark-olive-border',

        // Glass - Full glassmorphism effect with CSS dark mode
        glass: 'glass-3 border-white/20 hover:glass-4 hover:border-muted-olive/30 hover:shadow-glow-olive/10 dark:glass-3-dark dark:border-dark-olive-border/30 dark:hover:glass-4-dark dark:hover:border-dark-sage-accent/40 dark:hover:shadow-dark-glow-olive/15',

        // Glass Olive - Olive-themed glassmorphism with CSS dark mode
        'glass-olive': 'glass-card-olive border-muted-olive/20 hover:glass-3 hover:shadow-glow-sage dark:glass-card-dark-olive dark:border-dark-sage-accent/20 dark:hover:glass-3-dark dark:hover:shadow-dark-glow-sage',

        // Outlined - Subtle border focus with olive theme and CSS dark mode
        outlined: 'bg-white border-2 border-gray-200 hover:border-muted-olive hover:shadow-lg dark:bg-dark-olive-bg dark:border-2 dark:border-dark-olive-border dark:hover:border-dark-sage-accent dark:hover:shadow-dark-depth-2',

        // Gradient - Earth-tone gradient with CSS dark mode
        gradient: 'bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 border-white/50 shadow-sm hover:shadow-xl dark:bg-gradient-to-br dark:from-dark-olive-surface dark:via-dark-olive-bg dark:to-dark-sage-accent/10 dark:border-dark-olive-border/50 dark:shadow-dark-depth-1 dark:hover:shadow-dark-depth-3',

        // Interactive - For clickable cards with olive theme and CSS dark mode
        interactive: 'bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-2xl hover:shadow-glow-olive/10 border-white/50 hover:-translate-y-2 cursor-pointer hover:bg-white/90 dark:bg-dark-olive-surface/80 dark:shadow-dark-depth-1 dark:hover:shadow-dark-depth-3 dark:hover:shadow-dark-glow-olive/15 dark:border-dark-olive-border/50 dark:hover:bg-dark-olive-surface/90',

        // Featured - For highlighted content with CSS dark mode
        featured: 'bg-gradient-secondary text-white shadow-lg hover:shadow-2xl border-0 hover:-translate-y-1 dark:shadow-dark-depth-2 dark:hover:shadow-dark-depth-3 dark:hover:shadow-dark-glow-olive/25',
      },
        padding: {
          none: 'p-0',
          sm: 'p-4',
          default: 'p-6',
          lg: 'p-8',
          xl: 'p-10',
        },
        rounded: {
          sm: 'rounded-xl',
          default: 'rounded-3xl',
          lg: 'rounded-[2rem]',
          full: 'rounded-full',
        },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      rounded: 'default',
    },
  }
);

// Main Card component with CSS-based dark mode support
const Card = forwardRef(
  (
    { className, variant, padding, rounded, children, onClick, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, rounded }), className)}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e);
                }
              }
            : undefined
        }
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header component
const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5', className)}
    {...props}
  >
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

// Card Title component with CSS-based dark mode support
const CardTitle = forwardRef(
  ({ className, children, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-xl font-semibold leading-tight tracking-tight text-text-dark dark:text-dark-text-primary',
          className
        )}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description component with CSS-based dark mode support
const CardDescription = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn(
        'text-sm leading-relaxed text-text-muted dark:text-dark-text-muted',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = 'CardDescription';

// Card Content component
const CardContent = forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

// Card Footer component
const CardFooter = forwardRef(
  ({ className, children, justify = 'start', ...props }, ref) => {
    const justifyClass = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
    }[justify];

    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-6', justifyClass, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Product Card - Specialized component for product listings
const ProductCard = forwardRef(
  (
    {
      className,
      image,
      title,
      description,
      price,
      originalPrice,
      discount,
      rating,
      reviews,
      badge,
      onAddToCart,
      onViewDetails,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant="interactive"
        className={cn('overflow-hidden', className)}
        onClick={onViewDetails}
        {...props}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-3xl -m-6 mb-0">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-earthy-beige/30 flex items-center justify-center">
              <span className="text-text-muted text-sm">No image</span>
            </div>
          )}

          {/* Badge */}
          {badge && (
            <div className="absolute top-3 left-3 bg-tomato-red text-white px-2 py-1 rounded-full text-xs font-medium">
              {badge}
            </div>
          )}

          {/* Discount */}
          {discount && (
            <div className="absolute top-3 right-3 bg-sage-green text-muted-olive px-2 py-1 rounded-full text-xs font-medium">
              {discount}% OFF
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="pt-4">
          <CardTitle className="text-lg mb-2 line-clamp-2">{title}</CardTitle>
          {description && (
            <CardDescription className="mb-3 line-clamp-2">
              {description}
            </CardDescription>
          )}

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(rating)
                        ? 'text-earthy-yellow'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-text-muted">
                {rating} {reviews && `(${reviews})`}
              </span>
            </div>
          )}

          {/* Price Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-muted-olive">
                {price}
              </span>
              {originalPrice && (
                <span className="text-sm text-text-muted line-through">
                  {originalPrice}
                </span>
              )}
            </div>

            {onAddToCart && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart();
                }}
                className="bg-gradient-secondary text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-h-[40px]"
              >
                Add to Cart
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';

// Stat Card - For displaying statistics
const StatCard = forwardRef(
  (
    { className, title, value, change, changeType, icon, trend, ...props },
    ref
  ) => {
    const isPositive = changeType === 'positive' || (change && change > 0);
    const isNegative = changeType === 'negative' || (change && change < 0);

    return (
      <Card
        ref={ref}
        variant="elevated"
        className={cn('relative overflow-hidden', className)}
        {...props}
      >
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted font-medium">{title}</p>
              <p className="text-3xl font-bold text-text-dark mt-2">{value}</p>

              {change && (
                <p
                  className={cn(
                    'text-sm font-medium mt-1 flex items-center gap-1',
                    isPositive && 'text-sage-green',
                    isNegative && 'text-tomato-red',
                    !isPositive && !isNegative && 'text-text-muted'
                  )}
                >
                  {isPositive && '↗'} {isNegative && '↘'}
                  {Math.abs(change)}%
                  <span className="text-text-muted">vs last period</span>
                </p>
              )}
            </div>

            {icon && (
              <div className="flex-shrink-0 p-3 bg-gradient-secondary/10 rounded-2xl">
                {icon}
              </div>
            )}
          </div>

          {/* Trend visualization */}
          {trend && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="h-2 bg-earthy-beige/30 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-1000',
                    isPositive && 'bg-sage-green',
                    isNegative && 'bg-tomato-red',
                    !isPositive && !isNegative && 'bg-earthy-yellow'
                  )}
                  style={{ width: `${Math.min(Math.abs(trend || 0), 100)}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatCard.displayName = 'StatCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ProductCard,
  StatCard,
};
