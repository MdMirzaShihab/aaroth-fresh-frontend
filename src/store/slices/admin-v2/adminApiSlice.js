/**
 * Admin V2 API Slice - Comprehensive Admin Interface RTK Query Integration
 * Covers all 44 admin endpoints from ADMIN_INTERFACE_PLAN.md
 * 
 * Categories:
 * - Dashboard & Analytics (7 APIs)
 * - User Management (6 APIs) 
 * - Vendor Management (6 APIs)
 * - Restaurant Management (6 APIs)
 * - Product Management (5 APIs)
 * - Category Management (7 APIs)
 * - Listings Management (7 APIs)
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL for admin API endpoints
const ADMIN_API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const adminBaseQuery = fetchBaseQuery({
  baseUrl: `${ADMIN_API_BASE_URL}/admin`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('content-type', 'application/json');
    return headers;
  },
});

// Enhanced base query with error handling for admin operations
const adminBaseQueryWithErrorHandling = async (args, api, extraOptions) => {
  let result = await adminBaseQuery(args, api, extraOptions);

  // Handle 401 errors by delegating to main API slice's reauth logic
  if (result.error?.status === 401) {
    // Let the main apiSlice handle token refresh
    api.dispatch({ type: 'auth/logout' });
  }

  return result;
};

export const adminApiV2Slice = createApi({
  reducerPath: 'adminApiV2',
  baseQuery: adminBaseQueryWithErrorHandling,
  tagTypes: [
    // Core entity tags
    'AdminDashboard',
    'AdminAnalytics', 
    'AdminUsers',
    'AdminVendors',
    'AdminRestaurants',
    'AdminProducts',
    'AdminCategories',
    'AdminListings',
    // Specific workflow tags
    'UserManagement',
    'VendorVerification',
    'RestaurantVerification',
    'BusinessVerification',
    'ContentModeration',
    'SystemSettings',
    'PerformanceMetrics',
    'SalesAnalytics',
    'UserAnalytics',
    'ProductAnalytics',
    'CategoryUsage'
  ],
  endpoints: (builder) => ({
    // ============================================
    // 1. DASHBOARD & ANALYTICS ENDPOINTS (7 APIs)
    // ============================================
    
    // Main admin dashboard with KPIs and overview metrics
    getAdminDashboardV2: builder.query({
      query: () => 'dashboard',
      providesTags: ['AdminDashboard'],
      // Auto-refresh every 5 minutes for real-time admin metrics
      pollingInterval: 300000,
    }),

    // Comprehensive dashboard overview with detailed statistics
    getDashboardOverview: builder.query({
      query: (params = {}) => ({
        url: 'dashboard/overview',
        params,
      }),
      providesTags: ['AdminDashboard'],
      pollingInterval: 300000,
    }),

    // Analytics overview with business intelligence metrics  
    getAnalyticsOverview: builder.query({
      query: (params = {}) => ({
        url: 'analytics/overview',
        params: {
          period: params.period || '30d',
          startDate: params.startDate,
          endDate: params.endDate,
          ...params,
        },
      }),
      providesTags: ['AdminAnalytics'],
      // Cache analytics for 15 minutes
      keepUnusedDataFor: 900,
    }),

    // Sales analytics with revenue and transaction insights
    getSalesAnalytics: builder.query({
      query: (params = {}) => ({
        url: 'analytics/sales',
        params: {
          period: params.period || '30d',
          groupBy: params.groupBy || 'day',
          vendor: params.vendor,
          category: params.category,
          ...params,
        },
      }),
      providesTags: ['SalesAnalytics', 'AdminAnalytics'],
      keepUnusedDataFor: 900,
    }),

    // User analytics with registration and activity metrics
    getUserAnalytics: builder.query({
      query: (params = {}) => ({
        url: 'analytics/users',
        params: {
          period: params.period || '30d',
          role: params.role,
          verificationStatus: params.verificationStatus,
          ...params,
        },
      }),
      providesTags: ['UserAnalytics', 'AdminAnalytics'],
      keepUnusedDataFor: 900,
    }),

    // Product analytics with performance and popularity metrics
    getProductAnalyticsV2: builder.query({
      query: (params = {}) => ({
        url: 'analytics/products',
        params: {
          period: params.period || '30d',
          category: params.category,
          vendor: params.vendor,
          ...params,
        },
      }),
      providesTags: ['ProductAnalytics', 'AdminAnalytics'],
      keepUnusedDataFor: 900,
    }),

    // Clear analytics cache for fresh data regeneration
    clearAnalyticsCache: builder.mutation({
      query: () => ({
        url: 'analytics/cache',
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminAnalytics', 'SalesAnalytics', 'UserAnalytics', 'ProductAnalytics'],
    }),

    // ========================================
    // 2. USER MANAGEMENT ENDPOINTS (6 APIs)
    // ========================================

    // Get all users with advanced filtering and pagination
    getAdminUsersV2: builder.query({
      query: (params = {}) => ({
        url: 'users',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          role: params.role,
          verificationStatus: params.verificationStatus,
          isApproved: params.isApproved,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          ...params,
        },
      }),
      providesTags: (result) => [
        { type: 'AdminUsers', id: 'LIST' },
        ...(result?.data?.users || []).map(({ _id }) => ({ type: 'AdminUsers', id: _id })),
      ],
    }),

    // Get individual user details with complete profile information
    getAdminUserDetails: builder.query({
      query: (id) => `users/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminUsers', id }],
    }),

    // Update user profile and account settings
    updateAdminUserV2: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `users/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminUsers', id },
        { type: 'AdminUsers', id: 'LIST' },
        'UserManagement',
      ],
      // Optimistic update for immediate UI feedback
      onQueryStarted: async ({ id, ...userData }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          adminApiV2Slice.util.updateQueryData('getAdminUsersV2', undefined, (draft) => {
            const user = draft?.data?.users?.find(u => u._id === id);
            if (user) {
              Object.assign(user, userData);
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

    // Safe delete user with dependency checking
    deleteAdminUserV2: builder.mutation({
      query: (id) => ({
        url: `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'AdminUsers', id },
        { type: 'AdminUsers', id: 'LIST' },
        'UserManagement',
      ],
    }),

    // Create restaurant owner with business entity
    createRestaurantOwnerV2: builder.mutation({
      query: (ownerData) => ({
        url: 'restaurant-owners',
        method: 'POST',
        body: ownerData,
      }),
      invalidatesTags: ['AdminUsers', 'AdminRestaurants', 'UserManagement'],
    }),

    // Create restaurant manager under existing restaurant
    createRestaurantManagerV2: builder.mutation({
      query: (managerData) => ({
        url: 'restaurant-managers', 
        method: 'POST',
        body: managerData,
      }),
      invalidatesTags: ['AdminUsers', 'AdminRestaurants', 'UserManagement'],
    }),

    // ==========================================
    // 3. VENDOR MANAGEMENT ENDPOINTS (6 APIs)
    // ==========================================

    // Get all vendors with business information and verification status
    getAdminVendorsV2: builder.query({
      query: (params = {}) => ({
        url: 'vendors',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          verificationStatus: params.verificationStatus,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          businessType: params.businessType,
          location: params.location,
          ...params,
        },
      }),
      providesTags: (result) => [
        { type: 'AdminVendors', id: 'LIST' },
        ...(result?.data || []).map(({ _id }) => ({ type: 'AdminVendors', id: _id })),
      ],
    }),

    // Get vendor details with business metrics and performance data
    getVendorDetailsV2: builder.query({
      query: (id) => `vendors/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminVendors', id }],
    }),

    // Update vendor business information and settings
    updateVendorV2: builder.mutation({
      query: ({ id, ...vendorData }) => ({
        url: `vendors/${id}`,
        method: 'PUT', 
        body: vendorData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminVendors', id },
        { type: 'AdminVendors', id: 'LIST' },
        'VendorVerification',
      ],
    }),

    // Update vendor verification status (pending, approved, rejected)
    updateVendorVerificationV2: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `vendors/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: [
        'AdminVendors', 
        'VendorVerification', 
        'BusinessVerification',
        'AdminDashboard'
      ],
      // Optimistic update for verification status
      onQueryStarted: async ({ id, status, reason }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          adminApiV2Slice.util.updateQueryData('getAdminVendorsV2', undefined, (draft) => {
            const vendor = draft?.data?.find(v => v._id === id);
            if (vendor) {
              vendor.verificationStatus = status;
              vendor.adminNotes = reason;
              vendor.verificationDate = status === 'approved' ? new Date().toISOString() : null;
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

    // Deactivate vendor with business impact analysis
    deactivateVendorV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `vendors/${id}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminVendors', id },
        { type: 'AdminVendors', id: 'LIST' },
        'VendorVerification',
      ],
    }),

    // Safe delete vendor with dependency checking
    safeDeleteVendorV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `vendors/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['AdminVendors', 'VendorVerification'],
    }),

    // ===============================================
    // 4. RESTAURANT MANAGEMENT ENDPOINTS (6 APIs)  
    // ===============================================

    // Get all restaurants with business information
    getAdminRestaurantsV2: builder.query({
      query: (params = {}) => ({
        url: 'restaurants',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          status: params.status, // pending, approved, rejected
          verificationStatus: params.verificationStatus,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          businessType: params.businessType,
          location: params.location,
          ...params,
        },
      }),
      providesTags: (result) => [
        { type: 'AdminRestaurants', id: 'LIST' },
        ...(result?.data || []).map(({ _id }) => ({ type: 'AdminRestaurants', id: _id })),
      ],
    }),

    // Get restaurant details with ordering history and metrics
    getRestaurantDetailsV2: builder.query({
      query: (id) => `restaurants/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminRestaurants', id }],
    }),

    // Update restaurant business information
    updateRestaurantV2: builder.mutation({
      query: ({ id, ...restaurantData }) => ({
        url: `restaurants/${id}`,
        method: 'PUT',
        body: restaurantData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminRestaurants', id },
        { type: 'AdminRestaurants', id: 'LIST' },
        'RestaurantVerification',
      ],
    }),

    // Update restaurant verification status
    updateRestaurantVerificationV2: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `restaurants/${id}/verification`,
        method: 'PUT',
        body: { status, reason },
      }),
      invalidatesTags: [
        'AdminRestaurants',
        'RestaurantVerification', 
        'BusinessVerification',
        'AdminDashboard'
      ],
      // Optimistic update for verification status
      onQueryStarted: async ({ id, status, reason }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          adminApiV2Slice.util.updateQueryData('getAdminRestaurantsV2', undefined, (draft) => {
            const restaurant = draft?.data?.find(r => r._id === id);
            if (restaurant) {
              restaurant.verificationStatus = status;
              restaurant.adminNotes = reason;
              restaurant.verificationDate = status === 'approved' ? new Date().toISOString() : null;
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

    // Deactivate restaurant with order impact analysis
    deactivateRestaurantV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `restaurants/${id}/deactivate`,
        method: 'PUT',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminRestaurants', id },
        { type: 'AdminRestaurants', id: 'LIST' },
        'RestaurantVerification',
      ],
    }),

    // Safe delete restaurant with dependency checking
    safeDeleteRestaurantV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `restaurants/${id}/safe-delete`,
        method: 'DELETE', 
        body: { reason },
      }),
      invalidatesTags: ['AdminRestaurants', 'RestaurantVerification'],
    }),

    // ==========================================
    // 5. PRODUCT MANAGEMENT ENDPOINTS (5 APIs)
    // ==========================================

    // Get all products with inventory and performance data
    getAdminProductsV2: builder.query({
      query: (params = {}) => ({
        url: 'products',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          category: params.category,
          vendor: params.vendor,
          status: params.status,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          sortOrder: params.sortOrder || 'desc',
          priceRange: params.priceRange,
          availability: params.availability,
          ...params,
        },
      }),
      providesTags: (result) => [
        { type: 'AdminProducts', id: 'LIST' },
        ...(result?.data?.products || []).map(({ _id }) => ({ type: 'AdminProducts', id: _id })),
      ],
    }),

    // Get product details with analytics and listing information  
    getAdminProductDetails: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminProducts', id }],
    }),

    // Create new product with image upload support
    createAdminProductV2: builder.mutation({
      query: (productData) => ({
        url: 'products',
        method: 'POST',
        body: productData, // FormData for image uploads
        // Let browser set Content-Type for FormData
      }),
      invalidatesTags: [{ type: 'AdminProducts', id: 'LIST' }],
    }),

    // Update product information and images
    updateAdminProductV2: builder.mutation({
      query: ({ id, formData }) => ({
        url: `products/${id}`,
        method: 'PUT',
        body: formData, // FormData for optional image updates
        // Let browser set Content-Type for FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminProducts', id },
        { type: 'AdminProducts', id: 'LIST' },
      ],
    }),

    // Safe delete product with usage dependency checking
    safeDeleteProductV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `products/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['AdminProducts'],
    }),

    // =============================================
    // 6. CATEGORY MANAGEMENT ENDPOINTS (7 APIs)
    // =============================================

    // Get all categories with hierarchy and usage statistics
    getAdminCategoriesV2: builder.query({
      query: (params = {}) => ({
        url: 'categories',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          search: params.search,
          isActive: params.isActive,
          isAvailable: params.isAvailable,
          level: params.level,
          parentCategory: params.parentCategory,
          sortBy: params.sortBy || 'name',
          sortOrder: params.sortOrder || 'asc',
          ...params,
        },
      }),
      providesTags: (result) => [
        { type: 'AdminCategories', id: 'LIST' },
        ...(result?.data || []).map(({ _id }) => ({ type: 'AdminCategories', id: _id })),
      ],
    }),

    // Get category details with products and performance metrics
    getAdminCategoryDetails: builder.query({
      query: (id) => `categories/${id}`,
      providesTags: (result, error, id) => [{ type: 'AdminCategories', id }],
    }),

    // Get category usage statistics and analytics
    getCategoryUsageStats: builder.query({
      query: (id) => `categories/${id}/usage`,
      providesTags: (result, error, id) => [{ type: 'CategoryUsage', id }],
      // Cache usage stats for 30 minutes
      keepUnusedDataFor: 1800,
    }),

    // Create new category with image and hierarchy support
    createAdminCategoryV2: builder.mutation({
      query: (categoryData) => ({
        url: 'categories',
        method: 'POST', 
        body: categoryData, // FormData for image uploads
        // Let browser set Content-Type for FormData
      }),
      invalidatesTags: [
        { type: 'AdminCategories', id: 'LIST' },
        'AdminCategories',
      ],
    }),

    // Update category information and hierarchy
    updateAdminCategoryV2: builder.mutation({
      query: ({ id, formData }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: formData, // FormData for optional image updates
        // Let browser set Content-Type for FormData
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminCategories', id },
        { type: 'AdminCategories', id: 'LIST' },
        'AdminCategories',
      ],
    }),

    // Toggle category availability (flag/unflag system)
    toggleCategoryAvailabilityV2: builder.mutation({
      query: ({ id, isAvailable, flagReason }) => ({
        url: `categories/${id}/availability`,
        method: 'PUT',
        body: { isAvailable, flagReason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'AdminCategories', id },
        { type: 'AdminCategories', id: 'LIST' },
        'ContentModeration',
      ],
    }),

    // Safe delete category with product dependency checking
    safeDeleteCategoryV2: builder.mutation({
      query: ({ id, reason }) => ({
        url: `categories/${id}/safe-delete`,
        method: 'DELETE',
        body: { reason },
      }),
      invalidatesTags: ['AdminCategories'],
    }),

    // =========================================
    // 7. BULK OPERATIONS & ADVANCED FEATURES
    // =========================================

    // Bulk update verification status for multiple entities
    bulkUpdateVerificationStatus: builder.mutation({
      query: ({ userIds, entityType, status, reason }) => ({
        url: 'bulk/verification',
        method: 'POST',
        body: { userIds, entityType, status, reason },
      }),
      invalidatesTags: [
        'AdminVendors',
        'AdminRestaurants', 
        'VendorVerification',
        'RestaurantVerification',
        'BusinessVerification',
        'AdminDashboard',
      ],
    }),

    // System settings management
    getSystemSettings: builder.query({
      query: (filter = {}) => ({
        url: 'settings',
        params: filter,
      }),
      providesTags: ['SystemSettings'],
    }),

    // Update system setting
    updateSystemSetting: builder.mutation({
      query: ({ key, value, changeReason }) => ({
        url: `settings/key/${key}`,
        method: 'PUT',
        body: { value, changeReason },
      }),
      invalidatesTags: ['SystemSettings'],
    }),

    // ================================================
    // ENHANCED SETTINGS MANAGEMENT ENDPOINTS (Prompt 8)
    // ================================================

    // Get settings by category
    getCategorySettings: builder.query({
      query: (category) => ({
        url: `settings/category/${category}`,
      }),
      providesTags: (result, error, category) => [
        { type: 'SystemSettings', id: category },
        'SystemSettings'
      ],
    }),

    // Get individual setting by key
    getSettingByKey: builder.query({
      query: (key) => ({
        url: `settings/key/${key}`,
      }),
      providesTags: (result, error, key) => [
        { type: 'SystemSettings', id: key }
      ],
    }),

    // Get settings history for audit trail
    getSettingHistory: builder.query({
      query: ({ key, category, timeRange = '30d', type, search, page = 1, limit = 50 }) => ({
        url: key ? `settings/key/${key}/history` : 'settings/history',
        params: {
          category,
          timeRange,
          type,
          search,
          page,
          limit,
        },
      }),
      providesTags: (result, error, { key, category }) => [
        { type: 'SettingsHistory', id: key || category || 'all' }
      ],
    }),

    // Bulk update multiple settings
    bulkUpdateSettings: builder.mutation({
      query: ({ settings, changeReason }) => ({
        url: 'settings/bulk',
        method: 'PUT',
        body: { settings, changeReason },
      }),
      invalidatesTags: ['SystemSettings', 'SettingsHistory'],
    }),

    // Reset settings to default values
    resetSystemSetting: builder.mutation({
      query: ({ keys, category, reason }) => ({
        url: 'settings/reset',
        method: 'POST',
        body: { keys, category, reason },
      }),
      invalidatesTags: ['SystemSettings', 'SettingsHistory'],
    }),

    // Validate setting value
    validateSetting: builder.mutation({
      query: ({ key, value }) => ({
        url: `settings/key/${key}/validate`,
        method: 'POST',
        body: { value },
      }),
    }),

    // Get settings schema/configuration
    getSettingsSchema: builder.query({
      query: (category) => ({
        url: 'settings/schema',
        params: { category },
      }),
      providesTags: ['SettingsSchema'],
    }),

    // Import settings from file
    importSettings: builder.mutation({
      query: ({ settings, importMode = 'merge', changeReason }) => ({
        url: 'settings/import',
        method: 'POST',
        body: { settings, importMode, changeReason },
      }),
      invalidatesTags: ['SystemSettings', 'SettingsHistory'],
    }),

    // Export settings
    exportSettings: builder.query({
      query: ({ category, format = 'json', includeDefaults = false }) => ({
        url: 'settings/export',
        params: { category, format, includeDefaults },
      }),
    }),

    // Get settings templates
    getSettingsTemplates: builder.query({
      query: () => ({
        url: 'settings/templates',
      }),
      providesTags: ['SettingsTemplates'],
    }),

    // Apply settings template
    applySettingsTemplate: builder.mutation({
      query: ({ templateId, overrides = {}, changeReason }) => ({
        url: `settings/templates/${templateId}/apply`,
        method: 'POST',
        body: { overrides, changeReason },
      }),
      invalidatesTags: ['SystemSettings', 'SettingsHistory'],
    }),

    // Performance monitoring and SLA tracking
    getPerformanceMetrics: builder.query({
      query: (params = {}) => ({
        url: 'performance/metrics',
        params,
      }),
      providesTags: ['PerformanceMetrics'],
      // Auto-refresh performance metrics every 2 minutes
      pollingInterval: 120000,
    }),

    // ================================================
    // 8. ENHANCED ANALYTICS ENDPOINTS (Prompt 7)
    // ================================================

    // Get comprehensive product analytics with inventory insights
    getProductAnalytics: builder.query({
      query: (params = {}) => ({
        url: 'analytics/products/comprehensive',
        params: {
          timeRange: params.timeRange || '30d',
          category: params.category,
          vendor: params.vendor,
          includeInventory: params.includeInventory !== false,
          includeTrends: params.includeTrends !== false,
          ...params,
        },
      }),
      providesTags: ['ProductAnalytics', 'AdminAnalytics'],
      keepUnusedDataFor: 600, // 10 minutes
    }),

    // ================================================
    // 9. PERFORMANCE MONITORING ENDPOINTS (Prompt 7)
    // ================================================

    // Get performance overview with system health metrics
    getPerformanceOverview: builder.query({
      query: (params = {}) => ({
        url: 'performance/overview',
        params: {
          timeRange: params.timeRange || '24h',
          includeAlerts: params.includeAlerts !== false,
          includeSystemHealth: params.includeSystemHealth !== false,
          ...params,
        },
      }),
      providesTags: ['PerformanceMetrics'],
      // Refresh every minute for real-time monitoring
      pollingInterval: 60000,
    }),

    // Get admin team performance metrics and efficiency tracking
    getAdminPerformance: builder.query({
      query: (params = {}) => ({
        url: 'performance/admin-team',
        params: {
          timeRange: params.timeRange || '24h',
          department: params.department,
          includeIndividual: params.includeIndividual !== false,
          includeWorkload: params.includeWorkload !== false,
          ...params,
        },
      }),
      providesTags: ['PerformanceMetrics', 'AdminUsers'],
      keepUnusedDataFor: 300, // 5 minutes
    }),

    // Get SLA metrics and compliance tracking
    getSLAMetrics: builder.query({
      query: (params = {}) => ({
        url: 'performance/sla',
        params: {
          timeRange: params.timeRange || '24h',
          includeViolations: params.includeViolations !== false,
          severity: params.severity, // critical, high, medium, low
          status: params.status, // active, resolved
          ...params,
        },
      }),
      providesTags: ['PerformanceMetrics'],
      // Refresh SLA data every 2 minutes
      pollingInterval: 120000,
    }),

    // Create or update SLA violation
    updateSLAViolation: builder.mutation({
      query: ({ violationId, status, resolution, assignee }) => ({
        url: `performance/sla/violations/${violationId}`,
        method: 'PUT',
        body: { status, resolution, assignee },
      }),
      invalidatesTags: ['PerformanceMetrics'],
    }),

    // ================================================
    // 10. REPORT GENERATION ENDPOINTS (Prompt 7)
    // ================================================

    // Generate analytics report with custom parameters
    generateAnalyticsReport: builder.mutation({
      query: (reportConfig) => ({
        url: 'reports/analytics/generate',
        method: 'POST',
        body: {
          template: reportConfig.template || 'comprehensive',
          format: reportConfig.format || 'pdf', // pdf, csv, both
          timeRange: reportConfig.timeRange || '30d',
          sections: reportConfig.sections || ['overview', 'sales', 'users', 'products'],
          includeCharts: reportConfig.includeCharts !== false,
          includeRawData: reportConfig.includeRawData !== false,
          recipientEmail: reportConfig.recipientEmail,
          customFilters: reportConfig.customFilters,
          ...reportConfig,
        },
      }),
      // Don't cache report generation
      invalidatesTags: [],
    }),

    // Schedule recurring analytics reports
    scheduleAnalyticsReport: builder.mutation({
      query: (scheduleConfig) => ({
        url: 'reports/analytics/schedule',
        method: 'POST',
        body: {
          schedule: scheduleConfig.schedule, // daily, weekly, monthly
          template: scheduleConfig.template || 'comprehensive',
          format: scheduleConfig.format || 'pdf',
          sections: scheduleConfig.sections,
          recipients: scheduleConfig.recipients || [],
          timeZone: scheduleConfig.timeZone || 'UTC',
          isActive: scheduleConfig.isActive !== false,
          ...scheduleConfig,
        },
      }),
      invalidatesTags: ['SystemSettings'],
    }),

    // Get report generation history and status
    getReportHistory: builder.query({
      query: (params = {}) => ({
        url: 'reports/history',
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          type: params.type, // analytics, performance
          status: params.status, // pending, completed, failed
          ...params,
        },
      }),
      providesTags: ['SystemSettings'],
      keepUnusedDataFor: 300,
    }),

    // Reset System Settings - Restore defaults
    resetSystemSettings: builder.mutation({
      query: ({ category, confirm = false }) => ({
        url: '/system/settings/reset',
        method: 'POST',
        body: {
          category,
          confirm,
          resetTimestamp: new Date().toISOString()
        },
      }),
      invalidatesTags: ['SystemSettings', 'AdminDashboard'],
    }),
  }),
});

// Export hooks for all endpoints
export const {
  // Dashboard & Analytics  
  useGetAdminDashboardV2Query,
  useGetDashboardOverviewQuery,
  useGetAnalyticsOverviewQuery,
  useGetSalesAnalyticsQuery,
  useGetUserAnalyticsQuery,
  useGetProductAnalyticsV2Query,
  useClearAnalyticsCacheMutation,

  // User Management
  useGetAdminUsersV2Query,
  useGetAdminUserDetailsQuery,
  useUpdateAdminUserV2Mutation,
  useDeleteAdminUserV2Mutation,
  useCreateRestaurantOwnerV2Mutation,
  useCreateRestaurantManagerV2Mutation,

  // Vendor Management  
  useGetAdminVendorsV2Query,
  useGetVendorDetailsV2Query,
  useUpdateVendorV2Mutation,
  useUpdateVendorVerificationV2Mutation,
  useDeactivateVendorV2Mutation,
  useSafeDeleteVendorV2Mutation,

  // Restaurant Management
  useGetAdminRestaurantsV2Query,
  useGetRestaurantDetailsV2Query,
  useUpdateRestaurantV2Mutation,
  useUpdateRestaurantVerificationV2Mutation,
  useDeactivateRestaurantV2Mutation,
  useSafeDeleteRestaurantV2Mutation,

  // Product Management
  useGetAdminProductsV2Query,
  useGetAdminProductDetailsQuery,
  useCreateAdminProductV2Mutation,
  useUpdateAdminProductV2Mutation,
  useSafeDeleteProductV2Mutation,

  // Category Management
  useGetAdminCategoriesV2Query,
  useGetAdminCategoryDetailsQuery,
  useGetCategoryUsageStatsQuery,
  useCreateAdminCategoryV2Mutation,
  useUpdateAdminCategoryV2Mutation,
  useToggleCategoryAvailabilityV2Mutation,
  useSafeDeleteCategoryV2Mutation,

  // Advanced Features
  useBulkUpdateVerificationStatusMutation,
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useGetPerformanceMetricsQuery,

  // Enhanced Settings Management (Prompt 8)
  useGetCategorySettingsQuery,
  useGetSettingByKeyQuery,
  useGetSettingHistoryQuery,
  useBulkUpdateSettingsMutation,
  useResetSystemSettingMutation,
  useValidateSettingMutation,
  useGetSettingsSchemaQuery,
  useImportSettingsMutation,
  useExportSettingsQuery,
  useGetSettingsTemplatesQuery,
  useApplySettingsTemplateMutation,

  // Enhanced Analytics (Prompt 7)
  useGetProductAnalyticsQuery,
  
  // Performance Monitoring (Prompt 7)
  useGetPerformanceOverviewQuery,
  useGetAdminPerformanceQuery,
  useGetSLAMetricsQuery,
  useUpdateSLAViolationMutation,
  
  // Report Generation (Prompt 7)
  useGenerateAnalyticsReportMutation,
  useScheduleAnalyticsReportMutation,
  useGetReportHistoryQuery,

  // System Settings
  useResetSystemSettingsMutation,
} = adminApiV2Slice;

export default adminApiV2Slice;