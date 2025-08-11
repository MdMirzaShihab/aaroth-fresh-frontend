import React from 'react';
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
  Calendar
} from 'lucide-react';
import { useGetRestaurantOrdersQuery, useGetRestaurantAnalyticsQuery } from '../../store/slices/apiSlice';
import { selectAuth } from '../../store/slices/authSlice';
import { formatCurrency, formatDate, timeAgo } from '../../utils';

const RestaurantDashboard = () => {
  const { user } = useSelector(selectAuth);
  
  // Fetch restaurant orders and analytics
  const { data: orders = [], isLoading: ordersLoading } = useGetRestaurantOrdersQuery({
    limit: 5,
    status: 'recent'
  });
  
  const { data: analytics = {}, isLoading: analyticsLoading } = useGetRestaurantAnalyticsQuery();

  // Quick stats data
  const quickStats = [
    {
      title: 'Active Orders',
      value: analytics.activeOrders || 0,
      icon: ShoppingCart,
      color: 'bg-gradient-primary',
      textColor: 'text-white',
      change: analytics.ordersChange || 0,
      trend: 'up'
    },
    {
      title: 'This Month',
      value: formatCurrency(analytics.monthlySpending || 0),
      icon: TrendingUp,
      color: 'bg-gradient-secondary',
      textColor: 'text-white',
      change: analytics.spendingChange || 0,
      trend: analytics.spendingChange >= 0 ? 'up' : 'down'
    },
    {
      title: 'Saved This Week',
      value: formatCurrency(analytics.weeklySavings || 0),
      icon: Package,
      color: 'bg-mint-fresh/10',
      textColor: 'text-bottle-green',
      change: analytics.savingsChange || 0,
      trend: 'up'
    },
    {
      title: 'Avg Delivery Time',
      value: `${analytics.avgDeliveryTime || 0} min`,
      icon: Clock,
      color: 'bg-earthy-yellow/10',
      textColor: 'text-earthy-brown',
      change: analytics.deliveryChange || 0,
      trend: analytics.deliveryChange <= 0 ? 'up' : 'down'
    }
  ];

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-mint-fresh/20 text-bottle-green',
      cancelled: 'bg-tomato-red/10 text-tomato-red'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Package,
      delivered: CheckCircle,
      cancelled: AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Welcome back, {user?.restaurantName || user?.name}
          </h1>
          <p className="text-text-muted mt-2">
            Manage your restaurant orders and track your savings
          </p>
        </div>
        <Link
          to="/restaurant/browse"
          className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 hover:shadow-lg transition-all duration-200 touch-target"
        >
          <Plus className="w-5 h-5" />
          Browse Products
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="glass rounded-3xl p-6 hover:shadow-soft transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className={`${stat.color} p-3 rounded-2xl`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-mint-fresh' : 'text-tomato-red'
                  }`}>
                    <TrendingUp className={`w-4 h-4 ${
                      stat.trend === 'down' ? 'rotate-180' : ''
                    }`} />
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-text-dark">{stat.value}</p>
                <p className="text-text-muted text-sm mt-1">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-dark">Recent Orders</h2>
            <Link
              to="/restaurant/orders"
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
            ) : orders.length > 0 ? (
              orders.map((order) => (
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
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-text-muted text-sm">
                          {order.items?.length || 0} items • {timeAgo(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-xl text-sm font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                      <p className="font-semibold text-text-dark">
                        {formatCurrency(order.totalAmount)}
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
                  Start by browsing our fresh products
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/restaurant/browse"
                className="w-full bg-gradient-primary text-white p-4 rounded-2xl font-medium flex items-center gap-3 hover:shadow-lg transition-all duration-200 touch-target"
              >
                <ShoppingCart className="w-5 h-5" />
                Browse Products
              </Link>
              <Link
                to="/restaurant/orders"
                className="w-full bg-white border border-gray-200 text-text-dark p-4 rounded-2xl font-medium flex items-center gap-3 hover:border-bottle-green/30 transition-all duration-200 touch-target"
              >
                <Package className="w-5 h-5" />
                View All Orders
              </Link>
              <Link
                to="/restaurant/profile"
                className="w-full bg-white border border-gray-200 text-text-dark p-4 rounded-2xl font-medium flex items-center gap-3 hover:border-bottle-green/30 transition-all duration-200 touch-target"
              >
                <Calendar className="w-5 h-5" />
                Update Profile
              </Link>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-text-dark mb-4">This Week</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Orders Placed</span>
                <span className="font-semibold text-text-dark">
                  {analytics.weeklyOrders || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Amount Spent</span>
                <span className="font-semibold text-text-dark">
                  {formatCurrency(analytics.weeklySpending || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Money Saved</span>
                <span className="font-semibold text-mint-fresh">
                  {formatCurrency(analytics.weeklySavings || 0)}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-dark">Savings Rate</span>
                  <span className="text-sm font-semibold text-mint-fresh">
                    {analytics.savingsRate || 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Favorite Vendors */}
          {analytics.favoriteVendors && analytics.favoriteVendors.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-text-dark mb-4">Favorite Vendors</h3>
              <div className="space-y-3">
                {analytics.favoriteVendors.slice(0, 3).map((vendor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {vendor.name?.charAt(0) || 'V'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-text-dark text-sm">{vendor.name}</p>
                      <p className="text-text-muted text-xs">{vendor.orderCount} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-text-dark">
                        {formatCurrency(vendor.totalSpent)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;