/**
 * SettingsCategories - Category Navigation for System Settings
 * Features: Tabbed category interface, visual indicators, mobile-responsive navigation
 * Provides organized navigation for different setting categories with change indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../../../hooks/useTheme';

const CategoryNavItem = ({ 
  category, 
  isActive, 
  onClick, 
  isDirty = false,
  settingsCount = 0 
}) => {
  const { isDarkMode } = useTheme();
  const Icon = category.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(category.key)}
      className={`
        w-full p-4 rounded-xl text-left transition-all duration-200 touch-target
        ${isActive
          ? isDarkMode
            ? `bg-${category.color}/20 border-${category.color}/30`
            : `bg-${category.color}/10 border-${category.color}/20`
          : isDarkMode
            ? 'bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50'
            : 'bg-white/80 border-gray-200/50 hover:bg-gray-50'
        }
        border backdrop-blur-sm
        ${isActive ? 'ring-2 ring-' + category.color + '/20' : ''}
        focus:outline-none focus:ring-2 focus:ring-${category.color}/30
      `}
      aria-label={`Select ${category.label} category`}
      role="tab"
      aria-selected={isActive}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={`
            w-8 h-8 rounded-lg flex items-center justify-center
            ${isActive
              ? isDarkMode 
                ? `bg-${category.color}/30` 
                : `bg-${category.color}/20`
              : isDarkMode
                ? 'bg-gray-700'
                : 'bg-gray-100'
            }
          `}>
            <Icon className={`w-4 h-4 ${
              isActive 
                ? `text-${category.color}` 
                : isDarkMode 
                  ? 'text-gray-400' 
                  : 'text-text-muted'
            }`} />
          </div>
          
          {isDirty && (
            <div className="w-2 h-2 bg-earthy-yellow rounded-full animate-pulse" />
          )}
        </div>
        
        {isActive && (
          <ChevronRight className={`w-4 h-4 text-${category.color}`} />
        )}
      </div>

      <div>
        <h3 className={`text-sm font-medium mb-1 ${
          isActive 
            ? isDarkMode 
              ? 'text-white' 
              : 'text-text-dark'
            : isDarkMode
              ? 'text-gray-300'
              : 'text-text-dark'
        }`}>
          {category.label}
        </h3>
        
        <p className={`text-xs leading-relaxed ${
          isActive
            ? isDarkMode
              ? 'text-gray-300'
              : 'text-text-muted'
            : isDarkMode
              ? 'text-gray-400'
              : 'text-text-muted'
        }`}>
          {category.description}
        </p>
        
        {settingsCount > 0 && (
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-text-muted'
            }`}>
              {settingsCount} settings
            </span>
            
            {isDirty && (
              <span className="text-xs text-earthy-yellow font-medium">
                Modified
              </span>
            )}
          </div>
        )}
      </div>
    </motion.button>
  );
};

const SettingsCategories = ({
  categories,
  activeCategory,
  onCategorySelect,
  dirtySettingsCount = 0
}) => {
  const { isDarkMode } = useTheme();

  // Get dirty categories (this would come from actual dirty state tracking)
  const getDirtyCategories = () => {
    // In a real implementation, this would track which categories have unsaved changes
    return dirtySettingsCount > 0 ? [activeCategory] : [];
  };

  const dirtyCategoriesSet = new Set(getDirtyCategories());

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="mb-4">
        <h3 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-white' : 'text-text-dark'
        }`}>
          Settings Categories
        </h3>
        
        {dirtySettingsCount > 0 && (
          <div className={`
            text-xs px-3 py-1 rounded-full inline-flex items-center gap-2
            ${isDarkMode 
              ? 'bg-earthy-yellow/20 text-earthy-yellow' 
              : 'bg-earthy-yellow/10 text-earthy-brown'
            }
          `}>
            <div className="w-1.5 h-1.5 bg-earthy-yellow rounded-full animate-pulse" />
            {dirtySettingsCount} unsaved change{dirtySettingsCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Category List */}
      <div className="space-y-2" role="tablist" aria-orientation="vertical">
        {categories.map((category) => (
          <CategoryNavItem
            key={category.key}
            category={category}
            isActive={activeCategory === category.key}
            onClick={onCategorySelect}
            isDirty={dirtyCategoriesSet.has(category.key)}
            settingsCount={category.settings?.length || 0}
          />
        ))}
      </div>

      {/* Category Stats */}
      <div className={`
        mt-6 p-4 rounded-xl border
        ${isDarkMode 
          ? 'bg-gray-800/30 border-gray-700/50' 
          : 'bg-gray-50/80 border-gray-200/50'
        }
      `}>
        <div className="flex items-center justify-between text-sm">
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            Total Categories
          </span>
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {categories.length}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
            Total Settings
          </span>
          <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-text-dark'}`}>
            {categories.reduce((sum, cat) => sum + (cat.settings?.length || 0), 0)}
          </span>
        </div>
        
        {dirtyCategoriesSet.size > 0 && (
          <div className="flex items-center justify-between text-sm mt-2">
            <span className={`${isDarkMode ? 'text-gray-300' : 'text-text-muted'}`}>
              Categories with Changes
            </span>
            <span className="font-medium text-earthy-yellow">
              {dirtyCategoriesSet.size}
            </span>
          </div>
        )}
      </div>

      {/* Quick Help */}
      <div className={`
        p-4 rounded-xl border
        ${isDarkMode 
          ? 'bg-sage-green/5 border-sage-green/20' 
          : 'bg-sage-green/5 border-sage-green/20'
        }
      `}>
        <h4 className={`text-sm font-medium mb-2 ${
          isDarkMode ? 'text-sage-green' : 'text-muted-olive'
        }`}>
          Quick Help
        </h4>
        <ul className={`text-xs space-y-1 ${
          isDarkMode ? 'text-gray-300' : 'text-text-muted'
        }`}>
          <li>• Click categories to switch between setting groups</li>
          <li>• Modified settings show orange indicators</li>
          <li>• Save individual settings or use bulk save</li>
          <li>• Use History to view and rollback changes</li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsCategories;