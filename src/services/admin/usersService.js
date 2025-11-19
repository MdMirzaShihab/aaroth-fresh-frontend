/**
 * Users Service - Admin V2
 * Business logic for user management and role operations
 */

import { format, formatDistanceToNow } from 'date-fns';

/**
 * Transform user data for admin table display
 * Backend returns { success, count, total, page, pages, data: [users array] }
 */
export const transformUsersData = (rawData) => {
  // Backend returns data as array directly, not nested in data.users
  if (!rawData?.data || !Array.isArray(rawData.data)) return [];

  return rawData.data.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: getUserStatus(user), // Derived from vendor/buyer verification
    isActive: user.isActive,
    lastLogin: user.lastLogin
      ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
      : 'Never',
    createdAt: format(new Date(user.createdAt), 'PPp'),
    businessInfo: extractBusinessInfo(user),
    actionsAvailable: getAvailableActions(user),
    // Include populated vendor/buyer for reference
    vendorId: user.vendorId,
    buyerId: user.buyerId,
  }));
};

/**
 * Determine user account status
 * Simplified - just returns active/inactive based on isActive flag
 * Verification status is now displayed separately in its own column
 */
const getUserStatus = (user) => {
  return user.isActive ? 'active' : 'inactive';
};

/**
 * Extract business information based on user role
 */
const extractBusinessInfo = (user) => {
  const info = {};

  if (user.role === 'vendor' && user.vendorId) {
    info.businessName = user.vendorId.businessName;
    info.businessType = user.vendorId.businessType;
    info.location = user.vendorId.address;
    info.totalListings = user.vendorId.totalListings || 0;
    info.totalOrders = user.vendorId.totalOrders || 0;
  } else if (user.role === 'buyerOwner' && user.buyerId) {
    info.businessName = user.buyerId.businessName;
    info.cuisineType = user.buyerId.cuisineType;
    info.location = user.buyerId.address;
    info.totalOrders = user.buyerId.totalOrders || 0;
    info.totalSpent = user.buyerId.totalSpent || 0;
  } else if (user.role === 'buyerManager') {
    info.buyerName = user.buyerId?.businessName;
    info.permissions = user.permissions || [];
  }

  return info;
};

/**
 * Get available actions for user based on status and role
 */
const getAvailableActions = (user) => {
  const actions = [];

  // Core actions available to all users
  actions.push('view_details', 'edit_profile');

  // Approval actions
  if (!user.isApproved && user.verificationStatus !== 'rejected') {
    actions.push('approve', 'reject');
  }

  // Verification actions
  if (user.verificationStatus === 'pending') {
    actions.push('verify', 'request_documents');
  }

  // Status management
  if (user.isActive) {
    actions.push('deactivate');
  } else {
    actions.push('activate');
  }

  // Role-specific actions
  if (user.role === 'vendor') {
    actions.push('view_listings', 'view_orders');
  } else if (user.role === 'buyerOwner') {
    actions.push('view_orders', 'view_managers');
  }

  // Security actions
  if (user.riskScore > 70) {
    actions.push('security_review');
  }

  // Destructive actions (admin only)
  actions.push('suspend', 'delete');

  return actions;
};

/**
 * Transform user creation form data to match backend validation
 * Backend expects specific structure - DO NOT nest data in buyerData
 */
export const transformUserCreationData = (formData, userType) => {
  const baseData = {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    password: formData.password, // Required by backend
  };

  // Buyer Owner - backend validates: name, email, phone, password, buyerName, address, tradeLicenseNo
  if (userType === 'buyerOwner') {
    return {
      ...baseData,
      buyerName: formData.businessName || formData.buyerName, // Backend expects 'buyerName', not 'businessName'
      address: {
        street: formData.address?.street || formData.street,
        city: formData.address?.city || formData.city,
        area: formData.address?.area || formData.area,
      },
      tradeLicenseNo: formData.businessLicense || formData.tradeLicenseNo, // Optional
      // Note: cuisineType, contactInfo are NOT validated by backend and will be ignored
    };
  }

  // Buyer Manager - backend validates: name, email, phone, password, buyerId
  if (userType === 'buyerManager') {
    return {
      ...baseData,
      buyerId: formData.buyerId, // Required
      // Note: permissions and accessLevel are NOT validated by backend and will be ignored
    };
  }

  // Other roles (admin, vendor)
  return baseData;
};

/**
 * Generate user filters for admin interface
 */
