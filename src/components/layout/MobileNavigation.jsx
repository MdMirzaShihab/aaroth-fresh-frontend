import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectAuth } from '../../store/slices/authSlice';
import { getMobileNavigationForRole } from '../../constants/navigation';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(selectAuth);
  
  // Don't show mobile navigation if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = getMobileNavigationForRole(user?.role);

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/20">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => {
          const isActive = isActivePath(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center min-h-[72px] min-w-[60px] px-2 py-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-bottle-green/10 text-bottle-green'
                  : 'text-text-muted hover:text-bottle-green hover:bg-bottle-green/5'
              }`}
              aria-label={item.label}
            >
              {/* Icon */}
              <div className={`relative mb-1 transition-all duration-200 ${
                isActive 
                  ? 'transform scale-110' 
                  : 'group-hover:transform group-hover:scale-105'
              }`}>
                <item.icon className={`w-6 h-6 ${
                  isActive 
                    ? 'text-bottle-green' 
                    : 'text-text-muted group-hover:text-bottle-green'
                }`} />
                
                {/* Active Indicator Dot */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-bottle-green rounded-full animate-scale-in" />
                )}
              </div>
              
              {/* Label */}
              <span className={`text-xs font-medium transition-colors duration-200 text-center leading-tight max-w-[60px] truncate ${
                isActive 
                  ? 'text-bottle-green' 
                  : 'text-text-muted group-hover:text-bottle-green'
              }`}>
                {item.label}
              </span>
              
              {/* Active Bar */}
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-bottle-green rounded-full animate-fade-in" />
              )}
            </button>
          );
        })}
      </div>
      
      {/* Safe Area for devices with home indicator */}
      <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-gray-900/95" />
    </nav>
  );
};

export default MobileNavigation;