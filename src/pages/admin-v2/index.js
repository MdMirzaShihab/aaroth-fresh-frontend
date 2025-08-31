/**
 * Admin V2 Pages Export Index
 * Comprehensive admin interface with full API coverage
 */

// Dashboard
export { default as DashboardPage } from './dashboard/DashboardPage';

// User Management
export { default as UsersManagementPage } from './users/UsersManagementPage';
export { default as CreateRestaurantOwner } from './users/CreateRestaurantOwner';
export { default as CreateRestaurantManager } from './users/CreateRestaurantManager';

// Vendor Management
export { default as VendorsManagementPage } from './vendors/VendorsManagementPage';
export { default as VerificationQueue } from './vendors/VerificationQueue';

// Restaurant Management
export { default as RestaurantsManagementPage } from './restaurants/RestaurantsManagementPage';

// Catalog Management
export { default as ProductsManagementPage } from './catalog/products/ProductsManagementPage';
export { default as CategoriesManagementPage } from './catalog/categories/CategoriesManagementPage';
export { default as ListingsManagementPage } from './catalog/listings/ListingsManagementPage';

// Analytics
export { default as BusinessAnalytics } from './analytics/BusinessAnalytics';
export { default as PerformanceMonitoring } from './analytics/PerformanceMonitoring';

// Settings
export { default as SystemSettings } from './settings/SystemSettings';
