/**
 * usePerformanceOptimization - React Hook for Performance Optimization
 * Features: Virtual scrolling, memoization, lazy loading, memory management
 * Provides comprehensive performance optimization for admin-v2 components
 */

import { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { performanceMonitor, virtualScrolling, memoization, networkOptimization } from '../utils/performance';

/**
 * Hook for virtual scrolling implementation
 * @param {Object} config - Virtual scroll configuration
 * @returns {Object} Virtual scroll utilities
 */
export const useVirtualScrolling = (config) => {
  const {
    items = [],
    itemHeight = 50,
    containerHeight = 400,
    overscan = 5,
    enableVirtualization = true,
  } = config;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  // Throttled scroll handler for 60fps performance
  const handleScroll = useMemo(() => 
    performanceMonitor.throttle((e) => {
      setScrollTop(e.target.scrollTop);
    }, 16), // 60fps
    []
  );

  // Calculate visible items
  const virtualState = useMemo(() => {
    if (!enableVirtualization) {
      return {
        visibleItems: items,
        startIndex: 0,
        endIndex: items.length,
        totalHeight: items.length * itemHeight,
        offsetY: 0,
      };
    }

    return virtualScrolling.calculateVisibleItems({
      items,
      containerHeight,
      itemHeight,
      scrollTop,
      overscan,
    });
  }, [items, containerHeight, itemHeight, scrollTop, overscan, enableVirtualization]);

  // Container props for virtual scroll
  const getContainerProps = useCallback(() => {
    return virtualScrolling.createContainerProps({
      height: containerHeight,
      onScroll: handleScroll,
    });
  }, [containerHeight, handleScroll]);

  // Item wrapper props
  const getItemWrapperProps = useCallback(() => {
    return virtualScrolling.createItemWrapperProps({
      totalHeight: virtualState.totalHeight,
      offsetY: virtualState.offsetY,
    });
  }, [virtualState.totalHeight, virtualState.offsetY]);

  return {
    containerRef,
    virtualState,
    getContainerProps,
    getItemWrapperProps,
    scrollToIndex: (index) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
    scrollToTop: () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    },
  };
};

/**
 * Hook for component memoization and re-render optimization
 * @param {Object} config - Memoization configuration
 * @returns {Object} Memoization utilities
 */
export const useMemoization = (config = {}) => {
  const { trackRerenders = false, componentName = 'Unknown' } = config;

  // Track re-renders in development
  useEffect(() => {
    if (trackRerenders && import.meta.env.DEV) {
      performanceMonitor.trackReRenders(componentName, config);
    }
  });

  // Memoized calculation helper
  const memoizedCalculation = useCallback((fn, deps) => {
    return memoization.useMemoizedCalculation(fn, deps);
  }, []);

  // Memoized callback helper
  const memoizedCallback = useCallback((fn, deps) => {
    return memoization.useMemoizedCallback(fn, deps);
  }, []);

  // Create memoized component
  const createMemoComponent = useCallback((Component, areEqual) => {
    return memoization.createMemoComponent(Component, areEqual);
  }, []);

  return {
    memoizedCalculation,
    memoizedCallback,
    createMemoComponent,
    shallowEqual: memoization.shallowEqual,
    useMemo,
    useCallback,
    memo,
  };
};

/**
 * Hook for lazy loading and code splitting
 * @param {Object} config - Lazy loading configuration
 * @returns {Object} Lazy loading utilities
 */
