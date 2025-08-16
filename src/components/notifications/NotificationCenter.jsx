import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Eye,
} from 'lucide-react';
import {
  selectNotifications,
  selectUnreadNotificationCount,
  selectNotificationSettings,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearNotifications,
  updateNotificationSettings,
} from '../../store/slices/notificationSlice';
import { formatDate, timeAgo } from '../../utils';

/**
 * Advanced Notification Center
 * Full-featured notification management with filtering, settings, and actions
 */
const NotificationCenter = ({ isOpen, onClose, className = '' }) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadNotificationCount);
  const settings = useSelector(selectNotificationSettings);

  const [activeFilter, setActiveFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Filter notifications based on active filter
  const filteredNotifications = notifications.filter((notification) => {
    switch (activeFilter) {
      case 'unread':
        return !notification.read;
      case 'orders':
        return (
          notification.data?.type?.includes('order') ||
          notification.type === 'order'
        );
      case 'listings':
        return (
          notification.data?.type?.includes('listing') ||
          notification.type === 'listing'
        );
      case 'system':
        return (
          notification.data?.type?.includes('system') ||
          notification.type === 'system'
        );
      case 'security':
        return (
          notification.data?.type?.includes('security') ||
          notification.type === 'security'
        );
      default:
        return true;
    }
  });

  // Handle marking notification as read
  const handleMarkAsRead = useCallback(
    (id) => {
      dispatch(markAsRead(id));
    },
    [dispatch]
  );

  // Handle removing notification
  const handleRemoveNotification = useCallback(
    (id) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  // Handle marking all as read
  const handleMarkAllAsRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  // Handle clearing all notifications
  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notifications?')) {
      dispatch(clearNotifications());
    }
  }, [dispatch]);

  // Handle notification settings update
  const handleSettingsUpdate = useCallback(
    (newSettings) => {
      dispatch(updateNotificationSettings(newSettings));
    },
    [dispatch]
  );

  // Get notification icon based on type
  const getNotificationIcon = (notification) => {
    const iconClass = 'w-5 h-5 flex-shrink-0';

    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'new_order':
        case 'order_confirmed':
        case 'order_ready':
          return <ShoppingCart className={`${iconClass} text-bottle-green`} />;
        case 'order_cancelled':
          return <X className={`${iconClass} text-tomato-red`} />;
        case 'listing_approved':
          return <Package className={`${iconClass} text-mint-fresh`} />;
        case 'low_inventory':
          return <AlertTriangle className={`${iconClass} text-amber-500`} />;
        case 'budget_alert':
          return <DollarSign className={`${iconClass} text-amber-600`} />;
        case 'new_vendor_registration':
          return <Users className={`${iconClass} text-blue-600`} />;
        case 'system_alert':
        case 'system_maintenance':
          return <AlertCircle className={`${iconClass} text-blue-600`} />;
        case 'security_alert':
          return <AlertTriangle className={`${iconClass} text-tomato-red`} />;
        default:
          return <Bell className={`${iconClass} text-text-muted`} />;
      }
    }

    // Fallback to notification type
    switch (notification.type) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-bottle-green`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-tomato-red`} />;
      case 'warning':
        return <AlertTriangle className={`${iconClass} text-amber-500`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Bell className={`${iconClass} text-text-muted`} />;
    }
  };

  // Get notification priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-tomato-red bg-tomato-red/5';
      case 'medium':
        return 'border-l-4 border-amber-500 bg-amber-50/50';
      case 'low':
        return 'border-l-4 border-blue-500 bg-blue-50/50';
      default:
        return 'border-l-4 border-gray-300 bg-white/50';
    }
  };

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'unread', label: 'Unread', icon: Eye, count: unreadCount },
    { value: 'orders', label: 'Orders', icon: ShoppingCart },
    { value: 'listings', label: 'Listings', icon: Package },
    { value: 'system', label: 'System', icon: Settings },
    { value: 'security', label: 'Security', icon: AlertTriangle },
  ];

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[9999] ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Notification Center Panel */}
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-bottle-green to-mint-fresh text-white">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white px-2 py-1 rounded-full text-sm font-medium">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Notification Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-text-dark mb-3">
              Notification Settings
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enablePush}
                  onChange={(e) =>
                    handleSettingsUpdate({ enablePush: e.target.checked })
                  }
                  className="rounded text-bottle-green focus:ring-bottle-green"
                />
                <span className="text-sm text-text-dark">
                  Browser notifications
                </span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableSound}
                  onChange={(e) =>
                    handleSettingsUpdate({ enableSound: e.target.checked })
                  }
                  className="rounded text-bottle-green focus:ring-bottle-green"
                />
                <span className="text-sm text-text-dark">Sound alerts</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.enableEmail}
                  onChange={(e) =>
                    handleSettingsUpdate({ enableEmail: e.target.checked })
                  }
                  className="rounded text-bottle-green focus:ring-bottle-green"
                />
                <span className="text-sm text-text-dark">
                  Email notifications
                </span>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-text-dark mb-2">
                Notification Types
              </h4>
              <div className="space-y-2 text-sm">
                {Object.entries(settings.types).map(([type, enabled]) => (
                  <label key={type} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) =>
                        handleSettingsUpdate({
                          types: {
                            ...settings.types,
                            [type]: e.target.checked,
                          },
                        })
                      }
                      className="rounded text-bottle-green focus:ring-bottle-green"
                    />
                    <span className="capitalize text-text-dark">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeFilter === option.value;

            return (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-bottle-green text-white shadow-sm'
                    : 'text-text-muted hover:text-text-dark hover:bg-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
                {option.count && option.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-bottle-green text-white'
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        {filteredNotifications.length > 0 && (
          <div className="flex items-center gap-2 p-4 border-b border-gray-200">
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-sm text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 text-sm text-tomato-red hover:bg-tomato-red/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-6">
              <Bell className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-text-dark mb-2">
                {activeFilter === 'unread'
                  ? 'No unread notifications'
                  : 'No notifications'}
              </h3>
              <p className="text-text-muted">
                {activeFilter === 'unread'
                  ? 'All caught up! Check back later for updates.'
                  : `No ${activeFilter === 'all' ? '' : activeFilter + ' '}notifications to show.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  } ${getPriorityStyle(notification.priority)}`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`font-medium text-sm ${
                            !notification.read
                              ? 'text-text-dark'
                              : 'text-text-muted'
                          }`}
                        >
                          {notification.title}
                        </h4>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-bottle-green" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              handleRemoveNotification(notification.id)
                            }
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Remove notification"
                          >
                            <X className="w-3 h-3 text-tomato-red" />
                          </button>
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-text-muted mt-1 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-text-muted" />
                        <span className="text-xs text-text-muted">
                          {timeAgo(notification.timestamp)} •{' '}
                          {formatDate(notification.timestamp, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Actions */}
                      {notification.actions &&
                        notification.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {notification.actions.map((action, index) => (
                              <button
                                key={index}
                                onClick={action.action}
                                className="px-3 py-1 text-xs bg-bottle-green text-white rounded-lg hover:bg-bottle-green/80 transition-colors"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="w-2 h-2 bg-bottle-green rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              {filteredNotifications.length}{' '}
              {filteredNotifications.length === 1
                ? 'notification'
                : 'notifications'}
            </span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
