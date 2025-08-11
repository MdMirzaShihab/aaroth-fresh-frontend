import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  Bell,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
  Package,
  DollarSign,
  Eye,
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  MarkAllAsRead
} from 'lucide-react';
import {
  useGetOrderNotificationsQuery,
  useMarkNotificationAsReadMutation
} from '../../store/slices/apiSlice';
import { addNotification } from '../../store/slices/notificationSlice';

const OrderNotifications = ({ onClose }) => {
  const dispatch = useDispatch();
  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem('orderNotificationSound') !== 'false'
  );
  const [filter, setFilter] = useState('all'); // all, unread, orders, payments

  // Fetch notifications with real-time polling
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useGetOrderNotificationsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true
  });

  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Notification categories
  const notificationTypes = {
    new_order: {
      icon: Package,
      color: 'text-blue-600 bg-blue-50',
      sound: '/sounds/new-order.mp3'
    },
    order_cancelled: {
      icon: AlertTriangle,
      color: 'text-tomato-red bg-tomato-red/20',
      sound: '/sounds/alert.mp3'
    },
    payment_received: {
      icon: DollarSign,
      color: 'text-bottle-green bg-mint-fresh/20',
      sound: '/sounds/success.mp3'
    },
    order_updated: {
      icon: Clock,
      color: 'text-orange-600 bg-orange-50',
      sound: '/sounds/notification.mp3'
    },
    delivery_confirmed: {
      icon: CheckCircle,
      color: 'text-bottle-green bg-mint-fresh/20',
      sound: '/sounds/success.mp3'
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    if (filter === 'orders') return ['new_order', 'order_cancelled', 'order_updated', 'delivery_confirmed'].includes(notification.type);
    if (filter === 'payments') return notification.type === 'payment_received';
    return true;
  });

  // Play notification sound
  const playNotificationSound = (type) => {
    if (!soundEnabled) return;
    
    const soundConfig = notificationTypes[type];
    if (soundConfig?.sound) {
      try {
        const audio = new Audio(soundConfig.sound);
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Fallback to system beep or ignore
          console.log('Could not play notification sound');
        });
      } catch (error) {
        console.error('Notification sound error:', error);
      }
    }
  };

  // Handle new notifications (for sound alerts)
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      if (!latestNotification.read && Date.now() - new Date(latestNotification.createdAt).getTime() < 60000) {
        // Play sound for notifications newer than 1 minute
        playNotificationSound(latestNotification.type);
      }
    }
  }, [notifications, soundEnabled]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead({ notificationId }).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead({ notificationId: n.id }).unwrap())
      );
      
      dispatch(addNotification({
        type: 'success',
        title: 'All notifications marked as read',
        message: `${unreadNotifications.length} notifications updated`
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to update notifications',
        message: 'Please try again later'
      }));
    }
  };

  // Toggle sound notifications
  const handleToggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    localStorage.setItem('orderNotificationSound', newState.toString());
    
    dispatch(addNotification({
      type: 'info',
      title: `Notification sounds ${newState ? 'enabled' : 'disabled'}`,
      message: newState ? 'You will hear sounds for new notifications' : 'Notification sounds are now muted'
    }));
  };

  // Get relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-bottle-green" />
            <div>
              <h3 className="text-xl font-bold text-text-dark">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-sm text-text-muted">{unreadCount} unread</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Sound toggle */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl transition-colors ${
                soundEnabled 
                  ? 'bg-bottle-green/10 text-bottle-green' 
                  : 'bg-gray-100 text-text-muted'
              }`}
              title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-4 border-b border-gray-100">
          {[
            { value: 'all', label: 'All', count: notifications.length },
            { value: 'unread', label: 'Unread', count: unreadCount },
            { value: 'orders', label: 'Orders', count: notifications.filter(n => ['new_order', 'order_cancelled', 'order_updated', 'delivery_confirmed'].includes(n.type)).length },
            { value: 'payments', label: 'Payments', count: notifications.filter(n => n.type === 'payment_received').length }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-bottle-green text-white'
                  : 'text-text-muted hover:text-text-dark hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                  filter === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-text-muted'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions Bar */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80">
            <span className="text-sm text-text-muted">{unreadCount} unread notifications</span>
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 text-sm font-medium text-bottle-green hover:text-bottle-green/80 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-green"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 px-4">
              <AlertTriangle className="w-12 h-12 text-tomato-red/60 mx-auto mb-3" />
              <p className="text-text-muted">Failed to load notifications</p>
              <button
                onClick={() => refetch()}
                className="mt-2 text-bottle-green hover:text-bottle-green/80 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
              <h4 className="font-medium text-text-dark mb-1">No notifications</h4>
              <p className="text-text-muted text-sm">
                {filter === 'unread' 
                  ? "You're all caught up!" 
                  : "New notifications will appear here"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notification) => {
                const typeConfig = notificationTypes[notification.type] || {
                  icon: Bell,
                  color: 'text-gray-600 bg-gray-100'
                };
                const Icon = typeConfig.icon;

                return (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50/80 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50/30' : ''
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl ${typeConfig.color} flex-shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium ${!notification.read ? 'text-text-dark' : 'text-text-muted'}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-bottle-green rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-text-muted mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-text-muted">
                            {getRelativeTime(notification.createdAt)}
                          </span>
                          
                          {notification.actionUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle navigation to order/payment details
                                window.location.href = notification.actionUrl;
                              }}
                              className="flex items-center gap-1 text-xs text-bottle-green hover:text-bottle-green/80 font-medium transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Auto-refresh: 30s
            </span>
            <button
              onClick={() => refetch()}
              className="text-bottle-green hover:text-bottle-green/80 font-medium transition-colors"
            >
              Refresh now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Badge Component (for use in headers)
export const NotificationBadge = ({ className = '' }) => {
  const {
    data: notificationsData,
    isLoading
  } = useGetOrderNotificationsQuery(undefined, {
    pollingInterval: 30000, // Poll every 30 seconds
    refetchOnMountOrArgChange: true
  });

  const unreadCount = notificationsData?.data?.notifications?.filter(n => !n.read).length || 0;

  if (isLoading || unreadCount === 0) {
    return (
      <div className={`relative ${className}`}>
        <Bell className="w-6 h-6 text-text-muted" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Bell className="w-6 h-6 text-text-muted" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-tomato-red text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );
};

export default OrderNotifications;