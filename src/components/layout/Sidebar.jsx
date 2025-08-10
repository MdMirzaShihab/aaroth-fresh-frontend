import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { selectAuth } from '../../store/slices/authSlice';
import { getNavigationForRole, hasAccessToNavItem } from '../../constants/navigation';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector(selectAuth);
  
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  const navigationItems = getNavigationForRole(user?.role);

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleNavigation = (path) => {
    navigate(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isActiveParent = (item) => {
    if (isActivePath(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActivePath(item.path + '/' + child.id));
    }
    return false;
  };

  const renderNavigationItem = (item, level = 0) => {
    if (!hasAccessToNavItem(item, user?.role)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isActivePath(item.path);
    const isParentActive = isActiveParent(item);

    return (
      <div key={item.id} className="mb-1">
        <button
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group min-h-[44px] ${
            level > 0 ? 'ml-4 text-sm' : 'text-base'
          } ${
            isActive
              ? 'bg-gradient-secondary text-white shadow-md'
              : isParentActive
              ? 'bg-bottle-green/10 text-bottle-green'
              : 'text-text-dark dark:text-white hover:bg-bottle-green/5 dark:hover:bg-gray-800'
          }`}
        >
          {item.icon && (
            <item.icon className={`flex-shrink-0 ${
              level > 0 ? 'w-4 h-4' : 'w-5 h-5'
            } ${
              isActive 
                ? 'text-white' 
                : isParentActive
                ? 'text-bottle-green'
                : 'text-text-muted group-hover:text-bottle-green'
            }`} />
          )}
          
          <span className="flex-1 text-left font-medium truncate">
            {item.label}
          </span>
          
          {hasChildren && (
            <div className="flex-shrink-0">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}
        </button>

        {/* Child Items */}
        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1">
            {item.children.map((child) => {
              const childPath = `${item.path}/${child.id}`;
              const isChildActive = isActivePath(child.path || childPath);
              
              return (
                <button
                  key={child.id}
                  onClick={() => handleNavigation(child.path || childPath)}
                  className={`w-full flex items-center gap-3 px-4 py-2 ml-8 rounded-2xl transition-all duration-200 text-sm min-h-[40px] ${
                    isChildActive
                      ? 'bg-bottle-green/10 text-bottle-green font-medium'
                      : 'text-text-muted hover:text-bottle-green hover:bg-bottle-green/5 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isChildActive ? 'bg-bottle-green' : 'bg-text-muted/30'
                  }`} />
                  <span className="truncate">{child.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-dark dark:text-white">
                Aaroth Fresh
              </h2>
              <p className="text-xs text-text-muted capitalize">
                {user?.role || 'Dashboard'}
              </p>
            </div>
          </div>

          {/* Close Button (Mobile Only) */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-2xl flex items-center justify-center text-text-muted hover:text-text-dark dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => renderNavigationItem(item))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-earthy-beige/30 dark:bg-gray-800/50">
            <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.name?.charAt(0) || user?.phone?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-dark dark:text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-text-muted truncate">
                {user?.phone}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;