/**
 * Simple Theme Toggle Utility for Admin-V2
 * Mimics Restaurant interface's superior performance approach
 * Uses direct DOM manipulation without React state management
 */

// Check for saved theme preference or default to 'light'
const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  // Check system preference
  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }

  return 'light';
};

// Initialize theme on app load
export const initializeTheme = () => {
  const theme = getInitialTheme();
  
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  return theme;
};

// Toggle theme between light and dark
export const toggleTheme = () => {
  if (typeof document === 'undefined') return 'light';
  
  const isDark = document.documentElement.classList.contains('dark');
  const newTheme = isDark ? 'light' : 'dark';
  
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Save to localStorage
  localStorage.setItem('theme', newTheme);
  
  return newTheme;
};

// Set specific theme
export const setTheme = (theme) => {
  if (typeof document === 'undefined') return;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Save to localStorage
  localStorage.setItem('theme', theme);
};

// Get current theme
export const getCurrentTheme = () => {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
};

// Check if dark mode is currently active
export const isDarkMode = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

// Listen for system theme changes
export const observeSystemTheme = (callback) => {
  if (typeof window === 'undefined') return () => {};
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const handleChange = (e) => {
    if (!localStorage.getItem('theme')) {
      // Only follow system preference if user hasn't set a preference
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      callback?.(newTheme);
    }
  };
  
  mediaQuery.addEventListener('change', handleChange);
  
  // Return cleanup function
  return () => mediaQuery.removeEventListener('change', handleChange);
};