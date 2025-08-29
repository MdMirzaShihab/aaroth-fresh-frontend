import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  User,
  Crown,
  Shield,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  Eye,
  UserPlus,
  UserMinus,
  Key,
  Clock,
  MapPin,
  Star,
  TrendingUp,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useGetRestaurantManagersQuery,
  useCreateRestaurantManagerMutation,
  useUpdateManagerPermissionsMutation,
  useDeactivateManagerMutation,
  useTransferOwnershipMutation,
} from '../../../store/slices/apiSlice';
import { Card } from '../../ui/Card';
import Button from '../../ui/Button';
import LoadingSpinner from '../../ui/LoadingSpinner';
import EmptyState from '../../ui/EmptyState';
import SearchBar from '../../ui/SearchBar';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import FormField from '../../ui/FormField';

const OwnerManagerRelations = ({
  restaurants,
  isLoading,
  error,
  filters,
  onFiltersChange,
  stats,
  onRefresh,
}) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [viewMode, setViewMode] = useState('hierarchy'); // 'hierarchy', 'managers', 'permissions'
  const [modalType, setModalType] = useState(null); // 'add_manager', 'edit_permissions', 'transfer_ownership'
  const [modalData, setModalData] = useState({});
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // RTK Mutations
  const [createManager] = useCreateRestaurantManagerMutation();
  const [updatePermissions] = useUpdateManagerPermissionsMutation();
  const [deactivateManager] = useDeactivateManagerMutation();
  const [transferOwnership] = useTransferOwnershipMutation();

  // Process restaurants with manager data
  const restaurantsWithManagers = useMemo(() => {
    return restaurants.map(restaurant => ({
      ...restaurant,
      totalManagers: restaurant.managers?.length || 0,
      activeManagers: restaurant.managers?.filter(m => m.status === 'active').length || 0,
      ownerInfo: {
        name: restaurant.ownerName,
        phone: restaurant.phone,
        email: restaurant.email,
        joinDate: restaurant.createdAt,
        isActive: restaurant.isActive,
      },
    }));
  }, [restaurants]);

  // Filter restaurants based on search
  const filteredRestaurants = useMemo(() => {
    if (!searchTerm) return restaurantsWithManagers;
    return restaurantsWithManagers.filter(restaurant =>
      restaurant.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restaurant.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [restaurantsWithManagers, searchTerm]);

  const handleRestaurantSelect = (restaurant) => {
    setSelectedRestaurant(restaurant);
  };

  const handleManagerAction = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
  };

  const handleSubmitManagerAction = async () => {
    try {
      const restaurantId = selectedRestaurant.id;

      switch (modalType) {
        case 'add_manager':
          await createManager({
            restaurantId,
            ...modalData,
          }).unwrap();
          break;
        case 'edit_permissions':
          await updatePermissions({
            managerId: modalData.managerId,
            permissions: modalData.permissions,
          }).unwrap();
          break;
        case 'transfer_ownership':
          await transferOwnership({
            restaurantId,
            newOwnerId: modalData.newOwnerId,
            transferReason: modalData.reason,
          }).unwrap();
          break;
      }

      setModalType(null);
      setModalData({});
      onRefresh();
    } catch (error) {
      console.error('Manager action failed:', error);
    }
  };

  const getManagerStatusBadge = (status) => {
    const badges = {
      active: { color: 'bg-mint-fresh/10 text-mint-fresh', label: 'Active' },
      pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
      suspended: { color: 'bg-tomato-red/10 text-tomato-red', label: 'Suspended' },
      inactive: { color: 'bg-gray-100 text-gray-600', label: 'Inactive' },
    };
    return badges[status] || badges.pending;
  };

  const getRoleIcon = (role) => {
    const icons = {
      owner: Crown,
      manager: Shield,
      assistant_manager: User,
    };
    return icons[role] || User;
  };

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load restaurant relations"
        description="There was an error loading owner-manager relationship data."
        actionLabel="Retry"
        onAction={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card className="p-4 glass">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search restaurants by name or owner..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-earthy-beige/20 rounded-2xl p-1">
              {[
                { mode: 'hierarchy', label: 'Hierarchy' },
                { mode: 'managers', label: 'Managers' },
                { mode: 'permissions', label: 'Permissions' },
              ].map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-2 rounded-xl transition-all duration-200 text-sm ${
                    viewMode === mode
                      ? 'bg-white text-bottle-green shadow-sm'
                      : 'text-text-muted hover:text-text-dark'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">Total Restaurants</p>
              <p className="text-2xl font-bold text-text-dark">{stats.totalRestaurants}</p>
            </div>
            <Building2 className="w-8 h-8 text-bottle-green" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">Total Managers</p>
              <p className="text-2xl font-bold text-text-dark">{stats.totalManagers}</p>
            </div>
            <Shield className="w-8 h-8 text-earthy-brown" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">Multi-Manager Restaurants</p>
              <p className="text-2xl font-bold text-text-dark">
                {restaurants.filter(r => r.managersCount > 1).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-mint-fresh" />
          </div>
        </Card>

        <Card className="p-4 glass">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-muted text-sm font-medium">Avg Managers/Restaurant</p>
              <p className="text-2xl font-bold text-text-dark">
                {stats.totalRestaurants > 0 ? (stats.totalManagers / stats.totalRestaurants).toFixed(1) : 0}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-earthy-yellow" />
          </div>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Restaurant List */}
        <div className="lg:col-span-1">
          <Card className="p-4 glass h-fit max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text-dark">Restaurants</h3>
              <span className="text-sm text-text-muted">{filteredRestaurants.length} total</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : filteredRestaurants.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No restaurants found"
                description="No restaurants match your search criteria."
              />
            ) : (
              <div className="space-y-3">
                {filteredRestaurants.map((restaurant) => (
                  <RestaurantRelationCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    isSelected={selectedRestaurant?.id === restaurant.id}
                    onClick={() => handleRestaurantSelect(restaurant)}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          {selectedRestaurant ? (
            <RestaurantDetailPanel
              restaurant={selectedRestaurant}
              viewMode={viewMode}
              onManagerAction={handleManagerAction}
              actionMenuOpen={actionMenuOpen}
              setActionMenuOpen={setActionMenuOpen}
            />
          ) : (
            <Card className="p-8 glass text-center">
              <Building2 className="w-12 h-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text-dark mb-2">Select a Restaurant</h3>
              <p className="text-text-muted">
                Choose a restaurant from the list to view its owner-manager relationships.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Manager Action Modals */}
      <ManagerActionModal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null);
          setModalData({});
        }}
        type={modalType}
        restaurant={selectedRestaurant}
        data={modalData}
        onChange={setModalData}
        onSubmit={handleSubmitManagerAction}
      />
    </div>
  );
};

// Restaurant Relation Card Component
const RestaurantRelationCard = ({ restaurant, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={`p-3 cursor-pointer transition-all duration-200 ${
          isSelected
            ? 'border-bottle-green bg-bottle-green/5 shadow-md'
            : 'hover:shadow-sm hover:border-gray-300'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold">
            {restaurant.businessName?.[0]?.toUpperCase() || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-text-dark truncate">
              {restaurant.businessName}
            </p>
            <p className="text-sm text-text-muted truncate">
              {restaurant.ownerName}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Users className="w-3 h-3" />
              <span>{restaurant.totalManagers}</span>
            </div>
            <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
              restaurant.activeManagers === restaurant.totalManagers
                ? 'bg-mint-fresh/10 text-mint-fresh'
                : 'bg-amber-100 text-amber-600'
            }`}>
              {restaurant.activeManagers}/{restaurant.totalManagers} active
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// Restaurant Detail Panel Component
const RestaurantDetailPanel = ({
  restaurant,
  viewMode,
  onManagerAction,
  actionMenuOpen,
  setActionMenuOpen,
}) => {
  return (
    <Card className="glass h-fit">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold text-lg">
              {restaurant.businessName?.[0]?.toUpperCase() || 'R'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-dark">
                {restaurant.businessName}
              </h3>
              <p className="text-text-muted">{restaurant.location}</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => onManagerAction('add_manager')}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add Manager
          </Button>
        </div>
      </div>

      {/* Content based on view mode */}
      <div className="p-6">
        {viewMode === 'hierarchy' && (
          <HierarchyView restaurant={restaurant} onManagerAction={onManagerAction} />
        )}
        {viewMode === 'managers' && (
          <ManagersView
            restaurant={restaurant}
            onManagerAction={onManagerAction}
            actionMenuOpen={actionMenuOpen}
            setActionMenuOpen={setActionMenuOpen}
          />
        )}
        {viewMode === 'permissions' && (
          <PermissionsView restaurant={restaurant} onManagerAction={onManagerAction} />
        )}
      </div>
    </Card>
  );
};

// Hierarchy View Component
const HierarchyView = ({ restaurant, onManagerAction }) => {
  return (
    <div className="space-y-6">
      {/* Owner Card */}
      <div className="text-center">
        <Card className="p-6 border-2 border-earthy-yellow/30 bg-earthy-yellow/5">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-earthy-yellow to-earthy-brown rounded-2xl flex items-center justify-center text-white">
              <Crown className="w-8 h-8" />
            </div>
          </div>
          <h4 className="text-lg font-semibold text-text-dark mb-2">Restaurant Owner</h4>
          <p className="font-medium text-text-dark">{restaurant.ownerInfo.name}</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-text-muted">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {restaurant.ownerInfo.phone}
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {restaurant.ownerInfo.email}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-2">
            Owner since {format(new Date(restaurant.ownerInfo.joinDate), 'MMM yyyy')}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onManagerAction('transfer_ownership')}
              className="text-xs"
            >
              Transfer Ownership
            </Button>
          </div>
        </Card>
      </div>

      {/* Managers Hierarchy */}
      {restaurant.managers && restaurant.managers.length > 0 && (
        <div>
          <h5 className="font-semibold text-text-dark mb-4 text-center">Management Team</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {restaurant.managers.map((manager) => (
              <ManagerHierarchyCard
                key={manager.id}
                manager={manager}
                onManagerAction={onManagerAction}
              />
            ))}
          </div>
        </div>
      )}

      {(!restaurant.managers || restaurant.managers.length === 0) && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h5 className="font-medium text-text-dark mb-2">No Managers Assigned</h5>
          <p className="text-text-muted mb-4">
            This restaurant doesn't have any managers yet.
          </p>
          <Button
            onClick={() => onManagerAction('add_manager')}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Add First Manager
          </Button>
        </div>
      )}
    </div>
  );
};

// Manager Hierarchy Card Component
const ManagerHierarchyCard = ({ manager, onManagerAction }) => {
  const statusBadge = getManagerStatusBadge(manager.status);
  const RoleIcon = getRoleIcon(manager.role);

  return (
    <Card className={`p-4 ${manager.status === 'active' ? 'border-mint-fresh/30' : 'border-gray-200'}`}>
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-bottle-green to-mint-fresh rounded-2xl flex items-center justify-center text-white mx-auto mb-3">
          <RoleIcon className="w-6 h-6" />
        </div>
        <h6 className="font-medium text-text-dark">{manager.name}</h6>
        <p className="text-sm text-text-muted capitalize mb-2">
          {manager.role.replace('_', ' ')}
        </p>
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
          {statusBadge.label}
        </span>
        <div className="mt-3 space-y-1 text-xs text-text-muted">
          <div className="flex items-center justify-center gap-1">
            <Phone className="w-3 h-3" />
            {manager.phone}
          </div>
          <div className="flex items-center justify-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {format(new Date(manager.joinDate), 'MMM yyyy')}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onManagerAction('edit_permissions', { manager })}
            className="text-xs"
          >
            <Key className="w-3 h-3 mr-1" />
            Permissions
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Managers View Component  
const ManagersView = ({ restaurant, onManagerAction, actionMenuOpen, setActionMenuOpen }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-text-dark">Management Team</h4>
        <Button
          size="sm"
          onClick={() => onManagerAction('add_manager')}
          className="flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Manager
        </Button>
      </div>

      {restaurant.managers && restaurant.managers.length > 0 ? (
        <div className="space-y-3">
          {restaurant.managers.map((manager) => (
            <ManagerDetailCard
              key={manager.id}
              manager={manager}
              onManagerAction={onManagerAction}
              actionMenuOpen={actionMenuOpen}
              setActionMenuOpen={setActionMenuOpen}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No managers assigned"
          description="This restaurant doesn't have any managers yet."
          actionLabel="Add Manager"
          onAction={() => onManagerAction('add_manager')}
        />
      )}
    </div>
  );
};

// Manager Detail Card Component
const ManagerDetailCard = ({ manager, onManagerAction, actionMenuOpen, setActionMenuOpen }) => {
  const statusBadge = getManagerStatusBadge(manager.status);
  const RoleIcon = getRoleIcon(manager.role);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-r from-bottle-green to-mint-fresh rounded-2xl flex items-center justify-center text-white">
            <RoleIcon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h6 className="font-medium text-text-dark">{manager.name}</h6>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
            <p className="text-sm text-text-muted capitalize">
              {manager.role.replace('_', ' ')}
            </p>
            <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {manager.phone}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Joined {format(new Date(manager.joinDate), 'MMM yyyy')}
              </span>
              {manager.lastActive && (
                <span className="flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Active {format(new Date(manager.lastActive), 'MMM dd')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setActionMenuOpen(actionMenuOpen === manager.id ? null : manager.id)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-text-muted" />
          </button>

          {actionMenuOpen === manager.id && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg border border-gray-100 z-20 min-w-48">
              <div className="py-2">
                <button
                  onClick={() => {
                    onManagerAction('edit_permissions', { manager });
                    setActionMenuOpen(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                >
                  <Key className="w-4 h-4" />
                  Edit Permissions
                </button>
                <hr className="my-2" />
                {manager.status === 'active' ? (
                  <button
                    onClick={() => {
                      onManagerAction('deactivate_manager', { manager });
                      setActionMenuOpen(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-amber-600"
                  >
                    <UserMinus className="w-4 h-4" />
                    Deactivate
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onManagerAction('activate_manager', { manager });
                      setActionMenuOpen(null);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-mint-fresh"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Activate
                  </button>
                )}
                <button
                  onClick={() => {
                    onManagerAction('remove_manager', { manager });
                    setActionMenuOpen(null);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-tomato-red"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Manager
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Permissions View Component
const PermissionsView = ({ restaurant, onManagerAction }) => {
  const permissions = [
    { id: 'manage_menu', label: 'Manage Menu', description: 'Add, edit, and remove menu items' },
    { id: 'manage_orders', label: 'Manage Orders', description: 'View and process customer orders' },
    { id: 'manage_inventory', label: 'Manage Inventory', description: 'Update stock levels and availability' },
    { id: 'view_analytics', label: 'View Analytics', description: 'Access sales and performance reports' },
    { id: 'manage_staff', label: 'Manage Staff', description: 'Add and manage restaurant staff' },
    { id: 'manage_promotions', label: 'Manage Promotions', description: 'Create and manage promotional offers' },
    { id: 'financial_access', label: 'Financial Access', description: 'View financial data and reports' },
    { id: 'customer_service', label: 'Customer Service', description: 'Handle customer inquiries and complaints' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold text-text-dark mb-2">Permission Management</h4>
        <p className="text-text-muted">
          Manage what each manager can access and control in the restaurant.
        </p>
      </div>

      {restaurant.managers && restaurant.managers.length > 0 ? (
        <div className="space-y-4">
          {restaurant.managers.map((manager) => (
            <Card key={manager.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-bottle-green to-mint-fresh rounded-2xl flex items-center justify-center text-white">
                    <getRoleIcon(manager.role) className="w-5 h-5" />
                  </div>
                  <div>
                    <h6 className="font-medium text-text-dark">{manager.name}</h6>
                    <p className="text-sm text-text-muted capitalize">
                      {manager.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onManagerAction('edit_permissions', { manager })}
                >
                  Edit Permissions
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {permissions.map((permission) => {
                  const hasPermission = manager.permissions?.includes(permission.id);
                  return (
                    <div
                      key={permission.id}
                      className={`p-3 rounded-2xl border ${
                        hasPermission
                          ? 'border-mint-fresh/30 bg-mint-fresh/5'
                          : 'border-gray-200 bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded flex items-center justify-center ${
                          hasPermission ? 'bg-mint-fresh text-white' : 'bg-gray-300'
                        }`}>
                          {hasPermission && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-dark">
                            {permission.label}
                          </p>
                          <p className="text-xs text-text-muted">
                            {permission.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Shield}
          title="No managers to configure"
          description="Add managers first to configure their permissions."
          actionLabel="Add Manager"
          onAction={() => onManagerAction('add_manager')}
        />
      )}
    </div>
  );
};

// Manager Action Modal Component
const ManagerActionModal = ({ isOpen, onClose, type, restaurant, data, onChange, onSubmit }) => {
  if (!isOpen || !restaurant) return null;

  const modalConfig = {
    add_manager: {
      title: 'Add New Manager',
      icon: UserPlus,
    },
    edit_permissions: {
      title: 'Edit Manager Permissions',
      icon: Key,
    },
    transfer_ownership: {
      title: 'Transfer Ownership',
      icon: Crown,
    },
  };

  const config = modalConfig[type] || modalConfig.add_manager;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-secondary rounded-2xl flex items-center justify-center text-white font-bold">
            {restaurant.businessName?.[0]?.toUpperCase() || 'R'}
          </div>
          <div>
            <p className="font-medium text-text-dark">{restaurant.businessName}</p>
            <p className="text-sm text-text-muted">{restaurant.ownerName}</p>
          </div>
        </div>

        {type === 'add_manager' && (
          <AddManagerForm data={data} onChange={onChange} />
        )}

        {type === 'edit_permissions' && (
          <EditPermissionsForm data={data} onChange={onChange} />
        )}

        {type === 'transfer_ownership' && (
          <TransferOwnershipForm data={data} onChange={onChange} />
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="flex items-center gap-2">
            <config.icon className="w-4 h-4" />
            {type === 'add_manager' ? 'Add Manager' : 
             type === 'edit_permissions' ? 'Update Permissions' : 
             'Transfer Ownership'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Form Components
const AddManagerForm = ({ data, onChange }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Manager Name">
        <Input
          value={data.name || ''}
          onChange={(e) => onChange({ ...data, name: e.target.value })}
          placeholder="Enter manager name"
          required
        />
      </FormField>
      
      <FormField label="Phone Number">
        <Input
          value={data.phone || ''}
          onChange={(e) => onChange({ ...data, phone: e.target.value })}
          placeholder="+1234567890"
          required
        />
      </FormField>
    </div>

    <FormField label="Email">
      <Input
        type="email"
        value={data.email || ''}
        onChange={(e) => onChange({ ...data, email: e.target.value })}
        placeholder="manager@email.com"
        required
      />
    </FormField>

    <FormField label="Role">
      <select
        value={data.role || 'manager'}
        onChange={(e) => onChange({ ...data, role: e.target.value })}
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20"
      >
        <option value="manager">Manager</option>
        <option value="assistant_manager">Assistant Manager</option>
      </select>
    </FormField>
  </div>
);

const EditPermissionsForm = ({ data, onChange }) => {
  const permissions = [
    { id: 'manage_menu', label: 'Manage Menu' },
    { id: 'manage_orders', label: 'Manage Orders' },
    { id: 'manage_inventory', label: 'Manage Inventory' },
    { id: 'view_analytics', label: 'View Analytics' },
    { id: 'manage_staff', label: 'Manage Staff' },
    { id: 'manage_promotions', label: 'Manage Promotions' },
    { id: 'financial_access', label: 'Financial Access' },
    { id: 'customer_service', label: 'Customer Service' },
  ];

  const handlePermissionChange = (permissionId, checked) => {
    const currentPermissions = data.permissions || [];
    const newPermissions = checked
      ? [...currentPermissions, permissionId]
      : currentPermissions.filter(p => p !== permissionId);
    onChange({ ...data, permissions: newPermissions });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-2xl">
        <h5 className="font-medium text-text-dark mb-2">
          Editing permissions for: {data.manager?.name}
        </h5>
        <p className="text-sm text-text-muted">
          Select the permissions this manager should have access to.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {permissions.map((permission) => (
          <label key={permission.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={(data.permissions || []).includes(permission.id)}
              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
              className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green"
            />
            <span className="text-sm font-medium text-text-dark">
              {permission.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

const TransferOwnershipForm = ({ data, onChange }) => (
  <div className="space-y-4">
    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
      <div className="flex items-center gap-2 text-amber-800 mb-2">
        <AlertTriangle className="w-5 h-5" />
        <h5 className="font-medium">Warning: Ownership Transfer</h5>
      </div>
      <p className="text-sm text-amber-700">
        This action will permanently transfer ownership of the restaurant. The current owner will lose all admin privileges.
      </p>
    </div>

    <FormField label="New Owner Phone Number">
      <Input
        value={data.newOwnerPhone || ''}
        onChange={(e) => onChange({ ...data, newOwnerPhone: e.target.value })}
        placeholder="Enter new owner's phone number"
        required
      />
    </FormField>

    <FormField label="Transfer Reason">
      <textarea
        value={data.reason || ''}
        onChange={(e) => onChange({ ...data, reason: e.target.value })}
        placeholder="Explain why ownership is being transferred..."
        rows={3}
        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-bottle-green/20 resize-none"
        required
      />
    </FormField>
  </div>
);

// Utility functions (moved outside to avoid re-creation)
const getManagerStatusBadge = (status) => {
  const badges = {
    active: { color: 'bg-mint-fresh/10 text-mint-fresh', label: 'Active' },
    pending: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
    suspended: { color: 'bg-tomato-red/10 text-tomato-red', label: 'Suspended' },
    inactive: { color: 'bg-gray-100 text-gray-600', label: 'Inactive' },
  };
  return badges[status] || badges.pending;
};

const getRoleIcon = (role) => {
  const icons = {
    owner: Crown,
    manager: Shield,
    assistant_manager: User,
  };
  return icons[role] || User;
};

export default OwnerManagerRelations;