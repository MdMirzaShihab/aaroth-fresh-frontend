import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  refreshTokenStart,
  refreshTokenSuccess,
  refreshTokenFailure,
  logout,
} from './authSlice';

// Base URL for the API
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Enhanced base query with automatic token refresh
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken && !api.getState().auth.isRefreshing) {
      api.dispatch(refreshTokenStart());

      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
        api,
        extraOptions
      );

      if (refreshResult.data?.success) {
        api.dispatch(refreshTokenSuccess(refreshResult.data));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(refreshTokenFailure());
        api.dispatch(logout());
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Product',
    'Order',
    'Listing',
    'Category',
    'Vendor',
    'Restaurant',
    'Admin',
    'SystemHealth',
    'Approvals',
    'Notification',
    'Analytics',
    'SalesAnalytics',
    'UserAnalytics',
    'ProductAnalytics',
    'Settings',
    'FlaggedContent',
    'AdminDashboard',
    'Verification',
    'Status',
    'CategoryUsage',
  ],
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),

    // Admin approval endpoints - New unified approval system
    getAllApprovals: builder.query({
      query: (filters = {}) => ({
        url: '/admin/approvals',
        params: filters,
      }),
      providesTags: ['Approvals'],
    }),

    approveVendor: builder.mutation({
      query: ({ id, approvalNotes }) => ({
        url: `/admin/approvals/vendor/${id}/approve`,
        method: 'PUT',
        body: { approvalNotes },
      }),
      invalidatesTags: ['Approvals', 'User', 'Vendor'],
    }),

    rejectVendor: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/approvals/vendor/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Approvals', 'User', 'Vendor'],
    }),

    approveRestaurant: builder.mutation({
      query: ({ id, approvalNotes }) => ({
        url: `/admin/approvals/restaurant/${id}/approve`,
        method: 'PUT',
        body: { approvalNotes },
      }),
      invalidatesTags: ['Approvals', 'User', 'Restaurant'],
    }),

    rejectRestaurant: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/approvals/restaurant/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Approvals', 'User', 'Restaurant'],
    }),

    // Profile management endpoints
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData, // This can be FormData with optional profile image
        // Don't set Content-Type header - let browser set it for FormData
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
      invalidatesTags: ['User'],
    }),

    // Restaurant Manager endpoints (Restaurant Owner Only)
    createManager: builder.mutation({
      query: (managerData) => ({
        url: '/auth/create-manager',
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['User'],
    }),

    getManagers: builder.query({
      query: () => '/auth/managers',
      providesTags: ['User'],
    }),

    deactivateManager: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/auth/managers/${id}/deactivate`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    // Public endpoints
    getCategories: builder.query({
      query: () => '/public/categories',
      providesTags: ['Category'],
    }),

    getFeaturedProducts: builder.query({
      query: () => '/public/featured-listings',
      providesTags: ['Product'],
    }),

    getPublicProducts: builder.query({
      query: (params = {}) => ({
        url: '/public/products',
        params,
      }),
      providesTags: ['Product'],
    }),

    getPublicProduct: builder.query({
      query: (id) => `/public/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    // Public listings endpoint
    getPublicListings: builder.query({
      query: (params = {}) => ({
        url: '/public/listings',
        params,
      }),
      providesTags: ['Listing'],
    }),

    getPublicListing: builder.query({
      query: (id) => `/public/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    getFeaturedListings: builder.query({
      query: (params = {}) => ({
        url: '/public/featured-listings',
        params,
      }),
      providesTags: ['Product', 'Listing'],
    }),

    // Listings endpoints
    getListings: builder.query({
      query: (params = {}) => ({
        url: '/listings',
        params,
      }),
      providesTags: (result) => [
        { type: 'Listing', id: 'LIST' },
        ...(result?.data?.listings || []).map(({ id }) => ({
          type: 'Listing',
          id,
        })),
      ],
    }),

    getListingById: builder.query({
      query: (id) => `/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    getVendorListings: builder.query({
      query: (params = {}) => ({
        url: '/listings/vendor',
        params,
      }),
      providesTags: (result) => [
        { type: 'Listing', id: 'VENDOR_LIST' },
        ...(result?.data?.listings || []).map(({ id }) => ({
          type: 'Listing',
          id,
        })),
      ],
    }),

    getListing: builder.query({
      query: (id) => `/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    createListing: builder.mutation({
      query: (listingFormData) => {
        // Handle FormData for file uploads integrated with listing creation
        return {
          url: '/listings',
          method: 'POST',
          body: listingFormData, // This should be FormData object
          // Don't set Content-Type header - let browser set it for FormData
        };
      },
      invalidatesTags: [
        { type: 'Listing', id: 'LIST' },
        { type: 'Listing', id: 'VENDOR_LIST' },
      ],
    }),

    updateListing: builder.mutation({
      query: ({ id, formData }) => {
        // Handle FormData for file uploads integrated with listing updates
        return {
          url: `/listings/${id}`,
          method: 'PUT',
          body: formData, // This should be FormData object
          // Don't set Content-Type header - let browser set it for FormData
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'LIST' },
        { type: 'Listing', id: 'VENDOR_LIST' },
      ],
    }),

    deleteListing: builder.mutation({
      query: (id) => ({
        url: `/listings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'LIST' },
        { type: 'Listing', id: 'VENDOR_LIST' },
      ],
    }),

    // Orders endpoints
    getOrders: builder.query({
      query: (params = {}) => ({
        url: '/orders',
        params,
      }),
      providesTags: (result) => [
        { type: 'Order', id: 'LIST' },
        ...(result?.data?.orders || []).map(({ id }) => ({
          type: 'Order',
          id,
        })),
      ],
    }),

    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),

    updateOrderStatus: builder.mutation({
      query: ({ id, status, notes }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status, notes },
      }),
      onQueryStarted: async (
        { id, status, notes },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update for vendor orders
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorOrders',
            undefined,
            (draft) => {
              const order = draft?.data?.orders?.find((o) => o.id === id);
              if (order) {
                order.status = status;
                order.statusHistory = order.statusHistory || [];
                order.statusHistory.push({
                  status,
                  notes,
                  timestamp: new Date().toISOString(),
                  updatedBy: 'vendor',
                });
                order.updatedAt = new Date().toISOString();
              }
            }
          )
        );

        // Also update single order if cached
        dispatch(
          apiSlice.util.updateQueryData('getOrder', id, (draft) => {
            if (draft?.data) {
              draft.data.status = status;
              draft.data.statusHistory = draft.data.statusHistory || [];
              draft.data.statusHistory.push({
                status,
                notes,
                timestamp: new Date().toISOString(),
                updatedBy: 'vendor',
              });
              draft.data.updatedAt = new Date().toISOString();
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
        { type: 'Order', id: 'VENDOR_LIST' },
      ],
    }),

    // Vendor-specific Order Management
    getVendorOrders: builder.query({
      query: (params = {}) => ({
        url: '/vendor/orders',
        params,
      }),
      providesTags: (result) => [
        { type: 'Order', id: 'VENDOR_LIST' },
        ...(result?.data?.orders || []).map(({ id }) => ({
          type: 'Order',
          id,
        })),
      ],
      // Polling disabled for MVP
    }),

    getVendorOrderAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/vendor/orders/analytics',
        params,
      }),
      providesTags: ['Order'],
      // Polling disabled for MVP
    }),

    // Order Status Management with Workflow
    updateOrderStatusWorkflow: builder.mutation({
      query: ({ id, status, notes, estimatedTime, deliveryDetails }) => ({
        url: `/orders/${id}/workflow-status`,
        method: 'PUT',
        body: { status, notes, estimatedTime, deliveryDetails },
      }),
      onQueryStarted: async (
        { id, status, notes, estimatedTime },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update with workflow tracking
        const timestamp = new Date().toISOString();

        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorOrders',
            undefined,
            (draft) => {
              const order = draft?.data?.orders?.find((o) => o.id === id);
              if (order) {
                const previousStatus = order.status;
                order.status = status;
                order.statusHistory = order.statusHistory || [];
                order.statusHistory.push({
                  status,
                  previousStatus,
                  notes,
                  estimatedTime,
                  timestamp,
                  updatedBy: 'vendor',
                });
                order.updatedAt = timestamp;

                // Update workflow tracking
                if (status === 'confirmed') {
                  order.confirmedAt = timestamp;
                } else if (status === 'prepared') {
                  order.preparedAt = timestamp;
                } else if (status === 'delivered') {
                  order.deliveredAt = timestamp;
                }
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'VENDOR_LIST' },
      ],
    }),

    // Bulk Order Operations
    bulkUpdateOrderStatus: builder.mutation({
      query: ({ orderIds, status, notes }) => ({
        url: '/orders/bulk-status',
        method: 'POST',
        body: { orderIds, status, notes },
      }),
      onQueryStarted: async (
        { orderIds, status, notes },
        { dispatch, queryFulfilled }
      ) => {
        const timestamp = new Date().toISOString();

        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorOrders',
            undefined,
            (draft) => {
              if (draft?.data?.orders) {
                draft.data.orders = draft.data.orders.map((order) =>
                  orderIds.includes(order.id)
                    ? {
                        ...order,
                        status,
                        statusHistory: [
                          ...(order.statusHistory || []),
                          {
                            status,
                            previousStatus: order.status,
                            notes,
                            timestamp,
                            updatedBy: 'vendor',
                            bulkUpdate: true,
                          },
                        ],
                        updatedAt: timestamp,
                      }
                    : order
                );
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [{ type: 'Order', id: 'VENDOR_LIST' }],
    }),

    // Order Notifications
    getOrderNotifications: builder.query({
      query: () => '/vendor/orders/notifications',
      providesTags: ['Order'],
      // Polling disabled for MVP
    }),

    markNotificationAsRead: builder.mutation({
      query: ({ notificationId }) => ({
        url: `/vendor/orders/notifications/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),

    // Order Fulfillment Workflow
    getOrderWorkflowSteps: builder.query({
      query: (orderId) => `/orders/${orderId}/workflow`,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId },
      ],
    }),

    updateOrderFulfillmentStep: builder.mutation({
      query: ({ orderId, stepId, completed, notes, attachments }) => ({
        url: `/orders/${orderId}/workflow/${stepId}`,
        method: 'PUT',
        body: { completed, notes, attachments },
      }),
      onQueryStarted: async (
        { orderId, stepId, completed, notes },
        { dispatch, queryFulfilled }
      ) => {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getOrderWorkflowSteps',
            orderId,
            (draft) => {
              const step = draft?.data?.steps?.find((s) => s.id === stepId);
              if (step) {
                step.completed = completed;
                step.completedAt = completed ? new Date().toISOString() : null;
                step.notes = notes;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
      ],
    }),

    // Admin endpoints - User Management
    getAdminUsers: builder.query({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: (result) => [
        { type: 'User', id: 'LIST' },
        ...(result?.data?.users || []).map(({ id }) => ({ type: 'User', id })),
      ],
    }),

    getAdminUser: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    approveUser: builder.mutation({
      query: ({ id, isApproved }) => ({
        url: `/admin/users/${id}/approve`,
        method: 'PUT',
        body: { isApproved },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    updateAdminUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // Admin - Unified Approval System (NEW - replaces legacy endpoints)
    getAllApprovals: builder.query({
      query: (filters = {}) => ({
        url: '/admin/approvals',
        params: filters,
      }),
      providesTags: ['Approvals'],
    }),

    approveVendor: builder.mutation({
      query: ({ id, approvalNotes }) => ({
        url: `/admin/approvals/vendor/${id}/approve`,
        method: 'PUT',
        body: { approvalNotes },
      }),
      invalidatesTags: ['Approvals', 'User', 'Vendor'],
    }),

    rejectVendor: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/approvals/vendor/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Approvals', 'User', 'Vendor'],
    }),

    approveRestaurant: builder.mutation({
      query: ({ id, approvalNotes }) => ({
        url: `/admin/approvals/restaurant/${id}/approve`,
        method: 'PUT',
        body: { approvalNotes },
      }),
      invalidatesTags: ['Approvals', 'User', 'Restaurant'],
    }),

    rejectRestaurant: builder.mutation({
      query: ({ id, rejectionReason }) => ({
        url: `/admin/approvals/restaurant/${id}/reject`,
        method: 'PUT',
        body: { rejectionReason },
      }),
      invalidatesTags: ['Approvals', 'User', 'Restaurant'],
    }),

    // ====================================================
    // THREE-STATE VERIFICATION MANAGEMENT SYSTEM
    // ====================================================

    // Update vendor verification status (pending, approved, rejected)
    updateVendorVerificationStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/admin/vendors/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: [
        'Approvals',
        'Vendor',
        'User',
        'PendingVendors',
        'ApprovedVendors',
        'RejectedVendors',
      ],
      onQueryStarted: async (
        { id, status, reason },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update for approvals list
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getAllApprovals',
            undefined,
            (draft) => {
              const approval = draft?.data?.find((a) => a._id === id);
              if (approval && approval.vendorId) {
                approval.vendorId.verificationStatus = status;
                approval.vendorId.adminNotes =
                  status === 'rejected' ? reason : null;
                approval.vendorId.verificationDate =
                  status === 'approved' ? new Date().toISOString() : null;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Update restaurant verification status (pending, approved, rejected)
    updateRestaurantVerificationStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/admin/restaurants/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: [
        'Approvals',
        'Restaurant',
        'User',
        'PendingRestaurants',
        'ApprovedRestaurants',
        'RejectedRestaurants',
      ],
      onQueryStarted: async (
        { id, status, reason },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update for approvals list
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getAllApprovals',
            undefined,
            (draft) => {
              const approval = draft?.data?.find((a) => a._id === id);
              if (approval && approval.restaurantId) {
                approval.restaurantId.verificationStatus = status;
                approval.restaurantId.adminNotes =
                  status === 'rejected' ? reason : null;
                approval.restaurantId.verificationDate =
                  status === 'approved' ? new Date().toISOString() : null;
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // New Unified Admin Endpoints (replacing legacy separate endpoints)
    getAdminVendorsUnified: builder.query({
      query: (params = {}) => ({
        url: '/admin/vendors',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: ['Vendor', 'Approvals'],
    }),

    getAdminRestaurantsUnified: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: ['Restaurant', 'Approvals'],
    }),

    // Bulk verification operations (updated for three-state)
    bulkUpdateVerificationStatus: builder.mutation({
      query: ({ userIds, entityType, status, reason }) => ({
        url: `/admin/bulk/verification`,
        method: 'POST',
        body: { userIds, entityType, status, reason },
      }),
      invalidatesTags: [
        'Approvals',
        'Vendor',
        'Restaurant',
        'User',
        'PendingVendors',
        'ApprovedVendors',
        'RejectedVendors',
        'PendingRestaurants',
        'ApprovedRestaurants',
        'RejectedRestaurants',
      ],
    }),

    // Enhanced Admin Dashboard
    getAdminDashboardOverview: builder.query({
      query: () => '/admin/dashboard/overview',
      providesTags: ['User', 'Approvals'],
    }),

    // Advanced Analytics System
    getAnalyticsOverview: builder.query({
      query: (filters = {}) => ({
        url: '/admin/analytics/overview',
        params: filters,
      }),
      providesTags: ['Analytics'],
    }),

    getSalesAnalytics: builder.query({
      query: (filters = {}) => ({
        url: '/admin/analytics/sales',
        params: filters,
      }),
      providesTags: ['SalesAnalytics'],
    }),

    getUserAnalytics: builder.query({
      query: (filters = {}) => ({
        url: '/admin/analytics/users',
        params: filters,
      }),
      providesTags: ['UserAnalytics'],
    }),

    getProductAnalytics: builder.query({
      query: (filters = {}) => ({
        url: '/admin/analytics/products',
        params: filters,
      }),
      providesTags: ['ProductAnalytics'],
    }),

    clearAnalyticsCache: builder.mutation({
      query: () => ({
        url: '/admin/analytics/cache',
        method: 'DELETE',
      }),
      invalidatesTags: ['Analytics', 'SalesAnalytics', 'UserAnalytics'],
    }),

    // System Settings Management
    getSystemSettings: builder.query({
      query: (filter = {}) => ({
        url: '/admin/settings',
        params: filter,
      }),
      providesTags: ['Settings'],
    }),

    updateSystemSetting: builder.mutation({
      query: ({ key, value, changeReason }) => ({
        url: `/admin/settings/key/${key}`,
        method: 'PUT',
        body: { value, changeReason },
      }),
      invalidatesTags: ['Settings'],
    }),

    resetSystemSettings: builder.mutation({
      query: () => ({
        url: '/admin/settings/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),

    getSettingsByCategory: builder.query({
      query: (category) => `/admin/settings/${category}`,
      providesTags: ['Settings'],
    }),

    getSetting: builder.query({
      query: (key) => `/admin/settings/key/${key}`,
      providesTags: ['Settings'],
    }),

    getSettingHistory: builder.query({
      query: (key) => `/admin/settings/key/${key}/history`,
      providesTags: ['Settings'],
    }),

    createSetting: builder.mutation({
      query: (settingData) => ({
        url: '/admin/settings',
        method: 'POST',
        body: settingData,
      }),
      invalidatesTags: ['Settings'],
    }),

    deleteSetting: builder.mutation({
      query: (key) => ({
        url: `/admin/settings/key/${key}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings'],
    }),

    bulkUpdateSettings: builder.mutation({
      query: (settingsData) => ({
        url: '/admin/settings/bulk',
        method: 'PUT',
        body: settingsData,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Content Moderation System
    flagListing: builder.mutation({
      query: ({ id, flagReason, moderationNotes }) => ({
        url: `/admin/listings/${id}/flag`,
        method: 'PUT',
        body: { flagReason, moderationNotes },
      }),
      invalidatesTags: ['FlaggedContent', 'Listing'],
    }),

    // Enhanced User Management
    getVendors: builder.query({
      query: (filters = {}) => ({
        url: '/admin/vendors',
        params: filters,
      }),
      providesTags: ['Vendor'],
    }),

    deactivateVendor: builder.mutation({
      query: ({ id, reason, adminNotes }) => ({
        url: `/admin/vendors/${id}/deactivate`,
        method: 'PUT',
        body: { reason, adminNotes },
      }),
      invalidatesTags: ['Vendor'],
    }),

    getRestaurants: builder.query({
      query: (filters = {}) => ({
        url: '/admin/restaurants',
        params: filters,
      }),
      providesTags: ['Restaurant'],
    }),

    toggleRestaurantStatus: builder.mutation({
      query: ({ id, isActive, reason }) => ({
        url: `/admin/restaurants/${id}/toggle-status`,
        method: 'PUT',
        body: { isActive, reason },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Additional User Management Endpoints
    getAllVendors: builder.query({
      query: (filters = {}) => {
        const params = {};
        if (filters.search && filters.search.trim()) {
          params.search = filters.search.trim();
        }
        if (filters.status && filters.status !== 'all') {
          params.status = filters.status;
        }
        if (filters.limit) {
          params.limit = filters.limit;
        }
        return {
          url: '/admin/vendors',
          params: Object.keys(params).length > 0 ? params : undefined,
        };
      },
      providesTags: ['Vendor'],
    }),

    // New Unified Restaurant Management Endpoints
    getAdminRestaurantsUnified: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: ['Restaurant', 'Approvals'],
    }),

    // Get single restaurant with full details
    getRestaurantDetails: builder.query({
      query: (id) => `/admin/restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: 'Restaurant', id }],
    }),

    updateVendorStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/vendors/${id}`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Update restaurant details
    updateRestaurant: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/restaurants/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Restaurant',
        'Approvals',
        { type: 'Restaurant', id },
      ],
    }),

    // Safe deactivate restaurant with dependency check
    deactivateRestaurant: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/restaurants/${id}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Restaurant',
        'Approvals',
        { type: 'Restaurant', id },
      ],
    }),

    deleteVendor: builder.mutation({
      query: (id) => ({
        url: `/admin/vendors/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vendor'],
    }),

    // Safe delete restaurant with dependency check
    safeDeleteRestaurant: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/restaurants/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Restaurant', 'Approvals'],
    }),

    // ================================
    // UNIFIED VENDOR MANAGEMENT ENDPOINTS
    // ================================

    // Get all vendors with unified filtering, pagination, and search
    getAdminVendorsUnified: builder.query({
      query: (params = {}) => ({
        url: '/admin/vendors',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: (result) => [
        'Vendor',
        'Approvals',
        { type: 'Vendor', id: 'UNIFIED_LIST' },
        ...(result?.data || []).map(({ _id }) => ({ type: 'Vendor', id: _id })),
      ],
    }),

    // Get individual vendor details with statistics
    getVendorDetails: builder.query({
      query: (id) => ({
        url: `/admin/vendors/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: 'Vendor', id }],
    }),

    // Update vendor details
    updateVendor: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/vendors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Vendor',
        { type: 'Vendor', id },
        { type: 'Vendor', id: 'UNIFIED_LIST' },
      ],
    }),

    // Deactivate vendor with dependency check
    deactivateVendor: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/vendors/${id}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Vendor',
        'Approvals',
        { type: 'Vendor', id },
        { type: 'Vendor', id: 'UNIFIED_LIST' },
      ],
    }),

    // Safe delete vendor with dependency check
    safeDeleteVendor: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/vendors/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        'Vendor',
        'Approvals',
        { type: 'Vendor', id },
        { type: 'Vendor', id: 'UNIFIED_LIST' },
      ],
    }),

    // Create restaurant owner and restaurant
    createRestaurantOwner: builder.mutation({
      query: (data) => ({
        url: '/admin/restaurant-owners',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    // Create restaurant manager
    createRestaurantManager: builder.mutation({
      query: (data) => ({
        url: '/admin/restaurant-managers',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    // Enhanced Analytics Endpoint
    getAdminAnalyticsOverview: builder.query({
      query: (filters = {}) => ({
        url: '/admin/dashboard',
        params: filters,
      }),
      providesTags: ['Analytics'],
    }),

    // Safe Deletion with Dependency Checking
    safeDeleteProduct: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/products/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Product'],
    }),

    safeDeleteCategory: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/categories/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['Category'],
    }),

    // Admin Analytics - correct endpoint is /admin/dashboard
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      providesTags: ['Admin'],
    }),

    // Admin Product Management
    getAdminProducts: builder.query({
      query: (params = {}) => ({
        url: '/admin/products',
        params,
      }),
      providesTags: (result) => [
        { type: 'Product', id: 'ADMIN_LIST' },
        ...(result?.data?.products || []).map(({ id }) => ({
          type: 'Product',
          id,
        })),
      ],
    }),

    getAdminProduct: builder.query({
      query: (id) => `/admin/products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),

    createAdminProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData, // This will be FormData with image
        // Don't set Content-Type header - let browser set it for FormData
      }),
      invalidatesTags: [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),

    updateAdminProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: formData, // This will be FormData with optional image
        // Don't set Content-Type header - let browser set it for FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),

    deleteAdminProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Product', id },
        { type: 'Product', id: 'ADMIN_LIST' },
      ],
    }),

    // Admin Category Management
    getAdminCategories: builder.query({
      query: (params = {}) => {
        const queryParams = {
          // Pagination and sorting (always include)
          page: params.page || 1,
          limit: params.limit || 20,
          sortBy: params.sortBy || 'name',
          sortOrder: params.sortOrder || 'asc',
        };

        // Only add filter parameters if they have values
        if (params.search && params.search.trim()) {
          queryParams.search = params.search.trim();
        }
        if (params.isActive !== undefined) {
          queryParams.isActive = params.isActive;
        }
        if (params.isAvailable !== undefined) {
          queryParams.isAvailable = params.isAvailable;
        }
        if (params.adminStatus && params.adminStatus.trim()) {
          queryParams.adminStatus = params.adminStatus.trim();
        }
        if (params.level !== undefined) {
          queryParams.level = params.level;
        }

        return {
          url: '/admin/categories',
          params: queryParams,
        };
      },
      providesTags: (result) => [
        { type: 'Category', id: 'ADMIN_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Category',
          id: _id,
        })),
      ],
    }),

    getAdminCategory: builder.query({
      query: (id) => `/admin/categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }],
    }),

    createAdminCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/admin/categories',
        method: 'POST',
        body: categoryData, // This will be FormData with image
        // Don't set Content-Type header - let browser set it for FormData
      }),
      invalidatesTags: [
        { type: 'Category', id: 'ADMIN_LIST' },
        'Category', // Also invalidate public categories
      ],
    }),

    updateAdminCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: formData, // This will be FormData with optional image
        // Don't set Content-Type header - let browser set it for FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Category', // Also invalidate public categories
      ],
    }),

    deleteAdminCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Category', // Also invalidate public categories
      ],
    }),

    // Safe delete category with dependency check
    safeDeleteCategory: builder.mutation({
      query: (id) => ({
        url: `/admin/categories/${id}/safe-delete`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'ADMIN_LIST' },
        'Category',
      ],
    }),

    // Toggle category availability (flag/unflag system)
    toggleCategoryAvailability: builder.mutation({
      query: ({ id, isAvailable, flagReason }) => ({
        url: `/admin/categories/${id}/availability`,
        method: 'PUT',
        body: { isAvailable, flagReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'ADMIN_LIST' },
      ],
    }),

    // Get category usage statistics
    getCategoryUsageStats: builder.query({
      query: (id) => `/admin/categories/${id}/usage`,
      providesTags: (result, error, id) => [{ type: 'CategoryUsage', id }],
    }),

    // ===== RESTAURANT MANAGEMENT SYSTEM (PROMPT 6) =====
    // Restaurant statistics and analytics
    getAdminRestaurantsStats: builder.query({
      query: () => '/admin/restaurants/stats',
      providesTags: ['Restaurant'],
    }),

    // Restaurant status management
    updateRestaurantStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/admin/restaurants/${id}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Flag restaurant for review
    flagRestaurant: builder.mutation({
      query: ({ id, reason, details, severity }) => ({
        url: `/admin/restaurants/${id}/flag`,
        method: 'PUT',
        body: { reason, details, severity },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Restaurant verification workflow
    approveRestaurantVerification: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/admin/restaurants/${id}/verification/approve`,
        method: 'PUT',
        body: { notes },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    rejectRestaurantVerification: builder.mutation({
      query: ({ id, reason, notes }) => ({
        url: `/admin/restaurants/${id}/verification/reject`,
        method: 'PUT',
        body: { reason, notes },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    requestAdditionalDocuments: builder.mutation({
      query: ({ id, requiredDocuments, message }) => ({
        url: `/admin/restaurants/${id}/verification/request-docs`,
        method: 'PUT',
        body: { requiredDocuments, message },
      }),
      invalidatesTags: ['Restaurant'],
    }),

    // Manager relationship management
    getRestaurantManagers: builder.query({
      query: (restaurantId) => `/admin/restaurants/${restaurantId}/managers`,
      providesTags: (result, error, restaurantId) => [
        { type: 'Restaurant', id: restaurantId },
        'User',
      ],
    }),

    createRestaurantManager: builder.mutation({
      query: ({ restaurantId, ...managerData }) => ({
        url: `/admin/restaurants/${restaurantId}/managers`,
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    updateManagerPermissions: builder.mutation({
      query: ({ managerId, permissions }) => ({
        url: `/admin/managers/${managerId}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    deactivateManager: builder.mutation({
      query: ({ managerId, reason }) => ({
        url: `/admin/managers/${managerId}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    transferOwnership: builder.mutation({
      query: ({ restaurantId, newOwnerId, transferReason }) => ({
        url: `/admin/restaurants/${restaurantId}/transfer-ownership`,
        method: 'PUT',
        body: { newOwnerId, transferReason },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    // ===== CATALOG MANAGEMENT SYSTEM (PROMPT 6) =====
    // Products management
    getAdminProducts: builder.query({
      query: (params = {}) => ({
        url: '/admin/products',
        params,
      }),
      providesTags: ['Product'],
    }),

    getAdminProductStats: builder.query({
      query: () => '/admin/products/stats',
      providesTags: ['Product'],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product', 'Category'],
    }),

    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/admin/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),

    bulkUpdateProducts: builder.mutation({
      query: ({ productIds, action, ...actionData }) => ({
        url: '/admin/products/bulk',
        method: 'PUT',
        body: { productIds, action, ...actionData },
      }),
      invalidatesTags: ['Product'],
    }),

    flagProduct: builder.mutation({
      query: ({ id, reason, severity }) => ({
        url: `/admin/products/${id}/flag`,
        method: 'PUT',
        body: { reason, severity },
      }),
      invalidatesTags: ['Product'],
    }),

    // Enhanced category management
    reorderCategories: builder.mutation({
      query: ({ categoryId, newSortOrder }) => ({
        url: `/admin/categories/${categoryId}/reorder`,
        method: 'PUT',
        body: { newSortOrder },
      }),
      invalidatesTags: ['Category'],
    }),

    updateCategoryHierarchy: builder.mutation({
      query: ({ categoryId, newParentId, newSortOrder }) => ({
        url: `/admin/categories/${categoryId}/hierarchy`,
        method: 'PUT',
        body: { newParentId, newSortOrder },
      }),
      invalidatesTags: ['Category'],
    }),

    // ===== LISTINGS MANAGEMENT SYSTEM (PROMPT 6) =====
    // Listings with moderation
    getAdminListings: builder.query({
      query: (params = {}) => ({
        url: '/admin/listings',
        params,
      }),
      providesTags: ['Listing'],
    }),

    getAdminListingsStats: builder.query({
      query: () => '/admin/listings/stats',
      providesTags: ['Listing'],
    }),

    approveListing: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/admin/listings/${id}/approve`,
        method: 'PUT',
        body: { notes },
      }),
      invalidatesTags: ['Listing'],
    }),

    rejectListing: builder.mutation({
      query: ({ id, reason, notes }) => ({
        url: `/admin/listings/${id}/reject`,
        method: 'PUT',
        body: { reason, notes },
      }),
      invalidatesTags: ['Listing'],
    }),

    flagListing: builder.mutation({
      query: ({ id, reason, severity, notes }) => ({
        url: `/admin/listings/${id}/flag`,
        method: 'PUT',
        body: { reason, severity, notes },
      }),
      invalidatesTags: ['Listing'],
    }),

    unflagListing: builder.mutation({
      query: ({ id, notes }) => ({
        url: `/admin/listings/${id}/unflag`,
        method: 'PUT',
        body: { notes },
      }),
      invalidatesTags: ['Listing'],
    }),

    bulkModerate: builder.mutation({
      query: ({ listingIds, action, ...actionData }) => ({
        url: '/admin/listings/bulk-moderate',
        method: 'PUT',
        body: { listingIds, action, ...actionData },
      }),
      invalidatesTags: ['Listing'],
    }),

    deleteListing: builder.mutation({
      query: (id) => ({
        url: `/admin/listings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Listing'],
    }),

    // Bulk Operations
    bulkApproveUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-approve',
        method: 'POST',
        body: { userIds, isApproved: true },
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
      onQueryStarted: async (userIds, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getAdminUsers', undefined, (draft) => {
            if (draft?.data?.users) {
              draft.data.users = draft.data.users.map((user) =>
                userIds.includes(user.id)
                  ? { ...user, isApproved: true, status: 'active' }
                  : user
              );
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    bulkRejectUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-approve',
        method: 'POST',
        body: { userIds, isApproved: false },
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
      onQueryStarted: async (userIds, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getAdminUsers', undefined, (draft) => {
            if (draft?.data?.users) {
              draft.data.users = draft.data.users.map((user) =>
                userIds.includes(user.id)
                  ? { ...user, isApproved: false, status: 'rejected' }
                  : user
              );
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    bulkDeleteUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-delete',
        method: 'POST',
        body: { userIds },
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
      onQueryStarted: async (userIds, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getAdminUsers', undefined, (draft) => {
            if (draft?.data?.users) {
              draft.data.users = draft.data.users.filter(
                (user) => !userIds.includes(user.id)
              );
              if (draft.data.pagination) {
                draft.data.pagination.totalUsers -= userIds.length;
              }
            }
          })
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Product Bulk Operations
    bulkUpdateProducts: builder.mutation({
      query: ({ productIds, updates }) => ({
        url: '/admin/products/bulk-update',
        method: 'POST',
        body: { productIds, updates },
      }),
      invalidatesTags: [{ type: 'Product', id: 'ADMIN_LIST' }],
      onQueryStarted: async (
        { productIds, updates },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getAdminProducts',
            undefined,
            (draft) => {
              if (draft?.data?.products) {
                draft.data.products = draft.data.products.map((product) =>
                  productIds.includes(product.id)
                    ? { ...product, ...updates }
                    : product
                );
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Image Management
    uploadProductImage: builder.mutation({
      query: (formData) => ({
        url: '/admin/products/upload-image',
        method: 'POST',
        body: formData,
        // FormData sets its own content-type
      }),
      invalidatesTags: (result, error, { productId }) =>
        productId ? [{ type: 'Product', id: productId }] : [],
    }),

    deleteProductImage: builder.mutation({
      query: ({ productId, imageId }) => ({
        url: `/admin/products/${productId}/images/${imageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
      ],
    }),

    // Product Analytics
    getProductAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/admin/products/analytics',
        params,
      }),
      providesTags: ['Admin'],
    }),

    getProductPerformance: builder.query({
      query: (productId) => `/admin/products/${productId}/performance`,
      providesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
      ],
    }),

    // Vendor Dashboard & Analytics endpoints
    getVendorDashboard: builder.query({
      query: () => '/vendor/dashboard',
      providesTags: ['Vendor'],
      // Polling disabled for MVP
    }),

    getVendorAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/vendor/analytics',
        params,
      }),
      providesTags: ['Vendor'],
      // Polling disabled for MVP
    }),

    getVendorOrders: builder.query({
      query: (params = {}) => ({
        url: '/vendor/orders',
        params,
      }),
      providesTags: (result) => [
        { type: 'Order', id: 'VENDOR_LIST' },
        ...(result?.data?.orders || []).map(({ id }) => ({
          type: 'Order',
          id,
        })),
      ],
    }),

    // Bulk Listing Operations with Optimistic Updates
    bulkUpdateListings: builder.mutation({
      query: ({ listingIds, updates }) => ({
        url: '/listings/bulk-update',
        method: 'POST',
        body: { listingIds, updates },
      }),
      onQueryStarted: async (
        { listingIds, updates },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorListings',
            undefined,
            (draft) => {
              if (draft?.data?.listings) {
                draft.data.listings = draft.data.listings.map((listing) =>
                  listingIds.includes(listing.id)
                    ? { ...listing, ...updates }
                    : listing
                );
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [
        { type: 'Listing', id: 'VENDOR_LIST' },
        { type: 'Listing', id: 'LIST' },
      ],
    }),

    bulkDeleteListings: builder.mutation({
      query: (listingIds) => ({
        url: '/listings/bulk-delete',
        method: 'POST',
        body: { listingIds },
      }),
      onQueryStarted: async (listingIds, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorListings',
            undefined,
            (draft) => {
              if (draft?.data?.listings) {
                draft.data.listings = draft.data.listings.filter(
                  (listing) => !listingIds.includes(listing.id)
                );
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: [
        { type: 'Listing', id: 'VENDOR_LIST' },
        { type: 'Listing', id: 'LIST' },
      ],
    }),

    // Listing Status Management with Optimistic Updates
    updateListingStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/listings/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      onQueryStarted: async ({ id, status }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorListings',
            undefined,
            (draft) => {
              const listing = draft?.data?.listings?.find((l) => l.id === id);
              if (listing) {
                listing.status = status;
                listing.updatedAt = new Date().toISOString();
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'VENDOR_LIST' },
      ],
    }),

    // Inventory Management
    updateListingInventory: builder.mutation({
      query: ({ id, inventory }) => ({
        url: `/listings/${id}/inventory`,
        method: 'PUT',
        body: inventory,
      }),
      onQueryStarted: async (
        { id, inventory },
        { dispatch, queryFulfilled }
      ) => {
        // Optimistic update
        const patchResult = dispatch(
          apiSlice.util.updateQueryData(
            'getVendorListings',
            undefined,
            (draft) => {
              const listing = draft?.data?.listings?.find((l) => l.id === id);
              if (listing) {
                listing.availability = {
                  ...listing.availability,
                  ...inventory,
                };
                listing.updatedAt = new Date().toISOString();
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'VENDOR_LIST' },
      ],
    }),

    // Performance metrics with caching
    getListingPerformance: builder.query({
      query: (params = {}) => ({
        url: '/vendor/listing-performance',
        params,
      }),
      providesTags: ['Vendor'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Restaurant-specific endpoints
    getRestaurantOrders: builder.query({
      query: (params = {}) => ({
        url: '/restaurant/orders',
        params,
      }),
      providesTags: (result) => [
        { type: 'Order', id: 'RESTAURANT_LIST' },
        ...(result?.data?.orders || []).map(({ id }) => ({
          type: 'Order',
          id,
        })),
      ],
    }),

    getRestaurantAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/restaurant/analytics',
        params,
      }),
      providesTags: ['Restaurant'],
      // Polling disabled for MVP
    }),

    // ===== VENDOR DASHBOARD ENDPOINTS =====
    // 26+ comprehensive dashboard endpoints for advanced analytics

    // Vendor Dashboard Overview - Main KPIs and summary
    getVendorDashboardOverview: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/overview',
        params,
      }),
      providesTags: ['Vendor'],
      pollingInterval: 300000, // 5-minute refresh
      // Auto-refetch disabled for MVP
    }),

    // Vendor Revenue Analytics - Revenue trends and growth
    getVendorRevenue: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/revenue',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 900, // 15-minute cache
    }),

    // Vendor Product Performance - Product-wise analytics
    getVendorProductPerformance: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/products',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 900,
    }),

    // Vendor Inventory Management - Stock levels and alerts
    getVendorInventory: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/inventory',
        params,
      }),
      providesTags: ['Vendor'],
      // Polling disabled for MVP
    }),

    // Vendor Order Management - Order processing interface
    getVendorOrderManagement: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/order-management',
        params,
      }),
      providesTags: ['Order', 'Vendor'],
      // Polling disabled for MVP
    }),

    // Vendor Customer Insights - Customer loyalty and acquisition
    getVendorCustomerInsights: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/customer-insights',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 1800, // 30-minute cache
    }),

    // Vendor Financial Reports - P&L, commission tracking
    getVendorFinancialReports: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/financial-reports',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 1800,
    }),

    // Vendor Notifications - Real-time alerts
    getVendorNotifications: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/notifications',
        params,
      }),
      providesTags: ['Notification'],
      // Polling disabled for MVP
    }),

    // Vendor Category Performance - Category-wise sales analytics
    getVendorCategoryPerformance: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/category-performance',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 900,
    }),

    // Vendor Sales Trends - Seasonal and trend analysis
    getVendorSalesTrends: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/sales-trends',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 1800,
    }),

    // Vendor Commission Analytics - Commission tracking and forecasting
    getVendorCommissionAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/commission-analytics',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 1800,
    }),

    // Vendor Performance Metrics - KPI tracking and benchmarking
    getVendorPerformanceMetrics: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/performance-metrics',
        params,
      }),
      providesTags: ['Vendor'],
      keepUnusedDataFor: 900,
    }),

    // ===== RESTAURANT DASHBOARD ENDPOINTS =====

    // Restaurant Dashboard Overview - Main spending and order KPIs
    getRestaurantDashboardOverview: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/overview',
        params,
      }),
      providesTags: ['Restaurant'],
      pollingInterval: 300000, // 5-minute refresh
      // Auto-refetch disabled for MVP
    }),

    // Restaurant Spending Analytics - Spending trends by vendor/category
    getRestaurantSpending: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/spending',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 900,
    }),

    // Restaurant Vendor Insights - Vendor performance and reliability
    getRestaurantVendorInsights: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/vendors',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Budget Tracking - Budget limits and alerts
    getRestaurantBudget: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/budget',
        params,
      }),
      providesTags: ['Restaurant'],
      // Polling disabled for MVP
    }),

    // Restaurant Order History - Complete order history with filtering
    getRestaurantOrderHistory: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/order-history',
        params,
      }),
      providesTags: ['Order', 'Restaurant'],
      keepUnusedDataFor: 600,
    }),

    // Restaurant Inventory Planning - Consumption and reorder suggestions
    getRestaurantInventoryPlanning: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/inventory-planning',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Favorite Vendors - Frequently used vendors for quick reorder
    getRestaurantFavoriteVendors: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/favorite-vendors',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Notifications - Budget alerts and order updates
    getRestaurantNotifications: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/notifications',
        params,
      }),
      providesTags: ['Notification'],
      // Polling disabled for MVP
    }),

    // Restaurant Cost Analysis - Cost optimization and savings tracking
    getRestaurantCostAnalysis: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/cost-analysis',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Purchase Patterns - Purchase behavior and forecasting
    getRestaurantPurchasePatterns: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/purchase-patterns',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Delivery Analytics - Delivery performance and timing
    getRestaurantDeliveryAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/delivery-analytics',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 900,
    }),

    // Restaurant Seasonal Insights - Seasonal purchasing trends
    getRestaurantSeasonalInsights: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/seasonal-insights',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Vendor Comparison - Side-by-side vendor performance
    getRestaurantVendorComparison: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/vendor-comparison',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // Restaurant Procurement Insights - Procurement optimization recommendations
    getRestaurantProcurementInsights: builder.query({
      query: (params = {}) => ({
        url: '/restaurant-dashboard/procurement-insights',
        params,
      }),
      providesTags: ['Restaurant'],
      keepUnusedDataFor: 1800,
    }),

    // ===== SHARED NOTIFICATION ENDPOINTS =====

    // Mark Notifications as Read
    markNotificationsAsRead: builder.mutation({
      query: (notificationIds) => ({
        url: '/notifications/mark-read',
        method: 'POST',
        body: { notificationIds },
      }),
      invalidatesTags: ['Notification'],
    }),

    // Mark All Notifications as Read
    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/notifications/mark-all-read',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    updateRestaurantProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User', 'Restaurant'],
    }),

    getRestaurantManagers: builder.query({
      query: () => '/auth/managers',
      providesTags: ['User'],
    }),

    createRestaurantManager: builder.mutation({
      query: (managerData) => ({
        url: '/auth/create-manager',
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['User'],
    }),

    updateRestaurantManager: builder.mutation({
      query: ({ id, ...managerData }) => ({
        url: `/auth/managers/${id}`,
        method: 'PUT',
        body: managerData,
      }),
      invalidatesTags: ['User'],
    }),

    deactivateRestaurantManager: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/auth/managers/${id}/deactivate`,
        method: 'PUT',
        body: { isActive },
      }),
      invalidatesTags: ['User'],
    }),

    deleteRestaurantManager: builder.mutation({
      query: ({ id }) => ({
        url: `/auth/managers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Admin Restaurant Management Endpoints
    createAdminRestaurantOwner: builder.mutation({
      query: (ownerData) => ({
        url: '/admin/restaurant-owners',
        method: 'POST',
        body: ownerData,
      }),
      invalidatesTags: ['User', 'Restaurant'],
    }),

    createAdminRestaurantManager: builder.mutation({
      query: (managerData) => ({
        url: '/admin/restaurant-managers',
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['User', 'Restaurant'],
    }),

    // Vendor creation - creates vendor entity and associated user with role='vendor'
    createAdminVendor: builder.mutation({
      query: (vendorData) => ({
        url: '/admin/vendors',
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['User', 'Vendor'],
    }),

    getRestaurantsList: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params,
      }),
      providesTags: ['Restaurant'],
    }),

    // Admin - User Management
    getAdminUsers: builder.query({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: (result) => [
        { type: 'User', id: 'ADMIN_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'User',
          id: _id,
        })),
      ],
    }),

    getAdminUser: builder.query({
      query: (id) => `/admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateAdminUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/admin/users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'ADMIN_LIST' },
      ],
    }),

    deleteAdminUser: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'User', id },
        { type: 'User', id: 'ADMIN_LIST' },
      ],
    }),

    // Admin - User Approval
    approveUser: builder.mutation({
      query: ({ id, isApproved }) => ({
        url: `/admin/users/${id}/approve`,
        method: 'PUT',
        body: { isApproved },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'ADMIN_LIST' },
      ],
    }),

    // Admin - Bulk User Operations
    bulkApproveUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-approve',
        method: 'PUT',
        body: { userIds },
      }),
      invalidatesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    bulkRejectUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-reject',
        method: 'PUT',
        body: { userIds },
      }),
      invalidatesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    bulkDeleteUsers: builder.mutation({
      query: (userIds) => ({
        url: '/admin/users/bulk-delete',
        method: 'DELETE',
        body: { userIds },
      }),
      invalidatesTags: [{ type: 'User', id: 'ADMIN_LIST' }],
    }),

    // Admin - Vendor Management
    getAdminVendors: builder.query({
      query: (params = {}) => ({
        url: '/admin/vendors',
        params,
      }),
      providesTags: (result) => [
        { type: 'Vendor', id: 'ADMIN_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Vendor',
          id: _id,
        })),
      ],
    }),

    // Legacy verifyVendor removed - replaced by unified approval system

    // Admin - Restaurant Management
    getAdminRestaurants: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params,
      }),
      providesTags: (result) => [
        { type: 'Restaurant', id: 'ADMIN_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Restaurant',
          id: _id,
        })),
      ],
    }),

    // Legacy verifyRestaurant removed - replaced by unified approval system

    // Admin - Listings Management (Updated to match backend routes)
    getAdminListings: builder.query({
      query: (params = {}) => ({
        url: '/admin/listings',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status,
          featured: params.featured,
          flagged: params.flagged,
          vendor: params.vendor,
          product: params.product,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: (result) => [
        { type: 'Listing', id: 'ADMIN_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Listing',
          id: _id,
        })),
      ],
    }),

    // Get featured listings only
    getAdminFeaturedListings: builder.query({
      query: (params = {}) => ({
        url: '/admin/listings/featured',
        params,
      }),
      providesTags: (result) => [
        { type: 'Listing', id: 'FEATURED_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Listing',
          id: _id,
        })),
      ],
    }),

    // Get flagged listings only
    getFlaggedListings: builder.query({
      query: (params = {}) => ({
        url: '/admin/listings/flagged',
        params,
      }),
      providesTags: (result) => [
        { type: 'Listing', id: 'FLAGGED_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Listing',
          id: _id,
        })),
      ],
    }),

    // Get single listing with full details
    getAdminListing: builder.query({
      query: (id) => `/admin/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    // Update listing status (active, inactive, out_of_stock, discontinued)
    updateAdminListingStatus: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/admin/listings/${id}/status`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'ADMIN_LIST' },
        'Listing',
      ],
    }),

    // Toggle listing featured status
    toggleListingFeatured: builder.mutation({
      query: (id) => ({
        url: `/admin/listings/${id}/featured`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'ADMIN_LIST' },
        'Listing',
      ],
    }),

    // Update listing flag status (flag/unflag with reason)
    updateListingFlag: builder.mutation({
      query: ({ id, action, flagReason, moderationNotes }) => ({
        url: `/admin/listings/${id}/flag`,
        method: 'PUT',
        body: { action, flagReason, moderationNotes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'ADMIN_LIST' },
        'Listing',
      ],
    }),

    // Soft delete listing
    softDeleteListing: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/admin/listings/${id}`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'ADMIN_LIST' },
        'Listing',
      ],
    }),

    // Bulk operations on multiple listings
    bulkUpdateAdminListings: builder.mutation({
      query: ({ listingIds, action, data }) => ({
        url: '/admin/listings/bulk',
        method: 'POST',
        body: { listingIds, action, data },
      }),
      invalidatesTags: [{ type: 'Listing', id: 'ADMIN_LIST' }, 'Listing'],
    }),

    // System Health Check
    getSystemHealth: builder.query({
      query: () => '/health',
      providesTags: ['SystemHealth'],
    }),

    // ================================
    // BUSINESS VERIFICATION SYSTEM (NEW CLEANED API)
    // ================================

    // Get user's business verification status and capabilities
    getUserBusinessStatus: builder.query({
      query: () => '/auth/status',
      providesTags: ['User', 'Status'],
      transformResponse: (response) => response.data,
    }),

    // Get all vendors for admin management
    getAllVendorsAdmin: builder.query({
      query: (params = {}) => ({
        url: '/admin/vendors',
        params,
      }),
      providesTags: (result) => [
        { type: 'Vendor', id: 'ADMIN_ALL_LIST' },
        ...(result?.data || []).map(({ _id }) => ({ type: 'Vendor', id: _id })),
      ],
    }),

    // Get all restaurants for admin management
    getAllRestaurantsAdmin: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params,
      }),
      providesTags: (result) => [
        { type: 'Restaurant', id: 'ADMIN_ALL_LIST' },
        ...(result?.data || []).map(({ _id }) => ({
          type: 'Restaurant',
          id: _id,
        })),
      ],
    }),

    // Get verification dashboard overview
    getVerificationStats: builder.query({
      query: () => '/admin/dashboard/overview',
      providesTags: ['Verification', 'Admin'],
      // Polling disabled for MVP
    }),

    // Restaurant Manager Operations
    updateManagerPermissions: builder.mutation({
      query: ({ managerId, permissions }) => ({
        url: `/admin/restaurants/managers/${managerId}/permissions`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    deactivateManager: builder.mutation({
      query: ({ managerId, reason }) => ({
        url: `/admin/restaurants/managers/${managerId}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    transferOwnership: builder.mutation({
      query: ({ restaurantId, newOwnerId, reason }) => ({
        url: `/admin/restaurants/${restaurantId}/transfer-ownership`,
        method: 'PUT',
        body: { newOwnerId, reason },
      }),
      invalidatesTags: ['Restaurant', 'User'],
    }),

    // Product Management Operations
    getAdminProductStats: builder.query({
      query: (params = {}) => ({
        url: '/admin/products/stats',
        params,
      }),
      providesTags: ['Product', 'Admin'],
    }),

    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/admin/products',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Product'],
    }),

    updateProduct: builder.mutation({
      query: ({ productId, updates }) => ({
        url: `/admin/products/${productId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),

    deleteProduct: builder.mutation({
      query: (productId) => ({
        url: `/admin/products/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, productId) => [
        { type: 'Product', id: productId },
        'Product',
      ],
    }),
  }),
});

// Export hooks
export const {
  // Authentication
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,

  // Admin Approval System
  useGetAllApprovalsQuery,
  useApproveVendorMutation,
  useRejectVendorMutation,
  useApproveRestaurantMutation,
  useRejectRestaurantMutation,

  // Profile Management
  useUpdateUserProfileMutation,
  useChangePasswordMutation,

  // Manager Management (Restaurant Owner Only) - replaced by restaurant-specific ones below

  // Public endpoints
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetPublicProductsQuery,
  useGetPublicProductQuery,
  useGetPublicListingsQuery,
  useGetPublicListingQuery,
  useGetFeaturedListingsQuery,

  // Listings
  useGetListingsQuery,
  useGetListingByIdQuery,
  useGetVendorListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,

  // Orders
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,

  // Admin - User Management
  useGetAdminUsersQuery,
  useGetAdminUserQuery,
  useApproveUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,

  // Admin - Bulk Operations
  useBulkApproveUsersMutation,
  useBulkRejectUsersMutation,
  useBulkDeleteUsersMutation,
  useBulkUpdateProductsMutation,

  // Admin - Image Management
  useUploadProductImageMutation,
  useDeleteProductImageMutation,

  // Admin - Product Analytics
  useGetProductPerformanceQuery,

  // Admin - Analytics
  useGetAdminDashboardQuery,

  // Admin - Product Management
  useGetAdminProductsQuery,
  useGetAdminProductQuery,
  useCreateAdminProductMutation,
  useUpdateAdminProductMutation,
  useDeleteAdminProductMutation,

  // Admin - Category Management
  useGetAdminCategoriesQuery,
  useGetAdminCategoryQuery,
  useCreateAdminCategoryMutation,
  useUpdateAdminCategoryMutation,
  useDeleteAdminCategoryMutation,
  useSafeDeleteCategoryMutation,
  useToggleCategoryAvailabilityMutation,
  useGetCategoryUsageStatsQuery,

  // Vendor - Dashboard & Analytics
  useGetVendorDashboardQuery,
  useGetVendorAnalyticsQuery,
  useGetVendorOrdersQuery,
  useGetListingPerformanceQuery,

  // Vendor - Advanced Dashboard Endpoints
  useGetVendorDashboardOverviewQuery,
  useGetVendorRevenueQuery,
  useGetVendorProductPerformanceQuery,
  useGetVendorInventoryQuery,
  useGetVendorOrderManagementQuery,
  useGetVendorCustomerInsightsQuery,
  useGetVendorFinancialReportsQuery,
  useGetVendorNotificationsQuery,
  useGetVendorCategoryPerformanceQuery,
  useGetVendorSalesTrendsQuery,
  useGetVendorCommissionAnalyticsQuery,
  useGetVendorPerformanceMetricsQuery,

  // Vendor - Bulk Operations
  useBulkUpdateListingsMutation,
  useBulkDeleteListingsMutation,

  // Vendor - Listing Management
  useUpdateListingStatusMutation,
  useUpdateListingInventoryMutation,

  // Vendor - Order Management
  useGetVendorOrderAnalyticsQuery,
  useUpdateOrderStatusWorkflowMutation,
  useBulkUpdateOrderStatusMutation,
  useGetOrderNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useGetOrderWorkflowStepsQuery,
  useUpdateOrderFulfillmentStepMutation,

  // Restaurant - Dashboard & Analytics
  useGetRestaurantOrdersQuery,
  useGetRestaurantAnalyticsQuery,
  useGetProductListingsQuery,

  // Restaurant - Advanced Dashboard Endpoints
  useGetRestaurantDashboardOverviewQuery,
  useGetRestaurantSpendingQuery,
  useGetRestaurantVendorInsightsQuery,
  useGetRestaurantBudgetQuery,
  useGetRestaurantOrderHistoryQuery,
  useGetRestaurantInventoryPlanningQuery,
  useGetRestaurantFavoriteVendorsQuery,
  useGetRestaurantNotificationsQuery,
  useGetRestaurantCostAnalysisQuery,
  useGetRestaurantPurchasePatternsQuery,
  useGetRestaurantDeliveryAnalyticsQuery,
  useGetRestaurantSeasonalInsightsQuery,
  useGetRestaurantVendorComparisonQuery,
  useGetRestaurantProcurementInsightsQuery,

  // Shared Notification Management
  useMarkNotificationsAsReadMutation,
  useMarkAllNotificationsAsReadMutation,

  // Restaurant - Profile Management
  useUpdateRestaurantProfileMutation,

  // Restaurant - Manager Management
  useGetRestaurantManagersQuery,
  useCreateRestaurantManagerMutation,
  useUpdateRestaurantManagerMutation,
  useDeactivateRestaurantManagerMutation,
  useDeleteRestaurantManagerMutation,

  // Admin - Restaurant Management
  useCreateAdminRestaurantOwnerMutation,
  useCreateAdminRestaurantManagerMutation,
  useCreateAdminVendorMutation,
  useGetRestaurantsListQuery,

  // Admin - Vendor Management
  useGetAdminVendorsQuery,
  // Legacy useVerifyVendorMutation removed - use unified approval system

  // Admin - Restaurant Management (Extended)
  useGetAdminRestaurantsQuery,
  // Legacy useVerifyRestaurantMutation removed - use unified approval system

  // Admin - Listings Management
  useGetAdminFeaturedListingsQuery,
  useGetFlaggedListingsQuery,
  useGetAdminListingQuery,
  useUpdateAdminListingStatusMutation,
  useToggleListingFeaturedMutation,
  useUpdateListingFlagMutation,
  useSoftDeleteListingMutation,
  useBulkUpdateAdminListingsMutation,

  // Three-State Verification Management (NEW)
  useUpdateVendorVerificationStatusMutation,
  useUpdateRestaurantVerificationStatusMutation,
  useBulkUpdateVerificationStatusMutation,

  // New Unified Admin Endpoints
  useGetAdminVendorsUnifiedQuery,
  useGetAdminRestaurantsUnifiedQuery,

  // New Restaurant Management Endpoints
  useGetRestaurantDetailsQuery,
  useUpdateRestaurantMutation,
  useDeactivateRestaurantMutation,
  useSafeDeleteRestaurantMutation,
  useCreateRestaurantOwnerMutation,

  // New Unified Vendor Management Endpoints
  useGetVendorDetailsQuery,
  useUpdateVendorMutation,
  useDeactivateVendorMutation,
  useSafeDeleteVendorMutation,

  // Enhanced Admin Dashboard
  useGetAdminDashboardOverviewQuery,

  // Advanced Analytics System
  useGetAnalyticsOverviewQuery,
  useGetSalesAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useClearAnalyticsCacheMutation,

  // System Settings Management
  useGetSystemSettingsQuery,
  useGetSettingsByCategoryQuery,
  useGetSettingQuery,
  useGetSettingHistoryQuery,
  useCreateSettingMutation,
  useUpdateSystemSettingMutation,
  useDeleteSettingMutation,
  useBulkUpdateSettingsMutation,
  useResetSystemSettingsMutation,

  // Content Moderation System

  // Enhanced User Management
  useGetVendorsQuery,
  useGetRestaurantsQuery,
  useToggleRestaurantStatusMutation,

  // Additional User Management
  useGetAllVendorsQuery,
  useUpdateVendorStatusMutation,
  useDeleteVendorMutation,

  // Enhanced Analytics
  useGetAdminAnalyticsOverviewQuery,

  // Safe Deletion Operations
  useSafeDeleteProductMutation,

  // Legacy featured listing hook (replaced by useToggleListingFeaturedMutation)

  // System Health
  useGetSystemHealthQuery,

  // Business Verification System (Updated)
  useGetUserBusinessStatusQuery,
  useGetAllVendorsAdminQuery,
  useGetAllRestaurantsAdminQuery,
  useGetVerificationStatsQuery,

  // Restaurant Management System (Prompt 6)
  useGetAdminRestaurantsStatsQuery,
  useUpdateRestaurantStatusMutation,
  useFlagRestaurantMutation,
  useApproveRestaurantVerificationMutation,
  useRejectRestaurantVerificationMutation,
  useRequestAdditionalDocumentsMutation,
  useFlagProductMutation,
  useReorderCategoriesMutation,
  useUpdateCategoryHierarchyMutation,

  // Listings Management System (Prompt 6)
  useGetAdminListingsQuery,
  useGetAdminListingsStatsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useFlagListingMutation,
  useUnflagListingMutation,
  useBulkModerateMutation,
  useDeleteListingMutation,

  // Restaurant Manager Operations
  useUpdateManagerPermissionsMutation,
  useDeactivateManagerMutation,
  useTransferOwnershipMutation,

  // Product Management Operations
  useGetAdminProductStatsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = apiSlice;
