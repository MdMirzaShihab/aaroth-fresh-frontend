/**
 * OptimizedUserList - High-Performance User List Component
 * Features: Virtual scrolling, memoization, accessibility, mobile optimization
 * Demonstrates comprehensive performance optimizations for large datasets
 */

import React, { memo, useMemo, useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import useAccessibility from '../../hooks/useAccessibility';
import useMobileOptimization from '../../hooks/useMobileOptimization';
import usePerformanceOptimization from '../../hooks/usePerformanceOptimization';
import { virtualScrolling, memoization, componentOptimization } from '../../utils/performance';
import { Button, LoadingSpinner } from '../ui';

// Memoized user row component for optimal performance
const UserRow = memo(({ 
  user, 
  index, 
  isSelected, 
  onSelect, 
  onView, 
  onEdit, 
  onDelete,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const { isMobile } = useMobileOptimization();
  const { getFocusClasses, getAriaProps } = useAccessibility();

  const handleRowClick = useCallback(() => {
    onSelect(user._id, !isSelected);
  }, [user._id, isSelected, onSelect]);

  const getStatusColor = useMemo(() => {
    switch (user.verificationStatus) {
      case 'approved': return 'mint-fresh';
      case 'pending': return 'earthy-yellow';
      case 'rejected': return 'tomato-red';
      default: return 'dusty-cedar';
    }
  }, [user.verificationStatus]);

  const getStatusIcon = useMemo(() => {
    switch (user.verificationStatus) {
      case 'approved': return CheckCircle;
      case 'pending': return Clock;
      case 'rejected': return AlertCircle;
      default: return Shield;
    }
  }, [user.verificationStatus]);

  const StatusIcon = getStatusIcon;

  return (
    <motion.div
      style={style}
      className={`
        flex items-center p-4 border border-gray-200 rounded-xl mb-2 cursor-pointer
        transition-all duration-200 ${getFocusClasses()}
        ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50' : 'bg-white/80 hover:bg-gray-50'}
        ${isSelected ? 'ring-2 ring-bottle-green/30 border-bottle-green/50' : ''}
      `}
      onClick={handleRowClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      {...getAriaProps({
        role: 'row',
        selected: isSelected,
        label: `User ${user.name}, ${user.role}, ${user.verificationStatus}`,
        describedby: `user-${user._id}-details`,
      })}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleRowClick();
        }
      }}
    >
      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isDarkMode ? `bg-${getStatusColor}/20` : `bg-${getStatusColor}/10`}
              `}>
                <StatusIcon className={`w-5 h-5 text-${getStatusColor}`} />
              </div>
              <div>
                <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                  {user.name}
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                  {user.role}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(user._id);
                }}
                className="button-accessible p-2"
                {...getAriaProps({ label: `View ${user.name} details` })}
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user._id);
                }}
                className="button-accessible p-2"
                {...getAriaProps({ label: `Edit ${user.name}` })}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3 text-gray-400" />
              <span className={isDarkMode ? 'text-gray-300' : 'text-text-muted'}>
                {user.phone}
              </span>
            </div>
            {user.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className={isDarkMode ? 'text-gray-300' : 'text-text-muted'}>
                  {user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Desktop Layout */
        <>
          <div className="flex items-center gap-3 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect(user._id, e.target.checked);
              }}
              className={`w-4 h-4 rounded border-gray-300 text-bottle-green ${getFocusClasses()}`}
              {...getAriaProps({ label: `Select user ${user.name}` })}
            />
            
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center
              ${isDarkMode ? `bg-${getStatusColor}/20` : `bg-${getStatusColor}/10`}
            `}>
              <StatusIcon className={`w-5 h-5 text-${getStatusColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                {user.name}
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <span className={isDarkMode ? 'text-gray-300' : 'text-text-muted'}>
                  {user.phone}
                </span>
                {user.email && (
                  <span className={isDarkMode ? 'text-gray-300' : 'text-text-muted'}>
                    {user.email}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${isDarkMode ? `bg-${getStatusColor}/20 text-${getStatusColor}` : `bg-${getStatusColor}/10 text-${getStatusColor}`}
            `}>
              {user.role}
            </div>
            
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${isDarkMode ? `bg-${getStatusColor}/20 text-${getStatusColor}` : `bg-${getStatusColor}/10 text-${getStatusColor}`}
            `}>
              {user.verificationStatus}
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView(user._id);
                }}
                className={`button-accessible p-2 ${getFocusClasses()}`}
                {...getAriaProps({ label: `View ${user.name} details` })}
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(user._id);
                }}
                className={`button-accessible p-2 ${getFocusClasses()}`}
                {...getAriaProps({ label: `Edit ${user.name}` })}
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(user._id);
                }}
                className={`button-accessible p-2 text-tomato-red hover:bg-tomato-red/10 ${getFocusClasses()}`}
                {...getAriaProps({ label: `Delete ${user.name}` })}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
      
      {/* Hidden description for screen readers */}
      <div id={`user-${user._id}-details`} className="sr-only">
        User details: {user.name}, {user.role}, Status: {user.verificationStatus}, 
        Phone: {user.phone}, Created: {new Date(user.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}, memoization.shallowEqual);

// Optimized search and filter component
const UserListControls = memo(({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  selectedCount,
  totalCount,
  onBulkAction,
}) => {
  const { isDarkMode } = useTheme();
  const { isMobile } = useMobileOptimization();
  const { getFocusClasses, getAriaProps, announce } = useAccessibility();
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = useCallback((e) => {
    onSearchChange(e.target.value);
    announce(`Searching for ${e.target.value || 'all users'}`);
  }, [onSearchChange, announce]);

  return (
    <div className={`
      p-4 border border-gray-200 rounded-xl mb-4
      ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}
    `}>
      <div className="flex flex-col gap-4">
        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, phone, or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`
                form-control-accessible pl-10 w-full
                ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-white' : 'bg-white border-gray-300'}
                ${getFocusClasses()}
              `}
              {...getAriaProps({
                label: 'Search users',
                describedby: 'search-help',
              })}
            />
            <div id="search-help" className="sr-only">
              Search by name, phone number, or email address
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              setShowFilters(!showFilters);
              announce(showFilters ? 'Filters hidden' : 'Filters shown');
            }}
            className={`button-accessible ${getFocusClasses()}`}
            {...getAriaProps({
              expanded: showFilters,
              controls: 'user-filters',
              label: `${showFilters ? 'Hide' : 'Show'} user filters`,
            })}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
        </div>

        {/* Selection Summary */}
        {selectedCount > 0 && (
          <div className={`
            flex items-center justify-between p-3 rounded-lg
            ${isDarkMode ? 'bg-bottle-green/20' : 'bg-bottle-green/10'}
          `}>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              {selectedCount} of {totalCount} users selected
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('approve')}
                className={`button-accessible text-mint-fresh border-mint-fresh/30 hover:bg-mint-fresh/10 ${getFocusClasses()}`}
                {...getAriaProps({ label: `Approve ${selectedCount} selected users` })}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Approve
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onBulkAction('reject')}
                className={`button-danger-accessible text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10 ${getFocusClasses()}`}
                {...getAriaProps({ label: `Reject ${selectedCount} selected users` })}
              >
                <AlertCircle className="w-3 h-3 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            id="user-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`
              p-4 border border-gray-200 rounded-lg
              ${isDarkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50'}
            `}
            {...getAriaProps({
              role: 'region',
              label: 'User filters',
            })}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="form-label-accessible" htmlFor="role-filter">
                  Role
                </label>
                <select
                  id="role-filter"
                  value={filters.role || ''}
                  onChange={(e) => onFilterChange('role', e.target.value)}
                  className={`form-control-accessible w-full ${getFocusClasses()}`}
                  {...getAriaProps({ label: 'Filter by user role' })}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="vendor">Vendor</option>
                  <option value="restaurantOwner">Restaurant Owner</option>
                  <option value="restaurantManager">Restaurant Manager</option>
                </select>
              </div>
              
              <div>
                <label className="form-label-accessible" htmlFor="status-filter">
                  Verification Status
                </label>
                <select
                  id="status-filter"
                  value={filters.verificationStatus || ''}
                  onChange={(e) => onFilterChange('verificationStatus', e.target.value)}
                  className={`form-control-accessible w-full ${getFocusClasses()}`}
                  {...getAriaProps({ label: 'Filter by verification status' })}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}, memoization.shallowEqual);

// Main optimized user list component
const OptimizedUserList = memo(({ 
  users = [], 
  isLoading = false,
  onView,
  onEdit, 
  onDelete,
  onBulkAction,
}) => {
  const { isDarkMode } = useTheme();
  const { isMobile } = useMobileOptimization();
  const { containerRef, announce, getFocusClasses, getAriaProps } = useAccessibility({
    keyboard: {
      onArrowKeys: (event, key) => {
        // Handle keyboard navigation for user list
        const currentFocus = document.activeElement;
        const userRows = containerRef.current?.querySelectorAll('[role="row"]');
        
        if (userRows && userRows.length > 0) {
          const currentIndex = Array.from(userRows).indexOf(currentFocus);
          let nextIndex = currentIndex;
          
          if (key === 'ArrowUp' && currentIndex > 0) {
            nextIndex = currentIndex - 1;
          } else if (key === 'ArrowDown' && currentIndex < userRows.length - 1) {
            nextIndex = currentIndex + 1;
          }
          
          if (nextIndex !== currentIndex) {
            event.preventDefault();
            userRows[nextIndex].focus();
          }
        }
      },
    },
  });

  // Performance optimization hooks
  const {
    memoizedCallback,
    createCancellablePromise,
    addCleanup,
  } = usePerformanceOptimization({
    memory: { trackMemory: true, componentName: 'OptimizedUserList' },
    render: { trackPerformance: true, componentName: 'OptimizedUserList' },
  });

  // State management
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [scrollTop, setScrollTop] = useState(0);

  // Constants for virtual scrolling
  const ITEM_HEIGHT = isMobile ? 120 : 80;
  const CONTAINER_HEIGHT = 500;

  // Memoized filtered data
  const filteredUsers = useMemo(() => {
    let result = users;

    // Apply search
    if (searchTerm) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply filters
    if (filters.role) {
      result = result.filter(user => user.role === filters.role);
    }
    if (filters.verificationStatus) {
      result = result.filter(user => user.verificationStatus === filters.verificationStatus);
    }

    return result;
  }, [users, searchTerm, filters]);

  // Virtual scrolling state
  const virtualState = useMemo(() => {
    return virtualScrolling.calculateVisibleItems({
      items: filteredUsers,
      containerHeight: CONTAINER_HEIGHT,
      itemHeight: ITEM_HEIGHT,
      scrollTop,
      overscan: 5,
    });
  }, [filteredUsers, scrollTop, ITEM_HEIGHT, CONTAINER_HEIGHT]);

  // Memoized event handlers
  const handleScroll = memoizedCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const handleUserSelect = memoizedCallback((userId, isSelected) => {
    setSelectedUsers(prev => {
      const newSelected = new Set(prev);
      if (isSelected) {
        newSelected.add(userId);
      } else {
        newSelected.delete(userId);
      }
      
      announce(`${isSelected ? 'Selected' : 'Deselected'} user. ${newSelected.size} users selected`);
      return newSelected;
    });
  }, [announce]);

  const handleFilterChange = memoizedCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    announce(`Filter applied: ${key} set to ${value || 'all'}`);
  }, [announce]);

  const handleBulkAction = memoizedCallback((action) => {
    if (selectedUsers.size === 0) {
      announce('No users selected for bulk action');
      return;
    }
    
    onBulkAction(action, Array.from(selectedUsers));
    announce(`Bulk ${action} action triggered for ${selectedUsers.size} users`);
  }, [selectedUsers, onBulkAction, announce]);

  // Performance monitoring
  useEffect(() => {
    const cleanup = componentOptimization.trackComponentMemory('OptimizedUserList');
    addCleanup(cleanup);
  }, [addCleanup]);

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="loading-accessible"
        {...getAriaProps({
          label: 'Loading users',
          live: 'polite',
        })}
      >
        <LoadingSpinner className="loading-spinner-accessible" />
        <span className="text-sm text-text-muted">Loading users...</span>
      </div>
    );
  }

  // Empty state
  if (filteredUsers.length === 0) {
    return (
      <div 
        className={`
          text-center p-8 border border-gray-200 rounded-xl
          ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}
        `}
        {...getAriaProps({
          role: 'status',
          label: searchTerm ? 'No users found matching search criteria' : 'No users available',
        })}
      >
        <Users className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-300'}`} />
        <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
          {searchTerm ? 'No users found' : 'No users yet'}
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
          {searchTerm 
            ? 'Try adjusting your search criteria or filters'
            : 'Users will appear here once they register'
          }
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="space-y-4"
      {...getAriaProps({
        role: 'region',
        label: `User list with ${filteredUsers.length} users`,
        describedby: 'user-list-help',
      })}
    >
      <div id="user-list-help" className="sr-only">
        Use arrow keys to navigate between users. Press Enter or Space to select users.
      </div>
      
      {/* Controls */}
      <UserListControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFilterChange={handleFilterChange}
        selectedCount={selectedUsers.size}
        totalCount={filteredUsers.length}
        onBulkAction={handleBulkAction}
      />

      {/* Virtual Scrolling Container */}
      <div
        className={`
          border border-gray-200 rounded-xl overflow-hidden
          ${isDarkMode ? 'border-gray-700/50' : ''}
        `}
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={handleScroll}
        {...getAriaProps({
          role: 'table',
          label: `${filteredUsers.length} users`,
          rowcount: filteredUsers.length,
        })}
      >
        {/* Virtual Items Container */}
        <div style={{ height: virtualState.totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${virtualState.offsetY}px)`,
              position: 'absolute',
              width: '100%',
            }}
          >
            {virtualState.visibleItems.map((user, index) => (
              <UserRow
                key={user._id}
                user={user}
                index={user.index}
                isSelected={selectedUsers.has(user._id)}
                onSelect={handleUserSelect}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
                style={{
                  height: ITEM_HEIGHT,
                  position: 'absolute',
                  top: index * ITEM_HEIGHT,
                  width: '100%',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Performance Info (Development only) */}
      {import.meta.env.DEV && (
        <div className="text-xs text-gray-400 p-2 bg-gray-100 rounded">
          Virtual Scrolling: {virtualState.visibleItems.length}/{filteredUsers.length} items rendered
          | Performance: {selectedUsers.size} selected
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.users.length === nextProps.users.length &&
    prevProps.isLoading === nextProps.isLoading &&
    memoization.shallowEqual(prevProps, nextProps)
  );
});

export default OptimizedUserList;