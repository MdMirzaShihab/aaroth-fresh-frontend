/**
 * useAdminLayout Hook - Admin V2
 * Layout state management and context provider
 * Handles sidebar, navigation, notifications, and real-time updates
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../useTheme';

// Initial state for admin layout
const initialState = {
  // Sidebar state
  sidebarOpen: false,
  sidebarPinned: false,
  expandedSections: {},
  
  // Navigation state
  currentPage: '',
  navigationHistory: [],
  
  // Notification state
  notifications: [],
  unreadCount: 0,
  notificationsPanelOpen: false,
  
  // Real-time updates
  realTimeEnabled: true,
  lastUpdate: null,
  connectionStatus: 'connected',
  
  // Mobile state
  isMobile: false,
  touchNavigation: false,
  
  // Search state
  globalSearchOpen: false,
  searchQuery: '',
  searchResults: [],
  
  // Performance state
  layoutLoading: false,
  preloadedRoutes: [],
  
  // Badge counts (real-time)
  badgeCounts: {
    pendingUsers: 12,
    urgentVendors: 3,
    infoRestaurants: 7,
    systemAlerts: 2
  }
};

// Action types
const ACTION_TYPES = {
  // Sidebar actions
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR_OPEN: 'SET_SIDEBAR_OPEN',
  TOGGLE_SIDEBAR_PIN: 'TOGGLE_SIDEBAR_PIN',
  TOGGLE_SECTION: 'TOGGLE_SECTION',
  
  // Navigation actions
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  ADD_TO_HISTORY: 'ADD_TO_HISTORY',
  CLEAR_HISTORY: 'CLEAR_HISTORY',
  
  // Notification actions
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  MARK_AS_READ: 'MARK_AS_READ',
  TOGGLE_NOTIFICATIONS_PANEL: 'TOGGLE_NOTIFICATIONS_PANEL',
  UPDATE_BADGE_COUNTS: 'UPDATE_BADGE_COUNTS',
  
  // Real-time actions
  UPDATE_CONNECTION_STATUS: 'UPDATE_CONNECTION_STATUS',
  TOGGLE_REAL_TIME: 'TOGGLE_REAL_TIME',
  SET_LAST_UPDATE: 'SET_LAST_UPDATE',
  
  // Mobile actions
  SET_MOBILE: 'SET_MOBILE',
  TOGGLE_TOUCH_NAVIGATION: 'TOGGLE_TOUCH_NAVIGATION',
  
  // Search actions
  TOGGLE_GLOBAL_SEARCH: 'TOGGLE_GLOBAL_SEARCH',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SEARCH_RESULTS: 'SET_SEARCH_RESULTS',
  
  // Performance actions
  SET_LAYOUT_LOADING: 'SET_LAYOUT_LOADING',
  ADD_PRELOADED_ROUTE: 'ADD_PRELOADED_ROUTE'
};

// Layout reducer
const adminLayoutReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      };
    
    case ACTION_TYPES.SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload
      };
    
    case ACTION_TYPES.TOGGLE_SIDEBAR_PIN:
      return {
        ...state,
        sidebarPinned: !state.sidebarPinned
      };
    
    case ACTION_TYPES.TOGGLE_SECTION:
      return {
        ...state,
        expandedSections: {
          ...state.expandedSections,
          [action.payload]: !state.expandedSections[action.payload]
        }
      };
    
    case ACTION_TYPES.SET_CURRENT_PAGE:
      return {
        ...state,
        currentPage: action.payload
      };
    
    case ACTION_TYPES.ADD_TO_HISTORY:
      const newHistory = [...state.navigationHistory, action.payload].slice(-10); // Keep last 10
      return {
        ...state,
        navigationHistory: newHistory
      };
    
    case ACTION_TYPES.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50), // Max 50 notifications
        unreadCount: state.unreadCount + 1
      };
    
    case ACTION_TYPES.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case ACTION_TYPES.MARK_AS_READ:
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    
    case ACTION_TYPES.TOGGLE_NOTIFICATIONS_PANEL:
      return {
        ...state,
        notificationsPanelOpen: !state.notificationsPanelOpen
      };
    
    case ACTION_TYPES.UPDATE_BADGE_COUNTS:
      return {
        ...state,
        badgeCounts: { ...state.badgeCounts, ...action.payload }
      };
    
    case ACTION_TYPES.UPDATE_CONNECTION_STATUS:
      return {
        ...state,
        connectionStatus: action.payload,
        lastUpdate: action.payload === 'connected' ? new Date() : state.lastUpdate
      };
    
    case ACTION_TYPES.SET_MOBILE:
      return {
        ...state,
        isMobile: action.payload
      };
    
    case ACTION_TYPES.TOGGLE_GLOBAL_SEARCH:
      return {
        ...state,
        globalSearchOpen: !state.globalSearchOpen
      };
    
    case ACTION_TYPES.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload
      };
    
    case ACTION_TYPES.SET_LAYOUT_LOADING:
      return {
        ...state,
        layoutLoading: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AdminLayoutContext = createContext();

// Provider component
export const AdminLayoutProvider = ({ children }) => {
  const [state, dispatch] = useReducer(adminLayoutReducer, initialState);
  const location = useLocation();
  const { isDarkMode } = useTheme();

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 1024;
      if (isMobile !== state.isMobile) {
        dispatch({ type: ACTION_TYPES.SET_MOBILE, payload: isMobile });
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [state.isMobile]);

  // Route change handling
  useEffect(() => {
    const currentPath = location.pathname;
    dispatch({ type: ACTION_TYPES.SET_CURRENT_PAGE, payload: currentPath });
    dispatch({ 
      type: ACTION_TYPES.ADD_TO_HISTORY, 
      payload: {
        path: currentPath,
        timestamp: new Date(),
        title: document.title
      }
    });

    // Close mobile sidebar on route change
    if (state.isMobile && state.sidebarOpen) {
      dispatch({ type: ACTION_TYPES.SET_SIDEBAR_OPEN, payload: false });
    }
  }, [location.pathname, state.isMobile, state.sidebarOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e) => {
      // Command/Ctrl + K for global search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        dispatch({ type: ACTION_TYPES.TOGGLE_GLOBAL_SEARCH });
      }
      
      // Escape to close modals/panels
      if (e.key === 'Escape') {
        if (state.globalSearchOpen) {
          dispatch({ type: ACTION_TYPES.TOGGLE_GLOBAL_SEARCH });
        }
        if (state.notificationsPanelOpen) {
          dispatch({ type: ACTION_TYPES.TOGGLE_NOTIFICATIONS_PANEL });
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [state.globalSearchOpen, state.notificationsPanelOpen]);

  // Mock real-time updates (for demonstration)
  useEffect(() => {
    if (!state.realTimeEnabled) return;

    const interval = setInterval(() => {
      // Simulate badge count updates
      const randomUpdates = {
        pendingUsers: Math.floor(Math.random() * 20) + 5,
        urgentVendors: Math.floor(Math.random() * 10),
        infoRestaurants: Math.floor(Math.random() * 15) + 2,
        systemAlerts: Math.floor(Math.random() * 5)
      };
      
      dispatch({ type: ACTION_TYPES.UPDATE_BADGE_COUNTS, payload: randomUpdates });
      
      // Simulate occasional notifications
      if (Math.random() < 0.3) { // 30% chance
        const notifications = [
          { type: 'urgent', title: 'New Vendor Registration', message: 'Review pending vendor application' },
          { type: 'info', title: 'System Update', message: 'System maintenance completed successfully' },
          { type: 'success', title: 'Order Processed', message: 'New order has been processed' }
        ];
        
        const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
        addNotification({
          ...randomNotification,
          id: Date.now() + Math.random(),
          timestamp: new Date(),
          read: false
        });
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [state.realTimeEnabled]);

  // Action creators
  const toggleSidebar = useCallback(() => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SIDEBAR });
  }, []);

  const setSidebarOpen = useCallback((open) => {
    dispatch({ type: ACTION_TYPES.SET_SIDEBAR_OPEN, payload: open });
  }, []);

  const toggleSection = useCallback((sectionKey) => {
    dispatch({ type: ACTION_TYPES.TOGGLE_SECTION, payload: sectionKey });
  }, []);

  const addNotification = useCallback((notification) => {
    dispatch({ type: ACTION_TYPES.ADD_NOTIFICATION, payload: notification });
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({ type: ACTION_TYPES.REMOVE_NOTIFICATION, payload: id });
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({ type: ACTION_TYPES.MARK_AS_READ, payload: id });
  }, []);

  const toggleNotificationsPanel = useCallback(() => {
    dispatch({ type: ACTION_TYPES.TOGGLE_NOTIFICATIONS_PANEL });
  }, []);

  const toggleGlobalSearch = useCallback(() => {
    dispatch({ type: ACTION_TYPES.TOGGLE_GLOBAL_SEARCH });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ACTION_TYPES.SET_SEARCH_QUERY, payload: query });
  }, []);

  const setLayoutLoading = useCallback((loading) => {
    dispatch({ type: ACTION_TYPES.SET_LAYOUT_LOADING, payload: loading });
  }, []);

  // Context value
  const contextValue = {
    // State
    ...state,
    
    // Actions
    toggleSidebar,
    setSidebarOpen,
    toggleSection,
    addNotification,
    removeNotification,
    markAsRead,
    toggleNotificationsPanel,
    toggleGlobalSearch,
    setSearchQuery,
    setLayoutLoading,
    
    // Computed values
    isCompactMode: state.isMobile || (!state.sidebarPinned && !state.sidebarOpen),
    hasUnreadNotifications: state.unreadCount > 0,
    totalBadges: Object.values(state.badgeCounts).reduce((sum, count) => sum + count, 0)
  };

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      {children}
    </AdminLayoutContext.Provider>
  );
};

// Hook to use admin layout context
export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext);
  
  if (!context) {
    throw new Error('useAdminLayout must be used within AdminLayoutProvider');
  }
  
  return context;
};

export default useAdminLayout;