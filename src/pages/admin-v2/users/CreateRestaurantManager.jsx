/**
 * CreateRestaurantManager - Restaurant Manager Creation Form
 * Features: Owner assignment, permission levels, restaurant selection
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Users,
  Shield,
  Store,
  Check,
  Search,
  ChevronDown,
  Building,
  Phone,
  Mail,
  UserPlus
} from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { Card } from '../../../components/ui';
import { Button } from '../../../components/ui';
import { Input } from '../../../components/ui';
import { Modal } from '../../../components/ui/Modal';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { useCreateRestaurantManagerMutation } from '../../../services/admin-v2/usersService';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

// Permission checkbox component
const PermissionCheckbox = ({ permission, checked, onChange, description }) => {
  const { isDarkMode } = useTheme();

  return (
    <label className={`
      flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors
      ${checked ? 
        `${isDarkMode ? 'bg-sage-green/10 border-sage-green/30' : 'bg-muted-olive/10 border-muted-olive/30'} border` : 
        `${isDarkMode ? 'hover:bg-dark-surface' : 'hover:bg-gray-50'}`
      }
    `}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(permission.id, e.target.checked)}
        className="mt-1 rounded border-gray-300 text-muted-olive focus:ring-muted-olive"
      />
      <div className="flex-1">
        <div className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
          {permission.name}
        </div>
        <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
          {permission.description}
        </div>
      </div>
    </label>
  );
};

// Restaurant owner selector
const OwnerSelector = ({ selectedOwner, onOwnerSelect, owners, loading }) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOwners = owners?.filter(owner =>
    owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    owner.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="relative">
      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
        Restaurant Owner *
      </label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 text-left border rounded-lg flex items-center justify-between transition-colors
          ${isDarkMode 
            ? 'bg-dark-surface border-dark-border text-dark-text-primary hover:bg-dark-sage-accent/10' 
            : 'bg-white border-gray-300 text-text-dark hover:bg-gray-50'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {selectedOwner ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-earthy-brown via-dusty-cedar to-earthy-tan flex items-center justify-center text-white font-medium text-sm">
                {selectedOwner.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{selectedOwner.name}</div>
                {selectedOwner.businessName && (
                  <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                    {selectedOwner.businessName}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className={isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}>
              Select a restaurant owner...
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className={`
            absolute top-full left-0 right-0 mt-1 z-20 border rounded-lg shadow-xl max-h-60 overflow-hidden
            ${isDarkMode ? 'bg-dark-surface border-dark-border' : 'bg-white border-gray-300'}
          `}>
            {/* Search */}
            <div className="p-3 border-b border-gray-200 dark:border-dark-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`
                    w-full pl-10 pr-4 py-2 text-sm border rounded-lg
                    ${isDarkMode 
                      ? 'bg-dark-bg border-dark-border text-dark-text-primary placeholder-dark-text-muted' 
                      : 'bg-gray-50 border-gray-300 text-text-dark placeholder-text-muted'
                    }
                  `}
                />
              </div>
            </div>

            {/* Options */}
            <div className="max-h-40 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : filteredOwners.length === 0 ? (
                <div className={`p-4 text-center text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                  No restaurant owners found
                </div>
              ) : (
                filteredOwners.map((owner) => (
                  <button
                    key={owner.id}
                    type="button"
                    onClick={() => {
                      onOwnerSelect(owner);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`
                      w-full px-4 py-3 text-left flex items-center gap-3 transition-colors
                      ${isDarkMode ? 'hover:bg-dark-sage-accent/10 text-dark-text-primary' : 'hover:bg-gray-50 text-text-dark'}
                    `}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-earthy-brown via-dusty-cedar to-earthy-tan flex items-center justify-center text-white font-medium text-sm">
                      {owner.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{owner.name}</div>
                      {owner.businessName && (
                        <div className={`text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                          {owner.businessName}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const CreateRestaurantManager = ({ isOpen, onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [createManager, { isLoading }] = useCreateRestaurantManagerMutation();
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      restaurantId: '',
      permissions: [],
      accessLevel: 'standard'
    }
  });

  // Mock restaurant owners data - replace with real API call
  const mockOwners = [
    { 
      id: '1', 
      name: 'John Smith', 
      businessName: 'Smith\'s Bistro',
      email: 'john@smithsbistro.com',
      restaurantCount: 2
    },
    { 
      id: '2', 
      name: 'Maria Garcia', 
      businessName: 'Garcia Family Restaurant',
      email: 'maria@garciarestaurant.com',
      restaurantCount: 1
    },
    { 
      id: '3', 
      name: 'David Chen', 
      businessName: 'Chen\'s Kitchen',
      email: 'david@chenskitchen.com',
      restaurantCount: 3
    }
  ];

  // Available permissions
  const availablePermissions = [
    {
      id: 'view_orders',
      name: 'View Orders',
      description: 'Can view restaurant orders and order history'
    },
    {
      id: 'manage_orders',
      name: 'Manage Orders',
      description: 'Can update order status and process orders'
    },
    {
      id: 'view_menu',
      name: 'View Menu',
      description: 'Can view restaurant menu and items'
    },
    {
      id: 'manage_menu',
      name: 'Manage Menu',
      description: 'Can add, edit, and remove menu items'
    },
    {
      id: 'view_analytics',
      name: 'View Analytics',
      description: 'Can access restaurant analytics and reports'
    },
    {
      id: 'manage_staff',
      name: 'Manage Staff',
      description: 'Can manage restaurant staff and their permissions'
    },
    {
      id: 'financial_access',
      name: 'Financial Access',
      description: 'Can view financial reports and payment information'
    }
  ];

  // Handle permission change
  const handlePermissionChange = useCallback((permissionId, checked) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permissionId]: checked
    }));
  }, []);

  // Handle owner selection
  const handleOwnerSelect = useCallback((owner) => {
    setSelectedOwner(owner);
    setValue('restaurantId', owner.id);
  }, [setValue]);

  // Handle form submission
  const onSubmit = useCallback(async (data) => {
    if (!selectedOwner) {
      toast.error('Please select a restaurant owner');
      return;
    }

    const permissions = Object.keys(selectedPermissions).filter(key => selectedPermissions[key]);
    
    if (permissions.length === 0) {
      toast.error('Please select at least one permission');
      return;
    }

    try {
      const managerData = {
        ...data,
        permissions,
        ownerId: selectedOwner.id
      };

      await createManager(managerData).unwrap();
      toast.success('Restaurant manager created successfully');
      
      // Reset form
      reset();
      setSelectedOwner(null);
      setSelectedPermissions({});
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create restaurant manager');
    }
  }, [selectedOwner, selectedPermissions, createManager, reset, onSuccess]);

  // Handle modal close
  const handleClose = useCallback(() => {
    reset();
    setSelectedOwner(null);
    setSelectedPermissions({});
    onClose();
  }, [reset, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-muted-olive via-sage-green to-dusty-cedar flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            Create Restaurant Manager
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
            Add a new manager to an existing restaurant
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Manager Information */}
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              <User className="w-5 h-5" />
              Manager Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  Full Name *
                </label>
                <Input
                  {...register('name', { required: 'Full name is required' })}
                  placeholder="Enter manager's full name"
                  error={errors.name?.message}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  Email Address *
                </label>
                <Input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format'
                    }
                  })}
                  placeholder="manager@restaurant.com"
                  error={errors.email?.message}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  placeholder="+1 (555) 123-4567"
                  error={errors.phone?.message}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                  Access Level
                </label>
                <select
                  {...register('accessLevel')}
                  className={`
                    w-full px-3 py-2 border rounded-lg transition-colors
                    ${isDarkMode 
                      ? 'bg-dark-surface border-dark-border text-dark-text-primary' 
                      : 'bg-white border-gray-300 text-text-dark'
                    }
                  `}
                >
                  <option value="standard">Standard Manager</option>
                  <option value="senior">Senior Manager</option>
                  <option value="limited">Limited Access</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Restaurant Owner Assignment */}
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              <Building className="w-5 h-5" />
              Restaurant Assignment
            </h3>
            
            <OwnerSelector
              selectedOwner={selectedOwner}
              onOwnerSelect={handleOwnerSelect}
              owners={mockOwners}
              loading={false}
            />

            {selectedOwner && (
              <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-dark-surface' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-earthy-brown via-dusty-cedar to-earthy-tan flex items-center justify-center text-white font-bold text-lg">
                    {selectedOwner.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={`font-medium ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
                      {selectedOwner.name}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
                      {selectedOwner.businessName} • {selectedOwner.restaurantCount} restaurant{selectedOwner.restaurantCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Permissions */}
          <Card className="p-6">
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              <Shield className="w-5 h-5" />
              Permissions & Access Control
            </h3>
            
            <div className="space-y-2">
              {availablePermissions.map((permission) => (
                <PermissionCheckbox
                  key={permission.id}
                  permission={permission}
                  checked={selectedPermissions[permission.id] || false}
                  onChange={handlePermissionChange}
                  description={permission.description}
                />
              ))}
            </div>

            <div className={`mt-4 p-3 rounded-lg text-sm ${isDarkMode ? 'bg-dark-surface text-dark-text-muted' : 'bg-blue-50 text-blue-800'}`}>
              💡 <strong>Note:</strong> Permissions can be modified later by the restaurant owner or system administrators.
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !selectedOwner}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Create Manager
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateRestaurantManager;