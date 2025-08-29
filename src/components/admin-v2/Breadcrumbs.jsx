/**
 * Breadcrumbs - Admin V2 Navigation Component
 * Provides breadcrumb navigation for admin-v2 interface with accessibility support
 * Features: Dynamic path generation, mobile optimization, keyboard navigation
 */

import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Home, Settings, Users, BarChart3 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import useAccessibility from '../../hooks/useAccessibility';
import useMobileOptimization from '../../hooks/useMobileOptimization';

// Breadcrumb path mapping
const BREADCRUMB_MAP = {
  'admin-v2': { label: 'Admin', icon: Home },
  'dashboard': { label: 'Dashboard', icon: Home },
  'users': { label: 'Users', icon: Users },
  'vendors': { label: 'Vendors', icon: Users },
  'restaurants': { label: 'Restaurants', icon: Users },
  'products': { label: 'Products', icon: Users },
  'listings': { label: 'Listings', icon: Users },
  'categories': { label: 'Categories', icon: Users },
  'analytics': { label: 'Analytics', icon: BarChart3 },
  'business': { label: 'Business Analytics', icon: BarChart3 },
  'performance': { label: 'Performance', icon: BarChart3 },
  'settings': { label: 'System Settings', icon: Settings },
  'general': { label: 'General Configuration', icon: Settings },
  'business-rules': { label: 'Business Rules', icon: Settings },
  'security': { label: 'Security Policies', icon: Settings },
  'notifications': { label: 'Notifications', icon: Settings },
  'payment': { label: 'Payment Settings', icon: Settings },
};

const Breadcrumbs = memo(() => {
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const { isMobile } = useMobileOptimization();
  const { getAriaProps, getFocusClasses, handleKeyDown } = useAccessibility();

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      const breadcrumbInfo = BREADCRUMB_MAP[segment];
      if (breadcrumbInfo) {
        breadcrumbs.push({
          label: breadcrumbInfo.label,
          icon: breadcrumbInfo.icon,
          path: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs on dashboard or if only one item
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="mb-6"
      {...getAriaProps({
        label: 'Breadcrumb navigation',
        describedby: 'breadcrumb-help',
      })}
    >
      <div id="breadcrumb-help" className="sr-only">
        Navigate through the admin interface hierarchy. Press Enter or Space to follow links.
      </div>
      
      <ol className="flex items-center space-x-1 text-sm">
        {breadcrumbs.map((crumb, index) => {
          const IconComponent = crumb.icon;
          
          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight 
                  className={`w-4 h-4 mx-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  aria-hidden="true"
                />
              )}
              
              {crumb.isLast ? (
                // Current page - not a link
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    flex items-center gap-2 font-medium
                    ${isDarkMode ? 'text-white' : 'text-text-dark'}
                    ${isMobile ? 'px-2 py-1' : ''}
                  `}
                  {...getAriaProps({
                    current: 'page',
                    label: `Current page: ${crumb.label}`,
                  })}
                >
                  <IconComponent className="w-4 h-4" aria-hidden="true" />
                  {isMobile && crumb.label.length > 15 
                    ? `${crumb.label.substring(0, 15)}...` 
                    : crumb.label}
                </motion.span>
              ) : (
                // Navigation link
                <Link
                  to={crumb.path}
                  className={`
                    flex items-center gap-2 transition-colors duration-200
                    ${isDarkMode 
                      ? 'text-gray-300 hover:text-white' 
                      : 'text-text-muted hover:text-text-dark'
                    }
                    ${getFocusClasses()}
                    ${isMobile ? 'px-2 py-1 touch-target' : ''}
                  `}
                  onKeyDown={(e) => handleKeyDown(e, () => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.target.click();
                    }
                  })}
                  {...getAriaProps({
                    label: `Navigate to ${crumb.label}`,
                  })}
                >
                  <IconComponent className="w-4 h-4" aria-hidden="true" />
                  {isMobile && crumb.label.length > 15 
                    ? `${crumb.label.substring(0, 15)}...` 
                    : crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      
      {/* Mobile breadcrumb hint */}
      {isMobile && (
        <div className={`
          text-xs mt-2 
          ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}
        `}>
          Tap to navigate • {breadcrumbs.length} levels deep
        </div>
      )}
    </nav>
  );
});

export default Breadcrumbs;