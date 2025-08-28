/**
 * Comprehensive UI Component Library Index
 * Aaroth Fresh - Organic Futurism Design System
 */

// Base Components
import Button from './Button';
import { Input } from './Input';
import { Modal, ModalHeader, ModalBody, ModalFooter, Drawer } from './Modal';
import { Card, ProductCard, StatCard } from './Card';
import StatusBadge, { VerificationBadge, UserStatusBadge, OrderStatusBadge, RiskBadge, UrgencyBadge, PerformanceBadge } from './StatusBadge';
import ProgressBar, { WorkflowProgress, LinearProgress, PercentageProgress, VerticalWorkflow } from './ProgressBar';

export { 
  Button, 
  Input, 
  Modal, ModalHeader, ModalBody, ModalFooter, Drawer, 
  Card, ProductCard, StatCard,
  StatusBadge, VerificationBadge, UserStatusBadge, OrderStatusBadge, RiskBadge, UrgencyBadge, PerformanceBadge,
  ProgressBar, WorkflowProgress, LinearProgress, PercentageProgress, VerticalWorkflow
};

// Loading Components
export {
  default as LoadingSpinner,
  DotsSpinner,
  PulseSpinner,
  LoadingOverlay,
  InlineLoading,
  SkeletonLine,
  SkeletonCircle,
  SkeletonLoader,
  CardSkeleton,
  SkeletonTable,
  FloatingLoader,
} from './LoadingSpinner';

// Enhanced Skeleton Components
export {
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
  // Admin-enhanced skeletons
  WorkflowSkeleton,
  AdminTableSkeleton,
  AnalyticsDashboardSkeleton,
} from './skeletons';

// Form Components
export {
  default as FormField,
  ErrorMessage,
  SuccessMessage,
  WarningMessage,
  FormGroup,
  FormActions,
  HelpText,
  FormSection,
  FieldArray,
} from './FormField';

export { default as FileUpload, CompactFileUpload } from './FileUpload';

// Data Display Components
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  DataTable,
  MobileTable,
  TableSkeleton,
} from './Table';

export {
  default as Pagination,
  SimplePagination,
  MobilePagination,
  CompactPagination,
  LoadMore,
  InfiniteScrollTrigger,
} from './Pagination';

export {
  default as EmptyState,
  NoSearchResults,
  EmptyCart,
  NoProducts,
  NoFavorites,
  ErrorState,
  // Backward compatibility
  SearchEmptyState,
  ProductsEmptyState,
  OrdersEmptyState,
  ErrorEmptyState,
  CreateEmptyState,
} from './EmptyState';

export { default as SearchBar, CompactSearchBar } from './SearchBar';

// Feedback Components
export {
  Toast,
  ToastContainer,
  SuccessToast,
  ErrorToast,
  WarningToast,
  InfoToast,
  LoadingToast,
  toast,
  promiseToast,
} from './Toast';

// Error Boundary Components
export {
  default as ErrorBoundary,
  AdminErrorBoundary,
  VendorErrorBoundary,
  RestaurantErrorBoundary,
  useErrorHandler,
} from '../common/ErrorBoundary';

export {
  default as ConfirmDialog,
  DeleteConfirmDialog,
  SaveConfirmDialog,
  UnsavedChangesDialog,
  LogoutConfirmDialog,
  ResetConfirmDialog,
  PublishConfirmDialog,
  useConfirmDialog,
  useDeleteConfirm,
} from './ConfirmDialog';

export {
  default as AlertBanner,
  MaintenanceBanner,
  UpdateBanner,
  ErrorBanner,
  OfflineBanner,
  CookieBanner,
  FeatureBanner,
  useAlertBanner,
} from './AlertBanner';

// Navigation Components
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  ScrollableTabs,
  NavigationTabs,
  SettingsTabs,
  CardTabs,
  AnimatedTabsContent,
  useTabs,
} from './Tabs';

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
  SelectDropdown,
  ActionMenuDropdown,
  ProfileDropdown,
  FilterDropdown,
  useDropdown,
  useSelectDropdown,
} from './Dropdown';

// Utility exports
export { cn } from '../../utils';

// Component collections removed to prevent import issues
// All components are available as individual named exports

// Design system utilities
export const DesignSystem = {
  // Color variants for consistent theming
  variants: {
    success: 'mint-fresh',
    error: 'tomato-red',
    warning: 'earthy-yellow',
    info: 'blue',
    primary: 'bottle-green',
    secondary: 'earthy-brown',
    default: 'text-dark',
  },

  // Common sizes
  sizes: {
    xs: 'extra small',
    sm: 'small',
    default: 'default',
    md: 'medium',
    lg: 'large',
    xl: 'extra large',
    '2xl': 'double extra large',
  },

  // Touch targets (mobile-first)
  touchTargets: {
    minimum: '44px', // Mobile minimum
    recommended: '48px', // Comfortable touch
    large: '56px', // Easy interaction
  },

  // Animation durations
  animations: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    cinematic: '800ms',
  },
};

// Accessibility helpers
export const A11y = {
  // ARIA helpers
  announceToScreenReader: (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },

  // Focus management
  trapFocus: (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    return {
      focusFirst: () => firstElement?.focus(),
      focusLast: () => lastElement?.focus(),
      elements: focusableElements,
    };
  },
};

// Performance utilities
export const Performance = {
  // Lazy loading wrapper
  lazy: (importFunc, fallback = null) => {
    return React.lazy(importFunc);
  },

  // Debounce utility
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle utility
  throttle: (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};
