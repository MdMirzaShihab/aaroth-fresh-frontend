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
    headers.set('content-type', 'application/json');
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

    // Public endpoints
    getCategories: builder.query({
      query: () => '/public/categories',
      providesTags: ['Category'],
    }),

    getFeaturedProducts: builder.query({
      query: () => '/public/featured-products',
      providesTags: ['Product'],
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

    getListing: builder.query({
      query: (id) => `/listings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Listing', id }],
    }),

    createListing: builder.mutation({
      query: (newListing) => ({
        url: '/listings',
        method: 'POST',
        body: newListing,
      }),
      invalidatesTags: [{ type: 'Listing', id: 'LIST' }],
    }),

    updateListing: builder.mutation({
      query: ({ id, ...listing }) => ({
        url: `/listings/${id}`,
        method: 'PUT',
        body: listing,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Listing', id },
        { type: 'Listing', id: 'LIST' },
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
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: 'PUT',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Order', id },
        { type: 'Order', id: 'LIST' },
      ],
    }),

    // Admin endpoints
    getAllUsers: builder.query({
      query: (params = {}) => ({
        url: '/admin/users',
        params,
      }),
      providesTags: ['User'],
    }),

    approveVendor: builder.mutation({
      query: (id) => ({
        url: `/admin/users/${id}/approve`,
        method: 'PUT',
      }),
      invalidatesTags: ['User'],
    }),

    getAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/admin/analytics',
        params,
      }),
      providesTags: ['Admin'],
    }),
  }),
});

// Export hooks
export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useGetCategoriesQuery,
  useGetFeaturedProductsQuery,
  useGetListingsQuery,
  useGetListingQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useGetAllUsersQuery,
  useApproveVendorMutation,
  useGetAnalyticsQuery,
} = apiSlice;
