/**
 * VerificationPipeline - Verification Workflow Visualization Component
 * Features: Workflow pipeline, batch processing, urgency indicators, quick actions
 * Displays vendor and restaurant verification queues with processing capabilities
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Store,
  ChevronRight,
  Filter,
  Calendar,
  FileText,
  Eye,
  Check,
  X,
  MoreHorizontal,
  Users,
  Building2,
  Timer,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import { dashboardService } from '../../../../services/admin';

const VerificationPipeline = ({
  verificationQueue = [],
  onVerificationAction,
  onBatchAction,
  onViewDetails,
  permissions = {},
  className = '',
}) => {
  const { isDarkMode } = useTheme();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [showBatchActions, setShowBatchActions] = useState(false);

  // Verification stages configuration
  const verificationStages = [
    {
      id: 'submitted',
      label: 'Submitted',
      icon: FileText,
      color: 'gray',
      description: 'Initial application received',
    },
    {
      id: 'under_review',
      label: 'Under Review',
      icon: Eye,
      color: 'blue',
      description: 'Currently being reviewed',
    },
    {
      id: 'pending_info',
      label: 'Pending Info',
      icon: Clock,
      color: 'amber',
      description: 'Awaiting additional information',
    },
    {
      id: 'approved',
      label: 'Approved',
      icon: CheckCircle,
      color: 'green',
      description: 'Verification completed successfully',
    },
    {
      id: 'rejected',
      label: 'Rejected',
      icon: XCircle,
      color: 'red',
      description: 'Verification rejected',
    },
  ];

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'vendor', label: 'Vendors Only' },
    { value: 'restaurant', label: 'Restaurants Only' },
    { value: 'urgent', label: 'Urgent (7+ days)' },
    { value: 'pending_info', label: 'Needs Information' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'urgency', label: 'By Urgency' },
    { value: 'date', label: 'By Date' },
    { value: 'type', label: 'By Type' },
    { value: 'stage', label: 'By Stage' },
  ];

  // Filter and sort verification items
  const filteredAndSortedItems = React.useMemo(() => {
    let filtered = verificationQueue;

    // Apply filters
    switch (filterType) {
      case 'vendor':
        filtered = filtered.filter((item) => item.type === 'vendor');
        break;
      case 'restaurant':
        filtered = filtered.filter((item) => item.type === 'restaurant');
        break;
      case 'urgent':
        filtered = filtered.filter((item) => {
          const urgency = dashboardService.calculateVerificationUrgency(
            item.createdAt
          );
          return urgency === 'critical' || urgency === 'high';
        });
        break;
      case 'pending_info':
        filtered = filtered.filter((item) => item.stage === 'pending_info');
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          const urgencyA = dashboardService.calculateVerificationUrgency(
            a.createdAt
          );
          const urgencyB = dashboardService.calculateVerificationUrgency(
            b.createdAt
          );
          const urgencyOrder = { critical: 4, high: 3, medium: 2, normal: 1 };
          return (urgencyOrder[urgencyB] || 0) - (urgencyOrder[urgencyA] || 0);

        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);

        case 'type':
          return a.type.localeCompare(b.type);

        case 'stage':
          const stageOrder = {
            submitted: 1,
            under_review: 2,
            pending_info: 3,
            approved: 4,
            rejected: 5,
          };
          return (stageOrder[a.stage] || 0) - (stageOrder[b.stage] || 0);

        default:
          return 0;
      }
    });

    return filtered;
  }, [verificationQueue, filterType, sortBy]);

  // Get urgency level for item
  const getUrgencyLevel = useCallback((createdAt) => {
    return dashboardService.calculateVerificationUrgency(createdAt);
  }, []);

  // Get urgency color scheme
  const getUrgencyColorScheme = (urgency) => {
    const schemes = {
      critical: {
        bg: isDarkMode ? 'bg-tomato-red/20' : 'bg-tomato-red/10',
        text: 'text-tomato-red',
        border: 'border-tomato-red/30',
      },
      high: {
        bg: isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10',
        text: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown',
        border: 'border-earthy-yellow/30',
      },
      medium: {
        bg: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
        text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        border: 'border-blue-500/30',
      },
      normal: {
        bg: isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10',
        text: isDarkMode ? 'text-sage-green' : 'text-muted-olive',
        border: 'border-sage-green/30',
      },
    };
    return schemes[urgency] || schemes.normal;
  };

  // Get stage configuration
  const getStageConfig = (stageId) => {
    return (
      verificationStages.find((stage) => stage.id === stageId) ||
      verificationStages[0]
    );
  };

  // Handle item selection
  const handleItemSelect = useCallback((itemId, selected) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      setShowBatchActions(newSet.size > 0);
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(
    (selectAll) => {
      if (selectAll) {
        const allIds = new Set(filteredAndSortedItems.map((item) => item.id));
        setSelectedItems(allIds);
        setShowBatchActions(true);
      } else {
        setSelectedItems(new Set());
        setShowBatchActions(false);
      }
    },
    [filteredAndSortedItems]
  );

  // Handle individual verification action
  const handleVerificationAction = useCallback(
    (item, action) => {
      onVerificationAction?.(item, action);
    },
    [onVerificationAction]
  );

  // Handle batch action
  const handleBatchAction = useCallback(
    (action) => {
      const selectedItemsArray = Array.from(selectedItems);
      onBatchAction?.(selectedItemsArray, action);
      setSelectedItems(new Set());
      setShowBatchActions(false);
    },
    [selectedItems, onBatchAction]
  );

  // Render verification item
  const renderVerificationItem = (item, index) => {
    const urgency = getUrgencyLevel(item.createdAt);
    const urgencyScheme = getUrgencyColorScheme(urgency);
    const stageConfig = getStageConfig(item.stage);
    const StageIcon = stageConfig.icon;
    const TypeIcon = item.type === 'vendor' ? Store : Building2;
    const isSelected = selectedItems.has(item.id);
    const timeAgo = formatDistanceToNow(new Date(item.createdAt), {
      addSuffix: true,
    });

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`
          relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer
          ${
            isSelected
              ? isDarkMode
                ? 'bg-sage-green/10 border-sage-green/30'
                : 'bg-sage-green/5 border-sage-green/20'
              : isDarkMode
                ? 'bg-gray-800/50 border-gray-700'
                : 'bg-white border-gray-200'
          }
          hover:shadow-lg hover:shadow-sage-green/10 hover:-translate-y-1
          ${urgency === 'critical' ? 'ring-2 ring-tomato-red/20' : ''}
        `}
        onClick={() => onViewDetails?.(item)}
      >
        {/* Selection Checkbox */}
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              handleItemSelect(item.id, e.target.checked);
            }}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-sage-green focus:ring-sage-green/20"
          />
        </div>

        {/* Urgency Badge */}
        {urgency !== 'normal' && (
          <div className="absolute top-3 right-3">
            <div
              className={`
              px-2 py-1 rounded-lg text-xs font-medium border
              ${urgencyScheme.bg} ${urgencyScheme.text} ${urgencyScheme.border}
              ${urgency === 'critical' ? 'animate-pulse' : ''}
            `}
            >
              {urgency}
            </div>
          </div>
        )}

        <div className="flex items-start gap-4 ml-6">
          {/* Business Type Icon */}
          <div
            className={`
            flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center
            ${
              item.type === 'vendor'
                ? isDarkMode
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-blue-100 text-blue-600'
                : isDarkMode
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-purple-100 text-purple-600'
            }
          `}
          >
            <TypeIcon className="w-6 h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4
                className={`font-semibold truncate ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                {item.businessName || item.name}
              </h4>
              <span
                className={`
                text-xs px-2 py-0.5 rounded-full font-medium
                ${
                  item.type === 'vendor'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                }
              `}
              >
                {item.type}
              </span>
            </div>

            <p
              className={`text-sm mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'} line-clamp-2`}
            >
              {item.description || `${item.type} verification pending review`}
            </p>

            {/* Metadata */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Calendar
                  className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                />
                <span
                  className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                >
                  {timeAgo}
                </span>
              </div>

              {item.location && (
                <span
                  className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                >
                  📍 {item.location}
                </span>
              )}

              {item.contactEmail && (
                <span
                  className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
                >
                  📧 {item.contactEmail}
                </span>
              )}
            </div>
          </div>

          {/* Stage and Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {/* Current Stage */}
            <div
              className={`
              flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-medium
              ${
                stageConfig.color === 'green'
                  ? isDarkMode
                    ? 'bg-sage-green/20 text-sage-green'
                    : 'bg-sage-green/10 text-muted-olive'
                  : stageConfig.color === 'red'
                    ? 'bg-tomato-red/20 text-tomato-red'
                    : stageConfig.color === 'amber'
                      ? isDarkMode
                        ? 'bg-earthy-yellow/20 text-earthy-yellow'
                        : 'bg-earthy-yellow/10 text-earthy-brown'
                      : isDarkMode
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-blue-100 text-blue-600'
              }
            `}
            >
              <StageIcon className="w-3 h-3" />
              {stageConfig.label}
            </div>

            {/* Quick Actions */}
            {item.stage === 'under_review' && permissions.verify_businesses && (
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerificationAction(item, 'approve');
                  }}
                  className="p-1 h-8 w-8 text-sage-green hover:bg-sage-green/10"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerificationAction(item, 'reject');
                  }}
                  className="p-1 h-8 w-8 text-tomato-red hover:bg-tomato-red/10"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* More Actions */}
            <Button
              size="sm"
              variant="ghost"
              className="p-1 h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                // Show more actions menu
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
            >
              Verification Progress
            </span>
            <span
              className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}
            >
              {Math.round(
                ((verificationStages.findIndex((s) => s.id === item.stage) +
                  1) /
                  verificationStages.length) *
                  100
              )}
              %
            </span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${((verificationStages.findIndex((s) => s.id === item.stage) + 1) / verificationStages.length) * 100}%`,
              }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full rounded-full ${
                stageConfig.color === 'green'
                  ? 'bg-sage-green'
                  : stageConfig.color === 'red'
                    ? 'bg-tomato-red'
                    : stageConfig.color === 'amber'
                      ? 'bg-earthy-yellow'
                      : 'bg-blue-500'
              }`}
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Timer
              className={`w-5 h-5 ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
            />
            <h3
              className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
            >
              Verification Pipeline
            </h3>
            <span
              className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}
            `}
            >
              {filteredAndSortedItems.length} items
            </span>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Select All */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={
                  selectedItems.size === filteredAndSortedItems.length &&
                  filteredAndSortedItems.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-sage-green focus:ring-sage-green/20"
              />
              <span
                className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}
              >
                Select All
              </span>
            </label>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`
                px-3 py-1 rounded-xl border text-sm
                ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`
                px-3 py-1 rounded-xl border text-sm
                ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }
              `}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Actions */}
          <AnimatePresence>
            {showBatchActions && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2"
              >
                <Button
                  size="sm"
                  onClick={() => handleBatchAction('approve')}
                  className="bg-sage-green hover:bg-sage-green/90 text-white rounded-xl"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve ({selectedItems.size})
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBatchAction('reject')}
                  className="rounded-xl"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject ({selectedItems.size})
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Verification Items */}
      <div className="px-6 pb-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <Users
                  className={`w-12 h-12 mx-auto mb-4 opacity-40 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                />
                <p
                  className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {filterType !== 'all'
                    ? 'No items match your current filter'
                    : 'No verification items in the queue'}
                </p>
              </div>
            ) : (
              filteredAndSortedItems.map((item, index) =>
                renderVerificationItem(item, index)
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};

export default VerificationPipeline;
