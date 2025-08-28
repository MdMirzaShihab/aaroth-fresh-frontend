/**
 * Performance Service - Admin V2
 * System performance monitoring and SLA tracking
 */

import { format } from 'date-fns';

/**
 * Transform performance metrics for admin dashboard
 */
export const transformPerformanceMetrics = (rawData) => {
  if (!rawData?.data) return null;

  return {
    systemHealth: {
      status: rawData.data.systemStatus || 'healthy',
      uptime: rawData.data.uptime || 0,
      responseTime: rawData.data.averageResponseTime || 0,
      errorRate: rawData.data.errorRate || 0
    },
    apiMetrics: {
      totalRequests: rawData.data.totalRequests || 0,
      successRate: rawData.data.successRate || 0,
      averageLatency: rawData.data.averageLatency || 0,
      rateLimitHits: rawData.data.rateLimitHits || 0
    },
    databaseMetrics: {
      connectionPoolUsage: rawData.data.dbConnectionUsage || 0,
      queryPerformance: rawData.data.avgQueryTime || 0,
      slowQueries: rawData.data.slowQueries || 0,
      storageUsage: rawData.data.storageUsage || 0
    },
    businessMetrics: {
      activeUsers: rawData.data.activeUsers || 0,
      transactionVolume: rawData.data.transactionVolume || 0,
      orderProcessingTime: rawData.data.avgOrderProcessingTime || 0,
      verificationQueueSize: rawData.data.verificationQueue || 0
    },
    alerts: transformAlerts(rawData.data.alerts || []),
    trends: transformTrendData(rawData.data.trends || [])
  };
};

/**
 * Transform alerts data
 */
const transformAlerts = (alerts) => {
  return alerts.map(alert => ({
    id: alert.id,
    type: alert.type,
    severity: alert.severity,
    message: alert.message,
    timestamp: format(new Date(alert.timestamp), 'PPp'),
    resolved: alert.resolved || false
  }));
};

/**
 * Transform trend data for charts
 */
const transformTrendData = (trends) => {
  return trends.map(trend => ({
    metric: trend.metric,
    data: trend.data.map(point => ({
      time: format(new Date(point.timestamp), 'HH:mm'),
      value: point.value
    }))
  }));
};

/**
 * Calculate system health score
 */
export const calculateHealthScore = (metrics) => {
  let score = 100;
  
  // Deduct for high error rates
  if (metrics.apiMetrics.errorRate > 5) score -= 30;
  else if (metrics.apiMetrics.errorRate > 2) score -= 15;
  else if (metrics.apiMetrics.errorRate > 1) score -= 5;
  
  // Deduct for slow response times
  if (metrics.systemHealth.responseTime > 2000) score -= 25;
  else if (metrics.systemHealth.responseTime > 1000) score -= 15;
  else if (metrics.systemHealth.responseTime > 500) score -= 5;
  
  // Deduct for database issues
  if (metrics.databaseMetrics.connectionPoolUsage > 90) score -= 20;
  else if (metrics.databaseMetrics.connectionPoolUsage > 70) score -= 10;
  
  // Deduct for business process delays
  if (metrics.businessMetrics.verificationQueueSize > 100) score -= 15;
  else if (metrics.businessMetrics.verificationQueueSize > 50) score -= 10;
  
  return Math.max(score, 0);
};

/**
 * Generate performance thresholds
 */
export const getPerformanceThresholds = () => {
  return {
    responseTime: { good: 500, warning: 1000, critical: 2000 },
    errorRate: { good: 1, warning: 2, critical: 5 },
    uptime: { good: 99.9, warning: 99.5, critical: 99.0 },
    databaseConnections: { good: 50, warning: 70, critical: 90 }
  };
};

const performanceService = {
  transformPerformanceMetrics,
  calculateHealthScore,
  getPerformanceThresholds
};

export default performanceService;