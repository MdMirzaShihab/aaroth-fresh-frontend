/**
 * Performance Optimization Service
 * Handles image optimization, lazy loading, caching, and performance monitoring
 */

class PerformanceService {
  constructor() {
    this.imageCache = new Map();
    this.prefetchedUrls = new Set();
    this.intersectionObserver = null;
    this.performanceObserver = null;
    this.metrics = {
      pageLoads: [],
      apiCalls: [],
      imageLoads: [],
      errors: [],
    };

    this.initializeObservers();
    this.setupImageOptimization();
  }

  // Initialize performance observers
  initializeObservers() {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPerformanceMetric(entry);
        }
      });

      try {
        // Observe Core Web Vitals
        this.performanceObserver.observe({
          type: 'navigation',
          buffered: true,
        });

        this.performanceObserver.observe({
          type: 'resource',
          buffered: true,
        });

        this.performanceObserver.observe({
          type: 'paint',
          buffered: true,
        });

        // Observe Largest Contentful Paint
        this.performanceObserver.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        });

        // Observe Cumulative Layout Shift
        this.performanceObserver.observe({
          type: 'layout-shift',
          buffered: true,
        });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Intersection Observer for lazy loading
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadLazyElement(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
  }

  // Record performance metrics
  recordPerformanceMetric(entry) {
    const metric = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: Date.now(),
    };

    switch (entry.entryType) {
      case 'navigation':
        this.metrics.pageLoads.push({
          ...metric,
          domContentLoaded:
            entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
          loadComplete: entry.loadEventEnd - entry.loadEventStart,
          firstByte: entry.responseStart - entry.requestStart,
          domInteractive: entry.domInteractive - entry.navigationStart,
        });
        break;

      case 'resource':
        if (entry.name.includes('/api/')) {
          this.metrics.apiCalls.push({
            ...metric,
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            decodedBodySize: entry.decodedBodySize,
          });
        } else if (this.isImageResource(entry.name)) {
          this.metrics.imageLoads.push({
            ...metric,
            transferSize: entry.transferSize,
          });
        }
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          console.log(
            `First Contentful Paint: ${entry.startTime.toFixed(2)}ms`
          );
        }
        break;

      case 'largest-contentful-paint':
        console.log(
          `Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`
        );
        break;

      case 'layout-shift':
        if (!entry.hadRecentInput) {
          console.log(`Layout Shift: ${entry.value.toFixed(4)}`);
        }
        break;
    }

    // Keep only recent metrics (last 100 entries per type)
    Object.keys(this.metrics).forEach((key) => {
      if (this.metrics[key].length > 100) {
        this.metrics[key] = this.metrics[key].slice(-50);
      }
    });
  }

  // Check if resource is an image
  isImageResource(url) {
    return /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)(\?.*)?$/i.test(url);
  }

  // Setup image optimization
  setupImageOptimization() {
    // Preload critical images
    this.preloadCriticalImages();

    // Setup lazy loading for existing images
    this.setupLazyLoading();
  }

  // Preload critical images
  preloadCriticalImages() {
    const criticalImages = [
      '/logo-192.png',
      '/hero-background.jpg',
      // Add other critical images
    ];

    criticalImages.forEach((src) => {
      if (!this.prefetchedUrls.has(src)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
        this.prefetchedUrls.add(src);
      }
    });
  }

  // Setup lazy loading for images
  setupLazyLoading() {
    const lazyImages = document.querySelectorAll(
      'img[data-lazy], [data-lazy-bg]'
    );
    lazyImages.forEach((img) => {
      this.intersectionObserver.observe(img);
    });
  }

  // Load lazy element when it comes into view
  loadLazyElement(element) {
    if (element.tagName === 'IMG' && element.dataset.lazy) {
      this.loadLazyImage(element);
    } else if (element.dataset.lazyBg) {
      this.loadLazyBackground(element);
    }

    this.intersectionObserver.unobserve(element);
  }

  // Load lazy image
  loadLazyImage(img) {
    const src = img.dataset.lazy;

    // Create a new image to preload
    const newImg = new Image();
    newImg.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      delete img.dataset.lazy;
    };

    newImg.onerror = () => {
      img.classList.add('error');
      this.metrics.errors.push({
        type: 'image_load_error',
        url: src,
        timestamp: Date.now(),
      });
    };

    newImg.src = src;
  }

  // Load lazy background image
  loadLazyBackground(element) {
    const bgSrc = element.dataset.lazyBg;

    const img = new Image();
    img.onload = () => {
      element.style.backgroundImage = `url(${bgSrc})`;
      element.classList.add('loaded');
      delete element.dataset.lazyBg;
    };

    img.onerror = () => {
      element.classList.add('error');
      this.metrics.errors.push({
        type: 'background_image_load_error',
        url: bgSrc,
        timestamp: Date.now(),
      });
    };

    img.src = bgSrc;
  }

  // Optimize image URL with parameters
  optimizeImageUrl(originalUrl, options = {}) {
    const {
      width = null,
      height = null,
      quality = 80,
      format = 'webp',
      fit = 'cover',
    } = options;

    // If it's already optimized or not a suitable image, return as-is
    if (!this.isOptimizableImage(originalUrl)) {
      return originalUrl;
    }

    // Build optimization parameters
    const params = new URLSearchParams();
    if (width) params.set('w', width);
    if (height) params.set('h', height);
    params.set('q', quality);
    params.set('f', format);
    params.set('fit', fit);

    // Return optimized URL (this would work with an image optimization service)
    return `${originalUrl}${originalUrl.includes('?') ? '&' : '?'}${params.toString()}`;
  }

  // Check if image can be optimized
  isOptimizableImage(url) {
    return (
      this.isImageResource(url) &&
      !url.includes('data:') &&
      !url.includes('.svg') &&
      !url.includes('optimized=true')
    );
  }

  // Prefetch resources
  prefetchResource(url, type = 'fetch') {
    if (this.prefetchedUrls.has(url)) return;

    const link = document.createElement('link');
    link.rel = 'prefetch';
    if (type === 'script') {
      link.as = 'script';
    } else if (type === 'style') {
      link.as = 'style';
    } else if (this.isImageResource(url)) {
      link.as = 'image';
    }

    link.href = url;
    document.head.appendChild(link);
    this.prefetchedUrls.add(url);
  }

  // Preload critical resources
  preloadResource(url, type = 'fetch') {
    const link = document.createElement('link');
    link.rel = 'preload';

    if (type === 'script') {
      link.as = 'script';
    } else if (type === 'style') {
      link.as = 'style';
    } else if (this.isImageResource(url)) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
      link.crossOrigin = 'anonymous';
    }

    link.href = url;
    document.head.appendChild(link);
  }

  // Measure and log performance
  measureUserTiming(name, startMark, endMark) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      return measure.duration;
    } catch (error) {
      console.warn('Performance measurement failed:', error);
      return null;
    }
  }

  // Start performance mark
  startMark(name) {
    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      console.warn('Performance mark failed:', error);
    }
  }

  // End performance mark and measure
  endMark(name) {
    try {
      performance.mark(`${name}-end`);
      return this.measureUserTiming(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      console.warn('Performance mark failed:', error);
      return null;
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    let fcp = null;
    let lcp = null;

    paint.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        fcp = entry.startTime;
      }
    });

    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    if (lcpEntries.length > 0) {
      lcp = lcpEntries[lcpEntries.length - 1].startTime;
    }

    return {
      // Core Web Vitals
      firstContentfulPaint: fcp,
      largestContentfulPaint: lcp,

      // Navigation Timing
      pageLoadTime: navigation
        ? navigation.loadEventEnd - navigation.navigationStart
        : null,
      domContentLoaded: navigation
        ? navigation.domContentLoadedEventEnd - navigation.navigationStart
        : null,
      firstByte: navigation
        ? navigation.responseStart - navigation.requestStart
        : null,

      // Resource counts
      totalApiCalls: this.metrics.apiCalls.length,
      totalImageLoads: this.metrics.imageLoads.length,
      totalErrors: this.metrics.errors.length,

      // Memory usage (if available)
      memoryUsage: performance.memory
        ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit,
          }
        : null,
    };
  }

  // Observe new images for lazy loading
  observeElement(element) {
    if (this.intersectionObserver && element) {
      this.intersectionObserver.observe(element);
    }
  }

  // Unobserve element
  unobserveElement(element) {
    if (this.intersectionObserver && element) {
      this.intersectionObserver.unobserve(element);
    }
  }

  // Clean up observers
  cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }

  // Report performance metrics to analytics
  reportMetrics() {
    const summary = this.getPerformanceSummary();

    // This would typically send data to an analytics service
    console.log('Performance Summary:', summary);

    // Example: Send to Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_performance', {
        custom_map: {
          first_contentful_paint: summary.firstContentfulPaint,
          largest_contentful_paint: summary.largestContentfulPaint,
          page_load_time: summary.pageLoadTime,
        },
      });
    }

    return summary;
  }
}

// Export singleton instance
export default new PerformanceService();
