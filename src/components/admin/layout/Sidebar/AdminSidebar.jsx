/**
 * AdminSidebar - Admin V2
 * Professional glassmorphic navigation with hierarchical structure
 * Enhanced with real-time badges and Organic Futurism design
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  Package,
  FolderOpen,
  Settings,
  X,
  ChevronRight,
  Database,
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  // Hierarchical navigation structure from ADMIN_INTERFACE_PLAN.md
  const navigationStructure = [
    {
      section: 'Overview',
      items: [
        {
          label: 'Dashboard',
          icon: LayoutDashboard,
          path: '/admin/dashboard',
          description: 'Overview & Analytics',
        },
      ],
    },
    {
      section: 'Business Entities',
      items: [
        {
          label: 'Users Management',
          icon: Users,
          path: '/admin/users',
          description: 'User Management',
          badge: { type: 'pending', count: 12 },
        },
        {
          label: 'Vendors Management',
          icon: Store,
          path: '/admin/vendors',
          description: 'Vendor Operations',
          badge: { type: 'urgent', count: 3 },
        },
        {
          label: 'Buyers Management',
          icon: UtensilsCrossed,
          path: '/admin/buyers',
          description: 'Buyer Operations',
          badge: { type: 'info', count: 7 },
        },
      ],
    },
    {
      section: 'Catalog Management',
      items: [
        {
          label: 'Products',
          icon: Package,
          path: '/admin/products',
          description: 'Product Library',
        },
        {
          label: 'Categories',
          icon: FolderOpen,
          path: '/admin/categories',
          description: 'Category Structure',
        },
        {
          label: 'Listings',
          icon: Database,
          path: '/admin/listings',
          description: 'Active Listings',
        },
      ],
    },
    {
      section: 'System Management',
      items: [
        {
          label: 'Settings',
          icon: Settings,
          path: '/admin/settings',
          description: 'System Configuration',
          children: [
            { label: 'General Settings', path: '/admin/settings/general' },
            { label: 'Business Rules', path: '/admin/settings/business' },
            { label: 'Security Policies', path: '/admin/settings/security' },
          ],
        },
      ],
    },
  ];

  const isActiveRoute = (path) => {
    return location.pathname.startsWith(path);
  };

  const toggleSection = (sectionKey) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  const getBadgeStyles = (badgeType) => {
    const styles = {
      pending: 'bg-earthy-yellow/20 text-earthy-brown border-earthy-yellow/30',
      urgent:
        'bg-tomato-red/10 text-tomato-red border-tomato-red/20 animate-pulse',
      info: 'bg-sage-green/10 text-muted-olive border-sage-green/20',
      success: 'bg-sage-green/10 text-muted-olive border-sage-green/20',
    };
    return styles[badgeType] || styles.info;
  };

  return (
    <>
      {/* Enhanced Glassmorphic Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-full w-80 glass-2 dark:glass-2-dark border-r border-sage-green/30 dark:border-dark-olive-border/80 text-text-dark dark:text-dark-text-primary shadow-xl shadow-sage-green/10 dark:shadow-dark-glass transform transition-all duration-500 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 animate-fade-in`}
      >
        {/* Professional Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-green/30 dark:border-dark-olive-border glass-1 dark:glass-1-dark">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green flex items-center justify-center shadow-glow-olive">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-text-dark dark:text-dark-text-primary">
                Admin Portal
              </h1>
              <p className="text-xs text-text-muted dark:text-dark-text-muted">
                Aaroth Fresh • B2B Platform
              </p>
            </div>
          </div>

          {/* Enhanced Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-2xl transition-all duration-200 hover:bg-sage-green/10 dark:hover:bg-dark-sage-accent/10 text-text-muted dark:text-dark-text-muted hover:text-muted-olive dark:hover:text-dark-sage-accent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enhanced Navigation */}
        <nav className="p-4 space-y-6 overflow-y-auto h-full pb-32">
          {navigationStructure.map((section, sectionIndex) => (
            <div key={section.section} className="space-y-2">
              {/* Section Header */}
              <div className="text-xs font-semibold uppercase tracking-wider px-4 py-2 text-muted-olive dark:text-dark-sage-accent flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-sage-green dark:bg-dark-sage-accent" />
                {section.section}
              </div>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = isActiveRoute(item.path);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedSections[item.path];

                  return (
                    <div key={item.path}>
                      <div className="relative group">
                        <NavLink
                          to={item.path}
                          onClick={() => {
                            if (hasChildren) {
                              toggleSection(item.path);
                            }
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group animate-fade-in ${isActive
                            ? 'bg-sage-green/20 dark:bg-dark-sage-accent/20 text-bottle-green dark:text-dark-sage-accent font-semibold border-2 border-sage-green/40 dark:border-dark-sage-accent/40 shadow-lg shadow-sage-green/20 dark:shadow-dark-glow-olive/20'
                            : 'text-text-muted dark:text-dark-text-muted hover:text-muted-olive dark:hover:text-dark-sage-accent hover:bg-sage-green/10 dark:hover:bg-dark-sage-accent/10 hover:-translate-y-0.5 hover:shadow-md'}`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />

                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {item.label}
                            </div>
                            <div className="text-xs opacity-70 truncate">
                              {item.description}
                            </div>
                          </div>

                          {/* Enhanced Badge System */}
                          {item.badge && (
                            <div
                              className={`
                              px-2 py-1 rounded-lg text-xs font-medium border
                              ${getBadgeStyles(item.badge.type)}
                            `}
                            >
                              {item.badge.count}
                            </div>
                          )}

                          {/* Expand/Collapse Icon */}
                          {hasChildren && (
                            <div
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                            >
                              <ChevronRight className="w-4 h-4 opacity-60" />
                            </div>
                          )}
                        </NavLink>
                      </div>

                      {/* Sub-navigation */}
                      {hasChildren && isExpanded && (
                        <div className="overflow-hidden transition-all duration-200">
                          <div className="ml-10 mt-2 space-y-1 border-l-2 border-sage-green/20 dark:border-dark-sage-accent/20 pl-4">
                            {item.children.map((child) => (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                className={({ isActive: childActive }) => `block px-4 py-2 rounded-xl text-sm transition-all duration-200 ${childActive ? 'text-muted-olive dark:text-dark-sage-accent bg-sage-green/10 dark:bg-dark-sage-accent/10' : 'text-text-muted dark:text-dark-text-muted hover:text-muted-olive dark:hover:text-dark-sage-accent hover:bg-sage-green/5 dark:hover:bg-dark-sage-accent/5'}`}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onClose();
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-sage-green/60 dark:bg-dark-sage-accent/60" />
                                  {child.label}
                                </div>
                              </NavLink>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

      </div>
    </>
  );
};

export default AdminSidebar;
