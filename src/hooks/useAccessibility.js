/**
 * useAccessibility - React Hook for Accessibility Features
 * Features: Focus management, keyboard navigation, ARIA support, screen reader integration
 * Provides comprehensive accessibility support for admin-v2 components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  focusManagement,
  screenReader,
  keyboardNavigation,
  colorContrast,
  accessibilityValidation,
  highContrast,
  motionAccessibility,
  formAccessibility,
  createAriaAttributes,
} from '../utils/accessibility.jsx';

/**
 * Hook for focus management and keyboard navigation
 * @param {Object} options - Configuration options
 * @returns {Object} Focus management utilities
 */
export const useFocusManagement = (options = {}) => {
  const { trapFocus = false, restoreOnUnmount = false } = options;
  const containerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const cleanupRef = useRef(null);

  // Store current focus when component mounts
  useEffect(() => {
    if (restoreOnUnmount) {
      previousFocusRef.current = document.activeElement;
    }
  }, [restoreOnUnmount]);

  // Setup focus trap
  useEffect(() => {
    if (trapFocus && containerRef.current) {
      cleanupRef.current = focusManagement.trapFocus(containerRef.current);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [trapFocus]);

  // Restore focus on unmount
  useEffect(() => {
    return () => {
      if (restoreOnUnmount && previousFocusRef.current) {
        focusManagement.restoreFocus(previousFocusRef.current);
      }
    };
  }, [restoreOnUnmount]);

  const focusFirst = useCallback(() => {
    if (!containerRef.current) return;

    const firstFocusable = containerRef.current.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  const focusLast = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const lastFocusable = focusableElements[focusableElements.length - 1];
    if (lastFocusable) {
      lastFocusable.focus();
    }
  }, []);

  return {
    containerRef,
    focusFirst,
    focusLast,
    getFocusClasses: focusManagement.getFocusClasses,
    createSkipLinks: focusManagement.createSkipLinks,
  };
};

/**
 * Hook for screen reader announcements and live regions
 * @returns {Object} Screen reader utilities
 */
export const useScreenReader = () => {
  const liveRegionRef = useRef(null);
  const [announcements, setAnnouncements] = useState([]);

  // Create live region on mount
  useEffect(() => {
    liveRegionRef.current = screenReader.createLiveRegion('polite');

    return () => {
      if (liveRegionRef.current) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  // Announce message to screen readers
  const announce = useCallback((message, politeness = 'polite') => {
    screenReader.announce(message, politeness);

    // Track announcements for debugging
    setAnnouncements((prev) => [
      ...prev.slice(-9), // Keep last 10 announcements
      {
        id: Date.now(),
        message,
        politeness,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // Announce loading states
  const announceLoading = useCallback(
    (resource) => {
      announce(`Loading ${resource}`, 'polite');
    },
    [announce]
  );

  const announceLoaded = useCallback(
    (resource) => {
      announce(`${resource} loaded`, 'polite');
    },
    [announce]
  );

  // Announce errors
  const announceError = useCallback(
    (error) => {
      announce(`Error: ${error}`, 'assertive');
    },
    [announce]
  );

  // Announce success
  const announceSuccess = useCallback(
    (message) => {
      announce(`Success: ${message}`, 'polite');
    },
    [announce]
  );

  return {
    announce,
    announceLoading,
    announceLoaded,
    announceError,
    announceSuccess,
    announcements,
    createDescription: screenReader.createDescription,
    only: screenReader.only,
  };
};

/**
 * Hook for keyboard navigation support
 * @param {Object} config - Navigation configuration
 * @returns {Object} Keyboard navigation utilities
 */
export const useKeyboardNavigation = (config = {}) => {
  const { onEscape, onEnter, onSpace, onArrowKeys, onHomeEnd } = config;
  const elementRef = useRef(null);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event) => {
      const { key, shiftKey, ctrlKey, altKey } = event;

      switch (key) {
        case keyboardNavigation.KEYS.ESCAPE:
          if (onEscape) {
            event.preventDefault();
            onEscape(event);
          }
          break;

        case keyboardNavigation.KEYS.ENTER:
          if (onEnter) {
            event.preventDefault();
            onEnter(event);
          }
          break;

        case keyboardNavigation.KEYS.SPACE:
          if (onSpace) {
            event.preventDefault();
            onSpace(event);
          }
          break;

        case keyboardNavigation.KEYS.ARROW_UP:
        case keyboardNavigation.KEYS.ARROW_DOWN:
        case keyboardNavigation.KEYS.ARROW_LEFT:
        case keyboardNavigation.KEYS.ARROW_RIGHT:
          if (onArrowKeys) {
            onArrowKeys(event, key);
          }
          break;

        case keyboardNavigation.KEYS.HOME:
        case keyboardNavigation.KEYS.END:
          if (onHomeEnd) {
            event.preventDefault();
            onHomeEnd(event, key);
          }
          break;
      }
    },
    [onEscape, onEnter, onSpace, onArrowKeys, onHomeEnd]
  );

  // Attach event listener
  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return {
    elementRef,
    handleKeyDown,
    createButtonHandler: keyboardNavigation.createButtonHandler,
    createListNavigation: keyboardNavigation.createListNavigation,
    createTabNavigation: keyboardNavigation.createTabNavigation,
    KEYS: keyboardNavigation.KEYS,
  };
};

/**
 * Hook for ARIA state management
 * @param {Object} initialState - Initial ARIA state
 * @returns {Object} ARIA state management
 */
export const useAriaState = (initialState = {}) => {
  const [ariaState, setAriaState] = useState(initialState);

  // Update specific ARIA attribute
  const updateAria = useCallback((key, value) => {
    setAriaState((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple ARIA attributes
  const updateAriaMultiple = useCallback((updates) => {
    setAriaState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Get ARIA attributes for element
  const getAriaProps = useCallback(
    (additionalProps = {}) => {
      return createAriaAttributes({
        ...ariaState,
        ...additionalProps,
      });
    },
    [ariaState]
  );

  // Toggle boolean ARIA attribute
  const toggleAria = useCallback((key) => {
    setAriaState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }, []);

  return {
    ariaState,
    updateAria,
    updateAriaMultiple,
    getAriaProps,
    toggleAria,
    createAriaAttributes,
  };
};

/**
 * Hook for form accessibility
 * @param {Object} options - Form accessibility options
 * @returns {Object} Form accessibility utilities
 */
export const useFormAccessibility = (options = {}) => {
  const { announceValidation = true, announceSubmission = true } = options;
  const { announce } = useScreenReader();
  const formRef = useRef(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Add error to field
  const addFieldError = useCallback(
    (fieldId, error) => {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldId]: error,
      }));

      if (announceValidation) {
        announce(`Validation error for ${fieldId}: ${error}`, 'assertive');
      }
    },
    [announce, announceValidation]
  );

  // Remove error from field
  const removeFieldError = useCallback((fieldId) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldId];
      return newErrors;
    });
  }, []);

  // Clear all field errors
  const clearFieldErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  // Get field props with accessibility attributes
  const getFieldProps = useCallback(
    (fieldConfig) => {
      const props = formAccessibility.getFieldProps(fieldConfig);

      // Add error state if field has error
      if (fieldErrors[fieldConfig.id]) {
        props['aria-invalid'] = 'true';
        props['aria-describedby'] = `${fieldConfig.id}-error`;
      }

      return props;
    },
    [fieldErrors]
  );

  // Get error message props
  const getErrorProps = useCallback(
    (fieldId) => {
      const error = fieldErrors[fieldId];
      if (!error) return null;

      return formAccessibility.createErrorMessage(fieldId, error);
    },
    [fieldErrors]
  );

  // Announce form submission results
  const announceSubmissionResult = useCallback(
    (result) => {
      if (!announceSubmission) return;

      if (result.success) {
        announce(`Form submitted successfully: ${result.message}`, 'polite');
      } else {
        announce(`Form submission failed: ${result.error}`, 'assertive');
      }
    },
    [announce, announceSubmission]
  );

  return {
    formRef,
    fieldErrors,
    addFieldError,
    removeFieldError,
    clearFieldErrors,
    getFieldProps,
    getErrorProps,
    announceSubmissionResult,
    createFieldDescription: formAccessibility.createFieldDescription,
  };
};

/**
 * Hook for color contrast management
 * @returns {Object} Color contrast utilities
 */
export const useColorContrast = () => {
  const [highContrastMode, setHighContrastMode] = useState(() =>
    highContrast.isPreferred()
  );

  // Listen for contrast preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');

    const handleChange = (e) => {
      setHighContrastMode(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Validate color combination
  const validateColors = useCallback(
    (foreground, background, level = 'AA', size = 'normal') => {
      const ratio = colorContrast.getContrastRatio(foreground, background);
      return colorContrast.validateContrast(ratio, level, size);
    },
    []
  );

  // Get accessible color combinations
  const getAccessibleColors = useCallback((theme = 'light') => {
    return colorContrast.WCAG_AA_COMBINATIONS[
      theme === 'dark' ? 'textOnDark' : 'textOnLight'
    ];
  }, []);

  return {
    highContrastMode,
    validateColors,
    getAccessibleColors,
    getColors: highContrast.getColors,
    getLuminance: colorContrast.getLuminance,
    getContrastRatio: colorContrast.getContrastRatio,
  };
};

/**
 * Hook for motion and animation accessibility
 * @returns {Object} Motion accessibility utilities
 */
export const useMotionAccessibility = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    motionAccessibility.prefersReducedMotion()
  );

  // Listen for motion preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Get motion-safe classes
  const getMotionSafeClasses = useCallback((classes) => {
    return motionAccessibility.getSafeAnimationClasses(classes);
  }, []);

  // Get motion-safe styles
  const getMotionSafeStyles = useCallback(
    (styles = {}) => {
      if (prefersReducedMotion) {
        return {
          ...styles,
          ...motionAccessibility.getReducedMotionStyles(),
        };
      }
      return styles;
    },
    [prefersReducedMotion]
  );

  return {
    prefersReducedMotion,
    getMotionSafeClasses,
    getMotionSafeStyles,
  };
};

/**
 * Hook for accessibility validation and testing
 * @returns {Object} Validation utilities
 */
export const useAccessibilityValidation = () => {
  const [validationResults, setValidationResults] = useState(null);

  // Validate specific element
  const validateElement = useCallback((element) => {
    const results = accessibilityValidation.validateElement(element);
    return results;
  }, []);

  // Validate entire page
  const validatePage = useCallback(() => {
    const results = accessibilityValidation.validatePage();
    setValidationResults(results);
    return results;
  }, []);

  // Run validation on component mount (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Validate page after a short delay to allow components to render
      const timer = setTimeout(validatePage, 1000);
      return () => clearTimeout(timer);
    }
  }, [validatePage]);

  return {
    validationResults,
    validateElement,
    validatePage,
  };
};

/**
 * Hook for table accessibility
 * @param {Object} tableConfig - Table configuration
 * @returns {Object} Table accessibility utilities
 */
export const useTableAccessibility = (tableConfig = {}) => {
  const { caption, headers = [], data = [] } = tableConfig;
  const tableRef = useRef(null);

  // Generate table ARIA attributes
  const getTableProps = useCallback(() => {
    return createAriaAttributes({
      role: 'table',
      label: caption,
      colcount: headers.length,
      rowcount: data.length + 1, // +1 for header row
    });
  }, [caption, headers.length, data.length]);

  // Get header cell props
  const getHeaderProps = useCallback((index, header) => {
    return createAriaAttributes({
      role: 'columnheader',
      colindex: index + 1,
      label: header.label || header.key,
    });
  }, []);

  // Get data cell props
  const getCellProps = useCallback((rowIndex, cellIndex, header) => {
    return createAriaAttributes({
      role: 'cell',
      rowindex: rowIndex + 2, // +2 for header row (1-indexed)
      colindex: cellIndex + 1,
      describedby: header.description ? `${header.key}-description` : undefined,
    });
  }, []);

  // Get row props
  const getRowProps = useCallback((index) => {
    return createAriaAttributes({
      role: 'row',
      rowindex: index + 2, // +2 for header row (1-indexed)
    });
  }, []);

  return {
    tableRef,
    getTableProps,
    getHeaderProps,
    getCellProps,
    getRowProps,
  };
};

/**
 * Hook for modal and dialog accessibility
 * @param {Object} options - Modal options
 * @returns {Object} Modal accessibility utilities
 */
export const useModalAccessibility = (options = {}) => {
  const {
    trapFocus = true,
    closeOnEscape = true,
    announceOpen = true,
    announceClose = true,
  } = options;
  const modalRef = useRef(null);
  const triggerRef = useRef(null);
  const { announce } = useScreenReader();

  // Handle modal open
  const handleModalOpen = useCallback(
    (title) => {
      // Store trigger element
      triggerRef.current = document.activeElement;

      // Announce to screen readers
      if (announceOpen) {
        announce(`Dialog opened: ${title}`, 'polite');
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus first element in modal after animation
      setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);
    },
    [announce, announceOpen]
  );

  // Handle modal close
  const handleModalClose = useCallback(
    (title) => {
      // Restore body scroll
      document.body.style.overflow = '';

      // Announce to screen readers
      if (announceClose) {
        announce(`Dialog closed: ${title}`, 'polite');
      }

      // Restore focus to trigger element
      if (triggerRef.current) {
        focusManagement.restoreFocus(triggerRef.current);
      }
    },
    [announce, announceClose]
  );

  // Handle escape key
  const handleEscape = useCallback(
    (event) => {
      if (closeOnEscape && event.key === keyboardNavigation.KEYS.ESCAPE) {
        event.stopPropagation();
        if (options.onClose) {
          options.onClose();
        }
      }
    },
    [closeOnEscape, options.onClose]
  );

  // Get modal props
  const getModalProps = useCallback((title, description) => {
    return createAriaAttributes({
      role: 'dialog',
      label: title,
      describedby: description ? `${title}-description` : undefined,
      hidden: false,
    });
  }, []);

  return {
    modalRef,
    handleModalOpen,
    handleModalClose,
    handleEscape,
    getModalProps,
    triggerRef,
  };
};

/**
 * Hook for tab navigation accessibility
 * @param {Array} tabs - Tab configuration array
 * @param {number} defaultActiveTab - Default active tab index
 * @returns {Object} Tab accessibility utilities
 */
export const useTabAccessibility = (tabs = [], defaultActiveTab = 0) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);
  const tabRefs = useRef([]);
  const panelRefs = useRef([]);

  // Handle tab selection
  const selectTab = useCallback(
    (index) => {
      if (index >= 0 && index < tabs.length) {
        setActiveTab(index);
      }
    },
    [tabs.length]
  );

  // Get tab props
  const getTabProps = useCallback(
    (index, tab) => {
      const isActive = index === activeTab;

      return {
        ...createAriaAttributes({
          role: 'tab',
          selected: isActive,
          controls: `${tab.id}-panel`,
          labelledby: `${tab.id}-tab`,
        }),
        id: `${tab.id}-tab`,
        tabIndex: isActive ? 0 : -1,
        ref: (el) => {
          tabRefs.current[index] = el;
        },
        onClick: () => selectTab(index),
        onKeyDown: keyboardNavigation.createTabNavigation(
          tabRefs.current,
          panelRefs.current,
          selectTab
        ),
      };
    },
    [activeTab, selectTab]
  );

  // Get panel props
  const getPanelProps = useCallback(
    (index, tab) => {
      const isActive = index === activeTab;

      return {
        ...createAriaAttributes({
          role: 'tabpanel',
          labelledby: `${tab.id}-tab`,
          hidden: !isActive,
        }),
        id: `${tab.id}-panel`,
        tabIndex: isActive ? 0 : -1,
        ref: (el) => {
          panelRefs.current[index] = el;
        },
      };
    },
    [activeTab]
  );

  // Get tablist props
  const getTabListProps = useCallback(() => {
    return createAriaAttributes({
      role: 'tablist',
      orientation: 'horizontal',
    });
  }, []);

  return {
    activeTab,
    selectTab,
    getTabProps,
    getPanelProps,
    getTabListProps,
    tabRefs,
    panelRefs,
  };
};

/**
 * Comprehensive accessibility hook combining all features
 * @param {Object} options - Configuration options
 * @returns {Object} All accessibility utilities
 */
export const useAccessibility = (options = {}) => {
  const focusManagement = useFocusManagement(options.focus);
  const screenReader = useScreenReader();
  const keyboardNav = useKeyboardNavigation(options.keyboard);
  const ariaState = useAriaState(options.aria);
  const formAccessibility = useFormAccessibility(options.form);
  const colorContrast = useColorContrast();
  const motionAccessibility = useMotionAccessibility();
  const validation = useAccessibilityValidation();

  return {
    // Focus management
    ...focusManagement,

    // Screen reader support
    ...screenReader,

    // Keyboard navigation
    ...keyboardNav,

    // ARIA state
    ...ariaState,

    // Form accessibility
    ...formAccessibility,

    // Color contrast
    ...colorContrast,

    // Motion accessibility
    ...motionAccessibility,

    // Validation
    ...validation,

    // Utility functions
    isAccessibilityEnabled: true,
    hasAccessibilityFeatures: true,
  };
};

export default useAccessibility;
