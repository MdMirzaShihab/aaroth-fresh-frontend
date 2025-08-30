import React, { useState } from 'react';
import { Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import ExportButton from './ExportButton';

/**
 * ChartContainer Component
 *
 * Professional wrapper for charts with export, fullscreen, and refresh capabilities
 * Provides consistent styling and functionality across all chart types
 */
const ChartContainer = ({
  title,
  children,
  loading = false,
  error = null,
  onExport,
  onRefresh,
  className = '',
  height = 'h-80',
  exportFormats = ['png', 'svg', 'csv'],
  subtitle,
  actions,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    if (!onRefresh) return;
    await onRefresh();
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      className={`glass rounded-3xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-2 sm:inset-4 z-50 p-4 sm:p-8'
          : `p-4 sm:p-6 ${className}`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="min-w-0 flex-1 mr-4">
          <h3 className="text-base sm:text-lg font-semibold text-text-dark dark:text-white truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-text-muted dark:text-gray-300 text-xs sm:text-sm mt-1 leading-tight">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Custom Actions */}
          {actions}

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={handleRefresh}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 touch-target"
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4 text-text-muted dark:text-gray-300" />
            </button>
          )}

          {/* Export Button */}
          {onExport && (
            <ExportButton
              data={null} // Chart containers handle their own export logic
              type="chart"
              variant="ghost"
              size="sm"
              showLabel={false}
              formats={exportFormats}
              onExportStart={() => setIsExporting(true)}
              onExportComplete={() => setIsExporting(false)}
              onExportError={() => setIsExporting(false)}
              className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl touch-target"
            />
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 sm:p-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 touch-target"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-text-muted dark:text-gray-300" />
            ) : (
              <Maximize2 className="w-4 h-4 text-text-muted dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Chart Content */}
      <div
        className={`relative ${isFullscreen ? 'h-[calc(100vh-120px)] sm:h-[calc(100vh-200px)]' : 'h-64 sm:h-80 lg:h-96'}`}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 border-4 border-muted-olive/20 border-t-muted-olive rounded-full animate-spin"></div>
              <p className="text-text-muted dark:text-gray-300 text-xs sm:text-sm text-center">
                Loading chart data...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full p-4">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-tomato-red/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 text-tomato-red" />
              </div>
              <p className="text-text-dark dark:text-white font-medium mb-2 text-sm sm:text-base">
                Failed to load chart
              </p>
              <p className="text-text-muted dark:text-gray-300 text-xs sm:text-sm mb-4 leading-relaxed">
                {error}
              </p>
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  className="bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-200 text-sm touch-target"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-full overflow-hidden">{children}</div>
        )}
      </div>

      {/* Fullscreen Backdrop */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 -z-10"
          onClick={toggleFullscreen}
        />
      )}
    </div>
  );
};

export default ChartContainer;
