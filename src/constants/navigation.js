import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Store,
  Utensils,
  ClipboardList,
  UserCheck,
  TrendingUp,
  Bell,
  User,
  MapPin,
  Tag,
  CheckCircle,
  Target,
  DollarSign,
  FileText,
  Star,
  MessageSquare,
} from 'lucide-react';

// Navigation items configuration with role-based access
export const NAVIGATION_ITEMS = {
  // Admin Navigation
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
      roles: ['admin'],
    },
    {
      id: 'approvals',
      label: 'Approval Management',
      icon: CheckCircle,
      path: '/admin/approvals',
      roles: ['admin'],
      description: 'Review and approve vendor/buyer applications',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      roles: ['admin'],
      children: [
        {
          id: 'vendors',
          label: 'All Vendors',
          path: '/admin/users/vendors',
        },
        {
          id: 'buyers',
          label: 'All Buyers',
          path: '/admin/users/buyers',
        },
        {
          id: 'approvals',
          label: 'Pending Approvals',
          path: '/admin/users/approvals',
        },
      ],
    },
    {
      id: 'buyer-management',
      label: 'Buyer Management',
      icon: Utensils,
      path: '/admin/buyers',
      roles: ['admin'],
      children: [
        {
          id: 'create-owner',
          label: 'Create Buyer Owner',
          path: '/admin/create-buyer-owner',
        },
        {
          id: 'create-manager',
          label: 'Create Buyer Manager',
          path: '/admin/create-buyer-manager',
        },
      ],
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      path: '/admin/categories',
      roles: ['admin'],
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      path: '/admin/products',
      roles: ['admin'],
    },
    {
      id: 'listings',
      label: 'Vendor Listings',
      icon: Store,
      path: '/admin/listings',
      roles: ['admin'],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      path: '/admin/settings',
      roles: ['admin'],
    },
  ],

  // Vendor Navigation
  vendor: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/vendor/dashboard',
      roles: ['vendor'],
    },
    {
      id: 'listings',
      label: 'My Listings',
      icon: Store,
      path: '/vendor/listings',
      roles: ['vendor'],
      children: [
        {
          id: 'create',
          label: 'Create Listing',
          path: '/vendor/listings/create',
        },
        {
          id: 'manage',
          label: 'Manage Listings',
          path: '/vendor/listings/manage',
        },
      ],
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      path: '/vendor/orders',
      roles: ['vendor'],
      children: [
        {
          id: 'pending',
          label: 'Pending Orders',
          path: '/vendor/orders/pending',
        },
        {
          id: 'completed',
          label: 'Completed Orders',
          path: '/vendor/orders/completed',
        },
      ],
    },
    {
      id: 'analytics',
      label: 'Sales Analytics',
      icon: TrendingUp,
      path: '/vendor/analytics',
      roles: ['vendor'],
    },
    {
      id: 'financial-reports',
      label: 'Financial Reports',
      icon: FileText,
      path: '/vendor/financial-reports',
      roles: ['vendor'],
    },
    {
      id: 'customers',
      label: 'Customer Management',
      icon: Users,
      path: '/vendor/customers',
      roles: ['vendor'],
    },
    {
      id: 'reviews',
      label: 'Reviews & Ratings',
      icon: Star,
      path: '/vendor/reviews',
      roles: ['vendor'],
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/vendor/notifications',
      roles: ['vendor'],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/vendor/profile',
      roles: ['vendor'],
    },
  ],

  // Buyer Owner/Manager Navigation
  buyer: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/buyer/dashboard',
      roles: ['buyerOwner', 'buyerManager'],
    },
    {
      id: 'browse',
      label: 'Browse Products',
      icon: Package,
      path: '/buyer/browse',
      roles: ['buyerOwner', 'buyerManager'],
    },
    {
      id: 'cart',
      label: 'Shopping Cart',
      icon: ShoppingCart,
      path: '/buyer/cart',
      roles: ['buyerOwner', 'buyerManager'],
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: ClipboardList,
      path: '/buyer/orders',
      roles: ['buyerOwner', 'buyerManager'],
      children: [
        {
          id: 'current',
          label: 'Current Orders',
          path: '/buyer/orders?filter=current',
        },
        {
          id: 'history',
          label: 'Order History',
          path: '/buyer/orders?filter=history',
        },
      ],
    },
    {
      id: 'budget',
      label: 'Budget Management',
      icon: Target,
      path: '/buyer/budget',
      roles: ['buyerOwner', 'buyerManager'],
    },
    {
      id: 'buyer-management',
      label: 'Buyer Business',
      icon: Utensils,
      path: '/buyer/manage',
      roles: ['buyerOwner', 'buyerManager'],
      children: [
        {
          id: 'profile',
          label: 'Business Profile',
          path: '/buyer/profile', // Use the simpler path that both roles can access
          roles: ['buyerOwner', 'buyerManager'],
        },
        {
          id: 'locations',
          label: 'Locations',
          path: '/buyer/manage/locations',
          roles: ['buyerOwner'], // Only owners can manage locations
        },
        {
          id: 'managers',
          label: 'Managers',
          path: '/buyer/manage/managers',
          roles: ['buyerOwner'], // Only owners can manage managers
        },
      ],
    },
  ],

  // Public/Guest Navigation (before login)
  public: [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      roles: ['public'],
    },
    {
      id: 'about',
      label: 'About',
      icon: User,
      path: '/about',
      roles: ['public'],
    },
  ],
};

