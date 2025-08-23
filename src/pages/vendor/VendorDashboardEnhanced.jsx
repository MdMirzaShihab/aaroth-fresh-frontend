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
  Store,
  BarChart3,
  TrendingUp,
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

// Business Verification Components
import CapabilityGate from '../../components/verification/CapabilityGate';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import VerificationStatusBadge from '../../components/admin/VerificationStatusBadge';

// Dashboard Components
import {
  KPICard,
  ChartContainer,
  FilterPanel,
} from '../../components/dashboard';
import { LineChart, BarChart, DoughnutChart } from '../../components/charts';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const VendorDashboardEnhanced = () => {
  const { user } = useSelector(selectAuth);
  const [filters, setFilters] = useState({
    dateRange: { type: 'month' },
  });

  // Business verification hook
  const {
    isVerified,
    businessName,
    businessType,
    canCreateListings,
    canAccessDashboard,
    showVerificationPending,
    getStatusDisplay,
  } = useBusinessVerification();

  // Get status display information
  const statusDisplay = getStatusDisplay();

  // Fetch comprehensive vendor dashboard data with new APIs
  const { data: overview = {}, isLoading: overviewLoading } =
    useGetVendorDashboardOverviewQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: revenueData = {}, isLoading: revenueLoading } =
    useGetVendorRevenueQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: productPerformance = {}, isLoading: productLoading } =
    useGetVendorProductPerformanceQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: inventory = {}, isLoading: inventoryLoading } =
    useGetVendorInventoryQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: orderManagement = {}, isLoading: ordersLoading } =
    useGetVendorOrderManagementQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: customerInsights = {}, isLoading: customersLoading } =
    useGetVendorCustomerInsightsQuery(
      {
        ...filters,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: notifications = {}, isLoading: notificationsLoading } =
    useGetVendorNotificationsQuery(
      {
        limit: 5,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  return (
    <CapabilityGate capability="canAccessDashboard">
      <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Verification Status */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-medium text-text-dark mb-2">
                  Vendor Dashboard
                </h1>
                <p className="text-text-muted">
                  {businessName
                    ? `Welcome back, ${businessName}`
                    : 'Manage your business operations'}
                </p>
              </div>

              {/* Verification Status Display */}
              <div className="flex items-center gap-4">
                <VerificationStatusBadge
                  isVerified={isVerified}
                  size="default"
                  showDate={false}
                />
                <div className="text-right">
                  <p className="text-sm font-medium text-text-dark">
                    {statusDisplay.text}
                  </p>
                  <p className="text-xs text-text-muted">
                    {statusDisplay.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions with Capability Gates */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-text-dark mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CapabilityGate
                capability="canCreateListings"
                showMessage={false}
              >
                <Link
                  to="/vendor/create-listing"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-bottle-green/5 transition-all duration-200 group border border-bottle-green/10 hover:border-bottle-green/30"
                >
                  <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center group-hover:bg-bottle-green/20 transition-colors">
                    <Plus className="w-6 h-6 text-bottle-green" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Add Product</p>
                    <p className="text-sm text-text-muted">
                      Create new listing
                    </p>
                  </div>
                </Link>
              </CapabilityGate>

              <CapabilityGate
                capability="canCreateListings"
                showMessage={false}
              >
                <Link
                  to="/vendor/listings"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-earthy-brown/5 transition-all duration-200 group border border-earthy-brown/10 hover:border-earthy-brown/30"
                >
                  <div className="w-12 h-12 bg-earthy-brown/10 rounded-2xl flex items-center justify-center group-hover:bg-earthy-brown/20 transition-colors">
                    <Package className="w-6 h-6 text-earthy-brown" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">My Listings</p>
                    <p className="text-sm text-text-muted">Manage products</p>
                  </div>
                </Link>
              </CapabilityGate>

              <CapabilityGate
                capability="canAccessDashboard"
                showMessage={false}
              >
                <Link
                  to="/vendor/orders"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-blue-50 transition-all duration-200 group border border-blue-100 hover:border-blue-200"
                >
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Orders</p>
                    <p className="text-sm text-text-muted">Process orders</p>
                  </div>
                </Link>
              </CapabilityGate>

              <CapabilityGate
                capability="canAccessDashboard"
                showMessage={false}
              >
                <Link
                  to="/vendor/analytics"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-green-50 transition-all duration-200 group border border-green-100 hover:border-green-200"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Analytics</p>
                    <p className="text-sm text-text-muted">View reports</p>
                  </div>
                </Link>
              </CapabilityGate>
            </div>
          </Card>

          {/* Only show analytics if user can access dashboard */}
          <CapabilityGate capability="canAccessDashboard">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Monthly Revenue"
                value={formatCurrency(overview?.data?.monthlyRevenue || 0)}
                change={overview?.data?.revenueChange}
                icon={DollarSign}
                loading={overviewLoading}
                color="green"
              />
              <KPICard
                title="Active Listings"
                value={overview?.data?.activeListings || 0}
                change={overview?.data?.listingsChange}
                icon={Package}
                loading={overviewLoading}
                color="blue"
              />
              <KPICard
                title="Pending Orders"
                value={overview?.data?.pendingOrders || 0}
                icon={ShoppingCart}
                loading={overviewLoading}
                color="orange"
                alert={overview?.data?.pendingOrders > 10}
              />
              <KPICard
                title="Customer Base"
                value={overview?.data?.totalCustomers || 0}
                change={overview?.data?.customersChange}
                icon={Users}
                loading={overviewLoading}
                color="purple"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trend */}
              <ChartContainer
                title="Revenue Trend"
                loading={revenueLoading}
                error={revenueData?.error}
              >
                <LineChart
                  data={revenueData?.data?.chartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value),
                        },
                      },
                    },
                  }}
                />
              </ChartContainer>

              {/* Product Performance */}
              <ChartContainer
                title="Top Products by Revenue"
                loading={productLoading}
                error={productPerformance?.error}
              >
                <BarChart
                  data={productPerformance?.data?.chartData}
                  options={{
                    responsive: true,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => formatCurrency(value),
                        },
                      },
                    },
                  }}
                />
              </ChartContainer>
            </div>

            {/* Inventory Alerts & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Inventory Alerts */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Inventory Alerts
                  </h3>
                  <Package className="w-5 h-5 text-text-muted" />
                </div>

                {inventoryLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inventory?.data?.alerts
                      ?.slice(0, 5)
                      .map((alert, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-200/50"
                        >
                          <div>
                            <p className="text-sm font-medium text-amber-800">
                              {alert.productName}
                            </p>
                            <p className="text-xs text-amber-600">
                              {alert.currentStock} units remaining
                            </p>
                          </div>
                          <div className="text-xs text-amber-700 font-medium">
                            Low Stock
                          </div>
                        </div>
                      )) || (
                      <div className="text-center py-4 text-text-muted text-sm">
                        All inventory levels are healthy
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* Recent Orders */}
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Recent Orders
                  </h3>
                  <Link
                    to="/vendor/orders"
                    className="text-bottle-green hover:text-bottle-green/80 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                {ordersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center space-x-4"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orderManagement?.data?.recentOrders
                      ?.slice(0, 5)
                      .map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                order.status === 'delivered'
                                  ? 'bg-green-500'
                                  : order.status === 'confirmed'
                                    ? 'bg-blue-500'
                                    : order.status === 'pending'
                                      ? 'bg-yellow-500'
                                      : 'bg-gray-400'
                              }`}
                            ></div>
                            <div>
                              <p className="font-medium text-text-dark">
                                Order #{order.orderNumber}
                              </p>
                              <p className="text-sm text-text-muted">
                                {order.customerName} •{' '}
                                {timeAgo(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-text-dark">
                              {formatCurrency(order.total)}
                            </p>
                            <p className="text-sm text-text-muted capitalize">
                              {order.status}
                            </p>
                          </div>
                        </div>
                      )) || (
                      <div className="text-center py-8 text-text-muted">
                        No recent orders
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Customer Insights */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-text-dark">
                  Customer Insights
                </h3>
                <Users className="w-5 h-5 text-text-muted" />
              </div>

              {customersLoading ? (
                <div className="animate-pulse grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-xl bg-blue-50">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {customerInsights?.data?.repeatCustomers || 0}
                    </div>
                    <div className="text-sm text-blue-700">
                      Repeat Customers
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-green-50">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {formatCurrency(
                        customerInsights?.data?.avgOrderValue || 0
                      )}
                    </div>
                    <div className="text-sm text-green-700">
                      Avg Order Value
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {customerInsights?.data?.customerSatisfaction || 0}%
                    </div>
                    <div className="text-sm text-purple-700">
                      Satisfaction Rate
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </CapabilityGate>
        </div>
      </div>
    </CapabilityGate>
  );
};

export default VendorDashboardEnhanced;
