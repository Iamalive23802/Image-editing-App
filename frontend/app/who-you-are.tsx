import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

type RoleOption = 'politicalFigure' | 'individual' | 'brand' | 'business' | 'publicFigure';

const ROLE_ORDER: RoleOption[] = [
  'politicalFigure',
  'individual',
  'brand',
  'business',
  'publicFigure',
];

export default function WhoYouAreScreen() {
  const { t } = useTranslation();
  const { updateProfile } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCategoryPress = async (role: RoleOption) => {
    if (isSaving) {
      return;
    }
    setSelectedRole(role);
    setIsSaving(true);
    try {
      await updateProfile({ role });
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setIsSaving(false);
      router.replace({ pathname: '/profile-setup', params: { role } });
    }
  };

  return (
    <LinearGradient colors={['#E75C6F', '#C73F5B']} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>{t('whoYouAre.title')}</Text>

        <View style={styles.list}>
          {ROLE_ORDER.map((role) => (
            <TouchableOpacity
              key={role}
              onPress={() => handleCategoryPress(role)}
              style={[
                styles.card,
                selectedRole === role && styles.cardActive,
                isSaving && styles.cardDisabled,
              ]}
              activeOpacity={0.85}
              disabled={isSaving}
            >
              <Text style={styles.cardLabel}>
                {t(`whoYouAre.categories.${role}.label`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>{t('whoYouAre.comingSoon')}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 120,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 40,
  },
  list: {
    gap: 16,
    marginBottom: 40,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 24,
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: 'transparent',
  },
  cardActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FDD835',
  },
  cardDisabled: {
    opacity: 0.7,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 'auto',
    fontSize: 14,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

