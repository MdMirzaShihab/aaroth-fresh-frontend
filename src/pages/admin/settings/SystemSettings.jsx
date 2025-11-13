/**
 * SystemSettings - Comprehensive System Settings Management
 * Features: Category-based interface, type-aware editors, settings history, bulk operations
 * Provides professional system configuration with audit trail and rollback capabilities
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Globe,
  DollarSign,
  Bell,
  Shield,
  CreditCard,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  History,
  Upload,
  Download,
  Eye,
  EyeOff,
  Info,
  Zap,
  Server,
  Database,
  Activity,
  Users,
  Lock,
  Unlock,
  Palette,
  Mail,
  MessageSquare,
  Phone,
  Key,
  Timer,
  AlertCircle,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTheme } from '../../../hooks/useTheme';
import { Card, Button, LoadingSpinner } from '../../../components/ui';
import useAccessibility from '../../../hooks/useAccessibility';
import useMobileOptimization from '../../../hooks/useMobileOptimization';
import {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingMutation,
  useBulkUpdateSettingsMutation,
  useResetSystemSettingsMutation,
  useGetSettingHistoryQuery,
} from '../../../store/slices/admin/adminApiSlice';
import SettingsCategories from './components/SettingsCategories';
import SettingEditor from './components/SettingEditor';
import SettingsHistory from './components/SettingsHistory';
import BulkSettings from './components/BulkSettings';

// Settings category configuration
const SETTINGS_CATEGORIES = [
  {
    key: 'general',
    label: 'General Configuration',
    icon: Globe,
    color: 'sage-green',
    description: 'App name, descriptions, file limits, branding',
    settings: [
      {
        key: 'siteName',
        label: 'Site Name',
        type: 'string',
        category: 'general',
        description: 'The name displayed across the platform',
        validation: { required: true, minLength: 3, maxLength: 50 },
        defaultValue: 'Aaroth Fresh',
      },
      {
        key: 'siteDescription',
        label: 'Site Description',
        type: 'string',
        category: 'general',
        description: 'Brief description shown in search results and metadata',
        validation: { maxLength: 200 },
        defaultValue:
          'Fresh produce marketplace connecting local vendors with restaurants',
      },
      {
        key: 'supportEmail',
        label: 'Support Email',
        type: 'email',
        category: 'general',
        description: 'Primary email address for customer support',
        validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        defaultValue: 'support@aarothfresh.com',
      },
      {
        key: 'maxFileSize',
        label: 'Maximum File Size (MB)',
        type: 'number',
        category: 'general',
        description: 'Maximum file size for uploads in megabytes',
        validation: { min: 1, max: 100 },
        defaultValue: 10,
      },
      {
        key: 'allowedFileTypes',
        label: 'Allowed File Types',
        type: 'multiselect',
        category: 'general',
        description: 'File types allowed for uploads',
        options: [
          { value: 'jpg', label: 'JPEG Images' },
          { value: 'png', label: 'PNG Images' },
          { value: 'pdf', label: 'PDF Documents' },
          { value: 'doc', label: 'Word Documents' },
          { value: 'xls', label: 'Excel Spreadsheets' },
        ],
        defaultValue: ['jpg', 'png', 'pdf'],
      },
      {
        key: 'maintenanceMode',
        label: 'Maintenance Mode',
        type: 'boolean',
        category: 'general',
        description: 'Put the platform in maintenance mode',
        warning: true,
        defaultValue: false,
      },
    ],
  },
  {
    key: 'business',
    label: 'Business Rules',
    icon: DollarSign,
    color: 'sage-green',
    description:
      'Commission rates, order limits, processing fees, business logic',
    settings: [
      {
        key: 'platformCommission',
        label: 'Platform Commission (%)',
        type: 'number',
        category: 'business',
        description: 'Commission percentage taken from each transaction',
        validation: { min: 0, max: 50, step: 0.1 },
        defaultValue: 8.5,
      },
      {
        key: 'minOrderAmount',
        label: 'Minimum Order Amount ($)',
        type: 'number',
        category: 'business',
        description: 'Minimum order value required for checkout',
        validation: { min: 0, step: 0.01 },
        defaultValue: 25.0,
      },
      {
        key: 'maxOrderAmount',
        label: 'Maximum Order Amount ($)',
        type: 'number',
        category: 'business',
        description: 'Maximum single order value allowed',
        validation: { min: 0, step: 0.01 },
        defaultValue: 5000.0,
      },
      {
        key: 'processingFee',
        label: 'Processing Fee ($)',
        type: 'number',
        category: 'business',
        description: 'Fixed processing fee per transaction',
        validation: { min: 0, step: 0.01 },
        defaultValue: 2.5,
      },
      {
        key: 'deliveryRadius',
        label: 'Maximum Delivery Radius (km)',
        type: 'number',
        category: 'business',
        description: 'Maximum delivery distance for orders',
        validation: { min: 1, max: 200 },
        defaultValue: 50,
      },
      {
        key: 'autoApprovalThreshold',
        label: 'Auto-Approval Threshold ($)',
        type: 'number',
        category: 'business',
        description: 'Orders below this amount are auto-approved',
        validation: { min: 0, step: 0.01 },
        defaultValue: 100.0,
      },
    ],
  },
  {
    key: 'notifications',
    label: 'Notification Settings',
    icon: Bell,
    color: 'earthy-yellow',
    description: 'Email, SMS, push notification configurations',
    settings: [
      {
        key: 'emailNotificationsEnabled',
        label: 'Enable Email Notifications',
        type: 'boolean',
        category: 'notifications',
        description: 'Send email notifications to users',
        defaultValue: true,
      },
      {
        key: 'smsNotificationsEnabled',
        label: 'Enable SMS Notifications',
        type: 'boolean',
        category: 'notifications',
        description: 'Send SMS notifications for critical events',
        defaultValue: false,
      },
      {
        key: 'pushNotificationsEnabled',
        label: 'Enable Push Notifications',
        type: 'boolean',
        category: 'notifications',
        description: 'Send browser push notifications',
        defaultValue: true,
      },
      {
        key: 'notificationFrequency',
        label: 'Notification Frequency',
        type: 'select',
        category: 'notifications',
        description: 'How often to send digest notifications',
        options: [
          { value: 'immediate', label: 'Immediate' },
          { value: 'hourly', label: 'Hourly Digest' },
          { value: 'daily', label: 'Daily Digest' },
          { value: 'weekly', label: 'Weekly Digest' },
        ],
        defaultValue: 'daily',
      },
      {
        key: 'emailFromAddress',
        label: 'Email From Address',
        type: 'email',
        category: 'notifications',
        description: 'Email address shown as sender',
        validation: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        defaultValue: 'noreply@aarothfresh.com',
      },
      {
        key: 'smsProvider',
        label: 'SMS Provider',
        type: 'select',
        category: 'notifications',
        description: 'SMS service provider configuration',
        options: [
          { value: 'twilio', label: 'Twilio' },
          { value: 'aws-sns', label: 'Amazon SNS' },
          { value: 'nexmo', label: 'Nexmo' },
        ],
        defaultValue: 'twilio',
      },
    ],
  },
  {
    key: 'security',
    label: 'Security Policies',
    icon: Shield,
    color: 'dusty-cedar',
    description: 'Session timeout, password policies, access controls',
    settings: [
      {
        key: 'sessionTimeout',
        label: 'Session Timeout (hours)',
        type: 'number',
        category: 'security',
        description: 'How long user sessions remain active',
        validation: { min: 1, max: 72 },
        defaultValue: 8,
      },
      {
        key: 'maxLoginAttempts',
        label: 'Maximum Login Attempts',
        type: 'number',
        category: 'security',
        description: 'Failed login attempts before account lockout',
        validation: { min: 3, max: 10 },
        defaultValue: 5,
      },
      {
        key: 'passwordMinLength',
        label: 'Minimum Password Length',
        type: 'number',
        category: 'security',
        description: 'Minimum number of characters for passwords',
        validation: { min: 6, max: 20 },
        defaultValue: 8,
      },
      {
        key: 'passwordRequireUppercase',
        label: 'Require Uppercase Characters',
        type: 'boolean',
        category: 'security',
        description: 'Passwords must contain uppercase letters',
        defaultValue: true,
      },
      {
        key: 'passwordRequireNumbers',
        label: 'Require Numbers',
        type: 'boolean',
        category: 'security',
        description: 'Passwords must contain numeric characters',
        defaultValue: true,
      },
      {
        key: 'passwordRequireSymbols',
        label: 'Require Special Characters',
        type: 'boolean',
        category: 'security',
        description: 'Passwords must contain special symbols',
        defaultValue: false,
      },
      {
        key: 'twoFactorRequired',
        label: 'Require Two-Factor Authentication',
        type: 'boolean',
        category: 'security',
        description: 'Enforce 2FA for admin accounts',
        defaultValue: false,
      },
      {
        key: 'ipWhitelistEnabled',
        label: 'Enable IP Whitelist',
        type: 'boolean',
        category: 'security',
        description: 'Restrict access to whitelisted IP addresses',
        defaultValue: false,
      },
    ],
  },
  {
    key: 'payment',
    label: 'Payment Configuration',
    icon: CreditCard,
    color: 'muted-olive',
    description: 'Payment methods, processing timeouts, gateway settings',
    settings: [
      {
        key: 'paymentGateway',
        label: 'Primary Payment Gateway',
        type: 'select',
        category: 'payment',
        description: 'Main payment processing provider',
        options: [
          { value: 'stripe', label: 'Stripe' },
          { value: 'paypal', label: 'PayPal' },
          { value: 'square', label: 'Square' },
          { value: 'razorpay', label: 'Razorpay' },
        ],
        defaultValue: 'stripe',
      },
      {
        key: 'acceptCreditCards',
        label: 'Accept Credit Cards',
        type: 'boolean',
        category: 'payment',
        description: 'Enable credit card payments',
        defaultValue: true,
      },
      {
        key: 'acceptDigitalWallets',
        label: 'Accept Digital Wallets',
        type: 'boolean',
        category: 'payment',
        description: 'Enable digital wallet payments (Apple Pay, Google Pay)',
        defaultValue: true,
      },
      {
        key: 'acceptBankTransfer',
        label: 'Accept Bank Transfers',
        type: 'boolean',
        category: 'payment',
        description: 'Enable direct bank transfer payments',
        defaultValue: false,
      },
      {
        key: 'paymentTimeout',
        label: 'Payment Timeout (minutes)',
        type: 'number',
        category: 'payment',
        description: 'Time limit for payment processing',
        validation: { min: 5, max: 60 },
        defaultValue: 15,
      },
      {
        key: 'refundWindow',
        label: 'Refund Window (days)',
        type: 'number',
        category: 'payment',
        description: 'Days allowed for refund requests',
        validation: { min: 1, max: 90 },
        defaultValue: 30,
      },
      {
        key: 'paymentCurrency',
        label: 'Default Currency',
        type: 'select',
        category: 'payment',
        description: 'Primary currency for transactions',
        options: [
          { value: 'USD', label: 'US Dollar (USD)' },
          { value: 'EUR', label: 'Euro (EUR)' },
          { value: 'GBP', label: 'British Pound (GBP)' },
          { value: 'CAD', label: 'Canadian Dollar (CAD)' },
        ],
        defaultValue: 'USD',
      },
    ],
  },
];

const SystemSettings = () => {
  const { isDarkMode } = useTheme();
  const [activeCategory, setActiveCategory] = useState('general');
  const [showHistory, setShowHistory] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [editingSettings, setEditingSettings] = useState({});
  const [lastSaved, setLastSaved] = useState(null);

  // Accessibility and mobile optimization hooks
  const {
    containerRef,
    announce,
    announceLoading,
    announceSuccess,
    announceError,
    getFocusClasses,
    getAriaProps,
    handleKeyDown,
  } = useAccessibility({
    focus: { trapFocus: false, restoreOnUnmount: false },
    keyboard: {
      onEscape: () => {
        if (showHistory) setShowHistory(false);
        if (showBulkOperations) setShowBulkOperations(false);
      },
    },
  });

  const { isMobile, optimizeTouchTargets } = useMobileOptimization();

  // API hooks
  const {
    data: settingsData,
    isLoading,
    error,
    refetch: refetchSettings,
  } = useGetSystemSettingsQuery();

  const [updateSetting, { isLoading: isUpdatingSetting }] =
    useUpdateSystemSettingMutation();
  const [bulkUpdateSettings, { isLoading: isBulkUpdating }] =
    useBulkUpdateSettingsMutation();
  const [resetSetting, { isLoading: isResetting }] =
    useResetSystemSettingsMutation();

  // Process settings data
  const currentSettings = useMemo(() => {
    return settingsData?.data || {};
  }, [settingsData]);

  // Get current category configuration
  const currentCategory = useMemo(() => {
    return SETTINGS_CATEGORIES.find((cat) => cat.key === activeCategory);
  }, [activeCategory]);

  // Get category settings with current values
  const categorySettings = useMemo(() => {
    if (!currentCategory) return [];

    return currentCategory.settings.map((setting) => ({
      ...setting,
      currentValue: currentSettings[setting.key] ?? setting.defaultValue,
      editedValue: editingSettings[setting.key],
      isDirty:
        editingSettings[setting.key] !== undefined &&
        editingSettings[setting.key] !==
          (currentSettings[setting.key] ?? setting.defaultValue),
    }));
  }, [currentCategory, currentSettings, editingSettings]);

  // Handle setting value changes
  const handleSettingChange = useCallback((key, value) => {
    setEditingSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Save individual setting
  const handleSaveSetting = useCallback(
    async (key, value) => {
      try {
        announceLoading(`Saving ${key} setting`);

        await updateSetting({
          key,
          value,
          changeReason: `Updated ${key} from admin settings panel`,
        }).unwrap();

        setEditingSettings((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        setLastSaved(new Date());
        announceSuccess(`${key} setting updated successfully`);
        toast.success(`${key} updated successfully`);
        refetchSettings();
      } catch (error) {
        console.error('Failed to save setting:', error);
        announceError(
          `Failed to update ${key}: ${error.message || 'Unknown error'}`
        );
        toast.error(
          `Failed to update ${key}: ${error.message || 'Unknown error'}`
        );
      }
    },
    [
      updateSetting,
      refetchSettings,
      announceLoading,
      announceSuccess,
      announceError,
    ]
  );

  // Save all edited settings
  const handleSaveAllSettings = useCallback(async () => {
    if (Object.keys(editingSettings).length === 0) {
      announceError('No changes to save');
      toast.error('No changes to save');
      return;
    }

    try {
      announceLoading(`Saving ${Object.keys(editingSettings).length} settings`);

      await bulkUpdateSettings({
        settings: editingSettings,
        changeReason: `Bulk update from admin settings panel - ${activeCategory} category`,
      }).unwrap();

      setEditingSettings({});
      setLastSaved(new Date());
      announceSuccess(
        `${Object.keys(editingSettings).length} settings updated successfully`
      );
      toast.success(
        `${Object.keys(editingSettings).length} settings updated successfully`
      );
      refetchSettings();
    } catch (error) {
      console.error('Failed to bulk save settings:', error);
      announceError(
        `Failed to save settings: ${error.message || 'Unknown error'}`
      );
      toast.error(
        `Failed to save settings: ${error.message || 'Unknown error'}`
      );
    }
  }, [
    editingSettings,
    bulkUpdateSettings,
    refetchSettings,
    activeCategory,
    announceLoading,
    announceSuccess,
    announceError,
  ]);

  // Reset setting to default
  const handleResetSetting = useCallback(
    async (key) => {
      try {
        await resetSetting({
          keys: [key],
          reason: `Reset ${key} to default value from admin panel`,
        }).unwrap();

        setEditingSettings((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });

        setLastSaved(new Date());
        toast.success(`${key} reset to default value`);
        refetchSettings();
      } catch (error) {
        console.error('Failed to reset setting:', error);
        toast.error(
          `Failed to reset ${key}: ${error.message || 'Unknown error'}`
        );
      }
    },
    [resetSetting, refetchSettings]
  );

  // Discard changes
  const handleDiscardChanges = useCallback(() => {
    setEditingSettings({});
    toast.success('Changes discarded');
  }, []);

  // Calculate dirty settings count
  const dirtySettingsCount = useMemo(() => {
    return Object.keys(editingSettings).length;
  }, [editingSettings]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p
            className={`mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            Loading system settings...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card className="p-8 max-w-md mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-tomato-red mx-auto mb-4" />
          <h3
            className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}
          >
            Failed to Load Settings
          </h3>
          <p
            className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            There was an error loading system settings. Please try again.
          </p>
          <Button onClick={refetchSettings} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="space-y-6"
      {...getAriaProps({
        role: 'main',
        labelledby: 'settings-heading',
        describedby: 'settings-description',
      })}
    >
      {/* Skip Links for Accessibility */}
      <a
        href="#settings-content"
        className="skip-link"
        onFocus={() => announce('Skip to settings content link focused')}
      >
        Skip to Settings Content
      </a>

      {/* Header with enhanced accessibility */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            id="settings-heading"
            className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-text-dark'} focus-visible-ring`}
            tabIndex={-1}
          >
            System Settings
          </h1>
          <p
            id="settings-description"
            className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
          >
            Configure platform settings, business rules, and system behavior
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowHistory(!showHistory);
              announce(
                showHistory
                  ? 'Settings history closed'
                  : 'Settings history opened'
              );
            }}
            className={`button-accessible ${getFocusClasses()}`}
            {...getAriaProps({
              expanded: showHistory,
              controls: 'settings-history',
              label: `${showHistory ? 'Hide' : 'Show'} settings history`,
            })}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowBulkOperations(!showBulkOperations);
              announce(
                showBulkOperations
                  ? 'Bulk operations panel closed'
                  : 'Bulk operations panel opened'
              );
            }}
            className={`button-accessible ${getFocusClasses()}`}
            {...getAriaProps({
              expanded: showBulkOperations,
              controls: 'bulk-operations',
              label: `${showBulkOperations ? 'Hide' : 'Show'} bulk operations panel`,
            })}
          >
            <Database className="w-4 h-4 mr-2" />
            Bulk Operations
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={refetchSettings}
            className="min-h-[36px]"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 p-3 rounded-xl ${
            isDarkMode
              ? 'bg-sage-green/10 border border-sage-green/20'
              : 'bg-sage-green/5 border border-sage-green/20'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-sage-green" />
          <span
            className={`text-sm ${isDarkMode ? 'text-sage-green' : 'text-muted-olive'}`}
          >
            Settings saved at {lastSaved.toLocaleTimeString()}
          </span>
        </motion.div>
      )}

      {/* Settings Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Navigation */}
        <div className="lg:col-span-1">
          <SettingsCategories
            categories={SETTINGS_CATEGORIES}
            activeCategory={activeCategory}
            onCategorySelect={setActiveCategory}
            dirtySettingsCount={dirtySettingsCount}
          />
        </div>

        {/* Settings Content */}
        <div
          id="settings-content"
          className="lg:col-span-3 space-y-6"
          {...getAriaProps({
            role: 'region',
            labelledby: 'category-heading',
            describedby: 'category-description',
          })}
        >
          {/* Category Header */}
          {currentCategory && (
            <Card
              className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    ${isDarkMode ? `bg-${currentCategory.color}/20` : `bg-${currentCategory.color}/10`}
                  `}
                  >
                    <currentCategory.icon
                      className={`w-6 h-6 text-${currentCategory.color}`}
                    />
                  </div>
                  <div>
                    <h2
                      id="category-heading"
                      className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'} focus-visible-ring`}
                      tabIndex={-1}
                    >
                      {currentCategory.label}
                    </h2>
                    <p
                      id="category-description"
                      className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}
                    >
                      {currentCategory.description}
                    </p>
                  </div>
                </div>

                {dirtySettingsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        handleDiscardChanges();
                        announce(
                          `Discarded ${dirtySettingsCount} unsaved changes`
                        );
                      }}
                      disabled={isBulkUpdating}
                      className={`button-danger-accessible text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10 ${getFocusClasses()}`}
                      {...getAriaProps({
                        label: `Discard ${dirtySettingsCount} unsaved changes`,
                      })}
                    >
                      Discard
                    </Button>
                    <Button
                      onClick={handleSaveAllSettings}
                      disabled={isBulkUpdating}
                      className={`button-primary-accessible bg-gradient-to-r from-muted-olive to-sage-green hover:from-muted-olive/90 hover:to-sage-green/90 ${getFocusClasses()}`}
                      {...getAriaProps({
                        label: isBulkUpdating
                          ? 'Saving changes'
                          : `Save ${dirtySettingsCount} changes`,
                        busy: isBulkUpdating,
                      })}
                    >
                      {isBulkUpdating ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isBulkUpdating
                        ? 'Saving...'
                        : `Save ${dirtySettingsCount} Changes`}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Settings List */}
          <Card
            className={`p-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}
          >
            <div className="space-y-6">
              {categorySettings.map((setting) => (
                <SettingEditor
                  key={setting.key}
                  setting={setting}
                  value={
                    setting.editedValue !== undefined
                      ? setting.editedValue
                      : setting.currentValue
                  }
                  onChange={(value) => handleSettingChange(setting.key, value)}
                  onSave={(value) => handleSaveSetting(setting.key, value)}
                  onReset={() => handleResetSetting(setting.key)}
                  isDirty={setting.isDirty}
                  isSaving={isUpdatingSetting}
                  isResetting={isResetting}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Settings History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SettingsHistory
              id="settings-history"
              onClose={() => {
                setShowHistory(false);
                announce('Settings history panel closed');
              }}
              category={activeCategory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Operations Panel */}
      <AnimatePresence>
        {showBulkOperations && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BulkSettings
              id="bulk-operations"
              onClose={() => {
                setShowBulkOperations(false);
                announce('Bulk operations panel closed');
              }}
              currentSettings={currentSettings}
              onSettingsUpdate={refetchSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SystemSettings;