// Mobile bottom navigation items (filtered by role)
export const MOBILE_BOTTOM_NAV = {
  admin: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/admin/dashboard',
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ],
  vendor: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/vendor/dashboard',
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: Store,
      path: '/vendor/listings',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      path: '/vendor/orders',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      path: '/vendor/notifications',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/vendor/profile',
    },
  ],
  buyer: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/buyer/dashboard',
    },
    {
      id: 'browse',
      label: 'Browse',
      icon: Package,
      path: '/buyer/browse',
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      path: '/buyer/cart',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      path: '/buyer/orders',
    },
  ],
  public: [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
    },
    {
      id: 'about',
      label: 'About',
      icon: User,
      path: '/about',
    },
  ],
};

// Header user menu items
export const USER_MENU_ITEMS = [
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    action: 'navigate',
    path: '/profile',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    action: 'navigate',
    path: '/notifications',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    action: 'navigate',
    path: '/settings',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: null,
    action: 'logout',
    className: 'text-tomato-red hover:bg-tomato-red/5',
  },
];

// Utility function to filter navigation items by user role
export const getNavigationForRole = (role) => {
  if (!role) return NAVIGATION_ITEMS.public;

  switch (role) {
    case 'admin':
      return NAVIGATION_ITEMS.admin;
    case 'vendor':
      return NAVIGATION_ITEMS.vendor;
    case 'buyerOwner':
    case 'buyerManager':
      return NAVIGATION_ITEMS.buyer;
    default:
      return NAVIGATION_ITEMS.public;
  }
};

// Utility function to get mobile bottom navigation for role
export const getMobileNavigationForRole = (role) => {
  if (!role) return MOBILE_BOTTOM_NAV.public;

  switch (role) {
    case 'admin':
      return MOBILE_BOTTOM_NAV.admin;
    case 'vendor':
      return MOBILE_BOTTOM_NAV.vendor;
    case 'buyerOwner':
    case 'buyerManager':
      return MOBILE_BOTTOM_NAV.buyer;
    default:
      return MOBILE_BOTTOM_NAV.public;
  }
};

// Utility function to check if user has access to a navigation item
export const hasAccessToNavItem = (item, userRole) => {
  if (!item.roles) return true;
  return item.roles.includes(userRole) || item.roles.includes('public');
};
