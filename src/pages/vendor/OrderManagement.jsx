import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Package, 
  Search, 
  Filter,
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  Eye,
  MoreVertical,
  Bell,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import {
  useGetVendorOrdersQuery,
  useGetVendorOrderAnalyticsQuery,
  useGetOrderNotificationsQuery,
  useUpdateOrderStatusWorkflowMutation,
  useBulkUpdateOrderStatusMutation,
  useMarkNotificationAsReadMutation
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const OrderManagement = () => {
  const dispatch = useDispatch();
  
  // State for search, filters, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');

  // Derived query parameters
  const queryParams = useMemo(() => ({
    page: currentPage,
    limit: 15,
    search: searchTerm || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    sortBy,
    sortOrder,
    timeRange
  }), [currentPage, searchTerm, statusFilter, sortBy, sortOrder, timeRange]);

  // API queries with polling
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useGetVendorOrdersQuery(queryParams);

  const {
    data: analyticsData,
    isLoading: analyticsLoading
  } = useGetVendorOrderAnalyticsQuery({ timeRange });

  const {
    data: notificationsData,
    isLoading: notificationsLoading
  } = useGetOrderNotificationsQuery();

  // Mutations
  const [updateOrderStatus] = useUpdateOrderStatusWorkflowMutation();
  const [bulkUpdateOrderStatus] = useBulkUpdateOrderStatusMutation();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();

  // Order status configuration
  const orderStatuses = [
    { value: 'pending', label: 'Pending', color: 'text-orange-600 bg-orange-50', icon: Clock },
    { value: 'confirmed', label: 'Confirmed', color: 'text-blue-600 bg-blue-50', icon: CheckCircle },
    { value: 'prepared', label: 'Prepared', color: 'text-purple-600 bg-purple-50', icon: Package },
    { value: 'shipped', label: 'Shipped', color: 'text-indigo-600 bg-indigo-50', icon: Truck },
    { value: 'delivered', label: 'Delivered', color: 'text-bottle-green bg-mint-fresh/20', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelled', color: 'text-tomato-red bg-tomato-red/20', icon: AlertCircle }
  ];

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Handle order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === ordersData?.data?.orders?.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ordersData?.data?.orders?.map(order => order.id) || []);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status) => {
    try {
      await bulkUpdateOrderStatus({
        orderIds: selectedOrders,
        status,
        notes: `Bulk updated to ${status}`
      }).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Bulk Update Successful',
        message: `${selectedOrders.length} orders updated to ${status}`
      }));
      
      setSelectedOrders([]);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Bulk Update Failed',
        message: error.data?.message || 'Failed to update orders'
      }));
    }
  };

  // Handle individual status update
  const handleStatusUpdate = async (orderId, status, notes = '') => {
    try {
      await updateOrderStatus({
        id: orderId,
        status,
        notes,
        estimatedTime: status === 'confirmed' ? '2-4 hours' : undefined
      }).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Order Updated',
        message: `Order status changed to ${status}`
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.data?.message || 'Failed to update order status'
      }));
    }
  };

  // Handle notification read
  const handleMarkNotificationRead = async (notificationId) => {
    try {
      await markNotificationAsRead({ notificationId }).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Export orders
  const handleExport = () => {
    const csvData = ordersData?.data?.orders?.map(order => ({
      'Order ID': order.id,
      'Restaurant': order.restaurant.name,
      'Items': order.items.length,
      'Total Amount': order.totalAmount,
      'Status': order.status,
      'Date': new Date(order.createdAt).toLocaleDateString()
    }));
    
    // Simple CSV export
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    dispatch(addNotification({
      type: 'success',
      title: 'Export Complete',
      message: 'Orders exported successfully'
    }));
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = orderStatuses.find(s => s.value === status) || orderStatuses[0];
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-2xl text-sm font-medium ${statusConfig.color}`}>
        <Icon className="w-4 h-4" />
        {statusConfig.label}
      </span>
    );
  };

  // Loading state
  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-bottle-green" />
          <span className="text-lg font-medium text-text-dark">Loading orders...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (ordersError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
        <AlertCircle className="w-16 h-16 text-tomato-red/60 mb-4" />
        <h2 className="text-2xl font-medium text-text-dark/80 mb-4">Failed to load orders</h2>
        <p className="text-text-muted mb-8 max-w-md leading-relaxed">
          There was an error loading your order data. Please try again.
        </p>
        <button
          onClick={() => refetchOrders()}
          className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity"
        >
          Retry
        </button>
      </div>
    );
  }

  const orders = ordersData?.data?.orders || [];
  const pagination = ordersData?.data?.pagination || {};
  const analytics = analyticsData?.data || {};
  const notifications = notificationsData?.data?.notifications || [];

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-dark mb-2">Order Management</h1>
          <p className="text-text-muted text-lg">
            Manage your orders, track fulfillment, and optimize delivery
          </p>
        </div>
        
        {/* Notifications Badge */}
        {notifications.length > 0 && (
          <div className="relative">
            <button className="relative p-3 bg-amber-50/80 hover:bg-amber-100/80 rounded-2xl transition-colors">
              <Bell className="w-6 h-6 text-amber-600" />
              <span className="absolute -top-1 -right-1 bg-tomato-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {notifications.length}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Analytics Summary */}
      {!analyticsLoading && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-mint-fresh/20 rounded-2xl">
                <Package className="w-6 h-6 text-bottle-green" />
              </div>
              <span className="text-sm font-medium text-bottle-green bg-mint-fresh/20 px-2 py-1 rounded-xl">
                {analytics.ordersChange || '+0%'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-dark mb-1">
              {analytics.totalOrders || 0}
            </h3>
            <p className="text-text-muted text-sm">Total Orders</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-xl">
                {analytics.pendingChange || '+0'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-dark mb-1">
              {analytics.pendingOrders || 0}
            </h3>
            <p className="text-text-muted text-sm">Pending Orders</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-2xl">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-xl">
                {analytics.activeChange || '+0%'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-dark mb-1">
              {analytics.activeOrders || 0}
            </h3>
            <p className="text-text-muted text-sm">Active Orders</p>
          </div>

          <div className="bg-gradient-card p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-earthy-yellow/20 rounded-2xl">
                <span className="text-lg font-bold text-earthy-brown">৳</span>
              </div>
              <span className="text-sm font-medium text-bottle-green bg-mint-fresh/20 px-2 py-1 rounded-xl">
                {analytics.revenueChange || '+0%'}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-text-dark mb-1">
              ৳{analytics.totalRevenue?.toLocaleString() || 0}
            </h3>
            <p className="text-text-muted text-sm">Total Revenue</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-3xl shadow-soft p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-muted w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders by restaurant name, order ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark placeholder-text-muted focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
            />
          </div>

          {/* Time Range */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all duration-200 ${
                showFilters 
                  ? 'bg-bottle-green text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-text-dark'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
            
            <button
              onClick={() => refetchOrders()}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-text-dark rounded-2xl font-medium transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="border-t border-gray-100 pt-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
                >
                  <option value="all">All Statuses</option>
                  {orderStatuses.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-0 rounded-2xl text-text-dark focus:ring-2 focus:ring-bottle-green/20 focus:bg-white transition-all duration-200"
                >
                  <option value="createdAt">Order Date</option>
                  <option value="totalAmount">Amount</option>
                  <option value="status">Status</option>
                  <option value="restaurant">Restaurant</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">Sort Order</label>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 border-0 rounded-2xl text-text-dark transition-all duration-200"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-bottle-green/5 backdrop-blur-sm border border-bottle-green/20 rounded-3xl p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-bottle-green font-medium">
                {selectedOrders.length} orders selected
              </span>
              <button
                onClick={() => setSelectedOrders([])}
                className="text-text-muted hover:text-text-dark text-sm underline"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex gap-3 ml-auto">
              {['confirmed', 'prepared', 'shipped'].map(status => (
                <button
                  key={status}
                  onClick={() => handleBulkStatusUpdate(status)}
                  className="px-4 py-2 bg-white hover:bg-gray-50 text-text-dark rounded-xl font-medium border border-gray-200 transition-all duration-200 capitalize"
                >
                  Mark as {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="bg-white rounded-3xl shadow-soft overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="w-12 px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-bottle-green bg-gray-100 border-gray-300 rounded focus:ring-bottle-green/20 focus:ring-2"
                    />
                  </th>
                  {[
                    { key: 'id', label: 'Order ID', sortable: true },
                    { key: 'restaurant', label: 'Restaurant', sortable: true },
                    { key: 'items', label: 'Items', sortable: false },
                    { key: 'totalAmount', label: 'Amount', sortable: true },
                    { key: 'status', label: 'Status', sortable: true },
                    { key: 'createdAt', label: 'Date', sortable: true },
                    { key: 'actions', label: 'Actions', sortable: false }
                  ].map(column => (
                    <th 
                      key={column.key} 
                      className="px-6 py-4 text-left text-sm font-medium text-text-dark/70"
                    >
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-2 hover:text-text-dark transition-colors"
                        >
                          {column.label}
                          <ArrowUpDown className="w-4 h-4" />
                        </button>
                      ) : (
                        column.label
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-4 h-4 text-bottle-green bg-gray-100 border-gray-300 rounded focus:ring-bottle-green/20 focus:ring-2"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-dark">#{order.id.slice(-8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-text-dark">{order.restaurant.name}</div>
                      <div className="text-sm text-text-muted">{order.restaurant.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-dark font-medium">{order.items.length} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-text-dark">৳{order.totalAmount.toFixed(0)}</span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-text-dark font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-text-muted">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4 text-text-muted" />
                        </button>
                        <div className="relative group">
                          <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                            <MoreVertical className="w-4 h-4 text-text-muted" />
                          </button>
                          {/* Status update dropdown would go here */}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-4 p-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-gray-50/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => handleSelectOrder(order.id)}
                    className="w-4 h-4 text-bottle-green bg-gray-100 border-gray-300 rounded focus:ring-bottle-green/20 focus:ring-2"
                  />
                  <div>
                    <div className="font-medium text-text-dark">#{order.id.slice(-8)}</div>
                    <div className="text-sm text-text-muted">{order.restaurant.name}</div>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-text-muted">
                  {order.items.length} items • {new Date(order.createdAt).toLocaleDateString()}
                </div>
                <div className="font-bold text-text-dark">৳{order.totalAmount.toFixed(0)}</div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-gray-200/50">
                <button className="flex items-center gap-2 text-bottle-green font-medium">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                  <MoreVertical className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-text-muted/40 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-text-dark/80 mb-2">
              {searchTerm ? 'No orders match your search' : 'No orders yet'}
            </h3>
            <p className="text-text-muted">
              {searchTerm ? 'Try adjusting your search terms or filters.' : 'Your orders will appear here once customers start placing them.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-text-muted">
            Showing {((pagination.current - 1) * 15) + 1} to {Math.min(pagination.current * 15, pagination.totalOrders)} of {pagination.totalOrders} orders
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-text-dark bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      currentPage === pageNum
                        ? 'bg-bottle-green text-white'
                        : 'text-text-dark bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-4 py-2 text-text-dark bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;