// App Constants
export const APP_NAME = 'Image Editor App';
export const APP_VERSION = '1.0.0';

// API Constants
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Colors
export const COLORS = {
  primary: '#E75C6F',
  primaryDark: '#C73F5B',
  secondary: '#FDD835',
  secondaryDark: '#F6B845',
  background: '#FFFFFF',
  text: '#2E3034',
  textLight: '#8C8F92',
  border: '#E0E0E0',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
} as const;

// Gradients
export const GRADIENTS = {
  primary: ['#E75C6F', '#C73F5B'],
  secondary: ['#FDD835', '#F6B845'],
  dark: ['#6F0F3B', '#120614'],
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

// Roles
export const USER_ROLES = {
  POLITICAL_FIGURE: 'politicalFigure',
  INDIVIDUAL: 'individual',
  BRAND: 'brand',
  BUSINESS: 'business',
  PUBLIC_FIGURE: 'publicFigure',
} as const;

// Languages
export const LANGUAGES = {
  MARATHI: 'marathi',
  HINDI: 'hindi',
  ENGLISH: 'en',
} as const;

