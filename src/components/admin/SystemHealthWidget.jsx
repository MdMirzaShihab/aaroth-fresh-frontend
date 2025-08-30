import React from 'react';
import {
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useGetSystemHealthQuery } from '../../store/slices/apiSlice';
import { Card } from '../ui/Card';

const SystemHealthWidget = () => {
  const {
    data: healthData,
    isLoading,
    error,
    refetch,
  } = useGetSystemHealthQuery(undefined, {
    // Refresh every 30 seconds
    pollingInterval: 30000,
  });

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'connected':
        return CheckCircle;
      case 'degraded':
      case 'slow':
        return AlertTriangle;
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return XCircle;
      default:
        return Activity;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'connected':
        return 'text-muted-olive';
      case 'degraded':
      case 'slow':
        return 'text-earthy-yellow';
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return 'text-tomato-red';
      default:
        return 'text-text-muted';
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'connected':
        return 'bg-sage-green/20 text-muted-olive';
      case 'degraded':
      case 'slow':
        return 'bg-earthy-yellow/20 text-earthy-brown';
      case 'unhealthy':
      case 'error':
      case 'disconnected':
        return 'bg-tomato-red/20 text-tomato-red';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-muted-olive animate-pulse" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-white">
            System Health
          </h3>
        </div>
        <div className="space-y-3">
          {['database', 'server', 'external'].map((service) => (
            <div key={service} className="flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <XCircle className="w-5 h-5 text-tomato-red" />
          <h3 className="text-lg font-semibold text-text-dark dark:text-white">
            System Health
          </h3>
        </div>
        <div className="text-center py-4">
          <AlertTriangle className="w-8 h-8 text-tomato-red mx-auto mb-2" />
          <p className="text-text-muted mb-3">Unable to fetch system health</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-muted-olive/10 text-muted-olive rounded-xl hover:bg-muted-olive/20 transition-colors"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  const health = healthData?.data || healthData;

  // Extract health information
  const overallStatus = health?.status || 'unknown';
  const services = health?.services || {};
  const uptime = health?.uptime;
  const timestamp = health?.timestamp;

  // Create service items
  const serviceItems = [
    {
      name: 'Database',
      icon: Database,
      status: services.database?.status || 'unknown',
      responseTime: services.database?.responseTime,
    },
    {
      name: 'API Server',
      icon: Server,
      status: overallStatus,
      responseTime: health?.responseTime,
    },
    {
      name: 'External APIs',
      icon: Wifi,
      status: services.external?.status || 'unknown',
      responseTime: services.external?.responseTime,
    },
  ];

  const OverallStatusIcon = getStatusIcon(overallStatus);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <OverallStatusIcon
            className={`w-5 h-5 ${getStatusColor(overallStatus)}`}
          />
          <h3 className="text-lg font-semibold text-text-dark dark:text-white">
            System Health
          </h3>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(overallStatus)}`}
        >
          {overallStatus?.toUpperCase() || 'UNKNOWN'}
        </span>
      </div>

      {/* Services Status */}
      <div className="space-y-4 mb-6">
        {serviceItems.map((service) => {
          const ServiceIcon = service.icon;
          const StatusIcon = getStatusIcon(service.status);

          return (
            <div
              key={service.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ServiceIcon className="w-4 h-4 text-text-muted" />
                <span className="text-sm font-medium text-text-dark dark:text-white">
                  {service.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {service.responseTime && (
                  <span className="text-xs text-text-muted">
                    {service.responseTime}ms
                  </span>
                )}
                <StatusIcon
                  className={`w-4 h-4 ${getStatusColor(service.status)}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* System Info */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {uptime && (
            <div>
              <span className="text-text-muted">Uptime:</span>
              <p className="font-medium text-text-dark dark:text-white">
                {Math.floor(uptime / 3600)}h {Math.floor((uptime % 3600) / 60)}m
              </p>
            </div>
          )}
          {timestamp && (
            <div>
              <span className="text-text-muted">Last Check:</span>
              <p className="font-medium text-text-dark dark:text-white">
                {new Date(timestamp).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default SystemHealthWidget;
