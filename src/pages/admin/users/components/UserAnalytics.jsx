/**
 * UserAnalytics - Comprehensive User Analytics Dashboard
 * Features: Registration trends, role distribution, geographic data, retention analysis
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  UserCheck,
  UserX,
  Clock,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Star,
  Trophy,
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';

// Metric card component
const MetricCard = ({
  title,
  value,
  change,
  changeType,
  icon: IconComponent,
  color = 'muted-olive',
}) => {
  const { isDarkMode } = useTheme();

  const getChangeColor = (type) => {
    if (type === 'positive') return 'text-sage-green';
    if (type === 'negative') return 'text-tomato-red';
    return isDarkMode ? 'text-dark-text-muted' : 'text-text-muted';
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
          >
            {title}
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div
              className={`flex items-center gap-1 mt-2 text-sm ${getChangeColor(changeType)}`}
            >
              {changeType === 'positive' && <TrendingUp className="w-4 h-4" />}
              {changeType === 'negative' && (
                <TrendingUp className="w-4 h-4 rotate-180" />
              )}
              <span>{change}</span>
            </div>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-${color}/10 flex items-center justify-center`}
        >
          <IconComponent className={`w-5 h-5 text-${color}`} />
        </div>
      </div>
    </Card>
  );
};

// Simple chart components (placeholders for real charts)
const SimpleLineChart = ({ data, height = 200 }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        className="overflow-visible"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke={isDarkMode ? '#374151' : '#E5E7EB'}
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Sample trend line */}
        <path
          d="M 20 150 Q 100 120 180 100 T 360 80"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {[20, 100, 180, 260, 340].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={150 - i * 15}
            r="4"
            fill="#10B981"
            className="drop-shadow-sm"
          />
        ))}
      </svg>
    </div>
  );
};

