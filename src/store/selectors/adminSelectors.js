import { createSelector } from '@reduxjs/toolkit';
import { selectAuth } from '../slices/authSlice';

// Base admin selector
export const selectIsAdmin = createSelector(
  [selectAuth],
  (auth) => auth.user?.role === 'admin'
);

// Admin permissions selector
export const selectAdminPermissions = createSelector([selectAuth], (auth) => {
  if (auth.user?.role !== 'admin') return [];

  // For admin role, return all permissions
  // In a real app, these might come from the user object or be fetched separately
  return [
    'admin.users.manage',
    'admin.vendors.approve',
    'admin.users.delete',
    'admin.users.view',
    'admin.products.manage',
    'admin.categories.manage',
    'admin.listings.view',
    'admin.analytics.view',
    'admin.system.health',
    'admin.data.export',
    'admin.system.manage',
    'admin.audit.view',
  ];
});

// Check if admin has specific permission
export const selectHasAdminPermission = (permission) =>
  createSelector([selectAdminPermissions], (permissions) =>
    permissions.includes(permission)
  );

// Admin user info selector
export const selectAdminUser = createSelector([selectAuth], (auth) =>
  auth.user?.role === 'admin' ? auth.user : null
);

// Admin dashboard access selector
export const selectCanAccessAdminDashboard = createSelector(
  [selectIsAdmin, selectAuth],
  (isAdmin, auth) => isAdmin && auth.isAuthenticated
);

// Admin navigation items selector (filtered by permissions)
export const selectAdminNavigationItems = createSelector(
  [selectAdminPermissions],
  (permissions) => {
    const allNavItems = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        requiredPermission: 'admin.analytics.view',
      },
      {
        id: 'users',
        label: 'User Management',
        path: '/admin/users',
        requiredPermission: 'admin.users.manage',
      },
      {
        id: 'approvals',
        label: 'Vendor Approvals',
        path: '/admin/users/approvals',
        requiredPermission: 'admin.vendors.approve',
      },
      {
        id: 'products',
        label: 'Product Management',
        path: '/admin/products',
        requiredPermission: 'admin.products.manage',
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/admin/analytics',
        requiredPermission: 'admin.analytics.view',
      },
    ];

    // Filter nav items based on permissions
    return allNavItems.filter(
      (item) =>
        !item.requiredPermission ||
        permissions.includes(item.requiredPermission)
    );
  }
);

// Bulk operation permissions
export const selectCanBulkApprove = createSelector(
  [selectAdminPermissions],
  (permissions) => permissions.includes('admin.vendors.approve')
);

export const selectCanBulkDelete = createSelector(
  [selectAdminPermissions],
  (permissions) => permissions.includes('admin.users.delete')
);

export const selectCanManageProducts = createSelector(
  [selectAdminPermissions],
  (permissions) => permissions.includes('admin.products.manage')
);

export const selectCanExportData = createSelector(
  [selectAdminPermissions],
  (permissions) => permissions.includes('admin.data.export')
);

// Admin metrics and stats selectors
export const selectAdminStats = createSelector(
  [(state) => state.api],
  (api) => {
    // Get cached dashboard data if available
    const dashboardData = Object.values(api.queries).find(
      (query) => query?.endpointName === 'getAdminDashboard'
    )?.data;

    return {
      totalUsers: dashboardData?.data?.totalUsers || 0,
      pendingApprovals: dashboardData?.data?.pendingApprovals || 0,
      activeVendors: dashboardData?.data?.activeVendors || 0,
      totalOrders: dashboardData?.data?.totalOrders || 0,
      loading: Object.values(api.queries).some(
        (query) =>
          query?.endpointName === 'getAdminDashboard' &&
          query?.status === 'pending'
      ),
    };
  }
);

export default {
  selectIsAdmin,
  selectAdminPermissions,
  selectHasAdminPermission,
  selectAdminUser,
  selectCanAccessAdminDashboard,
  selectAdminNavigationItems,
  selectCanBulkApprove,
  selectCanBulkDelete,
  selectCanManageProducts,
  selectCanExportData,
  selectAdminStats,
};
