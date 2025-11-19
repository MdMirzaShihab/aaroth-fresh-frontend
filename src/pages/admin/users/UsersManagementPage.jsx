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
  Store,
  CheckCircle,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Button, Input } from '../../../components/ui';
import {
  useGetUsersQuery,
  useGetUserAnalyticsQuery,
} from '../../../services/admin/usersService';
import UserDirectoryTable from './components/UserDirectoryTable';
import UserFilters from './components/UserFilters';
import BulkOperations from './components/BulkOperations';
import UserAnalytics from './components/UserAnalytics';
import UserProfileModal from './components/UserProfileModal';
import CreateBuyerOwner from './CreateBuyerOwner';
import CreateBuyerManager from './CreateBuyerManager';

const UsersManagementPage = () => {
  const { isDarkMode } = useTheme();

  // Page state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortConfig, setSortConfig] = useState({
    field: 'createdAt',
    direction: 'desc',
  });
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
    refetch: refetchUsers,
  } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchQuery,
    sort: `${sortConfig.field}:${sortConfig.direction}`,
    ...activeFilters,
  });

  const { data: analyticsData, isLoading: analyticsLoading } =
    useGetUserAnalyticsQuery({
      enabled: showAnalytics,
    });

  // Memoized data transformations
  const totalUsers = usersData?.total || 0;
  // Backend returns data as array directly, not nested in data.users
  const users = usersData?.data || [];
  const totalPages = Math.ceil(totalUsers / pageSize);

  // Handle user selection
  const handleUserSelect = useCallback((userId, selected) => {
    setSelectedUsers((prev) =>
      selected ? [...prev, userId] : prev.filter((id) => id !== userId)
    );
  }, []);

  const handleSelectAll = useCallback(
    (selected) => {
      if (selected) {
        setSelectedUsers(users.map((user) => user.id));
      } else {
        setSelectedUsers([]);
      }
    },
    [users]
  );

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  // Handle sorting
  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1);
  }, []);

  // Handle filtering
  const handleFilterChange = useCallback((filters) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  // Handle bulk operations
  const handleBulkOperation = useCallback(
    async (operation, options = {}) => {
      if (selectedUsers.length === 0) {
        toast.error('Please select users first');
        return;
      }

      try {
        toast.loading(
          `Processing ${operation} for ${selectedUsers.length} users...`
        );

        // Bulk operation logic will be implemented in BulkOperations component
        // This is a placeholder for the actual API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));

        toast.dismiss();
        toast.success(`${operation} completed successfully`);
        setSelectedUsers([]);
        refetchUsers();
      } catch (error) {
        toast.dismiss();
        toast.error(`Failed to ${operation}: ${error.message}`);
      }
    },
    [selectedUsers, refetchUsers]
  );

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

  // Quick stats for header
  const quickStats = useMemo(() => {
    if (!analyticsData?.data) return null;

    // Calculate active users from userActivity (sum across all roles)
    const userActivity = analyticsData.data.userActivity || {};
    const activeUsers = Object.values(userActivity).reduce(
      (sum, roleData) => sum + (roleData.active || 0),
      0
    );

    // Calculate pending approvals from approvalStats
    const approvalStats = analyticsData.data.approvalStats || {};
    const pendingApproval = Object.values(approvalStats).reduce(
      (sum, roleStats) => sum + (roleStats.pending || 0),
      0
    );

    // Registration trends for new users this week (if available)
    const registrationTrends = analyticsData.data.registrationTrends || {};
    const newThisWeek = registrationTrends.thisWeek || 0;

    return {
      totalUsers,
      activeUsers,
      pendingApproval,
      newThisWeek,
    };
  }, [analyticsData, totalUsers]);

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ===== HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-text-dark dark:text-dark-text-primary flex items-center gap-3">
              <Users className="w-8 h-8 text-muted-olive" />
              Users Management
            </h1>
            <p className="text-text-muted dark:text-dark-text-muted mt-2">
              Comprehensive user directory with advanced B2B workflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={refetchUsers}
              disabled={usersLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              onClick={() => setShowCreateOwner(true)}
              className="flex items-center gap-2 bg-gradient-secondary text-white"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </Button>
          </div>
        </motion.div>

        {/* ===== STATISTICS DASHBOARD ===== */}
        {quickStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Total Users */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted-olive/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-muted-olive" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Total Users</p>
                  <p className="text-2xl font-bold text-muted-olive">
                    {quickStats.totalUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Active Users */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sage-green/10 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-sage-green" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Active</p>
                  <p className="text-2xl font-bold text-sage-green">
                    {quickStats.activeUsers.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Pending Approval */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-earthy-yellow/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-earthy-yellow" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">Pending Approval</p>
                  <p className="text-2xl font-bold text-earthy-yellow">
                    {quickStats.pendingApproval.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* New This Week */}
            <Card className="p-4 glass glow-green">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bottle-green/10 rounded-2xl flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-bottle-green" />
                </div>
                <div>
                  <p className="text-sm text-text-muted dark:text-dark-text-muted">New This Week</p>
                  <p className="text-2xl font-bold text-bottle-green">
                    {quickStats.newThisWeek.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ===== ANALYTICS PANEL ===== */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.2 }}
          >
            <UserAnalytics data={analyticsData} loading={analyticsLoading} />
          </motion.div>
        )}

        {/* ===== FILTERS PANEL ===== */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: 0.3 }}
          >
            <UserFilters
              filters={activeFilters}
              onFiltersChange={handleFilterChange}
              userCounts={{
                total: totalUsers,
                filtered: users.length,
              }}
            />
          </motion.div>
        )}

        {/* ===== SEARCH & OPERATIONS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6 glass">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted dark:text-dark-text-muted" />
                <Input
                  placeholder="Search users by name, email, phone, or role..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 glass"
                />
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
        </motion.div>
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
        <CreateBuyerOwner
          isOpen={showCreateOwner}
          onClose={() => setShowCreateOwner(false)}
          onSuccess={() => {
            setShowCreateOwner(false);
            refetchUsers();
            toast.success('Buyer owner created successfully');
          }}
        />
      )}

      {showCreateManager && (
        <CreateBuyerManager
          isOpen={showCreateManager}
          onClose={() => setShowCreateManager(false)}
          onSuccess={() => {
            setShowCreateManager(false);
            refetchUsers();
            toast.success('Buyer manager created successfully');
          }}
        />
      )}
    </div>
  );
};

export default UsersManagementPage;
