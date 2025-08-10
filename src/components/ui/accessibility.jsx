/**
 * Comprehensive Accessibility Implementation
 * Following WCAG 2.1 AA Standards and CLAUDE.md principles
 * Mobile-first and inclusive design focus
 */

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils';

// Screen Reader Only Text Component
export const ScreenReaderOnly = ({ children, className, ...props }) => (
  <span 
    className={cn(
      'sr-only absolute left-[-10000px] top-auto w-px h-px overflow-hidden',
      className
    )}
    {...props}
  >
    {children}
  </span>
);

// Skip Navigation Links
export const SkipLinks = ({ links = [], className, ...props }) => (
  <div className="sr-only">
    {links.map((link, index) => (
      <a
        key={index}
        href={link.href}
        className={cn(
          'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50',
          'bg-bottle-green text-white px-6 py-3 rounded-2xl font-medium',
          'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-bottle-green',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {link.label}
      </a>
    ))}
  </div>
);

// Focus Trap Component
export const FocusTrap = ({ 
  children, 
  active = true, 
  restoreFocus = true,
  className,
  ...props 
}) => {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!active) return;

    previousActiveElement.current = document.activeElement;
    
    const getFocusableElements = () => {
      const selectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]'
      ];
      
      return containerRef.current?.querySelectorAll(selectors.join(', ')) || [];
    };

    const handleKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener('keydown', handleKeyDown);
    
    // Focus first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    return () => {
      container?.removeEventListener('keydown', handleKeyDown);
      
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
};

// Announcement Component for Screen Readers
export const LiveAnnouncement = ({ 
  message, 
  politeness = 'polite',
  clearAfter = 1000 
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      
      if (clearAfter > 0) {
        const timer = setTimeout(() => {
          setAnnouncement('');
        }, clearAfter);
        
        return () => clearTimeout(timer);
      }
    }
  }, [message, clearAfter]);

  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

// Progress Announcement
export const ProgressAnnouncement = ({ 
  value, 
  max = 100, 
  label = 'Progress',
  announceInterval = 10 
}) => {
  const [lastAnnounced, setLastAnnounced] = useState(-1);
  const percentage = Math.round((value / max) * 100);

  useEffect(() => {
    if (percentage !== lastAnnounced && percentage % announceInterval === 0) {
      setLastAnnounced(percentage);
    }
  }, [percentage, lastAnnounced, announceInterval]);

  return (
    <LiveAnnouncement 
      message={
        percentage !== lastAnnounced && percentage % announceInterval === 0
          ? `${label}: ${percentage}% complete`
          : null
      }
    />
  );
};

// High Contrast Mode Detection
export const useHighContrast = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleChange = (e) => {
      setIsHighContrast(e.matches);
    };

    setIsHighContrast(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return isHighContrast;
};

// Reduced Motion Detection
export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = (e) => {
      setPrefersReducedMotion(e.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};

// Color Scheme Detection
export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };

    setColorScheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return colorScheme;
};

