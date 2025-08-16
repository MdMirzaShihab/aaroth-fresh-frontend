// Chart Components
export { default as LineChart } from './LineChart';
export { default as BarChart } from './BarChart';
export { default as DoughnutChart } from './DoughnutChart';

// Chart utilities and configurations
export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  purple: '#8b5cf6',
  error: '#ef4444',
  cyan: '#06b6d4',
  lime: '#84cc16',
  orange: '#f97316',
};

export const CHART_DEFAULTS = {
  height: 400,
  responsive: true,
  maintainAspectRatio: false,
  showGrid: true,
  showLegend: true,
};

// Common chart configurations
export const chartConfigs = {
  revenue: {
    colors: [CHART_COLORS.primary, CHART_COLORS.success],
    curved: true,
    filled: true,
  },
  orders: {
    colors: [CHART_COLORS.success, CHART_COLORS.warning],
    curved: false,
    filled: false,
  },
  categories: {
    colors: Object.values(CHART_COLORS),
    horizontal: false,
  },
  status: {
    colors: [
      CHART_COLORS.success, // Delivered
      CHART_COLORS.warning, // Processing
      CHART_COLORS.primary, // Confirmed
      CHART_COLORS.error, // Cancelled
    ],
    cutout: '60%',
  },
};
