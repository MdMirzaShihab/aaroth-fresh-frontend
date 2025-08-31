/**
 * useMobileOptimization - React Hook for Mobile Optimization
 * Features: Device detection, touch target validation, gesture handling, responsive utilities
 * Provides comprehensive mobile optimization for admin-v2 components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  detectMobileDevice,
  getViewportCategory,
  isMobileViewport,
  validateTouchTarget,
  attachGestureHandlers,
  optimizeForMobile,
  virtualKeyboard,
  mobilePerformance,
  TOUCH_TARGETS,
} from '../utils/mobileOptimization';

/**
 * Hook for detecting and responding to mobile devices
 * @returns {Object} Device information and utilities
 */
export const useMobileDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState(() => detectMobileDevice());
  const [viewportCategory, setViewportCategory] = useState(() =>
    getViewportCategory()
  );

  useEffect(() => {
    const handleResize = mobilePerformance.throttle(() => {
      setDeviceInfo(detectMobileDevice());
      setViewportCategory(getViewportCategory());
    }, 100);

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobile = deviceInfo.isMobile || isMobileViewport();
  const isTablet = deviceInfo.isTablet;
  const isTouchDevice = deviceInfo.isTouchDevice;
  const isDesktop = !isMobile && !isTablet;

  return {
    ...deviceInfo,
    isMobile,
    isTablet,
    isTouchDevice,
    isDesktop,
    viewportCategory,
    isMobileViewport: isMobileViewport(),
    // Responsive utilities
    isXs: viewportCategory === 'xs',
    isSm: viewportCategory === 'sm',
    isMd: viewportCategory === 'md',
    isLg: viewportCategory === 'lg',
    isXl: viewportCategory === 'xl',
    is2Xl: viewportCategory === '2xl',
    // Responsive checks
    isMobileOrTablet: isMobile || isTablet,
    isSmallScreen: ['xs', 'sm'].includes(viewportCategory),
    isMediumScreen: ['md', 'lg'].includes(viewportCategory),
    isLargeScreen: ['xl', '2xl'].includes(viewportCategory),
  };
};

/**
 * Hook for touch target validation and optimization
 * @param {Object} options - Optimization options
 * @returns {Object} Touch target utilities
 */
export const useTouchTargets = (options = {}) => {
  const { autoOptimize = true, enableFeedback = true } = options;
  const optimizedElements = useRef(new Set());

  // Validate multiple touch targets
  const validateTouchTargets = useCallback((elements) => {
    if (!Array.isArray(elements)) {
      elements = [elements];
    }

    return elements
      .map((element) => {
        if (typeof element === 'string') {
          element = document.querySelector(element);
        }
        return element ? validateTouchTarget(element) : null;
      })
      .filter(Boolean);
  }, []);

  // Optimize elements for touch
  const optimizeTouchTargets = useCallback(
    (elements, customOptions = {}) => {
      if (!Array.isArray(elements)) {
        elements = [elements];
      }

      const finalOptions = { ...options, ...customOptions };

      elements.forEach((element) => {
        if (typeof element === 'string') {
          element = document.querySelector(element);
        }

        if (element && !optimizedElements.current.has(element)) {
          optimizeForMobile(element, finalOptions);
          optimizedElements.current.add(element);
        }
      });
    },
    [options]
  );

  // Auto-optimize all interactive elements on mount
  useEffect(() => {
    if (!autoOptimize) return;

    const interactiveSelectors = [
      'button',
      '[role="button"]',
      'a',
      'input',
      'select',
      'textarea',
      '[tabindex="0"]',
      '[onclick]',
      '.touch-target',
    ];

    const elements = document.querySelectorAll(interactiveSelectors.join(', '));
    optimizeTouchTargets(Array.from(elements));
  }, [autoOptimize, optimizeTouchTargets]);

  return {
    validateTouchTargets,
    optimizeTouchTargets,
    TOUCH_TARGETS,
    // Utility functions
    addTouchTarget: (element) => optimizeTouchTargets([element]),
    validateTouchTarget: (element) => validateTouchTarget(element),
  };
};

/**
 * Hook for gesture handling
 * @param {Object} callbacks - Gesture callbacks
 * @returns {Object} Gesture utilities
 */
export const useGestures = (callbacks = {}) => {
  const elementRef = useRef(null);
  const cleanupRef = useRef(null);

  // Attach gesture handlers to element
  const attachToElement = useCallback(
    (element) => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      if (element) {
        elementRef.current = element;
        cleanupRef.current = attachGestureHandlers(element, callbacks);
      }
    },
    [callbacks]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    attachToElement,
    elementRef,
    // Direct gesture handlers for ref usage
    gestureHandlers: {
      ref: attachToElement,
    },
  };
};

/**
 * Hook for virtual keyboard handling
 * @param {Object} callbacks - Virtual keyboard callbacks
 * @returns {Object} Virtual keyboard utilities
 */
