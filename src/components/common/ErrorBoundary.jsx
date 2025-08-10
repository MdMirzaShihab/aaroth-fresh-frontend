import React from 'react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
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

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-earthy-beige/20 to-white">
          <div className="max-w-md mx-auto space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-tomato-red/10 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-8 h-8 text-tomato-red/70" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h2 className="text-2xl font-medium text-text-dark/80">
                Something went wrong
              </h2>
              <p className="text-text-muted leading-relaxed">
                {this.props.fallbackMessage ||
                  'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="bg-gradient-secondary text-white px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20 flex items-center justify-center gap-2"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => window.location.reload()}
                className="bg-glass backdrop-blur-sm border border-white/20 text-text-dark px-8 py-3 rounded-2xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 min-h-[44px]"
              >
                Refresh Page
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm text-text-muted hover:text-text-dark transition-colors">
                  Show Error Details (Development Mode)
                </summary>
                <div className="mt-4 p-4 bg-gray-100 rounded-xl text-xs font-mono text-gray-700 overflow-auto max-h-64">
                  <div className="font-semibold mb-2">Error:</div>
                  <div className="mb-4">{this.state.error.toString()}</div>
                  <div className="font-semibold mb-2">Component Stack:</div>
                  <div className="whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
