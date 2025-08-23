import React from 'react';
import { Clock, RefreshCw, Mail, Phone, AlertCircle } from 'lucide-react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import Button from '../ui/Button';

/**
 * VerificationPendingScreen - Shows when user's business needs verification
 * Provides clear guidance on next steps and current status
 */
const VerificationPendingScreen = () => {
  const {
    isVerified,
    businessName,
    businessType,
    nextSteps,
    restrictionReason,
    isLoading,
    refetch,
    user,
    getVerificationProgress,
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

  if (isVerified) {
    return null; // User is verified, don't show this screen
  }

  const progress = getVerificationProgress();

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-amber-50/80 to-orange-50/80 backdrop-blur-sm rounded-3xl border border-amber-200/50 shadow-soft">
      <div className="text-center">
        {/* Status Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-600 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-text-dark mb-3">
          Verification in Progress
        </h2>

        {/* Business Information */}
        {businessName && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50">
            <p className="text-lg font-medium text-text-dark">{businessName}</p>
            <p className="text-text-muted capitalize">
              {businessType?.replace('business', '').trim() || 'Business'}
            </p>
          </div>
        )}

        {/* Restriction Reason */}
        <div className="mb-6">
          <div className="flex items-start gap-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200/50">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-amber-800 text-left leading-relaxed">
              {restrictionReason ||
                'Your business is currently under review by our admin team.'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-muted">
              Verification Progress
            </span>
            <span className="text-sm font-medium text-text-dark">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Next Steps */}
        {nextSteps && nextSteps.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/50">
            <h3 className="text-lg font-semibold text-text-dark mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-bottle-green"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Next Steps
            </h3>
            <ul className="space-y-3 text-left">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-bottle-green/10 text-bottle-green rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="text-text-dark leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/50">
          <h3 className="text-lg font-semibold text-text-dark mb-4">
            Need Help?
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-text-muted">
              <Mail className="w-4 h-4" />
              <span>admin@aarothfresh.com</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-text-muted">
              <Phone className="w-4 h-4" />
              <span>+880 123 456 789</span>
            </div>
          </div>
          <p className="text-sm text-text-muted mt-3">
            Contact us if you've been waiting more than 3 business days
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => refetch()}
            className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 transition-all duration-300 min-h-[44px] flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>

          <Button
            variant="outline"
            onClick={() =>
              (window.location.href =
                'mailto:admin@aarothfresh.com?subject=Verification Status Inquiry')
            }
            className="border-2 border-bottle-green/30 text-bottle-green hover:bg-bottle-green/5 px-8 py-3 rounded-2xl font-medium transition-all duration-300 min-h-[44px] flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Button>
        </div>

        {/* Estimated Time */}
        <p className="text-sm text-text-muted mt-6">
          Typical verification time: 1-3 business days
        </p>
      </div>
    </div>
  );
};

export default VerificationPendingScreen;