export const useVirtualKeyboard = (callbacks = {}) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const cleanup = virtualKeyboard.onToggle({
      onOpen: (height) => {
        setIsKeyboardOpen(true);
        setKeyboardHeight(height);
        if (callbacks.onOpen) callbacks.onOpen(height);
      },
      onClose: () => {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
        if (callbacks.onClose) callbacks.onClose();
      },
    });

    return cleanup;
  }, [callbacks]);

  // Keep input visible when keyboard opens
  const keepInputVisible = useCallback((input) => {
    if (!input) return;
    return virtualKeyboard.keepInputVisible(input);
  }, []);

  return {
    isKeyboardOpen,
    keyboardHeight,
    keepInputVisible,
    isOpen: virtualKeyboard.isOpen,
  };
};

/**
 * Hook for responsive data tables
 * @param {Array} data - Table data
 * @param {Array} columns - Table columns
 * @returns {Object} Responsive table utilities
 */
export const useResponsiveTable = (data = [], columns = []) => {
  const { isMobile } = useMobileDetection();
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Automatically switch to card view on mobile
  useEffect(() => {
    if (isMobile && viewMode === 'table') {
      setViewMode('cards');
    } else if (!isMobile && viewMode === 'cards') {
      setViewMode('table');
    }
  }, [isMobile, viewMode]);

  // Get priority columns for mobile view
  const getPriorityColumns = useCallback(
    (maxColumns = 2) => {
      return columns
        .filter((col) => col.priority || col.required)
        .slice(0, maxColumns);
    },
    [columns]
  );

  // Transform data for card view
  const getCardData = useCallback(() => {
    return data.map((item) => {
      const cardItem = { ...item };
      cardItem._priorityColumns = getPriorityColumns();
      cardItem._allColumns = columns;
      return cardItem;
    });
  }, [data, columns, getPriorityColumns]);

  return {
    viewMode,
    setViewMode,
    isMobile,
    isTableView: viewMode === 'table',
    isCardView: viewMode === 'cards',
    priorityColumns: getPriorityColumns(),
    cardData: getCardData(),
    // Utilities
    shouldUseCards: isMobile,
    canSwitchView: true,
  };
};

/**
 * Hook for mobile-optimized forms
 * @param {Object} options - Form optimization options
 * @returns {Object} Mobile form utilities
 */
export const useMobileForm = (options = {}) => {
  const { autoFocus = false, keepVisible = true } = options;
  const { isKeyboardOpen } = useVirtualKeyboard();
  const formRef = useRef(null);

  // Optimize form inputs for mobile
  const optimizeFormInputs = useCallback(() => {
    if (!formRef.current) return;

    const inputs = formRef.current.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      // Add mobile-specific attributes
      if (input.type === 'email') {
        input.setAttribute('inputmode', 'email');
      } else if (input.type === 'tel') {
        input.setAttribute('inputmode', 'tel');
      } else if (input.type === 'number') {
        input.setAttribute('inputmode', 'numeric');
      }

      // Prevent zoom on focus (iOS)
      if (parseFloat(getComputedStyle(input).fontSize) < 16) {
        input.style.fontSize = '16px';
      }

      // Keep input visible when keyboard opens
      if (keepVisible) {
        virtualKeyboard.keepInputVisible(input);
      }
    });
  }, [keepVisible]);

  useEffect(() => {
    optimizeFormInputs();
  }, [optimizeFormInputs]);

  return {
    formRef,
    isKeyboardOpen,
    optimizeFormInputs,
    // Form-specific mobile classes
    getFormClasses: () => ({
      form: 'mobile-form touch-friendly',
      input: 'mobile-input touch-target',
      button: 'mobile-button touch-target-large',
      select: 'mobile-select touch-target',
    }),
  };
};

/**
 * Hook for mobile performance optimization
 * @returns {Object} Performance utilities
 */
export const useMobilePerformance = () => {
  // Debounced and throttled versions of common functions
  const debounce = useCallback((func, wait = 100) => {
    return mobilePerformance.debounce(func, wait);
  }, []);

  const throttle = useCallback((func, limit = 100) => {
    return mobilePerformance.throttle(func, limit);
  }, []);

  // Respect motion preferences
  const respectMotionPreferences = useCallback((element) => {
    return mobilePerformance.respectMotionPreferences(element);
  }, []);

  // Optimize element rendering
  const optimizeRendering = useCallback(
    (element) => {
      if (!element) return;

      // Add performance optimizations
      element.style.willChange = 'auto';
      element.style.backfaceVisibility = 'hidden';
      element.style.perspective = '1000px';

      // Respect motion preferences
      respectMotionPreferences(element);
    },
    [respectMotionPreferences]
  );

  return {
    debounce,
    throttle,
    respectMotionPreferences,
    optimizeRendering,
  };
};

/**
 * Comprehensive mobile optimization hook
 * @param {Object} options - Configuration options
 * @returns {Object} All mobile optimization utilities
 */
export const useMobileOptimization = (options = {}) => {
  const device = useMobileDetection();
  const touchTargets = useTouchTargets(options.touchTargets);
  const gestures = useGestures(options.gestures);
  const keyboard = useVirtualKeyboard(options.keyboard);
  const performance = useMobilePerformance();

  return {
    // Device detection
    ...device,

    // Touch targets
    ...touchTargets,

    // Gestures
    ...gestures,

    // Virtual keyboard
    ...keyboard,

    // Performance
    ...performance,

    // Utilities
    isMobileOptimized: true,
    optimizationEnabled: device.isMobile || device.isTablet,
  };
};

export default useMobileOptimization;
