/**
 * Enums and Constants for Aaroth Fresh
 * TypeScript definitions for better IDE support
 */

/**
 * User Role Enum
 */
export enum UserRole {
  ADMIN = 'admin',
  VENDOR = 'vendor',
  BUYER_OWNER = 'buyerOwner',
  BUYER_MANAGER = 'buyerManager',
}

/**
 * Buyer Type Enum - supports multi-buyer system
 */
export enum BuyerType {
  RESTAURANT = 'restaurant',
  CORPORATE = 'corporate',
  SUPERSHOP = 'supershop',
  CATERING = 'catering',
}

/**
 * Verification Status Enum
 */
export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * Order Status Enum
 */
export enum OrderStatus {
  PENDING_APPROVAL = 'pending_approval',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

/**
 * Budget Period Enum
 */
export enum BudgetPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Budget Status Enum
 */
export enum BudgetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}
