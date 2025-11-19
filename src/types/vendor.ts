/**
 * Vendor Type Definitions
 * Comprehensive type definitions for vendor entities including platform vendors (Aaroth Mall, etc.)
 */

import { VerificationStatus } from './enums';

/**
 * Address structure (shared across entities)
 */
export interface Address {
  street: string;
  city: string;
  area: string;
  postalCode: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

/**
 * Special privileges for platform-owned vendors
 */
export interface VendorSpecialPrivileges {
  featuredListings?: boolean;
  prioritySupport?: boolean;
  customCommissionRate?: number | null;
  unlimitedListings?: boolean;
}

/**
 * Platform vendor names enum
 */
export enum PlatformVendorName {
  AAROTH_MALL = 'Aaroth Mall',
  AAROTH_ORGANICS = 'Aaroth Organics',
  AAROTH_FRESH_STORE = 'Aaroth Fresh Store',
}

/**
 * Operating hours for a single day
 */
export interface DayOperatingHours {
  open: string;
  close: string;
  closed: boolean;
}

/**
 * Weekly operating hours
 */
export interface OperatingHours {
  monday: DayOperatingHours;
  tuesday: DayOperatingHours;
  wednesday: DayOperatingHours;
  thursday: DayOperatingHours;
  friday: DayOperatingHours;
  saturday: DayOperatingHours;
  sunday: DayOperatingHours;
}

/**
 * Vendor rating information
 */
export interface VendorRating {
  average: number;
  count: number;
}

/**
 * Main Vendor interface
 */
export interface Vendor {
  _id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  address: Address;
  logo?: string;
  tradeLicenseNo: string;

  // Business details
  specialties?: string[];
  operatingHours?: OperatingHours;
  deliveryRadius?: number; // kilometers
  minimumOrderValue?: number;

  // Status and verification
  verificationStatus: VerificationStatus;
  isActive: boolean;
  verificationDate?: string;

  // Platform vendor fields (NEW)
  isPlatformOwned: boolean;
  platformName?: PlatformVendorName;
  isEditable: boolean; // false for platform vendors (admin-only editing)
  specialPrivileges?: VendorSpecialPrivileges;

  // Metrics
  rating?: VendorRating;
  totalOrders?: number;
  totalRevenue?: number;
  performanceScore?: number;

  // Admin tracking
  statusUpdatedBy?: string;
  statusUpdatedAt?: string;
  adminNotes?: string;

  // Audit fields
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  // Soft delete
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

/**
 * Vendor creation/registration payload
 */
export interface VendorRegistrationPayload {
  businessName: string;
  ownerName?: string;
  email: string;
  phone: string;
  password: string;
  address: Address;
  tradeLicenseNo: string;
  logo?: File | string;
}

/**
 * Platform vendor creation payload (admin-only)
 */
export interface PlatformVendorCreationPayload {
  platformName: PlatformVendorName | string;
  name: string; // Manager name
  email: string;
  phone: string;
  password: string;
  address: Address;
  tradeLicenseNo?: string;
}

/**
 * Vendor update payload
 */
export interface VendorUpdatePayload {
  businessName?: string;
  ownerName?: string;
  email?: string;
  phone?: string;
  address?: Address;
  logo?: File | string;
  tradeLicenseNo?: string;
  specialties?: string[];
  operatingHours?: OperatingHours;
  deliveryRadius?: number;
  minimumOrderValue?: number;
}

/**
 * Helper function to check if vendor is platform-owned
 */
export const isPlatformVendor = (vendor: Vendor): boolean => {
  return vendor.isPlatformOwned === true;
};

/**
 * Helper function to get platform vendor display name
 */
export const getPlatformVendorName = (vendor: Vendor): string | null => {
  return vendor.isPlatformOwned ? (vendor.platformName || null) : null;
};

/**
 * Helper function to check if vendor can be edited by manager
 */
export const canVendorManagerEdit = (vendor: Vendor): boolean => {
  return vendor.isEditable !== false; // Default true, false only for platform vendors
};

/**
 * Platform vendor names as constant array
 */
export const PLATFORM_VENDOR_NAMES = [
  PlatformVendorName.AAROTH_MALL,
  PlatformVendorName.AAROTH_ORGANICS,
  PlatformVendorName.AAROTH_FRESH_STORE,
] as const;

export type PlatformVendorNameType = typeof PLATFORM_VENDOR_NAMES[number];
