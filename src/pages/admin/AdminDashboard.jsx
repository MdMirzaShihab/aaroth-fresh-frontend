import React from 'react';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { useGetAdminDashboardQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';

const AdminDashboard = () => {
  const {
    data: dashboardData,
    isLoading,
    error,
    refetch,
  } = useGetAdminDashboardQuery();

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
          onClick: refetch,
        }}
      />
    );
  }

  const metrics = dashboardData?.data || {};

  const metricCards = [
    {
      id: 'total-users',
      title: 'Total Users',
      value: metrics.totalUsers || 0,
      change: metrics.userGrowth || '+0%',
      changeType: 'positive',
      icon: Users,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      description: 'Registered users on platform',
    },
    {
      id: 'active-vendors',
      title: 'Active Vendors',
      value: metrics.activeVendors || 0,
      change: metrics.vendorGrowth || '+0%',
      changeType: 'positive',
      icon: Package,
      color: 'bg-gradient-to-br from-bottle-green to-mint-fresh',
      description: 'Approved and active vendors',
    },
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      value: metrics.pendingApprovals || 0,
      change: metrics.approvalChange || '0',
      changeType: metrics.approvalChange?.startsWith('+')
        ? 'negative'
        : 'positive',
      icon: UserCheck,
      color: 'bg-gradient-to-br from-earthy-yellow to-amber-500',
      description: 'Vendors awaiting approval',
      urgent: (metrics.pendingApprovals || 0) > 10,
    },
    {
      id: 'restaurants',
      title: 'Restaurants',
      value: metrics.totalRestaurants || 0,
      change: metrics.restaurantGrowth || '+0%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      description: 'Restaurant partners',
    },
    {
      id: 'total-orders',
      title: 'Total Orders',
      value: metrics.totalOrders || 0,
      change: metrics.orderGrowth || '+0%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      description: 'All-time orders placed',
    },
    {
      id: 'inactive-users',
      title: 'Inactive Users',
      value: metrics.inactiveUsers || 0,
      change: metrics.inactiveChange || '0',
      changeType: 'neutral',
      icon: UserX,
      color: 'bg-gradient-to-br from-gray-500 to-gray-600',
      description: "Users who haven't logged in recently",
    },
  ];

  const recentActivity = dashboardData?.data?.recentActivity || [];
  const systemHealth = dashboardData?.data?.systemHealth || {};

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-text-muted mt-1">
            Monitor and manage your Aaroth Fresh platform
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          {(metrics.pendingApprovals || 0) > 0 && (
            <button className="bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown px-4 py-2 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 min-h-[44px]">
              <UserCheck className="w-4 h-4" />
              Review Approvals ({metrics.pendingApprovals})
            </button>
          )}
          <button className="bg-gradient-secondary text-white px-6 py-2 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 min-h-[44px]">
            View Reports
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards.map((metric) => (
          <Card
            key={metric.id}
            className={`relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${
              metric.urgent ? 'ring-2 ring-earthy-yellow/30' : ''
            }`}
          >
            <div className="p-6">
              {/* Icon and Values */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-text-muted text-sm font-medium mb-1">
                    {metric.title}
                  </p>
                  <p className="text-3xl font-bold text-text-dark dark:text-white mb-2">
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
                  className={`w-12 h-12 rounded-2xl ${metric.color} flex items-center justify-center text-white shadow-lg`}
                >
                  <metric.icon className="w-6 h-6" />
                </div>
              </div>

              {/* Description */}
              <p className="text-text-muted text-xs mt-4">
                {metric.description}
              </p>
            </div>

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </Card>
        ))}
      </div>

      {/* System Health & Recent Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-mint-fresh rounded-full animate-pulse" />
            System Health
          </h3>

          <div className="space-y-4">
            {Object.entries(systemHealth).length > 0 ? (
              Object.entries(systemHealth).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-text-muted text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      value === 'healthy' || value === 'good'
                        ? 'bg-mint-fresh/20 text-bottle-green'
                        : value === 'warning'
                          ? 'bg-earthy-yellow/20 text-earthy-brown'
                          : 'bg-tomato-red/20 text-tomato-red'
                    }`}
                  >
                    {typeof value === 'string' ? value : 'Normal'}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm text-center py-8">
                System health data not available
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Recent Activity
          </h3>

          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="w-2 h-2 bg-bottle-green rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text-dark dark:text-white">
                      {activity.description || 'System activity'}
                    </p>
                    <p className="text-xs text-text-muted">
                      {activity.timestamp
                        ? new Date(activity.timestamp).toLocaleString()
                        : 'Recently'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-text-muted text-sm text-center py-8">
                No recent activity to display
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
