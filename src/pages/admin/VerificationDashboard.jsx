import React from 'react';
import {
  TrendingUp,
  Users,
  Store,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useGetVerificationStatsQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

/**
 * VerificationDashboard - Overview of business verification metrics and stats
 */
const VerificationDashboard = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useGetVerificationStatsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-tomato-red/5 rounded-2xl border border-tomato-red/20">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-tomato-red mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-text-muted">
            Please refresh the page and try again
          </p>
        </div>
      </div>
    );
  }

  const metrics = stats?.data || {};

  const statCards = [
    {
      title: 'Total Vendors',
      value: metrics.totalVendors || 0,
      icon: Store,
      color: 'bottle-green',
      bgColor: 'mint-fresh/20',
      trend: metrics.vendorGrowth,
    },
    {
      title: 'Verified Vendors',
      value: metrics.verifiedVendors || 0,
      icon: CheckCircle,
      color: 'bottle-green',
      bgColor: 'mint-fresh/20',
      percentage: metrics.totalVendors
        ? Math.round((metrics.verifiedVendors / metrics.totalVendors) * 100)
        : 0,
    },
    {
      title: 'Total Restaurants',
      value: metrics.totalRestaurants || 0,
      icon: Users,
      color: 'earthy-brown',
      bgColor: 'earthy-beige/40',
      trend: metrics.restaurantGrowth,
    },
    {
      title: 'Verified Restaurants',
      value: metrics.verifiedRestaurants || 0,
      icon: CheckCircle,
      color: 'earthy-brown',
      bgColor: 'earthy-beige/40',
      percentage: metrics.totalRestaurants
        ? Math.round(
            (metrics.verifiedRestaurants / metrics.totalRestaurants) * 100
          )
        : 0,
    },
    {
      title: 'Pending Applications',
      value: metrics.pendingApprovals || 0,
      icon: Clock,
      color: 'amber-600',
      bgColor: 'amber-50/80',
      urgent: (metrics.pendingApprovals || 0) > 10,
    },
    {
      title: 'New This Month',
      value: metrics.newThisMonth || 0,
      icon: TrendingUp,
      color: 'bottle-green',
      bgColor: 'mint-fresh/20',
      trend: metrics.monthlyGrowth,
    },
  ];

  const overallVerificationRate =
    metrics.totalVendors && metrics.totalRestaurants
      ? Math.round(
          ((metrics.verifiedVendors + metrics.verifiedRestaurants) /
            (metrics.totalVendors + metrics.totalRestaurants)) *
            100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-text-dark mb-2">
            Verification Dashboard
          </h1>
          <p className="text-text-muted">
            Overview of business verification status and metrics
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="bg-gradient-glass backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-soft hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 bg-${stat.bgColor} rounded-2xl flex items-center justify-center`}
                  >
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-text-dark">
                      {stat.value.toLocaleString()}
                    </div>
                    {stat.percentage !== undefined && (
                      <div className="text-sm text-text-muted">
                        {stat.percentage}% verified
                      </div>
                    )}
                    {stat.trend && (
                      <div
                        className={`text-xs ${stat.trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {stat.trend > 0 ? '+' : ''}
                        {stat.trend}% from last month
                      </div>
                    )}
                    {stat.urgent && (
                      <div className="text-xs text-amber-600 font-medium">
                        Needs attention
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-text-muted">
                  {stat.title}
                </h3>
              </Card>
            );
          })}
        </div>

        {/* Verification Rate Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-bottle-green" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-dark">
                  Overall Verification Rate
                </h2>
                <p className="text-text-muted">
                  Percentage of verified businesses
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${overallVerificationRate * 2.51} 251`}
                    className="text-bottle-green"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-text-dark">
                    {overallVerificationRate}%
                  </span>
                </div>
              </div>
              <p className="text-text-muted">
                {metrics.verifiedVendors + metrics.verifiedRestaurants} of{' '}
                {metrics.totalVendors + metrics.totalRestaurants} businesses
                verified
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-dark">
                  Recent Activity
                </h2>
                <p className="text-text-muted">Latest verification updates</p>
              </div>
            </div>

            <div className="space-y-4">
              {metrics.recentActivity?.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'verified'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {activity.type === 'verified' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-dark font-medium">
                      {activity.message}
                    </p>
                    <p className="text-xs text-text-muted">{activity.time}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-4 text-text-muted">
                  No recent activity
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/approval-management-new')}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-mint-fresh/10 transition-colors duration-200 text-left bg-transparent border-0 text-text-dark hover:text-bottle-green"
            >
              <Store className="w-5 h-5 text-bottle-green" />
              <div>
                <div className="font-medium">Review Applications</div>
                <div className="text-sm text-text-muted">
                  Manage pending verifications
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/admin/vendors')}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-earthy-beige/20 transition-colors duration-200 text-left bg-transparent border-0 text-text-dark hover:text-earthy-brown"
            >
              <Users className="w-5 h-5 text-earthy-brown" />
              <div>
                <div className="font-medium">Manage Vendors</div>
                <div className="text-sm text-text-muted">
                  View all vendor businesses
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/admin/restaurants')}
              className="flex items-center gap-3 p-4 rounded-2xl hover:bg-blue-50 transition-colors duration-200 text-left bg-transparent border-0 text-text-dark hover:text-blue-600"
            >
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-text-muted">
                  Detailed verification analytics
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VerificationDashboard;
