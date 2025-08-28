/**
 * Catalog Service - Admin V2  
 * Business logic for products, categories, and listings management
 */

import { format } from 'date-fns';

/**
 * Transform products data for admin management
 */
export const transformProductsData = (rawData) => {
  if (!rawData?.data?.products) return [];

  return rawData.data.products.map(product => ({
    id: product._id,
    name: product.name,
    category: product.categoryId?.name || 'Uncategorized',
    description: product.description,
    status: product.status || 'active',
    totalListings: product.totalListings || 0,
    averagePrice: product.averagePrice || 0,
    totalOrders: product.totalOrders || 0,
    createdAt: format(new Date(product.createdAt), 'PPp'),
    updatedAt: format(new Date(product.updatedAt), 'PPp'),
    image: product.imageUrl,
    performanceScore: calculateProductPerformance(product),
    availableActions: getProductActions(product)
  }));
};

/**
 * Transform categories data for admin management
 */
export const transformCategoriesData = (rawData) => {
  if (!rawData?.data) return [];

  return rawData.data.map(category => ({
    id: category._id,
    name: category.name,
    description: category.description,
    level: category.level || 0,
    parentCategory: category.parentCategoryId?.name || null,
    isActive: category.isActive,
    isAvailable: category.isAvailable,
    totalProducts: category.totalProducts || 0,
    totalListings: category.totalListings || 0,
    totalOrders: category.totalOrders || 0,
    createdAt: format(new Date(category.createdAt), 'PPp'),
    image: category.imageUrl,
    usageStats: calculateCategoryUsage(category),
    availableActions: getCategoryActions(category)
  }));
};

/**
 * Calculate product performance score
 */
const calculateProductPerformance = (product) => {
  let score = 0;
  
  // Listing adoption
  if (product.totalListings > 50) score += 30;
  else if (product.totalListings > 20) score += 20;
  else if (product.totalListings > 5) score += 10;
  
  // Order volume
  if (product.totalOrders > 100) score += 30;
  else if (product.totalOrders > 50) score += 20;
  else if (product.totalOrders > 10) score += 10;
  
  // Price stability
  if (product.priceVariance < 0.1) score += 20;
  else if (product.priceVariance < 0.3) score += 10;
  
  // Vendor adoption rate
  if (product.uniqueVendors > 20) score += 20;
  else if (product.uniqueVendors > 10) score += 10;
  
  return Math.min(score, 100);
};

/**
 * Calculate category usage statistics
 */
const calculateCategoryUsage = (category) => {
  return {
    adoptionRate: category.totalProducts > 0 
      ? ((category.activeListings / category.totalProducts) * 100).toFixed(2)
      : 0,
    orderRate: category.totalListings > 0
      ? ((category.totalOrders / category.totalListings) * 100).toFixed(2)
      : 0,
    averageListingsPerProduct: category.totalProducts > 0
      ? (category.totalListings / category.totalProducts).toFixed(2)
      : 0,
    growthTrend: category.monthlyGrowth || 0
  };
};

/**
 * Get available actions for products
 */
const getProductActions = (product) => {
  const actions = ['view_details', 'edit', 'view_listings', 'view_analytics'];
  
  if (product.status === 'active') {
    actions.push('deactivate');
  } else {
    actions.push('activate');
  }
  
  if (product.totalListings > 0) {
    actions.push('export_data');
  }
  
  actions.push('safe_delete');
  return actions;
};

/**
 * Get available actions for categories
 */
const getCategoryActions = (category) => {
  const actions = ['view_details', 'edit', 'view_products', 'view_usage_stats'];
  
  if (category.isAvailable) {
    actions.push('flag_unavailable');
  } else {
    actions.push('mark_available');
  }
  
  if (category.totalProducts > 0) {
    actions.push('export_data');
  }
  
  actions.push('safe_delete');
  return actions;
};

const catalogService = {
  transformProductsData,
  transformCategoriesData
};

export default catalogService;