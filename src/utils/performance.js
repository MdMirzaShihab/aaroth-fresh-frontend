/**
 * Performance Monitoring Utilities
 * Tools for monitoring and optimizing application performance
 */

// Performance measurement class
class PerformanceMonitor {
  constructor() {
    this.marks = new Map();
    this.measurements = new Map();
    this.isEnabled = process.env.NODE_ENV !== 'production';
  }

  // Start performance measurement
  mark(name) {
    if (!this.isEnabled) return;

    const timestamp = performance.now();
    this.marks.set(name, timestamp);

    // Also use browser performance API
    if (typeof performance.mark === 'function') {
      performance.mark(`start-${name}`);
    }
  }

  // End performance measurement
  measure(name, startMark = null) {
    if (!this.isEnabled) return 0;

    const endTime = performance.now();
    const startTime = startMark
      ? this.marks.get(startMark)
      : this.marks.get(name);

    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return 0;
    }

    const duration = endTime - startTime;
    this.measurements.set(name, duration);

    // Use browser performance API
    if (
      typeof performance.measure === 'function' &&
      typeof performance.mark === 'function'
    ) {
      try {
        performance.mark(`end-${name}`);
        performance.measure(name, `start-${name}`, `end-${name}`);
      } catch (error) {
        // Ignore errors in performance API
      }
    }

    return duration;
  }

  // Get measurement result
  getMeasurement(name) {
    return this.measurements.get(name) || 0;
  }

  // Get all measurements
  getAllMeasurements() {
    return Object.fromEntries(this.measurements);
  }

  // Clear all measurements
  clear() {
    this.marks.clear();
    this.measurements.clear();

    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks();
    }
    if (typeof performance.clearMeasures === 'function') {
      performance.clearMeasures();
    }
  }

  // Log performance summary
  logSummary() {
    if (!this.isEnabled) return;

    const measurements = this.getAllMeasurements();
    console.group('🚀 Performance Summary');

    Object.entries(measurements)
      .sort(([, a], [, b]) => b - a) // Sort by duration descending
      .forEach(([name, duration]) => {
        const formattedDuration = duration.toFixed(2);
        const level = duration > 100 ? 'warn' : duration > 50 ? 'info' : 'log';
        console[level](`${name}: ${formattedDuration}ms`);
      });

    console.groupEnd();
  }
}

// Global performance monitor instance
export const perfMonitor = new PerformanceMonitor();

// Performance monitoring decorator for functions
export const withPerformanceMonitoring = (name, fn) => {
  return (...args) => {
    perfMonitor.mark(name);
    const result = fn(...args);

    // Handle promises
    if (result && typeof result.then === 'function') {
      return result.finally(() => {
        perfMonitor.measure(name);
      });
    } else {
      perfMonitor.measure(name);
      return result;
    }
  };
};

