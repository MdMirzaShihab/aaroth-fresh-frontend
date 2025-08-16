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

  // Debug logging (can be removed in production)
  // console.log('AppLayout Debug:', {
  //   path: location.pathname,
  //   isAuthenticated,
  //   hasChildren: !!children
  // });

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
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/20 via-white to-mint-fresh/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
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
                ? 'pt-16 lg:pt-16 pb-20 lg:pb-6 lg:ml-80' // Account for mobile nav height
                : 'pt-16'
              : ''
          }`}
        >
          {/* Content Container */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
