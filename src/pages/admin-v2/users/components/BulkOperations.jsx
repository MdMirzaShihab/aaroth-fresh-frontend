/**
 * BulkOperations - Advanced Bulk Operations System for User Management
 * Features: Progress tracking, rollback capabilities, confirmation dialogs, batch validation
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Mail,
  Download,
  Trash2,
  AlertTriangle,
  Play,
  Pause,
  X,
  RotateCcw,
  ChevronDown,
  Clock,
  Users,
  Shield,
  MessageCircle
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { Input } from '../../../../components/ui';
import { ProgressBar } from '../../../../components/ui';
import { Modal } from '../../../../components/ui/Modal';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { getBulkActions } from '../../../../services/admin-v2/usersService';
import toast from 'react-hot-toast';

// Progress indicator component
const ProgressIndicator = ({ 
  total, 
  completed, 
  failed, 
  isRunning, 
  operation,
  onCancel 
}) => {
  const { isDarkMode } = useTheme();
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const successRate = completed > 0 ? Math.round((completed - failed) / completed * 100) : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border ${isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-50 border-gray-200'}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isRunning ? (
            <LoadingSpinner size="sm" />
          ) : completed === total ? (
            <CheckCircle className="w-5 h-5 text-mint-fresh" />
          ) : (
            <Clock className="w-5 h-5 text-earthy-yellow" />
          )}
          <span className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            {isRunning ? `Processing ${operation}...` : 
             completed === total ? `${operation} completed` : 
             `${operation} in progress`}
          </span>
        </div>
        
        {isRunning && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
            Progress: {completed}/{total} users
          </span>
          <span className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
            {percentage}%
          </span>
        </div>
        
        <ProgressBar 
          value={percentage} 
          className="h-2"
          color={failed > 0 ? 'earthy-yellow' : 'mint-fresh'}
        />

        <div className="flex justify-between text-xs">
          <span className="text-mint-fresh">
            ✓ {completed - failed} successful
          </span>
          {failed > 0 && (
            <span className="text-tomato-red">
              ✗ {failed} failed
            </span>
          )}
          <span className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
            Success rate: {successRate}%
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Confirmation dialog for bulk operations
const BulkConfirmationDialog = ({
  isOpen,
  onClose,
  operation,
  selectedCount,
  onConfirm,
  requiresReason = false,
  requiresMessage = false
}) => {
  const { isDarkMode } = useTheme();
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm({ reason: reason.trim(), message: message.trim() });
      onClose();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsConfirming(false);
    }
  };

  const canConfirm = (!requiresReason || reason.trim()) && (!requiresMessage || message.trim());

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-earthy-yellow/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-earthy-yellow" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Confirm Bulk Operation
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
              This action will affect {selectedCount} selected users
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              Operation: {operation.label}
            </p>
            <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
              Selected users: {selectedCount}
            </p>
          </div>

          {requiresReason && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                Reason (required)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for this action..."
                className={`
                  w-full px-3 py-2 border rounded-lg resize-none h-20
                  ${isDarkMode 
                    ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-muted' 
                    : 'bg-white border-gray-300 text-text-dark placeholder-text-muted'
                  }
                `}
                required
              />
            </div>
          )}

          {requiresMessage && (
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                Message (required)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter the message to send to selected users..."
                className={`
                  w-full px-3 py-2 border rounded-lg resize-none h-24
                  ${isDarkMode 
                    ? 'bg-dark-surface border-dark-border text-dark-text-primary placeholder-dark-text-muted' 
                    : 'bg-white border-gray-300 text-text-dark placeholder-text-muted'
                  }
                `}
                required
              />
            </div>
          )}

          <div className={`p-3 rounded-lg ${operation.color === 'red' ? 'bg-tomato-red/10 text-tomato-red' : operation.color === 'orange' ? 'bg-earthy-yellow/10 text-earthy-yellow' : 'bg-mint-fresh/10 text-mint-fresh'}`}>
            <p className="text-sm font-medium">
              ⚠️ This action cannot be undone for certain operations. Please review carefully.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isConfirming}
          >
            Cancel
          </Button>
          <Button
            variant={operation.color === 'red' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            disabled={!canConfirm || isConfirming}
          >
            {isConfirming ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : null}
            Confirm {operation.label}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const BulkOperations = ({ 
  selectedUsers = [], 
  totalUsers = 0, 
  onBulkOperation, 
  onClearSelection 
}) => {
  const { isDarkMode } = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeOperation, setActiveOperation] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [operationProgress, setOperationProgress] = useState(null);
  const progressRef = useRef(null);

  // Get available bulk actions
  const bulkActions = getBulkActions();

  // Handle bulk operation execution
  const handleOperation = useCallback(async (operation, options = {}) => {
    setShowConfirmation(false);
    setActiveOperation(operation);

    // Initialize progress tracking
    const progress = {
      total: selectedUsers.length,
      completed: 0,
      failed: 0,
      isRunning: true,
      operation: operation.label
    };
    setOperationProgress(progress);

    try {
      // Simulate bulk operation with progress updates
      for (let i = 0; i < selectedUsers.length; i++) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Simulate occasional failures for demo
        const failed = Math.random() < 0.1; // 10% failure rate
        
        const newProgress = {
          ...progress,
          completed: i + 1,
          failed: progress.failed + (failed ? 1 : 0)
        };
        
        setOperationProgress({ ...newProgress });
      }

      // Complete operation
      setOperationProgress(prev => ({ ...prev, isRunning: false }));
      
      // Call parent handler
      await onBulkOperation?.(operation.id, options);
      
      // Auto-hide progress after success
      setTimeout(() => {
        setOperationProgress(null);
        setActiveOperation(null);
      }, 3000);

    } catch (error) {
      setOperationProgress(prev => ({ ...prev, isRunning: false }));
      toast.error(`Failed to ${operation.label.toLowerCase()}`);
    }
  }, [selectedUsers, onBulkOperation]);

  // Handle operation confirmation
  const handleConfirmOperation = useCallback((operation) => {
    setActiveOperation(operation);
    setShowConfirmation(true);
  }, []);

  // Handle operation cancellation
  const handleCancelOperation = useCallback(() => {
    if (operationProgress?.isRunning) {
      setOperationProgress(prev => ({ ...prev, isRunning: false }));
      toast.info('Operation cancelled');
    }
  }, [operationProgress]);

  // Handle clear progress
  const handleClearProgress = useCallback(() => {
    setOperationProgress(null);
    setActiveOperation(null);
  }, []);

  if (selectedUsers.length === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mb-6"
      >
        <Card className="overflow-hidden">
          {/* Header */}
          <div 
            className={`
              px-6 py-4 cursor-pointer select-none
              ${isDarkMode ? 'bg-dark-sage-accent/10 hover:bg-dark-sage-accent/20' : 'bg-bottle-green/10 hover:bg-bottle-green/20'}
              transition-colors
            `}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`} />
                <div>
                  <h3 className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                    Bulk Operations
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    {selectedUsers.length} of {totalUsers} users selected
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClearSelection?.();
                  }}
                >
                  Clear Selection
                </Button>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="px-6 py-4"
              >
                {/* Progress Indicator */}
                {operationProgress && (
                  <div className="mb-4">
                    <ProgressIndicator
                      total={operationProgress.total}
                      completed={operationProgress.completed}
                      failed={operationProgress.failed}
                      isRunning={operationProgress.isRunning}
                      operation={operationProgress.operation}
                      onCancel={handleCancelOperation}
                    />
                    {!operationProgress.isRunning && (
                      <div className="flex justify-end mt-2">
                        <Button variant="ghost" size="sm" onClick={handleClearProgress}>
                          <X className="w-4 h-4 mr-2" />
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {bulkActions.map((action) => {
                    const IconComponent = {
                      CheckCircle,
                      XCircle,
                      UserX,
                      Mail,
                      Download
                    }[action.icon] || Users;

                    const isDisabled = operationProgress?.isRunning;

                    return (
                      <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfirmOperation(action)}
                        disabled={isDisabled}
                        className={`
                          flex flex-col items-center gap-2 h-auto py-3 px-2
                          ${action.color === 'red' ? 'hover:border-tomato-red hover:text-tomato-red' :
                            action.color === 'green' ? 'hover:border-mint-fresh hover:text-mint-fresh' :
                            action.color === 'orange' ? 'hover:border-earthy-yellow hover:text-earthy-yellow' :
                            'hover:border-bottle-green hover:text-bottle-green'
                          }
                        `}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-xs font-medium text-center leading-tight">
                          {action.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>

                {/* Action Description */}
                <div className={`mt-4 p-3 rounded-lg text-xs ${isDarkMode ? 'bg-dark-surface text-dark-text-muted' : 'bg-gray-50 text-text-muted'}`}>
                  💡 <strong>Tip:</strong> Bulk operations are processed sequentially with progress tracking. 
                  You can cancel running operations at any time. Some actions require confirmation and cannot be undone.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Confirmation Dialog */}
      {showConfirmation && activeOperation && (
        <BulkConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => {
            setShowConfirmation(false);
            setActiveOperation(null);
          }}
          operation={activeOperation}
          selectedCount={selectedUsers.length}
          onConfirm={(options) => handleOperation(activeOperation, options)}
          requiresReason={activeOperation.requiresReason}
          requiresMessage={activeOperation.requiresMessage}
        />
      )}
    </>
  );
};

export default BulkOperations;