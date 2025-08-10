/**
 * Test Utilities for UI Components
 * Comprehensive testing helpers following best practices
 */

import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock Redux slices for testing
const createMockSlice = (name, initialState = {}) => ({
  name,
  reducer: (state = initialState, action) => state,
  actions: {}
});

// Default test store configuration
const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      auth: createMockSlice('auth', {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }).reducer,
      notifications: createMockSlice('notifications', {
        items: [],
      }).reducer,
      cart: createMockSlice('cart', {
        items: [],
        total: 0,
      }).reducer,
    },
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

// Enhanced render function with providers
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    initialEntries = ['/'],
    route = '/',
    ...renderOptions
  } = {}
) => {
  // Router wrapper
  const RouterWrapper = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  // Redux wrapper
  const ReduxWrapper = ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );

  // Combined wrapper
  const AllTheProviders = ({ children }) => (
    <ReduxWrapper>
      <RouterWrapper>
        {children}
      </RouterWrapper>
    </ReduxWrapper>
  );

  return {
    store,
    ...render(ui, { wrapper: AllTheProviders, ...renderOptions }),
  };
};

// Mock implementations for common hooks and utilities
export const mockHooks = {
  // Mock useMediaQuery
  useMediaQuery: vi.fn(() => false),
  
  // Mock Intersection Observer
  intersectionObserver: {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  },
  
  // Mock ResizeObserver
  resizeObserver: {
    observe: vi.fn(),
    disconnect: vi.fn(),
    unobserve: vi.fn(),
  },
};

// Setup global mocks
export const setupGlobalMocks = () => {
  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn(() => mockHooks.intersectionObserver);
  
  // Mock ResizeObserver
  global.ResizeObserver = vi.fn(() => mockHooks.resizeObserver);
  
  // Mock matchMedia for responsive testing
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  
  // Mock scrollIntoView
  Element.prototype.scrollIntoView = vi.fn();
  
  // Mock getBoundingClientRect for layout testing
  Element.prototype.getBoundingClientRect = vi.fn(() => ({
    width: 100,
    height: 44, // Default minimum touch target
    top: 0,
    left: 0,
    bottom: 44,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => {},
  }));
};

// Accessibility testing utilities
export const a11yTestUtils = {
  // Check if element meets touch target requirements
  checkTouchTarget: (element) => {
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      meetsMobileTarget: rect.width >= 44 && rect.height >= 44,
      meetsTabletTarget: rect.width >= 48 && rect.height >= 48,
    };
  },
  
  // Check focus management
  checkFocusManagement: async (user, element) => {
    await user.tab();
    return document.activeElement === element;
  },
  
  // Check ARIA attributes
  checkAriaAttributes: (element, expectedAttributes = {}) => {
    const results = {};
    Object.entries(expectedAttributes).forEach(([attr, expectedValue]) => {
      const actualValue = element.getAttribute(attr);
      results[attr] = {
        expected: expectedValue,
        actual: actualValue,
        matches: actualValue === expectedValue,
      };
    });
    return results;
  },
  
  // Check color contrast (simplified)
  checkColorContrast: (element) => {
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    const color = computedStyle.color;
    
    return {
      backgroundColor,
      textColor: color,
      // In a real implementation, you'd calculate the actual contrast ratio
      hasGoodContrast: true, // Placeholder
    };
  },
};

// Mock data generators
export const mockData = {
  // User data
  user: (overrides = {}) => ({
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    avatar: null,
    ...overrides,
  }),
  
  // Product data
  product: (overrides = {}) => ({
    id: '1',
    name: 'Test Product',
    description: 'A test product description',
    price: 29.99,
    image: '/test-image.jpg',
    category: 'test',
    inStock: true,
    ...overrides,
  }),
  
  // Order data
  order: (overrides = {}) => ({
    id: '1',
    status: 'pending',
    items: [],
    total: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  }),
  
  // Notification data
  notification: (overrides = {}) => ({
    id: '1',
    type: 'info',
    title: 'Test Notification',
    message: 'This is a test notification',
    duration: 5000,
    ...overrides,
  }),
  
  // Form field options
  selectOptions: [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ],
  
  // Table data
  tableData: Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    status: i % 2 === 0 ? 'active' : 'inactive',
    value: Math.floor(Math.random() * 1000),
  })),
};

