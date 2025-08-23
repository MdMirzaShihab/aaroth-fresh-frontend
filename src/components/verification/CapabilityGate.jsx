import React from 'react';
import { useBusinessVerification } from '../../hooks/useBusinessVerification';
import VerificationPendingScreen from './VerificationPendingScreen';

/**
 * CapabilityGate - Conditionally renders content based on user's business verification capabilities
 *
 * @param {string} capability - The capability to check (e.g., 'canCreateListings')
 * @param {React.ReactNode} children - Content to render if user has the capability
 * @param {React.ReactNode|null} fallback - Content to render if user lacks the capability
 * @param {boolean} showMessage - Whether to show a default message for missing capabilities
 * @param {string} customMessage - Custom message to show instead of default
 */
const CapabilityGate = ({
  capability,
  children,
  fallback = null,
  showMessage = true,
  customMessage = null,
}) => {
  const {
    capabilities,
    hasRestrictions,
    restrictionReason,
    showVerificationPending,
    isLoading,
    error,
  } = useBusinessVerification();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bottle-green"></div>
        <span className="ml-3 text-text-muted">Checking permissions...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center p-8 bg-tomato-red/5 rounded-2xl border border-tomato-red/20">
        <div className="text-tomato-red mb-2">Unable to verify permissions</div>
        <div className="text-sm text-text-muted">
          Please refresh the page and try again
        </div>
      </div>
    );
  }

  // Check if user has the required capability
  const hasCapability = capabilities?.[capability] || false;

  if (hasCapability) {
    return children; // User can access this feature
  }

  // Show custom fallback if provided
  if (fallback) {
    return fallback;
  }

  // Show verification pending screen for business verification issues
  if (showVerificationPending && hasRestrictions) {
    return <VerificationPendingScreen />;
  }

  // Show default message fallback
  if (showMessage) {
    const capabilityMessages = {
      canCreateListings: 'create listings',
      canPlaceOrders: 'place orders',
      canManageRestaurant: 'manage restaurant',
      canAccessDashboard: 'access dashboard',
      canUpdateProfile: 'update profile',
    };

    const actionText = capabilityMessages[capability] || 'perform this action';
    const message =
      customMessage ||
      restrictionReason ||
      `You don't have permission to ${actionText}`;

    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-earthy-beige/20 to-white rounded-2xl border border-earthy-beige/30">
        <div className="w-16 h-16 bg-earthy-beige/30 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-earthy-brown/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-text-dark/80 mb-2 text-center">
          Access Restricted
        </h3>

        <p className="text-text-muted text-center max-w-md leading-relaxed">
          {message}
        </p>
      </div>
    );
  }

  return null;
};

export default CapabilityGate;
