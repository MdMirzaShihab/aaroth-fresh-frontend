/**
 * Mobile Optimization Utilities
 * Features: Touch target validation, gesture handling, viewport utilities
 * Provides comprehensive mobile optimization helpers for admin-v2 components
 */

// Touch target size constants (following accessibility guidelines)
export const TOUCH_TARGETS = {
  MINIMUM: 44, // px - minimum touch target size
  OPTIMAL: 48, // px - optimal touch target size for primary actions
  SPACING: 8, // px - minimum spacing between touch targets
};

// Viewport breakpoints for responsive design
export const MOBILE_BREAKPOINTS = {
  xs: 320, // Extra small phones
  sm: 640, // Small tablets
  md: 768, // Tablets
  lg: 1024, // Laptops
  xl: 1280, // Desktops
  '2xl': 1536, // Large desktops
};

// Touch-friendly CSS classes
export const TOUCH_CLASSES = {
  target: 'touch-target', // 44px minimum touch target
  targetLarge: 'touch-target-large', // 48px optimal touch target
  spacing: 'touch-spacing', // Adequate spacing between elements
  interactive: 'touch-interactive', // Enhanced touch feedback
};

/**
 * Validates if an element meets minimum touch target requirements
 * @param {HTMLElement} element - Element to validate
 * @returns {Object} Validation result with details
 */
export const validateTouchTarget = (element) => {
  if (!element) return { valid: false, reason: 'Element not found' };

  const rect = element.getBoundingClientRect();
  const { width, height } = rect;

  const isWidthValid = width >= TOUCH_TARGETS.MINIMUM;
  const isHeightValid = height >= TOUCH_TARGETS.MINIMUM;
  const isValid = isWidthValid && isHeightValid;

  return {
    valid: isValid,
    width,
    height,
    minWidth: TOUCH_TARGETS.MINIMUM,
    minHeight: TOUCH_TARGETS.MINIMUM,
    widthValid: isWidthValid,
    heightValid: isHeightValid,
    suggestions: !isValid
      ? [
          !isWidthValid ? `Increase width to ${TOUCH_TARGETS.MINIMUM}px` : null,
          !isHeightValid
            ? `Increase height to ${TOUCH_TARGETS.MINIMUM}px`
            : null,
        ].filter(Boolean)
      : [],
  };
};

/**
 * Detects if the current device is mobile/tablet
 * @returns {Object} Device detection result
 */
export const detectMobileDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      userAgent
    );
  const isTablet = /(iPad|tablet|playbook|silk)|(android(?!.*mobile))/i.test(
    userAgent
  );
  const isTouchDevice =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return {
    isMobile,
    isTablet,
    isTouchDevice,
    isDesktop: !isMobile && !isTablet,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
  };
};

/**
 * Gets the current viewport size category
 * @returns {string} Viewport category (xs, sm, md, lg, xl, 2xl)
 */
