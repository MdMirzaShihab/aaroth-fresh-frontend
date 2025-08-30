/**
 * UserAnalytics - Comprehensive User Analytics and Segmentation Component
 * Features: User segmentation, retention analysis, cohort analysis, behavior insights
 * Provides deep insights into user behavior patterns and engagement metrics
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Activity,
  Target,
  Award,
  AlertCircle,
  Filter,
  Download,
  Eye,
  BarChart3,
  LineChart as LineChartIcon,
  MapPin,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import { LineChart, BarChart, DoughnutChart } from '../../../../components/ui/charts/ChartJS';
import { format, subDays, subMonths } from 'date-fns';
import toast from 'react-hot-toast';

// User metric card component
const UserMetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = 'sage-green',
  subtitle,
  onClick,
  isLoading = false,
  comparison 
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
        ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}
      `}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${isDarkMode ? `bg-${color}/20` : `bg-${color}/10`}
        `}>
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
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              {value}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {title}
            </p>
            {subtitle && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted/80'}`}>
                {subtitle}
              </p>
            )}
            {comparison && (
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
                vs {comparison}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

// User segment component
const UserSegmentCard = ({ segment, onClick, isActive = false }) => {
  const { isDarkMode } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick(segment)}
      className={`
        glass-card rounded-xl p-4 border cursor-pointer transition-all duration-200
        ${isActive 
          ? isDarkMode ? 'border-sage-green/50 bg-sage-green/5' : 'border-muted-olive/50 bg-muted-olive/5'
          : isDarkMode ? 'border-gray-700/50 hover:border-gray-600' : 'border-gray-200/50 hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${isActive 
            ? isDarkMode ? 'bg-sage-green/20' : 'bg-muted-olive/10'
            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }
        `}>
          <segment.icon className={`w-4 h-4 ${
            isActive 
              ? isDarkMode ? 'text-sage-green' : 'text-muted-olive'
              : isDarkMode ? 'text-gray-400' : 'text-text-muted'
          }`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {segment.name}
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {segment.count.toLocaleString()} users
            </p>
            <span className={`text-xs font-medium ${
              segment.growth > 0 
                ? 'text-sage-green' 
                : segment.growth < 0 
                  ? 'text-tomato-red' 
                  : isDarkMode ? 'text-gray-400' : 'text-text-muted'
            }`}>
              {segment.growth > 0 ? '+' : ''}{segment.growth.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className={`text-right`}>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {segment.percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const UserAnalytics = ({ 
  data = {}, 
  isLoading = false, 
  timeRange = '30d',
  onTimeRangeChange 
}) => {
  const { isDarkMode } = useTheme();
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [cohortPeriod, setCohortPeriod] = useState('monthly');
  const [chartView, setChartView] = useState('growth'); // growth, retention, engagement

  // Generate user analytics data (replace with real API data)
  const userMetrics = useMemo(() => {
    const base = data.userMetrics || {};
    return {
      totalUsers: base.totalUsers || 4238,
      activeUsers: base.activeUsers || 2891,
      newUsers: base.newUsers || 347,
      returningUsers: base.returningUsers || 2544,
      userGrowth: base.userGrowth || 18.3,
      retentionRate: base.retentionRate || 67.4,
      avgSessionDuration: base.avgSessionDuration || 8.7, // minutes
      bounceRate: base.bounceRate || 23.5,
      dailyActiveUsers: base.dailyActiveUsers || 1456,
      monthlyActiveUsers: base.monthlyActiveUsers || 2891,
    };
  }, [data]);

  // User growth data over time
  const userGrowthData = useMemo(() => {
    const generateGrowthData = (days = 30) => {
      const result = [];
      let baseUsers = 3500;
      
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const growth = Math.floor(Math.random() * 20) + 5; // 5-25 new users per day
        baseUsers += growth;
        
        result.push({
          date: format(date, 'MMM dd'),
          fullDate: date,
          totalUsers: baseUsers,
          newUsers: growth,
          activeUsers: Math.floor(baseUsers * 0.68), // 68% active rate
          returningUsers: Math.floor(growth * 0.3), // 30% returning
        });
      }
      return result;
    };

    return data.userGrowth || generateGrowthData(timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30);
  }, [data, timeRange]);

  // User segmentation data
  const userSegments = useMemo(() => [
    {
      id: 'vendors',
      name: 'Vendors',
      icon: Users,
      count: 1247,
      percentage: 29.4,
      growth: 12.8,
      avgOrderValue: 156.30,
      retention: 78.2,
    },
    {
      id: 'restaurant-owners',
      name: 'Restaurant Owners',
      icon: UserCheck,
      count: 1891,
      percentage: 44.6,
      growth: 18.5,
      avgOrderValue: 203.50,
      retention: 82.4,
    },
    {
      id: 'restaurant-managers',
      name: 'Restaurant Managers',
      icon: UserPlus,
      count: 743,
      percentage: 17.5,
      growth: 25.7,
      avgOrderValue: 178.90,
      retention: 69.3,
    },
    {
      id: 'admins',
      name: 'Administrators',
      icon: Award,
      count: 24,
      percentage: 0.6,
      growth: 4.3,
      avgOrderValue: 0,
      retention: 95.8,
    },
    {
      id: 'inactive',
      name: 'Inactive Users',
      icon: UserX,
      count: 333,
      percentage: 7.9,
      growth: -8.2,
      avgOrderValue: 45.20,
      retention: 12.1,
    },
  ], []);

  // Retention cohort data (simplified)
  const retentionData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      newUsers: Math.floor(Math.random() * 200) + 100,
      week1Retention: Math.floor(Math.random() * 30) + 60,
      week2Retention: Math.floor(Math.random() * 20) + 50,
      month1Retention: Math.floor(Math.random() * 20) + 40,
      month3Retention: Math.floor(Math.random() * 15) + 25,
    }));
  }, []);

  // Device and platform breakdown
  const deviceBreakdown = useMemo(() => [
    { label: 'Mobile', value: 68, color: '#10B981' },
    { label: 'Desktop', value: 28, color: '#3B82F6' },
    { label: 'Tablet', value: 4, color: '#F59E0B' },
  ], []);

  // Chart data for user growth
  const growthChartData = useMemo(() => {
    const labels = userGrowthData.map(item => item.date);
    
    if (chartView === 'growth') {
      return {
        labels,
        datasets: [{
          label: 'Total Users',
          data: userGrowthData.map(item => item.totalUsers),
          color: '#10B981',
          borderColor: '#10B981',
          backgroundColor: '#10B98120',
        }],
      };
    }
    
    if (chartView === 'retention') {
      return {
        labels: retentionData.map(item => item.month),
        datasets: [
          {
            label: 'Week 1',
            data: retentionData.map(item => item.week1Retention),
            color: '#10B981',
          },
          {
            label: 'Month 1',
            data: retentionData.map(item => item.month1Retention),
            color: '#3B82F6',
          },
          {
            label: 'Month 3',
            data: retentionData.map(item => item.month3Retention),
            color: '#F59E0B',
          },
        ],
      };
    }
    
    // Engagement view
    return {
      labels,
      datasets: [
        {
          label: 'Active Users',
          data: userGrowthData.map(item => item.activeUsers),
          color: '#10B981',
        },
        {
          label: 'New Users',
          data: userGrowthData.map(item => item.newUsers),
          color: '#3B82F6',
        },
      ],
    };
  }, [userGrowthData, retentionData, chartView]);

  // Handle chart interactions
  const handleChartClick = useCallback((dataPoint, context) => {
    const { label, value, datasetLabel } = dataPoint;
    toast.success(`Analyzing ${datasetLabel}: ${label} (${typeof value === 'number' ? value.toLocaleString() : value})`);
  }, []);

  // Handle segment selection
  const handleSegmentClick = useCallback((segment) => {
    setSelectedSegment(selectedSegment?.id === segment.id ? null : segment);
    toast.success(`${selectedSegment?.id === segment.id ? 'Deselected' : 'Selected'} ${segment.name} segment`);
  }, [selectedSegment]);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = {
      metrics: userMetrics,
      segments: userSegments,
      growthData: userGrowthData,
      retentionData,
      deviceBreakdown,
      exportDate: new Date().toISOString(),
      timeRange,
    };
    
    toast.success('User analytics export started');
  }, [userMetrics, userSegments, userGrowthData, retentionData, deviceBreakdown, timeRange]);

  return (
    <div className="space-y-6">
      {/* User Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            User Analytics
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            User behavior, segmentation, and retention insights
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart View Toggle */}
          <div className={`flex items-center gap-1 p-1 rounded-lg ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {[
              { id: 'growth', label: 'Growth', icon: TrendingUp },
              { id: 'retention', label: 'Retention', icon: UserCheck },
              { id: 'engagement', label: 'Engagement', icon: Activity },
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

      {/* Key User Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <UserMetricCard
          title="Total Users"
          value={userMetrics.totalUsers.toLocaleString()}
          change={userMetrics.userGrowth}
          trend={userMetrics.userGrowth > 0 ? 'up' : 'down'}
          icon={Users}
          color="sage-green"
          subtitle="All time"
          isLoading={isLoading}
        />
        <UserMetricCard
          title="Active Users"
          value={userMetrics.activeUsers.toLocaleString()}
          change={12.5}
          trend="up"
          icon={UserCheck}
          color="sage-green"
          subtitle="Monthly active"
          isLoading={isLoading}
        />
        <UserMetricCard
          title="New Users"
          value={userMetrics.newUsers.toLocaleString()}
          change={24.8}
          trend="up"
          icon={UserPlus}
          color="earthy-yellow"
          subtitle={`${timeRange} period`}
          isLoading={isLoading}
        />
        <UserMetricCard
          title="Retention Rate"
          value={`${userMetrics.retentionRate.toFixed(1)}%`}
          change={5.2}
          trend="up"
          icon={Target}
          color="dusty-cedar"
          subtitle="30-day retention"
          isLoading={isLoading}
        />
        <UserMetricCard
          title="Avg Session"
          value={`${userMetrics.avgSessionDuration.toFixed(1)}m`}
          change={-3.1}
          trend="down"
          icon={Clock}
          color="muted-olive"
          subtitle="Duration"
          isLoading={isLoading}
        />
        <UserMetricCard
          title="Daily Active"
          value={userMetrics.dailyActiveUsers.toLocaleString()}
          change={8.7}
          trend="up"
          icon={Activity}
          color="muted-olive"
          subtitle="DAU"
          isLoading={isLoading}
        />
      </div>

      {/* Main User Growth Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              User {chartView === 'growth' ? 'Growth' : chartView === 'retention' ? 'Retention' : 'Engagement'} Analytics
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {chartView === 'growth' && 'User acquisition and growth trends over time'}
              {chartView === 'retention' && 'Cohort retention analysis by time periods'}
              {chartView === 'engagement' && 'Daily engagement and activity patterns'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCohortPeriod(cohortPeriod === 'monthly' ? 'weekly' : 'monthly')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {cohortPeriod}
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="h-80">
          {chartView === 'retention' ? (
            <BarChart
              data={growthChartData}
              height={320}
              stacked={false}
              enableDrillDown={true}
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`}
              borderRadius={6}
              maxBarThickness={30}
            />
          ) : (
            <LineChart
              data={growthChartData}
              height={320}
              fillArea={chartView === 'growth'}
              enableDrillDown={true}
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => {
                const value = context.parsed.y;
                if (chartView === 'growth') {
                  return `Total Users: ${value.toLocaleString()}`;
                }
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              }}
              tension={0.3}
            />
          )}
        </div>
      </Card>

      {/* User Segmentation and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Segments */}
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              User Segments
            </h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {userSegments.map((segment) => (
              <UserSegmentCard
                key={segment.id}
                segment={segment}
                onClick={handleSegmentClick}
                isActive={selectedSegment?.id === segment.id}
              />
            ))}
          </div>
        </Card>

        {/* Device & Platform Analytics */}
        <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              Device & Platform Usage
            </h3>
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="h-48 mb-4">
            <DoughnutChart
              data={deviceBreakdown}
              cutout={50}
              showLegend={false}
              onSegmentClick={(segment) => {
                toast.success(`Analyzing ${segment.label} users`);
              }}
              centerContent={(centerData) => (
                <div className="text-center">
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {centerData.total}%
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Coverage
                  </p>
                </div>
              )}
            />
          </div>
          
          {/* Device Stats */}
          <div className="space-y-3">
            {deviceBreakdown.map((device, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: device.color }}
                  />
                  <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    {device.label}
                  </span>
                </div>
                <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {device.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Selected Segment Analysis */}
      {selectedSegment && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50 border-sage-green/20' : 'bg-white/80 border-muted-olive/20'}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center
                  ${isDarkMode ? 'bg-sage-green/20' : 'bg-muted-olive/10'}
                `}>
                  <selectedSegment.icon className={`w-5 h-5 ${
                    isDarkMode ? 'text-sage-green' : 'text-muted-olive'
                  }`} />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                    {selectedSegment.name} Analysis
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    Detailed insights for this user segment
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSegment(null)}
              >
                Close
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedSegment.count.toLocaleString()}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Total Users
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedSegment.percentage.toFixed(1)}%
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Platform Share
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  ${selectedSegment.avgOrderValue.toFixed(2)}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Avg Order Value
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {selectedSegment.retention.toFixed(1)}%
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  Retention Rate
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* User Behavior Insights */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
          User Behavior Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`
            p-4 rounded-xl border
            ${isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'}
          `}>
            <div className="flex items-center gap-3 mb-2">
              <UserPlus className="w-5 h-5 text-sage-green" />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                User Acquisition
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              New user registrations increased by {userMetrics.userGrowth.toFixed(1)}% this period, primarily driven by mobile app referrals.
            </p>
          </div>

          <div className={`
            p-4 rounded-xl border
            ${userMetrics.retentionRate > 60
              ? isDarkMode ? 'bg-sage-green/5 border-sage-green/20' : 'bg-sage-green/5 border-sage-green/20'
              : isDarkMode ? 'bg-earthy-yellow/5 border-earthy-yellow/20' : 'bg-earthy-yellow/5 border-earthy-yellow/20'
            }
          `}>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className={`w-5 h-5 ${
                userMetrics.retentionRate > 60 ? 'text-sage-green' : 'text-earthy-yellow'
              }`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                User Retention
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {userMetrics.retentionRate.toFixed(1)}% retention rate indicates{' '}
              {userMetrics.retentionRate > 60 ? 'strong' : 'moderate'} user engagement and platform value.
            </p>
          </div>

          <div className={`
            p-4 rounded-xl border
            ${userMetrics.bounceRate < 30
              ? isDarkMode ? 'bg-muted-olive/5 border-muted-olive/20' : 'bg-muted-olive/5 border-muted-olive/20'
              : isDarkMode ? 'bg-tomato-red/5 border-tomato-red/20' : 'bg-tomato-red/5 border-tomato-red/20'
            }
          `}>
            <div className="flex items-center gap-3 mb-2">
              <Activity className={`w-5 h-5 ${
                userMetrics.bounceRate < 30 ? 'text-muted-olive' : 'text-tomato-red'
              }`} />
              <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                User Engagement
              </span>
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              {userMetrics.bounceRate.toFixed(1)}% bounce rate with {userMetrics.avgSessionDuration.toFixed(1)}m average session duration shows{' '}
              {userMetrics.bounceRate < 30 ? 'excellent' : 'good'} engagement.
            </p>
          </div>
        </div>
      </Card>

      {/* Cohort Retention Analysis */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            Cohort Retention Analysis
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCohortPeriod(cohortPeriod === 'monthly' ? 'weekly' : 'monthly')}
            >
              {cohortPeriod} View
            </Button>
          </div>
        </div>
        
        {/* Retention Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-2 font-medium text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-dark'
                }`}>
                  Cohort
                </th>
                <th className={`text-right py-3 px-2 font-medium text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-dark'
                }`}>
                  Users
                </th>
                <th className={`text-right py-3 px-2 font-medium text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-dark'
                }`}>
                  Week 1
                </th>
                <th className={`text-right py-3 px-2 font-medium text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-dark'
                }`}>
                  Month 1
                </th>
                <th className={`text-right py-3 px-2 font-medium text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-dark'
                }`}>
                  Month 3
                </th>
              </tr>
            </thead>
            <tbody>
              {retentionData.map((cohort, index) => (
                <tr 
                  key={index}
                  className={`
                    border-b hover:${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'} transition-colors
                    ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}
                  `}
                >
                  <td className="py-3 px-2">
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                      {cohort.month} 2024
                    </span>
                  </td>
                  <td className={`py-3 px-2 text-right ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                    {cohort.newUsers}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${cohort.week1Retention > 60 
                        ? isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-sage-green/10 text-muted-olive'
                        : cohort.week1Retention > 40
                          ? isDarkMode ? 'bg-earthy-yellow/20 text-earthy-yellow' : 'bg-earthy-yellow/10 text-earthy-brown'
                          : 'bg-tomato-red/10 text-tomato-red'
                      }
                    `}>
                      {cohort.week1Retention}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${cohort.month1Retention > 40 
                        ? isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-sage-green/10 text-muted-olive'
                        : cohort.month1Retention > 25
                          ? isDarkMode ? 'bg-earthy-yellow/20 text-earthy-yellow' : 'bg-earthy-yellow/10 text-earthy-brown'
                          : 'bg-tomato-red/10 text-tomato-red'
                      }
                    `}>
                      {cohort.month1Retention}%
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <span className={`
                      px-2 py-1 rounded text-xs font-medium
                      ${cohort.month3Retention > 25 
                        ? isDarkMode ? 'bg-sage-green/20 text-sage-green' : 'bg-sage-green/10 text-muted-olive'
                        : cohort.month3Retention > 15
                          ? isDarkMode ? 'bg-earthy-yellow/20 text-earthy-yellow' : 'bg-earthy-yellow/10 text-earthy-brown'
                          : 'bg-tomato-red/10 text-tomato-red'
                      }
                    `}>
                      {cohort.month3Retention}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UserAnalytics;