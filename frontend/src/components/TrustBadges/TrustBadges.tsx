/**
 * TrustBadges — Minimalist security trust badges for checkout page.
 * Shows lock, shield, and SSL icons with translatable text.
 */

import { useTranslation } from 'react-i18next';
import styles from './TrustBadges.module.css';

export function TrustBadges() {
  const { t } = useTranslation();

  return (
    <div className={styles.badges} role="list" aria-label={t('checkout.trust.title')}>
      {/* Lock — Secure Payment */}
      <div className={styles.badge} role="listitem">
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        <p className={styles.text}>{t('checkout.trust.securePayment')}</p>
      </div>

      {/* Shield — Data Protection */}
      <div className={styles.badge} role="listitem">
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className={styles.text}>{t('checkout.trust.dataProtection')}</p>
      </div>

      {/* SSL Badge */}
      <div className={styles.badge} role="listitem">
        <svg
          className={styles.icon}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
        <p className={styles.text}>{t('checkout.trust.sslEncryption')}</p>
      </div>
    </div>
  );
}

export default TrustBadges;