export const useLazyLoading = (config = {}) => {
  const { preloadOnHover = true, preloadOnVisible = true } = config;
  const [loadedComponents, setLoadedComponents] = useState(new Set());
  const observerRef = useRef(null);

  // Preload component on intersection
  const createIntersectionObserver = useCallback(() => {
    if (!preloadOnVisible || !('IntersectionObserver' in window)) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const componentName = entry.target.dataset.component;
            if (componentName && !loadedComponents.has(componentName)) {
              // Trigger component preload
              entry.target.dispatchEvent(new CustomEvent('preload'));
              setLoadedComponents(prev => new Set([...prev, componentName]));
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    return observerRef.current;
  }, [preloadOnVisible, loadedComponents]);

  // Cleanup observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Create lazy component with preloading
  const createLazyComponent = useCallback((importFn, fallback = null) => {
    const LazyComponent = React.lazy(importFn);
    
    return memo((props) => 
      React.createElement(React.Suspense, 
        { fallback: fallback || React.createElement('div', { className: 'loading-accessible' }, 'Loading...') },
        React.createElement(LazyComponent, props)
      )
    );
  }, []);

  // Preload component on hover
  const createHoverPreloader = useCallback((importFn) => {
    let isPreloaded = false;
    
    return {
      onMouseEnter: () => {
        if (!isPreloaded && preloadOnHover) {
          importFn();
          isPreloaded = true;
        }
      },
    };
  }, [preloadOnHover]);

  return {
    createLazyComponent,
    createHoverPreloader,
    createIntersectionObserver,
    loadedComponents,
  };
};

/**
 * Hook for data optimization and caching
 * @param {Object} config - Data optimization configuration
 * @returns {Object} Data optimization utilities
 */
export const useDataOptimization = (config = {}) => {
  const { 
    enablePagination = true,
    pageSize = 20,
    enableSearch = true,
    enableFiltering = true,
    enableSorting = true,
  } = config;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});

  // Debounced search to reduce API calls
  const debouncedSearch = useMemo(
    () => performanceMonitor.debounce((term) => {
      setSearchTerm(term);
      setCurrentPage(1); // Reset to first page on search
    }, 300),
    []
  );

  // Memoized data processing
  const processedData = useMemo(() => {
    let data = config.data || [];

    // Apply search filter
    if (enableSearch && searchTerm) {
      data = data.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    if (enableFiltering && Object.keys(filters).length > 0) {
      data = data.filter(item =>
        Object.entries(filters).every(([key, value]) => {
          if (!value) return true;
          return String(item[key]).toLowerCase().includes(String(value).toLowerCase());
        })
      );
    }

    // Apply sorting
    if (enableSorting && sortConfig.key) {
      data = [...data].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [config.data, searchTerm, filters, sortConfig, enableSearch, enableFiltering, enableSorting]);

  // Paginated data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return processedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, pageSize, enablePagination]);

  // Pagination info
  const paginationInfo = useMemo(() => {
    const totalItems = processedData.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    return {
      currentPage,
      totalPages,
      totalItems,
      pageSize,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: (currentPage - 1) * pageSize + 1,
      endIndex: Math.min(currentPage * pageSize, totalItems),
    };
  }, [processedData.length, currentPage, pageSize]);

  // Sorting handler
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Filter handler
  const handleFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter
  }, []);

  return {
    // Data
    processedData,
    paginatedData,
    paginationInfo,
    
    // Search
    searchTerm,
    setSearchTerm: debouncedSearch,
    
    // Sorting
    sortConfig,
    handleSort,
    
    // Filtering
    filters,
    handleFilter,
    setFilters,
    
    // Pagination
    currentPage,
    setCurrentPage,
    
    // Utilities
    reset: () => {
      setSearchTerm('');
      setCurrentPage(1);
      setSortConfig({ key: null, direction: 'asc' });
      setFilters({});
    },
  };
};

/**
 * Hook for memory management and cleanup
 * @param {Object} config - Memory management configuration
 * @returns {Object} Memory management utilities
 */
export const useMemoryManagement = (config = {}) => {
  const { trackMemory = false, componentName = 'Unknown' } = config;
  const cleanupFunctions = useRef([]);
  const timers = useRef([]);
  const observers = useRef([]);

  // Add cleanup function
  const addCleanup = useCallback((cleanupFn) => {
    cleanupFunctions.current.push(cleanupFn);
  }, []);

  // Add timer for cleanup
  const addTimer = useCallback((timerId) => {
    timers.current.push(timerId);
  }, []);

  // Add observer for cleanup
  const addObserver = useCallback((observer) => {
    observers.current.push(observer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    if (trackMemory && import.meta.env.DEV) {
      console.log(`[Memory] ${componentName} mounted`);
    }

    return () => {
      if (trackMemory && import.meta.env.DEV) {
        console.log(`[Memory] ${componentName} cleaning up`);
      }

      // Clear timers
      timers.current.forEach(timerId => clearTimeout(timerId));
      timers.current = [];

      // Disconnect observers
      observers.current.forEach(observer => {
        if (observer.disconnect) observer.disconnect();
        if (observer.unobserve) observer.unobserve();
      });
      observers.current = [];

      // Run cleanup functions
      cleanupFunctions.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn(`[Memory] Cleanup failed for ${componentName}:`, error);
        }
      });
      cleanupFunctions.current = [];
    };
  }, [trackMemory, componentName]);

  // Create cancellable promise
  const createCancellablePromise = useCallback((asyncFn) => {
    let isCancelled = false;

    const promise = new Promise((resolve, reject) => {
      asyncFn()
        .then(result => {
          if (!isCancelled) {
            resolve(result);
          }
        })
        .catch(error => {
          if (!isCancelled) {
            reject(error);
          }
        });
    });

    const cancel = () => {
      isCancelled = true;
    };

    addCleanup(cancel);

    return { promise, cancel };
  }, [addCleanup]);

  return {
    addCleanup,
    addTimer,
    addObserver,
    createCancellablePromise,
  };
};

/**
 * Hook for render optimization
 * @param {Object} config - Render optimization configuration
 * @returns {Object} Render optimization utilities
 */
