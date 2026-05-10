import { useThemeStore } from '../store/useThemeStore';
import { darkColors, lightColors } from '../theme/theme';

export function useThemeColors() {
  const { theme } = useThemeStore();
  return theme === 'dark' ? darkColors : lightColors;
}
