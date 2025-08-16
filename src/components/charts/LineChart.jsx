import React, { useMemo, memo } from 'react';
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
import { format } from 'date-fns';

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

/**
 * LineChart Component
 *
 * Professional line chart for trending data (revenue, orders, spending)
 * Supports multiple datasets, gradients, and responsive design
 */
const LineChart = ({
  data = [],
  datasets = [],
  title,
  xAxisKey = 'date',
  yAxisKey = 'value',
  height = 400,
  showGrid = true,
  showLegend = true,
  curved = true,
  filled = false,
  responsive = true,
  maintainAspectRatio = false,
  formatTooltip,
  formatYAxis,
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
        labels: data.map((item) =>
          typeof item[xAxisKey] === 'string'
            ? item[xAxisKey]
            : format(new Date(item[xAxisKey]), 'MMM dd')
        ),
        datasets: datasets.map((dataset, index) => ({
          label: dataset.label,
          data: data.map((item) => item[dataset.key] || 0),
          borderColor: dataset.color || colors[index % colors.length],
          backgroundColor: dataset.color
            ? `${dataset.color}20`
            : `${colors[index % colors.length]}20`,
          fill: filled || dataset.filled,
          tension: curved ? 0.4 : 0,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
          pointBackgroundColor: dataset.color || colors[index % colors.length],
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          ...dataset.style,
        })),
      };
    } else {
      // Single dataset from data
      return {
        labels: data.map((item) =>
          typeof item[xAxisKey] === 'string'
            ? item[xAxisKey]
            : format(new Date(item[xAxisKey]), 'MMM dd')
        ),
        datasets: [
          {
            label: title || 'Value',
            data: data.map((item) => item[yAxisKey] || 0),
            borderColor: colors[0],
            backgroundColor: `${colors[0]}20`,
            fill: filled,
            tension: curved ? 0.4 : 0,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
            pointBackgroundColor: colors[0],
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      };
    }
  }, [data, datasets, xAxisKey, yAxisKey, title, curved, filled, colors]);

  // Chart options
  const options = useMemo(
    () => ({
      responsive,
      maintainAspectRatio,
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
              const label = context[0].label;
              return label;
            },
            label: (context) => {
              const label = context.dataset.label || '';
              const value = formatTooltip
                ? formatTooltip(context.parsed.y)
                : context.parsed.y.toLocaleString();
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          grid: {
            display: showGrid,
            color: '#f3f4f6',
            drawBorder: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11,
            },
            maxTicksLimit: 8,
          },
          border: {
            display: false,
          },
        },
        y: {
          display: true,
          grid: {
            display: showGrid,
            color: '#f3f4f6',
            drawBorder: false,
          },
          ticks: {
            color: '#9ca3af',
            font: {
              size: 11,
            },
            callback: (value) => {
              return formatYAxis ? formatYAxis(value) : value.toLocaleString();
            },
          },
          border: {
            display: false,
          },
        },
      },
      elements: {
        point: {
          hoverBorderWidth: 3,
        },
      },
    }),
    [
      showGrid,
      showLegend,
      responsive,
      maintainAspectRatio,
      formatTooltip,
      formatYAxis,
    ]
  );

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default memo(LineChart);
