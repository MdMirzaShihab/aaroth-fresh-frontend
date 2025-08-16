/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Primary Colors (Minimalistic Earth-Tech Fusion)
        'earthy-brown': '#8C644A',
        'earthy-beige': '#F5ECD9',
        'earthy-yellow': '#D4A373',
        'earthy-tan': '#E6D5B8',
        
        // Secondary Colors (Future-Forward Accents)
        'bottle-green': '#006A4E',
        'mint-fresh': '#8FD4BE',
        
        // Utility Colors (Futuristic Neutrals)
        'text-dark': '#3A2A1F',
        'text-muted': '#6B7280',
        'tomato-red': '#E94B3C',
        
        // Futuristic Enhancement Colors
        'glass': 'rgba(255, 255, 255, 0.1)',
        'glow-green': '#006A4E20',
        'shadow-soft': 'rgba(60, 42, 31, 0.08)',
        
        // Dark Mode Optimized Colors
        'dark-card': 'rgba(55, 65, 81, 0.8)',
        'dark-surface': 'rgba(31, 41, 55, 0.9)',
        'dark-border': 'rgba(75, 85, 99, 0.5)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8C644A 0%, #D4A373 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #006A4E 0%, #8FD4BE 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
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
          '0%': { boxShadow: '0 0 5px rgba(0, 106, 78, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 106, 78, 0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