// React hook for performance monitoring
export const usePerformanceMonitoring = (componentName) => {
  React.useEffect(() => {
    perfMonitor.mark(`${componentName}-mount`);

    return () => {
      const mountTime = perfMonitor.measure(`${componentName}-mount`);
      if (mountTime > 100) {
        console.warn(
          `Slow component mount: ${componentName} took ${mountTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);
};

// Memory usage monitoring
export const getMemoryUsage = () => {
  if (!performance.memory) {
    return {
      supported: false,
      message: 'Memory API not supported in this browser',
    };
  }

  const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } =
    performance.memory;

  return {
    supported: true,
    used: Math.round((usedJSHeapSize / 1024 / 1024) * 100) / 100, // MB
    total: Math.round((totalJSHeapSize / 1024 / 1024) * 100) / 100, // MB
    limit: Math.round((jsHeapSizeLimit / 1024 / 1024) * 100) / 100, // MB
    percentage: Math.round((usedJSHeapSize / jsHeapSizeLimit) * 100),
  };
};

// FPS monitoring
class FPSMonitor {
  constructor() {
    this.fps = 0;
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick();
  }

  stop() {
    this.isRunning = false;
  }

  tick() {
    if (!this.isRunning) return;

    const now = performance.now();
    this.frameCount++;

    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
    }

    requestAnimationFrame(() => this.tick());
  }

  getFPS() {
    return this.fps;
  }
}

export const fpsMonitor = new FPSMonitor();

// Bundle size analysis helpers
export const getBundleInfo = () => {
  const scripts = Array.from(document.querySelectorAll('script[src]'));
  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"]')
  );

  return {
    scripts: scripts.length,
    styles: styles.length,
    scriptSources: scripts.map((s) => s.src),
    styleSources: styles.map((s) => s.href),
  };
};

// Network performance monitoring
export const getNetworkInfo = () => {
  if (!navigator.connection) {
    return {
      supported: false,
      message: 'Network Information API not supported',
    };
  }

  const { effectiveType, downlink, rtt } = navigator.connection;

  return {
    supported: true,
    effectiveType, // '4g', '3g', etc.
    downlink, // Mbps
    rtt, // Round trip time in ms
    slow: effectiveType === 'slow-2g' || effectiveType === '2g',
  };
};

// Core Web Vitals monitoring
export const measureCoreWebVitals = () => {
  const vitals = {};

  // Largest Contentful Paint (LCP)
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    vitals.lcp = lastEntry.startTime;
  });

  try {
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (error) {
    // LCP not supported
    vitals.lcp = null;
  }

  // First Input Delay (FID)
  const fidObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      vitals.fid = entry.processingStart - entry.startTime;
    });
  });

  try {
    fidObserver.observe({ entryTypes: ['first-input'] });
  } catch (error) {
    // FID not supported
    vitals.fid = null;
  }

  // Cumulative Layout Shift (CLS)
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (!entry.hadRecentInput) {
        clsValue += entry.value;
      }
    });
    vitals.cls = clsValue;
  });

  try {
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  } catch (error) {
    // CLS not supported
    vitals.cls = null;
  }

  return vitals;
};

// React performance helpers
export const trackComponentRender = (componentName, renderTime) => {
  if (process.env.NODE_ENV === 'production') return;

  if (renderTime > 16) {
    // 60fps threshold
    console.warn(
      `Slow render: ${componentName} took ${renderTime.toFixed(2)}ms`
    );
  }
};

// Bundle analysis in development
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'production') return;

  const scripts = document.querySelectorAll('script[src]');
  const totalScripts = scripts.length;

  console.group('📦 Bundle Analysis');
  console.log(`Total script files: ${totalScripts}`);

  scripts.forEach((script, index) => {
    const src = script.src;
    const filename = src.split('/').pop();
    console.log(`${index + 1}. ${filename}`);
  });

  console.groupEnd();
};

// Dashboard-specific performance monitoring
export const monitorDashboardPerformance = () => {
  // Monitor chart rendering performance
  const chartRenderTimes = new Map();

  const trackChartRender = (chartType, renderTime) => {
    if (!chartRenderTimes.has(chartType)) {
      chartRenderTimes.set(chartType, []);
    }
    chartRenderTimes.get(chartType).push(renderTime);

    // Log if chart render is slow
    if (renderTime > 100) {
      console.warn(
        `Slow chart render: ${chartType} took ${renderTime.toFixed(2)}ms`
      );
    }
  };

  const getChartPerformanceReport = () => {
    const report = {};
    chartRenderTimes.forEach((times, chartType) => {
      const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      report[chartType] = {
        renders: times.length,
        averageTime: avgTime.toFixed(2),
        maxTime: maxTime.toFixed(2),
      };
    });
    return report;
  };

  return {
    trackChartRender,
    getChartPerformanceReport,
  };
};

// Automatic performance monitoring for development
if (process.env.NODE_ENV === 'development') {
  // Monitor page load performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const paintMetrics = performance.getEntriesByType('paint');
      const navigationMetrics = performance.getEntriesByType('navigation')[0];

      console.group('📊 Page Load Performance');
      console.log(
        `DOM Content Loaded: ${navigationMetrics.domContentLoadedEventEnd.toFixed(2)}ms`
      );
      console.log(
        `Load Complete: ${navigationMetrics.loadEventEnd.toFixed(2)}ms`
      );

      paintMetrics.forEach((metric) => {
        console.log(`${metric.name}: ${metric.startTime.toFixed(2)}ms`);
      });

      const memoryUsage = getMemoryUsage();
      if (memoryUsage.supported) {
        console.log(
          `Memory Usage: ${memoryUsage.used}MB / ${memoryUsage.total}MB (${memoryUsage.percentage}%)`
        );
      }

      console.groupEnd();
    }, 1000);
  });

  // Start FPS monitoring
  fpsMonitor.start();

  // Monitor memory usage periodically
  setInterval(() => {
    const memory = getMemoryUsage();
    if (memory.supported && memory.percentage > 80) {
      console.warn(
        `High memory usage: ${memory.percentage}% (${memory.used}MB)`
      );
    }
  }, 30000); // Check every 30 seconds
}
