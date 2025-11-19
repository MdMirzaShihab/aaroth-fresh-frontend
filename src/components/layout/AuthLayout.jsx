import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Toast from '../ui/Toast';
import AarothLogo from '../../assets/AAROTH_ICON.png';

/**
 * AuthLayout Component
 *
 * Layout wrapper for authentication pages (login, register, forgot password)
 * Features:
 * - Mobile-first responsive design
 * - Organic futurism design principles
 * - Toast notifications integration
 * - Breadcrumb navigation
 * - Accessibility features
 */
const AuthLayout = ({
  children,
  title,
  subtitle,
  showBackButton = true,
  backButtonText = 'Back to Home',
  backButtonPath = '/',
  backgroundVariant = 'default',
}) => {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'vendor':
        return 'bg-gradient-to-br from-earthy-beige via-white to-earthy-yellow/10';
      case 'buyer':
        return 'bg-gradient-to-br from-sage-green/10 via-white to-earthy-beige/20';
      case 'admin':
        return 'bg-gradient-to-br from-muted-olive/5 via-white to-earthy-beige/10';
      default:
        return 'bg-gradient-to-br from-earthy-beige via-white to-sage-green/10';
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${getBackgroundClasses()} px-4 py-8`}
    >
      {/* Background Pattern - Subtle organic shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-earthy-yellow/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-sage-green/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-1/3 w-32 h-32 bg-muted-olive/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-3 mb-8 group focus:outline-none focus:ring-2 focus:ring-muted-olive/40 focus:ring-offset-4 rounded-2xl"
          >
            <div className="p-3 rounded-2xl shadow-lg group-hover:shadow-xl group-hover:shadow-glow-green/20 transition-all duration-300 group-hover:scale-105">
              <img
                src={AarothLogo}
                alt="Aaroth Fresh"
                className="w-12 h-12 object-contain"
              />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-medium text-text-dark group-hover:text-muted-olive transition-colors duration-300">
                Aaroth Fresh
              </h1>
              <p className="text-sm text-text-muted">B2B Marketplace</p>
            </div>
          </Link>

          {/* Back Button */}
          {showBackButton && (
            <Link
              to={backButtonPath}
              className="inline-flex items-center gap-2 text-text-muted hover:text-muted-olive text-sm transition-colors duration-200 mb-6 focus:outline-none focus:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              {backButtonText}
            </Link>
          )}

          {/* Page Title */}
          {title && (
            <div className="mb-6">
              <h2 className="text-3xl font-medium text-text-dark/80 mb-2">
                {title}
              </h2>
              {subtitle && (
                <p className="text-text-muted leading-relaxed max-w-sm mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <main className="animate-fade-in">{children}</main>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-muted/80">
            <Link
              to="/privacy"
              className="hover:text-muted-olive transition-colors duration-200 focus:outline-none focus:underline"
            >
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-text-muted/60">•</span>
            <Link
              to="/terms"
              className="hover:text-muted-olive transition-colors duration-200 focus:outline-none focus:underline"
            >
              Terms of Service
            </Link>
            <span className="hidden sm:inline text-text-muted/60">•</span>
            <Link
              to="/support"
              className="hover:text-muted-olive transition-colors duration-200 focus:outline-none focus:underline"
            >
              Support
            </Link>
          </div>
          <p className="mt-4 text-xs text-text-muted/60">
            © 2024 Aaroth Fresh. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

/**
 * Specialized Auth Layouts for different user types
 */
export const LoginLayout = ({ children }) => (
  <AuthLayout
    title="Welcome Back"
    subtitle="Sign in to your Aaroth Fresh account"
    showBackButton
    backButtonText="Back to Home"
    backButtonPath="/"
  >
    {children}
  </AuthLayout>
);

export const RegisterLayout = ({ children }) => (
  <AuthLayout>{children}</AuthLayout>
);

export const VendorRegisterLayout = ({ children }) => (
  <AuthLayout
    title="Become a Vendor"
    subtitle="Join our network of trusted produce suppliers"
    showBackButton
    backButtonText="Back to Registration"
    backButtonPath="/register"
    backgroundVariant="vendor"
  >
    {children}
  </AuthLayout>
);

export const BuyerRegisterLayout = ({ children }) => (
  <AuthLayout
    title="Join as Buyer"
    subtitle="Access fresh ingredients for your buyer"
    showBackButton
    backButtonText="Back to Registration"
    backButtonPath="/register"
    backgroundVariant="buyer"
  >
    {children}
  </AuthLayout>
);

export const ForgotPasswordLayout = ({ children }) => (
  <AuthLayout
    title="Reset Password"
    subtitle="Enter your phone number to receive reset instructions"
    showBackButton
    backButtonText="Back to Sign In"
    backButtonPath="/login"
  >
    {children}
  </AuthLayout>
);

export const PendingApprovalLayout = ({ children }) => (
  <AuthLayout
    title="Account Under Review"
    subtitle="Your vendor application is being reviewed by our team"
    showBackButton={false}
    backgroundVariant="vendor"
  >
    {children}
  </AuthLayout>
);

export const AccountSuspendedLayout = ({ children }) => (
  <AuthLayout
    title="Account Suspended"
    subtitle="Your account has been temporarily suspended"
    showBackButton={false}
  >
    {children}
  </AuthLayout>
);

export default AuthLayout;
