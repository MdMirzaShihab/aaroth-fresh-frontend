/**
 * PieChart - Professional Pie Chart Component using Chart.js
 * Features: Interactive segments, drill-down, animations, mobile-responsive
 */

import React, { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../../../hooks/useTheme';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const PieChart = ({
  data = [],
  title = '',
  height = 300,
  showLegend = true,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'],
  onSegmentClick,
  onLegendClick,
  formatTooltip,
  formatLabel,
  isRealTime = false,
  animationDuration = 1000,
  responsive = true,
  maintainAspectRatio = false,
  cutout = 0, // For doughnut chart, set to 50-70
  borderWidth = 2,
  hoverBorderWidth = 4,
  spacing = 2,
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

    const labels = data.map(item => item.label || item.name || '');
    const values = data.map(item => item.value || item.y || 0);
    const backgroundColors = data.map((item, index) => 
      item.color || colors[index % colors.length]
    );
    const borderColors = backgroundColors.map(color => color);
    const hoverBackgroundColors = backgroundColors.map(color => `${color}CC`);

    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: backgroundColors,
        borderColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderWidth,
        hoverBackgroundColor: hoverBackgroundColors,
        hoverBorderColor: borderColors,
        hoverBorderWidth,
        spacing,
      }],
    };
  }, [data, colors, isDarkMode, borderWidth, hoverBorderWidth, spacing]);

  // Chart options configuration
  const chartOptions = useMemo(() => ({
    responsive,
    maintainAspectRatio,
    cutout: `${cutout}%`,
    interaction: {
      intersect: false,
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        align: 'start',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          color: isDarkMode ? '#D1D5DB' : '#6B7280',
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            if (datasets.length > 0) {
              const dataset = datasets[0];
              return chart.data.labels.map((label, index) => {
                const value = dataset.data[index];
                const total = dataset.data.reduce((sum, val) => sum + val, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[index],
                  strokeStyle: dataset.borderColor,
                  lineWidth: dataset.borderWidth,
                  hidden: false,
                  index,
                };
              });
            }
            return [];
          },
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
            
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            
            return `${context.label}: ${typeof value === 'number' 
              ? value.toLocaleString() 
              : value} (${percentage}%)`;
          },
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
      if (elements.length > 0 && onSegmentClick) {
        const element = elements[0];
        const dataIndex = element.index;
        const value = chartData.datasets[0].data[dataIndex];
        const label = chartData.labels[dataIndex];
        const total = chartData.datasets[0].data.reduce((sum, val) => sum + val, 0);
        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
        
        const segment = {
          value,
          label,
          percentage,
          dataIndex,
          color: chartData.datasets[0].backgroundColor[dataIndex],
        };

        onSegmentClick(segment, { event, element });
      }
    },
  }), [
    responsive,
    maintainAspectRatio,
    orientation,
    cutout,
    showLegend,
    isDarkMode,
    formatTooltip,
    formatLabel,
    onLegendClick,
    onSegmentClick,
    isRealTime,
    animationDuration,
    chartData,
  ]);

  // Empty state
  if (!data || data.length === 0) {
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
            <ArcElement className={`w-6 h-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
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
        <Pie
          ref={chartRef}
          data={chartData}
          options={chartOptions}
        />
      </div>
    </div>
  );
};

export default PieChart;