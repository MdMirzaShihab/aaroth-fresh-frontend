import React from 'react';
import { cn } from '../../utils';
import { SkeletonLine, SkeletonCircle, CardSkeleton } from './LoadingSpinner';

/**
 * Component-Specific Skeleton States
 * Following CLAUDE.md patterns for zen-like patience
 */

// Button Skeleton
export const ButtonSkeleton = ({
  className,
  size = 'default',
  variant = 'default',
  ...props
}) => {
  const sizeClasses = {
    sm: 'h-8 w-20',
    default: 'h-11 w-24',
    lg: 'h-12 w-28',
  };

  return (
    <SkeletonLine
      className={cn('rounded-2xl', sizeClasses[size], className)}
      {...props}
    />
  );
};

// Input Skeleton
export const InputSkeleton = ({ className, hasLabel = false, ...props }) => (
  <div className={cn('space-y-2', className)} {...props}>
    {hasLabel && <SkeletonLine height="h-4" width="w-20" />}
    <SkeletonLine height="h-11" width="w-full" className="rounded-2xl" />
  </div>
);

// Modal Skeleton
export const ModalSkeleton = ({ className, ...props }) => (
  <div className={cn('space-y-6', className)} {...props}>
    {/* Header */}
    <div className="space-y-3">
      <SkeletonLine height="h-6" width="w-48" />
      <SkeletonLine height="h-4" width="w-80" />
    </div>

    {/* Content */}
    <div className="space-y-4">
      <SkeletonLine height="h-4" width="w-full" />
      <SkeletonLine height="h-4" width="w-3/4" />
      <SkeletonLine height="h-4" width="w-5/6" />
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-3">
      <ButtonSkeleton />
      <ButtonSkeleton />
    </div>
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 4, className, ...props }) => (
  <div className={cn('space-y-6', className)} {...props}>
    {Array.from({ length: fields }).map((_, i) => (
      <InputSkeleton key={i} hasLabel />
    ))}

    {/* Form Actions */}
    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
      <ButtonSkeleton variant="outline" />
      <ButtonSkeleton />
    </div>
  </div>
);

// Search Bar Skeleton
export const SearchBarSkeleton = ({
  showFilters = false,
  className,
  ...props
}) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>
    <SkeletonLine height="h-11" width="flex-1" className="rounded-2xl" />
    {showFilters && (
      <SkeletonLine height="h-11" width="w-20" className="rounded-2xl" />
    )}
    <SkeletonLine height="h-11" width="w-24" className="rounded-2xl" />
  </div>
);

// Pagination Skeleton
export const PaginationSkeleton = ({ className, ...props }) => (
  <div
    className={cn('flex items-center justify-center gap-2', className)}
    {...props}
  >
    <SkeletonLine height="h-11" width="w-20" className="rounded-2xl" />
    <SkeletonLine height="h-11" width="w-11" className="rounded-2xl" />
    <SkeletonLine height="h-11" width="w-11" className="rounded-2xl" />
    <SkeletonLine height="h-11" width="w-11" className="rounded-2xl" />
    <SkeletonLine height="h-11" width="w-20" className="rounded-2xl" />
  </div>
);

// Tabs Skeleton
export const TabsSkeleton = ({ tabs = 4, className, ...props }) => (
  <div className={cn('space-y-4', className)} {...props}>
    {/* Tab Headers */}
    <div className="flex items-center gap-1 bg-earthy-beige/20 p-1 rounded-3xl">
      {Array.from({ length: tabs }).map((_, i) => (
        <SkeletonLine
          key={i}
          height="h-10"
          width="w-20"
          className="rounded-2xl"
        />
      ))}
    </div>

    {/* Tab Content */}
    <div className="space-y-3">
      <SkeletonLine height="h-4" width="w-full" />
      <SkeletonLine height="h-4" width="w-4/5" />
      <SkeletonLine height="h-4" width="w-3/4" />
    </div>
  </div>
);

// Dropdown Skeleton
export const DropdownSkeleton = ({ className, ...props }) => (
  <SkeletonLine
    height="h-11"
    width="w-48"
    className={cn('rounded-2xl', className)}
    {...props}
  />
);

// Alert Banner Skeleton
export const AlertBannerSkeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'w-full p-4 border border-gray-200 rounded-2xl bg-earthy-beige/10 animate-pulse',
      className
    )}
    {...props}
  >
    <div className="flex items-start gap-3">
      <SkeletonCircle size="w-5 h-5" />
      <div className="flex-1 space-y-2">
        <SkeletonLine height="h-4" width="w-32" />
        <SkeletonLine height="h-3" width="w-full" />
      </div>
    </div>
  </div>
);

// Toast Skeleton
export const ToastSkeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'p-4 rounded-2xl shadow-lg backdrop-blur-sm border border-white/50 bg-white/90 animate-pulse max-w-sm',
      className
    )}
    {...props}
  >
    <div className="flex items-start gap-3">
      <SkeletonCircle size="w-5 h-5" />
      <div className="flex-1 space-y-2">
        <SkeletonLine height="h-4" width="w-24" />
        <SkeletonLine height="h-3" width="w-full" />
      </div>
    </div>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = ({
  className,
  showDetails = true,
  ...props
}) => (
  <div className={cn('flex items-center gap-3', className)} {...props}>
    <SkeletonCircle size="w-12 h-12" />
    {showDetails && (
      <div className="space-y-2">
        <SkeletonLine height="h-4" width="w-24" />
        <SkeletonLine height="h-3" width="w-32" />
      </div>
    )}
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton = ({ items = 5, className, ...props }) => (
  <nav className={cn('space-y-2', className)} {...props}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <SkeletonCircle size="w-5 h-5" />
        <SkeletonLine height="h-4" width="w-20" />
      </div>
    ))}
  </nav>
);

