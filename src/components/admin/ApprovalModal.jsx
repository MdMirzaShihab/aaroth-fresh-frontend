import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  X,
  Store,
  Utensils,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Building,
  CreditCard,
  Clock,
  AlertTriangle,
  Download,
  Shield,
  ShieldCheck,
  ShieldX,
  History,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';

const ApprovalModal = ({
  approval,
  onClose,
  onApprove,
  onReject,
  isLoading,
}) => {
  const [actionType, setActionType] = useState(null); // 'approve' or 'reject'
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!approval) {
      setActionType(null);
      setNotes('');
      setReason('');
    }
  }, [approval]);

  if (!approval) return null;

  // Get type display information
  const getTypeDisplay = (type) => {
    switch (type) {
      case 'vendor':
        return {
          icon: Store,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'Vendor Application',
        };
      case 'restaurant':
        return {
          icon: Utensils,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          label: 'Restaurant Application',
        };
      default:
        return {
          icon: User,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          label: 'Unknown Application',
        };
    }
  };

  // Handle approval submission
  const handleApprove = async () => {
    if (!notes.trim()) {
      alert('Please provide approval notes');
      return;
    }

    await onApprove({ notes: notes.trim() });
    setActionType(null);
    setNotes('');
  };

  // Handle rejection submission
  const handleReject = async () => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    await onReject({ reason: reason.trim() });
    setActionType(null);
    setReason('');
  };

  const typeDisplay = getTypeDisplay(approval.type);
  const daysWaiting = approval.createdAt
    ? Math.floor(
        (new Date() - new Date(approval.createdAt)) / (1000 * 60 * 60 * 24)
      )
    : 0;

  // Enhanced verification status
  const businessEntity =
    approval.type === 'vendor' ? approval.vendorId : approval.restaurantId;
  const isVerified = businessEntity?.isVerified || false;
  const verificationDate = businessEntity?.verificationDate;
  const statusUpdatedAt = businessEntity?.statusUpdatedAt;
  const adminNotes = businessEntity?.adminNotes;

  // Common rejection reasons
  const commonReasons = [
    'Incomplete documentation',
    'Invalid business license',
    'Insufficient business information',
    'Non-compliance with platform requirements',
    'Duplicate application',
    'Business address verification failed',
    'Contact information verification failed',
  ];

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Application Review"
      maxWidth="4xl"
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
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-text-dark dark:text-white">
                  {approval.businessName || approval.name || 'Unknown Business'}
                </h2>
                <p className="text-text-muted mb-2">{typeDisplay.label}</p>

                {/* Enhanced Status and Verification */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Verification Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                      isVerified
                        ? 'bg-mint-fresh/20 text-bottle-green'
                        : statusUpdatedAt
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-earthy-yellow/20 text-earthy-brown'
                    }`}
                  >
                    {isVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verified Business
                      </>
                    ) : statusUpdatedAt ? (
                      <>
                        <ShieldX className="w-4 h-4" />
                        Unverified
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4" />
                        Pending Review
                      </>
                    )}
                  </span>

                  {/* Traditional Status for Legacy Compatibility */}
                  {(approval.status === 'approved' ||
                    approval.status === 'rejected') && (
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        approval.status === 'approved'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {approval.status === 'approved'
                        ? 'Legacy Approved'
                        : 'Legacy Rejected'}
                    </span>
                  )}

                  {/* Waiting Time */}
                  {daysWaiting > 0 && (
                    <span
                      className={`text-sm flex items-center gap-1 ${
                        daysWaiting > 7
                          ? 'text-tomato-red'
                          : daysWaiting > 3
                            ? 'text-earthy-brown'
                            : 'text-text-muted'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      {daysWaiting} days waiting
                      {daysWaiting > 7 && <AlertTriangle className="w-4 h-4" />}
                    </span>
                  )}
                </div>

                {/* Verification Date */}
                {verificationDate && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-text-muted">
                    <Calendar className="w-4 h-4" />
                    Verified on{' '}
                    {new Date(verificationDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Basic Information */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text-muted">Phone</p>
                    <p className="font-medium text-text-dark dark:text-white">
                      {approval.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                {approval.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-muted">Email</p>
                      <p className="font-medium text-text-dark dark:text-white">
                        {approval.email}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-text-muted">Address</p>
                    <p className="font-medium text-text-dark dark:text-white">
                      {typeof approval.address === 'string'
                        ? approval.address
                        : approval.address
                          ? `${approval.address.street || ''}, ${approval.address.city || ''}, ${approval.address.state || ''} ${approval.address.zipCode || ''}`
                          : 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-text-muted flex-shrink-0" />
                  <div>
                    <p className="text-sm text-text-muted">Application Date</p>
                    <p className="font-medium text-text-dark dark:text-white">
                      {approval.createdAt
                        ? new Date(approval.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : 'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Business Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                Business Information
              </h3>
              <div className="space-y-4">
                {approval.businessLicense && (
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-muted">
                        Business License
                      </p>
                      <p className="font-medium text-text-dark dark:text-white">
                        {approval.businessLicense}
                      </p>
                    </div>
                  </div>
                )}

                {approval.businessType && (
                  <div className="flex items-center gap-3">
                    <Building className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-muted">Business Type</p>
                      <p className="font-medium text-text-dark dark:text-white">
                        {approval.businessType}
                      </p>
                    </div>
                  </div>
                )}

                {approval.cuisineType && (
                  <div className="flex items-center gap-3">
                    <Utensils className="w-5 h-5 text-text-muted flex-shrink-0" />
                    <div>
                      <p className="text-sm text-text-muted">Cuisine Type</p>
                      <p className="font-medium text-text-dark dark:text-white">
                        {approval.cuisineType}
                      </p>
                    </div>
                  </div>
                )}

                {approval.description && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-text-muted flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-text-muted">
                        Business Description
                      </p>
                      <p className="font-medium text-text-dark dark:text-white">
                        {approval.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Documents and Actions */}
          <div className="space-y-6">
            {/* Documents */}
            {approval.documents && approval.documents.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                  Submitted Documents
                </h3>
                <div className="space-y-3">
                  {approval.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-text-muted" />
                        <div>
                          <p className="font-medium text-text-dark dark:text-white">
                            {doc.name || `Document ${index + 1}`}
                          </p>
                          <p className="text-sm text-text-muted">
                            {doc.type || 'Unknown type'} •{' '}
                            {doc.size || 'Unknown size'}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Enhanced Verification History */}
            {(adminNotes ||
              statusUpdatedAt ||
              verificationDate ||
              approval.approvalNotes ||
              approval.rejectionReason) && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Verification History
                </h3>

                <div className="space-y-4">
                  {/* Current Verification Status */}
                  {(isVerified || statusUpdatedAt) && (
                    <div className="border-l-4 border-l-bottle-green pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        {isVerified ? (
                          <>
                            <ShieldCheck className="w-5 h-5 text-bottle-green" />
                            <span className="font-medium text-bottle-green">
                              Business Verified
                            </span>
                          </>
                        ) : (
                          <>
                            <ShieldX className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-600">
                              Verification Revoked/Unverified
                            </span>
                          </>
                        )}
                      </div>

                      {statusUpdatedAt && (
                        <p className="text-sm text-text-muted mb-2">
                          Updated:{' '}
                          {new Date(statusUpdatedAt).toLocaleDateString()} at{' '}
                          {new Date(statusUpdatedAt).toLocaleTimeString()}
                        </p>
                      )}

                      {adminNotes && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <p className="text-sm text-text-dark dark:text-white">
                            "{adminNotes}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Approval History */}
                  {(approval.approvalNotes || approval.rejectionReason) && (
                    <div className="border-l-4 border-l-gray-300 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        {approval.status === 'approved' ? (
                          <CheckCircle className="w-5 h-5 text-blue-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-tomato-red" />
                        )}
                        <span className="font-medium text-text-dark dark:text-white">
                          Legacy{' '}
                          {approval.status === 'approved'
                            ? 'Approval'
                            : 'Rejection'}
                        </span>
                      </div>

                      {approval.processedBy && (
                        <p className="text-sm text-text-muted">
                          By: {approval.processedBy}
                        </p>
                      )}

                      {approval.processedAt && (
                        <p className="text-sm text-text-muted mb-2">
                          Date:{' '}
                          {new Date(approval.processedAt).toLocaleDateString()}
                        </p>
                      )}

                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-text-dark dark:text-white">
                          "{approval.approvalNotes || approval.rejectionReason}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Action Section - Only for truly pending applications */}
            {!statusUpdatedAt && !isVerified && !adminNotes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-text-dark dark:text-white mb-4">
                  Review Actions
                </h3>

                {!actionType && (
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 bg-bottle-green hover:bg-bottle-green/90"
                      onClick={() => setActionType('approve')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
                      onClick={() => setActionType('reject')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                )}

                {/* Approval Form */}
                {actionType === 'approve' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-bottle-green">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Approve Application</span>
                    </div>

                    <FormField label="Approval Notes" required>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Please provide notes about the approval (visible to the applicant)..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
                      />
                    </FormField>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-bottle-green hover:bg-bottle-green/90"
                        onClick={handleApprove}
                        disabled={isLoading || !notes.trim()}
                      >
                        {isLoading ? 'Processing...' : 'Confirm Approval'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActionType(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Rejection Form */}
                {actionType === 'reject' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-tomato-red">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Reject Application</span>
                    </div>

                    {/* Quick Rejection Reasons */}
                    <div>
                      <label className="block text-sm font-medium text-text-dark dark:text-white mb-2">
                        Common Reasons (click to select)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {commonReasons.map((commonReason) => (
                          <button
                            key={commonReason}
                            onClick={() => setReason(commonReason)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              reason === commonReason
                                ? 'bg-tomato-red text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {commonReason}
                          </button>
                        ))}
                      </div>
                    </div>

                    <FormField label="Rejection Reason" required>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Please provide a detailed reason for rejection (visible to the applicant)..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-tomato-red/20"
                      />
                    </FormField>

                    <div className="flex gap-3">
                      <Button
                        className="flex-1 bg-tomato-red hover:bg-tomato-red/90 text-white"
                        onClick={handleReject}
                        disabled={isLoading || !reason.trim()}
                      >
                        {isLoading ? 'Processing...' : 'Confirm Rejection'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setActionType(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
