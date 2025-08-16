import React from 'react';

const SimpleLineChart = ({ data, height = 200, color = '#0EA5E9' }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-text-muted">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const padding = 40;
  const chartWidth = 400;
  const chartHeight = height - padding * 2;

  const points = data.map((point, index) => {
    const x =
      padding + (index / (data.length - 1)) * (chartWidth - padding * 2);
    const y = padding + ((maxValue - point.value) / range) * chartHeight;
    return { x, y, ...point };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

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
            id="grid"
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
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />

        {/* Y-axis labels */}
        <g className="text-xs fill-current text-text-muted">
          <text x={10} y={padding + 5} textAnchor="start">
            {maxValue.toLocaleString()}
          </text>
          <text x={10} y={height - padding + 5} textAnchor="start">
            {minValue.toLocaleString()}
          </text>
        </g>

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="white"
              stroke={color}
              strokeWidth="3"
              className="drop-shadow-sm"
            />
            {/* Tooltip on hover */}
            <circle
              cx={point.x}
              cy={point.y}
              r="12"
              fill="transparent"
              className="hover:fill-black hover:fill-opacity-10 cursor-pointer"
            >
              <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
            </circle>
          </g>
        ))}

        {/* X-axis labels */}
        <g className="text-xs fill-current text-text-muted">
          {points.map(
            (point, index) =>
              index % Math.ceil(points.length / 6) === 0 && (
                <text
                  key={index}
                  x={point.x}
                  y={height - 10}
                  textAnchor="middle"
                >
                  {point.label}
                </text>
              )
          )}
        </g>
      </svg>
    </div>
  );
};

export default SimpleLineChart;
