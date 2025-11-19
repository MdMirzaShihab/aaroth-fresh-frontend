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
  RefreshCw,
  TrendingDown,
  Truck,
  Activity,
  Star,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  useGetBuyerDashboardOverviewQuery,
  useGetBuyerSpendingQuery,
  useGetBuyerBudgetQuery,
  useGetBuyerVendorInsightsQuery,
  useGetBuyerOrderHistoryQuery,
  useGetBuyerNotificationsQuery,
  useGetBuyerInventoryPlanningQuery,
  useGetBuyerReorderSuggestionsQuery,
  useGetBuyerCostAnalysisQuery,
  useGetBuyerPriceAnalyticsQuery,
  useGetBuyerPurchasePatternsQuery,
  useGetBuyerDeliveryTrackingQuery,
  useGetBuyerTeamActivityQuery,
  useGetBuyerFavoriteVendorsQuery,
} from '../../store/slices/apiSlice';
import { selectAuth } from '../../store/slices/authSlice';
import { formatCurrency, formatDate, timeAgo } from '../../utils';

// Business Verification Components
import CapabilityGate from '../../components/verification/CapabilityGate';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import VerificationStatusBadge from '../../components/common/VerificationStatusBadge';

// Dashboard Components
import {
  KPICard,
  ChartContainer,
  FilterPanel,
} from '../../components/dashboard';
import { LineChart, BarChart, DoughnutChart } from '../../components/ui/charts/ChartJS';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

// Helper function to transform filters for API calls
const transformFiltersForAPI = (filters) => {
  const apiParams = {};

  if (filters.dateRange) {
    if (filters.dateRange.type) {
      apiParams.period = filters.dateRange.type;
    }
    if (filters.dateRange.startDate) {
      apiParams.startDate = filters.dateRange.startDate;
    }
    if (filters.dateRange.endDate) {
      apiParams.endDate = filters.dateRange.endDate;
    }
  }

  if (filters.category) {
    apiParams.category = filters.category;
  }

  return apiParams;
};

