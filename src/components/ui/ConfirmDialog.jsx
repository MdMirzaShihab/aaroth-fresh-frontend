import React, { useState, useEffect, forwardRef } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Trash2, Save, X } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '../../utils';
import Button from './Button';
import Modal from './Modal';

// ConfirmDialog variants for different confirmation types
const confirmDialogVariants = cva(
  'text-center space-y-6',
  {
    variants: {
      variant: {
        default: '',
        destructive: 'text-tomato-red',
        warning: 'text-amber-700',
        info: 'text-blue-700',
        success: 'text-bottle-green',
      },
      size: {
        sm: 'max-w-sm',
        default: 'max-w-md',
        lg: 'max-w-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// Icon variants for confirmation dialogs
const iconVariants = cva(
  'w-16 h-16 mx-auto rounded-3xl flex items-center justify-center mb-6 animate-float',
  {
    variants: {
      variant: {
        default: 'bg-earthy-beige/20 text-text-muted',
        destructive: 'bg-tomato-red/10 text-tomato-red',
        warning: 'bg-amber-100 text-amber-600',
        info: 'bg-blue-100 text-blue-600',
        success: 'bg-mint-fresh/10 text-bottle-green',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/**
 * Enhanced ConfirmDialog Component with Mobile-Friendly Actions
 * Follows CLAUDE.md patterns for gentle guidance and mobile-first design
 */
const ConfirmDialog = forwardRef(({
  open = false,
  onOpenChange,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  description,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  size = 'default',
  icon: CustomIcon,
  loading = false,
  disabled = false,
  destructive = false,
  showCloseButton = true,
  className,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}, ref) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // Auto-set variant based on destructive prop
  const finalVariant = destructive ? 'destructive' : variant;

  const handleConfirm = async () => {
    if (disabled || loading) return;
    
    setIsConfirming(true);
    try {
      await onConfirm?.();
      onOpenChange?.(false);
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (isConfirming) return;
    onCancel?.();
    onOpenChange?.(false);
  };

  const getIcon = () => {
    if (CustomIcon) {
      return <CustomIcon className="w-8 h-8" />;
    }

    switch (finalVariant) {
      case 'destructive':
        return <AlertTriangle className="w-8 h-8" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8" />;
      case 'info':
        return <Info className="w-8 h-8" />;
      case 'success':
        return <CheckCircle className="w-8 h-8" />;
      default:
        return <AlertCircle className="w-8 h-8" />;
    }
  };

  const getConfirmButtonProps = () => {
    switch (finalVariant) {
      case 'destructive':
        return { variant: 'destructive', icon: Trash2 };
      case 'warning':
        return { variant: 'warning' };
      case 'success':
        return { variant: 'success', icon: Save };
      default:
        return { variant: 'primary' };
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      showCloseButton={showCloseButton}
      size="responsive"
      className={cn('max-w-md', className)}
      {...props}
    >
      <div className={cn(confirmDialogVariants({ variant: finalVariant, size }))}>
        {/* Icon */}
        <div className={cn(iconVariants({ variant: finalVariant }))}>
          {getIcon()}
        </div>

        {/* Title */}
        {title && (
          <h2 className={cn(
            'text-xl font-semibold text-text-dark mb-3',
            titleClassName
          )}>
            {title}
          </h2>
        )}

        {/* Description */}
        {description && (
          <p className={cn(
            'text-text-muted leading-relaxed mb-6',
            descriptionClassName
          )}>
            {description}
          </p>
        )}

        {/* Custom Content */}
        {children}

        {/* Action Buttons */}
        <div className={cn(
          'flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-center pt-4',
          actionsClassName
        )}>
          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isConfirming}
            className="order-2 sm:order-1 min-h-[48px] sm:min-h-[44px] flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {cancelText}
          </Button>

          {/* Confirm Button */}
          <Button
            {...getConfirmButtonProps()}
            onClick={handleConfirm}
            loading={isConfirming}
            disabled={disabled}
            className="order-1 sm:order-2 min-h-[48px] sm:min-h-[44px] flex-1 sm:flex-none sm:min-w-[120px]"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

ConfirmDialog.displayName = 'ConfirmDialog';

// Pre-built ConfirmDialog variants for common use cases

export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  itemName,
  itemType = 'item',
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="destructive"
    title={`Delete ${itemType}?`}
    description={
      itemName
        ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
        : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`
    }
    confirmText="Delete"
    cancelText="Keep"
    className={className}
    {...props}
  />
);

export const SaveConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  hasChanges = true,
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="info"
    title="Save Changes?"
    description={
      hasChanges
        ? "You have unsaved changes. Would you like to save them before continuing?"
        : "Would you like to save your work?"
    }
    confirmText="Save"
    cancelText="Don't Save"
    className={className}
    {...props}
  />
);

export const UnsavedChangesDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  destination = 'leave this page',
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="warning"
    title="Unsaved Changes"
    description={`You have unsaved changes that will be lost if you ${destination}. Are you sure you want to continue?`}
    confirmText="Leave"
    cancelText="Stay"
    className={className}
    {...props}
  />
);

export const LogoutConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="info"
    title="Sign Out?"
    description="Are you sure you want to sign out of your account?"
    confirmText="Sign Out"
    cancelText="Stay Signed In"
    className={className}
    {...props}
  />
);

export const ResetConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  dataType = 'data',
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="warning"
    title="Reset Data?"
    description={`This will reset all ${dataType} to their default values. This action cannot be undone.`}
    confirmText="Reset"
    cancelText="Cancel"
    className={className}
    {...props}
  />
);

export const PublishConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  itemType = 'content',
  visibility = 'public',
  className,
  ...props
}) => (
  <ConfirmDialog
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
    onCancel={onCancel}
    variant="success"
    title={`Publish ${itemType}?`}
    description={`This will make your ${itemType} ${visibility}ly available. You can change this later if needed.`}
    confirmText="Publish"
    cancelText="Keep Draft"
    className={className}
    {...props}
  />
);

// Utility hooks for common confirm dialog patterns
export const useConfirmDialog = (initialOpen = false) => {
  const [open, setOpen] = useState(initialOpen);
  const [loading, setLoading] = useState(false);

  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);

  const confirm = async (action) => {
    setLoading(true);
    try {
      await action();
      setOpen(false);
    } catch (error) {
      console.error('Confirm dialog error:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    open,
    setOpen,
    openDialog,
    closeDialog,
    confirm,
    loading,
  };
};

export const useDeleteConfirm = (onDelete, itemName = '') => {
  const { open, openDialog, closeDialog, confirm, loading } = useConfirmDialog();

  const handleDelete = () => {
    confirm(onDelete);
  };

  return {
    open,
    openDialog,
    closeDialog,
    handleDelete,
    loading,
    DeleteDialog: (props) => (
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        onCancel={closeDialog}
        itemName={itemName}
        loading={loading}
        {...props}
      />
    ),
  };
};

// Simple confirm function for programmatic usage
export const confirm = (options = {}) => {
  return new Promise((resolve) => {
    const {
      title = 'Confirm',
      description = 'Are you sure?',
      confirmText = 'Yes',
      cancelText = 'No',
      variant = 'default',
      ...rest
    } = options;

    // This would need to be integrated with a global dialog provider
    // For now, it's a placeholder for the API we want
    console.log('Confirm dialog would show:', { title, description, confirmText, cancelText, variant, ...rest });
    resolve(window.confirm(`${title}\n${description}`));
  });
};

export default ConfirmDialog;