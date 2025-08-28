/**
 * StatusBadge - Enhanced UI Component
 * Business-specific status indicators for all dashboards (admin, vendor, restaurant)
 * Supports verification, approval, risk, urgency, and business status types
 */

import React from 'react';
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  User,
  Store,
  Package,
  TrendingUp,
  Shield,
} from 'lucide-react';

const StatusBadge = ({
  status,
  type = 'verification',
  size = 'default',
  showIcon = true,
  className = '',
  customLabel = null,
}) => {
  const getStatusConfig = () => {
    const configs = {
      // Verification statuses (admin, vendor, restaurant)
      verification: {
        pending: {
          label: 'Pending',
          icon: Clock,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        approved: {
          label: 'Approved',
          icon: CheckCircle,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        rejected: {
          label: 'Rejected',
          icon: XCircle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
        under_review: {
          label: 'Under Review',
          icon: AlertTriangle,
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
          darkClasses:
            'dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        },
      },

      // User statuses (all dashboards)
      user: {
        active: {
          label: 'Active',
          icon: User,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        inactive: {
          label: 'Inactive',
          icon: User,
          classes: 'bg-gray-100 text-gray-600 border-gray-200',
          darkClasses:
            'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
        },
        suspended: {
          label: 'Suspended',
          icon: AlertTriangle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
        pending_approval: {
          label: 'Pending Approval',
          icon: Clock,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
      },

      // Business compliance statuses
      business: {
        compliant: {
          label: 'Compliant',
          icon: CheckCircle,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        minor_issues: {
          label: 'Minor Issues',
          icon: AlertTriangle,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        major_issues: {
          label: 'Major Issues',
          icon: XCircle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
      },

      // Urgency levels (all dashboards)
      urgency: {
        low: {
          label: 'Low',
          icon: Clock,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        medium: {
          label: 'Medium',
          icon: Clock,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        high: {
          label: 'High',
          icon: AlertTriangle,
          classes: 'bg-orange-100 text-orange-800 border-orange-200',
          darkClasses:
            'dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-700',
        },
        critical: {
          label: 'Critical',
          icon: AlertTriangle,
          classes:
            'bg-tomato-red/10 text-tomato-red border-tomato-red/20 animate-pulse',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
      },

      // Risk levels (all dashboards)
      risk: {
        low: {
          label: 'Low Risk',
          icon: Shield,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        medium: {
          label: 'Medium Risk',
          icon: AlertTriangle,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        high: {
          label: 'High Risk',
          icon: XCircle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
      },

      // Order statuses (restaurant, vendor dashboards)
      order: {
        pending: {
          label: 'Pending',
          icon: Clock,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        confirmed: {
          label: 'Confirmed',
          icon: CheckCircle,
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
          darkClasses:
            'dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        },
        preparing: {
          label: 'Preparing',
          icon: Package,
          classes: 'bg-purple-100 text-purple-800 border-purple-200',
          darkClasses:
            'dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700',
        },
        ready: {
          label: 'Ready',
          icon: Package,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        delivered: {
          label: 'Delivered',
          icon: CheckCircle,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        cancelled: {
          label: 'Cancelled',
          icon: XCircle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
      },

      // Performance statuses (vendor dashboards)
      performance: {
        excellent: {
          label: 'Excellent',
          icon: TrendingUp,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        good: {
          label: 'Good',
          icon: TrendingUp,
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
          darkClasses:
            'dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        },
        average: {
          label: 'Average',
          icon: TrendingUp,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        poor: {
          label: 'Poor',
          icon: AlertTriangle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
      },

      // Generic status (fallback for custom statuses)
      status: {
        success: {
          label: 'Success',
          icon: CheckCircle,
          classes: 'bg-mint-fresh/10 text-bottle-green border-mint-fresh/20',
          darkClasses:
            'dark:bg-mint-fresh/20 dark:text-mint-fresh dark:border-mint-fresh/30',
        },
        warning: {
          label: 'Warning',
          icon: AlertTriangle,
          classes: 'bg-amber-100 text-amber-800 border-amber-200',
          darkClasses:
            'dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700',
        },
        error: {
          label: 'Error',
          icon: XCircle,
          classes: 'bg-tomato-red/10 text-tomato-red border-tomato-red/20',
          darkClasses:
            'dark:bg-tomato-red/20 dark:text-tomato-red dark:border-tomato-red/30',
        },
        info: {
          label: 'Info',
          icon: AlertTriangle,
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
          darkClasses:
            'dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700',
        },
      },
    };

    return (
      configs[type]?.[status] || {
        label: customLabel || status,
        icon: AlertTriangle,
        classes: 'bg-gray-100 text-gray-600 border-gray-200',
        darkClasses: 'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
      }
    );
  };

  const getSizeClasses = () => {
    const sizes = {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-2 py-1 text-xs',
      default: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-5 py-2.5 text-lg',
    };
    return sizes[size] || sizes.default;
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-2 rounded-full font-medium border
        backdrop-blur-sm transition-all duration-200
        ${getSizeClasses()}
        ${config.classes}
        ${config.darkClasses}
        ${className}
      `}
      title={`${type}: ${config.label}`}
    >
      {showIcon && (
        <Icon
          className={`
            ${
              size === 'xs'
                ? 'w-3 h-3'
                : size === 'sm'
                  ? 'w-3 h-3'
                  : size === 'lg'
                    ? 'w-5 h-5'
                    : size === 'xl'
                      ? 'w-6 h-6'
                      : 'w-4 h-4'
            }
          `}
        />
      )}
      <span>{customLabel || config.label}</span>
    </span>
  );
};

// Predefined status badge components for common use cases
export const VerificationBadge = ({ status, ...props }) => (
  <StatusBadge type="verification" status={status} {...props} />
);

export const UserStatusBadge = ({ status, ...props }) => (
  <StatusBadge type="user" status={status} {...props} />
);

export const OrderStatusBadge = ({ status, ...props }) => (
  <StatusBadge type="order" status={status} {...props} />
);

export const RiskBadge = ({ status, ...props }) => (
  <StatusBadge type="risk" status={status} {...props} />
);

export const UrgencyBadge = ({ status, ...props }) => (
  <StatusBadge type="urgency" status={status} {...props} />
);

export const PerformanceBadge = ({ status, ...props }) => (
  <StatusBadge type="performance" status={status} {...props} />
);

export default StatusBadge;
