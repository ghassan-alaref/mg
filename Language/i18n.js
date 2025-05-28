// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import translationEN from './En.json';
import translationAR from './Ar.json';

// the translations
const resources = {
  en: {
    translation: translationEN,
  },
  ar: {
    translation: translationAR,
  },
};

i18n
  .use(Backend)
  // .use(LanguageDetector) // Comment or remove this line if you always want 'ar'
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar',
    fallbackLng: 'ar',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'], // Remove or adjust if not needed
      caches: ['localStorage'], // Specify if caching is desired
      lookupLocalStorage: 'i18nextLng',
      checkWhitelist: true,
    },
  });

export default i18n;