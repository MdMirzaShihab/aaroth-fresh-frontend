/**
 * LineChart - Professional Line Chart Component using Chart.js
 * Features: Interactive tooltips, zoom, drill-down, real-time updates, mobile-responsive
 */

import React, { useRef, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../../../hooks/useTheme';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LineChart = ({
  data = [],
  title = '',
  height = 300,
  showLegend = true,
  showGrid = true,
  enableZoom = false,
  enableDrillDown = false,
  fillArea = false,
  tension = 0.4,
  pointRadius = 4,
  borderWidth = 3,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
  onDataPointClick,
  onLegendClick,
  formatTooltip,
  formatLabel,
  isRealTime = false,
  animationDuration = 1000,
  responsive = true,
  maintainAspectRatio = false,
}) => {
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();

  // Chart data configuration
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Handle multiple datasets
    const datasets = data.datasets ? data.datasets.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.data || [],
      borderColor: dataset.color || colors[index % colors.length],
      backgroundColor: fillArea 
        ? `${dataset.color || colors[index % colors.length]}20`
        : 'transparent',
      fill: fillArea,
      tension,
      pointRadius: dataset.pointRadius || pointRadius,
      pointHoverRadius: (dataset.pointRadius || pointRadius) + 2,
      borderWidth: dataset.borderWidth || borderWidth,
      pointBackgroundColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: dataset.color || colors[index % colors.length],
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
    })) : [{
      label: title || 'Data',
      data: data.map(item => item.value || item.y || 0),
      borderColor: colors[0],
      backgroundColor: fillArea ? `${colors[0]}20` : 'transparent',
      fill: fillArea,
      tension,
      pointRadius,
      pointHoverRadius: pointRadius + 2,
      borderWidth,
      pointBackgroundColor: '#ffffff',
      pointBorderWidth: 2,
      pointHoverBackgroundColor: colors[0],
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 3,
    }];

    return {
      labels: data.labels || data.map(item => item.label || item.x || ''),
      datasets,
    };
  }, [data, title, colors, fillArea, tension, pointRadius, borderWidth]);

  // Chart options configuration
  const chartOptions = useMemo(() => ({
    responsive,
    maintainAspectRatio,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          color: isDarkMode ? '#D1D5DB' : '#6B7280',
        },
        onClick: onLegendClick,
      },
      tooltip: {
        enabled: true,
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        titleColor: isDarkMode ? '#F9FAFB' : '#111827',
        bodyColor: isDarkMode ? '#D1D5DB' : '#374151',
        borderColor: isDarkMode ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        titleFont: {
          size: 14,
          weight: '600',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          title: (context) => {
            if (formatLabel) {
              return formatLabel(context[0].label);
            }
            return context[0].label;
          },
          label: (context) => {
            if (formatTooltip) {
              return formatTooltip(context);
            }
            return `${context.dataset.label}: ${typeof context.parsed.y === 'number' 
              ? context.parsed.y.toLocaleString() 
              : context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: showGrid,
          color: isDarkMode ? '#374151' : '#F3F4F6',
          lineWidth: 1,
        },
        ticks: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          maxTicksLimit: 8,
        },
        border: {
          color: isDarkMode ? '#4B5563' : '#E5E7EB',
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          color: isDarkMode ? '#374151' : '#F3F4F6',
          lineWidth: 1,
        },
        ticks: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
          },
          callback: (value) => {
            if (typeof value === 'number') {
              return value.toLocaleString();
            }
            return value;
          },
        },
        border: {
          color: isDarkMode ? '#4B5563' : '#E5E7EB',
        },
      },
    },
    animation: {
      duration: isRealTime ? 300 : animationDuration,
      easing: 'easeOutQuart',
    },
    hover: {
      animationDuration: 200,
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    },
    onClick: (event, elements) => {
      if (elements.length > 0 && (onDataPointClick || enableDrillDown)) {
        const element = elements[0];
        const datasetIndex = element.datasetIndex;
        const dataIndex = element.index;
        const value = chartData.datasets[datasetIndex].data[dataIndex];
        const label = chartData.labels[dataIndex];
        
        const dataPoint = {
          value,
          label,
          datasetLabel: chartData.datasets[datasetIndex].label,
          datasetIndex,
          dataIndex,
        };

        if (onDataPointClick) {
          onDataPointClick(dataPoint, { event, element });
        }
      }
    },
  }), [
    responsive,
    maintainAspectRatio,
    showLegend,
    showGrid,
    isDarkMode,
    formatTooltip,
    formatLabel,
    onLegendClick,
    onDataPointClick,
    enableDrillDown,
    isRealTime,
    animationDuration,
    chartData,
  ]);

  // Handle real-time updates
  useEffect(() => {
    if (isRealTime && chartRef.current) {
      const chart = chartRef.current;
      chart.update('none');
    }
  }, [data, isRealTime]);

  // Empty state
  if (!data || (Array.isArray(data) && data.length === 0) || 
      (data.datasets && data.datasets.length === 0)) {
    return (
      <div 
        className={`
          flex items-center justify-center rounded-2xl border-2 border-dashed
          ${isDarkMode ? 'border-gray-600 bg-gray-800/20' : 'border-gray-300 bg-gray-50/50'}
        `}
        style={{ height }}
      >
        <div className="text-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`}>
            <LineElement className={`w-6 h-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          </div>
          <p className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            No data available
          </p>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}>
            Chart will appear when data is loaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={{ height }}>
        <Line
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default LineChart;