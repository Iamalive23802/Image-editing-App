import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/lib/i18n'; // Initialize i18n

// Add global web styles for responsive behavior
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }
    * {
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);
}

export default function RootLayoutPage() {
  useFrameworkReady();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ title: 'Login' }} />
          <Stack.Screen name="otp" options={{ title: 'OTP Verification' }} />
          <Stack.Screen name="language" options={{ title: 'Language Selection' }} />
          <Stack.Screen name="role-selection" options={{ title: 'Role Selection' }} />
          <Stack.Screen name="profile-setup" options={{ title: 'Profile Setup' }} />
          <Stack.Screen name="profile" options={{ title: 'Profile' }} />
          <Stack.Screen name="content" options={{ title: 'Content Gallery' }} />
          <Stack.Screen name="editor" options={{ title: 'Template Editor' }} />
          <Stack.Screen name="(tabs)" options={{ title: 'Main Tabs' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
