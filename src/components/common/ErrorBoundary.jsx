import React from 'react';
import { AlertTriangle, RefreshCcw, Home, Mail } from 'lucide-react';

/**
 * Enhanced ErrorBoundary - UI Component
 * Comprehensive error boundary for all dashboards with enhanced error reporting
 * Supports admin, vendor, and restaurant dashboard contexts
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Log error to external service if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    const { homeUrl = '/' } = this.props;
    window.location.href = homeUrl;
  };

  render() {
    if (this.state.hasError) {
      const {
        title = 'Something went wrong',
        fallbackMessage,
        showHomeButton = false,
        supportEmail,
        maxRetries = 3,
        variant = 'default', // 'default' | 'admin' | 'vendor' | 'restaurant'
      } = this.props;

      const getVariantTitle = () => {
        switch (variant) {
          case 'admin':
            return 'Admin Panel Error';
          case 'vendor':
            return 'Vendor Dashboard Error';
          case 'restaurant':
            return 'Restaurant Dashboard Error';
          default:
            return title;
        }
      };

      const getVariantMessage = () => {
        if (fallbackMessage) return fallbackMessage;

        switch (variant) {
          case 'admin':
            return 'Something went wrong in the admin interface. This error has been logged and our team will investigate the issue.';
          case 'vendor':
            return 'We encountered an issue with your vendor dashboard. Please try again or contact support if the problem persists.';
          case 'restaurant':
            return 'There was a problem with your restaurant dashboard. Please refresh or contact support for assistance.';
          default:
            return 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.';
        }
      };

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-earthy-beige/20 to-white">
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl shadow-soft border border-white/20 backdrop-blur-sm p-8">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-tomato-red/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-tomato-red" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-4 mb-8">
              <h1 className="text-2xl font-bold text-text-dark dark:text-white">
                {getVariantTitle()}
              </h1>
              <p className="text-text-muted dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                {getVariantMessage()}
              </p>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-text-dark dark:text-white mb-2">
                  Error Details (Development)
                </h3>
                <div className="text-sm text-text-muted dark:text-gray-400 space-y-2">
                  <div>
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-32 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                  <div>
                    <strong>Retry Count:</strong> {this.state.retryCount}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button
                onClick={this.handleRetry}
                disabled={this.state.retryCount >= maxRetries}
                className={`
                  bg-gradient-to-r from-muted-olive to-sage-green text-white px-8 py-3 rounded-2xl font-medium 
                  transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 
                  min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-muted-olive/20 
                  flex items-center justify-center gap-2
                  ${this.state.retryCount >= maxRetries ? 'opacity-50 cursor-not-allowed' : 'hover:from-muted-olive hover:to-sage-green'}
                `}
              >
                <RefreshCcw className="w-4 h-4" />
                {this.state.retryCount >= maxRetries
                  ? 'Max Retries Reached'
                  : 'Try Again'}
              </button>

              <button
                onClick={this.handleReload}
                className="bg-glass backdrop-blur-sm border border-white/20 text-text-dark px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 min-h-[44px] flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Reload Page
              </button>

              {showHomeButton && (
                <button
                  onClick={this.handleGoHome}
                  className="bg-transparent border border-gray-300 text-text-dark px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 min-h-[44px] flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go to Dashboard
                </button>
              )}
            </div>

            {/* Support Info */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-text-muted dark:text-gray-400 mb-3">
                If this problem persists, please contact the system
                administrator.
              </p>
              {supportEmail && (
                <button
                  onClick={() =>
                    (window.location.href = `mailto:${supportEmail}`)
                  }
                  className="text-sm bg-transparent border border-gray-300 text-text-muted px-6 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:text-text-dark flex items-center justify-center gap-2 mx-auto"
                >
                  <Mail className="w-4 h-4" />
                  Contact Support
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);

  const handleError = React.useCallback((error, errorInfo = {}) => {
    setError({ error, errorInfo });

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Handler:', error, errorInfo);
    }
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
};

// Predefined error boundaries for common use cases
export const AdminErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary
    variant="admin"
    showHomeButton
    homeUrl="/admin/dashboard"
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export const VendorErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary
    variant="vendor"
    showHomeButton
    homeUrl="/vendor/dashboard"
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export const RestaurantErrorBoundary = ({ children, ...props }) => (
  <ErrorBoundary
    variant="restaurant"
    showHomeButton
    homeUrl="/restaurant/dashboard"
    {...props}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