// Dashboard Grid Skeleton
export const DashboardSkeleton = ({
  stats = 4,
  charts = 2,
  className,
  ...props
}) => (
  <div className={cn('space-y-8', className)} {...props}>
    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: stats }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="space-y-3">
            <SkeletonLine height="h-4" width="w-16" />
            <SkeletonLine height="h-8" width="w-20" />
            <SkeletonLine height="h-3" width="w-24" />
          </div>
        </div>
      ))}
    </div>

    {/* Charts Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {Array.from({ length: charts }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 animate-pulse"
        >
          <div className="space-y-4">
            <SkeletonLine height="h-6" width="w-32" />
            <SkeletonLine
              height="h-64"
              width="w-full"
              className="rounded-2xl"
            />
          </div>
        </div>
      ))}
    </div>

    {/* Data Table */}
    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="p-6 border-b border-gray-200">
        <SkeletonLine height="h-6" width="w-40" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-6 flex items-center gap-4">
            <SkeletonCircle size="w-10 h-10" />
            <div className="flex-1 space-y-2">
              <SkeletonLine height="h-4" width="w-32" />
              <SkeletonLine height="h-3" width="w-48" />
            </div>
            <SkeletonLine height="h-8" width="w-16" className="rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = ({
  showAvatar = true,
  showActions = true,
  className,
  ...props
}) => (
  <div className={cn('flex items-center gap-4 p-4', className)} {...props}>
    {showAvatar && <SkeletonCircle size="w-10 h-10" />}
    <div className="flex-1 space-y-2">
      <SkeletonLine height="h-4" width="w-32" />
      <SkeletonLine height="h-3" width="w-48" />
    </div>
    {showActions && (
      <div className="flex gap-2">
        <SkeletonLine height="h-8" width="w-16" className="rounded-xl" />
        <SkeletonLine height="h-8" width="w-8" className="rounded-xl" />
      </div>
    )}
  </div>
);

// Sidebar Skeleton
export const SidebarSkeleton = ({ className, ...props }) => (
  <div
    className={cn(
      'w-64 bg-white border-r border-gray-200 p-4 space-y-8',
      className
    )}
    {...props}
  >
    {/* Logo */}
    <SkeletonLine height="h-8" width="w-32" className="rounded-xl" />

    {/* Navigation */}
    <NavigationSkeleton items={6} />

    {/* Profile */}
    <div className="border-t border-gray-200 pt-4">
      <ProfileSkeleton />
    </div>
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton = ({
  showBreadcrumb = true,
  showActions = true,
  className,
  ...props
}) => (
  <div className={cn('space-y-4', className)} {...props}>
    {showBreadcrumb && (
      <div className="flex items-center gap-2">
        <SkeletonLine height="h-3" width="w-16" />
        <span className="text-text-muted">/</span>
        <SkeletonLine height="h-3" width="w-20" />
      </div>
    )}

    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonLine height="h-8" width="w-48" />
        <SkeletonLine height="h-4" width="w-64" />
      </div>

      {showActions && (
        <div className="flex gap-3">
          <ButtonSkeleton variant="outline" />
          <ButtonSkeleton />
        </div>
      )}
    </div>
  </div>
);

// Content Skeleton (Generic page content)
export const ContentSkeleton = ({ sections = 3, className, ...props }) => (
  <div className={cn('space-y-8', className)} {...props}>
    {Array.from({ length: sections }).map((_, i) => (
      <div key={i} className="space-y-4">
        <SkeletonLine height="h-6" width="w-40" />
        <div className="space-y-3">
          <SkeletonLine height="h-4" width="w-full" />
          <SkeletonLine height="h-4" width="w-5/6" />
          <SkeletonLine height="h-4" width="w-4/5" />
        </div>
      </div>
    ))}
  </div>
);

// Full Page Skeleton
export const PageSkeleton = ({ hasSidebar = true, className, ...props }) => (
  <div className={cn('flex min-h-screen bg-gray-50', className)} {...props}>
    {hasSidebar && <SidebarSkeleton />}

    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <PageHeaderSkeleton />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <ContentSkeleton />
      </main>
    </div>
  </div>
);

export default {
  ButtonSkeleton,
  InputSkeleton,
  ModalSkeleton,
  FormSkeleton,
  SearchBarSkeleton,
  PaginationSkeleton,
  TabsSkeleton,
  DropdownSkeleton,
  AlertBannerSkeleton,
  ToastSkeleton,
  ProfileSkeleton,
  NavigationSkeleton,
  DashboardSkeleton,
  ListItemSkeleton,
  SidebarSkeleton,
  PageHeaderSkeleton,
  ContentSkeleton,
  PageSkeleton,
};
