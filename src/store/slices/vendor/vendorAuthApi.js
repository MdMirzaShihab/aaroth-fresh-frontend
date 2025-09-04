/**
 * Vendor Authentication RTK Query API Slice
 * Provides RTK Query endpoints for vendor authentication and profile management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const vendorAuthApi = createApi({
  reducerPath: 'vendorAuthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['VendorProfile', 'VendorDocuments', 'VendorPayment'],
  endpoints: (builder) => ({
    
    // Authentication Endpoints
    
    loginVendor: builder.mutation({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => response.data,
    }),

    registerVendor: builder.mutation({
      query: (vendorData) => ({
        url: '/register',
        method: 'POST',
        body: vendorData,
      }),
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => response.data,
    }),

    refreshVendorToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/refresh',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.data,
      transformErrorResponse: (response) => response.data,
    }),

    logoutVendor: builder.mutation({
      query: (refreshToken) => ({
        url: '/logout',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorProfile'],
    }),

    forgotVendorPassword: builder.mutation({
      query: (phone) => ({
        url: '/forgot-password',
        method: 'POST',
        body: { phone },
      }),
      transformResponse: (response) => response.data,
    }),

    resetVendorPassword: builder.mutation({
      query: (resetData) => ({
        url: '/reset-password',
        method: 'POST',
        body: resetData,
      }),
      transformResponse: (response) => response.data,
    }),

    // Profile Management Endpoints

    getCurrentVendor: builder.query({
      query: () => '/me',
      transformResponse: (response) => response.data.user,
      providesTags: ['VendorProfile'],
    }),

    updateVendorProfile: builder.mutation({
      query: (profileData) => ({
        url: '/profile',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response) => response.data.user,
      invalidatesTags: ['VendorProfile'],
    }),

    changeVendorPassword: builder.mutation({
      query: (passwordData) => ({
        url: '/change-password',
        method: 'PUT',
        body: passwordData,
      }),
      transformResponse: (response) => response.data,
    }),

    uploadVendorDocuments: builder.mutation({
      query: (documentsFormData) => ({
        url: '/upload-documents',
        method: 'POST',
        body: documentsFormData,
        formData: true,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorDocuments', 'VendorProfile'],
    }),

    updateVendorPaymentInfo: builder.mutation({
      query: (paymentInfo) => ({
        url: '/payment-info',
        method: 'PUT',
        body: paymentInfo,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorPayment', 'VendorProfile'],
    }),

    deleteVendorAccount: builder.mutation({
      query: (deletionData) => ({
        url: '/account',
        method: 'DELETE',
        body: deletionData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorProfile'],
    }),
  }),
});

export const {
  // Authentication hooks
  useLoginVendorMutation,
  useRegisterVendorMutation,
  useRefreshVendorTokenMutation,
  useLogoutVendorMutation,
  useForgotVendorPasswordMutation,
  useResetVendorPasswordMutation,
  
  // Profile management hooks
  useGetCurrentVendorQuery,
  useLazyGetCurrentVendorQuery,
  useUpdateVendorProfileMutation,
  useChangeVendorPasswordMutation,
  useUploadVendorDocumentsMutation,
  useUpdateVendorPaymentInfoMutation,
  useDeleteVendorAccountMutation,
} = vendorAuthApi;

export default vendorAuthApi;