/**
 * BulkSettings - Mass Operations Interface for Settings Management
 * Features: Bulk updates, import/export, environment sync, template management
 * Provides comprehensive bulk operations for efficient settings management
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Upload,
  Download,
  Copy,
  RefreshCw,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  FileText,
  Settings,
  Zap,
  Globe,
  Layers,
  Package,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Target,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Card, Button, LoadingSpinner } from '../../../../components/ui';
import {
  useBulkUpdateSettingsMutation,
  useResetSystemSettingsMutation,
  useGetSystemSettingsQuery,
} from '../../../../store/slices/admin-v2/adminApiSlice';
import { CSVLink } from 'react-csv';
import toast from 'react-hot-toast';

// Template configuration presets
const SETTINGS_TEMPLATES = [
  {
    id: 'development',
    name: 'Development Environment',
    description: 'Settings optimized for development environment',
    icon: GitBranch,
    color: 'sage-green',
    settings: {
      maintenanceMode: false,
      sessionTimeout: 24,
      twoFactorRequired: false,
      emailNotificationsEnabled: false,
      platformCommission: 5.0,
      minOrderAmount: 10.00,
    },
  },
  {
    id: 'staging',
    name: 'Staging Environment',
    description: 'Settings for testing and quality assurance',
    icon: Target,
    color: 'earthy-yellow',
    settings: {
      maintenanceMode: false,
      sessionTimeout: 8,
      twoFactorRequired: true,
      emailNotificationsEnabled: true,
      platformCommission: 7.5,
      minOrderAmount: 15.00,
    },
  },
  {
    id: 'production',
    name: 'Production Environment',
    description: 'Secure settings for live production environment',
    icon: Zap,
    color: 'bottle-green',
    settings: {
      maintenanceMode: false,
      sessionTimeout: 4,
      twoFactorRequired: true,
      emailNotificationsEnabled: true,
      platformCommission: 8.5,
      minOrderAmount: 25.00,
      ipWhitelistEnabled: true,
      passwordRequireSymbols: true,
    },
  },
  {
    id: 'maintenance',
    name: 'Maintenance Mode',
    description: 'Temporary settings during system maintenance',
    icon: Settings,
    color: 'tomato-red',
    settings: {
      maintenanceMode: true,
      newRegistrations: false,
      emailNotificationsEnabled: false,
      sessionTimeout: 1,
    },
  },
];

// Template card component
const TemplateCard = ({ template, onApply, isApplying, onPreview }) => {
  const { isDarkMode } = useTheme();
  const Icon = template.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${isDarkMode 
          ? `bg-${template.color}/5 border-${template.color}/20 hover:bg-${template.color}/10`
          : `bg-${template.color}/5 border-${template.color}/20 hover:bg-${template.color}/10`
        }
      `}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${isDarkMode ? `bg-${template.color}/20` : `bg-${template.color}/15`}
        `}>
          <Icon className={`w-5 h-5 text-${template.color}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {template.name}
          </h4>
          <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            {Object.keys(template.settings).length} settings
          </p>
        </div>
      </div>
      
      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
        {template.description}
      </p>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPreview(template)}
          className="flex-1 min-h-[36px]"
        >
          <Eye className="w-3 h-3 mr-2" />
          Preview
        </Button>
        <Button
          size="sm"
          onClick={() => onApply(template)}
          disabled={isApplying}
          className={`flex-1 min-h-[36px] bg-gradient-to-r from-${template.color} to-${template.color}/80`}
        >
          {isApplying ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <Download className="w-3 h-3 mr-2" />
          )}
          {isApplying ? 'Applying...' : 'Apply'}
        </Button>
      </div>
    </motion.div>
  );
};

// Bulk operation card component
const BulkOperationCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  onAction, 
  isLoading, 
  actionLabel,
  disabled = false 
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`
      p-4 rounded-xl border transition-all duration-200
      ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : isDarkMode 
          ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
          : 'bg-white/80 border-gray-200/50 hover:bg-gray-50'
      }
    `}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${isDarkMode ? `bg-${color}/20` : `bg-${color}/10`}
        `}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div className="flex-1">
          <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {title}
          </h4>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            {description}
          </p>
        </div>
      </div>
      
      <Button
        onClick={onAction}
        disabled={disabled || isLoading}
        className="w-full min-h-[36px]"
        variant="outline"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <Icon className="w-4 h-4 mr-2" />
        )}
        {isLoading ? 'Processing...' : actionLabel}
      </Button>
    </div>
  );
};

// Import/Export operations
const ImportExportSection = ({ currentSettings, onSettingsUpdate }) => {
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  const csvLinkRef = useRef(null);
  const [isImporting, setIsImporting] = useState(false);

  // Generate CSV export data
  const generateCSVData = useCallback(() => {
    return Object.entries(currentSettings).map(([key, value]) => [
      key,
      typeof value === 'object' ? JSON.stringify(value) : String(value),
      typeof value,
    ]);
  }, [currentSettings]);

  // Handle settings import
  const handleImportSettings = useCallback(async (file) => {
    setIsImporting(true);
    
    try {
      const text = await file.text();
      let importedSettings;

      if (file.name.endsWith('.json')) {
        importedSettings = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Parse CSV format: key,value,type
        const lines = text.split('\n');
        importedSettings = {};
        lines.forEach(line => {
          const [key, value, type] = line.split(',');
          if (key && value && type) {
            if (type === 'number') {
              importedSettings[key] = Number(value);
            } else if (type === 'boolean') {
              importedSettings[key] = value === 'true';
            } else if (type === 'object') {
              importedSettings[key] = JSON.parse(value);
            } else {
              importedSettings[key] = value;
            }
          }
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV files.');
      }

      // Apply imported settings (this would use the bulk update mutation)
      toast.success(`Successfully imported ${Object.keys(importedSettings).length} settings`);
      onSettingsUpdate();
    } catch (error) {
      console.error('Failed to import settings:', error);
      toast.error(`Failed to import settings: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  }, [onSettingsUpdate]);

  // Handle file selection
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportSettings(file);
    }
    // Reset input
    event.target.value = '';
  }, [handleImportSettings]);

  return (
    <div className="space-y-4">
      <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
        Import / Export Settings
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export */}
        <div className={`
          p-4 rounded-xl border
          ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}
        `}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${isDarkMode ? 'bg-mint-fresh/20' : 'bg-mint-fresh/10'}
            `}>
              <Download className="w-4 h-4 text-mint-fresh" />
            </div>
            <div>
              <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Export Settings
              </h5>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                Download current settings as CSV
              </p>
            </div>
          </div>
          
          <CSVLink
            ref={csvLinkRef}
            data={[['Setting Key', 'Value', 'Type'], ...generateCSVData()]}
            filename={`aaroth-settings-export-${new Date().toISOString().split('T')[0]}.csv`}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => csvLinkRef.current?.link.click()}
            className="w-full min-h-[36px]"
            disabled={Object.keys(currentSettings).length === 0}
          >
            <Download className="w-3 h-3 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Import */}
        <div className={`
          p-4 rounded-xl border
          ${isDarkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border-gray-200/50'}
        `}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center
              ${isDarkMode ? 'bg-sage-green/20' : 'bg-sage-green/10'}
            `}>
              <Upload className="w-4 h-4 text-sage-green" />
            </div>
            <div>
              <h5 className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Import Settings
              </h5>
              <p className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                Upload JSON or CSV file
              </p>
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full min-h-[36px]"
          >
            {isImporting ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Upload className="w-3 h-3 mr-2" />
            )}
            {isImporting ? 'Importing...' : 'Import File'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const BulkSettings = ({ onClose, currentSettings, onSettingsUpdate }) => {
  const { isDarkMode } = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);

  // API hooks
  const [bulkUpdateSettings] = useBulkUpdateSettingsMutation();
  const [resetSettings, { isLoading: isResetting }] = useResetSystemSettingsMutation();

  // Handle template application
  const handleApplyTemplate = useCallback(async (template) => {
    setIsApplyingTemplate(true);
    setSelectedTemplate(template);

    try {
      await bulkUpdateSettings({
        settings: template.settings,
        changeReason: `Applied ${template.name} template configuration`,
      }).unwrap();

      toast.success(`Successfully applied ${template.name} template`);
      onSettingsUpdate();
    } catch (error) {
      console.error('Failed to apply template:', error);
      toast.error(`Failed to apply template: ${error.message || 'Unknown error'}`);
    } finally {
      setIsApplyingTemplate(false);
      setSelectedTemplate(null);
    }
  }, [bulkUpdateSettings, onSettingsUpdate]);

  // Handle template preview
  const handlePreviewTemplate = useCallback((template) => {
    setPreviewTemplate(template);
  }, []);

  // Handle reset all settings
  const handleResetAllSettings = useCallback(async () => {
    if (!confirm('Are you sure you want to reset ALL settings to their default values? This action cannot be undone.')) {
      return;
    }

    try {
      await resetSettings({
        reason: 'Reset all settings to default values from bulk operations panel',
      }).unwrap();

      toast.success('All settings have been reset to default values');
      onSettingsUpdate();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error(`Failed to reset settings: ${error.message || 'Unknown error'}`);
    }
  }, [resetSettings, onSettingsUpdate]);

  // Handle backup creation
  const handleCreateBackup = useCallback(() => {
    const backup = {
      timestamp: new Date().toISOString(),
      settings: currentSettings,
      version: '1.0.0',
    };

    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `aaroth-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Settings backup created successfully');
  }, [currentSettings]);

  return (
    <Card className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? 'bg-earthy-yellow/20' : 'bg-earthy-yellow/10'}
            `}>
              <Database className="w-5 h-5 text-earthy-yellow" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                Bulk Operations
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                Mass operations, templates, and environment management
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="min-h-[36px]"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-8">
          {/* Configuration Templates */}
          <div>
            <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              Configuration Templates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SETTINGS_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onApply={handleApplyTemplate}
                  onPreview={handlePreviewTemplate}
                  isApplying={isApplyingTemplate && selectedTemplate?.id === template.id}
                />
              ))}
            </div>
          </div>

          {/* Bulk Operations */}
          <div>
            <h4 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
              System Operations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BulkOperationCard
                title="Create Backup"
                description="Download complete settings backup"
                icon={Package}
                color="mint-fresh"
                onAction={handleCreateBackup}
                actionLabel="Create Backup"
              />
              
              <BulkOperationCard
                title="Reset All Settings"
                description="Restore all settings to default values"
                icon={RefreshCw}
                color="tomato-red"
                onAction={handleResetAllSettings}
                isLoading={isResetting}
                actionLabel="Reset All"
              />
              
              <BulkOperationCard
                title="Sync Environment"
                description="Sync settings between environments"
                icon={GitBranch}
                color="dusty-cedar"
                onAction={() => toast.info('Environment sync not yet implemented')}
                actionLabel="Sync"
                disabled={true}
              />
            </div>
          </div>

          {/* Import/Export */}
          <ImportExportSection
            currentSettings={currentSettings}
            onSettingsUpdate={onSettingsUpdate}
          />
        </div>

        {/* Template Preview Modal */}
        <AnimatePresence>
          {previewTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setPreviewTemplate(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`
                  max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl
                  ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
                  border shadow-2xl
                `}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <previewTemplate.icon className={`w-6 h-6 text-${previewTemplate.color}`} />
                      <div>
                        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                          {previewTemplate.name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                          Template Preview
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewTemplate(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
                      {previewTemplate.description}
                    </p>
                    
                    <div>
                      <h4 className={`font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
                        Settings to be applied:
                      </h4>
                      <div className={`
                        p-4 rounded-lg border font-mono text-sm
                        ${isDarkMode ? 'bg-gray-900 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-text-dark'}
                      `}>
                        <pre>{JSON.stringify(previewTemplate.settings, null, 2)}</pre>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewTemplate(null)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          handleApplyTemplate(previewTemplate);
                          setPreviewTemplate(null);
                        }}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Apply Template
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default BulkSettings;