// Focus Visible Hook
export const useFocusVisible = () => {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  useEffect(() => {
    const handlePointerDown = () => setIsFocusVisible(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') setIsFocusVisible(true);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return isFocusVisible;
};

// Accessible Modal Wrapper
export const AccessibleModal = ({ 
  children, 
  isOpen, 
  onClose, 
  title,
  description,
  className,
  ...props 
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          onClose?.();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <FocusTrap active={isOpen}>
        <div
          ref={modalRef}
          className={cn(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
            'bg-white rounded-3xl shadow-2xl border border-white/50',
            'max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto',
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
          {...props}
        >
          {children}
        </div>
      </FocusTrap>
    </div>
  );
};

// Accessible Dropdown Wrapper
export const AccessibleDropdown = ({ 
  children, 
  isOpen, 
  onClose,
  trigger,
  className,
  ...props 
}) => {
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target) &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target)
        ) {
          onClose?.();
        }
      };

      const handleEscape = (event) => {
        if (event.key === 'Escape') {
          onClose?.();
          triggerRef.current?.focus();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  return (
    <div className="relative">
      <div ref={triggerRef}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute top-full left-0 z-50 mt-2',
            'bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50',
            'min-w-[200px] py-2',
            className
          )}
          role="menu"
          aria-orientation="vertical"
          {...props}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// Accessibility Utilities
export const A11yUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix = 'a11y') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Announce to screen readers
  announce: (message, politeness = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', politeness);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  },
  
  // Focus management
  focus: {
    trap: (element) => {
      const focusableElements = element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      return {
        focusFirst: () => firstElement?.focus(),
        focusLast: () => lastElement?.focus(),
        elements: focusableElements,
      };
    },
    
    visible: (element) => {
      element?.scrollIntoView({ 
        block: 'nearest',
        inline: 'nearest',
        behavior: 'smooth' 
      });
      element?.focus({ preventScroll: true });
    }
  },
  
  // ARIA helpers
  aria: {
    describedBy: (element, descriptionId) => {
      const existingIds = element.getAttribute('aria-describedby') || '';
      const ids = existingIds.split(' ').filter(Boolean);
      
      if (!ids.includes(descriptionId)) {
        ids.push(descriptionId);
        element.setAttribute('aria-describedby', ids.join(' '));
      }
    },
    
    expanded: (element, isExpanded) => {
      element.setAttribute('aria-expanded', isExpanded.toString());
    },
    
    selected: (element, isSelected) => {
      element.setAttribute('aria-selected', isSelected.toString());
    },
    
    pressed: (element, isPressed) => {
      element.setAttribute('aria-pressed', isPressed.toString());
    }
  },
  
  // Color contrast utilities
  contrast: {
    // Calculate contrast ratio between two colors
    ratio: (color1, color2) => {
      const getLuminance = (color) => {
        const rgb = color.match(/\d+/g).map(Number);
        const [r, g, b] = rgb.map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      
      const l1 = getLuminance(color1);
      const l2 = getLuminance(color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      
      return (lighter + 0.05) / (darker + 0.05);
    },
    
    // Check if contrast meets WCAG standards
    meetsStandard: (ratio, level = 'AA', size = 'normal') => {
      const requirements = {
        'AA': { normal: 4.5, large: 3 },
        'AAA': { normal: 7, large: 4.5 }
      };
      
      return ratio >= requirements[level][size];
    }
  },
  
  // Touch target validation
  touch: {
    // Check if element meets minimum touch target size
    validateSize: (element) => {
      const rect = element.getBoundingClientRect();
      const minSize = 44; // WCAG recommended minimum
      
      return {
        width: rect.width,
        height: rect.height,
        meetsWidth: rect.width >= minSize,
        meetsHeight: rect.height >= minSize,
        meetsRequirement: rect.width >= minSize && rect.height >= minSize
      };
    },
    
    // Get touch target spacing
    validateSpacing: (element) => {
      const rect = element.getBoundingClientRect();
      const siblings = Array.from(element.parentElement.children);
      const index = siblings.indexOf(element);
      
      let minSpacing = Infinity;
      
      siblings.forEach((sibling, siblingIndex) => {
        if (siblingIndex === index) return;
        
        const siblingRect = sibling.getBoundingClientRect();
        const spacing = Math.min(
          Math.abs(rect.left - siblingRect.right),
          Math.abs(rect.right - siblingRect.left),
          Math.abs(rect.top - siblingRect.bottom),
          Math.abs(rect.bottom - siblingRect.top)
        );
        
        minSpacing = Math.min(minSpacing, spacing);
      });
      
      return {
        spacing: minSpacing,
        meetsRequirement: minSpacing >= 8 // Recommended minimum spacing
      };
    }
  }
};

// HOC for adding accessibility features to components
export const withA11y = (WrappedComponent) => {
  return React.forwardRef((props, ref) => {
    const isHighContrast = useHighContrast();
    const prefersReducedMotion = useReducedMotion();
    const colorScheme = useColorScheme();
    
    const a11yProps = {
      'data-high-contrast': isHighContrast,
      'data-reduced-motion': prefersReducedMotion,
      'data-color-scheme': colorScheme,
    };
    
    return (
      <WrappedComponent
        ref={ref}
        {...props}
        {...a11yProps}
        className={cn(
          props.className,
          isHighContrast && 'contrast-more:border-2 contrast-more:border-current',
          prefersReducedMotion && 'motion-reduce:animate-none motion-reduce:transition-none'
        )}
      />
    );
  });
};

export default {
  ScreenReaderOnly,
  SkipLinks,
  FocusTrap,
  LiveAnnouncement,
  ProgressAnnouncement,
  AccessibleModal,
  AccessibleDropdown,
  useHighContrast,
  useReducedMotion,
  useColorScheme,
  useFocusVisible,
  A11yUtils,
  withA11y,
};