const SimpleBarChart = ({ data, height = 200 }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        {/* Sample bars */}
        {[
          { x: 50, height: 120, color: '#10B981', label: 'Vendors' },
          { x: 130, height: 80, color: '#F59E0B', label: 'Owners' },
          { x: 210, height: 60, color: '#EF4444', label: 'Managers' },
          { x: 290, height: 40, color: '#8B5CF6', label: 'Admins' },
        ].map((bar, i) => (
          <g key={i}>
            <rect
              x={bar.x}
              y={200 - bar.height}
              width="40"
              height={bar.height}
              fill={bar.color}
              rx="4"
              className="drop-shadow-sm"
            />
            <text
              x={bar.x + 20}
              y={190}
              textAnchor="middle"
              fontSize="12"
              fill={isDarkMode ? '#9CA3AF' : '#6B7280'}
            >
              {bar.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const SimplePieChart = ({ data, height = 200 }) => {
  const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const total = 100;
  let currentAngle = 0;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ height }}
    >
      <svg width="160" height="160" viewBox="0 0 160 160">
        {/* Sample pie slices */}
        {[45, 30, 15, 10].map((percentage, i) => {
          const startAngle = currentAngle;
          const endAngle = currentAngle + (percentage / 100) * 360;
          currentAngle = endAngle;

          const x1 = 80 + 60 * Math.cos(((startAngle - 90) * Math.PI) / 180);
          const y1 = 80 + 60 * Math.sin(((startAngle - 90) * Math.PI) / 180);
          const x2 = 80 + 60 * Math.cos(((endAngle - 90) * Math.PI) / 180);
          const y2 = 80 + 60 * Math.sin(((endAngle - 90) * Math.PI) / 180);

          const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

          const pathData = [
            'M',
            80,
            80,
            'L',
            x1,
            y1,
            'A',
            60,
            60,
            0,
            largeArcFlag,
            1,
            x2,
            y2,
            'Z',
          ].join(' ');

          return (
            <path
              key={i}
              d={pathData}
              fill={colors[i]}
              stroke="#fff"
              strokeWidth="2"
              className="drop-shadow-sm"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Geographic distribution component
const GeographicDistribution = ({ data, loading }) => {
  const { isDarkMode } = useTheme();

  const mockGeoData = [
    { country: 'United States', users: 245, percentage: 35 },
    { country: 'Canada', users: 156, percentage: 22 },
    { country: 'United Kingdom', users: 123, percentage: 18 },
    { country: 'Germany', users: 89, percentage: 13 },
    { country: 'Others', users: 87, percentage: 12 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {mockGeoData.map((location, index) => (
        <div
          key={location.country}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full bg-muted-olive"
              style={{ opacity: 1 - index * 0.2 }}
            />
            <span
              className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              {location.country}
            </span>
          </div>
          <div className="text-right">
            <div
              className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              {location.users.toLocaleString()}
            </div>
            <div
              className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
            >
              {location.percentage}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const UserAnalytics = ({ data, loading = false }) => {
  const { isDarkMode } = useTheme();

  // Mock analytics data - replace with real data from API
  const mockData = useMemo(
    () => ({
      totalUsers: 1247,
      activeUsers: 1089,
      newUsers: 89,
      approvalRate: 94.2,
      registrationTrend: [
        { date: subDays(new Date(), 30), count: 45 },
        { date: subDays(new Date(), 23), count: 52 },
        { date: subDays(new Date(), 16), count: 67 },
        { date: subDays(new Date(), 9), count: 71 },
        { date: subDays(new Date(), 2), count: 89 },
      ],
      roleDistribution: [
        { role: 'vendor', count: 567, percentage: 45.5 },
        { role: 'buyerOwner', count: 378, percentage: 30.3 },
        { role: 'buyerManager', count: 289, percentage: 23.2 },
        { role: 'admin', count: 13, percentage: 1.0 },
      ],
      verificationStats: {
        pending: 156,
        approved: 987,
        rejected: 104,
      },
      retentionRate: 87.3,
      avgSessionTime: '14m 32s',
      topLocations: [
        'New York, NY',
        'Los Angeles, CA',
        'Chicago, IL',
        'Houston, TX',
      ],
    }),
    []
  );

  const analyticsData = data || mockData;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers}
          change="+12.3% from last month"
          changeType="positive"
          icon={Users}
          color="muted-olive"
        />

        <MetricCard
          title="Active Users"
          value={analyticsData.activeUsers}
          change="+8.7% from last month"
          changeType="positive"
          icon={UserCheck}
          color="sage-green"
        />

        <MetricCard
          title="New Users (30d)"
          value={analyticsData.newUsers}
          change="+23.1% from last month"
          changeType="positive"
          icon={TrendingUp}
          color="sage-green"
        />

        <MetricCard
          title="Approval Rate"
          value={`${analyticsData.approvalRate}%`}
          change="-2.1% from last month"
          changeType="negative"
          icon={Trophy}
          color="earthy-yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Registration Trends
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                New user registrations over time
              </p>
            </div>
            <Calendar
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
          </div>
          <SimpleLineChart data={analyticsData.registrationTrend} />
        </Card>

        {/* Role Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Role Distribution
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                User distribution by role
              </p>
            </div>
            <PieChart
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SimplePieChart data={analyticsData.roleDistribution} />
            <div className="space-y-3">
              {analyticsData.roleDistribution.map((role, index) => {
                const colors = [
                  'muted-olive',
                  'earthy-yellow',
                  'tomato-red',
                  'muted-olive',
                ];
                return (
                  <div
                    key={role.role}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full bg-${colors[index]}`}
                      />
                      <span
                        className={`text-sm capitalize ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                      >
                        {role.role === 'buyerOwner'
                          ? 'Buyer Owner'
                          : role.role === 'buyerManager'
                            ? 'Buyer Manager'
                            : role.role}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                    >
                      {role.count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Verification Status
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                User verification breakdown
              </p>
            </div>
            <UserCheck
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-sage-green" />
                <span
                  className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Approved
                </span>
              </div>
              <span
                className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                {analyticsData.verificationStats.approved.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-earthy-yellow" />
                <span
                  className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Pending
                </span>
              </div>
              <span
                className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                {analyticsData.verificationStats.pending.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-tomato-red" />
                <span
                  className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                >
                  Rejected
                </span>
              </div>
              <span
                className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                {analyticsData.verificationStats.rejected.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Geographic Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Geographic Distribution
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                Top user locations
              </p>
            </div>
            <MapPin
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
          </div>
          <GeographicDistribution data={null} loading={false} />
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Performance Metrics
              </h3>
              <p
                className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                User engagement & retention
              </p>
            </div>
            <Activity
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Retention Rate
              </span>
              <span className="font-semibold text-sage-green">
                {analyticsData.retentionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Avg Session Time
              </span>
              <span
                className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                {analyticsData.avgSessionTime}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p
                className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
              >
                📈 User engagement is trending upward with 23% increase in daily
                active users
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalytics;
