/**
 * SettingEditor - Type-aware Setting Control Editor
 * Features: Multiple input types, validation, real-time preview, accessibility support
 * Provides comprehensive editing interface for different setting data types
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Palette,
  Calendar,
  Clock,
  Hash,
  Type,
  ToggleLeft,
  ToggleRight,
  List,
  Code,
  Mail,
  Undo,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';
import { Button, LoadingSpinner } from '../../../../components/ui';

// Color picker component for color settings
const ColorPicker = ({ value, onChange, disabled }) => {
  const colors = [
    '#8C644A', '#F5ECD9', '#D4A373', '#E6D5B8', // Earthy colors
    '#7f8966', '#9CAF88', '#A0826D', // Olive-centered palette
    '#3A2A1F', '#E94B3C', '#F59E0B', '#10B981', // Utility colors
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="color"
        value={value || '#8C644A'}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-12 h-8 rounded border-2 border-gray-200 cursor-pointer disabled:cursor-not-allowed touch-target"
        aria-label="Color picker"
      />
      <div className="flex flex-wrap gap-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            disabled={disabled}
            className={`
              w-8 h-8 rounded border-2 transition-all duration-200 touch-target
              ${value === color ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'}
              disabled:cursor-not-allowed disabled:opacity-50
            `}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};

// JSON editor with basic validation
const JSONEditor = ({ value, onChange, disabled, schema }) => {
  const [jsonString, setJsonString] = useState('');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    try {
      setJsonString(JSON.stringify(value || {}, null, 2));
    } catch (e) {
      setJsonString('{}');
    }
  }, [value]);

  const handleJsonChange = useCallback((newValue) => {
    setJsonString(newValue);
    try {
      const parsed = JSON.parse(newValue);
      setIsValid(true);
      onChange(parsed);
    } catch (e) {
      setIsValid(false);
    }
  }, [onChange]);

  return (
    <div className="space-y-2">
      <textarea
        value={jsonString}
        onChange={(e) => handleJsonChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className={`
          w-full p-3 border rounded-lg font-mono text-sm resize-vertical
          ${isValid 
            ? 'border-gray-200 focus:border-bottle-green focus:ring-2 focus:ring-bottle-green/20' 
            : 'border-tomato-red focus:border-tomato-red focus:ring-2 focus:ring-tomato-red/20'
          }
          disabled:bg-gray-50 disabled:cursor-not-allowed
        `}
        aria-label="JSON configuration"
        aria-invalid={!isValid}
      />
      {!isValid && (
        <div className="flex items-center gap-2 text-xs text-tomato-red">
          <AlertTriangle className="w-3 h-3" />
          Invalid JSON format
        </div>
      )}
    </div>
  );
};

// Multi-select component
const MultiSelectInput = ({ value = [], options = [], onChange, disabled }) => {
  const { isDarkMode } = useTheme();

  const handleToggle = useCallback((optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  }, [value, onChange]);

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 touch-target
            ${value.includes(option.value)
              ? isDarkMode 
                ? 'bg-bottle-green/10 border-bottle-green/30' 
                : 'bg-bottle-green/5 border-bottle-green/20'
              : isDarkMode
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
        >
          <input
            type="checkbox"
            checked={value.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={disabled}
            className="w-4 h-4 text-bottle-green border-gray-300 rounded focus:ring-bottle-green/20"
            aria-describedby={`${option.value}-desc`}
          />
          <div className="flex-1">
            <span className={`font-medium ${
              isDarkMode ? 'text-white' : 'text-text-dark'
            }`}>
              {option.label}
            </span>
            {option.description && (
              <p id={`${option.value}-desc`} className={`text-xs mt-1 ${
                isDarkMode ? 'text-gray-300' : 'text-text-muted'
              }`}>
                {option.description}
              </p>
            )}
          </div>
        </label>
      ))}
    </div>
  );
};

const SettingEditor = ({
  setting,
  value,
  onChange,
  onSave,
  onReset,
  isDirty = false,
  isSaving = false,
  isResetting = false,
}) => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState(null);

  // Validate setting value
  const validate = useCallback((val) => {
    if (!setting.validation) return null;

    const validation = setting.validation;
    
    // Required validation
    if (validation.required && (!val || val === '')) {
      return `${setting.label} is required`;
    }

    // String validations
    if (typeof val === 'string') {
      if (validation.minLength && val.length < validation.minLength) {
        return `${setting.label} must be at least ${validation.minLength} characters`;
      }
      if (validation.maxLength && val.length > validation.maxLength) {
        return `${setting.label} must be no more than ${validation.maxLength} characters`;
      }
      if (validation.pattern && !validation.pattern.test(val)) {
        return `${setting.label} format is invalid`;
      }
    }

    // Number validations
    if (typeof val === 'number' && !isNaN(val)) {
      if (validation.min !== undefined && val < validation.min) {
        return `${setting.label} must be at least ${validation.min}`;
      }
      if (validation.max !== undefined && val > validation.max) {
        return `${setting.label} must be no more than ${validation.max}`;
      }
    }

    return null;
  }, [setting]);

  // Handle value changes with validation
  const handleChange = useCallback((newValue) => {
    onChange(newValue);
    const error = validate(newValue);
    setValidationError(error);
  }, [onChange, validate]);

  // Handle save with validation
  const handleSave = useCallback(() => {
    const error = validate(value);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    onSave(value);
  }, [value, validate, onSave]);

  // Get setting icon
  const getSettingIcon = () => {
    switch (setting.type) {
      case 'string': return Type;
      case 'number': return Hash;
      case 'email': return Mail;
      case 'password': return showPassword ? EyeOff : Eye;
      case 'boolean': return value ? ToggleRight : ToggleLeft;
      case 'select': return List;
      case 'multiselect': return List;
      case 'color': return Palette;
      case 'json': return Code;
      default: return Info;
    }
  };

  // Render the appropriate input control
  const renderControl = () => {
    const baseInputClasses = `
      w-full px-4 py-3 border rounded-xl transition-all duration-200 touch-target
      ${isDirty 
        ? 'border-earthy-yellow/50 bg-earthy-yellow/5' 
        : 'border-gray-200 focus:border-bottle-green'
      }
      ${validationError 
        ? 'border-tomato-red focus:border-tomato-red focus:ring-2 focus:ring-tomato-red/20' 
        : 'focus:ring-2 focus:ring-bottle-green/20'
      }
      disabled:bg-gray-50 disabled:cursor-not-allowed
      ${isDarkMode 
        ? 'bg-gray-800 text-white border-gray-600' 
        : 'bg-white text-text-dark'
      }
    `;

    switch (setting.type) {
      case 'string':
      case 'email':
        return (
          <input
            type={setting.type === 'email' ? 'email' : 'text'}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            placeholder={setting.placeholder || `Enter ${setting.label.toLowerCase()}...`}
            aria-describedby={`${setting.key}-desc ${setting.key}-help`}
            aria-invalid={!!validationError}
          />
        );

      case 'password':
        return (
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={value || ''}
              onChange={(e) => handleChange(e.target.value)}
              className={`${baseInputClasses} pr-12`}
              placeholder="Enter password..."
              aria-describedby={`${setting.key}-desc ${setting.key}-help`}
              aria-invalid={!!validationError}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`
                absolute right-3 top-1/2 transform -translate-y-1/2 p-1 touch-target
                ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-text-muted hover:text-text-dark'}
              `}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleChange(e.target.value === '' ? null : Number(e.target.value))}
            className={baseInputClasses}
            min={setting.validation?.min}
            max={setting.validation?.max}
            step={setting.validation?.step || 1}
            placeholder={setting.placeholder || '0'}
            aria-describedby={`${setting.key}-desc ${setting.key}-help`}
            aria-invalid={!!validationError}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center
                ${value 
                  ? 'bg-mint-fresh/20 text-mint-fresh' 
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-gray-200 text-text-muted'
                }
              `}>
                {value ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
              </div>
              <span className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-text-dark'
              }`}>
                {value ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <button
              onClick={() => handleChange(!value)}
              className={`
                relative inline-flex h-8 w-14 items-center rounded-full transition-colors
                focus:outline-none focus:ring-2 focus:ring-bottle-green/20 touch-target
                ${value ? 'bg-bottle-green' : 'bg-gray-200'}
              `}
              role="switch"
              aria-checked={value}
              aria-describedby={`${setting.key}-desc`}
            >
              <span
                className={`
                  inline-block h-6 w-6 transform rounded-full bg-white transition-transform
                  ${value ? 'translate-x-7' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            aria-describedby={`${setting.key}-desc ${setting.key}-help`}
            aria-invalid={!!validationError}
          >
            <option value="">Select an option...</option>
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <MultiSelectInput
            value={value}
            options={setting.options}
            onChange={handleChange}
            disabled={false}
          />
        );

      case 'color':
        return <ColorPicker value={value} onChange={handleChange} disabled={false} />;

      case 'json':
        return (
          <JSONEditor
            value={value}
            onChange={handleChange}
            disabled={false}
            schema={setting.schema}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClasses}
            placeholder={`Enter ${setting.label.toLowerCase()}...`}
            aria-describedby={`${setting.key}-desc ${setting.key}-help`}
            aria-invalid={!!validationError}
          />
        );
    }
  };

  const SettingIcon = getSettingIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        p-6 rounded-xl border transition-all duration-200
        ${isDirty
          ? isDarkMode
            ? 'bg-earthy-yellow/5 border-earthy-yellow/20'
            : 'bg-earthy-yellow/5 border-earthy-yellow/20'
          : isDarkMode
            ? 'bg-gray-800/30 border-gray-700/50'
            : 'bg-white/80 border-gray-200/50'
        }
      `}
    >
      {/* Setting Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center
            ${isDirty
              ? 'bg-earthy-yellow/20 text-earthy-yellow'
              : isDarkMode
                ? 'bg-gray-700 text-gray-400'
                : 'bg-gray-100 text-text-muted'
            }
          `}>
            <SettingIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${
                isDarkMode ? 'text-white' : 'text-text-dark'
              }`}>
                {setting.label}
              </h4>
              {setting.warning && (
                <AlertTriangle className="w-4 h-4 text-earthy-yellow" />
              )}
              {isDirty && (
                <span className="px-2 py-1 text-xs bg-earthy-yellow/20 text-earthy-yellow rounded">
                  Modified
                </span>
              )}
            </div>
            <p id={`${setting.key}-desc`} className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-text-muted'
            }`}>
              {setting.description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {isDirty && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={isResetting}
              className="text-tomato-red border-tomato-red/30 hover:bg-tomato-red/10 min-h-[36px]"
            >
              {isResetting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Undo className="w-3 h-3" />
              )}
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !!validationError}
              className="min-h-[36px] bg-gradient-to-r from-bottle-green to-sage-green hover:from-bottle-green/90 hover:to-sage-green/90"
            >
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-3 h-3 mr-2" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      {/* Setting Control */}
      <div className="mb-4">
        {renderControl()}
      </div>

      {/* Validation Error */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 p-3 bg-tomato-red/5 border border-tomato-red/20 rounded-lg text-tomato-red text-sm"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{validationError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setting Help */}
      {(setting.validation || setting.defaultValue !== undefined) && (
        <div id={`${setting.key}-help`} className={`
          mt-3 p-3 rounded-lg border text-xs
          ${isDarkMode 
            ? 'bg-gray-700/30 border-gray-600/30 text-gray-300' 
            : 'bg-gray-50 border-gray-200/50 text-text-muted'
          }
        `}>
          <div className="flex items-start gap-2">
            <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              {setting.validation && (
                <div>
                  <span className="font-medium">Validation:</span>
                  <ul className="ml-2 space-y-0.5">
                    {setting.validation.required && <li>• Required field</li>}
                    {setting.validation.minLength && <li>• Minimum {setting.validation.minLength} characters</li>}
                    {setting.validation.maxLength && <li>• Maximum {setting.validation.maxLength} characters</li>}
                    {setting.validation.min !== undefined && <li>• Minimum value: {setting.validation.min}</li>}
                    {setting.validation.max !== undefined && <li>• Maximum value: {setting.validation.max}</li>}
                    {setting.validation.pattern && <li>• Must match required format</li>}
                  </ul>
                </div>
              )}
              {setting.defaultValue !== undefined && (
                <div>
                  <span className="font-medium">Default:</span> {
                    typeof setting.defaultValue === 'object' 
                      ? JSON.stringify(setting.defaultValue)
                      : String(setting.defaultValue)
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SettingEditor;