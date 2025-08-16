import { useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../store/slices/authSlice';
import { addNotification } from '../store/slices/notificationSlice';
import websocketService from '../services/websocketService';
import performanceService from '../services/performanceService';

/**
 * Custom hook for managing real-time features
 * Handles WebSocket connections, performance monitoring, and real-time updates
 */
export const useRealTimeFeatures = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector(selectAuth);
  const connectionRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Initialize real-time connection
  const initializeConnection = useCallback(async () => {
    if (!isAuthenticated || !token) return;

    try {
      performanceService.startMark('websocket-connection');

      await websocketService.connect(token);

      performanceService.endMark('websocket-connection');

      // Join role-specific room
      if (user?.role) {
        websocketService.joinRoom(user.role);
      }

      // Request notification permission
      await websocketService.constructor.requestNotificationPermission();

      connectionRef.current = {
        connected: true,
        timestamp: Date.now(),
      };

      console.log('Real-time features initialized successfully');
    } catch (error) {
      console.error('Failed to initialize real-time features:', error);

      dispatch(
        addNotification({
          type: 'warning',
          title: 'Connection Issue',
          message: 'Some real-time features may not work properly. Retrying...',
          duration: 5000,
        })
      );

      // Retry connection after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        initializeConnection();
      }, 5000);
    }
  }, [isAuthenticated, token, user?.role, dispatch]);

  // Cleanup connection
  const cleanupConnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    websocketService.disconnect();

    connectionRef.current = null;
  }, []);

  // Initialize connection when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      initializeConnection();
    } else {
      cleanupConnection();
    }

    return cleanupConnection;
  }, [isAuthenticated, token, initializeConnection, cleanupConnection]);

  // Handle visibility change (pause/resume connection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, could reduce connection activity
        console.log('Page hidden - reducing real-time activity');
      } else {
        // Page is visible, ensure full connectivity
        console.log('Page visible - resuming full real-time activity');
        if (
          isAuthenticated &&
          !websocketService.getConnectionStatus().connected
        ) {
          initializeConnection();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, initializeConnection]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online - reconnecting...');
      if (isAuthenticated) {
        initializeConnection();
      }

      dispatch(
        addNotification({
          type: 'success',
          title: 'Back Online',
          message: 'Connection restored. Real-time features are now active.',
          duration: 3000,
        })
      );
    };

    const handleOffline = () => {
      console.log('Gone offline');

      dispatch(
        addNotification({
          type: 'warning',
          title: 'Connection Lost',
          message: 'You are currently offline. Some features may be limited.',
          duration: 5000,
        })
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated, initializeConnection, dispatch]);

  // Subscribe to specific order updates
  const subscribeToOrder = useCallback((orderId) => {
    if (websocketService.getConnectionStatus().connected) {
      websocketService.subscribeToOrderUpdates(orderId);
    }
  }, []);

  // Unsubscribe from order updates
  const unsubscribeFromOrder = useCallback((orderId) => {
    if (websocketService.getConnectionStatus().connected) {
      websocketService.unsubscribeFromOrderUpdates(orderId);
    }
  }, []);

  // Add custom event listener
  const addEventListener = useCallback((type, callback) => {
    websocketService.addEventListener(type, callback);

    return () => {
      websocketService.removeEventListener(type, callback);
    };
  }, []);

  // Send custom message
  const sendMessage = useCallback((data) => {
    websocketService.send(data);
  }, []);

  // Get connection status
  const getConnectionStatus = useCallback(() => {
    return websocketService.getConnectionStatus();
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    cleanupConnection();
    setTimeout(() => {
      initializeConnection();
    }, 1000);
  }, [cleanupConnection, initializeConnection]);

  return {
    // Connection management
    connectionStatus: getConnectionStatus(),
    reconnect,

    // Order subscriptions
    subscribeToOrder,
    unsubscribeFromOrder,

    // Custom events
    addEventListener,
    sendMessage,

    // Utilities
    isConnected: connectionRef.current?.connected || false,
    connectionTimestamp: connectionRef.current?.timestamp,
  };
};

/**
 * Custom hook for performance monitoring
 */
export const usePerformanceMonitoring = () => {
  const performanceReportedRef = useRef(false);

  useEffect(() => {
    // Report performance metrics after page load
    const reportPerformance = () => {
      if (!performanceReportedRef.current) {
        performanceService.reportMetrics();
        performanceReportedRef.current = true;
      }
    };

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      setTimeout(reportPerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(reportPerformance, 1000);
      });
    }

    return () => {
      performanceService.cleanup();
    };
  }, []);

  const startMark = useCallback((name) => {
    performanceService.startMark(name);
  }, []);

  const endMark = useCallback((name) => {
    return performanceService.endMark(name);
  }, []);

  const optimizeImage = useCallback((url, options) => {
    return performanceService.optimizeImageUrl(url, options);
  }, []);

  const prefetchResource = useCallback((url, type) => {
    performanceService.prefetchResource(url, type);
  }, []);

  const observeElement = useCallback((element) => {
    performanceService.observeElement(element);
  }, []);

  const getPerformanceSummary = useCallback(() => {
    return performanceService.getPerformanceSummary();
  }, []);

  return {
    startMark,
    endMark,
    optimizeImage,
    prefetchResource,
    observeElement,
    getPerformanceSummary,
  };
};

/**
 * Custom hook for lazy loading images
 */
export const useLazyImage = (src, options = {}) => {
  const imgRef = useRef(null);
  const { width, height, quality = 80 } = options;

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Set up lazy loading
    img.dataset.lazy = performanceService.optimizeImageUrl(src, {
      width,
      height,
      quality,
    });

    // Add loading placeholder
    img.style.backgroundColor = '#f3f4f6';

    // Observe for lazy loading
    performanceService.observeElement(img);

    return () => {
      performanceService.unobserveElement(img);
    };
  }, [src, width, height, quality]);

  return imgRef;
};

export default {
  useRealTimeFeatures,
  usePerformanceMonitoring,
  useLazyImage,
};