export const useRenderOptimization = (config = {}) => {
  const { componentName = 'Unknown', trackPerformance = false } = config;
  const renderCount = useRef(0);
  const renderTimes = useRef([]);

  // Track render performance
  useEffect(() => {
    if (!trackPerformance || !import.meta.env.DEV) return;

    const measureEnd = performanceMonitor.measureRenderTime(componentName);
    
    return () => {
      const renderTime = measureEnd();
      renderTimes.current.push(renderTime);
      renderCount.current += 1;

      // Log performance stats every 10 renders
      if (renderCount.current % 10 === 0) {
        const avgRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
        console.log(`[Render] ${componentName} - ${renderCount.current} renders, avg: ${avgRenderTime.toFixed(2)}ms`);
      }
    };
  });

  // Prevent unnecessary re-renders
  const shouldUpdate = useCallback((prevProps, nextProps) => {
    return !memoization.shallowEqual(prevProps, nextProps);
  }, []);

  // Optimized state updater
  const optimizedStateUpdate = useCallback((updateFn) => {
    return (prevState) => {
      const newState = updateFn(prevState);
      return memoization.shallowEqual(prevState, newState) ? prevState : newState;
    };
  }, []);

  return {
    shouldUpdate,
    optimizedStateUpdate,
    renderCount: renderCount.current,
    averageRenderTime: renderTimes.current.length > 0 
      ? renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length 
      : 0,
  };
};

/**
 * Hook for table performance optimization
 * @param {Object} config - Table configuration
 * @returns {Object} Optimized table utilities
 */
export const useTablePerformance = (config) => {
  const {
    data = [],
    columns = [],
    enableVirtualScrolling = true,
    rowHeight = 50,
    headerHeight = 40,
    containerHeight = 400,
  } = config;

  const virtualScroll = useVirtualScrolling({
    items: data,
    itemHeight: rowHeight,
    containerHeight: containerHeight - headerHeight,
    enableVirtualization: enableVirtualScrolling,
  });

  const dataOptimization = useDataOptimization({
    data,
    enablePagination: !enableVirtualScrolling, // Use pagination OR virtual scrolling
    pageSize: 50,
  });

  // Memoized table data
  const tableData = useMemo(() => {
    return enableVirtualScrolling 
      ? virtualScroll.virtualState.visibleItems 
      : dataOptimization.paginatedData;
  }, [enableVirtualScrolling, virtualScroll.virtualState.visibleItems, dataOptimization.paginatedData]);

  // Memoized column renderers
  const memoizedColumns = useMemo(() => {
    return columns.map(column => ({
      ...column,
      render: column.render ? memo(column.render) : undefined,
    }));
  }, [columns]);

  return {
    tableData,
    columns: memoizedColumns,
    virtualScroll: enableVirtualScrolling ? virtualScroll : null,
    dataOptimization: !enableVirtualScrolling ? dataOptimization : null,
    
    // Performance stats
    itemCount: data.length,
    visibleItemCount: tableData.length,
    isVirtualized: enableVirtualScrolling,
  };
};

/**
 * Hook for API performance optimization
 * @param {Object} config - API optimization configuration
 * @returns {Object} API optimization utilities
 */
export const useAPIOptimization = (config = {}) => {
  const { enableBatching = true, batchSize = 5, enableRetry = true } = config;
  const requestQueue = useRef([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Process batched requests
  const processBatch = useCallback(async () => {
    if (requestQueue.current.length === 0 || isProcessingBatch) return;

    setIsProcessingBatch(true);
    
    try {
      const batch = requestQueue.current.splice(0, batchSize);
      const results = await networkOptimization.batchRequests(batch, batchSize);
      
      // Process results
      results.forEach((result, index) => {
        const request = batch[index];
        if (result.status === 'fulfilled' && request.onSuccess) {
          request.onSuccess(result.value);
        } else if (result.status === 'rejected' && request.onError) {
          request.onError(result.reason);
        }
      });
    } catch (error) {
      console.error('[API Batch] Processing failed:', error);
    } finally {
      setIsProcessingBatch(false);
    }
  }, [batchSize, isProcessingBatch]);

  // Add request to batch
  const batchRequest = useCallback((request) => {
    if (!enableBatching) {
      // Execute immediately
      return networkOptimization.optimizedFetch(request.url, request.options);
    }

    requestQueue.current.push(request);
    
    // Process batch after short delay
    setTimeout(processBatch, 100);
  }, [enableBatching, processBatch]);

  // Optimized fetch with retry
  const optimizedFetch = useCallback((url, options = {}) => {
    return networkOptimization.optimizedFetch(url, {
      ...options,
      retries: enableRetry ? 3 : 0,
    });
  }, [enableRetry]);

  return {
    batchRequest,
    optimizedFetch,
    isProcessingBatch,
    queueLength: requestQueue.current.length,
  };
};

/**
 * Comprehensive performance optimization hook
 * @param {Object} options - Configuration options
 * @returns {Object} All performance optimization utilities
 */
export const usePerformanceOptimization = (options = {}) => {
  const memoization = useMemoization(options.memoization);
  const lazyLoading = useLazyLoading(options.lazyLoading);
  const memoryManagement = useMemoryManagement(options.memory);
  const renderOptimization = useRenderOptimization(options.render);
  const apiOptimization = useAPIOptimization(options.api);

  return {
    // Memoization
    ...memoization,
    
    // Lazy loading
    ...lazyLoading,
    
    // Memory management
    ...memoryManagement,
    
    // Render optimization
    ...renderOptimization,
    
    // API optimization
    ...apiOptimization,
    
    // Utilities
    isOptimized: true,
    hasPerformanceFeatures: true,
  };
};

export default usePerformanceOptimization;