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
  onToggleVerification,
  isLoading,
}) => {
  const [reason, setReason] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (approval) {
      // Determine current verification status
      const currentlyVerified =
        approval.type === 'vendor'
          ? approval.vendorId?.isVerified
          : approval.restaurantId?.isVerified;

      setIsVerifying(!currentlyVerified);
      setReason('');
    }
  }, [approval]);

  if (!approval) return null;

  const businessEntity =
    approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
  const isCurrentlyVerified = businessEntity?.isVerified || false;
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
    if (!reason.trim()) {
      alert('Please provide a reason for this verification change');
      return;
    }

    const entityId = businessEntity?._id;
    if (!entityId) {
      alert('Entity ID not found');
      return;
    }

    await onToggleVerification({
      id: entityId,
      entityType: approval.type,
      isVerified: isVerifying,
      reason: reason.trim(),
    });

    setReason('');
  };

  // Verification action templates
  const verificationTemplates = {
    verify: [
      'Business documentation verified and approved',
      'All requirements met - verified for platform operations',
      'License and credentials validated successfully',
      'Business compliance confirmed - verified status granted',
      'Manual verification completed - business approved',
    ],
    revoke: [
      'Business license expired - verification revoked',
      'Failed compliance check - verification suspended',
      'Incomplete documentation - verification removed',
      'Policy violation - verification status revoked',
      'Requires re-verification - status temporarily suspended',
    ],
  };

  const currentTemplates = isVerifying
    ? verificationTemplates.verify
    : verificationTemplates.revoke;

  return (
    <Modal
      isOpen={true}
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
                  isCurrentlyVerified
                    ? 'bg-mint-fresh/20 text-bottle-green'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isCurrentlyVerified ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verified
                  </>
                ) : (
                  <>
                    <ShieldX className="w-4 h-4" />
                    Unverified
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
            Verification Action
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Verify Option */}
            <button
              onClick={() => setIsVerifying(true)}
              className={`p-4 border-2 rounded-2xl transition-all ${
                isVerifying
                  ? 'border-bottle-green bg-mint-fresh/10 text-bottle-green'
                  : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isVerifying
                      ? 'bg-bottle-green text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Grant Verification</p>
                  <p className="text-sm opacity-75">
                    Allow business operations
                  </p>
                </div>
              </div>
            </button>

            {/* Revoke Option */}
            <button
              onClick={() => setIsVerifying(false)}
              className={`p-4 border-2 rounded-2xl transition-all ${
                !isVerifying
                  ? 'border-tomato-red bg-tomato-red/10 text-tomato-red'
                  : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    !isVerifying
                      ? 'bg-tomato-red text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldX className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Revoke Verification</p>
                  <p className="text-sm opacity-75">
                    Suspend business operations
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Impact Warning */}
          {!isVerifying && (
            <div className="flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-amber-800">
                <p className="font-medium mb-1">Impact Warning</p>
                <p className="text-sm">
                  Revoking verification will immediately suspend this{' '}
                  {approval.type}'s ability to
                  {approval.type === 'vendor'
                    ? ' create listings and process orders'
                    : ' place orders and access vendor services'}
                  . This action affects business operations immediately.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Reason Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            {isVerifying ? 'Verification' : 'Revocation'} Reason
          </h3>

          {/* Quick Reason Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-3">
              Quick Templates (click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTemplates.map((template) => (
                <button
                  key={template}
                  onClick={() => setReason(template)}
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    reason === template
                      ? isVerifying
                        ? 'bg-bottle-green text-white'
                        : 'bg-tomato-red text-white'
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
              placeholder={`Please provide a detailed reason for ${isVerifying ? 'granting' : 'revoking'} verification...`}
              rows={4}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 ${
                isVerifying
                  ? 'focus:ring-bottle-green/20'
                  : 'focus:ring-tomato-red/20'
              }`}
            />
          </FormField>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className={`flex-1 ${
              isVerifying
                ? 'bg-bottle-green hover:bg-bottle-green/90'
                : 'bg-tomato-red hover:bg-tomato-red/90'
            } text-white`}
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                {isVerifying ? (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                ) : (
                  <ShieldX className="w-4 h-4 mr-2" />
                )}
                {isVerifying ? 'Grant Verification' : 'Revoke Verification'}
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
