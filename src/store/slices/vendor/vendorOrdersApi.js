/**
 * Vendor Orders RTK Query API Slice
 * Provides RTK Query endpoints for vendor order management
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const vendorOrdersApi = createApi({
  reducerPath: 'vendorOrdersApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/orders',
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
    'AllOrders', 
    'Order', 
    'OrderNotes', 
    'OrderMessages',
    'OrderAnalytics',
    'OrderPerformance',
    'RevenueAnalytics',
    'OrderSummary'
  ],
  endpoints: (builder) => ({
    
    // Order Management

    getAllOrders: builder.query({
      query: (params = {}) => ({
        url: '/',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['AllOrders'],
      // Poll every 2 minutes for new orders
      pollingInterval: 120000,
    }),

    getOrderById: builder.query({
      query: (orderId) => `/${orderId}`,
      transformResponse: (response) => response.data.order,
      providesTags: (result, error, orderId) => [
        { type: 'Order', id: orderId }
      ],
    }),

    // Order Status Updates

    updateOrderStatus: builder.mutation({
      query: ({ orderId, statusData }) => ({
        url: `/${orderId}/status`,
        method: 'PATCH',
        body: statusData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders'
      ],
      // Optimistic update
      onQueryStarted({ orderId, statusData }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          vendorOrdersApi.util.updateQueryData('getAllOrders', {}, (draft) => {
            const order = draft.orders?.find(o => o.id === orderId);
            if (order) {
              order.status = statusData.status;
              if (statusData.estimatedDeliveryTime) {
                order.estimatedDeliveryTime = statusData.estimatedDeliveryTime;
              }
            }
          })
        );
        queryFulfilled.catch(patchResult.undo);
      },
    }),

    confirmOrder: builder.mutation({
      query: ({ orderId, confirmationData = {} }) => ({
        url: `/${orderId}/confirm`,
        method: 'PATCH',
        body: confirmationData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders'
      ],
    }),

    startProcessing: builder.mutation({
      query: ({ orderId, processingData = {} }) => ({
        url: `/${orderId}/process`,
        method: 'PATCH',
        body: processingData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders'
      ],
    }),

    markOrderReady: builder.mutation({
      query: ({ orderId, readyData = {} }) => ({
        url: `/${orderId}/ready`,
        method: 'PATCH',
        body: readyData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders'
      ],
    }),

    markOrderDelivered: builder.mutation({
      query: ({ orderId, deliveryData }) => ({
        url: `/${orderId}/deliver`,
        method: 'PATCH',
        body: deliveryData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders',
        'OrderAnalytics',
        'RevenueAnalytics'
      ],
    }),

    cancelOrder: builder.mutation({
      query: ({ orderId, cancellationData }) => ({
        url: `/${orderId}/cancel`,
        method: 'PATCH',
        body: cancellationData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders',
        'OrderAnalytics'
      ],
    }),

    // Order Modifications

    updateOrderItems: builder.mutation({
      query: ({ orderId, itemsData }) => ({
        url: `/${orderId}/items`,
        method: 'PUT',
        body: itemsData,
      }),
      transformResponse: (response) => response.data.order,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'Order', id: orderId },
        'AllOrders'
      ],
    }),

    // Order Communication

    addOrderNote: builder.mutation({
      query: ({ orderId, noteData }) => ({
        url: `/${orderId}/notes`,
        method: 'POST',
        body: noteData,
      }),
      transformResponse: (response) => response.data.note,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'OrderNotes', id: orderId }
      ],
    }),

    getOrderNotes: builder.query({
      query: (orderId) => `/${orderId}/notes`,
      transformResponse: (response) => response.data.notes,
      providesTags: (result, error, orderId) => [
        { type: 'OrderNotes', id: orderId }
      ],
    }),

    sendCustomerMessage: builder.mutation({
      query: ({ orderId, messageData }) => ({
        url: `/${orderId}/messages`,
        method: 'POST',
        body: messageData,
      }),
      transformResponse: (response) => response.data.message,
      invalidatesTags: (result, error, { orderId }) => [
        { type: 'OrderMessages', id: orderId }
      ],
    }),

    getOrderMessages: builder.query({
      query: (orderId) => `/${orderId}/messages`,
      transformResponse: (response) => response.data.messages,
      providesTags: (result, error, orderId) => [
        { type: 'OrderMessages', id: orderId }
      ],
    }),

    // Analytics and Reports

    getOrderAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['OrderAnalytics'],
    }),

    getOrderPerformance: builder.query({
      query: (params = {}) => ({
        url: '/performance',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['OrderPerformance'],
    }),

    getRevenueAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/analytics/revenue',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['RevenueAnalytics'],
    }),

    getOrderSummary: builder.query({
      query: (params = {}) => ({
        url: '/summary',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['OrderSummary'],
    }),

    // Bulk Operations

    bulkUpdateStatus: builder.mutation({
      query: ({ orderIds, statusData }) => ({
        url: '/bulk-status',
        method: 'PATCH',
        body: { orderIds, ...statusData },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AllOrders', 'OrderAnalytics'],
      // Optimistic update for bulk status changes
      onQueryStarted({ orderIds, statusData }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          vendorOrdersApi.util.updateQueryData('getAllOrders', {}, (draft) => {
            if (draft.orders) {
              draft.orders.forEach(order => {
                if (orderIds.includes(order.id)) {
                  order.status = statusData.status;
                }
              });
            }
          })
        );
        queryFulfilled.catch(patchResult.undo);
      },
    }),

    // Export

    exportOrders: builder.mutation({
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
  // Order management
  useGetAllOrdersQuery,
  useLazyGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  
  // Status updates
  useUpdateOrderStatusMutation,
  useConfirmOrderMutation,
  useStartProcessingMutation,
  useMarkOrderReadyMutation,
  useMarkOrderDeliveredMutation,
  useCancelOrderMutation,
  
  // Order modifications
  useUpdateOrderItemsMutation,
  
  // Communication
  useAddOrderNoteMutation,
  useGetOrderNotesQuery,
  useLazyGetOrderNotesQuery,
  useSendCustomerMessageMutation,
  useGetOrderMessagesQuery,
  useLazyGetOrderMessagesQuery,
  
  // Analytics and reports
  useGetOrderAnalyticsQuery,
  useLazyGetOrderAnalyticsQuery,
  useGetOrderPerformanceQuery,
  useLazyGetOrderPerformanceQuery,
  useGetRevenueAnalyticsQuery,
  useLazyGetRevenueAnalyticsQuery,
  useGetOrderSummaryQuery,
  useLazyGetOrderSummaryQuery,
  
  // Bulk operations
  useBulkUpdateStatusMutation,
  
  // Export
  useExportOrdersMutation,
} = vendorOrdersApi;

export default vendorOrdersApi;