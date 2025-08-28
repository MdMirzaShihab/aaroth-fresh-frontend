/**
 * Vendors Service - Admin V2
 * Business logic for vendor management and verification workflows
 */

import { format } from 'date-fns';

/**
 * Transform vendor data for admin management
 */
export const transformVendorsData = (rawData) => {
  if (!rawData?.data) return [];

  return rawData.data.map(vendor => ({
    id: vendor._id,
    businessName: vendor.businessName,
    ownerName: vendor.userId?.name || 'Unknown',
    email: vendor.userId?.email,
    phone: vendor.userId?.phone,
    businessType: vendor.businessType,
    verificationStatus: vendor.verificationStatus || 'pending',
    isActive: vendor.isActive,
    location: formatAddress(vendor.address),
    businessLicense: vendor.businessLicense,
    totalListings: vendor.totalListings || 0,
    totalOrders: vendor.totalOrders || 0,
    totalRevenue: vendor.totalRevenue || 0,
    rating: vendor.averageRating || 0,
    createdAt: format(new Date(vendor.createdAt), 'PPp'),
    verificationDate: vendor.verificationDate ? format(new Date(vendor.verificationDate), 'PPp') : null,
    lastActiveAt: vendor.lastActiveAt ? format(new Date(vendor.lastActiveAt), 'PPp') : 'Never',
    urgencyLevel: calculateVerificationUrgency(vendor.createdAt, vendor.verificationStatus),
    riskScore: calculateVendorRiskScore(vendor),
    businessMetrics: calculateBusinessMetrics(vendor),
    complianceStatus: assessComplianceStatus(vendor),
    availableActions: getVendorActions(vendor)
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
 * Calculate verification urgency level
 */
const calculateVerificationUrgency = (createdAt, verificationStatus) => {
  if (verificationStatus !== 'pending') return 'none';
  
  const daysWaiting = Math.floor((Date.now() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
  
  if (daysWaiting >= 14) return 'critical';  // 2+ weeks
  if (daysWaiting >= 7) return 'high';       // 1+ week
  if (daysWaiting >= 3) return 'medium';     // 3+ days
  return 'low';                              // < 3 days
};

/**
 * Calculate vendor risk score based on business factors
 */
const calculateVendorRiskScore = (vendor) => {
  let score = 0;
  
  // Business completion factor
  if (!vendor.businessLicense) score += 25;
  if (!vendor.address || !vendor.address.street) score += 20;
  if (!vendor.businessDescription) score += 15;
  
  // Verification status factor
  if (vendor.verificationStatus === 'pending') score += 20;
  if (vendor.verificationStatus === 'rejected') score += 50;
  
  // Activity factor
  if (!vendor.lastActiveAt) score += 30;
  else {
    const daysSinceActive = Math.floor((Date.now() - new Date(vendor.lastActiveAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceActive > 30) score += 25;
    if (daysSinceActive > 7) score += 15;
  }
  
  // Business performance factor
  if (vendor.totalListings === 0) score += 20;
  if (vendor.totalOrders < 5) score += 15;
  if (vendor.averageRating < 3.0) score += 25;
  
  return Math.min(score, 100);
};

/**
 * Calculate business performance metrics
 */
const calculateBusinessMetrics = (vendor) => {
  return {
    conversionRate: vendor.totalOrders > 0 && vendor.totalViews > 0 
      ? ((vendor.totalOrders / vendor.totalViews) * 100).toFixed(2)
      : 0,
    averageOrderValue: vendor.totalOrders > 0 
      ? (vendor.totalRevenue / vendor.totalOrders).toFixed(2)
      : 0,
    listingsPerformance: vendor.totalListings > 0
      ? (vendor.totalOrders / vendor.totalListings).toFixed(2)
      : 0,
    customerRetention: vendor.returningCustomers && vendor.totalCustomers
      ? ((vendor.returningCustomers / vendor.totalCustomers) * 100).toFixed(2)
      : 0,
    monthlyGrowth: vendor.monthlyGrowthRate || 0
  };
};

/**
 * Assess compliance status based on various factors
 */
const assessComplianceStatus = (vendor) => {
  const issues = [];
  
  // Required documentation
  if (!vendor.businessLicense) issues.push('Missing business license');
  if (!vendor.taxId) issues.push('Missing tax ID');
  if (!vendor.bankAccountVerified) issues.push('Bank account not verified');
  
  // Business information completeness
  if (!vendor.businessDescription || vendor.businessDescription.length < 50) {
    issues.push('Incomplete business description');
  }
  if (!vendor.address || !vendor.address.street) {
    issues.push('Missing complete address');
  }
  
  // Performance requirements
  if (vendor.averageRating < 3.5 && vendor.totalRatings > 10) {
    issues.push('Low customer rating');
  }
  if (vendor.disputeRate > 0.05) { // 5% dispute rate
    issues.push('High dispute rate');
  }
  
  return {
    status: issues.length === 0 ? 'compliant' : issues.length < 3 ? 'minor_issues' : 'major_issues',
    issues,
    lastChecked: format(new Date(), 'PPp')
  };
};

/**
 * Get available actions for vendor management
 */
const getVendorActions = (vendor) => {
  const actions = [];
  
  // Always available
  actions.push('view_details', 'edit_profile', 'view_listings', 'view_orders');
  
  // Verification actions
  if (vendor.verificationStatus === 'pending') {
    actions.push('approve_verification', 'reject_verification', 'request_documents');
  } else if (vendor.verificationStatus === 'rejected') {
    actions.push('reconsider_verification');
  }
  
  // Status management
  if (vendor.isActive) {
    actions.push('deactivate');
  } else {
    actions.push('activate');
  }
  
  // Business management
  if (vendor.totalListings > 0) {
    actions.push('view_analytics', 'export_data');
  }
  
  // Communication
  actions.push('send_message', 'send_notification');
  
  // Risk management
  if (vendor.riskScore > 70) {
    actions.push('security_review', 'require_reverification');
  }
  
  // Compliance actions
  if (vendor.complianceStatus?.status !== 'compliant') {
    actions.push('compliance_check', 'request_compliance_docs');
  }
  
  // Destructive actions
  actions.push('suspend', 'safe_delete');
  
  return actions;
};

/**
 * Transform vendor verification data for workflow
 */
export const transformVerificationData = (vendor) => {
  return {
    id: vendor._id,
    businessName: vendor.businessName,
    ownerName: vendor.userId?.name,
    submittedAt: format(new Date(vendor.createdAt), 'PPp'),
    waitingDays: Math.floor((Date.now() - new Date(vendor.createdAt)) / (1000 * 60 * 60 * 24)),
    urgencyLevel: calculateVerificationUrgency(vendor.createdAt, vendor.verificationStatus),
    documents: {
      businessLicense: {
        provided: !!vendor.businessLicense,
        url: vendor.businessLicense,
        verified: vendor.businessLicenseVerified
      },
      taxId: {
        provided: !!vendor.taxId,
        verified: vendor.taxIdVerified
      },
      bankAccount: {
        provided: !!vendor.bankAccount,
        verified: vendor.bankAccountVerified
      },
      identification: {
        provided: !!vendor.ownerIdentification,
        verified: vendor.identificationVerified
      }
    },
    businessInfo: {
      type: vendor.businessType,
      description: vendor.businessDescription,
      address: vendor.address,
      completeness: calculateProfileCompleteness(vendor)
    },
    riskAssessment: {
      score: calculateVendorRiskScore(vendor),
      factors: identifyRiskFactors(vendor)
    }
  };
};

/**
 * Calculate profile completeness percentage
 */
const calculateProfileCompleteness = (vendor) => {
  const requiredFields = [
    'businessName', 'businessType', 'businessDescription', 
    'businessLicense', 'taxId', 'address.street', 'address.city'
  ];
  
  let completed = 0;
  requiredFields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (vendor[parent] && vendor[parent][child]) completed++;
    } else {
      if (vendor[field]) completed++;
    }
  });
  
  return Math.round((completed / requiredFields.length) * 100);
};

/**
 * Identify specific risk factors for vendor
 */
const identifyRiskFactors = (vendor) => {
  const factors = [];
  
  if (!vendor.businessLicense) factors.push('No business license');
  if (!vendor.bankAccountVerified) factors.push('Unverified bank account');
  if (vendor.averageRating < 3.0) factors.push('Low customer rating');
  if (!vendor.lastActiveAt) factors.push('Never logged in');
  
  const daysSinceCreated = Math.floor((Date.now() - new Date(vendor.createdAt)) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated > 30 && vendor.totalListings === 0) {
    factors.push('No listings after 30 days');
  }
  
  return factors;
};

/**
 * Generate vendor filters for admin interface
 */
export const getVendorFilters = () => {
  return {
    verificationStatus: [
      { value: 'all', label: 'All Verification Status' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ],
    businessType: [
      { value: 'all', label: 'All Business Types' },
      { value: 'farm', label: 'Farm' },
      { value: 'wholesaler', label: 'Wholesaler' },
      { value: 'distributor', label: 'Distributor' },
      { value: 'co-op', label: 'Cooperative' }
    ],
    urgencyLevel: [
      { value: 'all', label: 'All Urgency Levels' },
      { value: 'critical', label: 'Critical (14+ days)' },
      { value: 'high', label: 'High (7-13 days)' },
      { value: 'medium', label: 'Medium (3-6 days)' },
      { value: 'low', label: 'Low (0-2 days)' }
    ],
    riskLevel: [
      { value: 'all', label: 'All Risk Levels' },
      { value: 'high', label: 'High Risk (70-100)' },
      { value: 'medium', label: 'Medium Risk (40-69)' },
      { value: 'low', label: 'Low Risk (0-39)' }
    ],
    activityStatus: [
      { value: 'all', label: 'All Activity Status' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'never_active', label: 'Never Active' }
    ]
  };
};

/**
 * Generate bulk actions for vendor management
 */
export const getVendorBulkActions = () => {
  return [
    {
      id: 'approve_verification',
      label: 'Approve Verification',
      icon: 'CheckCircle',
      color: 'green',
      confirmationRequired: true,
      applicableStatuses: ['pending']
    },
    {
      id: 'reject_verification',
      label: 'Reject Verification',
      icon: 'XCircle', 
      color: 'red',
      confirmationRequired: true,
      requiresReason: true,
      applicableStatuses: ['pending']
    },
    {
      id: 'request_documents',
      label: 'Request Documents',
      icon: 'FileText',
      color: 'blue',
      requiresMessage: true
    },
    {
      id: 'deactivate',
      label: 'Deactivate Vendors',
      icon: 'UserX',
      color: 'orange', 
      confirmationRequired: true,
      requiresReason: true
    },
    {
      id: 'send_notification',
      label: 'Send Notification',
      icon: 'Bell',
      color: 'blue',
      requiresMessage: true
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'Download',
      color: 'gray'
    }
  ];
};

/**
 * Generate vendor export data
 */
export const generateVendorExport = (vendors, format = 'csv') => {
  const exportData = vendors.map(vendor => ({
    ID: vendor.id,
    'Business Name': vendor.businessName,
    'Owner Name': vendor.ownerName,
    Email: vendor.email,
    Phone: vendor.phone,
    'Business Type': vendor.businessType,
    'Verification Status': vendor.verificationStatus,
    'Is Active': vendor.isActive ? 'Yes' : 'No',
    Location: vendor.location,
    'Total Listings': vendor.totalListings,
    'Total Orders': vendor.totalOrders,
    'Total Revenue': vendor.totalRevenue,
    Rating: vendor.rating,
    'Risk Score': vendor.riskScore,
    'Created At': vendor.createdAt,
    'Verification Date': vendor.verificationDate || 'Not verified',
    'Last Active': vendor.lastActiveAt
  }));

  if (format === 'json') {
    return JSON.stringify(exportData, null, 2);
  }
  
  // Convert to CSV
  const headers = Object.keys(exportData[0] || {});
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => `"${row[header] || ''}"`).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

const vendorsService = {
  transformVendorsData,
  transformVerificationData,
  getVendorFilters,
  getVendorBulkActions,
  generateVendorExport
};

export default vendorsService;