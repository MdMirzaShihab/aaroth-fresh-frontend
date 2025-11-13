/**
 * Breadcrumb - Admin V2
 * Dynamic breadcrumb navigation with glassmorphic design
 * Auto-generates from route structure and provides navigation history
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Home,
  LayoutDashboard,
  Users,
  Store,
  UtensilsCrossed,
  Package,
  FolderOpen,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  Shield,
  Database,
} from 'lucide-react';

const Breadcrumb = () => {
  const location = useLocation();

  // Route configuration for breadcrumb generation
  const routeConfig = {
    'admin': {
      label: 'Admin',
      icon: Home,
      description: 'Administration Portal',
    },
    dashboard: {
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Analytics',
    },
    users: {
      label: 'Users Management',
      icon: Users,
      description: 'User Administration',
    },
    vendors: {
      label: 'Vendors Management',
      icon: Store,
      description: 'Vendor Operations',
    },
    restaurants: {
      label: 'Restaurants Management',
      icon: UtensilsCrossed,
      description: 'Restaurant Operations',
    },
    catalog: {
      label: 'Catalog Management',
      icon: Package,
      description: 'Product & Category Management',
    },
    products: {
      label: 'Products',
      icon: Package,
      description: 'Product Library',
    },
    categories: {
      label: 'Categories',
      icon: FolderOpen,
      description: 'Category Structure',
    },
    listings: {
      label: 'Listings',
      icon: Database,
      description: 'Active Listings',
    },
    analytics: {
      label: 'Analytics & Insights',
      icon: BarChart3,
      description: 'Business Intelligence',
    },
    business: {
      label: 'Business Analytics',
      icon: TrendingUp,
      description: 'Performance Metrics',
    },
    performance: {
      label: 'Performance Monitoring',
      icon: BarChart3,
      description: 'SLA & Team Performance',
    },
    activity: {
      label: 'Activity Monitoring',
      icon: Activity,
      description: 'System Audit Trail',
    },
    settings: {
      label: 'Settings',
      icon: Settings,
      description: 'System Configuration',
    },
    system: {
      label: 'System Monitoring',
      icon: Shield,
      description: 'Health & Performance',
    },
    general: {
      label: 'General Settings',
      icon: Settings,
      description: 'Basic Configuration',
    },
    security: {
      label: 'Security Policies',
      icon: Shield,
      description: 'Security Configuration',
    },
    sales: {
      label: 'Sales Performance',
      icon: TrendingUp,
      description: 'Sales Analytics',
    },
  };

  // Generate breadcrumb items from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment);
    const breadcrumbs = [];

    // Build breadcrumb items
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const routeInfo = routeConfig[segment];

      if (routeInfo) {
        breadcrumbs.push({
          label: routeInfo.label,
          icon: routeInfo.icon,
          description: routeInfo.description,
          path: currentPath,
          isLast: index === pathSegments.length - 1,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs if we're at the root dashboard
  if (breadcrumbs.length <= 2) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.2 },
    },
  };

  return (
    <motion.nav
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="glass-layer-1 dark:glass-1-dark border border-sage-green/20 dark:border-dark-olive-border/50 rounded-2xl p-4 mb-6 shadow-organic dark:shadow-dark-glass hover:glass-layer-2 dark:hover:glass-2-dark hover:shadow-organic-lg dark:hover:shadow-dark-glass transition-all duration-300 animate-fade-in"
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => {
          const IconComponent = crumb.icon;

          return (
            <motion.li
              key={crumb.path}
              variants={itemVariants}
              className="flex items-center"
            >
              {index > 0 && (
                <ChevronRight
                  className="w-4 h-4 mx-2 flex-shrink-0 text-text-muted/60 dark:text-dark-text-muted/60"
                  aria-hidden="true"
                />
              )}

              {crumb.isLast ? (
                <div className="flex items-center gap-2">
                  <div
                    className="p-2 rounded-xl bg-sage-green/10 dark:bg-dark-sage-accent/10"
                  >
                    <IconComponent
                      className="w-4 h-4 text-muted-olive dark:text-dark-sage-accent"
                    />
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold text-text-dark dark:text-dark-text-primary"
                    >
                      {crumb.label}
                    </div>
                    <div
                      className="text-xs text-text-muted dark:text-dark-text-muted"
                    >
                      {crumb.description}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to={crumb.path}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 text-text-muted dark:text-dark-text-muted hover:text-muted-olive dark:hover:text-dark-sage-accent hover:glass-layer-1 dark:hover:glass-1-dark hover:scale-105 hover:-translate-y-0.5 hover:shadow-glow-green/15 dark:hover:shadow-dark-glow-olive/15 group"
                  title={crumb.description}
                >
                  <IconComponent className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{crumb.label}</span>
                </Link>
              )}
            </motion.li>
          );
        })}
      </ol>
    </motion.nav>
  );
};

export default Breadcrumb;
