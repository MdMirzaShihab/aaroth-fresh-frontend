import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Search,
  User,
  Settings,
} from 'lucide-react';
import AarothLogo from '../../assets/AarothLogo.png';
import { selectAuth } from '../../store/slices/authSlice';
import { selectThemeMode, toggleTheme } from '../../store/slices/themeSlice';
import authService from '../../services/authService';
import { USER_MENU_ITEMS } from '../../constants/navigation';

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(selectAuth);
  const themeMode = useSelector(selectThemeMode);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    setIsNotificationOpen(false);
  };

  const handleNotificationToggle = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsUserMenuOpen(false);
  };

  const handleUserMenuAction = async (item) => {
    setIsUserMenuOpen(false);

    if (item.action === 'logout') {
      await authService.performLogout();
      navigate('/login');
    } else if (item.action === 'navigate') {
      navigate(item.path);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
      <div className="flex items-center justify-between h-16 px-6 sm:px-8 lg:px-12">
        {/* Left Section - Menu Toggle & Logo */}
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-10 h-10 rounded-2xl flex items-center justify-center text-text-dark dark:text-white hover:bg-muted-olive/5 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px]"
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src={AarothLogo}
                alt="Aaroth Fresh"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-lg font-semibold text-text-dark dark:text-white hidden sm:block">
              Aaroth Fresh
            </span>
          </div>
        </div>

        {/* Center Section - Search (Desktop) */}
        {isAuthenticated && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted dark:text-gray-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, vendors..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-earthy-beige/30 dark:bg-gray-800/50 border-0 focus:bg-white dark:focus:bg-gray-800 focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 dark:placeholder:text-gray-400 text-text-dark dark:text-white min-h-[44px] focus:outline-none"
              />
            </form>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-text-dark dark:text-white hover:bg-muted-olive/5 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px]"
            aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
          >
            {themeMode === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={handleNotificationToggle}
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-text-dark dark:text-white hover:bg-muted-olive/5 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {/* Notification Badge */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-tomato-red rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Notification Dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-12 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/50 dark:border-gray-800/50 animate-scale-in z-50">
                    <h3 className="text-lg font-medium text-text-dark dark:text-white mb-4">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 rounded-2xl bg-sage-green/10 dark:bg-gray-800/50 border border-sage-green/20">
                        <p className="text-sm text-text-dark dark:text-white font-medium">
                          New order received
                        </p>
                        <p className="text-xs text-text-muted dark:text-gray-300 mt-1">
                          2 minutes ago
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-earthy-beige/30 dark:bg-gray-800/30">
                        <p className="text-sm text-text-dark dark:text-white font-medium">
                          Product approved
                        </p>
                        <p className="text-xs text-text-muted dark:text-gray-300 mt-1">
                          1 hour ago
                        </p>
                      </div>
                      <div className="p-3 rounded-2xl bg-earthy-beige/30 dark:bg-gray-800/30">
                        <p className="text-sm text-text-dark dark:text-white font-medium">
                          Payment received
                        </p>
                        <p className="text-xs text-text-muted dark:text-gray-300 mt-1">
                          3 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button className="text-muted-olive hover:text-muted-olive/80 text-sm font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={handleUserMenuToggle}
                  className="flex items-center gap-2 sm:gap-3 p-2 rounded-2xl hover:bg-muted-olive/5 dark:hover:bg-gray-800 transition-all duration-200 min-h-[44px] min-w-[44px]"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-1">
                    <span className="text-sm font-medium text-text-dark dark:text-white truncate max-w-24">
                      {user?.name || user?.phone}
                    </span>
                    <ChevronDown className="w-4 h-4 text-text-muted dark:text-gray-300" />
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-2 border border-white/50 dark:border-gray-800/50 animate-scale-in z-50">
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                          {user?.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-dark dark:text-white">
                            {user?.name || 'User'}
                          </p>
                          <p className="text-xs text-text-muted dark:text-gray-300 capitalize">
                            {user?.role || 'Member'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {USER_MENU_ITEMS.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleUserMenuAction(item)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-2xl transition-all duration-200 min-h-[44px] ${
                            item.className ||
                            'text-text-dark dark:text-white hover:bg-muted-olive/5 dark:hover:bg-gray-800'
                          }`}
                        >
                          {item.icon && <item.icon className="w-4 h-4" />}
                          <span className="text-sm font-medium">
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Login Button */
            <button
              onClick={() => navigate('/login')}
              className="bg-gradient-secondary text-white px-6 py-2 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px]"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isAuthenticated && (
        <div className="md:hidden px-6 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-earthy-beige/30 dark:bg-gray-800/50 border-0 focus:bg-white dark:focus:bg-gray-800 focus:shadow-lg transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none"
            />
          </form>
        </div>
      )}

      {/* Click Outside Handler */}
      {(isUserMenuOpen || isNotificationOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsUserMenuOpen(false);
            setIsNotificationOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;
