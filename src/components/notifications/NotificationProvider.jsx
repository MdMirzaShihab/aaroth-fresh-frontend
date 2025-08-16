import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import {
  addNotification,
  incrementUnreadNotifications,
  updateNotificationSettings,
  selectNotificationSettings,
} from '../../store/slices/notificationSlice';
import { ToastContainer } from '../ui/Toast';
import websocketService from '../../services/websocketService';

/**
 * Real-time Notification Provider
 * Handles WebSocket connection, notification permissions, and real-time updates
 */
const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated } = useSelector(selectAuth);
  const notificationSettings = useSelector(selectNotificationSettings);

  // Initialize notification system
  useEffect(() => {
    if (isAuthenticated && token && user) {
      initializeNotifications();
    }

    return () => {
      cleanup();
    };
  }, [isAuthenticated, token, user]);

  // Initialize notifications and WebSocket connection
  const initializeNotifications = useCallback(async () => {
    try {
      // Request browser notification permission if enabled
      if (notificationSettings.enablePush) {
        const permissionGranted =
          await websocketService.constructor.requestNotificationPermission();

        if (!permissionGranted) {
          dispatch(updateNotificationSettings({ enablePush: false }));
          dispatch(
            addNotification({
              type: 'warning',
              title: 'Notifications Blocked',
              message:
                'Browser notifications are blocked. You can enable them in your browser settings.',
              duration: 8000,
            })
          );
        }
      }

      // Connect to WebSocket for real-time updates
      await websocketService.connect(token);

      // Join user-specific room based on role
      if (user.role) {
        websocketService.joinRoom(`${user.role}s`); // vendors, restaurants, etc.

        // Join user-specific room
        websocketService.joinRoom(`user_${user._id}`);

        // Join business-specific room if applicable
        if (user.vendorId) {
          websocketService.joinRoom(
            `vendor_${user.vendorId._id || user.vendorId}`
          );
        } else if (user.restaurantId) {
          websocketService.joinRoom(
            `restaurant_${user.restaurantId._id || user.restaurantId}`
          );
        }
      }

      // Set up custom event listeners for additional notification types
      setupCustomListeners();

      // Show welcome notification for new sessions
      if (user.lastLogin) {
        const lastLoginTime = new Date(user.lastLogin);
        const now = new Date();
        const timeDiff = now - lastLoginTime;

        // Show welcome message if last login was more than 1 hour ago
        if (timeDiff > 3600000) {
          // 1 hour in milliseconds
          dispatch(
            addNotification({
              type: 'success',
              title: `Welcome back, ${user.name}!`,
              message: `You have new updates waiting for you.`,
              duration: 6000,
            })
          );
        }
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);

      // Show fallback notification
      dispatch(
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message:
            'Unable to connect to real-time updates. Some features may be limited.',
          duration: 10000,
        })
      );
    }
  }, [dispatch, token, user, notificationSettings.enablePush]);

  // Set up custom WebSocket listeners
  const setupCustomListeners = useCallback(() => {
    // Listen for vendor-specific notifications
    if (user.role === 'vendor') {
      websocketService.addEventListener('new_order', handleNewOrder);
      websocketService.addEventListener(
        'order_cancelled',
        handleOrderCancelled
      );
      websocketService.addEventListener(
        'listing_approved',
        handleListingApproved
      );
      websocketService.addEventListener('low_inventory', handleLowInventory);
    }

    // Listen for restaurant-specific notifications
    if (user.role === 'restaurantOwner' || user.role === 'restaurantManager') {
      websocketService.addEventListener(
        'order_confirmed',
        handleOrderConfirmed
      );
      websocketService.addEventListener('order_ready', handleOrderReady);
      websocketService.addEventListener(
        'delivery_update',
        handleDeliveryUpdate
      );
      websocketService.addEventListener('budget_alert', handleBudgetAlert);
    }

    // Listen for admin-specific notifications
    if (user.role === 'admin') {
      websocketService.addEventListener(
        'new_vendor_registration',
        handleNewVendorRegistration
      );
      websocketService.addEventListener('system_alert', handleSystemAlert);
      websocketService.addEventListener('user_report', handleUserReport);
    }

    // Universal notifications
    websocketService.addEventListener(
      'system_maintenance',
      handleSystemMaintenance
    );
    websocketService.addEventListener('security_alert', handleSecurityAlert);
  }, [user.role]);

  // Notification handlers for different types
  const handleNewOrder = useCallback(
    (payload) => {
      const { order, customer } = payload;

      dispatch(
        addNotification({
          id: `new_order_${order._id}`,
          type: 'success',
          title: 'New Order Received!',
          message: `Order #${order.orderNumber} from ${customer.name || 'a customer'} - ${formatCurrency(order.totalAmount)}`,
          duration: 8000,
          data: { orderId: order._id, type: 'new_order' },
          actions: [
            {
              label: 'View Order',
              action: () =>
                (window.location.href = `/vendor/orders/${order._id}`),
            },
          ],
        })
      );

      // Play notification sound if enabled
      if (notificationSettings.enableSound) {
        playNotificationSound('new_order');
      }
    },
    [dispatch, notificationSettings.enableSound]
  );

  const handleOrderCancelled = useCallback(
    (payload) => {
      const { order, reason } = payload;

      dispatch(
        addNotification({
          id: `order_cancelled_${order._id}`,
          type: 'warning',
          title: 'Order Cancelled',
          message: `Order #${order.orderNumber} has been cancelled. ${reason || ''}`,
          duration: 10000,
          data: { orderId: order._id, type: 'order_cancelled' },
        })
      );
    },
    [dispatch]
  );

  const handleListingApproved = useCallback(
    (payload) => {
      const { listing } = payload;

      dispatch(
        addNotification({
          id: `listing_approved_${listing._id}`,
          type: 'success',
          title: 'Listing Approved!',
          message: `Your listing "${listing.title}" has been approved and is now live.`,
          duration: 8000,
          data: { listingId: listing._id, type: 'listing_approved' },
        })
      );
    },
    [dispatch]
  );

  const handleLowInventory = useCallback(
    (payload) => {
      const { product, currentStock, minStock } = payload;

      dispatch(
        addNotification({
          id: `low_inventory_${product._id}`,
          type: 'warning',
          title: 'Low Inventory Alert',
          message: `${product.name} is running low (${currentStock} left, minimum: ${minStock})`,
          duration: 12000,
          data: { productId: product._id, type: 'low_inventory' },
        })
      );
    },
    [dispatch]
  );

  const handleOrderConfirmed = useCallback(
    (payload) => {
      const { order, vendor } = payload;

      dispatch(
        addNotification({
          id: `order_confirmed_${order._id}`,
          type: 'success',
          title: 'Order Confirmed',
          message: `${vendor.businessName} has confirmed your order #${order.orderNumber}`,
          duration: 6000,
          data: { orderId: order._id, type: 'order_confirmed' },
        })
      );
    },
    [dispatch]
  );

  const handleOrderReady = useCallback(
    (payload) => {
      const { order, vendor } = payload;

      dispatch(
        addNotification({
          id: `order_ready_${order._id}`,
          type: 'info',
          title: 'Order Ready!',
          message: `Your order #${order.orderNumber} from ${vendor.businessName} is ready for pickup/delivery`,
          duration: 10000,
          data: { orderId: order._id, type: 'order_ready' },
        })
      );

      if (notificationSettings.enableSound) {
        playNotificationSound('order_ready');
      }
    },
    [dispatch, notificationSettings.enableSound]
  );

  const handleDeliveryUpdate = useCallback(
    (payload) => {
      const { order, status, location } = payload;

      dispatch(
        addNotification({
          id: `delivery_update_${order._id}_${Date.now()}`,
          type: 'info',
          title: 'Delivery Update',
          message: `Order #${order.orderNumber} - ${status}${location ? ` at ${location}` : ''}`,
          duration: 8000,
          data: { orderId: order._id, type: 'delivery_update' },
        })
      );
    },
    [dispatch]
  );

  const handleBudgetAlert = useCallback(
    (payload) => {
      const { percentage, remaining, total } = payload;

      dispatch(
        addNotification({
          id: `budget_alert_${Date.now()}`,
          type: 'warning',
          title: 'Budget Alert',
          message: `You've used ${percentage}% of your budget. ${formatCurrency(remaining)} remaining out of ${formatCurrency(total)}.`,
          duration: 12000,
          data: { type: 'budget_alert' },
        })
      );
    },
    [dispatch]
  );

  const handleNewVendorRegistration = useCallback(
    (payload) => {
      const { vendor } = payload;

      dispatch(
        addNotification({
          id: `new_vendor_${vendor._id}`,
          type: 'info',
          title: 'New Vendor Registration',
          message: `${vendor.businessName} has registered and needs approval.`,
          duration: 10000,
          data: { vendorId: vendor._id, type: 'new_vendor_registration' },
        })
      );
    },
    [dispatch]
  );

  const handleSystemAlert = useCallback(
    (payload) => {
      const { level, message, action } = payload;

      dispatch(
        addNotification({
          id: `system_alert_${Date.now()}`,
          type:
            level === 'critical'
              ? 'error'
              : level === 'warning'
                ? 'warning'
                : 'info',
          title: 'System Alert',
          message,
          duration: level === 'critical' ? 0 : 15000, // Critical alerts don't auto-dismiss
          data: { type: 'system_alert', level },
          actions: action ? [action] : null,
        })
      );
    },
    [dispatch]
  );

  const handleUserReport = useCallback(
    (payload) => {
      const { report, user: reportedUser } = payload;

      dispatch(
        addNotification({
          id: `user_report_${report._id}`,
          type: 'warning',
          title: 'User Report',
          message: `New report filed against ${reportedUser.name}: ${report.reason}`,
          duration: 12000,
          data: { reportId: report._id, type: 'user_report' },
        })
      );
    },
    [dispatch]
  );

  const handleSystemMaintenance = useCallback(
    (payload) => {
      const { scheduledTime, duration, affectedServices } = payload;

      dispatch(
        addNotification({
          id: `maintenance_${Date.now()}`,
          type: 'info',
          title: 'Scheduled Maintenance',
          message: `System maintenance scheduled for ${new Date(scheduledTime).toLocaleString()}. Duration: ${duration}. Affected: ${affectedServices.join(', ')}`,
          duration: 0, // Don't auto-dismiss maintenance notifications
          data: { type: 'system_maintenance' },
        })
      );
    },
    [dispatch]
  );

  const handleSecurityAlert = useCallback(
    (payload) => {
      const { message, severity, action } = payload;

      dispatch(
        addNotification({
          id: `security_alert_${Date.now()}`,
          type: severity === 'high' ? 'error' : 'warning',
          title: 'Security Alert',
          message,
          duration: 0, // Don't auto-dismiss security alerts
          data: { type: 'security_alert', severity },
          actions: action ? [action] : null,
        })
      );
    },
    [dispatch]
  );

  // Play notification sound
  const playNotificationSound = useCallback((type) => {
    try {
      const audio = new Audio();

      // Different sounds for different notification types
      switch (type) {
        case 'new_order':
          audio.src = '/sounds/new-order.mp3'; // You'll need to add these sound files
          break;
        case 'order_ready':
          audio.src = '/sounds/order-ready.mp3';
          break;
        default:
          audio.src = '/sounds/notification.mp3';
      }

      audio.volume = 0.3; // Keep volume moderate
      audio.play().catch((e) => {
        // Browser might block autoplay - that's okay
        console.log('Unable to play notification sound:', e.message);
      });
    } catch (error) {
      console.log('Notification sound not available:', error.message);
    }
  }, []);

  // Format currency helper
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace('BDT', '৳');
  };

  // Cleanup function
  const cleanup = useCallback(() => {
    // Remove all event listeners
    if (user?.role === 'vendor') {
      websocketService.removeEventListener('new_order', handleNewOrder);
      websocketService.removeEventListener(
        'order_cancelled',
        handleOrderCancelled
      );
      websocketService.removeEventListener(
        'listing_approved',
        handleListingApproved
      );
      websocketService.removeEventListener('low_inventory', handleLowInventory);
    }

    if (
      user?.role === 'restaurantOwner' ||
      user?.role === 'restaurantManager'
    ) {
      websocketService.removeEventListener(
        'order_confirmed',
        handleOrderConfirmed
      );
      websocketService.removeEventListener('order_ready', handleOrderReady);
      websocketService.removeEventListener(
        'delivery_update',
        handleDeliveryUpdate
      );
      websocketService.removeEventListener('budget_alert', handleBudgetAlert);
    }

    if (user?.role === 'admin') {
      websocketService.removeEventListener(
        'new_vendor_registration',
        handleNewVendorRegistration
      );
      websocketService.removeEventListener('system_alert', handleSystemAlert);
      websocketService.removeEventListener('user_report', handleUserReport);
    }

    // Universal listeners
    websocketService.removeEventListener(
      'system_maintenance',
      handleSystemMaintenance
    );
    websocketService.removeEventListener('security_alert', handleSecurityAlert);

    // Disconnect WebSocket
    websocketService.disconnect();
  }, [
    user?.role,
    handleNewOrder,
    handleOrderCancelled,
    handleListingApproved,
    handleLowInventory,
    handleOrderConfirmed,
    handleOrderReady,
    handleDeliveryUpdate,
    handleBudgetAlert,
    handleNewVendorRegistration,
    handleSystemAlert,
    handleUserReport,
    handleSystemMaintenance,
    handleSecurityAlert,
  ]);

  return (
    <>
      {children}
      {/* Toast notifications container */}
      <ToastContainer position="top-right" maxToasts={5} className="z-[9999]" />
    </>
  );
};

export default NotificationProvider;
