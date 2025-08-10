/**
 * Aaroth Fresh Design System Tokens
 * Export JavaScript constants for programmatic access to design tokens
 * Matches the Tailwind configuration from tailwind.config.js
 */

export const colors = {
  // Primary Colors (Minimalistic Earth-Tech Fusion)
  primary: {
    brown: '#8C644A',
    beige: '#F5ECD9',
    yellow: '#D4A373',
    tan: '#E6D5B8',
  },
  
  // Secondary Colors (Future-Forward Accents)
  secondary: {
    green: '#006A4E',
    mint: '#8FD4BE',
  },
  
  // Utility Colors (Futuristic Neutrals)
  text: {
    dark: '#3A2A1F',
    light: '#FFFFFF',
    muted: '#6B7280',
  },
  
  // State Colors
  state: {
    error: '#E94B3C',
    warning: '#F59E0B',
    success: '#8FD4BE',
  },
  
  // Enhancement Colors
  enhancement: {
    glass: 'rgba(255, 255, 255, 0.1)',
    glowGreen: '#006A4E20',
    shadowSoft: 'rgba(60, 42, 31, 0.08)',
  },
};

export const gradients = {
  primary: 'linear-gradient(135deg, #8C644A 0%, #D4A373 100%)',
  secondary: 'linear-gradient(135deg, #006A4E 0%, #8FD4BE 100%)',
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
};

export const animations = {
  // Duration Standards
  durations: {
    instant: '100ms',    // micro-feedback, button presses
    fast: '200ms',       // hover states, focus indicators  
    normal: '300ms',     // page elements, modals
    slow: '500ms',       // page transitions, complex reveals
    cinematic: '800ms',  // hero animations, onboarding
  },
  
  // Easing Functions
  easing: {
    entrance: 'ease-out',  // for entrances
    exit: 'ease-in',       // for exits
    smooth: 'ease-in-out', // general purpose
  },
  
  // Animation Names (matching Tailwind config)
  names: {
    fadeIn: 'animate-fade-in',
    slideUp: 'animate-slide-up', 
    scaleIn: 'animate-scale-in',
    glow: 'animate-glow',
    float: 'animate-float',
  },
};

export const spacing = {
  // Touch Targets
  touchTarget: {
    minimum: '44px',  // 11 * 4px (Tailwind's h-11)
    optimal: '48px',  // 12 * 4px (Tailwind's h-12)
  },
  
  // Component Spacing (following Tailwind scale)
  component: {
    xs: '0.5rem',   // 2 * 4px = 8px
    sm: '0.75rem',  // 3 * 4px = 12px  
    base: '1rem',   // 4 * 4px = 16px
    lg: '1.5rem',   // 6 * 4px = 24px
    xl: '2rem',     // 8 * 4px = 32px
    xxl: '3rem',    // 12 * 4px = 48px
  },
};

export const typography = {
  // Font Families
  fonts: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont', 
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'Fira Sans',
      'Droid Sans',
      'Helvetica Neue',
      'sans-serif'
    ],
  },
  
  // Line Heights (Generous for readability)
  lineHeights: {
    tight: 1.4,
    normal: 1.6,
    relaxed: 1.8,
  },
  
  // Font Weights (Selective usage)
  weights: {
    normal: 400,
    medium: 500,  // Preferred over bold
    semibold: 600,
    bold: 700,    // Use sparingly
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.025em',  // For headings
    normal: '0em',
    wide: '0.025em',
  },
};

export const breakpoints = {
  // Mobile-First Responsive Breakpoints  
  sm: '640px',   // small tablets
  md: '768px',   // tablets
  lg: '1024px',  // laptops
  xl: '1280px',  // desktops
  '2xl': '1536px', // large desktops
};

export const shadows = {
  // Organic Shadow System
  soft: '0 1px 3px rgba(60, 42, 31, 0.08), 0 1px 2px rgba(60, 42, 31, 0.04)',
  medium: '0 4px 6px rgba(60, 42, 31, 0.08), 0 2px 4px rgba(60, 42, 31, 0.04)',
  large: '0 10px 15px rgba(60, 42, 31, 0.08), 0 4px 6px rgba(60, 42, 31, 0.04)',
  glow: '0 0 20px rgba(0, 106, 78, 0.4)',
};

export const borderRadius = {
  // Organic Curves (16px-32px preference)
  sm: '0.5rem',   // 8px
  base: '1rem',   // 16px - preferred
  lg: '1.5rem',   // 24px - preferred  
  xl: '2rem',     // 32px - preferred
  full: '9999px', // circular
};

// Component-specific design patterns
export const components = {
  // Button Patterns
  button: {
    primary: 'bg-gradient-secondary text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-glow-green hover:-translate-y-0.5 min-h-[44px] border-0 focus:outline-none focus:ring-2 focus:ring-bottle-green/20',
    secondary: 'bg-glass backdrop-blur-sm border border-white/20 text-text-dark px-8 py-4 rounded-2xl font-medium transition-all duration-300 hover:bg-white/10 hover:border-white/30 min-h-[44px]',
    ghost: 'text-bottle-green hover:text-bottle-green/80 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:bg-bottle-green/5 min-h-[44px]',
    danger: 'bg-tomato-red/90 hover:bg-tomato-red text-white px-8 py-4 rounded-2xl font-medium transition-all duration-300 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-tomato-red/20',
  },
  
  // Input Patterns
  input: {
    base: 'w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg focus:shadow-glow-green transition-all duration-300 placeholder:text-text-muted/60 min-h-[44px] focus:outline-none',
    select: 'w-full px-6 py-4 rounded-2xl bg-earthy-beige/30 border-0 focus:bg-white focus:shadow-lg appearance-none cursor-pointer transition-all duration-300 min-h-[44px]',
  },
  
  // Card Patterns
  card: {
    product: 'bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-2xl hover:shadow-shadow-soft transition-all duration-500 p-6 border border-white/50 hover:-translate-y-1 group',
    dashboard: 'bg-gradient-glass backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-soft',
    modal: 'bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 max-w-md mx-auto border border-white/50 animate-scale-in',
  },
  
  // Layout Patterns
  layout: {
    container: 'container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl',
    hero: 'min-h-screen flex items-center justify-center bg-gradient-to-br from-earthy-beige via-white to-mint-fresh/10',
    section: 'py-16 px-6',
  },
};

// Export all tokens as a single object for convenience
export const designTokens = {
  colors,
  gradients,
  animations,
  spacing,
  typography,
  breakpoints,
  shadows,
  borderRadius,
  components,
};