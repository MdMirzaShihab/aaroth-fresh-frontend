import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  Building2,
  Shield,
} from 'lucide-react';
import { useUpdateRestaurantVerificationStatusMutation } from '../../../../store/slices/apiSlice';
import { addNotification } from '../../../../store/slices/notificationSlice';
import Button from '../../../../components/ui/Button';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';

const RestaurantVerificationModal = ({ restaurant, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const [selectedAction, setSelectedAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const [updateVerification, { isLoading }] = useUpdateRestaurantVerificationStatusMutation();

  if (!isOpen) return null;

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!selectedAction) {
      newErrors.action = 'Please select an action';
    }

    if (selectedAction === 'rejected' && !rejectionReason.trim()) {
      newErrors.reason = 'Rejection reason is required';
    }

    if (selectedAction === 'rejected' && rejectionReason.trim().length < 10) {
      newErrors.reason = 'Rejection reason must be at least 10 characters';
    }

    setErrors(newErrors || {});
    return Object.keys(newErrors || {}).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setShowConfirm(true);
  };

  // Confirm verification update
  const handleConfirmUpdate = async () => {
    try {
      const payload = {
        id: restaurant._id,
        status: selectedAction,
      };

      if (selectedAction === 'rejected' && rejectionReason.trim()) {
        payload.reason = rejectionReason.trim();
      }

      await updateVerification(payload).unwrap();

      dispatch(
        addNotification({
          type: 'success',
          title: 'Verification Updated',
          message: `Restaurant has been ${selectedAction}${selectedAction === 'rejected' ? ' with reason provided' : ''}`,
        })
      );

      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.data?.message || 'Failed to update verification status',
        })
      );
    } finally {
      setShowConfirm(false);
    }
  };

  // Action configurations
  const actionConfig = {
    approved: {
      icon: CheckCircle,
      color: 'text-muted-olive',
      bgColor: 'bg-sage-green/20',
      label: 'Approve Restaurant',
      description: 'Grant this restaurant access to the platform',
      confirmMessage: 'This restaurant will be granted access to place orders and use all platform features.',
    },
    rejected: {
      icon: XCircle,
      color: 'text-tomato-red',
      bgColor: 'bg-tomato-red/20',
      label: 'Reject Restaurant',
      description: 'Deny this restaurant access to the platform',
      confirmMessage: 'This restaurant will be notified of the rejection and the reason provided.',
    },
    pending: {
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      label: 'Mark as Pending',
      description: 'Keep this restaurant in pending status for further review',
      confirmMessage: 'This restaurant will remain in pending status.',
    },
  };

  // Common rejection reasons
  const commonReasons = [
    'Incomplete business documentation',
    'Invalid business license',
    'Address verification failed',
    'Tax ID verification failed',
    'Duplicate business registration',
    'Insufficient business information',
    'Policy violations detected',
    'Unable to verify business authenticity',
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-muted-olive" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-dark">Restaurant Verification</h2>
                <p className="text-text-muted text-sm">{restaurant.businessName}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-text-muted hover:text-text-dark"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Restaurant Summary */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-text-dark mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Restaurant Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-text-muted">Business Name:</span>
                  <span className="ml-2 text-text-dark font-medium">{restaurant.businessName}</span>
                </div>
                <div>
                  <span className="text-text-muted">Owner:</span>
                  <span className="ml-2 text-text-dark font-medium">{restaurant.userId?.name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-text-muted">Registration Date:</span>
                  <span className="ml-2 text-text-dark font-medium">
                    {new Date(restaurant.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-text-muted">Current Status:</span>
                  <span className="ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      restaurant.verificationStatus === 'pending' ? 'bg-orange-50 text-orange-600' :
                      restaurant.verificationStatus === 'approved' ? 'bg-sage-green/20 text-muted-olive' :
                      'bg-tomato-red/20 text-tomato-red'
                    }`}>
                      {restaurant.verificationStatus?.charAt(0).toUpperCase() + restaurant.verificationStatus?.slice(1)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Action Selection */}
              <div>
                <label className="block text-sm font-medium text-text-dark mb-3">
                  Select Verification Action
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(actionConfig || {}).map(([action, config]) => {
                    const ActionIcon = config.icon;
                    return (
                      <label
                        key={action}
                        className={`flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          selectedAction === action
                            ? `border-current ${config.color} ${config.bgColor}`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="action"
                          value={action}
                          checked={selectedAction === action}
                          onChange={(e) => setSelectedAction(e.target.value)}
                          className="sr-only"
                        />
                        <ActionIcon className={`w-5 h-5 mr-3 ${
                          selectedAction === action ? config.color : 'text-text-muted'
                        }`} />
                        <div>
                          <div className={`font-medium ${
                            selectedAction === action ? config.color : 'text-text-dark'
                          }`}>
                            {config.label}
                          </div>
                          <div className="text-sm text-text-muted">{config.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {errors.action && (
                  <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {errors.action}
                  </p>
                )}
              </div>

              {/* Rejection Reason */}
              {selectedAction === 'rejected' && (
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-3">
                    Rejection Reason <span className="text-tomato-red">*</span>
                  </label>
                  
                  {/* Common Reasons */}
                  <div className="mb-4">
                    <p className="text-sm text-text-muted mb-2">Quick reasons:</p>
                    <div className="flex flex-wrap gap-2">
                      {commonReasons.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() => setRejectionReason(reason)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-sm text-text-dark rounded-xl transition-colors"
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Reason */}
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a detailed reason for rejecting this restaurant's verification..."
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 resize-none ${
                      errors.reason ? 'border-tomato-red/50 bg-tomato-red/5' : 'border-gray-200'
                    }`}
                  />
                  {errors.reason && (
                    <p className="text-tomato-red text-sm mt-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.reason}
                    </p>
                  )}
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-text-muted">
                      This reason will be sent to the restaurant owner via email.
                    </p>
                    <span className={`text-xs ${
                      rejectionReason.length < 10 ? 'text-tomato-red' : 'text-text-muted'
                    }`}>
                      {rejectionReason.length}/500
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !selectedAction}
                  className={
                    selectedAction === 'approved'
                      ? 'bg-muted-olive hover:bg-muted-olive/90 text-white'
                      : selectedAction === 'rejected'
                      ? 'bg-tomato-red hover:bg-tomato-red/90 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }
                >
                  {isLoading ? 'Updating...' : 'Update Verification'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirm && selectedAction && (
        <ConfirmDialog
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmUpdate}
          title={`Confirm ${actionConfig[selectedAction].label}`}
          backdropClassName="!z-[90]"
          message={
            <div className="space-y-3">
              <p>{actionConfig[selectedAction].confirmMessage}</p>
              {selectedAction === 'rejected' && rejectionReason && (
                <div className="bg-tomato-red/10 p-3 rounded-xl">
                  <p className="text-sm font-medium text-text-dark mb-1">Rejection Reason:</p>
                  <p className="text-sm text-text-dark">{rejectionReason}</p>
                </div>
              )}
              <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-sm text-text-muted">
                  <strong>Restaurant:</strong> {restaurant.businessName}
                </p>
                <p className="text-sm text-text-muted">
                  <strong>Owner:</strong> {restaurant.userId?.name || 'Unknown'}
                </p>
              </div>
            </div>
          }
          confirmText={selectedAction === 'approved' ? 'Approve' : selectedAction === 'rejected' ? 'Reject' : 'Update'}
          cancelText="Cancel"
          variant={selectedAction === 'rejected' ? 'danger' : 'primary'}
        />
      )}
    </>
  );
};

export default RestaurantVerificationModal;