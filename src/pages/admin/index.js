// Admin Pages Index
export { default as AdminDashboard } from './AdminDashboard';
export { default as UserManagement } from './UserManagement';
export { default as VendorApproval } from './VendorApproval';
export { default as ProductManagement } from './ProductManagement';
export { default as AnalyticsDashboard } from './AnalyticsDashboard';

// Admin-specific permissions and utilities
export const ADMIN_PERMISSIONS = {
  // User Management
  MANAGE_USERS: 'admin.users.manage',
  APPROVE_VENDORS: 'admin.vendors.approve',
  DELETE_USERS: 'admin.users.delete',
  VIEW_USER_DETAILS: 'admin.users.view',
  
  // Product Management
  MANAGE_PRODUCTS: 'admin.products.manage',
  MANAGE_CATEGORIES: 'admin.categories.manage',
  VIEW_ALL_LISTINGS: 'admin.listings.view',
  
  // Analytics
  VIEW_ANALYTICS: 'admin.analytics.view',
  VIEW_SYSTEM_HEALTH: 'admin.system.health',
  EXPORT_DATA: 'admin.data.export',
  
  // System Management
  MANAGE_SYSTEM_SETTINGS: 'admin.system.manage',
  VIEW_AUDIT_LOGS: 'admin.audit.view',
};

// Check if current user has admin permissions
export const hasAdminPermission = (user, permission) => {
  return user?.role === 'admin' && ADMIN_PERMISSIONS[permission];
};

// Get admin route configuration
export const getAdminRoutes = () => [
  {
    path: '/admin',
    redirectTo: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    component: 'AdminDashboard',
    title: 'Dashboard',
    permissions: [ADMIN_PERMISSIONS.VIEW_ANALYTICS]
  },
  {
    path: '/admin/users',
    component: 'UserManagement',
    title: 'User Management',
    permissions: [ADMIN_PERMISSIONS.MANAGE_USERS]
  },
  {
    path: '/admin/users/approvals',
    component: 'VendorApproval',
    title: 'Vendor Approvals',
    permissions: [ADMIN_PERMISSIONS.APPROVE_VENDORS]
  },
  {
    path: '/admin/products',
    component: 'ProductManagement',
    title: 'Product Management',
    permissions: [ADMIN_PERMISSIONS.MANAGE_PRODUCTS]
  },
  {
    path: '/admin/analytics',
    component: 'AnalyticsDashboard',
    title: 'Analytics',
    permissions: [ADMIN_PERMISSIONS.VIEW_ANALYTICS]
  }
];