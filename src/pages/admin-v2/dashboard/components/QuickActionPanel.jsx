/**
 * QuickActionPanel - Emergency Controls and Bulk Operations Component
 * Features: Permission-based actions, confirmation modals, progress tracking, real-time status
 * Provides critical admin shortcuts and emergency system controls
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Settings,
  RefreshCcw,
  Users,
  Store,
  Package,
  Database,
  FileDown,
  Power,
  Shield,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Loader,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button } from '../../../../components/ui';
import toast from 'react-hot-toast';

const QuickActionPanel = ({
  pendingCounts = {},
  onQuickAction,
  permissions = {},
  systemStatus = {},
  isLoading = false,
  className = ""
}) => {
  const { isDarkMode } = useTheme();
  const [activeOperations, setActiveOperations] = useState(new Set());
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Quick action configurations
  const quickActions = [
    {
      id: 'pending-verifications',
      title: 'Review Pending Verifications',
      description: 'Process vendor and restaurant verifications',
      icon: Clock,
      count: pendingCounts.verifications || 0,
      urgentThreshold: 5,
      color: 'amber',
      permission: 'verify_businesses',
      route: '/admin-v2/verifications',
      action: () => handleQuickNavigation('/admin-v2/verifications'),
      priority: 1
    },
    {
      id: 'system-maintenance',
      title: 'System Maintenance Mode',
      description: 'Toggle system maintenance status',
      icon: Power,
      color: 'red',
      permission: 'system_control',
      isToggle: true,
      currentState: systemStatus.maintenanceMode || false,
      action: () => handleSystemToggle('maintenance'),
      confirmationRequired: true,
      priority: 2
    },
    {
      id: 'clear-cache',
      title: 'Clear Analytics Cache',
      description: 'Refresh all cached analytics data',
      icon: RefreshCcw,
      color: 'blue',
      permission: 'cache_management',
      action: () => handleCacheOperation('analytics'),
      confirmationRequired: true,
      priority: 3
    },
    {
      id: 'bulk-user-operations',
      title: 'Bulk User Operations',
      description: 'Manage multiple users at once',
      icon: Users,
      count: pendingCounts.flaggedUsers || 0,
      color: 'purple',
      permission: 'bulk_user_management',
      route: '/admin-v2/users?bulk=true',
      action: () => handleQuickNavigation('/admin-v2/users?bulk=true'),
      priority: 4
    },
    {
      id: 'flagged-listings',
      title: 'Review Flagged Content',
      description: 'Handle reported listings and content',
      icon: AlertTriangle,
      count: pendingCounts.flaggedListings || 0,
      urgentThreshold: 3,
      color: 'red',
      permission: 'content_moderation',
      route: '/admin-v2/content/flagged',
      action: () => handleQuickNavigation('/admin-v2/content/flagged'),
      priority: 5
    },
    {
      id: 'system-reports',
      title: 'Generate System Reports',
      description: 'Download comprehensive system reports',
      icon: FileDown,
      color: 'green',
      permission: 'generate_reports',
      action: () => handleReportGeneration(),
      priority: 6
    },
    {
      id: 'emergency-disable',
      title: 'Emergency User Disable',
      description: 'Quickly disable problematic users',
      icon: Shield,
      color: 'red',
      permission: 'emergency_controls',
      action: () => handleEmergencyAction('disable_user'),
      confirmationRequired: true,
      priority: 7
    },
    {
      id: 'performance-monitor',
      title: 'System Performance',
      description: 'Monitor real-time system health',
      icon: Zap,
      color: 'blue',
      permission: 'system_monitoring',
      route: '/admin-v2/system/performance',
      action: () => handleQuickNavigation('/admin-v2/system/performance'),
      priority: 8
    }
  ];

  // Filter actions based on permissions and sort by priority
  const availableActions = quickActions
    .filter(action => !action.permission || permissions[action.permission])
    .sort((a, b) => a.priority - b.priority);

  // Handle quick navigation
  const handleQuickNavigation = useCallback((route) => {
    onQuickAction?.({ type: 'navigate', route });
  }, [onQuickAction]);

  // Handle system toggle operations
  const handleSystemToggle = useCallback((operation) => {
    setActiveOperations(prev => new Set([...prev, operation]));
    
    // Simulate API call
    setTimeout(() => {
      setActiveOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operation);
        return newSet;
      });
      
      toast.success('System status updated successfully');
      onQuickAction?.({ type: 'system_toggle', operation, success: true });
    }, 2000);
  }, [onQuickAction]);

  // Handle cache operations
  const handleCacheOperation = useCallback((cacheType) => {
    const operationId = `cache_${cacheType}`;
    setActiveOperations(prev => new Set([...prev, operationId]));
    
    // Simulate cache clearing
    setTimeout(() => {
      setActiveOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
      
      toast.success(`${cacheType} cache cleared successfully`);
      onQuickAction?.({ type: 'cache_clear', cacheType, success: true });
    }, 1500);
  }, [onQuickAction]);

  // Handle report generation
  const handleReportGeneration = useCallback(() => {
    const operationId = 'generate_reports';
    setActiveOperations(prev => new Set([...prev, operationId]));
    
    // Simulate report generation
    setTimeout(() => {
      setActiveOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(operationId);
        return newSet;
      });
      
      toast.success('System reports generated and downloaded');
      onQuickAction?.({ type: 'generate_reports', success: true });
    }, 3000);
  }, [onQuickAction]);

  // Handle emergency actions
  const handleEmergencyAction = useCallback((actionType) => {
    onQuickAction?.({ type: 'emergency_action', actionType });
  }, [onQuickAction]);

  // Show confirmation modal
  const showConfirmation = useCallback((action) => {
    setConfirmationModal({
      title: `Confirm ${action.title}`,
      message: `Are you sure you want to ${action.description.toLowerCase()}? This action ${
        action.id === 'system-maintenance' ? 'will affect all users' : 'cannot be undone'
      }.`,
      action,
      isDestructive: ['red', 'amber'].includes(action.color)
    });
  }, []);

  // Execute confirmed action
  const executeAction = useCallback((action) => {
    setConfirmationModal(null);
    action.action();
  }, []);

  // Get action color scheme
  const getActionColorScheme = (color, isActive = false) => {
    const schemes = {
      red: {
        bg: isDarkMode 
          ? (isActive ? 'bg-tomato-red/30' : 'bg-tomato-red/20') 
          : (isActive ? 'bg-tomato-red/20' : 'bg-tomato-red/10'),
        text: 'text-tomato-red',
        border: 'border-tomato-red/30',
        hover: isDarkMode ? 'hover:bg-tomato-red/25' : 'hover:bg-tomato-red/15'
      },
      amber: {
        bg: isDarkMode 
          ? (isActive ? 'bg-earthy-yellow/30' : 'bg-earthy-yellow/20') 
          : (isActive ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10'),
        text: isDarkMode ? 'text-earthy-yellow' : 'text-earthy-brown',
        border: 'border-earthy-yellow/30',
        hover: isDarkMode ? 'hover:bg-earthy-yellow/25' : 'hover:bg-earthy-yellow/15'
      },
      green: {
        bg: isDarkMode 
          ? (isActive ? 'bg-mint-fresh/30' : 'bg-mint-fresh/20') 
          : (isActive ? 'bg-mint-fresh/20' : 'bg-mint-fresh/10'),
        text: isDarkMode ? 'text-mint-fresh' : 'text-bottle-green',
        border: 'border-mint-fresh/30',
        hover: isDarkMode ? 'hover:bg-mint-fresh/25' : 'hover:bg-mint-fresh/15'
      },
      blue: {
        bg: isDarkMode 
          ? (isActive ? 'bg-blue-500/30' : 'bg-blue-500/20') 
          : (isActive ? 'bg-blue-100' : 'bg-blue-50'),
        text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        border: 'border-blue-500/30',
        hover: isDarkMode ? 'hover:bg-blue-500/25' : 'hover:bg-blue-100'
      },
      purple: {
        bg: isDarkMode 
          ? (isActive ? 'bg-purple-500/30' : 'bg-purple-500/20') 
          : (isActive ? 'bg-purple-100' : 'bg-purple-50'),
        text: isDarkMode ? 'text-purple-400' : 'text-purple-600',
        border: 'border-purple-500/30',
        hover: isDarkMode ? 'hover:bg-purple-500/25' : 'hover:bg-purple-100'
      }
    };

    return schemes[color] || schemes.blue;
  };

  // Render action button
  const renderActionButton = (action) => {
    const isActive = activeOperations.has(action.id) || activeOperations.has(`cache_${action.id}`);
    const colorScheme = getActionColorScheme(action.color, isActive);
    const IconComponent = action.icon;
    const hasUrgentCount = action.count > (action.urgentThreshold || Infinity);

    const handleClick = () => {
      if (action.confirmationRequired) {
        showConfirmation(action);
      } else {
        action.action();
      }
    };

    return (
      <motion.div
        key={action.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative"
      >
        <button
          onClick={handleClick}
          disabled={isActive || isLoading}
          className={`
            relative w-full p-3 rounded-xl border transition-all duration-200 text-left
            ${colorScheme.bg} ${colorScheme.border} ${colorScheme.hover}
            ${isActive ? 'cursor-not-allowed' : 'cursor-pointer'}
            focus:ring-2 focus:ring-sage-green/20 focus:outline-none
            touch-target hover:scale-105
          `}
        >
          {/* Urgent Badge */}
          {hasUrgentCount && (
            <div className="absolute -top-2 -right-2 z-10">
              <div className="flex items-center justify-center w-6 h-6 bg-tomato-red rounded-full animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          )}

          {/* Active State Overlay */}
          {isActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                background: `linear-gradient(90deg, transparent 0%, ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 50%, transparent 100%)`
              }}
            />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                ${isActive ? 'animate-pulse' : ''}
                bg-white/10 backdrop-blur-sm
              `}>
                {isActive ? (
                  <Loader className={`w-4 h-4 ${colorScheme.text} animate-spin`} />
                ) : (
                  <IconComponent className={`w-4 h-4 ${colorScheme.text}`} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-xs truncate ${colorScheme.text}`}>
                  {action.title}
                </h4>
                <p className={`text-xs opacity-70 mt-0.5 truncate ${colorScheme.text} line-clamp-1`}>
                  {action.description}
                </p>
                
                {/* Status Indicators */}
                {(action.count !== undefined || action.isToggle) && (
                  <div className="flex items-center gap-1 mt-1">
                    {action.count !== undefined && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded font-medium
                        ${hasUrgentCount 
                          ? 'bg-tomato-red/20 text-tomato-red animate-pulse' 
                          : 'bg-white/20 text-current'
                        }
                      `}>
                        {action.count}
                      </span>
                    )}
                    
                    {action.isToggle && (
                      <span className={`
                        text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1
                        ${action.currentState
                          ? 'bg-tomato-red/20 text-tomato-red'
                          : 'bg-mint-fresh/20 text-bottle-green'
                        }
                      `}>
                        {action.currentState ? (
                          <>
                            <XCircle className="w-2.5 h-2.5" />
                            ON
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-2.5 h-2.5" />
                            OFF
                          </>
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Indicator */}
            <div className="flex-shrink-0 ml-2">
              {action.route ? (
                <ExternalLink className={`w-4 h-4 ${colorScheme.text} opacity-60`} />
              ) : (
                <ChevronRight className={`w-4 h-4 ${colorScheme.text} opacity-60`} />
              )}
            </div>
          </div>
        </button>
      </motion.div>
    );
  };

  return (
    <>
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`} />
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Quick Actions
            </h3>
          </div>

          {/* System Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              systemStatus.healthy 
                ? (isDarkMode ? 'bg-mint-fresh' : 'bg-bottle-green')
                : 'bg-tomato-red animate-pulse'
            }`} />
            <span className={`text-xs font-medium ${
              isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'
            }`}>
              System {systemStatus.healthy ? 'Healthy' : 'Alert'}
            </span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence>
            {availableActions.map(action => renderActionButton(action))}
          </AnimatePresence>
        </div>

        {/* Emergency Notice */}
        {availableActions.some(action => action.color === 'red' && action.count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              mt-6 p-4 rounded-2xl border-l-4 border-tomato-red
              ${isDarkMode ? 'bg-tomato-red/10 border-r border-t border-b border-tomato-red/20' : 'bg-tomato-red/5 border border-tomato-red/20'}
            `}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-tomato-red flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-tomato-red">
                  Urgent Actions Required
                </p>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                  Several items require immediate attention. Click on the highlighted actions above.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmationModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`
                w-full max-w-md p-6 rounded-3xl border shadow-xl
                ${isDarkMode ? 'glass-2-dark border-dark-olive-border' : 'glass-2 border-sage-green/20'}
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`
                  w-12 h-12 rounded-2xl flex items-center justify-center
                  ${confirmationModal.isDestructive 
                    ? 'bg-tomato-red/20 text-tomato-red' 
                    : 'bg-blue-500/20 text-blue-500'
                  }
                `}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  {confirmationModal.title}
                </h3>
              </div>

              <p className={`text-sm mb-6 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                {confirmationModal.message}
              </p>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setConfirmationModal(null)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  variant={confirmationModal.isDestructive ? 'destructive' : 'primary'}
                  onClick={() => executeAction(confirmationModal.action)}
                  className="flex-1 rounded-xl"
                >
                  {confirmationModal.isDestructive ? 'Confirm' : 'Execute'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActionPanel;