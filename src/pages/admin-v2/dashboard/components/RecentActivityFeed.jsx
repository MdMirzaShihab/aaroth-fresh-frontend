/**
 * RecentActivityFeed - Real-time Activity Monitoring Component
 * Features: Infinite scroll, filtering, real-time updates, click-through navigation
 * Supports various activity types with contextual icons and actions
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  CheckCircle,
  Store,
  Package,
  ShoppingCart,
  Flag,
  Tags,
  AlertTriangle,
  Clock,
  Filter,
  Search,
  ExternalLink,
  MoreHorizontal,
  RefreshCcw,
  Users,
  Activity
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import { formatDistanceToNow, format } from 'date-fns';

const RecentActivityFeed = ({
  activities = [],
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onActivityClick,
  onFilterChange,
  onRefresh,
  realTimeEnabled = true,
  maxHeight = 400,
  className = ""
}) => {
  const { isDarkMode } = useTheme();
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedActivities, setExpandedActivities] = useState(new Set());
  
  const scrollContainerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Activity type configuration
  const activityConfig = {
    user_registered: {
      icon: UserPlus,
      color: 'blue',
      bgColor: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      label: 'User Registration'
    },
    vendor_verified: {
      icon: CheckCircle,
      color: 'green',
      bgColor: isDarkMode ? 'bg-mint-fresh/20' : 'bg-mint-fresh/10',
      iconColor: isDarkMode ? 'text-mint-fresh' : 'text-bottle-green',
      label: 'Vendor Verified'
    },
    restaurant_approved: {
      icon: Store,
      color: 'green',
      bgColor: isDarkMode ? 'bg-mint-fresh/20' : 'bg-mint-fresh/10',
      iconColor: isDarkMode ? 'text-mint-fresh' : 'text-bottle-green',
      label: 'Restaurant Approved'
    },
    product_created: {
      icon: Package,
      color: 'purple',
      bgColor: isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100',
      iconColor: isDarkMode ? 'text-purple-400' : 'text-purple-600',
      label: 'Product Created'
    },
    order_placed: {
      icon: ShoppingCart,
      color: 'blue',
      bgColor: isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100',
      iconColor: isDarkMode ? 'text-blue-400' : 'text-blue-600',
      label: 'Order Placed'
    },
    listing_flagged: {
      icon: Flag,
      color: 'red',
      bgColor: isDarkMode ? 'bg-tomato-red/20' : 'bg-tomato-red/10',
      iconColor: 'text-tomato-red',
      label: 'Listing Flagged'
    },
    category_updated: {
      icon: Tags,
      color: 'gray',
      bgColor: isDarkMode ? 'bg-gray-600/20' : 'bg-gray-100',
      iconColor: isDarkMode ? 'text-gray-400' : 'text-gray-600',
      label: 'Category Updated'
    },
    system_alert: {
      icon: AlertTriangle,
      color: 'amber',
      bgColor: isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10',
      iconColor: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown',
      label: 'System Alert'
    }
  };

  // Available filter options
  const filterOptions = Object.keys(activityConfig).map(key => ({
    value: key,
    label: activityConfig[key].label,
    color: activityConfig[key].color
  }));

  // Filter and search activities
  useEffect(() => {
    let filtered = activities;

    // Apply type filters
    if (selectedFilters.length > 0) {
      filtered = filtered.filter(activity => 
        selectedFilters.includes(activity.type)
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.user?.toLowerCase().includes(query) ||
        activity.action?.toLowerCase().includes(query) ||
        activity.target?.toLowerCase().includes(query) ||
        activity.message?.toLowerCase().includes(query)
      );
    }

    setFilteredActivities(filtered);
  }, [activities, selectedFilters, searchQuery]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  // Handle filter selection
  const handleFilterToggle = useCallback((filterValue) => {
    setSelectedFilters(prev => {
      const updated = prev.includes(filterValue)
        ? prev.filter(f => f !== filterValue)
        : [...prev, filterValue];
      
      onFilterChange?.(updated);
      return updated;
    });
  }, [onFilterChange]);

  // Handle activity expansion
  const handleActivityToggle = useCallback((activityId) => {
    setExpandedActivities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  }, []);

  // Get relative time display
  const getTimeDisplay = useCallback((timestamp) => {
    try {
      const date = new Date(timestamp);
      const distance = formatDistanceToNow(date, { addSuffix: true });
      const formatted = format(date, 'MMM dd, yyyy HH:mm');
      
      return { relative: distance, absolute: formatted };
    } catch (error) {
      return { relative: 'Unknown time', absolute: 'Invalid date' };
    }
  }, []);

  // Render activity item
  const renderActivityItem = useCallback((activity, index) => {
    const config = activityConfig[activity.type] || activityConfig.system_alert;
    const IconComponent = config.icon;
    const timeDisplay = getTimeDisplay(activity.timestamp || activity.createdAt);
    const isExpanded = expandedActivities.has(activity.id);

    return (
      <motion.div
        key={activity.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`
          group cursor-pointer transition-all duration-200
          hover:shadow-sm hover:shadow-sage-green/10
          ${isDarkMode ? 'hover:bg-dark-sage-accent/5' : 'hover:bg-sage-green/5'}
          rounded-xl p-4 border-b border-gray-100 dark:border-gray-800 last:border-b-0
        `}
        onClick={() => onActivityClick?.(activity)}
      >
        <div className="flex items-start gap-3">
          {/* Activity Icon */}
          <div className={`
            flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
            ${config.bgColor} group-hover:scale-105 transition-transform duration-200
          `}>
            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
          </div>

          {/* Activity Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  <span className="font-semibold">{activity.user}</span>{' '}
                  <span className="font-normal">{activity.action}</span>{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
                
                {activity.message && (
                  <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'} ${
                    isExpanded ? '' : 'line-clamp-2'
                  }`}>
                    {activity.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-2">
                {activity.actionable && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActivityClick?.(activity, 'action');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}

                {activity.message && activity.message.length > 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleActivityToggle(activity.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Clock className={`w-3 h-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                <span 
                  className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}
                  title={timeDisplay.absolute}
                >
                  {timeDisplay.relative}
                </span>
              </div>

              {activity.category && (
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
                `}>
                  {activity.category}
                </span>
              )}

              {activity.priority && (
                <span className={`
                  text-xs px-2 py-0.5 rounded-full font-medium
                  ${activity.priority === 'high' 
                    ? 'bg-tomato-red/10 text-tomato-red' 
                    : activity.priority === 'medium'
                      ? 'bg-earthy-yellow/10 text-earthy-brown'
                      : 'bg-mint-fresh/10 text-bottle-green'
                  }
                `}>
                  {activity.priority}
                </span>
              )}
            </div>

            {/* Additional Details (Expanded) */}
            <AnimatePresence>
              {isExpanded && activity.details && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800"
                >
                  <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    {Object.entries(activity.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1">
                        <span className="font-medium">{key}:</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }, [
    isDarkMode, 
    activityConfig, 
    expandedActivities, 
    getTimeDisplay, 
    handleActivityToggle, 
    onActivityClick
  ]);

  return (
    <Card className={`${className}`}>
      {/* Header */}
      <div className="p-6 pb-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Activity className={`w-5 h-5 ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Recent Activity
            </h3>
            {realTimeEnabled && (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-mint-fresh' : 'bg-bottle-green'} animate-pulse`} />
                <span className={`text-xs font-medium ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`}>
                  Live
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => onRefresh?.()}
              className="rounded-xl p-2"
              disabled={isLoading}
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-10 pr-4 py-2 rounded-xl border text-sm
                ${isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }
                focus:ring-2 focus:ring-sage-green/20 focus:border-sage-green/50
              `}
            />
          </div>

          {/* Filter Toggle */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`
                rounded-xl flex items-center gap-2
                ${selectedFilters.length > 0 ? 'bg-sage-green/10 text-bottle-green' : ''}
              `}
            >
              <Filter className="w-4 h-4" />
              Filters
              {selectedFilters.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-bottle-green text-white rounded-full text-xs">
                  {selectedFilters.length}
                </span>
              )}
            </Button>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`
                    absolute top-12 right-0 z-20 p-4 rounded-2xl border shadow-lg min-w-56
                    ${isDarkMode ? 'glass-2-dark border-dark-olive-border' : 'glass-2 border-sage-green/20'}
                  `}
                >
                  <div className="space-y-2">
                    <p className={`text-sm font-medium mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                      Activity Types
                    </p>
                    {filterOptions.map(option => (
                      <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(option.value)}
                          onChange={() => handleFilterToggle(option.value)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                        <span className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        <div className="px-6">
          <AnimatePresence mode="popLayout">
            {isLoading && filteredActivities.length === 0 ? (
              // Loading skeleton
              [...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 py-4 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : filteredActivities.length === 0 ? (
              // Empty state
              <div className="text-center py-12">
                <Users className={`w-12 h-12 mx-auto mb-4 opacity-40 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchQuery || selectedFilters.length > 0 
                    ? 'No activities match your search criteria' 
                    : 'No recent activity to display'
                  }
                </p>
              </div>
            ) : (
              // Activity items
              filteredActivities.map((activity, index) => 
                renderActivityItem(activity, index)
              )
            )}
          </AnimatePresence>

          {/* Load More Trigger */}
          {hasMore && !isLoading && (
            <div
              ref={loadMoreRef}
              className="py-4 text-center"
            >
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
              </div>
            </div>
          )}

          {/* Loading indicator for more items */}
          {isLoading && filteredActivities.length > 0 && (
            <div className="py-4 text-center">
              <div className={`inline-flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <RefreshCcw className="w-4 h-4 animate-spin" />
                Loading more activities...
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default RecentActivityFeed;