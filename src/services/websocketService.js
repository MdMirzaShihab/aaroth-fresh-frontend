/**
 * WebSocket Service for Real-time Features
 * Handles real-time order updates, notifications, and live data sync
 */

import { store } from '../store';
import { addNotification } from '../store/slices/notificationSlice';
import { updateOrderStatus } from '../store/slices/orderSlice';
import { incrementUnreadNotifications } from '../store/slices/notificationSlice';

class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 1000; // Start with 1 second
    this.isConnected = false;
    this.listeners = new Map();
    this.heartbeatInterval = null;
    this.messageQueue = [];
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';
        this.ws = new WebSocket(`${wsUrl}?token=${token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          
          // Only attempt reconnection if not manually closed
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(token);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  // Handle incoming messages
  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'order_update':
        this.handleOrderUpdate(payload);
        break;
      case 'notification':
        this.handleNotification(payload);
        break;
      case 'listing_update':
        this.handleListingUpdate(payload);
        break;
      case 'user_status':
        this.handleUserStatus(payload);
        break;
      case 'pong':
        // Heartbeat response
        break;
      default:
        console.warn('Unknown WebSocket message type:', type);
    }

    // Notify custom listeners
    if (this.listeners.has(type)) {
      this.listeners.get(type).forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  // Handle order status updates
  handleOrderUpdate(payload) {
    const { orderId, status, vendorId, restaurantId } = payload;
    
    // Update Redux store
    store.dispatch(updateOrderStatus({ orderId, status }));

    // Show notification to user
    const message = this.getOrderUpdateMessage(status);
    store.dispatch(addNotification({
      id: `order_${orderId}_${Date.now()}`,
      type: 'info',
      title: 'Order Update',
      message: `Order #${orderId.slice(-6)} ${message}`,
      timestamp: Date.now(),
      read: false,
      data: { orderId, status, type: 'order_update' }
    }));

    store.dispatch(incrementUnreadNotifications());
  }

  // Handle notifications
  handleNotification(payload) {
    const { id, title, message, type, data } = payload;
    
    store.dispatch(addNotification({
      id: id || `notification_${Date.now()}`,
      type: type || 'info',
      title: title || 'Notification',
      message,
      timestamp: Date.now(),
      read: false,
      data
    }));

    store.dispatch(incrementUnreadNotifications());

    // Show browser notification if permission granted
    this.showBrowserNotification(title || 'Aaroth Fresh', message);
  }

  // Handle listing updates (for vendors)
  handleListingUpdate(payload) {
    // This would typically trigger a refetch of listings data
    console.log('Listing update received:', payload);
  }

  // Handle user status updates
  handleUserStatus(payload) {
    console.log('User status update:', payload);
  }

  // Get order update message based on status
  getOrderUpdateMessage(status) {
    const messages = {
      'confirmed': 'has been confirmed by the vendor',
      'preparing': 'is being prepared',
      'ready': 'is ready for pickup/delivery',
      'shipped': 'has been shipped',
      'delivered': 'has been delivered',
      'cancelled': 'has been cancelled'
    };
    return messages[status] || `status updated to ${status}`;
  }

  // Show browser notification
  showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'aaroth-fresh-notification',
        requireInteraction: false,
        timestamp: Date.now()
      });
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }

  // Attempt to reconnect
  attemptReconnect(token) {
    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1), 30000);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect(token).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, 30000); // Send ping every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Send message to server
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      // Queue message for later sending
      this.messageQueue.push(data);
    }
  }

  // Flush queued messages
  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  // Add event listener
  addEventListener(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type).add(callback);
  }

  // Remove event listener
  removeEventListener(type, callback) {
    if (this.listeners.has(type)) {
      this.listeners.get(type).delete(callback);
    }
  }

  // Join room (for role-specific updates)
  joinRoom(roomName) {
    this.send({
      type: 'join_room',
      room: roomName
    });
  }

  // Leave room
  leaveRoom(roomName) {
    this.send({
      type: 'leave_room',
      room: roomName
    });
  }

  // Subscribe to order updates
  subscribeToOrderUpdates(orderId) {
    this.send({
      type: 'subscribe',
      resource: 'order',
      id: orderId
    });
  }

  // Unsubscribe from order updates
  unsubscribeFromOrderUpdates(orderId) {
    this.send({
      type: 'unsubscribe',
      resource: 'order',
      id: orderId
    });
  }

  // Disconnect WebSocket
  disconnect() {
    this.isConnected = false;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      readyState: this.ws ? this.ws.readyState : WebSocket.CLOSED,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export default new WebSocketService();