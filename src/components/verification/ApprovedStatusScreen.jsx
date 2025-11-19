import React from 'react';
import { ShieldCheck, Star, ArrowRight, Sparkles, Target } from 'lucide-react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import Button from '../ui/Button';

/**
 * ApprovedStatusScreen - Celebratory screen for approved businesses
 * Shows capabilities and next steps for getting started
 */
const ApprovedStatusScreen = ({ showCelebration = true }) => {
  const {
    verificationStatus,
    isApproved,
    businessName,
    businessType,
    verificationDate,
    capabilities,
    isLoading,
    user,
    isVendor,
    isBuyerOwner,
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

  if (!isApproved || verificationStatus !== 'approved') {
    return null; // User is not approved, don't show this screen
  }

  const getWelcomeMessage = () => {
    if (isVendor) {
      return {
        title: '🎉 Welcome to Aaroth Fresh!',
        subtitle: 'Your vendor account is now verified and ready',
        capabilities: [
          {
            key: 'canCreateListings',
            label: 'Create and manage product listings',
          },
          { key: 'canProcessOrders', label: 'Accept and process orders' },
          {
            key: 'canAccessDashboard',
            label: 'Access vendor dashboard and analytics',
          },
          {
            key: 'canManageInventory',
            label: 'Track inventory and stock levels',
          },
        ],
        nextSteps: [
          'Create your first product listing',
          'Set up your vendor profile completely',
          'Configure your delivery preferences',
          'Start receiving orders from buyers',
        ],
        ctaText: 'Go to Vendor Dashboard',
        ctaLink: '/vendor/dashboard',
      };
    } else if (isBuyerOwner) {
      return {
        title: '🎉 Welcome to Aaroth Fresh!',
        subtitle: 'Your buyer account is now verified and ready',
        capabilities: [
          {
            key: 'canPlaceOrders',
            label: 'Place orders with verified vendors',
          },
          { key: 'canAccessDashboard', label: 'Access buyer dashboard' },
          {
            key: 'canManageBuyer',
            label: 'Manage buyer profile and settings',
          },
          {
            key: 'canTrackSpending',
            label: 'Track spending and order history',
          },
        ],
        nextSteps: [
          'Browse fresh produce from local vendors',
          'Set up your buyer profile',
          'Configure your ordering preferences',
          'Place your first order',
        ],
        ctaText: 'Go to Buyer Dashboard',
        ctaLink: '/buyer/dashboard',
      };
    }

    return {
      title: '🎉 Account Verified!',
      subtitle: 'Your business account is now approved',
      capabilities: [],
      nextSteps: [
        'Complete your profile setup',
        'Explore the platform features',
      ],
      ctaText: 'Get Started',
      ctaLink: '/dashboard',
    };
  };

  const welcomeInfo = getWelcomeMessage();

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Celebration Header */}
      {showCelebration && (
        <div className="text-center mb-8 relative overflow-hidden bg-gradient-to-r from-green-50/80 to-emerald-50/80 backdrop-blur-sm rounded-3xl border border-green-200/50 shadow-soft p-8">
          {/* Floating Elements */}
          <div className="absolute top-4 left-4 animate-bounce">
            <Sparkles className="w-6 h-6 text-green-500 opacity-60" />
          </div>
          <div className="absolute top-4 right-4 animate-pulse">
            <Star className="w-6 h-6 text-emerald-500 opacity-60" />
          </div>
          <div
            className="absolute bottom-4 left-1/3 animate-bounce"
            style={{ animationDelay: '0.5s' }}
          >
            <Sparkles className="w-4 h-4 text-green-400 opacity-40" />
          </div>

          {/* Status Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
            <ShieldCheck className="w-10 h-10 text-green-600 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
            {welcomeInfo.title}
          </h1>

          {/* Business Info */}
          <div className="text-text-muted mb-4">
            <p className="text-lg">
              {businessName && (
                <span className="font-semibold text-text-dark">
                  {businessName}
                </span>
              )}
              {businessName && ' - '}
              <span className="capitalize text-green-700">
                {businessType}
              </span>{' '}
              Account
            </p>
            <p className="text-sm mt-2">
              Verified on{' '}
              {verificationDate
                ? new Date(verificationDate).toLocaleDateString()
                : 'today'}
            </p>
          </div>

          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            {welcomeInfo.subtitle}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Capabilities */}
        <div className="bg-white/60 border border-green-200/30 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-600" />
            What You Can Do Now
          </h3>

          <div className="space-y-4">
            {welcomeInfo.capabilities.map((capability, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-200/30"
              >
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-text-dark">
                  {capability.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/60 border border-blue-200/30 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-text-dark mb-6 flex items-center gap-2">
            <ArrowRight className="w-6 h-6 text-blue-600" />
            Next Steps
          </h3>

          <div className="space-y-4">
            {welcomeInfo.nextSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <span className="text-text-dark leading-relaxed">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg flex items-center gap-2"
          onClick={() => {
            window.location.href = welcomeInfo.ctaLink;
          }}
        >
          <ArrowRight className="w-5 h-5" />
          {welcomeInfo.ctaText}
        </Button>

        <Button
          variant="outline"
          className="border-green-300 text-green-700 hover:bg-green-50 px-8 py-4 text-lg"
          onClick={() => {
            window.location.href = '/profile';
          }}
        >
          Complete Profile
        </Button>
      </div>

      {/* Success Tips */}
      <div className="mt-8 p-6 bg-gradient-to-r from-amber-50/50 to-orange-50/50 border border-amber-200/30 rounded-2xl">
        <h3 className="text-lg font-semibold text-text-dark mb-4">
          💡 Tips for Success
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text-muted">
          {isVendor ? (
            <>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Quality Listings:
                </p>
                <p>Upload high-quality photos and detailed descriptions</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Fast Response:
                </p>
                <p>Respond quickly to orders for better ratings</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">Fresh Stock:</p>
                <p>Keep inventory updated to avoid disappointed customers</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Great Service:
                </p>
                <p>Provide excellent customer service for repeat business</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="font-medium text-text-dark mb-1">Plan Ahead:</p>
                <p>Order fresh ingredients in advance for best availability</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Build Relationships:
                </p>
                <p>Work with reliable vendors for consistent supply</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Track Spending:
                </p>
                <p>Use our analytics to optimize your purchasing</p>
              </div>
              <div>
                <p className="font-medium text-text-dark mb-1">
                  Leave Reviews:
                </p>
                <p>Help other buyers by reviewing vendors</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedStatusScreen;
