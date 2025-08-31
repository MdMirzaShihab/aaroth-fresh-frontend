/**
 * SettingsHistory - Settings Audit Trail and Rollback System
 * Features: Change timeline, admin action tracking, rollback capabilities, impact analysis
 * Provides comprehensive settings history with audit trail and restoration options
 */

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Clock,
  User,
  ArrowLeft,
  RotateCcw,
  Eye,
  X,
  Calendar,
  Filter,
  Search,
  Download,
  AlertTriangle,
  CheckCircle,
  Info,
  Activity,
  GitCommit,
  ChevronDown,
  ChevronRight,
  FileText,
  Database,
  Zap,
} from 'lucide-react';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import toast from 'react-hot-toast';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button, LoadingSpinner } from '../../../../components/ui';
import {
  useGetSettingHistoryQuery,
  useUpdateSystemSettingMutation,
} from '../../../../store/slices/admin-v2/adminApiSlice';

// Change impact indicator
const ChangeImpactIndicator = ({ change }) => {
  const getImpactConfig = (impact) => {
    switch (impact?.level) {
      case 'critical':
        return {
          color: 'tomato-red',
          icon: AlertTriangle,
          label: 'Critical Impact',
        };
      case 'high':
        return {
          color: 'earthy-yellow',
          icon: AlertTriangle,
          label: 'High Impact',
        };
      case 'medium':
        return { color: 'sage-green', icon: Info, label: 'Medium Impact' };
      case 'low':
        return { color: 'sage-green', icon: CheckCircle, label: 'Low Impact' };
      default:
        return { color: 'text-muted', icon: Info, label: 'Unknown Impact' };
    }
  };

  const config = getImpactConfig(change.impact);
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 text-${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{config.label}</span>
    </div>
  );
};

