/**
 * Vendor Listings RTK Query API Slice
 * Provides RTK Query endpoints for vendor product listings management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Custom base query that handles both relative and absolute URLs
const customBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1/vendor-dashboard/listings',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    // Don't set content-type - let browser handle it automatically
    // For JSON requests, RTK Query will set 'application/json'
    // For FormData requests, browser will set 'multipart/form-data' with boundary
    return headers;
  },
});

// Wrapper to handle absolute URLs by bypassing baseUrl
const baseQueryWithAbsoluteUrls = async (args, api, extraOptions) => {
  const url = typeof args === 'string' ? args : args.url;

  // If URL starts with '/api/', treat it as absolute and create new base query
  if (url && url.startsWith('/api/')) {
    const absoluteBaseQuery = fetchBaseQuery({
      prepareHeaders: (headers, { getState }) => {
        const token = getState().auth?.token;
        if (token) {
          headers.set('authorization', `Bearer ${token}`);
        }
        // Don't set content-type - let browser handle it automatically
        return headers;
      },
    });
    return absoluteBaseQuery(args, api, extraOptions);
  }

  // Otherwise use the custom base query with baseUrl
  return customBaseQuery(args, api, extraOptions);
};

const vendorListingsApi = createApi({
  reducerPath: 'vendorListingsApi',
  baseQuery: baseQueryWithAbsoluteUrls,
  tagTypes: [
    'AllListings',
    'Listing',
    'ListingPerformance',
    'ListingReviews',
    'ProductCatalog',
    'ListingCategories',
    'ListingImages',
  ],
  endpoints: (builder) => ({
    // Listing Management

    getAllListings: builder.query({
      query: (params = {}) => ({
        url: '/',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['AllListings'],
    }),

    getListingById: builder.query({
      query: (listingId) => `/${listingId}`,
      transformResponse: (response) => response.data.listing,
      providesTags: (result, error, listingId) => [
        { type: 'Listing', id: listingId },
      ],
    }),

    createListing: builder.mutation({
      query: (listingData) => ({
        url: '/',
        method: 'POST',
        body: listingData,
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: ['AllListings'],
    }),

    updateListing: builder.mutation({
      query: ({ listingId, updateData }) => ({
        url: `/${listingId}`,
        method: 'PUT',
        body: updateData,
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        'AllListings',
      ],
    }),

    deleteListing: builder.mutation({
      query: ({ listingId, permanent = false }) => ({
        url: `/${listingId}`,
        method: 'DELETE',
        params: permanent ? { permanent: true } : {},
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        'AllListings',
      ],
    }),

    // Status and Quick Updates

    updateListingStatus: builder.mutation({
      query: ({ listingId, status }) => ({
        url: `/${listingId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        'AllListings',
      ],
      // Optimistic update
      onQueryStarted({ listingId, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          vendorListingsApi.util.updateQueryData(
            'getAllListings',
            {},
            (draft) => {
              const listing = draft.listings?.find((l) => l.id === listingId);
              if (listing) {
                listing.status = status;
              }
            }
          )
        );
        queryFulfilled.catch(patchResult.undo);
      },
    }),

    updateListingInventory: builder.mutation({
      query: ({ listingId, inventoryData }) => ({
        url: `/${listingId}/inventory`,
        method: 'PATCH',
        body: inventoryData,
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        'AllListings',
      ],
    }),

    updateListingPricing: builder.mutation({
      query: ({ listingId, pricingData }) => ({
        url: `/${listingId}/pricing`,
        method: 'PATCH',
        body: pricingData,
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        'AllListings',
      ],
    }),

    // Performance and Reviews

    getListingPerformance: builder.query({
      query: ({ listingId, ...params }) => ({
        url: `/${listingId}/performance`,
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { listingId }) => [
        { type: 'ListingPerformance', id: listingId },
      ],
    }),

    getListingReviews: builder.query({
      query: ({ listingId, ...params }) => ({
        url: `/${listingId}/reviews`,
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: (result, error, { listingId }) => [
        { type: 'ListingReviews', id: listingId },
      ],
    }),

    respondToReview: builder.mutation({
      query: ({ listingId, reviewId, responseData }) => ({
        url: `/${listingId}/reviews/${reviewId}/respond`,
        method: 'POST',
        body: responseData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'ListingReviews', id: listingId },
      ],
    }),

    // Bulk Operations

    duplicateListing: builder.mutation({
      query: ({ listingId, modifications = {} }) => ({
        url: `/${listingId}/duplicate`,
        method: 'POST',
        body: modifications,
      }),
      transformResponse: (response) => response.data.listing,
      invalidatesTags: ['AllListings'],
    }),

    bulkUpdateListings: builder.mutation({
      query: (updates) => ({
        url: '/bulk-update',
        method: 'PUT',
        body: { updates },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllListings'],
    }),

    bulkUpdateStatus: builder.mutation({
      query: ({ listingIds, status }) => ({
        url: '/bulk-status',
        method: 'PATCH',
        body: { listingIds, status },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllListings'],
      // Optimistic update for bulk status changes
      onQueryStarted({ listingIds, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          vendorListingsApi.util.updateQueryData(
            'getAllListings',
            {},
            (draft) => {
              if (draft.listings) {
                draft.listings.forEach((listing) => {
                  if (listingIds.includes(listing.id)) {
                    listing.status = status;
                  }
                });
              }
            }
          )
        );
        queryFulfilled.catch(patchResult.undo);
      },
    }),

    // Advanced Bulk Pricing Operations
    bulkPricingUpdate: builder.mutation({
      query: (pricingUpdate) => ({
        url: '/bulk-pricing',
        method: 'PUT',
        body: pricingUpdate,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllListings'],
    }),

    // Support Data

    getProductCatalog: builder.query({
      query: (params = {}) => ({
        url: '/api/v1/public/products',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['ProductCatalog'],
    }),

    getListingCategories: builder.query({
      query: () => '/api/v1/public/categories',
      transformResponse: (response) => response.data,
      providesTags: ['ListingCategories'],
    }),

    // Image Management

    uploadListingImages: builder.mutation({
      query: ({ listingId, imagesFormData }) => ({
        url: `/${listingId}/images`,
        method: 'POST',
        body: imagesFormData,
        formData: true,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        { type: 'ListingImages', id: listingId },
      ],
    }),

    deleteListingImage: builder.mutation({
      query: ({ listingId, imageId }) => ({
        url: `/${listingId}/images/${imageId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { listingId }) => [
        { type: 'Listing', id: listingId },
        { type: 'ListingImages', id: listingId },
      ],
    }),

    // SEO Optimization

    optimizeListingSEO: builder.mutation({
      query: (listingId) => ({
        url: `/${listingId}/optimize-seo`,
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, listingId) => [
        { type: 'Listing', id: listingId },
      ],
    }),

    // Export

    exportListings: builder.mutation({
      query: (params) => ({
        url: '/export',
        method: 'POST',
        body: params,
      }),
      transformResponse: (response) => response.data,
    }),
  }),
});

export const {
  // Listing management
  useGetAllListingsQuery,
  useLazyGetAllListingsQuery,
  useGetListingByIdQuery,
  useLazyGetListingByIdQuery,
  useCreateListingMutation,
  useUpdateListingMutation,
  useDeleteListingMutation,

  // Quick updates
  useUpdateListingStatusMutation,
  useUpdateListingInventoryMutation,
  useUpdateListingPricingMutation,

  // Performance and reviews
  useGetListingPerformanceQuery,
  useLazyGetListingPerformanceQuery,
  useGetListingReviewsQuery,
  useLazyGetListingReviewsQuery,
  useRespondToReviewMutation,

  // Bulk operations
  useDuplicateListingMutation,
  useBulkUpdateListingsMutation,
  useBulkUpdateStatusMutation,
  useBulkPricingUpdateMutation,

  // Support data
  useGetProductCatalogQuery,
  useLazyGetProductCatalogQuery,
  useGetListingCategoriesQuery,

  // Image management
  useUploadListingImagesMutation,
  useDeleteListingImageMutation,

  // SEO optimization
  useOptimizeListingSEOMutation,

  // Export
  useExportListingsMutation,
} = vendorListingsApi;

export default vendorListingsApi;
