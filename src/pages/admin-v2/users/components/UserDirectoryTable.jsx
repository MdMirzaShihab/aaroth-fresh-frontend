/**
 * UserDirectoryTable - Advanced User Directory with Professional B2B Features
 * Features: Multi-column sorting, user avatars, risk scoring, business associations, mobile optimization
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit3,
  UserCheck,
  UserX,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  Store,
  Utensils,
  Users,
  Star
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card } from '../../../../components/ui';
import { Button } from '../../../../components/ui';
import { StatusBadge } from '../../../../components/ui';
import LoadingSpinner from '../../../../components/ui/LoadingSpinner';
import EmptyState from '../../../../components/ui/EmptyState';
import Pagination from '../../../../components/ui/Pagination';

// User avatar component
const UserAvatar = ({ user, size = 'sm' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-gradient-to-br from-tomato-red via-earthy-yellow to-earthy-brown',
      vendor: 'bg-gradient-to-br from-bottle-green via-sage-green to-mint-fresh',
      restaurantOwner: 'bg-gradient-to-br from-earthy-brown via-dusty-cedar to-earthy-tan',
      restaurantManager: 'bg-gradient-to-br from-muted-olive via-sage-green to-dusty-cedar'
    };
    return colors[role] || 'bg-gradient-to-br from-gray-400 to-gray-600';
  };

  return (
    <div className={`${sizeClasses[size]} rounded-xl ${getRoleColor(user.role)} flex items-center justify-center shadow-lg text-white font-medium`}>
      {user.name?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};

// Role badge component
const RoleBadge = ({ role, className = '' }) => {
  const roleConfig = {
    admin: { label: 'Admin', color: 'tomato-red', icon: Shield },
    vendor: { label: 'Vendor', color: 'bottle-green', icon: Store },
    restaurantOwner: { label: 'Owner', color: 'earthy-brown', icon: Utensils },
    restaurantManager: { label: 'Manager', color: 'muted-olive', icon: Users }
  };

  const config = roleConfig[role] || { label: role, color: 'gray-500', icon: Users };
  const IconComponent = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-${config.color}/10 text-${config.color} ${className}`}>
      <IconComponent className="w-3 h-3" />
      {config.label}
    </span>
  );
};

// Risk score indicator
const RiskScore = ({ score, className = '' }) => {
  const getRiskLevel = (score) => {
    if (score <= 30) return { level: 'Low', color: 'mint-fresh', bgColor: 'mint-fresh/10' };
    if (score <= 60) return { level: 'Medium', color: 'earthy-yellow', bgColor: 'earthy-yellow/10' };
    return { level: 'High', color: 'tomato-red', bgColor: 'tomato-red/10' };
  };

  const risk = getRiskLevel(score);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-8 h-2 rounded-full bg-gray-200 overflow-hidden`}>
        <div 
          className={`h-full bg-${risk.color} rounded-full transition-all duration-500`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-medium text-${risk.color}`}>
        {score}
      </span>
    </div>
  );
};

// Business info component
const BusinessInfo = ({ user }) => {
  const { businessInfo } = user;
  
  if (!businessInfo?.businessName) {
    return <span className="text-xs text-gray-400">No business</span>;
  }

  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-text-dark truncate">
        {businessInfo.businessName}
      </span>
      {businessInfo.location && (
        <span className="text-xs text-text-muted truncate">
          {businessInfo.location}
        </span>
      )}
    </div>
  );
};

// Actions dropdown component
const UserActions = ({ user, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const actions = [
    { id: 'view_profile', label: 'View Profile', icon: Eye },
    { id: 'edit_profile', label: 'Edit Profile', icon: Edit3 },
    ...(user.status === 'pending_approval' ? [
      { id: 'approve', label: 'Approve User', icon: UserCheck, color: 'text-mint-fresh' },
      { id: 'reject', label: 'Reject User', icon: UserX, color: 'text-tomato-red' }
    ] : []),
    { id: 'deactivate', label: user.isActive ? 'Deactivate' : 'Activate', icon: user.isActive ? UserX : UserCheck }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dark-surface rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-20">
            {actions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    onAction(user, action.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-600 first:rounded-t-xl last:rounded-b-xl transition-colors ${action.color || 'text-text-dark dark:text-dark-text-primary'}`}
                >
                  <IconComponent className="w-4 h-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

const UserDirectoryTable = ({
  users = [],
  loading = false,
  error = null,
  selectedUsers = [],
  sortConfig = { field: 'name', direction: 'asc' },
  currentPage = 1,
  pageSize = 20,
  totalPages = 1,
  totalUsers = 0,
  onUserSelect,
  onSelectAll,
  onSort,
  onPageChange,
  onPageSizeChange,
  onUserAction
}) => {
  const { isDarkMode } = useTheme();
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Column configuration
  const columns = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3 min-w-0">
          <UserAvatar user={user} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-dark dark:text-dark-text-primary truncate">
              {user.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user.email}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (_, user) => <RoleBadge role={user.role} />
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_, user) => (
        <StatusBadge 
          status={user.status}
          variant="glass"
          className="capitalize"
        />
      )
    },
    {
      key: 'business',
      label: 'Business',
      sortable: false,
      render: (_, user) => <BusinessInfo user={user} />
    },
    {
      key: 'riskScore',
      label: 'Risk Score',
      sortable: true,
      render: (_, user) => <RiskScore score={user.riskScore || 0} />
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-text-muted">
          {value || 'Never'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, user) => (
        <UserActions user={user} onAction={onUserAction} />
      )
    }
  ];

  // Handle sort
  const handleSort = (field) => {
    if (onSort) {
      onSort(field);
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    if (onSelectAll) {
      onSelectAll(isChecked);
    }
  };

  // Handle individual selection
  const handleUserSelect = (userId, isChecked) => {
    if (onUserSelect) {
      onUserSelect(userId, isChecked);
    }
  };

  // Render sort icon
  const renderSortIcon = (field) => {
    if (sortConfig.field !== field) {
      return <ChevronUp className="w-4 h-4 opacity-40" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  // Loading state
  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-12">
        <EmptyState
          title="Failed to load users"
          description={error.message || 'An error occurred while loading users'}
          action={
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // Empty state
  if (!loading && users.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon={Users}
          title="No users found"
          description="No users match your current search and filter criteria"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header with controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span>Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalUsers)} of {totalUsers.toLocaleString()} users</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="text-sm border border-gray-300 dark:border-dark-border rounded-lg px-2 py-1 bg-white dark:bg-dark-surface"
          >
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-dark-border">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-surface">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                  />
                </th>
                {columns.map((column) => (
                  <th key={column.key} className="px-6 py-4 text-left">
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="flex items-center gap-2 text-sm font-medium text-text-dark dark:text-dark-text-primary hover:text-bottle-green transition-colors"
                      >
                        {column.label}
                        {renderSortIcon(column.key)}
                      </button>
                    ) : (
                      <span className="text-sm font-medium text-text-dark dark:text-dark-text-primary">
                        {column.label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-bg-alt divide-y divide-gray-200 dark:divide-dark-border">
              {users.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-dark-surface transition-colors"
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                      className="rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4">
                      {column.render ? column.render(user[column.key], user) : user[column.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {users.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={(e) => handleUserSelect(user.id, e.target.checked)}
                    className="rounded border-gray-300 text-bottle-green focus:ring-bottle-green"
                  />
                  <UserAvatar user={user} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-text-dark dark:text-dark-text-primary truncate">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-text-muted">
                      <RoleBadge role={user.role} />
                      <StatusBadge status={user.status} variant="glass" className="capitalize" />
                    </div>
                  </div>
                </div>
                <UserActions user={user} onAction={onUserAction} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-text-muted">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.businessInfo?.businessName && (
                  <div className="flex items-center gap-2 text-text-muted">
                    <Store className="w-4 h-4" />
                    <span className="truncate">{user.businessInfo.businessName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-dark-border">
                <RiskScore score={user.riskScore || 0} />
                <span className="text-xs text-text-muted">
                  Last login: {user.lastLogin || 'Never'}
                </span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-dark-border">
          <div className="text-sm text-text-muted">
            Page {currentPage} of {totalPages}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showPageNumbers={true}
            maxVisiblePages={5}
          />
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && users.length > 0 && (
        <div className="absolute inset-0 bg-white/50 dark:bg-dark-bg/50 flex items-center justify-center rounded-2xl">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
};

export default UserDirectoryTable;