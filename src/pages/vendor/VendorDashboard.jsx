import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  Eye,
  Users,
  Plus,
  Bell,
  Target,
} from 'lucide-react';
import {
  useGetVendorDashboardOverviewQuery,
  useGetVendorRevenueQuery,
  useGetVendorProductPerformanceQuery,
  useGetVendorInventoryQuery,
  useGetVendorOrderManagementQuery,
  useGetVendorCustomerInsightsQuery,
  useGetVendorNotificationsQuery,
} from '../../store/slices/apiSlice';
import { selectAuth } from '../../store/slices/authSlice';
import { formatCurrency, timeAgo } from '../../utils';

// Dashboard Components
import {
  KPICard,
  ChartContainer,
  FilterPanel,
} from '../../components/dashboard';
import { LineChart, BarChart, DoughnutChart } from '../../components/charts';

const VendorDashboard = () => {
  const { user } = useSelector(selectAuth);
  const [filters, setFilters] = useState({
    dateRange: { type: 'month' },
  });

  // Fetch comprehensive vendor dashboard data with new APIs
  const { data: overview = {}, isLoading: overviewLoading } =
    useGetVendorDashboardOverviewQuery({
      ...filters,
    });

  const { data: revenueData = {}, isLoading: revenueLoading } =
    useGetVendorRevenueQuery({
      ...filters,
    });

  const { data: productPerformance = {}, isLoading: productLoading } =
    useGetVendorProductPerformanceQuery({
      ...filters,
    });

  const { data: inventoryData = {}, isLoading: inventoryLoading } =
    useGetVendorInventoryQuery();

  const { data: orderManagement = [], isLoading: ordersLoading } =
    useGetVendorOrderManagementQuery({
      limit: 5,
      sort: 'createdAt',
      order: 'desc',
    });

  const { data: customerInsights = {}, isLoading: customerLoading } =
    useGetVendorCustomerInsightsQuery({
      ...filters,
    });

  const { data: notifications = [] } = useGetVendorNotificationsQuery({
    limit: 5,
    unreadOnly: true,
  });

  // Enhanced KPI data from new vendor dashboard APIs
  const kpiData = [
    {
      title: 'Total Revenue',
      value: overview.totalRevenue || 0,
      format: 'currency',
      icon: DollarSign,
      color: 'bg-gradient-primary',
      textColor: 'text-white',
      change: overview.revenueChange || 0,
      trend: overview.revenueChange >= 0 ? 'up' : 'down',
      subtitle: 'This month',
    },
    {
      title: 'Total Orders',
      value: overview.totalOrders || 0,
      format: 'number',
      icon: ShoppingCart,
      color: 'bg-gradient-secondary',
      textColor: 'text-white',
      change: overview.ordersChange || 0,
      trend: 'up',
      subtitle: 'All time',
    },
    {
      title: 'Active Listings',
      value: overview.activeListings || 0,
      format: 'number',
      icon: Package,
      color: 'bg-mint-fresh/10',
      textColor: 'text-bottle-green',
      change: overview.listingsChange || 0,
      trend: 'up',
      subtitle: `${overview.totalListings || 0} total`,
    },
    {
      title: 'Customer Retention',
      value: customerInsights.retentionRate || 0,
      format: 'percentage',
      icon: Users,
      color: 'bg-earthy-yellow/10',
      textColor: 'text-earthy-brown',
      change: customerInsights.retentionChange || 0,
      trend: customerInsights.retentionChange >= 0 ? 'up' : 'down',
      subtitle: 'Repeat customers',
    },
  ];

  // Prepare chart data
  const revenueTrendData = revenueData.trends || [];
  const productPerformanceData = productPerformance.topProducts || [];
  const orderStatusData = overview.ordersByStatus || [];

  // Export handlers
  const handleExportRevenue = async (format) => {
    console.log('Exporting revenue data as:', format);
  };

  const handleRefreshData = async () => {
    console.log('Refreshing vendor dashboard data');
  };

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Welcome back, {user?.vendorId?.businessName || user?.name}
          </h1>
          <p className="text-text-muted mt-2">
            Manage your business, track sales, and grow your customer base
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
            to="/vendor/listings/create"
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200 touch-target"
          >
            <Plus className="w-5 h-5" />
            Add Listing
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
            loading={overviewLoading || revenueLoading || customerLoading}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Revenue Trends */}
        <ChartContainer
          title="Revenue Trends"
          subtitle="Monthly revenue and growth patterns"
          onExport={handleExportRevenue}
          onRefresh={handleRefreshData}
          loading={revenueLoading}
          className="lg:col-span-1"
        >
          <LineChart
            data={revenueTrendData}
            title="Revenue"
            xAxisKey="month"
            yAxisKey="revenue"
            formatTooltip={formatCurrency}
            formatYAxis={formatCurrency}
            curved={true}
            filled={true}
          />
        </ChartContainer>

        {/* Product Performance */}
        <ChartContainer
          title="Top Products"
          subtitle="Best selling products by revenue"
          loading={productLoading}
          className="lg:col-span-1"
        >
          <BarChart
            data={productPerformanceData}
            title="Product Revenue"
            xAxisKey="productName"
            yAxisKey="revenue"
            formatTooltip={formatCurrency}
            formatYAxis={formatCurrency}
          />
        </ChartContainer>
      </div>

      {/* Order Management and Inventory */}
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
              to="/vendor/orders"
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
            ) : orderManagement.length > 0 ? (
              orderManagement.map((order) => (
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
                          {order.restaurant?.name || 'Restaurant'} •{' '}
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
                  Orders will appear here when customers place them
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inventory and Customer Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Inventory Status */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-6">
            Inventory Overview
          </h3>
          {inventoryLoading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total Products</span>
                <span className="font-semibold text-text-dark">
                  {inventoryData.totalProducts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Low Stock Items</span>
                <span className="font-semibold text-tomato-red">
                  {inventoryData.lowStockItems || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Out of Stock</span>
                <span className="font-semibold text-tomato-red">
                  {inventoryData.outOfStockItems || 0}
                </span>
              </div>
              {inventoryData.lowStockItems > 0 && (
                <Link
                  to="/vendor/inventory"
                  className="block w-full bg-tomato-red/10 text-tomato-red text-center py-2 rounded-xl font-medium hover:bg-tomato-red/20 transition-colors"
                >
                  Manage Low Stock Items
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Customer Insights */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-text-dark mb-6">
            Customer Insights
          </h3>
          {customerLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded-xl"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Total Customers</span>
                <span className="font-semibold text-text-dark">
                  {customerInsights.totalCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">New This Month</span>
                <span className="font-semibold text-mint-fresh">
                  {customerInsights.newCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Repeat Customers</span>
                <span className="font-semibold text-bottle-green">
                  {customerInsights.repeatCustomers || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Avg Order Value</span>
                <span className="font-semibold text-text-dark">
                  {formatCurrency(customerInsights.avgOrderValue || 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
