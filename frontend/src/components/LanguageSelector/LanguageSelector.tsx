/**
 * LanguageSelector - Dropdown to change the app language
 *
 * Persists preference in localStorage via i18next-browser-languagedetector
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '@i18n/config';
import styles from './LanguageSelector.module.css';

const LANGUAGES = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
] as const;

export function LanguageSelector() {
  const { t } = useTranslation();

  const currentLang = getCurrentLanguage();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLang = e.target.value;
      changeLanguage(newLang);
    },
    [],
  );

  return (
    <div className={styles.container}>
      <select
        value={currentLang}
        onChange={handleChange}
        className={styles.select}
        aria-label={t('language.switchTo')}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <svg
        className={styles.icon}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 9l4-4 4 4m0 6l-4 4-4-4"
        />
      </svg>
    </div>
  );
}

export default LanguageSelector;
