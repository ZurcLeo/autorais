// src/utils/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from '../locales/en/translation.json';
import translationPT from '../locales/pt/translation.json';
import translationNL from '../locales/nl/translation.json';

const resources = {
  en: { translation: translationEN },
  pt: { translation: translationPT },
  nl: { translation: translationNL },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt', // idioma padrão
  fallbackLng: 'en', // idioma fallback
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;