import { useThemeStore } from '../store/useThemeStore';
import { darkColors, lightColors } from '../theme/theme';

/**
 * PROPER REACT HOOK to get current theme colors.
 * This ensures components re-render when the theme changes.
 */
export const useThemeColors = () => {
  const themeMode = useThemeStore((state) => state.theme);
  
  // Return the correct color set based on the current mode
  const colors = themeMode === 'dark' ? darkColors : lightColors;
  
  // Fail-safe: always return at least the dark colors
  return colors || darkColors;
};
