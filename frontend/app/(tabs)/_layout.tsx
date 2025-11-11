import { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Home, Heart, Plus, Download, Send } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const router = useRouter();
  const { language, profile, profileComplete } = useAuth();

  useEffect(() => {
    if (!language) {
      router.replace('/language');
      return;
    }

    if (!profile?.role) {
      router.replace('/who-you-are');
      return;
    }

    if (!profileComplete) {
      router.replace('/profile-setup');
    }
  }, [language, profile?.role, profileComplete, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backdropFilter: 'blur(10px)',
        },
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="liked"
        options={{
          title: 'Liked',
          tabBarIcon: ({ size, color }) => (
            <Heart size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'Add',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Downloads',
          tabBarIcon: ({ size, color }) => (
            <Download size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="share"
        options={{
          title: 'Share',
          tabBarIcon: ({ size, color }) => (
            <Send size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
