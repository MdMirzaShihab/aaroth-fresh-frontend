import React, { useState } from 'react';
import {
  Settings,
  Server,
  Shield,
  Bell,
  Mail,
  Globe,
  Database,
  Activity,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  DollarSign,
} from 'lucide-react';
import { 
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useCreateSettingMutation,
  useBulkUpdateSettingsMutation,
  useResetSystemSettingsMutation,
  useClearAnalyticsCacheMutation,
  useGetSystemHealthQuery 
} from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import SystemHealthWidget from '../../components/admin/SystemHealthWidget';

const AdminSystemSettings = () => {
  const [selectedCategory, setSelectedCategory] = useState('platform');
  const [editingSettings, setEditingSettings] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // API hooks
  const { 
    data: settingsData, 
    isLoading, 
    error, 
    refetch: refetchSettings 
  } = useGetSystemSettingsQuery();
  
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSystemSettingMutation();
  const [createSetting, { isLoading: isCreating }] = useCreateSettingMutation();
  const [bulkUpdateSettings, { isLoading: isBulkUpdating }] = useBulkUpdateSettingsMutation();
  const [resetSettings, { isLoading: isResetting }] = useResetSystemSettingsMutation();
  const [clearCache, { isLoading: isClearingCache }] = useClearAnalyticsCacheMutation();
  const { refetch: refetchHealth } = useGetSystemHealthQuery();

  // Parse settings data from API
  const settings = settingsData?.data || {};
  const isSaving = isUpdating || isCreating || isBulkUpdating;

  const handleSettingChange = (key, value) => {
    setEditingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSetting = async (key, value) => {
    try {
      await updateSetting({ 
        key, 
        value, 
        changeReason: `Updated ${key} setting from admin panel` 
      }).unwrap();
      setLastSaved(new Date());
      refetchSettings();
    } catch (error) {
      console.error('Failed to save setting:', error);
    }
  };

  const handleBulkSaveSettings = async () => {
    try {
      await bulkUpdateSettings(editingSettings).unwrap();
      setLastSaved(new Date());
      setEditingSettings({});
      refetchSettings();
    } catch (error) {
      console.error('Failed to bulk save settings:', error);
    }
  };

  const handleResetSettings = async () => {
    try {
      await resetSettings().unwrap();
      setLastSaved(new Date());
      setEditingSettings({});
      refetchSettings();
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await clearCache().unwrap();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const settingSections = [
    {
      id: 'platform',
      title: 'Platform Settings',
      icon: Globe,
      description: 'General platform configuration',
      fields: [
        {
          key: 'siteName',
          label: 'Site Name',
          type: 'text',
          description: 'The name of your platform',
        },
        {
          key: 'siteDescription',
          label: 'Site Description',
          type: 'text',
          description: 'Brief description of your platform',
        },
        {
          key: 'supportEmail',
          label: 'Support Email',
          type: 'email',
          description: 'Email for customer support',
        },
        {
          key: 'adminEmail',
          label: 'Admin Email',
          type: 'email',
          description: 'Email for administrative notifications',
        },
      ],
    },
    {
      id: 'features',
      title: 'Feature Toggles',
      icon: Zap,
      description: 'Enable or disable platform features',
      fields: [
        {
          key: 'maintenanceMode',
          label: 'Maintenance Mode',
          type: 'toggle',
          description: 'Put the platform in maintenance mode',
          warning: true,
        },
        {
          key: 'newRegistrations',
          label: 'Allow New Registrations',
          type: 'toggle',
          description: 'Allow new users to register',
        },
        {
          key: 'vendorApprovalRequired',
          label: 'Vendor Approval Required',
          type: 'toggle',
          description: 'Require admin approval for new vendors',
        },
        {
          key: 'restaurantApprovalRequired',
          label: 'Restaurant Approval Required',
          type: 'toggle',
          description: 'Require admin approval for new restaurants',
        },
        {
          key: 'emailNotifications',
          label: 'Email Notifications',
          type: 'toggle',
          description: 'Send email notifications to users',
        },
        {
          key: 'smsNotifications',
          label: 'SMS Notifications',
          type: 'toggle',
          description: 'Send SMS notifications to users',
        },
      ],
    },
    {
      id: 'business',
      title: 'Business Rules',
      icon: DollarSign,
      description: 'Configure business logic and limits',
      fields: [
        {
          key: 'platformCommission',
          label: 'Platform Commission (%)',
          type: 'number',
          description: 'Commission percentage taken from each order',
          min: 0,
          max: 50,
          step: 0.1,
        },
        {
          key: 'minOrderAmount',
          label: 'Minimum Order Amount ($)',
          type: 'number',
          description: 'Minimum order value required',
          min: 0,
          step: 0.01,
        },
        {
          key: 'maxOrderAmount',
          label: 'Maximum Order Amount ($)',
          type: 'number',
          description: 'Maximum order value allowed',
          min: 0,
          step: 0.01,
        },
        {
          key: 'deliveryRadius',
          label: 'Delivery Radius (km)',
          type: 'number',
          description: 'Maximum delivery distance',
          min: 1,
          max: 200,
        },
      ],
    },
    {
      id: 'security',
      title: 'Security Settings',
      icon: Shield,
      description: 'Configure security and authentication',
      fields: [
        {
          key: 'sessionTimeout',
          label: 'Session Timeout (hours)',
          type: 'number',
          description: 'How long user sessions remain active',
          min: 1,
          max: 72,
        },
        {
          key: 'maxLoginAttempts',
          label: 'Max Login Attempts',
          type: 'number',
          description: 'Maximum failed login attempts before lockout',
          min: 3,
          max: 10,
        },
        {
          key: 'passwordMinLength',
          label: 'Minimum Password Length',
          type: 'number',
          description: 'Minimum number of characters for passwords',
          min: 6,
          max: 20,
        },
        {
          key: 'twoFactorRequired',
          label: 'Require Two-Factor Authentication',
          type: 'toggle',
          description: 'Require 2FA for all admin accounts',
        },
      ],
    },
  ];

  const renderField = (field) => {
    const currentValue = settings[field.key];
    const editedValue = editingSettings[field.key];
    const value = editedValue !== undefined ? editedValue : currentValue;
    const hasChanges = editedValue !== undefined && editedValue !== currentValue;

    if (field.type === 'toggle') {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-dark dark:text-white">
              {field.label}
              {field.warning && (
                <AlertTriangle className="inline w-4 h-4 ml-1 text-amber-500" />
              )}
              {hasChanges && (
                <span className="inline-block w-2 h-2 bg-amber-500 rounded-full ml-2"></span>
              )}
            </label>
            <p className="text-xs text-text-muted mt-1">{field.description}</p>
          </div>
          <div className="ml-4">
            <button
              onClick={() => handleSettingChange(field.key, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-bottle-green focus:ring-offset-2 ${
                value ? 'bg-bottle-green' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      );
    }

    return (
      <FormField label={field.label} description={field.description}>
        <div className="flex items-center gap-2">
          <Input
            type={field.type}
            value={value || ''}
            onChange={(e) => {
              const newValue =
                field.type === 'number'
                  ? parseFloat(e.target.value) || 0
                  : e.target.value;
              handleSettingChange(field.key, newValue);
            }}
            min={field.min}
            max={field.max}
            step={field.step}
            className={`flex-1 ${hasChanges ? 'border-amber-500' : ''}`}
          />
          {hasChanges && (
            <Button
              size="sm"
              onClick={() => handleSaveSetting(field.key, value)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </FormField>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[50vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load system settings"
          description="There was an error loading system settings. Please try again."
          actionLabel="Retry"
          onAction={refetchSettings}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-dark dark:text-white">
            System Settings
          </h1>
          <p className="text-text-muted mt-1">
            Configure platform settings, features, and security
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={refetchHealth}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
          {Object.keys(editingSettings).length > 0 && (
            <Button
              onClick={handleBulkSaveSettings}
              disabled={isBulkUpdating}
              className="flex items-center gap-2"
            >
              {isBulkUpdating ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isBulkUpdating ? 'Saving...' : `Save ${Object.keys(editingSettings).length} Changes`}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleResetSettings}
            disabled={isResetting}
            className="flex items-center gap-2 text-amber-600 border-amber-600 hover:bg-amber-50"
          >
            {isResetting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {isResetting ? 'Resetting...' : 'Reset to Defaults'}
          </Button>
        </div>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <div className="flex items-center gap-2 text-sm text-bottle-green">
          <CheckCircle className="w-4 h-4" />
          Settings saved at {lastSaved.toLocaleTimeString()}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {settingSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Card key={section.id} className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-bottle-green/10 rounded-full flex items-center justify-center">
                    <SectionIcon className="w-5 h-5 text-bottle-green" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-text-muted">
                      {section.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {section.fields.map((field) => (
                    <div key={field.key}>{renderField(field)}</div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>

        {/* System Health & Monitoring */}
        <div className="space-y-6">
          <SystemHealthWidget />

          {/* Quick Info */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-5 h-5 text-bottle-green" />
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                System Information
              </h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-muted">Platform Version:</span>
                <span className="font-medium text-text-dark dark:text-white">
                  1.0.0
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Environment:</span>
                <span className="font-medium text-text-dark dark:text-white">
                  Production
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Last Deployment:</span>
                <span className="font-medium text-text-dark dark:text-white">
                  2024-01-15
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Active Users:</span>
                <span className="font-medium text-text-dark dark:text-white">
                  1,234
                </span>
              </div>
            </div>
          </Card>

          {/* Maintenance Actions */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-5 h-5 text-bottle-green" />
              <h3 className="text-lg font-semibold text-text-dark dark:text-white">
                Maintenance
              </h3>
            </div>

            <div className="space-y-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleClearCache}
                disabled={isClearingCache}
              >
                {isClearingCache ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {isClearingCache ? 'Clearing...' : 'Clear Cache'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  // Handle database cleanup
                }}
              >
                <Database className="w-4 h-4 mr-2" />
                Database Cleanup
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-amber-600 border-amber-600 hover:bg-amber-50"
                onClick={() => {
                  // Handle system restart
                }}
              >
                <Activity className="w-4 h-4 mr-2" />
                Restart Services
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemSettings;
