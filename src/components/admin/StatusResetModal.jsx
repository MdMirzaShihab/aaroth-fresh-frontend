import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Clock,
  X,
  Store,
  Utensils,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building,
  Calendar,
  User,
  FileText,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import FormField from '../ui/FormField';

const StatusResetModal = ({ approval, onClose, onResetStatus, isLoading }) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (approval) {
      setReason('');
    }
  }, [approval]);

  if (!approval) return null;

  const businessEntity =
    approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
  const businessName =
    approval.type === 'vendor'
      ? businessEntity?.businessName || approval.businessName
      : businessEntity?.name || approval.name;

  // Calculate current status (updated for three-state system)
  const verificationStatus = businessEntity?.verificationStatus || 'pending';
  const isCurrentlyVerified = verificationStatus === 'approved';
  const currentStatus = verificationStatus;

  const getTypeDisplay = (type) => {
    switch (type) {
      case 'vendor':
        return {
          icon: Store,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Vendor',
        };
      case 'restaurant':
        return {
          icon: Utensils,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Restaurant',
        };
      default:
        return {
          icon: Building,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Business',
        };
    }
  };

  const typeDisplay = getTypeDisplay(approval.type);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for resetting the status');
      return;
    }

    await onResetStatus({
      id: approval._id,
      entityType: approval.type,
      reason: reason.trim(),
    });

    setReason('');
  };

  // Status reset reason templates
  const resetTemplates = [
    'Additional documentation required for review',
    'Business information needs verification',
    'Policy compliance requires re-evaluation',
    'Updated business license submitted',
    'New management structure requires review',
    'Address change requires verification',
    'System error - resetting for proper review',
    'Manual review requested by business owner',
  ];

  // Calculate impact
  const getStatusImpact = () => {
    if (approval.type === 'vendor') {
      return {
        immediate: [
          'Existing listings will remain active but no new listings can be created',
          'Current orders will continue to be processed',
          'Vendor dashboard access remains available',
        ],
        pending: [
          'Will require admin re-approval for full operations',
          'New listing creation will be suspended',
          'Payment processing may be affected',
        ],
      };
    } else {
      return {
        immediate: [
          'Current orders will continue processing',
          'Restaurant dashboard access remains available',
          'Existing vendor relationships maintained',
        ],
        pending: [
          'Will require admin re-approval for new orders',
          'New vendor connections may be restricted',
          'Account features may be limited until re-approval',
        ],
      };
    }
  };

  const impact = getStatusImpact();

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Reset Approval Status"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div
            className={`w-16 h-16 rounded-2xl ${typeDisplay.bgColor} flex items-center justify-center flex-shrink-0`}
          >
            <typeDisplay.icon className={`w-8 h-8 ${typeDisplay.color}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold text-text-dark dark:text-white mb-2">
              {businessName || 'Unknown Business'}
            </h2>
            <p className="text-text-muted mb-3">
              {typeDisplay.label} Status Reset
            </p>

            {/* Current Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">Current:</span>
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    isCurrentlyVerified
                      ? 'bg-mint-fresh/20 text-bottle-green'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isCurrentlyVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      Unverified
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-muted">After Reset:</span>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-earthy-yellow/20 text-earthy-brown">
                  <Clock className="w-4 h-4" />
                  Pending Review
                </div>
              </div>
            </div>

            {/* Last Action Info */}
            {businessEntity?.statusUpdatedAt && (
              <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
                <Calendar className="w-4 h-4" />
                Last updated{' '}
                {new Date(businessEntity.statusUpdatedAt).toLocaleDateString()}
                {businessEntity.adminNotes && (
                  <span className="ml-2">
                    • {businessEntity.adminNotes.substring(0, 50)}...
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Impact Warning */}
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Status Reset Impact
              </h3>
              <p className="text-amber-700 mb-4">
                Resetting this {approval.type}'s status will move them back to
                pending approval state. This action affects their operational
                capabilities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Immediate Effects */}
            <div>
              <h4 className="font-medium text-text-dark dark:text-white mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Immediate Effects
              </h4>
              <ul className="space-y-2">
                {impact.immediate.map((effect, index) => (
                  <li
                    key={index}
                    className="text-sm text-text-muted flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    {effect}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pending Requirements */}
            <div>
              <h4 className="font-medium text-text-dark dark:text-white mb-3 flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Pending Re-approval
              </h4>
              <ul className="space-y-2">
                {impact.pending.map((requirement, index) => (
                  <li
                    key={index}
                    className="text-sm text-text-muted flex items-start gap-2"
                  >
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full flex-shrink-0 mt-2"></div>
                    {requirement}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Reason Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Reset Reason
          </h3>

          {/* Quick Reason Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-3">
              Common Reasons (click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {resetTemplates.map((template) => (
                <button
                  key={template}
                  onClick={() => setReason(template)}
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    reason === template
                      ? 'bg-earthy-yellow text-earthy-brown'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Detailed Reason" required>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for resetting the approval status. This will be visible to the business and in audit logs..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-earthy-yellow/20"
            />
          </FormField>

          {/* Additional Info */}
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  What happens next:
                </p>
                <ul className="text-blue-800 space-y-1">
                  <li>• Business status changes to "Pending Review"</li>
                  <li>
                    • {approval.type === 'vendor' ? 'Vendor' : 'Restaurant'}{' '}
                    receives notification of status change
                  </li>
                  <li>• Admin team can review and approve/reject again</li>
                  <li>• Full audit trail maintained for compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className="flex-1 bg-earthy-yellow hover:bg-earthy-yellow/90 text-earthy-brown"
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              'Resetting Status...'
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset to Pending
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StatusResetModal;
