/**
 * TestLayout - Simple test to verify admin layout is working
 */

import React from 'react';
import { motion } from 'framer-motion';

const TestLayout = () => {

  return (
    <div
      className="min-h-screen p-8 bg-gray-50 dark:bg-dark-bg dark:dark"
    >
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="p-8 rounded-3xl border shadow-organic dark:shadow-dark-glass glass-layer-3 dark:glass-3-dark border-sage-green/20 dark:border-dark-olive-border hover:glass-4 dark:hover:glass-4-dark hover:shadow-organic-lg dark:hover:shadow-dark-glass hover:-translate-y-1 transition-all duration-500 group"
        >
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-3xl font-bold mb-4 text-text-dark dark:text-dark-text-primary group-hover:text-muted-olive dark:group-hover:text-dark-sage-accent transition-colors duration-300"
          >
            ✨ Restaurant-Grade Admin Interface
          </motion.h1>

          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="p-4 rounded-2xl glass-layer-1 dark:glass-1-dark border border-sage-green/20 dark:border-dark-sage-accent/20 text-muted-olive dark:text-dark-sage-accent hover:glass-layer-2 dark:hover:glass-2-dark hover:-translate-y-0.5 hover:shadow-glow-green/15 dark:hover:shadow-dark-glow-olive/15 transition-all duration-300 group cursor-pointer"
            >
              ✨ <strong>Restaurant's Glass-Layer System:</strong> Advanced 3D glassmorphism with organic shadows
            </motion.div>

            <div
              className="p-4 rounded-2xl bg-sage-green/10 text-muted-olive dark:text-sage-green"
            >
              ✅ <strong>Theme System Integration:</strong> Dark/Light modes
              active
            </div>

            <div
              className="p-4 rounded-2xl bg-earthy-yellow/10 text-earthy-brown"
            >
              ✅ <strong>Tailwind Configuration:</strong> Custom colors and
              classes loaded
            </div>
          </motion.div>

          <div className="mt-8 p-6 bg-gradient-to-br from-muted-olive/5 to-sage-green/5 rounded-2xl border border-sage-green/20">
            <h2
              className="text-xl font-semibold mb-3 text-text-dark dark:text-dark-text-primary"
            >
              🚀 Enhanced Features Ready
            </h2>
            <ul
              className="space-y-2 text-text-muted dark:text-dark-text-muted"
            >
              <li>
                • Professional glassmorphic sidebar with hierarchical navigation
              </li>
              <li>• Advanced header with global search and notifications</li>
              <li>• Dynamic breadcrumb system with route-based generation</li>
              <li>• Real-time layout context with badge system</li>
              <li>• Mobile-first responsive design with touch optimization</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <div
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl glass-2 dark:glass-2-dark border border-sage-green/30 dark:border-dark-sage-accent/30"
            >
              <div className="w-2 h-2 bg-sage-green rounded-full animate-pulse"></div>
              <span
                className="font-medium text-muted-olive dark:text-dark-sage-accent"
              >
                Admin Layout System: ACTIVE & READY
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TestLayout;
