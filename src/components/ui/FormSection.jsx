/**
 * FormSection - Elegant section divider for forms
 * Creates visual hierarchy with glassmorphism and organic design
 */

import React from 'react';
import { motion } from 'framer-motion';

const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
  className = '',
  variant = 'glass', // 'glass' | 'outlined' | 'filled'
}) => {
  const variants = {
    glass: 'glass-1 border border-sage-green/20 shadow-glow-green/5',
    outlined: 'border-2 border-sage-green/30',
    filled: 'bg-mint-fresh/5 border border-mint-fresh/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl p-6 ${variants[variant]} ${className}`}
    >
      {(title || description) && (
        <div className="mb-6 pb-4 border-b border-sage-green/20">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted-olive/20 to-sage-green/20 flex items-center justify-center mb-3">
              <Icon className="w-5 h-5 text-bottle-green" />
            </div>
          )}
          {title && (
            <h3 className="text-lg font-semibold text-text-dark mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-text-muted">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
};

export default FormSection;
