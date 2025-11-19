/**
 * User Type Definitions
 */

import { UserRole } from './enums';
import { Buyer } from './buyer';

/**
 * User Model - Main Interface
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string; // Hashed (should not be exposed to frontend normally)

  // Role
  role: UserRole;

  // References
  buyerId?: string | Buyer; // Reference to Buyer (was restaurantId)
  vendorId?: string; // Reference to Vendor

  // Profile
  profileImage?: string;

  // Status flags
  isActive: boolean;
  isDeleted: boolean;

  // Activity tracking
  lastLogin?: string;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * User with populated Buyer (for frontend use)
 */
export interface UserWithBuyer extends Omit<User, 'buyerId'> {
  buyerId: Buyer;
}

/**
 * Auth Response from Login/Register
 */
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

/**
 * User Capabilities (from /auth/status endpoint)
 */
export interface UserCapabilities {
  canCreateListings: boolean;
  canPlaceOrders: boolean;
  canManageBuyer: boolean;
  canAccessDashboard: boolean;
  canUpdateProfile: boolean;
}

/**
 * Business Verification Info (from /auth/status endpoint)
 */
export interface BusinessVerification {
  verificationStatus: 'pending' | 'approved' | 'rejected';
  businessType: string; // BuyerType as string
  businessName: string;
  verificationDate?: string;
  adminNotes?: string;
}

/**
 * Auth Status Response
 */
export interface AuthStatusResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      name: string;
      role: UserRole;
    };
    businessVerification?: BusinessVerification;
    capabilities: UserCapabilities;
    businessInfo?: {
      buyer?: Buyer;
    };
  };
}
