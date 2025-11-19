/**
 * Analytics Service - Admin V2
 * Business logic for analytics data processing and visualization
 */

import { format, subDays, startOfDay } from 'date-fns';

/**
 * Transform sales analytics data for charts
 */
export const transformSalesAnalytics = (rawData) => {
  if (!rawData?.data) return null;

  return {
    revenue: {
      total: rawData.data.totalRevenue || 0,
      growth: rawData.data.revenueGrowth || 0,
      trend: rawData.data.revenueTrend || [],
      chartData: transformTimeSeriesData(rawData.data.revenueChart),
    },
    orders: {
      total: rawData.data.totalOrders || 0,
      growth: rawData.data.orderGrowth || 0,
      averageValue: rawData.data.averageOrderValue || 0,
      chartData: transformTimeSeriesData(rawData.data.ordersChart),
    },
    topCategories:
      rawData.data.topCategories?.map((cat) => ({
        name: cat.name,
        revenue: cat.revenue,
        orders: cat.orders,
        percentage: cat.percentage,
      })) || [],
    topVendors:
      rawData.data.topVendors?.map((vendor) => ({
        name: vendor.businessName,
        revenue: vendor.revenue,
        orders: vendor.orders,
        percentage: vendor.percentage,
      })) || [],
  };
};

/**
 * Transform user analytics data
 */
export const transformUserAnalytics = (rawData) => {
  if (!rawData?.data) return null;

  return {
    totalUsers: rawData.data.totalUsers || 0,
    newUsers: rawData.data.newUsers || 0,
    activeUsers: rawData.data.activeUsers || 0,
    userGrowth: rawData.data.userGrowthRate || 0,
    registrationTrend: transformTimeSeriesData(rawData.data.registrationChart),
    roleDistribution: [
      {
        role: 'Vendors',
        count: rawData.data.vendorCount || 0,
        color: '#10B981',
      },
      {
        role: 'Buyers',
        count: rawData.data.buyerCount || 0,
        color: '#3B82F6',
      },
      {
        role: 'Managers',
        count: rawData.data.managerCount || 0,
        color: '#F59E0B',
      },
    ],
    verificationStatus: [
      {
        status: 'Approved',
        count: rawData.data.approvedCount || 0,
        color: '#10B981',
      },
      {
        status: 'Pending',
        count: rawData.data.pendingCount || 0,
        color: '#F59E0B',
      },
      {
        status: 'Rejected',
        count: rawData.data.rejectedCount || 0,
        color: '#EF4444',
      },
    ],
  };
};

/**
 * Transform time series data for charts
 */
const transformTimeSeriesData = (data) => {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    date: format(new Date(item.date), 'MMM dd'),
    value: item.value || 0,
    label: item.label || item.date,
  }));
};

/**
 * Generate analytics filters
 */
export const getAnalyticsFilters = () => {
  return {
    period: [
      { value: '7d', label: 'Last 7 Days' },
      { value: '30d', label: 'Last 30 Days' },
      { value: '90d', label: 'Last 90 Days' },
      { value: '1y', label: 'Last Year' },
      { value: 'custom', label: 'Custom Range' },
    ],
    groupBy: [
      { value: 'day', label: 'Daily' },
      { value: 'week', label: 'Weekly' },
      { value: 'month', label: 'Monthly' },
    ],
    metrics: [
      { value: 'revenue', label: 'Revenue' },
      { value: 'orders', label: 'Orders' },
      { value: 'users', label: 'Users' },
      { value: 'conversion', label: 'Conversion Rate' },
    ],
  };
};

/**
 * Calculate key performance indicators
 */
export const calculateKPIs = (analyticsData) => {
  return {
    conversionRate:
      analyticsData.totalOrders > 0 && analyticsData.totalListingViews > 0
        ? (
            (analyticsData.totalOrders / analyticsData.totalListingViews) *
            100
          ).toFixed(2)
        : 0,
    averageOrderValue:
      analyticsData.totalOrders > 0
        ? (analyticsData.totalRevenue / analyticsData.totalOrders).toFixed(2)
        : 0,
    customerRetentionRate:
      analyticsData.returningCustomers && analyticsData.totalCustomers
        ? (
            (analyticsData.returningCustomers / analyticsData.totalCustomers) *
            100
          ).toFixed(2)
        : 0,
    vendorUtilizationRate:
      analyticsData.activeVendors && analyticsData.totalVendors
        ? (
            (analyticsData.activeVendors / analyticsData.totalVendors) *
            100
          ).toFixed(2)
        : 0,
  };
};

const analyticsService = {
  transformSalesAnalytics,
  transformUserAnalytics,
  getAnalyticsFilters,
  calculateKPIs,
};

export default analyticsService;
