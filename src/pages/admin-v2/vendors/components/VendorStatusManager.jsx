/**
 * VendorStatusManager - Status Controls with Safe Deletion
 * Comprehensive status management with impact analysis, safe deletion, and dependency resolution
 * Features: Status controls, impact analysis, safe deletion workflow, dependency management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  UserCheck,
  UserX,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  Building2,
  FileText,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Eye,
  Ban,
  Unlock
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Modal } from '../../../../components/ui';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { StatusBadge } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import { 
  useUpdateVendorStatusMutation,
  useDeactivateVendorMutation,
  useSafeDeleteVendorMutation,
  useLazyGetVendorDeletionImpactQuery,
  useSendVendorMessageMutation
} from '../../../../services/admin-v2/vendorsService';
import toast from 'react-hot-toast';

// Status configuration
const VENDOR_STATUSES = {
  active: {
    label: 'Active',
    color: 'text-sage-green bg-sage-green/10 border-sage-green/20',
    icon: CheckCircle,
    description: 'Vendor is fully operational and can receive orders'
  },
  inactive: {
    label: 'Inactive',
    color: 'text-gray-500 bg-gray-100 border-gray-200',
    icon: XCircle,
    description: 'Vendor account is temporarily disabled'
  },
  suspended: {
    label: 'Suspended',
    color: 'text-earthy-yellow bg-earthy-yellow/10 border-earthy-yellow/20',
    icon: Ban,
    description: 'Vendor account is suspended due to policy violations'
  },
  pending: {
    label: 'Pending',
    color: 'text-sage-green bg-sage-green/10 border-sage-green/20',
    icon: Clock,
    description: 'Vendor registration is pending approval'
  }
};

// Impact analysis component
const ImpactAnalysis = ({ vendorId, onImpactData }) => {
  const [getImpactAnalysis, { data: impactData, isLoading, error }] = useLazyGetVendorDeletionImpactQuery();

  useEffect(() => {
    if (vendorId) {
      getImpactAnalysis(vendorId);
    }
  }, [vendorId, getImpactAnalysis]);

  useEffect(() => {
    if (impactData && onImpactData) {
      onImpactData(impactData);
    }
  }, [impactData, onImpactData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="md" />
        <span className="ml-3 text-text-muted">Analyzing impact...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-tomato-red/5 border border-tomato-red/20 rounded-xl">
        <div className="flex items-center gap-2 text-tomato-red">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Failed to analyze impact</span>
        </div>
        <p className="text-sm text-text-muted mt-1">{error.message}</p>
      </div>
    );
  }

  if (!impactData) return null;

  const {
    activeOrders = 0,
    totalRevenue = 0,
    activeListings = 0,
    connectedRestaurants = 0,
    dependencies = [],
    riskLevel = 'low'
  } = impactData;

  const getRiskColor = (level) => {
    const colors = {
      low: 'text-sage-green bg-sage-green/10 border-sage-green/20',
      medium: 'text-earthy-yellow bg-earthy-yellow/10 border-earthy-yellow/20',
      high: 'text-tomato-red bg-tomato-red/10 border-tomato-red/20'
    };
    return colors[level] || colors.low;
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <div className={`p-4 rounded-xl border ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Deletion Risk: {riskLevel.toUpperCase()}</span>
        </div>
        <p className="text-sm opacity-80">
          {riskLevel === 'high' && 'High impact deletion - careful review required'}
          {riskLevel === 'medium' && 'Moderate impact - some dependencies exist'}
          {riskLevel === 'low' && 'Low impact deletion - minimal dependencies'}
        </p>
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-sage-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <ShoppingCart className="w-5 h-5 text-sage-green" />
          </div>
          <p className="text-2xl font-bold text-text-dark">{activeOrders}</p>
          <p className="text-xs text-text-muted">Active Orders</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-sage-green/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <DollarSign className="w-5 h-5 text-sage-green" />
          </div>
          <p className="text-2xl font-bold text-text-dark">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-text-muted">Total Revenue</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-dusty-cedar/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Package className="w-5 h-5 text-dusty-cedar" />
          </div>
          <p className="text-2xl font-bold text-text-dark">{activeListings}</p>
          <p className="text-xs text-text-muted">Active Listings</p>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-10 h-10 bg-earthy-yellow/10 rounded-xl flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-earthy-yellow" />
          </div>
          <p className="text-2xl font-bold text-text-dark">{connectedRestaurants}</p>
          <p className="text-xs text-text-muted">Connected Restaurants</p>
        </Card>
      </div>

      {/* Dependencies */}
      {dependencies.length > 0 && (
        <Card className="p-4">
          <h4 className="font-medium text-text-dark mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-earthy-yellow" />
            Dependencies Requiring Resolution
          </h4>
          <div className="space-y-2">
            {dependencies.map((dependency, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-text-muted" />
                  <span className="text-sm font-medium text-text-dark">{dependency.type}</span>
                  <span className="text-xs text-text-muted">({dependency.count} items)</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  dependency.required 
                    ? 'bg-tomato-red/10 text-tomato-red' 
                    : 'bg-earthy-yellow/10 text-earthy-yellow'
                }`}>
                  {dependency.required ? 'Required' : 'Optional'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Status change modal
const StatusChangeModal = ({ vendor, isOpen, onClose, onStatusChange }) => {
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  const [notifyVendor, setNotifyVendor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newStatus || !reason.trim()) {
      toast.error('Please select a status and provide a reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await onStatusChange(newStatus, reason, notifyVendor);
      onClose();
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Change Vendor Status" size="default">
      <div className="space-y-6">
        <div>
          <p className="text-text-muted mb-4">
            Change status for <strong>{vendor?.businessName}</strong>
          </p>
          
          {/* Current Status */}
          <div className="p-3 bg-gray-50 rounded-xl mb-4">
            <p className="text-sm text-text-muted mb-1">Current Status</p>
            <StatusBadge status={vendor?.status || 'active'} variant="glass" />
          </div>
        </div>

        {/* New Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-dark">New Status</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(VENDOR_STATUSES).map(([status, config]) => {
              const IconComponent = config.icon;
              return (
                <button
                  key={status}
                  onClick={() => setNewStatus(status)}
                  className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                    newStatus === status
                      ? config.color + ' scale-105'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <p className="text-xs text-text-muted">{config.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-dark">Reason for Change *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are changing the vendor status..."
            className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                       focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                       resize-none h-24 focus:outline-none"
          />
        </div>

        {/* Notification Option */}
        <div className="flex items-center gap-3 p-3 bg-sage-green/5 rounded-xl">
          <input
            type="checkbox"
            id="notifyVendor"
            checked={notifyVendor}
            onChange={(e) => setNotifyVendor(e.target.checked)}
            className="w-4 h-4 rounded border-2 border-sage-green/30 text-sage-green focus:ring-sage-green/20"
          />
          <label htmlFor="notifyVendor" className="text-sm text-text-dark">
            Notify vendor about status change
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !newStatus || !reason.trim()}
            className="flex-1 bg-gradient-to-r from-muted-olive to-sage-green text-white"
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Safe deletion modal
const SafeDeleteModal = ({ vendor, isOpen, onClose, onSafeDelete }) => {
  const [reason, setReason] = useState('');
  const [transferOrders, setTransferOrders] = useState(false);
  const [transferToVendorId, setTransferToVendorId] = useState('');
  const [impactData, setImpactData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for deletion');
      return;
    }

    if (transferOrders && !transferToVendorId) {
      toast.error('Please select a vendor to transfer orders to');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSafeDelete(reason, transferOrders, transferToVendorId);
      onClose();
    } catch (error) {
      // Error handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDelete = !impactData || (
    impactData.activeOrders === 0 || transferOrders
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Safe Delete Vendor" size="large">
      <div className="space-y-6">
        <div className="p-4 bg-tomato-red/5 border border-tomato-red/20 rounded-xl">
          <div className="flex items-center gap-2 text-tomato-red mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">Warning: This action cannot be undone</span>
          </div>
          <p className="text-sm text-text-muted">
            You are about to permanently delete <strong>{vendor?.businessName}</strong> 
            and all associated data from the system.
          </p>
        </div>

        {/* Impact Analysis */}
        <ImpactAnalysis vendorId={vendor?.id} onImpactData={setImpactData} />

        {/* Order Transfer Option */}
        {impactData?.activeOrders > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <input
                type="checkbox"
                id="transferOrders"
                checked={transferOrders}
                onChange={(e) => setTransferOrders(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-muted-olive/30 text-muted-olive focus:ring-muted-olive/20"
              />
              <label htmlFor="transferOrders" className="font-medium text-text-dark">
                Transfer active orders to another vendor
              </label>
            </div>
            
            {transferOrders && (
              <div className="ml-7 space-y-2">
                <label className="text-sm text-text-muted">Select vendor to transfer orders to:</label>
                <select
                  value={transferToVendorId}
                  onChange={(e) => setTransferToVendorId(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                             focus:shadow-glow-olive transition-all duration-300 text-text-dark focus:outline-none"
                >
                  <option value="">Select a vendor...</option>
                  <option value="vendor1">Sample Vendor 1</option>
                  <option value="vendor2">Sample Vendor 2</option>
                  {/* Dynamic vendor options would be loaded here */}
                </select>
              </div>
            )}
          </Card>
        )}

        {/* Deletion Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-dark">Reason for Deletion *</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why you are deleting this vendor..."
            className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:glass-3 
                       focus:shadow-glow-olive transition-all duration-300 placeholder:text-text-muted/60 
                       resize-none h-24 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim() || !canDelete}
            className="flex-1 bg-tomato-red text-white hover:bg-tomato-red/90"
          >
            {isSubmitting ? 'Deleting...' : 'Confirm Deletion'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const VendorStatusManager = ({ vendor, isOpen, onClose, onStatusUpdate }) => {
  const { isDarkMode } = useTheme();
  const [showStatusChange, setShowStatusChange] = useState(false);
  const [showSafeDelete, setShowSafeDelete] = useState(false);
  
  const [updateVendorStatus] = useUpdateVendorStatusMutation();
  const [deactivateVendor] = useDeactivateVendorMutation();
  const [safeDeleteVendor] = useSafeDeleteVendorMutation();
  const [sendVendorMessage] = useSendVendorMessageMutation();

  // Handle status change
  const handleStatusChange = async (newStatus, reason, notifyVendor) => {
    try {
      if (newStatus === 'inactive') {
        await deactivateVendor({
          vendorId: vendor.id,
          reason,
          notifyVendor
        }).unwrap();
      } else {
        await updateVendorStatus({
          vendorId: vendor.id,
          status: newStatus,
          reason
        }).unwrap();
      }

      if (notifyVendor) {
        await sendVendorMessage({
          vendorId: vendor.id,
          message: `Your account status has been changed to ${newStatus}. Reason: ${reason}`,
          type: 'status_change'
        });
      }

      toast.success('Vendor status updated successfully');
      onStatusUpdate?.();
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`);
      throw error;
    }
  };

  // Handle safe deletion
  const handleSafeDelete = async (reason, transferOrders, transferToVendorId) => {
    try {
      await safeDeleteVendor({
        vendorId: vendor.id,
        reason,
        transferOrders,
        transferToVendorId
      }).unwrap();

      toast.success('Vendor deleted successfully');
      onStatusUpdate?.();
      onClose();
    } catch (error) {
      toast.error(`Failed to delete vendor: ${error.message}`);
      throw error;
    }
  };

  const currentStatus = VENDOR_STATUSES[vendor?.status] || VENDOR_STATUSES.active;
  const StatusIcon = currentStatus.icon;

  if (!isOpen || !vendor) return null;

  return (
    <>
      {/* Main Status Manager Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-md"
          onClick={onClose}
        />
        
        <div className="relative glass-5 rounded-3xl shadow-depth-5 w-full max-w-2xl border animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green 
                              flex items-center justify-center shadow-lg text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-dark dark:text-dark-text-primary">
                  Status Management
                </h2>
                <p className="text-sm text-text-muted">
                  {vendor.businessName}
                </p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="glass-2 p-2 rounded-xl hover:glass-3 transition-all duration-200 
                         focus:outline-none focus:ring-2 focus:ring-muted-olive/30"
            >
              <XCircle className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Current Status */}
            <Card className="p-4">
              <h3 className="font-medium text-text-dark mb-3">Current Status</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentStatus.color}`}>
                    <StatusIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-medium text-text-dark">{currentStatus.label}</p>
                    <p className="text-sm text-text-muted">{currentStatus.description}</p>
                  </div>
                </div>
                <StatusBadge status={vendor.status} variant="glass" />
              </div>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <UserCheck className="w-5 h-5 text-sage-green" />
                  <h4 className="font-medium text-text-dark">Status Control</h4>
                </div>
                <p className="text-sm text-text-muted mb-4">
                  Change the vendor's operational status with proper documentation.
                </p>
                <Button
                  onClick={() => setShowStatusChange(true)}
                  className="w-full bg-gradient-to-r from-sage-green to-sage-green text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Change Status
                </Button>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Trash2 className="w-5 h-5 text-tomato-red" />
                  <h4 className="font-medium text-text-dark">Safe Deletion</h4>
                </div>
                <p className="text-sm text-text-muted mb-4">
                  Permanently remove vendor with impact analysis and dependency resolution.
                </p>
                <Button
                  onClick={() => setShowSafeDelete(true)}
                  variant="outline"
                  className="w-full border-tomato-red/30 text-tomato-red hover:bg-tomato-red/5"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Safe Delete
                </Button>
              </Card>
            </div>

            {/* Vendor Information */}
            <Card className="p-4">
              <h3 className="font-medium text-text-dark mb-3">Vendor Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-text-muted">Business Type</p>
                  <p className="font-medium text-text-dark">{vendor.businessType}</p>
                </div>
                <div>
                  <p className="text-text-muted">Verification Status</p>
                  <StatusBadge status={vendor.verificationStatus} variant="glass" size="small" />
                </div>
                <div>
                  <p className="text-text-muted">Total Orders</p>
                  <p className="font-medium text-text-dark">{vendor.businessMetrics?.totalOrders || 0}</p>
                </div>
                <div>
                  <p className="text-text-muted">Risk Score</p>
                  <p className={`font-medium ${vendor.riskScore > 70 ? 'text-tomato-red' : 'text-text-dark'}`}>
                    {vendor.riskScore || 0}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <StatusChangeModal
        vendor={vendor}
        isOpen={showStatusChange}
        onClose={() => setShowStatusChange(false)}
        onStatusChange={handleStatusChange}
      />

      {/* Safe Delete Modal */}
      <SafeDeleteModal
        vendor={vendor}
        isOpen={showSafeDelete}
        onClose={() => setShowSafeDelete(false)}
        onSafeDelete={handleSafeDelete}
      />
    </>
  );
};

export default VendorStatusManager;