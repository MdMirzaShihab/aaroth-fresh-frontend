import { useGetUserBusinessStatusQuery } from '../store/slices/apiSlice';

/**
 * Custom hook for business verification status and user capabilities
 * This hook provides all the information needed to determine what a user can/cannot do
 * based on their business entity verification status.
 *
 * @returns {Object} Business verification state and capabilities
 */
export const useBusinessVerification = () => {
  const {
    data: status,
    isLoading,
    error,
    refetch,
  } = useGetUserBusinessStatusQuery();

  return {
    // Core verification status
    isVerified: status?.businessVerification?.isVerified || false,
    businessType: status?.businessVerification?.businessType,
    businessName: status?.businessVerification?.businessName,
    verificationDate: status?.businessVerification?.verificationDate,

    // User information
    user: status?.user,

    // User capabilities - what they can do based on business verification
    capabilities: status?.capabilities || {
      canCreateListings: false,
      canPlaceOrders: false,
      canManageRestaurant: false,
      canAccessDashboard: false,
      canUpdateProfile: true,
    },

    // Restrictions and messaging
    hasRestrictions: status?.restrictions?.hasRestrictions || false,
    restrictionReason: status?.restrictions?.reason,
    nextSteps: status?.nextSteps || [],

    // Business information for display
    businessInfo: status?.businessInfo,

    // Loading states
    isLoading,
    error,
    refetch,

    // Helper functions for UI decisions
    canCreateListings: status?.capabilities?.canCreateListings || false,
    canPlaceOrders: status?.capabilities?.canPlaceOrders || false,
    canManageRestaurant: status?.capabilities?.canManageRestaurant || false,
    canAccessDashboard: status?.capabilities?.canAccessDashboard || false,
    canUpdateProfile: status?.capabilities?.canUpdateProfile || true,

    // UI state helpers
    showVerificationPending:
      !status?.businessVerification?.isVerified &&
      status?.restrictions?.hasRestrictions,
    isVendor: status?.user?.role === 'vendor',
    isRestaurantOwner: status?.user?.role === 'restaurantOwner',
    isRestaurantManager: status?.user?.role === 'restaurantManager',
    isAdmin: status?.user?.role === 'admin',

    // Business entity helpers
    getBusinessEntity: () => {
      if (status?.businessInfo?.vendor) return status.businessInfo.vendor;
      if (status?.businessInfo?.restaurant)
        return status.businessInfo.restaurant;
      return null;
    },

    // Status display helpers
    getStatusDisplay: () => {
      if (!status) return { text: 'Loading...', color: 'gray' };

      if (status.businessVerification?.isVerified) {
        return {
          text: 'Verified Business',
          color: 'green',
          icon: 'shield-check',
          description: `Your ${status.businessVerification.businessType} is verified and active.`,
        };
      }

      if (status.restrictions?.hasRestrictions) {
        return {
          text: 'Verification Pending',
          color: 'amber',
          icon: 'clock',
          description: status.restrictions.reason,
        };
      }

      return {
        text: 'Active',
        color: 'blue',
        icon: 'user',
        description: 'Account is active',
      };
    },

    // Permission checker
    hasPermission: (capability) => {
      return status?.capabilities?.[capability] || false;
    },

    // Business verification helpers
    needsVerification: () => {
      const userRole = status?.user?.role;
      return (
        (userRole === 'vendor' ||
          userRole === 'restaurantOwner' ||
          userRole === 'restaurantManager') &&
        !status?.businessVerification?.isVerified
      );
    },

    // Get verification progress
    getVerificationProgress: () => {
      if (status?.businessVerification?.isVerified) return 100;
      if (status?.businessInfo?.vendor || status?.businessInfo?.restaurant)
        return 50;
      return 0;
    },
  };
};

export default useBusinessVerification;
