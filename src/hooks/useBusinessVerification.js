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

  const verificationStatus =
    status?.businessVerification?.verificationStatus || 'pending';
  const isApproved = verificationStatus === 'approved';
  const isRejected = verificationStatus === 'rejected';
  const isPending = verificationStatus === 'pending';

  return {
    // Core verification status (three-state system)
    verificationStatus,
    isApproved,
    isRejected,
    isPending,
    adminNotes: status?.businessVerification?.adminNotes,
    businessType: status?.businessVerification?.businessType,
    businessName: status?.businessVerification?.businessName,
    verificationDate: status?.businessVerification?.verificationDate,

    // Legacy support (deprecated - will be removed)
    isVerified: isApproved,

    // User information
    user: status?.user,

    // User capabilities - what they can do based on business verification
    capabilities: status?.capabilities || {
      canCreateListings: false,
      canPlaceOrders: false,
      canManageBuyer: false,
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
    canManageBuyer: status?.capabilities?.canManageBuyer || false,
    canAccessDashboard: status?.capabilities?.canAccessDashboard || false,
    canUpdateProfile: status?.capabilities?.canUpdateProfile || true,

    // UI state helpers (updated for three-state)
    showVerificationPending: isPending && status?.restrictions?.hasRestrictions,
    showVerificationRejected: isRejected,
    showVerificationApproved: isApproved,
    isVendor: status?.user?.role === 'vendor',
    isBuyerOwner: status?.user?.role === 'buyerOwner',
    isBuyerManager: status?.user?.role === 'buyerManager',
    isAdmin: status?.user?.role === 'admin',

    // Business entity helpers
    getBusinessEntity: () => {
      if (status?.businessInfo?.vendor) return status.businessInfo.vendor;
      if (status?.businessInfo?.buyer)
        return status.businessInfo.buyer;
      return null;
    },

    // Status display helpers (updated for three-state)
    getStatusDisplay: () => {
      if (!status) return { text: 'Loading...', color: 'gray' };

      if (verificationStatus === 'approved') {
        return {
          text: 'Approved Business',
          color: 'green',
          icon: 'shield-check',
          description: `Your ${status.businessVerification.businessType} is verified and approved.`,
        };
      }

      if (verificationStatus === 'rejected') {
        return {
          text: 'Verification Rejected',
          color: 'red',
          icon: 'x-circle',
          description:
            status.businessVerification?.adminNotes ||
            'Your verification has been rejected.',
          adminNotes: status.businessVerification?.adminNotes,
        };
      }

      if (verificationStatus === 'pending') {
        return {
          text: 'Verification Pending',
          color: 'amber',
          icon: 'clock',
          description: 'Your business verification is under review.',
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

    // Business verification helpers (updated for three-state)
    needsVerification: () => {
      const userRole = status?.user?.role;
      return (
        (userRole === 'vendor' ||
          userRole === 'buyerOwner' ||
          userRole === 'buyerManager') &&
        verificationStatus !== 'approved'
      );
    },

    // Get verification progress (updated for three-state)
    getVerificationProgress: () => {
      if (verificationStatus === 'approved') return 100;
      if (verificationStatus === 'rejected') return 25; // Needs resubmission
      if (verificationStatus === 'pending') {
        if (status?.businessInfo?.vendor || status?.businessInfo?.buyer)
          return 75; // Under review
        return 50; // Basic info submitted
      }
      return 0;
    },

    // New helper methods for three-state system
    canResubmit: () => verificationStatus === 'rejected',

    getRejectionGuidance: () => {
      if (verificationStatus !== 'rejected') return null;
      return {
        adminFeedback: status?.businessVerification?.adminNotes,
        nextSteps: status?.nextSteps || [],
        canResubmit: true,
      };
    },

    getStatusColor: () => {
      switch (verificationStatus) {
        case 'approved':
          return 'green';
        case 'rejected':
          return 'red';
        case 'pending':
          return 'amber';
        default:
          return 'gray';
      }
    },
  };
};

export default useBusinessVerification;
