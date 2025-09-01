/**
 * BarChart - Professional Bar Chart Component using Chart.js
 * Features: Interactive tooltips, drill-down, animations, mobile-responsive
 */

import React, { useRef, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
// Theme now handled via CSS classes - no React state needed

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({
  data = [],
  title = '',
  height = 300,
  showLegend = true,
  showGrid = true,
  orientation = 'vertical', // vertical or horizontal
  stacked = false,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
  onDataPointClick,
  onLegendClick,
  formatTooltip,
  formatLabel,
  isRealTime = false,
  animationDuration = 800,
  responsive = true,
  maintainAspectRatio = false,
  barThickness,
  maxBarThickness = 60,
  borderRadius = 8,
}) => {
  const chartRef = useRef(null);
  
  // Detect dark mode from DOM instead of React state
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Chart data configuration
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }

    // Handle multiple datasets
    const datasets = data.datasets
      ? data.datasets.map((dataset, index) => ({
          label: dataset.label || `Dataset ${index + 1}`,
          data: dataset.data || [],
          backgroundColor: dataset.color || colors[index % colors.length],
          borderColor:
            dataset.borderColor ||
            dataset.color ||
            colors[index % colors.length],
          borderWidth: 2,
          borderRadius,
          borderSkipped: false,
          barThickness: dataset.barThickness || barThickness,
          maxBarThickness: dataset.maxBarThickness || maxBarThickness,
          hoverBackgroundColor:
            dataset.hoverColor ||
            `${dataset.color || colors[index % colors.length]}CC`,
          hoverBorderColor: dataset.color || colors[index % colors.length],
          hoverBorderWidth: 3,
        }))
      : [
          {
            label: title || 'Data',
            data: data.map((item) => item.value || item.y || 0),
            backgroundColor: colors[0],
            borderColor: colors[0],
            borderWidth: 2,
            borderRadius,
            borderSkipped: false,
            barThickness,
            maxBarThickness,
            hoverBackgroundColor: `${colors[0]}CC`,
            hoverBorderColor: colors[0],
            hoverBorderWidth: 3,
          },
        ];

    return {
      labels: data.labels || data.map((item) => item.label || item.x || ''),
      datasets,
    };
  }, [data, title, colors, borderRadius, barThickness, maxBarThickness]);

  // Chart options configuration
  const chartOptions = useMemo(
    () => ({
      responsive,
      maintainAspectRatio,
      indexAxis: orientation === 'horizontal' ? 'y' : 'x',
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
            pointStyle: 'rect',
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
              return `${context.dataset.label}: ${
                typeof context.parsed.y === 'number'
                  ? context.parsed.y.toLocaleString()
                  : context.parsed.y
              }`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          stacked,
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
            maxTicksLimit: orientation === 'horizontal' ? 6 : 10,
          },
          border: {
            color: isDarkMode ? '#4B5563' : '#E5E7EB',
          },
        },
        y: {
          display: true,
          stacked,
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
        event.native.target.style.cursor =
          elements.length > 0 ? 'pointer' : 'default';
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
    }),
    [
      responsive,
      maintainAspectRatio,
      orientation,
      stacked,
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
    ]
  );

  // Empty state
  if (
    !data ||
    (Array.isArray(data) && data.length === 0) ||
    (data.datasets && data.datasets.length === 0)
  ) {
    return (
      <div
        className={`
          flex items-center justify-center rounded-2xl border-2 border-dashed
          ${isDarkMode ? 'border-gray-600 bg-gray-800/20' : 'border-gray-300 bg-gray-50/50'}
        `}
        style={{ height }}
      >
        <div className="text-center">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          >
            <BarElement
              className={`w-6 h-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
            />
          </div>
          <p
            className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            No data available
          </p>
          <p
            className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}`}
          >
            Chart will appear when data is loaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={{ height }}>
        <Bar ref={chartRef} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default BarChart;
