import React, { useMemo, memo } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * DoughnutChart Component
 *
 * Professional doughnut chart for status distribution and percentage breakdowns
 * Supports custom center text, legend positioning, and hover effects
 */
const DoughnutChart = ({
  data = [],
  title,
  labelKey = 'label',
  valueKey = 'value',
  height = 400,
  showLegend = true,
  legendPosition = 'right',
  responsive = true,
  maintainAspectRatio = false,
  formatTooltip,
  centerText,
  centerValue,
  cutout = '60%',
  colors = [
    '#3b82f6', // Primary blue
    '#10b981', // Success green
    '#f59e0b', // Warning orange
    '#8b5cf6', // Purple
    '#ef4444', // Error red
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
  ],
}) => {
  // Process chart data
  const chartData = useMemo(() => {
    const labels = data.map((item) => item[labelKey]);
    const values = data.map((item) => item[valueKey] || 0);
    const backgroundColors = data.map(
      (item, index) => item.color || colors[index % colors.length]
    );
    const borderColors = backgroundColors.map((color) => color);

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8,
        },
      ],
    };
  }, [data, labelKey, valueKey, colors]);

  // Calculate total for center text
  const total = useMemo(() => {
    return data.reduce((sum, item) => sum + (item[valueKey] || 0), 0);
  }, [data, valueKey]);

  // Chart options with center text plugin
  const options = useMemo(
    () => ({
      responsive,
      maintainAspectRatio,
      cutout,
      plugins: {
        legend: {
          display: showLegend,
          position: legendPosition,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: '500',
            },
            color: '#374151',
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const percentage =
                    total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  return {
                    text: `${label} (${percentage}%)`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor[i],
                    lineWidth: dataset.borderWidth,
                    pointStyle: 'circle',
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
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
            label: (context) => {
              const label = context.label || '';
              const value = context.parsed;
              const percentage =
                total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              const formattedValue = formatTooltip
                ? formatTooltip(value)
                : value.toLocaleString();
              return `${label}: ${formattedValue} (${percentage}%)`;
            },
          },
        },
      },
      elements: {
        arc: {
          borderRadius: 4,
        },
      },
    }),
    [
      showLegend,
      legendPosition,
      responsive,
      maintainAspectRatio,
      cutout,
      formatTooltip,
      total,
    ]
  );

  // Center text plugin
  const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
      if (!centerText && !centerValue) return;

      const {
        ctx,
        chartArea: { top, width, height },
      } = chart;
      ctx.restore();

      const centerX = width / 2;
      const centerY = top + height / 2;

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (centerValue) {
        ctx.font = 'bold 24px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#1f2937';
        ctx.fillText(centerValue, centerX, centerY - 10);
      }

      if (centerText) {
        ctx.font = '14px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#6b7280';
        ctx.fillText(centerText, centerX, centerY + (centerValue ? 20 : 0));
      }

      ctx.save();
    },
  };

  return (
    <div
      style={{ height: `${height}px` }}
      className="flex items-center justify-center"
    >
      <Doughnut
        data={chartData}
        options={options}
        plugins={[centerTextPlugin]}
      />
    </div>
  );
};

export default memo(DoughnutChart);
