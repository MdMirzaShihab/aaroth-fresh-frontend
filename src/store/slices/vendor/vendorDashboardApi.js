/**
 * Vendor Dashboard RTK Query API Slice
 * Provides RTK Query endpoints for vendor dashboard and analytics data
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const vendorDashboardApi = createApi({
  reducerPath: 'vendorDashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL 
      ? `${import.meta.env.VITE_API_BASE_URL}/vendor-dashboard`
      : 'http://localhost:5000/api/v1/vendor-dashboard',
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
    'DashboardOverview', 
    'RevenueAnalytics', 
    'OrderAnalytics',
    'ProductAnalytics',
    'CustomerAnalytics',
    'InventoryStatus',
    'OrderManagement',
    'TopProducts',
    'SalesReports',
    'SeasonalTrends',
    'FinancialSummary',
    'VendorNotifications'
  ],
  endpoints: (builder) => ({
    
    // Dashboard Overview - Main dashboard metrics
    getDashboardOverview: builder.query({
      query: (params = {}) => ({
        url: '/overview',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['DashboardOverview'],
      pollingInterval: 300000, // 5 minutes
    }),

    // Revenue Analytics with profit integration
    getRevenueAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/revenue',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['RevenueAnalytics'],
    }),

    // Order Analytics - volume, status distribution, trends
    getOrderAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/orders',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['OrderAnalytics'],
    }),

    // Product Performance Analytics with profit metrics
    getProductAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/products',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['ProductAnalytics'],
    }),

    // Customer Insights and Analytics
    getCustomerAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/customers',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['CustomerAnalytics'],
    }),

    // Inventory Status and Alerts
    // UPDATED v2.1: Now uses consolidated /inventory endpoint with summary=true parameter
    getInventoryStatus: builder.query({
      query: (params = {}) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL
          ? `${import.meta.env.VITE_API_BASE_URL}/inventory`
          : 'http://localhost:5000/api/v1/inventory';

        return {
          url: baseUrl,
          params: { ...params, summary: 'true' }, // Summary mode for dashboard widgets
        };
      },
      transformResponse: (response) => response.data,
      providesTags: ['InventoryStatus'],
      pollingInterval: 180000, // 3 minutes for inventory updates
    }),

    // Order Management - pending, processing orders
    getOrderManagement: builder.query({
      query: (params = {}) => ({
        url: '/order-management',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['OrderManagement'],
    }),

    // Top Performing Products
    getTopProducts: builder.query({
      query: (params = {}) => ({
        url: '/top-products',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['TopProducts'],
    }),

    // Sales Reports
    getSalesReports: builder.query({
      query: (params = {}) => ({
        url: '/sales-reports',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['SalesReports'],
    }),

    // Seasonal Trends and Patterns
    getSeasonalTrends: builder.query({
      query: (params = {}) => ({
        url: '/seasonal-trends',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['SeasonalTrends'],
    }),

    // Financial Summary with P&L
    getFinancialSummary: builder.query({
      query: (params = {}) => ({
        url: '/financial-summary',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['FinancialSummary'],
    }),

    // Unified Notifications (system + inventory alerts)
    getVendorNotifications: builder.query({
      query: (params = {}) => ({
        url: '/notifications',
        params,
      }),
      transformResponse: (response) => response.data,
      providesTags: ['VendorNotifications'],
      pollingInterval: 120000, // Poll every 2 minutes
    }),

  }),
});

export const {
  // Dashboard overview
  useGetDashboardOverviewQuery,
  useLazyGetDashboardOverviewQuery,
  
  // Analytics hooks - matching backend endpoints
  useGetRevenueAnalyticsQuery,
  useLazyGetRevenueAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useLazyGetOrderAnalyticsQuery,
  useGetProductAnalyticsQuery,
  useLazyGetProductAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useLazyGetCustomerAnalyticsQuery,
  
  // Inventory and management
  useGetInventoryStatusQuery,
  useLazyGetInventoryStatusQuery,
  useGetOrderManagementQuery,
  useLazyGetOrderManagementQuery,
  
  // Reporting hooks
  useGetTopProductsQuery,
  useLazyGetTopProductsQuery,
  useGetSalesReportsQuery,
  useLazyGetSalesReportsQuery,
  useGetSeasonalTrendsQuery,
  useLazyGetSeasonalTrendsQuery,
  useGetFinancialSummaryQuery,
  useLazyGetFinancialSummaryQuery,
  
  // Notifications
  useGetVendorNotificationsQuery,
  useLazyGetVendorNotificationsQuery,
} = vendorDashboardApi;

export default vendorDashboardApi;