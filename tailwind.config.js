/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary Colors (Minimalistic Earth-Tech Fusion)
        'earthy-brown': '#8C644A',
        'earthy-beige': '#F5ECD9',
        'earthy-yellow': '#D4A373',
        'earthy-tan': '#E6D5B8',

        // Secondary Colors (Sophisticated Olive-Centered Palette)
        'muted-olive': '#7f8966', // Primary secondary (unchanged)
        'sage-green': '#9CAF88', // Lighter, softer complement to muted-olive
        'dusty-cedar': '#A0826D', // Warm earth tone that bridges olive and brown tones

        // Utility Colors (Enhanced Futuristic Neutrals)
        'text-dark': '#3A2A1F',
        'text-light': '#FFFFFF',
        'text-muted': '#6B7280',
        'tomato-red': '#E94B3C',
        'amber-warm': '#F59E0B',
        'border-light': '#E5E7EB',
        'background-alt': '#F9FAFB',

        // Enhanced Dark Mode Colors (Professional Olive-Themed)
        'dark-bg': '#1A1A1A', // Deep charcoal foundation
        'dark-bg-alt': '#2D2D2D', // Alternative dark surface
        'dark-surface': '#374151', // Interactive surfaces
        'dark-text-primary': '#F5ECD9', // Primary text (earthy-beige for consistency)
        'dark-text-muted': '#9CA3AF', // Secondary text
        'dark-border': '#4B5563', // Standard dark borders
        
        // Enhanced Dark Mode Olive-Themed Colors
        'dark-olive-bg': '#1F2419', // Deep olive-tinted background for brand consistency
        'dark-olive-surface': '#2A3024', // Elevated olive-tinted surfaces
        'dark-olive-border': '#3A4A32', // Olive-tinted borders for subtle brand presence
        'dark-sage-accent': '#8FB57C', // Brighter sage for dark mode visibility
        'dark-cedar-warm': '#B8906F', // Warmer cedar tone for dark mode
        'dark-glass-olive': 'rgba(143, 181, 124, 0.12)', // Dark-optimized olive glass
        'dark-glass-sage': 'rgba(159, 175, 136, 0.08)', // Dark-optimized sage glass
        'dark-glow-olive': 'rgba(143, 181, 124, 0.2)', // Enhanced olive glow for dark mode

        // Enhanced Glassmorphism Colors (Olive-focused)
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        'glass-dark': 'rgba(31, 41, 55, 0.8)',
        'glow-olive': '#7f896620', // Subtle olive glow
        'glow-sage': '#9CAF8820', // Sage green glow
        'glow-cedar': '#A0826D20', // Cedar glow
        'glow-amber': '#F59E0B20',
        'shadow-soft': 'rgba(60, 42, 31, 0.08)',
        'shadow-professional': 'rgba(0, 0, 0, 0.1)',

        // Status Colors for B2B Workflows (Olive-harmonized)
        'success-light': '#E8F3E8', // Softer, olive-influenced success
        'success-dark': '#4A5D4A', // Deeper olive-green for success
        'warning-light': '#FEF3C7',
        'warning-dark': '#92400E',
        'error-light': '#FEE2E2',
        'error-dark': '#991B1B',
        'info-light': '#E8F1F5', // Subtle sage-influenced info
        'info-dark': '#5A6B5D', // Olive-toned info dark
        'pending-light': '#F3F1E8', // Warm, cedar-influenced pending
        'pending-dark': '#826D5A', // Cedar-toned pending dark
      },

      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8C644A 0%, #D4A373 100%)',
        'gradient-secondary':
          'linear-gradient(135deg, #7f8966 0%, #9CAF88 100%)', // Updated olive to sage
        'gradient-tertiary':
          'linear-gradient(135deg, #A0826D 0%, #D4A373 50%, #7f8966 100%)', // New cedar-olive blend
        'gradient-glass':
          'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-glass-dark':
          'linear-gradient(135deg, rgba(31,41,55,0.8) 0%, rgba(31,41,55,0.4) 100%)',
        'gradient-depth':
          'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.05) 100%)',
        'gradient-olive-sage':
          'linear-gradient(120deg, #7f8966 0%, #9CAF88 100%)', // Olive to sage gradient
        'gradient-earth-harmony':
          'linear-gradient(135deg, #A0826D 0%, #7f8966 50%, #9CAF88 100%)', // Full secondary harmony
      },

      backdropBlur: {
        xs: '2px',
        '3xl': '64px',
      },

      spacing: {
        0.5: '2px',
        1.5: '6px',
        2.5: '10px',
        3.5: '14px',
        4.5: '18px',
        5.5: '22px',
        6.5: '26px',
        7.5: '30px',
        15: '60px',
        18: '72px',
        22: '88px',
        72: '288px',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        glow: 'glow 2s ease-in-out infinite alternate',
        'glow-olive': 'glowOlive 2s ease-in-out infinite alternate', // New olive glow
        float: 'float 3s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        breathe: 'breathe 4s ease-in-out infinite', // Subtle breathing effect
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(127, 137, 102, 0.2)' }, // Updated to olive
          '100%': { boxShadow: '0 0 20px rgba(127, 137, 102, 0.4)' },
        },
        glowOlive: {
          '0%': { boxShadow: '0 0 5px rgba(127, 137, 102, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(127, 137, 102, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.95' },
        },
      },

      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 25px 50px -12px rgba(31, 38, 135, 0.25)',
        'depth-1':
          '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'depth-2':
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'depth-3':
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'depth-4':
          '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'depth-5': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow-olive': '0 0 20px rgba(127, 137, 102, 0.3)', // Updated olive glow
        'glow-sage': '0 0 20px rgba(156, 175, 136, 0.25)', // New sage glow
        'glow-cedar': '0 0 20px rgba(160, 130, 109, 0.25)', // New cedar glow
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.3)',
        'soft-olive': '0 2px 8px rgba(127, 137, 102, 0.1)', // Subtle olive shadow
        
        // Enhanced Dark Mode Shadows
        'dark-glow-olive': '0 0 25px rgba(143, 181, 124, 0.25)', // Enhanced olive glow for dark mode
        'dark-glow-sage': '0 0 20px rgba(159, 175, 136, 0.2)', // Sage glow for dark mode
        'dark-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)', // Dark mode glass shadow
        'dark-glass-lg': '0 25px 50px -12px rgba(0, 0, 0, 0.4)', // Large dark glass shadow
        'dark-depth-1': '0 1px 3px 0 rgba(0, 0, 0, 0.8), 0 1px 2px 0 rgba(143, 181, 124, 0.05)', // Dark mode depth level 1
        'dark-depth-2': '0 4px 6px -1px rgba(0, 0, 0, 0.6), 0 2px 4px -1px rgba(143, 181, 124, 0.08)', // Dark mode depth level 2
        'dark-depth-3': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(143, 181, 124, 0.1)', // Dark mode depth level 3
        
        // Restaurant's Organic Shadow System
        'shadow-organic': '0 4px 16px rgba(127, 137, 102, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        'shadow-organic-lg': '0 8px 32px rgba(127, 137, 102, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        'shadow-dark-glass': '0 8px 32px rgba(0, 0, 0, 0.7), 0 4px 16px rgba(143, 181, 124, 0.08)',
        'shadow-glow-green': '0 0 20px rgba(156, 175, 136, 0.2)', // Restaurant's glow green
        'shadow-dark-glow-olive': '0 0 25px rgba(143, 181, 124, 0.3)', // Restaurant's dark olive glow
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        // Basic Glass Card Utilities
        '.glass-card': {
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-card-dark': {
          background: 'rgba(31, 41, 55, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(75, 85, 99, 0.3)',
        },
        '.glass-card-olive': {
          background: 'rgba(127, 137, 102, 0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(127, 137, 102, 0.2)',
        },
        '.glass-card-dark-olive': {
          background: 'rgba(143, 181, 124, 0.08)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.15)',
        },

        // Light Mode Glass System
        '.glass-1': {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.glass-2': {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.15)',
        },
        '.glass-3': {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-4': {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.25)',
        },
        '.glass-5': {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.3)',
        },

        // Advanced Glass Layers (Alternative naming)
        '.glass-layer-1': {
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.12)',
        },
        '.glass-layer-2': {
          background: 'rgba(255, 255, 255, 0.12)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.glass-layer-3': {
          background: 'rgba(255, 255, 255, 0.16)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.22)',
        },

        // Advanced Glass Layers - Dark Mode Variants
        '.glass-layer-1-dark': {
          background: 'rgba(47, 58, 47, 0.10)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.10)',
        },
        '.glass-layer-2-dark': {
          background: 'rgba(47, 58, 47, 0.14)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.14)',
        },
        '.glass-layer-3-dark': {
          background: 'rgba(47, 58, 47, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.18)',
        },

        // Dark Mode Glass System (Olive-themed)
        '.glass-1-dark': {
          background: 'rgba(47, 58, 47, 0.10)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.10)',
        },
        '.glass-2-dark': {
          background: 'rgba(47, 58, 47, 0.14)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.14)',
        },
        '.glass-3-dark': {
          background: 'rgba(47, 58, 47, 0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.18)',
        },
        '.glass-4-dark': {
          background: 'rgba(47, 58, 47, 0.22)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.22)',
        },
        '.glass-5-dark': {
          background: 'rgba(47, 58, 47, 0.26)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)', // Safari support
          border: '1px solid rgba(143, 181, 124, 0.26)',
        },

        // Focus Ring Utilities
        '.focus-ring': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          boxShadow: '0 0 0 2px rgba(127, 137, 102, 0.2)',
        },
        '.focus-ring-sage': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          boxShadow: '0 0 0 2px rgba(156, 175, 136, 0.2)',
        },
        '.focus-ring-cedar': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          boxShadow: '0 0 0 2px rgba(160, 130, 109, 0.2)',
        },
        '.focus-ring-amber': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.2)',
        },
        '.dark-focus-ring': {
          outline: '2px solid transparent',
          outlineOffset: '2px',
          boxShadow: '0 0 0 2px rgba(143, 181, 124, 0.3)',
        },

        // Touch Target & Accessibility
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
        },

        // Professional Shadows
        '.professional-shadow': {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        },
        '.professional-shadow-lg': {
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },

        // Brand Accent Utilities
        '.olive-accent': {
          borderLeft: '4px solid #7f8966',
        },
        '.sage-highlight': {
          background: 'linear-gradient(90deg, rgba(156, 175, 136, 0.1) 0%, transparent 100%)',
        },
        '.cedar-warmth': {
          background: 'linear-gradient(135deg, rgba(160, 130, 109, 0.05) 0%, transparent 100%)',
        },

        // Dark Mode Brand Utilities
        '.dark-olive-accent': {
          borderLeft: '4px solid #8FB57C',
        },
        '.dark-sage-highlight': {
          background: 'linear-gradient(90deg, rgba(143, 181, 124, 0.08) 0%, transparent 100%)',
        },
        '.dark-cedar-warmth': {
          background: 'linear-gradient(135deg, rgba(184, 144, 111, 0.06) 0%, transparent 100%)',
        },
      })
    }
  ],
};