import { useEffect, Suspense, lazy } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useGetCurrentUserQuery } from './store/slices/apiSlice';
import { selectAuth } from './store/slices/authSlice';
import { initializeTheme } from './store/slices/themeSlice';
import authService from './services/authService';
import AarothLogo from './assets/AAROTH_ICON.png';

// Removed debug component

// Layout Components
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/admin/layout/AdminLayout/AdminLayout';

// Route Protection Components
import ProtectedRoute, {
  AdminRoute,
  VendorRoute,
  BuyerRoute,
  BuyerOwnerRoute,
  GuestRoute,
} from './components/auth/ProtectedRoute';

// Loading Component
import LoadingSpinner from './components/ui/LoadingSpinner';

// Lazy-loaded Page Components for Code Splitting
// Public Pages
const PublicHomepage = lazy(() => import('./pages/public/Homepage'));
const ProductCatalog = lazy(() => import('./pages/public/ProductCatalog'));
const VendorDirectory = lazy(() => import('./pages/public/VendorDirectory'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));

// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const PendingApprovalPage = lazy(
  () => import('./pages/auth/PendingApprovalPage')
);

// Admin Pages
const AdminDashboardPage = lazy(
  () => import('./pages/admin/dashboard/DashboardPage')
);
const AdminUsersPage = lazy(
  () => import('./pages/admin/users/UsersManagementPage')
);
const AdminVendorsPage = lazy(
  () => import('./pages/admin/vendors/VendorsManagementPage')
);
const BuyersManagementPage = lazy(
  () => import('./pages/admin/buyers/BuyerManagementPage')
);
const ProductsManagementPage = lazy(
  () => import('./pages/admin/catalog/products/ProductsManagementPage')
);
const CategoriesManagementPage = lazy(
  () => import('./pages/admin/catalog/categories/CategoriesManagementPage')
);
const MarketsManagementPage = lazy(
  () => import('./pages/admin/catalog/markets/MarketManagementPage')
);
const ListingsManagementPage = lazy(
  () => import('./pages/admin/listings/ListingManagementPage')
);
const BusinessAnalytics = lazy(
  () => import('./pages/admin/analytics/BusinessAnalytics')
);
const PerformanceMonitoring = lazy(
  () => import('./pages/admin/performance/PerformanceMonitoring')
);
const SystemSettings = lazy(
  () => import('./pages/admin/settings/SystemSettings')
);

// Vendor Pages
const VendorDashboard = lazy(
  () => import('./pages/vendor/VendorDashboardEnhanced')
);
const ListingManagement = lazy(
  () => import('./pages/vendor/ListingManagement')
);
const CreateListing = lazy(() => import('./pages/vendor/CreateListing'));
const EditListing = lazy(() => import('./pages/vendor/EditListing'));
const VendorAnalytics = lazy(() => import('./pages/vendor/VendorAnalytics'));
const OrderManagement = lazy(() => import('./pages/vendor/OrderManagement'));
const OrderDetail = lazy(() => import('./pages/vendor/OrderDetail'));
const VendorProfile = lazy(() => import('./pages/vendor/VendorProfile'));
const VendorFinancialReports = lazy(
  () => import('./pages/vendor/VendorFinancialReports')
);
const VendorCustomerManagement = lazy(
  () => import('./pages/vendor/VendorCustomerManagement')
);
const VendorReviews = lazy(() => import('./pages/vendor/VendorReviews'));
const VendorNotifications = lazy(
  () => import('./pages/vendor/VendorNotifications')
);

// Buyer Pages (to be created)
const BuyerDashboard = lazy(
  () => import('./pages/buyer/BuyerDashboard')
);
const ProductBrowsing = lazy(
  () => import('./pages/buyer/ProductBrowsing')
);
const ProductComparison = lazy(
  () => import('./pages/buyer/ProductComparison')
);
const ProductDetail = lazy(() => import('./pages/buyer/ProductDetail'));
const PlaceOrder = lazy(() => import('./pages/buyer/PlaceOrder'));
const OrderHistory = lazy(() => import('./pages/buyer/OrderHistory'));
const BuyerProfile = lazy(
  () => import('./pages/buyer/BuyerProfile')
);
const ManagerManagement = lazy(
  () => import('./pages/buyer/ManagerManagement')
);
const BudgetManagement = lazy(
  () => import('./pages/buyer/BudgetManagement')
);

