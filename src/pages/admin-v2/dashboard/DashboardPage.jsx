/**
 * DashboardPage - Enhanced Admin V2 Dashboard
 * Comprehensive admin dashboard with real-time metrics, interactive charts, and business insights
 * Features: Real-time updates, advanced analytics, system monitoring, verification pipeline
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCcw,
  Download,
  Settings,
  Maximize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  useGetAdminDashboardV2Query,
  useGetDashboardOverviewQuery,
} from '../../../store/slices/admin-v2/adminApiSlice';
import { Button, LoadingSpinner, EmptyState } from '../../../components/ui';
import { dashboardService } from '../../../services/admin-v2';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import useRealtimeDashboard from '../../../hooks/admin-v2/useRealtimeDashboard';

// Enhanced Dashboard Components
import HeroKPICards from './components/HeroKPICards';
import BusinessMetricsChart from './components/BusinessMetricsChart';
import RecentActivityFeed from './components/RecentActivityFeed';
import QuickActionPanel from './components/QuickActionPanel';
import SystemHealthWidget from './components/SystemHealthWidget';
import VerificationPipeline from './components/VerificationPipeline';

// Enhanced dashboard styles
import './dashboard.css';

const DashboardPage = () => {
  const { isDarkMode } = useTheme();
  const [timeFilter, setTimeFilter] = useState('30d');
  const [chartType, setChartType] = useState('line');
  const [widgetVisibility, setWidgetVisibility] = useState({
    kpis: true,
    charts: true,
    activities: true,
    quickActions: true,
    systemHealth: true,
    verification: true,
  });
  const [realtimeData, setRealtimeData] = useState({
    kpis: [],
    activities: [],
    systemHealth: {},
    verifications: [],
  });

  // API queries with real-time polling
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useGetAdminDashboardV2Query();

  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    error: overviewError,
    refetch: refetchOverview,
  } = useGetDashboardOverviewQuery({ period: timeFilter });

  const isLoading = isDashboardLoading || isOverviewLoading;
  const error = dashboardError || overviewError;

  // Real-time dashboard hook
  const {
    connectionStatus,
    isConnected,
    lastUpdate,
    metrics: realtimeMetrics,
    reconnect,
    getConnectionIndicator,
  } = useRealtimeDashboard({
    enabled: true,
    onKPIUpdate: useCallback((kpis) => {
      setRealtimeData((prev) => ({ ...prev, kpis }));
    }, []),
    onActivityUpdate: useCallback((activities) => {
      setRealtimeData((prev) => ({ ...prev, activities }));
    }, []),
    onSystemHealthUpdate: useCallback((systemHealth) => {
      setRealtimeData((prev) => ({ ...prev, systemHealth }));
    }, []),
    onVerificationUpdate: useCallback((verifications) => {
      setRealtimeData((prev) => ({ ...prev, verifications }));
    }, []),
    onNotification: useCallback((notification) => {
      // Handle dashboard-specific notifications
      if (notification.type === 'dashboard_alert') {
        toast(notification.message, {
          icon: notification.icon || '📊',
          duration: notification.duration || 4000,
        });
      }
    }, []),
  });

  // Transform data using service layer with real-time updates
  const transformedData = useMemo(() => {
    if (!dashboardData && !overviewData && !realtimeData.kpis.length)
      return null;

    const combinedData = {
      ...dashboardData,
      ...overviewData,
    };

    const transformed =
      dashboardService.transformDashboardMetrics(combinedData);

    // Merge with real-time data if available
    if (realtimeData.kpis.length > 0) {
      transformed.kpis = realtimeData.kpis;
    }
    if (realtimeData.activities.length > 0) {
      transformed.recentActivity = realtimeData.activities;
    }

    return transformed;
  }, [dashboardData, overviewData, realtimeData]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refetchDashboard();
    refetchOverview();
    toast.success('Dashboard refreshed');
  }, [refetchDashboard, refetchOverview]);

  // Handle export
  const handleExport = useCallback(() => {
    if (!transformedData) return;

    const exportCsv = dashboardService.generateDashboardExport(
      transformedData,
      'csv'
    );
    const blob = new Blob([exportCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Dashboard data exported');
  }, [transformedData]);

  // Widget labels for better UX
  const widgetLabels = {
    kpis: 'KPIs',
    charts: 'Charts',
    activities: 'Activity',
    quickActions: 'Actions',
    systemHealth: 'Health',
    verification: 'Pipeline',
  };

  // Handle widget visibility toggle
  const toggleWidgetVisibility = useCallback((widget) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [widget]: !prev[widget],
    }));
  }, []);

  // Handle quick actions
  const handleQuickAction = useCallback(
    (action) => {
      switch (action.type) {
        case 'navigate':
          // Handle navigation to specific admin sections
          window.location.href = action.route;
          break;
        case 'system_toggle':
          toast.success(`System ${action.operation} completed`);
          break;
        case 'cache_clear':
          toast.success(`${action.cacheType} cache cleared`);
          refetchDashboard();
          break;
        case 'generate_reports':
          toast.success('System reports generated');
          break;
        case 'emergency_action':
          toast.error(`Emergency action: ${action.actionType}`);
          break;
        default:
          console.log('Unknown quick action:', action);
      }
    },
    [refetchDashboard]
  );

  // Handle verification actions
  const handleVerificationAction = useCallback(
    (item, action) => {
      toast.success(`${item.businessName} ${action}d successfully`);
      refetchDashboard();
    },
    [refetchDashboard]
  );

  // Handle batch verification actions
  const handleBatchVerificationAction = useCallback(
    (items, action) => {
      toast.success(`${items.length} items ${action}d successfully`);
      refetchDashboard();
    },
    [refetchDashboard]
  );

  // Handle metric chart interactions
  const handleChartDataPoint = useCallback((dataPoint, context) => {
    console.log('Chart data point clicked:', dataPoint, context);
    // Could navigate to detailed analytics
  }, []);

  // Handle activity item clicks
  const handleActivityClick = useCallback((activity, actionType = 'view') => {
    if (actionType === 'action') {
      // Navigate to related admin section
      const routes = {
        user_registered: '/admin-v2/users',
        vendor_verified: '/admin-v2/vendors',
        restaurant_approved: '/admin-v2/restaurants',
        product_created: '/admin-v2/catalog/products',
      };

      const route = routes[activity.type];
      if (route) {
        window.location.href = route;
      }
    } else {
      // Show activity details
      console.log('Activity details:', activity);
    }
  }, []);

  // Sample data for components (in real app, this would come from API)
  const sampleChartData = useMemo(
    () => [
      {
        date: '2024-01-01',
        revenue: 12000,
        orders: 45,
        users: 120,
        conversion: 3.2,
      },
      {
        date: '2024-01-02',
        revenue: 15000,
        orders: 52,
        users: 140,
        conversion: 3.7,
      },
      {
        date: '2024-01-03',
        revenue: 18000,
        orders: 68,
        users: 160,
        conversion: 4.2,
      },
      {
        date: '2024-01-04',
        revenue: 14000,
        orders: 41,
        users: 135,
        conversion: 3.0,
      },
      {
        date: '2024-01-05',
        revenue: 20000,
        orders: 75,
        users: 180,
        conversion: 4.8,
      },
    ],
    []
  );

  const sampleSystemHealth = useMemo(
    () => ({
      healthy:
        realtimeData.systemHealth.healthy !== undefined
          ? realtimeData.systemHealth.healthy
          : true,
      apiResponseTime: realtimeData.systemHealth.apiResponseTime || 120,
      databaseResponseTime:
        realtimeData.systemHealth.databaseResponseTime || 45,
      activeConnections: realtimeData.systemHealth.activeConnections || 156,
      errorRate: realtimeData.systemHealth.errorRate || 0.8,
      cpuUsage: realtimeData.systemHealth.cpuUsage || 45,
      memoryUsage: realtimeData.systemHealth.memoryUsage || 62,
      diskUsage: realtimeData.systemHealth.diskUsage || 78,
    }),
    [realtimeData.systemHealth]
  );

  const sampleSLAMetrics = useMemo(
    () => ({
      uptime: 99.95,
      availability: 99.8,
      responseTimeSLA: 96.2,
    }),
    []
  );

  const samplePendingCounts = useMemo(
    () => ({
      verifications:
        transformedData?.kpis?.find((k) => k.id === 'pending-verifications')
          ?.value || 8,
      flaggedUsers: 3,
      flaggedListings: 2,
    }),
    [transformedData]
  );

  const connectionIndicator = getConnectionIndicator();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load dashboard"
        description="There was an error loading the dashboard data. Please try again."
        action={{
          label: 'Retry',
          onClick: handleRefresh,
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1
              className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Admin Dashboard
            </h1>
            <p
              className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
            >
              Real-time overview of your B2B marketplace
            </p>
          </div>

          {/* Real-time Connection Indicator */}
          <div
            className={`
            flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium
            ${
              connectionIndicator.color === 'green'
                ? isDarkMode
                  ? 'bg-sage-green/20 text-sage-green'
                  : 'bg-sage-green/10 text-muted-olive'
                : connectionIndicator.color === 'yellow'
                  ? isDarkMode
                    ? 'bg-earthy-yellow/20 text-earthy-yellow'
                    : 'bg-earthy-yellow/10 text-earthy-brown'
                  : connectionIndicator.color === 'blue'
                    ? isDarkMode
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-blue-100 text-blue-600'
                    : 'bg-tomato-red/20 text-tomato-red'
            }
          `}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                connectionIndicator.status === 'connected'
                  ? isDarkMode
                    ? 'bg-sage-green'
                    : 'bg-muted-olive'
                  : connectionIndicator.status === 'connecting'
                    ? 'bg-earthy-yellow animate-pulse'
                    : connectionIndicator.status === 'fallback'
                      ? 'bg-blue-500'
                      : 'bg-tomato-red'
              }`}
            />
            {connectionIndicator.label}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Widget Visibility Controls */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {Object.entries(widgetVisibility).map(([widget, visible]) => (
              <button
                key={widget}
                onClick={() => toggleWidgetVisibility(widget)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-xs font-medium
                  ${
                    visible
                      ? isDarkMode
                        ? 'bg-sage-green/20 text-sage-green'
                        : 'bg-muted-olive/10 text-muted-olive'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-700'
                  }
                `}
                title={`Toggle ${widgetLabels[widget]} widget`}
              >
                {visible ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                <span className="hidden sm:inline">
                  {widgetLabels[widget]}
                </span>
              </button>
            ))}
          </div>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`
              px-4 py-2 border rounded-xl text-sm
              ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }
            `}
          >
            {dashboardService.getDashboardFilters().map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <Button
            variant="ghost"
            onClick={handleRefresh}
            className="rounded-xl"
            disabled={isLoading}
          >
            <RefreshCcw
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          {/* Export Button */}
          <Button
            variant="secondary"
            onClick={handleExport}
            className="rounded-xl"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          {/* Reconnect Button (when needed) */}
          {connectionStatus === 'disconnected' && (
            <Button
              variant="outline"
              onClick={reconnect}
              className="rounded-xl border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10"
            >
              Reconnect
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      {widgetVisibility.kpis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HeroKPICards
            kpis={transformedData?.kpis || []}
            isLoading={isLoading}
            onCardClick={(kpi) => console.log('KPI clicked:', kpi)}
            realTimeEnabled={isConnected}
          />
        </motion.div>
      )}

      {/* Business Metrics Charts */}
      {widgetVisibility.charts && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BusinessMetricsChart
            data={sampleChartData}
            title="Business Performance"
            chartType={chartType}
            timeRange={timeFilter}
            onTimeRangeChange={setTimeFilter}
            onChartTypeChange={setChartType}
            onDataPointClick={handleChartDataPoint}
            onExport={handleExport}
            isLoading={isLoading}
            enableDrillDown={true}
            enableExport={true}
          />
        </motion.div>
      )}

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Activities and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Feed */}
          {widgetVisibility.activities && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RecentActivityFeed
                activities={transformedData?.recentActivity || []}
                isLoading={isLoading}
                hasMore={false}
                onActivityClick={handleActivityClick}
                onRefresh={handleRefresh}
                realTimeEnabled={isConnected}
                maxHeight={400}
              />
            </motion.div>
          )}

          {/* Verification Pipeline */}
          {widgetVisibility.verification && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <VerificationPipeline
                verificationQueue={realtimeData.verifications}
                onVerificationAction={handleVerificationAction}
                onBatchAction={handleBatchVerificationAction}
                onViewDetails={(item) =>
                  console.log('View verification details:', item)
                }
                permissions={{ verify_businesses: true }}
              />
            </motion.div>
          )}
        </div>

        {/* Right Column - Quick Actions and System Health */}
        <div className="space-y-6">
          {/* Quick Action Panel */}
          {widgetVisibility.quickActions && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <QuickActionPanel
                pendingCounts={samplePendingCounts}
                onQuickAction={handleQuickAction}
                permissions={{
                  verify_businesses: true,
                  system_control: true,
                  cache_management: true,
                  bulk_user_management: true,
                  content_moderation: true,
                  generate_reports: true,
                  emergency_controls: true,
                  system_monitoring: true,
                }}
                systemStatus={sampleSystemHealth}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {/* System Health Widget */}
          {widgetVisibility.systemHealth && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <SystemHealthWidget
                healthData={sampleSystemHealth}
                slaMetrics={sampleSLAMetrics}
                realTimeMetrics={sampleSystemHealth}
                alertThresholds={{
                  apiResponseTime: 500,
                  databaseResponseTime: 100,
                  maxConnections: 1000,
                  errorRate: 5,
                }}
                onMetricClick={(metric) =>
                  console.log('System metric clicked:', metric)
                }
                refreshInterval={30000}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Last Update Indicator */}
      {lastUpdate && (
        <div className="flex items-center justify-center pt-4">
          <div
            className={`
            flex items-center gap-2 text-xs px-4 py-2 rounded-xl
            ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}
          `}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected
                  ? isDarkMode
                    ? 'bg-sage-green'
                    : 'bg-muted-olive'
                  : 'bg-gray-400'
              } animate-pulse`}
            />
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
            {realtimeMetrics.isRealTime && (
              <span className="ml-2 px-2 py-0.5 bg-sage-green/20 text-sage-green rounded-full text-xs font-medium">
                Real-time
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
