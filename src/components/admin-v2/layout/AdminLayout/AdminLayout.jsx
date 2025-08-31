/**
 * AdminLayout - Admin V2
 * Main layout wrapper with context provider and state management
 * Enhanced with glassmorphic design and real-time features
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../../../hooks/useTheme';
// import { AdminLayoutProvider, useAdminLayout } from '../../../../hooks/admin-v2/useAdminLayout';
import AdminSidebar from '../Sidebar/AdminSidebar';
import AdminHeader from '../Header/AdminHeader';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import TestLayout from '../TestLayout';

// Inner layout component that uses the context
const AdminLayoutInner = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const layoutLoading = false;

  // Simple mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode 
          ? 'bg-dark-olive-bg text-dark-text-primary' 
          : 'bg-background text-text-dark'
      }`}
    >
      {/* Loading overlay for layout transitions */}
      {layoutLoading && (
        <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div
            className={`
            ${isDarkMode ? 'glass-4-dark' : 'glass-4'} p-6 rounded-2xl
            border ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
          `}
          >
            <div className="flex items-center gap-3">
              <div className="animate-spin w-5 h-5 border-2 border-sage-green border-t-transparent rounded-full" />
              <span
                className={
                  isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'
                }
              >
                Loading...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex flex-col min-h-screen lg:ml-80">
        {/* Header */}
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

        {/* Main content */}
        <main className={`flex-1 p-4 lg:p-6 ${
          isDarkMode 
            ? 'bg-dark-olive-bg' 
            : 'bg-background'
        }`}>
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};

// Main layout component simplified
const AdminLayout = ({ children }) => {
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
};

export default AdminLayout;
