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
  Shield,
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

const RestaurantDashboardEnhanced = () => {
  const { user, isAuthenticated, token } = useSelector(selectAuth);
  const [filters, setFilters] = useState({
    dateRange: { type: 'month' },
  });

  // Business verification hook
  const {
    isVerified,
    businessName,
    businessType,
    canPlaceOrders,
    canAccessDashboard,
    showVerificationPending,
    getStatusDisplay,
  } = useBusinessVerification();

  // Prevent API calls if user is not authenticated or doesn't have required role
  const isValidUser =
    isAuthenticated &&
    user &&
    token &&
    (user.role === 'restaurantOwner' || user.role === 'restaurantManager');

  // Get status display information
  const statusDisplay = getStatusDisplay();

  // Fetch comprehensive dashboard data with new APIs (with error handling)
  const {
    data: overview = {},
    isLoading: overviewLoading,
    error: overviewError,
  } = useGetRestaurantDashboardOverviewQuery(filters, {
    skip: !isValidUser || !canAccessDashboard,
  });

  const { data: spending = {}, isLoading: spendingLoading } =
    useGetRestaurantSpendingQuery(filters, {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: budget = {}, isLoading: budgetLoading } =
    useGetRestaurantBudgetQuery(filters, {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: vendorInsights = {}, isLoading: vendorInsightsLoading } =
    useGetRestaurantVendorInsightsQuery(filters, {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: orderHistory = {}, isLoading: orderHistoryLoading } =
    useGetRestaurantOrderHistoryQuery(
      { ...filters, limit: 5 },
      {
        skip: !isValidUser || !canAccessDashboard,
      }
    );

  const { data: notifications = {}, isLoading: notificationsLoading } =
    useGetRestaurantNotificationsQuery(
      { limit: 5 },
      {
        skip: !isValidUser || !canAccessDashboard,
      }
    );

  if (!isValidUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-dark mb-2">
            Access Denied
          </h1>
          <p className="text-text-muted">
            You need to be logged in as a restaurant user to access this
            dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <CapabilityGate capability="canAccessDashboard">
      <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Verification Status */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-medium text-text-dark mb-2">
                  Restaurant Dashboard
                </h1>
                <p className="text-text-muted">
                  {businessName
                    ? `Welcome back, ${businessName}`
                    : 'Manage your restaurant operations'}
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
              <CapabilityGate capability="canPlaceOrders" showMessage={false}>
                <Link
                  to="/restaurant/place-order"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-bottle-green/5 transition-all duration-200 group border border-bottle-green/10 hover:border-bottle-green/30"
                >
                  <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center group-hover:bg-bottle-green/20 transition-colors">
                    <Plus className="w-6 h-6 text-bottle-green" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Place Order</p>
                    <p className="text-sm text-text-muted">
                      Order fresh produce
                    </p>
                  </div>
                </Link>
              </CapabilityGate>

              <CapabilityGate capability="canPlaceOrders" showMessage={false}>
                <Link
                  to="/restaurant/orders"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-earthy-brown/5 transition-all duration-200 group border border-earthy-brown/10 hover:border-earthy-brown/30"
                >
                  <div className="w-12 h-12 bg-earthy-brown/10 rounded-2xl flex items-center justify-center group-hover:bg-earthy-brown/20 transition-colors">
                    <Package className="w-6 h-6 text-earthy-brown" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Order History</p>
                    <p className="text-sm text-text-muted">View past orders</p>
                  </div>
                </Link>
              </CapabilityGate>

              <Link
                to="/restaurant/profile"
                className="flex items-center gap-3 p-4 rounded-2xl hover:bg-blue-50 transition-all duration-200 group border border-blue-100 hover:border-blue-200"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-text-dark">Profile</p>
                  <p className="text-sm text-text-muted">Restaurant details</p>
                </div>
              </Link>

              <CapabilityGate
                capability="canAccessDashboard"
                showMessage={false}
              >
                <Link
                  to="/restaurant/budget"
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-green-50 transition-all duration-200 group border border-green-100 hover:border-green-200"
                >
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Target className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">Budget</p>
                    <p className="text-sm text-text-muted">Track spending</p>
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
                title="This Month's Spend"
                value={formatCurrency(overview?.data?.totalSpent || 0)}
                change={overview?.data?.spendingChange}
                icon={DollarSign}
                loading={overviewLoading}
                color="green"
              />
              <KPICard
                title="Orders Placed"
                value={overview?.data?.ordersPlaced || 0}
                change={overview?.data?.ordersChange}
                icon={ShoppingCart}
                loading={overviewLoading}
                color="blue"
              />
              <KPICard
                title="Favorite Vendors"
                value={overview?.data?.favoriteVendors || 0}
                icon={Users}
                loading={overviewLoading}
                color="purple"
              />
              <KPICard
                title="Budget Utilization"
                value={`${overview?.data?.budgetUtilization || 0}%`}
                icon={Target}
                loading={overviewLoading}
                color="orange"
                alert={overview?.data?.budgetUtilization > 90}
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Spending Trend */}
              <ChartContainer
                title="Spending Trend"
                loading={spendingLoading}
                error={spending?.error}
              >
                <LineChart
                  data={spending?.data?.chartData}
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

              {/* Vendor Distribution */}
              <ChartContainer
                title="Top Vendors by Spending"
                loading={vendorInsightsLoading}
                error={vendorInsights?.error}
              >
                <DoughnutChart
                  data={vendorInsights?.data?.chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      },
                    },
                  }}
                />
              </ChartContainer>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Budget Status
                  </h3>
                  <Target className="w-5 h-5 text-text-muted" />
                </div>

                {budgetLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-muted">Used</span>
                      <span className="font-semibold">
                        {formatCurrency(budget?.data?.used || 0)} /{' '}
                        {formatCurrency(budget?.data?.total || 0)}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (budget?.data?.percentage || 0) > 90
                            ? 'bg-red-500'
                            : (budget?.data?.percentage || 0) > 75
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(budget?.data?.percentage || 0, 100)}%`,
                        }}
                      ></div>
                    </div>

                    <p className="text-sm text-text-muted">
                      {budget?.data?.percentage || 0}% of budget used
                    </p>
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
                    to="/restaurant/orders"
                    className="text-bottle-green hover:text-bottle-green/80 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                {orderHistoryLoading ? (
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
                    {orderHistory?.data?.orders?.slice(0, 5).map((order) => (
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
                                  : 'bg-yellow-500'
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium text-text-dark">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-text-muted">
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
          </CapabilityGate>
        </div>
      </div>
    </CapabilityGate>
  );
};

export default RestaurantDashboardEnhanced;
