import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  Calendar,
  Search,
  Filter,
  MoreVertical,
  User,
  Key,
  Ban,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  useGetRestaurantManagersQuery,
  useCreateRestaurantManagerMutation,
  useUpdateRestaurantManagerMutation,
  useDeactivateRestaurantManagerMutation,
  useDeleteRestaurantManagerMutation,
} from '../../store/slices/apiSlice';
import {
  formatPhoneForDisplay,
  formatDate,
  validateBangladeshPhone,
  phoneInputUtils,
} from '../../utils';

const ManagerManagement = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Form state for adding/editing managers
  const [managerForm, setManagerForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'restaurantManager',
    permissions: {
      viewOrders: true,
      placeOrders: true,
      manageProfile: false,
      manageManagers: false,
      viewAnalytics: true,
    },
    password: '',
    confirmPassword: '',
  });

  // API queries and mutations
  const {
    data: managersResponse,
    isLoading,
    refetch,
  } = useGetRestaurantManagersQuery();
  const [createManager, { isLoading: isCreating }] =
    useCreateRestaurantManagerMutation();
  const [updateManager, { isLoading: isUpdating }] =
    useUpdateRestaurantManagerMutation();
  const [deactivateManager, { isLoading: isDeactivating }] =
    useDeactivateRestaurantManagerMutation();
  const [deleteManager, { isLoading: isDeleting }] =
    useDeleteRestaurantManagerMutation();

  const managers = managersResponse?.managers || [];

  // Filter managers based on search and status
  const filteredManagers = managers.filter((manager) => {
    const matchesSearch =
      manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manager.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || manager.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setManagerForm({
      name: '',
      email: '',
      phone: '',
      role: 'restaurantManager',
      permissions: {
        viewOrders: true,
        placeOrders: true,
        manageProfile: false,
        manageManagers: false,
        viewAnalytics: true,
      },
      password: '',
      confirmPassword: '',
    });
  };

  const handleAddManager = async () => {
    // Validation
    if (
      !managerForm.name ||
      !managerForm.email ||
      !managerForm.phone ||
      !managerForm.password
    ) {
      alert('Please fill all required fields');
      return;
    }

    const phoneValidation = validateBangladeshPhone(managerForm.phone);
    if (!phoneValidation.isValid) {
      alert(phoneValidation.message);
      return;
    }

    if (managerForm.password !== managerForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (managerForm.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      await createManager({
        ...managerForm,
        phone: phoneInputUtils.getCleanValue(managerForm.phone),
      }).unwrap();
      setShowAddModal(false);
      resetForm();
      refetch();
      // Show success message
    } catch (error) {
      console.error('Failed to create manager:', error);
      alert('Failed to create manager. Please try again.');
    }
  };

  const handleEditManager = async () => {
    if (!selectedManager) return;

    // Validation
    if (!managerForm.name || !managerForm.email || !managerForm.phone) {
      alert('Please fill all required fields');
      return;
    }

    const phoneValidation = validateBangladeshPhone(managerForm.phone);
    if (!phoneValidation.isValid) {
      alert(phoneValidation.message);
      return;
    }

    try {
      const updateData = {
        id: selectedManager._id,
        name: managerForm.name,
        email: managerForm.email,
        phone: phoneInputUtils.getCleanValue(managerForm.phone),
        permissions: managerForm.permissions,
      };

      await updateManager(updateData).unwrap();
      setShowEditModal(false);
      setSelectedManager(null);
      resetForm();
      refetch();
      alert('Manager updated successfully');
    } catch (error) {
      console.error('Failed to update manager:', error);
      alert('Failed to update manager. Please try again.');
    }
  };

  const handleDeleteManager = async () => {
    if (!selectedManager) return;

    try {
      await deleteManager({
        id: selectedManager._id,
      }).unwrap();
      setShowDeleteConfirm(false);
      setSelectedManager(null);
      refetch();
      alert('Manager deleted successfully');
    } catch (error) {
      console.error('Failed to delete manager:', error);
      alert('Failed to delete manager. Please try again.');
    }
  };

  const handleToggleManagerStatus = async (manager) => {
    try {
      await deactivateManager({
        id: manager._id,
        isActive: !manager.isActive,
      }).unwrap();
      refetch();
      alert(
        `Manager ${!manager.isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Failed to update manager status:', error);
      alert('Failed to update manager status. Please try again.');
    }
  };

  const openEditModal = (manager) => {
    setSelectedManager(manager);
    setManagerForm({
      name: manager.name || '',
      email: manager.email || '',
      phone: manager.phone || '',
      role: manager.role || 'restaurantManager',
      permissions: manager.permissions || {
        viewOrders: true,
        placeOrders: true,
        manageProfile: false,
        manageManagers: false,
        viewAnalytics: true,
      },
      password: '',
      confirmPassword: '',
    });
    setShowEditModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-sage-green/20 text-muted-olive border-sage-green/30',
      inactive: 'bg-gray-100 text-gray-600 border-gray-200',
      suspended: 'bg-tomato-red/10 text-tomato-red border-tomato-red/30',
    };
    return colors[status] || colors.active;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: CheckCircle,
      inactive: User,
      suspended: Ban,
    };
    const Icon = icons[status] || CheckCircle;
    return <Icon className="w-3 h-3" />;
  };

  const ManagerCard = ({ manager }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="glass rounded-3xl p-6 hover:shadow-soft transition-all duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {manager.name?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-text-dark">{manager.name}</h3>
              <p className="text-sm text-text-muted">{manager.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${getStatusColor(manager.status)}`}
                >
                  {getStatusIcon(manager.status)}
                  {manager.status || 'Active'}
                </span>
                <span className="text-xs text-text-muted">
                  {manager.role === 'restaurantManager' ? 'Manager' : 'Owner'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-2xl shadow-lg z-10 py-2 min-w-[160px]">
                <button
                  onClick={() => {
                    openEditModal(manager);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Manager
                </button>
                <button
                  onClick={() => {
                    handleToggleManagerStatus(manager);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  {manager.isActive ? (
                    <>
                      <Ban className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setSelectedManager(manager);
                    setShowDeleteConfirm(true);
                    setShowActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 text-tomato-red flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Manager
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-3 h-3 text-gray-400" />
            <span className="text-text-muted">
              {formatPhoneForDisplay(manager.phone)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-text-muted">
              Joined {formatDate(manager.createdAt)}
            </span>
          </div>
        </div>

        {/* Permissions Summary */}
        <div className="bg-white/50 border border-gray-100 rounded-2xl p-3 mb-4">
          <div className="text-xs font-medium text-text-dark mb-2">
            Permissions
          </div>
          <div className="flex flex-wrap gap-1">
            {Object.entries(manager.permissions || {}).map(
              ([key, value]) =>
                value && (
                  <span
                    key={key}
                    className="px-2 py-1 bg-sage-green/10 text-muted-olive text-xs rounded-lg"
                  >
                    {key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                )
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-text-muted">
            Last active:{' '}
            {manager.lastLoginAt ? formatDate(manager.lastLoginAt) : 'Never'}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                manager.isActive
                  ? 'bg-sage-green/20 text-muted-olive'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {manager.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const FormModal = ({ isOpen, onClose, title, onSubmit, isSubmitting }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-dark">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={managerForm.name}
                  onChange={(e) =>
                    setManagerForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={managerForm.email}
                  onChange={(e) =>
                    setManagerForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={managerForm.phone}
                  onChange={(e) =>
                    setManagerForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                  placeholder={phoneInputUtils.placeholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-dark mb-2">
                  Role
                </label>
                <select
                  value={managerForm.role}
                  onChange={(e) =>
                    setManagerForm((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                >
                  <option value="restaurantManager">Manager</option>
                </select>
              </div>
            </div>

            {/* Password Fields (only for new manager) */}
            {showAddModal && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={managerForm.password}
                    onChange={(e) =>
                      setManagerForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-dark mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={managerForm.confirmPassword}
                    onChange={(e) =>
                      setManagerForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
                    placeholder="Confirm password"
                  />
                </div>
              </div>
            )}

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-3">
                Permissions
              </label>
              <div className="space-y-3">
                {Object.entries({
                  viewOrders: 'View Orders',
                  placeOrders: 'Place Orders',
                  manageProfile: 'Manage Restaurant Profile',
                  manageManagers: 'Manage Other Managers',
                  viewAnalytics: 'View Analytics',
                }).map(([key, label]) => (
                  <label
                    key={key}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl"
                  >
                    <input
                      type="checkbox"
                      checked={managerForm.permissions[key] || false}
                      onChange={(e) =>
                        setManagerForm((prev) => ({
                          ...prev,
                          permissions: {
                            ...prev.permissions,
                            [key]: e.target.checked,
                          },
                        }))
                      }
                      className="text-muted-olive focus:ring-muted-olive/20 rounded"
                    />
                    <div>
                      <span className="font-medium text-text-dark">
                        {label}
                      </span>
                      <p className="text-xs text-text-muted">
                        {key === 'viewOrders' &&
                          'Allow viewing all restaurant orders'}
                        {key === 'placeOrders' && 'Allow placing new orders'}
                        {key === 'manageProfile' &&
                          'Allow editing restaurant profile'}
                        {key === 'manageManagers' &&
                          'Allow creating/editing other managers'}
                        {key === 'viewAnalytics' &&
                          'Allow viewing restaurant analytics'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {showAddModal ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>{showAddModal ? 'Create Manager' : 'Update Manager'}</>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
    managerName,
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-tomato-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-tomato-red" />
            </div>
            <h3 className="text-xl font-semibold text-text-dark mb-2">
              Delete Manager
            </h3>
            <p className="text-text-muted mb-6">
              Are you sure you want to delete <strong>{managerName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="bg-tomato-red text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete Manager'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">
            Manager Management
          </h1>
          <p className="text-text-muted mt-2">
            Add and manage restaurant managers
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-gradient-primary text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 touch-target"
        >
          <UserPlus className="w-5 h-5" />
          Add Manager
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search managers by name or email..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-muted-olive/20 focus:border-muted-olive"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Managers Grid */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-3xl"></div>
              </div>
            ))}
          </div>
        ) : filteredManagers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredManagers.map((manager) => (
              <ManagerCard key={manager._id} manager={manager} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="glass rounded-3xl p-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-text-dark mb-2">
                No managers found
              </h3>
              <p className="text-text-muted mb-8">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search or filters'
                  : 'Add your first manager to help run your restaurant'}
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="bg-gradient-primary text-white px-8 py-3 rounded-2xl font-medium hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto touch-target"
              >
                <UserPlus className="w-5 h-5" />
                Add Manager
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Manager Modal */}
      <FormModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Manager"
        onSubmit={handleAddManager}
        isSubmitting={isCreating}
      />

      {/* Edit Manager Modal */}
      <FormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedManager(null);
          resetForm();
        }}
        title="Edit Manager"
        onSubmit={handleEditManager}
        isSubmitting={isUpdating}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedManager(null);
        }}
        onConfirm={handleDeleteManager}
        isDeleting={isDeleting}
        managerName={selectedManager?.name}
      />
    </div>
  );
};

export default ManagerManagement;