export const getViewportCategory = () => {
  const width = window.innerWidth;

  if (width < MOBILE_BREAKPOINTS.sm) return 'xs';
  if (width < MOBILE_BREAKPOINTS.md) return 'sm';
  if (width < MOBILE_BREAKPOINTS.lg) return 'md';
  if (width < MOBILE_BREAKPOINTS.xl) return 'lg';
  if (width < MOBILE_BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
};

/**
 * Checks if the current viewport is mobile-sized
 * @returns {boolean} True if viewport is mobile-sized
 */
export const isMobileViewport = () => {
  return window.innerWidth < MOBILE_BREAKPOINTS.md;
};

/**
 * Handles touch gesture recognition
 * @param {HTMLElement} element - Element to attach gesture handlers
 * @param {Object} callbacks - Gesture callbacks
 */
export const attachGestureHandlers = (element, callbacks = {}) => {
  if (!element) return;

  let startX = 0;
  let startY = 0;
  let startTime = 0;
  let isScrolling = false;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    startTime = Date.now();
    isScrolling = false;

    if (callbacks.onTouchStart) {
      callbacks.onTouchStart(e);
    }
  };

  const handleTouchMove = (e) => {
    if (!startX || !startY) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    // Determine if user is scrolling vertically
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      isScrolling = true;
    }

    if (callbacks.onTouchMove) {
      callbacks.onTouchMove(e, { deltaX, deltaY, isScrolling });
    }
  };

  const handleTouchEnd = (e) => {
    if (!startX || !startY) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    const deltaTime = Date.now() - startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    // Swipe detection
    const SWIPE_THRESHOLD = 50;
    const SWIPE_VELOCITY_THRESHOLD = 0.3;

    if (
      !isScrolling &&
      distance > SWIPE_THRESHOLD &&
      velocity > SWIPE_VELOCITY_THRESHOLD
    ) {
      const direction =
        Math.abs(deltaX) > Math.abs(deltaY)
          ? deltaX > 0
            ? 'right'
            : 'left'
          : deltaY > 0
            ? 'down'
            : 'up';

      if (callbacks.onSwipe) {
        callbacks.onSwipe({ direction, distance, velocity, deltaX, deltaY });
      }
    }

    // Tap detection
    const TAP_THRESHOLD = 10;
    const TAP_TIME_THRESHOLD = 200;

    if (distance < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
      if (callbacks.onTap) {
        callbacks.onTap(e);
      }
    }

    // Long press detection
    const LONG_PRESS_THRESHOLD = 500;

    if (distance < TAP_THRESHOLD && deltaTime > LONG_PRESS_THRESHOLD) {
      if (callbacks.onLongPress) {
        callbacks.onLongPress(e);
      }
    }

    if (callbacks.onTouchEnd) {
      callbacks.onTouchEnd(e, {
        deltaX,
        deltaY,
        deltaTime,
        distance,
        velocity,
      });
    }

    // Reset
    startX = 0;
    startY = 0;
    startTime = 0;
    isScrolling = false;
  };

  element.addEventListener('touchstart', handleTouchStart, { passive: true });
  element.addEventListener('touchmove', handleTouchMove, { passive: true });
  element.addEventListener('touchend', handleTouchEnd, { passive: true });

  // Return cleanup function
  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchmove', handleTouchMove);
    element.removeEventListener('touchend', handleTouchEnd);
  };
};

/**
 * Optimizes element for mobile interaction
 * @param {HTMLElement} element - Element to optimize
 * @param {Object} options - Optimization options
 */
