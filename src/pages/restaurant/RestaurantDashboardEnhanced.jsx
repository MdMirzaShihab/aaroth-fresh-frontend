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

  // Business verification hook (updated for three-state system)
  const {
    verificationStatus,
    isApproved,
    isRejected,
    isPending,
    businessName,
    businessType,
    canPlaceOrders,
    canAccessDashboard,
    showVerificationPending,
    showVerificationRejected,
    showVerificationApproved,
    getStatusDisplay,
    adminNotes,
    getRejectionGuidance,
    // Legacy support
    isVerified,
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
      <div className="min-h-screen bg-gradient-to-br from-sage-green/5 via-white to-muted-olive/5 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with Verification Status */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-light text-text-dark mb-2 tracking-wide">
                  Restaurant Dashboard
                </h1>
                <p className="text-text-muted font-light">
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
          <div className="glass-layer-1 dark:glass-1-dark rounded-3xl p-6 mb-8 shadow-organic dark:shadow-dark-glass animate-fade-in">
            <h2 className="text-lg font-medium text-text-dark mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CapabilityGate capability="canPlaceOrders" showMessage={false}>
                <Link
                  to="/restaurant/place-order"
                  className="flex items-center gap-3 p-4 rounded-2xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-glow-green/20 dark:hover:shadow-dark-glow-olive transition-all duration-300 group border-0 animate-fade-in"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-muted-olive/10 to-sage-green/10 dark:from-dark-sage-accent/20 dark:to-dark-olive-surface/20 rounded-2xl flex items-center justify-center group-hover:shadow-glow-green/30 dark:group-hover:shadow-dark-glow-olive transition-all duration-300 shadow-soft dark:shadow-dark-glass">
                    <Plus className="w-6 h-6 text-muted-olive" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200">Place Order</p>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted group-hover:text-muted-olive/70 dark:group-hover:text-dark-sage-accent/70 transition-colors duration-200">
                      Order fresh produce
                    </p>
                  </div>
                </Link>
              </CapabilityGate>

              <CapabilityGate capability="canPlaceOrders" showMessage={false}>
                <Link
                  to="/restaurant/orders"
                  className="flex items-center gap-3 p-4 rounded-2xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-glow-green/20 dark:hover:shadow-dark-glow-olive transition-all duration-300 group border-0 animate-fade-in"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-dusty-cedar/10 to-earthy-brown/10 dark:from-dark-cedar-warm/20 dark:to-dusty-cedar/20 rounded-2xl flex items-center justify-center group-hover:shadow-glow-green/30 dark:group-hover:shadow-dark-glow-olive transition-all duration-300 shadow-soft dark:shadow-dark-glass">
                    <Package className="w-6 h-6 text-dusty-cedar dark:text-dark-cedar-warm group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200">Order History</p>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted group-hover:text-muted-olive/70 dark:group-hover:text-dark-sage-accent/70 transition-colors duration-200">View past orders</p>
                  </div>
                </Link>
              </CapabilityGate>

              <Link
                to="/restaurant/profile"
                className="flex items-center gap-3 p-4 rounded-2xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-glow-green/20 dark:hover:shadow-dark-glow-olive transition-all duration-300 group border-0 animate-fade-in"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sage-green/10 to-muted-olive/10 dark:from-dark-sage-accent/20 dark:to-muted-olive/20 rounded-2xl flex items-center justify-center group-hover:shadow-glow-green/30 dark:group-hover:shadow-dark-glow-olive transition-all duration-300 shadow-soft dark:shadow-dark-glass">
                  <Users className="w-6 h-6 text-muted-olive dark:text-dark-sage-accent group-hover:text-sage-green dark:group-hover:text-dark-sage-accent/80 transition-colors duration-200" />
                </div>
                <div>
                  <p className="font-medium text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200">Profile</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted group-hover:text-muted-olive/70 dark:group-hover:text-dark-sage-accent/70 transition-colors duration-200">Restaurant details</p>
                </div>
              </Link>

              <CapabilityGate
                capability="canAccessDashboard"
                showMessage={false}
              >
                <Link
                  to="/restaurant/budget"
                  className="flex items-center gap-3 p-4 rounded-2xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-glow-green/20 dark:hover:shadow-dark-glow-olive transition-all duration-300 group border-0 animate-fade-in"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-sage-green/10 to-bottle-green/10 dark:from-dark-sage-accent/20 dark:to-dark-sage-accent/30 rounded-2xl flex items-center justify-center group-hover:shadow-glow-green/30 dark:group-hover:shadow-dark-glow-olive transition-all duration-300 shadow-soft dark:shadow-dark-glass">
                    <Target className="w-6 h-6 text-bottle-green dark:text-dark-sage-accent group-hover:text-sage-green dark:group-hover:text-dark-sage-accent/80 transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200">Budget</p>
                    <p className="text-sm text-text-muted dark:text-dark-text-muted group-hover:text-muted-olive/70 dark:group-hover:text-dark-sage-accent/70 transition-colors duration-200">Track spending</p>
                  </div>
                </Link>
              </CapabilityGate>
            </div>
          </div>

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
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary">
                    Budget Status
                  </h3>
                  <Target className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
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
              </div>

              {/* Recent Orders */}
              <div className="lg:col-span-2 glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary">
                    Recent Orders
                  </h3>
                  <Link
                    to="/restaurant/orders"
                    className="text-muted-olive dark:text-dark-sage-accent hover:text-sage-green dark:hover:text-dark-sage-accent/80 text-sm font-medium transition-colors duration-200"
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
                        className="flex items-center justify-between p-3 rounded-xl hover:glass-layer-1 dark:hover:glass-1-dark transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full shadow-soft animate-pulse ${
                              order.status === 'delivered'
                                ? 'bg-sage-green'
                                : order.status === 'confirmed'
                                  ? 'bg-muted-olive'
                                  : 'bg-earthy-yellow'
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium text-text-dark dark:text-dark-text-primary">
                              Order #{order.orderNumber}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                              {timeAgo(order.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-dark dark:text-dark-text-primary">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-sm text-text-muted dark:text-dark-text-muted capitalize">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        No recent orders
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CapabilityGate>
        </div>
      </div>
    </CapabilityGate>
  );
};

export default RestaurantDashboardEnhanced;
