/**
 * BulkVendorOperations - Batch Processing Interface for Vendor Management
 * Comprehensive bulk operations with impact analysis, confirmation workflows, and progress tracking
 * Features: Bulk approval/rejection, status updates, messaging, export functionality, progress tracking
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Clock,
  Package,
  DollarSign,
  Star,
  Building2,
  ArrowRight,
  Loader2,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FileText,
  Send,
  Ban,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button, Modal, Input } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import {
  useBulkApproveVendorsMutation,
  useBulkRejectVendorsMutation,
  useBulkUpdateVendorStatusMutation,
  useSendBulkVendorMessageMutation,
  useExportVendorsQuery,
} from '../../../../services/admin/vendorsService';

// Bulk operation types
const BULK_OPERATIONS = {
  approve: {
    label: 'Approve Verification',
    icon: CheckCircle,
    color: 'text-sage-green bg-sage-green/10 border-sage-green/20',
    description: 'Approve selected vendors for platform access',
  },
  reject: {
    label: 'Reject Verification',
    icon: XCircle,
    color: 'text-tomato-red bg-tomato-red/10 border-tomato-red/20',
    description: 'Reject selected vendors with reason',
  },
  activate: {
    label: 'Activate Accounts',
    icon: UserCheck,
    color: 'text-sage-green bg-sage-green/10 border-sage-green/20',
    description: 'Activate selected vendor accounts',
  },
  suspend: {
    label: 'Suspend Accounts',
    icon: Ban,
    color: 'text-earthy-yellow bg-earthy-yellow/10 border-earthy-yellow/20',
    description: 'Suspend selected vendor accounts',
  },
  message: {
    label: 'Send Message',
    icon: MessageSquare,
    color: 'text-muted-olive bg-muted-olive/10 border-muted-olive/20',
    description: 'Send bulk message to selected vendors',
  },
  export: {
    label: 'Export Data',
    icon: Download,
    color: 'text-dusty-cedar bg-dusty-cedar/10 border-dusty-cedar/20',
    description: 'Export selected vendor data',
  },
};

// Bulk operation progress tracker
const BulkProgressTracker = ({
  operation,
  progress,
  onCancel,
  onPause,
  onResume,
}) => {
  const { processed, total, errors, status } = progress;
  const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

  const getStatusIcon = () => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-sage-green" />;
      case 'paused':
        return <PauseCircle className="w-5 h-5 text-earthy-yellow" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-sage-green" />;
      case 'cancelled':
        return <StopCircle className="w-5 h-5 text-tomato-red" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-tomato-red" />;
      default:
        return <Clock className="w-5 h-5 text-text-muted" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-6 border border-sage-green/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <h3 className="font-semibold text-text-dark">
            {operation.label} -{' '}
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {status === 'running' && (
            <Button onClick={onPause} variant="outline" size="sm">
              <PauseCircle className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}

          {status === 'paused' && (
            <Button onClick={onResume} variant="outline" size="sm">
              <PlayCircle className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}

          {['running', 'paused'].includes(status) && (
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="text-tomato-red border-tomato-red/30 hover:bg-tomato-red/5"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Progress</span>
          <span className="font-medium text-text-dark">
            {processed} / {total} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className="h-full bg-gradient-to-r from-sage-green to-sage-green transition-all duration-300"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="font-semibold text-text-dark">{processed}</p>
          <p className="text-text-muted">Processed</p>
        </div>
        <div>
          <p className="font-semibold text-sage-green">{processed - errors}</p>
          <p className="text-text-muted">Successful</p>
        </div>
        <div>
          <p className="font-semibold text-tomato-red">{errors}</p>
          <p className="text-text-muted">Errors</p>
        </div>
      </div>

      {/* Completion Message */}
      {status === 'completed' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-sage-green/10 border border-sage-green/20 rounded-xl"
        >
          <p className="text-sm text-sage-green font-medium">
            Operation completed successfully! {processed - errors} vendors
            processed, {errors} errors.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Bulk operation confirmation modal
const BulkOperationModal = ({
  operation,
  selectedVendors,
  isOpen,
  onClose,
  onConfirm,
  isProcessing,
}) => {
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');
  const [notifyVendors, setNotifyVendors] = useState(true);
  const [exportFormat, setExportFormat] = useState('csv');

  const requiresReason = ['reject', 'suspend'].includes(operation?.id);
  const requiresMessage = operation?.id === 'message';
  const isExportOperation = operation?.id === 'export';

  const handleSubmit = () => {
    if (requiresReason && !reason.trim()) {
      toast.error('Please provide a reason for this action');
      return;
    }

    if (requiresMessage && !message.trim()) {
      toast.error('Please enter a message to send');
      return;
    }

    const data = {
      vendorIds: selectedVendors.map((v) => v.id),
      ...(requiresReason && { reason }),
      ...(requiresMessage && { message }),
      ...(isExportOperation && { format: exportFormat }),
      notifyVendors,
    };

    onConfirm(data);
  };

  if (!operation || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Confirm ${operation.label}`}
      size="default"
    >
      <div className="space-y-6">
        {/* Warning */}
        <div className={`p-4 rounded-xl border ${operation.color}`}>
          <div className="flex items-center gap-2 mb-2">
            <operation.icon className="w-5 h-5" />
            <span className="font-medium">Bulk Operation Confirmation</span>
          </div>
          <p className="text-sm opacity-80">
            You are about to {operation.description.toLowerCase()} for{' '}
            {selectedVendors.length} vendor
            {selectedVendors.length !== 1 ? 's' : ''}. This action{' '}
            {['reject', 'suspend', 'export'].includes(operation.id)
              ? 'may not be'
              : 'cannot be'}{' '}
            undone.
          </p>
        </div>

        {/* Selected Vendors Preview */}
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
          <div className="p-3 bg-gray-50 border-b border-gray-200 sticky top-0">
            <h4 className="font-medium text-text-dark">
              Selected Vendors ({selectedVendors.length})
            </h4>
          </div>
          <div className="p-3 space-y-2">
            {selectedVendors.slice(0, 10).map((vendor) => (
              <div key={vendor.id} className="flex items-center gap-3 text-sm">
                <div
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                                flex items-center justify-center text-white text-xs font-medium"
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-dark truncate">
                    {vendor.businessName}
                  </p>
                  <p className="text-text-muted truncate">{vendor.ownerName}</p>
                </div>
              </div>
            ))}
            {selectedVendors.length > 10 && (
              <p className="text-sm text-text-muted text-center pt-2 border-t border-gray-200">
                ...and {selectedVendors.length - 10} more vendors
              </p>
            )}
          </div>
        </div>

        {/* Reason Input */}
        {requiresReason && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">
              Reason *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Enter reason for ${operation.label.toLowerCase()}...`}
              className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                         focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                         resize-none h-24 focus:outline-none"
            />
          </div>
        )}

        {/* Message Input */}
        {requiresMessage && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message to send to all selected vendors..."
              className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                         focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                         resize-none h-24 focus:outline-none"
            />
          </div>
        )}

        {/* Export Format */}
        {isExportOperation && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-dark">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                         focus:shadow-glow-olive transition-all duration-300 text-text-dark focus:outline-none"
            >
              <option value="csv">CSV (Excel compatible)</option>
              <option value="json">JSON (for developers)</option>
              <option value="pdf">PDF (formatted report)</option>
            </select>
          </div>
        )}

        {/* Notification Option */}
        {!isExportOperation && (
          <div className="flex items-center gap-3 p-3 bg-sage-green/5 rounded-xl">
            <input
              type="checkbox"
              id="notifyVendors"
              checked={notifyVendors}
              onChange={(e) => setNotifyVendors(e.target.checked)}
              className="w-4 h-4 rounded border-2 border-sage-green/30 text-sage-green focus:ring-sage-green/20"
            />
            <label htmlFor="notifyVendors" className="text-sm text-text-dark">
              Send notification to affected vendors
            </label>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isProcessing ||
              (requiresReason && !reason.trim()) ||
              (requiresMessage && !message.trim())
            }
            className={`flex-1 ${
              operation.id === 'reject' || operation.id === 'suspend'
                ? 'bg-tomato-red text-white hover:bg-tomato-red/90'
                : 'bg-gradient-to-r from-muted-olive to-sage-green text-white'
            }`}
          >
            {isProcessing ? 'Processing...' : `Confirm ${operation.label}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const BulkVendorOperations = ({
  selectedVendors = [],
  onClearSelection,
  onRefreshData,
}) => {
  const { isDarkMode } = useTheme();
  const [activeOperation, setActiveOperation] = useState(null);
  const [showOperationModal, setShowOperationModal] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(null);

  // RTK Query mutations
  const [bulkApproveVendors] = useBulkApproveVendorsMutation();
  const [bulkRejectVendors] = useBulkRejectVendorsMutation();
  const [bulkUpdateVendorStatus] = useBulkUpdateVendorStatusMutation();
  const [sendBulkVendorMessage] = useSendBulkVendorMessageMutation();

  // Calculate summary stats for selected vendors
  const summaryStats = React.useMemo(() => {
    if (!selectedVendors.length) return null;

    return {
      totalVendors: selectedVendors.length,
      pendingVerification: selectedVendors.filter(
        (v) => v.verificationStatus === 'pending'
      ).length,
      totalRevenue: selectedVendors.reduce(
        (sum, v) => sum + (v.businessMetrics?.totalRevenue || 0),
        0
      ),
      totalOrders: selectedVendors.reduce(
        (sum, v) => sum + (v.businessMetrics?.totalOrders || 0),
        0
      ),
      averageRating:
        selectedVendors.reduce(
          (sum, v) => sum + (v.businessMetrics?.rating || 0),
          0
        ) / selectedVendors.length,
    };
  }, [selectedVendors]);

  // Handle bulk operation
  const handleBulkOperation = (operationId) => {
    const operation = BULK_OPERATIONS[operationId];
    if (!operation) return;

    setActiveOperation({ ...operation, id: operationId });
    setShowOperationModal(true);
  };

  // Execute bulk operation
  const executeBulkOperation = async (data) => {
    setShowOperationModal(false);

    // Initialize progress tracking
    setBulkProgress({
      processed: 0,
      total: data.vendorIds.length,
      errors: 0,
      status: 'running',
    });

    try {
      let result;

      switch (activeOperation.id) {
        case 'approve':
          result = await bulkApproveVendors(data).unwrap();
          break;
        case 'reject':
          result = await bulkRejectVendors(data).unwrap();
          break;
        case 'activate':
        case 'suspend':
          result = await bulkUpdateVendorStatus({
            ...data,
            status: activeOperation.id === 'activate' ? 'active' : 'suspended',
          }).unwrap();
          break;
        case 'message':
          result = await sendBulkVendorMessage(data).unwrap();
          break;
        case 'export':
          // Handle export differently - trigger download
          const exportData = selectedVendors.map((vendor) => ({
            businessName: vendor.businessName,
            ownerName: vendor.ownerName,
            email: vendor.email,
            phone: vendor.phone,
            businessType: vendor.businessType,
            verificationStatus: vendor.verificationStatus,
            totalRevenue: vendor.businessMetrics?.totalRevenue || 0,
            totalOrders: vendor.businessMetrics?.totalOrders || 0,
            rating: vendor.businessMetrics?.rating || 0,
          }));

          // Create and download file (simplified implementation)
          const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json',
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `vendors_export_${Date.now()}.json`;
          link.click();
          URL.revokeObjectURL(url);

          result = { success: true, processed: data.vendorIds.length };
          break;
        default:
          throw new Error('Unknown operation');
      }

      // Update progress to completed
      setBulkProgress((prev) => ({
        ...prev,
        processed: result.processed || data.vendorIds.length,
        errors: result.errors || 0,
        status: 'completed',
      }));

      toast.success(`${activeOperation.label} completed successfully`);
      onRefreshData?.();
    } catch (error) {
      setBulkProgress((prev) => ({
        ...prev,
        status: 'error',
      }));
      toast.error(
        `Failed to ${activeOperation.label.toLowerCase()}: ${error.message}`
      );
    }
  };

  // Clear progress after completion
  useEffect(() => {
    if (bulkProgress?.status === 'completed') {
      const timer = setTimeout(() => {
        setBulkProgress(null);
        setActiveOperation(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [bulkProgress?.status]);

  if (selectedVendors.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Selection Summary */}
      <Card className="glass-card-olive border-muted-olive/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-muted-olive/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-olive" />
            </div>

            <div>
              <h3 className="font-semibold text-text-dark">
                {selectedVendors.length} Vendor
                {selectedVendors.length !== 1 ? 's' : ''} Selected
              </h3>
              {summaryStats && (
                <p className="text-sm text-text-muted">
                  {summaryStats.pendingVerification} pending verification • $
                  {summaryStats.totalRevenue.toLocaleString()} total revenue •
                  {summaryStats.totalOrders.toLocaleString()} total orders
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={onClearSelection}
            variant="outline"
            size="sm"
            className="text-tomato-red border-tomato-red/30 hover:bg-tomato-red/5"
          >
            Clear Selection
          </Button>
        </div>
      </Card>

      {/* Bulk Operations */}
      <Card className="glass-card-olive border-sage-green/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-5 h-5 text-sage-green" />
          <h3 className="font-semibold text-text-dark">Bulk Operations</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(BULK_OPERATIONS).map(([id, operation]) => {
            const IconComponent = operation.icon;
            return (
              <Button
                key={id}
                onClick={() => handleBulkOperation(id)}
                variant="outline"
                className={`flex-col h-auto py-3 px-2 ${operation.color} border hover:shadow-glow-sage/10`}
              >
                <IconComponent className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium text-center leading-tight">
                  {operation.label}
                </span>
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Progress Tracker */}
      {bulkProgress && (
        <BulkProgressTracker
          operation={activeOperation}
          progress={bulkProgress}
          onCancel={() =>
            setBulkProgress((prev) => ({ ...prev, status: 'cancelled' }))
          }
          onPause={() =>
            setBulkProgress((prev) => ({ ...prev, status: 'paused' }))
          }
          onResume={() =>
            setBulkProgress((prev) => ({ ...prev, status: 'running' }))
          }
        />
      )}

      {/* Operation Confirmation Modal */}
      <BulkOperationModal
        operation={activeOperation}
        selectedVendors={selectedVendors}
        isOpen={showOperationModal}
        onClose={() => setShowOperationModal(false)}
        onConfirm={executeBulkOperation}
        isProcessing={bulkProgress?.status === 'running'}
      />
    </div>
  );
};

export default BulkVendorOperations;
