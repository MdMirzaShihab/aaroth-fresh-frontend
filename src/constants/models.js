/**
 * Backend Model Structures for Aaroth Fresh Frontend
 * These objects define the expected structure of data from the backend API
 */

/**
 * User Model Structure
 */
export const createUser = (userData = {}) => ({
  id: userData.id || null,
  phone: userData.phone || '', // with country code +8801234567890
  name: userData.name || '',
  role: userData.role || 'buyerOwner', // 'admin' | 'vendor' | 'buyerOwner' | 'buyerManager'
  isActive: userData.isActive ?? true,
  isApproved: userData.isApproved ?? true, // for vendors
  createdAt: userData.createdAt || null,
  updatedAt: userData.updatedAt || null,
  // Role-specific fields
  buyer: userData.buyer || null, // For buyer users
  vendor: userData.vendor || null, // For vendors
  ...userData,
});

/**
 * Product Model Structure
 */
export const createProduct = (productData = {}) => ({
  id: productData.id || null,
  name: productData.name || '',
  category: productData.category || {
    id: null,
    name: '',
  },
  description: productData.description || '',
  unit: productData.unit || 'kg', // kg, piece, bunch, etc.
  images: productData.images || [],
  createdAt: productData.createdAt || null,
  updatedAt: productData.updatedAt || null,
  ...productData,
});

/**
 * Listing Model Structure
 */
export const createListing = (listingData = {}) => ({
  id: listingData.id || null,
  product: listingData.product || createProduct(),
  vendor: listingData.vendor || createUser(),
  price: listingData.price || 0,
  availableQuantity: listingData.availableQuantity || 0,
  isAvailable: listingData.isAvailable ?? true,
  description: listingData.description || '',
  images: listingData.images || [],
  qualityGrade: listingData.qualityGrade || 'Premium', // Premium, Standard, Economy
  harvestDate: listingData.harvestDate || null,
  deliveryOptions: listingData.deliveryOptions || [],
  createdAt: listingData.createdAt || null,
  updatedAt: listingData.updatedAt || null,
  ...listingData,
});

/**
 * Order Model Structure
 */
export const createOrder = (orderData = {}) => ({
  id: orderData.id || null,
  buyer: orderData.buyer || createUser(),
  items: orderData.items || [],
  status: orderData.status || 'pending', // 'pending' | 'confirmed' | 'prepared' | 'delivered' | 'cancelled'
  totalAmount: orderData.totalAmount || 0,
  deliveryAddress: orderData.deliveryAddress || {
    street: '',
    city: '',
    area: '',
    postalCode: '',
  },
  notes: orderData.notes || '',
  createdAt: orderData.createdAt || null,
  updatedAt: orderData.updatedAt || null,
  ...orderData,
});

/**
 * Order Item Structure
 */
export const createOrderItem = (itemData = {}) => ({
  listing: itemData.listing || createListing(),
  quantity: itemData.quantity || 1,
  unitPrice: itemData.unitPrice || 0,
  totalPrice: itemData.totalPrice || 0,
  notes: itemData.notes || '',
  ...itemData,
});

/**
 * Category Model Structure
 */
export const createCategory = (categoryData = {}) => ({
  id: categoryData.id || null,
  name: categoryData.name || '',
  description: categoryData.description || '',
  isActive: categoryData.isActive ?? true,
  productCount: categoryData.productCount || 0,
  createdAt: categoryData.createdAt || null,
  updatedAt: categoryData.updatedAt || null,
  ...categoryData,
});

/**
 * API Response Structures
 */
export const createApiResponse = (responseData = {}) => ({
  success: responseData.success ?? false,
  message: responseData.message || '',
  data: responseData.data || null,
  errors: responseData.errors || [],
  pagination: responseData.pagination || {
    current: 1,
    pages: 1,
    total: 0,
  },
  ...responseData,
});

// User Roles Constants
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  BUYER_OWNER: 'buyerOwner',
  BUYER_MANAGER: 'buyerManager',
};

// Order Status Constants
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARED: 'prepared',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

// Product Units Constants
export const PRODUCT_UNITS = {
  KG: 'kg',
  GRAM: 'gram',
  PIECE: 'piece',
  BUNCH: 'bunch',
  LITER: 'liter',
  ML: 'ml',
  DOZEN: 'dozen',
};
