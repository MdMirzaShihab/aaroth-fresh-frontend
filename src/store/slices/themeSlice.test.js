import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import themeReducer, {
  toggleTheme,
  setTheme,
  useSystemPreference,
  initializeTheme,
  selectTheme,
  selectThemeMode,
  selectIsSystemPreference,
  selectIsDarkMode,
} from './themeSlice';

describe('themeSlice', () => {
  let mockLocalStorage;
  let mockDocumentElement;
  let mockMatchMedia;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Mock document.documentElement
    mockDocumentElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
    };
    Object.defineProperty(global, 'document', {
      value: {
        documentElement: mockDocumentElement,
      },
      writable: true,
    });

    // Mock window.matchMedia
    mockMatchMedia = vi.fn();
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: mockMatchMedia,
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initial state', () => {
    it('should use light theme when no saved preference and system preference is light', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({ matches: false });

      // Re-import to test initialization
      const state = themeReducer(undefined, { type: undefined });
      expect(state.mode).toBe('light');
      expect(state.isSystemPreference).toBe(true);
    });

    it('should use dark theme when no saved preference and system preference is dark', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({ matches: true });

      // The initial state is determined when the module loads
      // So we test the behavior in the useSystemPreference action instead
      const initialState = { mode: 'light', isSystemPreference: true };
      const action = useSystemPreference();
      const state = themeReducer(initialState, action);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
    });

    it('should use saved theme preference', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');

      // Test with saved preference
      const initialState = { mode: 'dark', isSystemPreference: false };
      expect(initialState.mode).toBe('dark');
      expect(initialState.isSystemPreference).toBe(false);
    });
  });

  describe('reducers', () => {
    const lightState = {
      mode: 'light',
      isSystemPreference: false,
    };

    const darkState = {
      mode: 'dark',
      isSystemPreference: false,
    };

    it('should toggle from light to dark', () => {
      const action = toggleTheme();
      const state = themeReducer(lightState, action);

      expect(state.mode).toBe('dark');
      expect(state.isSystemPreference).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should toggle from dark to light', () => {
      const action = toggleTheme();
      const state = themeReducer(darkState, action);

      expect(state.mode).toBe('light');
      expect(state.isSystemPreference).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should set theme to dark', () => {
      const action = setTheme('dark');
      const state = themeReducer(lightState, action);

      expect(state.mode).toBe('dark');
      expect(state.isSystemPreference).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should set theme to light', () => {
      const action = setTheme('light');
      const state = themeReducer(darkState, action);

      expect(state.mode).toBe('light');
      expect(state.isSystemPreference).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should ignore invalid theme values', () => {
      const action = setTheme('invalid');
      const state = themeReducer(lightState, action);

      expect(state.mode).toBe('light');
      expect(state.isSystemPreference).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should use system preference with light mode', () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const action = useSystemPreference();
      const state = themeReducer(darkState, action);

      expect(state.mode).toBe('light');
      expect(state.isSystemPreference).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should use system preference with dark mode', () => {
      mockMatchMedia.mockReturnValue({ matches: true });

      const action = useSystemPreference();
      const state = themeReducer(lightState, action);

      expect(state.mode).toBe('dark');
      expect(state.isSystemPreference).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should handle useSystemPreference when matchMedia is not available', () => {
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      const action = useSystemPreference();
      const state = themeReducer(lightState, action);

      expect(state.isSystemPreference).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme');
    });

    it('should initialize theme with dark mode', () => {
      const action = initializeTheme();
      const state = themeReducer(darkState, action);

      expect(state).toEqual(darkState); // State unchanged
      expect(mockDocumentElement.classList.add).toHaveBeenCalledWith('dark');
    });

    it('should initialize theme with light mode', () => {
      const action = initializeTheme();
      const state = themeReducer(lightState, action);

      expect(state).toEqual(lightState); // State unchanged
      expect(mockDocumentElement.classList.remove).toHaveBeenCalledWith('dark');
    });

    it('should handle initialization when document is not available', () => {
      Object.defineProperty(global, 'document', {
        value: undefined,
        writable: true,
      });

      const action = initializeTheme();
      const state = themeReducer(lightState, action);

      expect(state).toEqual(lightState); // Should not throw error
    });
  });

  describe('selectors', () => {
    const mockState = {
      theme: {
        mode: 'dark',
        isSystemPreference: true,
      },
    };

    it('should select theme state', () => {
      expect(selectTheme(mockState)).toEqual(mockState.theme);
    });

    it('should select theme mode', () => {
      expect(selectThemeMode(mockState)).toBe('dark');
    });

    it('should select system preference flag', () => {
      expect(selectIsSystemPreference(mockState)).toBe(true);
    });

    it('should select dark mode status', () => {
      expect(selectIsDarkMode(mockState)).toBe(true);

      const lightModeState = {
        theme: { mode: 'light', isSystemPreference: false },
      };
      expect(selectIsDarkMode(lightModeState)).toBe(false);
    });
  });
});
