/**
 * ApprovalWorkflow - Admin V2
 * Business verification workflow component
 * Uses existing UI components with admin-specific business logic
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, Modal, FormField } from '../../../ui';
import StatusBadge from '../../ui/StatusBadge/StatusBadge';
import {
  useUpdateVendorVerificationV2Mutation,
  useUpdateRestaurantVerificationV2Mutation,
} from '../../../../store/slices/admin-v2/adminApiSlice';

const ApprovalWorkflow = ({ entity, entityType, onUpdate }) => {
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // RTK Query mutations
  const [updateVendorVerification, { isLoading: isUpdatingVendor }] =
    useUpdateVendorVerificationV2Mutation();
  const [updateRestaurantVerification, { isLoading: isUpdatingRestaurant }] =
    useUpdateRestaurantVerificationV2Mutation();

  const isLoading = isUpdatingVendor || isUpdatingRestaurant;

  const handleApprove = async () => {
    try {
      const updateMutation =
        entityType === 'vendor'
          ? updateVendorVerification
          : updateRestaurantVerification;

      await updateMutation({
        id: entity.id,
        status: 'approved',
        reason: approvalNotes || 'Approved by admin',
      }).unwrap();

      toast.success(
        `${entityType === 'vendor' ? 'Vendor' : 'Restaurant'} approved successfully`
      );
      setShowApprovalModal(false);
      setApprovalNotes('');
      onUpdate?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to approve entity');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const updateMutation =
        entityType === 'vendor'
          ? updateVendorVerification
          : updateRestaurantVerification;

      await updateMutation({
        id: entity.id,
        status: 'rejected',
        reason: rejectionReason,
      }).unwrap();

      toast.success(
        `${entityType === 'vendor' ? 'Vendor' : 'Restaurant'} rejected`
      );
      setShowRejectionModal(false);
      setRejectionReason('');
      onUpdate?.();
    } catch (error) {
      toast.error(error?.data?.message || 'Failed to reject entity');
    }
  };

  const getUrgencyColor = (urgencyLevel) => {
    const colors = {
      low: 'text-sage-green',
      medium: 'text-amber-500',
      high: 'text-orange-500',
      critical: 'text-tomato-red',
    };
    return colors[urgencyLevel] || 'text-gray-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-text-dark dark:text-white mb-2">
            {entity.businessName || entity.name}
          </h3>
          <div className="flex items-center gap-3 mb-3">
            <StatusBadge
              status={entity.verificationStatus}
              type="verification"
            />
            <StatusBadge
              status={entity.urgencyLevel}
              type="urgency"
              size="sm"
            />
          </div>
          <div className="text-sm text-text-muted dark:text-gray-400">
            <div>Owner: {entity.ownerName}</div>
            <div>Waiting: {entity.waitingDays} days</div>
            <div>Submitted: {entity.submittedAt}</div>
          </div>
        </div>

        <div
          className={`text-2xl font-bold ${getUrgencyColor(entity.urgencyLevel)}`}
        >
          {entity.waitingDays}d
        </div>
      </div>

      {/* Document Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(entity.documents || {}).map(([key, doc]) => (
          <div key={key} className="text-center">
            <div
              className={`w-12 h-12 rounded-2xl mx-auto mb-2 flex items-center justify-center ${
                doc.verified
                  ? 'bg-sage-green/10 text-muted-olive'
                  : doc.provided
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-500'
              }`}
            >
              {doc.verified ? (
                <CheckCircle className="w-6 h-6" />
              ) : doc.provided ? (
                <Clock className="w-6 h-6" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>
            <div className="text-xs font-medium text-text-dark dark:text-white capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </div>
            <div className="text-xs text-text-muted dark:text-gray-400">
              {doc.verified ? 'Verified' : doc.provided ? 'Pending' : 'Missing'}
            </div>
          </div>
        ))}
      </div>

      {/* Business Info */}
      <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 mb-6">
        <h4 className="font-medium text-text-dark dark:text-white mb-3">
          Business Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-text-muted dark:text-gray-400">Type:</span>
            <span className="ml-2 text-text-dark dark:text-white">
              {entity.businessInfo?.type}
            </span>
          </div>
          <div>
            <span className="text-text-muted dark:text-gray-400">
              Completeness:
            </span>
            <span className="ml-2 text-text-dark dark:text-white">
              {entity.businessInfo?.completeness}%
            </span>
          </div>
          <div className="md:col-span-2">
            <span className="text-text-muted dark:text-gray-400">Address:</span>
            <span className="ml-2 text-text-dark dark:text-white">
              {entity.businessInfo?.address}
            </span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      {entity.riskAssessment && (
        <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 mb-6">
          <h4 className="font-medium text-text-dark dark:text-white mb-3">
            Risk Assessment
          </h4>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-text-muted dark:text-gray-400">
              Risk Score:
            </span>
            <StatusBadge
              status={
                entity.riskAssessment.score > 70
                  ? 'high'
                  : entity.riskAssessment.score > 40
                    ? 'medium'
                    : 'low'
              }
              type="risk"
              size="sm"
            />
          </div>
          {entity.riskAssessment.factors?.length > 0 && (
            <div className="space-y-2">
              {entity.riskAssessment.factors.map((factor, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-text-dark dark:text-white">
                    {factor}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {entity.verificationStatus === 'pending' && (
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => setShowApprovalModal(true)}
            className="flex-1 bg-gradient-to-r from-sage-green to-muted-olive"
            disabled={isLoading}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowRejectionModal(true)}
            className="flex-1 border-tomato-red/20 text-tomato-red hover:bg-tomato-red/5"
            disabled={isLoading}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
        </div>
      )}

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Approve Verification"
      >
        <div className="space-y-4">
          <p className="text-text-muted dark:text-gray-400">
            Are you sure you want to approve{' '}
            {entity.businessName || entity.name}?
          </p>

          <FormField
            label="Approval Notes (Optional)"
            type="textarea"
            value={approvalNotes}
            onChange={(e) => setApprovalNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
          />

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-sage-green to-muted-olive"
            >
              {isLoading ? 'Approving...' : 'Confirm Approval'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowApprovalModal(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Reject Verification"
      >
        <div className="space-y-4">
          <p className="text-text-muted dark:text-gray-400">
            Please provide a reason for rejecting{' '}
            {entity.businessName || entity.name}.
          </p>

          <FormField
            label="Rejection Reason *"
            type="textarea"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this application is being rejected..."
            required
          />

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
              className="flex-1 border-tomato-red/20 text-tomato-red hover:bg-tomato-red/5"
            >
              {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowRejectionModal(false)}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ApprovalWorkflow;
