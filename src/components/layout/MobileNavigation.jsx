import React from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { selectAuth } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import { selectUnreadNotificationCount } from '../../store/slices/notificationSlice';
import { getMobileNavigationForRole } from '../../constants/navigation';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const cartItemCount = useSelector(selectCartItemCount) || 0;
  const unreadNotifications = useSelector(selectUnreadNotificationCount) || 0;

  // Don't show mobile navigation if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = getMobileNavigationForRole(user?.role);

  // Function to get badge count for specific navigation items
  const getBadgeCount = (itemId) => {
    switch (itemId) {
      case 'cart':
        return cartItemCount > 0 ? cartItemCount : null;
      case 'notifications':
        return unreadNotifications > 0 ? unreadNotifications : null;
      case 'orders':
        // Could show pending orders count here
        return null;
      default:
        return null;
    }
  };

  const isActivePath = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-white/20 dark:border-gray-800/20">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => {
          const isActive = isActivePath(item.path);
          const badgeCount = getBadgeCount(item.id);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center min-h-[72px] min-w-[60px] px-2 py-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? 'bg-bottle-green/10 text-bottle-green'
                  : 'text-text-muted hover:text-bottle-green hover:bg-bottle-green/5'
              }`}
              aria-label={`${item.label}${badgeCount ? ` (${badgeCount})` : ''}`}
            >
              {/* Icon */}
              <div
                className={`relative mb-1 transition-all duration-200 ${
                  isActive
                    ? 'transform scale-110'
                    : 'group-hover:transform group-hover:scale-105'
                }`}
              >
                <item.icon
                  className={`w-6 h-6 ${
                    isActive
                      ? 'text-bottle-green'
                      : 'text-text-muted group-hover:text-bottle-green'
                  }`}
                />

                {/* Badge Count */}
                {badgeCount && (
                  <div className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-tomato-red text-white text-xs font-bold rounded-full flex items-center justify-center px-1 animate-scale-in border-2 border-white dark:border-gray-900">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </div>
                )}

                {/* Active Indicator Dot (only if no badge) */}
                {isActive && !badgeCount && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-bottle-green rounded-full animate-scale-in" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-medium transition-colors duration-200 text-center leading-tight max-w-[60px] truncate ${
                  isActive
                    ? 'text-bottle-green'
                    : 'text-text-muted group-hover:text-bottle-green'
                }`}
              >
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
