/**
 * SalesPerformance - Advanced Sales Analytics Component
 * Features: Interactive Chart.js charts, drill-down analysis, real-time sales metrics
 * Provides comprehensive sales insights with trend analysis and performance indicators
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Target,
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import {
  LineChart,
  BarChart,
  PieChart,
  DoughnutChart,
} from '../../../../components/ui/charts/ChartJS';

// Sales metric card component
const SalesMetricCard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = 'sage-green',
  subtitle,
  onClick,
  isLoading = false,
  comparison,
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
            {comparison && (
              <p
                className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}
              >
                vs {comparison}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

const SalesPerformance = ({
  data = {},
  isLoading = false,
  timeRange = '30d',
  onTimeRangeChange,
}) => {
  const { isDarkMode } = useTheme();
  const [chartView, setChartView] = useState('revenue'); // revenue, orders, conversion
  const [chartType, setChartType] = useState('line'); // line, bar
  const [selectedPeriod, setSelectedPeriod] = useState('daily'); // daily, weekly, monthly

  // Generate sample sales data (replace with real API data)
  const salesData = useMemo(() => {
    const generateData = (days = 30) => {
      const result = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = subDays(new Date(), i);
        result.push({
          date: format(date, 'MMM dd'),
          fullDate: date,
          revenue:
            Math.floor(Math.random() * 5000) + 2000 + (i % 7 === 0 ? 1000 : 0),
          orders: Math.floor(Math.random() * 50) + 20 + (i % 7 === 0 ? 20 : 0),
          customers: Math.floor(Math.random() * 30) + 15,
          avgOrderValue: Math.floor(Math.random() * 50) + 80,
        });
      }
      return result;
    };

    return (
      data.dailySales ||
      generateData(timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30)
    );
  }, [data, timeRange]);

  // Sales metrics calculation
  const salesMetrics = useMemo(() => {
    const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
    const totalCustomers = salesData.reduce(
      (sum, day) => sum + day.customers,
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgDailyRevenue =
      salesData.length > 0 ? totalRevenue / salesData.length : 0;

    // Calculate trends (compare first half vs second half)
    const midPoint = Math.floor(salesData.length / 2);
    const firstHalf = salesData.slice(0, midPoint);
    const secondHalf = salesData.slice(midPoint);

    const firstHalfRevenue =
      firstHalf.reduce((sum, day) => sum + day.revenue, 0) / firstHalf.length;
    const secondHalfRevenue =
      secondHalf.reduce((sum, day) => sum + day.revenue, 0) / secondHalf.length;
    const revenueGrowth =
      firstHalfRevenue > 0
        ? ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100
        : 0;

    const firstHalfOrders =
      firstHalf.reduce((sum, day) => sum + day.orders, 0) / firstHalf.length;
    const secondHalfOrders =
      secondHalf.reduce((sum, day) => sum + day.orders, 0) / secondHalf.length;
    const orderGrowth =
      firstHalfOrders > 0
        ? ((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      avgOrderValue,
      avgDailyRevenue,
      revenueGrowth,
      orderGrowth,
      conversionRate: (totalOrders / totalCustomers) * 100 || 0,
    };
  }, [salesData]);

  // Chart data transformations
  const chartData = useMemo(() => {
    const labels = salesData.map((item) => item.date);

    if (chartView === 'revenue') {
      return {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: salesData.map((item) => item.revenue),
            color: '#10B981',
            borderColor: '#10B981',
            backgroundColor: '#10B98120',
          },
        ],
      };
    }

    if (chartView === 'orders') {
      return {
        labels,
        datasets: [
          {
            label: 'Orders',
            data: salesData.map((item) => item.orders),
            color: '#3B82F6',
            borderColor: '#3B82F6',
            backgroundColor: '#3B82F620',
          },
        ],
      };
    }

    // Conversion view - multiple metrics
    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data: salesData.map((item) => item.orders),
          color: '#3B82F6',
          borderColor: '#3B82F6',
          backgroundColor: '#3B82F620',
        },
        {
          label: 'Customers',
          data: salesData.map((item) => item.customers),
          color: '#F59E0B',
          borderColor: '#F59E0B',
          backgroundColor: '#F59E0B20',
        },
      ],
    };
  }, [salesData, chartView]);

  // Top performing periods data
  const topPerformingPeriods = useMemo(() => {
    return salesData
      .map((day, index) => ({ ...day, index }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [salesData]);

  // Sales channel breakdown (sample data)
  const salesChannelData = useMemo(
    () => [
      { label: 'Mobile App', value: 45, color: '#10B981' },
      { label: 'Web Platform', value: 35, color: '#3B82F6' },
      { label: 'Direct Orders', value: 15, color: '#F59E0B' },
      { label: 'Partner API', value: 5, color: '#EF4444' },
    ],
    []
  );

  // Handle chart data point click for drill-down
  const handleChartClick = useCallback((dataPoint, context) => {
    const { label, value, datasetLabel } = dataPoint;
    toast.success(
      `Analyzing ${datasetLabel}: ${label} (${typeof value === 'number' ? value.toLocaleString() : value})`
    );

    // Here you could navigate to detailed view or show drill-down modal
    console.log('Sales drill-down:', { dataPoint, context });
  }, []);

  // Handle export
  const handleExport = useCallback(() => {
    const exportData = {
      metrics: salesMetrics,
      chartData: salesData,
      topPeriods: topPerformingPeriods,
      channels: salesChannelData,
      exportDate: new Date().toISOString(),
      timeRange,
    };

    // Convert to CSV
    const csv = [
      ['Date', 'Revenue', 'Orders', 'Customers', 'Avg Order Value'],
      ...salesData.map((day) => [
        day.date,
        day.revenue,
        day.orders,
        day.customers,
        day.avgOrderValue,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-performance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Sales data exported to CSV');
  }, [
    salesMetrics,
    salesData,
    topPerformingPeriods,
    salesChannelData,
    timeRange,
  ]);

  return (
    <div className="space-y-6">
      {/* Sales Performance Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            Sales Performance
          </h2>
          <p
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            Comprehensive sales analytics and revenue insights
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
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'orders', label: 'Orders', icon: ShoppingCart },
              { id: 'conversion', label: 'Conversion', icon: Target },
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

          {/* Chart Type Toggle */}
          <div
            className={`flex items-center gap-1 p-1 rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            {[
              { type: 'line', icon: LineChartIcon },
              { type: 'bar', icon: BarChart3 },
            ].map((option) => (
              <button
                key={option.type}
                onClick={() => setChartType(option.type)}
                className={`
                  p-2 rounded-lg transition-all duration-200
                  ${
                    chartType === option.type
                      ? isDarkMode
                        ? 'bg-sage-green/20 text-sage-green'
                        : 'bg-white text-muted-olive shadow-sm'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-text-muted hover:text-text-dark'
                  }
                `}
              >
                <option.icon className="w-4 h-4" />
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

      {/* Key Sales Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <SalesMetricCard
          title="Total Revenue"
          value={`$${salesMetrics.totalRevenue.toLocaleString()}`}
          change={salesMetrics.revenueGrowth.toFixed(1)}
          trend={salesMetrics.revenueGrowth > 0 ? 'up' : 'down'}
          icon={DollarSign}
          color="sage-green"
          subtitle={`${timeRange} period`}
          isLoading={isLoading}
        />
        <SalesMetricCard
          title="Total Orders"
          value={salesMetrics.totalOrders.toLocaleString()}
          change={salesMetrics.orderGrowth.toFixed(1)}
          trend={salesMetrics.orderGrowth > 0 ? 'up' : 'down'}
          icon={ShoppingCart}
          color="sage-green"
          subtitle="All channels"
          isLoading={isLoading}
        />
        <SalesMetricCard
          title="Avg Order Value"
          value={`$${salesMetrics.avgOrderValue.toFixed(2)}`}
          change={8.3}
          trend="up"
          icon={Target}
          color="earthy-yellow"
          subtitle="Per transaction"
          isLoading={isLoading}
        />
        <SalesMetricCard
          title="Daily Average"
          value={`$${salesMetrics.avgDailyRevenue.toFixed(0)}`}
          change={12.1}
          trend="up"
          icon={Calendar}
          color="dusty-cedar"
          subtitle="Revenue/day"
          isLoading={isLoading}
        />
        <SalesMetricCard
          title="Conversion Rate"
          value={`${salesMetrics.conversionRate.toFixed(1)}%`}
          change={-2.4}
          trend="down"
          icon={TrendingUp}
          color="muted-olive"
          subtitle="Visitor to order"
          isLoading={isLoading}
        />
        <SalesMetricCard
          title="Total Customers"
          value={salesMetrics.totalCustomers.toLocaleString()}
          change={15.7}
          trend="up"
          icon={Users}
          color="muted-olive"
          subtitle="Unique buyers"
          isLoading={isLoading}
        />
      </div>

      {/* Main Sales Chart */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Sales{' '}
              {chartView === 'revenue'
                ? 'Revenue'
                : chartView === 'orders'
                  ? 'Orders'
                  : 'Performance'}{' '}
              Trend
            </h3>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              {chartView === 'revenue' && 'Daily revenue performance over time'}
              {chartView === 'orders' && 'Order volume and frequency analysis'}
              {chartView === 'conversion' &&
                'Orders vs customers conversion analysis'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setSelectedPeriod(
                  selectedPeriod === 'daily' ? 'weekly' : 'daily'
                )
              }
            >
              <Calendar className="w-4 h-4 mr-2" />
              {selectedPeriod}
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="h-80">
          {chartType === 'line' ? (
            <LineChart
              data={chartData}
              height={320}
              fillArea={chartView === 'revenue'}
              enableDrillDown
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => {
                const value = context.parsed.y;
                if (chartView === 'revenue') {
                  return `Revenue: $${value.toLocaleString()}`;
                }
                if (chartView === 'orders') {
                  return `Orders: ${value.toLocaleString()}`;
                }
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              }}
              isRealTime={false}
            />
          ) : (
            <BarChart
              data={chartData}
              height={320}
              enableDrillDown
              onDataPointClick={handleChartClick}
              formatTooltip={(context) => {
                const value = context.parsed.y;
                if (chartView === 'revenue') {
                  return `Revenue: $${value.toLocaleString()}`;
                }
                if (chartView === 'orders') {
                  return `Orders: ${value.toLocaleString()}`;
                }
                return `${context.dataset.label}: ${value.toLocaleString()}`;
              }}
              borderRadius={8}
              maxBarThickness={40}
            />
          )}
        </div>
      </Card>

      {/* Sales Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Periods */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Top Performing Days
            </h3>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {topPerformingPeriods.map((period, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center justify-between p-3 rounded-xl
                  ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                  hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors cursor-pointer
                `}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                    ${
                      index === 0
                        ? 'bg-gradient-to-r from-earthy-yellow to-earthy-yellow/80 text-white'
                        : isDarkMode
                          ? 'bg-gray-600 text-gray-300'
                          : 'bg-gray-200 text-text-muted'
                    }
                  `}
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                    >
                      {period.date}
                    </p>
                    <p
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      {period.orders} orders • {period.customers} customers
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                  >
                    ${period.revenue.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                  >
                    ${period.avgOrderValue.toFixed(2)} AOV
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Sales Channel Breakdown */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Sales Channels
            </h3>
            <Button variant="outline" size="sm">
              <PieChartIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-64">
            <DoughnutChart
              data={salesChannelData}
              cutout={50}
              showLegend={false}
              onSegmentClick={(segment) => {
                toast.success(`Analyzing ${segment.label} channel`);
              }}
              centerContent={(centerData) => (
                <div className="text-center">
                  <p
                    className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                  >
                    {centerData.count}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                  >
                    Channels
                  </p>
                </div>
              )}
            />
          </div>

          {/* Channel Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {salesChannelData.map((channel, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: channel.color }}
                />
                <span
                  className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                >
                  {channel.label}
                </span>
                <span
                  className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
                >
                  {channel.value}%
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sales Insights */}
      <Card className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
        <h3
          className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
        >
          Sales Insights & Trends
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`
            p-4 rounded-xl border
            ${
              salesMetrics.revenueGrowth > 0
                ? isDarkMode
                  ? 'bg-sage-green/5 border-sage-green/20'
                  : 'bg-sage-green/5 border-sage-green/20'
                : isDarkMode
                  ? 'bg-tomato-red/5 border-tomato-red/20'
                  : 'bg-tomato-red/5 border-tomato-red/20'
            }
          `}
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp
                className={`w-5 h-5 ${
                  salesMetrics.revenueGrowth > 0
                    ? 'text-sage-green'
                    : 'text-tomato-red'
                }`}
              />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Revenue Growth
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Revenue{' '}
              {salesMetrics.revenueGrowth > 0 ? 'increased' : 'decreased'} by{' '}
              {Math.abs(salesMetrics.revenueGrowth).toFixed(1)}% compared to
              previous period.
            </p>
          </div>

          <div
            className={`
            p-4 rounded-xl border
            ${
              salesMetrics.orderGrowth > 0
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
              <ShoppingCart
                className={`w-5 h-5 ${
                  salesMetrics.orderGrowth > 0
                    ? 'text-sage-green'
                    : 'text-earthy-yellow'
                }`}
              />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Order Volume
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Order volume {salesMetrics.orderGrowth > 0 ? 'grew' : 'declined'}{' '}
              by {Math.abs(salesMetrics.orderGrowth).toFixed(1)}% with strong
              customer engagement.
            </p>
          </div>

          <div
            className={`
            p-4 rounded-xl border
            ${isDarkMode ? 'bg-muted-olive/5 border-muted-olive/20' : 'bg-muted-olive/5 border-muted-olive/20'}
          `}
          >
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-muted-olive" />
              <span
                className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                Performance Health
              </span>
            </div>
            <p
              className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
            >
              Average order value of ${salesMetrics.avgOrderValue.toFixed(2)}{' '}
              indicates healthy transaction patterns.
            </p>
          </div>
        </div>
      </Card>

      {/* Peak Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Time of Day (Sample) */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Revenue by Hour
            </h3>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-64">
            <BarChart
              data={{
                labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                datasets: [
                  {
                    label: 'Revenue',
                    data: [2400, 4800, 8200, 6100, 9200, 3400],
                    color: '#10B981',
                  },
                ],
              }}
              height={240}
              orientation="vertical"
              borderRadius={6}
              maxBarThickness={40}
              formatTooltip={(context) =>
                `$${context.parsed.y.toLocaleString()} at ${context.label}`
              }
            />
          </div>
        </Card>

        {/* Order Size Distribution */}
        <Card
          className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
            >
              Order Size Distribution
            </h3>
            <Button variant="outline" size="sm">
              <PieChartIcon className="w-4 h-4" />
            </Button>
          </div>

          <div className="h-64">
            <PieChart
              data={[
                { label: 'Small ($0-50)', value: 35, color: '#3B82F6' },
                { label: 'Medium ($51-150)', value: 45, color: '#10B981' },
                { label: 'Large ($151-300)', value: 15, color: '#F59E0B' },
                { label: 'Enterprise ($300+)', value: 5, color: '#8B5CF6' },
              ]}
              height={240}
              showLegend={false}
              onSegmentClick={(segment) => {
                toast.success(`Analyzing ${segment.label} orders`);
              }}
            />
          </div>

          {/* Distribution Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center">
              <p
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                ${salesMetrics.avgOrderValue.toFixed(2)}
              </p>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Average Order
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
              >
                45%
              </p>
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
              >
                Medium Orders
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SalesPerformance;
