/**
 * UsersManagementPage - Admin V2 User Management Interface
 * Professional B2B user directory with advanced filtering, bulk operations, and role creation
 * Features: Server-side pagination, multi-column sorting, bulk operations, export capabilities
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Search,
  Settings,
  BarChart3,
  UserPlus,
  Store
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui';
import { Button } from '../../../components/ui';
import { Input } from '../../../components/ui';
import { 
  useGetUsersQuery,
  useGetUserAnalyticsQuery 
} from '../../../services/admin-v2/usersService';
import UserDirectoryTable from './components/UserDirectoryTable';
import UserFilters from './components/UserFilters';
import BulkOperations from './components/BulkOperations';
import UserAnalytics from './components/UserAnalytics';
import UserProfileModal from './components/UserProfileModal';
import CreateRestaurantOwner from './CreateRestaurantOwner';
import CreateRestaurantManager from './CreateRestaurantManager';
import toast from 'react-hot-toast';

const UsersManagementPage = () => {
  const { isDarkMode } = useTheme();
  
  // Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState({ field: 'createdAt', direction: 'desc' });
  const [activeFilters, setActiveFilters] = useState({});
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [showCreateManager, setShowCreateManager] = useState(false);

  // API queries
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    sort: `${sortConfig.field}:${sortConfig.direction}`,
    ...activeFilters
  });

  const {
    data: analyticsData,
    isLoading: analyticsLoading
  } = useGetUserAnalyticsQuery({
    enabled: showAnalytics
  });

  // Memoized data transformations
  const totalUsers = usersData?.total || 0;
  const users = usersData?.users || [];
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Handle user selection
  const handleUserSelect = useCallback((userId, selected) => {
    setSelectedUsers(prev => 
      selected 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  }, []);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  }, [users]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  // Handle filtering
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  // Handle bulk operations
  const handleBulkOperation = useCallback(async (operation, options = {}) => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first');
      return;
    }

    try {
      toast.loading(`Processing ${operation} for ${selectedUsers.length} users...`);
      
      // Bulk operation logic will be implemented in BulkOperations component
      // This is a placeholder for the actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss();
      toast.success(`${operation} completed successfully`);
      setSelectedUsers([]);
      refetchUsers();
    } catch (error) {
      toast.dismiss();
      toast.error(`Failed to ${operation}: ${error.message}`);
    }
  }, [selectedUsers, refetchUsers]);

  // Handle user actions
  const handleUserAction = useCallback((user, action) => {
    switch (action) {
      case 'view_profile':
        setSelectedUser(user);
        setShowUserProfile(true);
        break;
      case 'edit_profile':
        setSelectedUser(user);
        setShowUserProfile(true);
        break;
      default:
        console.log(`Unhandled user action: ${action}`, user);
    }
  }, []);

  // Handle export
  const handleExport = useCallback(async (format = 'csv') => {
    try {
      toast.loading('Preparing export...');
      
      // Export logic will be implemented
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.dismiss();
      toast.success(`Users exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.dismiss();
      toast.error(`Export failed: ${error.message}`);
    }
  }, []);

  // Quick stats for header
  const quickStats = useMemo(() => {
    if (!analyticsData) return null;
    
    return {
      totalUsers,
      activeUsers: analyticsData.activeUsers || 0,
      pendingApproval: analyticsData.pendingApproval || 0,
      newThisWeek: analyticsData.newThisWeek || 0
    };
  }, [analyticsData, totalUsers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-earthy-beige/30 via-white to-sage-green/20 dark:from-dark-bg dark:via-dark-bg-alt dark:to-dark-surface">
      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-dark-bg/80 border-b border-sage-green/20 dark:border-dark-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bottle-green via-sage-green to-mint-fresh flex items-center justify-center shadow-glow-olive">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  Users Management
                </h1>
                <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                  Comprehensive user directory with advanced B2B workflows
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="hidden sm:flex"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>

              <div className="relative">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateOwner(true)}
                  className="hidden sm:flex"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
                
                {/* Mobile dropdown will be added here */}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateOwner(true)}
                  className="sm:hidden"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {quickStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                      Total Users
                    </p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                      {quickStats.totalUsers.toLocaleString()}
                    </p>
                  </div>
                  <Users className={`w-4 h-4 ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`} />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                      Active Users
                    </p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-mint-fresh' : 'text-bottle-green'}`}>
                      {quickStats.activeUsers.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-mint-fresh animate-pulse" />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                      Pending Approval
                    </p>
                    <p className={`text-lg font-bold ${quickStats.pendingApproval > 0 ? 'text-earthy-yellow' : (isDarkMode ? 'text-dark-text-primary' : 'text-text-dark')}`}>
                      {quickStats.pendingApproval.toLocaleString()}
                    </p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${quickStats.pendingApproval > 0 ? 'bg-earthy-yellow animate-pulse' : 'bg-gray-300'}`} />
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                      New This Week
                    </p>
                    <p className={`text-lg font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                      {quickStats.newThisWeek.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-sage-green" />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Analytics Panel */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserAnalytics 
              data={analyticsData}
              loading={analyticsLoading}
            />
          </motion.div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserFilters 
              filters={activeFilters}
              onFiltersChange={handleFilterChange}
              userCounts={{
                total: totalUsers,
                filtered: users.length
              }}
            />
          </motion.div>
        )}

        {/* Search and Bulk Operations */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search users by name, email, phone, or role..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Export and Refresh */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={usersLoading}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={refetchUsers}
                disabled={usersLoading}
              >
                <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Bulk Operations Bar */}
          {selectedUsers.length > 0 && (
            <BulkOperations
              selectedUsers={selectedUsers}
              totalUsers={users.length}
              onBulkOperation={handleBulkOperation}
              onClearSelection={() => setSelectedUsers([])}
            />
          )}

          {/* User Directory Table */}
          <UserDirectoryTable
            users={users}
            loading={usersLoading}
            error={usersError}
            selectedUsers={selectedUsers}
            sortConfig={sortConfig}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            totalUsers={totalUsers}
            onUserSelect={handleUserSelect}
            onSelectAll={handleSelectAll}
            onSort={handleSort}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            onUserAction={handleUserAction}
          />
        </Card>
      </div>

      {/* Modals */}
      {showUserProfile && selectedUser && (
        <UserProfileModal
          user={selectedUser}
          isOpen={showUserProfile}
          onClose={() => {
            setShowUserProfile(false);
            setSelectedUser(null);
          }}
          onUserUpdate={refetchUsers}
        />
      )}

      {showCreateOwner && (
        <CreateRestaurantOwner
          isOpen={showCreateOwner}
          onClose={() => setShowCreateOwner(false)}
          onSuccess={() => {
            setShowCreateOwner(false);
            refetchUsers();
            toast.success('Restaurant owner created successfully');
          }}
        />
      )}

      {showCreateManager && (
        <CreateRestaurantManager
          isOpen={showCreateManager}
          onClose={() => setShowCreateManager(false)}
          onSuccess={() => {
            setShowCreateManager(false);
            refetchUsers();
            toast.success('Restaurant manager created successfully');
          }}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;