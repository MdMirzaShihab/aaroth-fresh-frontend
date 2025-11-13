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
  useGetDashboardOverviewQuery,
  useGetRevenueAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useGetCustomerAnalyticsQuery,
  useGetInventoryStatusQuery,
  useGetOrderManagementQuery,
  useGetVendorNotificationsQuery,
} from '../../store/slices/vendor/vendorDashboardApi';
import {
  useGetAllListingsQuery,
} from '../../store/slices/vendor/vendorListingsApi';
import { selectAuth } from '../../store/slices/authSlice';
import { formatCurrency, timeAgo } from '../../utils';

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

const VendorDashboardEnhanced = () => {
  const { user } = useSelector(selectAuth);
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
    canCreateListings,
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

  // Get status display information
  const statusDisplay = getStatusDisplay();

  // Fetch comprehensive vendor dashboard data with backend-aligned APIs
  const { data: overview = {}, isLoading: overviewLoading } =
    useGetDashboardOverviewQuery(
      {
        period: filters.dateRange.type,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: revenueData = {}, isLoading: revenueLoading } =
    useGetRevenueAnalyticsQuery(
      {
        period: filters.dateRange.type,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: orderData = {}, isLoading: orderLoading } =
    useGetOrderAnalyticsQuery(
      {
        period: filters.dateRange.type,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: listings = {}, isLoading: listingsLoading } =
    useGetAllListingsQuery(
      {
        status: 'active',
        limit: 10,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: inventory = {}, isLoading: inventoryLoading } =
    useGetInventoryStatusQuery(
      {},
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: orderManagement = {}, isLoading: orderManagementLoading } =
    useGetOrderManagementQuery(
      {
        status: 'all',
        limit: 5,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: customerInsights = {}, isLoading: customersLoading } =
    useGetCustomerAnalyticsQuery(
      {
        period: filters.dateRange.type,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  const { data: notifications = {}, isLoading: notificationsLoading } =
    useGetVendorNotificationsQuery(
      {
        limit: 5,
        unreadOnly: false,
      },
      {
        skip: !canAccessDashboard,
      }
    );

  return (
    <CapabilityGate capability="canAccessDashboard">
      <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 p-6">
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
                  className="flex items-center gap-3 p-4 rounded-2xl hover:bg-muted-olive/5 transition-all duration-200 group border border-muted-olive/10 hover:border-muted-olive/30"
                >
                  <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center group-hover:bg-muted-olive/20 transition-colors">
                    <Plus className="w-6 h-6 text-muted-olive" />
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
            {/* KPI Cards - Updated for new backend data structure */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KPICard
                title="Revenue"
                value={formatCurrency(overview?.keyMetrics?.revenue?.current || 0)}
                change={overview?.keyMetrics?.revenue?.growth}
                icon={DollarSign}
                loading={overviewLoading}
                color="green"
              />
              <KPICard
                title="Orders"
                value={overview?.keyMetrics?.orders?.current || 0}
                change={overview?.keyMetrics?.orders?.growth}
                icon={ShoppingCart}
                loading={overviewLoading}
                color="blue"
              />
              <KPICard
                title="Gross Profit"
                value={formatCurrency(overview?.keyMetrics?.profit?.current || 0)}
                change={overview?.keyMetrics?.profit?.growth}
                icon={TrendingUp}
                loading={overviewLoading}
                color="purple"
              />
              <KPICard
                title="Active Listings"
                value={overview?.businessMetrics?.activeListings || 0}
                icon={Package}
                loading={overviewLoading}
                color="orange"
                alert={(overview?.businessMetrics?.activeListings || 0) === 0}
              />
            </div>

            {/* Business Metrics Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Financial Summary */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Financial Overview
                  </h3>
                  <DollarSign className="w-5 h-5 text-text-muted" />
                </div>
                
                {overviewLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Revenue</span>
                      <span className="font-semibold">
                        {formatCurrency(overview?.financialSummary?.totalRevenue || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Gross Profit</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(overview?.financialSummary?.grossProfit || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Profit Margin</span>
                      <span className="font-semibold">
                        {(overview?.financialSummary?.profitMargin || 0).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Avg Order Value</span>
                      <span className="font-semibold">
                        {formatCurrency(overview?.keyMetrics?.averageOrderValue || 0)}
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Business Health */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Business Health
                  </h3>
                  <Target className="w-5 h-5 text-text-muted" />
                </div>
                
                {overviewLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Products</span>
                      <span className="font-semibold">
                        {overview?.businessMetrics?.totalProducts || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Profitable Products</span>
                      <span className="font-semibold text-green-600">
                        {overview?.businessMetrics?.profitableListings || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Average Rating</span>
                      <span className="font-semibold">
                        {(overview?.businessMetrics?.averageRating || 0).toFixed(1)} ⭐
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Profitability Rate</span>
                      <span className="font-semibold">
                        {overview?.businessMetrics?.profitabilityRate || 0}%
                      </span>
                    </div>
                  </div>
                )}
              </Card>

              {/* Inventory Health */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Inventory Health
                  </h3>
                  <Package className="w-5 h-5 text-text-muted" />
                </div>
                
                {overviewLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-text-muted">Health Score</span>
                      <span className="font-semibold text-blue-600">
                        {overview?.inventoryHealth?.healthScore || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Total Items</span>
                      <span className="font-semibold">
                        {overview?.inventoryHealth?.totalItems || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Low Stock</span>
                      <span className={`font-semibold ${
                        (overview?.inventoryHealth?.lowStockItems || 0) > 0 
                          ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {overview?.inventoryHealth?.lowStockItems || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-muted">Critical Alerts</span>
                      <span className={`font-semibold ${
                        (overview?.inventoryHealth?.criticalAlerts || 0) > 0 
                          ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {overview?.inventoryHealth?.criticalAlerts || 0}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Inventory Alerts & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Inventory Alerts - Updated for new backend structure */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Stock Alerts
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
                    {inventory?.stockAlerts
                      ?.slice(0, 5)
                      .map((alert, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            alert.status === 'out_of_stock'
                              ? 'bg-red-50/80 border-red-200/50'
                              : 'bg-amber-50/80 border-amber-200/50'
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-medium ${
                              alert.status === 'out_of_stock'
                                ? 'text-red-800'
                                : 'text-amber-800'
                            }`}>
                              {alert.productName}
                            </p>
                            <p className={`text-xs ${
                              alert.status === 'out_of_stock'
                                ? 'text-red-600'
                                : 'text-amber-600'
                            }`}>
                              {alert.currentStock} units • Reorder at {alert.reorderLevel}
                            </p>
                          </div>
                          <div className={`text-xs font-medium ${
                            alert.status === 'out_of_stock'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}>
                            {alert.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
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

              {/* Recent Orders - Updated for new backend structure */}
              <Card className="lg:col-span-2 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-dark">
                    Recent Orders
                  </h3>
                  <Link
                    to="/vendor/orders"
                    className="text-muted-olive hover:text-muted-olive/80 text-sm font-medium"
                  >
                    View All
                  </Link>
                </div>

                {orderManagementLoading ? (
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
                    {(overview?.recentActivity?.recentOrders || orderManagement?.orders)
                      ?.slice(0, 5)
                      .map((order) => (
                        <div
                          key={order.id}
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
                                {order.restaurant?.name || order.customerName} •{' '}
                                {timeAgo(order.createdAt || order.orderDate)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-text-dark">
                              {formatCurrency(order.totalAmount || order.total)}
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

            {/* Customer Insights - Updated for new backend structure */}
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
                      {customerInsights?.summary?.totalCustomers || 0}
                    </div>
                    <div className="text-sm text-blue-700">
                      Total Customers
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-green-50">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {formatCurrency(
                        customerInsights?.summary?.averageOrderValue || 0
                      )}
                    </div>
                    <div className="text-sm text-green-700">
                      Avg Order Value
                    </div>
                  </div>

                  <div className="text-center p-4 rounded-xl bg-purple-50">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {customerInsights?.summary?.customerLifetimeValue || 0}
                    </div>
                    <div className="text-sm text-purple-700">
                      Customer LTV
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
