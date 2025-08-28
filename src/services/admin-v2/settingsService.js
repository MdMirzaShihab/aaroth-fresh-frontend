/**
 * Settings Service - Admin V2
 * System configuration and settings management
 */

import { format } from 'date-fns';

/**
 * Transform settings data for admin interface
 */
export const transformSettingsData = (rawData) => {
  if (!rawData?.data) return [];

  return rawData.data.map(setting => ({
    id: setting._id,
    key: setting.key,
    value: setting.value,
    category: setting.category || 'general',
    type: setting.type || 'string',
    description: setting.description,
    isReadOnly: setting.isReadOnly || false,
    lastModified: format(new Date(setting.updatedAt), 'PPp'),
    modifiedBy: setting.lastModifiedBy,
    validationRules: setting.validationRules || {},
    availableActions: getSettingActions(setting)
  }));
};

/**
 * Get available actions for settings
 */
const getSettingActions = (setting) => {
  const actions = ['view_details', 'view_history'];
  
  if (!setting.isReadOnly) {
    actions.push('edit', 'reset_to_default');
  }
  
  if (setting.category === 'maintenance') {
    actions.push('backup_setting');
  }
  
  return actions;
};

/**
 * Generate settings categories
 */
export const getSettingsCategories = () => {
  return [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'email', label: 'Email Configuration' },
    { value: 'payment', label: 'Payment Settings' },
    { value: 'security', label: 'Security' },
    { value: 'api', label: 'API Configuration' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'features', label: 'Feature Flags' }
  ];
};

/**
 * Validate setting value based on type and rules
 */
export const validateSettingValue = (setting, value) => {
  const errors = [];
  
  // Type validation
  if (setting.type === 'number' && isNaN(Number(value))) {
    errors.push('Value must be a number');
  }
  
  if (setting.type === 'boolean' && typeof value !== 'boolean') {
    errors.push('Value must be true or false');
  }
  
  if (setting.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      errors.push('Value must be a valid email address');
    }
  }
  
  // Validation rules
  if (setting.validationRules) {
    const { min, max, required, pattern } = setting.validationRules;
    
    if (required && (!value || value.toString().trim() === '')) {
      errors.push('Value is required');
    }
    
    if (min && Number(value) < min) {
      errors.push(`Value must be at least ${min}`);
    }
    
    if (max && Number(value) > max) {
      errors.push(`Value must be at most ${max}`);
    }
    
    if (pattern && !new RegExp(pattern).test(value)) {
      errors.push('Value does not match required pattern');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const settingsService = {
  transformSettingsData,
  getSettingsCategories,
  validateSettingValue
};

export default settingsService;