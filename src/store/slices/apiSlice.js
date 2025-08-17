import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { logout } from './authSlice';

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
    // Don't set content-type here - let it be set per request
    // FormData requests need different content-type
    return headers;
  },
});

// Base query with auth handling
const baseQueryWithAuth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Token expired or invalid, logout user
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: [
    'User',
    'Product',
    'Order',
    'Listing',
    'Category',
    'Vendor',
    'Restaurant',
    'Admin',
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

    // Profile management endpoints
    updateUserProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/me',
        method: 'PUT',
        body: profileData,
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
      // Auto-refresh every 2 minutes for new orders
      pollingInterval: 120000,
    }),

    getVendorOrderAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/vendor/orders/analytics',
        params,
      }),
      providesTags: ['Order'],
      // Refresh analytics every 5 minutes
      pollingInterval: 300000,
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
      // Poll for notifications every 30 seconds
      pollingInterval: 30000,
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
        body: productData,
      }),
      invalidatesTags: [{ type: 'Product', id: 'ADMIN_LIST' }],
    }),

    updateAdminProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/admin/products/${id}`,
        method: 'PUT',
        body: productData,
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
      query: (params = {}) => ({
        url: '/admin/categories',
        params,
      }),
      providesTags: (result) => [
        { type: 'Category', id: 'ADMIN_LIST' },
        ...(result?.data?.categories || []).map(({ id }) => ({
          type: 'Category',
          id,
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
        body: categoryData,
      }),
      invalidatesTags: [
        { type: 'Category', id: 'ADMIN_LIST' },
        'Category', // Also invalidate public categories
      ],
    }),

    updateAdminCategory: builder.mutation({
      query: ({ id, ...categoryData }) => ({
        url: `/admin/categories/${id}`,
        method: 'PUT',
        body: categoryData,
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
      // Auto-refresh every 30 seconds for real-time updates
      pollingInterval: 30000,
    }),

    getVendorAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/vendor/analytics',
        params,
      }),
      providesTags: ['Vendor'],
      // Refresh analytics every 2 minutes
      pollingInterval: 120000,
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
      pollingInterval: 300000, // 5 minutes
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
      refetchOnFocus: true,
      refetchOnReconnect: true,
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
      pollingInterval: 600000, // 10-minute refresh for inventory
    }),

    // Vendor Order Management - Order processing interface
    getVendorOrderManagement: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/order-management',
        params,
      }),
      providesTags: ['Order', 'Vendor'],
      pollingInterval: 120000, // 2-minute refresh for orders
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
      pollingInterval: 60000, // 1-minute refresh for notifications
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
      refetchOnFocus: true,
      refetchOnReconnect: true,
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
      pollingInterval: 600000, // 10-minute refresh for budget
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
      pollingInterval: 60000, // 1-minute refresh for notifications
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

    getRestaurantsList: builder.query({
      query: (params = {}) => ({
        url: '/admin/restaurants',
        params,
      }),
      providesTags: ['Restaurant'],
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
  useDeleteListingMutation,

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
  useGetProductAnalyticsQuery,
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
  useGetRestaurantsListQuery,
} = apiSlice;
