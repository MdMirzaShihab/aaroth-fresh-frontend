import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import AarothLogo from '../../assets/AarothLogo.png';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-3xl p-12">
          <img
            src={AarothLogo}
            alt="Aaroth Fresh"
            className="w-16 h-16 mx-auto mb-6 opacity-80"
          />
          <div className="text-8xl font-bold text-muted-olive mb-4">404</div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Page Not Found
          </h1>
          <p className="text-text-muted mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="bg-white border border-gray-200 text-text-dark px-6 py-3 rounded-2xl font-medium hover:border-muted-olive/30 transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
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

export default NotFoundPage;
