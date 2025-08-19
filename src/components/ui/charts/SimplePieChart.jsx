import React from 'react';

const SimplePieChart = ({
  data,
  size = 200,
  colors = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
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

  const total = validData.reduce((sum, item) => sum + item.value, 0);

  // Handle edge case where total is 0
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        No data to display (total is 0)
      </div>
    );
  }
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = -90; // Start from top

  const slices = validData.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;

    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    currentAngle += angle;

    return {
      ...item,
      pathData,
      color: colors[index % colors.length],
      percentage: percentage.toFixed(1),
      midAngle: startAngle + (endAngle - startAngle) / 2,
    };
  });

  return (
    <div className="flex items-center gap-6">
      {/* Pie Chart */}
      <div>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.pathData}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer drop-shadow-sm"
            >
              <title>{`${slice.label}: ${slice.value.toLocaleString()} (${slice.percentage}%)`}</title>
            </path>
          ))}

          {/* Center circle for donut effect */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius * 0.5}
            fill="white"
            className="drop-shadow-sm"
          />

          {/* Total in center */}
          <text
            x={centerX}
            y={centerY - 5}
            textAnchor="middle"
            className="text-lg font-semibold fill-current text-text-dark"
          >
            {total.toLocaleString()}
          </text>
          <text
            x={centerX}
            y={centerY + 15}
            textAnchor="middle"
            className="text-xs fill-current text-text-muted"
          >
            Total
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {slices.map((slice, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-dark dark:text-white truncate">
                {slice.label}
              </p>
              <p className="text-xs text-text-muted">
                {slice.value.toLocaleString()} ({slice.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePieChart;
