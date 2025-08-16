import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuth } from '../../store/slices/authSlice';
import LoadingSpinner from '../ui/LoadingSpinner';
import { hasRole, hasAnyRole } from '../../utils';

/**
 * ProtectedRoute Component
 *
 * Protects routes based on authentication and role-based access control
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The component to render if access is granted
 * @param {string|string[]} props.roles - Required role(s) to access the route
 * @param {boolean} props.requireAuth - Whether authentication is required (default: true)
 * @param {string} props.redirectTo - Custom redirect path for unauthorized access
 * @param {boolean} props.requireApproval - Whether vendor approval is required (default: false)
 */
const ProtectedRoute = ({
  children,
  roles,
  requireAuth = true,
  redirectTo,
  requireApproval = false,
}) => {
  const { user, isAuthenticated, loading } = useSelector(selectAuth);
  const location = useLocation();

  // Debug logging (can be removed in production)
  // console.log('ProtectedRoute Debug:', {
  //   path: location.pathname,
  //   isAuthenticated,
  //   user: user ? { role: user.role, name: user.name } : null,
  //   loading,
  //   requiredRoles: roles,
  //   requireAuth,
  //   requireApproval
  // });

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if user exists when authenticated
  if (requireAuth && isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check role-based access control
  if (roles && user) {
    const hasRequiredRole = Array.isArray(roles)
      ? hasAnyRole(user, roles)
      : hasRole(user, roles);

    if (!hasRequiredRole) {
      // Redirect based on user's role if they don't have required role
      const defaultRedirect = getRoleBasedRedirect(user.role);
      return <Navigate to={redirectTo || defaultRedirect} replace />;
    }
  }

  // Check vendor approval status
  if (requireApproval && user && user.role === 'vendor' && !user.isApproved) {
    return <Navigate to="/vendor/pending-approval" replace />;
  }

  // Check for suspended or inactive accounts
  if (user && user.status === 'suspended') {
    return <Navigate to="/account/suspended" replace />;
  }

  if (user && user.status === 'inactive') {
    return <Navigate to="/account/inactive" replace />;
  }

  // All checks passed, render the protected component
  return children;
};

/**
 * Get default redirect path based on user role
 */
const getRoleBasedRedirect = (role) => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'vendor':
      return '/vendor/dashboard';
    case 'restaurantOwner':
    case 'restaurantManager':
      return '/restaurant/dashboard';
    default:
      return '/dashboard';
  }
};

/**
 * HOC for creating role-specific protected routes
 */
export const withRoleProtection =
  (roles, options = {}) =>
  (Component) => {
    return function RoleProtectedComponent(props) {
      return (
        <ProtectedRoute roles={roles} {...options}>
          <Component {...props} />
        </ProtectedRoute>
      );
    };
  };

/**
 * Specific role-based route components
 */
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute roles={['admin']} {...props}>
    {children}
  </ProtectedRoute>
);

export const VendorRoute = ({ children, requireApproval = true, ...props }) => (
  <ProtectedRoute
    roles={['vendor']}
    requireApproval={requireApproval}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

export const RestaurantRoute = ({ children, ...props }) => {
  // console.log('RestaurantRoute: Wrapping with restaurant roles protection');
  return (
    <ProtectedRoute roles={['restaurantOwner', 'restaurantManager']} {...props}>
      {children}
    </ProtectedRoute>
  );
};

export const RestaurantOwnerRoute = ({ children, ...props }) => (
  <ProtectedRoute roles={['restaurantOwner']} {...props}>
    {children}
  </ProtectedRoute>
);

export const BusinessRoute = ({ children, ...props }) => (
  <ProtectedRoute
    roles={['vendor', 'restaurantOwner', 'restaurantManager']}
    {...props}
  >
    {children}
  </ProtectedRoute>
);

/**
 * Public route that redirects authenticated users to their dashboard
 */
export const PublicRoute = ({ children, redirectAuthenticated = true }) => {
  const { isAuthenticated, user } = useSelector(selectAuth);

  if (redirectAuthenticated && isAuthenticated && user) {
    const redirectPath = getRoleBasedRedirect(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * Guest route - only accessible to non-authenticated users
 */
export const GuestRoute = ({ children }) => (
  <PublicRoute redirectAuthenticated>{children}</PublicRoute>
);

export default ProtectedRoute;
