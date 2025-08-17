import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  UserX,
  Edit3,
  Trash2,
  Phone,
  Mail,
  Eye,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Store,
  Utensils,
} from 'lucide-react';
import {
  useGetAdminUsersQuery,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useApproveUserMutation,
  useBulkApproveUsersMutation,
  useBulkRejectUsersMutation,
  useBulkDeleteUsersMutation,
} from '../../store/slices/apiSlice';
import { selectAuth } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SearchBar from '../../components/ui/SearchBar';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import { Table } from '../../components/ui/Table';

const UserManagement = () => {
  const { user: currentUser } = useSelector(selectAuth);
  const location = useLocation();

  // Determine context based on route
  const getPageContext = () => {
    if (location.pathname.includes('/users/vendors')) {
      return {
        type: 'vendors',
        title: 'Vendor User Accounts',
        description: 'Manage vendor user accounts and permissions',
        icon: Store,
        roleFilter: 'vendor',
      };
    } else if (location.pathname.includes('/users/restaurants')) {
      return {
        type: 'restaurants',
        title: 'Restaurant User Accounts',
        description: 'Manage restaurant owner and manager accounts',
        icon: Utensils,
        roleFilter: ['restaurantOwner', 'restaurantManager'],
      };
    } else {
      return {
        type: 'all',
        title: 'User Management',
        description: 'Manage all user accounts across the platform',
        icon: Users,
        roleFilter: 'all',
      };
    }
  };

  const pageContext = getPageContext();

  // Local state for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(
    pageContext.roleFilter === 'all' ? 'all' : pageContext.roleFilter
  );
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [confirmAction, setConfirmAction] = useState(null);

  const itemsPerPage = 10;

  // Query params for API call
  const queryParams = useMemo(() => {
    let params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm || undefined,
      status: selectedStatus !== 'all' ? selectedStatus : undefined,
    };

    // Handle role filtering based on context
    if (pageContext.type === 'vendors') {
      params.role = 'vendor';
    } else if (pageContext.type === 'restaurants') {
      // For restaurants, we need to filter for both owner and manager roles
      // Since backend might not support multiple roles in single param, we'll handle this in frontend
      params.role = selectedRole !== 'all' ? selectedRole : undefined;
    } else {
      params.role = selectedRole !== 'all' ? selectedRole : undefined;
    }

    return params;
  }, [currentPage, searchTerm, selectedRole, selectedStatus, pageContext.type]);

  // RTK Query hooks
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useGetAdminUsersQuery(queryParams);

  const [updateUser] = useUpdateAdminUserMutation();
  const [deleteUser] = useDeleteAdminUserMutation();
  const [approveUser] = useApproveUserMutation();
  const [bulkApproveUsers] = useBulkApproveUsersMutation();
  const [bulkRejectUsers] = useBulkRejectUsersMutation();
  const [bulkDeleteUsers] = useBulkDeleteUsersMutation();

  const users = usersData?.data || [];
  const totalUsers = usersData?.total || 0;
  const totalPages = usersData?.pages || 1;

  // Filter roles available
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'vendor', label: 'Vendors' },
    { value: 'restaurantOwner', label: 'Restaurant Owners' },
    { value: 'restaurantManager', label: 'Restaurant Managers' },
    { value: 'admin', label: 'Admins' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending Approval' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Handle user approval
  const handleApproval = async (userId, isApproved) => {
    try {
      await approveUser({ id: userId, isApproved }).unwrap();
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to update user approval:', error);
    }
  };

  // Handle user deletion
  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId).unwrap();
      setConfirmAction(null);
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  // Handle bulk operations
  const handleBulkApprove = async () => {
    try {
      const userIds = Array.from(selectedUsers);
      await bulkApproveUsers(userIds).unwrap();
      setSelectedUsers(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk approve users:', error);
    }
  };

  const handleBulkReject = async () => {
    try {
      const userIds = Array.from(selectedUsers);
      await bulkRejectUsers(userIds).unwrap();
      setSelectedUsers(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk reject users:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const userIds = Array.from(selectedUsers);
      await bulkDeleteUsers(userIds).unwrap();
      setSelectedUsers(new Set());
      setConfirmAction(null);
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((user) => user.id)));
    }
  };

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  // Get status badge styling
  const getStatusBadge = (status, isApproved) => {
    if (!isApproved) {
      return {
        className: 'bg-earthy-yellow/20 text-earthy-brown',
        icon: Clock,
        text: 'Pending',
      };
    }

    switch (status?.toLowerCase()) {
      case 'active':
        return {
          className: 'bg-mint-fresh/20 text-bottle-green',
          icon: CheckCircle,
          text: 'Active',
        };
      case 'inactive':
        return {
          className: 'bg-gray-100 text-gray-600',
          icon: XCircle,
          text: 'Inactive',
        };
      case 'rejected':
        return {
          className: 'bg-tomato-red/20 text-tomato-red',
          icon: XCircle,
          text: 'Rejected',
        };
      default:
        return {
          className: 'bg-blue-50 text-blue-600',
          icon: CheckCircle,
          text: 'Active',
        };
    }
  };

  // Get role badge styling
  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-700',
      vendor: 'bg-green-100 text-green-700',
      restaurantOwner: 'bg-blue-100 text-blue-700',
      restaurantManager: 'bg-indigo-100 text-indigo-700',
    };

    return roleStyles[role] || 'bg-gray-100 text-gray-600';
  };

  // Table columns configuration
  const columns = [
    {
      id: 'select',
      header: (
        <input
          type="checkbox"
          checked={selectedUsers.size === users.length && users.length > 0}
          onChange={handleSelectAll}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      cell: (user) => (
        <input
          type="checkbox"
          checked={selectedUsers.has(user.id)}
          onChange={() => handleSelectUser(user.id)}
          className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
        />
      ),
      width: '48px',
    },
    {
      id: 'user',
      header: 'User',
      cell: (user) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {user.name?.charAt(0) || user.phone?.charAt(-1) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-text-dark dark:text-white truncate">
              {user.name || 'No Name'}
            </p>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Phone className="w-3 h-3" />
              {user.phone}
            </div>
          </div>
        </div>
      ),
      sortable: true,
      width: '250px',
    },
    {
      id: 'role',
      header: 'Role',
      cell: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}
        >
          {user.role?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'status',
      header: 'Status',
      cell: (user) => {
        const badge = getStatusBadge(user.status, user.isApproved);
        return (
          <div className="flex items-center gap-1">
            <badge.icon className="w-3 h-3" />
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}
            >
              {badge.text}
            </span>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: 'joined',
      header: 'Joined',
      cell: (user) => (
        <div className="text-sm text-text-muted">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString()
            : 'Unknown'}
        </div>
      ),
      sortable: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (user) => (
        <div className="flex items-center gap-1">
          {!user.isApproved && user.role === 'vendor' && (
            <>
              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'approve',
                    user,
                    title: 'Approve Vendor',
                    message: `Are you sure you want to approve ${user.name || user.phone}?`,
                    confirmText: 'Approve',
                    onConfirm: () => handleApproval(user.id, true),
                  })
                }
                className="p-2 text-bottle-green hover:bg-mint-fresh/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Approve user"
              >
                <UserCheck className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setConfirmAction({
                    type: 'reject',
                    user,
                    title: 'Reject Vendor',
                    message: `Are you sure you want to reject ${user.name || user.phone}?`,
                    confirmText: 'Reject',
                    onConfirm: () => handleApproval(user.id, false),
                  })
                }
                className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Reject user"
              >
                <UserX className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => {
              /* Handle edit */
            }}
            className="p-2 text-text-muted hover:text-bottle-green hover:bg-bottle-green/10 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Edit user"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {user.id !== currentUser?.id && (
            <button
              onClick={() =>
                setConfirmAction({
                  type: 'delete',
                  user,
                  title: 'Delete User',
                  message: `Are you sure you want to permanently delete ${user.name || user.phone}? This action cannot be undone.`,
                  confirmText: 'Delete',
                  isDangerous: true,
                  onConfirm: () => handleDelete(user.id),
                })
              }
              className="p-2 text-tomato-red hover:bg-tomato-red/20 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Delete user"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '140px',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load users"
        description="There was an error loading user data. Please try again."
        action={{
          label: 'Retry',
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            User Management
          </h1>
          <p className="text-text-muted mt-1">
            Manage users, approvals, and permissions across the platform
          </p>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-text-muted">
              {selectedUsers.size} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-approve',
                  title: 'Bulk Approve Users',
                  message: `Are you sure you want to approve ${selectedUsers.size} users? This will activate their accounts.`,
                  confirmText: 'Approve All',
                  onConfirm: handleBulkApprove,
                })
              }
              className="text-bottle-green border-bottle-green hover:bg-bottle-green hover:text-white"
            >
              Bulk Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-reject',
                  title: 'Bulk Reject Users',
                  message: `Are you sure you want to reject ${selectedUsers.size} users? This will deny their access.`,
                  confirmText: 'Reject All',
                  onConfirm: handleBulkReject,
                })
              }
              className="text-orange-600 border-orange-600 hover:bg-orange-600 hover:text-white"
            >
              Bulk Reject
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setConfirmAction({
                  type: 'bulk-delete',
                  title: 'Bulk Delete Users',
                  message: `Are you sure you want to permanently delete ${selectedUsers.size} users? This action cannot be undone.`,
                  confirmText: 'Delete All',
                  isDangerous: true,
                  onConfirm: handleBulkDelete,
                })
              }
              className="text-tomato-red border-tomato-red hover:bg-tomato-red hover:text-white"
            >
              Bulk Delete
            </Button>
          </div>
        )}
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 lg:max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search users by name, phone..."
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-2xl bg-white dark:bg-gray-800 text-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-bottle-green/20 min-h-[44px]"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            data={users}
            columns={columns}
            emptyState={
              <EmptyState
                icon={Users}
                title="No users found"
                description="No users match your current filters."
              />
            }
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalUsers}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      {confirmAction && (
        <ConfirmDialog
          isOpen
          onClose={() => setConfirmAction(null)}
          title={confirmAction.title}
          message={confirmAction.message}
          confirmText={confirmAction.confirmText}
          isDangerous={confirmAction.isDangerous}
          onConfirm={confirmAction.onConfirm}
        />
      )}
    </div>
  );
};

export default UserManagement;
