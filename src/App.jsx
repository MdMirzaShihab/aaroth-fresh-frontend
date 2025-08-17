import { useEffect, Suspense, lazy } from 'react';
import { useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useGetCurrentUserQuery } from './store/slices/apiSlice';
import { selectAuth } from './store/slices/authSlice';
import authService from './services/authService';
import AarothLogo from './assets/AarothLogo.png';

// Debug Component (temporary)
import TokenDiagnosticPanel from './components/debug/TokenDiagnosticPanel';

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

  // Validate current user on app start if token exists
  const { isLoading, error } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated || !token,
  });

  // Handle authentication errors
  useEffect(() => {
    if (error && error.status === 401) {
      console.log('Authentication failed, logging out...');
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

      {/* Token Diagnostic Panel - Remove this in production */}
      {/* {process.env.NODE_ENV === 'development' && <TokenDiagnosticPanel />} */}
    </div>
  );
};

export default App;
