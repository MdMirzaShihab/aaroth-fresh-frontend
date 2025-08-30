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
  Users,
  Zap,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import FormField from '../ui/FormField';

const BulkVerificationModal = ({
  selectedApprovals,
  onClose,
  onBulkVerification,
  isLoading,
}) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [reason, setReason] = useState('');
  const [entityType, setEntityType] = useState('all');

  useEffect(() => {
    if (selectedApprovals.length === 0) {
      onClose();
    }
  }, [selectedApprovals, onClose]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for bulk verification changes');
      return;
    }

    // Group by entity type if needed
    const userIds = Array.from(selectedApprovals);

    await onBulkVerification({
      userIds,
      entityType: entityType === 'all' ? undefined : entityType,
      status: isVerifying ? 'approved' : 'rejected',
      reason: reason.trim(),
    });

    setReason('');
  };

  // Analyze selected approvals
  const approvalsByType = selectedApprovals.reduce(
    (acc, approval) => {
      if (approval.type === 'vendor') {
        acc.vendors.push(approval);
      } else if (approval.type === 'restaurant') {
        acc.restaurants.push(approval);
      }
      return acc;
    },
    { vendors: [], restaurants: [] }
  );

  const totalSelected = selectedApprovals.length;
  const vendorCount = approvalsByType.vendors.length;
  const restaurantCount = approvalsByType.restaurants.length;

  // Bulk verification templates
  const bulkTemplates = {
    verify: [
      'Bulk verification after document review completion',
      'Mass approval following compliance audit',
      'Quarterly verification batch processing',
      'System migration - re-verification of existing businesses',
      'Policy update compliance - bulk verification granted',
    ],
    revoke: [
      'Bulk verification suspension pending policy updates',
      'Mass audit required - temporary verification removal',
      'Compliance review - bulk verification suspended',
      'System security audit - verification temporarily revoked',
      'Documentation update required - bulk verification paused',
    ],
  };

  const currentTemplates = isVerifying
    ? bulkTemplates.verify
    : bulkTemplates.revoke;

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Bulk Verification Management"
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-2xl bg-muted-olive/10 flex items-center justify-center flex-shrink-0">
            <Zap className="w-8 h-8 text-muted-olive" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-semibold text-text-dark dark:text-white mb-2">
              Bulk Verification Update
            </h2>
            <p className="text-text-muted mb-3">
              Update verification status for {totalSelected} selected
              applications
            </p>

            {/* Selection Summary */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-lg">
                <Store className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {vendorCount} Vendors
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-lg">
                <Utensils className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  {restaurantCount} Restaurants
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Verification Action
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Bulk Verify Option */}
            <button
              onClick={() => setIsVerifying(true)}
              className={`p-4 border-2 rounded-2xl transition-all ${
                isVerifying
                  ? 'border-muted-olive bg-sage-green/10 text-muted-olive'
                  : 'border-gray-200 hover:border-gray-300 text-text-muted'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isVerifying
                      ? 'bg-muted-olive text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Bulk Grant Verification</p>
                  <p className="text-sm opacity-75">
                    Enable operations for all selected
                  </p>
                </div>
              </div>
            </button>

            {/* Bulk Revoke Option */}
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
                  <p className="font-medium">Bulk Revoke Verification</p>
                  <p className="text-sm opacity-75">
                    Suspend operations for all selected
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Entity Type Filter */}
          {vendorCount > 0 && restaurantCount > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-text-dark dark:text-white mb-3">
                Apply to Entity Type
              </h4>
              <div className="flex gap-3">
                <button
                  onClick={() => setEntityType('all')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    entityType === 'all'
                      ? 'bg-muted-olive text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All ({totalSelected})
                </button>
                <button
                  onClick={() => setEntityType('vendor')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    entityType === 'vendor'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Vendors Only ({vendorCount})
                </button>
                <button
                  onClick={() => setEntityType('restaurant')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    entityType === 'restaurant'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Restaurants Only ({restaurantCount})
                </button>
              </div>
            </div>
          )}

          {/* Impact Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-amber-800">
              <p className="font-medium mb-1">Bulk Operation Warning</p>
              <p className="text-sm">
                This will {isVerifying ? 'enable' : 'suspend'} business
                operations for{' '}
                {entityType === 'all'
                  ? `all ${totalSelected} selected applications`
                  : entityType === 'vendor'
                    ? `${vendorCount} vendor applications`
                    : `${restaurantCount} restaurant applications`}
                . This action affects multiple businesses simultaneously.
              </p>
            </div>
          </div>
        </Card>

        {/* Reason Input */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
            Bulk {isVerifying ? 'Verification' : 'Revocation'} Reason
          </h3>

          {/* Quick Reason Templates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-dark dark:text-white mb-3">
              Common Bulk Reasons (click to select)
            </label>
            <div className="flex flex-wrap gap-2">
              {currentTemplates.map((template) => (
                <button
                  key={template}
                  onClick={() => setReason(template)}
                  className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                    reason === template
                      ? isVerifying
                        ? 'bg-muted-olive text-white'
                        : 'bg-tomato-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          <FormField label="Detailed Bulk Reason" required>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Please provide a detailed reason for bulk ${isVerifying ? 'verification' : 'revocation'}. This will be applied to all selected applications...`}
              rows={4}
              className={`w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 ${
                isVerifying
                  ? 'focus:ring-muted-olive/20'
                  : 'focus:ring-tomato-red/20'
              }`}
            />
          </FormField>

          {/* Processing Summary */}
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl">
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">
                  Bulk Processing Summary:
                </p>
                <ul className="text-blue-800 space-y-1">
                  <li>• {totalSelected} applications will be processed</li>
                  <li>• Each business will receive individual notifications</li>
                  <li>• Audit trail will be maintained for all changes</li>
                  <li>• Processing may take a few moments to complete</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            className={`flex-1 ${
              isVerifying
                ? 'bg-muted-olive hover:bg-muted-olive/90'
                : 'bg-tomato-red hover:bg-tomato-red/90'
            } text-white`}
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading ? (
              'Processing Bulk Operation...'
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                {isVerifying
                  ? 'Bulk Grant Verification'
                  : 'Bulk Revoke Verification'}
                (
                {entityType === 'all'
                  ? totalSelected
                  : entityType === 'vendor'
                    ? vendorCount
                    : restaurantCount}
                )
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

export default BulkVerificationModal;
