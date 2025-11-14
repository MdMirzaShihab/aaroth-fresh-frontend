import React, { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Search,
  ShoppingCart,
  Package,
  AlertCircle,
  Star,
  DollarSign,
  TrendingUp,
  Mail,
  Smartphone,
  Volume2,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const VendorNotifications = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, unread, read
  const [filterType, setFilterType] = useState('all'); // all, orders, inventory, system, reviews, payments
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  // Notification preferences state
  const [preferences, setPreferences] = useState({
    email: {
      orders: true,
      inventory: true,
      reviews: true,
      payments: true,
      system: false,
    },
    sms: {
      orders: true,
      inventory: false,
      reviews: false,
      payments: true,
      system: false,
    },
    push: {
      orders: true,
      inventory: true,
      reviews: true,
      payments: true,
      system: true,
    },
  });

  // Mock notifications data (replace with actual API call)
  const mockNotifications = [
    {
      id: 1,
      type: 'orders',
      title: 'New Order Received',
      message: 'Golden Fork Restaurant placed an order for Fresh Tomatoes (20kg)',
      timestamp: '2025-11-14T10:30:00',
      read: false,
      priority: 'high',
      actionUrl: '/vendor/orders/12345',
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Low Stock Alert',
      message: 'Fresh Spinach stock is running low (5kg remaining). Restock recommended.',
      timestamp: '2025-11-14T09:15:00',
      read: false,
      priority: 'medium',
      actionUrl: '/vendor/inventory',
    },
    {
      id: 3,
      type: 'reviews',
      title: 'New Review',
      message: 'Ocean Blue Bistro left a 5-star review for Fresh Spinach',
      timestamp: '2025-11-14T08:45:00',
      read: true,
      priority: 'low',
      actionUrl: '/vendor/reviews',
    },
    {
      id: 4,
      type: 'payments',
      title: 'Payment Received',
      message: 'Payment of BDT 12,500 has been credited to your account',
      timestamp: '2025-11-13T16:20:00',
      read: true,
      priority: 'high',
      actionUrl: '/vendor/financial-reports',
    },
    {
      id: 5,
      type: 'system',
      title: 'Profile Verification Complete',
      message: 'Your business profile has been verified successfully',
      timestamp: '2025-11-13T14:00:00',
      read: true,
      priority: 'medium',
      actionUrl: '/vendor/profile',
    },
    {
      id: 6,
      type: 'orders',
      title: 'Order Delivered',
      message: 'Order #12340 has been successfully delivered to Spice Garden',
      timestamp: '2025-11-13T12:30:00',
      read: true,
      priority: 'low',
      actionUrl: '/vendor/orders/12340',
    },
  ];

  const getNotificationIcon = (type) => {
    const icons = {
      orders: ShoppingCart,
      inventory: Package,
      reviews: Star,
      payments: DollarSign,
      system: AlertCircle,
    };
    return icons[type] || Bell;
  };

  const getNotificationColor = (type) => {
    const colors = {
      orders: 'bg-bottle-green/10 text-bottle-green',
      inventory: 'bg-earthy-yellow/10 text-earthy-brown',
      reviews: 'bg-mint-fresh/10 text-muted-olive',
      payments: 'bg-sage-green/10 text-bottle-green',
      system: 'bg-muted-olive/10 text-muted-olive',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      high: 'bg-tomato-red/20 text-tomato-red border-tomato-red/30',
      medium: 'bg-earthy-yellow/20 text-earthy-brown border-earthy-yellow/30',
      low: 'bg-sage-green/20 text-bottle-green border-sage-green/30',
    };
    return badges[priority] || badges.low;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleMarkAsRead = (notificationId) => {
    // In production: Call API to mark notification as read
    console.log('Marking notification as read:', notificationId);
  };

  const handleMarkAllAsRead = () => {
    // In production: Call API to mark all notifications as read
    console.log('Marking all notifications as read');
  };

  const handleDelete = (notificationId) => {
    // In production: Call API to delete notification
    console.log('Deleting notification:', notificationId);
  };

  const handleClearAll = () => {
    // In production: Call API to clear all read notifications
    if (window.confirm('Are you sure you want to clear all read notifications?')) {
      console.log('Clearing all read notifications');
    }
  };

  const handlePreferenceChange = (channel, type, value) => {
    setPreferences((prev) => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [type]: value,
      },
    }));
  };

  const handleSavePreferences = () => {
    // In production: Call API to save preferences
    console.log('Saving notification preferences:', preferences);
    alert('Notification preferences saved successfully!');
    setShowPreferences(false);
  };

  // Filter notifications
  const filteredNotifications = mockNotifications.filter((notification) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notification.read) ||
      (activeTab === 'read' && notification.read);

    const matchesType = filterType === 'all' || notification.type === filterType;

    const matchesSearch =
      searchQuery === '' ||
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesType && matchesSearch;
  });

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="glass-layer-1 rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-text-dark">Notifications</h1>
              {unreadCount > 0 && (
                <span className="bg-tomato-red text-white text-sm font-bold px-3 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-text-muted">
              Stay updated with your business activities
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleMarkAllAsRead}
              className="bg-mint-fresh/20 text-bottle-green px-4 py-2 rounded-xl font-medium hover:bg-mint-fresh/30 transition-all duration-200 flex items-center gap-2 touch-target"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
            <button
              onClick={handleClearAll}
              className="bg-sage-green/20 text-muted-olive px-4 py-2 rounded-xl font-medium hover:bg-sage-green/30 transition-all duration-200 flex items-center gap-2 touch-target"
            >
              <Trash2 className="w-4 h-4" />
              Clear Read
            </button>
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all duration-200 flex items-center gap-2 touch-target"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Panel */}
      {showPreferences && (
        <div className="glass-layer-1 rounded-3xl p-6 shadow-soft animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-dark">
              Notification Preferences
            </h2>
            <button
              onClick={() => setShowPreferences(false)}
              className="p-2 hover:bg-sage-green/10 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sage-green/10">
                <tr>
                  <th className="text-left px-6 py-4 text-text-dark font-semibold">
                    Notification Type
                  </th>
                  <th className="text-center px-6 py-4 text-text-dark font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </th>
                  <th className="text-center px-6 py-4 text-text-dark font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      SMS
                    </div>
                  </th>
                  <th className="text-center px-6 py-4 text-text-dark font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Bell className="w-4 h-4" />
                      Push
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sage-green/20">
                {['orders', 'inventory', 'reviews', 'payments', 'system'].map((type) => (
                  <tr key={type} className="hover:bg-sage-green/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="capitalize font-medium text-text-dark">
                        {type} Notifications
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.email[type]}
                        onChange={(e) =>
                          handlePreferenceChange('email', type, e.target.checked)
                        }
                        className="w-5 h-5 rounded border-sage-green/30 text-bottle-green focus:ring-2 focus:ring-muted-olive/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.sms[type]}
                        onChange={(e) =>
                          handlePreferenceChange('sms', type, e.target.checked)
                        }
                        className="w-5 h-5 rounded border-sage-green/30 text-bottle-green focus:ring-2 focus:ring-muted-olive/20 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={preferences.push[type]}
                        onChange={(e) =>
                          handlePreferenceChange('push', type, e.target.checked)
                        }
                        className="w-5 h-5 rounded border-sage-green/30 text-bottle-green focus:ring-2 focus:ring-muted-olive/20 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-sage-green/20">
            <button
              onClick={() => setShowPreferences(false)}
              className="px-6 py-2 rounded-xl text-text-muted hover:bg-sage-green/10 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSavePreferences}
              className="bg-gradient-primary text-white px-6 py-2 rounded-xl font-medium hover:shadow-glow-green transition-all duration-200"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-layer-1 rounded-3xl p-4 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {['all', 'unread', 'read'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 rounded-2xl font-medium transition-all duration-200 capitalize ${
                  activeTab === tab
                    ? 'bg-gradient-primary text-white shadow-glow-green'
                    : 'glass-layer-2 text-text-muted hover:bg-sage-green/10'
                }`}
              >
                {tab}
                {tab === 'unread' && unreadCount > 0 && (
                  <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200"
            />
          </div>

          {/* Filter by Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-3 rounded-2xl glass-layer-2 border border-sage-green/20 focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20 transition-all duration-200 capitalize"
          >
            <option value="all">All Types</option>
            <option value="orders">Orders</option>
            <option value="inventory">Inventory</option>
            <option value="reviews">Reviews</option>
            <option value="payments">Payments</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications found"
            description="You're all caught up! Check back later for updates."
          />
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`glass-layer-1 rounded-3xl p-5 shadow-soft animate-fade-in transition-all duration-200 ${
                  !notification.read ? 'border-l-4 border-bottle-green' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`p-3 rounded-2xl flex-shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className={`font-semibold ${
                              !notification.read
                                ? 'text-text-dark'
                                : 'text-text-muted'
                            }`}
                          >
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-bottle-green rounded-full"></span>
                          )}
                        </div>
                        <p className="text-text-muted text-sm">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(
                            notification.priority
                          )}`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-sage-green/20">
                      <span className="text-xs text-text-muted">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      <div className="flex items-center gap-2">
                        {notification.actionUrl && (
                          <button
                            onClick={() =>
                              (window.location.href = notification.actionUrl)
                            }
                            className="text-sm text-bottle-green hover:text-muted-olive font-medium transition-colors duration-200"
                          >
                            View Details
                          </button>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 hover:bg-mint-fresh/10 rounded-xl transition-colors duration-200"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-bottle-green" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 hover:bg-tomato-red/10 rounded-xl transition-colors duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-tomato-red" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load More */}
      {filteredNotifications.length > 0 && (
        <div className="flex justify-center">
          <button className="bg-sage-green/20 text-muted-olive px-6 py-3 rounded-2xl font-medium hover:bg-sage-green/30 transition-all duration-200">
            Load More Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default VendorNotifications;