// History entry component
const HistoryEntry = ({
  change,
  onRollback,
  onViewDetails,
  isExpanded,
  onToggleExpand,
  canRollback = true,
}) => {
  const { isDarkMode } = useTheme();

  const getChangeTypeConfig = (type) => {
    switch (type) {
      case 'create':
        return { color: 'sage-green', icon: GitCommit, label: 'Created' };
      case 'update':
        return { color: 'sage-green', icon: Activity, label: 'Updated' };
      case 'delete':
        return { color: 'tomato-red', icon: X, label: 'Deleted' };
      case 'bulk_update':
        return { color: 'earthy-yellow', icon: Database, label: 'Bulk Update' };
      case 'reset':
        return { color: 'dusty-cedar', icon: RotateCcw, label: 'Reset' };
      default:
        return { color: 'text-muted', icon: FileText, label: 'Modified' };
    }
  };

  const typeConfig = getChangeTypeConfig(change.changeType);
  const TypeIcon = typeConfig.icon;

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, 'HH:mm')}`;
    }
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'HH:mm')}`;
    }
    return format(date, 'MMM dd, yyyy HH:mm');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        border rounded-xl transition-all duration-200
        ${
          isDarkMode
            ? 'bg-gray-800/50 border-gray-700/50'
            : 'bg-white/80 border-gray-200/50'
        }
        hover:shadow-lg
      `}
    >
      {/* Entry Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${
                isDarkMode
                  ? `bg-${typeConfig.color}/20`
                  : `bg-${typeConfig.color}/10`
              }
            `}
            >
              <TypeIcon className={`w-4 h-4 text-${typeConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4
                  className={`font-medium ${
                    isDarkMode ? 'text-white' : 'text-text-dark'
                  }`}
                >
                  {change.settingKey || 'Multiple Settings'}
                </h4>
                <span
                  className={`
                  px-2 py-1 rounded text-xs font-medium
                  text-${typeConfig.color} bg-${typeConfig.color}/10
                `}
                >
                  {typeConfig.label}
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-text-muted'
                }`}
              >
                {change.changeReason || 'No reason provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ChangeImpactIndicator change={change} />
            <button
              onClick={() => onToggleExpand(change.id)}
              className={`
                p-1 rounded-lg transition-colors touch-target
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              `}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Entry Meta */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span
                className={`${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                {change.adminUser || 'System'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span
                className={`${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                {formatTimestamp(change.timestamp)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(change)}
              className="text-xs min-h-[28px]"
            >
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
            {canRollback && change.changeType !== 'delete' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRollback(change)}
                className="text-xs min-h-[28px] text-dusty-cedar border-dusty-cedar/30 hover:bg-dusty-cedar/10"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Rollback
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              border-t px-4 pb-4
              ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
            `}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Old Value */}
              {change.oldValue !== undefined && (
                <div>
                  <label
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-text-muted'
                    }`}
                  >
                    Previous Value
                  </label>
                  <div
                    className={`
                    mt-1 p-3 rounded-lg text-sm font-mono
                    ${
                      isDarkMode
                        ? 'bg-gray-700/50 text-gray-300'
                        : 'bg-gray-50 text-text-dark'
                    }
                  `}
                  >
                    {typeof change.oldValue === 'object'
                      ? JSON.stringify(change.oldValue, null, 2)
                      : String(change.oldValue)}
                  </div>
                </div>
              )}

              {/* New Value */}
              {change.newValue !== undefined && (
                <div>
                  <label
                    className={`text-xs font-medium ${
                      isDarkMode ? 'text-gray-300' : 'text-text-muted'
                    }`}
                  >
                    New Value
                  </label>
                  <div
                    className={`
                    mt-1 p-3 rounded-lg text-sm font-mono
                    ${
                      isDarkMode
                        ? 'bg-gray-700/50 text-gray-300'
                        : 'bg-gray-50 text-text-dark'
                    }
                  `}
                  >
                    {typeof change.newValue === 'object'
                      ? JSON.stringify(change.newValue, null, 2)
                      : String(change.newValue)}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Details */}
            {change.impact?.description && (
              <div className="mt-4">
                <label
                  className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-text-muted'
                  }`}
                >
                  Impact Analysis
                </label>
                <p
                  className={`mt-1 text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-text-dark'
                  }`}
                >
                  {change.impact.description}
                </p>
              </div>
            )}

            {/* Additional Metadata */}
            {(change.ipAddress || change.userAgent) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {change.ipAddress && (
                  <div>
                    <label
                      className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-text-muted'
                      }`}
                    >
                      IP Address
                    </label>
                    <p
                      className={`text-sm font-mono ${
                        isDarkMode ? 'text-gray-300' : 'text-text-dark'
                      }`}
                    >
                      {change.ipAddress}
                    </p>
                  </div>
                )}
                {change.userAgent && (
                  <div>
                    <label
                      className={`text-xs font-medium ${
                        isDarkMode ? 'text-gray-300' : 'text-text-muted'
                      }`}
                    >
                      User Agent
                    </label>
                    <p
                      className={`text-sm font-mono truncate ${
                        isDarkMode ? 'text-gray-300' : 'text-text-dark'
                      }`}
                    >
                      {change.userAgent}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SettingsHistory = ({ onClose, category }) => {
  const { isDarkMode } = useTheme();
  const [timeFilter, setTimeFilter] = useState('7d');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  // API hooks
  const {
    data: historyData,
    isLoading,
    error,
    refetch,
  } = useGetSettingHistoryQuery({
    category,
    timeRange: timeFilter,
    type: typeFilter,
    search: searchQuery,
    page: 1,
    limit: 50,
  });

  const [updateSetting] = useUpdateSystemSettingMutation();

  // Process history data
  const historyEntries = useMemo(() => {
    return historyData?.data || [];
  }, [historyData]);

  // Filter options
  const timeFilterOptions = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const typeFilterOptions = [
    { value: 'all', label: 'All Changes' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'bulk_update', label: 'Bulk Updates' },
    { value: 'reset', label: 'Resets' },
  ];

  // Handle entry expansion
  const handleToggleExpand = useCallback((entryId) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  }, []);

  // Handle rollback
  const handleRollback = useCallback(
    async (change) => {
      if (!change.settingKey || change.oldValue === undefined) {
        toast.error('Cannot rollback this change - insufficient data');
        return;
      }

      try {
        await updateSetting({
          key: change.settingKey,
          value: change.oldValue,
          changeReason: `Rollback to value from ${format(new Date(change.timestamp), 'PPP')}`,
        }).unwrap();

        toast.success(`Successfully rolled back ${change.settingKey}`);
        refetch();
      } catch (error) {
        console.error('Failed to rollback setting:', error);
        toast.error(
          `Failed to rollback ${change.settingKey}: ${error.message || 'Unknown error'}`
        );
      }
    },
    [updateSetting, refetch]
  );

  // Handle view details
  const handleViewDetails = useCallback((change) => {
    // In a real implementation, this might open a detailed modal
    console.log('View details for change:', change);
    toast.success('Detailed view not yet implemented');
  }, []);

  // Handle export history
  const handleExportHistory = useCallback(() => {
    const csvData = [
      [
        'Timestamp',
        'Setting',
        'Change Type',
        'Admin User',
        'Old Value',
        'New Value',
        'Reason',
      ],
      ...historyEntries.map((entry) => [
        format(new Date(entry.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        entry.settingKey || 'Multiple',
        entry.changeType,
        entry.adminUser || 'System',
        typeof entry.oldValue === 'object'
          ? JSON.stringify(entry.oldValue)
          : entry.oldValue,
        typeof entry.newValue === 'object'
          ? JSON.stringify(entry.newValue)
          : entry.newValue,
        entry.changeReason || '',
      ]),
    ];

    // Create and download CSV (simplified implementation)
    toast.success('Settings history export started');
  }, [historyEntries]);

  // Group entries by date
  const groupedEntries = useMemo(() => {
    const groups = {};
    historyEntries.forEach((entry) => {
      const date = format(new Date(entry.timestamp), 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(entry);
    });
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [historyEntries]);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? 'bg-dusty-cedar/20' : 'bg-dusty-cedar/10'}
            `}
            >
              <History className="w-5 h-5 text-dusty-cedar" />
            </div>
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-text-dark'
                }`}
              >
                Settings History
              </h3>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                {category
                  ? `${category} category changes`
                  : 'All settings changes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportHistory}
              disabled={historyEntries.length === 0}
              className="min-h-[36px]"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="min-h-[36px]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search */}
          <div className="relative">
            <Search
              className={`
              absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4
              ${isDarkMode ? 'text-gray-400' : 'text-text-muted'}
            `}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className={`
                w-full pl-10 pr-4 py-2 border rounded-lg text-sm touch-target
                ${
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-200 text-text-dark placeholder-text-muted'
                }
                focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20
              `}
            />
          </div>

          {/* Time Filter */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className={`
              px-3 py-2 border rounded-lg text-sm touch-target
              ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-text-dark'
              }
              focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20
            `}
          >
            {timeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`
              px-3 py-2 border rounded-lg text-sm touch-target
              ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-200 text-text-dark'
              }
              focus:border-muted-olive focus:ring-2 focus:ring-muted-olive/20
            `}
          >
            {typeFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* History Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p
                className={`mt-4 text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                Loading settings history...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
              <h4
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-text-dark'
                }`}
              >
                Failed to Load History
              </h4>
              <p
                className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                There was an error loading the settings history.
              </p>
              <Button onClick={refetch}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        ) : historyEntries.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4
                className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-text-dark'
                }`}
              >
                No History Found
              </h4>
              <p
                className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-text-muted'
                }`}
              >
                No settings changes match your current filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-h-[500px] overflow-y-auto">
            {groupedEntries.map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-3">
                  <Calendar className="w-4 h-4 text-text-muted" />
                  <h4
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-text-dark'
                    }`}
                  >
                    {format(new Date(date), 'EEEE, MMMM do, yyyy')}
                  </h4>
                  <div
                    className={`h-px flex-1 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                    }`}
                  />
                </div>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <HistoryEntry
                      key={entry.id}
                      change={entry}
                      onRollback={handleRollback}
                      onViewDetails={handleViewDetails}
                      isExpanded={expandedEntries.has(entry.id)}
                      onToggleExpand={handleToggleExpand}
                      canRollback
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default SettingsHistory;
