/**
 * Admin V2 Pages Export Index
 * Comprehensive admin interface with full API coverage
 */

// Dashboard
export { default as DashboardPage } from './dashboard/DashboardPage';

// User Management
export { default as UsersManagementPage } from './users/UsersManagementPage';
export { default as CreateBuyerOwner } from './users/CreateBuyerOwner';
export { default as CreateBuyerManager } from './users/CreateBuyerManager';

// Vendor Management
export { default as VendorsManagementPage } from './vendors/VendorsManagementPage';
export { default as VerificationQueue } from './vendors/VerificationQueue';

// Buyer Management
export { default as BuyersManagementPage } from './buyers/BuyersManagementPage';

// Catalog Management
export { default as ProductsManagementPage } from './catalog/products/ProductsManagementPage';
export { default as CategoriesManagementPage } from './catalog/categories/CategoriesManagementPage';

// Listing Management
export { default as ListingManagementPage } from './listings/ListingManagementPage';

// Analytics
export { default as BusinessAnalytics } from './analytics/BusinessAnalytics';
export { default as PerformanceMonitoring } from './analytics/PerformanceMonitoring';

// Settings
export { default as SystemSettings } from './settings/SystemSettings';
