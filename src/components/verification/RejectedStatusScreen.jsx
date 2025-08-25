import React from 'react';
import { XCircle, RefreshCw, AlertTriangle, FileText, Phone, Mail } from 'lucide-react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import Button from '../ui/Button';

/**
 * RejectedStatusScreen - Shows when user's business verification has been rejected
 * Provides admin feedback and clear guidance for resubmission
 */
const RejectedStatusScreen = () => {
  const {
    verificationStatus,
    adminNotes,
    businessName,
    businessType,
    nextSteps,
    isLoading,
    refetch,
    user,
    getRejectionGuidance,
  } = useBusinessVerification();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-text-muted">
          Loading verification status...
        </div>
      </div>
    );
  }

  if (verificationStatus !== 'rejected') {
    return null; // User is not rejected, don't show this screen
  }

  const rejectionGuidance = getRejectionGuidance();

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gradient-to-r from-red-50/80 to-pink-50/80 backdrop-blur-sm rounded-3xl border border-red-200/50 shadow-soft">
      <div className="text-center mb-8">
        {/* Status Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-text-dark mb-3">
          Verification Rejected
        </h2>

        {/* Business Info */}
        <div className="text-text-muted mb-6">
          <p className="text-lg">
            {businessName && (
              <span className="font-medium text-text-dark">{businessName}</span>
            )}
            {businessName && ' - '}
            <span className="capitalize">{businessType}</span> verification has been rejected
          </p>
          <p className="text-sm mt-2">
            Account: <span className="font-medium">{user?.name}</span>
          </p>
        </div>
      </div>

      {/* Admin Feedback Section */}
      {adminNotes && (
        <div className="bg-red-100/50 border border-red-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-3">
                Admin Feedback
              </h3>
              <div className="bg-white/60 rounded-xl p-4 border border-red-200/50">
                <p className="text-red-900 leading-relaxed">{adminNotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Steps */}
      {nextSteps && nextSteps.length > 0 && (
        <div className="bg-white/60 border border-red-200/30 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-600" />
            Required Actions
          </h3>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-text-dark leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Issues & Solutions */}
      <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border border-blue-200/30 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          Common Issues & Solutions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium text-text-dark">Documentation Issues:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Ensure all documents are clear and readable</li>
              <li>• Upload documents in supported formats (PDF, JPG, PNG)</li>
              <li>• Verify expiration dates on licenses</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-text-dark">Information Accuracy:</h4>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>• Double-check business name spelling</li>
              <li>• Ensure address matches official documents</li>
              <li>• Verify contact information is current</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 flex items-center gap-2"
          onClick={() => {
            // Navigate to business profile edit
            window.location.href = '/profile/business';
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Update Application
        </Button>

        <Button
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50 px-8 py-3"
          onClick={refetch}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </Button>
      </div>

      {/* Support Contact */}
      <div className="mt-8 pt-6 border-t border-red-200/30 text-center">
        <p className="text-text-muted mb-4">
          Need help resolving these issues?
        </p>
        <div className="flex justify-center gap-6">
          <a
            href="mailto:support@aarothfresh.com"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email Support
          </a>
          <a
            href="tel:+1234567890"
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default RejectedStatusScreen;