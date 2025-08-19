import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calendar,
  Activity,
  DollarSign,
} from 'lucide-react';
import {
  useGetAdminDashboardOverviewQuery,
  useGetAllApprovalsQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import SystemHealthWidget from '../../components/admin/SystemHealthWidget';

const AdminDashboard = () => {
  const [viewMode, setViewMode] = useState('overview');
  const navigate = useNavigate();

  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetAdminDashboardOverviewQuery();

  // Get pending approvals for real-time metrics
  const {
    data: approvalsData,
    isLoading: isApprovalsLoading,
    error: approvalsError,
  } = useGetAllApprovalsQuery({
    status: 'pending',
    limit: 10,
  });

  const isLoading = isDashboardLoading || isApprovalsLoading;
  const error = dashboardError || approvalsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load dashboard"
        description="There was an error loading the dashboard data. Please try again."
        action={{
          label: 'Retry',
          onClick: refetchDashboard,
        }}
      />
    );
  }

  const metrics = dashboardData?.data || {};
  const pendingApprovals = approvalsData?.data?.approvals || [];
  const approvalMetrics = approvalsData?.data?.summary || {};

  // Calculate urgency metrics for approvals
  const urgentApprovals = pendingApprovals.filter((approval) => {
    const daysWaiting = approval.createdAt
      ? Math.floor(
          (new Date() - new Date(approval.createdAt)) / (1000 * 60 * 60 * 24)
        )
      : 0;
    return daysWaiting > 7;
  }).length;

  const totalPendingApprovals =
    (approvalMetrics.vendor || 0) + (approvalMetrics.restaurant || 0);

  const metricCards = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: metrics.totalUsers || 0,
      change: '+0%', // Backend doesn't provide growth percentages yet
      changeType: 'positive',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'Registered users on platform',
    },
    {
      id: 'total-vendors',
      title: 'Total Vendors',
      value: metrics.totalVendors || 0,
      change: '+0%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-gradient-to-br from-bottle-green to-mint-fresh',
      description: 'All vendors on platform',
    },
    {
      id: 'pending-vendor-approvals',
      title: 'Pending Vendor Approvals',
      value:
        approvalMetrics.vendor || metrics.pendingVerifications?.vendors || 0,
      change: '0',
      changeType:
        (approvalMetrics.vendor || metrics.pendingVerifications?.vendors || 0) >
        5
          ? 'negative'
          : 'positive',
      icon: UserCheck,
      color: 'bg-gradient-to-br from-earthy-yellow to-amber-500',
      description: 'Vendors awaiting approval',
      urgent:
        (approvalMetrics.vendor || metrics.pendingVerifications?.vendors || 0) >
        5,
      clickable: true,
      onClick: () => navigate('/admin/approvals?type=vendor&status=pending'),
    },
    {
      id: 'total-restaurants',
      title: 'Total Restaurants',
      value: metrics.totalRestaurants || 0,
      change: '+0%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'Restaurant partners',
    },
    {
      id: 'pending-restaurant-approvals',
      title: 'Pending Restaurant Approvals',
      value:
        approvalMetrics.restaurant ||
        metrics.pendingVerifications?.restaurants ||
        0,
      change: '0',
      changeType:
        (approvalMetrics.restaurant ||
          metrics.pendingVerifications?.restaurants ||
          0) > 3
          ? 'negative'
          : 'positive',
      icon: UserCheck,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      description: 'Restaurants awaiting approval',
      urgent:
        (approvalMetrics.restaurant ||
          metrics.pendingVerifications?.restaurants ||
          0) > 3,
      clickable: true,
      onClick: () =>
        navigate('/admin/approvals?type=restaurant&status=pending'),
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: metrics.totalOrders || 0,
      change: '+0%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      description: 'All-time orders placed',
    },
    {
      id: 'total-products',
      title: 'Total Products',
      value: metrics.totalProducts || 0,
      change: '+0%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      description: 'Products in catalog',
    },
    {
      id: 'total-listings',
      title: 'Total Listings',
      value: metrics.totalListings || 0,
      change: '+0%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      description: 'Active product listings',
    },
    // Urgent Approvals Card (only show if there are urgent approvals)
    ...(urgentApprovals > 0
      ? [
          {
            id: 'urgent-approvals',
            title: 'Urgent Approvals',
            value: urgentApprovals,
            change: '7+ days waiting',
            changeType: 'negative',
            icon: AlertTriangle,
            color: 'bg-gradient-to-br from-tomato-red to-red-600',
            description: 'Applications waiting > 7 days',
            urgent: true,
            clickable: true,
            onClick: () => navigate('/admin/approvals?status=pending'),
          },
        ]
      : []),
  ];

  const recentActivity = metrics.recentOrders || [];
  const ordersByStatus = metrics.ordersByStatus || {};

  return (
    <div className="px-8 py-6 space-y-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Monitor and manage your Aaroth Fresh platform
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {totalPendingApprovals > 0 && (
            <button
              onClick={() => navigate('/admin/users/approvals')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                urgentApprovals > 0
                  ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Review Approvals ({totalPendingApprovals})
              {urgentApprovals > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-tomato-red text-white text-xs rounded-full">
                  {urgentApprovals} urgent
                </span>
              )}
            </button>
          )}
          <button
            onClick={() => navigate('/admin/analytics')}
            className="bg-gradient-secondary text-white px-6 py-2 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 min-h-[44px]"
          >
            View Reports
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <div
            key={metric.id}
            className={`relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-200 ${
              metric.urgent ? 'ring-2 ring-amber-200 bg-amber-50/50' : ''
            } ${
              metric.clickable ? 'cursor-pointer hover:border-gray-300' : ''
            }`}
            onClick={metric.clickable ? metric.onClick : undefined}
          >
            <div className="p-6">
              {/* Icon and Values */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-3">
                    {typeof metric.value === 'number'
                      ? metric.value.toLocaleString()
                      : metric.value}
                  </p>

                  {/* Change Indicator */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded-full ${
                        metric.changeType === 'positive'
                          ? 'bg-mint-fresh/20 text-bottle-green'
                          : metric.changeType === 'negative'
                            ? 'bg-tomato-red/20 text-tomato-red'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {metric.change}
                    </span>
                    {metric.urgent && (
                      <span className="text-xs bg-earthy-yellow/20 text-earthy-brown px-2 py-1 rounded-full font-medium">
                        Needs Attention
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    metric.urgent
                      ? 'bg-amber-100 text-amber-600'
                      : metric.color.includes('bottle-green')
                        ? 'bg-green-100 text-green-600'
                        : metric.color.includes('mint-fresh')
                          ? 'bg-emerald-100 text-emerald-600'
                          : metric.color.includes('earthy-brown')
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                  } group-hover:scale-105 transition-transform duration-200`}
                >
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mt-4">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Pipeline Section */}
      {pendingApprovals.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-earthy-yellow rounded-full animate-pulse" />
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Approval Pipeline
              </h3>
              <span className="px-2 py-1 bg-earthy-yellow/20 text-earthy-brown text-sm rounded-full font-medium">
                {pendingApprovals.length} pending
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/admin/approvals')}
              className="text-sm"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {pendingApprovals.slice(0, 5).map((approval, index) => {
              const daysWaiting = approval.createdAt
                ? Math.floor(
                    (new Date() - new Date(approval.createdAt)) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
              const isUrgent = daysWaiting > 7;

              return (
                <div
                  key={approval._id || index}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer ${
                    isUrgent
                      ? 'border-tomato-red/30 bg-tomato-red/5 hover:bg-tomato-red/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => navigate('/admin/approvals')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {approval.type === 'vendor' ? (
                      <Store className="w-4 h-4 text-green-600" />
                    ) : (
                      <Utensils className="w-4 h-4 text-blue-600" />
                    )}
                    <span className="text-sm font-medium text-text-dark dark:text-white capitalize">
                      {approval.type}
                    </span>
                    {isUrgent && (
                      <AlertTriangle className="w-4 h-4 text-tomato-red" />
                    )}
                  </div>

                  <h4 className="font-semibold text-text-dark dark:text-white mb-1 truncate">
                    {approval.businessName ||
                      approval.name ||
                      'Unknown Business'}
                  </h4>

                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    <span
                      className={isUrgent ? 'text-tomato-red font-medium' : ''}
                    >
                      {daysWaiting === 0 ? 'Today' : `${daysWaiting} days`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* System Health & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Statistics */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-mint-fresh rounded-full animate-pulse" />
            Order Statistics
          </h3>

          <div className="space-y-4">
            {Object.entries(ordersByStatus).length > 0 ? (
              Object.entries(ordersByStatus).map(([status, data]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-text-muted text-sm capitalize">
                    {status.replace(/_/g, ' ')}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-medium text-text-dark dark:text-white">
                      {data.count || 0} orders
                    </span>
                    {data.totalAmount && (
                      <p className="text-xs text-text-muted">
                        ${data.totalAmount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm text-center py-8">
                No order statistics available
              </div>
            )}
          </div>
        </Card>

        {/* System Health */}
        <SystemHealthWidget />

        {/* Recent Orders */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Recent Orders
          </h3>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((order, index) => (
                <div
                  key={order._id || index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="w-2 h-2 bg-bottle-green rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-dark dark:text-white">
                      Order from{' '}
                      {order.restaurantId?.name || 'Unknown Restaurant'}
                    </p>
                    <p className="text-xs text-text-muted">
                      ${order.totalAmount?.toLocaleString() || '0'} •{' '}
                      {order.placedBy?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : 'Recently'}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'confirmed'
                        ? 'bg-mint-fresh/20 text-bottle-green'
                        : order.status === 'pending_approval'
                          ? 'bg-earthy-yellow/20 text-earthy-brown'
                          : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {order.status?.replace(/_/g, ' ') || 'pending'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm text-center py-8">
                No recent orders to display
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
