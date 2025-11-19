/**
 * PlatformVendorBadge - Badge component for platform-owned vendors
 * Displays a visual indicator for Aaroth Mall, Aaroth Organics, etc.
 */

import React from 'react';
import { Shield, Store } from 'lucide-react';

const PlatformVendorBadge = ({ platformName, variant = 'default', className = '' }) => {
  if (!platformName) return null;

  const variantStyles = {
    default: {
      container:
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-muted-olive/10 to-sage-green/10 border border-muted-olive/30',
      icon: 'w-3.5 h-3.5 text-muted-olive',
      text: 'text-xs font-medium text-muted-olive',
    },
    compact: {
      container:
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted-olive/10 border border-muted-olive/20',
      icon: 'w-3 h-3 text-muted-olive',
      text: 'text-xs font-medium text-muted-olive',
    },
    large: {
      container:
        'inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-muted-olive/10 to-sage-green/10 border-2 border-muted-olive/30 shadow-sm',
      icon: 'w-5 h-5 text-muted-olive',
      text: 'text-sm font-semibold text-muted-olive',
    },
    dark: {
      container:
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-dark-sage-accent/20 to-dark-olive/20 border border-dark-sage-accent/40',
      icon: 'w-3.5 h-3.5 text-dark-sage-accent',
      text: 'text-xs font-medium text-dark-sage-accent',
    },
  };

  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={`${styles.container} ${className}`} title={`Platform: ${platformName}`}>
      <Shield className={styles.icon} />
      <span className={styles.text}>{platformName}</span>
    </div>
  );
};

/**
 * PlatformVendorLabel - Simple text label for platform vendors
 */
export const PlatformVendorLabel = ({ platformName, className = '' }) => {
  if (!platformName) return null;

  return (
    <span className={`text-xs font-medium text-muted-olive ${className}`}>
      {platformName}
    </span>
  );
};

/**
 * PlatformVendorIcon - Icon-only indicator for platform vendors
 */
export const PlatformVendorIcon = ({ platformName, className = '' }) => {
  if (!platformName) return null;

  return (
    <div
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted-olive/10 ${className}`}
      title={`Platform: ${platformName}`}
    >
      <Shield className="w-4 h-4 text-muted-olive" />
    </div>
  );
};

export default PlatformVendorBadge;
