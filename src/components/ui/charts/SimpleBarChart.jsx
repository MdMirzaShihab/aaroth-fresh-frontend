import React from 'react';

const SimpleBarChart = ({
  data,
  height = 200,
  colors = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'],
}) => {
  // Validate data
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        No data available
      </div>
    );
  }

  // Filter out invalid data and ensure numeric values
  const validData = data.filter(
    (item) =>
      item &&
      typeof item.value === 'number' &&
      !isNaN(item.value) &&
      isFinite(item.value) &&
      item.value >= 0 &&
      item.label
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        No valid data available
      </div>
    );
  }

  const maxValue = Math.max(...validData.map((d) => d.value));

  // Handle edge case where maxValue is 0 or invalid
  if (maxValue === 0 || !isFinite(maxValue)) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        No data to display
      </div>
    );
  }
  const padding = 40;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;
  const barWidth = ((chartWidth - padding * 2) / validData.length) * 0.8;
  const barSpacing = ((chartWidth - padding * 2) / validData.length) * 0.2;

  return (
    <div className="w-full">
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="bar-grid"
            width="40"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 30"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bar-grid)" opacity="0.3" />

        {/* Y-axis labels */}
        <g className="text-xs fill-current text-text-muted">
          <text x={10} y={padding + 5} textAnchor="start">
            {maxValue.toLocaleString()}
          </text>
          <text x={10} y={height - padding + 5} textAnchor="start">
            0
          </text>
        </g>

        {/* Bars */}
        {validData.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
          const y = height - padding - barHeight;
          const color = colors[index % colors.length];

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="4"
                ry="4"
                className="drop-shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
              >
                <title>{`${item.label}: ${item.value.toLocaleString()}`}</title>
              </rect>

              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                className="text-xs fill-current text-text-dark font-medium"
              >
                {item.value.toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        <g className="text-xs fill-current text-text-muted">
          {validData.map((item, index) => {
            const x =
              padding +
              index * (barWidth + barSpacing) +
              barSpacing / 2 +
              barWidth / 2;
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="max-w-16 truncate"
              >
                {item.label}
              </text>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default SimpleBarChart;
