# Aaroth Fresh Admin V2 - Production Configuration Guide

## Overview
This guide provides comprehensive production deployment and monitoring configuration for the Aaroth Fresh Admin V2 interface with enhanced system settings management, mobile optimization, accessibility compliance, and performance optimizations.

## Environment Variables

### Application Configuration
```env
# Application
REACT_APP_NAME=Aaroth Fresh Admin
REACT_APP_VERSION=2.0.0
REACT_APP_ENVIRONMENT=production

# API Configuration
REACT_APP_API_BASE_URL=https://api.aarothfresh.com/api/v1
REACT_APP_API_TIMEOUT=30000

# Authentication
REACT_APP_JWT_EXPIRY=8h
REACT_APP_REFRESH_THRESHOLD=15m

# Features Flags
REACT_APP_ENABLE_ADMIN_V2=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true
REACT_APP_ENABLE_ACCESSIBILITY_FEATURES=true
REACT_APP_ENABLE_MOBILE_OPTIMIZATION=true
```

### Performance & Monitoring
```env
# Performance Monitoring
REACT_APP_PERFORMANCE_BUDGET_FCP=2500
REACT_APP_PERFORMANCE_BUDGET_LCP=4000
REACT_APP_PERFORMANCE_BUDGET_FID=100
REACT_APP_PERFORMANCE_BUDGET_CLS=0.1

# Virtual Scrolling
REACT_APP_VIRTUAL_SCROLL_THRESHOLD=50
REACT_APP_VIRTUAL_SCROLL_OVERSCAN=5

# Memory Management
REACT_APP_MEMORY_WARNING_THRESHOLD=80
REACT_APP_MEMORY_CRITICAL_THRESHOLD=90

# Bundle Analysis
REACT_APP_ANALYZE_BUNDLE=false
REACT_APP_BUNDLE_SIZE_LIMIT=2MB
```

### Security Configuration
```env
# Security Headers
REACT_APP_CSP_ENABLED=true
REACT_APP_HSTS_ENABLED=true
REACT_APP_REFERRER_POLICY=strict-origin-when-cross-origin

# Session Management
REACT_APP_SESSION_TIMEOUT=8h
REACT_APP_IDLE_TIMEOUT=30m
REACT_APP_MAX_LOGIN_ATTEMPTS=5
```

## Build Configuration

### Production Build Script
```json
{
  "scripts": {
    "build:prod": "npm run analyze && GENERATE_SOURCEMAP=false npm run build",
    "build:staging": "REACT_APP_ENVIRONMENT=staging npm run build",
    "analyze": "npm run build -- --analyze",
    "test:prod": "npm run test -- --coverage --watchAll=false"
  }
}
```

### Vite Production Configuration
```javascript
// vite.config.js - Production optimizations
export default {
  build: {
    minify: 'terser',
    cssMinify: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'admin-v2': [
            './src/pages/admin-v2/settings/SystemSettings',
            './src/components/admin-v2/OptimizedUserList',
            './src/hooks/usePerformanceOptimization'
          ],
          'vendor': ['react', 'react-dom'],
          'ui': ['framer-motion', 'lucide-react'],
          'forms': ['react-hook-form'],
          'charts': ['recharts']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  server: {
    compress: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    }
  }
}
```

## Performance Monitoring

### Core Web Vitals Thresholds
```javascript
// Performance thresholds for production monitoring
const PERFORMANCE_THRESHOLDS = {
  // Core Web Vitals
  LCP: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needs_improvement: 300 },   // First Input Delay
  CLS: { good: 0.1, needs_improvement: 0.25 },  // Cumulative Layout Shift
  
  // Additional metrics
  TTFB: { good: 800, needs_improvement: 1800 }, // Time to First Byte
  FCP: { good: 1800, needs_improvement: 3000 }, // First Contentful Paint
  
  // Memory Usage
  MEMORY: { warning: 80, critical: 90 }, // Percentage thresholds
  
  // Bundle sizes
  BUNDLE_SIZE: { 
    main: 500, // KB
    vendor: 800, // KB
    total: 2000 // KB
  }
};
```

### Monitoring Integration
```javascript
// monitoring.js - Production monitoring setup
import { perfMonitor, measureCoreWebVitals } from './utils/performance';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'production') {
  // Core Web Vitals monitoring
  measureCoreWebVitals();
  
  // Memory monitoring
  setInterval(() => {
    const memory = performance.memory;
    if (memory && memory.usedJSHeapSize) {
      const usage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      if (usage > PERFORMANCE_THRESHOLDS.MEMORY.critical) {
        console.error('[Memory] Critical usage:', usage.toFixed(1) + '%');
      }
    }
  }, 60000); // Check every minute
  
  // Error boundary reporting
  window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise]', event.reason);
  });
}
```

## Accessibility Configuration

### WCAG 2.1 AA Compliance Settings
```javascript
// accessibility.config.js
export const ACCESSIBILITY_CONFIG = {
  // Color contrast requirements
  contrast: {
    normal: 4.5, // AA standard
    large: 3.0,  // Large text AA standard
    enhanced: 7.0 // AAA standard (target)
  },
  
  // Focus management
  focus: {
    visible: true,
    trapKeyboard: true,
    restoreOnUnmount: true,
    skipToContent: true
  },
  
  // Screen reader support
  screenReader: {
    announcements: true,
    liveRegions: true,
    descriptiveText: true,
    skipLinks: true
  },
  
  // Motor accessibility
  motor: {
    touchTargetSize: 44, // Minimum 44px for mobile
    clickDelay: 500, // Prevent accidental double-clicks
    hoverDelay: 200 // Hover delay for motor impaired users
  },
  
  // Animation preferences
  animation: {
    respectReducedMotion: true,
    maxDuration: 500, // Maximum animation duration
    easingFunction: 'ease-out'
  }
};
```

