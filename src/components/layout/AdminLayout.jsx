import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { selectIsAdmin, selectCanAccessAdminDashboard } from '../../store/selectors/adminSelectors';
import Header from './Header';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import { AlertTriangle } from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isAdmin = useSelector(selectIsAdmin);
  const canAccess = useSelector(selectCanAccessAdminDashboard);

  // If not admin or can't access, redirect to appropriate page
  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin access denied page
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-tomato-red mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-dark dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-text-muted mb-6">
            You don't have permission to access the admin panel.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-gradient-secondary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get admin breadcrumb data
  const getAdminBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbMap = {
      admin: { label: 'Admin', path: '/admin' },
      dashboard: { label: 'Dashboard', path: '/admin/dashboard' },
      users: { label: 'User Management', path: '/admin/users' },
      approvals: { label: 'Vendor Approvals', path: '/admin/users/approvals' },
      products: { label: 'Product Management', path: '/admin/products' },
      categories: { label: 'Categories', path: '/admin/products/categories' },
      analytics: { label: 'Analytics', path: '/admin/analytics' },
      settings: { label: 'Settings', path: '/admin/settings' },
      'create-restaurant-owner': { label: 'Create Restaurant Owner', path: '/admin/create-restaurant-owner' },
      'create-restaurant-manager': { label: 'Create Restaurant Manager', path: '/admin/create-restaurant-manager' },
    };

    return pathSegments.map((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      return {
        label: breadcrumbMap[segment]?.label || segment.charAt(0).toUpperCase() + segment.slice(1),
        path: path,
        isCurrentPage: index === pathSegments.length - 1
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          showAdminBadge={true}
        />

        {/* Main Content */}
        <main className="flex-1 relative">
          {/* Admin Breadcrumb */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <Breadcrumb items={getAdminBreadcrumbs()} />
              
              {/* Admin Panel Indicator */}
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-gradient-secondary rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-bottle-green">
                  Admin Panel
                </span>
                <span className="text-xs text-text-muted">
                  You have full system access
                </span>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="min-h-[calc(100vh-8rem)]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;