// Shared Pages
const Profile = lazy(() => import('./pages/shared/Profile'));
const Settings = lazy(() => import('./pages/shared/Settings'));
const ChangePassword = lazy(() => import('./pages/shared/ChangePassword'));

// Error Pages
const NotFoundPage = lazy(() => import('./pages/error/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/error/ServerErrorPage'));
const AccountSuspendedPage = lazy(
  () => import('./pages/error/AccountSuspendedPage')
);
const MaintenancePage = lazy(() => import('./pages/error/MaintenancePage'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="text-center">
      <img
        src={AarothLogo}
        alt="Aaroth Fresh"
        className="w-12 h-12 mx-auto mb-4 animate-pulse"
      />
      <LoadingSpinner size="large" />
    </div>
  </div>
);

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector(selectAuth);

  // Initialize theme system on app start
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // Initialize authentication on app start
  useEffect(() => {
    authService.initializeAuth();
  }, []);

  // Validate current user on app start if token exists
  const { isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && error.status === 401) {
      // Authentication failed, perform logout
      authService.performLogout();
    }
  }, [error]);

  // App-level loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-earthy-beige via-white to-sage-green/10">
        <div className="text-center">
          <div className="relative mb-8">
            <img
              src={AarothLogo}
              alt="Aaroth Fresh"
              className="w-24 h-24 mx-auto mb-4 animate-pulse"
            />
            <div className="w-16 h-16 border-4 border-muted-olive/20 border-t-muted-olive rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-text-muted font-medium">Loading Aaroth Fresh...</p>
        </div>
      </div>
    );
  }

  // Role-based redirect helper
  const getRoleBasedRedirect = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard'; // Updated to use new admin interface
      case 'vendor':
        return '/vendor/dashboard';
      case 'buyerOwner':
      case 'buyerManager':
        return '/buyer/dashboard';
      default:
        return '/';
    }
  };

  return (
    <div className="App min-h-screen bg-background font-sans">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Root Redirect - Redirect to appropriate dashboard if authenticated */}
          <Route
            path="/"
            element={
              isAuthenticated && user ? (
                <Navigate to={getRoleBasedRedirect(user.role)} replace />
              ) : (
                <PublicHomepage />
              )
            }
          />

          {/* Public Routes - Accessible without authentication */}
          <Route path="/home" element={<PublicHomepage />} />
          <Route path="/products" element={<ProductCatalog />} />
          <Route path="/vendors" element={<VendorDirectory />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Authentication Routes - Only for non-authenticated users */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />

          {/* Special Auth Status Routes */}
          <Route
            path="/vendor/pending-approval"
            element={
              <VendorRoute requireApproval={false}>
                <PendingApprovalPage />
              </VendorRoute>
            }
          />
          <Route path="/account/suspended" element={<AccountSuspendedPage />} />
          <Route path="/maintenance" element={<MaintenancePage />} />

          {/* Admin Routes - Enhanced Interface */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboardPage />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminUsersPage />
                </Suspense>
              }
            />
            <Route
              path="vendors"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminVendorsPage />
                </Suspense>
              }
            />

            {/* Buyer & Catalog Management */}
            <Route
              path="buyers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BuyersManagementPage />
                </Suspense>
              }
            />
            <Route
              path="products"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductsManagementPage />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CategoriesManagementPage />
                </Suspense>
              }
            />
            <Route
              path="markets"
              element={
                <Suspense fallback={<PageLoader />}>
                  <MarketsManagementPage />
                </Suspense>
              }
            />
            <Route
              path="listings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ListingsManagementPage />
                </Suspense>
              }
            />

            {/* Analytics & Performance Monitoring (Prompt 7) */}
            <Route
              path="analytics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BusinessAnalytics />
                </Suspense>
              }
            />
            <Route
              path="analytics/business"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BusinessAnalytics />
                </Suspense>
              }
            />
            <Route
              path="performance"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PerformanceMonitoring />
                </Suspense>
              }
            />

            {/* System Settings Management (Prompt 8) */}
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SystemSettings />
                </Suspense>
              }
            />
            <Route
              path="settings/general"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SystemSettings />
                </Suspense>
              }
            />
            <Route
              path="settings/business"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SystemSettings />
                </Suspense>
              }
            />
            <Route
              path="settings/security"
              element={
                <Suspense fallback={<PageLoader />}>
                  <SystemSettings />
                </Suspense>
              }
            />

            {/* More admin routes will be added as pages are implemented */}
          </Route>

          {/* Vendor Routes - Protected with AppLayout */}
          <Route
            path="/vendor"
            element={
              <VendorRoute>
                <AppLayout />
              </VendorRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorDashboard />
                </Suspense>
              }
            />
            <Route
              path="listings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ListingManagement />
                </Suspense>
              }
            />
            <Route
              path="listings/create"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreateListing />
                </Suspense>
              }
            />
            <Route
              path="listings/:id/edit"
              element={
                <Suspense fallback={<PageLoader />}>
                  <EditListing />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OrderManagement />
                </Suspense>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OrderDetail />
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorAnalytics />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorProfile />
                </Suspense>
              }
            />
            <Route
              path="financial-reports"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorFinancialReports />
                </Suspense>
              }
            />
            <Route
              path="customers"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorCustomerManagement />
                </Suspense>
              }
            />
            <Route
              path="reviews"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorReviews />
                </Suspense>
              }
            />
            <Route
              path="notifications"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorNotifications />
                </Suspense>
              }
            />
          </Route>

          {/* Buyer Routes - Protected with AppLayout */}
          <Route
            path="/buyer"
            element={
              <BuyerRoute>
                <AppLayout />
              </BuyerRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BuyerDashboard />
                </Suspense>
              }
            />
            <Route
              path="browse"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductBrowsing />
                </Suspense>
              }
            />
            <Route
              path="comparison"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductComparison />
                </Suspense>
              }
            />
            <Route
              path="browse/:productId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductDetail />
                </Suspense>
              }
            />
            <Route
              path="cart"
              element={
                <Suspense fallback={<PageLoader />}>
                  <PlaceOrder />
                </Suspense>
              }
            />
            <Route
              path="orders"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OrderHistory />
                </Suspense>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <Suspense fallback={<PageLoader />}>
                  <OrderDetail />
                </Suspense>
              }
            />
            <Route
              path="budget"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BudgetManagement />
                </Suspense>
              }
            />
            <Route
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <BuyerProfile />
                </Suspense>
              }
            />
            <Route
              path="managers"
              element={
                <BuyerOwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ManagerManagement />
                  </Suspense>
                </BuyerOwnerRoute>
              }
            />
            {/* Buyer Management Routes */}
            <Route
              path="manage/managers"
              element={
                <BuyerOwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ManagerManagement />
                  </Suspense>
                </BuyerOwnerRoute>
              }
            />
          </Route>

          {/* Shared Protected Routes - All authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChangePassword />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Error Routes */}
          <Route path="/500" element={<ServerErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      {/* Toast Notifications with Glassmorphism Styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px',
            maxWidth: '400px',
          },
          success: {
            style: {
              background: 'rgba(187, 247, 208, 0.9)',
              borderColor: 'rgba(34, 197, 94, 0.2)',
              color: '#166534',
            },
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              background: 'rgba(254, 226, 226, 0.9)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
              color: '#991b1b',
            },
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
          loading: {
            style: {
              background: 'rgba(219, 234, 254, 0.9)',
              borderColor: 'rgba(59, 130, 246, 0.2)',
              color: '#1e40af',
            },
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
    </div>
  );
};

export default App;
