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
      query: () => '/public/featured-products',
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
        { type: 'Listing', id: 'VENDOR_LIST' }
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
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
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
        ...(result?.data?.users || []).map(({ id }) => ({ type: 'User', id }))
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
        ...(result?.data?.products || []).map(({ id }) => ({ type: 'Product', id }))
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
        ...(result?.data?.categories || []).map(({ id }) => ({ type: 'Category', id }))
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
  
  // Manager Management (Restaurant Owner Only)
  useCreateManagerMutation,
  useGetManagersQuery,
  useDeactivateManagerMutation,
  
  // Public endpoints
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetPublicProductsQuery,
  useGetPublicProductQuery,
  
  // Listings
  useGetListingsQuery,
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
} = apiSlice;
