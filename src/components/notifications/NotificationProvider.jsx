import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import {
  addNotification,
  updateNotificationSettings,
  selectNotificationSettings,
} from '../../store/slices/notificationSlice';
import { ToastContainer } from '../ui/Toast';

/**
 * Notification Provider - MVP Version
 * Handles browser notification permissions and displays toast notifications
 * Real-time features removed for MVP - notifications are now pull-based
 */
const NotificationProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const notificationSettings = useSelector(selectNotificationSettings);

  // Initialize notification system (pull-based)
  useEffect(() => {
    if (isAuthenticated && user) {
      initializeNotifications();
    }
  }, [isAuthenticated, user]);

  // Initialize browser notifications only
  const initializeNotifications = useCallback(async () => {
    try {
      // Request browser notification permission if enabled
      if (notificationSettings.enablePush) {
        const permissionGranted = await requestNotificationPermission();

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
    }
  }, [dispatch, user, notificationSettings.enablePush]);

  // Request browser notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, []);

  // Play notification sound (kept for future use)
  const playNotificationSound = useCallback(
    (type) => {
      if (!notificationSettings.enableSound) return;

      try {
        const audio = new Audio();

        // Different sounds for different notification types
        switch (type) {
          case 'success':
            audio.src = '/sounds/success.mp3';
            break;
          case 'error':
            audio.src = '/sounds/error.mp3';
            break;
          case 'warning':
            audio.src = '/sounds/warning.mp3';
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
    },
    [notificationSettings.enableSound]
  );

  return (
    <>
      {children}
      {/* Toast notifications container */}
      <ToastContainer position="top-right" maxToasts={5} className="z-[9999]" />
    </>
  );
};

export default NotificationProvider;
