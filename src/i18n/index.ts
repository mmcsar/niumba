// Niumba - i18n Configuration (French/English)
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

// Get device language, default to French for DRC
const getDefaultLanguage = (): string => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode || 'fr';
  return ['fr', 'en'].includes(deviceLanguage) ? deviceLanguage : 'fr';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const changeLanguage = (lang: 'fr' | 'en') => {
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): string => {
  return i18n.language;
};

export default i18n;

