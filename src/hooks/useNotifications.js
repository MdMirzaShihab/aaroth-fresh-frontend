import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addNotification,
  removeNotification,
  markAsRead,
  markAllAsRead,
  clearNotifications,
  updateNotificationSettings,
  selectNotifications,
  selectUnreadNotificationCount,
  selectNotificationSettings,
  selectNotificationsLoading,
  selectNotificationsError,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
} from '../store/slices/notificationSlice';

/**
 * Custom hook for notification management
 * Provides easy access to all notification functionality
 */
export const useNotifications = () => {
  const dispatch = useDispatch();

  // Selectors
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadNotificationCount);
  const settings = useSelector(selectNotificationSettings);
  const isLoading = useSelector(selectNotificationsLoading);
  const error = useSelector(selectNotificationsError);

  // Action creators
  const addNotif = useCallback(
    (notification) => {
      dispatch(addNotification(notification));
    },
    [dispatch]
  );

  const removeNotif = useCallback(
    (id) => {
      dispatch(removeNotification(id));
    },
    [dispatch]
  );

  const markRead = useCallback(
    (id) => {
      dispatch(markAsRead(id));
    },
    [dispatch]
  );

  const markAllRead = useCallback(() => {
    dispatch(markAllAsRead());
  }, [dispatch]);

  const clear = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const updateSettings = useCallback(
    (newSettings) => {
      dispatch(updateNotificationSettings(newSettings));
    },
    [dispatch]
  );

  // Helper functions for common notification types
  const showSuccess = useCallback(
    (message, title = 'Success', options = {}) => {
      dispatch(showSuccessNotification(message, title));
    },
    [dispatch]
  );

  const showError = useCallback(
    (message, title = 'Error', options = {}) => {
      dispatch(showErrorNotification(message, title));
    },
    [dispatch]
  );

  const showWarning = useCallback(
    (message, title = 'Warning', options = {}) => {
      dispatch(showWarningNotification(message, title));
    },
    [dispatch]
  );

  const showInfo = useCallback(
    (message, title = 'Info', options = {}) => {
      dispatch(showInfoNotification(message, title));
    },
    [dispatch]
  );

  // Advanced notification functions
  const showOrderNotification = useCallback(
    (order, type = 'update') => {
      const notificationData = {
        id: `order_${order._id || order.id}_${type}_${Date.now()}`,
        data: { orderId: order._id || order.id, type: `order_${type}` },
        duration: 8000,
      };

      switch (type) {
        case 'new':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'success',
              title: 'New Order Received!',
              message: `Order #${order.orderNumber} from ${order.customer?.name || 'a customer'}`,
            })
          );
          break;

        case 'confirmed':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'success',
              title: 'Order Confirmed',
              message: `Your order #${order.orderNumber} has been confirmed`,
            })
          );
          break;

        case 'ready':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'info',
              title: 'Order Ready!',
              message: `Order #${order.orderNumber} is ready for pickup/delivery`,
            })
          );
          break;

        case 'delivered':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'success',
              title: 'Order Delivered',
              message: `Order #${order.orderNumber} has been delivered successfully`,
            })
          );
          break;

        case 'cancelled':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'warning',
              title: 'Order Cancelled',
              message: `Order #${order.orderNumber} has been cancelled`,
            })
          );
          break;

        default:
          dispatch(
            addNotification({
              ...notificationData,
              type: 'info',
              title: 'Order Update',
              message: `Order #${order.orderNumber} status updated`,
            })
          );
      }
    },
    [dispatch]
  );

  const showListingNotification = useCallback(
    (listing, type = 'update') => {
      const notificationData = {
        id: `listing_${listing._id || listing.id}_${type}_${Date.now()}`,
        data: { listingId: listing._id || listing.id, type: `listing_${type}` },
        duration: 6000,
      };

      switch (type) {
        case 'approved':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'success',
              title: 'Listing Approved!',
              message: `Your listing "${listing.title || listing.name}" has been approved`,
            })
          );
          break;

        case 'rejected':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'error',
              title: 'Listing Rejected',
              message: `Your listing "${listing.title || listing.name}" needs revision`,
            })
          );
          break;

        case 'low_stock':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'warning',
              title: 'Low Stock Alert',
              message: `${listing.title || listing.name} is running low on stock`,
            })
          );
          break;

        default:
          dispatch(
            addNotification({
              ...notificationData,
              type: 'info',
              title: 'Listing Update',
              message: `Your listing "${listing.title || listing.name}" has been updated`,
            })
          );
      }
    },
    [dispatch]
  );

  const showBudgetAlert = useCallback(
    (budgetData) => {
      const { percentage, remaining, total, threshold = 80 } = budgetData;

      let alertType = 'info';
      let title = 'Budget Update';

      if (percentage >= 95) {
        alertType = 'error';
        title = 'Budget Exceeded!';
      } else if (percentage >= threshold) {
        alertType = 'warning';
        title = 'Budget Alert';
      }

      dispatch(
        addNotification({
          id: `budget_alert_${Date.now()}`,
          type: alertType,
          title,
          message: `You've used ${percentage}% of your budget. ৳${remaining?.toLocaleString()} remaining.`,
          duration: 12000,
          data: { type: 'budget_alert', percentage, remaining, total },
        })
      );
    },
    [dispatch]
  );

  const showSystemNotification = useCallback(
    (message, severity = 'info', persistent = false) => {
      const notificationData = {
        id: `system_${Date.now()}`,
        title: 'System Notification',
        message,
        duration: persistent ? 0 : 10000,
        data: { type: 'system', severity },
      };

      switch (severity) {
        case 'critical':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'error',
              title: 'Critical System Alert',
              duration: 0, // Don't auto-dismiss critical alerts
            })
          );
          break;

        case 'warning':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'warning',
              title: 'System Warning',
            })
          );
          break;

        case 'maintenance':
          dispatch(
            addNotification({
              ...notificationData,
              type: 'info',
              title: 'Maintenance Notice',
              duration: 0, // Keep maintenance notices visible
            })
          );
          break;

        default:
          dispatch(
            addNotification({
              ...notificationData,
              type: 'info',
            })
          );
      }
    },
    [dispatch]
  );

  // Utility functions
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter((n) => !n.read);
  }, [notifications]);

  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter(
        (n) => n.type === type || n.data?.type?.includes(type)
      );
    },
    [notifications]
  );

  const hasUnreadOfType = useCallback(
    (type) => {
      return notifications.some(
        (n) => !n.read && (n.type === type || n.data?.type?.includes(type))
      );
    },
    [notifications]
  );

  // Batch operations
  const markMultipleAsRead = useCallback(
    (ids) => {
      ids.forEach((id) => dispatch(markAsRead(id)));
    },
    [dispatch]
  );

  const removeMultiple = useCallback(
    (ids) => {
      ids.forEach((id) => dispatch(removeNotification(id)));
    },
    [dispatch]
  );

  // Settings helpers
  const toggleNotificationType = useCallback(
    (type) => {
      const newTypes = {
        ...settings.types,
        [type]: !settings.types[type],
      };
      dispatch(updateNotificationSettings({ types: newTypes }));
    },
    [dispatch, settings.types]
  );

  const isNotificationTypeEnabled = useCallback(
    (type) => {
      return settings.types[type] ?? true;
    },
    [settings.types]
  );

  // Analytics
  const getNotificationStats = useCallback(() => {
    const total = notifications.length;
    const unread = unreadCount;
    const byType = notifications.reduce((acc, n) => {
      const type = n.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read: total - unread,
      byType,
      readPercentage:
        total > 0 ? Math.round(((total - unread) / total) * 100) : 0,
    };
  }, [notifications, unreadCount]);

  return {
    // State
    notifications,
    unreadCount,
    settings,
    isLoading,
    error,

    // Basic actions
    addNotification: addNotif,
    removeNotification: removeNotif,
    markAsRead: markRead,
    markAllAsRead: markAllRead,
    clearNotifications: clear,
    updateSettings,

    // Helper functions
    showSuccess,
    showError,
    showWarning,
    showInfo,

    // Specialized notifications
    showOrderNotification,
    showListingNotification,
    showBudgetAlert,
    showSystemNotification,

    // Utility functions
    getUnreadNotifications,
    getNotificationsByType,
    hasUnreadOfType,
    markMultipleAsRead,
    removeMultiple,

    // Settings helpers
    toggleNotificationType,
    isNotificationTypeEnabled,

    // Analytics
    getNotificationStats,
  };
};

