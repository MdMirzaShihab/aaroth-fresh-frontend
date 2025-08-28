/**
 * useRealtimeDashboard Hook - WebSocket Integration for Real-time Dashboard Updates
 * Features: Live data streaming, notification handling, connection management, fallback polling
 * Provides real-time updates for KPIs, activities, system health, and verification queues
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const useRealtimeDashboard = ({
  enabled = true,
  fallbackInterval = 30000, // 30 seconds fallback polling
  reconnectInterval = 5000,  // 5 seconds reconnect attempt
  maxReconnectAttempts = 5,
  onKPIUpdate,
  onActivityUpdate,
  onSystemHealthUpdate,
  onVerificationUpdate,
  onNotification
}) => {
  const { token } = useSelector(state => state.auth);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [metrics, setMetrics] = useState({
    messagesReceived: 0,
    lastHeartbeat: null,
    connectionQuality: 'good' // good, fair, poor
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const fallbackIntervalRef = useRef(null);
  const heartbeatIntervalRef = useRef(null);
  const isUnmountedRef = useRef(false);

  // WebSocket URL configuration
  const getWebSocketUrl = useCallback(() => {
    const baseUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:5000';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = baseUrl.replace(/^https?:/, protocol);
    return `${wsUrl}/admin/dashboard/live-updates?token=${token}`;
  }, [token]);

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      
      setMetrics(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + 1,
        lastHeartbeat: data.type === 'heartbeat' ? new Date() : prev.lastHeartbeat
      }));

      switch (data.type) {
        case 'kpi_update':
          setLastUpdate(new Date());
          onKPIUpdate?.(data.payload);
          break;

        case 'activity_update':
          setLastUpdate(new Date());
          onActivityUpdate?.(data.payload);
          
          // Show toast notification for important activities
          if (data.payload.priority === 'high' || data.payload.urgent) {
            toast(`New ${data.payload.type}: ${data.payload.message}`, {
              icon: data.payload.type === 'error' ? '🚨' : '🔔',
              duration: 4000
            });
          }
          break;

        case 'system_health_update':
          setLastUpdate(new Date());
          onSystemHealthUpdate?.(data.payload);
          
          // Alert for critical system health issues
          if (data.payload.status === 'critical') {
            toast.error(`System Alert: ${data.payload.message}`);
          }
          break;

        case 'verification_update':
          setLastUpdate(new Date());
          onVerificationUpdate?.(data.payload);
          break;

        case 'notification':
          onNotification?.(data.payload);
          
          // Show toast for notifications
          const toastConfig = {
            duration: data.payload.persistent ? 0 : 4000,
            style: data.payload.type === 'error' 
              ? { background: '#FEE2E2', color: '#DC2626' }
              : data.payload.type === 'success'
              ? { background: '#ECFDF5', color: '#059669' }
              : { background: '#F3F4F6', color: '#374151' }
          };

          if (data.payload.type === 'error') {
            toast.error(data.payload.message, toastConfig);
          } else if (data.payload.type === 'success') {
            toast.success(data.payload.message, toastConfig);
          } else {
            toast(data.payload.message, { 
              ...toastConfig,
              icon: data.payload.icon || '📢'
            });
          }
          break;

        case 'heartbeat':
          // Update connection quality based on heartbeat timing
          const now = new Date();
          const lastHeartbeat = metrics.lastHeartbeat;
          if (lastHeartbeat) {
            const timeDiff = now - lastHeartbeat;
            const quality = timeDiff < 35000 ? 'good' : timeDiff < 60000 ? 'fair' : 'poor';
            setMetrics(prev => ({ ...prev, connectionQuality: quality }));
          }
          break;

        case 'error':
          console.error('WebSocket error message:', data.payload);
          toast.error(`Dashboard Error: ${data.payload.message}`);
          break;

        default:
          console.log('Unknown WebSocket message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [onKPIUpdate, onActivityUpdate, onSystemHealthUpdate, onVerificationUpdate, onNotification, metrics.lastHeartbeat]);

  // Establish WebSocket connection
  const connect = useCallback(() => {
    if (!enabled || !token || isUnmountedRef.current) {
      return;
    }

    try {
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Dashboard WebSocket connected');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
        
        // Start heartbeat monitoring
        heartbeatIntervalRef.current = setInterval(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);

        // Stop fallback polling if it was running
        if (fallbackIntervalRef.current) {
          clearInterval(fallbackIntervalRef.current);
          fallbackIntervalRef.current = null;
        }

        toast.success('Real-time dashboard connected', { duration: 2000 });
      };

      wsRef.current.onmessage = handleMessage;

      wsRef.current.onclose = (event) => {
        console.log('Dashboard WebSocket disconnected:', event.code, event.reason);
        setConnectionStatus('disconnected');
        
        // Clear heartbeat interval
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
          heartbeatIntervalRef.current = null;
        }

        // Attempt to reconnect if not intentionally closed
        if (event.code !== 1000 && !isUnmountedRef.current) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('Dashboard WebSocket error:', error);
        setConnectionStatus('error');
        setMetrics(prev => ({ ...prev, connectionQuality: 'poor' }));
      };

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  }, [enabled, token, getWebSocketUrl, handleMessage]);

  // Schedule reconnection attempt
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts || isUnmountedRef.current) {
      console.log('Max reconnection attempts reached, starting fallback polling');
      setConnectionStatus('fallback');
      startFallbackPolling();
      return;
    }

    setConnectionStatus('reconnecting');
    setReconnectAttempts(prev => prev + 1);

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        connect();
      }
    }, reconnectInterval * Math.pow(2, reconnectAttempts)); // Exponential backoff
  }, [reconnectAttempts, maxReconnectAttempts, reconnectInterval, connect]);

  // Fallback polling mechanism
  const startFallbackPolling = useCallback(() => {
    if (fallbackIntervalRef.current || !enabled) {
      return;
    }

    console.log('Starting fallback polling for dashboard data');
    
    const pollData = async () => {
      try {
        // This would typically call your regular API endpoints
        // as a fallback when WebSocket is not available
        const response = await fetch('/api/v1/admin/dashboard/poll', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          // Dispatch updates similar to WebSocket messages
          if (data.kpis) onKPIUpdate?.(data.kpis);
          if (data.activities) onActivityUpdate?.(data.activities);
          if (data.systemHealth) onSystemHealthUpdate?.(data.systemHealth);
          if (data.verifications) onVerificationUpdate?.(data.verifications);
          
          setLastUpdate(new Date());
          setMetrics(prev => ({ 
            ...prev, 
            connectionQuality: 'fair' // Polling is slower than real-time
          }));
        }
      } catch (error) {
        console.error('Fallback polling error:', error);
        setMetrics(prev => ({ ...prev, connectionQuality: 'poor' }));
      }
    };

    // Initial poll
    pollData();
    
    // Set up interval
    fallbackIntervalRef.current = setInterval(pollData, fallbackInterval);
  }, [enabled, token, fallbackInterval, onKPIUpdate, onActivityUpdate, onSystemHealthUpdate, onVerificationUpdate]);

  // Manually trigger reconnection
  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual reconnect');
    }
    
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
    }
    
    setReconnectAttempts(0);
    setConnectionStatus('connecting');
    
    setTimeout(() => {
      if (!isUnmountedRef.current) {
        connect();
      }
    }, 100);
  }, [connect]);

  // Send message to WebSocket
  const sendMessage = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Initialize connection
  useEffect(() => {
    if (enabled && token) {
      setConnectionStatus('connecting');
      connect();
    }

    return () => {
      isUnmountedRef.current = true;
      
      // Cleanup WebSocket
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
      }
      
      // Clear timers
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
      }
      
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [enabled, token, connect]);

  // Update connection quality based on message frequency
  useEffect(() => {
    const qualityCheckInterval = setInterval(() => {
      const now = new Date();
      if (lastUpdate && now - lastUpdate > 60000) { // No updates for 1 minute
        setMetrics(prev => ({ 
          ...prev, 
          connectionQuality: connectionStatus === 'connected' ? 'fair' : 'poor' 
        }));
      }
    }, 30000);

    return () => clearInterval(qualityCheckInterval);
  }, [lastUpdate, connectionStatus]);

  return {
    // Connection state
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isFallback: connectionStatus === 'fallback',
    lastUpdate,
    
    // Connection metrics
    metrics: {
      ...metrics,
      reconnectAttempts,
      isRealTime: connectionStatus === 'connected'
    },
    
    // Actions
    reconnect,
    sendMessage,
    
    // Connection quality indicator for UI
    getConnectionIndicator: () => {
      switch (connectionStatus) {
        case 'connected':
          return { 
            status: 'connected', 
            color: 'green', 
            label: 'Live',
            quality: metrics.connectionQuality
          };
        case 'connecting':
        case 'reconnecting':
          return { 
            status: 'connecting', 
            color: 'yellow', 
            label: 'Connecting...',
            quality: 'fair'
          };
        case 'fallback':
          return { 
            status: 'fallback', 
            color: 'blue', 
            label: 'Polling',
            quality: 'fair'
          };
        case 'error':
        case 'disconnected':
        default:
          return { 
            status: 'disconnected', 
            color: 'red', 
            label: 'Offline',
            quality: 'poor'
          };
      }
    }
  };
};

export default useRealtimeDashboard;