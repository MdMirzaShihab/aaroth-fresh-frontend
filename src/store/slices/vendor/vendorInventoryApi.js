/**
 * Vendor Inventory RTK Query API Slice
 * Provides RTK Query endpoints for vendor inventory management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const vendorInventoryApi = createApi({
  reducerPath: 'vendorInventoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/inventory',
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
    'InventoryOverview', 
    'InventoryItem', 
    'PurchaseHistory', 
    'StockAdjustments',
    'LowStockAlerts',
    'InventoryAnalytics',
    'InventoryValuation'
  ],
  endpoints: (builder) => ({
    
    // Inventory Overview

    getInventoryOverview: builder.query({
      query: (params = {}) => ({
        url: '/',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['InventoryOverview'],
    }),

    // Individual Inventory Items

    getInventoryItem: builder.query({
      query: (inventoryId) => `/${inventoryId}`,
      transformResponse: (response) => response.data.inventory,
      providesTags: (result, error, inventoryId) => [
        { type: 'InventoryItem', id: inventoryId }
      ],
    }),

    createInventoryItem: builder.mutation({
      query: (inventoryData) => ({
        url: '/',
        method: 'POST',
        body: inventoryData,
      }),
      transformResponse: (response) => response.data.inventory,
      invalidatesTags: ['InventoryOverview', 'LowStockAlerts'],
    }),

    updateInventoryItem: builder.mutation({
      query: ({ inventoryId, updateData }) => ({
        url: `/${inventoryId}`,
        method: 'PUT',
        body: updateData,
      }),
      transformResponse: (response) => response.data.inventory,
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'InventoryItem', id: inventoryId },
        'InventoryOverview',
        'LowStockAlerts',
        'InventoryValuation'
      ],
    }),

    deleteInventoryItem: builder.mutation({
      query: (inventoryId) => ({
        url: `/${inventoryId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, inventoryId) => [
        { type: 'InventoryItem', id: inventoryId },
        'InventoryOverview',
        'LowStockAlerts',
        'InventoryValuation'
      ],
    }),

    // Purchase Management

    recordPurchase: builder.mutation({
      query: (purchaseData) => ({
        url: '/purchases',
        method: 'POST',
        body: purchaseData,
      }),
      transformResponse: (response) => response.data.purchase,
      invalidatesTags: ['PurchaseHistory', 'InventoryOverview', 'InventoryValuation'],
    }),

    getPurchaseHistory: builder.query({
      query: (params = {}) => ({
        url: '/purchases',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['PurchaseHistory'],
    }),

    updatePurchase: builder.mutation({
      query: ({ purchaseId, updateData }) => ({
        url: `/purchases/${purchaseId}`,
        method: 'PUT',
        body: updateData,
      }),
      transformResponse: (response) => response.data.purchase,
      invalidatesTags: ['PurchaseHistory', 'InventoryOverview', 'InventoryValuation'],
    }),

    deletePurchase: builder.mutation({
      query: (purchaseId) => ({
        url: `/purchases/${purchaseId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['PurchaseHistory', 'InventoryOverview', 'InventoryValuation'],
    }),

    // Stock Adjustments

    adjustStock: builder.mutation({
      query: ({ inventoryId, adjustmentData }) => ({
        url: `/${inventoryId}/adjust`,
        method: 'POST',
        body: adjustmentData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { inventoryId }) => [
        { type: 'InventoryItem', id: inventoryId },
        'InventoryOverview',
        'StockAdjustments',
        'LowStockAlerts',
        'InventoryValuation'
      ],
    }),

    getStockAdjustments: builder.query({
      query: ({ inventoryId = null, ...params } = {}) => {
        const url = inventoryId ? `/${inventoryId}/adjustments` : '/adjustments';
        return { url, params };
      },
      transformResponse: (response) => response.data,
      providesTags: ['StockAdjustments'],
    }),

    // Alerts and Analytics

    getLowStockAlerts: builder.query({
      query: (params = {}) => ({
        url: '/alerts/low-stock',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['LowStockAlerts'],
      // Poll every 5 minutes for low stock alerts
      pollingInterval: 300000,
    }),

    getInventoryAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['InventoryAnalytics'],
    }),

    getInventoryValuation: builder.query({
      query: (params = {}) => ({
        url: '/valuation',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['InventoryValuation'],
    }),

    // Bulk Operations

    bulkUpdateInventory: builder.mutation({
      query: (updates) => ({
        url: '/bulk-update',
        method: 'PUT',
        body: { updates },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['InventoryOverview', 'LowStockAlerts', 'InventoryValuation'],
    }),

    // Sync and Export

    syncInventory: builder.mutation({
      query: (syncData) => ({
        url: '/sync',
        method: 'POST',
        body: syncData,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['InventoryOverview', 'LowStockAlerts', 'InventoryValuation'],
    }),

    exportInventory: builder.mutation({
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
  // Inventory overview
  useGetInventoryOverviewQuery,
  useLazyGetInventoryOverviewQuery,
  
  // Individual inventory items
  useGetInventoryItemQuery,
  useLazyGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  
  // Purchase management
  useRecordPurchaseMutation,
  useGetPurchaseHistoryQuery,
  useLazyGetPurchaseHistoryQuery,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  
  // Stock adjustments
  useAdjustStockMutation,
  useGetStockAdjustmentsQuery,
  useLazyGetStockAdjustmentsQuery,
  
  // Alerts and analytics
  useGetLowStockAlertsQuery,
  useLazyGetLowStockAlertsQuery,
  useGetInventoryAnalyticsQuery,
  useLazyGetInventoryAnalyticsQuery,
  useGetInventoryValuationQuery,
  useLazyGetInventoryValuationQuery,
  
  // Bulk operations
  useBulkUpdateInventoryMutation,
  
  // Sync and export
  useSyncInventoryMutation,
  useExportInventoryMutation,
} = vendorInventoryApi;

export default vendorInventoryApi;