export const getUserFilters = () => {
  return {
    role: [
      { value: 'all', label: 'All Roles' },
      { value: 'admin', label: 'Admin' },
      { value: 'vendor', label: 'Vendor' },
      { value: 'buyerOwner', label: 'Buyer Owner' },
      { value: 'buyerManager', label: 'Buyer Manager' },
    ],
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'pending_approval', label: 'Pending Approval' },
      { value: 'pending_verification', label: 'Pending Verification' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
    ],
    verificationStatus: [
      { value: 'all', label: 'All Verification' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    riskLevel: [
      { value: 'all', label: 'All Risk Levels' },
      { value: 'low', label: 'Low Risk (0-30)' },
      { value: 'medium', label: 'Medium Risk (31-60)' },
      { value: 'high', label: 'High Risk (61-100)' },
    ],
  };
};

/**
 * Generate bulk actions for user management
 */
export const getBulkActions = () => {
  return [
    {
      id: 'approve',
      label: 'Approve Selected',
      icon: 'CheckCircle',
      color: 'green',
      confirmationRequired: true,
    },
    {
      id: 'reject',
      label: 'Reject Selected',
      icon: 'XCircle',
      color: 'red',
      confirmationRequired: true,
      requiresReason: true,
    },
    {
      id: 'deactivate',
      label: 'Deactivate Selected',
      icon: 'UserX',
      color: 'orange',
      confirmationRequired: true,
      requiresReason: true,
    },
    {
      id: 'send_notification',
      label: 'Send Notification',
      icon: 'Mail',
      color: 'blue',
      requiresMessage: true,
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: 'Download',
      color: 'gray',
    },
  ];
};

/**
 * Validate user creation form
 */
export const validateUserForm = (formData, userType) => {
  const errors = {};

  // Basic validation
  if (!formData.name?.trim()) errors.name = 'Name is required';
  if (!formData.email?.trim()) errors.email = 'Email is required';
  if (!formData.phone?.trim()) errors.phone = 'Phone is required';

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (formData.email && !emailRegex.test(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // Role-specific validation
  if (userType === 'buyerOwner') {
    if (!formData.businessName?.trim())
      errors.businessName = 'Business name is required';
    if (!formData.cuisineType?.trim())
      errors.cuisineType = 'Cuisine type is required';
    if (!formData.address?.trim())
      errors.address = 'Business address is required';
  } else if (userType === 'buyerManager') {
    if (!formData.buyerId)
      errors.buyerId = 'Buyer selection is required';
    if (!formData.permissions?.length)
      errors.permissions = 'At least one permission is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generate user export data
 * Note: verificationStatus and isApproved don't exist on User model
 * They are derived from vendor/buyer entities
 */
export const generateUserExport = (users, format = 'csv') => {
  const exportData = users.map((user) => ({
    ID: user.id,
    Name: user.name,
    Email: user.email,
    Phone: user.phone,
    Role: user.role,
    Status: user.status, // This is derived from getUserStatus()
    'Is Active': user.isActive ? 'Yes' : 'No',
    'Last Login': user.lastLogin,
    'Created At': user.createdAt,
    'Business Name': user.businessInfo?.businessName || '',
    'Risk Score': user.riskScore,
    // Vendor-specific fields (only populated for vendors)
    'Vendor Status': user.vendorId?.verificationStatus || 'N/A',
    // Buyer-specific fields (only populated for buyer users)
    'Buyer Status': user.buyerId?.verificationStatus || 'N/A',
  }));

  if (format === 'json') {
    return JSON.stringify(exportData, null, 2);
  }

  // Convert to CSV
  const headers = Object.keys(exportData[0] || {});
  const csvContent = [
    headers.join(','),
    ...exportData.map((row) =>
      headers.map((header) => `"${row[header] || ''}"`).join(',')
    ),
  ].join('\n');

  return csvContent;
};

// Export RTK Query hooks from admin API slice for user management
export {
  useGetAdminUsersV2Query as useGetUsersQuery,
  useGetAdminUserDetailsQuery as useGetUserDetailsQuery,
  useUpdateAdminUserV2Mutation as useUpdateUserMutation,
  useDeleteAdminUserV2Mutation as useDeleteUserMutation,
  useCreateBuyerOwnerV2Mutation as useCreateBuyerOwnerMutation,
  useCreateBuyerManagerV2Mutation as useCreateBuyerManagerMutation,
  useGetUserAnalyticsQuery,
} from '../../store/slices/admin/adminApiSlice';

const usersService = {
  transformUsersData,
  transformUserCreationData,
  getUserFilters,
  getBulkActions,
  validateUserForm,
  generateUserExport,
};

export default usersService;
