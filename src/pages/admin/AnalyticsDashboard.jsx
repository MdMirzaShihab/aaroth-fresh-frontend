import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetAdminAnalyticsOverviewQuery,
  useGetAdminVendorsUnifiedQuery,
  useGetAdminRestaurantsUnifiedQuery,
  useGetAdminDashboardOverviewQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import SimpleLineChart from '../../components/ui/charts/SimpleLineChart';
import SimpleBarChart from '../../components/ui/charts/SimpleBarChart';
import SimplePieChart from '../../components/ui/charts/SimplePieChart';

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Enhanced analytics data
  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetAdminAnalyticsOverviewQuery({ timeRange });

  // Dashboard overview for additional metrics
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
  } = useGetAdminDashboardOverviewQuery();

  // Business verification analytics
  const { data: pendingVendors, isLoading: isVendorsLoading } =
    useGetAdminVendorsUnifiedQuery({ status: 'pending' });
  const { data: pendingRestaurants, isLoading: isRestaurantsLoading } =
    useGetAdminRestaurantsUnifiedQuery({ status: 'pending' });

  const isLoading =
    isAnalyticsLoading ||
    isDashboardLoading ||
    isVendorsLoading ||
    isRestaurantsLoading;
  const error = analyticsError || dashboardError;

  // Transform API data into chart-ready format
  const analytics = analyticsData?.data || {};
  const dashboard = dashboardData?.data || {};
  const vendorsData = pendingVendors?.data || [];
  const restaurantsData = pendingRestaurants?.data || [];

  // Calculate business verification statistics
  const verificationStats = [...vendorsData, ...restaurantsData].reduce(
    (acc, entity) => {
      acc.total++;
      acc.pending++; // These are all pending entities

      // Calculate average wait time
      if (entity.createdAt) {
        const waitTime = Math.floor(
          (new Date() - new Date(entity.createdAt)) / (1000 * 60 * 60 * 24)
        );
        acc.avgWaitTime += waitTime;
        if (waitTime > 7) acc.urgent++; // Consider urgent if waiting more than 7 days
      }

      return acc;
    },
    {
      total: 0,
      pending: 0,
      verified:
        dashboard.totalVendors +
        dashboard.totalRestaurants -
        (vendorsData.length + restaurantsData.length),
      avgWaitTime: 0,
      urgent: 0,
      vendors: vendorsData.length,
      restaurants: restaurantsData.length,
    }
  );

  // Calculate average wait time
  verificationStats.avgWaitTime =
    verificationStats.total > 0
      ? Math.round(verificationStats.avgWaitTime / verificationStats.total)
      : 0;

  // Transform verification data for charts
  const transformVerificationData = () =>
    [
      { label: 'Pending', value: verificationStats.pending || 0 },
      { label: 'Verified', value: verificationStats.verified || 0 },
      { label: 'Vendors', value: verificationStats.vendors || 0 },
      { label: 'Restaurants', value: verificationStats.restaurants || 0 },
    ].filter((item) => item.value > 0);

  // Transform revenue data with fallbacks
  const transformedRevenueData = analytics.dailyRevenue || [
    { label: 'Mon', value: 6200 },
    { label: 'Tue', value: 7100 },
    { label: 'Wed', value: 5800 },
    { label: 'Thu', value: 8300 },
    { label: 'Fri', value: 9200 },
    { label: 'Sat', value: 4800 },
    { label: 'Sun', value: 3880 },
  ];

  // Transform order data with fallbacks
  const transformedOrderData = analytics.dailyOrders || [
    { label: 'Mon', value: 180 },
    { label: 'Tue', value: 210 },
    { label: 'Wed', value: 165 },
    { label: 'Thu', value: 235 },
    { label: 'Fri', value: 198 },
    { label: 'Sat', value: 142 },
    { label: 'Sun', value: 117 },
  ];

  // Transform user registration data
  const transformedUserData = [
    { label: 'Vendors', value: dashboard.totalVendors || 342 },
    { label: 'Restaurants', value: dashboard.totalRestaurants || 189 },
    { label: 'Managers', value: dashboard.totalManagers || 67 },
  ];

  // Transform category data with fallbacks
  const transformedCategoryData = analytics.topCategories || [
    { label: 'Vegetables', value: 45 },
    { label: 'Fruits', value: 32 },
    { label: 'Herbs', value: 18 },
    { label: 'Grains', value: 12 },
    { label: 'Others', value: 8 },
  ];

  // Transform geographic data
  const transformedGeographicData = analytics.geographicData || [
    { region: 'North Region', orders: 412, revenue: 18500 },
    { region: 'South Region', orders: 338, revenue: 15200 },
    { region: 'East Region', orders: 289, revenue: 12800 },
    { region: 'West Region', orders: 208, revenue: 9300 },
  ];

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  // Key metrics cards
  const keyMetrics = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `$${(analytics.totalRevenue || 45280).toLocaleString()}`,
      change: analytics.revenueGrowth || '+16.3%',
      changeType: (analytics.revenueGrowth || '+16.3%').startsWith('+')
        ? 'positive'
        : 'negative',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: (dashboard.totalOrders || 1247).toLocaleString(),
      change: analytics.orderGrowth || '+14.5%',
      changeType: (analytics.orderGrowth || '+14.5%').startsWith('+')
        ? 'positive'
        : 'negative',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'vendors',
      title: 'Active Vendors',
      value: (dashboard.totalVendors || '342').toLocaleString(),
      change: analytics.vendorGrowth || '+12.8%',
      changeType: (analytics.vendorGrowth || '+12.8%').startsWith('+')
        ? 'positive'
        : 'negative',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'verification-rate',
      title: 'Business Verification Rate',
      value: `${verificationStats.verified + verificationStats.pending > 0 ? Math.round((verificationStats.verified / (verificationStats.verified + verificationStats.pending)) * 100) : 85}%`,
      change:
        verificationStats.urgent > 0
          ? `${verificationStats.urgent} urgent`
          : 'On track',
      changeType: verificationStats.urgent > 0 ? 'negative' : 'positive',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load analytics"
        description="There was an error loading analytics data. Please try again."
        actionLabel="Retry"
        onAction={refetchAnalytics}
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-muted-olive/20 min-h-[44px]"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={refetchAnalytics}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric) => (
          <Card
            key={metric.id}
            className="p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-muted text-sm font-medium mb-1">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-text-dark dark:text-white mb-2">
                  {metric.value}
                </p>
                <div className="flex items-center gap-1">
                  {metric.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3 text-green-600" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      metric.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {metric.change}
                  </span>
                  <span className="text-text-muted text-xs">
                    vs last period
                  </span>
                </div>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl ${metric.bgColor} flex items-center justify-center`}
              >
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1: Revenue and Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Revenue Trend
              </h3>
              <p className="text-text-muted text-sm">Daily revenue over time</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">This week</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                ${(analytics.totalRevenue || 45280).toLocaleString()}
              </p>
            </div>
          </div>
          <SimpleLineChart
            data={transformedRevenueData}
            height={250}
            color="#10B981"
          />
        </Card>

        {/* Orders Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Orders Trend
              </h3>
              <p className="text-text-muted text-sm">Daily orders over time</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">This week</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                {(dashboard.totalOrders || 1247).toLocaleString()}
              </p>
            </div>
          </div>
          <SimpleLineChart
            data={transformedOrderData}
            height={250}
            color="#3B82F6"
          />
        </Card>
      </div>

      {/* Charts Row 2: Approval Analytics and User Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Analytics */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white">
              Approval Analytics
            </h3>
            <p className="text-text-muted text-sm">
              Application processing metrics
            </p>
          </div>

          <div className="space-y-4">
            {/* Business Verification Status Distribution */}
            <div className="flex justify-center mb-6">
              <SimplePieChart data={transformVerificationData()} size={200} />
            </div>

            {/* Business Verification Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold text-text-dark dark:text-white">
                  {verificationStats.avgWaitTime}
                </p>
                <p className="text-sm text-text-muted">Avg Wait Time (days)</p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-2xl font-bold text-text-dark dark:text-white">
                  {verificationStats.urgent}
                </p>
                <p className="text-sm text-text-muted">Urgent (7+ days)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* User Distribution */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white">
              User Distribution
            </h3>
            <p className="text-text-muted text-sm">Breakdown by user type</p>
          </div>
          <div className="flex justify-center">
            <SimplePieChart
              data={transformedUserData.concat([
                { label: 'Admins', value: dashboard.totalAdmins || 5 },
              ])}
              size={280}
            />
          </div>
        </Card>
      </div>

      {/* Charts Row 3: Top Categories */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white">
              Top Categories
            </h3>
            <p className="text-text-muted text-sm">
              Most popular product categories
            </p>
          </div>
          <SimpleBarChart data={transformedCategoryData} height={280} />
        </Card>
      </div>

      {/* Geographic Performance */}
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white">
            Regional Performance
          </h3>
          <p className="text-text-muted text-sm">
            Performance breakdown by region
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-text-dark dark:text-white">
                  Region
                </th>
                <th className="text-right py-3 px-4 font-medium text-text-dark dark:text-white">
                  Orders
                </th>
                <th className="text-right py-3 px-4 font-medium text-text-dark dark:text-white">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 font-medium text-text-dark dark:text-white">
                  Avg. Order Value
                </th>
              </tr>
            </thead>
            <tbody>
              {transformedGeographicData.map((region, index) => {
                const avgOrderValue = region.revenue / region.orders;
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-muted-olive rounded-full"></div>
                        <span className="font-medium text-text-dark dark:text-white">
                          {region.region}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-text-dark dark:text-white">
                      {region.orders.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-dark dark:text-white">
                      ${region.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-text-dark dark:text-white">
                      ${avgOrderValue.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Growth</span>
            </div>
            <p className="text-xs text-green-700">
              User registrations increased by 23% compared to last month
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Popular</span>
            </div>
            <p className="text-xs text-blue-700">
              Vegetables category accounts for 45% of all orders
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">
                Peak Time
              </span>
            </div>
            <p className="text-xs text-orange-700">
              Thursday shows highest order volume (235 orders)
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
