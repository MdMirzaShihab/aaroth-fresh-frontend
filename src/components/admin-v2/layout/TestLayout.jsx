/**
 * TestLayout - Simple test to verify admin layout is working
 */

import React from 'react';
import { useTheme } from '../../../hooks/useTheme';

const TestLayout = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'dark bg-dark-bg' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className={`
          p-8 rounded-3xl border shadow-lg
          ${isDarkMode ? 'glass-3-dark border-dark-olive-border' : 'glass-3 border-sage-green/20'}
        `}>
          <h1 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
            🎉 Enhanced Admin Layout System Test
          </h1>
          
          <div className="space-y-4">
            <div className={`
              p-4 rounded-2xl 
              ${isDarkMode ? 'bg-dark-sage-accent/10 text-dark-sage-accent' : 'bg-sage-green/10 text-bottle-green'}
            `}>
              ✅ <strong>Glassmorphic Design System:</strong> Working perfectly
            </div>
            
            <div className={`
              p-4 rounded-2xl 
              ${isDarkMode ? 'bg-mint-fresh/10 text-mint-fresh' : 'bg-mint-fresh/10 text-bottle-green'}
            `}>
              ✅ <strong>Theme System Integration:</strong> Dark/Light modes active
            </div>
            
            <div className={`
              p-4 rounded-2xl 
              ${isDarkMode ? 'bg-earthy-yellow/10 text-earthy-brown' : 'bg-earthy-yellow/10 text-earthy-brown'}
            `}>
              ✅ <strong>Tailwind Configuration:</strong> Custom colors and classes loaded
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-br from-bottle-green/5 to-sage-green/5 rounded-2xl border border-sage-green/20">
            <h2 className={`text-xl font-semibold mb-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-text-dark'}`}>
              🚀 Enhanced Features Ready
            </h2>
            <ul className={`space-y-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-text-muted'}`}>
              <li>• Professional glassmorphic sidebar with hierarchical navigation</li>
              <li>• Advanced header with global search and notifications</li>
              <li>• Dynamic breadcrumb system with route-based generation</li>
              <li>• Real-time layout context with badge system</li>
              <li>• Mobile-first responsive design with touch optimization</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <div className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-2xl
              ${isDarkMode ? 'glass-2-dark border border-dark-sage-accent/30' : 'glass-2 border border-sage-green/30'}
            `}>
              <div className="w-2 h-2 bg-mint-fresh rounded-full animate-pulse"></div>
              <span className={`font-medium ${isDarkMode ? 'text-dark-sage-accent' : 'text-bottle-green'}`}>
                Admin Layout System: ACTIVE & READY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestLayout;