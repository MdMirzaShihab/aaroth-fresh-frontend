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
      id: 'users',
      label: 'User Management',
      icon: Users,
      path: '/admin/users',
      roles: ['admin'],
      children: [
        {
          id: 'vendors',
          label: 'Vendors',
          path: '/admin/users/vendors',
        },
        {
          id: 'restaurants',
          label: 'Restaurants',
          path: '/admin/users/restaurants',
        },
        {
          id: 'approvals',
          label: 'Pending Approvals',
          path: '/admin/users/approvals',
        },
      ],
    },
    {
      id: 'restaurant-management',
      label: 'Restaurant Management',
      icon: Utensils,
      path: '/admin/restaurants',
      roles: ['admin'],
      children: [
        {
          id: 'create-owner',
          label: 'Create Restaurant Owner',
          path: '/admin/create-restaurant-owner',
        },
        {
          id: 'create-manager',
          label: 'Create Restaurant Manager',
          path: '/admin/create-restaurant-manager',
        },
      ],
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: Package,
      path: '/admin/products',
      roles: ['admin'],
      children: [
        {
          id: 'categories',
          label: 'Categories',
          path: '/admin/products/categories',
        },
        {
          id: 'listings',
          label: 'All Listings',
          path: '/admin/products/listings',
        },
      ],
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
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/vendor/profile',
      roles: ['vendor'],
    },
  ],

  // Restaurant Owner/Manager Navigation
  restaurant: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/restaurant/dashboard',
      roles: ['restaurantOwner', 'restaurantManager'],
    },
    {
      id: 'browse',
      label: 'Browse Products',
      icon: Package,
      path: '/restaurant/browse',
      roles: ['restaurantOwner', 'restaurantManager'],
    },
    {
      id: 'cart',
      label: 'Shopping Cart',
      icon: ShoppingCart,
      path: '/restaurant/cart',
      roles: ['restaurantOwner', 'restaurantManager'],
    },
    {
      id: 'orders',
      label: 'My Orders',
      icon: ClipboardList,
      path: '/restaurant/orders',
      roles: ['restaurantOwner', 'restaurantManager'],
      children: [
        {
          id: 'current',
          label: 'Current Orders',
          path: '/restaurant/orders/current',
        },
        {
          id: 'history',
          label: 'Order History',
          path: '/restaurant/orders/history',
        },
      ],
    },
    {
      id: 'restaurant-management',
      label: 'Restaurant',
      icon: Utensils,
      path: '/restaurant/manage',
      roles: ['restaurantOwner'],
      children: [
        {
          id: 'profile',
          label: 'Restaurant Profile',
          path: '/restaurant/manage/profile',
        },
        {
          id: 'locations',
          label: 'Locations',
          path: '/restaurant/manage/locations',
        },
        {
          id: 'managers',
          label: 'Managers',
          path: '/restaurant/manage/managers',
          roles: ['restaurantOwner'], // Only owners can manage managers
        },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/restaurant/profile',
      roles: ['restaurantOwner', 'restaurantManager'],
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
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/vendor/profile',
    },
  ],
  restaurant: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/restaurant/dashboard',
    },
    {
      id: 'browse',
      label: 'Browse',
      icon: Package,
      path: '/restaurant/browse',
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      path: '/restaurant/cart',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ClipboardList,
      path: '/restaurant/orders',
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
    case 'restaurantOwner':
    case 'restaurantManager':
      return NAVIGATION_ITEMS.restaurant;
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
    case 'restaurantOwner':
    case 'restaurantManager':
      return MOBILE_BOTTOM_NAV.restaurant;
    default:
      return MOBILE_BOTTOM_NAV.public;
  }
};

// Utility function to check if user has access to a navigation item
export const hasAccessToNavItem = (item, userRole) => {
  if (!item.roles) return true;
  return item.roles.includes(userRole) || item.roles.includes('public');
};
