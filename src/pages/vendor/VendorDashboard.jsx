import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetVendorDashboardQuery,
  useGetVendorOrdersQuery,
  useGetVendorAnalyticsQuery
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
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  Star,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d');
  const { user } = useSelector((state) => state.auth);

  // Query for dashboard data with auto-refresh
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard
  } = useGetVendorDashboardQuery(undefined, {
    // Refetch every 30 seconds for real-time updates
    pollingInterval: 30000,
  });

  // Query for recent orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
  } = useGetVendorOrdersQuery({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Query for analytics with time range
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
  } = useGetVendorAnalyticsQuery({ timeRange });

  const dashboard = dashboardData?.data || {};
  const recentOrders = ordersData?.data?.orders || [];
  const analytics = analyticsData?.data || {};

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
  ];

  // Key metrics configuration
  const keyMetrics = [
    {
      id: 'total-listings',
      title: 'Total Listings',
      value: dashboard.totalListings?.toLocaleString() || '0',
      change: dashboard.listingsChange || '+0',
      changeType: dashboard.listingsChange?.startsWith('+') ? 'positive' : 'negative',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'active-listings',
      title: 'Active Listings',
      value: dashboard.activeListings?.toLocaleString() || '0',
      change: dashboard.activeListingsChange || '+0',
      changeType: dashboard.activeListingsChange?.startsWith('+') ? 'positive' : 'negative',
      icon: CheckCircle,
      color: 'text-bottle-green',
      bgColor: 'bg-mint-fresh/20',
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: dashboard.totalOrders?.toLocaleString() || '0',
      change: dashboard.ordersChange || '+0',
      changeType: dashboard.ordersChange?.startsWith('+') ? 'positive' : 'negative',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'revenue',
      title: 'Total Revenue',
      value: dashboard.totalRevenue ? `৳${dashboard.totalRevenue.toLocaleString()}` : '৳0',
      change: dashboard.revenueChange || '+0%',
      changeType: dashboard.revenueChange?.startsWith('+') ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'text-bottle-green',
      bgColor: 'bg-mint-fresh/20',
    },
    {
      id: 'avg-rating',
      title: 'Average Rating',
      value: dashboard.averageRating?.toFixed(1) || '0.0',
      change: dashboard.ratingChange || '+0',
      changeType: dashboard.ratingChange?.startsWith('+') ? 'positive' : 'negative',
      icon: Star,
      color: 'text-earthy-yellow',
      bgColor: 'bg-earthy-yellow/20',
    },
    {
      id: 'pending-orders',
      title: 'Pending Orders',
      value: dashboard.pendingOrders?.toLocaleString() || '0',
      change: dashboard.pendingOrdersChange || '+0',
      changeType: 'neutral',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  // Get status color for orders
  const getOrderStatusColor = (status) => {
    const colors = {
      pending: 'text-orange-600 bg-orange-50',
      confirmed: 'text-blue-600 bg-blue-50',
      prepared: 'text-purple-600 bg-purple-50',
      delivered: 'text-bottle-green bg-mint-fresh/20',
      cancelled: 'text-tomato-red bg-tomato-red/20',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (dashboardError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard"
        description="There was an error loading your dashboard data. Please try again."
        action={{
          label: "Retry",
          onClick: refetchDashboard
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
            Welcome back, {user?.name}!
          </h1>
          <p className="text-text-muted mt-1">
            Here's what's happening with your business today
          </p>
          <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <Button
            variant="outline"
            onClick={refetchDashboard}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>

          <Button 
            onClick={() => navigate('/vendor/listings/create')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.id} className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${metric.bgColor} flex items-center justify-center`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
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
              <p className="text-2xl font-bold text-text-dark dark:text-white mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-text-muted">
                {metric.title}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
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
              <p className="text-sm text-text-muted">This period</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                ৳{dashboard.periodRevenue?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <SimpleLineChart 
              data={analytics.revenueChart || []} 
              height={250}
              color="#10B981"
            />
          )}
        </Card>

        {/* Orders Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Orders Trend
              </h3>
              <p className="text-text-muted text-sm">Daily orders received</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-text-muted">This period</p>
              <p className="text-lg font-semibold text-text-dark dark:text-white">
                {dashboard.periodOrders?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
          {analyticsLoading ? (
            <div className="flex items-center justify-center h-[250px]">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <SimpleBarChart 
              data={analytics.ordersChart || []} 
              height={250}
              color="#3B82F6"
            />
          )}
        </Card>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Recent Orders
              </h3>
              <p className="text-text-muted text-sm">Latest orders from customers</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/vendor/orders')}
            >
              View All
            </Button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-4 bg-gray-100 rounded-2xl">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-32"></div>
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingCart}
              title="No orders yet"
              description="Your recent orders will appear here"
              size="sm"
            />
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => navigate(`/vendor/orders/${order.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center text-white text-sm font-bold">
                      {order.id.slice(-2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-text-dark dark:text-white text-sm">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-xs text-text-muted">
                        {order.restaurant?.name} • {order.items?.length} items
                      </p>
                      <p className="text-xs text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-text-dark dark:text-white text-sm">
                      ৳{order.totalAmount?.toLocaleString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions & Insights */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
              Quick Actions
            </h3>
          </div>

          <div className="space-y-4 mb-8">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/vendor/listings')}
            >
              <Package className="w-5 h-5 mr-3" />
              Manage Listings
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/vendor/orders')}
            >
              <ShoppingCart className="w-5 h-5 mr-3" />
              View Orders
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/vendor/analytics')}
            >
              <TrendingUp className="w-5 h-5 mr-3" />
              View Analytics
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/vendor/profile')}
            >
              <Users className="w-5 h-5 mr-3" />
              Edit Profile
            </Button>
          </div>

          {/* Business Insights */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="font-medium text-text-dark dark:text-white mb-4">
              Business Insights
            </h4>
            
            <div className="space-y-3">
              {dashboard.insights?.map((insight, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{insight}</p>
                  </div>
                </div>
              )) || (
                <div className="p-3 bg-mint-fresh/20 rounded-2xl">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-bottle-green mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-bottle-green">
                      Great job! Your listings are performing well.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;