/**
 * Buyers Service - Admin V2
 * Business logic for buyer management and verification workflows
 */

import { format } from 'date-fns';

/**
 * Transform buyer data for admin management
 */
export const transformBuyersData = (rawData) => {
  if (!rawData?.data) return [];

  return rawData.data.map((buyer) => ({
    id: buyer._id,
    businessName: buyer.businessName,
    ownerName: buyer.userId?.name || 'Unknown',
    email: buyer.userId?.email,
    phone: buyer.userId?.phone,
    cuisineType: buyer.cuisineType || 'Not specified',
    verificationStatus: buyer.verificationStatus || 'pending',
    isActive: buyer.isActive,
    location: formatAddress(buyer.address),
    businessLicense: buyer.businessLicense,
    totalOrders: buyer.totalOrders || 0,
    totalSpent: buyer.totalSpent || 0,
    averageOrderValue: calculateAverageOrderValue(buyer),
    lastOrderDate: buyer.lastOrderDate
      ? format(new Date(buyer.lastOrderDate), 'PPp')
      : 'Never',
    createdAt: format(new Date(buyer.createdAt), 'PPp'),
    verificationDate: buyer.verificationDate
      ? format(new Date(buyer.verificationDate), 'PPp')
      : null,
    urgencyLevel: calculateVerificationUrgency(
      buyer.createdAt,
      buyer.verificationStatus
    ),
    riskScore: calculateBuyerRiskScore(buyer),
    orderingMetrics: calculateOrderingMetrics(buyer),
    complianceStatus: assessComplianceStatus(buyer),
    managersCount: buyer.managersCount || 0,
    availableActions: getBuyerActions(buyer),
  }));
};

/**
 * Format business address for display
 */
export const formatAddress = (address) => {
  if (!address) return 'Not provided';

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);

  return parts.join(', ');
};

/**
 * Format date for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  return format(new Date(dateString), 'PPp');
};

/**
 * Calculate average order value
 */
const calculateAverageOrderValue = (buyer) => {
  if (!buyer.totalOrders || buyer.totalOrders === 0) return 0;
  return (buyer.totalSpent / buyer.totalOrders).toFixed(2);
};

/**
 * Calculate verification urgency level
 */
export const calculateVerificationUrgency = (createdAt, verificationStatus) => {
  if (verificationStatus !== 'pending') return 'none';

  const daysWaiting = Math.floor(
    (Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24)
  );

  if (daysWaiting >= 14) return 'critical'; // 2+ weeks
  if (daysWaiting >= 7) return 'high'; // 1+ week
  if (daysWaiting >= 3) return 'medium'; // 3+ days
  return 'low'; // < 3 days
};

/**
 * Calculate buyer risk score
 */
const calculateBuyerRiskScore = (buyer) => {
  let score = 0;

  // Business completion factor
  if (!buyer.businessLicense) score += 25;
  if (!buyer.address || !buyer.address.street) score += 20;
  if (!buyer.cuisineType) score += 10;

  // Verification status factor
  if (buyer.verificationStatus === 'pending') score += 20;
  if (buyer.verificationStatus === 'rejected') score += 50;

  // Ordering activity factor
  if (buyer.totalOrders === 0) score += 30;
  else if (buyer.totalOrders < 5) score += 15;

  // Recent activity factor
  if (buyer.lastOrderDate) {
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(buyer.lastOrderDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceOrder > 90) score += 25;
    else if (daysSinceOrder > 30) score += 15;
  }

  return Math.min(score, 100);
};

/**
 * Calculate ordering performance metrics
 */
const calculateOrderingMetrics = (buyer) => {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return {
    averageOrderValue: calculateAverageOrderValue(buyer),
    orderFrequency:
      buyer.totalOrders > 0 && buyer.createdAt
        ? (
            buyer.totalOrders /
            Math.max(
              1,
              Math.floor(
                (now - new Date(buyer.createdAt)) /
                  (1000 * 60 * 60 * 24 * 30)
              )
            )
          ).toFixed(2)
        : 0,
    monthlySpend: buyer.monthlySpend || 0,
    preferredVendors: buyer.preferredVendors || [],
    loyaltyScore: calculateLoyaltyScore(buyer),
  };
};

/**
 * Calculate customer loyalty score
 */
