import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils';

/**
 * KPICard Component
 *
 * Professional KPI display card with trend indicators and loading states
 * Supports currency, number, and percentage formatting
 */
const KPICard = ({
  title,
  value,
  change,
  format = 'number',
  trend = 'neutral',
  loading = false,
  onClick,
  icon: Icon,
  color = 'bg-gradient-primary',
  textColor = 'text-white',
  subtitle,
  className = '',
}) => {
  // Format value based on specified format
  const formatValue = (val) => {
    if (loading || val === null || val === undefined) return '--';

    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percentage':
        return formatPercentage(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  // Get trend styling
  const getTrendStyle = () => {
    switch (trend) {
      case 'up':
        return 'text-sage-green';
      case 'down':
        return 'text-tomato-red';
      case 'neutral':
      default:
        return 'text-text-muted';
    }
  };

  // Get trend icon
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'neutral':
      default:
        return Minus;
    }
  };

  const TrendIcon = getTrendIcon();

  return (
    <div
      className={`glass rounded-3xl p-4 sm:p-6 hover:shadow-soft transition-all duration-200 touch-target ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        {/* Icon */}
        {Icon && (
          <div className={`${color} p-2.5 sm:p-3 rounded-2xl`}>
            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${textColor}`} />
          </div>
        )}

        {/* Trend Indicator */}
        {change !== undefined && change !== null && !loading && (
          <div
            className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${getTrendStyle()}`}
          >
            <TrendIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">
              {formatPercentage(Math.abs(change))}
            </span>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="space-y-1.5 sm:space-y-2">
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
            <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse w-3/4"></div>
          </div>
        ) : (
          <>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-dark dark:text-white leading-tight">
              {formatValue(value)}
            </p>
            <div className="space-y-0.5 sm:space-y-1">
              <p className="text-text-muted dark:text-gray-300 text-xs sm:text-sm font-medium leading-tight">
                {title}
              </p>
              {subtitle && (
                <p className="text-text-muted/70 dark:text-gray-400 text-xs leading-tight">
                  {subtitle}
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {typeof value === 'number' && format === 'percentage' && !loading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                trend === 'up'
                  ? 'bg-sage-green'
                  : trend === 'down'
                    ? 'bg-tomato-red'
                    : 'bg-muted-olive'
              }`}
              style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;
