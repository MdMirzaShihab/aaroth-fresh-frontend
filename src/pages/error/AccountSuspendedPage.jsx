import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Mail, Home } from 'lucide-react';

const AccountSuspendedPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="glass rounded-3xl p-12">
          <div className="w-24 h-24 bg-tomato-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-tomato-red" />
          </div>
          <h1 className="text-3xl font-bold text-text-dark mb-4">
            Account Suspended
          </h1>
          <p className="text-text-muted mb-8">
            Your account has been suspended. Please contact support for assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@aarothfresh.com"
              className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center touch-target"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </a>
            <Link 
              to="/"
              className="bg-white border border-gray-200 text-text-dark px-6 py-3 rounded-2xl font-medium hover:border-bottle-green/30 transition-all duration-200 flex items-center gap-2 justify-center touch-target"
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

export default AccountSuspendedPage;