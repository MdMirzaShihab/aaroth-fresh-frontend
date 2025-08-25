import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  X,
  Store,
  Utensils,
  AlertTriangle,
  CheckCircle,
  Building,
  Calendar,
  User,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import FormField from '../ui/FormField';

const VerificationToggleModal = ({
  approval,
  onClose,
  onUpdateVerificationStatus,
  isLoading,
}) => {
  const [reason, setReason] = useState('');
  const [selectedAction, setSelectedAction] = useState(null);

  useEffect(() => {
    if (approval) {
      setReason('');
      setSelectedAction(null);
    }
  }, [approval]);

  const handleActionSelect = (action) => {
    setSelectedAction(action);
    if (action === 'approved') {
      setReason('Approved by admin'); // Default reason for approval
    } else {
      setReason(''); // Clear reason for rejection/pending
    }
  };

  if (!approval) return null;

  const businessEntity =
    approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
  const currentStatus = businessEntity?.verificationStatus || 'pending';
  const businessName =
    approval.type === 'vendor'
      ? businessEntity?.businessName || approval.businessName
      : businessEntity?.name || approval.name;

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
    if (!selectedAction) {
      alert('Please select an action');
      return;
    }

    if (
      (selectedAction === 'rejected' || selectedAction === 'pending') &&
      !reason.trim()
    ) {
      alert(
        selectedAction === 'rejected'
          ? 'Please provide a detailed reason for rejection'
          : 'Please provide a reason for setting to pending'
      );
      return;
    }

    const entityId = businessEntity?._id;
    if (!entityId) {
      alert('Entity ID not found');
      return;
    }

    await onUpdateVerificationStatus({
      id: entityId,
      entityType: approval.type,
      status: selectedAction,
      reason: reason.trim(),
    });

    setReason('');
    setSelectedAction(null);
  };

  // Status action templates
  const statusTemplates = {
    approved: [
      'Business documentation verified and approved',
      'All requirements met - approved for platform operations',
      'License and credentials validated successfully',
      'Business compliance confirmed - status approved',
      'Manual verification completed - business approved',
    ],
    rejected: [
      'Missing required business license documentation',
      'Invalid or expired business registration',
      'Incomplete identity verification documents',
      'Failed compliance requirements',
      'Business address verification failed',
      'Tax registration documents missing or invalid',
    ],
    pending: [
      'Additional documentation requested',
      'Pending manual review',
      'Requires clarification on submitted documents',
      'Waiting for updated business information',
    ],
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          icon: ShieldCheck,
          label: 'Approved',
        };
      case 'rejected':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          icon: ShieldX,
          label: 'Rejected',
        };
      case 'pending':
      default:
        return {
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          icon: Shield,
          label: 'Pending',
        };
    }
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Verification Management"
      maxWidth="2xl"
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
              {typeDisplay.label} Verification
            </p>

            {/* Current Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-text-muted">Current Status:</span>
              <div
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  currentStatus === 'approved'
                    ? 'bg-mint-fresh/20 text-bottle-green'
                    : currentStatus === 'rejected'
                      ? 'bg-tomato-red/20 text-tomato-red'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {currentStatus === 'approved' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Approved
                  </>
                ) : currentStatus === 'rejected' ? (
                  <>
                    <ShieldX className="w-4 h-4" />
                    Rejected
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Pending
                  </>
                )}
              </div>
            </div>

            {/* Verification Date */}
            {businessEntity?.verificationDate && (
              <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
                <Calendar className="w-4 h-4" />
                Verified on{' '}
                {new Date(businessEntity.verificationDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Action Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Select Verification Action
          </h3>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Approve Option */}
            <button
              onClick={() => handleActionSelect('approved')}
              disabled={currentStatus === 'approved'}
              className={`p-4 border-2 rounded-2xl transition-all ${
                selectedAction === 'approved'
                  ? 'border-bottle-green bg-mint-fresh/10 text-bottle-green'
                  : currentStatus === 'approved'
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedAction === 'approved'
                      ? 'bg-bottle-green text-white'
                      : currentStatus === 'approved'
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Approve</p>
                  <p className="text-sm opacity-75">Grant full access</p>
                </div>
              </div>
            </button>

            {/* Reject Option */}
            <button
              onClick={() => handleActionSelect('rejected')}
              disabled={currentStatus === 'rejected'}
              className={`p-4 border-2 rounded-2xl transition-all ${
                selectedAction === 'rejected'
                  ? 'border-tomato-red bg-tomato-red/10 text-tomato-red'
                  : currentStatus === 'rejected'
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedAction === 'rejected'
                      ? 'bg-tomato-red text-white'
                      : currentStatus === 'rejected'
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldX className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Reject</p>
                  <p className="text-sm opacity-75">Deny verification</p>
                </div>
              </div>
            </button>

            {/* Pending Option */}
            <button
              onClick={() => handleActionSelect('pending')}
              disabled={currentStatus === 'pending'}
              className={`p-4 border-2 rounded-2xl transition-all ${
                selectedAction === 'pending'
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : currentStatus === 'pending'
                    ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selectedAction === 'pending'
                      ? 'bg-amber-600 text-white'
                      : currentStatus === 'pending'
                        ? 'bg-gray-200 text-gray-400'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Set Pending</p>
                  <p className="text-sm opacity-75">Require review</p>
                </div>
              </div>
            </button>
          </div>

          {/* Impact Warning */}
          {selectedAction === 'rejected' && (
            <div className="flex items-start gap-3 p-4 bg-red-50/80 border border-red-200/50 rounded-2xl mb-6">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-red-800">
                <p className="font-medium mb-1">Rejection Impact</p>
                <p className="text-sm">
                  Rejecting will immediately suspend this {approval.type}'s
                  platform access.
                  {approval.type === 'vendor'
                    ? ' They cannot create listings or process orders.'
                    : ' They cannot place orders or access services.'}{' '}
                  Provide detailed feedback for resubmission.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Reason Input */}
        {selectedAction && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
              {selectedAction === 'approved'
                ? 'Approval'
                : selectedAction === 'rejected'
                  ? 'Rejection'
                  : 'Pending'}{' '}
              Reason
              {selectedAction === 'rejected' && (
                <span className="text-red-600 ml-1">*</span>
              )}
            </h3>

            {/* Quick Reason Templates */}
            {statusTemplates[selectedAction] && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-text-dark dark:text-white mb-3">
                  Quick Templates (click to select)
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusTemplates[selectedAction].map((template) => (
                    <button
                      key={template}
                      onClick={() => setReason(template)}
                      className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                        reason === template
                          ? selectedAction === 'approved'
                            ? 'bg-bottle-green text-white'
                            : selectedAction === 'rejected'
                              ? 'bg-tomato-red text-white'
                              : 'bg-amber-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <FormField
              label="Detailed Reason"
              required={selectedAction === 'rejected'}
            >
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  selectedAction === 'approved'
                    ? 'Optional notes for approval...'
                    : selectedAction === 'rejected'
                      ? 'Provide detailed feedback on what needs to be fixed for resubmission...'
                      : 'Reason for setting to pending status...'
                }
                rows={selectedAction === 'rejected' ? 5 : 4}
                className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 ${
                  selectedAction === 'approved'
                    ? 'focus:ring-bottle-green/20'
                    : selectedAction === 'rejected'
                      ? 'focus:ring-tomato-red/20'
                      : 'focus:ring-amber-600/20'
                }`}
              />
            </FormField>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className={`flex-1 ${
              selectedAction === 'approved'
                ? 'bg-bottle-green hover:bg-bottle-green/90'
                : selectedAction === 'rejected'
                  ? 'bg-tomato-red hover:bg-tomato-red/90'
                  : selectedAction === 'pending'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-gray-300 hover:bg-gray-400'
            } text-white`}
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !selectedAction ||
              (selectedAction === 'rejected' && !reason.trim())
            }
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {selectedAction === 'approved' ? (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                ) : selectedAction === 'rejected' ? (
                  <ShieldX className="w-4 h-4 mr-2" />
                ) : selectedAction === 'pending' ? (
                  <Shield className="w-4 h-4 mr-2" />
                ) : null}
                {selectedAction === 'approved'
                  ? 'Approve Business'
                  : selectedAction === 'rejected'
                    ? 'Reject Business'
                    : selectedAction === 'pending'
                      ? 'Set to Pending'
                      : 'Select Action'}
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

export default VerificationToggleModal;