const BuyerDashboard = () => {
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
    (user.role === 'buyerOwner' || user.role === 'buyerManager');

  // Get status display information
  const statusDisplay = getStatusDisplay();

  // Fetch comprehensive dashboard data with new APIs (with error handling)
  const {
    data: overview = {},
    isLoading: overviewLoading,
    error: overviewError,
  } = useGetBuyerDashboardOverviewQuery(transformFiltersForAPI(filters), {
    skip: !isValidUser || !canAccessDashboard,
  });

  const { data: spending = {}, isLoading: spendingLoading } =
    useGetBuyerSpendingQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: budget = {}, isLoading: budgetLoading } =
    useGetBuyerBudgetQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: vendorInsights = {}, isLoading: vendorInsightsLoading } =
    useGetBuyerVendorInsightsQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: orderHistory = {}, isLoading: orderHistoryLoading } =
    useGetBuyerOrderHistoryQuery(
      { ...transformFiltersForAPI(filters), limit: 5 },
      {
        skip: !isValidUser || !canAccessDashboard,
      }
    );

  const { data: notifications = {}, isLoading: notificationsLoading } =
    useGetBuyerNotificationsQuery(
      { limit: 5 },
      {
        skip: !isValidUser || !canAccessDashboard,
      }
    );

  // New API integrations
  const { data: inventoryPlanning = {}, isLoading: inventoryLoading } =
    useGetBuyerInventoryPlanningQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: reorderSuggestions = {}, isLoading: reorderLoading } =
    useGetBuyerReorderSuggestionsQuery({ limit: 10 }, {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: costAnalysis = {}, isLoading: costAnalysisLoading } =
    useGetBuyerCostAnalysisQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: priceAnalytics = {}, isLoading: priceAnalyticsLoading } =
    useGetBuyerPriceAnalyticsQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: purchasePatterns = {}, isLoading: patternsLoading } =
    useGetBuyerPurchasePatternsQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: deliveryTracking = {}, isLoading: deliveryLoading } =
    useGetBuyerDeliveryTrackingQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard,
    });

  const { data: teamActivity = {}, isLoading: teamActivityLoading } =
    useGetBuyerTeamActivityQuery(transformFiltersForAPI(filters), {
      skip: !isValidUser || !canAccessDashboard || user?.role !== 'buyerOwner',
    });

  const { data: favoriteVendors = {}, isLoading: favoriteVendorsLoading } =
    useGetBuyerFavoriteVendorsQuery({ limit: 5 }, {
      skip: !isValidUser || !canAccessDashboard,
    });

  if (!isValidUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-text-dark mb-2">
            Access Denied
          </h1>
          <p className="text-text-muted">
            You need to be logged in as a buyer user to access this
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
                  Buyer Dashboard
                </h1>
                <p className="text-text-muted font-light">
                  {businessName
                    ? `Welcome back, ${businessName}`
                    : 'Manage your buyer operations'}
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
                  to="/buyer/cart"
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
                  to="/buyer/orders"
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
                to="/buyer/profile"
                className="flex items-center gap-3 p-4 rounded-2xl glass-layer-1 dark:glass-1-dark hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-glow-green/20 dark:hover:shadow-dark-glow-olive transition-all duration-300 group border-0 animate-fade-in"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-sage-green/10 to-muted-olive/10 dark:from-dark-sage-accent/20 dark:to-muted-olive/20 rounded-2xl flex items-center justify-center group-hover:shadow-glow-green/30 dark:group-hover:shadow-dark-glow-olive transition-all duration-300 shadow-soft dark:shadow-dark-glass">
                  <Users className="w-6 h-6 text-muted-olive dark:text-dark-sage-accent group-hover:text-sage-green dark:group-hover:text-dark-sage-accent/80 transition-colors duration-200" />
                </div>
                <div>
                  <p className="font-medium text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-200">Profile</p>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted group-hover:text-muted-olive/70 dark:group-hover:text-dark-sage-accent/70 transition-colors duration-200">Buyer details</p>
                </div>
              </Link>

              <CapabilityGate
                capability="canAccessDashboard"
                showMessage={false}
              >
                <Link
                  to="/buyer/budget"
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
                    to="/buyer/orders"
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

            {/* Inventory Planning & Reorder Suggestions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Inventory Planning */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <Package className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Inventory Planning
                  </h3>
                </div>

                {inventoryLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {inventoryPlanning?.data?.lowStockItems?.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark hover:shadow-glow-green/20 transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-dark dark:text-dark-text-primary">
                              {item.name}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                              Current: {item.currentStock} {item.unit}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                              Low Stock
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        All items well stocked
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reorder Suggestions */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Reorder Suggestions
                  </h3>
                </div>

                {reorderLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reorderSuggestions?.data?.suggestions?.slice(0, 3).map((suggestion) => (
                      <div
                        key={suggestion._id}
                        className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark hover:shadow-glow-green/20 transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-dark dark:text-dark-text-primary">
                              {suggestion.productName}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                              Suggested: {suggestion.suggestedQuantity} {suggestion.unit}
                            </p>
                          </div>
                          <button className="px-3 py-1 bg-gradient-secondary text-white rounded-xl text-sm hover:shadow-glow-green transition-all duration-200">
                            Order
                          </button>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        No reorder suggestions
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Cost Analysis & Price Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Cost Analysis */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Cost Analysis
                  </h3>
                </div>

                {costAnalysisLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-xl bg-sage-green/5">
                        <p className="text-sm text-text-muted">Total Savings</p>
                        <p className="text-2xl font-semibold text-sage-green">
                          {formatCurrency(costAnalysis?.data?.totalSavings || 0)}
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50">
                        <p className="text-sm text-text-muted">Avg Cost/Order</p>
                        <p className="text-2xl font-semibold text-text-dark">
                          {formatCurrency(costAnalysis?.data?.avgCostPerOrder || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-text-muted">
                      {costAnalysis?.data?.trend === 'down' ? (
                        <span className="text-sage-green flex items-center gap-1">
                          <TrendingDown className="w-4 h-4" />
                          Costs trending down
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          Costs trending up
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Price Analytics */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Price Analytics
                  </h3>
                </div>

                {priceAnalyticsLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priceAnalytics?.data?.priceChanges?.slice(0, 3).map((item) => (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark"
                      >
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-text-dark dark:text-dark-text-primary">
                            {item.productName}
                          </p>
                          <span
                            className={`text-sm font-semibold ${
                              item.change > 0 ? 'text-red-500' : 'text-sage-green'
                            }`}
                          >
                            {item.change > 0 ? '+' : ''}
                            {item.change}%
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        No price changes
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Purchase Patterns & Delivery Tracking Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Purchase Patterns */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Purchase Patterns
                  </h3>
                </div>

                {patternsLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-24 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-xl glass-layer-1">
                        <p className="text-sm text-text-muted">Most Ordered</p>
                        <p className="font-semibold text-text-dark">
                          {purchasePatterns?.data?.topProduct || 'N/A'}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-xl glass-layer-1">
                        <p className="text-sm text-text-muted">Peak Day</p>
                        <p className="font-semibold text-text-dark">
                          {purchasePatterns?.data?.peakDay || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-text-muted">
                      {purchasePatterns?.data?.insight || 'Gathering purchase pattern insights...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Delivery Tracking */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <Truck className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Delivery Tracking
                  </h3>
                </div>

                {deliveryLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deliveryTracking?.data?.activeDeliveries?.slice(0, 2).map((delivery) => (
                      <div
                        key={delivery._id}
                        className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-dark dark:text-dark-text-primary">
                              Order #{delivery.orderNumber}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                              {delivery.status}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-olive font-medium">
                              ETA: {delivery.eta}
                            </p>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        No active deliveries
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Favorite Vendors & Team Activity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Favorite Vendors */}
              <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                    <Star className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                    Favorite Vendors
                  </h3>
                </div>

                {favoriteVendorsLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteVendors?.data?.vendors?.slice(0, 3).map((vendor) => (
                      <div
                        key={vendor._id}
                        className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark hover:shadow-glow-green/20 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-text-dark dark:text-dark-text-primary">
                              {vendor.businessName}
                            </p>
                            <p className="text-sm text-text-muted dark:text-dark-text-muted">
                              {vendor.orderCount} orders • {formatCurrency(vendor.totalSpent)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-earthy-yellow text-earthy-yellow" />
                            <span className="text-sm font-medium">
                              {vendor.rating?.toFixed(1) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                        No favorite vendors yet
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Team Activity (Owner Only) */}
              {user?.role === 'buyerOwner' && (
                <div className="glass-layer-2 dark:glass-2-dark rounded-3xl p-6 shadow-organic dark:shadow-dark-glass animate-fade-in">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-text-dark dark:text-dark-text-primary flex items-center gap-2">
                      <Activity className="w-5 h-5 text-muted-olive dark:text-dark-sage-accent" />
                      Team Activity
                    </h3>
                    <Link
                      to="/buyer/manage/managers"
                      className="text-muted-olive dark:text-dark-sage-accent hover:text-sage-green text-sm font-medium transition-colors duration-200"
                    >
                      Manage
                    </Link>
                  </div>

                  {teamActivityLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teamActivity?.data?.recentActivity?.slice(0, 3).map((activity) => (
                        <div
                          key={activity._id}
                          className="p-3 rounded-xl glass-layer-1 dark:glass-1-dark"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-text-dark dark:text-dark-text-primary">
                                {activity.managerName}
                              </p>
                              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                                {activity.action}
                              </p>
                            </div>
                            <p className="text-xs text-text-muted">
                              {timeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-text-muted dark:text-dark-text-muted">
                          No team activity
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CapabilityGate>
        </div>
      </div>
    </CapabilityGate>
  );
};

export default BuyerDashboard;
