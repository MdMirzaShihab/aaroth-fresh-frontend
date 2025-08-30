import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Outlet, useLocation } from 'react-router-dom';
import { selectAuth } from '../../store/slices/authSlice';
import { initializeTheme } from '../../store/slices/themeSlice';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import Breadcrumb from './Breadcrumb';

const AppLayout = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { isAuthenticated } = useSelector(selectAuth);

  // Debug logging removed

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Initialize theme on component mount
  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  // Check if current route should hide navigation (login, register, etc.)
  const hideNavigation = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(location.pathname);

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/20 via-white to-sage-green/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Header */}
      {!hideNavigation && (
        <Header
          onMenuToggle={handleSidebarToggle}
          isSidebarOpen={isSidebarOpen}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        {!hideNavigation && isAuthenticated && (
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            !hideNavigation
              ? isAuthenticated
                ? 'pt-16 lg:pt-16 pb-20' // Adjusted for new sidebar width
                : 'pt-16'
              : ''
          }`}
        >
          {/* Content Container */}
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
            {/* Breadcrumb */}
            {!hideNavigation && isAuthenticated && <Breadcrumb />}

            {/* Page Content */}
            <div className="animate-fade-in">{children || <Outlet />}</div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      {!hideNavigation && <MobileNavigation />}
    </div>
  );
};

export default AppLayout;
