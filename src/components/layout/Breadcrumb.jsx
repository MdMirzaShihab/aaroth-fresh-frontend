import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ChevronRight, Home } from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';
import { getNavigationForRole } from '../../constants/navigation';

const Breadcrumb = ({ customItems = null }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(selectAuth);
  
  // Build breadcrumb items from current path
  const buildBreadcrumbFromPath = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const navigationItems = getNavigationForRole(user?.role);
    
    const breadcrumbItems = [];
    
    // Add home/dashboard as first item
    if (pathSegments.length > 0 && user) {
      const roleBasedHome = {
        admin: { label: 'Admin Dashboard', path: '/admin/dashboard' },
        vendor: { label: 'Vendor Dashboard', path: '/vendor/dashboard' },
        restaurantOwner: { label: 'Restaurant Dashboard', path: '/restaurant/dashboard' },
        restaurantManager: { label: 'Restaurant Dashboard', path: '/restaurant/dashboard' },
      };
      
      const homeItem = roleBasedHome[user.role] || { label: 'Home', path: '/' };
      breadcrumbItems.push(homeItem);
    }
    
    // Build path progressively
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip the first segment if it's the role prefix (admin, vendor, restaurant)
      if (index === 0 && ['admin', 'vendor', 'restaurant'].includes(segment)) {
        return;
      }
      
      // Find matching navigation item
      let label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      let foundItem = null;
      
      // Search through navigation items to find proper label
      const searchInItems = (items, path) => {
        for (const item of items) {
          if (item.path === path) {
            return item;
          }
          if (item.children) {
            for (const child of item.children) {
              const childPath = child.path || `${item.path}/${child.id}`;
              if (childPath === path) {
                return child;
              }
            }
          }
        }
        return null;
      };
      
      foundItem = searchInItems(navigationItems, currentPath);
      if (foundItem) {
        label = foundItem.label;
      }
      
      breadcrumbItems.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbItems;
  };

  // Use custom items if provided, otherwise build from path
  const breadcrumbItems = customItems || buildBreadcrumbFromPath();
  
  // Don't render if only one item (home)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="flex items-center gap-2 text-sm text-text-muted mb-6" aria-label="Breadcrumb">
      <Home className="w-4 h-4 text-text-muted/60" />
      
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        
        return (
          <div key={item.path || index} className="flex items-center gap-2">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-text-muted/40 flex-shrink-0" />
            )}
            
            {isLast ? (
              <span 
                className="text-text-dark dark:text-white font-medium truncate max-w-[200px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => handleNavigation(item.path)}
                className="hover:text-bottle-green transition-colors duration-200 truncate max-w-[150px] text-left"
              >
                {item.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;