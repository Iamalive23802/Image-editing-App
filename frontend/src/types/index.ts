// User Types
export type UserRole = 
  | 'politicalFigure'
  | 'individual'
  | 'brand'
  | 'business'
  | 'publicFigure';

export type Language = 'marathi' | 'hindi' | 'en';

export type LocationState = 'maharashtra' | 'karnataka';
export type LocationDistrict = 'pune' | 'thaneDistrict' | 'bengaluruUrbanDistrict';
export type LocationTaluka = 'haveli' | 'mulshi' | 'thane' | 'kalyan' | 'bengaluruUrban' | 'yelahanka';

// Profile Types
export interface UserProfile {
  id?: string;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone_number?: string;
  dateOfBirth?: string | null;
  state?: LocationState | null;
  district?: LocationDistrict | null;
  taluka?: LocationTaluka | null;
  role?: UserRole | null;
  avatarUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
}

export interface User {
  id: string;
  phone_number: string;
  created_at?: string;
  updated_at?: string;
}

// Navigation Types
export type RootStackParamList = {
  index: undefined;
  otp: { phone?: string };
  language: undefined;
  'role-selection': undefined;
  'profile-setup': { role?: string; fromProfile?: string };
  profile: undefined;
  content: { type?: string };
  editor: { templateId?: string };
  '(tabs)': undefined;
  '+not-found': undefined;
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

