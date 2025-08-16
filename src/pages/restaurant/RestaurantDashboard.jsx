import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Plus,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Target,
  Bell,
  Download,
} from 'lucide-react';
import {
  useGetRestaurantDashboardOverviewQuery,
  useGetRestaurantSpendingQuery,
  useGetRestaurantBudgetQuery,
  useGetRestaurantVendorInsightsQuery,
  useGetRestaurantOrderHistoryQuery,
  useGetRestaurantNotificationsQuery,
} from '../../store/slices/apiSlice';
import { selectAuth } from '../../store/slices/authSlice';
import { formatCurrency, formatDate, timeAgo } from '../../utils';

// Dashboard Components
import {
  KPICard,
  ChartContainer,
  FilterPanel,
} from '../../components/dashboard';
import { LineChart, BarChart, DoughnutChart } from '../../components/charts';

const RestaurantDashboard = () => {
  const { user } = useSelector(selectAuth);
  const [filters, setFilters] = useState({
    dateRange: { type: 'month' },
  });

  // Fetch comprehensive dashboard data with new APIs
  const { data: overview = {}, isLoading: overviewLoading } =
    useGetRestaurantDashboardOverviewQuery({
      ...filters,
    });

  const { data: spendingData = {}, isLoading: spendingLoading } =
    useGetRestaurantSpendingQuery({
      ...filters,
    });

  const { data: budgetData = {}, isLoading: budgetLoading } =
    useGetRestaurantBudgetQuery();

  const { data: vendorInsights = {}, isLoading: vendorLoading } =
    useGetRestaurantVendorInsightsQuery({
      ...filters,
    });

  const { data: recentOrders = [], isLoading: ordersLoading } =
    useGetRestaurantOrderHistoryQuery({
      limit: 5,
      sort: 'createdAt',
      order: 'desc',
    });

  const { data: notifications = [], isLoading: notificationsLoading } =
    useGetRestaurantNotificationsQuery({
      limit: 5,
      unreadOnly: true,
    });

  // Enhanced KPI data from new dashboard APIs
  const kpiData = [
    {
      title: 'Total Spending',
      value: overview.totalSpending || 0,
      format: 'currency',
      icon: DollarSign,
      color: 'bg-gradient-primary',
      textColor: 'text-white',
      change: overview.spendingChange || 0,
      trend: overview.spendingChange >= 0 ? 'up' : 'down',
      subtitle: 'This month',
    },
    {
      title: 'Active Orders',
      value: overview.activeOrders || 0,
      format: 'number',
      icon: ShoppingCart,
      color: 'bg-gradient-secondary',
      textColor: 'text-white',
      change: overview.ordersChange || 0,
      trend: 'up',
      subtitle: 'In progress',
    },
    {
      title: 'Budget Used',
      value: budgetData.usedPercentage || 0,
      format: 'percentage',
      icon: Target,
      color: 'bg-mint-fresh/10',
      textColor: 'text-bottle-green',
      change: budgetData.budgetChange || 0,
      trend: budgetData.budgetChange <= 0 ? 'up' : 'down',
      subtitle: `${formatCurrency(budgetData.remaining || 0)} remaining`,
    },
    {
      title: 'Vendor Partners',
      value: vendorInsights.activeVendors || 0,
      format: 'number',
      icon: Users,
      color: 'bg-earthy-yellow/10',
      textColor: 'text-earthy-brown',
      change: vendorInsights.vendorChange || 0,
      trend: 'up',
      subtitle: 'Active this month',
    },
  ];

  // Prepare chart data
  const spendingTrendData = spendingData.trends || [];
  const categorySpendingData = spendingData.byCategory || [];
  const orderStatusData = overview.ordersByStatus || [];

  // Export handlers
  const handleExportSpending = async (format) => {
    // Implementation for exporting spending data
    console.log('Exporting spending data as:', format);
  };

  const handleRefreshData = async () => {
    // Implementation for refreshing dashboard data
    console.log('Refreshing dashboard data');
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Welcome back, {user?.restaurantId?.name || user?.name}
          </h1>
          <p className="text-text-muted mt-2">
            Track your spending, manage orders, and optimize your procurement
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-bottle-green/30 transition-all duration-200">
              <Bell className="w-5 h-5 text-text-muted" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-tomato-red text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Action */}
          <Link
            to="/restaurant/browse"
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200 touch-target"
          >
            <Plus className="w-5 h-5" />
            Browse Products
          </Link>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        showSearch={false}
        showPriceRange={false}
        showStatus={false}
        showCategory={false}
        showVendor={false}
        className="lg:col-span-full"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard
            key={index}
            {...kpi}
            loading={overviewLoading || budgetLoading || vendorLoading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Spending Trends */}
        <ChartContainer
          title="Spending Trends"
          subtitle="Monthly spending patterns and forecasts"
          onExport={handleExportSpending}
          onRefresh={handleRefreshData}
          loading={spendingLoading}
          className="lg:col-span-1"
        >
          <LineChart
            data={spendingTrendData}
            title="Spending"
            xAxisKey="month"
            yAxisKey="amount"
            formatTooltip={formatCurrency}
            formatYAxis={formatCurrency}
            curved={true}
            filled={true}
          />
        </ChartContainer>

        {/* Category Spending */}
        <ChartContainer
          title="Spending by Category"
          subtitle="Breakdown of expenses by product category"
          loading={spendingLoading}
          className="lg:col-span-1"
        >
          <BarChart
            data={categorySpendingData}
            title="Category Spending"
            xAxisKey="category"
            yAxisKey="amount"
            formatTooltip={formatCurrency}
            formatYAxis={formatCurrency}
          />
        </ChartContainer>
      </div>

      {/* Order Status and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Order Status Distribution */}
        <div className="lg:col-span-1">
          <ChartContainer
            title="Order Status"
            subtitle="Current order distribution"
            loading={overviewLoading}
            height="h-64"
          >
            <DoughnutChart
              data={orderStatusData}
              labelKey="status"
              valueKey="count"
              centerText="Total Orders"
              centerValue={orderStatusData.reduce(
                (sum, item) => sum + (item.count || 0),
                0
              )}
            />
          </ChartContainer>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-dark">
              Recent Orders
            </h2>
            <Link
              to="/restaurant/orders"
              className="text-bottle-green hover:text-bottle-green/80 font-medium text-sm flex items-center gap-1 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {ordersLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 h-16 rounded-2xl"></div>
                  </div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white/50 border border-gray-100 rounded-2xl p-4 hover:border-bottle-green/20 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary/10 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-bottle-green" />
                      </div>
                      <div>
                        <p className="font-medium text-text-dark">
                          Order #{order.orderNumber || order._id?.slice(-6)}
                        </p>
                        <p className="text-text-muted text-sm">
                          {order.items?.length || 0} items •{' '}
                          {timeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-xl text-sm font-medium bg-mint-fresh/20 text-bottle-green">
                        {order.status || 'Processing'}
                      </span>
                      <p className="font-semibold text-text-dark">
                        {formatCurrency(order.totalAmount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-text-muted">No recent orders</p>
                <p className="text-sm text-text-muted/70 mt-1">
                  Start by browsing our fresh products
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget and Vendor Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Budget Status */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-6">
            Budget Overview
          </h3>
          {budgetLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Monthly Budget</span>
                <span className="font-semibold text-text-dark">
                  {formatCurrency(budgetData.total || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Used</span>
                <span className="font-semibold text-tomato-red">
                  {formatCurrency(budgetData.used || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Remaining</span>
                <span className="font-semibold text-mint-fresh">
                  {formatCurrency(budgetData.remaining || 0)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                <div
                  className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(budgetData.usedPercentage || 0, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Top Vendors */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-6">
            Top Vendors
          </h3>
          {vendorLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : vendorInsights.topVendors?.length > 0 ? (
            <div className="space-y-3">
              {vendorInsights.topVendors.slice(0, 5).map((vendor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {vendor.name?.charAt(0) || 'V'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-dark text-sm">
                      {vendor.name || 'Unknown Vendor'}
                    </p>
                    <p className="text-text-muted text-xs">
                      {vendor.orderCount || 0} orders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-text-dark">
                      {formatCurrency(vendor.totalSpent || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-text-muted text-sm">
                No vendor data available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
