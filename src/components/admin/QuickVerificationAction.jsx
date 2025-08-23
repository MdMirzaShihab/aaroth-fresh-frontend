import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Shield,
} from 'lucide-react';
import Button from '../ui/Button';
import { Modal } from '../ui/Modal';

/**
 * QuickVerificationAction - Quick verification toggle with reason modal
 *
 * @param {string} entityId - ID of the entity
 * @param {string} entityType - Type of entity ('vendor' or 'restaurant')
 * @param {boolean} isVerified - Current verification status
 * @param {Function} onToggleVerification - Callback for verification toggle
 * @param {boolean} isLoading - Loading state
 * @param {boolean} disabled - Whether actions are disabled
 * @param {string} size - Button size ('sm', 'md', 'lg')
 */
const QuickVerificationAction = ({
  entityId,
  entityType,
  isVerified,
  onToggleVerification,
  isLoading = false,
  disabled = false,
  size = 'md',
}) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reason, setReason] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const handleAction = (action) => {
    if (action === 'verify') {
      // Direct verification without reason required
      onToggleVerification({
        id: entityId,
        isVerified: true,
        reason: `${entityType} business verified by admin`,
      });
    } else if (action === 'revoke') {
      // Revoke requires reason
      setPendingAction('revoke');
      setShowReasonModal(true);
    }
  };

  const handleSubmitReason = () => {
    if (reason.trim().length < 5) return;

    onToggleVerification({
      id: entityId,
      isVerified: false,
      reason: reason.trim(),
    });

    setShowReasonModal(false);
    setReason('');
    setPendingAction(null);
  };

  const handleCancel = () => {
    setShowReasonModal(false);
    setReason('');
    setPendingAction(null);
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2 text-sm min-h-[44px]',
    lg: 'px-6 py-3 text-base min-h-[48px]',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="w-5 h-5 animate-spin text-bottle-green" />
        <span className="ml-2 text-sm text-text-muted">Processing...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {!isVerified ? (
          <Button
            onClick={() => handleAction('verify')}
            disabled={disabled}
            className={`flex items-center gap-2 bg-gradient-secondary text-white rounded-xl font-medium hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`}
          >
            <CheckCircle className="w-4 h-4" />
            Verify
          </Button>
        ) : (
          <Button
            onClick={() => handleAction('revoke')}
            disabled={disabled}
            variant="outline"
            className={`flex items-center gap-2 border-2 border-tomato-red/30 text-tomato-red hover:bg-tomato-red/5 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]}`}
          >
            <XCircle className="w-4 h-4" />
            Revoke
          </Button>
        )}
      </div>

      {/* Reason Modal */}
      <Modal
        isOpen={showReasonModal}
        onClose={handleCancel}
        title="Verification Revocation"
        size="md"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-dark">
                Reason Required
              </h3>
              <p className="text-text-muted">
                Please provide a reason for revoking verification
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Revocation Reason *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter detailed reason for revoking verification..."
                className="w-full px-4 py-3 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[120px] resize-none focus:outline-none"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-text-muted">
                  Minimum 5 characters required
                </span>
                <span className="text-xs text-text-muted">
                  {reason.length}/500 characters
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1 px-4 py-3 rounded-xl text-text-dark hover:bg-gray-100 font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReason}
                disabled={reason.trim().length < 5}
                className="flex-1 bg-tomato-red/90 hover:bg-tomato-red text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Revoke
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QuickVerificationAction;
