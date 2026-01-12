import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import AarothLogo from '../../assets/AAROTH_ICON.png';
import { cn } from '../../utils';

/**
 * PublicNavbar Component
 *
 * Top navigation bar for public/unauthenticated users with:
 * - Logo and brand name
 * - Sign In / Sign Up actions
 * - Theme toggle
 * - Mobile-responsive design
 *
 * @param {Object} props
 * @param {string} props.themeMode - Current theme mode ('light' or 'dark')
 * @param {Function} props.onThemeToggle - Theme toggle handler
 * @param {string} props.className - Additional CSS classes
 */
const PublicNavbar = ({ themeMode = 'light', onThemeToggle, className }) => {
  const navigate = useNavigate();

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-colors duration-300 overflow-hidden',
        className
      )}
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      {/* Gradient Background Layer - Horizontal */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-earthy-beige/50 via-white/55 to-sage-green/20 dark:from-dark-olive-bg/60 dark:via-dark-bg/65 dark:to-dark-sage-accent/10 transition-colors duration-300"
        style={{ zIndex: -1 }}
      />

      {/* Floating Orbs - Subtle */}
      <div className="absolute top-0 right-1/4 w-48 h-48 bg-sage-green/8 dark:bg-dark-sage-accent/5 rounded-full blur-3xl animate-float pointer-events-none" />
      <div
        className="absolute top-0 left-1/3 w-32 h-32 bg-muted-olive/6 dark:bg-dark-cedar-warm/4 rounded-full blur-2xl animate-float pointer-events-none"
        style={{ animationDelay: '1.5s', animationDuration: '4s' }}
      />

      {/* Subtle Grid Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.01] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, #7f8966 1px, transparent 1px),
                            linear-gradient(to bottom, #7f8966 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />
      {/* Content - Positioned above background layers */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left Section - Logo & Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <img
                src={AarothLogo}
                alt="Aaroth Fresh"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-xl md:text-2xl font-bold text-text-dark dark:text-dark-text-primary transition-colors duration-300">
              <span className="text-muted-olive dark:text-dark-sage-accent">Aaroth</span> Fresh
            </span>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={onThemeToggle}
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/70 dark:bg-dark-glass-olive backdrop-blur-xl border-2 border-sage-green/25 dark:border-dark-sage-accent/30 shadow-soft dark:shadow-dark-depth-1 hover:bg-sage-green/15 dark:hover:bg-dark-glass-sage hover:border-sage-green/35 dark:hover:border-dark-sage-accent/40 dark:hover:shadow-dark-glow-olive flex items-center justify-center text-muted-olive dark:text-dark-sage-accent hover:scale-110 active:scale-95 transition-all duration-300 touch-target group"
              aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}
            >
              {themeMode === 'light' ? (
                <Moon className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-12 transition-transform duration-300" />
              ) : (
                <Sun className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
              )}
            </button>

            {/* Sign In Link */}
            <button
              onClick={() => navigate('/login')}
              className="hidden sm:flex px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-medium text-muted-olive dark:text-dark-text-primary bg-white/60 dark:bg-dark-glass-olive backdrop-blur-xl hover:bg-white/80 dark:hover:bg-dark-glass-sage hover:shadow-soft dark:hover:shadow-dark-depth-2 border-2 border-sage-green/20 dark:border-dark-sage-accent/25 hover:border-sage-green/30 dark:hover:border-dark-sage-accent/35 transition-all duration-200 touch-target"
            >
              Sign In
            </button>

            {/* Sign Up Button */}
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-secondary text-white px-4 md:px-6 py-2 md:py-2.5 rounded-2xl font-semibold shadow-soft hover:shadow-depth-3 dark:shadow-dark-depth-1 dark:hover:shadow-dark-glow-olive hover:scale-105 active:scale-100 transition-all duration-200 touch-target text-sm md:text-base border-2 border-white/20 dark:border-dark-sage-accent/30 backdrop-blur-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
