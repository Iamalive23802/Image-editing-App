// Route Paths Configuration
export const ROUTES = {
  // Auth Routes
  LOGIN: '/',
  OTP: '/otp',
  LANGUAGE_SELECTION: '/language',
  ROLE_SELECTION: '/role-selection',
  
  // Profile Routes
  PROFILE_SETUP: '/profile-setup',
  PROFILE: '/profile',
  
  // Content Routes
  CONTENT_GALLERY: '/content',
  TEMPLATE_EDITOR: '/editor',
  
  // Main App Routes
  HOME: '/(tabs)',
  HOME_TAB: '/(tabs)/index',
  LIKED_TAB: '/(tabs)/liked',
  ADD_TAB: '/(tabs)/add',
  DOWNLOADS_TAB: '/(tabs)/downloads',
  SHARE_TAB: '/(tabs)/share',
  
  // Error Routes
  NOT_FOUND: '/+not-found',
} as const;

