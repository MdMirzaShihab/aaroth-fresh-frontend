import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleTheme, 
  setTheme, 
  useSystemPreference,
  selectThemeMode,
  selectIsSystemPreference,
  selectIsDarkMode 
} from '../store/slices/themeSlice';

/**
 * Custom hook for theme management
 * Provides theme state and actions following the ui-patterns-reference.md specifications
 * 
 * @returns {Object} Theme utilities and state
 */
export const useTheme = () => {
  const dispatch = useDispatch();
  
  // Theme state from Redux
  const theme = useSelector(selectThemeMode);
  const isSystemPreference = useSelector(selectIsSystemPreference);
  const isDarkMode = useSelector(selectIsDarkMode);
  
  // Theme actions
  const toggle = () => dispatch(toggleTheme());
  const setThemeMode = (mode) => dispatch(setTheme(mode));
  const useSystem = () => dispatch(useSystemPreference());
  
  return {
    theme,
    isDarkMode,
    isSystemPreference,
    toggleTheme: toggle,
    setTheme: setThemeMode,
    useSystemPreference: useSystem,
  };
};

export default useTheme;