// Real-time notification hook for WebSocket integration
export const useRealTimeNotifications = () => {
  const { addNotification, showOrderNotification, showListingNotification } =
    useNotifications();

  const handleWebSocketMessage = useCallback(
    (data) => {
      const { type, payload } = data;

      switch (type) {
        case 'order_update':
          if (payload.order) {
            showOrderNotification(
              payload.order,
              payload.updateType || 'update'
            );
          }
          break;

        case 'listing_update':
          if (payload.listing) {
            showListingNotification(
              payload.listing,
              payload.updateType || 'update'
            );
          }
          break;

        case 'notification':
          addNotification({
            id: payload.id || `realtime_${Date.now()}`,
            type: payload.type || 'info',
            title: payload.title || 'Real-time Update',
            message: payload.message,
            timestamp: Date.now(),
            read: false,
            data: payload.data || { type: 'realtime' },
          });
          break;

        default:
          console.log('Unhandled real-time message:', type, payload);
      }
    },
    [addNotification, showOrderNotification, showListingNotification]
  );

  return {
    handleWebSocketMessage,
  };
};

// Notification permission hook
export const useNotificationPermission = () => {
  const { updateSettings } = useNotifications();

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { granted: false, reason: 'not_supported' };
    }

    if (Notification.permission === 'granted') {
      return { granted: true, reason: 'already_granted' };
    }

    if (Notification.permission === 'denied') {
      return { granted: false, reason: 'denied' };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';

      // Update settings based on permission
      updateSettings({ enablePush: granted });

      return {
        granted,
        reason: granted ? 'granted' : 'denied',
        permission,
      };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { granted: false, reason: 'error', error };
    }
  }, [updateSettings]);

  const checkPermission = useCallback(() => {
    if (!('Notification' in window)) {
      return { supported: false, permission: 'not_supported' };
    }

    return {
      supported: true,
      permission: Notification.permission,
      granted: Notification.permission === 'granted',
    };
  }, []);

  return {
    requestPermission,
    checkPermission,
  };
};
