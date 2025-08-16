import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  TrendingUp,
  TrendingDown,
  Package,
  DollarSign,
  Clock,
  Users,
  CalendarDays,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Target,
  Star,
  Truck,
  AlertTriangle,
} from 'lucide-react';
import { useGetVendorOrderAnalyticsQuery } from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const OrderAnalytics = ({ timeRange = '30d', onTimeRangeChange }) => {
  const dispatch = useDispatch();
  const [chartType, setChartType] = useState('revenue'); // 'revenue', 'orders', 'customers'

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
    refetch,
  } = useGetVendorOrderAnalyticsQuery(
    { timeRange },
    {
      pollingInterval: 300000, // Refresh every 5 minutes
      refetchOnMountOrArgChange: true,
    }
  );

  const analytics = analyticsData?.data || {};

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
  ];

  // Calculate trends and insights
  const insights = useMemo(() => {
    if (!analytics.trends) return [];

    const insights = [];

    // Revenue insights
    if (analytics.revenueChange > 0) {
      insights.push({
        type: 'positive',
        icon: TrendingUp,
        title: 'Revenue Growing',
        description: `Revenue increased by ${analytics.revenueChange}% compared to previous period`,
        value: analytics.revenueChange,
      });
    } else if (analytics.revenueChange < -10) {
      insights.push({
        type: 'negative',
        icon: TrendingDown,
        title: 'Revenue Declining',
        description: `Revenue decreased by ${Math.abs(analytics.revenueChange)}% - consider promotions`,
        value: analytics.revenueChange,
      });
    }

    // Order volume insights
    if (analytics.orderVolumeChange > 15) {
      insights.push({
        type: 'positive',
        icon: Package,
        title: 'High Order Volume',
        description: `Orders increased by ${analytics.orderVolumeChange}% - great momentum!`,
        value: analytics.orderVolumeChange,
      });
    }

    // Customer satisfaction
    if (analytics.averageRating > 4.5) {
      insights.push({
        type: 'positive',
        icon: Star,
        title: 'Excellent Ratings',
        description: `Maintaining ${analytics.averageRating}/5.0 average rating`,
        value: analytics.averageRating,
      });
    } else if (analytics.averageRating < 4.0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Rating Needs Attention',
        description: `Average rating is ${analytics.averageRating}/5.0 - focus on service quality`,
        value: analytics.averageRating,
      });
    }

    // Delivery performance
    if (analytics.averageDeliveryTime < 60) {
      insights.push({
        type: 'positive',
        icon: Truck,
        title: 'Fast Delivery',
        description: `Average delivery time: ${analytics.averageDeliveryTime} minutes`,
        value: analytics.averageDeliveryTime,
      });
    }

    return insights;
  }, [analytics]);

  // Export analytics data
  const handleExport = () => {
    const exportData = {
      timeRange,
      generatedAt: new Date().toISOString(),
      summary: {
        totalOrders: analytics.totalOrders || 0,
        totalRevenue: analytics.totalRevenue || 0,
        averageOrderValue: analytics.averageOrderValue || 0,
        customerSatisfaction: analytics.averageRating || 0,
      },
      trends: analytics.trends || [],
      topProducts: analytics.topProducts || [],
      customerInsights: analytics.customerInsights || {},
    };

    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    dispatch(
      addNotification({
        type: 'success',
        title: 'Export Complete',
        message: 'Analytics data exported successfully',
      })
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-bottle-green" />
          <span className="text-lg font-medium text-text-dark">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-soft p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-tomato-red/60 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-text-dark/80 mb-2">
          Failed to load analytics
        </h3>
        <p className="text-text-muted mb-6">
          There was an error loading your analytics data.
        </p>
        <button
          onClick={() => refetch()}
          className="bg-bottle-green text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-text-dark mb-2">
            Order Analytics
          </h2>
          <p className="text-text-muted">
            Track your order performance and trends
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Last {option.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Orders */}
        <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-xl ${
                (analytics.orderVolumeChange || 0) >= 0
                  ? 'text-bottle-green bg-mint-fresh/20'
                  : 'text-tomato-red bg-tomato-red/20'
              }`}
            >
              {(analytics.orderVolumeChange || 0) >= 0 ? '+' : ''}
              {analytics.orderVolumeChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-1">
            {analytics.totalOrders?.toLocaleString() || 0}
          </h3>
          <p className="text-text-muted text-sm">Total Orders</p>
        </div>

        {/* Revenue */}
        <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-bottle-green/20 rounded-2xl">
              <DollarSign className="w-6 h-6 text-bottle-green" />
            </div>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-xl ${
                (analytics.revenueChange || 0) >= 0
                  ? 'text-bottle-green bg-mint-fresh/20'
                  : 'text-tomato-red bg-tomato-red/20'
              }`}
            >
              {(analytics.revenueChange || 0) >= 0 ? '+' : ''}
              {analytics.revenueChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-1">
            ৳{analytics.totalRevenue?.toLocaleString() || 0}
          </h3>
          <p className="text-text-muted text-sm">Total Revenue</p>
        </div>

        {/* Average Order Value */}
        <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-50 rounded-2xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-xl ${
                (analytics.aovChange || 0) >= 0
                  ? 'text-bottle-green bg-mint-fresh/20'
                  : 'text-tomato-red bg-tomato-red/20'
              }`}
            >
              {(analytics.aovChange || 0) >= 0 ? '+' : ''}
              {analytics.aovChange || 0}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-1">
            ৳{analytics.averageOrderValue?.toFixed(0) || 0}
          </h3>
          <p className="text-text-muted text-sm">Avg Order Value</p>
        </div>

        {/* Customer Satisfaction */}
        <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-2xl">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <span
              className={`text-sm font-medium px-2 py-1 rounded-xl ${
                (analytics.ratingChange || 0) >= 0
                  ? 'text-bottle-green bg-mint-fresh/20'
                  : 'text-tomato-red bg-tomato-red/20'
              }`}
            >
              {(analytics.ratingChange || 0) >= 0 ? '+' : ''}
              {analytics.ratingChange || 0}
            </span>
          </div>
          <h3 className="text-2xl font-bold text-text-dark mb-1">
            {analytics.averageRating?.toFixed(1) || '0.0'}/5.0
          </h3>
          <p className="text-text-muted text-sm">Customer Rating</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trends Chart */}
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-text-dark">
              Performance Trends
            </h3>
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setChartType('revenue')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'revenue'
                    ? 'bg-white text-text-dark shadow-sm'
                    : 'text-text-muted hover:text-text-dark'
                }`}
              >
                Revenue
              </button>
              <button
                onClick={() => setChartType('orders')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  chartType === 'orders'
                    ? 'bg-white text-text-dark shadow-sm'
                    : 'text-text-muted hover:text-text-dark'
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Simple chart placeholder - would integrate with actual charting library */}
          <div className="h-64 bg-gray-50/80 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-text-muted/40 mx-auto mb-2" />
              <p className="text-text-muted text-sm">
                {chartType === 'revenue' ? 'Revenue' : 'Order'} trend chart
                would be displayed here
              </p>
              <p className="text-text-muted text-xs mt-1">
                Showing {timeRange} data with {analytics.totalDataPoints || 0}{' '}
                points
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <h3 className="text-xl font-bold text-text-dark mb-6">
            Order Status Distribution
          </h3>

          <div className="space-y-4">
            {analytics.statusDistribution &&
              Object.entries(analytics.statusDistribution).map(
                ([status, count]) => {
                  const percentage =
                    analytics.totalOrders > 0
                      ? ((count / analytics.totalOrders) * 100).toFixed(1)
                      : 0;
                  const colors = {
                    pending: 'bg-orange-500',
                    confirmed: 'bg-blue-500',
                    prepared: 'bg-purple-500',
                    shipped: 'bg-indigo-500',
                    delivered: 'bg-bottle-green',
                    cancelled: 'bg-tomato-red',
                  };

                  return (
                    <div key={status} className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-4 h-4 rounded-full ${colors[status] || 'bg-gray-400'}`}
                        ></div>
                        <span className="text-text-dark font-medium capitalize">
                          {status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[status] || 'bg-gray-400'}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-text-dark font-medium w-12 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}
          </div>
        </div>
      </div>

      {/* Insights and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Business Insights */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-soft p-6">
          <h3 className="text-xl font-bold text-text-dark mb-6">
            Business Insights
          </h3>

          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                const colors = {
                  positive: 'text-bottle-green bg-mint-fresh/20',
                  negative: 'text-tomato-red bg-tomato-red/20',
                  warning: 'text-orange-600 bg-orange-50',
                };

                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 bg-gray-50/80 rounded-2xl"
                  >
                    <div className={`p-2 rounded-xl ${colors[insight.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-text-dark mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-text-muted text-sm">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-text-muted/40 mx-auto mb-2" />
              <p className="text-text-muted">
                No insights available yet. More data needed for analysis.
              </p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-3xl shadow-soft p-6">
          <h3 className="text-xl font-bold text-text-dark mb-6">
            Top Products
          </h3>

          {analytics.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-bottle-green text-white rounded-xl flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-text-dark truncate">
                      {product.name}
                    </div>
                    <div className="text-sm text-text-muted">
                      {product.orderCount} orders
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-text-dark">
                      ৳{product.revenue?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-text-muted/40 mx-auto mb-2" />
              <p className="text-text-muted text-sm">
                No product data available yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <h3 className="text-xl font-bold text-text-dark mb-6">
          Performance Metrics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-text-dark mb-1">
              {analytics.averageDeliveryTime || 'N/A'}
            </div>
            <div className="text-sm text-text-muted">
              Avg Delivery Time (min)
            </div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-text-dark mb-1">
              {analytics.repeatCustomers || 0}
            </div>
            <div className="text-sm text-text-muted">Repeat Customers</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-text-dark mb-1">
              {analytics.growthRate || 0}%
            </div>
            <div className="text-sm text-text-muted">Growth Rate</div>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-mint-fresh/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="w-8 h-8 text-bottle-green" />
            </div>
            <div className="text-2xl font-bold text-text-dark mb-1">
              {analytics.ordersPerDay || 0}
            </div>
            <div className="text-sm text-text-muted">Orders per Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalytics;