## Mobile Optimization

### Touch Target Configuration
```css
/* Touch target optimization */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.touch-target-large {
  min-height: 48px;
  min-width: 48px;
}

/* Gesture support */
.swipe-enabled {
  touch-action: pan-x pan-y;
  -webkit-overflow-scrolling: touch;
}

/* Safe area support */
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(1rem, env(safe-area-inset-top));
  }
  
  .safe-area-bottom {
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
  }
}
```

### Mobile Performance Settings
```javascript
// mobile.config.js
export const MOBILE_CONFIG = {
  // Virtual scrolling thresholds
  virtualScrolling: {
    enabledThreshold: 30, // Enable for lists with 30+ items
    overscan: 3, // Reduced overscan for mobile
    rowHeight: 120 // Larger touch-friendly rows
  },
  
  // Image optimization
  images: {
    lazyLoading: true,
    webpSupport: true,
    responsiveSizes: ['320w', '640w', '960w', '1280w']
  },
  
  // Network optimization
  network: {
    enableOffline: true,
    cacheStrategy: 'networkFirst',
    maxRetries: 3
  }
};
```

## Security Configuration

### Content Security Policy
```nginx
# CSP Headers for production
add_header Content-Security-Policy "
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.aarothfresh.com wss://api.aarothfresh.com;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
" always;
```

### Additional Security Headers
```nginx
# Security headers
add_header X-Frame-Options DENY always;
add_header X-Content-Type-Options nosniff always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

## Deployment Configuration

### Docker Production Setup
```dockerfile
# Production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Production Configuration
```nginx
# nginx.prod.conf
server {
    listen 80;
    server_name admin.aarothfresh.com;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers (as defined above)
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

## Monitoring & Analytics

### Error Tracking Setup
```javascript
// error-tracking.js
if (process.env.NODE_ENV === 'production') {
  // Initialize error tracking service (e.g., Sentry)
  import('./sentry.config').then(({ initSentry }) => {
    initSentry({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: 'production',
      tracesSampleRate: 0.1,
      beforeSend(event) {
        // Filter out non-critical errors
        if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
          return null; // Don't report chunk load errors
        }
        return event;
      }
    });
  });
}
```

### Performance Analytics
```javascript
// analytics.js
export const trackPerformance = () => {
  // Track Core Web Vitals
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
  
  // Track custom metrics
  trackSettingsPerformance();
  trackUserInteractionPerformance();
  trackMobileUsagePatterns();
};

const trackSettingsPerformance = () => {
  const settingsSaveTime = performance.getEntriesByName('settings-save');
  if (settingsSaveTime.length > 0) {
    sendToAnalytics({
      name: 'settings_save_duration',
      value: settingsSaveTime[0].duration
    });
  }
};
```

## Health Checks & Monitoring

### Application Health Endpoint
```javascript
// health.js
export const healthCheck = () => {
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.REACT_APP_VERSION,
    features: {
      adminV2: !!process.env.REACT_APP_ENABLE_ADMIN_V2,
      performance: !!process.env.REACT_APP_ENABLE_PERFORMANCE_MONITORING,
      accessibility: !!process.env.REACT_APP_ENABLE_ACCESSIBILITY_FEATURES,
      mobile: !!process.env.REACT_APP_ENABLE_MOBILE_OPTIMIZATION
    },
    memory: getMemoryUsage(),
    performance: getPerformanceMetrics()
  };
};
```

### Monitoring Dashboard
```javascript
// monitoring-dashboard.js
const MONITORING_CONFIG = {
  // Key metrics to track
  metrics: [
    'page_load_time',
    'settings_save_duration',
    'virtual_scroll_performance',
    'accessibility_violations',
    'mobile_interaction_success_rate',
    'memory_usage',
    'bundle_size'
  ],
  
  // Alert thresholds
  alerts: {
    page_load_time: { warning: 3000, critical: 5000 },
    settings_save_duration: { warning: 2000, critical: 5000 },
    memory_usage: { warning: 80, critical: 90 },
    accessibility_violations: { warning: 1, critical: 5 }
  }
};
```

## Deployment Checklist

### Pre-deployment Validation
- [ ] Performance tests pass (LCP < 4s, FID < 300ms, CLS < 0.25)
- [ ] Accessibility audit passes (WCAG 2.1 AA compliant)
- [ ] Mobile optimization verified (44px touch targets, responsive design)
- [ ] Bundle size within limits (< 2MB total)
- [ ] Security headers configured
- [ ] Environment variables set
- [ ] Error tracking configured
- [ ] Health checks operational

### Post-deployment Monitoring
- [ ] Core Web Vitals tracking active
- [ ] Error rates within acceptable limits (< 1%)
- [ ] Memory usage stable (< 80% threshold)
- [ ] Settings functionality verified
- [ ] Mobile performance validated
- [ ] Accessibility features working
- [ ] Real-time updates functioning

## Maintenance & Updates

### Regular Maintenance Tasks
1. **Weekly**: Review performance metrics and error rates
2. **Monthly**: Update dependencies and security patches  
3. **Quarterly**: Accessibility audit and mobile UX review
4. **Annually**: Comprehensive security review and penetration testing

### Performance Optimization Schedule
1. **Bundle Analysis**: Monthly review of bundle sizes
2. **Memory Profiling**: Quarterly memory leak detection
3. **Accessibility Testing**: Bi-annual comprehensive audit
4. **Mobile Performance**: Quarterly device testing across major platforms

This production configuration ensures the Aaroth Fresh Admin V2 interface operates at peak performance with comprehensive monitoring, security, accessibility compliance, and mobile optimization in production environments.