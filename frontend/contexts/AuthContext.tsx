import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../lib/i18n';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface User {
  id: string;
  phone_number: string;
  created_at: string;
  updated_at: string;
  language?: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  language: string | null;
  setLanguage: (lang: string) => void;
  signOut: () => Promise<void>;
  signInWithPhone: (phoneNumber: string) => Promise<void>;
  verifyOTP: (phoneNumber: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API helper functions
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
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

  useEffect(() => {
    // Check for existing session in localStorage
    const checkExistingSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const data = await apiCall('/auth/verify-session', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (data.success && data.session) {
            // Get user profile
            const userData = await apiCall('/users/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userData.success && userData.user) {
              setSession(data.session);
              setUser(userData.user);
              const userLanguage = userData.user.language || 'en';
              setLanguage(userLanguage);
              // Set i18n language
              i18n.changeLanguage(userLanguage);
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
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

  const verifyOTP = async (phoneNumber: string, otp: string): Promise<boolean> => {
    try {
      const data = await apiCall('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, otp }),
      });
      
      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('auth_token', data.token);
        
        setSession(data.session);
        setUser(data.user);
        const userLanguage = data.user.language || 'en';
        setLanguage(userLanguage);
        // Set i18n language
        i18n.changeLanguage(userLanguage);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        await apiCall('/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setUser(null);
      setSession(null);
      setLanguage(null);
    }
  };

  const handleSetLanguage = async (lang: string) => {
    setLanguage(lang);
    // Change i18n language
    await i18n.changeLanguage(lang);
    
    if (user) {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          await apiCall('/users/language', {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ language: lang }),
          });
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
      setLanguage: handleSetLanguage, 
      signOut,
      signInWithPhone,
      verifyOTP
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