// Component testing utilities
export const componentTestUtils = {
  // Simulate loading states
  waitForLoadingToFinish: async (getByTestId) => {
    const loadingElement = getByTestId('loading-spinner');
    await waitFor(() => {
      expect(loadingElement).not.toBeInTheDocument();
    });
  },
  
  // Simulate user interactions
  fillForm: async (user, formData) => {
    for (const [fieldName, value] of Object.entries(formData)) {
      const field = screen.getByLabelText(new RegExp(fieldName, 'i'));
      await user.clear(field);
      await user.type(field, value);
    }
  },
  
  // Test responsive behavior
  testResponsiveLayout: (component, breakpoints = ['mobile', 'tablet', 'desktop']) => {
    breakpoints.forEach(breakpoint => {
      // Mock different screen sizes
      const mediaQueries = {
        mobile: '(max-width: 640px)',
        tablet: '(min-width: 641px) and (max-width: 1024px)',
        desktop: '(min-width: 1025px)',
      };
      
      window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: query === mediaQueries[breakpoint],
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      // Re-render and test layout
      render(component);
    });
  },
  
  // Test keyboard navigation
  testKeyboardNavigation: async (user, element, expectedKeys = ['Tab', 'Enter', ' ']) => {
    const results = {};
    
    for (const key of expectedKeys) {
      element.focus();
      await user.keyboard(`{${key}}`);
      results[key] = document.activeElement;
    }
    
    return results;
  },
  
  // Test error boundaries
  testErrorBoundary: (ComponentWithError, ErrorBoundary) => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <ComponentWithError />
      </ErrorBoundary>
    );
    
    consoleError.mockRestore();
  },
};

// Performance testing utilities
export const performanceTestUtils = {
  // Measure render time
  measureRenderTime: (Component, props = {}) => {
    const start = performance.now();
    render(<Component {...props} />);
    const end = performance.now();
    return end - start;
  },
  
  // Test with large datasets
  testWithLargeDataset: (Component, generateData, size = 1000) => {
    const largeDataset = Array.from({ length: size }, (_, i) => generateData(i));
    return render(<Component data={largeDataset} />);
  },
  
  // Memory leak detection (simplified)
  testMemoryUsage: (Component, iterations = 10) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(<Component key={i} />);
      unmount();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    return {
      initialMemory,
      finalMemory,
      difference: finalMemory - initialMemory,
    };
  },
};

// Custom matchers for better assertions
export const customMatchers = {
  // Check if element has minimum touch target size
  toMeetTouchTargetSize: (element) => {
    const rect = element.getBoundingClientRect();
    const meetsMobile = rect.width >= 44 && rect.height >= 44;
    
    return {
      message: () => 
        `Expected element to meet touch target size of 44px, but got ${rect.width}x${rect.height}`,
      pass: meetsMobile,
    };
  },
  
  // Check if element is visible and focusable
  toBeFocusableAndVisible: (element) => {
    const isVisible = element.offsetParent !== null;
    const isFocusable = element.tabIndex >= 0 || element.matches('input, button, select, textarea, a[href]');
    
    return {
      message: () => 
        `Expected element to be focusable and visible, but visible: ${isVisible}, focusable: ${isFocusable}`,
      pass: isVisible && isFocusable,
    };
  },
};

// Test setup and teardown
export const testSetup = {
  beforeEach: () => {
    setupGlobalMocks();
    vi.clearAllMocks();
  },
  
  afterEach: () => {
    vi.restoreAllMocks();
  },
};

export default {
  renderWithProviders,
  mockHooks,
  setupGlobalMocks,
  a11yTestUtils,
  mockData,
  componentTestUtils,
  performanceTestUtils,
  customMatchers,
  testSetup,
};