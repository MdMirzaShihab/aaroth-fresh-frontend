import { useEffect, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useGetCurrentUserQuery } from './store/slices/apiSlice';
import { selectAuth } from './store/slices/authSlice';
import authService from './services/authService';
import AarothLogo from './assets/AarothLogo.png';

// Removed debug component

// Layout Components
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import AdminV2Layout from './components/admin-v2/layout/AdminLayout/AdminLayout';

// Route Protection Components
import ProtectedRoute, {
  AdminRoute,
  VendorRoute,
  RestaurantRoute,
  RestaurantOwnerRoute,
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
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ApprovalManagement = lazy(() => import('./pages/admin/ApprovalsPage'));
const VerificationDashboard = lazy(
  () => import('./pages/admin/VerificationDashboard')
);
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'));
const RestaurantManagement = lazy(
  () => import('./pages/admin/RestaurantManagement')
);
const ProductList = lazy(() => import('./pages/admin/ProductList'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const CategoryManagement = lazy(
  () => import('./pages/admin/CategoryManagement')
);
const ProductAnalytics = lazy(() => import('./pages/admin/ProductAnalytics'));
const ProductApproval = lazy(() => import('./pages/admin/ProductApproval'));
const AnalyticsDashboard = lazy(
  () => import('./pages/admin/AnalyticsDashboard')
);
const CreateRestaurantOwner = lazy(
  () => import('./pages/admin/CreateRestaurantOwner')
);
const CreateRestaurantManager = lazy(
  () => import('./pages/admin/CreateRestaurantManager')
);
const CreateVendor = lazy(() => import('./pages/admin/CreateVendor'));
const AdminProductManagement = lazy(
  () => import('./pages/admin/AdminProductManagement')
);
const AdminListingsManagement = lazy(
  () => import('./pages/admin/AdminListingsManagement')
);
const AdminSystemSettings = lazy(
  () => import('./pages/admin/AdminSystemSettings')
);

// Admin V2 Pages
const AdminV2DashboardPage = lazy(
  () => import('./pages/admin-v2/dashboard/DashboardPage')
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

// Restaurant Pages (to be created)
const RestaurantDashboard = lazy(
  () => import('./pages/restaurant/RestaurantDashboardEnhanced')
);
const ProductBrowsing = lazy(
  () => import('./pages/restaurant/ProductBrowsing')
);
const ProductComparison = lazy(
  () => import('./pages/restaurant/ProductComparison')
);
const ProductDetail = lazy(() => import('./pages/restaurant/ProductDetail'));
const PlaceOrder = lazy(() => import('./pages/restaurant/PlaceOrder'));
const OrderHistory = lazy(() => import('./pages/restaurant/OrderHistory'));
const RestaurantProfile = lazy(
  () => import('./pages/restaurant/RestaurantProfile')
);
const ManagerManagement = lazy(
  () => import('./pages/restaurant/ManagerManagement')
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
  const { isAuthenticated, token, user } = useSelector(selectAuth);

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10">
        <div className="text-center">
          <div className="relative mb-8">
            <img
              src={AarothLogo}
              alt="Aaroth Fresh"
              className="w-24 h-24 mx-auto mb-4 animate-pulse"
            />
            <div className="w-16 h-16 border-4 border-bottle-green/20 border-t-bottle-green rounded-full animate-spin mx-auto"></div>
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
        return '/admin-v2/dashboard'; // Updated to use new admin-v2 interface
      case 'vendor':
        return '/vendor/dashboard';
      case 'restaurantOwner':
      case 'restaurantManager':
        return '/restaurant/dashboard';
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

          {/* Admin Routes - Protected with AdminLayout */}
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
                  <AdminDashboard />
                </Suspense>
              }
            />
            <Route
              path="approvals"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ApprovalManagement />
                </Suspense>
              }
            />
            <Route
              path="verification-dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VerificationDashboard />
                </Suspense>
              }
            />
            <Route
              path="users"
              element={
                <Suspense fallback={<PageLoader />}>
                  <UserManagement />
                </Suspense>
              }
            />
            <Route
              path="users/vendors"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorManagement />
                </Suspense>
              }
            />
            <Route
              path="users/restaurants"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RestaurantManagement />
                </Suspense>
              }
            />
            <Route
              path="restaurant-management"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RestaurantManagement />
                </Suspense>
              }
            />
            <Route
              path="vendor-management"
              element={
                <Suspense fallback={<PageLoader />}>
                  <VendorManagement />
                </Suspense>
              }
            />
            <Route
              path="products"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminProductManagement />
                </Suspense>
              }
            />
            <Route
              path="products/list"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductList />
                </Suspense>
              }
            />
            <Route
              path="products/create"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductForm />
                </Suspense>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductForm />
                </Suspense>
              }
            />
            <Route
              path="products/approval"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductApproval />
                </Suspense>
              }
            />
            <Route
              path="categories"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CategoryManagement />
                </Suspense>
              }
            />
            <Route
              path="products/categories"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CategoryManagement />
                </Suspense>
              }
            />
            <Route
              path="listings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminListingsManagement />
                </Suspense>
              }
            />
            <Route
              path="products/listings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminListingsManagement />
                </Suspense>
              }
            />
            <Route
              path="analytics"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AnalyticsDashboard />
                </Suspense>
              }
            />
            <Route
              path="listing-management"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminListingsManagement />
                </Suspense>
              }
            />
            <Route
              path="analytics/products"
              element={
                <Suspense fallback={<PageLoader />}>
                  <ProductAnalytics />
                </Suspense>
              }
            />
            <Route
              path="create-restaurant-owner"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreateRestaurantOwner />
                </Suspense>
              }
            />
            <Route
              path="create-restaurant-manager"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreateRestaurantManager />
                </Suspense>
              }
            />
            <Route
              path="create-vendor"
              element={
                <Suspense fallback={<PageLoader />}>
                  <CreateVendor />
                </Suspense>
              }
            />
            <Route
              path="settings"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminSystemSettings />
                </Suspense>
              }
            />
          </Route>

          {/* Admin V2 Routes - New Enhanced Interface (Development) */}
          <Route
            path="/admin-v2/*"
            element={
              <AdminRoute>
                <AdminV2Layout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <AdminV2DashboardPage />
                </Suspense>
              }
            />
            {/* More admin-v2 routes will be added as pages are implemented */}
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
          </Route>

          {/* Restaurant Routes - Protected with AppLayout */}
          <Route
            path="/restaurant"
            element={
              <RestaurantRoute>
                <AppLayout />
              </RestaurantRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RestaurantDashboard />
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
              path="order"
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
              path="profile"
              element={
                <Suspense fallback={<PageLoader />}>
                  <RestaurantProfile />
                </Suspense>
              }
            />
            <Route
              path="managers"
              element={
                <RestaurantOwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ManagerManagement />
                  </Suspense>
                </RestaurantOwnerRoute>
              }
            />
            {/* Restaurant Management Routes */}
            <Route
              path="manage/managers"
              element={
                <RestaurantOwnerRoute>
                  <Suspense fallback={<PageLoader />}>
                    <ManagerManagement />
                  </Suspense>
                </RestaurantOwnerRoute>
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
