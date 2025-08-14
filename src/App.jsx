import { useEffect, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from './store/slices/apiSlice';
import { selectAuth } from './store/slices/authSlice';
import authService from './services/authService';

// Layout Components
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';

// Route Protection Components
import ProtectedRoute, {
  AdminRoute,
  VendorRoute,
  RestaurantRoute,
  RestaurantOwnerRoute,
  PublicRoute,
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
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const VendorApproval = lazy(() => import('./pages/admin/VendorApproval'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
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

// Vendor Pages
const VendorDashboard = lazy(() => import('./pages/vendor/VendorDashboard'));
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
  () => import('./pages/restaurant/RestaurantDashboard')
);
const ProductBrowsing = lazy(
  () => import('./pages/restaurant/ProductBrowsing')
);
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
    <LoadingSpinner size="large" />
  </div>
);

const App = () => {
  const { isAuthenticated, token, user } = useSelector(selectAuth);

  // Validate current user on app start if token exists
  const { isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && error.status === 401) {
      console.log('Authentication failed, logging out...');
      authService.logout();
    }
  }, [error]);

  // App-level loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-bottle-green/20 border-t-bottle-green rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-text-muted font-medium">Loading Aaroth Fresh...</p>
        </div>
      </div>
    );
  }

  // Role-based redirect helper
  const getRoleBasedRedirect = (userRole) => {
    switch (userRole) {
      case 'admin':
        return '/admin/dashboard';
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
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                      />
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route
                        path="vendors/approval"
                        element={<VendorApproval />}
                      />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="products/list" element={<ProductList />} />
                      <Route path="products/create" element={<ProductForm />} />
                      <Route
                        path="products/:id/edit"
                        element={<ProductForm />}
                      />
                      <Route
                        path="products/approval"
                        element={<ProductApproval />}
                      />
                      <Route
                        path="categories"
                        element={<CategoryManagement />}
                      />
                      <Route
                        path="analytics"
                        element={<AnalyticsDashboard />}
                      />
                      <Route
                        path="analytics/products"
                        element={<ProductAnalytics />}
                      />
                      <Route
                        path="create-restaurant-owner"
                        element={<CreateRestaurantOwner />}
                      />
                      <Route
                        path="create-restaurant-manager"
                        element={<CreateRestaurantManager />}
                      />
                    </Routes>
                  </Suspense>
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Vendor Routes - Protected with AppLayout */}
          <Route
            path="/vendor"
            element={
              <VendorRoute>
                <AppLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                      />
                      <Route path="dashboard" element={<VendorDashboard />} />
                      <Route path="listings" element={<ListingManagement />} />
                      <Route
                        path="listings/create"
                        element={<CreateListing />}
                      />
                      <Route
                        path="listings/:id/edit"
                        element={<EditListing />}
                      />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="orders/:orderId" element={<OrderDetail />} />
                      <Route path="analytics" element={<VendorAnalytics />} />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </VendorRoute>
            }
          />

          {/* Restaurant Routes - Protected with AppLayout */}
          <Route
            path="/restaurant"
            element={
              <RestaurantRoute>
                <AppLayout>
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route
                        index
                        element={<Navigate to="dashboard" replace />}
                      />
                      <Route
                        path="dashboard"
                        element={<RestaurantDashboard />}
                      />
                      <Route path="browse" element={<ProductBrowsing />} />
                      <Route path="order" element={<PlaceOrder />} />
                      <Route path="orders" element={<OrderHistory />} />
                      <Route path="orders/:orderId" element={<OrderDetail />} />
                      <Route path="profile" element={<RestaurantProfile />} />
                      <Route
                        path="managers"
                        element={
                          <RestaurantOwnerRoute>
                            <ManagerManagement />
                          </RestaurantOwnerRoute>
                        }
                      />
                    </Routes>
                  </Suspense>
                </AppLayout>
              </RestaurantRoute>
            }
          />

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
    </div>
  );
};

export default App;
