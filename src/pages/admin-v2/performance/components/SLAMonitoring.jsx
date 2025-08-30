/**
 * SLAMonitoring - Service Level Agreement Monitoring and Violation Tracking
 * Features: SLA compliance tracking, violation alerts, performance targets, trend analysis
 * Provides comprehensive monitoring of service level agreements and performance standards
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Server,
  Users,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Bell,
  Settings,
  Award,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import { LineChart, BarChart } from '../../../../components/ui/charts/ChartJS';
import { format, subDays, subHours } from 'date-fns';
import toast from 'react-hot-toast';

// SLA metric card component
const SLAMetricCard = ({ 
  title, 
  value, 
  target, 
  status, 
  change, 
  trend, 
  icon: Icon, 
  color = 'sage-green',
  subtitle,
  onClick,
  isLoading = false,
  violations = 0 
}) => {
  const { isDarkMode } = useTheme();
  
  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpRight;
    if (trend === 'down') return ArrowDownRight;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return isDarkMode ? 'text-sage-green' : 'text-muted-olive';
    if (trend === 'down') return 'text-tomato-red';
    return isDarkMode ? 'text-gray-400' : 'text-text-muted';
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'compliant':
        return {
          bg: isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20',
          icon: CheckCircle,
          iconColor: 'text-sage-green',
        };
      case 'warning':
        return {
          bg: isDarkMode ? 'bg-earthy-yellow/5 border-earthy-yellow/20' : 'bg-earthy-yellow/5 border-earthy-yellow/20',
          icon: AlertTriangle,
          iconColor: 'text-earthy-yellow',
        };
      case 'violation':
        return {
          bg: 'bg-tomato-red/5 border-tomato-red/20',
          icon: XCircle,
          iconColor: 'text-tomato-red',
        };
      default:
        return {
          bg: isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50',
          icon: Shield,
          iconColor: isDarkMode ? 'text-gray-400' : 'text-text-muted',
        };
    }
  };

  const TrendIcon = getTrendIcon();
  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-6 border hover:shadow-glow-sage/10 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${statusConfig.bg}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isDarkMode ? `bg-${color}/20` : `bg-${color}/10`}
          `}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{change}%</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                {value}
              </p>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                / {target}
              </p>
            </div>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {title}
            </p>
            {subtitle && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted/80'}`}>
                {subtitle}
              </p>
            )}
            {violations > 0 && (
              <p className={`text-xs text-tomato-red font-medium`}>
                {violations} violation{violations !== 1 ? 's' : ''}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// SLA violation item component
const SLAViolationItem = ({ violation, onAction, onResolve }) => {
  const { isDarkMode } = useTheme();

  const getSeverityConfig = (severity) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-tomato-red/5 border-tomato-red/20',
          text: 'text-tomato-red',
          icon: AlertCircle,
        };
      case 'high':
        return {
          bg: isDarkMode ? 'bg-earthy-yellow/5 border-earthy-yellow/20' : 'bg-earthy-yellow/5 border-earthy-yellow/20',
          text: 'text-earthy-yellow',
          icon: AlertTriangle,
        };
      case 'medium':
        return {
          bg: isDarkMode ? 'bg-blue-500/5 border-blue-500/20' : 'bg-blue-100 border-blue-200',
          text: 'text-blue-600',
          icon: AlertTriangle,
        };
      default:
        return {
          bg: isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200',
          text: isDarkMode ? 'text-gray-300' : 'text-text-muted',
          icon: AlertTriangle,
        };
    }
  };

  const config = getSeverityConfig(violation.severity);
  const SeverityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`
        ${config.bg} border rounded-xl p-4 transition-all duration-200
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <SeverityIcon className={`w-5 h-5 ${config.text} mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                {violation.title}
              </h4>
              <span className={`
                px-2 py-1 rounded text-xs font-medium uppercase ${config.text} ${config.bg}
              `}>
                {violation.severity}
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'} mb-2`}>
              {violation.description}
            </p>
            <div className="flex items-center gap-4 text-xs">
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
                Metric: {violation.metric}
              </span>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
                Target: {violation.target}
              </span>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
                Actual: {violation.actual}
              </span>
              <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
                Duration: {violation.duration}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction(violation)}
            className="text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {violation.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onResolve(violation)}
              className="text-xs text-sage-green border-sage-green/30 hover:bg-sage-green/10"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
          Started: {format(new Date(violation.startTime), 'MMM dd, HH:mm')}
        </span>
        <span className={`${config.text} font-medium`}>
          Impact: {violation.impact}
        </span>
      </div>
    </motion.div>
  );
};

const SLAMonitoring = ({ 
  data = {}, 
  metrics = {},
  isLoading = false, 
  timeRange = '24h',
  onTimeRangeChange 
}) => {
  const { isDarkMode } = useTheme();
  const [chartView, setChartView] = useState('compliance'); // compliance, violations, trends
  const [severityFilter, setSeverityFilter] = useState('all');
  const [selectedSLA, setSelectedSLA] = useState(null);

  // SLA targets and current performance
  const slaTargets = useMemo(() => [
    {
      id: 'uptime',
      name: 'System Uptime',
      target: 99.9,
      current: metrics.uptimeSLA || 99.94,
      unit: '%',
      icon: Server,
      color: 'sage-green',
      status: (metrics.uptimeSLA || 99.94) >= 99.9 ? 'compliant' : (metrics.uptimeSLA || 99.94) >= 99.5 ? 'warning' : 'violation',
      change: 0.02,
      trend: 'up',
    },
    {
      id: 'response-time',
      name: 'Response Time',
      target: 95.0,
      current: metrics.responseTimeSLA || 97.8,
      unit: '%',
      icon: Zap,
      color: 'sage-green',
      status: (metrics.responseTimeSLA || 97.8) >= 95.0 ? 'compliant' : (metrics.responseTimeSLA || 97.8) >= 90.0 ? 'warning' : 'violation',
      change: 1.2,
      trend: 'up',
    },
    {
      id: 'resolution-time',
      name: 'Issue Resolution',
      target: 90.0,
      current: metrics.resolutionTimeSLA || 94.2,
      unit: '%',
      icon: CheckCircle,
      color: 'earthy-yellow',
      status: (metrics.resolutionTimeSLA || 94.2) >= 90.0 ? 'compliant' : (metrics.resolutionTimeSLA || 94.2) >= 80.0 ? 'warning' : 'violation',
      change: 3.1,
      trend: 'up',
    },
    {
      id: 'customer-satisfaction',
      name: 'Customer Satisfaction',
      target: 95.0,
      current: metrics.customerSatisfactionSLA || 96.5,
      unit: '%',
      icon: Users,
      color: 'dusty-cedar',
      status: (metrics.customerSatisfactionSLA || 96.5) >= 95.0 ? 'compliant' : (metrics.customerSatisfactionSLA || 96.5) >= 90.0 ? 'warning' : 'violation',
      change: 1.8,
      trend: 'up',
    },
    {
      id: 'api-availability',
      name: 'API Availability',
      target: 99.5,
      current: 99.8,
      unit: '%',
      icon: Activity,
      color: 'muted-olive',
      status: 99.8 >= 99.5 ? 'compliant' : 99.8 >= 99.0 ? 'warning' : 'violation',
      change: 0.1,
      trend: 'up',
    },
    {
      id: 'data-accuracy',
      name: 'Data Accuracy',
      target: 99.0,
      current: 99.6,
      unit: '%',
      icon: Target,
      color: 'muted-olive',
      status: 99.6 >= 99.0 ? 'compliant' : 99.6 >= 98.0 ? 'warning' : 'violation',
      change: 0.3,
      trend: 'up',
    },
  ], [metrics]);

  // Sample SLA violations data
  const slaViolations = useMemo(() => [
    {
      id: 1,
      title: 'Response Time Exceeded',
      description: 'API response time exceeded 500ms threshold for 15 minutes',
      severity: 'high',
      metric: 'API Response Time',
      target: '< 500ms',
      actual: '847ms',
      duration: '15m 32s',
      impact: 'Medium',
      startTime: subHours(new Date(), 2).toISOString(),
      endTime: subHours(new Date(), 1.75).toISOString(),
      status: 'resolved',
      assignee: 'DevOps Team',
    },
    {
      id: 2,
      title: 'User Verification SLA Breach',
      description: 'User verification process exceeded 24-hour SLA commitment',
      severity: 'critical',
      metric: 'Verification Time',
      target: '< 24 hours',
      actual: '28.5 hours',
      duration: '4h 30m',
      impact: 'High',
      startTime: subHours(new Date(), 6).toISOString(),
      status: 'active',
      assignee: 'Verification Team',
    },
    {
      id: 3,
      title: 'Database Query Performance',
      description: 'Database response time degraded below acceptable threshold',
      severity: 'medium',
      metric: 'DB Response Time',
      target: '< 100ms',
      actual: '145ms',
      duration: '22m 15s',
      impact: 'Low',
      startTime: subHours(new Date(), 4).toISOString(),
      endTime: subHours(new Date(), 3.5).toISOString(),
      status: 'resolved',
      assignee: 'Database Team',
    },
  ].filter(violation => {
    if (severityFilter === 'all') return true;
    return violation.severity === severityFilter;
  }), [severityFilter]);

  // SLA compliance over time
  const complianceData = useMemo(() => {
    const generateData = (hours = 24) => {
      const result = [];
      for (let i = hours - 1; i >= 0; i--) {
        const date = subHours(new Date(), i);
        result.push({
          time: format(date, 'HH:mm'),
          fullDate: date,
          uptime: Math.max(99.0, Math.random() * 1.0 + 99.0),
          responseTime: Math.max(92.0, Math.random() * 8.0 + 92.0),
          resolution: Math.max(88.0, Math.random() * 10.0 + 88.0),
          satisfaction: Math.max(94.0, Math.random() * 5.0 + 94.0),
        });
      }
      return result;
    };

    return data.complianceHistory || generateData(timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168);
  }, [data, timeRange]);

  // Chart data based on view
  const chartData = useMemo(() => {
    const labels = complianceData.map(item => item.time);
    
    if (chartView === 'compliance') {
      return {
        labels,
        datasets: [
          {
            label: 'Uptime SLA',
            data: complianceData.map(item => item.uptime),
            color: '#10B981',
          },
          {
            label: 'Response Time SLA',
            data: complianceData.map(item => item.responseTime),
            color: '#3B82F6',
          },
          {
            label: 'Resolution SLA',
            data: complianceData.map(item => item.resolution),
            color: '#F59E0B',
          },
        ],
      };
    }
    
    if (chartView === 'violations') {
      // Violation count over time
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'SLA Violations',
          data: [0, 1, 0, 2, 1, 0, 1],
          color: '#EF4444',
        }],
      };
    }
    
    // Trends view
    return {
      labels,
      datasets: [{
        label: 'Overall SLA Score',
        data: complianceData.map(item => (item.uptime + item.responseTime + item.resolution + item.satisfaction) / 4),
        color: '#8B5CF6',
        borderColor: '#8B5CF6',
        backgroundColor: '#8B5CF620',
      }],
    };
  }, [complianceData, chartView]);

  // Calculate overall SLA health
  const slaHealth = useMemo(() => {
    const compliantCount = slaTargets.filter(sla => sla.status === 'compliant').length;
    const totalSLAs = slaTargets.length;
    const healthPercentage = (compliantCount / totalSLAs) * 100;
    
    return {
      percentage: healthPercentage,
      status: healthPercentage >= 90 ? 'excellent' : healthPercentage >= 80 ? 'good' : healthPercentage >= 70 ? 'fair' : 'poor',
      compliant: compliantCount,
      total: totalSLAs,
      violations: slaViolations.filter(v => v.status === 'active').length,
      critical: slaViolations.filter(v => v.severity === 'critical' && v.status === 'active').length,
    };
  }, [slaTargets, slaViolations]);

  // Handle chart interactions
  const handleChartClick = useCallback((dataPoint, context) => {
    const { label, value, datasetLabel } = dataPoint;
    toast.success(`Analyzing ${datasetLabel}: ${label} (${typeof value === 'number' ? value.toFixed(2) : value}%)`);
  }, []);

  // Handle violation actions
  const handleViolationAction = useCallback((violation) => {
    toast.success(`Viewing details for ${violation.title}`);
    setSelectedSLA(violation);
  }, []);

  const handleViolationResolve = useCallback((violation) => {
    toast.success(`Marking ${violation.title} as resolved`);
    // API call to resolve violation would go here
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    const csvData = [
      ['SLA Metric', 'Target', 'Current', 'Status', 'Last 24h Change'],
      ...slaTargets.map(sla => [
        sla.name,
        `${sla.target}${sla.unit}`,
        `${sla.current}${sla.unit}`,
        sla.status,
        `${sla.change > 0 ? '+' : ''}${sla.change}%`,
      ])
    ];
    
    toast.success('SLA monitoring data exported');
  }, [slaTargets]);

  return (
    <div className="space-y-6">
      {/* SLA Monitoring Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            SLA Monitoring & Compliance
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            Service level agreement tracking and violation management
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {[
              { id: 'compliance', label: 'Compliance', icon: Shield },
              { id: 'violations', label: 'Violations', icon: AlertTriangle },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setChartView(view.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${chartView === view.id
                    ? isDarkMode 
                      ? 'bg-sage-green/20 text-sage-green'
                      : 'bg-white text-muted-olive shadow-sm'
                    : isDarkMode
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-text-muted hover:text-text-dark'
                  }
                `}
              >
                <view.icon className="w-3 h-3" />
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="min-h-[36px]"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* SLA Health Overview */}
      <Card className={`p-6 ${
        slaHealth.status === 'excellent' 
          ? isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'
          : slaHealth.status === 'good'
            ? isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'
            : slaHealth.status === 'fair'
              ? isDarkMode ? 'bg-earthy-yellow/5 border-earthy-yellow/20' : 'bg-earthy-yellow/5 border-earthy-yellow/20'
              : 'bg-tomato-red/5 border-tomato-red/20'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${slaHealth.status === 'excellent' 
                ? isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10'
                : slaHealth.status === 'good'
                  ? isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10'
                  : slaHealth.status === 'fair'
                    ? isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10'
                    : 'bg-tomato-red/10'
              }
            `}>
              <Shield className={`w-6 h-6 ${
                slaHealth.status === 'excellent' ? 'text-sage-green' :
                slaHealth.status === 'good' ? 'text-sage-green' :
                slaHealth.status === 'fair' ? 'text-earthy-yellow' :
                'text-tomato-red'
              }`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                SLA Health Score: {slaHealth.percentage.toFixed(1)}%
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                {slaHealth.compliant} of {slaHealth.total} SLAs compliant
                {slaHealth.violations > 0 && (
                  <span className="ml-2 text-tomato-red font-medium">
                    • {slaHealth.violations} active violation{slaHealth.violations !== 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          {slaHealth.critical > 0 && (
            <div className="bg-tomato-red/10 border border-tomato-red/20 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-tomato-red animate-pulse" />
                <span className="text-sm font-medium text-tomato-red">
                  {slaHealth.critical} Critical Alert{slaHealth.critical !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SLA Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {slaTargets.map((sla) => (
          <SLAMetricCard
            key={sla.id}
            title={sla.name}
            value={`${sla.current.toFixed(2)}${sla.unit}`}
            target={`${sla.target}${sla.unit}`}
            status={sla.status}
            change={sla.change}
            trend={sla.trend}
            icon={sla.icon}
            color={sla.color}
            subtitle={`Target: ${sla.target}${sla.unit}`}
            violations={sla.status === 'violation' ? 1 : 0}
            isLoading={isLoading}
            onClick={() => {
              setSelectedSLA(sla);
              toast.success(`Analyzing ${sla.name} SLA performance`);
            }}
          />
        ))}
      </div>

      {/* SLA Performance Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              SLA {chartView === 'compliance' ? 'Compliance' : chartView === 'violations' ? 'Violations' : 'Performance'} Tracking
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {chartView === 'compliance' && 'Real-time SLA compliance monitoring across all metrics'}
              {chartView === 'violations' && 'SLA violation frequency and impact analysis'}
              {chartView === 'trends' && 'Overall SLA performance trends and patterns'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="h-80">
          {chartView === 'violations' ? (
            <BarChart
              data={chartData}
              height={320}
              enableDrillDown={true}
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => `Violations: ${context.parsed.y}`}
              borderRadius={8}
              colors={['#EF4444']}
            />
          ) : (
            <LineChart
              data={chartData}
              height={320}
              fillArea={chartView === 'trends'}
              enableDrillDown={true}
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => {
                const value = context.parsed.y;
                if (chartView === 'trends') {
                  return `Overall Score: ${value.toFixed(2)}%`;
                }
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              }}
              tension={0.3}
            />
          )}
        </div>
      </Card>

      {/* SLA Violations and Alerts */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            Active SLA Violations & Alerts
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className={`
                px-3 py-2 rounded-lg text-sm border
                ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          {slaViolations.length > 0 ? (
            slaViolations.map((violation) => (
              <SLAViolationItem
                key={violation.id}
                violation={violation}
                onAction={handleViolationAction}
                onResolve={handleViolationResolve}
              />
            ))
          ) : (
            <div className={`
              flex items-center gap-3 p-6 rounded-xl text-center
              ${isDarkMode ? 'bg-sage-green/5 border border-sage-green/20' : 'bg-sage-green/5 border border-sage-green/20'}
            `}>
              <CheckCircle className="w-6 h-6 text-sage-green mx-auto" />
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  All SLAs Compliant
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  No active violations at this time
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* SLA Target Configuration */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            SLA Target Configuration
          </h3>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slaTargets.map((sla) => (
            <div 
              key={sla.id}
              className={`
                p-4 rounded-xl border transition-all duration-200
                ${isDarkMode ? 'border-gray-700 bg-gray-700/30' : 'border-gray-200 bg-gray-50'}
                hover:shadow-sm
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <sla.icon className={`w-4 h-4 text-${sla.color}`} />
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {sla.name}
                  </span>
                </div>
                <div className={`
                  w-3 h-3 rounded-full ${
                    sla.status === 'compliant' ? 'bg-sage-green' :
                    sla.status === 'warning' ? 'bg-earthy-yellow' :
                    'bg-tomato-red'
                  }
                `} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Target
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {sla.target}{sla.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Current
                  </span>
                  <span className={`font-medium ${
                    sla.status === 'compliant' ? 'text-sage-green' :
                    sla.status === 'warning' ? 'text-earthy-yellow' :
                    'text-tomato-red'
                  }`}>
                    {sla.current.toFixed(2)}{sla.unit}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className={`h-1.5 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      sla.status === 'compliant' ? 'bg-sage-green' :
                      sla.status === 'warning' ? 'bg-earthy-yellow' :
                      'bg-tomato-red'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (sla.current / sla.target) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SLAMonitoring;