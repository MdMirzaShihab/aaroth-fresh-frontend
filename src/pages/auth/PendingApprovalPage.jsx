import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import { PendingApprovalLayout } from '../../components/layout/AuthLayout';
import { VendorRoute } from '../../components/auth/ProtectedRoute';
import { selectUser } from '../../store/slices/authSlice';
import authService from '../../services/authService';

/**
 * PendingApprovalPage Component
 *
 * Page shown to vendors while their account is awaiting approval
 */
const PendingApprovalPage = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await authService.performLogout();
  };

  const submissionDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : 'Recently';

  return (
    <VendorRoute requireApproval={false}>
      <PendingApprovalLayout>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-white/50 text-center">
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-earthy-yellow/20 p-6 rounded-full">
              <Clock className="w-12 h-12 text-earthy-brown animate-pulse" />
            </div>
          </div>

          {/* Main Message */}
          <h3 className="text-2xl font-medium text-text-dark/80 mb-4">
            Your Application is Under Review
          </h3>

          <p className="text-text-muted mb-8 leading-relaxed max-w-md mx-auto">
            Thank you for applying to become a vendor on Aaroth Fresh. Our team
            is currently reviewing your application and business details.
          </p>

          {/* Application Details */}
          <div className="bg-earthy-beige/30 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">
                Application Submitted:
              </span>
              <span className="text-sm font-medium text-text-dark">
                {submissionDate}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Business Name:</span>
              <span className="text-sm font-medium text-text-dark">
                {user?.businessName || 'N/A'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-text-muted">Status:</span>
              <span className="text-sm font-medium text-earthy-brown flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Review
              </span>
            </div>
          </div>

          {/* What to Expect */}
          <div className="text-left mb-8">
            <h4 className="text-lg font-medium text-text-dark mb-4">
              What happens next?
            </h4>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-mint-fresh/20 p-2 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-bottle-green" />
                </div>
                <div>
                  <p className="font-medium text-text-dark text-sm">
                    Application Review
                  </p>
                  <p className="text-text-muted text-sm">
                    We'll verify your business information and documents
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-mint-fresh/20 p-2 rounded-full mt-1">
                  <CheckCircle className="w-4 h-4 text-bottle-green" />
                </div>
                <div>
                  <p className="font-medium text-text-dark text-sm">
                    Background Check
                  </p>
                  <p className="text-text-muted text-sm">
                    We'll conduct quality and compliance verification
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-earthy-yellow/20 p-2 rounded-full mt-1">
                  <AlertCircle className="w-4 h-4 text-earthy-brown" />
                </div>
                <div>
                  <p className="font-medium text-text-dark text-sm">
                    Approval Notification
                  </p>
                  <p className="text-text-muted text-sm">
                    You'll receive an email and SMS once approved (usually
                    within 2-3 business days)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-mint-fresh/10 rounded-2xl p-6 mb-8">
            <h4 className="text-lg font-medium text-text-dark mb-3">
              Need Help?
            </h4>
            <p className="text-text-muted text-sm mb-4">
              Have questions about your application? Our support team is here to
              help.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+8801234567890"
                className="flex-1 bg-white hover:bg-gray-50 text-text-dark px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 border focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                Call Support
              </a>
              <a
                href="mailto:support@aarothfresh.com"
                className="flex-1 bg-bottle-green hover:bg-bottle-green/90 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-bottle-green/20"
              >
                Email Us
              </a>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-text-muted hover:text-tomato-red text-sm transition-colors duration-200 mx-auto focus:outline-none focus:underline"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </PendingApprovalLayout>
    </VendorRoute>
  );
};

export default PendingApprovalPage;
