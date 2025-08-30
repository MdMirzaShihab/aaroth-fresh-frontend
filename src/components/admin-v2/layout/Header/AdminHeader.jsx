/**
 * AdminHeader - Admin V2
 * Professional floating glass header with enhanced features
 * Real-time notifications, global search, and user profile system
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Bell, 
  Search, 
  User, 
  Sun, 
  Moon, 
  Settings,
  LogOut,
  Download,
  BarChart3,
  Shield,
  Command,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Button } from '../../../../components/ui';
import toast from 'react-hot-toast';

const AdminHeader = ({ onMenuClick }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Mock notifications for demonstration
  const notifications = [
    { id: 1, type: 'urgent', title: '3 Vendor Approvals Pending', message: 'Review new vendor registrations', time: '5m ago' },
    { id: 2, type: 'info', title: 'System Update Complete', message: 'All systems are running smoothly', time: '1h ago' },
    { id: 3, type: 'success', title: 'Monthly Report Ready', message: 'Download your analytics report', time: '2h ago' }
  ];

  const handleQuickExport = () => {
    toast.success('Dashboard data exported successfully!', {
      icon: '📊',
      duration: 3000,
    });
  };

  const handleNotificationClick = (notification) => {
    toast(notification.message, {
      icon: notification.type === 'urgent' ? '🚨' : notification.type === 'success' ? '✅' : 'ℹ️',
    });
    setNotificationsOpen(false);
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        sticky top-0 z-40 
        ${isDarkMode ? 'glass-3-dark' : 'glass-3'} backdrop-blur-xl
        border-b ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
        shadow-depth-2 ${isDarkMode ? 'shadow-dark-depth-2' : ''}
      `}
    >
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Mobile Menu + Enhanced Search */}
          <div className="flex items-center gap-6">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className={`
                lg:hidden p-3 rounded-2xl transition-all duration-200
                ${isDarkMode 
                  ? 'hover:glass-2-dark text-dark-text-muted hover:text-dark-sage-accent' 
                  : 'hover:glass-2 text-text-muted hover:text-muted-olive'
                }
              `}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Enhanced Global Search */}
            <motion.div 
              animate={{
                width: searchFocused ? 400 : 320,
                scale: searchFocused ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
              className={`
                hidden sm:flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200
                ${searchFocused 
                  ? `${isDarkMode ? 'glass-4-dark border-dark-sage-accent/30' : 'glass-4 border-sage-green/30'} shadow-glow-olive/20`
                  : `${isDarkMode ? 'glass-2-dark' : 'glass-2'}`
                }
                border ${isDarkMode ? 'border-dark-olive-border' : 'border-sage-green/20'}
              `}
            >
              <Search className={`w-5 h-5 ${searchFocused 
                ? (isDarkMode ? 'text-dark-sage-accent' : 'text-muted-olive')
                : (isDarkMode ? 'text-dark-text-muted' : 'text-text-muted')
              }`} />
              <input
                type="text"
                placeholder="Search users, vendors, orders... (⌘K)"
                className={`
                  bg-transparent border-none outline-none flex-1 text-sm
                  ${isDarkMode 
                    ? 'text-dark-text-primary placeholder-dark-text-muted' 
                    : 'text-text-dark placeholder-text-muted'
                  }
                `}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <div className={`
                text-xs px-2 py-1 rounded-lg border
                ${isDarkMode 
                  ? 'text-dark-text-muted border-dark-olive-border' 
                  : 'text-text-muted border-sage-green/20'
                }
              `}>
                <Command className="w-3 h-3 inline mr-1" />K
              </div>
            </motion.div>
          </div>

          {/* Right Section - Enhanced Action Bar */}
          <div className="flex items-center gap-2">
            {/* Quick Export Action */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuickExport}
              className={`
                rounded-2xl transition-all duration-200 hidden md:flex
                ${isDarkMode 
                  ? 'hover:glass-2-dark text-dark-text-muted hover:text-dark-sage-accent' 
                  : 'hover:glass-2 text-text-muted hover:text-muted-olive'
                }
              `}
              title="Quick Export Dashboard"
            >
              <Download className="w-4 h-4 mr-2" />
              <span>Export</span>
            </Button>

            {/* Enhanced Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                toggleTheme();
                toast.success(`Switched to ${isDarkMode ? 'light' : 'dark'} mode`, {
                  icon: isDarkMode ? '🌞' : '🌙',
                  duration: 2000,
                });
              }}
              className={`
                rounded-2xl transition-all duration-200
                ${isDarkMode 
                  ? 'hover:glass-2-dark text-amber-400 hover:text-amber-300' 
                  : 'hover:glass-2 text-slate-600 hover:text-slate-700'
                }
              `}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Enhanced Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`
                  rounded-2xl transition-all duration-200 relative
                  ${notificationsOpen
                    ? `${isDarkMode ? 'glass-3-dark text-dark-sage-accent' : 'glass-3 text-muted-olive'}`
                    : `${isDarkMode ? 'hover:glass-2-dark text-dark-text-muted hover:text-dark-sage-accent' : 'hover:glass-2 text-text-muted hover:text-muted-olive'}`
                  }
                `}
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-tomato-red rounded-full animate-pulse" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white dark:bg-dark-bg rounded-full" />
              </Button>

              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    absolute right-0 top-12 w-80 rounded-2xl border shadow-depth-3
                    ${isDarkMode ? 'glass-4-dark border-dark-olive-border shadow-dark-depth-3' : 'glass-4 border-sage-green/20'}
                  `}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                        Notifications
                      </h3>
                      <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                        {notifications.length} new
                      </div>
                    </div>
                    <div className="space-y-2">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`
                            p-3 rounded-xl cursor-pointer transition-all duration-200
                            ${isDarkMode ? 'hover:glass-3-dark' : 'hover:glass-3'}
                            border ${isDarkMode ? 'border-dark-olive-border/50' : 'border-sage-green/10'}
                          `}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`
                              w-2 h-2 rounded-full mt-2 flex-shrink-0
                              ${notification.type === 'urgent' ? 'bg-tomato-red animate-pulse' : 
                                notification.type === 'success' ? 'bg-sage-green' : 'bg-sage-green'}
                            `} />
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                                {notification.title}
                              </p>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                                {notification.message}
                              </p>
                              <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-sage-accent' : 'text-muted-olive'}`}>
                                {notification.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Mobile search button */}
            <Button
              variant="ghost"
              size="sm"
              className={`
                sm:hidden rounded-2xl transition-all duration-200
                ${isDarkMode 
                  ? 'hover:glass-2-dark text-dark-text-muted hover:text-dark-sage-accent' 
                  : 'hover:glass-2 text-text-muted hover:text-muted-olive'
                }
              `}
              title="Search"
            >
              <Search className="w-5 h-5" />
            </Button>

            {/* Enhanced Admin Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`
                  flex items-center gap-3 ml-2 p-2 rounded-2xl transition-all duration-200
                  ${profileDropdownOpen
                    ? `${isDarkMode ? 'glass-3-dark' : 'glass-3'}`
                    : `${isDarkMode ? 'hover:glass-2-dark' : 'hover:glass-2'}`
                  }
                `}
              >
                <div className="hidden md:block text-right">
                  <div className={`text-sm font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                    Admin User
                  </div>
                  <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    System Administrator
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green flex items-center justify-center shadow-glow-olive">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-sage-green rounded-full border-2 border-white dark:border-dark-bg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                </div>
                <ChevronDown className={`
                  w-4 h-4 transition-transform duration-200
                  ${profileDropdownOpen ? 'rotate-180' : ''}
                  ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}
                `} />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    absolute right-0 top-16 w-64 rounded-2xl border shadow-depth-3
                    ${isDarkMode ? 'glass-4-dark border-dark-olive-border shadow-dark-depth-3' : 'glass-4 border-sage-green/20'}
                  `}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-sage-green/20 dark:border-dark-olive-border">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-sage-green flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className={`font-semibold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                          Admin User
                        </div>
                        <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                          admin@aarothfresh.com
                        </div>
                      </div>
                    </div>
                    <div className="py-2 space-y-1">
                      <button className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors
                        ${isDarkMode ? 'hover:bg-dark-sage-accent/10 text-dark-text-muted hover:text-dark-sage-accent' : 'hover:bg-sage-green/10 text-text-muted hover:text-muted-olive'}
                      `}>
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </button>
                      <button className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors
                        ${isDarkMode ? 'hover:bg-dark-sage-accent/10 text-dark-text-muted hover:text-dark-sage-accent' : 'hover:bg-sage-green/10 text-text-muted hover:text-muted-olive'}
                      `}>
                        <BarChart3 className="w-4 h-4" />
                        <span>Admin Analytics</span>
                      </button>
                      <button className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors
                        ${isDarkMode ? 'hover:bg-dark-sage-accent/10 text-dark-text-muted hover:text-dark-sage-accent' : 'hover:bg-sage-green/10 text-text-muted hover:text-muted-olive'}
                      `}>
                        <Shield className="w-4 h-4" />
                        <span>Security</span>
                      </button>
                      <hr className="my-2 border-sage-green/20 dark:border-dark-olive-border" />
                      <button className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors
                        ${isDarkMode ? 'hover:bg-tomato-red/10 text-dark-text-muted hover:text-tomato-red' : 'hover:bg-tomato-red/10 text-text-muted hover:text-tomato-red'}
                      `}>
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(profileDropdownOpen || notificationsOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}
    </motion.header>
  );
};

export default AdminHeader;