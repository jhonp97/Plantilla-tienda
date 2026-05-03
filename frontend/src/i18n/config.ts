/**
 * i18n configuration - i18next setup with browser language detection
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './locales/es.json';
import en from './locales/en.json';

const SUPPORTED_LANGUAGES = ['es', 'en'];
const DEFAULT_LANGUAGE = 'es';

// Load saved preference from localStorage
const savedLang = typeof window !== 'undefined'
  ? localStorage.getItem('i18nextLng')
  : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    supportedLngs: SUPPORTED_LANGUAGES,
    lng: savedLang || undefined, // use saved lang or auto-detect
  });

export default i18n;

/**
 * Change language and persist to localStorage
 */
export function changeLanguage(lng: string): void {
  if (!SUPPORTED_LANGUAGES.includes(lng)) return;
  localStorage.setItem('i18nextLng', lng);
  i18n.changeLanguage(lng);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return i18n.language?.startsWith('en') ? 'en' : 'es';
}
