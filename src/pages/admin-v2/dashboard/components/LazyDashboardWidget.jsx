/**
 * LazyDashboardWidget - Performance Optimization Wrapper
 * Features: Lazy loading, intersection observer, memory optimization, error boundaries
 * Provides efficient loading and rendering for dashboard components
 */

import React, { 
  Suspense, 
  lazy, 
  useEffect, 
  useState, 
  useRef, 
  useCallback,
  memo 
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Loader } from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';

// Error Boundary for individual widgets
class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard widget error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { isDarkMode, onRetry, widgetName } = this.props;
      
      return (
        <Card className="p-6 text-center">
          <AlertTriangle className={`w-8 h-8 mx-auto mb-3 ${isDarkMode ? 'text-tomato-red' : 'text-tomato-red'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            Widget Error
          </h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
            Failed to load {widgetName || 'dashboard widget'}
          </p>
          {onRetry && (
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                onRetry();
              }}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200
                ${isDarkMode 
                  ? 'bg-sage-green/20 text-sage-green hover:bg-sage-green/30' 
                  : 'bg-muted-olive/10 text-muted-olive hover:bg-muted-olive/20'
                }
              `}
            >
              Retry
            </button>
          )}
        </Card>
      );
    }

    return this.props.children;
  }
}

// Loading skeleton component
const WidgetSkeleton = memo(({ height = 200, className = "" }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Card className={`p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-5 w-32 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </div>
          <div className={`h-4 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
        
        {/* Content skeleton */}
        <div 
          className={`w-full rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          style={{ height: `${height}px` }}
        />
        
        {/* Footer skeleton */}
        <div className="flex items-center justify-between">
          <div className={`h-3 w-24 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          <div className={`h-3 w-16 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
        </div>
      </div>
    </Card>
  );
});

WidgetSkeleton.displayName = 'WidgetSkeleton';

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return [elementRef, isIntersecting, hasIntersected];
};

// Main LazyDashboardWidget component
const LazyDashboardWidget = ({
  component: Component,
  fallback,
  widgetName,
  priority = 'normal',
  defer = false,
  retryCount = 3,
  onError,
  onLoad,
  height = 200,
  className = "",
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  
  // Intersection observer for viewport-based loading
  const [elementRef, isIntersecting, hasIntersected] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: priority === 'high' ? '200px' : '50px'
  });

  // Determine when to load the widget
  useEffect(() => {
    if (priority === 'high' || !defer) {
      // High priority or non-deferred widgets load immediately
      setShouldLoad(true);
    } else if (hasIntersected) {
      // Deferred widgets load when they come into view
      setShouldLoad(true);
    }
  }, [priority, defer, hasIntersected]);

  // Handle widget loading
  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.(widgetName);
  }, [onLoad, widgetName]);

  // Handle retry
  const handleRetry = useCallback(() => {
    if (loadAttempts < retryCount) {
      setLoadAttempts(prev => prev + 1);
      setShouldLoad(true);
    }
  }, [loadAttempts, retryCount]);

  // Handle errors
  const handleError = useCallback((error) => {
    console.error(`Widget ${widgetName} failed to load:`, error);
    onError?.(error, widgetName);
  }, [onError, widgetName]);

  // Render loading fallback
  const renderFallback = () => {
    if (fallback) {
      return typeof fallback === 'function' ? fallback() : fallback;
    }
    
    return <WidgetSkeleton height={height} className={className} />;
  };

  // Render the widget
  const renderWidget = () => {
    if (!shouldLoad) {
      return (
        <div ref={elementRef} className={className}>
          {renderFallback()}
        </div>
      );
    }

    return (
      <div ref={elementRef} className={className}>
        <WidgetErrorBoundary 
          isDarkMode={isDarkMode}
          onRetry={handleRetry}
          widgetName={widgetName}
        >
          <Suspense fallback={renderFallback()}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onAnimationComplete={handleLoad}
            >
              <Component {...props} />
            </motion.div>
          </Suspense>
        </WidgetErrorBoundary>
      </div>
    );
  };

  return renderWidget();
};

// Higher-order component for creating lazy widgets
export const createLazyWidget = (importFn, options = {}) => {
  const LazyComponent = lazy(importFn);
  
  return memo((props) => (
    <LazyDashboardWidget
      component={LazyComponent}
      {...options}
      {...props}
    />
  ));
};

// Predefined lazy widgets for common dashboard components
export const LazyHeroKPICards = createLazyWidget(
  () => import('./HeroKPICards'),
  { widgetName: 'KPI Cards', priority: 'high' }
);

export const LazyBusinessMetricsChart = createLazyWidget(
  () => import('./BusinessMetricsChart'),
  { widgetName: 'Business Metrics Chart', priority: 'high', defer: false }
);

export const LazyRecentActivityFeed = createLazyWidget(
  () => import('./RecentActivityFeed'),
  { widgetName: 'Activity Feed', priority: 'normal', defer: true, height: 400 }
);

export const LazyQuickActionPanel = createLazyWidget(
  () => import('./QuickActionPanel'),
  { widgetName: 'Quick Actions', priority: 'normal', defer: true }
);

export const LazySystemHealthWidget = createLazyWidget(
  () => import('./SystemHealthWidget'),
  { widgetName: 'System Health', priority: 'low', defer: true, height: 300 }
);

export const LazyVerificationPipeline = createLazyWidget(
  () => import('./VerificationPipeline'),
  { widgetName: 'Verification Pipeline', priority: 'normal', defer: true, height: 400 }
);

// Performance monitor component
export const DashboardPerformanceMonitor = memo(({ onMetric }) => {
  const performanceRef = useRef({
    loadTimes: [],
    renderTimes: [],
    memoryUsage: [],
    widgetCount: 0
  });

  const recordMetric = useCallback((type, value, widgetName) => {
    const timestamp = performance.now();
    const metric = { type, value, widgetName, timestamp };
    
    performanceRef.current[`${type}s`]?.push(metric);
    performanceRef.current.widgetCount += type === 'load' ? 1 : 0;
    
    onMetric?.(metric);
    
    // Clean up old metrics (keep last 50)
    Object.keys(performanceRef.current).forEach(key => {
      if (Array.isArray(performanceRef.current[key]) && 
          performanceRef.current[key].length > 50) {
        performanceRef.current[key] = performanceRef.current[key].slice(-50);
      }
    });
  }, [onMetric]);

  // Monitor memory usage
  useEffect(() => {
    const monitorMemory = () => {
      if (performance.memory) {
        recordMetric('memory', {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
      }
    };

    const interval = setInterval(monitorMemory, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [recordMetric]);

  return null; // This is a monitoring component, no UI
});

DashboardPerformanceMonitor.displayName = 'DashboardPerformanceMonitor';

export default LazyDashboardWidget;