const calculateLoyaltyScore = (buyer) => {
  let score = 0;

  // Order frequency
  if (buyer.totalOrders > 50) score += 30;
  else if (buyer.totalOrders > 20) score += 20;
  else if (buyer.totalOrders > 5) score += 10;

  // Account age
  const monthsActive = Math.floor(
    (Date.now() - new Date(buyer.createdAt)) / (1000 * 60 * 60 * 24 * 30)
  );
  if (monthsActive > 12) score += 25;
  else if (monthsActive > 6) score += 15;
  else if (monthsActive > 1) score += 5;

  // Recent activity
  if (buyer.lastOrderDate) {
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(buyer.lastOrderDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceOrder < 7) score += 20;
    else if (daysSinceOrder < 30) score += 15;
    else if (daysSinceOrder < 60) score += 5;
  }

  // Spending consistency
  if (buyer.averageMonthlySpend > 1000) score += 25;
  else if (buyer.averageMonthlySpend > 500) score += 15;
  else if (buyer.averageMonthlySpend > 100) score += 5;

  return Math.min(score, 100);
};

/**
 * Assess compliance status
 */
const assessComplianceStatus = (buyer) => {
  const issues = [];

  // Required documentation
  if (!buyer.businessLicense) issues.push('Missing business license');
  if (!buyer.taxId) issues.push('Missing tax ID');
  if (!buyer.operatingPermit) issues.push('Missing operating permit');

  // Business information completeness
  if (!buyer.cuisineType) issues.push('Missing cuisine type');
  if (!buyer.address || !buyer.address.street)
    issues.push('Missing complete address');
  if (!buyer.businessHours) issues.push('Missing business hours');

  // Activity requirements
  if (buyer.totalOrders === 0) issues.push('No order history');

  return {
    status:
      issues.length === 0
        ? 'compliant'
        : issues.length < 3
          ? 'minor_issues'
          : 'major_issues',
    issues,
    lastChecked: format(new Date(), 'PPp'),
  };
};

/**
 * Get available actions for buyer management
 */
const getBuyerActions = (buyer) => {
  const actions = [];

  // Always available
  actions.push('view_details', 'edit_profile', 'view_orders', 'view_managers');

  // Verification actions
  if (buyer.verificationStatus === 'pending') {
    actions.push(
      'approve_verification',
      'reject_verification',
      'request_documents'
    );
  } else if (buyer.verificationStatus === 'rejected') {
    actions.push('reconsider_verification');
  }

  // Status management
  if (buyer.isActive) {
    actions.push('deactivate');
  } else {
    actions.push('activate');
  }

  // Business management
  if (buyer.totalOrders > 0) {
    actions.push('view_analytics', 'export_data');
  }

  // Manager management
  actions.push('create_manager', 'manage_managers');

  // Communication
  actions.push('send_message', 'send_notification');

  // Risk management
  if (buyer.riskScore > 70) {
    actions.push('security_review', 'require_reverification');
  }

  // Destructive actions
  actions.push('suspend', 'safe_delete');

  return actions;
};

/**
 * Generate buyer filters
 */
export const getBuyerFilters = () => {
  return {
    verificationStatus: [
      { value: 'all', label: 'All Verification Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    cuisineType: [
      { value: 'all', label: 'All Cuisine Types' },
      { value: 'american', label: 'American' },
      { value: 'italian', label: 'Italian' },
      { value: 'chinese', label: 'Chinese' },
      { value: 'indian', label: 'Indian' },
      { value: 'mexican', label: 'Mexican' },
      { value: 'other', label: 'Other' },
    ],
    activityLevel: [
      { value: 'all', label: 'All Activity Levels' },
      { value: 'high', label: 'High (20+ orders)' },
      { value: 'medium', label: 'Medium (5-19 orders)' },
      { value: 'low', label: 'Low (1-4 orders)' },
      { value: 'inactive', label: 'Inactive (0 orders)' },
    ],
    urgencyLevel: [
      { value: 'all', label: 'All Urgency Levels' },
      { value: 'critical', label: 'Critical (14+ days)' },
      { value: 'high', label: 'High (7-13 days)' },
      { value: 'medium', label: 'Medium (3-6 days)' },
      { value: 'low', label: 'Low (0-2 days)' },
    ],
  };
};

const buyersService = {
  transformBuyersData,
  getBuyerFilters,
};

export default buyersService;
