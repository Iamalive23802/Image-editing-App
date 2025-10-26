import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation resources
import enTranslations from './locales/en/translation.json';
import marathiTranslations from './locales/marathi/translation.json';
import hindiTranslations from './locales/hindi/translation.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  marathi: {
    translation: marathiTranslations,
  },
  hindi: {
    translation: hindiTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // Enable debug mode in development
    debug: __DEV__,
    
    // Namespace configuration
    defaultNS: 'translation',
    ns: ['translation'],
  });

export default i18n;
