/**
 * Restaurants Service - Admin V2
 * Business logic for restaurant management and verification workflows
 */

import { format } from 'date-fns';

/**
 * Transform restaurant data for admin management
 */
export const transformRestaurantsData = (rawData) => {
  if (!rawData?.data) return [];

  return rawData.data.map((restaurant) => ({
    id: restaurant._id,
    businessName: restaurant.businessName,
    ownerName: restaurant.userId?.name || 'Unknown',
    email: restaurant.userId?.email,
    phone: restaurant.userId?.phone,
    cuisineType: restaurant.cuisineType || 'Not specified',
    verificationStatus: restaurant.verificationStatus || 'pending',
    isActive: restaurant.isActive,
    location: formatAddress(restaurant.address),
    businessLicense: restaurant.businessLicense,
    totalOrders: restaurant.totalOrders || 0,
    totalSpent: restaurant.totalSpent || 0,
    averageOrderValue: calculateAverageOrderValue(restaurant),
    lastOrderDate: restaurant.lastOrderDate
      ? format(new Date(restaurant.lastOrderDate), 'PPp')
      : 'Never',
    createdAt: format(new Date(restaurant.createdAt), 'PPp'),
    verificationDate: restaurant.verificationDate
      ? format(new Date(restaurant.verificationDate), 'PPp')
      : null,
    urgencyLevel: calculateVerificationUrgency(
      restaurant.createdAt,
      restaurant.verificationStatus
    ),
    riskScore: calculateRestaurantRiskScore(restaurant),
    orderingMetrics: calculateOrderingMetrics(restaurant),
    complianceStatus: assessComplianceStatus(restaurant),
    managersCount: restaurant.managersCount || 0,
    availableActions: getRestaurantActions(restaurant),
  }));
};

/**
 * Format business address for display
 */
const formatAddress = (address) => {
  if (!address) return 'Not provided';

  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);

  return parts.join(', ');
};

/**
 * Calculate average order value
 */
const calculateAverageOrderValue = (restaurant) => {
  if (!restaurant.totalOrders || restaurant.totalOrders === 0) return 0;
  return (restaurant.totalSpent / restaurant.totalOrders).toFixed(2);
};

/**
 * Calculate verification urgency level
 */
const calculateVerificationUrgency = (createdAt, verificationStatus) => {
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
 * Calculate restaurant risk score
 */
const calculateRestaurantRiskScore = (restaurant) => {
  let score = 0;

  // Business completion factor
  if (!restaurant.businessLicense) score += 25;
  if (!restaurant.address || !restaurant.address.street) score += 20;
  if (!restaurant.cuisineType) score += 10;

  // Verification status factor
  if (restaurant.verificationStatus === 'pending') score += 20;
  if (restaurant.verificationStatus === 'rejected') score += 50;

  // Ordering activity factor
  if (restaurant.totalOrders === 0) score += 30;
  else if (restaurant.totalOrders < 5) score += 15;

  // Recent activity factor
  if (restaurant.lastOrderDate) {
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(restaurant.lastOrderDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceOrder > 90) score += 25;
    else if (daysSinceOrder > 30) score += 15;
  }

  return Math.min(score, 100);
};

/**
 * Calculate ordering performance metrics
 */
const calculateOrderingMetrics = (restaurant) => {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  return {
    averageOrderValue: calculateAverageOrderValue(restaurant),
    orderFrequency:
      restaurant.totalOrders > 0 && restaurant.createdAt
        ? (
            restaurant.totalOrders /
            Math.max(
              1,
              Math.floor(
                (now - new Date(restaurant.createdAt)) /
                  (1000 * 60 * 60 * 24 * 30)
              )
            )
          ).toFixed(2)
        : 0,
    monthlySpend: restaurant.monthlySpend || 0,
    preferredVendors: restaurant.preferredVendors || [],
    loyaltyScore: calculateLoyaltyScore(restaurant),
  };
};

/**
 * Calculate customer loyalty score
 */
const calculateLoyaltyScore = (restaurant) => {
  let score = 0;

  // Order frequency
  if (restaurant.totalOrders > 50) score += 30;
  else if (restaurant.totalOrders > 20) score += 20;
  else if (restaurant.totalOrders > 5) score += 10;

  // Account age
  const monthsActive = Math.floor(
    (Date.now() - new Date(restaurant.createdAt)) / (1000 * 60 * 60 * 24 * 30)
  );
  if (monthsActive > 12) score += 25;
  else if (monthsActive > 6) score += 15;
  else if (monthsActive > 1) score += 5;

  // Recent activity
  if (restaurant.lastOrderDate) {
    const daysSinceOrder = Math.floor(
      (Date.now() - new Date(restaurant.lastOrderDate)) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceOrder < 7) score += 20;
    else if (daysSinceOrder < 30) score += 15;
    else if (daysSinceOrder < 60) score += 5;
  }

  // Spending consistency
  if (restaurant.averageMonthlySpend > 1000) score += 25;
  else if (restaurant.averageMonthlySpend > 500) score += 15;
  else if (restaurant.averageMonthlySpend > 100) score += 5;

  return Math.min(score, 100);
};

/**
 * Assess compliance status
 */
const assessComplianceStatus = (restaurant) => {
  const issues = [];

  // Required documentation
  if (!restaurant.businessLicense) issues.push('Missing business license');
  if (!restaurant.taxId) issues.push('Missing tax ID');
  if (!restaurant.operatingPermit) issues.push('Missing operating permit');

  // Business information completeness
  if (!restaurant.cuisineType) issues.push('Missing cuisine type');
  if (!restaurant.address || !restaurant.address.street)
    issues.push('Missing complete address');
  if (!restaurant.businessHours) issues.push('Missing business hours');

  // Activity requirements
  if (restaurant.totalOrders === 0) issues.push('No order history');

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
 * Get available actions for restaurant management
 */
const getRestaurantActions = (restaurant) => {
  const actions = [];

  // Always available
  actions.push('view_details', 'edit_profile', 'view_orders', 'view_managers');

  // Verification actions
  if (restaurant.verificationStatus === 'pending') {
    actions.push(
      'approve_verification',
      'reject_verification',
      'request_documents'
    );
  } else if (restaurant.verificationStatus === 'rejected') {
    actions.push('reconsider_verification');
  }

  // Status management
  if (restaurant.isActive) {
    actions.push('deactivate');
  } else {
    actions.push('activate');
  }

  // Business management
  if (restaurant.totalOrders > 0) {
    actions.push('view_analytics', 'export_data');
  }

  // Manager management
  actions.push('create_manager', 'manage_managers');

  // Communication
  actions.push('send_message', 'send_notification');

  // Risk management
  if (restaurant.riskScore > 70) {
    actions.push('security_review', 'require_reverification');
  }

  // Destructive actions
  actions.push('suspend', 'safe_delete');

  return actions;
};

/**
 * Generate restaurant filters
 */
export const getRestaurantFilters = () => {
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

const restaurantsService = {
  transformRestaurantsData,
  getRestaurantFilters,
};

export default restaurantsService;
