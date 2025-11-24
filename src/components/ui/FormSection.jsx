/**
 * FormSection - Enhanced glassmorphism section divider for forms
 * Creates visual hierarchy with subtle glass effects and breathing room
 * Balances minimalism with visual appeal
 */

import React from 'react';
import { motion } from 'framer-motion';

const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  variant = 'glass', // 'glass' | 'minimal' | 'outlined'
}) => {
  const variants = {
    glass: 'bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-md border border-gray-200/40 rounded-2xl p-6 shadow-sm',
    minimal: 'border-t border-gray-200/80 pt-6',
    outlined: 'border border-gray-200/60 rounded-2xl p-6 bg-white/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${variants[variant]} ${className}`}
    >
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h3 className="text-base font-semibold text-text-dark mb-1.5 flex items-center gap-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-muted/80 leading-relaxed">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </motion.div>
  );
};

export default FormSection;
