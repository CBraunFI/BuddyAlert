// i18n.config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Translation resources
import de from './locales/de/translation.json';
import en from './locales/en/translation.json';

const resources = {
  de: { translation: de },
  en: { translation: en },
};

// Get device locale
const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLocale, // Default language from device
    fallbackLng: 'de', // Fallback to German
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
