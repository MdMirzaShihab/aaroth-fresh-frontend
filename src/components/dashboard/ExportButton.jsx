import React, { useState } from 'react';
import {
  Download,
  FileText,
  Database,
  FileSpreadsheet,
  ChevronDown,
  Loader,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import {
  exportDashboardDataToCSV,
  generateDashboardPDFReport,
  exportToJSON,
  getAvailableExportFormats,
  exportWithProgress,
} from '../../utils/exportUtils';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * Export Button Component
 * Provides data export functionality with multiple format support
 */
const ExportButton = ({
  data,
  type = 'generic',
  filename,
  className = '',
  variant = 'outline',
  size = 'default',
  showLabel = true,
  formats = ['csv', 'pdf', 'json'],
  onExportStart,
  onExportComplete,
  onExportError,
}) => {
  const { user } = useSelector(selectAuth);
  const { showSuccess, showError, showWarning } = useNotifications();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({
    progress: 0,
    message: '',
  });

  const availableFormats = getAvailableExportFormats().filter((format) =>
    formats.includes(format.value)
  );

  const getFormatIcon = (format) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'json':
        return <Database className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const handleExport = async (format) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      showWarning('No data available to export');
      return;
    }

    setIsExporting(true);
    setIsDropdownOpen(false);
    onExportStart?.(format);

    try {
      const exportFilename =
        filename ||
        `${user?.role || 'user'}_${type}_${new Date().toISOString().split('T')[0]}`;

      switch (format) {
        case 'csv':
          await exportWithProgress(
            data,
            'csv',
            exportFilename,
            (progress, message) => setExportProgress({ progress, message })
          );
          exportDashboardDataToCSV(data, type, user?.role || 'user');
          break;

        case 'pdf':
          await exportWithProgress(
            data,
            'pdf',
            exportFilename,
            (progress, message) => setExportProgress({ progress, message })
          );
          await generateDashboardPDFReport(data, type, user?.role || 'user');
          break;

        case 'json':
          await exportWithProgress(
            data,
            'json',
            exportFilename,
            (progress, message) => setExportProgress({ progress, message })
          );
          exportToJSON(data, exportFilename);
          break;

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      showSuccess(
        `Data exported successfully as ${format.toUpperCase()}`,
        'Export Complete'
      );
      onExportComplete?.(format);
    } catch (error) {
      console.error('Export failed:', error);
      showError(
        error.message || 'Export failed. Please try again.',
        'Export Error'
      );
      onExportError?.(error, format);
    } finally {
      setIsExporting(false);
      setExportProgress({ progress: 0, message: '' });
    }
  };

  const buttonVariants = {
    primary: 'bg-gradient-primary text-white hover:shadow-lg',
    secondary: 'bg-gradient-secondary text-white hover:shadow-lg',
    outline: 'border border-gray-300 dark:border-gray-600 text-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700',
    ghost: 'text-text-muted dark:text-gray-300 hover:text-text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700',
  };

  const sizeVariants = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const buttonClasses = `
    relative inline-flex items-center gap-2 font-medium rounded-2xl transition-all duration-200 
    ${buttonVariants[variant]} 
    ${sizeVariants[size]} 
    ${isExporting ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `;

  // Single format - direct export
  if (availableFormats.length === 1) {
    const format = availableFormats[0];

    return (
      <button
        onClick={() => handleExport(format.value)}
        disabled={isExporting}
        className={buttonClasses}
        title={`Export as ${format.label}`}
      >
        {isExporting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {showLabel && (
              <span>
                {exportProgress.message || 'Exporting...'}
                {exportProgress.progress > 0 && (
                  <span className="ml-1">({exportProgress.progress}%)</span>
                )}
              </span>
            )}
          </>
        ) : (
          <>
            {getFormatIcon(format.value)}
            {showLabel && <span>Export {format.label}</span>}
          </>
        )}
      </button>
    );
  }

  // Multiple formats - dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting}
        className={buttonClasses}
        title="Export data"
      >
        {isExporting ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            {showLabel && (
              <span>
                {exportProgress.message || 'Exporting...'}
                {exportProgress.progress > 0 && (
                  <span className="ml-1">({exportProgress.progress}%)</span>
                )}
              </span>
            )}
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            {showLabel && <span>Export</span>}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && !isExporting && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-text-muted dark:text-gray-300 uppercase tracking-wide border-b border-gray-100 dark:border-gray-600 mb-2">
                Export Options
              </div>

              {availableFormats.map((format) => (
                <button
                  key={format.value}
                  onClick={() => handleExport(format.value)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-text-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                >
                  {getFormatIcon(format.value)}
                  <div className="flex-1">
                    <div className="font-medium">{format.label}</div>
                    <div className="text-xs text-text-muted dark:text-gray-300">
                      {format.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 text-xs text-text-muted dark:text-gray-300">
              {data && Array.isArray(data)
                ? `${data.length} records ready for export`
                : 'Dashboard data ready for export'}
            </div>
          </div>
        </>
      )}

      {/* Progress Overlay */}
      {isExporting && exportProgress.progress > 0 && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-bottle-green border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-xs text-text-muted dark:text-gray-300">
              {exportProgress.message}
            </div>
            {exportProgress.progress > 0 && (
              <div className="text-xs font-medium text-bottle-green">
                {exportProgress.progress}%
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Export Modal Component for advanced options
export const ExportModal = ({
  isOpen,
  onClose,
  data,
  type,
  title = 'Export Data',
}) => {
  const { user } = useSelector(selectAuth);
  const { showSuccess, showError } = useNotifications();

  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const handleAdvancedExport = async () => {
    setIsExporting(true);

    try {
      let filteredData = data;

      // Apply date range filter if applicable
      if (dateRange !== 'all' && Array.isArray(data)) {
        const now = new Date();
        const filterDate = new Date();

        switch (dateRange) {
          case 'week':
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            filterDate.setMonth(now.getMonth() - 3);
            break;
        }

        filteredData = data.filter(
          (item) => item.createdAt && new Date(item.createdAt) >= filterDate
        );
      }

      const filename = `${user?.role || 'user'}_${type}_${dateRange}_${new Date().toISOString().split('T')[0]}`;

      switch (selectedFormat) {
        case 'csv':
          exportDashboardDataToCSV(filteredData, type, user?.role || 'user');
          break;
        case 'pdf':
          await generateDashboardPDFReport(
            filteredData,
            type,
            user?.role || 'user'
          );
          break;
        case 'json':
          exportToJSON(filteredData, filename);
          break;
      }

      showSuccess(
        `Data exported successfully as ${selectedFormat.toUpperCase()}`,
        'Export Complete'
      );
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      showError(
        error.message || 'Export failed. Please try again.',
        'Export Error'
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-semibold text-text-dark dark:text-white mb-4">{title}</h2>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Export Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-bottle-green focus:border-bottle-green"
            >
              <option value="csv">CSV (Spreadsheet)</option>
              <option value="pdf">PDF (Report)</option>
              <option value="json">JSON (Data Backup)</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:ring-2 focus:ring-bottle-green focus:border-bottle-green"
            >
              <option value="all">All Time</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
            </select>
          </div>

          {/* Options */}
          {selectedFormat === 'csv' && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded text-bottle-green focus:ring-bottle-green"
                />
                <span className="text-sm text-text-dark dark:text-white">
                  Include column headers
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-text-dark dark:text-white dark:bg-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            disabled={isExporting}
          >
            Cancel
          </button>
          <button
            onClick={handleAdvancedExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-gradient-primary text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportButton;
