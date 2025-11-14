/**
 * Vendor Extensions RTK Query API Slice
 * Provides additional RTK Query endpoints for vendor features not covered in main API files
 *
 * ⚠️ WARNING: BACKEND IMPLEMENTATION STATUS
 * ====================================================================================
 * This file contains API hooks for features that are NOT YET IMPLEMENTED in the backend.
 * All endpoints defined here will return 404 errors until backend routes are created.
 *
 * STATUS: MOCK DATA ONLY - Backend development required for full functionality
 *
 * See: /API_ENDPOINT_ANALYSIS.md for complete details
 *
 * VERIFIED WORKING (use vendorDashboardApi.js instead):
 *   ✅ Dashboard overview, revenue, orders, products, customers (analytics)
 *   ✅ Financial summary, sales reports, seasonal trends
 *   ✅ Notifications (read-only via GET /api/v1/vendor-dashboard/notifications)
 *   ✅ Inventory management (via /api/v1/inventory)
 *   ✅ Listing CRUD (via /api/v1/vendor-dashboard/listings)
 *
 * NOT IMPLEMENTED (hooks below will fail):
 *   ❌ Notification CRUD (mark as read, delete, preferences)
 *   ❌ Review management (respond, flag)
 *   ❌ Customer details and notes
 *   ❌ Profile documents upload
 *   ❌ Banking details management
 *   ❌ Financial report exports (PDF/CSV/Excel)
 *
 * RECOMMENDATION FOR MVP:
 *   - Use mock data and console.log for actions
 *   - Display user warnings: "Feature coming soon - backend integration required"
 *   - OR implement these 28 endpoints in the backend
 * ====================================================================================
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const vendorExtensionsApi = createApi({
  reducerPath: 'vendorExtensionsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'VendorNotifications',
    'NotificationPreferences',
    'AllReviews',
    'VendorDocuments',
    'CustomerList',
  ],
  endpoints: (builder) => ({
    // ========================================
    // Notification Management
    // ⚠️ BACKEND NOT IMPLEMENTED - ALL ENDPOINTS BELOW WILL RETURN 404
    // Backend only has: GET /api/v1/vendor-dashboard/notifications (read-only)
    // These mutations will fail until backend implements the routes
    // ========================================

    /**
     * Mark a single notification as read
     * ⚠️ BACKEND NOT IMPLEMENTED - Will return 404
     */
    markNotificationRead: builder.mutation({
      query: (notificationId) => ({
        url: `/vendor-dashboard/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorNotifications'],
    }),

    /**
     * Mark a single notification as unread
     */
    markNotificationUnread: builder.mutation({
      query: (notificationId) => ({
        url: `/vendor-dashboard/notifications/${notificationId}/unread`,
        method: 'PATCH',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorNotifications'],
    }),

    /**
     * Mark all notifications as read
     */
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/vendor-dashboard/notifications/read-all',
        method: 'PATCH',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorNotifications'],
    }),

    /**
     * Delete a notification
     */
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/vendor-dashboard/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorNotifications'],
    }),

    /**
     * Clear all read notifications
     */
    clearReadNotifications: builder.mutation({
      query: () => ({
        url: '/vendor-dashboard/notifications/clear-read',
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorNotifications'],
    }),

    /**
     * Get notification preferences
     */
    getNotificationPreferences: builder.query({
      query: () => '/vendor-dashboard/notifications/preferences',
      transformResponse: (response) => response.data,
      providesTags: ['NotificationPreferences'],
    }),

    /**
     * Update notification preferences
     */
    updateNotificationPreferences: builder.mutation({
      query: (preferences) => ({
        url: '/vendor-dashboard/notifications/preferences',
        method: 'PUT',
        body: preferences,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['NotificationPreferences'],
    }),

    // ========================================
    // Aggregated Reviews
    // ⚠️ BACKEND NOT IMPLEMENTED - ALL ENDPOINTS BELOW WILL RETURN 404
    // No review endpoints exist in backend yet
    // These will fail until backend implements review management routes
    // ========================================

    /**
     * Get all reviews across all vendor listings (centralized view)
     * ⚠️ BACKEND NOT IMPLEMENTED - Will return 404
     */
    getAllVendorReviews: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/reviews',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['AllReviews'],
    }),

    /**
     * Respond to a review (delegates to listing-specific endpoint)
     */
    respondToVendorReview: builder.mutation({
      query: ({ reviewId, responseText }) => ({
        url: `/vendor-dashboard/reviews/${reviewId}/respond`,
        method: 'POST',
        body: { response: responseText },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllReviews'],
    }),

    /**
     * Flag/report a review as inappropriate
     */
    flagReview: builder.mutation({
      query: ({ reviewId, reason }) => ({
        url: `/vendor-dashboard/reviews/${reviewId}/flag`,
        method: 'POST',
        body: { reason },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllReviews'],
    }),

    // ========================================
    // Customer Management
    // ⚠️ BACKEND PARTIALLY IMPLEMENTED
    // Backend has: GET /api/v1/vendor-dashboard/customers (analytics only, NOT list)
    // These detail/notes/export endpoints will fail until backend implements them
    // ========================================

    /**
     * Get detailed customer list with order history
     * ⚠️ BACKEND NOT IMPLEMENTED - Will return 404
     * Note: GET /api/v1/vendor-dashboard/customers exists but returns analytics, not list
     */
    getCustomerList: builder.query({
      query: (params = {}) => ({
        url: '/vendor-dashboard/customers/list',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['CustomerList'],
    }),

    /**
     * Get customer detail with full order history
     */
    getCustomerDetail: builder.query({
      query: (customerId) => ({
        url: `/vendor-dashboard/customers/${customerId}`,
      }),
      transformResponse: (response) => response.data,
    }),

    /**
     * Add note to customer
     */
    addCustomerNote: builder.mutation({
      query: ({ customerId, note }) => ({
        url: `/vendor-dashboard/customers/${customerId}/notes`,
        method: 'POST',
        body: { note },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['CustomerList'],
    }),

    /**
     * Export customer data as CSV
     */
    exportCustomerData: builder.mutation({
      query: (params = {}) => ({
        url: '/vendor-dashboard/customers/export',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // ========================================
    // Profile & Document Management
    // ⚠️ BACKEND NOT IMPLEMENTED - ALL ENDPOINTS BELOW WILL RETURN 404
    // Backend only has: PUT /api/v1/auth/me (general profile update)
    // Specialized endpoints for documents, logo, hours, banking don't exist
    // These will fail until backend implements them
    // ========================================

    /**
     * Upload business document (license, registration, GST certificate, etc.)
     * ⚠️ BACKEND NOT IMPLEMENTED - Will return 404
     */
    uploadVendorDocument: builder.mutation({
      query: ({ documentType, file }) => {
        const formData = new FormData();
        formData.append('documentType', documentType);
        formData.append('document', file);

        return {
          url: '/vendor-dashboard/profile/documents',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorDocuments'],
    }),

    /**
     * Delete business document
     */
    deleteVendorDocument: builder.mutation({
      query: (documentId) => ({
        url: `/vendor-dashboard/profile/documents/${documentId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['VendorDocuments'],
    }),

    /**
     * Get all vendor documents
     */
    getVendorDocuments: builder.query({
      query: () => '/vendor-dashboard/profile/documents',
      transformResponse: (response) => response.data,
      providesTags: ['VendorDocuments'],
    }),

    /**
     * Upload vendor logo/profile image
     */
    uploadVendorLogo: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append('logo', file);

        return {
          url: '/vendor-dashboard/profile/logo',
          method: 'POST',
          body: formData,
          formData: true,
        };
      },
      transformResponse: (response) => response.data,
    }),

    /**
     * Update business hours
     */
    updateBusinessHours: builder.mutation({
      query: (hours) => ({
        url: '/vendor-dashboard/profile/business-hours',
        method: 'PUT',
        body: { operatingHours: hours },
      }),
      transformResponse: (response) => response.data,
    }),

    /**
     * Update banking details
     */
    updateBankingDetails: builder.mutation({
      query: (bankingData) => ({
        url: '/vendor-dashboard/profile/banking',
        method: 'PUT',
        body: bankingData,
      }),
      transformResponse: (response) => response.data,
    }),

    // ========================================
    // Financial Reports Export
    // ⚠️ BACKEND NOT IMPLEMENTED - ALL ENDPOINTS BELOW WILL RETURN 404
    // No export endpoints exist in backend yet
    // PDF/CSV/Excel generation endpoints need backend implementation
    // ========================================

    /**
     * Export financial report as PDF
     * ⚠️ BACKEND NOT IMPLEMENTED - Will return 404
     */
    exportFinancialReportPDF: builder.mutation({
      query: (params = {}) => ({
        url: '/vendor-dashboard/financial-summary/export/pdf',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    /**
     * Export financial report as CSV
     */
    exportFinancialReportCSV: builder.mutation({
      query: (params = {}) => ({
        url: '/vendor-dashboard/financial-summary/export/csv',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    /**
     * Export financial report as Excel
     */
    exportFinancialReportExcel: builder.mutation({
      query: (params = {}) => ({
        url: '/vendor-dashboard/financial-summary/export/excel',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  // Notification management
  useMarkNotificationReadMutation,
  useMarkNotificationUnreadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useClearReadNotificationsMutation,
  useGetNotificationPreferencesQuery,
  useLazyGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,

  // Aggregated reviews
  useGetAllVendorReviewsQuery,
  useLazyGetAllVendorReviewsQuery,
  useRespondToVendorReviewMutation,
  useFlagReviewMutation,

  // Customer management
  useGetCustomerListQuery,
  useLazyGetCustomerListQuery,
  useGetCustomerDetailQuery,
  useLazyGetCustomerDetailQuery,
  useAddCustomerNoteMutation,
  useExportCustomerDataMutation,

  // Profile & documents
  useUploadVendorDocumentMutation,
  useDeleteVendorDocumentMutation,
  useGetVendorDocumentsQuery,
  useLazyGetVendorDocumentsQuery,
  useUploadVendorLogoMutation,
  useUpdateBusinessHoursMutation,
  useUpdateBankingDetailsMutation,

  // Financial exports
  useExportFinancialReportPDFMutation,
  useExportFinancialReportCSVMutation,
  useExportFinancialReportExcelMutation,
} = vendorExtensionsApi;

export default vendorExtensionsApi;
