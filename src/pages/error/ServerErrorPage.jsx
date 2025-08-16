import React from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';

const ServerErrorPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-3xl p-12">
          <div className="text-8xl font-bold text-tomato-red mb-4">500</div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Server Error
          </h1>
          <p className="text-text-muted mb-8">
            Something went wrong on our end. Please try again later.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-white border border-gray-200 text-text-dark px-6 py-3 rounded-2xl font-medium hover:border-bottle-green/30 transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <Link
              to="/"
              className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
