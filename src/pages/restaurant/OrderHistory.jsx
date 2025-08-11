import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Truck,
  ShoppingCart,
  MapPin,
  Repeat
} from 'lucide-react';
import { useGetRestaurantOrdersQuery } from '../../store/slices/apiSlice';
import { formatCurrency, formatDate, timeAgo, debounce } from '../../utils';

const OrderHistory = () => {
  const navigate = useNavigate();

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // API query
  const { data: orders = [], isLoading, error, refetch } = useGetRestaurantOrdersQuery({
    search: searchQuery,
    status: statusFilter,
    dateRange,
    sortBy,
    limit: 100
  });

  // Debounced search
  const debouncedSearch = useMemo(
    () => debounce((value) => setSearchQuery(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: Clock,
        label: 'Pending'
      },
      confirmed: {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: CheckCircle,
        label: 'Confirmed'
      },
      processing: {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Package,
        label: 'Processing'
      },
      shipped: {
        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        icon: Truck,
        label: 'Shipped'
      },
      delivered: {
        color: 'bg-mint-fresh/20 text-bottle-green border-mint-fresh/30',
        icon: CheckCircle,
        label: 'Delivered'
      },
      cancelled: {
        color: 'bg-tomato-red/10 text-tomato-red border-tomato-red/30',
        icon: AlertCircle,
        label: 'Cancelled'
      }
    };
    return configs[status] || configs.pending;
  };

  const OrderCard = ({ order }) => {
    const statusConfig = getStatusConfig(order.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="glass rounded-3xl p-6 hover:shadow-soft transition-all duration-200">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text-dark">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-text-muted mt-1">
              {formatDate(order.createdAt)} • {timeAgo(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-sm font-medium border flex items-center gap-1 ${statusConfig.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white/50 border border-gray-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-text-dark">
              {order.items?.length || 0} items
            </span>
            <span className="text-sm text-text-muted">
              {order.vendorsCount > 1 && `from ${order.vendorsCount} vendors`}
            </span>
          </div>
          
          {order.items && order.items.length > 0 && (
            <div className="space-y-2">
              {order.items.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-text-muted truncate">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium text-text-dark">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-sm text-text-muted/70 text-center pt-2 border-t border-gray-100">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>
          )}
        </div>

        {/* Delivery Info */}
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 mb-4 text-sm">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-text-muted line-clamp-2">
              {order.deliveryAddress}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-lg font-bold text-text-dark">
              {formatCurrency(order.totalAmount)}
            </p>
            {order.savedAmount && order.savedAmount > 0 && (
              <p className="text-sm text-mint-fresh">
                Saved {formatCurrency(order.savedAmount)}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {order.status === 'delivered' && (
              <button className="text-bottle-green hover:text-bottle-green/80 text-sm font-medium flex items-center gap-1 transition-colors">
                <Repeat className="w-4 h-4" />
                Reorder
              </button>
            )}
            <button
              onClick={() => navigate(`/restaurant/orders/${order._id}`)}
              className="bg-gradient-primary/10 text-bottle-green px-4 py-2 rounded-xl font-medium hover:bg-gradient-primary/20 transition-all duration-200 flex items-center gap-1 touch-target"
            >
              <Eye className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Order History</h1>
          <p className="text-text-muted mt-2">
            Track all your orders and reorder favorites
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {/* Export functionality */}}
            className="bg-white border border-gray-200 text-text-dark px-4 py-2 rounded-2xl font-medium hover:border-bottle-green/30 transition-all duration-200 flex items-center gap-2 touch-target"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => navigate('/restaurant/browse')}
            className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
          >
            Browse Products
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by number, items, or vendor..."
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Range */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">Last 3 Months</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bottle-green/20 focus:border-bottle-green transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Amount: High to Low</option>
              <option value="amount-low">Amount: Low to High</option>
            </select>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-2xl border transition-all duration-200 touch-target ${
                showFilters 
                  ? 'bg-bottle-green text-white border-bottle-green' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-bottle-green/30'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Order Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-text-dark">{orders.length}</p>
            <p className="text-sm text-text-muted">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-dark">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
            <p className="text-sm text-text-muted">Delivered</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-text-dark">
              {formatCurrency(orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0))}
            </p>
            <p className="text-sm text-text-muted">Total Spent</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-mint-fresh">
              {formatCurrency(orders.reduce((sum, o) => sum + (o.savedAmount || 0), 0))}
            </p>
            <p className="text-sm text-text-muted">Total Saved</p>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-3xl"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-tomato-red mb-4">
              <AlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-text-muted mb-4">Failed to load orders</p>
            <button 
              onClick={() => refetch()}
              className="bg-gradient-primary text-white px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200"
            >
              Try Again
            </button>
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="glass rounded-3xl p-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">
                No orders found
              </h3>
              <p className="text-text-muted mb-8">
                {searchQuery || statusFilter || dateRange !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : "You haven't placed any orders yet"
                }
              </p>
              <button
                onClick={() => navigate('/restaurant/browse')}
                className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 touch-target"
              >
                Browse Products
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Load More */}
      {orders.length > 0 && orders.length % 20 === 0 && (
        <div className="text-center">
          <button className="bg-white border border-gray-200 text-text-dark px-8 py-3 rounded-2xl font-medium hover:border-bottle-green/30 transition-all duration-200 touch-target">
            Load More Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;