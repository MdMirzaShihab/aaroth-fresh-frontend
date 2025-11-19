/**
 * Order Type Definitions
 */

import { OrderStatus } from './enums';
import { User } from './user';
import { Buyer } from './buyer';

/**
 * Order Item Structure
 */
export interface OrderItem {
  listingId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  isPackBased?: boolean;
  numberOfPacks?: number;
  packSize?: number;
  pricePerPack?: number;
  qualityGrade?: string;
  totalPrice?: number;
  notes?: string;
}

/**
 * Delivery Info Structure
 */
export interface DeliveryInfo {
  address: string;
  contactPerson: string;
  contactPhone: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

/**
 * Payment Info Structure
 */
export interface PaymentInfo {
  method: string;
  status: string;
  transactionId?: string;
  paidAt?: string;
}

/**
 * Order Notes Structure
 */
export interface OrderNotes {
  buyer?: string; // Notes from buyer
  vendor?: string; // Notes from vendor
  internal?: string; // Internal admin notes
}

/**
 * Order Model - Main Interface
 */
export interface Order {
  _id: string;
  orderNumber: string;

  // References
  buyerId: string | Buyer; // Reference to Buyer (was restaurantId)
  vendorId: string; // Reference to Vendor

  // User references
  placedBy: string | User; // User who placed the order
  approvedBy?: string | User; // User who approved the order

  // Order details
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;

  // Delivery
  deliveryInfo?: DeliveryInfo;

  // Payment
  paymentInfo?: PaymentInfo;

  // Notes
  notes?: OrderNotes;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

/**
 * Order with populated references (for frontend display)
 */
export interface OrderWithRefs extends Omit<Order, 'buyerId' | 'placedBy' | 'approvedBy'> {
  buyerId: Buyer;
  placedBy: User;
  approvedBy?: User;
}

/**
 * Order Creation Payload
 */
export interface CreateOrderPayload {
  items: Array<{
    listingId: string;
    quantity: number;
  }>;
  deliveryInfo: DeliveryInfo;
  notes?: string;
}

/**
 * Order Status Update Payload
 */
export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  notes?: string;
}
