import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LanguageSelectionPage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const { setLanguage } = useAuth();
  const { t } = useTranslation();

  const languages = [
    { id: 'marathi', label: 'मराठी' },
    { id: 'hindi', label: 'हिन्दी' },
    { id: 'en', label: 'English' },
  ];

  const handleLanguageSelect = async (languageId: string) => {
    setSelectedLanguage(languageId);
    await setLanguage(languageId);
    setTimeout(() => {
      router.replace('/role-selection');
    }, 200);
  };

  return (
    <LinearGradient
      colors={['#E75C6F', '#C73F5B']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('languageSelection.selectLanguage')}</Text>

        <View style={styles.languagesContainer}>
          {languages.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageButton,
                selectedLanguage === language.id && styles.languageButtonActive,
              ]}
              onPress={() => handleLanguageSelect(language.id)}
            >
              <Text
                style={[
                  styles.languageText,
                  selectedLanguage === language.id && styles.languageTextActive,
                ]}
              >
                {language.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footer}>{t('languageSelection.comingSoon')}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 60,
  },
  languagesContainer: {
    gap: 20,
  },
  languageButton: {
    backgroundColor: '#FDD835',
    borderRadius: 12,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: '#FFF',
  },
  languageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  languageTextActive: {
    color: '#C73F5B',
  },
  footer: {
    fontSize: 14,
    color: '#FFF',
    textAlign: 'center',
    position: 'absolute',
    bottom: 50,
    left: 30,
    right: 30,
  },
});
