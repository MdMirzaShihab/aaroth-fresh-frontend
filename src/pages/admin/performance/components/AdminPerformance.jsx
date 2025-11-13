/**
 * AdminPerformance - Team Performance and Efficiency Analytics
 * Features: Admin efficiency tracking, workload distribution, task completion metrics
 * Provides insights into team performance, productivity, and operational efficiency
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  Eye,
  Star,
  Building2,
  MessageSquare,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import toast from 'react-hot-toast';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import {
  LineChart,
  BarChart,
  DoughnutChart,
} from '../../../../components/ui/charts/ChartJS';

// Admin performance metric card
const AdminMetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'sage-green',
  subtitle,
  onClick,
  isLoading = false,
  target,
  performance = 'normal',
}) => {
  const { isDarkMode } = useTheme();

  const getTrendIcon = () => {
    if (trend === 'up') return ArrowUpRight;
    if (trend === 'down') return ArrowDownRight;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up')
      return isDarkMode ? 'text-sage-green' : 'text-muted-olive';
    if (trend === 'down') return 'text-tomato-red';
    return isDarkMode ? 'text-gray-400' : 'text-text-muted';
  };

  const getPerformanceColor = () => {
    if (performance === 'excellent')
      return isDarkMode
        ? 'bg-sage-green/5 border-sage-green/20'
        : 'bg-sage-green/5 border-sage-green/20';
    if (performance === 'good')
      return isDarkMode
        ? 'bg-sage-green/5 border-sage-green/20'
        : 'bg-sage-green/5 border-sage-green/20';
    if (performance === 'poor')
      return isDarkMode
        ? 'bg-tomato-red/5 border-tomato-red/20'
        : 'bg-tomato-red/5 border-tomato-red/20';
    return isDarkMode
      ? 'bg-gray-800/50 border-gray-700/50'
      : 'bg-white/80 border-gray-200/50';
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`
        glass-card rounded-2xl p-6 border hover:shadow-glow-sage/10 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${getPerformanceColor()}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${isDarkMode ? `bg-${color}/20` : `bg-${color}/10`}
        `}
        >
          <Icon className={`w-5 h-5 text-${color}`} />
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
            <p
              className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              {value}
            </p>
            <p
              className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              {title}
            </p>
            {subtitle && (
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted/80'}`}
              >
                {subtitle}
              </p>
            )}
            {target && (
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}
              >
                Target: {target}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// Admin performance leaderboard item
const AdminLeaderboardItem = ({ admin, rank, metric = 'efficiency' }) => {
  const { isDarkMode } = useTheme();

  const getRankBadgeColor = (rank) => {
    if (rank <= 3)
      return 'bg-gradient-to-r from-earthy-yellow to-earthy-yellow/80 text-white';
    if (rank <= 5)
      return isDarkMode
        ? 'bg-sage-green/20 text-sage-green'
        : 'bg-sage-green/10 text-sage-green';
    return isDarkMode
      ? 'bg-gray-700 text-gray-300'
      : 'bg-gray-100 text-text-muted';
  };

  const getMetricValue = () => {
    switch (metric) {
      case 'efficiency':
        return `${admin.efficiency}%`;
      case 'tasks':
        return admin.completedTasks.toString();
      case 'response':
        return `${admin.avgResponseTime}h`;
      default:
        return admin.efficiency.toString();
    }
  };

  const getPerformanceBadge = () => {
    if (admin.efficiency >= 95)
      return { label: 'Excellent', color: 'text-sage-green bg-sage-green/10' };
    if (admin.efficiency >= 85)
      return { label: 'Good', color: 'text-sage-green bg-sage-green/10' };
    if (admin.efficiency >= 70)
      return {
        label: 'Average',
        color: 'text-earthy-yellow bg-earthy-yellow/10',
      };
    return {
      label: 'Needs Improvement',
      color: 'text-tomato-red bg-tomato-red/10',
    };
  };

  const performanceBadge = getPerformanceBadge();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: (rank - 1) * 0.1 }}
      className={`
        flex items-center gap-4 p-4 rounded-xl transition-colors
        ${isDarkMode ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-gray-50 hover:bg-gray-100'}
      `}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankBadgeColor(rank)}`}
      >
        #{rank}
      </div>

      <div
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                      flex items-center justify-center shadow-lg text-white font-medium"
      >
        <User className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4
            className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            {admin.name}
          </h4>
          <span
            className={`
            px-2 py-1 rounded text-xs font-medium ${performanceBadge.color}
          `}
          >
            {performanceBadge.label}
          </span>
        </div>
        <p
          className={`text-sm truncate ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
        >
          {admin.role} • {admin.department}
        </p>
      </div>

      <div className="text-right">
        <p
          className={`font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
        >
          {getMetricValue()}
        </p>
        <div className="flex items-center gap-1 justify-end">
          <Star className="w-3 h-3 text-earthy-yellow" />
          <span
            className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            {admin.satisfaction.toFixed(1)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const AdminPerformance = ({
  data = {},
  isLoading = false,
  timeRange = '24h',
  onTimeRangeChange,
}) => {
  const { isDarkMode } = useTheme();
  const [chartView, setChartView] = useState('efficiency'); // efficiency, workload, response
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [leaderboardMetric, setLeaderboardMetric] = useState('efficiency');

  // Generate admin performance data (replace with real API data)
  const adminData = useMemo(() => {
    const generateAdminData = () => [
      {
        id: 1,
        name: 'Sarah Johnson',
        role: 'Senior Admin',
        department: 'Verification',
        efficiency: 98.5,
        completedTasks: 45,
        avgResponseTime: 1.2,
        satisfaction: 4.8,
        workloadScore: 92,
        escalations: 0,
      },
      {
        id: 2,
        name: 'Michael Chen',
        role: 'Admin Manager',
        department: 'Operations',
        efficiency: 95.2,
        completedTasks: 52,
        avgResponseTime: 1.8,
        satisfaction: 4.6,
        workloadScore: 88,
        escalations: 2,
      },
      {
        id: 3,
        name: 'Emily Rodriguez',
        role: 'Admin Specialist',
        department: 'User Support',
        efficiency: 92.7,
        completedTasks: 38,
        avgResponseTime: 2.1,
        satisfaction: 4.7,
        workloadScore: 85,
        escalations: 1,
      },
      {
        id: 4,
        name: 'David Kim',
        role: 'Admin',
        department: 'Content Review',
        efficiency: 89.3,
        completedTasks: 41,
        avgResponseTime: 2.8,
        satisfaction: 4.4,
        workloadScore: 91,
        escalations: 3,
      },
      {
        id: 5,
        name: 'Lisa Thompson',
        role: 'Admin',
        department: 'Verification',
        efficiency: 87.1,
        completedTasks: 33,
        avgResponseTime: 3.2,
        satisfaction: 4.3,
        workloadScore: 78,
        escalations: 4,
      },
    ];

    return data.adminTeam || generateAdminData();
  }, [data]);

  // Calculate team metrics
  const teamMetrics = useMemo(() => {
    const totalTasks = adminData.reduce(
      (sum, admin) => sum + admin.completedTasks,
      0
    );
    const avgEfficiency =
      adminData.reduce((sum, admin) => sum + admin.efficiency, 0) /
      adminData.length;
    const avgResponseTime =
      adminData.reduce((sum, admin) => sum + admin.avgResponseTime, 0) /
      adminData.length;
    const avgSatisfaction =
      adminData.reduce((sum, admin) => sum + admin.satisfaction, 0) /
      adminData.length;
    const totalEscalations = adminData.reduce(
      (sum, admin) => sum + admin.escalations,
      0
    );
    const avgWorkloadScore =
      adminData.reduce((sum, admin) => sum + admin.workloadScore, 0) /
      adminData.length;

    return {
      teamSize: adminData.length,
      totalTasks,
      avgEfficiency,
      avgResponseTime,
      avgSatisfaction,
      totalEscalations,
      avgWorkloadScore,
      taskDistribution: avgWorkloadScore,
      performanceScore:
        (avgEfficiency + avgSatisfaction * 20 + (100 - avgResponseTime * 10)) /
        3,
    };
  }, [adminData]);

  // Department breakdown
  const departmentData = useMemo(() => {
    const departments = {};
    adminData.forEach((admin) => {
      if (!departments[admin.department]) {
        departments[admin.department] = {
          name: admin.department,
          admins: 0,
          totalTasks: 0,
          avgEfficiency: 0,
          avgSatisfaction: 0,
          totalEscalations: 0,
        };
      }

      const dept = departments[admin.department];
      dept.admins += 1;
      dept.totalTasks += admin.completedTasks;
      dept.avgEfficiency += admin.efficiency;
      dept.avgSatisfaction += admin.satisfaction;
      dept.totalEscalations += admin.escalations;
    });

    return Object.values(departments).map((dept) => ({
      ...dept,
      avgEfficiency: dept.avgEfficiency / dept.admins,
      avgSatisfaction: dept.avgSatisfaction / dept.admins,
    }));
  }, [adminData]);

  // Performance over time data
  const performanceTimeData = useMemo(() => {
    const generateTimeData = (hours = 24) => {
      const result = [];
      for (let i = hours - 1; i >= 0; i--) {
        const date = subHours(new Date(), i);
        result.push({
          time: format(date, 'HH:mm'),
          fullDate: date,
          efficiency:
            Math.floor(Math.random() * 20) + 75 + (i % 8 < 2 ? 10 : 0), // Higher during work hours
          tasksCompleted: Math.floor(Math.random() * 15) + 5,
          responseTime: Math.random() * 2 + 1,
          activeAdmins: Math.floor(Math.random() * 3) + 2 + (i % 8 < 6 ? 2 : 0),
        });
      }
      return result;
    };

    return (
      data.performanceHistory ||
      generateTimeData(timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168)
    );
  }, [data, timeRange]);

  // Chart data based on view
  const chartData = useMemo(() => {
    const labels = performanceTimeData.map((item) => item.time);

    if (chartView === 'efficiency') {
      return {
        labels,
        datasets: [
          {
            label: 'Team Efficiency',
            data: performanceTimeData.map((item) => item.efficiency),
            color: '#10B981',
            borderColor: '#10B981',
            backgroundColor: '#10B98120',
          },
        ],
      };
    }

    if (chartView === 'workload') {
      return {
        labels,
        datasets: [
          {
            label: 'Tasks Completed',
            data: performanceTimeData.map((item) => item.tasksCompleted),
            color: '#3B82F6',
          },
          {
            label: 'Active Admins',
            data: performanceTimeData.map((item) => item.activeAdmins),
            color: '#8B5CF6',
          },
        ],
      };
    }

    // Response time view
    return {
      labels,
      datasets: [
        {
          label: 'Avg Response Time (hours)',
          data: performanceTimeData.map((item) => item.responseTime),
          color: '#F59E0B',
          borderColor: '#F59E0B',
          backgroundColor: '#F59E0B20',
        },
      ],
    };
  }, [performanceTimeData, chartView]);

  // Workload distribution data for pie chart
  const workloadDistribution = useMemo(
    () => [
      { label: 'Verification Tasks', value: 35, color: '#10B981' },
      { label: 'User Support', value: 28, color: '#3B82F6' },
      { label: 'Content Review', value: 22, color: '#F59E0B' },
      { label: 'System Management', value: 10, color: '#8B5CF6' },
      { label: 'Other Tasks', value: 5, color: '#EC4899' },
    ],
    []
  );

  // Handle chart interactions
  const handleChartClick = useCallback((dataPoint, context) => {
    const { label, value, datasetLabel } = dataPoint;
    toast.success(
      `Analyzing ${datasetLabel}: ${label} (${typeof value === 'number' ? value.toLocaleString() : value})`
    );
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    const csvData = [
      [
        'Admin Name',
        'Department',
        'Efficiency',
        'Tasks Completed',
        'Avg Response Time',
        'Satisfaction',
        'Escalations',
      ],
      ...adminData.map((admin) => [
        admin.name,
        admin.department,
        `${admin.efficiency}%`,
        admin.completedTasks,
        `${admin.avgResponseTime}h`,
        admin.satisfaction.toFixed(1),
        admin.escalations,
      ]),
    ];

    toast.success('Admin performance data exported');
  }, [adminData]);

  return (
    <div className="space-y-6">
      {/* Admin Performance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            Admin Performance Analytics
          </h2>
          <p
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            Team efficiency, workload distribution, and productivity insights
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Toggle */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            {[
              { id: 'efficiency', label: 'Efficiency', icon: TrendingUp },
              { id: 'workload', label: 'Workload', icon: BarChart3 },
              { id: 'response', label: 'Response', icon: Clock },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setChartView(view.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    chartView === view.id
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

      {/* Key Admin Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <AdminMetricCard
          title="Team Efficiency"
          value={`${teamMetrics.avgEfficiency.toFixed(1)}%`}
          change={5.8}
          trend="up"
          icon={Award}
          color="sage-green"
          subtitle="Avg team performance"
          target="85%+"
          performance={
            teamMetrics.avgEfficiency >= 90
              ? 'excellent'
              : teamMetrics.avgEfficiency >= 80
                ? 'good'
                : 'poor'
          }
          isLoading={isLoading}
        />
        <AdminMetricCard
          title="Tasks Completed"
          value={teamMetrics.totalTasks.toString()}
          change={12.3}
          trend="up"
          icon={CheckCircle}
          color="sage-green"
          subtitle={`${timeRange} period`}
          isLoading={isLoading}
        />
        <AdminMetricCard
          title="Avg Response Time"
          value={`${teamMetrics.avgResponseTime.toFixed(1)}h`}
          change={-18.5}
          trend="up" // Lower response time is better
          icon={Clock}
          color="earthy-yellow"
          subtitle="Issue resolution"
          target="< 4h"
          performance={
            teamMetrics.avgResponseTime < 2
              ? 'excellent'
              : teamMetrics.avgResponseTime < 4
                ? 'good'
                : 'poor'
          }
          isLoading={isLoading}
        />
        <AdminMetricCard
          title="User Satisfaction"
          value={teamMetrics.avgSatisfaction.toFixed(1)}
          change={8.7}
          trend="up"
          icon={Star}
          color="dusty-cedar"
          subtitle="Avg rating"
          target="4.0+"
          performance={
            teamMetrics.avgSatisfaction >= 4.5
              ? 'excellent'
              : teamMetrics.avgSatisfaction >= 4.0
                ? 'good'
                : 'poor'
          }
          isLoading={isLoading}
        />
        <AdminMetricCard
          title="Escalations"
          value={teamMetrics.totalEscalations.toString()}
          change={-25.4}
          trend="up" // Fewer escalations is better
          icon={AlertTriangle}
          color={
            teamMetrics.totalEscalations < 5
              ? 'muted-olive'
              : teamMetrics.totalEscalations < 10
                ? 'earthy-yellow'
                : 'tomato-red'
          }
          subtitle="Issues escalated"
          performance={
            teamMetrics.totalEscalations < 5
              ? 'excellent'
              : teamMetrics.totalEscalations < 10
                ? 'good'
                : 'poor'
          }
          isLoading={isLoading}
        />
      </div>

      {/* Admin Performance Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Team Performance Over Time
            </h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              {chartView === 'efficiency' &&
                'Team efficiency and productivity trends'}
              {chartView === 'workload' &&
                'Task completion and resource allocation'}
              {chartView === 'response' && 'Average response time performance'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className={`
                px-3 py-2 rounded-lg text-sm border
                ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              <option value="all">All Departments</option>
              <option value="verification">Verification</option>
              <option value="operations">Operations</option>
              <option value="support">User Support</option>
              <option value="content">Content Review</option>
            </select>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="h-80">
          <LineChart
            data={chartData}
            height={320}
            fillArea={chartView === 'efficiency'}
            enableDrillDown
            onDataPointClick={handleChartClick}
            formatTooltip={(context) => {
              const value = context.parsed.y;
              if (chartView === 'efficiency') {
                return `Efficiency: ${value.toFixed(1)}%`;
              }
              if (chartView === 'response') {
                return `Response Time: ${value.toFixed(1)} hours`;
              }
              return `${context.dataset.label}: ${value.toLocaleString()}`;
            }}
            tension={0.3}
          />
        </div>
      </Card>

      {/* Performance Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Leaderboard */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Performance Leaderboard
            </h3>
            <select
              value={leaderboardMetric}
              onChange={(e) => setLeaderboardMetric(e.target.value)}
              className={`
                px-3 py-2 rounded-lg text-sm border
                ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              <option value="efficiency">By Efficiency</option>
              <option value="tasks">By Tasks</option>
              <option value="response">By Response Time</option>
            </select>
          </div>

          <div className="space-y-3">
            {adminData
              .sort((a, b) => {
                if (leaderboardMetric === 'efficiency')
                  return b.efficiency - a.efficiency;
                if (leaderboardMetric === 'tasks')
                  return b.completedTasks - a.completedTasks;
                return a.avgResponseTime - b.avgResponseTime; // Lower is better for response time
              })
              .map((admin, index) => (
                <AdminLeaderboardItem
                  key={admin.id}
                  admin={admin}
                  rank={index + 1}
                  metric={leaderboardMetric}
                />
              ))}
          </div>
        </Card>

        {/* Workload Distribution */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Workload Distribution
            </h3>
            <Button variant="outline" size="sm">
              <PieChartIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-48 mb-4">
            <DoughnutChart
              data={workloadDistribution}
              cutout={50}
              showLegend={false}
              onSegmentClick={(segment) => {
                toast.success(`Analyzing ${segment.label} workload`);
              }}
              centerContent={(centerData) => (
                <div className="text-center">
                  <p
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                  >
                    {teamMetrics.totalTasks}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                  >
                    Total Tasks
                  </p>
                </div>
              )}
            />
          </div>

          {/* Workload Balance Score */}
          <div
            className={`
            p-4 rounded-xl text-center
            ${
              teamMetrics.taskDistribution >= 80
                ? isDarkMode
                  ? 'bg-sage-green/5 border border-sage-green/20'
                  : 'bg-sage-green/5 border border-sage-green/20'
                : teamMetrics.taskDistribution >= 70
                  ? isDarkMode
                    ? 'bg-earthy-yellow/5 border border-earthy-yellow/20'
                    : 'bg-earthy-yellow/5 border border-earthy-yellow/20'
                  : 'bg-tomato-red/5 border border-tomato-red/20'
            }
          `}
          >
            <p
              className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              {teamMetrics.taskDistribution.toFixed(1)}%
            </p>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Workload Balance Score
            </p>
            <p
              className={`text-xs mt-1 ${
                teamMetrics.taskDistribution >= 80
                  ? 'text-sage-green'
                  : teamMetrics.taskDistribution >= 70
                    ? 'text-earthy-yellow'
                    : 'text-tomato-red'
              }`}
            >
              {teamMetrics.taskDistribution >= 80
                ? 'Well Balanced'
                : teamMetrics.taskDistribution >= 70
                  ? 'Moderate Imbalance'
                  : 'Significant Imbalance'}
            </p>
          </div>
        </Card>
      </div>

      {/* Department Performance */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            Department Performance
          </h3>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departmentData.map((dept, index) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                p-4 rounded-xl border transition-all duration-200 cursor-pointer
                ${isDarkMode ? 'border-gray-700 hover:border-gray-600 bg-gray-700/30' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}
                hover:shadow-sm
              `}
              onClick={() => toast.success(`Analyzing ${dept.name} department`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted-olive to-sage-green 
                               flex items-center justify-center"
                >
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <div
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  ${
                    dept.avgEfficiency >= 90
                      ? isDarkMode
                        ? 'bg-sage-green/20 text-sage-green'
                        : 'bg-sage-green/10 text-muted-olive'
                      : dept.avgEfficiency >= 80
                        ? isDarkMode
                          ? 'bg-earthy-yellow/20 text-earthy-yellow'
                          : 'bg-earthy-yellow/10 text-earthy-brown'
                        : 'bg-tomato-red/10 text-tomato-red'
                  }
                `}
                >
                  {dept.avgEfficiency.toFixed(0)}%
                </div>
              </div>

              <div className="space-y-1">
                <p
                  className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                >
                  {dept.name}
                </p>
                <p
                  className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                >
                  {dept.admins} admins • {dept.totalTasks} tasks
                </p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-earthy-yellow" />
                    <span
                      className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      {dept.avgSatisfaction.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <AlertTriangle
                      className={`w-3 h-3 ${
                        dept.totalEscalations > 5
                          ? 'text-tomato-red'
                          : 'text-earthy-yellow'
                      }`}
                    />
                    <span
                      className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      {dept.totalEscalations}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Performance Insights */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <h3
          className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
        >
          Team Performance Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`
            p-4 rounded-xl border
            ${
              teamMetrics.avgEfficiency >= 90
                ? isDarkMode
                  ? 'bg-sage-green/5 border-sage-green/20'
                  : 'bg-sage-green/5 border-sage-green/20'
                : isDarkMode
                  ? 'bg-earthy-yellow/5 border-earthy-yellow/20'
                  : 'bg-earthy-yellow/5 border-earthy-yellow/20'
            }
          `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Award
                className={`w-5 h-5 ${
                  teamMetrics.avgEfficiency >= 90
                    ? 'text-sage-green'
                    : 'text-earthy-yellow'
                }`}
              />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Team Excellence
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Team efficiency at {teamMetrics.avgEfficiency.toFixed(1)}%
              indicates {teamMetrics.avgEfficiency >= 90 ? 'excellent' : 'good'}{' '}
              operational performance with strong productivity.
            </p>
          </div>

          <div
            className={`
            p-4 rounded-xl border
            ${
              teamMetrics.avgResponseTime < 3
                ? isDarkMode
                  ? 'bg-sage-green/5 border-sage-green/20'
                  : 'bg-sage-green/5 border-sage-green/20'
                : isDarkMode
                  ? 'bg-earthy-yellow/5 border-earthy-yellow/20'
                  : 'bg-earthy-yellow/5 border-earthy-yellow/20'
            }
          `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock
                className={`w-5 h-5 ${
                  teamMetrics.avgResponseTime < 3
                    ? 'text-sage-green'
                    : 'text-earthy-yellow'
                }`}
              />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Response Quality
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Average response time of {teamMetrics.avgResponseTime.toFixed(1)}{' '}
              hours shows{' '}
              {teamMetrics.avgResponseTime < 3 ? 'excellent' : 'acceptable'}{' '}
              issue resolution speed.
            </p>
          </div>

          <div
            className={`
            p-4 rounded-xl border
            ${
              teamMetrics.totalEscalations < 10
                ? isDarkMode
                  ? 'bg-muted-olive/5 border-muted-olive/20'
                  : 'bg-muted-olive/5 border-muted-olive/20'
                : isDarkMode
                  ? 'bg-tomato-red/5 border-tomato-red/20'
                  : 'bg-tomato-red/5 border-tomato-red/20'
            }
          `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target
                className={`w-5 h-5 ${
                  teamMetrics.totalEscalations < 10
                    ? 'text-muted-olive'
                    : 'text-tomato-red'
                }`}
              />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Issue Resolution
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              {teamMetrics.totalEscalations} escalations indicate{' '}
              {teamMetrics.totalEscalations < 10 ? 'strong' : 'moderate'}{' '}
              first-level resolution capabilities.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPerformance;
