/**
 * BusinessMetricsChart - Interactive Business Analytics Component
 * Features: Multiple chart types, time range selector, drill-down capabilities, export functionality
 * Supports Line, Bar, Area, and Pie charts with mobile-responsive design
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Calendar,
  Download,
  Maximize2,
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  Filter,
  RefreshCcw,
} from 'lucide-react';
import { format, subDays, isWithinInterval } from 'date-fns';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BusinessMetricsChart = ({
  data = [],
  title = 'Business Metrics',
  chartType = 'line',
  timeRange = '30d',
  onTimeRangeChange,
  onChartTypeChange,
  onDataPointClick,
  onExport,
  isLoading = false,
  height = 350,
  enableDrillDown = true,
  enableExport = true,
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['revenue', 'orders']);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Time range options
  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  // Chart type options
  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart', icon: LineChart },
    { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
    { value: 'pie', label: 'Pie Chart', icon: PieChart },
    { value: 'doughnut', label: 'Doughnut Chart', icon: PieChart },
  ];

  // Available metrics for filtering
  const availableMetrics = [
    { key: 'revenue', label: 'Revenue', color: '#10B981' },
    { key: 'orders', label: 'Orders', color: '#3B82F6' },
    { key: 'users', label: 'Users', color: '#8B5CF6' },
    { key: 'conversion', label: 'Conversion Rate', color: '#F59E0B' },
  ];

  // Theme-aware colors
  const chartColors = useMemo(
    () => ({
      primary: isDarkMode ? '#10B981' : '#059669',
      secondary: isDarkMode ? '#3B82F6' : '#2563EB',
      accent: isDarkMode ? '#8B5CF6' : '#7C3AED',
      warning: isDarkMode ? '#F59E0B' : '#D97706',
      background: isDarkMode
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(5, 150, 105, 0.1)',
      grid: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      text: isDarkMode ? '#F3F4F6' : '#1F2937',
    }),
    [isDarkMode]
  );

  // Filter data based on time range
  const filteredData = useMemo(() => {
    if (!data || !data.length) return [];

    const now = new Date();
    const ranges = {
      '7d': subDays(now, 7),
      '30d': subDays(now, 30),
      '90d': subDays(now, 90),
      '1y': subDays(now, 365),
    };

    const startDate = ranges[timeRange];
    if (!startDate) return data;

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return isWithinInterval(itemDate, { start: startDate, end: now });
    });
  }, [data, timeRange]);

  // Prepare chart data based on type and selected metrics
  const chartData = useMemo(() => {
    if (!filteredData.length) return null;

    const labels = filteredData.map((item) =>
      format(new Date(item.date), 'MMM dd')
    );

    if (chartType === 'pie' || chartType === 'doughnut') {
      // Aggregate data for pie charts
      const totalValues = selectedMetrics.reduce((acc, metric) => {
        const total = filteredData.reduce(
          (sum, item) => sum + (item[metric] || 0),
          0
        );
        acc[metric] = total;
        return acc;
      }, {});

      return {
        labels: selectedMetrics.map(
          (metric) =>
            availableMetrics.find((m) => m.key === metric)?.label || metric
        ),
        datasets: [
          {
            data: selectedMetrics.map((metric) => totalValues[metric]),
            backgroundColor: selectedMetrics.map(
              (metric, index) =>
                availableMetrics.find((m) => m.key === metric)?.color ||
                chartColors.primary
            ),
            borderWidth: isDarkMode ? 1 : 2,
            borderColor: isDarkMode ? chartColors.grid : '#FFFFFF',
          },
        ],
      };
    }

    // Line/Bar chart data
    return {
      labels,
      datasets: selectedMetrics.map((metric, index) => {
        const metricData = availableMetrics.find((m) => m.key === metric);
        const color = metricData?.color || chartColors.primary;

        return {
          label: metricData?.label || metric,
          data: filteredData.map((item) => item[metric] || 0),
          borderColor: color,
          backgroundColor: chartType === 'line' ? `${color}20` : color,
          fill: chartType === 'line',
          tension: 0.4,
          borderWidth: 2,
          pointBackgroundColor: color,
          pointBorderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        };
      }),
    };
  }, [
    filteredData,
    chartType,
    selectedMetrics,
    availableMetrics,
    chartColors,
    isDarkMode,
  ]);

  // Chart options
  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: chartColors.text,
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12,
              weight: '500',
            },
          },
        },
        tooltip: {
          backgroundColor: isDarkMode
            ? 'rgba(31, 41, 55, 0.95)'
            : 'rgba(255, 255, 255, 0.95)',
          titleColor: chartColors.text,
          bodyColor: chartColors.text,
          borderColor: chartColors.grid,
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          displayColors: true,
          callbacks: {
            label(context) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed;

              if (label.toLowerCase().includes('revenue')) {
                return `${label}: $${value.toLocaleString()}`;
              }
              if (
                label.toLowerCase().includes('rate') ||
                label.toLowerCase().includes('conversion')
              ) {
                return `${label}: ${value}%`;
              }
              return `${label}: ${value.toLocaleString()}`;
            },
          },
        },
      },
      scales:
        chartType !== 'pie' && chartType !== 'doughnut'
          ? {
              x: {
                grid: {
                  color: chartColors.grid,
                  drawBorder: false,
                },
                ticks: {
                  color: chartColors.text,
                  font: {
                    size: 11,
                  },
                },
              },
              y: {
                grid: {
                  color: chartColors.grid,
                  drawBorder: false,
                },
                ticks: {
                  color: chartColors.text,
                  font: {
                    size: 11,
                  },
                  callback(value) {
                    if (value >= 1000000)
                      return (value / 1000000).toFixed(1) + 'M';
                    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
                    return value.toLocaleString();
                  },
                },
              },
            }
          : {},
      onClick: enableDrillDown
        ? (event, elements) => {
            if (elements.length > 0) {
              const elementIndex = elements[0].index;
              const datasetIndex = elements[0].datasetIndex;
              onDataPointClick?.(filteredData[elementIndex], {
                elementIndex,
                datasetIndex,
              });
            }
          }
        : undefined,
    }),
    [
      chartType,
      chartColors,
      isDarkMode,
      enableDrillDown,
      filteredData,
      onDataPointClick,
    ]
  );

  // Handle metric selection
  const handleMetricToggle = useCallback((metricKey) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricKey)
        ? prev.filter((m) => m !== metricKey)
        : [...prev, metricKey]
    );
  }, []);

  // Render chart component based on type
  const renderChart = () => {
    if (!chartData) return null;

    const commonProps = {
      data: chartData,
      options: chartOptions,
      height,
    };

    switch (chartType) {
      case 'line':
        return <Line {...commonProps} />;
      case 'bar':
        return <Bar {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return <Line {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div
            className="bg-gray-200 dark:bg-gray-700 rounded"
            style={{ height: `${height}px` }}
          />
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp
            className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
          />
          <h3
            className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
          >
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {chartTypeOptions.map(({ value, icon: Icon }) => (
              <button
                key={value}
                onClick={() => onChartTypeChange?.(value)}
                className={`
                  p-2 rounded-lg transition-all duration-200 touch-target-sm
                  ${
                    chartType === value
                      ? isDarkMode
                        ? 'bg-sage-green/20 text-sage-green'
                        : 'bg-muted-olive/10 text-muted-olive'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-300'
                        : 'text-gray-600 hover:text-gray-700'
                  }
                `}
                title={chartTypeOptions.find((o) => o.value === value)?.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Metrics Filter */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                rounded-xl ${isDarkMode ? 'hover:bg-dark-sage-accent/10' : 'hover:bg-sage-green/10'}
              `}
            >
              <Filter className="w-4 h-4 mr-2" />
              Metrics
            </Button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`
                    absolute top-12 right-0 z-20 p-4 rounded-2xl border shadow-lg min-w-48
                    ${isDarkMode ? 'glass-2-dark border-dark-olive-border' : 'glass-2 border-sage-green/20'}
                  `}
                >
                  <div className="space-y-2">
                    {availableMetrics.map((metric) => (
                      <label
                        key={metric.key}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMetrics.includes(metric.key)}
                          onChange={() => handleMetricToggle(metric.key)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: metric.color }}
                          />
                          <span
                            className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
                          >
                            {metric.label}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => onTimeRangeChange?.(e.target.value)}
            className={`
              px-3 py-2 rounded-xl border text-sm touch-target-sm
              ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }
            `}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="rounded-xl p-2 touch-target-sm"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>

            {enableExport && (
              <Button
                variant="ghost"
                onClick={() => onExport?.(chartData, chartType)}
                className="rounded-xl p-2 touch-target-sm"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-xl p-2 touch-target-sm"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <motion.div
        className="relative"
        style={{ height: `${height}px` }}
        animate={isFullscreen ? { height: '80vh' } : {}}
        transition={{ duration: 0.3 }}
      >
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BarChart3
                className={`w-12 h-12 mx-auto mb-4 opacity-40 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              />
              <p
                className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                No data available for the selected time range
              </p>
            </div>
          </div>
        ) : (
          renderChart()
        )}
      </motion.div>

      {/* Summary Stats */}
      {filteredData.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          {selectedMetrics.map((metric) => {
            const metricData = availableMetrics.find((m) => m.key === metric);
            const total = filteredData.reduce(
              (sum, item) => sum + (item[metric] || 0),
              0
            );
            const average = total / filteredData.length;

            return (
              <div key={metric} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: metricData?.color }}
                  />
                  <span
                    className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {metricData?.label}
                  </span>
                </div>
                <p
                  className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  {metric.includes('revenue')
                    ? `$${Math.round(average).toLocaleString()}`
                    : Math.round(average).toLocaleString()}
                </p>
                <p
                  className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
                >
                  Avg per day
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default BusinessMetricsChart;
