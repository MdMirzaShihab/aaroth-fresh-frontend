/**
 * Buyer Type Definitions for Multi-Buyer System
 */

import { BuyerType, VerificationStatus } from './enums';

/**
 * Address Structure
 */
export interface Address {
  street: string;
  city: string;
  area: string;
  postalCode: string;
}

/**
 * Operating Hours Structure
 */
export interface OperatingHours {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}

/**
 * Restaurant-Specific Data
 */
export interface RestaurantSpecificData {
  cuisineType?: string[];
  seatingCapacity?: number;
  operatingHours?: OperatingHours;
}

/**
 * Corporate-Specific Data
 */
export interface CorporateSpecificData {
  industry?: string;
  employeeCount?: number;
  departmentBudgets?: Array<{
    department: string;
    budgetLimit: number;
  }>;
}

/**
 * Supershop-Specific Data
 */
export interface SupershopSpecificData {
  chainName?: string;
  branchCount?: number;
  retailCategory?: string[];
}

/**
 * Catering-Specific Data
 */
export interface CateringSpecificData {
  eventTypes?: string[];
  averageGuestCount?: number;
  serviceRadius?: number; // in km
}

/**
 * Union Type for Type-Specific Data
 */
export type TypeSpecificData =
  | RestaurantSpecificData
  | CorporateSpecificData
  | SupershopSpecificData
  | CateringSpecificData;

/**
 * Buyer Model - Main Interface
 */
export interface Buyer {
  _id: string;
  name: string; // Business name
  ownerName: string;
  email: string;
  phone: string;
  address: Address;
  logo?: string; // Cloudinary URL
  tradeLicenseNo: string;

  // Buyer type discriminator
  buyerType: BuyerType;

  // Type-specific data (dynamic based on buyerType)
  typeSpecificData: TypeSpecificData;

  // Verification
  verificationStatus: VerificationStatus;
  verificationDate?: string;
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  adminNotes?: string;

  // Management
  managers: string[]; // Array of User IDs
  createdBy: string;

  // Status flags
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deletionReason?: string;

  // Virtual field (computed)
  displayType: string; // 'Restaurant', 'Corporate Company', etc.

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Buyer Display Type Labels
 */
export const BUYER_TYPE_LABELS: Record<BuyerType, string> = {
  [BuyerType.RESTAURANT]: 'Restaurant',
  [BuyerType.CORPORATE]: 'Corporate Company',
  [BuyerType.SUPERSHOP]: 'Supershop',
  [BuyerType.CATERING]: 'Catering Service',
};

/**
 * Buyer Type Icons (for UI)
 */
export const BUYER_TYPE_ICONS: Record<BuyerType, string> = {
  [BuyerType.RESTAURANT]: 'Utensils',
  [BuyerType.CORPORATE]: 'Building2',
  [BuyerType.SUPERSHOP]: 'Store',
  [BuyerType.CATERING]: 'ChefHat',
};
