/**
 * XOLO Bulletproof Design System
 */

const RAW_DARK = {
  background: '#080C14',
  surface: '#0F1624',
  surfaceElevated: '#161F30',
  borderSubtle: '#1E2D45',
  accentTeal: '#00D4B1',
  accentAmber: '#F5A623',
  accentPurple: '#A855F7',
  accentTealDim: 'rgba(0,212,177,0.15)',
  accentAmberDim: 'rgba(245,166,35,0.15)',
  accentPurpleDim: 'rgba(168,85,247,0.15)',
  textPrimary: '#F0F4FF',
  textSecondary: '#6B7FA3',
  textMuted: '#3A4A66',
  error: '#FF4D6A',
  white: '#FFFFFF',
  black: '#000000',
  primary: '#00D4B1',
};

const RAW_LIGHT = {
  background: '#F0F4FF',
  surface: '#FFFFFF',
  surfaceElevated: '#E2E8F0',
  borderSubtle: '#CBD5E1',
  accentTeal: '#00A88D',
  accentAmber: '#D97706',
  accentPurple: '#9333EA',
  accentTealDim: 'rgba(0,168,141,0.15)',
  accentAmberDim: 'rgba(217,119,6,0.15)',
  accentPurpleDim: 'rgba(147,51,234,0.15)',
  textPrimary: '#080C14',
  textSecondary: '#3A4A66',
  textMuted: '#6B7FA3',
  error: '#DC2626',
  white: '#FFFFFF',
  black: '#000000',
  primary: '#00A88D',
};

const fonts = {
  displayBold: 'Syne_700Bold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  heading: 'Syne_700Bold',
  body: 'DMSans_400Regular',
};

const spacing = {
  xs: 4, sm: 8, md: 12, base: 16, lg: 24, xl: 32, xxl: 48, xxxl: 64,
};

const radius = {
  sm: 8, md: 16, lg: 24, full: 9999,
};

/**
 * PROXY SAFETY LAYER
 */
const createSafeObject = (obj: any, fallback: any = '#000') => {
  return new Proxy(obj, {
    get: (target, prop) => {
      if (prop in target) return target[prop];
      return fallback;
    }
  });
};

// Protect all exports
export const darkColors = createSafeObject(RAW_DARK, '#080C14');
export const lightColors = createSafeObject(RAW_LIGHT, '#FFFFFF');
export const colors = darkColors;

export const theme = {
  colors: darkColors,
  fonts: createSafeObject(fonts, 'System'),
  spacing: createSafeObject(spacing, 16),
  radius: createSafeObject(radius, 8),
};

export const getMoodColor = (mood: string) => {
  const normalized = mood.toLowerCase();
  if (normalized.includes('happy') || normalized.includes('energetic')) return colors.accentAmber;
  if (normalized.includes('calm') || normalized.includes('chill') || normalized.includes('focus')) return colors.accentTeal;
  if (normalized.includes('sad') || normalized.includes('dark') || normalized.includes('mysterious')) return colors.accentPurple;
  return colors.primary;
};

export { fonts, spacing, radius };
export default theme;
