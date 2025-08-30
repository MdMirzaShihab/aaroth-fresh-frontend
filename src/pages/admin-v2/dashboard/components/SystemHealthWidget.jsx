/**
 * SystemHealthWidget - System Monitoring and SLA Tracking Component
 * Features: Real-time health metrics, API response times, SLA compliance, alert thresholds
 * Provides comprehensive system monitoring with visual indicators and trend analysis
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Database,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Users,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';

const SystemHealthWidget = ({
  healthData = {},
  slaMetrics = {},
  realTimeMetrics = {},
  alertThresholds = {},
  onMetricClick,
  refreshInterval = 30000,
  className = ""
}) => {
  const { isDarkMode } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [trendData, setTrendData] = useState({});

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // System health metrics configuration
  const healthMetrics = [
    {
      id: 'api_response',
      label: 'API Response Time',
      value: realTimeMetrics.apiResponseTime || 0,
      unit: 'ms',
      threshold: alertThresholds.apiResponseTime || 500,
      icon: Zap,
      description: 'Average API response time',
      trend: trendData.apiResponseTime || 0
    },
    {
      id: 'database_performance',
      label: 'Database Performance',
      value: realTimeMetrics.databaseResponseTime || 0,
      unit: 'ms',
      threshold: alertThresholds.databaseResponseTime || 100,
      icon: Database,
      description: 'Database query performance',
      trend: trendData.databaseResponseTime || 0
    },
    {
      id: 'active_connections',
      label: 'Active Connections',
      value: realTimeMetrics.activeConnections || 0,
      unit: '',
      threshold: alertThresholds.maxConnections || 1000,
      icon: Wifi,
      description: 'Current active connections',
      trend: trendData.activeConnections || 0
    },
    {
      id: 'error_rate',
      label: 'Error Rate',
      value: realTimeMetrics.errorRate || 0,
      unit: '%',
      threshold: alertThresholds.errorRate || 5,
      icon: AlertTriangle,
      description: 'System error percentage',
      trend: trendData.errorRate || 0,
      inverted: true // Lower is better
    }
  ];

  // SLA compliance metrics
  const slaCompliance = [
    {
      id: 'uptime',
      label: 'System Uptime',
      value: slaMetrics.uptime || 99.9,
      target: 99.9,
      unit: '%',
      icon: Server
    },
    {
      id: 'availability',
      label: 'Service Availability',
      value: slaMetrics.availability || 99.5,
      target: 99.5,
      unit: '%',
      icon: Shield
    },
    {
      id: 'response_time_sla',
      label: 'Response Time SLA',
      value: slaMetrics.responseTimeSLA || 95,
      target: 95,
      unit: '%',
      icon: Clock
    }
  ];

  // Resource utilization metrics
  const resourceMetrics = [
    {
      id: 'cpu_usage',
      label: 'CPU Usage',
      value: realTimeMetrics.cpuUsage || 0,
      max: 100,
      unit: '%',
      icon: Cpu,
      threshold: 80
    },
    {
      id: 'memory_usage',
      label: 'Memory Usage',
      value: realTimeMetrics.memoryUsage || 0,
      max: 100,
      unit: '%',
      icon: MemoryStick,
      threshold: 85
    },
    {
      id: 'disk_usage',
      label: 'Disk Usage',
      value: realTimeMetrics.diskUsage || 0,
      max: 100,
      unit: '%',
      icon: HardDrive,
      threshold: 90
    }
  ];

  // Calculate overall system health score
  const overallHealthScore = useMemo(() => {
    const scores = healthMetrics.map(metric => {
      if (metric.inverted) {
        return Math.max(0, 100 - (metric.value / metric.threshold) * 100);
      }
      return Math.max(0, 100 - Math.max(0, metric.value - metric.threshold) / metric.threshold * 100);
    });
    
    const resourceScores = resourceMetrics.map(metric => 
      Math.max(0, 100 - Math.max(0, metric.value - metric.threshold) / (100 - metric.threshold) * 100)
    );
    
    const allScores = [...scores, ...resourceScores];
    return allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
  }, [healthMetrics, resourceMetrics]);

  // Get status color based on metric value
  const getStatusColor = (metric, value = metric.value) => {
    if (metric.inverted) {
      if (value <= metric.threshold * 0.5) return 'green';
      if (value <= metric.threshold) return 'yellow';
      return 'red';
    } else {
      if (value <= metric.threshold * 0.7) return 'green';
      if (value <= metric.threshold) return 'yellow';
      return 'red';
    }
  };

  // Get status color for SLA
  const getSLAStatusColor = (value, target) => {
    if (value >= target) return 'green';
    if (value >= target * 0.95) return 'yellow';
    return 'red';
  };

  // Get color scheme for status
  const getColorScheme = (status) => {
    const schemes = {
      green: {
        bg: isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10',
        text: isDarkMode ? 'text-sage-green' : 'text-muted-olive',
        icon: isDarkMode ? 'text-sage-green' : 'text-muted-olive'
      },
      yellow: {
        bg: isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10',
        text: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown',
        icon: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown'
      },
      red: {
        bg: isDarkMode ? 'bg-tomato-red/20' : 'bg-tomato-red/10',
        text: 'text-tomato-red',
        icon: 'text-tomato-red'
      }
    };
    return schemes[status] || schemes.green;
  };

  // Render metric card
  const renderMetricCard = (metric, index) => {
    const status = getStatusColor(metric);
    const colorScheme = getColorScheme(status);
    const IconComponent = metric.icon;
    const isAlert = status === 'red';

    return (
      <motion.div
        key={metric.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`
          relative p-3 rounded-xl border cursor-pointer transition-all duration-200
          ${colorScheme.bg} ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
          hover:shadow-lg hover:shadow-sage-green/10 hover:-translate-y-1
          ${isAlert ? 'animate-pulse' : ''}
        `}
        onClick={() => onMetricClick?.(metric)}
      >
        {/* Alert Badge */}
        {isAlert && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-tomato-red rounded-full animate-bounce" />
        )}

        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              <IconComponent className={`w-3 h-3 ${colorScheme.icon}`} />
              <span className={`text-xs font-medium truncate ${colorScheme.text}`}>
                {metric.label}
              </span>
            </div>

            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-bold ${colorScheme.text}`}>
                {typeof metric.value === 'number' ? metric.value.toFixed(metric.unit === '%' ? 1 : 0) : metric.value}
              </span>
              <span className={`text-xs ${colorScheme.text} opacity-70`}>
                {metric.unit}
              </span>
            </div>
          </div>

          {/* Trend Indicator */}
          {metric.trend !== undefined && (
            <div className="flex-shrink-0 ml-1">
              {metric.trend > 0 ? (
                <TrendingUp className={`w-3 h-3 ${metric.inverted ? 'text-tomato-red' : colorScheme.icon}`} />
              ) : metric.trend < 0 ? (
                <TrendingDown className={`w-3 h-3 ${metric.inverted ? colorScheme.icon : 'text-tomato-red'}`} />
              ) : (
                <div className={`w-3 h-0.5 rounded-full ${colorScheme.bg}`} />
              )}
            </div>
          )}
        </div>

        {/* Threshold Bar */}
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (metric.value / metric.threshold) * 100)}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-full rounded-full ${
              status === 'green' ? 'bg-sage-green' :
              status === 'yellow' ? 'bg-earthy-yellow' : 'bg-tomato-red'
            }`}
          />
        </div>
      </motion.div>
    );
  };

  // Render SLA compliance card
  const renderSLACard = (sla, index) => {
    const status = getSLAStatusColor(sla.value, sla.target);
    const colorScheme = getColorScheme(status);
    const IconComponent = sla.icon;
    const compliance = (sla.value / sla.target) * 100;

    return (
      <motion.div
        key={sla.id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className={`
          p-3 lg:p-4 rounded-xl lg:rounded-2xl border
          ${colorScheme.bg} ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
        `}
      >
        <div className="flex items-center justify-between mb-2 lg:mb-3">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-3 lg:w-4 h-3 lg:h-4 ${colorScheme.icon}`} />
            <span className={`text-xs lg:text-sm font-medium ${colorScheme.text}`}>
              {sla.label}
            </span>
          </div>
          {status === 'green' ? (
            <CheckCircle className="w-3 lg:w-4 h-3 lg:h-4 text-sage-green" />
          ) : status === 'yellow' ? (
            <AlertTriangle className="w-3 lg:w-4 h-3 lg:h-4 text-earthy-yellow" />
          ) : (
            <XCircle className="w-3 lg:w-4 h-3 lg:h-4 text-tomato-red" />
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className={`text-sm lg:text-lg font-bold ${colorScheme.text}`}>
              {sla.value.toFixed(2)}{sla.unit}
            </span>
            <span className={`text-xs opacity-70 ${colorScheme.text}`}>
              Target: {sla.target}{sla.unit}
            </span>
          </div>

          {/* Compliance Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, compliance)}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full rounded-full ${
                status === 'green' ? 'bg-sage-green' :
                status === 'yellow' ? 'bg-earthy-yellow' : 'bg-tomato-red'
              }`}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  // Render resource usage card
  const renderResourceCard = (resource, index) => {
    const status = resource.value > resource.threshold ? 'red' : 
                   resource.value > resource.threshold * 0.8 ? 'yellow' : 'green';
    const colorScheme = getColorScheme(status);
    const IconComponent = resource.icon;

    return (
      <motion.div
        key={resource.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`
          p-3 rounded-xl border
          ${colorScheme.bg} ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
        `}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <IconComponent className={`w-3 lg:w-4 h-3 lg:h-4 ${colorScheme.icon}`} />
            <span className={`text-xs lg:text-sm font-medium ${colorScheme.text}`}>
              {resource.label}
            </span>
          </div>
          <span className={`text-xs lg:text-sm font-bold ${colorScheme.text}`}>
            {resource.value.toFixed(0)}{resource.unit}
          </span>
        </div>

        {/* Usage Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${resource.value}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-full rounded-full ${
              status === 'green' ? 'bg-sage-green' :
              status === 'yellow' ? 'bg-earthy-yellow' : 'bg-tomato-red'
            }`}
          />
        </div>
      </motion.div>
    );
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`} />
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            System Health
          </h3>
        </div>

        {/* Overall Health Score */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Health Score
            </div>
            <div className={`text-lg font-bold ${
              overallHealthScore >= 90 ? (isDarkMode ? 'text-sage-green' : 'text-muted-olive') :
              overallHealthScore >= 70 ? (isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown') :
              'text-tomato-red'
            }`}>
              {overallHealthScore.toFixed(0)}%
            </div>
          </div>
          
          <div className={`
            w-12 h-12 rounded-2xl flex items-center justify-center
            ${overallHealthScore >= 90 ? (isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10') :
              overallHealthScore >= 70 ? (isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10') :
              'bg-tomato-red/20'
            }
          `}>
            {overallHealthScore >= 90 ? (
              <CheckCircle className={`w-6 h-6 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`} />
            ) : overallHealthScore >= 70 ? (
              <AlertTriangle className={`w-6 h-6 ${isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown'}`} />
            ) : (
              <XCircle className="w-6 h-6 text-tomato-red" />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Health Metrics */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            Performance Metrics
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {healthMetrics.map((metric, index) => renderMetricCard(metric, index))}
          </div>
        </div>

        {/* SLA Compliance */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            SLA Compliance
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {slaCompliance.map((sla, index) => renderSLACard(sla, index))}
          </div>
        </div>

        {/* Resource Utilization */}
        <div>
          <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            Resource Utilization
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {resourceMetrics.map((resource, index) => renderResourceCard(resource, index))}
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`flex items-center gap-2 text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
            <Clock className="w-3 h-3" />
            <span>
              Last updated: {currentTime.toLocaleTimeString()}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-sage-green' : 'bg-muted-olive'} animate-pulse`} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SystemHealthWidget;