export const optimizeForMobile = (element, options = {}) => {
  if (!element) return;

  const {
    enableTouchFeedback = true,
    ensureMinimumSize = true,
    addTouchClass = true,
    preventDoubleZoom = true,
  } = options;

  // Add touch target class
  if (addTouchClass && !element.classList.contains(TOUCH_CLASSES.target)) {
    element.classList.add(TOUCH_CLASSES.target);
  }

  // Ensure minimum touch target size
  if (ensureMinimumSize) {
    const validation = validateTouchTarget(element);
    if (!validation.valid) {
      const computedStyle = getComputedStyle(element);
      const currentWidth = parseFloat(computedStyle.width);
      const currentHeight = parseFloat(computedStyle.height);

      if (currentWidth < TOUCH_TARGETS.MINIMUM) {
        element.style.minWidth = `${TOUCH_TARGETS.MINIMUM}px`;
      }
      if (currentHeight < TOUCH_TARGETS.MINIMUM) {
        element.style.minHeight = `${TOUCH_TARGETS.MINIMUM}px`;
      }
    }
  }

  // Add touch feedback
  if (enableTouchFeedback) {
    element.style.transition =
      element.style.transition || 'transform 0.1s ease, opacity 0.1s ease';

    const handleTouchStart = () => {
      element.style.transform = 'scale(0.98)';
      element.style.opacity = '0.8';
    };

    const handleTouchEnd = () => {
      element.style.transform = 'scale(1)';
      element.style.opacity = '1';
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    element.addEventListener('touchcancel', handleTouchEnd, { passive: true });
  }

  // Prevent double-tap zoom on buttons
  if (
    preventDoubleZoom &&
    (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button')
  ) {
    element.style.touchAction = 'manipulation';
  }
};

/**
 * Virtual keyboard utilities
 */
export const virtualKeyboard = {
  /**
   * Detects if virtual keyboard is open (mobile only)
   * @returns {boolean} True if virtual keyboard is likely open
   */
  isOpen() {
    const deviceInfo = detectMobileDevice();
    if (!deviceInfo.isMobile) return false;

    // Simple heuristic: significant reduction in viewport height
    const currentHeight = window.innerHeight;
    const screenHeight = window.screen.height;
    const reductionThreshold = 150; // pixels

    return screenHeight - currentHeight > reductionThreshold;
  },

  /**
   * Handles virtual keyboard events
   * @param {Object} callbacks - Event callbacks
   */
  onToggle(callbacks = {}) {
    let initialViewportHeight = window.innerHeight;

    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      const threshold = 150;

      if (heightDifference > threshold && callbacks.onOpen) {
        callbacks.onOpen(heightDifference);
      } else if (heightDifference <= threshold && callbacks.onClose) {
        callbacks.onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  },

  /**
   * Ensures input is visible when virtual keyboard opens
   * @param {HTMLInputElement} input - Input element to keep visible
   */
  keepInputVisible(input) {
    if (!input) return;

    const handleFocus = () => {
      setTimeout(() => {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300); // Wait for keyboard animation
    };

    input.addEventListener('focus', handleFocus);
    return () => input.removeEventListener('focus', handleFocus);
  },
};

/**
 * Safe area utilities for devices with notches/rounded corners
 */
export const safeArea = {
  /**
   * Gets safe area insets
   * @returns {Object} Safe area insets in pixels
   */
  getInsets() {
    const computedStyle = getComputedStyle(document.documentElement);

    return {
      top:
        parseInt(computedStyle.getPropertyValue('--safe-area-inset-top'), 10) ||
        0,
      right:
        parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-right'),
          10
        ) || 0,
      bottom:
        parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-bottom'),
          10
        ) || 0,
      left:
        parseInt(
          computedStyle.getPropertyValue('--safe-area-inset-left'),
          10
        ) || 0,
    };
  },

  /**
   * Applies safe area padding to an element
   * @param {HTMLElement} element - Element to apply safe area padding
   * @param {string[]} sides - Sides to apply padding ('top', 'right', 'bottom', 'left')
   */
  applyPadding(element, sides = ['top', 'bottom']) {
    if (!element) return;

    sides.forEach((side) => {
      element.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] =
        `calc(${element.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] || '0px'} + var(--safe-area-inset-${side}))`;
    });
  },
};

/**
 * Performance optimization for mobile
 */
export const mobilePerformance = {
  /**
   * Debounces a function to reduce excessive calls on mobile
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} Debounced function
   */
  debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttles a function to limit execution frequency
   * @param {Function} func - Function to throttle
   * @param {number} limit - Time limit in milliseconds
   * @returns {Function} Throttled function
   */
  throttle(func, limit = 100) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Reduces motion for users who prefer reduced motion
   * @param {HTMLElement} element - Element to apply reduced motion
   */
  respectMotionPreferences(element) {
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      element.style.animation = 'none';
      element.style.transition = 'none';
    }
  },
};

export default {
  TOUCH_TARGETS,
  MOBILE_BREAKPOINTS,
  TOUCH_CLASSES,
  validateTouchTarget,
  detectMobileDevice,
  getViewportCategory,
  isMobileViewport,
  attachGestureHandlers,
  optimizeForMobile,
  virtualKeyboard,
  safeArea,
  mobilePerformance,
};
