import React, { useMemo, memo } from 'react';
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * BarChart Component
 *
 * Professional bar chart for category comparisons and performance metrics
 * Supports horizontal/vertical bars, multiple datasets, and custom styling
 */
const BarChart = ({
  data = [],
  datasets = [],
  title,
  xAxisKey = 'category',
  yAxisKey = 'value',
  height = 400,
  horizontal = false,
  showGrid = true,
  showLegend = true,
  responsive = true,
  maintainAspectRatio = false,
  formatTooltip,
  formatYAxis,
  barThickness,
  maxBarThickness = 60,
  colors = [
    '#3b82f6', // Primary blue
    '#10b981', // Success green
    '#f59e0b', // Warning orange
    '#8b5cf6', // Purple
    '#ef4444', // Error red
  ],
}) => {
  // Process chart data
  const chartData = useMemo(() => {
    if (datasets.length > 0) {
      // Use provided datasets
      return {
        labels: data.map((item) => item[xAxisKey]),
        datasets: datasets.map((dataset, index) => ({
          label: dataset.label,
          data: data.map((item) => item[dataset.key] || 0),
          backgroundColor: dataset.color || colors[index % colors.length],
          borderColor:
            dataset.borderColor ||
            dataset.color ||
            colors[index % colors.length],
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: dataset.barThickness || barThickness,
          maxBarThickness: dataset.maxBarThickness || maxBarThickness,
          ...dataset.style,
        })),
      };
    } else {
      // Single dataset from data
      return {
        labels: data.map((item) => item[xAxisKey]),
        datasets: [
          {
            label: title || 'Value',
            data: data.map((item) => item[yAxisKey] || 0),
            backgroundColor: colors[0],
            borderColor: colors[0],
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            barThickness,
            maxBarThickness,
          },
        ],
      };
    }
  }, [
    data,
    datasets,
    xAxisKey,
    yAxisKey,
    title,
    barThickness,
    maxBarThickness,
    colors,
  ]);

  // Chart options
  const options = useMemo(
    () => ({
      responsive,
      maintainAspectRatio,
      indexAxis: horizontal ? 'y' : 'x',
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: showLegend,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500',
            },
            color: '#374151',
          },
        },
        tooltip: {
          backgroundColor: '#ffffff',
          titleColor: '#1f2937',
          bodyColor: '#6b7280',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 12,
          displayColors: true,
          usePointStyle: true,
          callbacks: {
            title: (context) => {
              return context[0].label;
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = formatTooltip
                ? formatTooltip(context.parsed[horizontal ? 'x' : 'y'])
                : context.parsed[horizontal ? 'x' : 'y'].toLocaleString();
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: horizontal ? showGrid : false,
            color: '#f3f4f6',
            drawBorder: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11,
            },
            callback: (value) => {
              if (horizontal) {
                return formatYAxis
                  ? formatYAxis(value)
                  : value.toLocaleString();
              }
              return chartData.labels[value] || value;
            },
            maxRotation: 45,
            minRotation: 0,
          },
          border: {
            display: false,
          },
        },
        y: {
          display: true,
          grid: {
            display: horizontal ? false : showGrid,
            color: '#f3f4f6',
            drawBorder: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11,
            },
            callback: (value) => {
              if (horizontal) {
                return chartData.labels[value] || value;
              }
              return formatYAxis ? formatYAxis(value) : value.toLocaleString();
            },
          },
          border: {
            display: false,
          },
        },
      },
      elements: {
        bar: {
          borderRadius: {
            topLeft: 8,
            topRight: 8,
            bottomLeft: horizontal ? 8 : 0,
            bottomRight: horizontal ? 8 : 0,
          },
        },
      },
    }),
    [
      showGrid,
      showLegend,
      horizontal,
      responsive,
      maintainAspectRatio,
      formatTooltip,
      formatYAxis,
      chartData.labels,
    ]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default memo(BarChart);
