/**
 * Vendors Service - Admin V2
 * Aligned with actual backend endpoints and capabilities
 */

import { apiSlice } from '../../store/slices/apiSlice';

// RTK Query API Slice for Vendor Management - Backend Aligned
export const vendorsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Main vendor listing - matches backend GET /admin/vendors
    getVendors: builder.query({
      query: (params = {}) => ({
        url: '/admin/vendors',
        method: 'GET',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search || '',
          status: params.status || '', // pending, approved, rejected
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
        },
      }),
      providesTags: (result, error, params) => [
        'Vendor',
        { type: 'VendorList', id: JSON.stringify(params) },
      ],
      transformResponse: (response) => {
        // Direct mapping to backend response structure
        return {
          data: response.data || [],
          total: response.total || 0,
          pages: response.pages || 1,
          page: response.page || 1,
          count: response.count || 0,
          stats: response.stats || {
            totalVendors: 0,
            pendingVendors: 0,
            approvedVendors: 0,
            rejectedVendors: 0,
          },
        };
      },
    }),

    // Individual vendor details - matches backend GET /admin/vendors/:id
    getVendorDetails: builder.query({
      query: (vendorId) => ({
        url: `/admin/vendors/${vendorId}`,
        method: 'GET',
      }),
      providesTags: (result, error, vendorId) => [
        { type: 'Vendor', id: vendorId },
      ],
      transformResponse: (response) => {
        return response.data || {};
      },
    }),

    // Update vendor information - matches backend PUT /admin/vendors/:id
    updateVendor: builder.mutation({
      query: ({ vendorId, formData }) => ({
        url: `/admin/vendors/${vendorId}`,
        method: 'PUT',
        body: formData, // FormData for file upload support
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        'Vendor',
        'VendorList',
      ],
    }),

    // Toggle verification status - matches backend PUT /admin/vendors/:id/verification  
    updateVendorVerification: builder.mutation({
      query: ({ vendorId, status, reason }) => {
        // Clean the reason - trim and handle empty strings
        const cleanReason = reason ? reason.trim() : '';
        
        // Build payload exactly as backend expects: { status, reason }
        const payload = {
          status,
          ...(cleanReason && { reason: cleanReason }) // Only include reason if it's not empty
        };
        
        return {
          url: `/admin/vendors/${vendorId}/verification`,
          method: 'PUT',
          body: payload,
        };
      },
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        'Vendor',
        'VendorList',
      ],
    }),

    // Deactivate vendor - matches backend PUT /admin/vendors/:id/deactivate
    deactivateVendor: builder.mutation({
      query: ({ vendorId, reason }) => ({
        url: `/admin/vendors/${vendorId}/deactivate`,
        method: 'PUT',
        body: {
          reason,
        },
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        'Vendor',
        'VendorList',
      ],
    }),

    // Safe delete vendor - matches backend DELETE /admin/vendors/:id/safe-delete
    safeDeleteVendor: builder.mutation({
      query: ({ vendorId, reason }) => ({
        url: `/admin/vendors/${vendorId}/safe-delete`,
        method: 'DELETE',
        body: {
          reason,
        },
      }),
      invalidatesTags: (result, error, { vendorId }) => [
        { type: 'Vendor', id: vendorId },
        'Vendor',
        'VendorList',
      ],
    }),
  }),
});

// Export hooks for components - Only available backend endpoints
export const {
  // Queries
  useGetVendorsQuery,
  useGetVendorDetailsQuery,

  // Mutations  
  useUpdateVendorMutation,
  useUpdateVendorVerificationMutation,
  useDeactivateVendorMutation,
  useSafeDeleteVendorMutation,

  // Lazy queries
  useLazyGetVendorDetailsQuery,
} = vendorsApiSlice;

/**
 * Utility functions for vendor data processing
 */

// Calculate verification urgency level based on waiting time
export const calculateVerificationUrgency = (createdAt, verificationStatus) => {
  if (verificationStatus !== 'pending') return 'none';

  const daysWaiting = Math.floor(
    (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
  );

  if (daysWaiting >= 14) return 'critical'; // 2+ weeks
  if (daysWaiting >= 7) return 'high'; // 1+ week  
  if (daysWaiting >= 3) return 'medium'; // 3+ days
  return 'low'; // < 3 days
};

// Format address for display
export const formatVendorAddress = (address) => {
  if (!address) return 'Location not provided';
  
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.area) parts.push(address.area);
  if (address.postalCode) parts.push(address.postalCode);
  
  return parts.join(', ') || 'Location not provided';
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  });
};

// Default export for the service
export default vendorsApiSlice;