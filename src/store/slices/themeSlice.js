import { createSlice } from '@reduxjs/toolkit';

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

const initialState = {
  mode: getInitialTheme(), // 'light' | 'dark'
  isSystemPreference: !localStorage.getItem('theme'),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      state.isSystemPreference = false;

      // Save to localStorage
      localStorage.setItem('theme', state.mode);

      // Update HTML class for Tailwind CSS dark mode
      if (typeof document !== 'undefined') {
        if (state.mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
    setTheme: (state, action) => {
      const newTheme = action.payload;
      if (['light', 'dark'].includes(newTheme)) {
        state.mode = newTheme;
        state.isSystemPreference = false;

        // Save to localStorage
        localStorage.setItem('theme', newTheme);

        // Update HTML class for Tailwind CSS dark mode
        if (typeof document !== 'undefined') {
          if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    },
    useSystemPreference: (state) => {
      state.isSystemPreference = true;
      localStorage.removeItem('theme');

      // Set theme based on system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const isDark = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;
        state.mode = isDark ? 'dark' : 'light';

        // Update HTML class
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      }
    },
    initializeTheme: (state) => {
      // Initialize theme on app startup
      if (typeof document !== 'undefined') {
        if (state.mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },
  },
});

export const { toggleTheme, setTheme, useSystemPreference, initializeTheme } =
  themeSlice.actions;

// Selectors
export const selectTheme = (state) => state.theme;
export const selectThemeMode = (state) => state.theme.mode;
export const selectIsSystemPreference = (state) =>
  state.theme.isSystemPreference;
export const selectIsDarkMode = (state) => state.theme.mode === 'dark';

export default themeSlice.reducer;
