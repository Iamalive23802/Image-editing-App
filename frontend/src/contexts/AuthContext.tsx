import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../lib/i18n';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
  language?: string | null;
  prefix?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  address_line?: string | null;
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  role?: string | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  twitter_url?: string | null;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface UserProfile {
  prefix: string | null;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  email: string | null;
  addressLine: string | null;
  state: string | null;
  district: string | null;
  taluka: string | null;
  role: string | null;
  politicalParty: string | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  avatarUrl: string | null;
}

export interface UpdateProfileInput {
  prefix?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  dateOfBirth?: string | null;
  email?: string | null;
  addressLine?: string | null;
  state?: string | null;
  district?: string | null;
  taluka?: string | null;
  role?: string | null;
  politicalParty?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  avatarUrl?: string | null;
}

interface VerifyOtpResult {
  success: boolean;
  hasLanguage?: boolean;
  hasRole?: boolean;
  profileComplete?: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  language: string | null;
  profile: UserProfile | null;
  profileComplete: boolean;
  setLanguage: (lang: string) => void;
  signOut: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<VerifyOtpResult>;
  updateProfile: (profile: UpdateProfileInput) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const hasWindowStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const storage = {
  getItem: async (key: string) => {
    if (hasWindowStorage) {
      return window.localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (hasWindowStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (hasWindowStorage) {
      window.localStorage.removeItem(key);
      return;
    }
    await AsyncStorage.removeItem(key);
  },
};

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);

  const mapApiProfileToState = (data: any): UserProfile | null => {
    if (!data) {
      return null;
    }

    return {
      prefix: data.prefix ?? null,
      firstName: data.first_name ?? null,
      middleName: data.middle_name ?? null,
      lastName: data.last_name ?? null,
      dateOfBirth: data.date_of_birth ?? null,
      email: data.email ?? null,
      addressLine: data.address_line ?? null,
      state: data.state ?? null,
      district: data.district ?? null,
      taluka: data.taluka ?? null,
      role: data.role ?? null,
      politicalParty: data.political_party ?? null,
      instagramUrl: data.instagram_url ?? null,
      facebookUrl: data.facebook_url ?? null,
      twitterUrl: data.twitter_url ?? null,
      avatarUrl: data.avatar_url ?? null,
    };
  };

  const mapStateProfileToApi = (data: UpdateProfileInput) => ({
    prefix: data.prefix ?? null,
    first_name: data.firstName ?? null,
    middle_name: data.middleName ?? null,
    last_name: data.lastName ?? null,
    date_of_birth: data.dateOfBirth ?? null,
    email: data.email ?? null,
    address_line: data.addressLine ?? null,
    state: data.state ?? null,
    district: data.district ?? null,
    taluka: data.taluka ?? null,
    role: data.role ?? null,
    political_party: data.politicalParty ?? null,
    instagram_url: data.instagramUrl ?? null,
    facebook_url: data.facebookUrl ?? null,
    twitter_url: data.twitterUrl ?? null,
    avatar_url: data.avatarUrl ?? null,
  });

  const isProfileComplete = (profileData: UserProfile | null): boolean => {
    if (!profileData) {
      return false;
    }

    return Boolean(
      profileData.firstName &&
      profileData.lastName &&
      profileData.dateOfBirth &&
      profileData.email &&
      profileData.state &&
      profileData.district &&
      profileData.taluka &&
      profileData.role
    );
  };

  const loadUserProfile = async (token: string): Promise<{
    user: User | null;
    profile: UserProfile | null;
    profileComplete: boolean;
  } | null> => {
    try {
      const userData = await apiCall('/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      let latestUser: User | null = null;
      if (userData.success && userData.user) {
        setUser(userData.user);
        const storedLanguage: string | null = userData.user.language ?? null;
        setLanguage(storedLanguage);
        i18n.changeLanguage(storedLanguage || 'en');
        latestUser = userData.user;
      }

      // Prefer explicit profile payload when available to determine navigation flow
      const profileSource = userData.profile ?? userData.user;
      const mappedProfile = mapApiProfileToState(profileSource);
      setProfile(mappedProfile);
      const complete =
        userData.profileComplete ??
        userData.profile_complete ??
        isProfileComplete(mappedProfile);
      setProfileComplete(complete);
      return { user: latestUser, profile: mappedProfile, profileComplete: complete };
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      setProfileComplete(false);
      return null;
    }
  };

  useEffect(() => {
    // Check for existing session in storage
    const checkExistingSession = async () => {
      try {
        const token = await storage.getItem('auth_token');
        if (token) {
          const data = await apiCall('/auth/verify-session', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (data.success && data.session) {
            setSession(data.session);
            await loadUserProfile(token);
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear invalid token
        await storage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkExistingSession();
  }, []);

  const signInWithPhone = async (phoneNumber: string) => {
    try {
      await apiCall('/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      });
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (phoneNumber: string, otp: string): Promise<VerifyOtpResult> => {
    try {
      console.log('Verifying OTP:', { phoneNumber, otp });
      const data = await apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      console.log('OTP verification response:', data);
      
      if (data.success) {
        // Store token in persistent storage
        await storage.setItem('auth_token', data.token);
        
        setSession(data.session);
        setUser(data.user);
        const storedLanguage: string | null = data.user.language ?? null;
        setLanguage(storedLanguage);
        // Set i18n language
        i18n.changeLanguage(storedLanguage || 'en');
        const loaded = await loadUserProfile(data.token);
        const activeProfile = loaded?.profile ?? mapApiProfileToState(data.profile ?? data.user);
        const hasLanguage = Boolean(storedLanguage || loaded?.user?.language);
        const hasRole = Boolean(activeProfile?.role);
        const profileIsComplete =
          loaded?.profileComplete ??
          data.profileComplete ??
          data.profile_complete ??
          isProfileComplete(activeProfile ?? null);
        return { success: true, hasLanguage, hasRole, profileComplete: profileIsComplete };
      }
      console.warn('OTP verification failed:', data);
      return { success: false };
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      console.error('Error details:', error.message, error.response?.data || error);
      return { success: false };
    }
  };

  const signOut = async () => {
    try {
      const token = await storage.getItem('auth_token');
      if (token) {
        await apiCall('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        await storage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setLanguage(null);
      setProfile(null);
      setProfileComplete(false);
    }
  };

  const updateProfileDetails = async (
    input: UpdateProfileInput
  ): Promise<UserProfile | null> => {
    try {
      const token = await storage.getItem('auth_token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const payload = mapStateProfileToApi(input);
      const response = await apiCall('/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const normalized = mapApiProfileToState(response.profile ?? response.user);
      if (response.user) {
        setUser(response.user);
      }
      setProfile(normalized);
      setProfileComplete(isProfileComplete(normalized));
      return normalized;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const handleSetLanguage = async (lang: string) => {
    setLanguage(lang);
    // Change i18n language
    await i18n.changeLanguage(lang);
    
    if (user) {
      try {
        const token = await storage.getItem('auth_token');
        if (token) {
          await apiCall('/users/language', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ language: lang }),
          });
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  language: lang,
                }
              : prev
          );
        }
      } catch (error) {
        console.error('Error updating user language:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      language, 
      profile,
      profileComplete,
      setLanguage: handleSetLanguage, 
      signOut,
      signInWithPhone,
      verifyOTP,
      updateProfile: updateProfileDetails
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
