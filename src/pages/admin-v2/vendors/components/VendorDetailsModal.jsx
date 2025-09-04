import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Clock,
  Shield,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Trash2,
  Edit,
  Calendar,
  CheckCircle,
  XCircle,
  Minus,
} from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import {
  formatVendorAddress,
  formatDate,
  calculateVerificationUrgency,
} from '../../../../services/admin-v2/vendorsService';

const VendorDetailsModal = ({
  vendor,
  isOpen,
  onClose,
  onEdit,
  onVerify,
  onDeactivate,
  onDelete,
  isLoading = false,
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);
  const [confirmReason, setConfirmReason] = useState('');

  const handleConfirmAction = useCallback(
    (action) => {
      // Try both _id and id formats to ensure we get the correct vendor ID
      const vendorId = vendor._id || vendor.id;
      
      if (!vendorId) {
        return;
      }
      
      if (action === 'verify-approve') {
        // For approve, reason is optional but can be provided
        onVerify(vendorId, 'approved', confirmReason.trim());
      } else if (action === 'verify-reject') {
        // For reject, reason is required and validated
        const trimmedReason = confirmReason.trim();
        if (trimmedReason.length < 5 || trimmedReason.length > 500) {
          return;
        }
        onVerify(vendorId, 'rejected', trimmedReason);
      } else if (action === 'deactivate') {
        onDeactivate(vendorId, confirmReason);
      } else if (action === 'delete') {
        onDelete(vendorId, confirmReason);
      }
      setShowConfirmDialog(null);
      setConfirmReason('');
      // Don't close the modal here - let the parent component handle it after API completion
    },
    [vendor?._id, vendor?.id, confirmReason, onVerify, onDeactivate, onDelete]
  );

  const handleCancelConfirm = useCallback(() => {
    setShowConfirmDialog(null);
    setConfirmReason('');
  }, []);

  const urgencyLevel = vendor
    ? calculateVerificationUrgency(vendor.createdAt, vendor.verificationStatus)
    : 'none';

  if (!vendor) return null;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          color: 'text-sage-green',
          bgColor: 'bg-sage-green/10',
          label: 'Verified',
        };
      case 'rejected':
        return {
          icon: XCircle,
          color: 'text-tomato-red',
          bgColor: 'bg-tomato-red/10',
          label: 'Rejected',
        };
      case 'pending':
      default:
        return {
          icon: Minus,
          color: 'text-earthy-yellow',
          bgColor: 'bg-earthy-yellow/10',
          label: 'Pending',
        };
    }
  };

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case 'critical':
        return {
          color: 'text-tomato-red',
          bgColor: 'bg-tomato-red/10',
          label: 'Critical',
        };
      case 'high':
        return {
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          label: 'High',
        };
      case 'medium':
        return {
          color: 'text-earthy-yellow',
          bgColor: 'bg-earthy-yellow/10',
          label: 'Medium',
        };
      case 'low':
        return {
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          label: 'Low',
        };
      default:
        return {
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          label: 'None',
        };
    }
  };

  const statusConfig = getStatusConfig(vendor.verificationStatus);
  const urgencyConfig = getUrgencyConfig(urgencyLevel);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[70] flex items-start justify-center overflow-y-auto"
          >
            <div className="w-full max-w-4xl my-4">
              <Card className="flex flex-col glass">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {vendor.businessLogo ? (
                        <img
                          src={vendor.businessLogo}
                          alt={vendor.businessName}
                          className="w-12 h-12 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-muted-olive/10 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-muted-olive" />
                        </div>
                      )}
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${statusConfig.bgColor} flex items-center justify-center`}
                      >
                        <statusConfig.icon
                          className={`w-3 h-3 ${statusConfig.color}`}
                        />
                      </div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-text-dark">
                        {vendor.businessName}
                      </h2>
                      <p className="text-text-muted">
                        {vendor.createdBy?.name || 'Unknown Owner'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <X className="w-6 h-6 text-text-muted" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Status & Urgency Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 glass">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-text-muted">
                            Verification Status
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <statusConfig.icon
                              className={`w-5 h-5 ${statusConfig.color}`}
                            />
                            <span className="font-semibold text-text-dark">
                              {statusConfig.label}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-2xl ${statusConfig.bgColor}`}
                        >
                          <Shield className={`w-6 h-6 ${statusConfig.color}`} />
                        </div>
                      </div>
                    </Card>

                    {vendor.verificationStatus === 'pending' && (
                      <Card className="p-4 glass">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-text-muted">
                              Urgency Level
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <AlertTriangle
                                className={`w-5 h-5 ${urgencyConfig.color}`}
                              />
                              <span className="font-semibold text-text-dark">
                                {urgencyConfig.label}
                              </span>
                            </div>
                          </div>
                          <div
                            className={`p-3 rounded-2xl ${urgencyConfig.bgColor}`}
                          >
                            <Clock
                              className={`w-6 h-6 ${urgencyConfig.color}`}
                            />
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Contact Information */}
                  <Card className="p-6 glass">
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-muted-olive" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="text-sm text-text-muted">Phone</p>
                            <p className="font-medium text-text-dark">
                              {vendor.phone || 'Not provided'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-text-muted" />
                          <div>
                            <p className="text-sm text-text-muted">Email</p>
                            <p className="font-medium text-text-dark">
                              {vendor.email || 'Not provided'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-text-muted mt-1" />
                          <div>
                            <p className="text-sm text-text-muted">Address</p>
                            <p className="font-medium text-text-dark">
                              {formatVendorAddress(vendor.address)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Business Information */}
                  <Card className="p-6 glass">
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-muted-olive" />
                      Business Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-text-muted">
                            Business Name
                          </p>
                          <p className="font-medium text-text-dark mt-1">
                            {vendor.businessName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">
                            Business Type
                          </p>
                          <p className="font-medium text-text-dark mt-1">
                            {vendor.businessType || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">
                            Years in Business
                          </p>
                          <p className="font-medium text-text-dark mt-1">
                            {vendor.yearsInBusiness || 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-text-muted">
                            Registration Number
                          </p>
                          <p className="font-medium text-text-dark mt-1">
                            {vendor.businessRegistrationNumber ||
                              'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-text-muted">
                            License Number
                          </p>
                          <p className="font-medium text-text-dark mt-1">
                            {vendor.businessLicenseNumber || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {vendor.businessDescription && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-text-muted">
                          Business Description
                        </p>
                        <p className="font-medium text-text-dark mt-1">
                          {vendor.businessDescription}
                        </p>
                      </div>
                    )}
                  </Card>

                  {/* Timestamps */}
                  <Card className="p-6 glass">
                    <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-muted-olive" />
                      Timeline
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-text-muted">Registered</p>
                        <p className="font-medium text-text-dark mt-1">
                          {formatDate(vendor.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">Last Updated</p>
                        <p className="font-medium text-text-dark mt-1">
                          {formatDate(vendor.updatedAt)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">
                          Verification Date
                        </p>
                        <p className="font-medium text-text-dark mt-1">
                          {vendor.verificationDate
                            ? formatDate(vendor.verificationDate)
                            : 'Not verified'}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Actions */}
                <div className="p-6 border-t border-white/10">
                  <div className="flex flex-wrap gap-3 justify-end">
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isLoading}
                    >
                      Close
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => onEdit(vendor)}
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>

                    {vendor.verificationStatus === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmDialog('verify-reject')}
                          disabled={isLoading}
                          className="border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10 flex items-center gap-2"
                        >
                          <ShieldX className="w-4 h-4" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => setShowConfirmDialog('verify-approve')}
                          disabled={isLoading}
                          className="bg-sage-green hover:bg-sage-green/90 text-white flex items-center gap-2"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Approve
                        </Button>
                      </>
                    )}

                    {vendor.verificationStatus !== 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmDialog('deactivate')}
                          disabled={isLoading}
                          className="border-earthy-yellow/30 text-earthy-yellow hover:bg-earthy-yellow/10 flex items-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          Deactivate
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowConfirmDialog('delete')}
                          disabled={isLoading}
                          className="border-tomato-red/30 text-tomato-red hover:bg-tomato-red/10 flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmDialog && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                  onClick={handleCancelConfirm}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  className="fixed inset-0 z-[110] flex items-center justify-center p-4"
                >
                  <Card className="w-full max-w-md glass">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-text-dark mb-4">
                        {showConfirmDialog === 'verify-approve' &&
                          'Approve Vendor'}
                        {showConfirmDialog === 'verify-reject' &&
                          'Reject Vendor'}
                        {showConfirmDialog === 'deactivate' &&
                          'Deactivate Vendor'}
                        {showConfirmDialog === 'delete' && 'Delete Vendor'}
                      </h3>

                      <p className="text-text-muted mb-4">
                        {showConfirmDialog === 'verify-approve' &&
                          'Are you sure you want to approve this vendor? This will allow them to start selling on the platform.'}
                        {showConfirmDialog === 'verify-reject' &&
                          'Are you sure you want to reject this vendor? Please provide a reason for rejection.'}
                        {showConfirmDialog === 'deactivate' &&
                          'Are you sure you want to deactivate this vendor? This will prevent them from receiving new orders.'}
                        {showConfirmDialog === 'delete' &&
                          'Are you sure you want to delete this vendor? This action cannot be undone.'}
                      </p>

                      {(showConfirmDialog === 'verify-reject' ||
                        showConfirmDialog === 'deactivate' ||
                        showConfirmDialog === 'delete') && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-text-dark mb-2">
                            Reason{' '}
                            {showConfirmDialog === 'verify-reject'
                              ? '(Required - 5-500 characters)'
                              : '(Optional)'}
                          </label>
                          <textarea
                            value={confirmReason}
                            onChange={(e) => setConfirmReason(e.target.value)}
                            placeholder={
                              showConfirmDialog === 'verify-reject'
                                ? 'Please provide a detailed reason for rejection (minimum 5 characters)...'
                                : 'Enter reason...'
                            }
                            className={`w-full p-3 rounded-2xl border bg-white/5 backdrop-blur-sm focus:ring-2 text-text-dark placeholder-text-muted resize-none ${
                              showConfirmDialog === 'verify-reject' &&
                              confirmReason.length > 0 &&
                              confirmReason.length < 5
                                ? 'border-tomato-red/50 focus:border-tomato-red/50 focus:ring-tomato-red/10'
                                : confirmReason.length > 500
                                  ? 'border-tomato-red/50 focus:border-tomato-red/50 focus:ring-tomato-red/10'
                                  : 'border-white/20 focus:border-muted-olive/50 focus:ring-muted-olive/10'
                            }`}
                            rows={3}
                            maxLength={500}
                          />
                          {showConfirmDialog === 'verify-reject' && (
                            <div className="mt-2 flex justify-between items-center">
                              <div className="text-xs">
                                {confirmReason.length < 5 && confirmReason.length > 0 && (
                                  <span className="text-tomato-red">
                                    Minimum 5 characters required
                                  </span>
                                )}
                                {confirmReason.length > 500 && (
                                  <span className="text-tomato-red">
                                    Maximum 500 characters allowed
                                  </span>
                                )}
                                {confirmReason.length >= 5 && confirmReason.length <= 500 && (
                                  <span className="text-sage-green">
                                    Valid reason provided
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs ${
                                confirmReason.length > 500 ? 'text-tomato-red' : 'text-text-muted'
                              }`}>
                                {confirmReason.length}/500
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 justify-end">
                        <Button
                          variant="outline"
                          onClick={handleCancelConfirm}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={(e) => {
                            // Prevent event from bubbling up to backdrop
                            e.stopPropagation();
                            
                            if (showConfirmDialog === 'verify-approve') {
                              handleConfirmAction('verify-approve');
                            } else if (showConfirmDialog === 'verify-reject') {
                              if (!confirmReason.trim() || confirmReason.trim().length < 5) {
                                return;
                              }
                              if (confirmReason.trim().length > 500) {
                                return;
                              }
                              handleConfirmAction('verify-reject');
                            } else {
                              handleConfirmAction(showConfirmDialog);
                            }
                          }}
                          disabled={
                            isLoading ||
                            (showConfirmDialog === 'verify-reject' &&
                              (!confirmReason.trim() || 
                               confirmReason.trim().length < 5 || 
                               confirmReason.trim().length > 500))
                          }
                          className={
                            showConfirmDialog === 'verify-approve'
                              ? 'bg-sage-green hover:bg-sage-green/90 text-white'
                              : 'bg-tomato-red hover:bg-tomato-red/90 text-white'
                          }
                        >
                          {showConfirmDialog === 'verify-approve' && 'Approve'}
                          {showConfirmDialog === 'verify-reject' && 'Reject'}
                          {showConfirmDialog === 'deactivate' && 'Deactivate'}
                          {showConfirmDialog === 'delete' && 'Delete'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default VendorDetailsModal;
