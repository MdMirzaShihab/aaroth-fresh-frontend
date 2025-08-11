import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetVendorAnalyticsQuery,
  useGetListingPerformanceQuery,
  useGetVendorOrdersQuery,
  useGetVendorDashboardQuery
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import SimpleLineChart from '../../components/ui/charts/SimpleLineChart';
import SimpleBarChart from '../../components/ui/charts/SimpleBarChart';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Eye,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes
  const { user } = useSelector((state) => state.auth);

  // Auto-refresh analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useGetVendorAnalyticsQuery(
    { timeRange },
    {
      pollingInterval: refreshInterval,
      refetchOnFocus: true,
      refetchOnReconnect: true
    }
  );

  // Get listing performance data
  const {
    data: performanceData,
    isLoading: performanceLoading,
    refetch: refetchPerformance
  } = useGetListingPerformanceQuery(
    { timeRange },
    {
      pollingInterval: refreshInterval * 2, // Less frequent refresh
      refetchOnFocus: true
    }
  );

  // Get dashboard data for comparison
  const {
    data: dashboardData
  } = useGetVendorDashboardQuery();

  const analytics = analyticsData?.data || {};
  const performance = performanceData?.data || {};
  const dashboard = dashboardData?.data || {};

  // Time range options with descriptions
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days', description: 'Weekly trends' },
    { value: '30d', label: 'Last 30 Days', description: 'Monthly overview' },
    { value: '90d', label: 'Last 3 Months', description: 'Quarterly analysis' },
    { value: '180d', label: 'Last 6 Months', description: 'Bi-annual trends' },
    { value: '365d', label: 'Last Year', description: 'Annual performance' }
  ];

  // Metric options for detailed view
  const metricOptions = [
    { value: 'revenue', label: 'Revenue', icon: DollarSign, color: '#10B981' },
    { value: 'orders', label: 'Orders', icon: ShoppingCart, color: '#3B82F6' },
    { value: 'views', label: 'Product Views', icon: Eye, color: '#8B5CF6' },
    { value: 'conversions', label: 'Conversions', icon: TrendingUp, color: '#F59E0B' }
  ];

  // Refresh interval options
  const refreshOptions = [
    { value: 60000, label: '1 minute' },
    { value: 300000, label: '5 minutes' },
    { value: 600000, label: '10 minutes' },
    { value: 0, label: 'Manual only' }
  ];

  // Calculate performance metrics
  const performanceMetrics = {
    totalRevenue: analytics.totalRevenue || 0,
    totalOrders: analytics.totalOrders || 0,
    averageOrderValue: analytics.averageOrderValue || 0,
    conversionRate: analytics.conversionRate || 0,
    topPerformingProduct: performance.topProduct?.name || 'N/A',
    totalViews: analytics.totalViews || 0,
    revenueGrowth: analytics.revenueGrowth || 0,
    orderGrowth: analytics.orderGrowth || 0
  };

  // Format change percentage
  const formatChange = (change) => {
    if (!change && change !== 0) return '+0%';
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  // Get trend color
  const getTrendColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Manual refresh all data
  const handleRefreshAll = () => {
    refetchAnalytics();
    refetchPerformance();
  };

  // Key metrics cards configuration
  const keyMetrics = [
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: `৳${performanceMetrics.totalRevenue.toLocaleString()}`,
      change: formatChange(performanceMetrics.revenueGrowth),
      changeType: performanceMetrics.revenueGrowth >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: `Revenue for ${timeRangeOptions.find(t => t.value === timeRange)?.label.toLowerCase()}`
    },
    {
      id: 'orders',
      title: 'Total Orders',
      value: performanceMetrics.totalOrders.toLocaleString(),
      change: formatChange(performanceMetrics.orderGrowth),
      changeType: performanceMetrics.orderGrowth >= 0 ? 'positive' : 'negative',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Orders received and processed'
    },
    {
      id: 'aov',
      title: 'Average Order Value',
      value: `৳${performanceMetrics.averageOrderValue.toLocaleString()}`,
      change: formatChange(analytics.aovGrowth || 0),
      changeType: (analytics.aovGrowth || 0) >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Average value per order'
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: `${performanceMetrics.conversionRate.toFixed(1)}%`,
      change: formatChange(analytics.conversionGrowth || 0),
      changeType: (analytics.conversionGrowth || 0) >= 0 ? 'positive' : 'negative',
      icon: Star,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Views that resulted in orders'
    },
    {
      id: 'views',
      title: 'Product Views',
      value: performanceMetrics.totalViews.toLocaleString(),
      change: formatChange(analytics.viewsGrowth || 0),
      changeType: (analytics.viewsGrowth || 0) >= 0 ? 'positive' : 'negative',
      icon: Eye,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Total listing views'
    },
    {
      id: 'performance',
      title: 'Top Product',
      value: performanceMetrics.topPerformingProduct,
      change: `${performance.topProduct?.orders || 0} orders`,
      changeType: 'neutral',
      icon: Package,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Best performing product'
    }
  ];

  if (analyticsLoading && !analytics.totalRevenue) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (analyticsError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load analytics"
        description="There was an error loading your analytics data. Please try again."
        action={{
          label: "Retry",
          onClick: refetchAnalytics
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Vendor Analytics
          </h1>
          <p className="text-text-muted mt-1">
            Detailed insights into your business performance and trends
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
            <Activity className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
            {refreshInterval > 0 && (
              <>
                <span className="mx-2">•</span>
                <span>Auto-refresh: {refreshOptions.find(r => r.value === refreshInterval)?.label}</span>
              </>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
          >
            {timeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Refresh Interval */}
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
          >
            {refreshOptions.map(option => (
              <option key={option.value} value={option.value}>
                Auto-refresh: {option.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={handleRefreshAll}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {keyMetrics.map((metric) => {
          const IconComponent = metric.icon;
          return (
            <Card key={metric.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${metric.bgColor} flex items-center justify-center`}>
                  <IconComponent className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  metric.changeType === 'positive' 
                    ? 'text-green-600' 
                    : metric.changeType === 'negative' 
                    ? 'text-red-600' 
                    : 'text-gray-600'
                }`}>
                  {metric.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : metric.changeType === 'negative' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : null}
                  {metric.change}
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-bold text-text-dark dark:text-white mb-1 truncate" title={metric.value}>
                  {metric.value}
                </p>
                <p className="text-sm font-medium text-text-dark mb-1">
                  {metric.title}
                </p>
                <p className="text-xs text-text-muted">
                  {metric.description}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Revenue Trend
              </h3>
              <p className="text-text-muted text-sm">Daily revenue performance</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">Period Total</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                ৳{performanceMetrics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <SimpleLineChart 
              data={analytics.revenueChart || []} 
              height={300}
              color="#10B981"
            />
          )}
        </Card>

        {/* Orders Trend Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Orders Trend
              </h3>
              <p className="text-text-muted text-sm">Daily orders received</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">Total Orders</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                {performanceMetrics.totalOrders.toLocaleString()}
              </p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <SimpleBarChart 
              data={analytics.ordersChart || []} 
              height={300}
              color="#3B82F6"
            />
          )}
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Products
          </h3>
          {performanceLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : performance.topProducts?.length > 0 ? (
            <div className="space-y-4">
              {performance.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-text-dark dark:text-white text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-text-muted">
                        ৳{product.revenue?.toLocaleString()} revenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-dark dark:text-white text-sm">
                      {product.orders} orders
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No data yet"
              description="Product performance data will appear here once you have sales"
              size="sm"
            />
          )}
        </Card>

        {/* Order Status Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Order Status
          </h3>
          {analyticsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-gray-300 rounded w-20"></div>
                    <div className="h-4 bg-gray-300 rounded w-12"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full" style={{width: `${Math.random() * 100}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : analytics.orderStatus ? (
            <div className="space-y-4">
              {Object.entries(analytics.orderStatus).map(([status, count]) => {
                const percentage = ((count / performanceMetrics.totalOrders) * 100) || 0;
                const statusConfig = {
                  pending: { color: 'bg-orange-500', icon: Clock },
                  confirmed: { color: 'bg-blue-500', icon: CheckCircle },
                  delivered: { color: 'bg-green-500', icon: CheckCircle },
                  cancelled: { color: 'bg-red-500', icon: AlertTriangle }
                };
                const config = statusConfig[status] || { color: 'bg-gray-500', icon: Activity };
                const IconComponent = config.icon;
                
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-text-muted" />
                        <span className="text-sm font-medium text-text-dark capitalize">{status}</span>
                      </div>
                      <span className="text-sm font-medium text-text-dark">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${config.color}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-text-muted mt-1">
                      {percentage.toFixed(1)}% of total orders
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No orders yet"
              description="Order status breakdown will appear here"
              size="sm"
            />
          )}
        </Card>

        {/* Growth Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Summary
          </h3>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">Revenue Growth</p>
                  <p className="text-xs text-green-600 mt-1">
                    vs. previous {timeRange === '7d' ? 'week' : timeRange === '30d' ? 'month' : 'period'}
                  </p>
                </div>
                <div className={`text-lg font-bold ${getTrendColor(performanceMetrics.revenueGrowth)}`}>
                  {formatChange(performanceMetrics.revenueGrowth)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Order Growth</p>
                  <p className="text-xs text-blue-600 mt-1">
                    New orders received
                  </p>
                </div>
                <div className={`text-lg font-bold ${getTrendColor(performanceMetrics.orderGrowth)}`}>
                  {formatChange(performanceMetrics.orderGrowth)}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-800">Conversion Rate</p>
                  <p className="text-xs text-purple-600 mt-1">
                    Views to orders ratio
                  </p>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {performanceMetrics.conversionRate.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">Avg Order Value</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Revenue per order
                  </p>
                </div>
                <div className="text-lg font-bold text-orange-600">
                  ৳{performanceMetrics.averageOrderValue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Business Insights */}
      {analytics.insights && analytics.insights.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Business Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analytics.insights.map((insight, index) => (
              <div key={index} className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Activity className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 leading-relaxed">{insight}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default VendorAnalytics;