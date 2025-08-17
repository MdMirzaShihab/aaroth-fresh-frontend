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
import { useGetSystemHealthQuery } from '../../store/slices/apiSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import SystemHealthWidget from '../../components/admin/SystemHealthWidget';

const AdminSystemSettings = () => {
  // Local state for settings
  const [settings, setSettings] = useState({
    // Platform Settings
    siteName: 'Aaroth Fresh',
    siteDescription: 'B2B Fresh Produce Marketplace',
    supportEmail: 'support@aarothfresh.com',
    adminEmail: 'admin@aarothfresh.com',

    // Feature Toggles
    maintenanceMode: false,
    newRegistrations: true,
    vendorApprovalRequired: true,
    restaurantApprovalRequired: false,
    emailNotifications: true,
    smsNotifications: false,

    // Business Settings
    platformCommission: 5.0,
    minOrderAmount: 100.0,
    maxOrderAmount: 10000.0,
    deliveryRadius: 50,

    // Security Settings
    sessionTimeout: 24,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    twoFactorRequired: false,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Get system health for monitoring
  const { refetch: refetchHealth } = useGetSystemHealthQuery();

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call an API endpoint
      // await saveSystemSettings(settings);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSaved(new Date());
      // Show success toast or notification here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error toast here
    } finally {
      setIsSaving(false);
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
    const value = settings[field.key];

    if (field.type === 'toggle') {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-text-dark dark:text-white">
              {field.label}
              {field.warning && (
                <AlertTriangle className="inline w-4 h-4 ml-1 text-amber-500" />
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
        <Input
          type={field.type}
          value={value}
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
          className="w-full"
        />
      </FormField>
    );
  };

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
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
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
                onClick={() => {
                  // Handle cache clear
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Clear Cache
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
