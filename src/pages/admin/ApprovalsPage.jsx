import React from 'react';
import ApprovalManagement from '../../components/admin/ApprovalManagement';

/**
 * Admin Approvals Page - New unified approval system
 *
 * Uses the new backend API endpoints for unified approval management
 * - GET /api/v1/admin/approvals
 * - PUT /api/v1/admin/approvals/vendor/{id}/approve
 * - PUT /api/v1/admin/approvals/vendor/{id}/reject
 * - PUT /api/v1/admin/approvals/restaurant/{id}/approve
 * - PUT /api/v1/admin/approvals/restaurant/{id}/reject
 */
const ApprovalsPage = () => {
  return (
    <div className="px-8 py-6 space-y-8 max-w-7xl mx-auto bg-gray-50/50 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            Business Approvals
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Review and approve vendor and restaurant applications using the new
            unified system
          </p>
        </div>
      </div>

      <ApprovalManagement />
    </div>
  );
};

export default ApprovalsPage;
