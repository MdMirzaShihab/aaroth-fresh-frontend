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
  Package,
  DollarSign,
  RefreshCw,
  XCircle,
  Calendar,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  useGetAdminVendorsUnifiedQuery,
  useGetAdminRestaurantsUnifiedQuery,
  useGetAdminDashboardOverviewQuery,
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

/**
 * VerificationDashboard - Comprehensive overview using unified API endpoints
 */
const VerificationDashboard = () => {
  const navigate = useNavigate();

  // Fetch data from unified endpoints
  const {
    data: vendorsData,
    isLoading: vendorsLoading,
    error: vendorsError,
    refetch: refetchVendors,
  } = useGetAdminVendorsUnifiedQuery({ status: 'pending', limit: 1 });

  const {
    data: restaurantsData,
    isLoading: restaurantsLoading,
    error: restaurantsError,
    refetch: refetchRestaurants,
  } = useGetAdminRestaurantsUnifiedQuery({ status: 'pending', limit: 1 });

  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetAdminDashboardOverviewQuery();

  // Loading and error states
  const isLoading = vendorsLoading || restaurantsLoading || dashboardLoading;
  const hasError = vendorsError || restaurantsError || dashboardError;

  // Handle refresh
  const handleRefreshAll = () => {
    refetchVendors();
    refetchRestaurants();
    refetchDashboard();
  };

  // Process combined statistics
  const vendorStats = vendorsData?.stats || {};
  const restaurantStats = restaurantsData?.stats || {};
  const overview = dashboardData?.data || {};

  // Calculate combined metrics
  const combinedStats = {
    // Business totals from API stats
    totalVendors: vendorStats.totalVendors || 0,
    totalRestaurants: restaurantStats.totalRestaurants || 0,
    totalBusinesses: (vendorStats.totalVendors || 0) + (restaurantStats.totalRestaurants || 0),
    
    // Verification status breakdowns
    pendingVendors: vendorStats.pendingVendors || 0,
    approvedVendors: vendorStats.approvedVendors || 0,
    rejectedVendors: vendorStats.rejectedVendors || 0,
    
    pendingRestaurants: restaurantStats.pendingRestaurants || 0,
    approvedRestaurants: restaurantStats.approvedRestaurants || 0,
    rejectedRestaurants: restaurantStats.rejectedRestaurants || 0,
    
    // Combined pending approvals
    totalPending: (vendorStats.pendingVendors || 0) + (restaurantStats.pendingRestaurants || 0),
    totalApproved: (vendorStats.approvedVendors || 0) + (restaurantStats.approvedRestaurants || 0),
    totalRejected: (vendorStats.rejectedVendors || 0) + (restaurantStats.rejectedRestaurants || 0),
    
    // Dashboard overview data
    activeUsers: overview.users?.activeUsers || 0,
    newUsersToday: overview.users?.newUsersToday || 0,
    totalProducts: overview.products?.totalProducts || 0,
    activeListings: overview.products?.activeListings || 0,
    todayRevenue: overview.orders?.revenueToday || 0,
    totalRevenue: overview.orders?.totalRevenue || 0,
    todayOrders: overview.orders?.todayOrders || 0,
  };

  // Calculate verification rates
  const vendorVerificationRate = combinedStats.totalVendors > 0 
    ? Math.round((combinedStats.approvedVendors / combinedStats.totalVendors) * 100)
    : 0;
    
  const restaurantVerificationRate = combinedStats.totalRestaurants > 0
    ? Math.round((combinedStats.approvedRestaurants / combinedStats.totalRestaurants) * 100)
    : 0;
    
  const overallVerificationRate = combinedStats.totalBusinesses > 0
    ? Math.round((combinedStats.totalApproved / combinedStats.totalBusinesses) * 100)
    : 0;

  // Recent activity from dashboard
  const recentActivities = overview.recentActivity || [];

  // Format time for recent activity
  const formatActivityTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours === 0) return 'Just now';
      if (diffInHours === 1) return '1 hour ago';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return '1 day ago';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-tomato-red/5 rounded-2xl border border-tomato-red/20 max-w-md">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-tomato-red mb-2">
            Failed to load dashboard
          </h2>
          <p className="text-text-muted mb-4">
            Unable to fetch verification data. Please check your connection and try again.
          </p>
          <Button
            onClick={handleRefreshAll}
            className="bg-tomato-red text-white hover:bg-tomato-red/90"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Define stat cards with real data
  const statCards = [
    {
      title: 'Total Businesses',
      value: combinedStats.totalBusinesses,
      icon: Store,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: `${combinedStats.totalVendors} vendors, ${combinedStats.totalRestaurants} restaurants`,
    },
    {
      title: 'Pending Approvals',
      value: combinedStats.totalPending,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      urgent: combinedStats.totalPending > 5,
      description: 'Businesses awaiting verification',
    },
    {
      title: 'Approved Businesses',
      value: combinedStats.totalApproved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      percentage: overallVerificationRate,
      description: `${overallVerificationRate}% verification rate`,
    },
    {
      title: 'Rejected Applications',
      value: combinedStats.totalRejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Applications requiring resubmission',
    },
    {
      title: 'Active Users',
      value: combinedStats.activeUsers,
      icon: Users,
      color: 'text-muted-olive',
      bgColor: 'bg-sage-green/20',
      trend: combinedStats.newUsersToday,
      description: `${combinedStats.newUsersToday} new today`,
    },
    {
      title: 'Products & Listings',
      value: combinedStats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: `${combinedStats.activeListings} active listings`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-medium text-text-dark mb-2">
              Verification Dashboard
            </h1>
            <p className="text-text-muted">
              Real-time overview of business verification status and platform metrics
            </p>
          </div>
          <Button
            onClick={handleRefreshAll}
            className="flex items-center gap-2 px-4 py-2 bg-earthy-yellow/20 hover:bg-earthy-yellow/30 text-earthy-brown rounded-xl font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-soft hover:shadow-lg transition-all duration-300 ${
                  stat.urgent ? 'ring-2 ring-amber-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  {stat.urgent && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                      Needs Attention
                    </span>
                  )}
                </div>
                
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-text-muted mb-1">
                    {stat.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-text-dark">
                      {stat.value.toLocaleString()}
                    </span>
                    {stat.percentage !== undefined && (
                      <span className="text-sm font-medium text-green-600">
                        ({stat.percentage}%)
                      </span>
                    )}
                    {stat.trend !== undefined && stat.trend > 0 && (
                      <span className="text-sm font-medium text-green-600">
                        +{stat.trend}
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-text-muted">{stat.description}</p>
              </Card>
            );
          })}
        </div>

        {/* Verification Rates and Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Overall Verification Rate */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-olive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-dark">
                  Overall Verification Rate
                </h2>
                <p className="text-text-muted">
                  Business verification success rate
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
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
                    className="text-muted-olive"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-text-dark">
                    {overallVerificationRate}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-text-muted">
                  {combinedStats.totalApproved} of {combinedStats.totalBusinesses} businesses verified
                </p>
                <div className="flex justify-center gap-4 text-sm">
                  <span className="text-green-600 font-medium">
                    Vendors: {vendorVerificationRate}%
                  </span>
                  <span className="text-blue-600 font-medium">
                    Restaurants: {restaurantVerificationRate}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Revenue & Orders Overview */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-dark">
                  Revenue Overview
                </h2>
                <p className="text-text-muted">Platform financial metrics</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div>
                  <p className="text-sm text-text-muted">Total Revenue</p>
                  <p className="text-2xl font-semibold text-green-600">
                    ${combinedStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div>
                  <p className="text-sm text-text-muted">Today's Revenue</p>
                  <p className="text-xl font-semibold text-blue-600">
                    ${combinedStats.todayRevenue.toLocaleString()}
                  </p>
                </div>
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="text-sm text-text-muted">Today's Orders</p>
                  <p className="text-xl font-semibold text-purple-600">
                    {combinedStats.todayOrders}
                  </p>
                </div>
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-dark">
                Recent Activity
              </h2>
              <p className="text-text-muted">Latest system activities and verification updates</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 10).map((activity, index) => (
                <div
                  key={activity._id || index}
                  className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-muted-olive/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-muted-olive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-dark mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-text-muted">
                      <span>{activity.userName || 'System'}</span>
                      <span>•</span>
                      <span>{formatActivityTime(activity.timestamp)}</span>
                      {activity.type && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-muted">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-dark mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/admin/approvals')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-amber-50 transition-colors duration-200 text-left bg-transparent border border-amber-200 text-text-dark hover:text-amber-700 hover:border-amber-300"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Review Pending</div>
                <div className="text-sm text-text-muted">
                  {combinedStats.totalPending} applications
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/admin/vendor-management')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-green-50 transition-colors duration-200 text-left bg-transparent border border-green-200 text-text-dark hover:text-green-700 hover:border-green-300"
            >
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Manage Vendors</div>
                <div className="text-sm text-text-muted">
                  {combinedStats.totalVendors} vendors
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/admin/restaurant-management')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-blue-50 transition-colors duration-200 text-left bg-transparent border border-blue-200 text-text-dark hover:text-blue-700 hover:border-blue-300"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">Manage Restaurants</div>
                <div className="text-sm text-text-muted">
                  {combinedStats.totalRestaurants} restaurants
                </div>
              </div>
            </Button>

            <Button
              onClick={() => navigate('/admin/analytics')}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-purple-50 transition-colors duration-200 text-left bg-transparent border border-purple-200 text-text-dark hover:text-purple-700 hover:border-purple-300"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-center">
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-text-muted">
                  Detailed insights
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