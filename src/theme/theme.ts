/**
 * XOLO Design System — Dark Luxury
 * Deep blacks, midnight blues, electric teal & amber gold accents
 */

export const darkColors = {
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
} as const;

export const lightColors = {
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
} as const;

// Keep `colors` pointing to darkColors by default for backward compatibility
// where we don't use dynamic theming yet
export const colors = darkColors;

export const fonts = {
  displayBold: 'Syne_700Bold',
  bodyRegular: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  full: 9999,
} as const;

/** Maps mood labels → accent colours for badges/dots */
export const moodColors: Record<string, string> = {
  calm: darkColors.accentTeal,
  warm: '#E67E22',
  tense: darkColors.error,
  mysterious: darkColors.accentPurple,
  energetic: darkColors.accentAmber,
  joyful: '#34D399',
};

/** Returns the dot colour for a given mood, falling back to teal */
export const getMoodColor = (mood: string): string =>
  moodColors[mood.toLowerCase()] ?? darkColors.accentTeal;
