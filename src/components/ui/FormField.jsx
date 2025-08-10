import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';

// FormField wrapper component with comprehensive validation integration
const FormField = forwardRef(({
  children,
  label,
  description,
  error,
  success,
  warning,
  required = false,
  className,
  labelClassName,
  descriptionClassName,
  messageClassName,
  id,
  ...props
}, ref) => {
  const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

  // Determine validation state
  const hasError = error && error.length > 0;
  const hasSuccess = success && success.length > 0;
  const hasWarning = warning && warning.length > 0;

  return (
    <div className={cn('space-y-2', className)} ref={ref} {...props}>
      {/* Label */}
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            'block text-sm font-medium text-text-dark/80 tracking-wide',
            required && 'after:content-["*"] after:text-tomato-red after:ml-1',
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-sm text-text-muted leading-relaxed',
            descriptionClassName
          )}
          id={`${fieldId}-description`}
        >
          {description}
        </p>
      )}

      {/* Input Field */}
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              id: fieldId,
              'aria-describedby': description ? `${fieldId}-description` : undefined,
              'aria-invalid': hasError,
              error: hasError,
              success: hasSuccess,
              warning: hasWarning,
            });
          }
          return child;
        })}
      </div>

      {/* Validation Messages */}
      {(hasError || hasSuccess || hasWarning) && (
        <div className={cn('mt-2', messageClassName)}>
          {hasError && <ErrorMessage message={error} />}
          {hasSuccess && <SuccessMessage message={success} />}
          {hasWarning && <WarningMessage message={warning} />}
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// Error Message Component with gentle styling
export const ErrorMessage = ({ message, className, icon = true, ...props }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'text-tomato-red/80 text-sm mt-2 flex items-center gap-2 animate-fade-in',
        className
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {icon && <AlertCircle className="w-4 h-4 text-tomato-red/60 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
    </div>
  );
};

// Success Message Component
export const SuccessMessage = ({ message, className, icon = true, ...props }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'text-mint-fresh text-sm mt-2 flex items-center gap-2 animate-fade-in',
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {icon && <CheckCircle className="w-4 h-4 text-mint-fresh/80 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
    </div>
  );
};

// Warning Message Component
export const WarningMessage = ({ message, className, icon = true, ...props }) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        'text-earthy-yellow text-sm mt-2 flex items-center gap-2 animate-fade-in',
        className
      )}
      role="alert"
      aria-live="polite"
      {...props}
    >
      {icon && <AlertTriangle className="w-4 h-4 text-earthy-yellow/80 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
    </div>
  );
};

// Form Group component for organizing multiple fields
export const FormGroup = ({
  children,
  title,
  description,
  className,
  titleClassName,
  descriptionClassName,
  ...props
}) => (
  <fieldset className={cn('space-y-6', className)} {...props}>
    {title && (
      <legend className={cn(
        'text-lg font-semibold text-text-dark mb-2',
        titleClassName
      )}>
        {title}
      </legend>
    )}
    
    {description && (
      <p className={cn(
        'text-sm text-text-muted leading-relaxed -mt-2 mb-4',
        descriptionClassName
      )}>
        {description}
      </p>
    )}
    
    <div className="space-y-4">
      {children}
    </div>
  </fieldset>
);

// Form Actions component for buttons
export const FormActions = ({
  children,
  className,
  justify = 'end',
  stack = false,
  ...props
}) => {
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }[justify];

  return (
    <div
      className={cn(
        'pt-6 mt-6 border-t border-gray-200',
        stack ? 'flex flex-col gap-3' : `flex items-center gap-3 ${justifyClass}`,
        'sm:flex-row sm:justify-end', // Always horizontal on desktop
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Help Text component
export const HelpText = ({ children, className, ...props }) => (
  <p
    className={cn(
      'text-xs text-text-muted/80 mt-1 leading-relaxed',
      className
    )}
    {...props}
  >
    {children}
  </p>
);

// Form Section component for organizing forms
export const FormSection = ({
  children,
  title,
  description,
  className,
  headerClassName,
  contentClassName,
  divider = false,
  ...props
}) => (
  <div
    className={cn(
      'space-y-6',
      divider && 'pb-6 mb-6 border-b border-gray-200',
      className
    )}
    {...props}
  >
    {(title || description) && (
      <div className={cn('space-y-1', headerClassName)}>
        {title && (
          <h3 className="text-lg font-medium text-text-dark">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
    )}
    
    <div className={cn('space-y-4', contentClassName)}>
      {children}
    </div>
  </div>
);

// Field Array component for dynamic fields
export const FieldArray = ({
  children,
  addLabel = 'Add Item',
  removeLabel = 'Remove',
  onAdd,
  onRemove,
  items = [],
  className,
  ...props
}) => (
  <div className={cn('space-y-4', className)} {...props}>
    {items.map((item, index) => (
      <div key={index} className="relative">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            {typeof children === 'function' ? children(item, index) : children}
          </div>
          {onRemove && items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="mt-2 p-2 text-tomato-red hover:bg-tomato-red/5 rounded-xl transition-colors duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`${removeLabel} item ${index + 1}`}
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    ))}
    
    {onAdd && (
      <button
        type="button"
        onClick={onAdd}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-2xl text-text-muted hover:border-bottle-green hover:text-bottle-green transition-all duration-200 min-h-[44px]"
      >
        + {addLabel}
      </button>
    )}
  </div>
);

export default FormField;